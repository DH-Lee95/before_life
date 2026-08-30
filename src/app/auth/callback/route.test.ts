import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieSet = vi.hoisted(() => vi.fn());
const claimSession = vi.hoisted(() => vi.fn(async () => ({ claimed: true })));
const cookieGet = vi.hoisted(() => vi.fn((name: string) => {
  if (name === "anonymous_session_id") return { value: "anon_owner" };
  if (name === "kakao_pkce_verifier") return { value: "stored-verifier" };
  return undefined;
}));
const exchangePkceCode = vi.hoisted(() => vi.fn(async () => ({
  accessToken: "access-token",
  refreshToken: "refresh-token",
  userId: "user-id",
})));
const setSession = vi.hoisted(() => vi.fn(async () => ({
  data: { user: { id: "user-id" } },
  error: null,
})));

vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ get: cookieGet, getAll: () => [], set: cookieSet })) }));
vi.mock("@/lib/auth/authEnvironment", () => ({
  readSupabaseAuthEnvironment: () => ({ url: "https://project.supabase.co", anonKey: "anon-key" }),
}));
vi.mock("@/lib/auth/pkceFlow", () => ({
  exchangePkceCode,
  KAKAO_PKCE_VERIFIER_COOKIE: "kakao_pkce_verifier",
  PkceExchangeError: class extends Error {},
}));
vi.mock("@/lib/auth/serverClient", () => ({
  createSupabaseServerClient: async (response?: { cookies: { set: (name: string, value: string, options: { path: string }) => unknown } }) => {
    response?.cookies.set("sb-project-auth-token", "session", { path: "/" });
    return { auth: { setSession } };
  },
}));
vi.mock("@/lib/auth/accountRepository", () => ({ getAccountRepository: () => ({ claimSession }) }));

import { GET } from "./route";

describe("Kakao callback route", () => {
  beforeEach(() => {
    cookieGet.mockImplementation((name: string) => {
      if (name === "anonymous_session_id") return { value: "anon_owner" };
      if (name === "kakao_pkce_verifier") return { value: "stored-verifier" };
      return undefined;
    });
    exchangePkceCode.mockResolvedValue({ accessToken: "access-token", refreshToken: "refresh-token", userId: "user-id" });
    setSession.mockResolvedValue({ data: { user: { id: "user-id" } }, error: null });
    exchangePkceCode.mockClear();
    setSession.mockClear();
    claimSession.mockClear();
  });

  it("exchanges the code with the stored verifier, persists the session, and claims the result", async () => {
    const response = await GET(new Request("https://before-life.vercel.app/auth/callback?code=oauth-code&next=%2Fresult%2Fsp_test"));

    expect(exchangePkceCode).toHaveBeenCalledWith(expect.objectContaining({
      code: "oauth-code",
      verifier: "stored-verifier",
    }));
    expect(setSession).toHaveBeenCalledWith({ access_token: "access-token", refresh_token: "refresh-token" });
    expect(claimSession).toHaveBeenCalledWith("anon_owner", "user-id");
    expect(response.headers.get("location")).toBe("https://before-life.vercel.app/result/sp_test");
    expect(response.headers.get("set-cookie")).toContain("sb-project-auth-token=session");
    expect(response.headers.get("set-cookie")).toContain("kakao_pkce_verifier=;");
  });

  it("returns to the stored result when Kakao drops the next query", async () => {
    cookieGet.mockImplementation((name: string) => {
      if (name === "anonymous_session_id") return { value: "anon_owner" };
      if (name === "kakao_pkce_verifier") return { value: "stored-verifier" };
      if (name === "auth_return_path") return { value: "/result/sp_test" };
      return undefined;
    });

    const response = await GET(new Request("https://before-life.vercel.app/auth/callback?code=oauth-code"));

    expect(response.headers.get("location")).toBe("https://before-life.vercel.app/result/sp_test");
  });

  it("shows a provider failure on the stored result", async () => {
    cookieGet.mockImplementation((name: string) => name === "auth_return_path" ? { value: "/result/sp_test" } : undefined);

    const response = await GET(new Request("https://before-life.vercel.app/auth/callback?error=access_denied"));

    expect(response.headers.get("location")).toBe("https://before-life.vercel.app/result/sp_test?auth=failed&reason=provider");
  });

  it("rejects a callback when its dedicated verifier cookie is missing", async () => {
    cookieGet.mockImplementation((name: string) => name === "anonymous_session_id" ? { value: "anon_owner" } : undefined);

    const response = await GET(new Request("https://before-life.vercel.app/auth/callback?code=oauth-code&next=%2Fresult%2Fsp_test"));

    expect(exchangePkceCode).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://before-life.vercel.app/result/sp_test?auth=failed&reason=exchange");
  });
});
