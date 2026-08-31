import { describe, expect, it } from "vitest";

import { initialTestFormState, testFormReducer } from "./testFormState";

describe("testFormReducer", () => {
  it("updates fields, answers, and navigation as one state", () => {
    const named = testFormReducer(initialTestFormState, { type: "set_field", field: "nickname", value: "서연" });
    const gendered = testFormReducer(named, { type: "set_gender", gender: "female" });
    const answered = testFormReducer(gendered, { type: "set_answer", questionId: "inner_response", answerId: "a" });
    const next = testFormReducer(answered, { type: "next" });

    expect(next.nickname).toBe("서연");
    expect(next.gender).toBe("female");
    expect(next.answers.inner_response).toBe("a");
    expect(next.step).toBe(1);
  });
});
