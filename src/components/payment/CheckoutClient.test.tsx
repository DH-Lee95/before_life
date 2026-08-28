import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutClient } from "./CheckoutClient";

const requestPayment = vi.hoisted(() => vi.fn());
const setAmount = vi.hoisted(() => vi.fn());
const renderPaymentMethods = vi.hoisted(() => vi.fn());
const renderAgreement = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("orderId=soul_order"),
}));
vi.mock("@tosspayments/tosspayments-sdk", () => ({
  ANONYMOUS: "ANONYMOUS",
  loadTossPayments: vi.fn(async () => ({
    widgets: () => ({ requestPayment, setAmount, renderPaymentMethods, renderAgreement }),
  })),
}));

describe("CheckoutClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_TOSS_CLIENT_KEY", "test_gck_client");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      profileId: "sp_test", orderId: "soul_order", packId: "soul_3",
      amountKrw: 2490, souls: 3, status: "pending",
    }), { status: 200, headers: { "Content-Type": "application/json" } })));
  });

  it("renders the server-priced Toss widget and requests redirect payment", async () => {
    render(<CheckoutClient />);

    expect(await screen.findByText("3소울 충전")).toBeInTheDocument();
    await waitFor(() => expect(setAmount).toHaveBeenCalledWith({ currency: "KRW", value: 2490 }));
    expect(renderPaymentMethods).toHaveBeenCalledWith({ selector: "#payment-method", variantKey: "DEFAULT" });
    expect(renderAgreement).toHaveBeenCalledWith({ selector: "#agreement", variantKey: "AGREEMENT" });

    fireEvent.click(screen.getByRole("button", { name: "2,490원 결제하기" }));
    expect(requestPayment).toHaveBeenCalledWith(expect.objectContaining({
      orderId: "soul_order",
      orderName: "전생서랍 3소울",
      successUrl: expect.stringContaining("/payment/success"),
      failUrl: expect.stringContaining("/payment/fail"),
    }));
  });
});
