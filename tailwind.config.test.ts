import { describe, expect, it } from "vitest";

import config from "./tailwind.config";

describe("tailwind config", () => {
  it("registers app and component content paths", () => {
    expect(config.content).toEqual(
      expect.arrayContaining([
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      ]),
    );
  });
});
