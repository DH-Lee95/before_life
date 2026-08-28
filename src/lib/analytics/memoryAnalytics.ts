import type { AnalyticsEvent } from "@/types/analytics";

export type MemoryAnalytics = {
  track: (event: AnalyticsEvent) => AnalyticsEvent;
  list: () => AnalyticsEvent[];
};

export function createMemoryAnalytics(): MemoryAnalytics {
  const events: AnalyticsEvent[] = [];

  return {
    track(event) {
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
