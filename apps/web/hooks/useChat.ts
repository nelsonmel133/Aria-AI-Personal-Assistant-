"use client";

import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth";
import type { Message } from "@aria/api-client";

export type ChatMessage = Pick<Message, "role" | "content"> & {
  id: string;
  streaming?: boolean;
};

export function useChat(initialConversationId?: string) {
  const { client } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const loadMessages = useCallback(
    async (cid: string) => {
      const msgs = await client.conversations.messages(cid);
      setMessages(
        msgs.map((m) => ({ id: m.id, role: m.role, content: m.content }))
      );
      setConversationId(cid);
    },
    [client]
  );

  const send = useCallback(
    async (content: string) => {
      if (isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
        let assignedId = conversationId;
        for await (const chunk of client.conversations.send(content, conversationId)) {
          if (!assignedId) {
            assignedId = chunk.conversation_id;
            setConversationId(chunk.conversation_id);
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: m.content + chunk.delta }
                : m
            )
          );
        }
      } finally {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, streaming: false } : m
          )
        );
        setIsStreaming(false);
      }
    },
    [client, conversationId, isStreaming]
  );

  return { messages, conversationId, isStreaming, send, loadMessages };
}
