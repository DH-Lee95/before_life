import { describe, expect, it } from "vitest";

import { occupations, pastLifeWorlds, socialClasses } from "./soulEnginePools";

describe("soul engine pools", () => {
  it("has broad deterministic pools to avoid repetitive past-life settings", () => {
    expect(pastLifeWorlds.length).toBeGreaterThanOrEqual(30);
    expect(occupations.length).toBeGreaterThanOrEqual(40);
    expect(socialClasses.length).toBeGreaterThanOrEqual(12);
    expect(pastLifeWorlds).toContainEqual({ period: "19세기 말", region: "조선 후기 한양 외곽" });
    expect(pastLifeWorlds).not.toContainEqual(expect.objectContaining({ period: "15세기 후반", region: "조선 후기 한양 외곽" }));
  });
});
