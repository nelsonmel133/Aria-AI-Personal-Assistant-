import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatRelative, formatDate, truncate, initials, priorityColor, getTheme } from "@aria/ui";

describe("formatRelative", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  it("returns 'just now' for < 1 minute", () => {
    expect(formatRelative("2025-01-15T12:00:30Z")).toBe("just now");
  });

  it("returns minutes ago for past", () => {
    expect(formatRelative("2025-01-15T11:45:00Z")).toBe("15m ago");
  });

  it("returns future minutes", () => {
    expect(formatRelative("2025-01-15T12:30:00Z")).toBe("in 30m");
  });

  it("returns hours ago", () => {
    expect(formatRelative("2025-01-15T09:00:00Z")).toBe("3h ago");
  });

  it("returns days ago", () => {
    expect(formatRelative("2025-01-12T12:00:00Z")).toBe("3d ago");
  });
});

describe("truncate", () => {
  it("returns string unchanged if within limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis at max", () => {
    expect(truncate("hello world", 8)).toBe("hello w…");
  });

  it("handles exact length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("initials", () => {
  it("returns first letters of each word", () => {
    expect(initials("Nelson Moyo")).toBe("NM");
  });

  it("uppercases", () => {
    expect(initials("jane doe")).toBe("JD");
  });

  it("caps at 2 characters", () => {
    expect(initials("A B C D")).toBe("AB");
  });

  it("handles single name", () => {
    expect(initials("Nelson")).toBe("N");
  });
});

describe("getTheme", () => {
  it("returns dusk theme by default", () => {
    const t = getTheme("dusk");
    expect(t.bg).toBe("#0F1115");
    expect(t.accent).toBe("#E8C77A");
  });

  it("returns dawn theme", () => {
    const t = getTheme("dawn");
    expect(t.bg).toBe("#F5F0E8");
  });

  it("returns mono theme", () => {
    const t = getTheme("mono");
    expect(t.bg).toBe("#000000");
  });

  it("returns reef theme", () => {
    const t = getTheme("reef");
    expect(t.accent).toBe("#5DC8BE");
  });
});

describe("priorityColor", () => {
  const theme = getTheme("dusk");

  it("returns danger for urgent", () => {
    expect(priorityColor("urgent", theme)).toBe(theme.danger);
  });

  it("returns accent for high", () => {
    expect(priorityColor("high", theme)).toBe(theme.accent);
  });

  it("returns accentCool for normal", () => {
    expect(priorityColor("normal", theme)).toBe(theme.accentCool);
  });

  it("returns textMuted for low", () => {
    expect(priorityColor("low", theme)).toBe(theme.textMuted);
  });
});
