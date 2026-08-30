import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { readSupabaseAuthEnvironment } from "./authEnvironment";

type AuthRouteResponse = {
  cookies: { set: (name: string, value: string, options?: CookieOptions) => unknown };
  headers: { set: (name: string, value: string) => unknown };
};

export async function createSupabaseServerClient(response?: AuthRouteResponse) {
  const cookieStore = await cookies();
  const { url, anonKey } = readSupabaseAuthEnvironment({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  });
  return createServerClient(url, anonKey, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values, headers) => {
        for (const { name, value, options } of values) {
          cookieStore.set(name, value, options);
          response?.cookies.set(name, value, options);
        }
        for (const [name, value] of Object.entries(headers)) response?.headers.set(name, value);
      },
    },
  });
}

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
