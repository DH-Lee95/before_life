import { describe, expect, it } from "vitest";

import { normalizeSoulInput } from "@/lib/soul/normalizeInput";

describe("normalizeSoulInput", () => {
  it("normalizes nickname, date, birth time, and answers deterministically", () => {
    expect(
      normalizeSoulInput({
        nickname: "  DongHyun Lee  ",
        birthDate: "1995-03-04",
        birthTime: "",
        answers: {
          inner_response: "a",
          decision_pattern: "b",
          emotional_trace: "c",
          conflict_style: "a",
          hidden_desire: "d",
          repeated_theme: "b",
          decisive_choice: "a",
        },
      }).normalizedKey,
    ).toBe("donghyunlee|1995-03-04|unknown|a|b|c|a|d|b|a");
  });

  it("uses unicode normalization for Korean nicknames", () => {
    const composed = normalizeSoulInput({
      nickname: "가",
      birthDate: "1995-03-04",
      answers: {
        inner_response: "a",
        decision_pattern: "a",
        emotional_trace: "a",
        conflict_style: "a",
        hidden_desire: "a",
        repeated_theme: "a",
        decisive_choice: "a",
      },
    });

    const decomposed = normalizeSoulInput({
      nickname: "\u1100\u1161",
      birthDate: "1995-03-04",
      answers: {
        inner_response: "a",
        decision_pattern: "a",
        emotional_trace: "a",
        conflict_style: "a",
        hidden_desire: "a",
        repeated_theme: "a",
        decisive_choice: "a",
      },
    });

    expect(composed.normalizedKey).toBe(decomposed.normalizedKey);
  });

  it("creates a reading key that does not depend on the display nickname", () => {
    const input = {
      birthDate: "1995-03-04",
      answers: {
        inner_response: "a",
        decision_pattern: "a",
        emotional_trace: "a",
        conflict_style: "a",
        hidden_desire: "a",
        repeated_theme: "a",
        decisive_choice: "a",
      },
    } as const;

    expect(normalizeSoulInput({ ...input, nickname: "가" }).readingKey).toBe(
      normalizeSoulInput({ ...input, nickname: "나" }).readingKey,
    );
  });
});
