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
    vi.unstubAllGlobals();
  });

  it("allows only one in-memory generator for the same content", async () => {
    expect(await acquireContentGeneration(claim)).toBe(true);
    expect(await acquireContentGeneration({ ...claim, claimId: "00000000-0000-4000-8000-000000000002" })).toBe(false);

    await releaseContentGeneration(claim);

    expect(await acquireContentGeneration({ ...claim, claimId: "00000000-0000-4000-8000-000000000003" })).toBe(true);
  });

  it("sets a finite timeout on the Supabase lock request", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    const fetchMock = vi.fn(async () => new Response("true", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await acquireContentGeneration(claim);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("claim_soul_content_generation"),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
