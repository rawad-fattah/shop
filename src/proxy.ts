import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/login"]);
const PUBLIC_API_PATHS = new Set(["/api/auth/login"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyAuthToken(token) : null;

  if (PUBLIC_PATHS.has(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)"],
};
