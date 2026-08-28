import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnalyzingClient, getSafeResultPath } from "./AnalyzingClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("next=%2Fresult%2Fsp_test%3Ftoken%3Dabc"),
}));

describe("AnalyzingClient", () => {
  it("renders the analysis copy", () => {
    render(<AnalyzingClient />);

    expect(screen.getByText("전생 서랍을 정리하고 있어요")).toBeInTheDocument();
  });

  it("only accepts an internal result path", () => {
    expect(getSafeResultPath("/result/sp_test?token=abc")).toBe("/result/sp_test?token=abc");
    expect(getSafeResultPath("javascript:alert(1)")).toBe("/");
    expect(getSafeResultPath("https://example.com/result/sp_test?token=abc")).toBe("/");
    expect(getSafeResultPath("//example.com/result/sp_test?token=abc")).toBe("/");
  });
});
