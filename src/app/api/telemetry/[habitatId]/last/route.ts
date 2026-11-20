import { httpClient } from "@/lib/api/httpClient";
import { APIClientError } from "@/lib/api/errors";
import { withSession } from "@/lib/api/withSession";
import { idParamSchema } from "@/lib/schemas/plant";
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

type Ctx = RouteContext<"/api/telemetry/[habitatId]/last">;

export const GET = withSession<Ctx>(
  "fetching last telemetry",
  async ({ ctx, token }) => {
    const habitatId = idParamSchema.safeParse((await ctx.params).habitatId);
    if (!habitatId.success) {
      return NextResponse.json(
        { message: "Invalid habitat ID" },
        { status: 400 },
      );
    }

    try {
      // Call NestJS: GET /telemetry/:habitatId/last
      const data = await httpClient(`/telemetry/${habitatId.data}/last`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Wrap the response consistently so the client always receives { data: ... }
      return NextResponse.json({ data });
    } catch (error) {
      // If NestJS returns 404 (no telemetry yet), return a specific response
      if (error instanceof APIClientError && error.status === 404) {
        return NextResponse.json(
          { message: "No telemetry data found for this habitat", data: null },
          { status: 200 },
        );
      }
      throw error;
    }
  },
);
