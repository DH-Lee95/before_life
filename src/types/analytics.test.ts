import { describe, expect, it } from "vitest";

import type { AnalyticsEventName } from "./analytics";

describe("analytics types", () => {
  it("includes the required phase 1 funnel events", () => {
    const event: AnalyticsEventName = "view_free_result";
    expect(event).toBe("view_free_result");
  });
});
