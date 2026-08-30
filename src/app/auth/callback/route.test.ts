import { describe, expect, it, vi } from "vitest";

const cookieSet = vi.hoisted(() => vi.fn());
const claimSession = vi.hoisted(() => vi.fn(async () => ({ claimed: true })));
const cookieGet = vi.hoisted(() => vi.fn((name: string) => name === "anonymous_session_id" ? { value: "anon_owner" } : undefined));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ get: cookieGet, getAll: () => [], set: cookieSet })) }));
vi.mock("@/lib/auth/serverClient", () => ({
  createSupabaseServerClient: async (response?: { cookies: { set: (name: string, value: string, options: { path: string }) => unknown }; headers: { set: (name: string, value: string) => unknown } }) => {
    response?.cookies.set("sb-project-auth-token", "session", { path: "/" });
    response?.headers.set("Cache-Control", "private, no-store");
    return ({ auth: {
    exchangeCodeForSession: vi.fn(async () => ({ error: null })),
    getUser: vi.fn(async () => ({ data: { user: { id: "user-id" } } })),
  } });
  },
}));
vi.mock("@/lib/auth/accountRepository", () => ({ getAccountRepository: () => ({ claimSession }) }));

import { GET } from "./route";

describe("Kakao callback route", () => {
  it("claims the existing anonymous data and returns to the requested page", async () => {
    const response = await GET(new Request("https://before-life.vercel.app/auth/callback?code=oauth-code&next=%2Fresult%2Fsp_test"));
    expect(claimSession).toHaveBeenCalledWith("anon_owner", "user-id");
    expect(response.headers.get("location")).toBe("https://before-life.vercel.app/result/sp_test");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("set-cookie")).toContain("sb-project-auth-token=session");
  });

  it("returns to the stored result when the OAuth provider drops the next query", async () => {
    cookieGet.mockImplementation((name: string) => {
      if (name === "anonymous_session_id") return { value: "anon_owner" };
      if (name === "auth_return_path") return { value: "/result/sp_test" };
      return undefined;
    });

    const response = await GET(new Request("https://before-life.vercel.app/auth/callback?code=oauth-code"));

    expect(response.headers.get("location")).toBe("https://before-life.vercel.app/result/sp_test");
    expect(response.headers.get("set-cookie")).toContain("auth_return_path=;");
  });

  it("keeps a failed login on the stored result instead of dropping to the landing page", async () => {
    cookieGet.mockImplementation((name: string) => name === "auth_return_path" ? { value: "/result/sp_test" } : undefined);

    const response = await GET(new Request("https://before-life.vercel.app/auth/callback?error=access_denied"));

    expect(response.headers.get("location")).toBe("https://before-life.vercel.app/result/sp_test?auth=failed&reason=provider");
  });
});
