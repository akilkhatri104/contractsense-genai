"use client";

import { useMemo, useState } from "react";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { Bot, LoaderCircle, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContractChatProps = {
  contractId: string;
  contractTitle: string;
};

export function ContractChat({ contractId, contractTitle }: ContractChatProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { contractId },
    }),
  });

  const isStreaming = status === "streaming" || status === "submitted";
  const latestMessages = useMemo(() => messages.slice(-8), [messages]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) {
      return;
    }

    setInput("");
    await sendMessage({ text: trimmed });
  }

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-900">
          <Bot className="size-5 text-cyan-200" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Contract assistant
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Ask about {contractTitle}
          </h2>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {latestMessages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-4 text-sm text-slate-400">
            Ask about renewal terms, payment schedules, liability limits, or unusual clauses.
          </div>
        ) : null}

        {latestMessages.map((message) => {
          const isUser = message.role === "user";
          const content = message.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("\n");

          if (!content) {
            return null;
          }

          return (
            <div
              key={message.id}
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm",
                isUser
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-50"
                  : "border-white/10 bg-slate-900/70 text-slate-200",
              )}
            >
              <p className="whitespace-pre-wrap leading-6">{content}</p>
            </div>
          );
        })}
      </div>

      <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question about this contract..."
          rows={3}
          className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            The assistant answers using extracted contract clauses.
          </p>
          <Button type="submit" disabled={isStreaming || !input.trim()}>
            {isStreaming ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="size-4 animate-spin" />
                Thinking
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Ask
                <SendHorizontal className="size-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
