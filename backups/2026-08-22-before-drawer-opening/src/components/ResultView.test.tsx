import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResultView } from "./ResultView";

describe("ResultView", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => undefined)),
    );
  });

  it("renders a loading state without result data", () => {
    render(<ResultView profileId="sp_test" token="token" />);

    expect(screen.getByText("전생 서랍을 여는 중")).toBeInTheDocument();
  });

  it("shows the nature summary before the first drawer record", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              profile: {
                displaySoulId: "S-TEST",
                discoveryPercent: 18,
                natureSummary: {
                  headline: "당신은 중요한 마음을 오래 품는 사람입니다.",
                  signals: ["중요한 마음일수록 서두르지 않고 간직하는 편"],
                  pastLifeBridge: "이 결이 가장 강하게 이어진 기록은 첫 번째 서랍에 남아 있습니다.",
                },
              },
              freeContent: {
                content: {
                  title: "서연님의 전생 서랍",
                  summary: "첫 번째 기록",
                  natureSummary: {
                    headline: "당신은 중요한 마음을 오래 품는 사람입니다.",
                    signals: ["중요한 마음일수록 서두르지 않고 간직하는 편"],
                    pastLifeBridge: "이 결이 가장 강하게 이어진 기록은 첫 번째 서랍에 남아 있습니다.",
                  },
                  sections: {
                    location: "북이탈리아, 오래된 서재",
                    occupation: "편지 대필가",
                    atmosphere: "조용한 기록",
                    faintRecords: [],
                    lockedHints: [],
                  },
                },
              },
              lockedContentTypes: [],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        ),
      ),
    );

    render(<ResultView profileId="sp_test" token="token" />);

    expect(await screen.findByText("당신은 중요한 마음을 오래 품는 사람입니다.")).toBeInTheDocument();
    expect(screen.getByText(/첫 번째 서랍/)).toBeInTheDocument();
    expect(screen.getByText("대표 전생 기록")).toBeInTheDocument();
  });
});
