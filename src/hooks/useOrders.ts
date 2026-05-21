"use client";

import { useOrg } from "@/contexts/OrgContext";
import { useSupabaseQuery } from "./useSupabaseQuery";
import type { Order } from "@/lib/supabase/types";
import { ORDERS as MOCK, type Order as MockOrder } from "@/lib/data";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

function toAppOrder(o: Order): MockOrder {
  return {
    id: o.id,
    date: new Date(o.order_date),
    customer: o.customer,
    channel: o.channel ?? "—",
    items: o.items ?? "—",
    subtotal: o.subtotal,
    status: o.status as MockOrder["status"],
    payment: o.payment as MockOrder["payment"],
    paymentMethod: o.payment_method ?? "—",
    coop: o.is_coop,
    phone: o.phone ?? "",
  };
}

export function useOrders() {
  const { org } = useOrg();

  const { data, isLoading, error, refresh } = useSupabaseQuery<Order>(
    (sb) => sb.from("orders").select("*").eq("org_id", org?.id ?? "").order("order_date", { ascending: false }),
    [org?.id],
    { enabled: SUPABASE_CONFIGURED && !!org }
  );

  if (!SUPABASE_CONFIGURED) {
    return { orders: MOCK, isLoading: false, error: null, refresh: () => {} };
  }

  return { orders: data.map(toAppOrder), isLoading, error, refresh };
}
