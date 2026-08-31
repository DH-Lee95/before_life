import { beforeEach, describe, expect, it, vi } from "vitest";

import { acquireContentGeneration, releaseContentGeneration } from "./contentGenerationLock";

const claim = {
  soulProfileId: "sp_test",
  contentType: "last_day" as const,
  generationKey: "generation-key",
  claimId: "00000000-0000-4000-8000-000000000001",
};

describe("content generation lock", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows only one in-memory generator for the same content", async () => {
    expect(await acquireContentGeneration(claim)).toBe(true);
    expect(await acquireContentGeneration({ ...claim, claimId: "00000000-0000-4000-8000-000000000002" })).toBe(false);

    await releaseContentGeneration(claim);

    expect(await acquireContentGeneration({ ...claim, claimId: "00000000-0000-4000-8000-000000000003" })).toBe(true);
  });
});
