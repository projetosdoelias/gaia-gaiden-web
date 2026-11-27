"use client";

import { useEffect, useState } from "react";
import { ApiError, apiJson, SessionExpiredError } from "@/lib/api/clientFetch";
import type { TelemetrySeriesResponse } from "@/lib/api/telemetryClient";
import { SERIES_RANGES, timeZoneSchema, type SeriesRange } from "@/lib/schemas/telemetry";
import { CHART_HEIGHT, VpdChartPlot } from "./VpdChartPlot";
import { VpdChartTable } from "./VpdChartTable";

const RANGE_LABELS: Record<SeriesRange, { button: string; period: string }> = {
  "24h": { button: "24h", period: "last 24 hours" },
  "7d": { button: "7 days", period: "last 7 days" },
  "30d": { button: "30 days", period: "last 30 days" },
};

/** The browser's IANA time zone, or UTC if the runtime reports something unusable. */
function browserTimeZone(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZoneSchema.safeParse(tz).success ? tz : "UTC";
}

/** Result of one request; `key` says which habitat/range/retry it belongs to. */
type Result =
  | { key: string; data: TelemetrySeriesResponse }
  | { key: string; error: string };

/** User-facing message for a failed request (backend errors carry HTTP status text). */
function errorMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 404) return "This habitat was not found.";
  if (err instanceof ApiError && err.status === 403) return err.message;
  return "Could not load the VPD history.";
}

type Props = {
  habitatId: number;
  /** Bump to refetch (e.g. the dashboard's Refresh button). */
  refreshKey?: number;
};

/** VPD history card: range selector, fetching and loading/empty/error states. */
export function VpdChart({ habitatId, refreshKey = 0 }: Props) {
  const [range, setRange] = useState<SeriesRange>("24h");
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const key = `${habitatId}|${range}|${retry}|${refreshKey}`;
  // Loading = the latest result belongs to an older request.
  const current = result?.key === key ? result : null;

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ range, tz: browserTimeZone() });
    apiJson<TelemetrySeriesResponse>(
      `/api/habitat/${habitatId}/telemetry/series?${query}`,
      { signal: controller.signal },
    )
      .then((data) => setResult({ key, data }))
      .catch((err: unknown) => {
        // Stale request, or the session ended and /login is loading.
        if (controller.signal.aborted || err instanceof SessionExpiredError) return;
        setResult({ key, error: errorMessage(err) });
      });
    return () => controller.abort();
  }, [habitatId, range, key]);

  const period = RANGE_LABELS[range].period;
  const data = current && "data" in current ? current.data : null;

  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="vpd-chart-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 id="vpd-chart-title" className="text-sm font-bold uppercase tracking-wider text-gaia-greenDeep">
            VPD History
          </h3>
          <p className="text-xs text-gaia-darkText/60">
            {data ? `Average per ${data.bucket}, ${period} (kPa)` : `Average VPD, ${period} (kPa)`}
          </p>
        </div>
        <div role="group" aria-label="Time range" className="flex self-start rounded-lg bg-gaia-bg p-1 text-xs font-medium text-gaia-darkText/70 sm:self-auto">
          {SERIES_RANGES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === range}
              onClick={() => setRange(option)}
              className={`min-h-10 rounded-md px-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gaia-greenMint ${
                option === range ? "bg-white font-bold text-gaia-greenDeep shadow-2xs" : "hover:text-gaia-greenDeep"
              }`}
            >
              {RANGE_LABELS[option].button}
            </button>
          ))}
        </div>
      </div>

      {!current && (
        <div className="w-full animate-pulse rounded-xl bg-gaia-bg" style={{ height: CHART_HEIGHT }} role="status">
          <span className="sr-only">Loading VPD history…</span>
        </div>
      )}

      {current && "error" in current && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gaia-alert-critical/30 bg-gaia-alert-critical/5 p-6 text-center" style={{ height: CHART_HEIGHT }} role="alert">
          <p className="text-sm text-gaia-darkText">{current.error}</p>
          <button
            type="button"
            onClick={() => setRetry((n) => n + 1)}
            className="min-h-10 rounded-xl border border-gray-100 bg-white px-4 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      )}

      {data && data.points.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-gaia-bg/50 p-6 text-center" style={{ height: CHART_HEIGHT }}>
          <p className="text-sm font-medium text-gaia-greenDeep">No readings in this period</p>
          <p className="mt-1 text-xs text-gaia-darkText/60">Try a longer range, or check that the habitat&apos;s sensors are reporting.</p>
        </div>
      )}

      {data && data.points.length > 0 && (
        <>
          {/* Remount per result so a hovered index never points into new data. */}
          <VpdChartPlot key={key} series={data} label={`Average VPD per ${data.bucket}, ${period}`} />
          <VpdChartTable series={data} />
        </>
      )}
    </section>
  );
}
