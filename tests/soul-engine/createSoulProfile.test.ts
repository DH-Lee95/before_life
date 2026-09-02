import { describe, expect, it } from "vitest";

import { createSoulProfile } from "@/lib/soul/createSoulProfile";
import { pastLifeScenarios } from "@/config/pastLifeScenarios";
import type { SoulInput } from "@/types/soul";

const baseInput: SoulInput = {
  nickname: "서연",
  birthDate: "1994-11-18",
  birthTime: "23:10",
  answers: {
    inner_response: "b",
    decision_pattern: "c",
    emotional_trace: "a",
    conflict_style: "d",
    hidden_desire: "b",
    repeated_theme: "e",
    decisive_choice: "b",
  },
};

describe("createSoulProfile", () => {
  it("returns the same soul id and profile for the same input", () => {
    const first = createSoulProfile(baseInput);
    const second = createSoulProfile(baseInput);

    expect(first.soulHash).toBe(second.soulHash);
    expect(first.displaySoulId).toBe(second.displaySoulId);
    expect(first).toEqual(second);
  });

  it("changes the profile when an answer changes", () => {
    const first = createSoulProfile(baseInput);
    const changed = createSoulProfile({
      ...baseInput,
      answers: {
        ...baseInput.answers,
        hidden_desire: "e",
      },
    });

    expect(first.soulHash).not.toBe(changed.soulHash);
    expect(first.mainPastLife).not.toEqual(changed.mainPastLife);
  });

  it("keeps the core reading stable when only the display nickname changes", () => {
    const first = createSoulProfile(baseInput);
    const renamed = createSoulProfile({ ...baseInput, nickname: "다른 이름" });

    expect(first.soulHash).not.toBe(renamed.soulHash);
    expect(first.traits).toEqual(renamed.traits);
    expect(first.archetypeId).toBe(renamed.archetypeId);
    expect(first.mainPastLife).toEqual(renamed.mainPastLife);
  });

  it("creates one focused main record with a historically coherent world", () => {
    const profile = createSoulProfile(baseInput);

    expect(profile.mainPastLife.location).toBeTruthy();
    expect(profile.mainPastLife.occupation).toBeTruthy();
    expect(profile).not.toHaveProperty("faintRecords");
    expect(profile.recommendedContentType).toBe("last_day");
    expect([profile.mainPastLife.period, profile.mainPastLife.region]).not.toEqual([
      "15세기 후반",
      "조선 후기 한양 외곽",
    ]);
  });

  it("selects a curated historical scenario that belongs to the resulting archetype", () => {
    const profile = createSoulProfile(baseInput);
    const scenario = pastLifeScenarios.find((candidate) => candidate.id === profile.mainPastLife.scenarioId);

    expect(scenario).toBeDefined();
    expect(scenario?.archetypeId).toBe(profile.archetypeId);
    expect(profile.mainPastLife).toMatchObject({
      occupation: scenario?.occupation,
      location: scenario?.location,
      historicalContext: scenario?.historicalContext,
    });
    expect(profile.lifeCanon.scenarioId).toBe(scenario?.id);
    expect(profile.lifeCanon.timeline).toHaveLength(4);
    expect(profile.readingRationale).toHaveLength(3);
  });

  it("lets strong answer patterns dominate the lightweight birth signal", () => {
    const recordFocused = createSoulProfile({
      ...baseInput,
      birthDate: "1997-02-27",
      answers: {
        inner_response: "b", decision_pattern: "a", emotional_trace: "a", conflict_style: "a",
        hidden_desire: "b", repeated_theme: "f", decisive_choice: "b",
      },
    });
    const pioneering = createSoulProfile({
      ...baseInput,
      birthDate: "1988-11-03",
      answers: {
        inner_response: "a", decision_pattern: "d", emotional_trace: "d", conflict_style: "d",
        hidden_desire: "a", repeated_theme: "e", decisive_choice: "e",
      },
    });

    expect(["chronicler", "scholar"]).toContain(recordFocused.archetypeId);
    expect(["pioneer", "wayfinder"]).toContain(pioneering.archetypeId);
  });
});
