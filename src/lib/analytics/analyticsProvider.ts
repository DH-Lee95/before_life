import type { AnalyticsRepository } from "./analyticsRepository";
import { createMemoryAnalytics } from "./memoryAnalytics";
import { createSupabaseAnalyticsRepository } from "./supabaseAnalyticsRepository";

type AnalyticsEnvironment = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

const globalForAnalyticsRepository = globalThis as typeof globalThis & {
  __serverAnalyticsRepository?: AnalyticsRepository;
};

export function createAnalyticsRepositoryFromEnv(
  environment: AnalyticsEnvironment,
): AnalyticsRepository {
  const url = environment.SUPABASE_URL?.trim();
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url && !serviceRoleKey) return createMemoryAnalytics();
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together");
  }
  return createSupabaseAnalyticsRepository({ url, serviceRoleKey });
}

export function getAnalyticsRepository(): AnalyticsRepository {
  if (!globalForAnalyticsRepository.__serverAnalyticsRepository) {
    globalForAnalyticsRepository.__serverAnalyticsRepository = createAnalyticsRepositoryFromEnv({
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }
  return globalForAnalyticsRepository.__serverAnalyticsRepository;
}
