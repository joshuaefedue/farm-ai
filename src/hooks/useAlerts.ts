"use client";

import { useCallback } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { useSupabaseQuery } from "./useSupabaseQuery";
import { createClient } from "@/lib/supabase/client";
import type { AlertRow } from "@/lib/supabase/types";
import { ALERTS as MOCK } from "@/lib/data";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

export function useAlerts() {
  const { org } = useOrg();

  const { data, isLoading, error, refresh } = useSupabaseQuery<AlertRow>(
    (sb) =>
      sb
        .from("alerts")
        .select("*")
        .eq("org_id", org?.id ?? "")
        .order("created_at", { ascending: false })
        .limit(20),
    [org?.id],
    { enabled: SUPABASE_CONFIGURED && !!org },
  );

  const markRead = useCallback(
    async (id: string) => {
      if (!SUPABASE_CONFIGURED) return;
      const supabase = createClient();
      await supabase.from("alerts").update({ read: true }).eq("id", id);
      refresh();
    },
    [refresh],
  );

  if (!SUPABASE_CONFIGURED) {
    // Mock alerts don't have a read field — treat all as unread
    return { alerts: MOCK as unknown as AlertRow[], unreadCount: MOCK.length, isLoading: false, error: null, refresh: () => {}, markRead: async (_id: string) => {} };
  }

  const unreadCount = data.filter((a) => !a.read).length;
  return { alerts: data, unreadCount, isLoading, error, refresh, markRead };
}
