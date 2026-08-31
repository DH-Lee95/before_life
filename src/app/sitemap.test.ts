import { describe, expect, it } from "vitest";

import sitemap from "./sitemap";

describe("sitemap metadata", () => {
  it("publishes the canonical landing page", () => {
    expect(sitemap()).toEqual(expect.arrayContaining([
      expect.objectContaining({ url: "https://before-life.vercel.app" }),
      expect.objectContaining({ url: "https://before-life.vercel.app/terms" }),
      expect.objectContaining({ url: "https://before-life.vercel.app/privacy" }),
      expect.objectContaining({ url: "https://before-life.vercel.app/refund" }),
    ]));
  });
});
