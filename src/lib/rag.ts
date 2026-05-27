import "server-only";

import { embed, embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { contractChunks, contracts } from "@/lib/db/schema";

const DEFAULT_EMBEDDING_MODEL =
  process.env.GOOGLE_EMBEDDING_MODEL ?? "gemini-embedding-001";

const DEFAULT_CHAT_MODEL =
  process.env.GOOGLE_GEMINI_MODEL ?? "gemini-1.5-flash";

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const MAX_CHUNK_CHARS = 1600;
const CHUNK_OVERLAP_CHARS = 200;
const MAX_CONTEXT_CHUNKS = 6;

type ContractChunkInput = {
  chunkIndex: number;
  content: string;
};

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type ContractContextChunk = {
  content: string;
  chunkIndex: number;
  similarity: number;
};

export function createChatModel() {
  return googleProvider(DEFAULT_CHAT_MODEL);
}

export function getEmbeddingModel() {
  return googleProvider.embedding(DEFAULT_EMBEDDING_MODEL);
}

export function chunkContractText(rawText: string): ContractChunkInput[] {
  const normalized = rawText
    .replace(/\r/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[\t ]+/g, " ")
    .trim();
  if (!normalized) {
    return [];
  }

  const chunks: ContractChunkInput[] = [];
  let cursor = 0;
  let index = 0;

  while (cursor < normalized.length) {
    let end = Math.min(cursor + MAX_CHUNK_CHARS, normalized.length);
    if (end < normalized.length) {
      const lastPeriod = normalized.lastIndexOf(".", end);
      const lastBreak = Math.max(
        normalized.lastIndexOf("\n", end),
        normalized.lastIndexOf(";", end),
      );
      const candidate = Math.max(lastPeriod, lastBreak);
    if (candidate > cursor + MAX_CHUNK_CHARS * 0.6) {
      end = candidate + 1;
    }
    }

    const slice = normalized.slice(cursor, end).trim();
    if (slice) {
      chunks.push({ chunkIndex: index, content: slice });
      index += 1;
    }

    if (end >= normalized.length) {
      break;
    }

    cursor = Math.max(0, end - CHUNK_OVERLAP_CHARS);
  }

  return chunks;
}

export async function embedContractChunks(
  contractId: string,
  rawText: string,
) {
  const chunks = chunkContractText(rawText);

  if (chunks.length === 0) {
    return { chunkCount: 0 };
  }
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error("Not authenticated.");
  }

  await withSupabaseRls(getToken, userId, async (transactionDb) => {
    const { documentId } = await resolveContractDocument(
      contractId,
      userId,
      transactionDb,
    );

    const embeddings = await embedMany({
      model: getEmbeddingModel(),
      values: chunks.map((chunk) => chunk.content),
    });

    await transactionDb.delete(contractChunks).where(
      and(
        eq(contractChunks.contractId, contractId),
        eq(contractChunks.userId, userId),
      ),
    );

    const rows = chunks.map((chunk, idx) => ({
      userId,
      contractId,
      documentId,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      embedding: vectorToSql(embeddings.embeddings[idx] ?? []),
    }));

    if (rows.length > 0) {
      await transactionDb.insert(contractChunks).values(rows);
    }
  });

  return { chunkCount: chunks.length };
}

export async function embedQuery(query: string) {
  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: query,
  });

  return embedding;
}

export async function fetchRelevantChunks(
  contractId: string,
  embedding: number[],
) {
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error("Not authenticated.");
  }

  const matchCount = MAX_CONTEXT_CHUNKS;

  return withSupabaseRls(getToken, userId, async (transactionDb) => {
    const rows = await transactionDb.execute<{
      id: string;
      content: string;
      chunk_index: number;
      similarity: number;
    }>(
      sql`select * from public.match_contract_chunks(${userId}, ${contractId}, ${vectorToSql(embedding)}, ${matchCount})`,
    );

    return rows.map((row) => ({
      content: row.content,
      chunkIndex: row.chunk_index,
      similarity: row.similarity,
    }));
  });
}

export function formatContext(chunks: ContractContextChunk[]) {
  if (chunks.length === 0) {
    return "";
  }

  return chunks
    .map(
      (chunk) =>
        `Chunk ${chunk.chunkIndex + 1} (score ${chunk.similarity.toFixed(3)}):\n${chunk.content}`,
    )
    .join("\n\n");
}

async function withSupabaseRls<T>(
  getToken: () => Promise<string | null>,
  userId: string,
  callback: (transactionDb: Transaction) => Promise<T>,
) {
  const token = await getToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const role = resolvePostgresRole(decodeTokenRole(token));
  const serializedClaims = JSON.stringify({
    role,
    sub: userId,
  });

  return db.transaction(async (transactionDb) => {
    await transactionDb.execute(sql.raw(`set local role ${role}`));
    await transactionDb.execute(
      sql`select set_config('request.jwt.claim.role', ${role}, true)`,
    );
    await transactionDb.execute(
      sql`select set_config('request.jwt.claim.sub', ${userId}, true)`,
    );
    await transactionDb.execute(
      sql`select set_config('request.jwt.claims', ${serializedClaims}, true)`,
    );

    return callback(transactionDb);
  });
}

function decodeTokenRole(token: string) {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = Buffer.from(padded, "base64").toString("utf8");
  const claims = JSON.parse(decoded) as { role?: string };
  return claims?.role ?? null;
}

function resolvePostgresRole(roleClaim: string | null) {
  return roleClaim === "anon" || roleClaim === "authenticated"
    ? roleClaim
    : "authenticated";
}

function vectorToSql(embedding: number[]) {
  return `[${embedding.join(",")}]`;
}

async function resolveContractDocument(
  contractId: string,
  userId: string,
  transactionDb: Transaction,
) {
  const [contract] = await transactionDb
    .select({ documentId: contracts.documentId })
    .from(contracts)
    .where(and(eq(contracts.id, contractId), eq(contracts.userId, userId)));

  if (!contract?.documentId) {
    throw new Error("Contract not found.");
  }

  return contract;
}
