import { NextResponse } from "next/server";
import { clearSession, getSession, type SessionData } from "@/lib/auth/session";
import { APIClientError } from "./errors";
import { errorResponse } from "./routeErrors";

export type SessionHandlerArgs<Ctx> = {
  request: Request;
  ctx: Ctx;
  token: string;
  session: SessionData;
};

async function unauthorized(code: "UNAUTHENTICATED" | "SESSION_EXPIRED", message: string) {
  const response = NextResponse.json({ code, message }, { status: 401 });
  await clearSession(response);
  return response;
}

/**
 * Wraps a protected BFF route handler.
 *
 * - No (readable) session → 401 UNAUTHENTICATED, cookie cleared.
 * - NestJS answers 401    → 401 SESSION_EXPIRED, cookie cleared.
 * - Any other error       → `errorResponse` (400 / backend status / 500).
 *
 * Handlers that map specific backend errors themselves (e.g. telemetry 404 →
 * `{ data: null }`) catch them before they reach this wrapper.
 */
export function withSession<Ctx = unknown>(
  action: string,
  handler: (args: SessionHandlerArgs<Ctx>) => Promise<Response>,
) {
  return async (request: Request, ctx: Ctx): Promise<Response> => {
    const session = await getSession();
    if (!session?.token) {
      return unauthorized("UNAUTHENTICATED", "Unauthorized");
    }

    try {
      return await handler({ request, ctx, token: session.token, session });
    } catch (error) {
      if (error instanceof APIClientError && error.status === 401) {
        // TODO(refresh): refresh the token, retry once, and only clear the session if that fails
        return unauthorized("SESSION_EXPIRED", "Your session has expired.");
      }
      return errorResponse(error, action);
    }
  };
}
