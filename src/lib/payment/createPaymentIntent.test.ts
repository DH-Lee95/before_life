import { describe, expect, it } from "vitest";

import { createPaymentIntent } from "./createPaymentIntent";

describe("createPaymentIntent", () => {
  it("uses the server-side soul pack price and creates a unique provider-safe order id", () => {
    const intent = createPaymentIntent({
      anonymousSessionId: "anon_test",
      soulProfileId: "sp_test",
      packId: "soul_3",
      id: "intent-id",
      randomId: "550e8400-e29b-41d4-a716-446655440000",
      now: new Date("2026-08-28T09:00:00.000Z"),
    });

    expect(intent).toMatchObject({
      id: "intent-id",
      orderId: "soul_550e8400-e29b-41d4-a716-446655440000",
      packId: "soul_3",
      amountKrw: 2490,
      souls: 3,
      status: "pending",
    });
    expect(intent.expiresAt).toBe("2026-08-28T09:30:00.000Z");
  });

  it("rejects an unknown pack instead of trusting client pricing", () => {
    expect(() => createPaymentIntent({
      anonymousSessionId: "anon_test",
      soulProfileId: "sp_test",
      packId: "soul_999",
      id: "intent-id",
      randomId: "random-id",
      now: new Date(),
    })).toThrow("invalid soul pack");
  });
});
