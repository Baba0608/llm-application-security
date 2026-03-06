"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  id: string;
  role: string;
  parts: Array<{ type: string; text?: string }>;
};

function getMessageText(message: ChatMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)
    .join("");
}

type ChatClientProps = {
  api: string;
  variant?: "unsecure" | "secure";
  examplePrompts?: string[];
};

export function ChatClient({ api, variant, examplePrompts }: ChatClientProps) {
  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ai@6 transport is compatible; type conflict when multiple ai versions are resolved
    transport: new DefaultChatTransport({ api }) as any,
  });
  const [input, setInput] = useState("");

  return (
    <div className="flex w-full max-w-2xl flex-1 flex-col gap-6">
      {variant === "unsecure" && (
        <section
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
          aria-label="Unsecure chat – what’s at risk"
        >
          <h2 className="mb-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
            Unsecure chat – what’s at risk
          </h2>
          <p className="mb-2 text-sm text-amber-800 dark:text-amber-200/90">
            This chat has no input validation, no output filtering, and the
            agent can run any SQL.
          </p>
          <ul className="mb-3 list-inside list-disc text-sm text-amber-800 dark:text-amber-200/90">
            <li>No input handling (injection phrases not blocked)</li>
            <li>No structured prompt (instructions vs data not separated)</li>
            <li>LLM output executed as SQL with no validation</li>
            <li>No tool limits (agent can run arbitrary queries)</li>
          </ul>
          <p className="mb-2 text-xs text-amber-700 dark:text-amber-300/90">
            Try the injection examples below. The system prompt is unchanged; if
            the model complies with the user&apos;s override, sensitive data is
            exposed.
          </p>
          <Link
            href="/chat/secure"
            className="text-sm font-medium text-amber-700 underline hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
          >
            Compare with secure chat →
          </Link>
        </section>
      )}

      {variant === "secure" && (
        <section
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30"
          aria-label="Secure chat – how it’s protected"
        >
          <h2 className="mb-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            Secure chat – how it’s protected
          </h2>
          <p className="mb-2 text-sm text-emerald-800 dark:text-emerald-200/90">
            This chat applies the defenses from the doc: input handling, prompt
            design and structure, output filtering, and limited tools. Try safe
            prompts below, or try the same attack-style prompts—they should be
            blocked or answered without leaking PII.
          </p>
          <ul className="mb-3 list-inside list-disc text-sm text-emerald-800 dark:text-emerald-200/90">
            <li>Input handling (suspicious patterns rejected or classified)</li>
            <li>Structured prompts (instructions vs user data separated)</li>
            <li>
              Output filtered (secrets redacted; only allowlisted tools run)
            </li>
            <li>
              Limited tools (list products, orders by customer/order ID only)
            </li>
          </ul>
          <Link
            href="/chat"
            className="text-sm font-medium text-emerald-700 underline hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            Compare with unsecure chat →
          </Link>
        </section>
      )}

      {examplePrompts && examplePrompts.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Example prompts to try
          </p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                disabled={status !== "ready"}
                onClick={() => sendMessage({ text: prompt })}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                {prompt.length > 50 ? `${prompt.slice(0, 50)}…` : prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {messages.length === 0 && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Send a message to start the conversation.
          </p>
        )}
        {messages.map((message: ChatMessage) => {
          const text = getMessageText(message);
          const isAssistant = message.role !== "user";
          return (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-lg bg-zinc-200 px-3 py-2 text-sm dark:bg-zinc-700"
                  : "mr-auto max-w-[85%] rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800"
              }
            >
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                {message.role === "user" ? "You" : "Assistant"}:
              </span>{" "}
              {isAssistant ? (
                <div className="mt-1 max-w-none text-zinc-900 dark:text-zinc-100 [&_p]:mb-1 [&_p]:last:mb-0 [&_pre]:rounded [&_pre]:bg-zinc-200 [&_pre]:dark:bg-zinc-700">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-1 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 space-y-0.5 my-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 space-y-0.5 my-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-snug">{children}</li>
                      ),
                      pre: ({ children }) => (
                        <pre className="overflow-x-auto rounded p-2 text-xs">
                          {children}
                        </pre>
                      ),
                      code: ({ className, children }) => {
                        const isBlock = className?.includes("language-");
                        return isBlock ? (
                          <code className={className}>{children}</code>
                        ) : (
                          <code className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-zinc-700 font-mono text-xs">
                            {children}
                          </code>
                        );
                      },
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {text}
                  </ReactMarkdown>
                </div>
              ) : (
                <span className="text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap warp-break-words">
                  {text}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-2 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          <span>Something went wrong.</span>
          <button
            type="button"
            onClick={() => clearError()}
            className="rounded px-2 py-1 font-medium hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            Dismiss
          </button>
        </div>
      )}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input.trim() });
            setInput("");
          }
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400"
        />
        {status === "submitted" || status === "streaming" ? (
          <button
            type="button"
            onClick={() => stop()}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={status !== "ready" || !input.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}
