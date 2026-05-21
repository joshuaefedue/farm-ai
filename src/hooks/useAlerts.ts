"use client";

import { useOrg } from "@/contexts/OrgContext";
import { useSupabaseQuery } from "./useSupabaseQuery";
import type { AlertRow } from "@/lib/supabase/types";
import { ALERTS as MOCK, type Alert as MockAlert } from "@/lib/data";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

function toAppAlert(a: AlertRow): MockAlert {
  const diffMs = Date.now() - new Date(a.created_at).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH   = Math.floor(diffMin / 60);
  const timeStr =
    diffMin < 2  ? "Just now" :
    diffMin < 60 ? `${diffMin} min ago` :
    diffH < 24   ? `${diffH}h ago` : "Yesterday";

  return {
    id: parseInt(a.id.replace(/-/g, "").slice(0, 8), 16) || 0,
    level: a.level as MockAlert["level"],
    title: a.title,
    meta: a.meta ?? "",
    time: timeStr,
    icon: a.icon ?? "Info",
  };
}

export function useAlerts() {
  const { org } = useOrg();

  const { data, isLoading, error, refresh } = useSupabaseQuery<AlertRow>(
    (sb) =>
      sb.from("alerts")
        .select("*")
        .eq("org_id", org?.id ?? "")
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(20),
    [org?.id],
    { enabled: SUPABASE_CONFIGURED && !!org }
  );

  if (!SUPABASE_CONFIGURED) {
    return { alerts: MOCK, unreadCount: MOCK.length, isLoading: false, error: null, refresh: () => {} };
  }

  const alerts = data.map(toAppAlert);
  return { alerts, unreadCount: alerts.length, isLoading, error, refresh };
}
