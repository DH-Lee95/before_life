import { describe, expect, it } from "vitest";

import { soulArchetypeIds, type PublicSoulProfile, type SoulArchetypeId, type SoulInput } from "./soul";

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
        decisive_choice: "b",
      },
    };

    expect(input.answers.hidden_desire).toBe("e");
  });

  it("defines the free result public contract", () => {
    const archetype: SoulArchetypeId = "chronicler";
    const profile: PublicSoulProfile = { displaySoulId: "#ABC123", discoveryPercent: 17 };

    expect(archetype).toBe("chronicler");
    expect(profile.discoveryPercent).toBe(17);
    expect(soulArchetypeIds).toContain(archetype);
  });
});
