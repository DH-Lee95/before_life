import { describe, expect, it } from "vitest";

import { pastLifeScenarios, type PastLifeScenario } from "@/config/pastLifeScenarios";
import type { AnswerId } from "@/types/soul";
import { createLifeCanon } from "./createLifeCanon";

const answerIds: AnswerId[] = ["a", "b", "c", "d", "e", "f"];

describe("createLifeCanon", () => {
  it("turns one historical scenario into a complete reusable timeline", () => {
    const scenario = pastLifeScenarios[0];
    const canon = createLifeCanon(scenario, "pioneer", "e");

    expect(canon.scenarioId).toBe(scenario.id);
    expect(canon.sharedObject).toBe(scenario.signatureObject);
    expect(canon.turningPoint).toContain(scenario.pressureSource);
    expect(canon.timeline.map((item) => item.stage)).toEqual(["유년기", "청년기", "중년기", "말년기"]);
    expect(canon.timeline[1].event).toContain("여행 동료와 가까워졌습니다");
    expect(canon.timeline[1].event).not.toContain("여행 동료과");
  });

  it("uses one concrete relationship instead of exposing an unresolved option", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "scholar-scotland-school")!;
    const canon = createLifeCanon(scenario, "scholar", "b");

    expect(canon.keyRelationship).toBe("당신의 질문을 귀찮아하지 않았던 어린 제자");
    expect(JSON.stringify(canon)).not.toContain("또는");
  });

  it("does not introduce an undefined lover through the decisive action", () => {
    const canon = createLifeCanon(pastLifeScenarios[0], "pioneer", "a");

    expect(canon.decisiveAction).not.toContain("사랑하는 사람");
  });

  it("keeps the final-day confession consistent with an earlier public choice", () => {
    const canon = createLifeCanon(pastLifeScenarios[0], "pioneer", "b");

    expect(canon.decisiveAction).toContain("공개했습니다");
    expect(canon.finalDay).not.toContain("숨겼던 사실");
    expect(canon.finalDay).toContain("말하지 못한 마음과 선택이 남긴 영향");
  });

  it("explains why the Scottish school herbarium matters to the expulsion conflict", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "scholar-scotland-school")!;
    const canon = createLifeCanon(scenario, "scholar", "e");

    expect(canon.turningPoint).toContain("표본첩에서도 그 아이의 이름을 지우라고");
    expect(canon.turningPoint).toContain("직접 채집한 식물과 관찰 기록");
    expect(canon.decisiveAction).toContain("교회 창고");
    expect(canon.decisiveAction).toContain("계속 가르쳤습니다");
    expect(canon.consequence).toContain("교사 자리");
    expect(canon.consequence).toContain("어린 제자");
    expect(canon.timeline[2].event).not.toContain("정면으로 충돌");
    expect(canon.timeline[2].event).not.toContain("필요한 사람들");
    expect(canon.timeline[2].event).not.toContain("가장 가까운 사람");
  });

  it.each(pastLifeScenarios)("has a concrete causal story core for $id", (scenario: PastLifeScenario) => {
    for (const answerId of answerIds) {
      const canon = createLifeCanon(scenario, scenario.archetypeId, answerId);
      const middleLife = canon.timeline[2].event;

      expect(canon.turningPoint.length).toBeGreaterThan(45);
      expect(canon.turningPoint).toContain(scenario.pressureSource);
      expect(canon.turningPoint).toContain(scenario.signatureObject);
      expect(canon.decisiveAction.length).toBeGreaterThan(25);
      expect(canon.consequence.length).toBeGreaterThan(35);
      expect(middleLife).toContain(canon.turningPoint);
      expect(middleLife).toContain(canon.decisiveAction);
      expect(middleLife).toContain(canon.consequence);
      expect(middleLife).not.toMatch(/정면으로 충돌|필요한 사람들|새로운 일|수입 일부|가장 가까운 사람|누군가의 몫이나 진실/);
      expect(middleLife).not.toContain("습니다.,");
    }
  });
});
