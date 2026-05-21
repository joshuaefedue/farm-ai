"use client";

import { useOrg } from "@/contexts/OrgContext";
import { useSupabaseQuery } from "./useSupabaseQuery";
import type { House } from "@/lib/supabase/types";
import { HOUSES as MOCK } from "@/lib/data";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

export function useHouses() {
  const { org } = useOrg();

  const { data, isLoading, error, refresh } = useSupabaseQuery<House>(
    (sb) =>
      sb
        .from("houses")
        .select("*")
        .eq("org_id", org?.id ?? "")
        .order("name", { ascending: true }),
    [org?.id],
    { enabled: SUPABASE_CONFIGURED && !!org },
  );

  if (!SUPABASE_CONFIGURED) {
    // convert mock HOUSES shape to DB House shape
    const mockHouses: House[] = MOCK.map((h) => ({
      id: h.id,
      org_id: "mock",
      name: h.id,
      type: h.type ?? null,
      capacity: h.capacity ?? null,
      created_at: new Date().toISOString(),
    }));
    return { houses: mockHouses, isLoading: false, error: null, refresh: () => {} };
  }

  return { houses: data, isLoading, error, refresh };
}
