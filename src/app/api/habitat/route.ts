import { getSession } from "@/lib/auth/session";
import { habitatClient } from "@/lib/api/habitatClient";
import { APIClientError } from "@/lib/api/errors";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Read the session from HttpOnly cookie to get the auth token
    const session = await getSession();
    if (!session?.token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Call NestJS habitat endpoint with the user's token
    const habitats = await habitatClient.list(session.token);

    return NextResponse.json(habitats);
  } catch (error) {
    if (error instanceof APIClientError) {
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status },
      );
    }

    console.error("Unexpected error fetching habitats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}