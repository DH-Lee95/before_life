import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAccountRepository } from "@/lib/auth/accountRepository";
import { safeReturnPath } from "@/lib/auth/safeReturnPath";
import { createSupabaseServerClient } from "@/lib/auth/serverClient";
import { ANONYMOUS_SESSION_COOKIE, anonymousSessionCookieOptions, createAnonymousSessionId } from "@/lib/session/anonymousSession";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/?auth=failed", requestUrl.origin));
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/?auth=failed", requestUrl.origin));
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL("/?auth=failed", requestUrl.origin));
  const cookieStore = await cookies();
  const next = safeReturnPath(
    requestUrl.searchParams.get("next") ?? cookieStore.get("auth_return_path")?.value,
  );
  let anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
  if (!anonymousSessionId) {
    anonymousSessionId = createAnonymousSessionId();
    cookieStore.set(ANONYMOUS_SESSION_COOKIE, anonymousSessionId, anonymousSessionCookieOptions());
  }
  await getAccountRepository().claimSession(anonymousSessionId, data.user.id);
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  response.cookies.delete("auth_return_path");
  return response;
}
