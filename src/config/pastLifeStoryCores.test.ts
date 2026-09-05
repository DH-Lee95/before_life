import { describe, expect, it } from "vitest";

import { pastLifeScenarios } from "./pastLifeScenarios";
import { pastLifeStoryCores } from "./pastLifeStoryCores";

describe("pastLifeStoryCores", () => {
  it("provides one authored causal core for every selectable scenario", () => {
    expect(Object.keys(pastLifeStoryCores).sort()).toEqual(
      pastLifeScenarios.map((scenario) => scenario.id).sort(),
    );
  });
});
