import { describe, expect, it } from "vitest";

import nextConfig from "./next.config";

describe("next config", () => {
  it("keeps React strict mode enabled", () => {
    expect(nextConfig.reactStrictMode).toBe(true);
  });

  it("adds baseline browser security headers", async () => {
    const headers = await nextConfig.headers?.();
    expect(headers?.[0]?.headers).toEqual(expect.arrayContaining([
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ]));
  });
});
