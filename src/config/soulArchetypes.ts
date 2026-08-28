import type { NarrativeTheme, SoulArchetypeId, SoulTraits } from "@/types/soul";

export type SoulArchetype = {
  id: SoulArchetypeId;
  score: (traits: SoulTraits) => number;
  occupations: readonly string[];
  locations: readonly string[];
  hiddenNatures: readonly string[];
  coreThemes: readonly NarrativeTheme[];
};

export const soulArchetypes: readonly SoulArchetype[] = [
  { id: "pioneer", score: (t) => t.independence + t.vitality + t.ambition,
    occupations: ["항해 지도 제작자", "교역로를 개척한 상인", "독립 공방의 운영자"],
    locations: ["사람들이 떠나고 돌아오던 길목", "낯선 언어가 자연스럽게 섞이던 도시"],
    hiddenNatures: ["안정보다 자신의 방향을 택했던 사람", "조용히 새 길을 만들던 사람"],
    coreThemes: [
      { label: "익숙한 삶을 떠나고 싶은 열망", description: "안전한 자리에 머무르기보다 새로운 길로 떠나고 싶어 했습니다." },
      { label: "삶을 스스로 선택하고 싶은 열망", description: "남이 정한 길보다 자신의 의지로 삶의 방향을 결정하고 싶어 했습니다." },
    ] },
  { id: "chronicler", score: (t) => t.sensitivity + t.longing + t.restraint,
    occupations: ["편지 대필가", "기록원", "서점 주인"], locations: ["조용한 예배당과 기록 보관소 사이", "계절마다 얼굴이 달라지던 강변"],
    hiddenNatures: ["사람보다 기록과 사물에 진심을 남기던 사람", "중요한 마음을 글로 보관하던 사람"],
    coreThemes: [
      { label: "뒤늦게 마음을 전한 아쉬움", description: "중요한 마음을 깨달았을 때에는 이미 너무 늦었다는 아쉬움을 품고 있었습니다." },
      { label: "끝내 말하지 못한 그리움", description: "소중한 사람에게 진심을 전하지 못한 채 오랫동안 그리워했습니다." },
    ] },
  { id: "caretaker", score: (t) => t.relation + t.sensitivity + t.restraint,
    occupations: ["가정교사", "약재상", "여관 관리인"], locations: ["사람들이 떠나고 돌아오던 길목", "낮에는 붐비고 밤에는 고요해지는 거리"],
    hiddenNatures: ["책임을 떠안는 데 익숙해 자기 마음을 늦게 알아차린 사람", "사람들의 돌아올 자리를 지킨 사람"],
    coreThemes: [
      { label: "끝까지 약속을 지켜야 한다는 책임감", description: "자신이 힘들어지더라도 한번 맺은 약속은 끝까지 지켜야 한다고 믿었습니다." },
      { label: "자신도 보호받고 싶은 바람", description: "늘 다른 사람을 돌보면서도 마음 한편으로는 자신도 누군가에게 기대고 싶어 했습니다." },
    ] },
  { id: "artisan", score: (t) => t.ambition + t.sensitivity + t.restraint,
    occupations: ["악기 수리공", "재봉사", "지도 제작 보조원"], locations: ["작은 작업장이 모여 있던 골목", "물건과 편지가 오가던 오래된 시장 근처"],
    hiddenNatures: ["스스로 정한 기준에 닿을 때까지 손을 놓지 않은 사람", "말보다 완성한 물건으로 진심을 남긴 사람"],
    coreThemes: [
      { label: "실력으로 인정받고 싶은 열망", description: "자신이 완성한 결과를 통해 조용하지만 분명하게 인정받고 싶어 했습니다." },
      { label: "끝내 완성하지 못한 일에 대한 미련", description: "마지막까지 완성하지 못한 한 가지 일을 마음에서 오래 놓지 못했습니다." },
    ] },
  { id: "merchant", score: (t) => t.ambition + t.relation + t.vitality,
    occupations: ["무역상", "회계 담당자", "공방 운영자"], locations: ["물건과 편지가 오가던 오래된 시장 근처", "낯선 언어가 자연스럽게 섞이던 도시"],
    hiddenNatures: ["사람과 기회를 연결해 자신의 자리를 만든 사람", "관계의 신뢰를 현실의 성과로 이어간 사람"],
    coreThemes: [
      { label: "안정된 자리를 잃을지 모른다는 불안", description: "애써 만든 생활의 기반을 다시 잃을 수 있다는 불안을 쉽게 떨치지 못했습니다." },
      { label: "자신의 가치를 인정받고 싶은 열망", description: "성과뿐 아니라 그 과정에서 보여준 자신의 노력까지 온전히 인정받고 싶어 했습니다." },
    ] },
];
