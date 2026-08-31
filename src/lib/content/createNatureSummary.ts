import type { NatureSummary, SoulProfile } from "@/types/soul";

type TraitSignal = {
  key: keyof SoulProfile["traits"];
  weight: number;
  phrase: string;
};

const signalCatalog: TraitSignal[] = [
  { key: "sensitivity", weight: 1, phrase: "작은 표정과 말투의 변화도 오래 기억하는 편" },
  { key: "independence", weight: 2, phrase: "쉽게 기대기보다 먼저 혼자 정리하는 편" },
  { key: "restraint", weight: 3, phrase: "중요한 마음일수록 서두르지 않고 간직하는 편" },
  { key: "relation", weight: 4, phrase: "상대의 태도와 말하지 않은 마음을 중요하게 여기는 편" },
  { key: "ambition", weight: 5, phrase: "스스로 세운 기준을 끝까지 지키려는 편" },
  { key: "longing", weight: 6, phrase: "지나간 장면과 익숙한 감정을 쉽게 놓지 못하는 편" },
  { key: "vitality", weight: 7, phrase: "마음이 움직이면 조용히 행동으로 옮기는 편" },
];

export function createNatureSummary(profile: Pick<SoulProfile, "traits">): NatureSummary {
  const ranked = signalCatalog
    .map((signal) => ({ ...signal, score: profile.traits[signal.key] }))
    .sort((a, b) => b.score - a.score || a.weight - b.weight);
  const [primary, ...rest] = ranked;

  return {
    headline: createHeadline(primary.key),
    signals: [primary, ...rest.slice(0, 2)].map((signal) => signal.phrase),
    detail: createDetail(primary.key, rest[0]?.key ?? primary.key),
    hiddenInstinct: createHiddenInstinct(profile.traits),
    attractionPattern: createAttractionPattern(profile.traits),
    taste: createTaste(profile.traits),
    pastLifeBridge: "이 결이 가장 강하게 이어진 기록은 첫 번째 서랍에 남아 있습니다.",
  };
}

function createDetail(primary: TraitSignal["key"], secondary: TraitSignal["key"]): string {
  const details: Record<TraitSignal["key"], string> = {
    sensitivity: "사람의 말보다 말투와 표정의 미세한 변화를 먼저 읽습니다. 그래서 쉽게 무심한 척해도 마음속에서는 상황을 여러 번 되짚고, 한 번 신뢰한 사람에게는 생각보다 깊고 오래 마음을 씁니다.",
    independence: "도움을 받지 못해서가 아니라, 자신의 방식으로 납득하고 움직이고 싶어서 혼자 정리하는 시간이 필요합니다. 겉으로는 담담해 보여도 스스로 선택한 일에는 놀랄 만큼 오래 책임을 지는 사람입니다.",
    restraint: "감정이 없는 것이 아니라 감정을 함부로 소비하지 않는 편입니다. 중요한 순간에 바로 반응하기보다 마음을 정돈한 뒤 움직이기 때문에, 늦어 보여도 결국 가장 오래 남는 선택을 합니다.",
    relation: "관계에서 주고받는 균형과 온도를 예민하게 감지합니다. 아무에게나 마음을 열지는 않지만, 내 편이라고 느낀 사람에게는 현실적인 도움과 진심을 조용히 건네는 사람입니다.",
    ambition: "남에게 보이기 위한 욕심보다 스스로 정한 기준에 도달하고 싶은 욕심이 큽니다. 한 번 방향을 찾으면 작은 성취를 쌓아 결국 자신의 이름으로 인정받는 흐름을 만들어냅니다.",
    longing: "현재에 머물러 있어도 마음 한쪽에는 아직 끝나지 않은 장면이 남아 있습니다. 그 기억은 약점이 아니라 무엇을 진짜 원하는지 알려주는 기준이 되어, 선택의 순간마다 당신을 다시 움직입니다.",
    vitality: "마음이 움직이는 순간에는 생각보다 빠르게 현실을 바꿀 힘이 있습니다. 다만 의미 없는 경쟁에는 오래 머물지 않고, 납득할 수 있는 이유와 사람을 만났을 때 가장 강하게 살아나는 타입입니다.",
  };
  const secondaryBridge: Record<TraitSignal["key"], string> = {
    sensitivity: "여기에 섬세한 감각이 더해져",
    independence: "여기에 자기 기준이 더해져",
    restraint: "여기에 신중함이 더해져",
    relation: "여기에 관계를 보는 감각이 더해져",
    ambition: "여기에 현실적인 추진력이 더해져",
    longing: "여기에 오래 남는 기억이 더해져",
    vitality: "여기에 행동으로 옮기는 힘이 더해져",
  };
  return `${details[primary]} ${secondaryBridge[secondary]} 당신만의 선택을 만듭니다.`;
}

function createHiddenInstinct(traits: SoulProfile["traits"]): string {
  if (traits.independence >= traits.relation && traits.ambition >= 60) {
    return "숨은 본능은 주도권입니다. 누군가의 답을 기다리기보다 상황을 직접 살피고 자신이 결정할 수 있는 자리를 원합니다.";
  }
  if (traits.relation >= 65) {
    return "숨은 본능은 선택받는 것이 아니라 서로의 편이 되는 것입니다. 관계의 이름보다 변하지 않는 태도에 더 크게 반응합니다.";
  }
  if (traits.longing >= 65) {
    return "숨은 본능은 끝나지 않은 이야기를 완성하는 것입니다. 익숙한 감정 속에서 진짜 마음을 확인하려는 힘이 강합니다.";
  }
  return "숨은 본능은 겉으로 보이는 안정 뒤에 있는 진짜 의미를 찾는 것입니다. 쉽게 만족하지 않고 마음이 납득할 때까지 깊이 들어갑니다.";
}

function createAttractionPattern(traits: SoulProfile["traits"]): string {
  if (traits.sensitivity >= 70) return "끌리는 사람은 말보다 분위기로 진심을 보여주는 사람입니다. 과장된 표현보다 세심한 기억과 일관된 행동에 마음이 열립니다.";
  if (traits.ambition >= 70) return "끌리는 사람은 자기 삶을 스스로 꾸려가는 사람입니다. 목표가 분명하면서도 타인의 속도를 존중하는 태도에 강하게 끌립니다.";
  if (traits.relation >= 70) return "끌리는 사람은 따뜻하지만 경계를 지킬 줄 아는 사람입니다. 함께 있을 때 긴장하지 않아도 되는 편안함을 가장 큰 매력으로 느낍니다.";
  return "끌리는 사람은 조용한 자신감이 있고 약속을 행동으로 지키는 사람입니다. 처음의 강한 설렘보다 시간이 지나도 태도가 같은지를 봅니다.";
}

function createTaste(traits: SoulProfile["traits"]): string {
  if (traits.longing >= 65) return "취향은 오래된 것에 새 의미를 더하는 쪽에 가깝습니다. 빈티지한 물건, 사연 있는 장소, 한 번 들으면 오래 남는 음악처럼 시간이 쌓인 것에 끌립니다.";
  if (traits.sensitivity >= 65) return "취향은 소리와 빛, 말투처럼 분위기를 만드는 요소에 민감합니다. 사람 많은 곳에서도 자신이 편안함을 느끼는 공간과 물건을 선호합니다.";
  if (traits.vitality >= 65) return "취향은 정적인 완벽함보다 살아 있는 경험에 가깝습니다. 새 장소, 직접 해보는 일, 예상 밖의 대화에서 에너지를 얻습니다.";
  return "취향은 단정하지만 기능만 남은 것과는 다릅니다. 오래 써도 질리지 않는 물건, 이유가 분명한 디자인, 조용한 여운이 남는 경험을 좋아합니다.";
}

function createHeadline(key: TraitSignal["key"]): string {
  const headlines: Record<TraitSignal["key"], string> = {
    sensitivity: "당신은 작은 감정 변화도 세심하게 알아보는 사람입니다.",
    independence: "당신은 쉽게 흔들리지 않는 자기 기준이 강한 사람입니다.",
    restraint: "당신은 중요한 마음을 오래 품는 사람입니다.",
    relation: "당신은 사람 사이의 태도 변화에 섬세한 사람입니다.",
    ambition: "당신은 마음속 기준을 현실까지 이어가는 사람입니다.",
    longing: "당신은 지나간 마음에서도 의미를 찾는 사람입니다.",
    vitality: "당신은 조용하지만 분명한 추진력이 있는 사람입니다.",
  };

  return headlines[key];
}
