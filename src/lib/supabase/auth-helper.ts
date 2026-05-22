import { createClient } from "./server";

/**
 * Robust server-side auth helper for server actions.
 *
 * Tries getUser() first (validates JWT with Supabase auth server).
 * Falls back to getSession() (reads JWT from cookie without network call)
 * in case the auth server is slow or temporarily unreachable.
 */
export async function getAuthUser() {
  const supabase = await createClient();

  // Try server-validated getUser() first
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!error && user) return { supabase, user };

  // Fallback: read session from cookie directly (no network call)
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return { supabase, user: session.user };

  return { supabase: null, user: null };
}
