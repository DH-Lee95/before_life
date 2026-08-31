import { describe, expect, it } from "vitest";

import { readPaymentEnvironment } from "./paymentEnvironment";

describe("payment environment", () => {
  it("accepts paired Toss test or live keys and identifies the mode", () => {
    expect(readPaymentEnvironment({
      NEXT_PUBLIC_TOSS_CLIENT_KEY: "test_gck_client",
      TOSS_SECRET_KEY: "test_gsk_secret",
    })).toEqual({ clientKey: "test_gck_client", secretKey: "test_gsk_secret", mode: "test" });

    expect(readPaymentEnvironment({
      NEXT_PUBLIC_TOSS_CLIENT_KEY: "live_gck_client",
      TOSS_SECRET_KEY: "live_gsk_secret",
    })).toEqual({ clientKey: "live_gck_client", secretKey: "live_gsk_secret", mode: "live" });
  });

  it("rejects missing or mixed payment key modes", () => {
    expect(() => readPaymentEnvironment({
      NEXT_PUBLIC_TOSS_CLIENT_KEY: "live_gck_client",
      TOSS_SECRET_KEY: "test_gsk_secret",
    })).toThrow("same mode");
    expect(() => readPaymentEnvironment({
      NEXT_PUBLIC_TOSS_CLIENT_KEY: "live_gck_client",
    })).toThrow("payment is not configured");
  });
});
