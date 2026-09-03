import { describe, expect, it } from "vitest";

import { contentCosts, referralReward, soulPacks } from "./pricing";

describe("pricing config", () => {
  it("offers the agreed soul packs and a complete archive pack", () => {
    expect(soulPacks).toEqual([
      expect.objectContaining({ souls: 1, priceKrw: 1000 }),
      expect.objectContaining({ souls: 3, priceKrw: 2490 }),
      expect.objectContaining({ souls: 5, priceKrw: 3990 }),
      expect.objectContaining({ souls: 7, priceKrw: 4990, badge: "전체 서랍 추천" }),
    ]);
  });

  it("keeps every pack above PayApp's minimum payment amount", () => {
    expect(soulPacks.every((pack) => pack.priceKrw >= 1000)).toBe(true);
  });

  it("prices a topic at one soul and the whole life at two", () => {
    expect(contentCosts).toEqual({ deepRecord: 1, wholeLife: 2 });
  });

  it("limits the invitation reward to one completed newcomer", () => {
    expect(referralReward).toMatchObject({ souls: 1, maxRewardsPerAccount: 1, trigger: "free_result_completed" });
  });
});
