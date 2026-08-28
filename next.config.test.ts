import { describe, expect, it } from "vitest";

import nextConfig from "./next.config";

describe("next config", () => {
  it("keeps React strict mode enabled", () => {
    expect(nextConfig.reactStrictMode).toBe(true);
  });
});
