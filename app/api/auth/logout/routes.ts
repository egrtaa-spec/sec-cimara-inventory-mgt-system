import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth-constants';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Logout API called');
    
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully'
    });

    // Clear session cookie with explicit options
    response.cookies.delete(SESSION_COOKIE_NAME);
    
    // Also set Max-Age to 0 to ensure cookie is deleted
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      maxAge: 0,
      path: '/',
      httpOnly: true,
    });

    console.log('[v0] Session cookie cleared');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
