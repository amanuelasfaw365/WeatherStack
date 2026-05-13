import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);

    const res = NextResponse.next();
    // Forward verified claims as headers so server components/layouts can read them
    res.headers.set("x-user-id", (payload.sub as string) ?? "");
    res.headers.set("x-user-role", (payload["role"] as string) ?? "user");
    res.headers.set("x-user-email", (payload["email"] as string) ?? "");
    return res;
  } catch {
    // Expired or invalid — client's fetchWithAuth will call /api/auth/refresh and retry
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(req.nextUrl.pathname)}`, req.url)
    );
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
