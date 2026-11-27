/**
 * Reads the `exp` claim (seconds) from a JWT payload and returns it as epoch ms.
 *
 * Decodes only — the signature is NOT verified. Use it for UX hints
 * (cookie lifetime, the optimistic check in proxy.ts), never for authorization:
 * NestJS validates the token on every request.
 *
 * Returns null for a malformed token or one without a numeric `exp`.
 */
export function decodeJwtExp(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof payload.exp === "number" && Number.isFinite(payload.exp)
      ? payload.exp * 1000
      : null;
  } catch {
    return null;
  }
}
