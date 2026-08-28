import { describe, expect, it } from "vitest";

import { createPaymentIntent } from "./createPaymentIntent";
import { createMemoryPaymentRepository } from "./memoryPaymentRepository";

describe("memory payment repository", () => {
  it("approves an intent idempotently and credits its souls only once", async () => {
    const repository = createMemoryPaymentRepository();
    const intent = createPaymentIntent({
      anonymousSessionId: "anon_owner",
      soulProfileId: "sp_test",
      packId: "soul_5",
      id: "intent-id",
      randomId: "random-id",
      now: new Date(),
    });
    await repository.createIntent(intent);

    const first = await repository.approveIntent({
      intentId: intent.id,
      providerPaymentKey: "payment-key",
      rawPayload: { status: "DONE" },
    });
    const repeated = await repository.approveIntent({
      intentId: intent.id,
      providerPaymentKey: "payment-key",
      rawPayload: { status: "DONE" },
    });

    expect(first.balance).toBe(5);
    expect(repeated.balance).toBe(5);
    expect(repeated.intent.status).toBe("approved");
  });

  it("only returns an order to its owning anonymous session", async () => {
    const repository = createMemoryPaymentRepository();
    const intent = createPaymentIntent({
      anonymousSessionId: "anon_owner",
      soulProfileId: "sp_test",
      packId: "soul_1",
      id: "intent-id",
      randomId: "random-id",
      now: new Date(),
    });
    await repository.createIntent(intent);

    expect(await repository.getIntent(intent.orderId, "anon_owner")).toEqual(intent);
    expect(await repository.getIntent(intent.orderId, "anon_other")).toBeNull();
  });
});
