import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth-constants';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    // Parse session data (stored as JSON string)
    const sessionData = JSON.parse(sessionCookie);

    return NextResponse.json({
      user: {
        userId: sessionData.userId,
        username: sessionData.username,
        email: sessionData.email,
        role: sessionData.role
      }
    });
  } catch (error) {
    console.error('[v0] Session check error:', error);
    return NextResponse.json({ user: null });
  }
}
