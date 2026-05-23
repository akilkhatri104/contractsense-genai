import Link from "next/link";

import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

import { DocumentUpload } from "@/components/document-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRiskTone } from "@/lib/contracts";
import { contracts, documents } from "@/lib/db/schema";
import { withClerkSupabaseRls } from "@/lib/db/rls";

export default async function ContractsPage() {
  const { userId, getToken, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const contractRows = await withClerkSupabaseRls(getToken, async (db) =>
    db
      .select({
        completedAt: contracts.completedAt,
        contractId: contracts.id,
        createdAt: contracts.createdAt,
        currentStage: contracts.currentStage,
        errorMessage: contracts.errorMessage,
        highRiskCount: contracts.highRiskCount,
        lowRiskCount: contracts.lowRiskCount,
        mediumRiskCount: contracts.mediumRiskCount,
        originalName: documents.originalName,
        status: contracts.status,
        title: contracts.title,
      })
      .from(contracts)
      .innerJoin(documents, eq(contracts.documentId, documents.id))
      .orderBy(desc(contracts.createdAt)),
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#111827_100%)] px-6 py-10 text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">
                ContractSense workflow
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
                Upload, analyze, review.
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Drop in a PDF contract, let Gemini extract clauses and risk signals,
                then land directly on a clause-by-clause review screen with plain-English
                explanations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <Link href="/">Home</Link>
              </Button>
              <UserButton />
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                Stage 1
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Upload contract PDF
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                The file is uploaded into your private Supabase bucket, a contract
                row is created in Postgres, and the analysis pipeline runs immediately.
              </p>
            </div>
            <div className="mt-6">
              <DocumentUpload />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StageCard
              index="02"
              title="PDF parsing"
              description="LangChain PDF Loader and pdf-parse convert the PDF into normalized raw text."
            />
            <StageCard
              index="03"
              title="Clause segmentation"
              description="Gemini groups the contract into structured clauses with clause labels."
            />
            <StageCard
              index="04"
              title="Risk engine"
              description="Each clause is scored as high, medium, or low risk with a concise reason."
            />
            <StageCard
              index="05"
              title="Plain English"
              description="Legal language is rewritten into direct, readable explanations."
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Existing reports
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Recent contracts
              </h2>
            </div>
            <Badge variant="outline">
              {contractRows.length} contract{contractRows.length === 1 ? "" : "s"}
            </Badge>
          </div>

          {contractRows.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {contractRows.map((contract) => (
                <Link
                  key={contract.contractId}
                  href={`/contract/${contract.contractId}`}
                  className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/30 hover:bg-cyan-400/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-100">
                        {contract.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">{contract.originalName}</p>
                    </div>
                    <Badge
                      className={
                        contract.highRiskCount > 0
                          ? getRiskTone("High")
                          : contract.mediumRiskCount > 0
                            ? getRiskTone("Medium")
                            : getRiskTone("Low")
                      }
                    >
                      {contract.status}
                    </Badge>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                    <MiniMetric label="High" value={contract.highRiskCount} tone="text-rose-200" />
                    <MiniMetric
                      label="Medium"
                      value={contract.mediumRiskCount}
                      tone="text-amber-200"
                    />
                    <MiniMetric label="Low" value={contract.lowRiskCount} tone="text-emerald-200" />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <span>{new Date(contract.createdAt).toLocaleString()}</span>
                    <span>
                      {contract.errorMessage
                        ? "Needs attention"
                        : contract.completedAt
                          ? "Report ready"
                          : contract.currentStage}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-400">
              No contracts analyzed yet. Upload your first PDF to generate a review report.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function MiniMetric({
  label,
  tone,
  value,
}: {
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
      <p className={`text-xl font-semibold ${tone}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
    </div>
  );
}

function StageCard({
  description,
  index,
  title,
}: {
  description: string;
  index: string;
  title: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{index}</p>
      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
