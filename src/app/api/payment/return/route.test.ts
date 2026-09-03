import { describe, expect, it } from "vitest";

import { GET, POST } from "./route";

describe("/api/payment/return", () => {
  it.each([GET, POST])("redirects the PayApp browser return to server-verified status", async (handler) => {
    const response = await handler(new Request("https://before-life.co.kr/api/payment/return?orderId=soul_order", { method: handler === POST ? "POST" : "GET" }));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://before-life.co.kr/payment/success?orderId=soul_order");
  });

  it("sends malformed returns to the failure page", async () => {
    const response = await GET(new Request("https://before-life.co.kr/api/payment/return?orderId=bad!"));
    expect(response.headers.get("location")).toContain("/payment/fail");
  });
});
