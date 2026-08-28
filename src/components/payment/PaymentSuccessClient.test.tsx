import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PaymentSuccessClient } from "./PaymentSuccessClient";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("paymentKey=payment-key&orderId=soul_order&amount=2490"),
}));

describe("PaymentSuccessClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      profileId: "sp_test", purchasedSouls: 3, balance: 3,
    }), { status: 200, headers: { "Content-Type": "application/json" } })));
  });

  it("confirms on the server and links back to the purchased result", async () => {
    render(<PaymentSuccessClient />);

    expect(await screen.findByText("3소울이 충전됐어요")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/payment/confirm", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ paymentKey: "payment-key", orderId: "soul_order", amount: 2490 }),
    }));
    expect(screen.getByRole("link", { name: "결과로 돌아가기" })).toHaveAttribute("href", "/result/sp_test");
  });
});
