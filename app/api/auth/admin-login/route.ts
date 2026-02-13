import { NextResponse } from "next/server";

const ADMIN = {
  username: "cimaraceo",
  password: "cimara2026"
};

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (
    username === ADMIN.username &&
    password === ADMIN.password
  ) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { message: "Invalid admin credentials" },
    { status: 401 }
  );
}