import { describe, expect, it } from "vitest";

import { createFreeResult } from "./createFreeResult";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";
import { soulArchetypes } from "@/config/soulArchetypes";
import { socialClasses } from "@/config/soulEnginePools";
import { validateGeneratedStory } from "./validateGeneratedStory";
import { pastLifeScenarios } from "@/config/pastLifeScenarios";
import { lockedContentTypes } from "@/config/contentTypes";
import { createLifeCanon } from "@/lib/soul/createLifeCanon";

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
    expect(content.sections.records).toHaveLength(7);
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
    expect(locked).toHaveLength(6);
    expect(locked.map((record) => record.id)).toContain("family_bonds");
    expect(content.summary).toContain("여성");
    expect(unlocked[0]).toMatchObject({ id: "present_influence", isUnlocked: true });
    expect(unlocked[0]).toHaveProperty("opening");
    expect(locked.every((section) => "preview" in section && !("opening" in section))).toBe(true);
    expect(JSON.stringify(locked)).not.toContain("chapters");
    expect(content.sections.atmosphere).not.toContain("사람였습니다");
    expect(content.summary).toContain(profile.mainPastLife.occupation);
    expect(content.selectionReasons).toEqual(profile.readingRationale);
    const renderedText = JSON.stringify(content);
    expect(renderedText).not.toMatch(/자신의 고백과 증거|침묵의 대가|모든 기록/);
    expect(renderedText).not.toMatch(/감정의 결|관계의 온도|판을 읽고|자신만의 결/);
    expect(renderedText).not.toMatch(/기록원였던|재봉사이었던|생활으로|마음이라는 감정|약속이라는 감정|내 이름으로 선택|였던 살아가기|의 길로 들어선 계기|서었습니다/);
    expect(renderedText).not.toMatch(/권한을 가진 사람|큰 손실|힘없는 그 사람|대가를 제자리로 돌려놓|생활의 균형|이 기록의 핵심/);
  });

  it("uses the shared life canon instead of occupation-agnostic stock scenes", () => {
    const profile = createSoulProfile({
      nickname: "하린", birthDate: "1997-02-27", gender: "female",
      answers: {
        inner_response: "b", decision_pattern: "a", emotional_trace: "a", conflict_style: "a",
        hidden_desire: "b", repeated_theme: "a", decisive_choice: "a",
      },
    });
    const result = createFreeResult(profile);
    const story = result.sections.records.find((record) => record.isUnlocked);
    const text = JSON.stringify(story);

    expect(text).toContain(profile.lifeCanon.keyRelationship);
    expect(text).toContain(profile.lifeCanon.sharedObject);
    expect(text).toContain(profile.lifeCanon.turningPoint);
    expect(text).not.toContain("망가진 물건 하나");
    if (!profile.lifeCanon.historicalTerms.includes("정거장")) expect(text).not.toContain("정거장");
  });

  it("keeps generated local prose free from broken object particles", () => {
    const profile = createSoulProfile({
      nickname: "서연", birthDate: "1993-04-18", gender: "female",
      answers: {
        inner_response: "c", decision_pattern: "c", emotional_trace: "c", conflict_style: "c",
        hidden_desire: "b", repeated_theme: "d", decisive_choice: "c",
      },
    });

    expect(JSON.stringify(createFreeResult(profile))).not.toMatch(/(?:무게|기회|경계|외로움)을 품고/);
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

  it("keeps love and last-day stories focused on character instead of repeating the occupation", () => {
    for (const repeatedTheme of ["a", "e"] as const) {
      const profile = createSoulProfile({
        nickname: "서연",
        birthDate: "1994-11-18",
        answers: {
          inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d",
          hidden_desire: "e", repeated_theme: repeatedTheme, decisive_choice: "b",
        },
      });
      const story = createFreeResult(profile).sections.records.find((record) => record.isUnlocked);
      const storyText = JSON.stringify(story);
      const occupationMentions = storyText.split(profile.mainPastLife.occupation).length - 1;

      expect(occupationMentions).toBeLessThanOrEqual(1);
      expect(storyText).toMatch(/숨기|비밀|진실|선택|대가/);
      expect(storyText).not.toMatch(/권한을 가진 사람|큰 손실|힘없는 그 사람|대가를 제자리로 돌려놓|서었습니다/);
    }
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

  it("keeps every curated life and every story topic coherent and readable", () => {
    const baseProfile = createSoulProfile({
      nickname: "서연", birthDate: "1994-11-18",
      answers: { inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d", hidden_desire: "e", repeated_theme: "f", decisive_choice: "b" },
    });

    for (const scenario of pastLifeScenarios) {
      const archetype = soulArchetypes.find((item) => item.id === scenario.archetypeId)!;
      for (const contentType of lockedContentTypes) {
        const profile = {
          ...baseProfile,
          archetypeId: scenario.archetypeId,
          recommendedContentType: contentType.id,
          mainPastLife: {
            ...scenario,
            gender: baseProfile.mainPastLife.gender,
            hiddenNature: archetype.hiddenNatures[0],
            coreTheme: archetype.coreThemes[0],
          },
          lifeCanon: createLifeCanon(scenario, scenario.archetypeId, "b"),
        };
        const result = createFreeResult(profile);
        const story = result.sections.records.find((record) => record.isUnlocked);
        const validation = story && "chapters" in story ? validateGeneratedStory(story) : { success: false };
        expect(validation, `${scenario.id}/${contentType.id}`).toMatchObject({ success: true });
        const text = JSON.stringify(story);
        expect(text).toContain(scenario.signatureObject);
        expect(text).not.toMatch(/(?:관리|공방주|책임자)은|전보이었습니다|동료과/);
        if (!scenario.historicalTerms.includes("기차역") && Number(scenario.period.slice(0, 2)) < 19) {
          expect(text).not.toMatch(/기차역|자동차|전화|전기/);
        }
      }
    }
  });
});
