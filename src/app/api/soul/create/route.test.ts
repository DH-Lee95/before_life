import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthenticatedUser = vi.hoisted(() => vi.fn());
const claimSession = vi.hoisted(() => vi.fn());
const upsertProfile = vi.hoisted(() => vi.fn());
const upsertContent = vi.hoisted(() => vi.fn());
const consumeApiRateLimit = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: () => ({ value: "anon_current" }),
    set: vi.fn(),
  })),
}));
vi.mock("@/lib/auth/serverClient", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/auth/accountRepository", () => ({
  getAccountRepository: () => ({ claimSession }),
}));
vi.mock("@/lib/repository/repositoryProvider", () => ({
  getSoulRepository: () => ({ upsertProfile, upsertContent }),
}));
vi.mock("@/lib/soul/validateSoulInput", () => ({ validateSoulInput: () => ({ normalized: true }) }));
vi.mock("@/lib/soul/createSoulProfile", () => ({
  createSoulProfile: () => ({ soulHash: "hash", displaySoulId: "SOUL-TEST", discoveryPercent: 17 }),
}));
vi.mock("@/lib/content/createFreeResult", () => ({ createFreeResult: () => ({ summary: "free" }) }));
vi.mock("@/lib/security/apiRateLimit", () => ({ consumeApiRateLimit }));
vi.mock("@/lib/session/resultToken", () => ({
  createResultToken: () => "result-token",
  hashResultToken: () => "token-hash",
}));

import { POST } from "./route";

describe("POST /api/soul/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    upsertProfile.mockResolvedValue({
      id: "sp_test",
      soulHash: "hash",
      displaySoulId: "SOUL-TEST",
      discoveryPercent: 17,
    });
    upsertContent.mockResolvedValue({ content: { summary: "free" } });
    claimSession.mockResolvedValue({ claimed: true });
    consumeApiRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
  });

  it("rejects excessive free result creation before writing data", async () => {
    consumeApiRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 120 });

    const response = await POST(new Request("http://localhost/api/soul/create", {
      method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.7" },
      body: JSON.stringify({ answers: [] }),
    }));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("120");
    expect(upsertProfile).not.toHaveBeenCalled();
  });

  it("links a newly created result to an already authenticated account", async () => {
    const response = await POST(new Request("http://localhost/api/soul/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: [] }),
    }));

    expect(response.status).toBe(200);
    expect(claimSession).toHaveBeenCalledWith("anon_current", "user-id");
    expect(upsertContent.mock.invocationCallOrder[0]).toBeLessThan(claimSession.mock.invocationCallOrder[0]);
  });

  it("keeps anonymous result creation independent from account linking", async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const response = await POST(new Request("http://localhost/api/soul/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: [] }),
    }));

    expect(response.status).toBe(200);
    expect(claimSession).not.toHaveBeenCalled();
  });

  it("reports an account-linking outage as a server failure instead of invalid input", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    claimSession.mockRejectedValue(new Error("temporary account service failure"));

    const response = await POST(new Request("http://localhost/api/soul/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: [] }),
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      message: "결과를 계정에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.",
    });
  });
});
