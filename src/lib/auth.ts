import { cookies } from "next/headers";
import { verifyAccessToken, JwtPayload } from "./jwt";
import { NextResponse } from "next/server";

export function getAuthUser(): JwtPayload | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(): JwtPayload {
  const user = getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/** Returns a 403 response if the caller's role doesn't match, null otherwise. */
export function requireRole(
  user: JwtPayload | null,
  role: "admin" | "user"
): NextResponse | null {
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== role)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}
