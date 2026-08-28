import type { AnalyticsEvent, AnalyticsEventName } from "@/types/analytics";

const eventNames = new Set<AnalyticsEventName>([
  "landing_view", "start_test", "complete_questionnaire", "view_free_result",
  "click_locked_content", "view_payment", "purchase", "unlock_content", "share_result",
]);

const optionalFields = ["profileId", "contentType", "utmSource", "utmMedium", "utmCampaign", "utmContent"] as const;
type PublicAnalyticsEvent = Pick<AnalyticsEvent, "name" | (typeof optionalFields)[number]>;

export function validateAnalyticsEvent(value: unknown): PublicAnalyticsEvent {
  if (!isRecord(value) || typeof value.name !== "string" || !eventNames.has(value.name as AnalyticsEventName)) {
    throw new Error("analytics event is invalid");
  }

  const event: PublicAnalyticsEvent = { name: value.name as AnalyticsEventName };
  for (const field of optionalFields) {
    const item = value[field];
    if (item === undefined) continue;
    if (typeof item !== "string" || item.length === 0 || item.length > 200) {
      throw new Error(`analytics ${field} is invalid`);
    }
    event[field] = item;
  }
  return event;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
