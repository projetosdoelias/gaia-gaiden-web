import { ApiError } from "@/lib/api/clientFetch";

/**
 * Best user-facing message for a failed BFF call. Backend validation errors
 * arrive as `details.message` (string or string[]); the top-level message is
 * only the HTTP status text.
 */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const details = err.details as { message?: unknown } | undefined;
    const inner = details?.message;
    if (Array.isArray(inner) && inner.every((m) => typeof m === "string")) {
      return inner.join(". ");
    }
    if (typeof inner === "string" && inner) return inner;
    if (err.status >= 500) return fallback;
    return err.message || fallback;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}
