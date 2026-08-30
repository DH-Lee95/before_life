import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAccountRepository } from "@/lib/auth/accountRepository";
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
  const supabase = await createSupabaseServerClient(response);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    reportAuthFailure("exchange", error.code);
    return authFailure(response, requestUrl, next, "exchange");
  }
  const user = data.user ?? data.session?.user;
  if (!user) {
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
    await getAccountRepository().claimSession(anonymousSessionId, user.id);
  } catch (error) {
    reportAuthFailure("session", error instanceof Error ? error.name : undefined);
    return authFailure(response, requestUrl, next, "session");
  }
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
