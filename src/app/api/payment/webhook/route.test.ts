import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const getIntentByOrderId = vi.hoisted(() => vi.fn());
const approveIntent = vi.hoisted(() => vi.fn());
const cancelIntent = vi.hoisted(() => vi.fn());
const getTossPaymentByOrderId = vi.hoisted(() => vi.fn());

vi.mock("@/lib/payment/paymentProvider", () => ({
  getPaymentRepository: () => ({ getIntentByOrderId, approveIntent, cancelIntent }),
}));
vi.mock("@/lib/payment/tossPaymentProvider", () => ({ getTossPaymentByOrderId }));

describe("POST /api/payment/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_TOSS_CLIENT_KEY", "live_gck_client");
    vi.stubEnv("TOSS_SECRET_KEY", "live_gsk_secret");
    getIntentByOrderId.mockResolvedValue({
      id: "intent-id", orderId: "soul_order", amountKrw: 2490, status: "pending",
    });
    getTossPaymentByOrderId.mockResolvedValue({
      paymentKey: "payment-key", orderId: "soul_order", totalAmount: 2490, status: "DONE",
    });
    approveIntent.mockResolvedValue({ intent: { status: "approved" }, balance: 3 });
    cancelIntent.mockResolvedValue({ intent: { status: "canceled" }, balance: 0 });
  });

  it("reverses souls only after Toss verifies a full cancellation", async () => {
    getIntentByOrderId.mockResolvedValue({
      id: "intent-id", orderId: "soul_order", amountKrw: 2490, status: "approved", providerPaymentKey: "payment-key",
    });
    getTossPaymentByOrderId.mockResolvedValue({
      paymentKey: "payment-key", orderId: "soul_order", totalAmount: 2490,
      balanceAmount: 0, status: "CANCELED",
    });

    const response = await POST(webhook({
      eventType: "PAYMENT_STATUS_CHANGED", data: { orderId: "soul_order", status: "CANCELED" },
    }));

    expect(response.status).toBe(200);
    expect(cancelIntent).toHaveBeenCalledWith(expect.objectContaining({
      intentId: "intent-id", providerPaymentKey: "payment-key",
    }));
  });

  it("does not automatically reconcile a partial cancellation", async () => {
    const response = await POST(webhook({
      eventType: "PAYMENT_STATUS_CHANGED", data: { orderId: "soul_order", status: "PARTIAL_CANCELED" },
    }));

    expect(response.status).toBe(409);
    expect(cancelIntent).not.toHaveBeenCalled();
  });

  it("re-fetches a completed payment from Toss before crediting it", async () => {
    const response = await POST(webhook({
      eventType: "PAYMENT_STATUS_CHANGED",
      data: { orderId: "soul_order", paymentKey: "untrusted-key", status: "DONE", totalAmount: 1 },
    }));

    expect(response.status).toBe(200);
    expect(getTossPaymentByOrderId).toHaveBeenCalledWith(expect.objectContaining({
      orderId: "soul_order", secretKey: "live_gsk_secret",
    }));
    expect(approveIntent).toHaveBeenCalledWith(expect.objectContaining({
      intentId: "intent-id", providerPaymentKey: "payment-key",
    }));
  });

  it("does not credit when Toss reports a mismatched amount", async () => {
    getTossPaymentByOrderId.mockResolvedValue({
      paymentKey: "payment-key", orderId: "soul_order", totalAmount: 1, status: "DONE",
    });

    const response = await POST(webhook({
      eventType: "PAYMENT_STATUS_CHANGED", data: { orderId: "soul_order", status: "DONE" },
    }));

    expect(response.status).toBe(409);
    expect(approveIntent).not.toHaveBeenCalled();
  });

  it("acknowledges unrelated or unfinished payment events without crediting", async () => {
    const response = await POST(webhook({
      eventType: "PAYMENT_STATUS_CHANGED", data: { orderId: "soul_order", status: "IN_PROGRESS" },
    }));

    expect(response.status).toBe(200);
    expect(getTossPaymentByOrderId).not.toHaveBeenCalled();
    expect(approveIntent).not.toHaveBeenCalled();
  });
});

function webhook(body: object) {
  return new Request("https://service.example/api/payment/webhook", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}
