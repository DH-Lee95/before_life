import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResultView } from "./ResultView";

const routerPush = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: routerPush }) }));

describe("ResultView", () => {
  beforeEach(() => {
    routerPush.mockReset();
    sessionStorage.clear();
    window.history.replaceState(null, "", "/");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => undefined)),
    );
  });

  it("renders a loading state without result data", () => {
    render(<ResultView profileId="sp_test" />);

    expect(screen.getByText("전생 서랍을 여는 중")).toBeInTheDocument();
  });

  it("reveals the representative life before traits and shows one free record", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        if (String(input).includes("/api/payment/intents")) {
          return Promise.resolve(new Response(JSON.stringify({ orderId: "soul_order" }), {
            status: 201, headers: { "Content-Type": "application/json" },
          }));
        }
        if (String(input).includes("/api/soul/story-preview")) {
          return Promise.resolve(new Response(JSON.stringify({
            cached: false,
            content: {
              title: "돌아오는 길의 지도",
              opening: "새벽 안개가 길목을 덮을 때 한 아이가 처음으로 바깥세상의 방향을 그렸습니다.",
              chapters: ["유년기", "청년기", "중년기", "말년기"].map((stage) => ({
                stage,
                title: `${stage}의 기록`,
                paragraphs: ["첫 문단입니다.", "둘째 문단입니다.", "셋째 문단입니다."],
              })),
              presentMeaning: "현재에도 스스로 납득할 수 있는 방향을 찾으려는 마음으로 이어질 가능성이 있습니다.",
              readingTimeMinutes: 10,
            },
          }), { status: 200, headers: { "Content-Type": "application/json" } }));
        }
        if (String(input).includes("/api/soul/unlock")) {
          return Promise.resolve(new Response(JSON.stringify({
            contentType: "last_day",
            balance: 2,
            content: {
              title: "끝까지 남은 편지",
              opening: "마지막 아침, 한 통의 편지를 남겼습니다.",
              chapters: [{ title: "작별", paragraphs: ["끝내 하지 못한 말을 적었습니다."] }],
              presentMeaning: "지금도 진심을 미루지 않으려는 마음으로 남았습니다.",
              readingTimeMinutes: 4,
            },
          }), { status: 200, headers: { "Content-Type": "application/json" } }));
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({
              profile: {
                displaySoulId: "S-TEST",
                discoveryPercent: 17,
                natureSummary: {
                  headline: "당신은 중요한 마음을 오래 품는 사람입니다.",
                  signals: ["중요한 마음일수록 서두르지 않고 간직하는 편"],
                  pastLifeBridge: "이 결이 가장 강하게 이어진 기록은 첫 번째 서랍에 남아 있습니다.",
                },
              },
              account: { authenticated: true, nickname: "서랍지기", balance: 4 },
              freeContent: {
                content: {
                  title: "서연님의 전생 서랍",
                  summary: "첫 번째 기록",
                  natureSummary: {
                    headline: "당신은 중요한 마음을 오래 품는 사람입니다.",
                    signals: ["중요한 마음일수록 서두르지 않고 간직하는 편"],
                    detail: "중요한 마음을 오래 품고 천천히 움직이는 사람입니다.",
                    hiddenInstinct: "숨은 본능은 진짜 의미를 찾는 것입니다.",
                    attractionPattern: "끌리는 사람은 조용한 자신감이 있는 사람입니다.",
                    taste: "취향은 오래 남는 것에 가깝습니다.",
                    pastLifeBridge: "이 결이 가장 강하게 이어진 기록은 첫 번째 서랍에 남아 있습니다.",
                  },
                  sections: {
                    location: "북이탈리아, 오래된 서재",
                    occupation: "편지 대필가",
                    atmosphere: "조용한 기록",
                    love: "연애에서는 신뢰가 중요합니다.",
                    success: "성공은 꾸준함에서 옵니다.",
                    compatibility: "궁합이 좋은 인연은 편안한 사람입니다.",
                    preference: "취향은 오래 남는 것에 가깝습니다.",
                    wholeLife: {
                      id: "whole_life",
                      title: "한 사람의 생애로 읽는 전생",
                      description: "유년기부터 말년기까지 흩어진 장면을 하나의 생애로 이어 읽습니다.",
                      chapterPreviews: [
                        { stage: "유년기", title: "서재의 풍경을 처음 기억한 날" },
                        { stage: "청년기", title: "편지 대필가가 된 계기" },
                        { stage: "중년기", title: "삶의 방향을 바꾼 선택" },
                        { stage: "말년기", title: "마지막까지 남긴 것" },
                      ],
                      readingTimeMinutes: 10,
                      soulCost: 2,
                      isUnlocked: false,
                    },
                    records: [
                      {
                        id: "past_love",
                        title: "전생의 사랑",
                        isUnlocked: true,
                        opening: "비가 내리던 시장에서 두 사람의 이야기가 시작되었습니다.",
                        chapters: [
                          {
                            title: "처음 알아본 순간",
                            paragraphs: ["그 사람은 매일 같은 시간에 서점 앞을 지나갔습니다.", "두 사람은 말보다 행동으로 서로의 마음을 알아보았습니다."],
                          },
                        ],
                        presentMeaning: "지금도 일관된 행동을 보이는 사람에게 마음이 가는 이유입니다.",
                        readingTimeMinutes: 3,
                      },
                      {
                        id: "last_day",
                        title: "전생의 마지막 날",
                        hint: "마지막으로 붙잡은 감정",
                        preview: "마지막 아침, 한 통의 편지를 남겼습니다.",
                        readingTimeMinutes: 4,
                        isUnlocked: false,
                      },
                    ],
                  },
                },
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      }),
    );

    window.history.replaceState(null, "", "/result/sp_test#token=shared_token");
    render(<ResultView profileId="sp_test" />);

    expect(await screen.findByText("당신은 중요한 마음을 오래 품는 사람입니다.")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/soul/result/sp_test",
      expect.objectContaining({ headers: { "X-Result-Token": "shared_token" } }),
    );
    expect(window.location.pathname).toBe("/result/sp_test");
    expect(window.location.hash).toBe("");
    expect(sessionStorage.getItem("soul:result-token:sp_test")).toBe("shared_token");
    expect(screen.getByText(/첫 번째 서랍/)).toBeInTheDocument();
    expect(screen.getAllByText("4소울 보유")).not.toHaveLength(0);
    const representative = screen.getByText("대표 전생 기록");
    const nature = screen.getByText("생년월일 기반 성향");
    expect(representative.compareDocumentPosition(nature) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("숨은 본능")).toBeInTheDocument();
    expect(screen.getByText("성공의 흐름")).toBeInTheDocument();
    expect(screen.getByText("깊은 기록 1/6 열림")).toBeInTheDocument();
    expect(screen.getByText("전생의 사랑")).toBeInTheDocument();
    expect(screen.getByText("처음 알아본 순간")).toBeInTheDocument();
    expect(screen.getByText("현생에 남은 의미")).toBeInTheDocument();
    expect(screen.getByText("전생의 마지막 날")).toBeInTheDocument();
    expect(screen.getByText("한 사람의 생애로 읽는 전생")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /전생의 일생 열기 · 2소울/ })).toBeInTheDocument();
    const previewButton = screen.getByRole("button", { name: /개발용 AI 일생 미리보기/ });
    expect(previewButton).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /이 기록 열기 · 1소울/ })).toBeInTheDocument();
    expect(screen.getByText("소울 충전")).toBeInTheDocument();
    expect(screen.getByText("충전한 소울은 카카오 계정에 안전하게 보관됩니다.")).toBeInTheDocument();
    expect(screen.getByText("1소울")).toBeInTheDocument();
    expect(screen.getByText("3소울")).toBeInTheDocument();
    expect(screen.getByText("5소울")).toBeInTheDocument();
    expect(screen.getByText("7소울")).toBeInTheDocument();
    expect(screen.getByText("친구 한 명을 초대하면 1소울")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /결과 공유/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /3소울/ }));
    expect(window.confirm).toHaveBeenCalledWith("3소울을 2,490원에 충전하시겠습니까?");
    await screen.findByText("결제 준비 중…");
    expect(fetch).toHaveBeenCalledWith("/api/payment/intents", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Result-Token": "shared_token" },
      body: JSON.stringify({ profileId: "sp_test", packId: "soul_3" }),
    }));
    expect(routerPush).toHaveBeenCalledWith("/payment/checkout?orderId=soul_order");

    const freeRecordLabel = screen.getByText("가장 선명한 기록 · 무료 공개");
    const wholeLifeOffer = screen.getByText("한 사람의 생애로 읽는 전생");
    const lockedRecord = screen.getByText("전생의 마지막 날");
    expect(freeRecordLabel.compareDocumentPosition(wholeLifeOffer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(wholeLifeOffer.compareDocumentPosition(lockedRecord) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /이 기록 열기 · 1소울/ }));
    expect(await screen.findByText("끝까지 남은 편지")).toBeInTheDocument();
    expect(screen.getAllByText("2소울 보유")).not.toHaveLength(0);
    expect(fetch).toHaveBeenCalledWith("/api/soul/unlock", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ profileId: "sp_test", contentType: "last_day" }),
    }));

    fireEvent.click(previewButton);
    expect(await screen.findByText("돌아오는 길의 지도")).toBeInTheDocument();
    expect(screen.getByText("유년기의 기록")).toBeInTheDocument();
  });
});
