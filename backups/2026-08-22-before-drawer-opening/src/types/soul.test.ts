import { describe, expect, it } from "vitest";

import type { SoulInput } from "./soul";

describe("soul types", () => {
  it("accepts the phase 1 input contract", () => {
    const input: SoulInput = {
      nickname: "서연",
      birthDate: "1994-11-18",
      answers: {
        inner_response: "a",
        decision_pattern: "b",
        emotional_trace: "c",
        conflict_style: "d",
        hidden_desire: "e",
        repeated_theme: "f",
        familiar_person: "b",
      },
    };

    expect(input.answers.hidden_desire).toBe("e");
  });
});
