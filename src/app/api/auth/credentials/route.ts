import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  createAuthToken,
  getAuthCookieOptions,
  getAuthSessionFromRequest,
  unauthorizedResponse,
} from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import AuthUser from "@/models/AuthUser";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    const requestedUsername =
      typeof body?.newUsername === "string" ? body.newUsername.trim().toLowerCase() : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "كلمة المرور الحالية والجديدة مطلوبتان" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل" },
        { status: 400 }
      );
    }

    if (requestedUsername && requestedUsername.length < 3) {
      return NextResponse.json(
        { message: "يجب أن يكون اسم المستخدم الجديد 3 أحرف على الأقل" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await AuthUser.findOne({ isActive: true }).sort({ updatedAt: -1 });

    if (!user) {
      return NextResponse.json({ message: "مستخدم الدخول غير مُعَد" }, { status: 404 });
    }

    const currentPasswordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!currentPasswordMatches) {
      return NextResponse.json({ message: "كلمة المرور الحالية غير صحيحة" }, { status: 401 });
    }

    if (requestedUsername && requestedUsername !== user.username) {
      const existingUser = await AuthUser.findOne({ username: requestedUsername });

      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return NextResponse.json({ message: "اسم المستخدم مستخدم بالفعل" }, { status: 409 });
      }

      user.username = requestedUsername;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.isActive = true;
    await user.save();

    const token = await createAuthToken(user.username);
    const response = NextResponse.json({
      message: "تم تحديث بيانات الدخول بنجاح",
      username: user.username,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch {
    return NextResponse.json({ message: "فشل تحديث بيانات الدخول" }, { status: 500 });
  }
}
