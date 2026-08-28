import { describe, expect, it, vi } from "vitest";

import { confirmTossPayment } from "./tossPaymentProvider";

describe("confirmTossPayment", () => {
  it("confirms with server credentials and a stable idempotency key", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      paymentKey: "payment-key",
      orderId: "soul_order-id",
      totalAmount: 3990,
      status: "DONE",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const payment = await confirmTossPayment({
      secretKey: "test_secret",
      paymentKey: "payment-key",
      orderId: "soul_order-id",
      amountKrw: 3990,
      fetchImpl,
    });

    expect(payment.status).toBe("DONE");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.tosspayments.com/v1/payments/confirm",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from("test_secret:").toString("base64")}`,
          "Idempotency-Key": "soul_order-id",
        }),
        body: JSON.stringify({ paymentKey: "payment-key", orderId: "soul_order-id", amount: 3990 }),
      }),
    );
  });

  it("rejects a mismatched provider response", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      paymentKey: "payment-key",
      orderId: "different-order",
      totalAmount: 1,
      status: "DONE",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await expect(confirmTossPayment({
      secretKey: "test_secret",
      paymentKey: "payment-key",
      orderId: "soul_order-id",
      amountKrw: 3990,
      fetchImpl,
    })).rejects.toThrow("payment verification failed");
  });
});
