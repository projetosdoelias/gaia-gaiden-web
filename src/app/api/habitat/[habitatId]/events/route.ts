import { eventsClient } from "@/lib/api/eventsClient";
import { withSession } from "@/lib/api/withSession";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ habitatId: string }> };

/**
 * GET /api/habitat/:habitatId/events
 *
 * Returns a JSON array of events belonging to the specified habitat.
 * Authentication is validated via the session cookie.
 */
export const GET = withSession<Ctx>(
  "fetching events",
  async ({ ctx, token }) => {
    const { habitatId } = await ctx.params;
    const habitatIdNum = parseInt(habitatId, 10);
    if (isNaN(habitatIdNum)) {
      return NextResponse.json(
        { message: "Invalid habitat ID" },
        { status: 400 },
      );
    }

    const events = await eventsClient.list(token, habitatIdNum);
    return NextResponse.json(events);
  },
);

/**
 * POST /api/habitat/:habitatId/events
 *
 * Creates a new event for the specified habitat.
 * Expects a JSON body with a "description" field.
 */
export const POST = withSession<Ctx>(
  "creating event",
  async ({ request, ctx, token }) => {
    const { habitatId } = await ctx.params;
    const habitatIdNum = parseInt(habitatId, 10);
    if (isNaN(habitatIdNum)) {
      return NextResponse.json(
        { message: "Invalid habitat ID" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as { description?: string };
    if (typeof body.description !== "string" || body.description.trim().length === 0) {
      return NextResponse.json(
        { message: "Description is required and must not be empty" },
        { status: 400 },
      );
    }

    const newEvent = await eventsClient.create(
      token,
      habitatIdNum,
      body.description.trim(),
    );

    return NextResponse.json(newEvent, { status: 201 });
  },
);
