import { describe, expect, it } from "vitest";

import { createPaymentRepositoryFromEnv } from "./paymentProvider";

describe("payment repository provider", () => {
  it("uses memory only when Supabase is entirely unconfigured", () => {
    expect(createPaymentRepositoryFromEnv({})).toHaveProperty("createIntent");
  });

  it("rejects partial Supabase configuration", () => {
    expect(() => createPaymentRepositoryFromEnv({ SUPABASE_URL: "https://db.example" }))
      .toThrow("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together");
  });
});
