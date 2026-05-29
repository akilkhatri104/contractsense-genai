"use client";

import { useMemo, useState } from "react";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { Bot, LoaderCircle, SendHorizontal, Sparkles, User2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContractChatProps = {
  contractId: string;
  contractTitle: string;
};

export function ContractChat({ contractId, contractTitle }: ContractChatProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { contractId },
    }),
  });

  const isStreaming = status === "streaming" || status === "submitted";
  const latestMessages = useMemo(() => messages.slice(-10), [messages]);
  const suggestedQuestions = useMemo(
    () => [
      "What are the termination conditions?",
      "Summarize payment timelines and late fees.",
      "List key risks and liability limitations.",
    ],
    [],
  );

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
    <section className="rounded-[1.75rem] border border-border/70 bg-gradient-to-b from-card/70 via-card/60 to-secondary/50 p-6 shadow-[0_20px_60px_-35px_rgba(56,189,248,0.45)]">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-secondary/60">
          <Bot className="size-5 text-cyan-200" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Contract assistant
          </p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            Ask about {contractTitle}
          </h2>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              disabled={isStreaming}
              onClick={() => setInput(question)}
              className="rounded-full border border-border/70 bg-card/45 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            {error.message || "Chat request failed. Please try again."}
          </div>
        ) : null}

        {latestMessages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-secondary/45 p-4 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2 text-cyan-100">
              <Sparkles className="size-4" />
              Ask about renewal terms, payment schedules, liability limits, or unusual clauses.
            </p>
          </div>
        ) : null}

        <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1">
          {latestMessages.map((message) => {
            const isUser = message.role === "user";
            const content = message.parts
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("\n")
              .trim();

            if (!content) {
              return null;
            }

            return (
              <div key={message.id} className={cn("flex items-start gap-3", isUser && "justify-end")}>
                {!isUser ? (
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-100">
                    <Bot className="size-4" />
                  </div>
                ) : null}

                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-6",
                    isUser
                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-50"
                      : "border-border/70 bg-secondary/50 text-foreground",
                  )}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{content}</p>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                        ul: ({ ...props }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0" {...props} />,
                        ol: ({ ...props }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0" {...props} />,
                        code: ({ className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="rounded bg-secondary px-1 py-0.5 text-primary-foreground" {...props}>
                              {children}
                            </code>
                          ) : (
                            <code
                              className="block overflow-x-auto rounded-xl bg-card p-3 text-xs text-foreground"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  )}
                </div>

                {isUser ? (
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-100">
                    <User2 className="size-4" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question about this contract..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
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
