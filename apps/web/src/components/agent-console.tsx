"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ProviderKey } from "@/lib/models";

const providerOptions: Array<{ value: ProviderKey; label: string }> = [
  { value: "anthropic", label: "Claude" },
  { value: "openai", label: "ChatGPT" },
  { value: "gemini", label: "Gemini" },
];

export function AgentConsole() {
  const [provider, setProvider] = useState<ProviderKey>("anthropic");
  const [input, setInput] = useState("");
  const api = useMemo(() => `/api/chat?provider=${provider}`, [provider]);
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api }),
  });

  return (
    <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white p-6 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
            Live AI operations agent
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
            Route conversations between Claude, ChatGPT and Gemini for rollout, trust and detection operations.
          </p>
        </div>
        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value as ProviderKey)}
          className="min-h-11 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)]"
        >
          {providerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
        <div className="flex max-h-[24rem] flex-col gap-3 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="rounded-2xl bg-white p-4 text-sm leading-7 text-[var(--muted-foreground)]">
              Ask for go-to-market advice, detection policy, pricing guidance, incident handling, or enterprise rollout support.
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl p-4 text-sm leading-7 ${
                message.role === "user"
                  ? "ml-auto max-w-[85%] bg-[var(--foreground)] text-white"
                  : "max-w-[92%] bg-white text-[var(--foreground)]"
              }`}
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                {message.role === "user" ? "You" : "Smith-Heffa Agent"}
              </div>
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return <div key={`${message.id}-${index}`}>{part.text}</div>;
                }

                if (part.type.startsWith("tool-")) {
                  return (
                    <pre
                      key={`${message.id}-${index}`}
                      className="overflow-x-auto rounded-xl bg-black/5 p-3 text-xs text-[var(--muted-foreground)]"
                    >
                      {JSON.stringify(part, null, 2)}
                    </pre>
                  );
                }

                return null;
              })}
            </div>
          ))}
        </div>

        <form
          className="mt-4 flex flex-col gap-3 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (!input.trim()) {
              return;
            }

            sendMessage({ text: input });
            setInput("");
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask the agent to plan rollout, pricing, compliance, or product decisions."
            className="min-h-24 flex-1 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0"
          />
          <button
            type="submit"
            disabled={status === "streaming" || !input.trim()}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--foreground-soft)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "streaming" ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </section>
  );
}
