import { describe, expect, it } from "vitest";

import { STORY_OUTPUT_FORMAT, STORY_PROMPT_VERSION, STORY_SYSTEM_PROMPT, WHOLE_LIFE_OUTPUT_FORMAT, storyFocusByContentType } from "./storyPrompt";

describe("story prompt config", () => {
  it("defines a versioned safe narrative focus for every deep-dive type", () => {
    expect(STORY_PROMPT_VERSION).toMatch(/^story-prompt\./);
    expect(STORY_SYSTEM_PROMPT).toContain("엔터테인먼트용 허구");
    expect(STORY_SYSTEM_PROMPT).toContain("본문 안에 고지문으로 쓰지 않는다");
    expect(STORY_SYSTEM_PROMPT).toContain("첫 문장부터 구체적인 장면");
    expect(STORY_SYSTEM_PROMPT).toContain("조사와 어미");
    expect(STORY_SYSTEM_PROMPT).toContain("조용히 한 번 고쳐 쓴다");
    expect(STORY_PROMPT_VERSION).toBe("story-prompt.2026-08-31.v7");
    expect(STORY_SYSTEM_PROMPT).toContain("직업은 배경 정보로만");
    expect(STORY_SYSTEM_PROMPT).toContain("성격과 관계에서의 선택");
    expect(STORY_SYSTEM_PROMPT).toContain("갈등이 커지고");
    expect(STORY_SYSTEM_PROMPT).not.toContain('{\n  "title"');
    expect(STORY_OUTPUT_FORMAT.type).toBe("json_schema");
    expect(STORY_OUTPUT_FORMAT.strict).toBe(true);
    expect(Object.keys(storyFocusByContentType)).toHaveLength(7);
    expect(WHOLE_LIFE_OUTPUT_FORMAT.schema.properties.chapters.minItems).toBe(4);
  });
});
