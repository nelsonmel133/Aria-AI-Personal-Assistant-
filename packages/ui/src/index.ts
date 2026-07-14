/**
 * @aria/ui
 * Platform-agnostic logic and constants re-used by web and mobile.
 * Pure TypeScript — no JSX here so this file is safe to import in both targets.
 */

import tokens from "@aria/tokens";

// ── Theme helpers ─────────────────────────────────────────────

export type ThemeName = keyof typeof tokens.themes;

export function getTheme(name: ThemeName) {
  return tokens.themes[name] ?? tokens.themes.dusk;
}

// ── Task priority helpers ─────────────────────────────────────

export const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 } as const;

export function priorityColor(priority: string, theme: ReturnType<typeof getTheme>) {
  switch (priority) {
    case "urgent":
      return theme.danger;
    case "high":
      return theme.accent;
    case "normal":
      return theme.accentCool;
    default:
      return theme.textMuted;
  }
}

// ── Date formatting ───────────────────────────────────────────

export function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const past = diff < 0;

  if (abs < 60_000) return "just now";
  if (abs < 3_600_000) {
    const m = Math.round(abs / 60_000);
    return past ? `${m}m ago` : `in ${m}m`;
  }
  if (abs < 86_400_000) {
    const h = Math.round(abs / 3_600_000);
    return past ? `${h}h ago` : `in ${h}h`;
  }
  const d = Math.round(abs / 86_400_000);
  return past ? `${d}d ago` : `in ${d}d`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── String helpers ────────────────────────────────────────────

export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
