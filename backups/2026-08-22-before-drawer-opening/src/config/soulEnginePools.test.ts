import { describe, expect, it } from "vitest";

import { occupations, periods, regions } from "./soulEnginePools";

describe("soul engine pools", () => {
  it("has enough deterministic options to avoid obvious one-to-one mapping", () => {
    expect(periods.length).toBeGreaterThan(5);
    expect(regions.length).toBeGreaterThan(8);
    expect(occupations.length).toBeGreaterThan(8);
  });
});
