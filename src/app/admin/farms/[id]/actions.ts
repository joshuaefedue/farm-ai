"use server";

import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";

export async function suspendFarm(id: string, reason: string) {
  const db = createAdminClient();
  const { error } = await db
    .from("organizations")
    .update({
      suspended:      true,
      suspended_at:   new Date().toISOString(),
      suspended_note: reason || "Suspended by admin",
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/farms/${id}`);
  revalidatePath("/admin/farms");
  revalidatePath("/admin/dashboard");
}

export async function activateFarm(id: string) {
  const db = createAdminClient();
  const { error } = await db
    .from("organizations")
    .update({ suspended: false, suspended_at: null, suspended_note: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/farms/${id}`);
  revalidatePath("/admin/farms");
  revalidatePath("/admin/dashboard");
}

export async function changeFarmPlan(id: string, plan: "free" | "pro" | "enterprise") {
  const db = createAdminClient();
  const { error } = await db
    .from("organizations")
    .update({ plan })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/farms/${id}`);
  revalidatePath("/admin/farms");
  revalidatePath("/admin/dashboard");
}

export async function deleteFarm(id: string) {
  const db = createAdminClient();
  // Delete the org — cascade will clean up all related data
  const { error } = await db.from("organizations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/farms");
  revalidatePath("/admin/dashboard");
}
