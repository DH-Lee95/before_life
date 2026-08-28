import { randomBytes } from "node:crypto";

export const ANONYMOUS_SESSION_COOKIE = "anonymous_session_id";

export function createAnonymousSessionId(): string {
  return `anon_${randomBytes(18).toString("base64url")}`;
}
