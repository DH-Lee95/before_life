import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "./site";

describe("site URL", () => {
  it("uses an HTTPS production URL without a trailing slash", () => {
    expect(resolveSiteUrl("https://archive.example/", undefined)).toBe("https://archive.example");
  });

  it("falls back to the Vercel deployment and then the current public URL", () => {
    expect(resolveSiteUrl(undefined, "preview.vercel.app")).toBe("https://preview.vercel.app");
    expect(resolveSiteUrl(undefined, undefined)).toBe("https://before-life.vercel.app");
  });
});
