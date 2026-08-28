import { describe, expect, it } from "vitest";

import { createSoulRepositoryFromEnv } from "./repositoryProvider";

describe("createSoulRepositoryFromEnv", () => {
  it("uses memory storage when Supabase is not configured", async () => {
    const repository = createSoulRepositoryFromEnv({});

    expect(repository).toEqual(expect.objectContaining({
      upsertProfile: expect.any(Function),
      getResult: expect.any(Function),
    }));
    await expect(repository.listProfiles()).resolves.toEqual([]);
  });

  it("fails fast when only part of the Supabase configuration exists", () => {
    expect(() => createSoulRepositoryFromEnv({ SUPABASE_URL: "https://project.supabase.co" }))
      .toThrow("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together");
  });

  it("creates a Supabase-backed repository when both server variables exist", () => {
    const repository = createSoulRepositoryFromEnv({
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-secret",
    });

    expect(repository).toEqual(expect.objectContaining({
      upsertProfile: expect.any(Function),
      getResult: expect.any(Function),
    }));
  });
});
