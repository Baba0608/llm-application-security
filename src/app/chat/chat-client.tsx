"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

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

export function ChatClient({ api }: { api: string }) {
  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ai@6 transport is compatible; type conflict when multiple ai versions are resolved
    transport: new DefaultChatTransport({ api }) as any,
  });
  const [input, setInput] = useState("");

  return (
    <div className="flex w-full max-w-2xl flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {messages.length === 0 && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Send a message to start the conversation.
          </p>
        )}
        {messages.map((message: ChatMessage) => (
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
            <span className="text-zinc-900 dark:text-zinc-100">
              {getMessageText(message)}
            </span>
          </div>
        ))}
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
