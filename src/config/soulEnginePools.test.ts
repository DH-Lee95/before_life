import { describe, expect, it } from "vitest";

import { occupations, pastLifeWorlds } from "./soulEnginePools";

describe("soul engine pools", () => {
  it("has enough deterministic options to avoid obvious one-to-one mapping", () => {
    expect(pastLifeWorlds.length).toBeGreaterThan(5);
    expect(occupations.length).toBeGreaterThan(8);
    expect(pastLifeWorlds).toContainEqual({ period: "19세기 말", region: "조선 후기 한양 외곽" });
    expect(pastLifeWorlds).not.toContainEqual(expect.objectContaining({ period: "15세기 후반", region: "조선 후기 한양 외곽" }));
  });
});
