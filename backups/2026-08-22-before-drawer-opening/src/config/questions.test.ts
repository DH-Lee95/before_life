import { describe, expect, it } from "vitest";

import { questions } from "./questions";

describe("questions config", () => {
  it("contains seven non-leading question features", () => {
    expect(questions).toHaveLength(7);
    expect(questions.map((question) => question.id)).toEqual([
      "inner_response",
      "decision_pattern",
      "emotional_trace",
      "conflict_style",
      "hidden_desire",
      "repeated_theme",
      "familiar_person",
    ]);
  });
});
