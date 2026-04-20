import { jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "shop_auth";

const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AuthSession = {
  username: string;
};

type AuthCredentials = {
  username: string;
  passwordHash: string;
};

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret) {
    throw new Error("المتغير AUTH_JWT_SECRET غير مُعَد");
  }

  return new TextEncoder().encode(secret);
}

export type { AuthCredentials };

export async function createAuthToken(username: string) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });

    if (typeof payload.username !== "string" || !payload.username) {
      return null;
    }

    return { username: payload.username };
  } catch {
    return null;
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    priority: "high" as const,
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  };
}

export async function getAuthSessionFromRequest(request: NextRequest): Promise<AuthSession | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export function unauthorizedResponse() {
  return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
}
