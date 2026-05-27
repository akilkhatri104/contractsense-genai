import {
  bigint,
  customType,
  integer,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),
});

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    bucketName: text("bucket_name").notNull(),
    storagePath: text("storage_path").notNull(),
    originalName: text("original_name").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("documents_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    uniqueIndex("documents_storage_path_idx").on(table.storagePath),
  ],
);

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" })
      .unique(),
    title: text("title").notNull(),
    status: text("status").notNull().default("processing"),
    currentStage: text("current_stage").notNull().default("uploaded"),
    rawText: text("raw_text"),
    overallSummary: text("overall_summary"),
    clauses: jsonb("clauses")
      .$type<
        Array<{
          actionItem: string;
          clauseType: string;
          content: string;
          plainEnglish: string;
          risk: "High" | "Low" | "Medium";
          riskReason: string;
        }>
      >()
      .notNull()
      .default(sql`'[]'::jsonb`),
    highRiskCount: integer("high_risk_count").notNull().default(0),
    mediumRiskCount: integer("medium_risk_count").notNull().default(0),
    lowRiskCount: integer("low_risk_count").notNull().default(0),
    errorMessage: text("error_message"),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("contracts_user_id_created_at_idx").on(table.userId, table.createdAt),
    uniqueIndex("contracts_document_id_idx").on(table.documentId),
  ],
);

const vector = customType<{ data: number[] | string; driverData: unknown }>({
  dataType() {
    return "vector(768)";
  },
  toDriver(value: number[] | string) {
    if (typeof value === "string") {
      return value;
    }
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown) {
    if (typeof value !== "string") {
      return [];
    }
    const trimmed = value.replace(/^[\[]|[\]]$/g, "").trim();
    if (!trimmed) {
      return [];
    }
    return trimmed.split(",").map((entry) => Number(entry));
  },
});

export const contractChunks = pgTable(
  "contract_chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("contract_chunks_contract_id_idx").on(table.contractId),
    index("contract_chunks_document_id_idx").on(table.documentId),
    index("contract_chunks_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);
