import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacyPage from "./page";

describe("privacy page", () => {
  it("discloses collected inputs, processors, retention, and user rights", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: "개인정보처리방침" })).toBeInTheDocument();
    expect(screen.getAllByText(/생년월일/).length).toBeGreaterThan(0);
    expect(screen.getByText(/OpenAI/)).toBeInTheDocument();
    expect(screen.getByText(/열람.*정정.*삭제/)).toBeInTheDocument();
  });
});
