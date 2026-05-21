"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase: null, user: null };
  return { supabase, user };
}

// ── createOrder ───────────────────────────────────────────────────────────────
export async function createOrder(data: {
  org_id: string;
  customer: string;
  channel?: string;
  items?: string;
  subtotal: number;
  payment?: "unpaid" | "invoiced" | "paid";
  payment_method?: string;
  phone?: string;
  is_coop?: boolean;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  // generate order ID: ORD-YYYY-NNNN
  const year = new Date().getFullYear();
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  const orderId = `ORD-${year}-${rand}`;

  const { error } = await supabase.from("orders").insert({
    id: orderId,
    org_id: data.org_id,
    customer: data.customer,
    channel: data.channel ?? null,
    items: data.items ?? null,
    subtotal: data.subtotal,
    status: "pending",
    payment: data.payment ?? "unpaid",
    payment_method: data.payment_method ?? null,
    phone: data.phone ?? null,
    is_coop: data.is_coop ?? false,
    notes: data.notes ?? null,
    order_date: new Date().toISOString().slice(0, 10),
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true, orderId };
}

// ── updateOrderStatus ─────────────────────────────────────────────────────────
export async function updateOrderStatus(
  id: string,
  org_id: string,
  status: "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled",
) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .eq("org_id", org_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── updateOrderPayment ────────────────────────────────────────────────────────
export async function updateOrderPayment(
  id: string,
  org_id: string,
  payment: "unpaid" | "invoiced" | "paid",
) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("orders")
    .update({ payment })
    .eq("id", id)
    .eq("org_id", org_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}
