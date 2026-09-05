import { describe, expect, it } from "vitest";

import { contentLensByType } from "./createBlueprintStory";

describe("createBlueprintStory", () => {
  it("assigns a distinct content lens to every paid content type", () => {
    expect(contentLensByType).toEqual({
      past_love: "LOVE",
      wealth_status: "WEALTH_STATUS",
      decisive_choice: "DECISIVE_CHOICE",
      karma_trace: "UNFINISHED_PROMISE",
      last_day: "FINAL_DAY",
      present_influence: "PRESENT_TRACE",
      family_bonds: "PARENT_CHILD",
    });
    expect(new Set(Object.values(contentLensByType))).toHaveLength(7);
  });

  it("is rendered as a scene instead of opening with setup exposition", async () => {
    const { createFreeResult } = await import("./createFreeResult");
    const { createSoulProfile } = await import("@/lib/soul/createSoulProfile");
    const { createLifeCanon } = await import("@/lib/soul/createLifeCanon");
    const { pastLifeScenarios } = await import("@/config/pastLifeScenarios");
    const { soulArchetypes } = await import("@/config/soulArchetypes");
    const scenario = pastLifeScenarios.find((item) => item.id === "scholar-scotland-school")!;
    const archetype = soulArchetypes.find((item) => item.id === scenario.archetypeId)!;
    const base = createSoulProfile({
      nickname: "장면검수", birthDate: "1991-03-12", gender: "female",
      answers: { inner_response: "d", decision_pattern: "a", emotional_trace: "b", conflict_style: "d", hidden_desire: "f", repeated_theme: "a", decisive_choice: "d" },
    });
    const result = createFreeResult({
      ...base,
      archetypeId: scenario.archetypeId,
      recommendedContentType: "past_love",
      mainPastLife: { ...scenario, scenarioId: scenario.id, gender: base.mainPastLife.gender, hiddenNature: archetype.hiddenNatures[0], coreTheme: archetype.coreThemes[0] },
      lifeCanon: createLifeCanon(scenario, scenario.archetypeId, "d"),
    });
    const love = result.sections.records.find((record) => record.isUnlocked)!;

    expect(love.opening).toMatch(/장날.*학교 문.*계약서|학교 문.*장날.*계약서/);
    expect(JSON.stringify(love)).not.toMatch(/사건이 시작되기 전|신뢰를 쌓|관계는 사건과 함께 끝나지/);
  });
});
