import { describe, expect, it } from "vitest";

import { validateSoulInput } from "./validateSoulInput";

const validInput = {
  nickname: "서연",
  birthDate: "1994-11-18",
  birthTime: "09:30",
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

describe("validateSoulInput", () => {
  it("accepts the public input contract", () => {
    expect(validateSoulInput(validInput)).toEqual(validInput);
  });

  it.each([
    ["missing nickname", { ...validInput, nickname: "" }],
    ["invalid date", { ...validInput, birthDate: "1994-02-31" }],
    ["invalid time", { ...validInput, birthTime: "25:00" }],
    ["unknown answer", { ...validInput, answers: { ...validInput.answers, inner_response: "z" } }],
  ])("rejects %s", (_label, input) => {
    expect(() => validateSoulInput(input)).toThrow();
  });
});
