import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountStatus } from "./AccountStatus";

describe("AccountStatus", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("offers Kakao login to anonymous visitors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ authenticated: false, balance: 0 }), { status: 200 })));
    render(<AccountStatus next="/result/sp_test" />);
    expect(await screen.findByRole("link", { name: "카카오로 계속하기" })).toHaveAttribute("href", "/auth/login?next=%2Fresult%2Fsp_test");
  });

  it("shows the account-wide soul balance after login", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ authenticated: true, nickname: "서랍지기", balance: 4 }), { status: 200 })));
    render(<AccountStatus />);
    expect(await screen.findByText("4소울 보유")).toBeInTheDocument();
  });
});
