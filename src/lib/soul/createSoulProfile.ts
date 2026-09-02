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

export const ENGINE_VERSION = "soul-engine.2026-09-02.v6";

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
    readingRationale: createReadingRationale(traits, archetype.id, mainPastLife.occupation),
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

function createReadingRationale(traits: SoulTraits, archetypeId: SoulArchetypeId, occupation: string): string[] {
  const labels: Array<[keyof SoulTraits, string]> = [
    ["relation", "사람과의 약속을 선택의 기준으로 둔 답변"], ["independence", "스스로 방향을 정하려는 답변"],
    ["restraint", "중요한 마음을 오래 품는 답변"], ["ambition", "결과로 인정받고 싶은 답변"],
    ["sensitivity", "작은 변화와 감정을 먼저 알아보는 답변"], ["longing", "지나간 장면의 의미를 놓지 않는 답변"],
    ["vitality", "가능성을 보면 행동으로 옮기는 답변"],
  ];
  const top = labels.sort((a, b) => traits[b[0]] - traits[a[0]]).slice(0, 2).map((item) => item[1]);
  const archetypeLabels: Record<SoulArchetypeId, string> = {
    pioneer: "익숙한 안전보다 새로운 길을 택하는 원형", chronicler: "사라질 말과 기억을 지키는 원형",
    caretaker: "사람의 빈자리와 필요를 먼저 살피는 원형", artisan: "자기 기준을 손에 잡히는 결과로 남기는 원형",
    merchant: "신뢰와 현실적인 성과를 함께 보는 원형", wayfinder: "위험 속에서도 돌아갈 방향을 찾는 원형",
    scholar: "사실을 확인하고 이해해야 마음이 놓이는 원형", steward: "공동체의 질서와 다음 계절을 준비하는 원형",
    performer: "감정을 표현해 사람의 마음을 움직이는 원형", visionary: "아직 없는 방식을 현실로 옮기는 원형",
  };
  return [...top, `${archetypeLabels[archetypeId]}이 ${occupation}의 삶과 가장 자연스럽게 이어졌습니다.`];
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
