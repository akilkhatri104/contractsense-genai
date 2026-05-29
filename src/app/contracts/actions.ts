"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  analyzeContractClauses,
  extractContractText,
  segmentContractClauses,
  summarizeContract,
} from "@/lib/contract-analysis";
import { getFriendlyQuotaMessage, isQuotaOrRateLimitError } from "@/lib/ai-quota";
import { embedContractChunks } from "@/lib/rag";
import {
  buildContractTitle,
  countClauseRisks,
  validateContractUpload,
} from "@/lib/contracts";
import { contracts, documents } from "@/lib/db/schema";
import { withClerkSupabaseRls } from "@/lib/db/rls";
import { createClerkSupabaseServerClient } from "@/lib/supabase-server";

type CreateAnalyzedContractInput = {
  bucketName: string;
  contentType: string;
  originalName: string;
  sizeBytes: number;
  storagePath: string;
};

type CreateAnalyzedContractResult = {
  contractId: string;
  errorMessage?: string;
  status: "completed" | "failed";
};

export async function createAnalyzedContract(
  input: CreateAnalyzedContractInput,
): Promise<CreateAnalyzedContractResult> {
  const { userId, getToken } = await auth();

  if (!userId) {
    throw new Error("Not authenticated.");
  }

  validateContractUpload({
    ...input,
    userId,
  });

  const inserted = await withClerkSupabaseRls(getToken, async (db) => {
    const [documentRow] = await db
      .insert(documents)
      .values({
        bucketName: input.bucketName,
        contentType: input.contentType.trim(),
        originalName: input.originalName.trim(),
        sizeBytes: input.sizeBytes,
        storagePath: input.storagePath.trim(),
        userId,
      })
      .returning({
        documentId: documents.id,
      });

    const [contractRow] = await db
      .insert(contracts)
      .values({
        documentId: documentRow.documentId,
        title: buildContractTitle(input.originalName),
        userId,
      })
      .returning({
        contractId: contracts.id,
      });

    return contractRow;
  });

  const contractId = inserted.contractId;

  try {
    await updateContractStage(getToken, contractId, "parsing");

    const supabase = await createClerkSupabaseServerClient();
    const { data, error } = await supabase.storage
      .from(input.bucketName)
      .download(input.storagePath);

    if (error) {
      throw new Error(`Could not read the uploaded PDF: ${error.message}`);
    }

    const pdfBuffer = Buffer.from(await data.arrayBuffer());
    const rawText = await extractContractText(pdfBuffer);

    await updateContractRawText(getToken, contractId, rawText);
    await updateContractStage(getToken, contractId, "segmenting");
    const segmentedClauses = await segmentContractClauses(rawText);

    await updateContractStage(getToken, contractId, "analyzing");
    const analyzedClauses = await analyzeContractClauses(segmentedClauses);
    const riskCounts = countClauseRisks(analyzedClauses);

    await updateContractStage(getToken, contractId, "summarizing");
    const overallSummary = await summarizeContract(analyzedClauses);
    await embedContractChunks(contractId, rawText);
    await completeContract(getToken, contractId, {
      clauses: analyzedClauses,
      ...riskCounts,
      overallSummary,
      rawText,
    });

    revalidatePath("/contracts");
    revalidatePath(`/contract/${contractId}`);

    return {
      contractId,
      status: "completed",
    };
  } catch (error) {
    const message = isQuotaOrRateLimitError(error)
      ? getFriendlyQuotaMessage(error)
      : error instanceof Error
        ? error.message
        : "Contract analysis failed.";

    await failContract(getToken, contractId, message);
    revalidatePath("/contracts");
    revalidatePath(`/contract/${contractId}`);

    return {
      contractId,
      errorMessage: message,
      status: "failed",
    };
  }
}

export async function deleteContract(contractId: string) {
  const { userId, getToken } = await auth();

  if (!userId) {
    throw new Error("Not authenticated.");
  }

  const trimmedId = contractId.trim();

  if (!trimmedId) {
    throw new Error("Contract id is required.");
  }

  const [contract] = await withClerkSupabaseRls(getToken, async (db) =>
    db
      .select({
        bucketName: documents.bucketName,
        documentId: documents.id,
        storagePath: documents.storagePath,
      })
      .from(contracts)
      .innerJoin(documents, eq(contracts.documentId, documents.id))
      .where(and(eq(contracts.id, trimmedId), eq(contracts.userId, userId))),
  );

  if (!contract) {
    throw new Error("Contract not found.");
  }

  const supabase = await createClerkSupabaseServerClient();
  const { error: storageError } = await supabase.storage
    .from(contract.bucketName)
    .remove([contract.storagePath]);

  if (storageError) {
    throw new Error(`Failed to delete document: ${storageError.message}`);
  }

  await withClerkSupabaseRls(getToken, async (db) => {
    await db
      .delete(contracts)
      .where(and(eq(contracts.id, trimmedId), eq(contracts.userId, userId)));
    await db
      .delete(documents)
      .where(and(eq(documents.id, contract.documentId), eq(documents.userId, userId)));
  });

  revalidatePath("/contracts");
  revalidatePath(`/contract/${trimmedId}`);
  redirect("/contracts");
}

async function completeContract(
  getToken: () => Promise<string | null>,
  contractId: string,
  input: {
    clauses: Awaited<ReturnType<typeof analyzeContractClauses>>;
    highRiskCount: number;
    lowRiskCount: number;
    mediumRiskCount: number;
    overallSummary: string;
    rawText: string;
  },
) {
  await withClerkSupabaseRls(getToken, async (db) => {
    await db
      .update(contracts)
      .set({
        clauses: input.clauses,
        completedAt: new Date().toISOString(),
        currentStage: "completed",
        errorMessage: null,
        highRiskCount: input.highRiskCount,
        lowRiskCount: input.lowRiskCount,
        mediumRiskCount: input.mediumRiskCount,
        overallSummary: input.overallSummary,
        rawText: input.rawText,
        status: "completed",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(contracts.id, contractId));
  });
}

async function failContract(
  getToken: () => Promise<string | null>,
  contractId: string,
  errorMessage: string,
) {
  await withClerkSupabaseRls(getToken, async (db) => {
    await db
      .update(contracts)
      .set({
        errorMessage,
        status: "failed",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(contracts.id, contractId));
  });
}

async function updateContractRawText(
  getToken: () => Promise<string | null>,
  contractId: string,
  rawText: string,
) {
  await withClerkSupabaseRls(getToken, async (db) => {
    await db
      .update(contracts)
      .set({
        rawText,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(contracts.id, contractId));
  });
}

async function updateContractStage(
  getToken: () => Promise<string | null>,
  contractId: string,
  currentStage: "analyzing" | "parsing" | "segmenting" | "summarizing",
) {
  await withClerkSupabaseRls(getToken, async (db) => {
    await db
      .update(contracts)
      .set({
        currentStage,
        status: "processing",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(contracts.id, contractId));
  });
}
