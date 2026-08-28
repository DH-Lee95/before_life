import { describe, expect, it, vi } from "vitest";

import { STORY_OUTPUT_FORMAT } from "@/config/storyPrompt";
import { createStoryGenerationPrompt } from "@/lib/content/createStoryGenerationPrompt";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";

import { createStoryCacheKey, generateStoryWithOpenAI } from "./openAiStoryProvider";

const profile = createSoulProfile({
  nickname: "서연",
  birthDate: "1994-11-18",
  answers: {
    inner_response: "a",
    decision_pattern: "b",
    emotional_trace: "c",
    conflict_style: "d",
    hidden_desire: "e",
    repeated_theme: "a",
    decisive_choice: "b",
  },
});

const prompt = createStoryGenerationPrompt(profile, "past_love");
const validStory = {
  title: "등불 아래 남은 약속",
  opening: "해 질 무렵 항구의 돌바닥이 붉게 식어 갈 때, 서연은 장부 사이에 접힌 편지를 다시 펼쳤습니다.",
  chapters: [
    { title: "첫 장", paragraphs: ["바람이 가게의 문을 밀었습니다.", "두 사람은 같은 곳을 바라보았습니다."] },
    { title: "둘째 장", paragraphs: ["떠날 날이 가까워졌습니다.", "서연은 남는 쪽을 선택했습니다."] },
    { title: "셋째 장", paragraphs: ["계절은 다시 돌아왔습니다.", "남겨진 약속은 삶의 기준이 되었습니다."] },
  ],
  presentMeaning: "지금도 관계에서 말보다 책임을 먼저 살피는 경향으로 이어졌을 가능성이 있습니다.",
  readingTimeMinutes: 4,
};

function apiResponse(value: unknown) {
  return new Response(JSON.stringify({
    output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(value) }] }],
    usage: { input_tokens: 120, output_tokens: 540, total_tokens: 660 },
  }), { status: 200, headers: { "content-type": "application/json" } });
}

describe("generateStoryWithOpenAI", () => {
  it("uses the Responses API with server credentials and Structured Outputs", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(apiResponse(validStory));

    const result = await generateStoryWithOpenAI({ prompt, apiKey: "sk-test-secret", fetchImpl });

    expect(result.content).toEqual(validStory);
    expect(result.repaired).toBe(false);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(init.headers).toMatchObject({ Authorization: "Bearer sk-test-secret" });
    const body = JSON.parse(String(init.body));
    expect(body.store).toBe(false);
    expect(body.instructions).toBe(prompt.system);
    expect(body.input).toBe(prompt.user);
    expect(body.text.format).toEqual(STORY_OUTPUT_FORMAT);
  });

  it("repairs an invalid result once and returns the corrected story", async () => {
    const broken = { ...validStory, opening: "짧음" };
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(apiResponse(broken))
      .mockResolvedValueOnce(apiResponse(validStory));

    const result = await generateStoryWithOpenAI({ prompt, apiKey: "sk-test-secret", fetchImpl });

    expect(result.content).toEqual(validStory);
    expect(result.repaired).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const repairBody = JSON.parse(String(fetchImpl.mock.calls[1][1]?.body));
    expect(repairBody.input).toContain("도입 장면이 너무 짧습니다");
  });

  it("fails without exposing or silently accepting a missing API key", async () => {
    await expect(generateStoryWithOpenAI({ prompt, apiKey: "", fetchImpl: vi.fn() }))
      .rejects.toThrow("OPENAI_API_KEY");
  });
});

describe("createStoryCacheKey", () => {
  it("is stable for the same soul, content type, and prompt version", () => {
    const cacheKey = createStoryCacheKey(profile.soulHash, "past_love", prompt.version);
    expect(cacheKey).toBe(createStoryCacheKey(profile.soulHash, "past_love", prompt.version));
    expect(cacheKey.length).toBeLessThanOrEqual(64);
    expect(createStoryCacheKey(profile.soulHash, "whole_life", prompt.version))
      .not.toBe(createStoryCacheKey(profile.soulHash, "past_love", prompt.version));
  });
});
