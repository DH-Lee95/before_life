import { NextResponse } from "next/server";
import { readSupabaseAuthEnvironment } from "@/lib/auth/authEnvironment";
import { createPkcePair, KAKAO_PKCE_VERIFIER_COOKIE } from "@/lib/auth/pkceFlow";
import { safeReturnPath } from "@/lib/auth/safeReturnPath";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = safeReturnPath(requestUrl.searchParams.get("next"));
  const callbackUrl = new URL("/auth/callback", requestUrl.origin);
  const { url } = readSupabaseAuthEnvironment({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  });
  const { verifier, challenge } = createPkcePair();
  const authorizeUrl = new URL("/auth/v1/authorize", url);
  authorizeUrl.searchParams.set("provider", "kakao");
  authorizeUrl.searchParams.set("redirect_to", callbackUrl.toString());
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "s256");
  authorizeUrl.searchParams.set("prompt", "login");
  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(KAKAO_PKCE_VERIFIER_COOKIE, verifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  response.cookies.set("auth_return_path", next, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
