export type SoulPack = {
  id: string;
  name: string;
  souls: number;
  priceKrw: number;
  badge?: string;
};

export const soulPacks: SoulPack[] = [
  { id: "starter", name: "Starter", souls: 3, priceKrw: 1900 },
  { id: "basic", name: "Basic", souls: 5, priceKrw: 4900 },
  { id: "popular", name: "Popular", souls: 12, priceKrw: 9900, badge: "BEST" },
  { id: "deep_archive", name: "Deep Archive", souls: 25, priceKrw: 18900 },
];
