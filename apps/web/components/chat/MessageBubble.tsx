"use client";

import { formatDate } from "@aria/ui";
import type { ChatMessage } from "@/hooks/useChat";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={[
          "max-w-[70%] text-sm leading-relaxed",
          isUser ? "text-text-primary" : "text-text-primary",
        ].join(" ")}
      >
        {/* Role label */}
        <p className="text-xs text-text-muted font-mono mb-1">
          {isUser ? "you" : "aria"}
        </p>

        {/* Message content — no bubble, just text with a left border for aria */}
        <div
          className={[
            "relative pl-3",
            !isUser ? "border-l-2 border-accent" : "border-l-2 border-border",
          ].join(" ")}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          {message.streaming && (
            <span className="inline-block w-1 h-3.5 bg-accent ml-0.5 animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </div>
  );
}
