import { NextResponse } from "next/server";
import { telemetryClient } from "@/lib/api/telemetryClient";
import { withSession } from "@/lib/api/withSession";
import { idParamSchema } from "@/lib/schemas/plant";
import { createTelemetrySchema } from "@/lib/schemas/telemetry";

type Ctx = RouteContext<"/api/habitat/[habitatId]/telemetry">;

/**
 * POST /api/habitat/:habitatId/telemetry
 *
 * Records a manual reading with the user's JWT (never an API key). The habitat
 * comes from the route param only; NestJS checks that it belongs to the user
 * (404 otherwise) and computes the VPD.
 */
export const POST = withSession<Ctx>(
  "creating telemetry",
  async ({ request, ctx, token }) => {
    const habitatId = idParamSchema.safeParse((await ctx.params).habitatId);
    if (!habitatId.success) {
      return NextResponse.json(
        { message: "Invalid habitat ID" },
        { status: 400 },
      );
    }

    const input = createTelemetrySchema.parse(await request.json());
    const created = await telemetryClient.create(token, habitatId.data, input);
    return NextResponse.json(created, { status: 201 });
  },
);
