import { describe, expect, it, vi } from "vitest";

const createPkcePair = vi.hoisted(() => vi.fn(() => ({
  verifier: "test-verifier",
  challenge: "test-challenge",
})));

vi.mock("@/lib/auth/authEnvironment", () => ({
  readSupabaseAuthEnvironment: () => ({ url: "https://project.supabase.co", anonKey: "anon-key" }),
}));
vi.mock("@/lib/auth/pkceFlow", () => ({ createPkcePair, KAKAO_PKCE_VERIFIER_COOKIE: "kakao_pkce_verifier" }));

import { GET } from "./route";

describe("Kakao login route", () => {
  it("starts Kakao OAuth with one explicit PKCE verifier and a fixed callback", async () => {
    const response = await GET(new Request("https://before-life.vercel.app/auth/login?next=%2Fresult%2Fsp_test"));
    const location = new URL(response.headers.get("location") ?? "");

    expect(location.origin + location.pathname).toBe("https://project.supabase.co/auth/v1/authorize");
    expect(Object.fromEntries(location.searchParams)).toEqual({
      provider: "kakao",
      redirect_to: "https://before-life.vercel.app/auth/callback",
      code_challenge: "test-challenge",
      code_challenge_method: "s256",
      prompt: "login",
    });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("set-cookie")).toContain("kakao_pkce_verifier=test-verifier");
    expect(response.headers.get("set-cookie")).toContain("auth_return_path=%2Fresult%2Fsp_test");
  });
});
