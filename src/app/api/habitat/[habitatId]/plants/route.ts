import { NextResponse } from "next/server";
import { plantsClient } from "@/lib/api/plantsClient";
import { toCreateDto, toUiPlant } from "@/lib/api/plantMapper";
import { withSession } from "@/lib/api/withSession";
import { createPlantSchema, idParamSchema } from "@/lib/schemas/plant";

type Ctx = RouteContext<"/api/habitat/[habitatId]/plants">;

function invalidHabitatId() {
  return NextResponse.json({ message: "Invalid habitat ID" }, { status: 400 });
}

/**
 * GET /api/habitat/:habitatId/plants
 * Lists the habitat's plants (UI shape).
 */
export const GET = withSession<Ctx>(
  "listing plants",
  async ({ ctx, token }) => {
    const habitatId = idParamSchema.safeParse((await ctx.params).habitatId);
    if (!habitatId.success) return invalidHabitatId();

    const plants = await plantsClient.list(token, habitatId.data);
    return NextResponse.json(plants.map(toUiPlant));
  },
);

/**
 * POST /api/habitat/:habitatId/plants
 * Creates a plant. Body is whitelisted by `createPlantSchema` (strict).
 */
export const POST = withSession<Ctx>(
  "creating plant",
  async ({ request, ctx, token }) => {
    const habitatId = idParamSchema.safeParse((await ctx.params).habitatId);
    if (!habitatId.success) return invalidHabitatId();

    const input = createPlantSchema.parse(await request.json());
    const created = await plantsClient.create(
      token,
      habitatId.data,
      toCreateDto(input),
    );
    return NextResponse.json(toUiPlant(created), { status: 201 });
  },
);
