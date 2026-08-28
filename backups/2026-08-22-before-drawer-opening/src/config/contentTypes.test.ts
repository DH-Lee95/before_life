import { describe, expect, it } from "vitest";

import { lockedContentTypes } from "./contentTypes";

describe("content types config", () => {
  it("starts with conversion-oriented locked records", () => {
    expect(lockedContentTypes.map((content) => content.id)).toContain("past_love");
    expect(lockedContentTypes.map((content) => content.id)).toContain("last_day");
  });
});
