import type { LockedContentType } from "@/types/soul";

export type LockedContentConfig = {
  id: LockedContentType;
  title: string;
  shortTitle: string;
  hint: string;
  discoveryGain: number;
};

export const lockedContentTypes: LockedContentConfig[] = [
  {
    id: "past_love",
    title: "끝까지 말하지 못한 그 사람",
    shortTitle: "전생의 사랑",
    hint: "당신의 기록 안에서 가장 오래 남은 이름",
    discoveryGain: 9,
  },
  {
    id: "last_day",
    title: "당신의 마지막 날",
    shortTitle: "전생의 마지막 날",
    hint: "끝이라고 느끼기 전, 마지막으로 붙잡은 감정",
    discoveryGain: 8,
  },
  {
    id: "wealth_status",
    title: "돈은 있었지만 편하지 않았던 이유",
    shortTitle: "재산과 신분",
    hint: "가지고 있던 것과 끝내 갖지 못한 것",
    discoveryGain: 7,
  },
  {
    id: "decisive_choice",
    title: "모든 것을 바꾼 단 한 번의 선택",
    shortTitle: "운명을 가른 선택",
    hint: "당신이 끝까지 지키려 했던 것과 그 선택의 대가",
    discoveryGain: 9,
  },
  {
    id: "karma_trace",
    title: "끝내 지키지 못한 약속",
    shortTitle: "미완의 약속",
    hint: "이번 생에도 반복되는 감정이 시작된 순간",
    discoveryGain: 8,
  },
  {
    id: "present_influence",
    title: "지금의 당신에게 남은 흔적",
    shortTitle: "현생의 흔적",
    hint: "취향과 관계, 일하는 방식에 남은 오래된 습관",
    discoveryGain: 13,
  },
];
