"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/supabase/auth-helper";
import type { Json } from "@/lib/supabase/types";

// ── updateOrgProfile ──────────────────────────────────────────────────────────
export async function updateOrgProfile(
  org_id: string,
  data: {
    name?: string;
    reg_number?: string;
    state?: string;
    lga?: string;
    address?: string;
    size_ha?: number;
    bird_capacity?: number;
    owner_name?: string;
    owner_phone?: string;
    wa_number?: string;
    established_year?: number;
    logo_url?: string;
  },
) {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  // verify user is owner of this org
  const { data: member, error: memberErr } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", org_id)
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  if (memberErr || !member) return { success: false, error: "Access denied" };
  if (!["owner", "manager"].includes(member.role)) {
    return { success: false, error: "Only owners and managers can update farm settings" };
  }

  const { error } = await supabase
    .from("organizations")
    .update(data)
    .eq("id", org_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── updateNotificationSettings ────────────────────────────────────────────────
export async function updateNotificationSettings(
  org_id: string,
  settings: Record<string, unknown>,
) {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("notification_settings").upsert(
    { org_id, settings: settings as unknown as Json },
    { onConflict: "org_id" },
  );

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── updateProfile ─────────────────────────────────────────────────────────────
export async function updateProfile(data: {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}) {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}
