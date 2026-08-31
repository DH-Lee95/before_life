import { questions } from "@/config/questions";
import { questionIds, type AnswerId, type Gender, type SoulInput } from "@/types/soul";

const answerIds = new Set<AnswerId>(["a", "b", "c", "d", "e", "f"]);

export function validateSoulInput(value: unknown): SoulInput {
  if (!isRecord(value)) throw new Error("invalid soul input");

  const nickname = value.nickname;
  const birthDate = value.birthDate;
  const birthTime = value.birthTime;
  const gender = value.gender;
  const answers = value.answers;

  if (typeof nickname !== "string" || nickname.trim().length === 0 || nickname.trim().length > 30) {
    throw new Error("nickname is invalid");
  }
  if (typeof birthDate !== "string" || !isValidDate(birthDate)) {
    throw new Error("birthDate is invalid");
  }
  if (birthDate > new Date().toISOString().slice(0, 10)) {
    throw new Error("birthDate cannot be in the future");
  }
  if (gender !== "male" && gender !== "female") {
    throw new Error("gender is invalid");
  }
  const normalizedBirthTime = birthTime === "" ? undefined : birthTime;
  if (normalizedBirthTime !== undefined && (typeof normalizedBirthTime !== "string" || !isValidTime(normalizedBirthTime))) {
    throw new Error("birthTime is invalid");
  }
  if (!isRecord(answers)) throw new Error("answers are invalid");

  const validatedAnswers = {} as SoulInput["answers"];
  for (const question of questions) {
    const answer = answers[question.id];
    if (
      typeof answer !== "string" ||
      !answerIds.has(answer as AnswerId) ||
      !question.options.some((option) => option.id === answer)
    ) {
      throw new Error(`answer is invalid: ${question.id}`);
    }
    validatedAnswers[question.id] = answer as AnswerId;
  }

  for (const key of Object.keys(answers)) {
    if (!questionIds.includes(key as (typeof questionIds)[number])) {
      throw new Error("answers contain an unknown question");
    }
  }

  return {
    nickname,
    birthDate,
    gender: gender as Gender,
    birthTime: normalizedBirthTime,
    answers: validatedAnswers,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(":").map(Number);
  return hour <= 23 && minute <= 59;
}
