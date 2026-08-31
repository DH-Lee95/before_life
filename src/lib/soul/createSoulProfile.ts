import {
  historicalSettings,
  pastLifeWorlds,
} from "@/config/soulEnginePools";
import { soulArchetypes, type SoulArchetype } from "@/config/soulArchetypes";
import type { AnswerId, LockedContentType, PastLifeRecord, SoulInput, SoulProfile, SoulTraits } from "@/types/soul";
import { calculateBirthProfile } from "./calculateBirthProfile";
import { calculateTraits } from "./calculateTraits";
import { createNatureSummary } from "@/lib/content/createNatureSummary";
import { createSeededRandom } from "./seededRandom";
import { createSoulId } from "./createSoulId";
import { INPUT_VERSION, normalizeSoulInput } from "./normalizeInput";

export const ENGINE_VERSION = "soul-engine.2026-08-31.v5";

export function createSoulProfile(input: SoulInput): SoulProfile {
  const normalized = normalizeSoulInput(input);
  const { soulHash, displaySoulId } = createSoulId(`${INPUT_VERSION}|${ENGINE_VERSION}|${normalized.normalizedKey}`);
  const { soulHash: readingHash } = createSoulId(`${INPUT_VERSION}|${ENGINE_VERSION}|${normalized.readingKey}`);
  const birthProfile = calculateBirthProfile(normalized.birthDate, normalized.birthTime);
  const traits = calculateTraits(normalized.answers, birthProfile);
  const natureSummary = createNatureSummary({ traits });
  const rankedArchetypes = rankArchetypes(traits);
  const archetype = rankedArchetypes[0] as SoulArchetype;
  const random = createSeededRandom(readingHash);

  const mainPastLife = createRecord(random, archetype);

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
    archetypeId: archetype.id,
    mainPastLife,
    decisiveChoice: normalized.answers.decisive_choice,
    recommendedContentType: getRecommendedContentType(normalized.answers.repeated_theme),
    discoveryPercent: 17,
  };
}

function rankArchetypes(traits: SoulTraits): SoulArchetype[] {
  return [...soulArchetypes].sort((a, b) => b.score(traits) - a.score(traits));
}

function createRecord(
  random: ReturnType<typeof createSeededRandom>,
  archetype: SoulArchetype,
): PastLifeRecord {
  const world = random.pick(pastLifeWorlds);
  const setting = historicalSettings[world.settingId];
  return {
    period: world.period,
    region: world.region,
    location: random.pick(setting.locations),
    occupation: random.pick(setting.occupations),
    socialClass: random.pick(setting.socialClasses),
    hiddenNature: random.pick(archetype.hiddenNatures),
    coreTheme: random.pick(archetype.coreThemes),
  };
}

const recommendedContentByTheme: Record<AnswerId, LockedContentType> = {
  a: "past_love",
  b: "wealth_status",
  c: "decisive_choice",
  d: "karma_trace",
  e: "last_day",
  f: "present_influence",
};

function getRecommendedContentType(answer: AnswerId): LockedContentType {
  return recommendedContentByTheme[answer];
}
