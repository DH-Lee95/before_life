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
        decisive_choice: "b",
      },
      { vitality: 61, relation: 40, ambition: 72, sensitivity: 35 },
    );

    expect(Object.values(traits).every((value) => value >= 0 && value <= 100)).toBe(true);
  });

  it("maps the meaning of each answer to the related traits", () => {
    const birthProfile = { vitality: 50, relation: 50, ambition: 50, sensitivity: 50 };
    const freedom = calculateTraits(
      {
        inner_response: "a",
        decision_pattern: "a",
        emotional_trace: "a",
        conflict_style: "a",
        hidden_desire: "a",
        repeated_theme: "e",
        decisive_choice: "d",
      },
      birthProfile,
    );
    const connection = calculateTraits(
      {
        inner_response: "c",
        decision_pattern: "c",
        emotional_trace: "c",
        conflict_style: "b",
        hidden_desire: "b",
        repeated_theme: "a",
        decisive_choice: "a",
      },
      birthProfile,
    );

    expect(freedom.independence).toBeGreaterThan(freedom.relation);
    expect(connection.relation).toBeGreaterThan(connection.independence);
  });

  it("uses birth data as a light texture instead of overriding explicit answers", () => {
    const answers = {
      inner_response: "c", decision_pattern: "c", emotional_trace: "c", conflict_style: "b",
      hidden_desire: "b", repeated_theme: "d", decisive_choice: "c",
    } as const;
    const lowBirth = calculateTraits(answers, { vitality: 35, relation: 35, ambition: 35, sensitivity: 35 });
    const highBirth = calculateTraits(answers, { vitality: 80, relation: 80, ambition: 80, sensitivity: 80 });

    expect(highBirth.relation - lowBirth.relation).toBeLessThanOrEqual(10);
    expect(highBirth.sensitivity - lowBirth.sensitivity).toBeLessThanOrEqual(10);
    expect(lowBirth.relation).toBeGreaterThan(lowBirth.independence);
    expect(highBirth.relation).toBeGreaterThan(highBirth.independence);
  });
});
