import { describe, expect, it, vi } from "vitest";

import { requestPayAppPayment, verifyPayAppFeedback } from "./payAppPaymentProvider";

describe("PayApp payment provider", () => {
  it("creates a server-side payment request and parses PayApp's query response", async () => {
    const fetchImpl = vi.fn(async () => new Response(
      "state=1&errorMessage=&mul_no=2000&payurl=https%3A%2F%2Fpayapp.kr%2Fpay%2Fabc",
      { status: 200 },
    ));

    const result = await requestPayAppPayment({
      userId: "seller", shopName: "전생서랍", orderId: "soul_order", profileId: "sp_test",
      amountKrw: 2490, souls: 3, buyerPhone: "01012345678", siteUrl: "https://www.before-life.co.kr",
      openPayTypes: "card,kakaopay,naverpay,tosspay", fetchImpl,
    });

    expect(result).toEqual({ providerPaymentKey: "2000", checkoutUrl: "https://payapp.kr/pay/abc" });
    const request = fetchImpl.mock.calls[0];
    expect(request[0]).toBe("https://api.payapp.kr/oapi/apiLoad.html");
    const body = new URLSearchParams(String(request[1]?.body));
    expect(Object.fromEntries(body)).toMatchObject({
      cmd: "payrequest", userid: "seller", goodname: "전생서랍 3소울", price: "2490",
      recvphone: "01012345678", var1: "soul_order", var2: "sp_test", smsuse: "n",
      feedbackurl: "https://www.before-life.co.kr/api/payment/webhook",
      returnurl: "https://www.before-life.co.kr/api/payment/return?orderId=soul_order",
      checkretry: "y", skip_cstpage: "y",
    });
  });

  it("rejects failed or malformed PayApp responses", async () => {
    await expect(requestPayAppPayment({
      userId: "seller", shopName: "전생서랍", orderId: "soul_order", profileId: "sp_test",
      amountKrw: 1000, souls: 1, buyerPhone: "01012345678", siteUrl: "https://www.before-life.co.kr",
      openPayTypes: "card", fetchImpl: async () => new Response("state=0&errorMessage=입점심사+필요"),
    })).rejects.toThrow("입점심사 필요");
    await expect(requestPayAppPayment({
      userId: "seller", shopName: "전생서랍", orderId: "soul_order", profileId: "sp_test",
      amountKrw: 1000, souls: 1, buyerPhone: "01012345678", siteUrl: "https://www.before-life.co.kr",
      openPayTypes: "card", fetchImpl: async () => new Response(
        "state=1&mul_no=2000&payurl=https%3A%2F%2Fevil.example%2Fpay",
      ),
    })).rejects.toThrow("invalid PayApp payment response");
  });

  it("verifies PayApp callback credentials, order identity, amount, and request number", () => {
    const feedback = new URLSearchParams({
      userid: "seller", linkkey: "key", linkval: "value", pay_state: "4", price: "2490",
      var1: "soul_order", var2: "sp_test", mul_no: "2000", card_num: "secret-card-data",
    });

    expect(verifyPayAppFeedback(feedback, {
      userId: "seller", linkKey: "key", linkValue: "value",
      orderId: "soul_order", profileId: "sp_test", amountKrw: 2490,
    })).toMatchObject({ state: "4", providerPaymentKey: "2000", orderId: "soul_order" });
    expect(() => verifyPayAppFeedback(feedback, {
      userId: "seller", linkKey: "key", linkValue: "wrong",
      orderId: "soul_order", profileId: "sp_test", amountKrw: 2490,
    })).toThrow("invalid PayApp feedback");
  });

  it("uses the original transaction identity when PayApp reports a partial cancellation", () => {
    const feedback = new URLSearchParams({
      userid: "seller", linkkey: "key", linkval: "value", pay_state: "70", price: "1000",
      orig_price: "2490", var1: "soul_order", var2: "sp_test", mul_no: "2001", orig_mul_no: "2000",
    });
    expect(verifyPayAppFeedback(feedback, {
      userId: "seller", linkKey: "key", linkValue: "value",
      orderId: "soul_order", profileId: "sp_test", amountKrw: 2490,
    })).toMatchObject({
      state: "70", providerPaymentKey: "2000", amountKrw: 2490, cancelAmountKrw: 1000,
    });
  });
});
