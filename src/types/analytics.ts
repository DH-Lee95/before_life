export type AnalyticsEventName =
  | "landing_view"
  | "start_test"
  | "complete_questionnaire"
  | "view_free_result"
  | "click_locked_content"
  | "view_payment"
  | "purchase"
  | "unlock_content"
  | "share_result"

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  anonymousSessionId?: string;
  profileId?: string;
  contentType?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  createdAt?: string;
};
