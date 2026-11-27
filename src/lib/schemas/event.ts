import { z } from "zod";

/** Body of POST and PATCH /api/habitat/:habitatId/events[/:eventId]. */
export const eventBodySchema = z
  .object({
    description: z.string().trim().min(1, "Description is required"),
  })
  .strict();
export type EventBody = z.infer<typeof eventBodySchema>;
