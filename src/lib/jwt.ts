import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: "access" | "refresh";
}

export function signAccessToken(payload: Omit<JwtPayload, "type">) {
  return jwt.sign({ ...payload, type: "access" }, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
  });
}

export function signRefreshToken(payload: Omit<JwtPayload, "type">) {
  return jwt.sign({ ...payload, type: "refresh" }, REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export function refreshTokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}
