"use client";

import { useOrg } from "@/contexts/OrgContext";
import { useSupabaseQuery } from "./useSupabaseQuery";

// We store inventory_items in DB but fallback to empty list locally
const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

export interface InventoryItem {
  id: string;
  org_id: string;
  name: string;
  category: string | null;
  unit: string | null;
  quantity: number;
  reorder_level: number | null;
  unit_cost: number | null;
  supplier: string | null;
  location: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useInventory() {
  const { org } = useOrg();

  const { data, isLoading, error, refresh } = useSupabaseQuery<InventoryItem>(
    (sb) =>
      sb
        .from("inventory_items")
        .select("*")
        .eq("org_id", org?.id ?? "")
        .order("name", { ascending: true }),
    [org?.id],
    { enabled: SUPABASE_CONFIGURED && !!org },
  );

  if (!SUPABASE_CONFIGURED) {
    return { items: [] as InventoryItem[], isLoading: false, error: null, refresh: () => {} };
  }

  return { items: data, isLoading, error, refresh };
}
