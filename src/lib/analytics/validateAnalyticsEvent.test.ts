import { describe, expect, it } from "vitest";

import { validateAnalyticsEvent } from "./validateAnalyticsEvent";

describe("validateAnalyticsEvent", () => {
  it("keeps only public analytics fields", () => {
    expect(
      validateAnalyticsEvent({
        name: "click_locked_content",
        profileId: "sp_test",
        contentType: "past_love",
        anonymousSessionId: "forged",
        createdAt: "2000-01-01",
      }),
    ).toEqual({ name: "click_locked_content", profileId: "sp_test", contentType: "past_love" });
  });

  it("rejects unknown event names and oversized values", () => {
    expect(() => validateAnalyticsEvent({ name: "forged_event" })).toThrow();
    expect(() => validateAnalyticsEvent({ name: "start_test", utmSource: "x".repeat(201) })).toThrow();
  });
});
