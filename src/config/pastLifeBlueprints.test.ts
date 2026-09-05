import { describe, expect, it } from "vitest";

import { pastLifeBlueprints, validateLifeBlueprint } from "./pastLifeBlueprints";
import { decisionStyles, type ObjectRole } from "@/types/soul";

describe("pastLifeBlueprints", () => {
  it("provides all twenty scenarios as causally complete lives", () => {
    expect(Object.keys(pastLifeBlueprints)).toHaveLength(20);

    for (const [scenarioId, blueprint] of Object.entries(pastLifeBlueprints)) {
      expect(validateLifeBlueprint(blueprint), scenarioId).toEqual({ success: true, errors: [] });
      expect(Object.keys(blueprint.decisionActions).sort()).toEqual([...decisionStyles].sort());
      expect(blueprint.dramaticHook.length).toBeLessThanOrEqual(90);
      expect(blueprint.timeline.finalYears.summary).not.toBe(blueprint.aftermath);
      expect(blueprint.objectRole).toBeTruthy();
    }
  });

  it("does not make every representative object decisive evidence", () => {
    const roles: ObjectRole[] = Object.values(pastLifeBlueprints).map((blueprint) => blueprint.objectRole);

    expect(roles.filter((role) => role === "EVIDENCE").length).toBeLessThan(roles.length / 2);
    expect(new Set(roles).size).toBeGreaterThanOrEqual(4);
  });

  it("gives every antagonist a concrete motive and reason to target the protagonist", () => {
    for (const blueprint of Object.values(pastLifeBlueprints)) {
      expect(blueprint.antagonistMotive.length).toBeGreaterThan(25);
      expect(blueprint.antagonistInterestInProtagonist.length).toBeGreaterThan(25);
      expect(blueprint.noEasyExit.length).toBeGreaterThan(25);
      expect(blueprint.validation).toEqual({
        hasRelationshipReason: true,
        hasTrustReason: true,
        hasAntagonistMotive: true,
        hasNoEasyExit: true,
        hasEscalation: true,
        hasCost: true,
      });
    }
  });
});
