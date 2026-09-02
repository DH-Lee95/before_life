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
    expect(prompt.user).toContain("전생에서의 성별: 여성");
    expect(prompt.user).toContain(profile.mainPastLife.coreTheme.label);
    expect(prompt.user).toContain(profile.mainPastLife.coreTheme.description);
    expect(prompt.user).toContain("[한 생애의 정본]");
    expect(prompt.user).toContain(profile.lifeCanon.turningPoint);
    expect(prompt.user).toContain(profile.lifeCanon.consequence);
    expect(prompt.user).toContain("정본과 모순되는 새 가족관계나 생애 사건을 만들지 말 것");
    expect(prompt.user).toContain("1,200~1,800자");
    expect(prompt.system).toContain("누가 무엇을 했고 왜 그런 선택을 했는지");
    expect(prompt.system).toContain("비유만으로 뜻을 대신하지 않는다");
    expect(prompt.user).toContain("익숙하고 직관적인 한국어");
    expect(prompt.user).toContain("상품명은 반복하지 않고");
    expect(prompt.user).toContain("직업에서 파생된 소품과 행동을 반복하지 말 것");
    expect(prompt.user).toContain("주인공인 쉬운 단편소설");
    expect(prompt.user).toContain("사건과 사람을 처음 언급할 때 정체를 바로 설명");
    expect(prompt.user).toContain("두 사람의 욕망과 두려움");
    expect(prompt.user).toContain("가까워짐 → 갈등의 폭발 → 되돌릴 수 없는 선택과 여운");
    expect(prompt.user).toContain("성공 기준");
    expect(prompt.user).toContain("주인공이 원하는 것");
    expect(prompt.user).toContain("갈등을 일으킨 사건");
    expect(prompt.user).toContain("스스로 고른 행동");
    expect(prompt.user).toContain("선택 뒤에 실제로 달라진 것");
    expect(prompt.user).not.toContain(profile.soulHash);
    expect(prompt.qualityContext.requiredAnchors).toContain(profile.lifeCanon.sharedObject);
    expect(prompt.qualityContext.requiredAnchors).toContain(profile.lifeCanon.turningPoint);
  });

  it("builds a family-bonds story around parents, children, and present-day patterns", () => {
    const profile = createSoulProfile({
      nickname: "서연", birthDate: "1994-11-18", gender: "female",
      answers: {
        inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d",
        hidden_desire: "e", repeated_theme: "f", decisive_choice: "b",
      },
    });

    const prompt = createStoryGenerationPrompt(profile, "family_bonds");

    expect(prompt.user).toContain("부모와의 관계");
    expect(prompt.user).toContain("자식 또는 자식처럼 돌본 아이");
    expect(prompt.user).toContain("현생의 부모·자녀·가족 관계");
    expect(prompt.user).toContain("전생의 그 사람과 같은 사람이라고 환생했다고 단정하지 말 것");
  });

  it("gives the last-day story concrete stakes without graphic death", () => {
    const profile = createSoulProfile({
      nickname: "서연",
      birthDate: "1994-11-18",
      answers: {
        inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d",
        hidden_desire: "e", repeated_theme: "e", decisive_choice: "b",
      },
    });

    const prompt = createStoryGenerationPrompt(profile, "last_day");

    expect(prompt.user).toContain("죽음이 임박했다는 사실");
    expect(prompt.user).toContain("남은 시간의 제약 → 피하고 싶은 사람이나 진실과의 대면 → 마지막 선택과 대가");
    expect(prompt.user).toContain("잔혹하거나 신체를 세세하게 묘사하지 않음");
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
    expect(prompt.user).toContain("사건의 원인과 결과");
    expect(prompt.user).toContain("각 장의 성공 기준");
    expect(prompt.user).toContain("이전 장의 결과");
    expect(prompt.user).toContain("새로운 문제");
    expect(prompt.outputFormat.schema.properties.chapters.minItems).toBe(4);
    expect(prompt.outputFormat.schema.properties.chapters.maxItems).toBe(4);
  });
});
