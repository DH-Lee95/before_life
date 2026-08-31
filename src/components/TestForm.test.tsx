import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TestForm } from "./TestForm";

const routerPush = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: routerPush }) }));

describe("TestForm", () => {
  beforeEach(() => {
    sessionStorage.clear();
    routerPush.mockReset();
  });

  it("renders the first step fields", () => {
    render(<TestForm />);

    expect(screen.getByLabelText("이름")).toBeInTheDocument();
    expect(screen.getByLabelText("생년월일")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "남성" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "여성" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "모름" })).toHaveAttribute("aria-pressed", "true");
  });

  it("lets users explicitly choose an unknown birth time", () => {
    render(<TestForm />);

    const birthTime = screen.getByLabelText("출생시간 선택");
    const unknown = screen.getByRole("button", { name: "모름" });

    fireEvent.change(birthTime, { target: { value: "09:30" } });
    expect(unknown).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(unknown);
    expect(birthTime).toHaveValue("");
    expect(unknown).toHaveAttribute("aria-pressed", "true");
  });

  it("restores an unfinished questionnaire from session storage", async () => {
    sessionStorage.setItem("soul:test-draft", JSON.stringify({
      step: 0, nickname: "저장된 이름", birthDate: "1994-11-18", birthTime: "", gender: "female", answers: {},
    }));

    render(<TestForm />);

    expect(await screen.findByDisplayValue("저장된 이름")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1994-11-18")).toBeInTheDocument();
  });

  it("exposes the selected answer state to users and assistive technology", () => {
    render(<TestForm />);
    fireEvent.change(screen.getByLabelText("이름"), { target: { value: "서연" } });
    fireEvent.change(screen.getByLabelText("생년월일"), { target: { value: "1994-11-18" } });
    fireEvent.click(screen.getByRole("button", { name: "여성" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    const answer = screen.getByRole("button", { name: /혼자 멀리 걸어본다/ });
    fireEvent.click(answer);
    expect(answer).toHaveAttribute("aria-pressed", "true");
  });

  it("creates the result even when analytics delivery fails", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockRejectedValueOnce(new Error("analytics unavailable"))
      .mockResolvedValueOnce(new Response(JSON.stringify({ profileId: "sp_test", resultToken: "token" }), { status: 200 })));
    render(<TestForm />);

    fireEvent.change(screen.getByLabelText("이름"), { target: { value: "서연" } });
    fireEvent.change(screen.getByLabelText("생년월일"), { target: { value: "1994-11-18" } });
    fireEvent.click(screen.getByRole("button", { name: "여성" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    for (let step = 0; step < 7; step += 1) {
      fireEvent.click(screen.getAllByRole("button").find((button) => button.textContent && !["처음으로", "이전 질문", "다음", "결과 보기"].includes(button.textContent)) as HTMLButtonElement);
      fireEvent.click(screen.getByRole("button", { name: step === 6 ? "결과 보기" : "다음" }));
    }

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/analyzing?next=%2Fresult%2Fsp_test"));
    expect(sessionStorage.getItem("soul:last-result")).toBe("/result/sp_test");
    expect(sessionStorage.getItem("soul:result-token:sp_test")).toBe("token");
    expect(routerPush.mock.calls[0]?.[0]).not.toContain("token");
    const createCall = vi.mocked(fetch).mock.calls.find(([url]) => url === "/api/soul/create");
    expect(JSON.parse(String(createCall?.[1]?.body))).toHaveProperty("gender", "female");
    expect(JSON.parse(String(createCall?.[1]?.body))).not.toHaveProperty("birthTime");
  });

  it("requires a gender before moving to the questions", () => {
    render(<TestForm />);
    fireEvent.change(screen.getByLabelText("이름"), { target: { value: "서연" } });
    fireEvent.change(screen.getByLabelText("생년월일"), { target: { value: "1994-11-18" } });

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText("전생 서랍을 열기 위한 정보를 입력해주세요.")).toBeInTheDocument();
  });
});
