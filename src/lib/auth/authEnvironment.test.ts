import { describe, expect, it } from "vitest";

import { readSupabaseAuthEnvironment } from "./authEnvironment";

describe("Supabase auth environment", () => {
  it("reads the server-side public auth credentials", () => {
    expect(readSupabaseAuthEnvironment({
      SUPABASE_URL: " https://project.supabase.co ",
      SUPABASE_ANON_KEY: " public-key ",
    })).toEqual({ url: "https://project.supabase.co", anonKey: "public-key" });
  });

  it("rejects partial configuration", () => {
    expect(() => readSupabaseAuthEnvironment({ SUPABASE_URL: "https://project.supabase.co" }))
      .toThrow("SUPABASE_URL and SUPABASE_ANON_KEY");
  });
});
