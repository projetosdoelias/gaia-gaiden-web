import { eventsClient } from "@/lib/api/eventsClient";
import { withSession } from "@/lib/api/withSession";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ habitatId: string; eventId: string }> };

type ParsedIds =
  | { ok: true; habitatId: number; eventId: number }
  | { ok: false; response: NextResponse };

async function parseIds(ctx: Ctx): Promise<ParsedIds> {
  const { habitatId, eventId } = await ctx.params;
  const habitatIdNum = parseInt(habitatId, 10);
  const eventIdNum = parseInt(eventId, 10);
  if (isNaN(habitatIdNum) || isNaN(eventIdNum)) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Invalid habitat or event ID" },
        { status: 400 },
      ),
    };
  }
  return { ok: true, habitatId: habitatIdNum, eventId: eventIdNum };
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
 * Updates an existing event. Expects a JSON body with a "description" field.
 */
export const PATCH = withSession<Ctx>(
  "updating event",
  async ({ request, ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    const body = (await request.json()) as { description?: string };
    if (typeof body.description !== "string" || body.description.trim().length === 0) {
      return NextResponse.json(
        { message: "Description is required and must not be empty" },
        { status: 400 },
      );
    }

    const updatedEvent = await eventsClient.update(
      token,
      ids.habitatId,
      ids.eventId,
      body.description.trim(),
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
