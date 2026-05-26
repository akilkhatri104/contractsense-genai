import { AlertTriangle, Bot, Columns2, FileWarning, ShieldCheck } from "lucide-react";

import { ContractReportExportButton } from "@/components/contract-report-export-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CONTRACT_DETAIL_STAGE_ORDER,
  getContractStageLabel,
  getRiskTone,
  type ContractClause,
  type ContractStage,
  type ContractStatus,
} from "@/lib/contracts";
import { cn } from "@/lib/utils";

type ContractReportProps = {
  clauses: ContractClause[];
  completedAt: string | null;
  createdAt: string;
  currentStage: ContractStage;
  errorMessage: string | null;
  fileName: string;
  highRiskCount: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  overallSummary: string | null;
  rawText: string | null;
  status: ContractStatus;
  title: string;
};

export function ContractReport({
  clauses,
  completedAt,
  createdAt,
  currentStage,
  errorMessage,
  fileName,
  highRiskCount,
  lowRiskCount,
  mediumRiskCount,
  overallSummary,
  rawText,
  status,
  title,
}: ContractReportProps) {
  const completedStageIndex =
    status === "completed"
      ? CONTRACT_DETAIL_STAGE_ORDER.length - 1
      : currentStage === "failed"
        ? 0
        : CONTRACT_DETAIL_STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
              Contract report
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
            <p className="mt-3 text-sm text-slate-300">
              Uploaded as <span className="font-medium text-slate-100">{fileName}</span>{" "}
              on {new Date(createdAt).toLocaleString()}.
              {completedAt
                ? ` Analysis finished on ${new Date(completedAt).toLocaleString()}.`
                : null}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={cn(
                "px-3 py-1.5 text-xs uppercase tracking-[0.2em]",
                status === "completed" &&
                  "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
                status === "processing" &&
                  "bg-cyan-500/15 text-cyan-200 ring-cyan-400/30",
                status === "failed" &&
                  "bg-rose-500/15 text-rose-200 ring-rose-400/30",
              )}
            >
              {status}
            </Badge>
            <ContractReportExportButton
              clauses={clauses}
              completedAt={completedAt}
              createdAt={createdAt}
              currentStage={currentStage}
              fileName={fileName}
              highRiskCount={highRiskCount}
              lowRiskCount={lowRiskCount}
              mediumRiskCount={mediumRiskCount}
              overallSummary={overallSummary}
              status={status}
              title={title}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {CONTRACT_DETAIL_STAGE_ORDER.map((stage, index) => {
            const completed = index <= completedStageIndex;
            const active = currentStage === stage && status !== "completed";

            return (
              <div
                key={stage}
                className={cn(
                  "rounded-2xl border px-4 py-4 transition-colors",
                  completed &&
                    "border-emerald-400/20 bg-emerald-500/10 text-emerald-50",
                  active && "border-cyan-400/30 bg-cyan-500/10 text-cyan-50",
                  !completed && !active && "border-white/10 bg-white/5 text-slate-300",
                )}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-inherit/70">
                  Stage {index + 1}
                </p>
                <p className="mt-2 text-sm font-medium">{getContractStageLabel(stage)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-[1.75rem] border border-rose-500/30 bg-rose-500/10 p-5 text-rose-100">
          <div className="flex items-start gap-3">
            <FileWarning className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-medium">Analysis could not be completed</h2>
              <p className="mt-2 text-sm text-rose-100/85">{errorMessage}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Clause viewer
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Clause-by-clause analysis
              </h2>
            </div>
            <Badge variant="outline">{clauses.length} clauses</Badge>
          </div>

          {clauses.length > 0 ? (
            <Accordion type="single" collapsible className="mt-4">
              {clauses.map((clause, index) => (
                <AccordionItem key={`${clause.clauseType}-${index}`} value={`clause-${index}`}>
                  <AccordionTrigger className="items-start">
                    <div className="flex min-w-0 flex-1 flex-col gap-2 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getRiskTone(clause.risk)}>{clause.risk} risk</Badge>
                        <span className="text-sm font-medium text-slate-100">
                          {clause.clauseType}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-slate-400">{clause.content}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                          Original clause
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                          {clause.content}
                        </p>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                            Why it matters
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-200">
                            {clause.riskReason}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                            Plain English
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-200">
                            {clause.plainEnglish}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/75">
                          Suggested action
                        </p>
                        <p className="mt-2 text-sm leading-6 text-cyan-50">
                          {clause.actionItem}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="mt-6 text-sm text-slate-400">
              Clause extraction has not produced reviewable output yet.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-cyan-300" />
              <h2 className="text-lg font-semibold text-white">Summary panel</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {overallSummary ??
                "The report summary will appear here once the contract analysis finishes."}
            </p>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-amber-300" />
              <h2 className="text-lg font-semibold text-white">Risk badges</h2>
            </div>
            <div className="mt-5 grid gap-3">
              <RiskStat
                count={highRiskCount}
                label="High risk clauses"
                tone="bg-rose-500/10 text-rose-100"
              />
              <RiskStat
                count={mediumRiskCount}
                label="Medium risk clauses"
                tone="bg-amber-500/10 text-amber-100"
              />
              <RiskStat
                count={lowRiskCount}
                label="Low risk clauses"
                tone="bg-emerald-500/10 text-emerald-100"
              />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center gap-3">
              <Bot className="size-5 text-slate-300" />
              <h2 className="text-lg font-semibold text-white">Chatbot</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Floating contract assistant placeholder. The current report is ready
              for a future clause-level Q&A assistant.
            </p>
            <Button type="button" variant="outline" className="mt-4" disabled>
              Coming next
            </Button>
          </section>

          <section className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center gap-3">
              <Columns2 className="size-5 text-slate-300" />
              <h2 className="text-lg font-semibold text-white">Comparison screen</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Split-view comparison is reserved for future multi-contract review.
            </p>
            <Button type="button" variant="outline" className="mt-4" disabled>
              Future module
            </Button>
          </section>
        </div>
      </section>

      {rawText ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Parsed source text
          </p>
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm leading-6 text-slate-300">
            {rawText.slice(0, 5000)}
            {rawText.length > 5000 ? "\n\n[Preview truncated]" : ""}
          </pre>
        </section>
      ) : null}
    </div>
  );
}

function RiskStat({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-white/10 p-4", tone)}>
      <p className="text-3xl font-semibold">{count}</p>
      <p className="mt-1 text-sm">{label}</p>
    </div>
  );
}
