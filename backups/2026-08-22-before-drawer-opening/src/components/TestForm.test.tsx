import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TestForm } from "./TestForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("TestForm", () => {
  it("renders the first step fields", () => {
    render(<TestForm />);

    expect(screen.getByLabelText("닉네임")).toBeInTheDocument();
    expect(screen.getByLabelText("생년월일")).toBeInTheDocument();
  });
});
