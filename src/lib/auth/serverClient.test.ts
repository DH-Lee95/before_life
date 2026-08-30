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
    vi.stubEnv("NODE_ENV", "production");
    await createSupabaseServerClient();
    expect(createServerClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "public-key",
      expect.objectContaining({
        cookies: expect.any(Object),
        cookieOptions: { httpOnly: true, path: "/", sameSite: "lax", secure: true },
      }),
    );
  });

  it("copies auth cookies and no-cache headers onto a route response", async () => {
    const response = { cookies: { set: vi.fn() }, headers: { set: vi.fn() } };
    await createSupabaseServerClient(response);
    const options = createServerClient.mock.calls.at(-1)?.[2];

    options.cookies.setAll([
      { name: "sb-project-auth-token", value: "session", options: { httpOnly: true, path: "/" } },
    ], { "Cache-Control": "private, no-store" });

    expect(response.cookies.set).toHaveBeenCalledWith(
      "sb-project-auth-token", "session", { httpOnly: true, path: "/" },
    );
    expect(response.headers.set).toHaveBeenCalledWith("Cache-Control", "private, no-store");
  });
});
