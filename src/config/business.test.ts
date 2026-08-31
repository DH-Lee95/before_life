import { describe, expect, it } from "vitest";

import { assertLiveCommerceReady, readBusinessInformation } from "./business";

const completeEnvironment = {
  BUSINESS_NAME: "전생서랍",
  BUSINESS_REPRESENTATIVE: "홍길동",
  BUSINESS_REGISTRATION_NUMBER: "123-45-67890",
  BUSINESS_ADDRESS: "서울특별시 테스트로 1",
  CUSTOMER_SUPPORT_EMAIL: "support@example.com",
  CUSTOMER_SUPPORT_PHONE: "02-1234-5678",
  MAIL_ORDER_REGISTRATION_NUMBER: "제2026-서울테스트-0001호",
  PRIVACY_OFFICER_NAME: "홍길동",
};

describe("business information", () => {
  it("recognizes a complete public commerce disclosure", () => {
    expect(readBusinessInformation(completeEnvironment)).toMatchObject({
      complete: true,
      name: "전생서랍",
      supportEmail: "support@example.com",
    });
  });

  it("blocks live payment order creation until disclosures are complete", () => {
    expect(() => assertLiveCommerceReady("live", {})).toThrow("business information");
    expect(() => assertLiveCommerceReady("live", completeEnvironment)).not.toThrow();
    expect(() => assertLiveCommerceReady("test", {})).not.toThrow();
  });
});
