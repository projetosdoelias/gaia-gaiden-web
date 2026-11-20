import { describe, expect, it } from "vitest";
import type { TelemetrySeriesPoint } from "@/lib/api/telemetryClient";
import {
  MARGIN,
  buildChartModel,
  nearestIndex,
  splitAtGaps,
  yTop,
} from "./vpdChartModel";

const HOUR = 60 * 60 * 1000;
const start = Date.parse("2026-11-18T15:00:00.000Z");

function point(hoursFromStart: number, avg = 1, max = avg): TelemetrySeriesPoint {
  return {
    bucketStart: new Date(start + hoursFromStart * HOUR).toISOString(),
    avg,
    min: avg,
    max,
    count: 12,
  };
}

function series(points: TelemetrySeriesPoint[], bucket: "hour" | "day" = "hour") {
  return {
    points,
    bucket,
    tz: "America/Sao_Paulo",
    from: new Date(start).toISOString(),
    to: new Date(start + 24 * HOUR).toISOString(),
  };
}

describe("splitAtGaps", () => {
  it("keeps consecutive buckets together and splits at a gap", () => {
    const pts = [0, 1, 2, 5, 6].map((h) => ({ time: start + h * HOUR }));
    expect(splitAtGaps(pts, "hour").map((run) => run.length)).toEqual([3, 2]);
  });

  it("tolerates a 25h day around DST", () => {
    const pts = [0, 25].map((h) => ({ time: start + h * HOUR }));
    expect(splitAtGaps(pts, "day")).toHaveLength(1);
  });
});

describe("nearestIndex", () => {
  const pts = [0, 1, 4].map((h) => ({ time: start + h * HOUR }));

  it("picks the closest point", () => {
    expect(nearestIndex(pts, start + 1.4 * HOUR)).toBe(1);
    expect(nearestIndex(pts, start + 3 * HOUR)).toBe(2);
  });

  it("returns -1 for no points", () => {
    expect(nearestIndex([], start)).toBe(-1);
  });
});

describe("yTop", () => {
  it("never goes below 2 kPa", () => {
    expect(yTop([point(0, 0.5)])).toBe(2);
    expect(yTop([point(0, 0, 0)])).toBe(2);
  });

  it("rounds the highest max up to 0.5 kPa", () => {
    expect(yTop([point(0, 1.5, 2.1)])).toBe(2.5);
  });
});

describe("buildChartModel", () => {
  const width = 600;
  const height = 256;

  it("returns null with no points or no width", () => {
    expect(buildChartModel(series([]), width, height)).toBeNull();
    expect(buildChartModel(series([point(0)]), 0, height)).toBeNull();
  });

  it("draws a single point inside the plot", () => {
    const model = buildChartModel(series([point(12)]), width, height)!;
    expect(model.points).toHaveLength(1);
    expect(model.points[0].x).toBeGreaterThan(0);
    expect(model.points[0].x).toBeLessThan(model.innerWidth);
    expect(model.segments).toHaveLength(1);
  });

  it("splits the line at data gaps", () => {
    const model = buildChartModel(
      series([point(0), point(1), point(8), point(9)]),
      width,
      height,
    )!;
    expect(model.segments).toHaveLength(2);
  });

  it("stacks the bands at 0.4 / 0.8 / 1.2 / 1.6 kPa over [0, 2]", () => {
    const model = buildChartModel(series([point(0)]), width, height)!;
    const inner = height - MARGIN.top - MARGIN.bottom;
    const yOf = (kpa: number) => inner - (kpa / 2) * inner;

    expect(model.bands.map((b) => b.label)).toEqual([
      "Too Low",
      "Low",
      "Ideal",
      "High",
      "Critical",
    ]);
    const edges = [0, 0.4, 0.8, 1.2, 1.6, 2];
    model.bands.forEach((band, i) => {
      expect(band.y + band.height).toBeCloseTo(yOf(edges[i]));
      expect(band.y).toBeCloseTo(yOf(edges[i + 1]));
    });
  });

  it("labels hourly ticks as HH:mm and daily ticks as dates", () => {
    const hourly = buildChartModel(series([point(0)]), width, height)!;
    expect(hourly.xTicks.length).toBeGreaterThan(1);
    hourly.xTicks.forEach((t) => expect(t.label).toMatch(/^\d{2}:\d{2}$/));

    const daily = buildChartModel(
      { ...series([point(0)], "day"), to: new Date(start + 7 * 24 * HOUR).toISOString() },
      width,
      height,
    )!;
    daily.xTicks.forEach((t) => expect(t.label).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/));
  });

  it.each([600, 900, 1400])("never repeats a date on a 7-day chart %ipx wide", (w) => {
    const model = buildChartModel(
      { ...series([point(0)], "day"), to: new Date(start + 7 * 24 * HOUR).toISOString() },
      w,
      height,
    )!;
    const labels = model.xTicks.map((t) => t.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels.length).toBeLessThanOrEqual(8);
  });

  it("maps a pixel back to the nearest time", () => {
    const model = buildChartModel(series([point(0), point(12)]), width, height)!;
    const time = model.timeAt(model.points[1].x);
    expect(nearestIndex(model.points, time)).toBe(1);
  });
});
