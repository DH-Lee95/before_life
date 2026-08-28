import { describe, expect, it, vi } from "vitest";

const cookieSet = vi.hoisted(() => vi.fn());
const claimSession = vi.hoisted(() => vi.fn(async () => ({ claimed: true })));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ get: () => ({ value: "anon_owner" }), getAll: () => [], set: cookieSet })) }));
vi.mock("@/lib/auth/serverClient", () => ({
  createSupabaseServerClient: async () => ({ auth: {
    exchangeCodeForSession: vi.fn(async () => ({ error: null })),
    getUser: vi.fn(async () => ({ data: { user: { id: "user-id" } } })),
  } }),
}));
vi.mock("@/lib/auth/accountRepository", () => ({ getAccountRepository: () => ({ claimSession }) }));

import { GET } from "./route";

describe("Kakao callback route", () => {
  it("claims the existing anonymous data and returns to the requested page", async () => {
    const response = await GET(new Request("https://before-life.vercel.app/auth/callback?code=oauth-code&next=%2Fresult%2Fsp_test"));
    expect(claimSession).toHaveBeenCalledWith("anon_owner", "user-id");
    expect(response.headers.get("location")).toBe("https://before-life.vercel.app/result/sp_test");
  });
});
