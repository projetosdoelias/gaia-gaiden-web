import { eventsClient } from "@/lib/api/eventsClient";
import { withSession } from "@/lib/api/withSession";
import { eventBodySchema } from "@/lib/schemas/event";
import { idParamSchema } from "@/lib/schemas/plant";
import { NextResponse } from "next/server";

type Ctx = RouteContext<"/api/habitat/[habitatId]/events/[eventId]">;

type ParsedIds =
  | { ok: true; habitatId: number; eventId: number }
  | { ok: false; response: NextResponse };

async function parseIds(ctx: Ctx): Promise<ParsedIds> {
  const params = await ctx.params;
  const habitatId = idParamSchema.safeParse(params.habitatId);
  const eventId = idParamSchema.safeParse(params.eventId);
  if (!habitatId.success || !eventId.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Invalid habitat or event ID" },
        { status: 400 },
      ),
    };
  }
  return { ok: true, habitatId: habitatId.data, eventId: eventId.data };
}

/**
 * GET /api/habitat/:habitatId/events/:eventId
 *
 * Returns a single event by its ID.
 */
export const GET = withSession<Ctx>(
  "fetching event",
  async ({ ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    const event = await eventsClient.retrieve(token, ids.habitatId, ids.eventId);
    return NextResponse.json(event);
  },
);

/**
 * PATCH /api/habitat/:habitatId/events/:eventId
 *
 * Updates an existing event. Body is whitelisted by `eventBodySchema` (strict).
 */
export const PATCH = withSession<Ctx>(
  "updating event",
  async ({ request, ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    const { description } = eventBodySchema.parse(await request.json());
    const updatedEvent = await eventsClient.update(
      token,
      ids.habitatId,
      ids.eventId,
      description,
    );

    return NextResponse.json(updatedEvent);
  },
);

/**
 * DELETE /api/habitat/:habitatId/events/:eventId
 *
 * Deletes an event (soft-delete via NestJS). Returns 204 No Content on success.
 */
export const DELETE = withSession<Ctx>(
  "deleting event",
  async ({ ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    await eventsClient.delete(token, ids.habitatId, ids.eventId);
    return new NextResponse(null, { status: 204 });
  },
);
