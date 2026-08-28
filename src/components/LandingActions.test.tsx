import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LandingActions } from "./LandingActions";

describe("LandingActions", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 200 }))));
  });

  it("offers a saved result and tracks test starts", () => {
    sessionStorage.setItem("soul:last-result", "/result/sp_saved?token=secret");
    render(<LandingActions />);

    expect(screen.getByRole("link", { name: /지난 기록 다시 열기/ })).toHaveAttribute(
      "href",
      "/result/sp_saved",
    );
    expect(sessionStorage.getItem("soul:result-token:sp_saved")).toBe("secret");
    const startLink = screen.getByRole("link", { name: /무료로 내 기록 열기/ });
    startLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(startLink);
    expect(fetch).toHaveBeenCalledWith("/api/analytics", expect.objectContaining({ method: "POST" }));
  });
});
