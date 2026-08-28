export const questionIds = [
  "inner_response",
  "decision_pattern",
  "emotional_trace",
  "conflict_style",
  "hidden_desire",
  "repeated_theme",
  "familiar_person",
] as const;

export type QuestionId = (typeof questionIds)[number];
export type AnswerId = "a" | "b" | "c" | "d" | "e" | "f";
export type AnswerMap = Record<QuestionId, AnswerId>;

export type SoulInput = {
  nickname: string;
  birthDate: string;
  birthTime?: string;
  answers: AnswerMap;
};

export type NormalizedSoulInput = {
  nickname: string;
  birthDate: string;
  birthTime: string;
  answers: AnswerMap;
  normalizedKey: string;
};

export type SoulTraits = {
  vitality: number;
  relation: number;
  ambition: number;
  sensitivity: number;
  independence: number;
  restraint: number;
  longing: number;
};

export type BirthProfile = {
  vitality: number;
  relation: number;
  ambition: number;
  sensitivity: number;
};

export type NatureSummary = {
  headline: string;
  signals: string[];
  pastLifeBridge: string;
};

export type PastLifeRecord = {
  period: string;
  region: string;
  location: string;
  occupation: string;
  socialClass: string;
  hiddenNature: string;
  emotionalCore: string;
  isFaint: boolean;
};

export type SoulProfile = {
  id?: string;
  inputVersion: string;
  engineVersion: string;
  soulHash: string;
  displaySoulId: string;
  nickname: string;
  birthDate: string;
  birthTime: string;
  traits: SoulTraits;
  birthProfile: BirthProfile;
  natureSummary: NatureSummary;
  mainPastLife: PastLifeRecord;
  faintRecords: PastLifeRecord[];
  discoveryPercent: number;
};

export type FreeResultContent = {
  title: string;
  summary: string;
  natureSummary: NatureSummary;
  sections: {
    location: string;
    occupation: string;
    atmosphere: string;
    faintRecords: Array<{
      label: string;
      hint: string;
    }>;
    lockedHints: Array<{
      id: LockedContentType;
      title: string;
      hint: string;
    }>;
  };
};

export type LockedContentType =
  | "past_love"
  | "last_day"
  | "wealth_status"
  | "karma_trace"
  | "present_influence"
  | "second_life";

export type SoulContentType = "free_summary" | LockedContentType;

export type SoulContent = {
  soulProfileId: string;
  contentType: SoulContentType;
  content: FreeResultContent | string;
  isUnlocked: boolean;
  createdAt: string;
};
