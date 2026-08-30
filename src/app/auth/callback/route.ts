import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAccountRepository } from "@/lib/auth/accountRepository";
import { readSupabaseAuthEnvironment } from "@/lib/auth/authEnvironment";
import { exchangePkceCode, KAKAO_PKCE_VERIFIER_COOKIE, PkceExchangeError } from "@/lib/auth/pkceFlow";
import { safeReturnPath } from "@/lib/auth/safeReturnPath";
import { createSupabaseServerClient } from "@/lib/auth/serverClient";
import { ANONYMOUS_SESSION_COOKIE, anonymousSessionCookieOptions, createAnonymousSessionId } from "@/lib/session/anonymousSession";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();
  const next = safeReturnPath(
    requestUrl.searchParams.get("next") ?? cookieStore.get("auth_return_path")?.value,
  );
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const code = requestUrl.searchParams.get("code");
  if (!code) {
    reportAuthFailure("provider", requestUrl.searchParams.get("error"));
    return authFailure(response, requestUrl, next, "provider");
  }
  const verifier = cookieStore.get(KAKAO_PKCE_VERIFIER_COOKIE)?.value;
  if (!verifier) {
    reportAuthFailure("exchange", "missing_verifier");
    return authFailure(response, requestUrl, next, "exchange");
  }
  const { url, anonKey } = readSupabaseAuthEnvironment({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  });
  let exchanged;
  try {
    exchanged = await exchangePkceCode({ url, anonKey, code, verifier });
  } catch (error) {
    reportAuthFailure("exchange", error instanceof PkceExchangeError ? error.code : "request_failed");
    return authFailure(response, requestUrl, next, "exchange");
  }
  const supabase = await createSupabaseServerClient(response);
  const { data, error } = await supabase.auth.setSession({
    access_token: exchanged.accessToken,
    refresh_token: exchanged.refreshToken,
  });
  if (error || !data.user || data.user.id !== exchanged.userId) {
    reportAuthFailure("account");
    return authFailure(response, requestUrl, next, "account");
  }
  let anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
  if (!anonymousSessionId) {
    anonymousSessionId = createAnonymousSessionId();
    cookieStore.set(ANONYMOUS_SESSION_COOKIE, anonymousSessionId, anonymousSessionCookieOptions());
    response.cookies.set(ANONYMOUS_SESSION_COOKIE, anonymousSessionId, anonymousSessionCookieOptions());
  }
  try {
    await getAccountRepository().claimSession(anonymousSessionId, exchanged.userId);
  } catch (error) {
    reportAuthFailure("session", error instanceof Error ? error.name : undefined);
    return authFailure(response, requestUrl, next, "session");
  }
  response.cookies.delete(KAKAO_PKCE_VERIFIER_COOKIE);
  response.cookies.delete("auth_return_path");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function reportAuthFailure(reason: "provider" | "exchange" | "account" | "session", code?: string | null) {
  const safeCode = code && /^[A-Za-z0-9_-]{1,80}$/.test(code) ? code : undefined;
  console.error("[kakao-auth] callback failed", { reason, ...(safeCode ? { code: safeCode } : {}) });
}

function authFailure(response: NextResponse, requestUrl: URL, next: string, reason: "provider" | "exchange" | "account" | "session") {
  const returnUrl = new URL(next, requestUrl.origin);
  returnUrl.searchParams.set("auth", "failed");
  returnUrl.searchParams.set("reason", reason);
  response.headers.set("location", returnUrl.toString());
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
