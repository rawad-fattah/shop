import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getAuthSessionFromRequest,
  unauthorizedResponse,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse();
  }

  const response = NextResponse.json({ message: "تم تسجيل الخروج" });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });

  return response;
}
