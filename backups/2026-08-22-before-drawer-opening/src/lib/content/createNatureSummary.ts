import type { NatureSummary, SoulProfile } from "@/types/soul";

type TraitSignal = {
  key: keyof SoulProfile["traits"];
  weight: number;
  phrase: string;
};

const signalCatalog: TraitSignal[] = [
  { key: "sensitivity", weight: 1, phrase: "작은 감정의 결도 오래 들여다보는 편" },
  { key: "independence", weight: 2, phrase: "쉽게 기대기보다 먼저 혼자 정리하는 편" },
  { key: "restraint", weight: 3, phrase: "중요한 마음일수록 서두르지 않고 간직하는 편" },
  { key: "relation", weight: 4, phrase: "관계의 온도와 말하지 않은 마음을 중요하게 여기는 편" },
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
    pastLifeBridge: "이 결이 가장 강하게 이어진 기록은 첫 번째 서랍에 남아 있습니다.",
  };
}

function createHeadline(key: TraitSignal["key"]): string {
  const headlines: Record<TraitSignal["key"], string> = {
    sensitivity: "당신은 조용한 감정의 결에 깊은 사람입니다.",
    independence: "당신은 쉽게 흔들리지 않는 자기 기준이 강한 사람입니다.",
    restraint: "당신은 중요한 마음을 오래 품는 사람입니다.",
    relation: "당신은 관계의 온도에 섬세한 사람입니다.",
    ambition: "당신은 마음속 기준을 현실까지 이어가는 사람입니다.",
    longing: "당신은 지나간 마음에서도 의미를 찾는 사람입니다.",
    vitality: "당신은 조용하지만 분명한 추진력이 있는 사람입니다.",
  };

  return headlines[key];
}
