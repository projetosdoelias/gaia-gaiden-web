import { z } from "zod";

/** Range presets offered by the dashboard chart. */
export const SERIES_RANGES = ["24h", "7d", "30d"] as const;

export const seriesRangeSchema = z.enum(SERIES_RANGES);
export type SeriesRange = z.infer<typeof seriesRangeSchema>;

/** Named zones only ("UTC", "America/Sao_Paulo"); offsets like "+01:00" are rejected, as in the backend. */
const IANA_ZONE_NAME = /^[A-Za-z_]+(\/[A-Za-z0-9_+-]+)*$/;

/** IANA time zone known to the runtime. Format validation only. */
export const timeZoneSchema = z
  .string()
  .max(64)
  .regex(IANA_ZONE_NAME, "Use an IANA time zone name, e.g. UTC")
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Unknown time zone");

/** Query string of GET /api/habitat/:habitatId/telemetry/series. */
export const seriesQuerySchema = z
  .object({
    range: seriesRangeSchema.default("24h"),
    tz: timeZoneSchema.default("UTC"),
  })
  .strict();

/**
 * Body of POST /api/habitat/:habitatId/telemetry (manual reading).
 * The habitat comes from the route param, never from the body. VPD is
 * computed by the backend. Format validation only: value ranges belong
 * to the backend.
 */
export const createTelemetrySchema = z
  .object({
    temperature: z.number({ error: "Enter a temperature" }),
    humidity: z.number({ error: "Enter a humidity" }),
  })
  .strict();
export type CreateTelemetryInput = z.infer<typeof createTelemetrySchema>;

const HOUR_MS = 60 * 60 * 1000;
const RANGE_MS: Record<SeriesRange, number> = {
  "24h": 24 * HOUR_MS,
  "7d": 7 * 24 * HOUR_MS,
  "30d": 30 * 24 * HOUR_MS,
};

/**
 * Converts a preset into the rolling `{ from, to }` window the backend expects
 * (input shaping only: `to` is `now`, `from` is `now` minus the preset).
 */
export function rangeToWindow(
  range: SeriesRange,
  now: Date = new Date(),
): { from: string; to: string } {
  return {
    from: new Date(now.getTime() - RANGE_MS[range]).toISOString(),
    to: now.toISOString(),
  };
}
