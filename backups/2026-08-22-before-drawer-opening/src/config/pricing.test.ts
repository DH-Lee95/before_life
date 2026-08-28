import { describe, expect, it } from "vitest";

import { soulPacks } from "./pricing";

describe("pricing config", () => {
  it("keeps prices outside UI components", () => {
    expect(soulPacks[0]).toMatchObject({ souls: 3, priceKrw: 1900 });
  });
});
