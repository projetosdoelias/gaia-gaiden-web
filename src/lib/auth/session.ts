import { cookies } from 'next/headers';
import { type NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'gaia_session';

/** Upper bound for the cookie lifetime. */
const MAX_SESSION_SECONDS = 60 * 60 * 24; // 24 hours

export type SessionData = {
  token: string;
  /** Token expiry (epoch ms) decoded from the JWT `exp`; absent if the token has none. */
  expiresAt?: number;
  user?: {
    id: number;
    username: string;
    email?: string;
  };
};

const baseCookieOptions = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/** Cookie lifetime in seconds: follows `expiresAt`, capped at 24h. */
function sessionMaxAge(session: SessionData): number {
  if (session.expiresAt === undefined) return MAX_SESSION_SECONDS;
  const secondsLeft = Math.floor((session.expiresAt - Date.now()) / 1000);
  return Math.max(0, Math.min(MAX_SESSION_SECONDS, secondsLeft));
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as SessionData;
  } catch {
    return null;
  }
}

export async function setSession(session: SessionData, response?: NextResponse): Promise<void> {
  const options = {
    ...baseCookieOptions,
    value: JSON.stringify(session),
    maxAge: sessionMaxAge(session),
  };

  if (response) {
    response.cookies.set(options);
  } else {
    const cookieStore = await cookies();
    cookieStore.set(options);
  }
}

export async function clearSession(response?: NextResponse): Promise<void> {
  if (response) {
    response.cookies.set({ ...baseCookieOptions, value: '', maxAge: 0 });
  } else {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}
