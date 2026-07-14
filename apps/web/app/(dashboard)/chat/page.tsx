"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { PresenceThread } from "@/components/ui/PresenceThread";
import { Card } from "@/components/ui/Card";
import { truncate } from "@aria/ui";

export default function ChatPage() {
  const { client } = useAuth();
  const { messages, isStreaming, send, loadMessages, conversationId } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeCid, setActiveCid] = useState<string | undefined>();

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => client.conversations.list(),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (cid: string) => {
    setActiveCid(cid);
    await loadMessages(cid);
  };

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-surface shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">
            Conversations
          </h2>
        </div>
        <ul className="flex flex-col gap-0.5 p-2">
          {conversations?.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => openConversation(c.id)}
                className={[
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-fast",
                  activeCid === c.id
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-muted hover:bg-surface-raised hover:text-text-primary",
                ].join(" ")}
              >
                {truncate(c.title, 36)}
              </button>
            </li>
          ))}
          {(!conversations || conversations.length === 0) && (
            <li className="px-3 py-2 text-xs text-text-muted">No conversations yet</li>
          )}
        </ul>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h1 className="font-display text-xl text-text-primary">
              {conversationId ? "Conversation" : "New conversation"}
            </h1>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {conversationId ? `#${conversationId.slice(0, 8)}` : "Start typing below"}
            </p>
          </div>
          <PresenceThread active={isStreaming} />
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              <p className="font-display text-3xl text-text-primary">
                What's on your mind?
              </p>
              <p className="text-text-muted text-sm max-w-xs">
                Aria can help you think, plan, remember, and act. Just start talking.
              </p>
              {/* Suggested prompts */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[
                  "What do I have due today?",
                  "Remind me to call the dentist tomorrow at 9am",
                  "Help me draft a weekly plan",
                ].map((prompt) => (
                  <Card
                    key={prompt}
                    as="button"
                    onClick={() => send(prompt)}
                    className="px-3 py-2 text-sm text-text-muted hover:text-text-primary cursor-pointer hover:border-accent"
                  >
                    {prompt}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={send} disabled={isStreaming} />
      </div>
    </div>
  );
}
