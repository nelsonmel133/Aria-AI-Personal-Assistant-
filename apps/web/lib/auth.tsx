"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createAriaClient, type User } from "@aria/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type AuthCtx = {
  user: User | null;
  token: string | null;
  client: ReturnType<typeof createAriaClient>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("aria_token") : null
  );
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const u = localStorage.getItem("aria_user");
    return u ? JSON.parse(u) : null;
  });

  const getToken = useCallback(() => token, [token]);
  const client = createAriaClient(API_URL, getToken);

  const persist = (t: string, u: User) => {
    localStorage.setItem("aria_token", t);
    localStorage.setItem("aria_user", JSON.stringify(u));
    // also set cookie so server components / middleware can read it
    document.cookie = `aria_token=${t}; path=/; max-age=${60 * 60 * 24 * 30}`;
    setToken(t);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await client.auth.login(email, password);
    persist(res.access_token, res.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await client.auth.register(email, password, name);
    persist(res.access_token, res.user);
  };

  const logout = () => {
    localStorage.removeItem("aria_token");
    localStorage.removeItem("aria_user");
    document.cookie = "aria_token=; path=/; max-age=0";
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, client, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
