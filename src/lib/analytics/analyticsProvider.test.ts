import { describe, expect, it } from "vitest";

import { createAnalyticsRepositoryFromEnv } from "./analyticsProvider";

describe("analytics repository provider", () => {
  it("uses memory storage when Supabase is entirely unconfigured", async () => {
    const repository = createAnalyticsRepositoryFromEnv({});

    await expect(repository.track({ name: "landing_view" })).resolves.toMatchObject({
      name: "landing_view",
      createdAt: expect.any(String),
    });
  });

  it("rejects partial Supabase configuration", () => {
    expect(() => createAnalyticsRepositoryFromEnv({ SUPABASE_URL: "https://project.supabase.co" }))
      .toThrow("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together");
  });

  it("creates a Supabase repository when both server variables exist", () => {
    expect(createAnalyticsRepositoryFromEnv({
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-secret",
    })).toHaveProperty("track");
  });
});
