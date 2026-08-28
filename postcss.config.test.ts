import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const config = require("./postcss.config") as { plugins: Record<string, unknown> };

describe("postcss config", () => {
  it("loads Tailwind and Autoprefixer", () => {
    expect(config.plugins.tailwindcss).toEqual({});
    expect(config.plugins.autoprefixer).toEqual({});
  });
});
