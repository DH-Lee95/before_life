import { describe, expect, it } from "vitest";

import { createFreeResult } from "./createFreeResult";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";

describe("createFreeResult", () => {
  it("reveals location and occupation while keeping locked topics closed", () => {
    const content = createFreeResult(
      createSoulProfile({
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
      }),
    );

    expect(content.sections.location).toBeTruthy();
    expect(content.sections.occupation).toBeTruthy();
    expect(content.sections.lockedHints).toHaveLength(5);
    expect(content.sections.atmosphere).not.toContain("사람였습니다");
  });
});
