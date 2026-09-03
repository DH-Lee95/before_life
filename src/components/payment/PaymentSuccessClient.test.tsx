import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PaymentSuccessClient } from "./PaymentSuccessClient";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("orderId=soul_order") }));

describe("PaymentSuccessClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      profileId: "sp_test", orderId: "soul_order", souls: 3, status: "approved",
    }), { status: 200, headers: { "Content-Type": "application/json" } })));
  });

  it("trusts only the server-updated order status and links to the result", async () => {
    render(<PaymentSuccessClient />);
    expect(await screen.findByText("3소울이 충전됐어요")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/payment/intents?orderId=soul_order", expect.objectContaining({ cache: "no-store" }));
    expect(screen.getByRole("link", { name: "결과로 돌아가기" })).toHaveAttribute("href", "/result/sp_test");
  });
});
