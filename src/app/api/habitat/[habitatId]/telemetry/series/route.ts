import { NextResponse } from "next/server";
import { telemetryClient } from "@/lib/api/telemetryClient";
import { withSession } from "@/lib/api/withSession";
import { idParamSchema } from "@/lib/schemas/plant";
import { rangeToWindow, seriesQuerySchema } from "@/lib/schemas/telemetry";

type Ctx = RouteContext<"/api/habitat/[habitatId]/telemetry/series">;

/**
 * GET /api/habitat/:habitatId/telemetry/series?range=24h|7d|30d&tz=<IANA>
 *
 * Forwards to NestJS GET /habitat/:habitatId/telemetry/series. The preset is
 * turned into `from`/`to`; the bucket is left to the backend (auto-selected).
 * Zod errors → 400 "Validation failed"; backend errors keep their status
 * (both mapped by `withSession`).
 */
export const GET = withSession<Ctx>(
  "fetching telemetry series",
  async ({ request, ctx, token }) => {
    const habitatId = idParamSchema.safeParse((await ctx.params).habitatId);
    if (!habitatId.success) {
      return NextResponse.json(
        { message: "Invalid habitat ID" },
        { status: 400 },
      );
    }

    const { range, tz } = seriesQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    const series = await telemetryClient.getSeries(token, habitatId.data, {
      ...rangeToWindow(range),
      metric: "vpd",
      tz,
    });
    return NextResponse.json(series);
  },
);
