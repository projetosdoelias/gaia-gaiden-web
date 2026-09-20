/**
 * Client-side API fetch helper with automatic 401/403 interception.
 *
 * Wraps the native `fetch` API so that any BFF call that returns 401
 * (Unauthorized) or 403 (Forbidden) triggers an automatic logout + redirect
 * to the login page.
 *
 * Usage:
 *   import { api } from "@/lib/api/clientFetch";
 *   const data = await api("/api/habitat");
 *
 * Future: refresh-token retry logic can be added here transparently.
 */

let logoutCallback: (() => void) | null = null;

export function registerLogoutHandler(handler: () => void) {
  logoutCallback = handler;
}

function triggerLogout() {
  if (logoutCallback) {
    logoutCallback();
  } else {
    // Fallback: redirect directly if no handler is registered
    window.location.href = "/login";
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

  if (response.status === 401 || response.status === 403) {
    // Token expired or invalid — auto logout
    triggerLogout();
    throw new Error(
      response.status === 401
        ? "Unauthorized — session expired"
        : "Forbidden — insufficient permissions",
    );
  }

  return response;
}

/**
 * Convenience helper: fetch JSON from a BFF endpoint.
 * Automatically handles 401/403 and throws on non-ok responses.
 */
export async function apiJson<T = unknown>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await api(input, init);

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  const contentType = response.headers.get("content-type");
  if (response.status === 204 || !contentType?.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}