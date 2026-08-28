import { describe, expect, it } from "vitest";

import { questionIds } from "@/types/soul";
import { traitMappings } from "./traitMappings";

describe("traitMappings", () => {
  it("provides semantic deltas for every configured question", () => {
    expect(Object.keys(traitMappings)).toEqual(questionIds);
    expect(traitMappings.hidden_desire.a?.independence).toBeGreaterThan(0);
    expect(traitMappings.hidden_desire.b?.relation).toBeGreaterThan(0);
    expect(traitMappings.hidden_desire.d?.ambition).toBeGreaterThan(0);
  });
});
