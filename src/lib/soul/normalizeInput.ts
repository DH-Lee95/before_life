import { questionIds, type NormalizedSoulInput, type SoulInput } from "@/types/soul";

export const INPUT_VERSION = "2026-08-31.v3";

function normalizeNickname(nickname: string): string {
  return nickname.normalize("NFC").trim().replace(/\s+/g, "").toLowerCase();
}

function normalizeBirthDate(birthDate: string): string {
  const trimmed = birthDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("birthDate must be YYYY-MM-DD");
  }

  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== trimmed) {
    throw new Error("birthDate is invalid");
  }

  return trimmed;
}

function normalizeBirthTime(birthTime?: string): string {
  const value = birthTime?.trim();
  if (!value) {
    return "unknown";
  }

  if (!/^\d{2}:\d{2}$/.test(value)) {
    throw new Error("birthTime must be HH:mm or omitted");
  }

  const [hour, minute] = value.split(":").map(Number);
  if (hour > 23 || minute > 59) {
    throw new Error("birthTime is invalid");
  }

  return value;
}

export function normalizeSoulInput(input: SoulInput): NormalizedSoulInput {
  const nickname = normalizeNickname(input.nickname);
  const birthDate = normalizeBirthDate(input.birthDate);
  const birthTime = normalizeBirthTime(input.birthTime);
  const gender = input.gender ?? "female";
  const answers = input.answers;

  for (const questionId of questionIds) {
    if (!answers[questionId]) {
      throw new Error(`missing answer: ${questionId}`);
    }
  }

  const answerKey = questionIds.map((questionId) => answers[questionId]).join("|");
  const readingKey = `${birthDate}|${birthTime}|${gender}|${answerKey}`;

  return {
    nickname,
    birthDate,
    birthTime,
    gender,
    answers,
    normalizedKey: `${nickname}|${readingKey}`,
    readingKey,
  };
}
