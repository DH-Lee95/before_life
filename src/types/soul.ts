export const questionIds = [
  "inner_response",
  "decision_pattern",
  "emotional_trace",
  "conflict_style",
  "hidden_desire",
  "repeated_theme",
  "decisive_choice",
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
  readingKey: string;
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
  detail: string;
  hiddenInstinct: string;
  attractionPattern: string;
  taste: string;
  pastLifeBridge: string;
};

export type PastLifeRecord = {
  period: string;
  region: string;
  location: string;
  occupation: string;
  socialClass: string;
  hiddenNature: string;
  coreTheme: NarrativeTheme;
};

export type NarrativeTheme = {
  label: string;
  description: string;
};

export const soulArchetypeIds = [
  "pioneer", "chronicler", "caretaker", "artisan", "merchant",
  "wayfinder", "scholar", "steward", "performer", "visionary",
] as const;
export type SoulArchetypeId = (typeof soulArchetypeIds)[number];

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
  archetypeId: SoulArchetypeId;
  birthProfile: BirthProfile;
  natureSummary: NatureSummary;
  mainPastLife: PastLifeRecord;
  decisiveChoice: AnswerId;
  recommendedContentType: LockedContentType;
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
    love: string;
    success: string;
    compatibility: string;
    preference: string;
    wholeLife: WholeLifePreview;
    records: DeepDiveRecord[];
  };
};

export type WholeLifeStage = "유년기" | "청년기" | "중년기" | "말년기";

export type WholeLifePreview = {
  id: "whole_life";
  title: string;
  description: string;
  chapterPreviews: Array<{
    stage: WholeLifeStage;
    title: string;
  }>;
  readingTimeMinutes: number;
  soulCost: 2;
  isUnlocked: false;
};

export type DeepDiveRecord =
  | (StoryNarrative & {
      id: LockedContentType;
      title: string;
      isUnlocked: true;
    })
  | {
      id: LockedContentType;
      title: string;
      hint: string;
      preview: string;
      readingTimeMinutes: number;
      isUnlocked: false;
    };

export type StoryNarrative = {
  title: string;
  opening: string;
  chapters: Array<{
    title: string;
    paragraphs: string[];
  }>;
  presentMeaning: string;
  readingTimeMinutes: number;
};

export type WholeLifeNarrative = Omit<StoryNarrative, "chapters"> & {
  chapters: Array<{
    stage: WholeLifeStage;
    title: string;
    paragraphs: string[];
  }>;
};

export type PublicSoulProfile = Pick<SoulProfile, "displaySoulId" | "discoveryPercent">;

export type LockedContentType =
  | "past_love"
  | "last_day"
  | "wealth_status"
  | "karma_trace"
  | "present_influence"
  | "decisive_choice";

export type SoulContentType = "free_summary" | "whole_life" | LockedContentType;

export type SoulContent = {
  soulProfileId: string;
  contentType: SoulContentType;
  content: FreeResultContent | StoryNarrative | WholeLifeNarrative | string;
  isUnlocked: boolean;
  createdAt: string;
};
