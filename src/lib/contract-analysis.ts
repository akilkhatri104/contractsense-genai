import "server-only";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PDFParse } from "pdf-parse";
import { z } from "zod";

import { type ContractClause } from "@/lib/contracts";

const CLAUSE_BATCH_SIZE = 8;
const MAX_CONTRACT_TEXT_CHARS = 120_000;

const extractedClauseSchema = z.object({
  clauses: z
    .array(
      z.object({
        clauseType: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

const clauseAnalysisSchema = z.object({
  analyses: z.array(
    z.object({
      actionItem: z.string().min(1),
      clauseType: z.string().min(1),
      content: z.string().min(1),
      plainEnglish: z.string().min(1),
      risk: z.enum(["High", "Medium", "Low"]),
      riskReason: z.string().min(1),
    }),
  ),
});

const contractSummarySchema = z.object({
  overallSummary: z.string().min(1),
});

export async function extractContractText(pdfBuffer: Buffer) {
  const blobData = new Uint8Array(pdfBuffer);

  const [loaderDocs, textResult] = await Promise.all([
    new PDFLoader(new Blob([blobData], { type: "application/pdf" }), {
      parsedItemSeparator: " ",
      splitPages: true,
    }).load(),
    parsePdfWithPdfParse(pdfBuffer),
  ]);

  const loaderText = loaderDocs
    .map((doc) => doc.pageContent)
    .filter(Boolean)
    .join("\n\n");

  const rawText = cleanExtractedText(loaderText || textResult.text);

  if (!rawText) {
    throw new Error("The uploaded PDF did not contain readable contract text.");
  }

  return rawText;
}

export async function segmentContractClauses(rawText: string) {
  const model = createGeminiModel();
  const boundedText = boundContractText(rawText);

  const clauseExtractor = model.withStructuredOutput(extractedClauseSchema, {
    name: "contract_clause_extraction",
  });

  const extracted = await clauseExtractor.invoke(`
You are reviewing a legal contract.

Task:
- Split the contract into logical clauses.
- Label each clause with a short legal clause type.
- Keep each clause's original meaning intact.
- Merge broken lines and remove obvious formatting noise.
- Do not invent clauses that are not present in the contract.

Return every meaningful clause you can identify.

Contract text:
${boundedText}
`);

  const clauses = dedupeClauses(extracted.clauses);

  if (clauses.length === 0) {
    throw new Error("No clauses could be extracted from the uploaded contract.");
  }

  return clauses;
}

export async function analyzeContractClauses(
  clauses: Array<{
    clauseType: string;
    content: string;
  }>,
): Promise<ContractClause[]> {
  const model = createGeminiModel();
  const clauseAnalyzer = model.withStructuredOutput(clauseAnalysisSchema, {
    name: "contract_clause_analysis",
  });

  return (
    await Promise.all(
      createClauseBatches(clauses, CLAUSE_BATCH_SIZE).map((batch) =>
        clauseAnalyzer.invoke(`
You are a contract risk reviewer for startups, SMEs, and non-lawyers.

Evaluate each clause independently using this rubric:
- High risk: materially one-sided, unusually restrictive, uncapped liability, broad indemnity, long non-compete, unclear payment exposure, unilateral rights, harsh termination, or missing safeguards.
- Medium risk: notable negotiation point, vague obligation, non-standard burden, moderate imbalance, or unclear process that could affect the signer.
- Low risk: balanced, standard, administrative, or low-impact language.

For each clause:
- Preserve the clause type and content.
- Assign exactly one risk level: High, Medium, or Low.
- Explain the risk in one concise sentence.
- Rewrite the clause in plain English for a non-lawyer.
- Provide one short action item the user should consider.

Clauses:
${JSON.stringify(batch, null, 2)}
`),
      ),
    )
  ).flatMap((result) => result.analyses);
}

export async function summarizeContract(clauses: ContractClause[]) {
  const model = createGeminiModel();
  const summaryWriter = model.withStructuredOutput(contractSummarySchema, {
    name: "contract_report_summary",
  });

  const summary = await summaryWriter.invoke(`
You are writing an executive summary for a contract review report.

Write one concise paragraph in plain English that:
- explains what the contract generally does,
- highlights the most important risk themes,
- and tells the user what to review before signing.

Use the analyzed clauses below and do not invent facts.

Analyzed clauses:
${JSON.stringify(clauses, null, 2)}
`);

  return summary.overallSummary;
}

function boundContractText(rawText: string) {
  if (rawText.length <= MAX_CONTRACT_TEXT_CHARS) {
    return rawText;
  }

  return `${rawText.slice(0, MAX_CONTRACT_TEXT_CHARS)}\n\n[TRUNCATED FOR ANALYSIS]`;
}

function cleanExtractedText(rawText: string) {
  return rawText
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\u0000/g, "")
    .trim();
}

function createClauseBatches<T>(items: T[], batchSize: number) {
  const batches: T[][] = [];

  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }

  return batches;
}

function createGeminiModel() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY for contract analysis.");
  }

  return new ChatGoogleGenerativeAI({
    model: process.env.GOOGLE_GEMINI_MODEL ?? "gemini-1.5-flash",
    maxOutputTokens: 4096,
    temperature: 0.1,
  });
}

function dedupeClauses(
  clauses: Array<{
    clauseType: string;
    content: string;
  }>,
) {
  const seen = new Set<string>();

  return clauses.filter((clause) => {
    const normalizedKey = `${clause.clauseType}::${clause.content}`
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    if (!normalizedKey || seen.has(normalizedKey)) {
      return false;
    }

    seen.add(normalizedKey);
    return true;
  });
}

async function parsePdfWithPdfParse(pdfBuffer: Buffer) {
  const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });

  try {
    return await parser.getText();
  } finally {
    await parser.destroy();
  }
}
