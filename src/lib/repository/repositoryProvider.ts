import { createMemorySoulRepository } from "./memorySoulRepository";
import type { SoulRepository } from "./soulRepository";
import { createSupabaseRestStore } from "./supabaseRestStore";
import { createSupabaseSoulRepository } from "./supabaseSoulRepository";

type RepositoryEnvironment = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

const globalForSoulRepository = globalThis as typeof globalThis & {
  __serverSoulRepository?: SoulRepository;
};

export function createSoulRepositoryFromEnv(environment: RepositoryEnvironment): SoulRepository {
  const url = environment.SUPABASE_URL?.trim();
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url && !serviceRoleKey) return createMemorySoulRepository();
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together");
  }

  return createSupabaseSoulRepository(createSupabaseRestStore({ url, serviceRoleKey }));
}

export function getSoulRepository(): SoulRepository {
  if (!globalForSoulRepository.__serverSoulRepository) {
    globalForSoulRepository.__serverSoulRepository = createSoulRepositoryFromEnv({
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }

  return globalForSoulRepository.__serverSoulRepository;
}
