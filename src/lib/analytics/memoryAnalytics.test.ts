import { describe, expect, it } from "vitest";

import { createMemoryAnalytics } from "./memoryAnalytics";

describe("createMemoryAnalytics", () => {
  it("records events in order", () => {
    const analytics = createMemoryAnalytics();

    analytics.track({ name: "landing_view", anonymousSessionId: "s1" });
    analytics.track({ name: "start_test", anonymousSessionId: "s1" });

    expect(analytics.list().map((event) => event.name)).toEqual(["landing_view", "start_test"]);
  });
});
