import { describe, expect, it } from "vitest";

import { plannedPaidContent } from "./plannedPaidContent";

describe("plannedPaidContent", () => {
  it("keeps the requested future-life and future-partner concepts in the roadmap", () => {
    expect(plannedPaidContent.find((item) => item.id === "present_life_flow")).toMatchObject({
      status: "planned",
      requestedByUser: true,
    });
    expect(plannedPaidContent.find((item) => item.id === "present_life_partner")).toMatchObject({
      status: "planned",
      requestedByUser: true,
    });
  });

  it("includes additional high-curiosity concepts without identifying real people or predicting harm", () => {
    const suggestions = plannedPaidContent.filter((item) => !item.requestedByUser);
    const text = JSON.stringify(plannedPaidContent);

    expect(suggestions.length).toBeGreaterThanOrEqual(3);
    expect(text).not.toMatch(/반드시 죽|사고가 난|실제 인물은|실명/);
    expect(plannedPaidContent.every((item) => item.safetyFrame.length > 20)).toBe(true);
  });
});
