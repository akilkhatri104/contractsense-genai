import Link from "next/link";
import { notFound } from "next/navigation";

import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { deleteContract } from "@/app/contracts/actions";
import { ContractDeleteButton } from "@/components/contract-delete-button";
import { ContractReport } from "@/components/contract-report";
import { Button } from "@/components/ui/button";
import {
  type ContractClause,
  type ContractStage,
  type ContractStatus,
} from "@/lib/contracts";
import { contracts, documents } from "@/lib/db/schema";
import { withClerkSupabaseRls } from "@/lib/db/rls";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, getToken, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const [contract] = await withClerkSupabaseRls(getToken, async (db) =>
    db
      .select({
        clauses: contracts.clauses,
        completedAt: contracts.completedAt,
        createdAt: contracts.createdAt,
        currentStage: contracts.currentStage,
        errorMessage: contracts.errorMessage,
        highRiskCount: contracts.highRiskCount,
        lowRiskCount: contracts.lowRiskCount,
        mediumRiskCount: contracts.mediumRiskCount,
        originalName: documents.originalName,
        overallSummary: contracts.overallSummary,
        rawText: contracts.rawText,
        status: contracts.status,
        title: contracts.title,
      })
      .from(contracts)
      .innerJoin(documents, eq(contracts.documentId, documents.id))
      .where(and(eq(contracts.id, id), eq(contracts.userId, userId))),
  );

  if (!contract) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] px-6 py-10 text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/contracts">Back to uploads</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
          <UserButton />
        </div>

        <ContractReport
          clauses={contract.clauses as ContractClause[]}
          completedAt={contract.completedAt}
          createdAt={contract.createdAt}
          currentStage={contract.currentStage as ContractStage}
          errorMessage={contract.errorMessage}
          fileName={contract.originalName}
          highRiskCount={contract.highRiskCount}
          lowRiskCount={contract.lowRiskCount}
          mediumRiskCount={contract.mediumRiskCount}
          overallSummary={contract.overallSummary}
          rawText={contract.rawText}
          status={contract.status as ContractStatus}
          title={contract.title}
        />
        <div className="flex justify-end">
          <ContractDeleteButton
            action={async () => {
              "use server";
              await deleteContract(id);
            }}
            contractTitle={contract.title}
          />
        </div>
      </div>
    </main>
  );
}
