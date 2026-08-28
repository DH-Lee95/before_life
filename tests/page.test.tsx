import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";

describe("home page", () => {
  it("presents one complete representative record for free", () => {
    render(<HomePage />);

    expect(screen.getByText("대표 기록 무료")).toBeInTheDocument();
    expect(screen.getByText(/6개 중 1개 무료 공개/)).toBeInTheDocument();
  });
});
