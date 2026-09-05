import { describe, expect, it } from "vitest";

import { pastLifeScenarios } from "./pastLifeScenarios";
import { pastLifeStoryCores } from "./pastLifeStoryCores";

describe("pastLifeStoryCores", () => {
  it("provides one authored causal core for every selectable scenario", () => {
    expect(Object.keys(pastLifeStoryCores).sort()).toEqual(
      pastLifeScenarios.map((scenario) => scenario.id).sort(),
    );
  });

  it("gives every scenario its own relationship-led dramatic hook", () => {
    const relationships = Object.values(pastLifeStoryCores).map((core) => core.keyRelationship);

    expect(new Set(relationships).size).toBe(relationships.length);
    for (const core of Object.values(pastLifeStoryCores)) {
      expect(core.dramaticHook.length).toBeGreaterThan(30);
      expect(core.hookKeywords.length).toBeGreaterThanOrEqual(3);
      expect(core.hookKeywords.every((keyword) => keyword.trim().length >= 2)).toBe(true);
    }
  });

  it("makes the Scottish scholar story about a disappearance and coercion, not schoolwork", () => {
    const core = pastLifeStoryCores["scholar-scotland-school"];

    expect(core.keyRelationship).toContain("상속녀");
    expect(core.dramaticHook).toMatch(/실종|사라/);
    expect(core.hookKeywords).toEqual(expect.arrayContaining(["강요된 혼인", "감금", "위조된 토지 증서"]));
    expect(JSON.stringify(core)).not.toMatch(/아이|학생|제자|표본첩|식물 관찰/);
  });
});
