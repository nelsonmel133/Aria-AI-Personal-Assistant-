import { formatRelative, truncate, initials } from "@aria/ui";

describe("Shared UI utils (mobile)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => jest.useRealTimers());

  it("formatRelative — just now", () => {
    expect(formatRelative("2025-01-15T11:59:50Z")).toBe("just now");
  });

  it("formatRelative — past hours", () => {
    expect(formatRelative("2025-01-15T09:00:00Z")).toBe("3h ago");
  });

  it("truncate within limit", () => {
    expect(truncate("short", 20)).toBe("short");
  });

  it("truncate at limit", () => {
    expect(truncate("a very long string here", 10)).toBe("a very lo…");
  });

  it("initials two words", () => {
    expect(initials("Nelson Moyo")).toBe("NM");
  });
});
