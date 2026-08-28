type AuthEnvironment = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

export function readSupabaseAuthEnvironment(environment: AuthEnvironment) {
  const url = environment.SUPABASE_URL?.trim();
  const anonKey = environment.SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be configured together");
  }
  return { url, anonKey };
}
