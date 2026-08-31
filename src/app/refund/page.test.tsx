import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RefundPage from "./page";

describe("refund page", () => {
  it("distinguishes unused souls from supplied digital content", () => {
    render(<RefundPage />);
    expect(screen.getByRole("heading", { name: "환불 안내" })).toBeInTheDocument();
    expect(screen.getByText(/사용하지 않은 소울/)).toBeInTheDocument();
    expect(screen.getByText(/이미 열린 유료 기록/)).toBeInTheDocument();
  });
});
