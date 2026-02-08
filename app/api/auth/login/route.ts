import { NextRequest, NextResponse } from 'next/server';
import { PREDEFINED_USERS, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth-constants';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('Login attempt for user:', username);

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user in predefined users
    const user = PREDEFINED_USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      console.log('User not found:', username);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check password
    if (password !== user.password) {
      console.log('Password mismatch for user:', username);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Password correct - create session
    console.log('Login successful for user:', username);

    const sessionData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      user: sessionData,
    });

    // Set session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: JSON.stringify(sessionData),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
