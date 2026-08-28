import { beforeEach, describe, expect, it, vi } from "vitest";

const createServerClient = vi.hoisted(() => vi.fn(() => ({ auth: {} })));
vi.mock("@supabase/ssr", () => ({ createServerClient }));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ getAll: () => [], set: vi.fn() })) }));

import { createSupabaseServerClient } from "./serverClient";

describe("server Supabase auth client", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "public-key");
  });

  it("uses the anon key and cookie adapter without exposing the service role", async () => {
    await createSupabaseServerClient();
    expect(createServerClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "public-key",
      expect.objectContaining({ cookies: expect.any(Object) }),
    );
  });
});
