"use client";

import { useOrg } from "@/contexts/OrgContext";
import { useSupabaseQuery } from "./useSupabaseQuery";
import type { Batch } from "@/lib/supabase/types";
import { BATCHES as MOCK, type Batch as MockBatch } from "@/lib/data";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

function toAppBatch(b: Batch): MockBatch {
  return {
    id: b.id,
    name: b.name ?? b.id,
    breed: b.breed ?? "Unknown",
    type: b.type as MockBatch["type"],
    arrival: b.arrival_date ? new Date(b.arrival_date) : new Date(),
    house: b.house_name ?? "Unknown",
    startCount: b.start_count ?? 0,
    currentCount: b.current_count ?? 0,
    mortalityPct: b.mortality_pct ?? 0,
    fcr: b.fcr ?? 0,
    eggRate: b.egg_rate ?? undefined,
    avgWeight: b.avg_weight ?? undefined,
    status: b.status as MockBatch["status"],
    supplier: b.supplier ?? "",
    costPerBird: b.cost_per_bird ?? 0,
  };
}

export function useBatches() {
  const { org } = useOrg();

  const { data, isLoading, error, refresh } = useSupabaseQuery<Batch>(
    (sb) => sb.from("batches").select("*").eq("org_id", org?.id ?? "").order("arrival_date", { ascending: false }),
    [org?.id],
    { enabled: SUPABASE_CONFIGURED && !!org }
  );

  if (!SUPABASE_CONFIGURED) {
    return { batches: MOCK, isLoading: false, error: null, refresh: () => {} };
  }

  return { batches: data.map(toAppBatch), isLoading, error, refresh };
}
