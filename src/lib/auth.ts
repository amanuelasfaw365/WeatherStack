import { cookies } from "next/headers";
import { verifyAccessToken, JwtPayload } from "./jwt";

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
