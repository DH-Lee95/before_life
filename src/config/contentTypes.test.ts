import { describe, expect, it } from "vitest";

import { lockedContentTypes } from "./contentTypes";

describe("content types config", () => {
  it("starts with conversion-oriented locked records", () => {
    expect(lockedContentTypes).toHaveLength(7);
    expect(lockedContentTypes.map((content) => content.id)).toContain("past_love");
    expect(lockedContentTypes.map((content) => content.id)).toContain("last_day");
    expect(lockedContentTypes.map((content) => content.id)).toContain("decisive_choice");
    expect(lockedContentTypes.map((content) => content.id)).toContain("family_bonds");
    expect(lockedContentTypes.map((content) => content.id)).not.toContain("second_life");
  });
});
