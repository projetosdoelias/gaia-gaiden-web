import type { TelemetryBucket } from "@/lib/api/telemetryClient";
import { formatBucketLabel } from "@/lib/format/date";
import type { PlotPoint } from "./vpdChartModel";

/** Tooltip width (px); used to keep the box inside the chart. */
export const TOOLTIP_WIDTH = 160;

type Props = {
  point: PlotPoint;
  bucket: TelemetryBucket;
  timeZone: string;
  /** Left offset (px) inside the chart wrapper, already clamped. */
  left: number;
};

/** Hover/focus details for one bucket: avg, min, max and reading count. */
export function VpdChartTooltip({ point, bucket, timeZone, left }: Props) {
  return (
    <div
      className="pointer-events-none absolute top-2 z-10 rounded-xl border border-gray-100 bg-white p-3 text-xs shadow-md"
      style={{ left, width: TOOLTIP_WIDTH }}
      aria-hidden="true"
    >
      <p className="mb-1.5 font-semibold text-gaia-greenDeep">
        {formatBucketLabel(point.bucketStart, bucket, timeZone)}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-gaia-darkText/80">
        <dt>Average</dt>
        <dd className="text-right font-semibold text-gaia-darkText">{point.avg.toFixed(2)} kPa</dd>
        <dt>Min</dt>
        <dd className="text-right">{point.min.toFixed(2)} kPa</dd>
        <dt>Max</dt>
        <dd className="text-right">{point.max.toFixed(2)} kPa</dd>
        <dt>Readings</dt>
        <dd className="text-right">{point.count}</dd>
      </dl>
    </div>
  );
}
