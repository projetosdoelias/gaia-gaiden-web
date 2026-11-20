import { scaleLinear, scaleTime } from "d3-scale";
import { curveMonotoneX, line } from "d3-shape";
import type {
  TelemetryBucket,
  TelemetrySeriesPoint,
  TelemetrySeriesResponse,
} from "@/lib/api/telemetryClient";
import { formatBucketTick } from "@/lib/format/date";
import { VPD_BANDS, type VpdBand, type VpdTone } from "@/lib/telemetry/vpdBands";

/**
 * Pure chart geometry for the VPD chart: no React, no DOM.
 * The components only render what `buildChartModel` returns.
 */

/** Space around the plot area (px). The right side holds the band labels. */
export const MARGIN = { top: 12, right: 56, bottom: 28, left: 36 } as const;

/** The y axis always reaches at least this value, so every band stays visible. */
export const MIN_Y_TOP_KPA = 2;

/** Roughly one x tick per this many pixels. */
const PX_PER_X_TICK = 80;

const BUCKET_MS: Record<TelemetryBucket, number> = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

/**
 * Two points further apart than this many buckets are not connected.
 * 1.5 (not 1) absorbs 23h/25h days around DST changes.
 */
const GAP_BUCKETS = 1.5;

export type PlotPoint = TelemetrySeriesPoint & {
  /** bucketStart as epoch ms. */
  time: number;
  x: number;
  y: number;
};

export type PlotBand = {
  label: VpdBand["label"];
  tone: VpdTone;
  y: number;
  height: number;
};

export type ChartModel = {
  innerWidth: number;
  innerHeight: number;
  points: PlotPoint[];
  /** SVG path per connected run of points (split at data gaps). */
  segments: string[];
  bands: PlotBand[];
  xTicks: { x: number; label: string }[];
  yTicks: { y: number; label: string }[];
};

/**
 * Splits points into runs with no gap longer than `GAP_BUCKETS` buckets.
 * The backend omits empty buckets, so a gap means "no readings", and the line
 * must not be drawn across it.
 */
export function splitAtGaps<T extends { time: number }>(
  points: T[],
  bucket: TelemetryBucket,
): T[][] {
  const maxStep = BUCKET_MS[bucket] * GAP_BUCKETS;
  const runs: T[][] = [];
  for (const point of points) {
    const run = runs[runs.length - 1];
    const previous = run?.[run.length - 1];
    if (previous && point.time - previous.time <= maxStep) run.push(point);
    else runs.push([point]);
  }
  return runs;
}

/** Index of the point whose time is closest to `time` (-1 when empty). */
export function nearestIndex(points: { time: number }[], time: number): number {
  let best = -1;
  let bestDistance = Infinity;
  points.forEach((point, index) => {
    const distance = Math.abs(point.time - time);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

/** Drops ticks that repeat the previous label (safety net for odd widths/zones). */
function dedupeLabels<T extends { label: string }>(ticks: T[]): T[] {
  return ticks.filter((tick, i) => i === 0 || tick.label !== ticks[i - 1].label);
}

/** Top of the y axis: the highest `max` rounded up to 0.5 kPa, at least `MIN_Y_TOP_KPA`. */
export function yTop(points: TelemetrySeriesPoint[]): number {
  const highest = Math.max(0, ...points.map((p) => p.max));
  return Math.max(MIN_Y_TOP_KPA, Math.ceil(highest * 2) / 2);
}

/**
 * Builds everything the plot draws, for a chart of `width` × `height` px.
 * Returns null when there is nothing to draw yet (no points or no width).
 */
export function buildChartModel(
  series: Pick<TelemetrySeriesResponse, "points" | "bucket" | "tz" | "from" | "to">,
  width: number,
  height: number,
): (ChartModel & { timeAt: (px: number) => number }) | null {
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  if (series.points.length === 0 || innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }

  const times = series.points.map((p) => Date.parse(p.bucketStart));
  // Show the whole requested window, so missing data at the edges is visible.
  const x = scaleTime()
    .domain([
      Math.min(Date.parse(series.from), ...times),
      Math.max(Date.parse(series.to), ...times),
    ])
    .range([0, innerWidth]);
  const top = yTop(series.points);
  const y = scaleLinear().domain([0, top]).range([innerHeight, 0]);

  const points: PlotPoint[] = series.points.map((p, i) => ({
    ...p,
    time: times[i],
    x: x(times[i]),
    y: y(p.avg),
  }));

  const path = line<PlotPoint>()
    .x((p) => p.x)
    .y((p) => p.y)
    .curve(curveMonotoneX);

  const bands = VPD_BANDS.filter((band) => band.min < top).map((band) => {
    const bandTop = y(Math.min(band.max, top));
    return { label: band.label, tone: band.tone, y: bandTop, height: y(band.min) - bandTop };
  });

  // Daily charts never ask for more ticks than days, so d3 stays on
  // midnight-aligned intervals (1 day, 2 days, 1 week…) instead of 12h steps.
  const [start, end] = x.domain();
  const dayCount = Math.ceil((end.getTime() - start.getTime()) / BUCKET_MS.day);
  let tickCount = Math.max(2, Math.floor(innerWidth / PX_PER_X_TICK));
  if (series.bucket === "day") tickCount = Math.min(tickCount, dayCount);

  return {
    innerWidth,
    innerHeight,
    points,
    segments: splitAtGaps(points, series.bucket).map((run) => path(run) ?? ""),
    bands,
    xTicks: dedupeLabels(
      x.ticks(tickCount).map((tick) => ({
        x: x(tick),
        label: formatBucketTick(tick, series.bucket, series.tz),
      })),
    ),
    yTicks: y.ticks(5).map((tick) => ({ y: y(tick), label: tick.toFixed(1) })),
    timeAt: (px) => x.invert(px).getTime(),
  };
}
