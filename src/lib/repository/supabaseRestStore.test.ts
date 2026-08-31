import { describe, expect, it, vi } from "vitest";

import { createSupabaseRestStore } from "./supabaseRestStore";

function response(body: unknown, ok = true): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? 200 : 500,
    headers: { "content-type": "application/json" },
  });
}

describe("createSupabaseRestStore", () => {
  it("sends the service role key only in server request headers", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response([{ id: "session-row" }]));
    const store = createSupabaseRestStore({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-secret",
      fetchImpl,
    });

    await store.upsertAnonymousSession("anonymous-cookie");

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/rest/v1/anonymous_sessions?on_conflict=session_id");
    expect(init.headers).toMatchObject({
      apikey: "service-secret",
      Authorization: "Bearer service-secret",
      Prefer: "resolution=merge-duplicates,return=representation",
    });
  });

  it("checks token access without sending a raw result token", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response([{ id: "grant" }]));
    const store = createSupabaseRestStore({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-secret",
      fetchImpl,
    });

    await expect(store.hasAccess("sp_profile", "sha256-hash", undefined)).resolves.toBe(true);

    const requestedUrl = fetchImpl.mock.calls[0][0] as string;
    expect(requestedUrl).toContain("result_token_hash=eq.sha256-hash");
    expect(requestedUrl).not.toContain("result_token=eq");
  });

  it("restores profile access from an authenticated user on a different device", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response([{ id: "account-grant" }]));
    const store = createSupabaseRestStore({ url: "https://project.supabase.co", serviceRoleKey: "service-secret", fetchImpl });

    await expect(store.hasAccess("sp_profile", undefined, undefined, "user-id")).resolves.toBe(true);

    const requestedUrl = fetchImpl.mock.calls[0][0] as string;
    expect(requestedUrl).toContain("user_id=eq.user-id");
    expect(requestedUrl).toContain("soul_profile_id=eq.sp_profile");
  });

  it("grants a verified result to an authenticated user without storing a raw token", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response([{ id: "account-grant" }]));
    const store = createSupabaseRestStore({ url: "https://project.supabase.co", serviceRoleKey: "service-secret", fetchImpl });

    await store.grantUserAccess("sp_profile", "user-id");

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/rest/v1/soul_profile_access?on_conflict=");
    expect(JSON.parse(String(init.body))).toEqual({
      soul_profile_id: "sp_profile",
      anonymous_session_id: null,
      result_token_hash: null,
      user_id: "user-id",
    });
  });

  it("throws a useful error for a failed database request", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ message: "permission denied" }, false));
    const store = createSupabaseRestStore({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-secret",
      fetchImpl,
    });

    await expect(store.listProfiles()).rejects.toThrow("Supabase request failed (500)");
  });
});
