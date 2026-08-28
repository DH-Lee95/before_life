import type { AnswerMap, BirthProfile, SoulTraits } from "@/types/soul";

const weights: Record<keyof AnswerMap, Partial<Record<keyof SoulTraits, number>>> = {
  inner_response: { independence: 10, sensitivity: 5, longing: 4 },
  decision_pattern: { restraint: 7, ambition: 6, relation: 5 },
  emotional_trace: { longing: 10, sensitivity: 7, relation: 4 },
  conflict_style: { restraint: 10, independence: 6, sensitivity: 4 },
  hidden_desire: { ambition: 9, independence: 8, longing: 6 },
  repeated_theme: { longing: 8, relation: 7, ambition: 5 },
  familiar_person: { relation: 9, sensitivity: 5, longing: 3 },
};

const answerBias = {
  a: -6,
  b: 2,
  c: 6,
  d: 11,
  e: -1,
  f: 8,
} as const;

export function calculateTraits(answers: AnswerMap, birthProfile: BirthProfile): SoulTraits {
  const traits: SoulTraits = {
    vitality: birthProfile.vitality,
    relation: birthProfile.relation,
    ambition: birthProfile.ambition,
    sensitivity: birthProfile.sensitivity,
    independence: 48,
    restraint: 48,
    longing: 48,
  };

  for (const [questionId, answerId] of Object.entries(answers) as Array<[keyof AnswerMap, keyof typeof answerBias]>) {
    const bias = answerBias[answerId];
    const questionWeights = weights[questionId];
    for (const [traitKey, weight] of Object.entries(questionWeights) as Array<[keyof SoulTraits, number]>) {
      traits[traitKey] = clamp(traits[traitKey] + weight + bias);
    }
  }

  return traits;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
