import { getSession } from "@/lib/auth/session";
import { eventsClient } from "@/lib/api/eventsClient";
import { APIClientError } from "@/lib/api/errors";
import { NextResponse } from "next/server";

/**
 * GET /api/habitat/:habitatId/events
 *
 * Returns a JSON array of events belonging to the specified habitat.
 * Authentication is validated via the session cookie.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ habitatId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { habitatId } = await params;
    const habitatIdNum = parseInt(habitatId, 10);
    if (isNaN(habitatIdNum)) {
      return NextResponse.json(
        { message: "Invalid habitat ID" },
        { status: 400 },
      );
    }

    const events = await eventsClient.list(session.token, habitatIdNum);
    return NextResponse.json(events);
  } catch (error) {
    if (error instanceof APIClientError) {
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status },
      );
    }

    console.error("Unexpected error fetching events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/habitat/:habitatId/events
 *
 * Creates a new event for the specified habitat.
 * Expects a JSON body with a "description" field.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ habitatId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { habitatId } = await params;
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
      session.token,
      habitatIdNum,
      body.description.trim(),
    );

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    if (error instanceof APIClientError) {
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status },
      );
    }

    console.error("Unexpected error creating event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}