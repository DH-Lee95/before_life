import { describe, expect, it } from "vitest";

import type { PaymentIntent } from "./payment";

describe("payment types", () => {
  it("models a server-priced pending intent", () => {
    const intent = {
      id: "intent-id",
      anonymousSessionId: "anon_owner",
      soulProfileId: "sp_test",
      orderId: "soul_order",
      packId: "soul_1",
      amountKrw: 1000,
      souls: 1,
      status: "pending",
      createdAt: "2026-08-28T09:00:00.000Z",
      expiresAt: "2026-08-28T09:30:00.000Z",
    } satisfies PaymentIntent;

    expect(intent.status).toBe("pending");
  });
});
