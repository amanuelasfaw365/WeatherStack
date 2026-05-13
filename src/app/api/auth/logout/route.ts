import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { currentCountry } = body as { currentCountry?: string };

    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;

    let userId: string | null = null;

    // Identify the user — try access token first, fall back to refresh token DB lookup
    if (accessToken) {
      try {
        userId = verifyAccessToken(accessToken).sub;
      } catch {
        // access token expired: resolve user from the stored refresh token
      }
    }

    if (!userId && refreshToken) {
      const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      if (stored && stored.expiresAt > new Date()) {
        userId = stored.userId;
      }
    }

    // Persist the last-viewed country before clearing the session
    if (userId && currentCountry) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastSession: {
            country: currentCountry,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    if (refreshToken) {
      await prisma.refreshToken
        .delete({ where: { token: refreshToken } })
        .catch(() => null);
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
