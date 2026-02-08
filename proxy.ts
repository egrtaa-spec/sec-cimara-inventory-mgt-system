import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth-constants';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ALLOW LIST: These paths never get blocked
  if (
    pathname.startsWith('/api/') ||    // Let the API work!
    pathname.startsWith('/_next/') || // Let Next.js load scripts
    pathname === '/login' ||           // Let the login page load
    pathname.includes('.')             // Let images/icons load
  ) {
    return NextResponse.next();
  }

  // 2. PROTECT EVERYTHING ELSE (The Dashboard)
  const session = request.cookies.get(SESSION_COOKIE_NAME);

  if (!session) {
    // If no session found, send them to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. User is authenticated, let them into the dashboard
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};