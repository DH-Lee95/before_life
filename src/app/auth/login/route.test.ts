import { describe, expect, it, vi } from "vitest";

const signInWithOAuth = vi.hoisted(() => vi.fn(async () => ({ data: { url: "https://kauth.kakao.com/oauth" }, error: null })));
vi.mock("@/lib/auth/serverClient", () => ({ createSupabaseServerClient: async () => ({ auth: { signInWithOAuth } }) }));

import { GET } from "./route";

describe("Kakao login route", () => {
  it("starts Kakao OAuth with a fixed allow-listed callback and stores the return path", async () => {
    const response = await GET(new Request("https://before-life.vercel.app/auth/login?next=%2Fresult%2Fsp_test"));
    expect(response.headers.get("location")).toBe("https://kauth.kakao.com/oauth");
    expect(response.headers.get("set-cookie")).toContain("auth_return_path=%2Fresult%2Fsp_test");
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "kakao",
      options: { redirectTo: "https://before-life.vercel.app/auth/callback" },
    });
  });
});
