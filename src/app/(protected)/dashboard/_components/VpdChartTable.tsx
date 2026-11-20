import type { TelemetrySeriesResponse } from "@/lib/api/telemetryClient";
import { formatBucketLabel } from "@/lib/format/date";

/** Screen-reader table with every point of the chart. */
export function VpdChartTable({ series }: { series: TelemetrySeriesResponse }) {
  return (
    <table className="sr-only">
      <caption>VPD per {series.bucket} (kPa)</caption>
      <thead>
        <tr>
          <th scope="col">Time</th>
          <th scope="col">Average</th>
          <th scope="col">Min</th>
          <th scope="col">Max</th>
          <th scope="col">Readings</th>
        </tr>
      </thead>
      <tbody>
        {series.points.map((p) => (
          <tr key={p.bucketStart}>
            <th scope="row">{formatBucketLabel(p.bucketStart, series.bucket, series.tz)}</th>
            <td>{p.avg.toFixed(2)}</td>
            <td>{p.min.toFixed(2)}</td>
            <td>{p.max.toFixed(2)}</td>
            <td>{p.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
