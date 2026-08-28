import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { readSupabaseAuthEnvironment } from "./authEnvironment";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = readSupabaseAuthEnvironment({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  });
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        for (const { name, value, options } of values) cookieStore.set(name, value, options);
      },
    },
  });
}

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
