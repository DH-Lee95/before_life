import type { AnswerMap, BirthProfile, SoulTraits } from "@/types/soul";
import { traitMappings } from "@/config/traitMappings";

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

  for (const [questionId, answerId] of Object.entries(answers) as Array<[keyof AnswerMap, AnswerMap[keyof AnswerMap]]>) {
    const deltas = traitMappings[questionId][answerId];
    if (!deltas) continue;
    for (const [traitKey, delta] of Object.entries(deltas) as Array<[keyof SoulTraits, number]>) {
      traits[traitKey] = clamp(traits[traitKey] + delta);
    }
  }

  return traits;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
