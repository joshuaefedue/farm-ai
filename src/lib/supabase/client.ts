import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Return a stub when Supabase isn't configured (local dev without .env.local)
    // The OrgProvider and middleware both check SUPABASE_CONFIGURED before using this
    return createBrowserClient<Database>(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_KEY);
}
