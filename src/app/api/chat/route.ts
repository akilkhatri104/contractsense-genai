import { auth } from "@clerk/nextjs/server";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";

import {
  getFriendlyQuotaMessage,
  isQuotaOrRateLimitError,
  withQuotaRetry,
} from "@/lib/ai-quota";
import { createChatModel, embedQuery, fetchRelevantChunks, formatContext } from "@/lib/rag";

type ChatRequestBody = {
  contractId?: string;
  messages?: unknown;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Not authenticated.", { status: 401 });
  }

  const body = (await request.json()) as ChatRequestBody;
  const contractId = body.contractId?.trim();

  if (!contractId) {
    return new Response("Contract id is required.", { status: 400 });
  }

  if (!body.messages) {
    return new Response("Messages are required.", { status: 400 });
  }

  const modelMessages = await convertToModelMessages(
    body.messages as Array<Omit<UIMessage, "id">>,
  );
  const userQuestion = findLatestUserText(modelMessages);

  if (!userQuestion) {
    return new Response("No user message provided.", { status: 400 });
  }

  try {
    const queryEmbedding = await withQuotaRetry(() => embedQuery(userQuestion));
    const contextChunks = await fetchRelevantChunks(contractId, queryEmbedding);
    const context = formatContext(contextChunks);

    const system = buildSystemPrompt(context);
    const result = await withQuotaRetry(() =>
      streamText({
        model: createChatModel(),
        system,
        messages: modelMessages,
      }),
    );

    const uiStream = result.toUIMessageStream();

    return createUIMessageStreamResponse({ stream: uiStream });
  } catch (error) {
    if (isQuotaOrRateLimitError(error)) {
      return new Response(getFriendlyQuotaMessage(error), { status: 429 });
    }

    const message =
      error instanceof Error ? error.message : "Unable to process chat request.";
    return new Response(message, { status: 500 });
  }
}

function buildSystemPrompt(context: string) {
  return `You are a contract analysis assistant. Use ONLY the provided context to answer.
If the context does not contain the answer, say you do not have enough information.
Keep answers concise, cite relevant clause snippets, and avoid legal advice.

Context:\n${context || "(No relevant context found.)"}`;
}

function findLatestUserText(messages: Array<{ role: string; content: unknown }>) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "user") {
      continue;
    }

    if (typeof message.content === "string") {
      return message.content.trim();
    }

    if (Array.isArray(message.content)) {
      for (
        let partIndex = message.content.length - 1;
        partIndex >= 0;
        partIndex -= 1
      ) {
        const part = message.content[partIndex] as
          | { type?: string; text?: string }
          | undefined;
        if (part && part.type === "text" && typeof part.text === "string") {
          return part.text.trim();
        }
      }
    }
  }

  return "";
}
