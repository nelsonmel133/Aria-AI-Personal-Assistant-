import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { createAriaClient, type User } from "@aria/api-client";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

type AuthCtx = {
  user: User | null;
  token: string | null;
  client: ReturnType<typeof createAriaClient>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync("aria_token");
      const u = await SecureStore.getItemAsync("aria_user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
      setIsLoading(false);
    })();
  }, []);

  const getToken = useCallback(() => token, [token]);
  const client = createAriaClient(API_URL, getToken);

  const persist = async (t: string, u: User) => {
    await SecureStore.setItemAsync("aria_token", t);
    await SecureStore.setItemAsync("aria_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await client.auth.login(email, password);
    await persist(res.access_token, res.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await client.auth.register(email, password, name);
    await persist(res.access_token, res.user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("aria_token");
    await SecureStore.deleteItemAsync("aria_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, client, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
