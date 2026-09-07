import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './src/lib/auth/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  if (pathname === '/' || pathname === '/login') {
    return NextResponse.next();
  }

  // Static files and Next.js internals
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Check for session
  const session = await getSession();
  if (!session?.token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};