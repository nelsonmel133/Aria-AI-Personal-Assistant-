import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import tokens from "@aria/tokens";

export type ThemeName = keyof typeof tokens.themes;

type ThemeCtx = {
  theme: ThemeName;
  colors: (typeof tokens.themes)[ThemeName];
  setTheme: (t: ThemeName) => void;
};

const ThemeContext = createContext<ThemeCtx>({
  theme: "dusk",
  colors: tokens.themes.dusk,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("dusk");

  useEffect(() => {
    SecureStore.getItemAsync("aria_theme").then((t) => {
      if (t && t in tokens.themes) setThemeState(t as ThemeName);
    });
  }, []);

  const setTheme = (name: ThemeName) => {
    setThemeState(name);
    SecureStore.setItemAsync("aria_theme", name);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, colors: tokens.themes[theme], setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
