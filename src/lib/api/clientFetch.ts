/**
 * Browser-side wrapper around `fetch` for every call to the BFF (`/api/*`).
 *
 * - 401 → the session is gone. Runs the shared session-end routine once
 *   (single flight), then throws `SessionExpiredError`.
 * - 403 → throws `ForbiddenError`. The user stays logged in.
 * - other non-ok → `api` returns the Response (callers can inspect 404);
 *   `apiJson` throws `ApiError` with the status.
 *
 * No React dependency: this module works before any provider has mounted.
 * Token refresh happens in the BFF (`withSession`), not here — the token
 * lives in an HttpOnly cookie this code cannot read.
 *
 * Usage:
 *   import { apiJson } from "@/lib/api/clientFetch";
 *   const habitats = await apiJson<Habitat[]>("/api/habitat");
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "You don't have permission to do this.", details?: unknown) {
    super(403, message, details);
    this.name = "ForbiddenError";
  }
}

export class SessionExpiredError extends ApiError {
  constructor(message = "Your session has expired.") {
    super(401, message);
    this.name = "SessionExpiredError";
  }
}

export type SessionEndReason = "session_expired" | "logout";

let sessionEnd: Promise<void> | null = null;

function loginUrl(reason: SessionEndReason): string {
  if (reason === "logout") return "/login";
  const { pathname, search } = window.location;
  const params = new URLSearchParams({
    redirect: pathname + search,
    reason: "session_expired",
  });
  return `/login?${params.toString()}`;
}

/**
 * Ends the session: clears the cookie via the BFF, then does a full page load
 * to /login (drops all in-memory state from the old session).
 * Single flight: concurrent callers share one run.
 */
export function endSession(reason: SessionEndReason): Promise<void> {
  if (!sessionEnd) {
    sessionEnd = (async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // Proceed even if the request fails.
      }
      window.location.assign(loginUrl(reason));
    })();
  }
  return sessionEnd;
}

async function readErrorBody(
  response: Response,
): Promise<{ message?: string; details?: unknown }> {
  try {
    return (await response.json()) as { message?: string; details?: unknown };
  } catch {
    return {};
  }
}

export async function api(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (response.status === 401) {
    void endSession("session_expired");
    throw new SessionExpiredError();
  }

  if (response.status === 403) {
    const body = await readErrorBody(response);
    throw new ForbiddenError(body.message, body.details);
  }

  return response;
}

/**
 * Fetch JSON from a BFF endpoint. Throws `ApiError` on any non-ok response
 * (plus the 401/403 handling of `api`).
 */
export async function apiJson<T = unknown>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await api(input, init);

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(
      response.status,
      body.message ?? `Request failed (${response.status})`,
      body.details,
    );
  }

  // Handle 204 No Content
  const contentType = response.headers.get("content-type");
  if (response.status === 204 || !contentType?.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** Test-only: reset the single-flight state between tests. */
export function __resetSessionEndForTests() {
  sessionEnd = null;
}
