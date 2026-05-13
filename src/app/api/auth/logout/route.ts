import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { currentCountry } = body;

    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        if (currentCountry) {
          await prisma.user.update({
            where: { id: payload.sub },
            data: {
              lastSession: {
                country: currentCountry,
                timestamp: new Date().toISOString(),
              },
            },
          });
        }
      } catch {
        // token may be expired; still proceed with logout
      }
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
