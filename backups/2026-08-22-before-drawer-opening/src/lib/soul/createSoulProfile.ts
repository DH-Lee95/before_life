import {
  emotionalCores,
  hiddenNatures,
  locations,
  occupations,
  periods,
  regions,
  socialClasses,
} from "@/config/soulEnginePools";
import type { PastLifeRecord, SoulInput, SoulProfile, SoulTraits } from "@/types/soul";
import { calculateBirthProfile } from "./calculateBirthProfile";
import { calculateTraits } from "./calculateTraits";
import { createNatureSummary } from "@/lib/content/createNatureSummary";
import { createSeededRandom } from "./seededRandom";
import { createSoulId } from "./createSoulId";
import { INPUT_VERSION, normalizeSoulInput } from "./normalizeInput";

export const ENGINE_VERSION = "soul-engine.2026-08-18.v1";

export function createSoulProfile(input: SoulInput): SoulProfile {
  const normalized = normalizeSoulInput(input);
  const { soulHash, displaySoulId } = createSoulId(`${INPUT_VERSION}|${ENGINE_VERSION}|${normalized.normalizedKey}`);
  const birthProfile = calculateBirthProfile(normalized.birthDate, normalized.birthTime);
  const traits = calculateTraits(normalized.answers, birthProfile);
  const natureSummary = createNatureSummary({ traits });
  const random = createSeededRandom(soulHash);

  const mainPastLife = createRecord(random, traits, false);
  const faintRecords = [
    createRecord(createSeededRandom(`${soulHash}:faint:1`), traits, true),
    createRecord(createSeededRandom(`${soulHash}:faint:2`), traits, true),
  ];

  return {
    inputVersion: INPUT_VERSION,
    engineVersion: ENGINE_VERSION,
    soulHash,
    displaySoulId,
    nickname: normalized.nickname,
    birthDate: normalized.birthDate,
    birthTime: normalized.birthTime,
    birthProfile,
    natureSummary,
    traits,
    mainPastLife,
    faintRecords,
    discoveryPercent: 18,
  };
}

function createRecord(
  random: ReturnType<typeof createSeededRandom>,
  traits: SoulTraits,
  isFaint: boolean,
): PastLifeRecord {
  const occupationShift = Math.floor((traits.ambition + traits.independence + traits.sensitivity) / 30);
  const regionShift = Math.floor((traits.relation + traits.longing) / 28);

  return {
    period: periods[(random.integer(0, periods.length - 1) + occupationShift) % periods.length] as string,
    region: regions[(random.integer(0, regions.length - 1) + regionShift) % regions.length] as string,
    location: random.pick(locations),
    occupation: occupations[(random.integer(0, occupations.length - 1) + occupationShift) % occupations.length] as string,
    socialClass: random.pick(socialClasses),
    hiddenNature: random.pick(hiddenNatures),
    emotionalCore: random.pick(emotionalCores),
    isFaint,
  };
}
