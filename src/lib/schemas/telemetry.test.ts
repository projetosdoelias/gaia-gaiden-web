import { describe, expect, it } from "vitest";
import { rangeToWindow, seriesQuerySchema } from "./telemetry";

const HOUR_MS = 60 * 60 * 1000;

describe("seriesQuerySchema", () => {
  it("applies the defaults", () => {
    expect(seriesQuerySchema.parse({})).toEqual({ range: "24h", tz: "UTC" });
  });

  it("accepts every preset and a named zone", () => {
    for (const range of ["24h", "7d", "30d"]) {
      expect(
        seriesQuerySchema.parse({ range, tz: "America/Sao_Paulo" }),
      ).toEqual({ range, tz: "America/Sao_Paulo" });
    }
  });

  it.each([
    [{ range: "1y" }],
    [{ range: "" }],
    [{ tz: "+01:00" }],
    [{ tz: "UTC+3" }],
    [{ tz: "Not/AZone" }],
    [{ bucket: "hour" }],
    [{ from: "2026-11-01T00:00:00Z" }],
  ])("rejects %j", (query) => {
    expect(seriesQuerySchema.safeParse(query).success).toBe(false);
  });
});

describe("rangeToWindow", () => {
  const now = new Date("2026-11-19T15:30:00.000Z");

  it.each([
    ["24h", 24],
    ["7d", 7 * 24],
    ["30d", 30 * 24],
  ] as const)("%s ends at now and spans %i hours", (range, hours) => {
    const { from, to } = rangeToWindow(range, now);
    expect(to).toBe("2026-11-19T15:30:00.000Z");
    expect(Date.parse(to) - Date.parse(from)).toBe(hours * HOUR_MS);
    expect(from).toMatch(/Z$/);
  });
});
