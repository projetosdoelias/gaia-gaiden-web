import { eventsClient } from "@/lib/api/eventsClient";
import { withSession } from "@/lib/api/withSession";
import { eventBodySchema } from "@/lib/schemas/event";
import { idParamSchema } from "@/lib/schemas/plant";
import { NextResponse } from "next/server";

type Ctx = RouteContext<"/api/habitat/[habitatId]/events">;

function invalidHabitatId() {
  return NextResponse.json({ message: "Invalid habitat ID" }, { status: 400 });
}

/**
 * GET /api/habitat/:habitatId/events
 *
 * Returns a JSON array of events belonging to the specified habitat.
 * Authentication is validated via the session cookie.
 */
export const GET = withSession<Ctx>(
  "fetching events",
  async ({ ctx, token }) => {
    const habitatId = idParamSchema.safeParse((await ctx.params).habitatId);
    if (!habitatId.success) return invalidHabitatId();

    const events = await eventsClient.list(token, habitatId.data);
    return NextResponse.json(events);
  },
);

/**
 * POST /api/habitat/:habitatId/events
 *
 * Creates a new event for the specified habitat.
 * Body is whitelisted by `eventBodySchema` (strict).
 */
export const POST = withSession<Ctx>(
  "creating event",
  async ({ request, ctx, token }) => {
    const habitatId = idParamSchema.safeParse((await ctx.params).habitatId);
    if (!habitatId.success) return invalidHabitatId();

    const { description } = eventBodySchema.parse(await request.json());
    const newEvent = await eventsClient.create(
      token,
      habitatId.data,
      description,
    );

    return NextResponse.json(newEvent, { status: 201 });
  },
);
