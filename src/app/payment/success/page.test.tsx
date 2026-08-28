import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PaymentSuccessPage from "./page";

vi.mock("@/components/payment/PaymentSuccessClient", () => ({ PaymentSuccessClient: () => <p>승인 확인</p> }));

describe("payment success page", () => {
  it("hosts server confirmation feedback", () => {
    render(<PaymentSuccessPage />);
    expect(screen.getByText("승인 확인")).toBeInTheDocument();
  });
});
