import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegalPage, LegalSection } from "./LegalPage";

describe("LegalPage", () => {
  it("renders a readable policy shell", () => {
    render(<LegalPage title="정책"><LegalSection title="항목">내용</LegalSection></LegalPage>);
    expect(screen.getByRole("heading", { name: "정책" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "항목" })).toBeInTheDocument();
  });
});
