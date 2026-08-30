import type { AnalyticsEvent } from "@/types/analytics";

import type { AnalyticsRepository } from "./analyticsRepository";

type Options = {
  url: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

type AnalyticsEventRow = {
  anonymous_session_id: string | null;
  event_name: AnalyticsEvent["name"];
  event_properties: { profileId?: string; contentType?: string };
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  created_at: string;
};

export function createSupabaseAnalyticsRepository({
  url,
  serviceRoleKey,
  fetchImpl = fetch,
}: Options): AnalyticsRepository {
  const baseUrl = url.replace(/\/$/, "");

  async function requestRows<T>(path: string, init: RequestInit): Promise<T[]> {
    const response = await fetchImpl(`${baseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`Supabase analytics request failed (${response.status})${detail ? `: ${detail}` : ""}`);
    }
    return await response.json() as T[];
  }

  async function resolveSessionRowId(event: AnalyticsEvent): Promise<string | null> {
    if (!event.anonymousSessionId) return null;

    const rows = await requestRows<{ id: string }>("anonymous_sessions?on_conflict=session_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        session_id: event.anonymousSessionId,
        ...(event.utmSource ? { utm_source: event.utmSource } : {}),
        ...(event.utmMedium ? { utm_medium: event.utmMedium } : {}),
        ...(event.utmCampaign ? { utm_campaign: event.utmCampaign } : {}),
        ...(event.utmContent ? { utm_content: event.utmContent } : {}),
      }),
    });
    if (!rows[0]) throw new Error("Supabase anonymous session upsert returned no row");
    return rows[0].id;
  }

  return {
    async track(event) {
      const sessionRowId = await resolveSessionRowId(event);
      const rows = await requestRows<AnalyticsEventRow>("analytics_events", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          anonymous_session_id: sessionRowId,
          event_name: event.name,
          event_properties: {
            ...(event.profileId ? { profileId: event.profileId } : {}),
            ...(event.contentType ? { contentType: event.contentType } : {}),
          },
          utm_source: event.utmSource ?? null,
          utm_medium: event.utmMedium ?? null,
          utm_campaign: event.utmCampaign ?? null,
          utm_content: event.utmContent ?? null,
        }),
      });
      const row = rows[0];
      if (!row) throw new Error("Supabase analytics insert returned no row");

      return {
        name: row.event_name,
        ...(event.anonymousSessionId ? { anonymousSessionId: event.anonymousSessionId } : {}),
        ...(row.event_properties.profileId ? { profileId: row.event_properties.profileId } : {}),
        ...(row.event_properties.contentType ? { contentType: row.event_properties.contentType } : {}),
        ...(row.utm_source ? { utmSource: row.utm_source } : {}),
        ...(row.utm_medium ? { utmMedium: row.utm_medium } : {}),
        ...(row.utm_campaign ? { utmCampaign: row.utm_campaign } : {}),
        ...(row.utm_content ? { utmContent: row.utm_content } : {}),
        createdAt: row.created_at,
      };
    },
  };
}
