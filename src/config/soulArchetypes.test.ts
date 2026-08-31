import { describe, expect, it } from "vitest";

import { soulArchetypes } from "./soulArchetypes";

describe("soulArchetypes", () => {
  it("provides content pools for every archetype", () => {
    expect(soulArchetypes).toHaveLength(10);
    expect(soulArchetypes.every((item) => item.occupations.length >= 8)).toBe(true);
    expect(soulArchetypes.every((item) => item.locations.length >= 8)).toBe(true);
    expect(soulArchetypes.every((item) => item.hiddenNatures.length >= 8)).toBe(true);
    expect(soulArchetypes.every((item) => item.coreThemes.length >= 8)).toBe(true);
    expect(
      soulArchetypes.flatMap((item) => item.coreThemes).every(
        (theme) =>
          theme.label.length >= 6 &&
          /[.!?]$/.test(theme.description) &&
          !theme.label.includes("내 이름으로 선택"),
      ),
    ).toBe(true);
  });
});
