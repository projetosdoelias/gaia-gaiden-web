import { NextResponse } from "next/server";
import { plantsClient } from "@/lib/api/plantsClient";
import { toUiPlant, toUpdateDto } from "@/lib/api/plantMapper";
import { withSession } from "@/lib/api/withSession";
import { idParamSchema, updatePlantSchema } from "@/lib/schemas/plant";

type Ctx = RouteContext<"/api/habitat/[habitatId]/plants/[plantId]">;

type ParsedIds =
  | { ok: true; habitatId: number; plantId: number }
  | { ok: false; response: NextResponse };

async function parseIds(ctx: Ctx): Promise<ParsedIds> {
  const params = await ctx.params;
  const habitatId = idParamSchema.safeParse(params.habitatId);
  if (!habitatId.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Invalid habitat ID" },
        { status: 400 },
      ),
    };
  }
  const plantId = idParamSchema.safeParse(params.plantId);
  if (!plantId.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Invalid plant ID" },
        { status: 400 },
      ),
    };
  }
  return { ok: true, habitatId: habitatId.data, plantId: plantId.data };
}

/** GET /api/habitat/:habitatId/plants/:plantId */
export const GET = withSession<Ctx>(
  "fetching plant",
  async ({ ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    const plant = await plantsClient.retrieve(token, ids.habitatId, ids.plantId);
    return NextResponse.json(toUiPlant(plant));
  },
);

/**
 * PATCH /api/habitat/:habitatId/plants/:plantId
 * Partial update. Body is whitelisted by `updatePlantSchema` (strict).
 */
export const PATCH = withSession<Ctx>(
  "updating plant",
  async ({ request, ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    const input = updatePlantSchema.parse(await request.json());
    const updated = await plantsClient.update(
      token,
      ids.habitatId,
      ids.plantId,
      toUpdateDto(input),
    );
    return NextResponse.json(toUiPlant(updated));
  },
);

/**
 * DELETE /api/habitat/:habitatId/plants/:plantId
 * Soft delete in NestJS. Returns 204 No Content (same as events).
 */
export const DELETE = withSession<Ctx>(
  "deleting plant",
  async ({ ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    await plantsClient.delete(token, ids.habitatId, ids.plantId);
    return new NextResponse(null, { status: 204 });
  },
);
