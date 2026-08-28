import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthenticatedUser = vi.hoisted(() => vi.fn());
const getBalance = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/serverClient", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/auth/accountRepository", () => ({ getAccountRepository: () => ({ getBalance }) }));

import { GET } from "./route";

describe("GET /api/account", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a Kakao user's balance", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-id", user_metadata: { nickname: "서랍지기" } });
    getBalance.mockResolvedValue(4);
    const response = await GET();
    await expect(response.json()).resolves.toEqual({ authenticated: true, nickname: "서랍지기", balance: 4 });
  });

  it("does not treat an anonymous visitor as an account", async () => {
    getAuthenticatedUser.mockResolvedValue(null);
    const response = await GET();
    await expect(response.json()).resolves.toEqual({ authenticated: false, balance: 0 });
  });
});
