import { describe, expect, it } from "vitest";

import { pastLifeScenarios, type PastLifeScenario } from "@/config/pastLifeScenarios";
import type { AnswerId, DecisionStyle } from "@/types/soul";
import { createLifeCanon } from "./createLifeCanon";

const answerIds: AnswerId[] = ["a", "b", "c", "d", "e", "f"];

describe("createLifeCanon", () => {
  it("maps answer ids to stable decision styles", () => {
    const expected: DecisionStyle[] = ["ALLY", "TRUTH", "COMMUNITY", "DEFIANCE", "DEPARTURE", "RESTORATION"];

    expect(answerIds.map((answerId) => createLifeCanon(pastLifeScenarios[0], "pioneer", answerId).decisionStyle)).toEqual(expected);
  });

  it("uses scenario-specific actions for the same decision style", () => {
    const scotland = pastLifeScenarios.find((item) => item.id === "scholar-scotland-school")!;
    const venice = pastLifeScenarios.find((item) => item.id === "artisan-venice-glass")!;
    const scotlandAction = createLifeCanon(scotland, scotland.archetypeId, "d").decisiveAction;
    const veniceAction = createLifeCanon(venice, venice.archetypeId, "d").decisiveAction;

    expect(scotlandAction).not.toBe(veniceAction);
    expect(scotlandAction).toMatch(/교구|마을|관리인|증언/);
    expect(veniceAction).toMatch(/공방|주문|화로|유리/);
  });

  it("attaches the blueprint and seven distinct life stages to upgraded scenarios", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "scholar-scotland-school")!;
    const canon = createLifeCanon(scenario, scenario.archetypeId, "a");

    expect(canon.storySchemaVersion).toBe("life-blueprint.v1");
    expect(canon.lifeBlueprint?.trustReason).toMatch(/때문|동안|먼저|직접/);
    expect(Object.keys(canon.lifeTimeline ?? {})).toEqual([
      "youth", "earlyAdult", "keyRelationship", "centralConflict", "aftermath", "laterLife", "finalYears",
    ]);
  });

  it.each(pastLifeScenarios)("attaches the blueprint renderer contract to $id", (scenario) => {
    const canon = createLifeCanon(scenario, scenario.archetypeId, "c");

    expect(canon.storySchemaVersion).toBe("life-blueprint.v1");
    expect(canon.lifeBlueprint).toBeTruthy();
    expect(canon.lifeTimeline).toBeTruthy();
  });

  it("turns one historical scenario into a complete reusable timeline", () => {
    const scenario = pastLifeScenarios[0];
    const canon = createLifeCanon(scenario, "pioneer", "e");

    expect(canon.scenarioId).toBe(scenario.id);
    expect(canon.sharedObject).toBe(scenario.signatureObject);
    expect(canon.turningPoint).toContain(scenario.pressureSource);
    expect(canon.timeline.map((item) => item.stage)).toEqual(["유년기", "청년기", "중년기", "말년기"]);
    expect(canon.timeline[1].event).toContain(`${canon.keyRelationship}와 가까워졌습니다`);
    expect(canon.timeline[1].event).not.toContain(`${canon.keyRelationship}과 가까워졌습니다`);
  });

  it("uses the scenario's concrete relationship instead of an archetype stock character", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "scholar-scotland-school")!;
    const canon = createLifeCanon(scenario, "scholar", "b");

    expect(canon.keyRelationship).toContain("상속녀");
    expect(canon.dramaticHook).toMatch(/실종|사라/);
    expect(canon.hookKeywords).toEqual(expect.arrayContaining(["강요된 혼인", "감금"]));
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

  it("builds the Scottish scholar story around a coerced disappearance", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "scholar-scotland-school")!;
    const canon = createLifeCanon(scenario, "scholar", "e");

    expect(canon.turningPoint).toContain("스스로 달아났다고 증언");
    expect(canon.turningPoint).toContain("위조된 토지 증서");
    expect(canon.decisiveAction).toContain("에든버러");
    expect(canon.decisiveAction).toContain("감금 사실");
    expect(canon.lifeBlueprint?.actualLoss).toContain("교사 자리");
    expect(canon.consequence).toContain("학교");
    expect(JSON.stringify(canon)).not.toMatch(/표본첩|식물 관찰/);
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
      expect(canon.dramaticHook.length).toBeGreaterThan(30);
      expect(canon.hookKeywords.length).toBeGreaterThanOrEqual(3);
      expect(middleLife).toContain(canon.turningPoint);
      expect(middleLife).toContain(canon.decisiveAction);
      expect(middleLife).toContain(canon.consequence);
      expect(middleLife).not.toMatch(/정면으로 충돌|필요한 사람들|새로운 일|수입 일부|가장 가까운 사람|누군가의 몫이나 진실/);
      expect(middleLife).not.toContain("습니다.,");
    }
  });
});
