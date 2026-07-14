/**
 * @aria/api-client
 * Typed client for the Aria FastAPI backend.
 * Used by both apps/web and apps/mobile.
 */

// ── Types ────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  timezone: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: "open" | "doing" | "done" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  due_at?: string;
  remind_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title?: string;
  body: string;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Preferences {
  theme: "dusk" | "dawn" | "mono" | "reef";
  voice_enabled: boolean;
  voice_id: string;
  assistant_name: string;
  wake_style: "tap" | "wake-word";
}

// ── Client factory ────────────────────────────────────────────

export function createAriaClient(baseUrl: string, getToken: () => string | null) {
  async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new ApiError(res.status, err.detail ?? "Request failed");
    }
    return res.json() as Promise<T>;
  }

  // ── Auth ─────────────────────────────────────────────────
  const auth = {
    register: (email: string, password: string, display_name: string) =>
      req<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, display_name }),
      }),

    login: (email: string, password: string) =>
      req<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  };

  // ── Conversations ─────────────────────────────────────────
  const conversations = {
    list: () => req<Conversation[]>("/conversations"),

    messages: (conversationId: string) =>
      req<Message[]>(`/conversations/${conversationId}/messages`),

    /**
     * Streaming send — returns an async generator yielding text deltas.
     * conversation_id is undefined for new conversations; the first chunk
     * includes the assigned id so the caller can store it.
     */
    send: async function* (
      content: string,
      conversationId?: string
    ): AsyncGenerator<{ delta: string; conversation_id: string }> {
      const token = getToken();
      const res = await fetch(`${baseUrl}/conversations/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content, conversation_id: conversationId }),
      });

      if (!res.ok || !res.body) throw new ApiError(res.status, "Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") return;
          yield JSON.parse(data);
        }
      }
    },
  };

  // ── Tasks ─────────────────────────────────────────────────
  const tasks = {
    list: (status?: Task["status"]) =>
      req<Task[]>(`/tasks${status ? `?status=${status}` : ""}`),

    create: (payload: Partial<Task>) =>
      req<Task>("/tasks", { method: "POST", body: JSON.stringify(payload) }),

    update: (id: string, payload: Partial<Task>) =>
      req<{ ok: boolean }>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),

    remove: (id: string) =>
      req<{ ok: boolean }>(`/tasks/${id}`, { method: "DELETE" }),
  };

  // ── Notes ─────────────────────────────────────────────────
  const notes = {
    list: () => req<Note[]>("/notes"),

    create: (payload: { title?: string; body: string; tags?: string[] }) =>
      req<Note>("/notes", { method: "POST", body: JSON.stringify(payload) }),
  };

  // ── Preferences ───────────────────────────────────────────
  const preferences = {
    get: () => req<Preferences>("/preferences"),
    update: (payload: Partial<Preferences>) =>
      req<{ ok: boolean }>("/preferences", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  };

  return { auth, conversations, tasks, notes, preferences };
}

// ── Errors ────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export type AriaClient = ReturnType<typeof createAriaClient>;
