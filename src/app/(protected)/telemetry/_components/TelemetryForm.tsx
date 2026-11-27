"use client";

import { useState, type SubmitEvent } from "react";
import { apiJson, SessionExpiredError } from "@/lib/api/clientFetch";
import type { TelemetryEntry } from "@/lib/api/telemetryClient";
import { createTelemetrySchema } from "@/lib/schemas/telemetry";

type Field = "temperature" | "humidity";
type FieldErrors = Partial<Record<Field, string>>;

type Status =
  | { kind: "idle" }
  | { kind: "success"; entry: TelemetryEntry }
  | { kind: "error"; message: string };

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gaia-greenMint focus:border-transparent";
const labelClass = "block text-xs font-medium text-gaia-darkText/70 mb-1";

/** "" stays undefined so Zod reports "Enter a …" instead of accepting 0. */
function toNumber(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

export default function TelemetryForm({
  habitatId,
  habitatTitle,
}: {
  habitatId: number;
  habitatTitle: string;
}) {
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const parsed = createTelemetrySchema.safeParse({
      temperature: toNumber(temperature),
      humidity: toNumber(humidity),
    });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as Field;
        errors[field] ??= issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setStatus({ kind: "idle" });
    try {
      const entry = await apiJson<TelemetryEntry>(
        `/api/habitat/${habitatId}/telemetry`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      setStatus({ kind: "success", entry });
      setTemperature("");
      setHumidity("");
    } catch (err) {
      // Session end is already redirecting to /login: no error flash.
      if (err instanceof SessionExpiredError) return;
      setStatus({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Failed to record the reading",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
    >
      <p className="text-xs text-gaia-darkText/60">
        Habitat:{" "}
        <span className="font-semibold text-gaia-greenDeep">
          {habitatTitle}
        </span>
      </p>

      <div>
        <label htmlFor="telemetry-temperature" className={labelClass}>
          Temperature (°C)
        </label>
        <input
          id="telemetry-temperature"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="26.5"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          aria-invalid={fieldErrors.temperature ? true : undefined}
          aria-describedby={
            fieldErrors.temperature ? "telemetry-temperature-error" : undefined
          }
          className={inputClass}
        />
        {fieldErrors.temperature && (
          <p
            id="telemetry-temperature-error"
            className="mt-1 text-xs text-gaia-alert-critical"
          >
            {fieldErrors.temperature}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="telemetry-humidity" className={labelClass}>
          Humidity (%)
        </label>
        <input
          id="telemetry-humidity"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="65.5"
          value={humidity}
          onChange={(e) => setHumidity(e.target.value)}
          aria-invalid={fieldErrors.humidity ? true : undefined}
          aria-describedby={
            fieldErrors.humidity ? "telemetry-humidity-error" : undefined
          }
          className={inputClass}
        />
        {fieldErrors.humidity && (
          <p
            id="telemetry-humidity-error"
            className="mt-1 text-xs text-gaia-alert-critical"
          >
            {fieldErrors.humidity}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-gaia-greenDeep text-white px-4 py-2 rounded-xl shadow-sm hover:bg-gaia-greenDeep/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isSubmitting ? "Saving…" : "Record reading"}
      </button>

      <div aria-live="polite">
        {status.kind === "success" && (
          <p className="text-sm text-gaia-alert-success">
            Reading recorded. VPD: {status.entry.vpd.toFixed(2)} kPa.
          </p>
        )}
        {status.kind === "error" && (
          <p className="text-sm text-gaia-alert-critical">{status.message}</p>
        )}
      </div>
    </form>
  );
}
