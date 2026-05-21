"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server action for onboarding — creates org + first member.
 *
 * Uses the admin (service-role) client to bypass RLS, since the user
 * can't be a member of an org that doesn't exist yet.
 * The userId is passed from the client (which reads it from getSession()).
 */
export async function completeOnboarding(data: {
  userId: string;
  ownerName?: string;
  farmName: string;
  slug: string;
  state?: string;
  lga?: string;
  address?: string;
  ownerPhone?: string;
  waNumber?: string;
  birdCapacity?: number;
  regNumber?: string;
  seedDemo?: boolean;
}) {
  if (!data.userId) {
    return { success: false, error: "Missing user ID — please sign in again." };
  }

  // Admin client bypasses RLS
  const admin = createAdminClient();

  // Verify the user actually exists in auth.users
  const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(data.userId);
  if (authErr || !authUser?.user) {
    return { success: false, error: "Invalid user — please sign in again." };
  }

  // Create organization
  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .insert({
      name: data.farmName,
      slug: data.slug,
      state: data.state ?? null,
      lga: data.lga ?? null,
      address: data.address ?? null,
      owner_name: data.ownerName ?? null,
      owner_phone: data.ownerPhone ?? null,
      wa_number: data.waNumber ?? null,
      bird_capacity: data.birdCapacity ?? null,
      reg_number: data.regNumber ?? null,
      plan: "free",
    })
    .select()
    .single();

  if (orgErr || !org) {
    return { success: false, error: orgErr?.message ?? "Failed to create farm" };
  }

  // Add creator as owner
  const { error: memberErr } = await admin
    .from("organization_members")
    .insert({
      org_id: org.id,
      user_id: data.userId,
      role: "owner",
      active: true,
      invited_by: null,
    });

  if (memberErr) {
    // Clean up the org we just created
    await admin.from("organizations").delete().eq("id", org.id);
    return { success: false, error: memberErr.message };
  }

  // 5. Seed demo data (optional)
  if (data.seedDemo) {
    await admin.rpc("seed_demo_org", { p_org_id: org.id });
  }

  return { success: true, orgId: org.id };
}
