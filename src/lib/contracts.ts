import { DOCUMENTS_BUCKET, MAX_DOCUMENT_SIZE_BYTES } from "@/lib/documents";

export const CONTRACT_ACCEPT: Record<string, string[]> = {
  "application/pdf": [".pdf"],
};

export const CONTRACT_DETAIL_STAGE_ORDER = [
  "uploaded",
  "parsing",
  "segmenting",
  "analyzing",
  "summarizing",
  "completed",
] as const;

export const CONTRACT_RISK_LEVELS = ["High", "Medium", "Low"] as const;
export const CONTRACT_STAGES = [
  "uploaded",
  "parsing",
  "segmenting",
  "analyzing",
  "summarizing",
  "completed",
  "failed",
] as const;
export const CONTRACT_STATUSES = ["processing", "completed", "failed"] as const;

export type ContractRiskLevel = (typeof CONTRACT_RISK_LEVELS)[number];
export type ContractStage = (typeof CONTRACT_STAGES)[number];
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export type ContractClause = {
  actionItem: string;
  clauseType: string;
  content: string;
  plainEnglish: string;
  risk: ContractRiskLevel;
  riskReason: string;
};

export type ContractAnalysis = {
  clauses: ContractClause[];
  overallSummary: string;
  rawText: string;
};

export type RiskCounts = {
  highRiskCount: number;
  lowRiskCount: number;
  mediumRiskCount: number;
};

export function buildContractTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").trim() || "Untitled contract";
}

export function countClauseRisks(clauses: ContractClause[]): RiskCounts {
  return clauses.reduce<RiskCounts>(
    (counts, clause) => {
      if (clause.risk === "High") {
        counts.highRiskCount += 1;
      } else if (clause.risk === "Medium") {
        counts.mediumRiskCount += 1;
      } else {
        counts.lowRiskCount += 1;
      }

      return counts;
    },
    {
      highRiskCount: 0,
      lowRiskCount: 0,
      mediumRiskCount: 0,
    },
  );
}

export function getContractStageLabel(stage: ContractStage) {
  switch (stage) {
    case "uploaded":
      return "Upload complete";
    case "parsing":
      return "PDF parsed";
    case "segmenting":
      return "Clauses segmented";
    case "analyzing":
      return "Risk analysis";
    case "summarizing":
      return "Plain English summary";
    case "completed":
      return "Report ready";
    case "failed":
      return "Analysis failed";
  }
}

export function getRiskTone(risk: ContractRiskLevel) {
  switch (risk) {
    case "High":
      return "bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-400/30";
    case "Medium":
      return "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-400/30";
    case "Low":
      return "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/30";
  }
}

export function validateContractUpload(input: {
  bucketName: string;
  contentType: string;
  originalName: string;
  sizeBytes: number;
  storagePath: string;
  userId: string;
}) {
  const originalName = input.originalName.trim();
  const contentType = input.contentType.trim();
  const storagePath = input.storagePath.trim();

  if (!originalName) {
    throw new Error("File name is required.");
  }

  if (!contentType) {
    throw new Error("Content type is required.");
  }

  if (input.bucketName !== DOCUMENTS_BUCKET) {
    throw new Error("Unexpected bucket.");
  }

  if (!storagePath.startsWith(`${input.userId}/`)) {
    throw new Error("Storage path must stay inside the current user's folder.");
  }

  if (
    !Number.isFinite(input.sizeBytes) ||
    input.sizeBytes <= 0 ||
    input.sizeBytes > MAX_DOCUMENT_SIZE_BYTES
  ) {
    throw new Error("Invalid file size.");
  }

  if (contentType !== "application/pdf") {
    throw new Error("Only PDF contracts are supported for analysis.");
  }
}
