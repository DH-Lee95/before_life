import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

describe("next config", () => {
  it("enables strict React checks", () => {
    expect(nextConfig.reactStrictMode).toBe(true);
  });
});
