import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSoulProfile } from "@/lib/soul/createSoulProfile";
import { getSoulRepository } from "@/lib/repository/repositoryProvider";
import { hashResultToken } from "@/lib/session/resultToken";

import { POST } from "./route";

const generateStoryWithOpenAI = vi.hoisted(() => vi.fn());
let cookieValue: string | undefined = "preview-owner";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => cookieValue ? { value: cookieValue } : undefined })),
}));

vi.mock("@/app/api/_lib/openAiStoryProvider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/app/api/_lib/openAiStoryProvider")>();
  return { ...actual, generateStoryWithOpenAI };
});

const wholeLife = {
  title: "돌아오는 길의 지도",
  opening: "새벽 안개가 길목을 덮을 때 한 아이가 돌담 위에 처음으로 바깥세상의 방향을 그렸습니다.",
  chapters: ["유년기", "청년기", "중년기", "말년기"].map((stage) => ({
    stage,
    title: `${stage}의 기록`,
    paragraphs: ["첫 번째 문단입니다.", "두 번째 문단입니다.", "세 번째 문단입니다."],
  })),
  presentMeaning: "현재에도 스스로 납득할 수 있는 방향을 찾으려는 마음으로 이어질 가능성이 있습니다.",
  readingTimeMinutes: 10,
};

describe("POST /api/soul/story-preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieValue = "preview-owner";
    generateStoryWithOpenAI.mockResolvedValue({
      content: wholeLife,
      model: "gpt-5.6-luna",
      repaired: false,
      usage: { inputTokens: 800, outputTokens: 3000, totalTokens: 3800 },
    });
  });

  it("authenticates the owner, generates once, and reuses the local cache", async () => {
    const repository = getSoulRepository();
    const profile = createSoulProfile({
      nickname: "미리보기", birthDate: "1991-04-17",
      answers: { inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d", hidden_desire: "e", repeated_theme: "f", decisive_choice: "b" },
    });
    const token = "preview-result-token";
    const stored = await repository.upsertProfile({ profile, anonymousSessionId: "preview-owner", resultTokenHash: hashResultToken(token) });
    const request = () => new Request("http://localhost/api/soul/story-preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileId: stored.id, token, contentType: "whole_life" }),
    });

    const first = await POST(request());
    const second = await POST(request());

    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({ content: wholeLife, cached: false });
    expect(await second.json()).toMatchObject({ content: wholeLife, cached: true });
    expect(generateStoryWithOpenAI).toHaveBeenCalledTimes(1);
  });

  it("does not accept a display-only soul id as authorization", async () => {
    cookieValue = undefined;
    const response = await POST(new Request("http://localhost/api/soul/story-preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileId: "S-DISPLAY", contentType: "whole_life" }),
    }));

    expect(response.status).toBe(404);
    expect(generateStoryWithOpenAI).not.toHaveBeenCalled();
  });
});
