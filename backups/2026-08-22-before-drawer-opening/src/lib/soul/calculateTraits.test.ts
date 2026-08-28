import { describe, expect, it } from "vitest";

import { calculateTraits } from "./calculateTraits";

describe("calculateTraits", () => {
  it("returns bounded trait scores", () => {
    const traits = calculateTraits(
      {
        inner_response: "a",
        decision_pattern: "b",
        emotional_trace: "c",
        conflict_style: "d",
        hidden_desire: "e",
        repeated_theme: "f",
        familiar_person: "b",
      },
      { vitality: 61, relation: 40, ambition: 72, sensitivity: 35 },
    );

    expect(Object.values(traits).every((value) => value >= 0 && value <= 100)).toBe(true);
  });
});
