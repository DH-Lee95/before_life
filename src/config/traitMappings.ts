import type { AnswerId, QuestionId, SoulTraits } from "@/types/soul";

type TraitDelta = Partial<Record<keyof SoulTraits, number>>;

export const traitMappings: Record<QuestionId, Partial<Record<AnswerId, TraitDelta>>> = {
  inner_response: {
    a: { independence: 12, vitality: 5 }, b: { sensitivity: 10, longing: 7, restraint: 4 },
    c: { relation: 12, vitality: 4 }, d: { ambition: 10, vitality: 7 }, e: { restraint: 8, sensitivity: 4 },
  },
  decision_pattern: {
    a: { sensitivity: 9, independence: 3 }, b: { restraint: 11, ambition: 4 },
    c: { relation: 12, sensitivity: 3 }, d: { ambition: 10, vitality: 7 }, e: { restraint: 7, longing: 4, sensitivity: 2 },
  },
  emotional_trace: {
    a: { longing: 14, sensitivity: 5 }, b: { sensitivity: 8, restraint: 4 },
    c: { restraint: 10, relation: 6, ambition: 4 }, d: { vitality: 10, ambition: 6 }, e: { longing: 9, sensitivity: 8 },
  },
  conflict_style: {
    a: { restraint: 10, independence: 5 }, b: { relation: 8, vitality: 5 },
    c: { restraint: 12, relation: 3 }, d: { independence: 12, restraint: 4 }, e: { ambition: 7, independence: 4 },
  },
  hidden_desire: {
    a: { independence: 18, vitality: 5 }, b: { relation: 14, sensitivity: 8 },
    c: { ambition: 10, restraint: 6 }, d: { ambition: 18, vitality: 7 }, e: { independence: 12, restraint: 10 },
  },
  repeated_theme: {
    a: { relation: 10, longing: 10 }, b: { restraint: 8, ambition: 5 }, c: { ambition: 12 },
    d: { relation: 9, restraint: 8 }, e: { independence: 10, vitality: 8 }, f: { ambition: 8, sensitivity: 6, restraint: 5 },
  },
  decisive_choice: {
    a: { relation: 12, longing: 5 }, b: { independence: 10, restraint: 5 },
    c: { relation: 9, restraint: 8 }, d: { ambition: 12, restraint: 4 },
    e: { independence: 14, vitality: 6 },
  },
};
