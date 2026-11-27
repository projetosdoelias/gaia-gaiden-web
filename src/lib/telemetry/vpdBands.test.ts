import { describe, expect, it } from "vitest";
import { getVpdBand } from "./vpdBands";

describe("getVpdBand", () => {
  it.each([
    [0, "Too Low"],
    [0.39, "Too Low"],
    [0.4, "Low"],
    [0.79, "Low"],
    [0.8, "Ideal"],
    [1.2, "Ideal"],
    [1.21, "High"],
    [1.6, "High"],
    [1.61, "Critical"],
    [3, "Critical"],
  ])("%d kPa is %s", (vpd, label) => {
    expect(getVpdBand(vpd).label).toBe(label);
  });
});
