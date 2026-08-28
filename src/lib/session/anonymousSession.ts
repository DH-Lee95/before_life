import { randomBytes } from "node:crypto";

export const ANONYMOUS_SESSION_COOKIE = "anonymous_session_id";

export function anonymousSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function createAnonymousSessionId(): string {
  return `anon_${randomBytes(18).toString("base64url")}`;
}
