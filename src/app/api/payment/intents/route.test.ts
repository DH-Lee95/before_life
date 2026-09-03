import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

const paymentRepository = vi.hoisted(() => ({
  createIntent: vi.fn(async (intent) => intent),
  getIntent: vi.fn(),
}));
const getResult = vi.hoisted(() => vi.fn());
const getAuthenticatedUser = vi.hoisted(() => vi.fn());
const isSessionOwnedByUser = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "anon_owner" }) })),
}));
vi.mock("@/lib/payment/paymentProvider", () => ({ getPaymentRepository: () => paymentRepository }));
vi.mock("@/lib/repository/repositoryProvider", () => ({ getSoulRepository: () => ({ getResult }) }));
vi.mock("@/lib/auth/serverClient", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/auth/accountRepository", () => ({ getAccountRepository: () => ({ isSessionOwnedByUser }) }));

describe("/api/payment/intents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PAYAPP_USER_ID", "seller");
    vi.stubEnv("PAYAPP_LINK_KEY", "link-key");
    vi.stubEnv("PAYAPP_LINK_VALUE", "link-value");
    vi.stubEnv("PAYAPP_MODE", "test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    getResult.mockResolvedValue({ profile: { id: "sp_test" } });
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    isSessionOwnedByUser.mockResolvedValue(true);
  });

  it("requires a Kakao-authenticated account before creating a paid order", async () => {
    getAuthenticatedUser.mockResolvedValue(null);
    const response = await POST(new Request("http://localhost/api/payment/intents", {
      method: "POST",
      body: JSON.stringify({ profileId: "sp_test", packId: "soul_1" }),
    }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ code: "AUTH_REQUIRED" });
    expect(paymentRepository.createIntent).not.toHaveBeenCalled();
  });

  it("creates an owner-bound intent with the configured pack amount", async () => {
    const response = await POST(new Request("http://localhost/api/payment/intents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: "sp_test", packId: "soul_3", amount: 1 }),
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({ profileId: "sp_test", packId: "soul_3", amountKrw: 2490, souls: 3 });
    expect(paymentRepository.createIntent).toHaveBeenCalledWith(expect.objectContaining({ amountKrw: 2490 }));
  });

  it("does not open live payments before business disclosures are configured", async () => {
    vi.stubEnv("PAYAPP_MODE", "live");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://before-life.co.kr");

    const response = await POST(new Request("http://localhost/api/payment/intents", {
      method: "POST", body: JSON.stringify({ profileId: "sp_test", packId: "soul_1" }),
    }));

    expect(response.status).toBe(503);
    expect(paymentRepository.createIntent).not.toHaveBeenCalled();
  });

  it("does not create an intent for a result the session cannot access", async () => {
    getResult.mockResolvedValue(null);
    const response = await POST(new Request("http://localhost/api/payment/intents", {
      method: "POST",
      body: JSON.stringify({ profileId: "sp_other", packId: "soul_1" }),
    }));

    expect(response.status).toBe(404);
    expect(paymentRepository.createIntent).not.toHaveBeenCalled();
  });

  it("returns an order only to its owning session", async () => {
    paymentRepository.getIntent.mockResolvedValue({
      orderId: "soul_order", soulProfileId: "sp_test", packId: "soul_1",
      amountKrw: 1000, souls: 1, status: "pending",
    });
    const response = await GET(new Request("http://localhost/api/payment/intents?orderId=soul_order"));

    expect(response.status).toBe(200);
    expect(paymentRepository.getIntent).toHaveBeenCalledWith("soul_order", "anon_owner");
  });
});
