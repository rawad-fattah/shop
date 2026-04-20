import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  createAuthToken,
  getAuthCookieOptions,
  getConfiguredCredentials,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username =
      typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json({ message: "اسم المستخدم وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const configured = await getConfiguredCredentials();

    if (!configured) {
      return NextResponse.json({ message: "بيانات الدخول غير مُعَدّة" }, { status: 500 });
    }

    const usernameMatches = username === configured.username;
    const passwordMatches = await bcrypt.compare(password, configured.passwordHash);

    if (!usernameMatches || !passwordMatches) {
      return NextResponse.json({ message: "اسم المستخدم أو كلمة المرور غير صحيحين" }, { status: 401 });
    }

    const token = await createAuthToken(configured.username);
    const response = NextResponse.json({ message: "تم تسجيل الدخول" });

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch {
    return NextResponse.json({ message: "فشل تسجيل الدخول" }, { status: 500 });
  }
}
