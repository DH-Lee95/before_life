import { describe, expect, it } from "vitest";

import { pastLifeScenarios } from "@/config/pastLifeScenarios";
import { createLifeCanon } from "./createLifeCanon";

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
});
