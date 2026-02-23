import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const ADMIN = {
  username: "cimaraceo",
  password: "cimara2026"
};

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (username === ADMIN.username && password === ADMIN.password) {
      const response = NextResponse.json({ success: true });

      // Create a session object matching Session type in lib/session.ts
      const sessionData = {
        user: { id: 'admin', username: ADMIN.username },
        role: 'ADMIN',
        name: 'System Administrator',
        username: ADMIN.username,
        site: 'ENAM' // Default site, required by type
      };

      response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: "Request error" }, { status: 500 });
  }
}