import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutClient } from "./CheckoutClient";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("orderId=soul_order") }));

describe("CheckoutClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("open", vi.fn());
    vi.stubGlobal("fetch", vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "POST") return new Response(JSON.stringify({ checkoutUrl: "https://payapp.kr/pay/2000" }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
      return new Response(JSON.stringify({
        profileId: "sp_test", orderId: "soul_order", packId: "soul_3",
        amountKrw: 2490, souls: 3, status: "pending",
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }));
  });

  it("requests a PayApp checkout with a normalized phone number", async () => {
    render(<CheckoutClient />);
    expect(await screen.findByText("3소울 충전")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("휴대폰 번호"), { target: { value: "010-1234-5678" } });
    fireEvent.click(screen.getByRole("button", { name: "2,490원 결제하기" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/payment/request", expect.objectContaining({
      method: "POST", body: JSON.stringify({ orderId: "soul_order", phone: "010-1234-5678" }),
    })));
    expect(open).toHaveBeenCalledWith("https://payapp.kr/pay/2000", "_self");
    expect(screen.getByText(/페이앱에만 전달/)).toBeInTheDocument();
  });
});
