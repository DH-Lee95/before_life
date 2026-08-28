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
    shortTitle: "전생의 죽음",
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
    id: "karma_trace",
    title: "이번 생에 반복되는 감정의 시작점",
    shortTitle: "남겨진 업보",
    hint: "현생에서 유독 반복되는 선택의 뿌리",
    discoveryGain: 9,
  },
  {
    id: "present_influence",
    title: "지금의 당신에게 남은 영향",
    shortTitle: "현생의 흔적",
    hint: "설명하기 어려운 끌림과 방어감의 이유",
    discoveryGain: 8,
  },
  {
    id: "second_life",
    title: "두 번째 기록: 전혀 다른 삶의 당신",
    shortTitle: "두 번째 전생",
    hint: "대표 기록 뒤에 희미하게 겹쳐 보이는 다른 생",
    discoveryGain: 13,
  },
];
