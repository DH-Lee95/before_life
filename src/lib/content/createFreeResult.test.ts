import { describe, expect, it } from "vitest";

import { createFreeResult } from "./createFreeResult";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";
import { soulArchetypes } from "@/config/soulArchetypes";
import { socialClasses } from "@/config/soulEnginePools";
import { validateGeneratedStory } from "./validateGeneratedStory";

describe("createFreeResult", () => {
  it("returns one full free record and five safe paid previews", () => {
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
    const content = createFreeResult(profile);

    expect(content.sections.location).toBeTruthy();
    expect(content.sections.occupation).toBeTruthy();
    expect(content.sections.love).toBeTruthy();
    expect(content.sections.success).toBeTruthy();
    expect(content.sections.compatibility).toBeTruthy();
    expect(content.sections.preference).toBeTruthy();
    expect(content.sections.records).toHaveLength(6);
    expect(content.sections.wholeLife).toMatchObject({
      id: "whole_life",
      title: "한 사람의 생애로 읽는 전생",
      soulCost: 2,
      isUnlocked: false,
      readingTimeMinutes: 10,
    });
    expect(content.sections.wholeLife.chapterPreviews.map((chapter) => chapter.stage)).toEqual([
      "유년기",
      "청년기",
      "중년기",
      "말년기",
    ]);
    expect(content.sections.wholeLife).not.toHaveProperty("chapters");
    const unlocked = content.sections.records.filter((section) => section.isUnlocked);
    const locked = content.sections.records.filter((section) => !section.isUnlocked);
    expect(unlocked).toHaveLength(1);
    expect(locked).toHaveLength(5);
    expect(unlocked[0]).toMatchObject({ id: "present_influence", isUnlocked: true });
    expect(unlocked[0]).toHaveProperty("opening");
    expect(locked.every((section) => "preview" in section && !("opening" in section))).toBe(true);
    expect(JSON.stringify(locked)).not.toContain("chapters");
    expect(content.sections.atmosphere).not.toContain("사람였습니다");
    expect(content.summary).toContain(profile.mainPastLife.occupation);
    const renderedText = JSON.stringify(content);
    expect(renderedText).not.toMatch(/감정의 결|관계의 온도|판을 읽고|자신만의 결/);
    expect(renderedText).not.toMatch(/기록원였던|재봉사이었던|생활으로|마음이라는 감정|약속이라는 감정|내 이름으로 선택|였던 살아가기|의 길로 들어선 계기/);
  });

  it("creates the same structured stories for the same soul profile", () => {
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

    expect(createFreeResult(profile).sections.records).toEqual(createFreeResult(profile).sections.records);
  });

  it("keeps every recommended topic structurally complete", () => {
    for (const repeatedTheme of ["a", "b", "c", "d", "e", "f"] as const) {
      const profile = createSoulProfile({
        nickname: "서연",
        birthDate: "1994-11-18",
        answers: {
          inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d",
          hidden_desire: "e", repeated_theme: repeatedTheme, decisive_choice: "c",
        },
      });
      const freeRecord = createFreeResult(profile).sections.records.find((record) => record.isUnlocked);

      expect(freeRecord && "chapters" in freeRecord ? validateGeneratedStory(freeRecord).success : false).toBe(true);
    }
  });

  it("keeps every configured role and core theme grammatically safe", () => {
    const baseProfile = createSoulProfile({
      nickname: "서연",
      birthDate: "1994-11-18",
      answers: {
        inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d",
        hidden_desire: "e", repeated_theme: "f", decisive_choice: "b",
      },
    });

    for (const [archetypeIndex, archetype] of soulArchetypes.entries()) {
      for (const occupation of archetype.occupations) {
        for (const coreTheme of archetype.coreThemes) {
          const profile = {
            ...baseProfile,
            mainPastLife: {
              ...baseProfile.mainPastLife,
              occupation,
              coreTheme,
              hiddenNature: archetype.hiddenNatures[0] as string,
              socialClass: socialClasses[archetypeIndex % socialClasses.length],
            },
          };
          const result = createFreeResult(profile);

          const story = result.sections.records.find((record) => record.isUnlocked);
          expect(story && "chapters" in story ? validateGeneratedStory(story).success : false).toBe(true);
          expect(JSON.stringify(result)).not.toMatch(/기록원였던|상인로(?:서|\s)|보조원로(?:서|\s)|생활으로|내 이름으로 선택/);
        }
      }
    }
  });
});
