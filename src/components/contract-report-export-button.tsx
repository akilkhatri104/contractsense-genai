"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileOutput } from "lucide-react";

import { ContractReportPdf } from "@/components/contract-report-pdf";
import { Button } from "@/components/ui/button";
import type { ContractClause, ContractStage, ContractStatus } from "@/lib/contracts";
import { cn } from "@/lib/utils";

type ContractReportExportButtonProps = {
  clauses: ContractClause[];
  completedAt: string | null;
  createdAt: string;
  currentStage: ContractStage;
  fileName: string;
  highRiskCount: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  overallSummary: string | null;
  status: ContractStatus;
  title: string;
};

const formatFileName = (title: string) => {
  const safeTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return safeTitle ? `${safeTitle}-report.pdf` : "contract-report.pdf";
};

export function ContractReportExportButton({
  clauses,
  completedAt,
  createdAt,
  currentStage,
  fileName,
  highRiskCount,
  lowRiskCount,
  mediumRiskCount,
  overallSummary,
  status,
  title,
}: ContractReportExportButtonProps) {
  return (
    <PDFDownloadLink
      document={
        <ContractReportPdf
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
      }
      fileName={formatFileName(title)}
    >
      {({ loading }) => (
        <Button type="button" variant="outline" disabled={loading}>
          <FileOutput className={cn("size-4", loading && "animate-pulse")} />
          {loading ? "Preparing PDF" : "Export PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
