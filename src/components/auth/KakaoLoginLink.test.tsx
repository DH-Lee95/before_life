import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KakaoLoginLink } from "./KakaoLoginLink";

describe("KakaoLoginLink", () => {
  it("starts the server OAuth flow and preserves a safe return path", () => {
    render(<KakaoLoginLink next="/result/sp_test" />);

    expect(screen.getByRole("link", { name: "카카오로 계속하기" }))
      .toHaveAttribute("href", "/auth/login?next=%2Fresult%2Fsp_test");
  });
});
