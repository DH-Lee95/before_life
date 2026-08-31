import { describe, expect, it } from "vitest";

import type { PaymentRepository } from "./paymentRepository";

describe("PaymentRepository", () => {
  it("defines create, owner lookup, and idempotent approval operations", () => {
    const contract = {
      createIntent: async (intent) => intent,
      getIntent: async () => null,
      getIntentByOrderId: async () => null,
      approveIntent: async () => { throw new Error("not implemented"); },
      cancelIntent: async () => { throw new Error("not implemented"); },
    } satisfies PaymentRepository;

    expect(contract).toHaveProperty("approveIntent");
    expect(contract).toHaveProperty("cancelIntent");
  });
});
