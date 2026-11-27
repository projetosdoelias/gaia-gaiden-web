import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, type SessionData } from "@/lib/auth/session";

/**
 * Optimistic session check only — NOT the authorization boundary.
 * NestJS validates the token on every BFF call; an invalid token surfaces as
 * 401, the BFF clears the cookie (withSession) and the client ends the
 * session (clientFetch).
 *
 * Here we only catch what we can see without calling the backend: a missing
 * cookie, or an `expiresAt` (decoded from the JWT at login) in the past.
 */

const PUBLIC_PATHS = ["/", "/login"];

type SessionState = "valid" | "expired" | "none";

function readSession(request: NextRequest): SessionState {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return "none";

  try {
    const session = JSON.parse(raw) as SessionData;
    if (!session?.token) return "none";
    // No expiresAt (token without `exp`, or an older session): cookie = logged in.
    if (typeof session.expiresAt === "number" && session.expiresAt <= Date.now()) {
      return "expired";
    }
    return "valid";
  } catch {
    return "none";
  }
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const state = readSession(request);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // Logged-in users don't need the login page
  if (state === "valid" && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect all private routes
  if (state !== "valid" && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + search);
    if (state === "expired") {
      loginUrl.searchParams.set("reason", "session_expired");
    }
    const response = NextResponse.redirect(loginUrl);
    if (state === "expired") response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  const response = NextResponse.next();
  // Expired cookie on a public page: drop it so it can't bounce /login later.
  if (state === "expired") response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (BFF routes handle their own 401s)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico and static images
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
