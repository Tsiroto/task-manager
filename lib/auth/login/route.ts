import { NextResponse } from "next/server";
import { signSession, sessionCookieOptions } from "@/lib/auth/session";

// Replace with your real user check (DB lookup)
async function validateUser(email: string, password: string) {
  // TODO: verify password hash, etc.
  // return user object if ok, otherwise null
  if (email === "admin@local" && password === "admin") {
    return { id: "user_1", email, name: "Admin" };
  }
  return null;
}

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await validateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: "OWNER",
  });

  const res = NextResponse.json({ ok: true });

  const { name, options } = sessionCookieOptions();
  res.cookies.set(name, token, { ...options, maxAge: 60 * 60 * 24 * 7 }); // 7 days

  return res;
}
