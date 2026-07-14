/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        accent: "var(--accent)",
        "accent-cool": "var(--accent-cool)",
        "text-primary": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        success: "var(--success)",
        danger: "var(--danger)",
        border: "var(--border)",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "Fira Code", "monospace"],
      },
      transitionDuration: {
        fast: "120ms",
        DEFAULT: "200ms",
        slow: "350ms",
      },
    },
  },
  plugins: [],
};
