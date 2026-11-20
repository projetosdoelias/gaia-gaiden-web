import { z } from "zod";

/**
 * Every log type the backend enum knows. Only the ones in
 * `ENABLED_PLANT_LOG_TYPES` can be written today; the rest are reserved.
 */
export const PLANT_LOG_TYPES = [
  "OBSERVATION",
  "WATERING",
  "FEEDING",
  "PRUNING",
  "TRAINING",
  "TRANSPLANT",
  "STAGE_CHANGE",
  "OTHER",
] as const;

export const plantLogTypeSchema = z.enum(PLANT_LOG_TYPES);
export type PlantLogTypeName = z.infer<typeof plantLogTypeSchema>;

export const PLANT_LOG_NOTES_MAX_LENGTH = 2000;
export const HEALTH_SCORE_MIN = 1;
export const HEALTH_SCORE_MAX = 5;

/** ISO 8601 date-time with an explicit offset (same format the backend accepts). */
const ISO_DATETIME_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

/** Format validation only; "not in the future" is enforced by the backend. */
export const isoDateTimeSchema = z
  .string()
  .regex(ISO_DATETIME_WITH_OFFSET, "Enter a valid date and time")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date and time");

const notesSchema = z
  .string()
  .trim()
  .min(1, "Notes can't be empty")
  .max(
    PLANT_LOG_NOTES_MAX_LENGTH,
    `Notes must be at most ${PLANT_LOG_NOTES_MAX_LENGTH} characters`,
  );

export const healthScoreSchema = z
  .number({ error: "Pick a health score" })
  .int()
  .min(HEALTH_SCORE_MIN, `Health score must be ${HEALTH_SCORE_MIN}–${HEALTH_SCORE_MAX}`)
  .max(HEALTH_SCORE_MAX, `Health score must be ${HEALTH_SCORE_MIN}–${HEALTH_SCORE_MAX}`);

const NOTES_OR_SCORE = "Add notes or a health score";

/** OBSERVATION: notes and/or a health score. No `details`. */
export const createObservationSchema = z
  .object({
    type: z.literal("OBSERVATION"),
    notes: notesSchema.optional(),
    healthScore: healthScoreSchema.optional(),
    occurredAt: isoDateTimeSchema.optional(),
  })
  .strict()
  .refine((v) => v.notes !== undefined || v.healthScore !== undefined, {
    message: NOTES_OR_SCORE,
    path: ["notes"],
  });

/**
 * Body of POST /api/habitat/:habitatId/plants/:plantId/logs, keyed by `type`.
 * Add one member per log type as the backend enables it.
 */
export const createPlantLogSchema = z.discriminatedUnion("type", [
  createObservationSchema,
]);

/**
 * Body of PATCH .../logs/:logId. `type` and `details` can't change, and the
 * backend rejects `null`, so fields can be replaced but never cleared.
 */
export const updatePlantLogSchema = z
  .object({
    notes: notesSchema.optional(),
    healthScore: healthScoreSchema.optional(),
    occurredAt: isoDateTimeSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

/** Query string of GET .../logs. */
export const plantLogQuerySchema = z
  .object({
    from: isoDateTimeSchema.optional(),
    to: isoDateTimeSchema.optional(),
    type: plantLogTypeSchema.optional(),
  })
  .strict();

export type CreatePlantLogInput = z.infer<typeof createPlantLogSchema>;
export type UpdatePlantLogInput = z.infer<typeof updatePlantLogSchema>;
export type PlantLogQuery = z.infer<typeof plantLogQuerySchema>;

export type PlantLogFormField = "notes" | "healthScore" | "occurredAt";
export type PlantLogFormErrors = Partial<Record<PlantLogFormField, string>>;

/** Map a Zod error to the first message per form field (root errors → notes). */
export function toPlantLogFormErrors(error: z.ZodError): PlantLogFormErrors {
  const result: PlantLogFormErrors = {};
  for (const issue of error.issues) {
    const key = (issue.path[0] ?? "notes") as PlantLogFormField;
    if (!["notes", "healthScore", "occurredAt"].includes(key)) continue;
    result[key] ??= issue.message;
  }
  return result;
}
