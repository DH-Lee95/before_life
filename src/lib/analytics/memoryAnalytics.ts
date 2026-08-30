import type { AnalyticsEvent } from "@/types/analytics";

import type { AnalyticsRepository } from "./analyticsRepository";

export type MemoryAnalytics = AnalyticsRepository & {
  list: () => AnalyticsEvent[];
};

export function createMemoryAnalytics(): MemoryAnalytics {
  const events: AnalyticsEvent[] = [];

  return {
    async track(event) {
      const stored = {
        ...event,
        createdAt: event.createdAt ?? new Date().toISOString(),
      };
      events.push(stored);
      return stored;
    },
    list() {
      return [...events];
    },
  };
}

const globalForAnalytics = globalThis as typeof globalThis & {
  __memoryAnalytics?: MemoryAnalytics;
};

export function getAnalytics(): MemoryAnalytics {
  if (!globalForAnalytics.__memoryAnalytics) {
    globalForAnalytics.__memoryAnalytics = createMemoryAnalytics();
  }

  return globalForAnalytics.__memoryAnalytics;
}
