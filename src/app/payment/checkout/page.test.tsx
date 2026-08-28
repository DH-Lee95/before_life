import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CheckoutPage from "./page";

vi.mock("@/components/payment/CheckoutClient", () => ({ CheckoutClient: () => <p>결제 위젯</p> }));

describe("checkout page", () => {
  it("hosts the payment widget", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("결제 위젯")).toBeInTheDocument();
  });
});
