import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  refreshTokenExpiresAt,
} from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("refresh_token")?.value;
    if (!token)
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });

    const payload = verifyRefreshToken(token);

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date())
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await prisma.refreshToken.delete({ where: { token } });

    const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
    const accessToken = signAccessToken(newPayload);
    const refreshToken = signRefreshToken(newPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.sub,
        expiresAt: refreshTokenExpiresAt(),
      },
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });
    res.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
