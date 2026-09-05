export type PlannedPaidContent = {
  id: string;
  title: string;
  hook: string;
  includes: string[];
  status: "planned";
  requestedByUser: boolean;
  safetyFrame: string;
};

/**
 * 추후 유료 콘텐츠 확장 후보입니다. 현재 화면·가격·잠금 해제에는 연결하지 않습니다.
 * 구현 시 사주나 예언의 사실 단정이 아닌 엔터테인먼트형 가능성 표현을 유지합니다.
 */
export const plannedPaidContent: PlannedPaidContent[] = [
  {
    id: "present_life_flow",
    title: "전생을 통해 보는 이번 생의 흐름",
    hook: "이번 생에서 크게 방향이 바뀌는 시기와 같은 실수를 피해야 하는 순간",
    includes: ["인생 전환 구간", "기회가 열리는 조건", "반복하기 쉬운 실수", "관계·일·돈에서 조심할 점"],
    status: "planned",
    requestedByUser: true,
    safetyFrame: "특정 사건이나 피해를 예언하지 않고 성향에 따라 반복될 수 있는 선택 패턴과 대응 방법으로 설명합니다.",
  },
  {
    id: "present_life_partner",
    title: "전생으로 보는 이번 생의 연인",
    hook: "언제, 어디에서, 어떤 분위기의 사람이 당신의 마음을 흔들 가능성이 큰지",
    includes: ["만남 가능성이 높은 시기", "만나는 장소와 계기", "성격과 관계 방식", "외모와 분위기", "놓치기 쉬운 신호"],
    status: "planned",
    requestedByUser: true,
    safetyFrame: "실제 특정인을 운명의 상대라고 지목하지 않고 선호와 관계 패턴을 바탕으로 한 오락적 가능성으로 제시합니다.",
  },
  {
    id: "repeating_relationship",
    title: "이번 생에서 다시 만나는 위험한 관계",
    hook: "처음에는 강하게 끌리지만 결국 같은 상처를 반복하게 만드는 사람의 신호",
    includes: ["강한 끌림의 이유", "반복되는 갈등", "초기에 보이는 위험 신호", "관계를 끊거나 바꾸는 선택"],
    status: "planned",
    requestedByUser: false,
    safetyFrame: "현실의 누군가를 전생의 가해자나 배신자로 단정하지 않고 경계가 필요한 관계 행동을 구체적으로 설명합니다.",
  },
  {
    id: "unused_talent",
    title: "전생에서 끝내 쓰지 못한 재능",
    hook: "이번 생에서 유난히 빠르게 익히는 능력과 그것이 가장 강하게 드러나는 순간",
    includes: ["숨은 재능", "재능을 막는 두려움", "잘 맞는 일과 환경", "재능이 살아나는 계기"],
    status: "planned",
    requestedByUser: false,
    safetyFrame: "직업적 성공을 보장하지 않고 현재 성향과 선호에서 발견할 수 있는 강점과 실험 방법으로 안내합니다.",
  },
  {
    id: "money_pattern",
    title: "전생의 돈과 신분이 남긴 재물 패턴",
    hook: "돈이 들어와도 불안한 이유와 큰 기회 앞에서 반복하는 단 하나의 선택",
    includes: ["돈을 대하는 본능", "손실을 부르는 선택", "기회를 잡는 조건", "신뢰와 소비의 경계"],
    status: "planned",
    requestedByUser: false,
    safetyFrame: "수익이나 투자 결과를 예측하지 않고 소비·저축·협상에서 반복될 수 있는 행동 패턴만 다룹니다.",
  },
  {
    id: "missed_opportunity",
    title: "계속 놓치게 되는 결정적 기회",
    hook: "좋은 기회가 와도 마지막 순간에 물러서는 이유와 다음 기회를 잡기 위해 바꿔야 할 행동",
    includes: ["반복해서 놓치는 기회", "마지막에 물러서는 이유", "기회를 알아보는 신호", "이번에는 잡기 위한 행동"],
    status: "planned",
    requestedByUser: false,
    safetyFrame: "성공 시기나 결과를 보장하지 않고 중요한 순간에 반복되는 망설임과 현실적인 대응 방법을 돌아보게 합니다.",
  },
];
