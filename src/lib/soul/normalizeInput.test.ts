import { describe, expect, it } from "vitest";

import { normalizeSoulInput } from "./normalizeInput";

const answers = {
  inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d",
  hidden_desire: "e", repeated_theme: "f", decisive_choice: "a",
} as const;

describe("normalizeSoulInput", () => {
  it("includes gender in the deterministic reading key", () => {
    const female = normalizeSoulInput({ nickname: "서연", birthDate: "1994-11-18", gender: "female", answers });
    const male = normalizeSoulInput({ nickname: "서연", birthDate: "1994-11-18", gender: "male", answers });

    expect(female.gender).toBe("female");
    expect(female.readingKey).not.toBe(male.readingKey);
  });
});
