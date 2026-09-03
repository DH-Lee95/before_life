import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const getIntentByOrderId = vi.hoisted(() => vi.fn());
const approveIntent = vi.hoisted(() => vi.fn());
const cancelIntent = vi.hoisted(() => vi.fn());

vi.mock("@/lib/payment/paymentProvider", () => ({
  getPaymentRepository: () => ({ getIntentByOrderId, approveIntent, cancelIntent }),
}));

describe("POST /api/payment/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PAYAPP_USER_ID", "seller");
    vi.stubEnv("PAYAPP_LINK_KEY", "link-key");
    vi.stubEnv("PAYAPP_LINK_VALUE", "link-value");
    vi.stubEnv("PAYAPP_MODE", "live");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://before-life.co.kr");
    getIntentByOrderId.mockResolvedValue({
      id: "intent-id", soulProfileId: "sp_test", orderId: "soul_order", amountKrw: 2490,
      status: "pending", providerPaymentKey: "2000",
    });
    approveIntent.mockResolvedValue({ intent: { status: "approved" }, balance: 3 });
    cancelIntent.mockResolvedValue({ intent: { status: "canceled" }, balance: 0 });
  });

  it("credits souls after a verified PayApp completion callback", async () => {
    const response = await POST(webhook({ pay_state: "4", card_num: "do-not-store" }));
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("SUCCESS");
    expect(approveIntent).toHaveBeenCalledWith({
      intentId: "intent-id", providerPaymentKey: "2000",
      rawPayload: expect.not.objectContaining({ card_num: expect.anything() }),
    });
  });

  it("rejects a callback with an invalid verification value", async () => {
    const response = await POST(webhook({ pay_state: "4", linkval: "wrong" }));
    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe("FAIL");
    expect(approveIntent).not.toHaveBeenCalled();
  });

  it("reverses souls after a verified full cancellation", async () => {
    getIntentByOrderId.mockResolvedValue({
      id: "intent-id", soulProfileId: "sp_test", orderId: "soul_order", amountKrw: 2490,
      status: "approved", providerPaymentKey: "2000",
    });
    const response = await POST(webhook({ pay_state: "9" }));
    expect(response.status).toBe(200);
    expect(cancelIntent).toHaveBeenCalledWith(expect.objectContaining({ intentId: "intent-id" }));
  });

  it("acknowledges partial cancellations for manual reconciliation without changing souls", async () => {
    const response = await POST(webhook({
      pay_state: "70", price: "1000", mul_no: "2001", orig_price: "2490", orig_mul_no: "2000",
    }));
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("SUCCESS");
    expect(cancelIntent).not.toHaveBeenCalled();
  });
});

function webhook(overrides: Record<string, string>) {
  const body = new URLSearchParams({
    userid: "seller", linkkey: "link-key", linkval: "link-value", mul_no: "2000",
    var1: "soul_order", var2: "sp_test", price: "2490", pay_state: "4", ...overrides,
  });
  return new Request("https://before-life.co.kr/api/payment/webhook", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body,
  });
}
