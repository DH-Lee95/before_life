import { describe, expectTypeOf, it } from "vitest";

import type { AnalyticsRepository } from "./analyticsRepository";

describe("AnalyticsRepository", () => {
  it("defines asynchronous event storage", () => {
    expectTypeOf<AnalyticsRepository["track"]>().returns.toEqualTypeOf<
      Promise<import("@/types/analytics").AnalyticsEvent>
    >();
  });
});
