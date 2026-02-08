import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "app_session";

const encoder = new TextEncoder();

function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET in .env.local");
  return encoder.encode(secret);
}

export type SessionPayload = {
  sub: string; // userId
  email?: string;
  name?: string;
  role?: string;
};

export function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,          // must be false on http://localhost
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function signSession(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, getKey());
  return payload as unknown as SessionPayload;
}
