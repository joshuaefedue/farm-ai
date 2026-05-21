"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase: null, user: null };
  return { supabase, user };
}

// ── createInventoryItem ───────────────────────────────────────────────────────
export async function createInventoryItem(data: {
  org_id: string;
  name: string;
  category?: string;
  unit?: string;
  quantity?: number;
  reorder_level?: number;
  unit_cost?: number;
  supplier?: string;
  location?: string;
  expiry_date?: string;
}) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("inventory_items").insert({
    org_id: data.org_id,
    name: data.name,
    category: data.category ?? null,
    unit: data.unit ?? null,
    quantity: data.quantity ?? 0,
    reorder_level: data.reorder_level ?? null,
    unit_cost: data.unit_cost ?? null,
    supplier: data.supplier ?? null,
    location: data.location ?? null,
    expiry_date: data.expiry_date ?? null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── adjustStock ───────────────────────────────────────────────────────────────
export async function adjustStock(id: string, org_id: string, delta: number) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  // fetch current quantity
  const { data: item, error: fetchErr } = await supabase
    .from("inventory_items")
    .select("quantity")
    .eq("id", id)
    .eq("org_id", org_id)
    .single();

  if (fetchErr || !item) return { success: false, error: fetchErr?.message ?? "Item not found" };

  const newQty = Math.max(0, (item.quantity ?? 0) + delta);

  const { error } = await supabase
    .from("inventory_items")
    .update({ quantity: newQty })
    .eq("id", id)
    .eq("org_id", org_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true, newQty };
}
