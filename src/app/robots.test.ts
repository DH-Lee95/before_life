import { describe, expect, it } from "vitest";

import robots from "./robots";

describe("robots metadata", () => {
  it("blocks private result and API routes", () => {
    expect(robots().rules).toEqual(expect.objectContaining({
      allow: "/",
      disallow: expect.arrayContaining(["/api/", "/result/", "/payment/", "/auth/"]),
    }));
  });
});
