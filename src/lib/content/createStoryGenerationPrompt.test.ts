import { describe, expect, it } from "vitest";

import { createSoulProfile } from "@/lib/soul/createSoulProfile";
import { createStoryGenerationPrompt, createWholeLifeGenerationPrompt } from "./createStoryGenerationPrompt";

describe("createStoryGenerationPrompt", () => {
  it("builds a server-ready prompt with narrative anchors and a strict output shape", () => {
    const profile = createSoulProfile({
      nickname: "서연",
      birthDate: "1994-11-18",
      answers: {
        inner_response: "a",
        decision_pattern: "b",
        emotional_trace: "c",
        conflict_style: "d",
        hidden_desire: "e",
        repeated_theme: "f",
        decisive_choice: "b",
      },
    });

    const prompt = createStoryGenerationPrompt(profile, "past_love");

    expect(prompt.system).toContain("엔터테인먼트용 허구");
    expect(prompt.outputFormat.type).toBe("json_schema");
    expect(prompt.outputFormat.strict).toBe(true);
    expect(prompt.user).toContain(profile.mainPastLife.period);
    expect(prompt.user).toContain(profile.mainPastLife.occupation);
    expect(prompt.user).toContain(profile.mainPastLife.coreTheme.label);
    expect(prompt.user).toContain(profile.mainPastLife.coreTheme.description);
    expect(prompt.user).toContain("1,200~1,800자");
    expect(prompt.user).not.toContain(profile.soulHash);
  });

  it("builds a longer chronological whole-life prompt from the same canon", () => {
    const profile = createSoulProfile({
      nickname: "서연",
      birthDate: "1994-11-18",
      answers: {
        inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d",
        hidden_desire: "e", repeated_theme: "f", decisive_choice: "b",
      },
    });

    const prompt = createWholeLifeGenerationPrompt(profile);

    expect(prompt.user).toContain("3,500~5,000자");
    expect(prompt.user).toContain("유년기 → 청년기 → 중년기 → 말년기");
    expect(prompt.user).toContain("기존의 깊은 기록과 같은 한 사람");
    expect(prompt.outputFormat.schema.properties.chapters.minItems).toBe(4);
    expect(prompt.outputFormat.schema.properties.chapters.maxItems).toBe(4);
  });
});
