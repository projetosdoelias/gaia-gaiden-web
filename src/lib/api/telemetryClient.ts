import { httpClient } from "./httpClient";

export type TelemetryPayload = {
  habitatId: number;
  temperature: number;
  humidity: number;
};

/** Bucket size of an aggregated series (backend `TelemetryBucket`). */
export type TelemetryBucket = "hour" | "day";

/** Metrics the backend can aggregate (backend `TelemetryMetric`). */
export type TelemetryMetric = "vpd";

/** Query accepted by GET /habitat/:habitatId/telemetry/series. */
export type TelemetrySeriesQuery = {
  /** Range start (inclusive), ISO 8601 with offset. */
  from: string;
  /** Range end (exclusive), ISO 8601 with offset. */
  to: string;
  /** Omit to let the backend pick (`hour` up to 48h, otherwise `day`). */
  bucket?: TelemetryBucket;
  metric?: TelemetryMetric;
  /** IANA time zone used for bucket boundaries (backend default: UTC). */
  tz?: string;
};

export type TelemetrySeriesPoint = {
  /** Bucket start as a UTC ISO instant. */
  bucketStart: string;
  avg: number;
  min: number;
  max: number;
  count: number;
};

export type TelemetrySeriesResponse = {
  habitatId: number;
  metric: TelemetryMetric;
  bucket: TelemetryBucket;
  from: string;
  to: string;
  tz: string;
  /** Sorted by bucketStart ascending. Empty buckets are omitted. */
  points: TelemetrySeriesPoint[];
};

/**
 * Telemetry API client.
 *
 * Responsibility:
 * - Knows the NestJS telemetry API contract.
 * - Encapsulates telemetry-specific headers (API key).
 *
 * Uses httpClient underneath — no hidden session logic. Calls that need a
 * user (series) take the token explicitly from the caller.
 */
export const telemetryClient = {
  async submit(payload: TelemetryPayload): Promise<void> {
    await httpClient("/telemetry", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "x-api-key": process.env.TELEMETRY_API_KEY ?? "",
      },
    });
  },

  async getSeries(
    token: string,
    habitatId: number,
    query: TelemetrySeriesQuery,
  ): Promise<TelemetrySeriesResponse> {
    return httpClient(`/habitat/${habitatId}/telemetry/series`, {
      method: "GET",
      params: query,
      headers: { Authorization: `Bearer ${token}` },
    }) as Promise<TelemetrySeriesResponse>;
  },
};
