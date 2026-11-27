import type { FC } from "react";
import type { KnownPlantLog, PlantLog } from "@/lib/api/plantLogMapper";
import type { PlantLogFormErrors } from "@/lib/schemas/plantLog";
import { HealthScoreInput } from "./healthScore";
import { fieldErrorClass, inputClass, labelClass } from "./styles";
import { PLANT_LOG_NOTES_MAX_LENGTH } from "@/lib/schemas/plantLog";

/** Form values shared by every type. Types with `details` extend this. */
export type LogFormValues = {
  notes: string;
  healthScore: number | null;
};

export type LogFieldsProps = {
  idPrefix: string;
  mode: "create" | "edit";
  values: LogFormValues;
  errors: PlantLogFormErrors;
  onChange: <F extends keyof LogFormValues>(field: F, value: LogFormValues[F]) => void;
};

type LogTypeDefinition<L extends KnownPlantLog> = {
  label: string;
  icon: string;
  /** Body of a timeline entry (the shell renders time and actions). */
  Entry: FC<{ log: L }>;
  /** Type-specific form fields, shared by the composer and the edit modal. */
  Fields: FC<LogFieldsProps>;
};

type LogTypeRegistry = {
  [K in KnownPlantLog["type"]]: LogTypeDefinition<Extract<KnownPlantLog, { type: K }>>;
};

function ObservationEntry({ log }: { log: Extract<KnownPlantLog, { type: "OBSERVATION" }> }) {
  if (!log.notes) return null;
  return (
    <p className="text-sm text-gaia-darkText/80 whitespace-pre-line break-words">{log.notes}</p>
  );
}

function ObservationFields({ idPrefix, mode, values, errors, onChange }: LogFieldsProps) {
  const notesId = `${idPrefix}-notes`;
  const notesErrorId = `${notesId}-error`;
  return (
    <>
      <div>
        <label htmlFor={notesId} className={labelClass}>
          Notes
        </label>
        <textarea
          id={notesId}
          data-autofocus
          value={values.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
          maxLength={PLANT_LOG_NOTES_MAX_LENGTH}
          placeholder="How does the plant look today?"
          aria-invalid={errors.notes ? true : undefined}
          aria-describedby={errors.notes ? notesErrorId : undefined}
          className={`${inputClass} resize-y`}
        />
        {errors.notes && (
          <p id={notesErrorId} className={fieldErrorClass}>
            {errors.notes}
          </p>
        )}
      </div>
      <HealthScoreInput
        id={`${idPrefix}-health`}
        value={values.healthScore}
        onChange={(value) => onChange("healthScore", value)}
        canClear={mode === "create"}
        error={errors.healthScore}
      />
    </>
  );
}

/**
 * One entry per log type the UI supports. To add a type (e.g. WATERING):
 * extend `KnownPlantLog`, add its member to `createPlantLogSchema`, then add
 * its entry here. Everything else picks it up from this map.
 */
export const LOG_TYPES: LogTypeRegistry = {
  OBSERVATION: {
    label: "Observation",
    icon: "📝",
    Entry: ObservationEntry,
    Fields: ObservationFields,
  },
};

export function isKnownLog(log: PlantLog): log is KnownPlantLog {
  return Object.hasOwn(LOG_TYPES, log.type);
}

export function getLogType(log: KnownPlantLog) {
  // Widened on purpose: with more types, TS can't correlate `log.type` and
  // the registry entry, so the caller passes the matching `log`.
  return LOG_TYPES[log.type] as unknown as LogTypeDefinition<KnownPlantLog>;
}
