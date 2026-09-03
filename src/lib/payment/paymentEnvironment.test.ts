import { describe, expect, it } from "vitest";

import { readPaymentEnvironment } from "./paymentEnvironment";

describe("payment environment", () => {
  it("accepts complete PayApp settings and normalizes the site URL", () => {
    expect(readPaymentEnvironment({
      PAYAPP_USER_ID: " seller ", PAYAPP_LINK_KEY: " key ", PAYAPP_LINK_VALUE: " value ",
      PAYAPP_MODE: "test", NEXT_PUBLIC_SITE_URL: "http://localhost:3000/", BUSINESS_NAME: "전생서랍",
    })).toEqual({
      userId: "seller", linkKey: "key", linkValue: "value", mode: "test",
      siteUrl: "http://localhost:3000", shopName: "전생서랍",
      openPayTypes: "card,kakaopay,naverpay,applepay,payco,tosspay",
    });
  });

  it("rejects missing settings and non-HTTPS live URLs", () => {
    expect(() => readPaymentEnvironment({
      PAYAPP_USER_ID: "seller", PAYAPP_LINK_KEY: "key", PAYAPP_MODE: "test",
    })).toThrow("payment is not configured");
    expect(() => readPaymentEnvironment({
      PAYAPP_USER_ID: "seller", PAYAPP_LINK_KEY: "key", PAYAPP_LINK_VALUE: "value",
      PAYAPP_MODE: "live", NEXT_PUBLIC_SITE_URL: "http://before-life.test",
    })).toThrow("HTTPS");
  });
});
