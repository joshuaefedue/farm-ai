import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role Supabase client — bypasses RLS entirely.
 * ONLY use in server-side code (Server Components, Route Handlers, Server Actions).
 * NEVER import or expose to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations require the service role key."
    );
  }

  return createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
