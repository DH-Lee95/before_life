import { describe, expect, it } from "vitest";

import { createSeededRandom } from "./seededRandom";

describe("createSeededRandom", () => {
  it("returns repeatable values for the same seed", () => {
    const first = createSeededRandom("seed");
    const second = createSeededRandom("seed");

    expect([first.next(), first.next(), first.pick(["a", "b", "c"])]).toEqual([
      second.next(),
      second.next(),
      second.pick(["a", "b", "c"]),
    ]);
  });
});
