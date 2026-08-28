import { NextResponse } from "next/server";
import { safeReturnPath } from "@/lib/auth/safeReturnPath";
import { createSupabaseServerClient } from "@/lib/auth/serverClient";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = safeReturnPath(requestUrl.searchParams.get("next"));
  const callbackUrl = new URL("/auth/callback", requestUrl.origin);
  callbackUrl.searchParams.set("next", next);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "kakao", options: { redirectTo: callbackUrl.toString() } });
  if (error || !data.url) return NextResponse.redirect(new URL("/?auth=failed", requestUrl.origin));
  return NextResponse.redirect(data.url);
}
