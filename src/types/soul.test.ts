import { describe, expect, it } from "vitest";

import { soulArchetypeIds, type LifeCanon, type PublicSoulProfile, type SoulArchetypeId, type SoulInput } from "./soul";

describe("soul types", () => {
  it("accepts the phase 1 input contract", () => {
    const input: SoulInput = {
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
    };

    expect(input.answers.hidden_desire).toBe("e");
  });

  it("defines a shared life canon for every story", () => {
    const canon: LifeCanon = {
      scenarioId: "chronicler-jeonju-books", centralDesire: "진실을 남기는 것", centralFear: "한 사람의 목소리가 지워지는 것",
      keyRelationship: "답장을 기다리던 책방 손님", sharedObject: "쪽빛 봉투", secret: "편지가 숨겨졌다는 사실",
      turningPoint: "사라질 편지를 직접 돌려준 밤", decisiveAction: "가문의 요구를 거절했습니다.", consequence: "책방 일을 잃었습니다.",
      legacy: "사라질 이름을 기록으로 남겼습니다.", finalDay: "마지막 편지를 원래 주인에게 보냈습니다.", historicalTerms: ["장시"],
      timeline: [
        { stage: "유년기", event: "글을 익혔습니다." }, { stage: "청년기", event: "편지를 썼습니다." },
        { stage: "중년기", event: "편지를 지켰습니다." }, { stage: "말년기", event: "기록을 남겼습니다." },
      ],
    };
    expect(canon.timeline).toHaveLength(4);
  });

  it("defines the free result public contract", () => {
    const archetype: SoulArchetypeId = "chronicler";
    const profile: PublicSoulProfile = { displaySoulId: "#ABC123", discoveryPercent: 17 };

    expect(archetype).toBe("chronicler");
    expect(profile.discoveryPercent).toBe(17);
    expect(soulArchetypeIds).toContain(archetype);
  });
});
