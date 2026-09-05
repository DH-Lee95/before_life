import type { PastLifeScenario } from "@/config/pastLifeScenarios";
import { pastLifeBlueprints } from "@/config/pastLifeBlueprints";
import { createScenarioAction, pastLifeStoryCores } from "@/config/pastLifeStoryCores";
import type { AnswerId, DecisionStyle, LifeCanon, SoulArchetypeId } from "@/types/soul";
import { withAnd, withObject } from "@/lib/content/koreanGrammar";

const motives: Record<SoulArchetypeId, { desire: string; fear: string; legacy: string }> = {
  pioneer: { desire: "스스로 고른 곳에서 새 삶을 시작하는 것", fear: "안전을 이유로 다시 움직일 수 없게 되는 것", legacy: "다른 사람도 안전하게 새 길을 선택할 수 있는 방법을 남겼습니다." },
  chronicler: { desire: "지워질 사람의 진짜 말을 기록으로 남기는 것", fear: "힘 있는 사람의 편의 때문에 한 사람의 목소리가 사라지는 것", legacy: "사라질 뻔한 이름과 문장을 다음 사람에게 전했습니다." },
  caretaker: { desire: "도움이 필요한 사람이 형편 때문에 버려지지 않게 하는 것", fear: "모두를 돌보다 정작 가장 가까운 사람을 잃는 것", legacy: "돌봄을 혼자 짊어지지 않고 나누는 방식을 남겼습니다." },
  artisan: { desire: "자기 이름 없이도 오래 남을 만큼 정직한 물건을 만드는 것", fear: "타협한 한 번의 선택이 평생의 기준을 무너뜨리는 것", legacy: "기술보다 먼저 지켜야 할 제작자의 기준을 제자에게 남겼습니다." },
  merchant: { desire: "신뢰를 잃지 않으면서 가족의 생활을 안정시키는 것", fear: "한 번의 이익 때문에 다시 거래할 사람을 잃는 것", legacy: "돈보다 오래가는 신용의 기준을 장부에 남겼습니다." },
  wayfinder: { desire: "기다리는 사람이 있는 곳까지 모두를 무사히 돌려보내는 것", fear: "자신의 판단 하나로 누군가 돌아오지 못하는 것", legacy: "위험을 숨기지 않고 정확히 알리는 원칙을 남겼습니다." },
  scholar: { desire: "권위보다 관찰과 사실을 믿을 수 있는 기록을 남기는 것", fear: "틀린 설명이 진실처럼 굳어 다음 사람을 해치는 것", legacy: "감춰진 사실을 끝까지 확인하는 태도를 다음 사람에게 남겼습니다." },
  steward: { desire: "힘이 약한 집도 다음 계절을 준비할 몫을 받게 하는 것", fear: "질서를 지킨다는 명분이 불공평을 가리는 것", legacy: "누구의 몫도 조용히 지워지지 않는 분배 기준을 남겼습니다." },
  performer: { desire: "사람들이 외면하던 마음을 무대 위에서 말하게 하는 것", fear: "박수를 얻기 위해 진짜 하고 싶던 말을 지우는 것", legacy: "웃음과 음악 안에도 감춰진 이야기를 말할 자리를 남겼습니다." },
  visionary: { desire: "아직 없는 더 나은 생활 방식을 현실로 만드는 것", fear: "빠른 성과 때문에 사람의 안전과 삶이 뒤로 밀리는 것", legacy: "채택되지 않은 생각도 다음 사람이 이어갈 수 있도록 남겼습니다." },
};

const decisionStyleByAnswer: Record<AnswerId, DecisionStyle> = {
  a: "ALLY",
  b: "TRUTH",
  c: "COMMUNITY",
  d: "DEFIANCE",
  e: "DEPARTURE",
  f: "RESTORATION",
};

export function getDecisionStyle(answerId: AnswerId): DecisionStyle {
  return decisionStyleByAnswer[answerId];
}

export function createLifeCanon(
  scenario: PastLifeScenario,
  archetypeId: SoulArchetypeId,
  decisiveChoice: AnswerId,
): LifeCanon {
  const motive = motives[archetypeId];
  const storyCore = pastLifeStoryCores[scenario.id];
  if (!storyCore) throw new Error(`스토리 핵심 설정이 없습니다: ${scenario.id}`);
  const lifeBlueprint = pastLifeBlueprints[scenario.id as keyof typeof pastLifeBlueprints];
  const decisionStyle = getDecisionStyle(decisiveChoice);
  const turningPoint = storyCore.turningPoint;
  const decisiveAction = lifeBlueprint?.decisionActions[decisionStyle]
    ?? createScenarioAction(storyCore, decisiveChoice, storyCore.keyRelationship);
  const consequence = lifeBlueprint?.aftermath ?? storyCore.consequence;
  const finalDay = `말년의 마지막 중요한 날, ${withObject(scenario.signatureObject)} 자신이 가장 믿는 사람에게 건네며 말하지 못한 마음과 선택이 남긴 영향을 설명했습니다.`;

  const canon: LifeCanon = {
    scenarioId: scenario.id,
    centralDesire: lifeBlueprint?.protagonistDesire ?? motive.desire,
    centralFear: motive.fear,
    keyRelationship: lifeBlueprint?.keyRelationship ?? storyCore.keyRelationship,
    dramaticHook: lifeBlueprint?.dramaticHook ?? storyCore.dramaticHook,
    hookKeywords: [...storyCore.hookKeywords],
    sharedObject: scenario.signatureObject,
    secret: storyCore.secret,
    turningPoint,
    decisiveAction,
    consequence,
    legacy: motive.legacy,
    finalDay,
    historicalTerms: [...scenario.historicalTerms],
    timeline: [
      { stage: "유년기", event: scenario.occupationPath },
      { stage: "청년기", event: `${withObject(scenario.meetingReason)} 계기로 ${withAnd(lifeBlueprint?.keyRelationship ?? storyCore.keyRelationship)} 가까워졌습니다.` },
      { stage: "중년기", event: `${turningPoint} ${decisiveAction} ${consequence}` },
      { stage: "말년기", event: lifeBlueprint?.timeline.finalYears.summary ?? `${finalDay} ${motive.legacy}` },
    ],
  };

  if (lifeBlueprint) {
    canon.storySchemaVersion = "life-blueprint.v1";
    canon.decisionStyle = decisionStyle;
    canon.lifeBlueprint = lifeBlueprint;
    canon.lifeTimeline = lifeBlueprint.timeline;
  } else {
    canon.decisionStyle = decisionStyle;
  }

  return canon;
}
