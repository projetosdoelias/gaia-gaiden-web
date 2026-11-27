import { NextResponse } from "next/server";
import { toUiPlantLog } from "@/lib/api/plantLogMapper";
import { plantLogsClient } from "@/lib/api/plantLogsClient";
import { withSession } from "@/lib/api/withSession";
import { idParamSchema } from "@/lib/schemas/plant";
import {
  createPlantLogSchema,
  plantLogQuerySchema,
} from "@/lib/schemas/plantLog";

type Ctx = RouteContext<"/api/habitat/[habitatId]/plants/[plantId]/logs">;

type ParsedIds =
  | { ok: true; habitatId: number; plantId: number }
  | { ok: false; response: NextResponse };

async function parseIds(ctx: Ctx): Promise<ParsedIds> {
  const params = await ctx.params;
  const habitatId = idParamSchema.safeParse(params.habitatId);
  if (!habitatId.success) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Invalid habitat ID" }, { status: 400 }),
    };
  }
  const plantId = idParamSchema.safeParse(params.plantId);
  if (!plantId.success) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Invalid plant ID" }, { status: 400 }),
    };
  }
  return { ok: true, habitatId: habitatId.data, plantId: plantId.data };
}

/**
 * GET /api/habitat/:habitatId/plants/:plantId/logs?from=&to=&type=
 * Lists the plant's logs (backend order: occurredAt desc, id desc).
 */
export const GET = withSession<Ctx>(
  "listing plant logs",
  async ({ request, ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    const query = plantLogQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const logs = await plantLogsClient.list(token, ids.habitatId, ids.plantId, query);
    return NextResponse.json(logs.map(toUiPlantLog));
  },
);

/**
 * POST /api/habitat/:habitatId/plants/:plantId/logs
 * Body is whitelisted by `createPlantLogSchema` (strict, keyed by `type`).
 */
export const POST = withSession<Ctx>(
  "creating plant log",
  async ({ request, ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    const input = createPlantLogSchema.parse(await request.json());
    const created = await plantLogsClient.create(
      token,
      ids.habitatId,
      ids.plantId,
      input,
    );
    return NextResponse.json(toUiPlantLog(created), { status: 201 });
  },
);
