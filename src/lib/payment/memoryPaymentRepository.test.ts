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
    expect(await repository.getIntentByOrderId(intent.orderId)).toEqual(intent);
  });

  it("attaches one PayApp request to a pending intent idempotently", async () => {
    const repository = createMemoryPaymentRepository();
    const intent = createPaymentIntent({
      anonymousSessionId: "anon_owner", soulProfileId: "sp_test", packId: "soul_1",
      id: "intent-id", randomId: "random-id", now: new Date(),
    });
    await repository.createIntent(intent);

    const input = {
      intentId: intent.id,
      providerPaymentKey: "2000",
      providerCheckoutUrl: "https://payapp.kr/pay/2000",
    };
    const attached = { id: intent.id, providerPaymentKey: input.providerPaymentKey, providerCheckoutUrl: input.providerCheckoutUrl };
    await expect(repository.attachProviderRequest(input)).resolves.toMatchObject(attached);
    await expect(repository.attachProviderRequest(input)).resolves.toMatchObject(attached);
    await expect(repository.getIntentByOrderId(intent.orderId)).resolves.toMatchObject(attached);
  });

  it("reverses an approved purchase idempotently after a full refund", async () => {
    const repository = createMemoryPaymentRepository();
    const intent = createPaymentIntent({
      anonymousSessionId: "anon_owner", soulProfileId: "sp_test", packId: "soul_3",
      id: "intent-id", randomId: "random-id", now: new Date(),
    });
    await repository.createIntent(intent);
    await repository.approveIntent({ intentId: intent.id, providerPaymentKey: "payment-key", rawPayload: {} });

    const first = await repository.cancelIntent({
      intentId: intent.id, providerPaymentKey: "payment-key", rawPayload: { status: "CANCELED" },
    });
    const repeated = await repository.cancelIntent({
      intentId: intent.id, providerPaymentKey: "payment-key", rawPayload: { status: "CANCELED" },
    });

    expect(first.intent.status).toBe("canceled");
    expect(first.balance).toBe(0);
    expect(repeated.balance).toBe(0);
  });
});
