export type SoulPack = {
  id: string;
  souls: number;
  priceKrw: number;
  badge?: string;
  description: string;
};

export const soulPacks: SoulPack[] = [
  { id: "soul_1", souls: 1, priceKrw: 990, description: "원하는 깊은 기록 1개" },
  { id: "soul_3", souls: 3, priceKrw: 2490, badge: "가볍게 추천", description: "깊은 기록 3개" },
  { id: "soul_5", souls: 5, priceKrw: 3990, badge: "인기", description: "남은 깊은 기록 5개" },
  { id: "soul_7", souls: 7, priceKrw: 4990, badge: "전체 서랍 추천", description: "깊은 기록 5개 + 전생의 일생" },
];

export const contentCosts = {
  deepRecord: 1,
  wholeLife: 2,
} as const;

export const referralReward = {
  souls: 1,
  maxRewardsPerAccount: 1,
  trigger: "free_result_completed",
  balanceType: "promotional",
  transferable: false,
  refundable: false,
} as const;
