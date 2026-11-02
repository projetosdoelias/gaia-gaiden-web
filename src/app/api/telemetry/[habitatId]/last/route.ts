import { getSession } from "@/lib/auth/session";
import { httpClient } from "@/lib/api/httpClient";
import { APIClientError } from "@/lib/api/errors";
import { NextResponse } from "next/server";

export type TelemetryEntry = {
  id: number;
  habitatId: number;
  recordedAt: string;
  createdAt: string;
  temperature: number;
  humidity: number;
  vpd: number;
};

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

    // Call NestJS: GET /telemetry/:habitatId/last
    const data = await httpClient(`/telemetry/${habitatId}/last`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    // Wrap the response consistently so the client always receives { data: ... }
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof APIClientError) {
      // If NestJS returns 404 (no telemetry yet), return a specific response
      if (error.status === 404) {
        return NextResponse.json(
          { message: "No telemetry data found for this habitat", data: null },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status },
      );
    }

    console.error("Unexpected error fetching last telemetry:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}