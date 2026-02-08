import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Adjust these paths for your app
const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Example cookie name. Change to whatever your auth sets (e.g. "session", "auth_token", etc).
  const hasSession =
    req.cookies.get("session")?.value ||
    req.cookies.get("auth_session")?.value ||
    req.cookies.get("__Secure-auth_session")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p);

  // If signed-in and trying to visit "/", redirect to dashboard
  if (hasSession && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/boards") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/options");

  if (!hasSession && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublic || isProtected) return NextResponse.next();
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
