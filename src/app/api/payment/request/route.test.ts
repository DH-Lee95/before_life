import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const repository = vi.hoisted(() => ({ getIntent: vi.fn(), attachProviderRequest: vi.fn() }));
const requestPayAppPayment = vi.hoisted(() => vi.fn());
const getAuthenticatedUser = vi.hoisted(() => vi.fn());
const isSessionOwnedByUser = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ get: () => ({ value: "anon_owner" }) })) }));
vi.mock("@/lib/payment/paymentProvider", () => ({ getPaymentRepository: () => repository }));
vi.mock("@/lib/payment/payAppPaymentProvider", () => ({ requestPayAppPayment }));
vi.mock("@/lib/auth/serverClient", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/auth/accountRepository", () => ({ getAccountRepository: () => ({ isSessionOwnedByUser }) }));

describe("POST /api/payment/request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PAYAPP_USER_ID", "seller");
    vi.stubEnv("PAYAPP_LINK_KEY", "link-key");
    vi.stubEnv("PAYAPP_LINK_VALUE", "link-value");
    vi.stubEnv("PAYAPP_MODE", "test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    isSessionOwnedByUser.mockResolvedValue(true);
    repository.getIntent.mockResolvedValue({
      id: "intent-id", anonymousSessionId: "anon_owner", soulProfileId: "sp_test",
      orderId: "soul_order", amountKrw: 1000, souls: 1, status: "pending",
      expiresAt: "2099-01-01T00:00:00.000Z",
    });
    requestPayAppPayment.mockResolvedValue({ providerPaymentKey: "2000", checkoutUrl: "https://payapp.kr/pay/2000" });
    repository.attachProviderRequest.mockImplementation(async (input) => ({ ...input }));
  });

  it("creates and stores a PayApp checkout for an owned pending order", async () => {
    const response = await POST(makeRequest({ orderId: "soul_order", phone: "010-1234-5678" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ checkoutUrl: "https://payapp.kr/pay/2000" });
    expect(requestPayAppPayment).toHaveBeenCalledWith(expect.objectContaining({
      orderId: "soul_order", buyerPhone: "01012345678", amountKrw: 1000,
    }));
    expect(repository.attachProviderRequest).toHaveBeenCalledWith(expect.objectContaining({
      intentId: "intent-id", providerPaymentKey: "2000",
    }));
  });

  it("rejects an invalid phone number before contacting PayApp", async () => {
    const response = await POST(makeRequest({ orderId: "soul_order", phone: "123" }));
    expect(response.status).toBe(400);
    expect(requestPayAppPayment).not.toHaveBeenCalled();
  });

  it("reuses the checkout already attached to the order", async () => {
    repository.getIntent.mockResolvedValue({
      id: "intent-id", orderId: "soul_order", status: "pending",
      providerPaymentKey: "2000", providerCheckoutUrl: "https://payapp.kr/pay/2000",
      expiresAt: "2099-01-01T00:00:00.000Z",
    });
    const response = await POST(makeRequest({ orderId: "soul_order", phone: "01012345678" }));
    await expect(response.json()).resolves.toEqual({ checkoutUrl: "https://payapp.kr/pay/2000" });
    expect(requestPayAppPayment).not.toHaveBeenCalled();
  });
});

function makeRequest(body: object) {
  return new Request("http://localhost/api/payment/request", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}
