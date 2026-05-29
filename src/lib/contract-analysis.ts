import "server-only";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { jsonrepair } from "jsonrepair";
import { PDFParse } from "pdf-parse";
import { z } from "zod";

import { type ContractClause } from "@/lib/contracts";


const CLAUSE_BATCH_SIZE = 8;
const MAX_CONTRACT_TEXT_CHARS = 120_000;
const MAX_CLAUSE_PROMPT_CHARS = 20_000;
const CLAUSE_PROMPT_OVERLAP_CHARS = 800;

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
    const textResult = await parsePdfWithPdfParse(pdfBuffer);

    const rawText = cleanExtractedText(textResult.text);

    if (!rawText) {
        throw new Error(
            "The uploaded PDF did not contain readable contract text.",
        );
    }

    return rawText;
}

export async function segmentContractClauses(rawText: string) {
  const model = createGeminiModel();
  const boundedText = boundContractText(rawText);

    const clauseExtractor = model.withStructuredOutput(extractedClauseSchema, {
        name: "contract_clause_extraction",
    });

  const sections = chunkContractForClauseExtraction(boundedText);
  const extractedClauses: Array<{ clauseType: string; content: string }> = [];

  for (const [index, section] of sections.entries()) {
    const prompt = `
 You are reviewing a legal contract.

 Task:
 - Split the contract into logical clauses.
 - Label each clause with a short legal clause type.
 - Keep each clause's original meaning intact.
 - Merge broken lines and remove obvious formatting noise.
 - Do not invent clauses that are not present in the contract.

 Return every meaningful clause you can identify.

 Section ${index + 1} of ${sections.length}:
 ${section}

 If the contract continues beyond this section, return only clauses found in this section.
 `;

    const extracted = await invokeStructuredOutputWithFallback(
      clauseExtractor,
      model,
      extractedClauseSchema,
      prompt,
      "clause extraction",
    );

    extractedClauses.push(...extracted.clauses);
  }

  const clauses = dedupeClauses(extractedClauses);

    if (clauses.length === 0) {
        throw new Error(
            "No clauses could be extracted from the uploaded contract.",
        );
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
            createClauseBatches(clauses, CLAUSE_BATCH_SIZE).map((batch) => {
                const prompt = `
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
 `;

                return invokeStructuredOutputWithFallback(
                    clauseAnalyzer,
                    model,
                    clauseAnalysisSchema,
                    prompt,
                    "clause analysis",
                );
            }),
        )
    ).flatMap((result) => result.analyses);
}

export async function summarizeContract(clauses: ContractClause[]) {
    const model = createGeminiModel();
    const summaryWriter = model.withStructuredOutput(contractSummarySchema, {
        name: "contract_report_summary",
    });

    const prompt = `
 You are writing an executive summary for a contract review report.

 Write one concise paragraph in plain English that:
 - explains what the contract generally does,
 - highlights the most important risk themes,
 - and tells the user what to review before signing.

 Use the analyzed clauses below and do not invent facts.

 Analyzed clauses:
 ${JSON.stringify(clauses, null, 2)}
 `;

    const summary = await invokeStructuredOutputWithFallback(
        summaryWriter,
        model,
        contractSummarySchema,
        prompt,
        "summary generation",
    );

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

function chunkContractForClauseExtraction(rawText: string) {
  if (rawText.length <= MAX_CLAUSE_PROMPT_CHARS) {
    return [rawText];
  }

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < rawText.length) {
    const end = Math.min(cursor + MAX_CLAUSE_PROMPT_CHARS, rawText.length);
    const slice = rawText.slice(cursor, end).trim();
    if (slice) {
      chunks.push(slice);
    }

    if (end >= rawText.length) {
      break;
    }

    cursor = Math.max(0, end - CLAUSE_PROMPT_OVERLAP_CHARS);
  }

  return chunks;
}

async function invokeStructuredOutputWithFallback<T>(
    structuredInvoker: { invoke: (prompt: string) => Promise<T> },
    model: { invoke: (prompt: string) => Promise<unknown> },
    schema: z.ZodSchema<T>,
    prompt: string,
    contextLabel: string,
): Promise<T> {
    try {
        return await structuredInvoker.invoke(prompt);
    } catch (error) {
        const fallbackPrompt = `${prompt}

Return ONLY valid JSON that matches this schema:
${schema.toString()}
Do not wrap the JSON in markdown fences.`;

        const response = await model.invoke(fallbackPrompt);

        try {
            return parseJsonWithSchema(response, schema, contextLabel, error);
        } catch (fallbackError) {
            if (contextLabel !== "clause extraction") {
                throw fallbackError;
            }

            const strictPrompt = `${prompt}

Return ONLY a JSON object with this exact shape:
{"clauses":[{"clauseType":"...","content":"..."}]}
Rules:
- "clauses" must be an array.
- Each item must include BOTH "clauseType" and "content" strings.
- No extra keys at the top level.
- Do not wrap in markdown.`;

            const strictResponse = await model.invoke(strictPrompt);
            return parseJsonWithSchema(
                strictResponse,
                schema,
                contextLabel,
                fallbackError,
            );
        }
    }
}

function parseJsonWithSchema<T>(
    response: unknown,
    schema: z.ZodSchema<T>,
    contextLabel: string,
    originalError: unknown,
): T {
    const rawText = normalizeModelText(response);
    const cleaned = stripJsonFences(rawText);
    const jsonText = extractJsonObject(cleaned);

    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonText);
    } catch {
        try {
            const repaired = jsonrepair(jsonText);
            parsed = JSON.parse(repaired);
        } catch {
            throw new Error(
                `Unable to parse ${contextLabel} JSON response. ${stringifyError(originalError)}`,
            );
        }
    }

    parsed = coerceClauseExtraction(parsed, contextLabel);
    parsed = coerceClauseAnalysis(parsed, contextLabel);

    const result = schema.safeParse(parsed);
    if (!result.success) {
        throw new Error(
            `Invalid ${contextLabel} JSON response. ${result.error.message}`,
        );
    }

    return result.data;
}

function coerceClauseExtraction(
    parsed: unknown,
    contextLabel: string,
): unknown {
    if (contextLabel !== "clause extraction") {
        return parsed;
    }

    const normalizedArray = normalizeClauseArray(parsed);

    if (normalizedArray) {
        return { clauses: normalizedArray };
    }

    return parsed;
}

function coerceClauseAnalysis(parsed: unknown, contextLabel: string): unknown {
    if (contextLabel !== "clause analysis") {
        return parsed;
    }

    const normalizedArray = normalizeAnalysisArray(parsed);

    if (normalizedArray) {
        return { analyses: normalizedArray };
    }

    return parsed;
}

function normalizeAnalysisArray(parsed: unknown) {
    if (Array.isArray(parsed)) {
        return normalizeAnalysisItems(parsed) ?? parsed;
    }

    if (parsed && typeof parsed === "object" && "analyses" in parsed) {
        const analyses = (parsed as { analyses?: unknown }).analyses;
        if (Array.isArray(analyses)) {
            return normalizeAnalysisItems(analyses) ?? analyses;
        }
    }

    return null;
}

function normalizeAnalysisItems(items: unknown[]) {
    const normalized = items
        .map((item) => {
            if (!item || typeof item !== "object") {
                return null;
            }

            const record = item as Record<string, unknown>;
            const actionItem = pickFirstString(record, [
                "actionItem",
                "action",
                "recommendation",
                "nextStep",
            ]);
            const clauseType = pickFirstString(record, [
                "clauseType",
                "type",
                "title",
                "heading",
            ]);
            const content = pickFirstString(record, [
                "content",
                "text",
                "body",
                "clause",
            ]);
            const plainEnglish = pickFirstString(record, [
                "plainEnglish",
                "summary",
                "plain",
            ]);
            const riskReason = pickFirstString(record, [
                "riskReason",
                "reason",
                "riskExplanation",
            ]);
            const risk = normalizeRisk(record);

            if (!content || !plainEnglish || !risk || !riskReason) {
                return null;
            }

            return {
                actionItem: actionItem ?? "Review this clause with counsel.",
                clauseType: clauseType ?? "General",
                content,
                plainEnglish,
                risk,
                riskReason,
            };
        })
        .filter(
            (
                analysis,
            ): analysis is {
                actionItem: string;
                clauseType: string;
                content: string;
                plainEnglish: string;
                risk: "High" | "Medium" | "Low";
                riskReason: string;
            } => Boolean(analysis),
        );

    return normalized.length > 0 ? normalized : null;
}

function normalizeRisk(record: Record<string, unknown>) {
    const riskValue = record.risk ?? record.riskLevel ?? record.severity;
    if (typeof riskValue === "string") {
        const normalized = riskValue.trim().toLowerCase();
        if (normalized === "high") {
            return "High";
        }
        if (normalized === "medium" || normalized === "med") {
            return "Medium";
        }
        if (normalized === "low") {
            return "Low";
        }
    }

    return null;
}

function normalizeClauseArray(parsed: unknown) {
    if (Array.isArray(parsed)) {
        return normalizeClauseItems(parsed) ?? fallbackClauseItems(parsed);
    }

    if (parsed && typeof parsed === "object" && "clauses" in parsed) {
        const clauses = (parsed as { clauses?: unknown }).clauses;
        if (Array.isArray(clauses)) {
            return normalizeClauseItems(clauses) ?? fallbackClauseItems(clauses);
        }
    }

    return null;
}

function normalizeClauseItems(items: unknown[]) {
    const normalized = items
        .map((item) => {
            if (Array.isArray(item)) {
                const joined = flattenClauseArray(item);
                if (!joined) {
                    return null;
                }
                return { clauseType: "General", content: joined };
            }

            if (typeof item === "string") {
                const trimmed = item.trim();
                if (!trimmed) {
                    return null;
                }
                return { clauseType: "General", content: trimmed };
            }

            if (item && typeof item === "object") {
                const record = item as Record<string, unknown>;
                const clauseType = pickFirstString(record, [
                    "clauseType",
                    "type",
                    "title",
                    "heading",
                ]);
                const content = pickFirstString(record, [
                    "content",
                    "text",
                    "body",
                    "clause",
                ]);

                const fallbackContent = content ?? pickFirstStringValue(record);
                if (!fallbackContent) {
                    return null;
                }

                return {
                    clauseType: clauseType ?? "General",
                    content: fallbackContent,
                };
            }

            return null;
        })
        .filter(
            (
                clause,
            ): clause is { clauseType: string; content: string } =>
                Boolean(clause),
        );

    return normalized.length > 0 ? normalized : null;
}

function fallbackClauseItems(items: unknown[]) {
    const fallback = items
        .map((item) => {
            if (item == null) {
                return null;
            }

            const text =
                typeof item === "string"
                    ? item
                    : Array.isArray(item)
                      ? flattenClauseArray(item)
                      : safeStringify(item);

            const trimmed = text?.trim();
            if (!trimmed) {
                return null;
            }

            return { clauseType: "General", content: trimmed };
        })
        .filter(
            (
                clause,
            ): clause is { clauseType: string; content: string } =>
                Boolean(clause),
        );

    return fallback.length > 0 ? fallback : null;
}

function flattenClauseArray(items: unknown[]) {
    const parts = items
        .map((item) => {
            if (typeof item === "string") {
                return item;
            }
            if (item && typeof item === "object") {
                const record = item as Record<string, unknown>;
                return pickFirstStringValue(record) ?? safeStringify(item);
            }
            return item == null ? "" : String(item);
        })
        .map((text) => text.trim())
        .filter(Boolean);

    return parts.length > 0 ? parts.join(" ") : null;
}

function pickFirstStringValue(record: Record<string, unknown>) {
    for (const value of Object.values(record)) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed) {
                return trimmed;
            }
        }
    }

    return null;
}

function safeStringify(value: unknown) {
    try {
        return JSON.stringify(value);
    } catch {
        return String(value ?? "");
    }
}

function pickFirstString(
    record: Record<string, unknown>,
    keys: string[],
) {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed) {
                return trimmed;
            }
        }
    }

    return null;
}

function normalizeModelText(response: unknown) {
    if (typeof response === "string") {
        return response.trim();
    }

    if (response && typeof response === "object" && "content" in response) {
        const content = (response as { content?: unknown }).content;

        if (typeof content === "string") {
            return content.trim();
        }

        if (Array.isArray(content)) {
            return content
                .map((item) => {
                    if (typeof item === "string") {
                        return item;
                    }

                    if (item && typeof item === "object" && "text" in item) {
                        return String((item as { text?: unknown }).text ?? "");
                    }

                    return "";
                })
                .join("")
                .trim();
        }
    }

    return String(response ?? "").trim();
}

function stripJsonFences(text: string) {
    return text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
}

function extractJsonObject(text: string) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
        return text.trim();
    }

    return text.slice(start, end + 1).trim();
}

function stringifyError(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    return "Unknown error";
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
