"use client";

import { useOrg } from "@/contexts/OrgContext";
import { useSupabaseQuery } from "./useSupabaseQuery";
import type { Vaccination } from "@/lib/supabase/types";
import { VAX as MOCK } from "@/lib/data";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

export function useVaccinations(batchId?: string) {
  const { org } = useOrg();

  const { data, isLoading, error, refresh } = useSupabaseQuery<Vaccination>(
    (sb) => {
      let q = sb
        .from("vaccinations")
        .select("*")
        .eq("org_id", org?.id ?? "")
        .order("scheduled_date", { ascending: true });
      if (batchId) q = q.eq("batch_id", batchId);
      return q;
    },
    [org?.id, batchId],
    { enabled: SUPABASE_CONFIGURED && !!org },
  );

  if (!SUPABASE_CONFIGURED) {
    return { vaccinations: MOCK, isLoading: false, error: null, refresh: () => {} };
  }

  return { vaccinations: data, isLoading, error, refresh };
}
