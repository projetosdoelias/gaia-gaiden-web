import { httpClient } from "./httpClient";

/** A stored telemetry reading (backend `Telemetry`). */
export type TelemetryEntry = {
  id: number;
  habitatId: number;
  temperature: number;
  humidity: number;
  vpd: number;
  recordedAt: string;
  createdAt: string;
};

/** Body of POST /telemetry when authenticated with a user JWT. */
export type CreateTelemetryPayload = {
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
 *
 * Uses httpClient underneath — no hidden session logic. Every call takes the
 * user's JWT explicitly from the caller. (API keys are for IoT devices that
 * talk to NestJS directly; this app never uses them.)
 */
export const telemetryClient = {
  /**
   * POST /telemetry with a JWT: NestJS requires `habitatId` in the body and
   * answers 404 when the habitat does not belong to the user.
   */
  async create(
    token: string,
    habitatId: number,
    payload: CreateTelemetryPayload,
  ): Promise<TelemetryEntry> {
    return httpClient("/telemetry", {
      method: "POST",
      body: JSON.stringify({ ...payload, habitatId }),
      headers: { Authorization: `Bearer ${token}` },
    }) as Promise<TelemetryEntry>;
  },

  async getLast(token: string, habitatId: number): Promise<TelemetryEntry> {
    return httpClient(`/telemetry/${habitatId}/last`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }) as Promise<TelemetryEntry>;
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
