import { NextResponse } from "next/server";
import { toUiPlantLog } from "@/lib/api/plantLogMapper";
import { plantLogsClient } from "@/lib/api/plantLogsClient";
import { withSession } from "@/lib/api/withSession";
import { idParamSchema } from "@/lib/schemas/plant";
import { updatePlantLogSchema } from "@/lib/schemas/plantLog";

type Ctx = RouteContext<"/api/habitat/[habitatId]/plants/[plantId]/logs/[logId]">;

type ParsedIds =
  | { ok: true; habitatId: number; plantId: number; logId: number }
  | { ok: false; response: NextResponse };

async function parseIds(ctx: Ctx): Promise<ParsedIds> {
  const params = await ctx.params;
  const checks = [
    ["habitatId", "Invalid habitat ID"],
    ["plantId", "Invalid plant ID"],
    ["logId", "Invalid log ID"],
  ] as const;
  const ids: Partial<Record<(typeof checks)[number][0], number>> = {};
  for (const [key, message] of checks) {
    const parsed = idParamSchema.safeParse(params[key]);
    if (!parsed.success) {
      return { ok: false, response: NextResponse.json({ message }, { status: 400 }) };
    }
    ids[key] = parsed.data;
  }
  return {
    ok: true,
    habitatId: ids.habitatId!,
    plantId: ids.plantId!,
    logId: ids.logId!,
  };
}

/**
 * PATCH /api/habitat/:habitatId/plants/:plantId/logs/:logId
 * Partial update of notes / healthScore / occurredAt (strict body).
 */
export const PATCH = withSession<Ctx>(
  "updating plant log",
  async ({ request, ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    const input = updatePlantLogSchema.parse(await request.json());
    const updated = await plantLogsClient.update(
      token,
      ids.habitatId,
      ids.plantId,
      ids.logId,
      input,
    );
    return NextResponse.json(toUiPlantLog(updated));
  },
);

/**
 * DELETE /api/habitat/:habitatId/plants/:plantId/logs/:logId
 * Soft delete in NestJS. Returns 204 No Content.
 */
export const DELETE = withSession<Ctx>(
  "deleting plant log",
  async ({ ctx, token }) => {
    const ids = await parseIds(ctx);
    if (!ids.ok) return ids.response;

    await plantLogsClient.delete(token, ids.habitatId, ids.plantId, ids.logId);
    return new NextResponse(null, { status: 204 });
  },
);
