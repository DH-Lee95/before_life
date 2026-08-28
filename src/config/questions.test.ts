import { describe, expect, it } from "vitest";

import { questions } from "./questions";

describe("questions config", () => {
  it("contains seven user-facing question features", () => {
    expect(questions).toHaveLength(7);
    expect(questions.map((question) => question.id)).toEqual([
      "inner_response",
      "decision_pattern",
      "emotional_trace",
      "conflict_style",
      "hidden_desire",
      "repeated_theme",
      "decisive_choice",
    ]);
    expect(questions.at(-1)?.title).toContain("무엇을 지키");
    expect(questions.map((question) => question.helper).join(" ")).not.toMatch(/콘텐츠|점수|결과를 직접/);
  });
});
