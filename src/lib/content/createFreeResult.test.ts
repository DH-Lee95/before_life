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
  it("renders LOVE, WEALTH_STATUS, and DECISIVE_CHOICE from different life scenes", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "scholar-scotland-school")!;
    const archetype = soulArchetypes.find((item) => item.id === scenario.archetypeId)!;
    const base = createSoulProfile({
      nickname: "렌즈검수", birthDate: "1991-03-12", gender: "female",
      answers: { inner_response: "d", decision_pattern: "a", emotional_trace: "b", conflict_style: "d", hidden_desire: "f", repeated_theme: "a", decisive_choice: "d" },
    });
    const profile = {
      ...base,
      archetypeId: scenario.archetypeId,
      mainPastLife: { ...scenario, scenarioId: scenario.id, gender: base.mainPastLife.gender, hiddenNature: archetype.hiddenNatures[0], coreTheme: archetype.coreThemes[0] },
      lifeCanon: createLifeCanon(scenario, scenario.archetypeId, "d"),
    };
    const render = (recommendedContentType: "past_love" | "wealth_status" | "decisive_choice") => {
      const result = createFreeResult({ ...profile, recommendedContentType });
      return result.sections.records.find((record) => record.isUnlocked)!;
    };
    const love = render("past_love");
    const wealth = render("wealth_status");
    const choice = render("decisive_choice");

    expect(love.chapters.map((chapter) => chapter.title)).toEqual(["말없이 가까워진 시간", "끝내 건네지 못한 말", "같은 자리에 없었던 두 사람"]);
    expect(wealth.chapters.map((chapter) => chapter.title)).toEqual(["손에 쥐고 있던 생활", "값을 매길 수 없던 요구", "다음 달 달라진 것"]);
    expect(choice.chapters.map((chapter) => chapter.title)).toEqual(["돌아서도 끝나지 않는 일", "손을 움직인 순간", "선택 다음 날"]);
    expect(love.opening).not.toBe(wealth.opening);
    expect(wealth.opening).not.toBe(choice.opening);
    expect(JSON.stringify(love)).not.toContain(profile.lifeCanon.dramaticHook);
    expect(JSON.stringify(wealth)).not.toContain(profile.lifeCanon.dramaticHook);
  });

  it("keeps upgraded free stories deterministic for identical input", () => {
    const input = {
      nickname: "결정론", birthDate: "1990-06-14", gender: "female" as const,
      answers: { inner_response: "d" as const, decision_pattern: "d" as const, emotional_trace: "d" as const, conflict_style: "d" as const, hidden_desire: "f" as const, repeated_theme: "c" as const, decisive_choice: "d" as const },
    };

    const first = createSoulProfile(input);
    const second = createSoulProfile(input);
    expect(second.soulHash).toBe(first.soulHash);
    expect(second).toEqual(first);
    expect(createFreeResult(second)).toEqual(createFreeResult(first));
  });

  it("keeps representative lens stories within the readable free-preview range", () => {
    const base = createSoulProfile({
      nickname: "분량검수", birthDate: "1992-09-09", gender: "female",
      answers: { inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d", hidden_desire: "e", repeated_theme: "a", decisive_choice: "d" },
    });
    for (const scenario of pastLifeScenarios) {
      const archetype = soulArchetypes.find((item) => item.id === scenario.archetypeId)!;
      for (const config of lockedContentTypes) {
        const profile = {
          ...base,
          archetypeId: scenario.archetypeId,
          recommendedContentType: config.id,
          mainPastLife: { ...base.mainPastLife, ...scenario, scenarioId: scenario.id, hiddenNature: archetype.hiddenNatures[0], coreTheme: archetype.coreThemes[0] },
          lifeCanon: createLifeCanon(scenario, scenario.archetypeId, "d"),
        };
        const record = createFreeResult(profile).sections.records.find((item) => item.isUnlocked)!;
        if (!("chapters" in record)) throw new Error("expected an unlocked narrative");
        const length = [record.opening, ...record.chapters.flatMap((chapter) => [chapter.title, ...chapter.paragraphs]), record.presentMeaning].join("").length;

        expect(length, `${scenario.id}/${config.id}: ${length}자`).toBeGreaterThanOrEqual(700);
        expect(length, `${scenario.id}/${config.id}: ${length}자`).toBeLessThanOrEqual(1100);
        expect(record.presentMeaning).not.toMatch(/때문에 당신은 지금도|당신은 지금도 .*못합니다/);
        expect(JSON.stringify(record)).not.toMatch(/지식인였던|장인였던|자리이었습니다|관사이었습니다|딸와|관리인와|상인와|선장와|귀환병와|통신원와/);
        expect(record.opening).not.toMatch(/^(?:\d+세기|사건이 시작되기 전|당신이 원한 것은)/);
        expect(JSON.stringify(record)).not.toMatch(/신뢰를 쌓|생활의 바탕|실제로 잃은 몫|생존 방식이 부딪|성향을 그대로 외친|관계는 사건과 함께 끝나지|주인공/);

        const paragraphs = [record.opening, ...record.chapters.flatMap((chapter) => chapter.paragraphs)];
        for (const paragraph of paragraphs) {
          expect(paragraph.split("당신은 ").length - 1, `${scenario.id}/${config.id}: ${paragraph}`).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("opens the three showcase stories inside a concrete scene", () => {
    const render = (scenarioId: string, recommendedContentType: "past_love" | "wealth_status" | "decisive_choice") => {
      const scenario = pastLifeScenarios.find((item) => item.id === scenarioId)!;
      const archetype = soulArchetypes.find((item) => item.id === scenario.archetypeId)!;
      const base = createSoulProfile({
        nickname: "장면검수", birthDate: "1991-03-12", gender: "female",
        answers: { inner_response: "d", decision_pattern: "a", emotional_trace: "b", conflict_style: "d", hidden_desire: "f", repeated_theme: "a", decisive_choice: "d" },
      });
      const profile = {
        ...base,
        archetypeId: scenario.archetypeId,
        recommendedContentType,
        mainPastLife: { ...scenario, scenarioId: scenario.id, gender: base.mainPastLife.gender, hiddenNature: archetype.hiddenNatures[0], coreTheme: archetype.coreThemes[0] },
        lifeCanon: createLifeCanon(scenario, scenario.archetypeId, "d"),
      };
      return createFreeResult(profile).sections.records.find((record) => record.isUnlocked)!;
    };

    const scotlandLove = render("scholar-scotland-school", "past_love");
    const veniceChoice = render("artisan-venice-glass", "decisive_choice");
    const jejuWealth = render("caretaker-jeju-clinic", "wealth_status");

    expect(scotlandLove.opening).toMatch(/장날.*학교 문.*계약서|학교 문.*장날.*계약서/);
    expect(JSON.stringify(scotlandLove)).toMatch(/난롯가|학교 열쇠|살림방/);
    expect(veniceChoice.opening).toMatch(/푸른 잔.*금|금.*푸른 잔/);
    expect(JSON.stringify(veniceChoice)).toMatch(/뜨거운 물|화로 열쇠|견습생/);
    expect(jejuWealth.opening).toMatch(/약 창고|명단|아이/);
    expect(JSON.stringify(jejuWealth)).toMatch(/식량표|관사|이름.*다시/);
  });

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
    expect(content.freeStoryVersion).toBe("free-story.2026-09-05.v4");
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
    expect(content).not.toHaveProperty("selectionReasons");
    const renderedText = JSON.stringify(content);
    expect(renderedText).not.toMatch(/자신의 고백과 증거|침묵의 대가|모든 기록/);
    expect(renderedText).not.toMatch(/감정의 결|관계의 온도|판을 읽고|자신만의 결/);
    expect(renderedText).not.toMatch(/기록원였던|재봉사이었던|생활으로|마음이라는 감정|약속이라는 감정|내 이름으로 선택|였던 살아가기|의 길로 들어선 계기|서었습니다|제자과의/);
    expect(renderedText).not.toMatch(/권한을 가진 사람|큰 손실|힘없는 그 사람|대가를 제자리로 돌려놓|생활의 균형|이 기록의 핵심/);
    expect(renderedText).not.toContain("습니다.,");
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
    expect(text).toContain(profile.mainPastLife.pressureSource);
    expect(text.split(profile.mainPastLife.pressureSource).length - 1).toBeLessThanOrEqual(1);
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
        if (profile.lifeCanon.lifeBlueprint) {
          expect(text).not.toContain(profile.lifeCanon.dramaticHook);
        } else {
          expect(text).toContain(scenario.signatureObject);
          expect(text).toContain(profile.lifeCanon.dramaticHook);
        }
        expect(text).not.toMatch(/(?:관리|공방주|책임자)은|전보이었습니다|동료과/);
        if (!scenario.historicalTerms.includes("기차역") && Number(scenario.period.slice(0, 2)) < 19) {
          expect(text).not.toMatch(/기차역|자동차|전화|전기/);
        }
      }
    }
  });

  it("makes the Scottish scholar's final-day lens about later life instead of replaying the disappearance", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "scholar-scotland-school")!;
    const archetype = soulArchetypes.find((item) => item.id === "scholar")!;
    const baseProfile = createSoulProfile({
      nickname: "서연", birthDate: "1994-11-18",
      answers: { inner_response: "d", decision_pattern: "d", emotional_trace: "d", conflict_style: "d", hidden_desire: "f", repeated_theme: "e", decisive_choice: "b" },
    });
    const profile = {
      ...baseProfile,
      archetypeId: "scholar" as const,
      recommendedContentType: "last_day" as const,
      mainPastLife: { ...scenario, scenarioId: scenario.id, gender: baseProfile.mainPastLife.gender, hiddenNature: archetype.hiddenNatures[0], coreTheme: archetype.coreThemes[0] },
      lifeCanon: createLifeCanon(scenario, "scholar", "b"),
    };
    const story = createFreeResult(profile).sections.records.find((record) => record.isUnlocked)!;
    const text = JSON.stringify(story);

    expect(text).toContain("상속녀");
    expect(text).not.toMatch(/실종|감금|거짓 증언/);
    expect(text).toContain(scenario.signatureObject);
    expect(text).not.toMatch(/아이|학생|제자|표본첩|식물 관찰|학생 또는 농부|왜 그런 선택을 했는지|그 현실이 선택을 어렵게 했지만/);
    expect(text).not.toContain(scenario.pressureSource);
    expect(text.split(scenario.signatureObject).length - 1).toBeLessThanOrEqual(1);
    expect(text).toContain(profile.lifeCanon.lifeTimeline!.finalYears.summary);
    expect(text).not.toContain("해야 할 말을 남긴 채 멀어졌습니다");
    expect(text).toContain(profile.lifeCanon.lifeBlueprint!.finalMemory);
  });

  it("states the wealth conflict once instead of repeating the full premise", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "steward-greece-olive")!;
    const archetype = soulArchetypes.find((item) => item.id === "steward")!;
    const baseProfile = createSoulProfile({
      nickname: "검수", birthDate: "1993-08-01",
      answers: { inner_response: "a", decision_pattern: "b", emotional_trace: "a", conflict_style: "e", hidden_desire: "c", repeated_theme: "b", decisive_choice: "a" },
    });
    const profile = {
      ...baseProfile, archetypeId: "steward" as const, recommendedContentType: "wealth_status" as const,
      mainPastLife: { ...scenario, scenarioId: scenario.id, gender: baseProfile.mainPastLife.gender, hiddenNature: archetype.hiddenNatures[0], coreTheme: archetype.coreThemes[0] },
      lifeCanon: createLifeCanon(scenario, "steward", "a"),
    };
    const story = createFreeResult(profile).sections.records.find((record) => record.isUnlocked)!;
    const text = JSON.stringify(story);

    expect(text.split(scenario.pressureSource).length - 1).toBeLessThanOrEqual(1);
    expect(text).not.toContain("침묵의 대가");
    expect(text).not.toContain("사랑하는 사람");
  });

  it("keeps present-influence actions assigned to the person who performed them", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "scholar-scotland-school")!;
    const archetype = soulArchetypes.find((item) => item.id === "scholar")!;
    const baseProfile = createSoulProfile({
      nickname: "검수", birthDate: "1990-05-24",
      answers: { inner_response: "c", decision_pattern: "e", emotional_trace: "f", conflict_style: "c", hidden_desire: "e", repeated_theme: "f", decisive_choice: "f" },
    });
    const profile = {
      ...baseProfile, archetypeId: "scholar" as const, recommendedContentType: "present_influence" as const,
      mainPastLife: { ...scenario, scenarioId: scenario.id, gender: baseProfile.mainPastLife.gender, hiddenNature: archetype.hiddenNatures[0], coreTheme: archetype.coreThemes[0] },
      lifeCanon: createLifeCanon(scenario, "scholar", "f"),
    };
    const story = createFreeResult(profile).sections.records.find((record) => record.isUnlocked)!;
    const text = JSON.stringify(story);

    expect(text).not.toContain("어린 제자를 믿게 된 이유도");
    expect(text).not.toMatch(/충돌한 날\./);
    expect(text.split(scenario.signatureObject).length - 1).toBeLessThanOrEqual(2);
  });

  it("makes the love conflict concrete without repeating the premise or demanding blind trust", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "pioneer-brazil-post")!;
    const archetype = soulArchetypes.find((item) => item.id === "pioneer")!;
    const baseProfile = createSoulProfile({
      nickname: "검수", birthDate: "1992-07-16",
      answers: { inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "b", hidden_desire: "a", repeated_theme: "a", decisive_choice: "b" },
    });
    const profile = {
      ...baseProfile, archetypeId: "pioneer" as const, recommendedContentType: "past_love" as const,
      mainPastLife: { ...scenario, scenarioId: scenario.id, gender: baseProfile.mainPastLife.gender, hiddenNature: archetype.hiddenNatures[0], coreTheme: archetype.coreThemes[0] },
      lifeCanon: createLifeCanon(scenario, "pioneer", "b"),
    };
    const story = createFreeResult(profile).sections.records.find((record) => record.isUnlocked)!;
    const text = JSON.stringify(story);

    expect(text.split(scenario.pressureSource).length - 1).toBeLessThanOrEqual(1);
    expect(text.split(scenario.signatureObject).length - 1).toBeLessThanOrEqual(1);
    expect(text).not.toContain("사실보다 자신을 믿어 달라고");
  });

  it("makes the decisive choice readable without repeating a long abstract conflict", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "visionary-egypt-telegraph")!;
    const archetype = soulArchetypes.find((item) => item.id === "visionary")!;
    const baseProfile = createSoulProfile({
      nickname: "검수", birthDate: "1988-07-27",
      answers: { inner_response: "d", decision_pattern: "e", emotional_trace: "b", conflict_style: "b", hidden_desire: "d", repeated_theme: "c", decisive_choice: "a" },
    });
    const profile = {
      ...baseProfile, archetypeId: "visionary" as const, recommendedContentType: "decisive_choice" as const,
      mainPastLife: { ...scenario, scenarioId: scenario.id, gender: baseProfile.mainPastLife.gender, hiddenNature: archetype.hiddenNatures[0], coreTheme: archetype.coreThemes[0] },
      lifeCanon: createLifeCanon(scenario, "visionary", "a"),
    };
    const story = createFreeResult(profile).sections.records.find((record) => record.isUnlocked)!;
    const text = JSON.stringify(story);

    expect(text.split(scenario.pressureSource).length - 1).toBeLessThanOrEqual(1);
    expect(text.split(scenario.signatureObject).length - 1).toBeLessThanOrEqual(1);
    expect(text).not.toMatch(/남은 삶을 갈랐|누군가의 몫이나 진실/);
  });
});
