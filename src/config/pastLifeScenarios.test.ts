import { describe, expect, it } from "vitest";

import { pastLifeScenarios } from "./pastLifeScenarios";
import { soulArchetypeIds } from "@/types/soul";

describe("pastLifeScenarios", () => {
  it("provides multiple fully anchored historical lives for every archetype", () => {
    for (const archetypeId of soulArchetypeIds) {
      const scenarios = pastLifeScenarios.filter((scenario) => scenario.archetypeId === archetypeId);
      expect(scenarios.length).toBeGreaterThanOrEqual(2);
      expect(scenarios.every((scenario) => (
        scenario.historicalContext.length > 20
        && scenario.occupationPath.length > 20
        && scenario.meetingReason.length > 10
        && scenario.historicalTerms.length >= 3
      ))).toBe(true);
    }
  });

  it("does not reuse scenario ids", () => {
    expect(new Set(pastLifeScenarios.map((scenario) => scenario.id)).size).toBe(pastLifeScenarios.length);
  });

  it("does not treat pressed olive oil as seed stock", () => {
    const scenario = pastLifeScenarios.find((item) => item.id === "steward-greece-olive")!;

    expect(JSON.stringify(scenario)).not.toContain("종자용 기름");
  });
});
