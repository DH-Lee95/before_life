import { getScenariosForArchetype } from "@/config/pastLifeScenarios";
import { soulArchetypes, type SoulArchetype } from "@/config/soulArchetypes";
import type { AnswerId, AnswerMap, LockedContentType, PastLifeRecord, SoulArchetypeId, SoulInput, SoulProfile, SoulTraits } from "@/types/soul";
import { calculateBirthProfile } from "./calculateBirthProfile";
import { calculateTraits } from "./calculateTraits";
import { createNatureSummary } from "@/lib/content/createNatureSummary";
import { createSeededRandom } from "./seededRandom";
import { createSoulId } from "./createSoulId";
import { createLifeCanon } from "./createLifeCanon";
import { INPUT_VERSION, normalizeSoulInput } from "./normalizeInput";

export const ENGINE_VERSION = "soul-engine.2026-09-04.v7";

export function createSoulProfile(input: SoulInput): SoulProfile {
  const normalized = normalizeSoulInput(input);
  const { soulHash, displaySoulId } = createSoulId(`${INPUT_VERSION}|${ENGINE_VERSION}|${normalized.normalizedKey}`);
  const { soulHash: readingHash } = createSoulId(`${INPUT_VERSION}|${ENGINE_VERSION}|${normalized.readingKey}`);
  const birthProfile = calculateBirthProfile(normalized.birthDate, normalized.birthTime);
  const traits = calculateTraits(normalized.answers, birthProfile);
  const natureSummary = createNatureSummary({ traits });
  const rankedArchetypes = rankArchetypes(traits, normalized.answers);
  const archetype = rankedArchetypes[0] as SoulArchetype;
  const random = createSeededRandom(readingHash);

  const mainPastLife = createRecord(random, archetype, normalized.gender);
  const lifeCanon = createLifeCanon(
    getScenariosForArchetype(archetype.id).find((scenario) => scenario.id === mainPastLife.scenarioId)!,
    archetype.id,
    normalized.answers.decisive_choice,
  );

  return {
    inputVersion: INPUT_VERSION,
    engineVersion: ENGINE_VERSION,
    soulHash,
    displaySoulId,
    nickname: normalized.nickname,
    birthDate: normalized.birthDate,
    birthTime: normalized.birthTime,
    gender: normalized.gender,
    birthProfile,
    natureSummary,
    traits,
    archetypeId: archetype.id,
    mainPastLife,
    lifeCanon,
    decisiveChoice: normalized.answers.decisive_choice,
    recommendedContentType: getRecommendedContentType(normalized.answers.repeated_theme),
    discoveryPercent: 17,
  };
}

function rankArchetypes(traits: SoulTraits, answers: AnswerMap): SoulArchetype[] {
  const boosts = createArchetypeBoosts(answers);
  return [...soulArchetypes].sort((a, b) => (
    b.score(traits) + boosts[b.id] - a.score(traits) - boosts[a.id]
  ));
}

function createRecord(
  random: ReturnType<typeof createSeededRandom>,
  archetype: SoulArchetype,
  gender: NonNullable<SoulProfile["gender"]>,
): PastLifeRecord {
  const scenario = random.pick(getScenariosForArchetype(archetype.id));
  return {
    scenarioId: scenario.id,
    gender,
    period: scenario.period,
    region: scenario.region,
    location: scenario.location,
    occupation: scenario.occupation,
    socialClass: scenario.socialClass,
    hiddenNature: random.pick(archetype.hiddenNatures),
    coreTheme: random.pick(archetype.coreThemes),
    roleFamily: scenario.roleFamily,
    historicalContext: scenario.historicalContext,
    occupationPath: scenario.occupationPath,
    workplaceDetail: scenario.workplaceDetail,
    signatureObject: scenario.signatureObject,
    meetingReason: scenario.meetingReason,
    pressureSource: scenario.pressureSource,
  };
}

function createArchetypeBoosts(answers: AnswerMap): Record<SoulArchetypeId, number> {
  const boosts = Object.fromEntries(soulArchetypes.map((item) => [item.id, 0])) as Record<SoulArchetypeId, number>;
  const add = (ids: SoulArchetypeId[], amount: number) => ids.forEach((id) => { boosts[id] += amount; });
  const repeated: Record<AnswerId, SoulArchetypeId[]> = {
    a: ["chronicler", "caretaker", "performer"], b: ["merchant", "steward"],
    c: ["artisan", "visionary"], d: ["caretaker", "steward"],
    e: ["pioneer", "wayfinder"], f: ["scholar", "chronicler", "visionary"],
  };
  const desire: Record<AnswerId, SoulArchetypeId[]> = {
    a: ["pioneer", "wayfinder"], b: ["caretaker", "chronicler"],
    c: ["artisan", "performer"], d: ["merchant", "visionary"],
    e: ["scholar", "steward"], f: ["scholar"],
  };
  add(repeated[answers.repeated_theme], 38);
  add(desire[answers.hidden_desire], 30);
  if (answers.inner_response === "b") add(["chronicler", "scholar"], 18);
  if (answers.inner_response === "a") add(["pioneer", "wayfinder"], 18);
  if (answers.inner_response === "c") add(["caretaker", "performer"], 18);
  if (answers.inner_response === "d") add(["scholar", "visionary", "artisan"], 18);
  return boosts;
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
