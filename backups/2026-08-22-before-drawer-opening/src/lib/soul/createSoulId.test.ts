import { describe, expect, it } from "vitest";

import { createSoulId } from "./createSoulId";

describe("createSoulId", () => {
  it("creates a sha256 hash and display id", () => {
    const result = createSoulId("abc|1995-03-04|unknown|a|b|c|d|e|f|a");

    expect(result.soulHash).toHaveLength(64);
    expect(result.displaySoulId).toMatch(/^#[A-F0-9]{6}$/);
  });
});
