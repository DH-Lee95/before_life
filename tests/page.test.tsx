import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/auth/AccountStatus", () => ({
  AccountStatus: () => <span>계정</span>,
}));

import HomePage from "@/app/page";

describe("home page", () => {
  it("presents one complete representative record for free", () => {
    render(<HomePage />);

    expect(screen.getByText("대표 기록 복원 완료")).toBeInTheDocument();
    expect(screen.getByText(/6개 중 1개 무료 공개/)).toBeInTheDocument();
  });
});
