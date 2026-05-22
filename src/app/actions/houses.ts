"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/supabase/auth-helper";

// ── createHouse ───────────────────────────────────────────────────────────────
export async function createHouse(data: {
  org_id: string;
  name: string;
  type?: string;
  capacity?: number;
}) {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("houses").insert({
    org_id: data.org_id,
    name: data.name,
    type: data.type ?? null,
    capacity: data.capacity ?? null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── updateHouse ───────────────────────────────────────────────────────────────
export async function updateHouse(
  id: string,
  org_id: string,
  data: { name?: string; type?: string; capacity?: number },
) {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("houses")
    .update(data)
    .eq("id", id)
    .eq("org_id", org_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}
