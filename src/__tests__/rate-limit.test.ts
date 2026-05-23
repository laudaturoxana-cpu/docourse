import { describe, it, expect } from "vitest";

// Tests for rate limit window calculation logic
function getWindowStart(now: number, windowMinutes: number): string {
  return new Date(
    Math.floor(now / (windowMinutes * 60_000)) * (windowMinutes * 60_000)
  ).toISOString();
}

describe("rate limit window calculation", () => {
  it("two requests in same minute share the same window", () => {
    const base = new Date("2026-01-01T10:00:30Z").getTime();
    const later = new Date("2026-01-01T10:00:59Z").getTime();
    expect(getWindowStart(base, 1)).toBe(getWindowStart(later, 1));
  });

  it("requests in different minutes have different windows", () => {
    const first = new Date("2026-01-01T10:00:59Z").getTime();
    const second = new Date("2026-01-01T10:01:00Z").getTime();
    expect(getWindowStart(first, 1)).not.toBe(getWindowStart(second, 1));
  });

  it("15-minute window groups requests correctly", () => {
    const t1 = new Date("2026-01-01T10:00:00Z").getTime();
    const t2 = new Date("2026-01-01T10:14:59Z").getTime();
    const t3 = new Date("2026-01-01T10:15:00Z").getTime();
    expect(getWindowStart(t1, 15)).toBe(getWindowStart(t2, 15));
    expect(getWindowStart(t1, 15)).not.toBe(getWindowStart(t3, 15));
  });
});
