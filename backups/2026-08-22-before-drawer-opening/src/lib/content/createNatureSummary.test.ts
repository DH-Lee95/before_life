import { describe, expect, it } from "vitest";

import { createNatureSummary } from "./createNatureSummary";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";

const input = {
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
  } as const,
};

describe("createNatureSummary", () => {
  it("creates a stable summary that starts with a human-readable nature statement", () => {
    const first = createNatureSummary(createSoulProfile(input));
    const second = createNatureSummary(createSoulProfile(input));

    expect(first).toEqual(second);
    expect(first.headline).toMatch(/^당신은 .+한 사람입니다\.$/);
    expect(first.signals).toHaveLength(3);
    expect(first.pastLifeBridge).toContain("첫 번째 서랍");
  });
});
