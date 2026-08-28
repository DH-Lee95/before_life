import { describe, expect, it } from "vitest";

import { readTestPaymentEnvironment } from "./paymentEnvironment";

describe("payment environment", () => {
  it("accepts only paired Toss test keys while paid content is unfinished", () => {
    expect(readTestPaymentEnvironment({
      NEXT_PUBLIC_TOSS_CLIENT_KEY: "test_gck_client",
      TOSS_SECRET_KEY: "test_gsk_secret",
    })).toEqual({ clientKey: "test_gck_client", secretKey: "test_gsk_secret" });

    expect(() => readTestPaymentEnvironment({
      NEXT_PUBLIC_TOSS_CLIENT_KEY: "live_gck_client",
      TOSS_SECRET_KEY: "live_gsk_secret",
    })).toThrow("test payment keys are required");
  });
});
