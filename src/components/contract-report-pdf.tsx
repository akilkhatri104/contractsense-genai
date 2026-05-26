"use client";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { ContractClause, ContractStage, ContractStatus } from "@/lib/contracts";

type ContractReportPdfProps = {
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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 10,
    color: "#475569",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaChip: {
    backgroundColor: "#e2e8f0",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontSize: 9,
    color: "#0f172a",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 8,
    color: "#0f172a",
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#f8fafc",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
  },
  statLabel: {
    fontSize: 9,
    color: "#475569",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
  },
  clauseCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  clauseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  clauseType: {
    fontSize: 11,
    fontWeight: 600,
    color: "#0f172a",
  },
  riskBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontSize: 8,
    textTransform: "uppercase",
  },
  riskHigh: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  riskMedium: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  riskLow: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  clauseBody: {
    fontSize: 9,
    color: "#334155",
    marginBottom: 6,
  },
  clauseLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#64748b",
    marginTop: 6,
  },
  clauseText: {
    fontSize: 9,
    color: "#1f2937",
    marginTop: 2,
  },
  footer: {
    marginTop: 20,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "right",
  },
});

const riskStyleMap = {
  high: styles.riskHigh,
  medium: styles.riskMedium,
  low: styles.riskLow,
};

const formatDateTime = (value: string | null) => {
  if (!value) return "";
  return new Date(value).toLocaleString("en-US");
};

export function ContractReportPdf({
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
}: ContractReportPdfProps) {
  const createdLabel = formatDateTime(createdAt);
  const completedLabel = formatDateTime(completedAt);

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Contract report generated from {fileName}.
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaChip}>Status: {status}</Text>
            <Text style={styles.metaChip}>Stage: {currentStage}</Text>
            <Text style={styles.metaChip}>Created: {createdLabel}</Text>
            {completedLabel ? (
              <Text style={styles.metaChip}>Completed: {completedLabel}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive summary</Text>
          <View style={styles.summaryBox}>
            <Text>
              {overallSummary ??
                "The report summary will appear here once the contract analysis finishes."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>High risk clauses</Text>
              <Text style={styles.statValue}>{highRiskCount}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Medium risk clauses</Text>
              <Text style={styles.statValue}>{mediumRiskCount}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Low risk clauses</Text>
              <Text style={styles.statValue}>{lowRiskCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clause analysis</Text>
          {clauses.length > 0 ? (
            clauses.map((clause, index) => (
              <View key={`${clause.clauseType}-${index}`} style={styles.clauseCard}>
                <View style={styles.clauseHeader}>
                  <Text style={styles.clauseType}>{clause.clauseType}</Text>
                  <Text style={[styles.riskBadge, riskStyleMap[clause.risk]]}>
                    {clause.risk} risk
                  </Text>
                </View>
                <Text style={styles.clauseBody}>{clause.content}</Text>
                <Text style={styles.clauseLabel}>Why it matters</Text>
                <Text style={styles.clauseText}>{clause.riskReason}</Text>
                <Text style={styles.clauseLabel}>Plain English</Text>
                <Text style={styles.clauseText}>{clause.plainEnglish}</Text>
                <Text style={styles.clauseLabel}>Suggested action</Text>
                <Text style={styles.clauseText}>{clause.actionItem}</Text>
              </View>
            ))
          ) : (
            <View style={styles.summaryBox}>
              <Text>Clause extraction has not produced reviewable output yet.</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          Generated by ContractSense AI
        </Text>
      </Page>
    </Document>
  );
}
