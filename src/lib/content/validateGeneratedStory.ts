import type { StoryNarrative, WholeLifeNarrative, WholeLifeStage } from "@/types/soul";

const BROKEN_KOREAN_PATTERNS = [
  /사람였습니다/,
  /기록원였던/,
  /재봉사이었던/,
  /생활으로/,
  /상인로(?:서|\s)/,
  /보조원로(?:서|\s)/,
  /마음이라는 감정/,
  /약속이라는 감정/,
  /작품이라는 감정/,
  /내 이름으로 선택/,
];

export type StoryValidationResult =
  | { success: true; data: StoryNarrative }
  | { success: false; issues: string[] };

export type WholeLifeValidationResult =
  | { success: true; data: WholeLifeNarrative }
  | { success: false; issues: string[] };

export function validateGeneratedStory(value: unknown): StoryValidationResult {
  const issues: string[] = [];

  if (!isRecord(value)) return { success: false, issues: ["결과가 JSON 객체가 아닙니다."] };

  const { title, opening, chapters, presentMeaning, readingTimeMinutes } = value;
  if (!isNonEmptyString(title)) issues.push("제목이 비어 있습니다.");
  if (!isNonEmptyString(opening) || opening.trim().length < 40) issues.push("도입 장면이 너무 짧습니다.");
  if (isNonEmptyString(opening) && containsStoryDisclosure(opening)) {
    issues.push("본문 도입부에 몰입을 깨는 서비스 고지문이 포함되어 있습니다.");
  }
  if (!Array.isArray(chapters) || chapters.length !== 3) {
    issues.push("본문은 정확히 3개 장이어야 합니다.");
  } else {
    chapters.forEach((chapter, index) => {
      if (!isRecord(chapter) || !isNonEmptyString(chapter.title)) {
        issues.push(`${index + 1}장 제목이 비어 있습니다.`);
        return;
      }
      if (!Array.isArray(chapter.paragraphs) || chapter.paragraphs.length !== 2 || !chapter.paragraphs.every(isNonEmptyString)) {
        issues.push(`${index + 1}장은 완성된 문단 2개가 필요합니다.`);
      }
    });
  }
  if (!isNonEmptyString(presentMeaning)) issues.push("현생 해석이 비어 있습니다.");
  if (!Number.isInteger(readingTimeMinutes) || Number(readingTimeMinutes) < 2 || Number(readingTimeMinutes) > 8) {
    issues.push("예상 읽기 시간은 2~8분 사이의 정수여야 합니다.");
  }

  const serialized = JSON.stringify(value);
  if (BROKEN_KOREAN_PATTERNS.some((pattern) => pattern.test(serialized))) {
    issues.push("부자연스러운 한국어 결합이 포함되어 있습니다.");
  }
  issues.push(...findReadabilityIssues(value));

  if (issues.length > 0) return { success: false, issues: [...new Set(issues)] };
  return { success: true, data: value as StoryNarrative };
}

export function validateGeneratedWholeLife(value: unknown): WholeLifeValidationResult {
  const issues: string[] = [];
  const stages: WholeLifeStage[] = ["유년기", "청년기", "중년기", "말년기"];

  if (!isRecord(value)) return { success: false, issues: ["결과가 JSON 객체가 아닙니다."] };

  const { title, opening, chapters, presentMeaning, readingTimeMinutes } = value;
  if (!isNonEmptyString(title)) issues.push("제목이 비어 있습니다.");
  if (!isNonEmptyString(opening) || opening.trim().length < 40) issues.push("도입 장면이 너무 짧습니다.");
  if (isNonEmptyString(opening) && containsStoryDisclosure(opening)) {
    issues.push("본문 도입부에 몰입을 깨는 서비스 고지문이 포함되어 있습니다.");
  }

  const hasOrderedStages = Array.isArray(chapters)
    && chapters.length === stages.length
    && chapters.every((chapter, index) => isRecord(chapter) && chapter.stage === stages[index]);
  if (!hasOrderedStages) {
    issues.push("일생은 유년기, 청년기, 중년기, 말년기 순서의 정확히 4개 장이어야 합니다.");
  }

  if (Array.isArray(chapters)) {
    chapters.forEach((chapter, index) => {
      if (!isRecord(chapter) || !isNonEmptyString(chapter.title)) {
        issues.push(`${index + 1}장 제목이 비어 있습니다.`);
        return;
      }
      if (!Array.isArray(chapter.paragraphs) || chapter.paragraphs.length < 3 || chapter.paragraphs.length > 4 || !chapter.paragraphs.every(isNonEmptyString)) {
        issues.push(`${index + 1}장은 완성된 문단 3~4개가 필요합니다.`);
      }
    });
  }

  if (!isNonEmptyString(presentMeaning)) issues.push("현생 해석이 비어 있습니다.");
  if (!Number.isInteger(readingTimeMinutes) || Number(readingTimeMinutes) < 8 || Number(readingTimeMinutes) > 12) {
    issues.push("예상 읽기 시간은 8~12분 사이의 정수여야 합니다.");
  }

  const narrativeLength = collectNarrativeTextLength(value);
  if (narrativeLength < 3000 || narrativeLength > 5500) {
    issues.push("일생 본문의 분량이 3,000~5,500자 범위를 벗어났습니다.");
  }

  const serialized = JSON.stringify(value);
  if (BROKEN_KOREAN_PATTERNS.some((pattern) => pattern.test(serialized))) {
    issues.push("부자연스러운 한국어 결합이 포함되어 있습니다.");
  }
  issues.push(...findReadabilityIssues(value));

  if (issues.length > 0) return { success: false, issues: [...new Set(issues)] };
  return { success: true, data: value as WholeLifeNarrative };
}

export function createStoryRepairPrompt(value: unknown, issues: string[]): string {
  return `아래 글의 내용과 JSON 구조는 유지하고, 지적된 문제만 고쳐서 완전한 JSON으로 다시 작성하라.
새로운 인물이나 사건을 추가하지 말고 한국어 조사, 어미, 주어와 서술어의 호응을 자연스럽게 다듬어라.
누가 무엇을 했는지 바로 이해되게 쓰고, 설명되지 않은 추상어는 원문에 이미 있는 구체적인 사람, 사건, 물건으로 바꿔라.
긴 문장은 핵심 행동이 하나씩 남도록 두 문장 이상으로 나눠라.

[수정할 문제]
${issues.map((issue) => `- ${issue}`).join("\n")}

[원문]
${JSON.stringify(value)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function collectNarrativeTextLength(value: Record<string, unknown>): number {
  const texts: string[] = [];
  for (const field of [value.title, value.opening, value.presentMeaning]) {
    if (typeof field === "string") texts.push(field);
  }
  if (Array.isArray(value.chapters)) {
    for (const chapter of value.chapters) {
      if (!isRecord(chapter)) continue;
      if (typeof chapter.title === "string") texts.push(chapter.title);
      if (Array.isArray(chapter.paragraphs)) {
        texts.push(...chapter.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === "string"));
      }
    }
  }
  return texts.join("\n").length;
}

function findReadabilityIssues(value: Record<string, unknown>): string[] {
  const issues: string[] = [];
  const abstractWords = /고백|증거|혼란|기록|진실|대가/g;

  for (const text of collectNarrativeTexts(value)) {
    const sentences = text.split(/(?<=[.!?])\s*/).filter(Boolean);
    for (const sentence of sentences) {
      if (sentence.length > 120) {
        issues.push("한 문장이 너무 길어 내용을 한 번에 이해하기 어렵습니다.");
      }
      if ((sentence.match(abstractWords) ?? []).length >= 3) {
        issues.push("설명되지 않은 추상적인 말이 한 문장에 너무 많이 포함되어 있습니다.");
      }
    }
  }

  return [...new Set(issues)];
}

function collectNarrativeTexts(value: Record<string, unknown>): string[] {
  const texts = [value.title, value.opening, value.presentMeaning]
    .filter((field): field is string => typeof field === "string");
  if (!Array.isArray(value.chapters)) return texts;

  for (const chapter of value.chapters) {
    if (!isRecord(chapter)) continue;
    if (typeof chapter.title === "string") texts.push(chapter.title);
    if (Array.isArray(chapter.paragraphs)) {
      texts.push(...chapter.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === "string"));
    }
  }
  return texts;
}

function containsStoryDisclosure(opening: string): boolean {
  return /(?:이 이야기|이 글).{0,80}(?:허구|점술적 사실|역사적 사실)/.test(opening);
}
