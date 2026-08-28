import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("warm drawer global theme", () => {
  it("uses a light paper base instead of the previous dark theme", () => {
    const css = readFileSync("src/app/globals.css", "utf8");

    expect(css).toContain("#F5E8C8");
    expect(css).not.toContain("color-scheme: dark");
  });
});
