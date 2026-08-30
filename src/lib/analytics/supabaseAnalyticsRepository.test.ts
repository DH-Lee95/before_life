import { describe, expect, it, vi } from "vitest";

import { createSupabaseAnalyticsRepository } from "./supabaseAnalyticsRepository";

describe("Supabase analytics repository", () => {
  it("resolves the public session ID and stores normalized event fields", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("anonymous_sessions")) {
        return json([{ id: "session-row-id" }]);
      }
      if (url.endsWith("/analytics_events")) {
        return json([{
          event_name: "click_locked_content",
          anonymous_session_id: "session-row-id",
          event_properties: { profileId: "profile-1", contentType: "love" },
          utm_source: "instagram",
          utm_medium: null,
          utm_campaign: null,
          utm_content: null,
          created_at: "2026-08-30T00:00:00.000Z",
        }]);
      }
      return json([], 404);
    });
    const repository = createSupabaseAnalyticsRepository({
      url: "https://project.supabase.co",
      serviceRoleKey: "server-secret",
      fetchImpl,
    });

    await expect(repository.track({
      name: "click_locked_content",
      anonymousSessionId: "public-session",
      profileId: "profile-1",
      contentType: "love",
      utmSource: "instagram",
    })).resolves.toEqual({
      name: "click_locked_content",
      anonymousSessionId: "public-session",
      profileId: "profile-1",
      contentType: "love",
      utmSource: "instagram",
      createdAt: "2026-08-30T00:00:00.000Z",
    });

    const sessionCall = fetchImpl.mock.calls.find(([url]) => String(url).includes("anonymous_sessions"));
    expect(String(sessionCall?.[0])).toContain("on_conflict=session_id");
    expect(JSON.parse(String(sessionCall?.[1]?.body))).toEqual({
      session_id: "public-session",
      utm_source: "instagram",
    });

    const eventCall = fetchImpl.mock.calls.find(([url]) => String(url).endsWith("/analytics_events"));
    expect(eventCall?.[1]?.headers).toEqual(expect.objectContaining({
      Authorization: "Bearer server-secret",
    }));
    expect(JSON.parse(String(eventCall?.[1]?.body))).toEqual({
      anonymous_session_id: "session-row-id",
      event_name: "click_locked_content",
      event_properties: { profileId: "profile-1", contentType: "love" },
      utm_source: "instagram",
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
    });
  });

  it("stores events without creating a session when no cookie exists", async () => {
    const fetchImpl = vi.fn(async () => json([{
      event_name: "landing_view",
      anonymous_session_id: null,
      event_properties: {},
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      created_at: "2026-08-30T00:00:00.000Z",
    }]));
    const repository = createSupabaseAnalyticsRepository({
      url: "https://project.supabase.co",
      serviceRoleKey: "server-secret",
      fetchImpl,
    });

    await repository.track({ name: "landing_view" });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(String(fetchImpl.mock.calls[0]?.[0])).toBe("https://project.supabase.co/rest/v1/analytics_events");
    expect(JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body))).not.toHaveProperty("created_at");
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
