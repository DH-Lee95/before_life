import { createMemoryPaymentRepository } from "./memoryPaymentRepository";
import type { PaymentRepository } from "./paymentRepository";
import { createSupabasePaymentRepository } from "./supabasePaymentRepository";

type PaymentEnvironment = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

const globalForPaymentRepository = globalThis as typeof globalThis & {
  __serverPaymentRepository?: PaymentRepository;
};

export function createPaymentRepositoryFromEnv(environment: PaymentEnvironment): PaymentRepository {
  const url = environment.SUPABASE_URL?.trim();
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url && !serviceRoleKey) return createMemoryPaymentRepository();
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together");
  }
  return createSupabasePaymentRepository({ url, serviceRoleKey });
}

export function getPaymentRepository(): PaymentRepository {
  if (!globalForPaymentRepository.__serverPaymentRepository) {
    globalForPaymentRepository.__serverPaymentRepository = createPaymentRepositoryFromEnv({
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }
  return globalForPaymentRepository.__serverPaymentRepository;
}
