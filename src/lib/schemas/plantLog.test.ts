import { describe, expect, it } from "vitest";
import {
  createPlantLogSchema,
  plantLogQuerySchema,
  toPlantLogFormErrors,
  updatePlantLogSchema,
} from "./plantLog";

describe("createPlantLogSchema", () => {
  it.each([
    [{ type: "OBSERVATION", notes: "  New leaves  " }, { type: "OBSERVATION", notes: "New leaves" }],
    [{ type: "OBSERVATION", healthScore: 4 }, { type: "OBSERVATION", healthScore: 4 }],
    [
      { type: "OBSERVATION", notes: "ok", healthScore: 5, occurredAt: "2026-11-19T14:30:00.000Z" },
      { type: "OBSERVATION", notes: "ok", healthScore: 5, occurredAt: "2026-11-19T14:30:00.000Z" },
    ],
    [
      { type: "OBSERVATION", notes: "ok", occurredAt: "2026-11-19T11:30-03:00" },
      { type: "OBSERVATION", notes: "ok", occurredAt: "2026-11-19T11:30-03:00" },
    ],
  ])("accepts %j", (input, expected) => {
    expect(createPlantLogSchema.parse(input)).toEqual(expected);
  });

  it.each([
    [{ type: "OBSERVATION" }],
    [{ type: "OBSERVATION", notes: "   " }],
    [{ type: "OBSERVATION", healthScore: 0 }],
    [{ type: "OBSERVATION", healthScore: 6 }],
    [{ type: "OBSERVATION", healthScore: 3.5 }],
    [{ type: "OBSERVATION", healthScore: null }],
    [{ type: "OBSERVATION", notes: "x".repeat(2001) }],
    [{ type: "OBSERVATION", notes: "ok", occurredAt: "2026-11-19T14:30" }],
    [{ type: "OBSERVATION", notes: "ok", occurredAt: "2026-13-45T99:99Z" }],
    [{ type: "OBSERVATION", notes: "ok", habitatId: 1 }],
    [{ type: "OBSERVATION", notes: "ok", plantId: 1 }],
    [{ type: "OBSERVATION", notes: "ok", details: {} }],
    [{ type: "WATERING", notes: "ok" }],
    [{ notes: "ok" }],
  ])("rejects %j", (input) => {
    expect(createPlantLogSchema.safeParse(input).success).toBe(false);
  });

  it("reports the notes-or-score rule on the notes field", () => {
    const result = createPlantLogSchema.safeParse({ type: "OBSERVATION" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toPlantLogFormErrors(result.error)).toEqual({
        notes: "Add notes or a health score",
      });
    }
  });
});

describe("updatePlantLogSchema", () => {
  it("accepts a partial update", () => {
    expect(updatePlantLogSchema.parse({ healthScore: 2 })).toEqual({ healthScore: 2 });
  });

  it.each([[{}], [{ notes: null }], [{ notes: "" }], [{ type: "OBSERVATION" }], [{ habitatId: 1 }]])(
    "rejects %j",
    (input) => {
      expect(updatePlantLogSchema.safeParse(input).success).toBe(false);
    },
  );
});

describe("plantLogQuerySchema", () => {
  it("accepts known filters", () => {
    const query = { from: "2026-11-01T00:00:00Z", to: "2026-12-01T00:00:00Z", type: "OBSERVATION" };
    expect(plantLogQuerySchema.parse(query)).toEqual(query);
  });

  it.each([[{ type: "SOMETHING" }], [{ from: "yesterday" }], [{ limit: "10" }]])("rejects %j", (q) => {
    expect(plantLogQuerySchema.safeParse(q).success).toBe(false);
  });
});
