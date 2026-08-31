import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TermsPage from "./page";

describe("terms page", () => {
  it("states the entertainment nature and paid soul rules", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { name: "이용약관" })).toBeInTheDocument();
    expect(screen.getAllByText(/오락과 자기성찰을 위한 콘텐츠/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/소울/).length).toBeGreaterThan(0);
  });
});
