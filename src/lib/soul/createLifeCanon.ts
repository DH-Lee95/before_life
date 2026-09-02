import type { PastLifeScenario } from "@/config/pastLifeScenarios";
import type { AnswerId, LifeCanon, SoulArchetypeId } from "@/types/soul";
import { withAnd, withObject } from "@/lib/content/koreanGrammar";

const motives: Record<SoulArchetypeId, { desire: string; fear: string; relationship: string; legacy: string }> = {
  pioneer: { desire: "스스로 고른 곳에서 새 삶을 시작하는 것", fear: "안전을 이유로 다시 움직일 수 없게 되는 것", relationship: "처음으로 같은 방향을 믿어준 여행 동료", legacy: "다른 사람도 안전하게 새 길을 선택할 수 있는 방법을 남겼습니다." },
  chronicler: { desire: "지워질 사람의 진짜 말을 기록으로 남기는 것", fear: "힘 있는 사람의 편의 때문에 한 사람의 목소리가 사라지는 것", relationship: "말하지 못한 사연을 맡긴 오랜 손님", legacy: "사라질 뻔한 이름과 문장을 다음 사람에게 전했습니다." },
  caretaker: { desire: "도움이 필요한 사람이 형편 때문에 버려지지 않게 하는 것", fear: "모두를 돌보다 정작 가장 가까운 사람을 잃는 것", relationship: "당신에게도 쉬어도 된다고 말한 동료", legacy: "돌봄을 혼자 짊어지지 않고 나누는 방식을 남겼습니다." },
  artisan: { desire: "자기 이름 없이도 오래 남을 만큼 정직한 물건을 만드는 것", fear: "타협한 한 번의 선택이 평생의 기준을 무너뜨리는 것", relationship: "당신의 작은 표식을 처음 알아본 주문자", legacy: "기술보다 먼저 지켜야 할 제작자의 기준을 제자에게 남겼습니다." },
  merchant: { desire: "신뢰를 잃지 않으면서 가족의 생활을 안정시키는 것", fear: "한 번의 이익 때문에 다시 거래할 사람을 잃는 것", relationship: "가장 어려울 때 외상 약속을 믿어준 거래 상대", legacy: "돈보다 오래가는 신용의 기준을 장부에 남겼습니다." },
  wayfinder: { desire: "기다리는 사람이 있는 곳까지 모두를 무사히 돌려보내는 것", fear: "자신의 판단 하나로 누군가 돌아오지 못하는 것", relationship: "위험한 길에서도 마지막까지 신호를 믿어준 동료", legacy: "위험을 숨기지 않고 정확히 알리는 원칙을 남겼습니다." },
  scholar: { desire: "권위보다 관찰과 사실을 믿을 수 있는 기록을 남기는 것", fear: "틀린 설명이 진실처럼 굳어 다음 사람을 해치는 것", relationship: "당신의 질문을 귀찮아하지 않았던 어린 제자", legacy: "이름 없는 사람의 발견도 지식으로 남을 수 있게 했습니다." },
  steward: { desire: "힘이 약한 집도 다음 계절을 준비할 몫을 받게 하는 것", fear: "질서를 지킨다는 명분이 불공평을 가리는 것", relationship: "자기 몫을 이웃에게 먼저 내어준 공동체 구성원", legacy: "누구의 몫도 조용히 지워지지 않는 분배 기준을 남겼습니다." },
  performer: { desire: "사람들이 외면하던 마음을 무대 위에서 말하게 하는 것", fear: "박수를 얻기 위해 진짜 하고 싶던 말을 지우는 것", relationship: "공연 뒤 당신의 진짜 목소리를 알아본 동료 배우", legacy: "웃음과 음악 안에도 감춰진 이야기를 말할 자리를 남겼습니다." },
  visionary: { desire: "아직 없는 더 나은 생활 방식을 현실로 만드는 것", fear: "빠른 성과 때문에 사람의 안전과 삶이 뒤로 밀리는 것", relationship: "완성되지 않은 생각을 처음 함께 시험한 동료", legacy: "채택되지 않은 생각도 다음 사람이 이어갈 수 있도록 남겼습니다." },
};

const actions: Record<AnswerId, string> = {
  a: "사랑하는 사람에게 진실을 먼저 알리고 함께 선택했습니다.",
  b: "불이익을 감수하고 자신이 확인한 사실을 공개했습니다.",
  c: "가족과 공동체가 함께 버틸 수 있는 대안을 만들어 설득했습니다.",
  d: "쌓아온 이름을 걸고 잘못된 요구를 공식적으로 거절했습니다.",
  e: "익숙한 자리를 떠나 필요한 사람들과 새로운 일을 시작했습니다.",
  f: "숨겨진 기록을 끝까지 확인해 원래 주인에게 돌려주었습니다.",
};

export function createLifeCanon(
  scenario: PastLifeScenario,
  archetypeId: SoulArchetypeId,
  decisiveChoice: AnswerId,
): LifeCanon {
  const motive = motives[archetypeId];
  const turningPoint = `${scenario.pressureSource}의 요구가 ${scenario.signatureObject}에 남은 사실과 정면으로 충돌한 날`;
  const decisiveAction = actions[decisiveChoice] ?? actions.b;
  const consequence = "그 선택으로 익숙한 자리와 수입 일부를 잃었지만, 가장 가까운 사람과 자신의 기준은 지킬 수 있었습니다.";
  const finalDay = `말년의 마지막 중요한 날, ${withObject(scenario.signatureObject)} 자신이 가장 믿는 사람에게 건네며 숨겼던 사실을 모두 설명했습니다.`;

  return {
    scenarioId: scenario.id,
    centralDesire: motive.desire,
    centralFear: motive.fear,
    keyRelationship: motive.relationship,
    sharedObject: scenario.signatureObject,
    secret: `${scenario.pressureSource}의 요구를 따르면 누군가의 몫이나 진실이 지워진다는 사실`,
    turningPoint,
    decisiveAction,
    consequence,
    legacy: motive.legacy,
    finalDay,
    historicalTerms: [...scenario.historicalTerms],
    timeline: [
      { stage: "유년기", event: scenario.occupationPath },
      { stage: "청년기", event: `${withObject(scenario.meetingReason)} 계기로 ${withAnd(motive.relationship)} 가까워졌습니다.` },
      { stage: "중년기", event: `${turningPoint}, ${decisiveAction} ${consequence}` },
      { stage: "말년기", event: `${finalDay} ${motive.legacy}` },
    ],
  };
}
