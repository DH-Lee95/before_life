import { describe, expect, it } from "vitest";

import { metadata } from "@/app/layout";

describe("root layout", () => {
  it("keeps the app shell covered", () => {
    expect(metadata.metadataBase?.origin).toBe("https://before-life.vercel.app");
    expect(metadata.openGraph).toMatchObject({
      title: "전생 서랍",
      type: "website",
    });
  });
});
