import { httpClient } from "./httpClient";

export type TelemetryPayload = {
  habitatId: number;
  temperature: number;
  humidity: number;
};

/**
 * Telemetry API client.
 *
 * Responsibility:
 * - Knows the NestJS telemetry API contract.
 * - Encapsulates telemetry-specific headers (API key).
 *
 * Uses httpClient underneath — no hidden session logic.
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
};