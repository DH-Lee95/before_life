import type { AnswerId, Gender, QuestionId } from "@/types/soul";

export type DraftAnswers = Partial<Record<QuestionId, AnswerId>>;
export type TestFormState = {
  step: number;
  nickname: string;
  birthDate: string;
  birthTime: string;
  gender: Gender | "";
  answers: DraftAnswers;
};

export const initialTestFormState: TestFormState = {
  step: 0,
  nickname: "",
  birthDate: "",
  birthTime: "",
  gender: "",
  answers: {},
};

export type TestFormAction =
  | { type: "set_field"; field: "nickname" | "birthDate" | "birthTime"; value: string }
  | { type: "set_gender"; gender: Gender }
  | { type: "set_answer"; questionId: QuestionId; answerId: AnswerId }
  | { type: "next" }
  | { type: "previous" }
  | { type: "restore"; state: TestFormState };

export function testFormReducer(state: TestFormState, action: TestFormAction): TestFormState {
  switch (action.type) {
    case "set_field": return { ...state, [action.field]: action.value };
    case "set_gender": return { ...state, gender: action.gender };
    case "set_answer": return { ...state, answers: { ...state.answers, [action.questionId]: action.answerId } };
    case "next": return { ...state, step: state.step + 1 };
    case "previous": return { ...state, step: Math.max(0, state.step - 1) };
    case "restore": return action.state;
  }
}

export function isTestFormState(value: unknown): value is TestFormState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as Partial<TestFormState>;
  return Number.isInteger(state.step) && (state.step as number) >= 0 && (state.step as number) <= 7
    && typeof state.nickname === "string" && typeof state.birthDate === "string"
    && typeof state.birthTime === "string" && (state.gender === "male" || state.gender === "female")
    && typeof state.answers === "object" && state.answers !== null;
}
