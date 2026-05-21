"use client";

import { useOrg } from "@/contexts/OrgContext";
import { useSupabaseQuery } from "./useSupabaseQuery";
import type { BatchLog } from "@/lib/supabase/types";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

export function useBatchLogs(batchId?: string, logType?: "mortality" | "feed" | "eggs" | "weight") {
  const { org } = useOrg();

  const { data, isLoading, error, refresh } = useSupabaseQuery<BatchLog>(
    (sb) => {
      let q = sb
        .from("batch_logs")
        .select("*")
        .eq("org_id", org?.id ?? "")
        .order("log_date", { ascending: false });
      if (batchId) q = q.eq("batch_id", batchId);
      if (logType) q = q.eq("log_type", logType);
      return q;
    },
    [org?.id, batchId, logType],
    { enabled: SUPABASE_CONFIGURED && !!org },
  );

  if (!SUPABASE_CONFIGURED) {
    return { logs: [] as BatchLog[], isLoading: false, error: null, refresh: () => {} };
  }

  return { logs: data, isLoading, error, refresh };
}
