import type { AnalyticsEvent } from "@/types/analytics";

export type AnalyticsRepository = {
  track: (event: AnalyticsEvent) => Promise<AnalyticsEvent>;
};
