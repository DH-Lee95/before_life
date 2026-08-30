import { createHash, randomBytes } from "node:crypto";

type ExchangeOptions = {
  url: string;
  anonKey: string;
  code: string;
  verifier: string;
  fetchImpl?: typeof fetch;
};

export const KAKAO_PKCE_VERIFIER_COOKIE = "kakao_pkce_verifier";

export class PkceExchangeError extends Error {
  constructor(readonly code: string) {
    super("Kakao PKCE code exchange failed");
    this.name = "PkceExchangeError";
  }
}

export function createPkcePair() {
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export async function exchangePkceCode({
  url,
  anonKey,
  code,
  verifier,
  fetchImpl = fetch,
}: ExchangeOptions) {
  const response = await fetchImpl(`${url.replace(/\/$/, "")}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as {
    access_token?: unknown;
    refresh_token?: unknown;
    user?: { id?: unknown };
    code?: unknown;
  } | null;
  if (
    !response.ok
    || typeof payload?.access_token !== "string"
    || typeof payload.refresh_token !== "string"
    || typeof payload.user?.id !== "string"
  ) {
    const errorCode = typeof payload?.code === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(payload.code)
      ? payload.code
      : `http_${response.status}`;
    throw new PkceExchangeError(errorCode);
  }
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    userId: payload.user.id,
  };
}
