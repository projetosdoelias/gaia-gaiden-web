import { getSession } from "@/lib/auth/session";
import { eventsClient } from "@/lib/api/eventsClient";
import { APIClientError } from "@/lib/api/errors";
import { NextResponse } from "next/server";

/**
 * GET /api/habitat/:habitatId/events/:eventId
 *
 * Returns a single event by its ID.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ habitatId: string; eventId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { habitatId, eventId } = await params;
    const habitatIdNum = parseInt(habitatId, 10);
    const eventIdNum = parseInt(eventId, 10);
    if (isNaN(habitatIdNum) || isNaN(eventIdNum)) {
      return NextResponse.json(
        { message: "Invalid habitat or event ID" },
        { status: 400 },
      );
    }

    const event = await eventsClient.retrieve(
      session.token,
      habitatIdNum,
      eventIdNum,
    );

    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof APIClientError) {
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status },
      );
    }

    console.error("Unexpected error fetching event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/habitat/:habitatId/events/:eventId
 *
 * Updates an existing event. Expects a JSON body with a "description" field.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ habitatId: string; eventId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { habitatId, eventId } = await params;
    const habitatIdNum = parseInt(habitatId, 10);
    const eventIdNum = parseInt(eventId, 10);
    if (isNaN(habitatIdNum) || isNaN(eventIdNum)) {
      return NextResponse.json(
        { message: "Invalid habitat or event ID" },
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

    const updatedEvent = await eventsClient.update(
      session.token,
      habitatIdNum,
      eventIdNum,
      body.description.trim(),
    );

    return NextResponse.json(updatedEvent);
  } catch (error) {
    if (error instanceof APIClientError) {
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status },
      );
    }

    console.error("Unexpected error updating event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/habitat/:habitatId/events/:eventId
 *
 * Deletes an event (soft-delete via NestJS). Returns 204 No Content on success.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ habitatId: string; eventId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { habitatId, eventId } = await params;
    const habitatIdNum = parseInt(habitatId, 10);
    const eventIdNum = parseInt(eventId, 10);
    if (isNaN(habitatIdNum) || isNaN(eventIdNum)) {
      return NextResponse.json(
        { message: "Invalid habitat or event ID" },
        { status: 400 },
      );
    }

    await eventsClient.delete(session.token, habitatIdNum, eventIdNum);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof APIClientError) {
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status },
      );
    }

    console.error("Unexpected error deleting event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}