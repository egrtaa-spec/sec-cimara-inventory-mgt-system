import { NextResponse } from "next/server";

const ADMIN = {
  username: "cimaraceo",
  password: "cimara2026"
};

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (username === ADMIN.username && password === ADMIN.password) {
      const response = NextResponse.json({ success: true });

      // Create a session cookie that your proxy.ts can detect
      response.cookies.set("admin_session", "active", {
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