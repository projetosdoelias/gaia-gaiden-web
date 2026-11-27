import { z } from "zod";

/** Positive integer from a strict digit-only string (rejects "12abc"). */
export const idParamSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().positive());

/**
 * `YYYY-MM-DD` from `<input type="date">`, checked to be a real calendar date.
 * Format validation only — stage ordering rules belong to the backend.
 */
export const dateInputSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
  .refine((value) => {
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d
    );
  }, "Enter a valid date");

/**
 * Shared by the form (client) and the BFF (server).
 * NOTE: description and variety are required here but optional in the
 * backend DTO. The backend should be aligned with this rule.
 */
export const createPlantSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must be at most 100 characters"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(1000, "Description must be at most 1000 characters"),
    variety: z
      .string()
      .trim()
      .min(1, "Variety is required")
      .max(100, "Variety must be at most 100 characters"),
    germinatedAt: dateInputSchema.optional(),
    seedlingAt: dateInputSchema.optional(),
  })
  .strict();

export const updatePlantSchema = createPlantSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type CreatePlantInput = z.infer<typeof createPlantSchema>;
export type UpdatePlantInput = z.infer<typeof updatePlantSchema>;

export type PlantFormField = keyof CreatePlantInput;
export type PlantFormErrors = Partial<Record<PlantFormField, string>>;

/** Map a Zod error to the first message per form field. */
export function toFormErrors(error: z.ZodError): PlantFormErrors {
  const { fieldErrors } = z.flattenError(error) as {
    fieldErrors: Partial<Record<string, string[]>>;
  };
  const result: PlantFormErrors = {};
  for (const key of Object.keys(fieldErrors) as PlantFormField[]) {
    const first = fieldErrors[key]?.[0];
    if (first) result[key] = first;
  }
  return result;
}
