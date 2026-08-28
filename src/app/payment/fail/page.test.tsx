import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PaymentFailPage from "./page";

describe("payment failure page", () => {
  it("shows a safe cancellation message and retry navigation", async () => {
    render(await PaymentFailPage({ searchParams: Promise.resolve({ code: "PAY_PROCESS_CANCELED" }) }));

    expect(screen.getByText("결제가 취소됐어요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "결과로 돌아가기" })).toHaveAttribute("href", "/");
  });
});
