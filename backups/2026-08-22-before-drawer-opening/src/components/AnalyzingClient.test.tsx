import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnalyzingClient } from "./AnalyzingClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("next=%2Fresult%2Fsp_test%3Ftoken%3Dabc"),
}));

describe("AnalyzingClient", () => {
  it("renders the analysis copy", () => {
    render(<AnalyzingClient />);

    expect(screen.getByText("전생 서랍을 정리하고 있어요")).toBeInTheDocument();
  });
});
