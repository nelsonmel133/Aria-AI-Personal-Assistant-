"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import tokens from "@aria/tokens";

type ThemeName = keyof typeof tokens.themes;

type ThemeCtx = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
};

const ThemeContext = createContext<ThemeCtx>({ theme: "dusk", setTheme: () => {} });

function applyTheme(name: ThemeName) {
  const t = tokens.themes[name] ?? tokens.themes.dusk;
  const root = document.documentElement;
  root.style.setProperty("--bg", t.bg);
  root.style.setProperty("--surface", t.surface);
  root.style.setProperty("--surface-raised", t.surfaceRaised);
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--accent-cool", t.accentCool);
  root.style.setProperty("--text-primary", t.textPrimary);
  root.style.setProperty("--text-muted", t.textMuted);
  root.style.setProperty("--success", t.success);
  root.style.setProperty("--danger", t.danger);
  root.style.setProperty("--border", t.border);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("dusk");

  useEffect(() => {
    const saved = (localStorage.getItem("aria_theme") as ThemeName) ?? "dusk";
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const setTheme = (name: ThemeName) => {
    setThemeState(name);
    applyTheme(name);
    localStorage.setItem("aria_theme", name);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
