import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const getIntent = vi.hoisted(() => vi.fn());
const approveIntent = vi.hoisted(() => vi.fn());
const confirmTossPayment = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "anon_owner" }) })),
}));
vi.mock("@/lib/payment/paymentProvider", () => ({
  getPaymentRepository: () => ({ getIntent, approveIntent }),
}));
vi.mock("@/lib/payment/tossPaymentProvider", () => ({ confirmTossPayment }));

describe("POST /api/payment/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_TOSS_CLIENT_KEY", "test_gck_client");
    vi.stubEnv("TOSS_SECRET_KEY", "test_secret");
    getIntent.mockResolvedValue({
      id: "intent-id", anonymousSessionId: "anon_owner", soulProfileId: "sp_test",
      orderId: "soul_order", amountKrw: 2490, souls: 3, status: "pending",
    });
    confirmTossPayment.mockResolvedValue({ paymentKey: "payment-key", orderId: "soul_order", totalAmount: 2490, status: "DONE" });
    approveIntent.mockResolvedValue({ intent: { soulProfileId: "sp_test", souls: 3, status: "approved" }, balance: 3 });
  });

  it("verifies the stored amount, confirms with Toss, and credits through the repository", async () => {
    const response = await POST(request({ paymentKey: "payment-key", orderId: "soul_order", amount: 2490 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(confirmTossPayment).toHaveBeenCalledWith(expect.objectContaining({ amountKrw: 2490, secretKey: "test_secret" }));
    expect(approveIntent).toHaveBeenCalledWith(expect.objectContaining({ intentId: "intent-id", providerPaymentKey: "payment-key" }));
    expect(body).toEqual({ profileId: "sp_test", purchasedSouls: 3, balance: 3 });
  });

  it("rejects a client amount that differs from the stored intent before calling Toss", async () => {
    const response = await POST(request({ paymentKey: "payment-key", orderId: "soul_order", amount: 1 }));

    expect(response.status).toBe(400);
    expect(confirmTossPayment).not.toHaveBeenCalled();
  });
});

function request(body: object) {
  return new Request("http://localhost/api/payment/confirm", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}
