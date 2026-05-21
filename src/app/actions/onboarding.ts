"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server action for onboarding — creates org + first member.
 *
 * Uses the admin (service-role) client to bypass RLS, since the user
 * can't be a member of an org that doesn't exist yet.  The auth user
 * is read from the regular server client (cookie-based session).
 */
export async function completeOnboarding(data: {
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
  // 1. Get the authenticated user from cookies
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { success: false, error: "Not authenticated — please sign in again." };
  }

  // 2. Admin client bypasses RLS
  const admin = createAdminClient();

  // 3. Create organization
  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .insert({
      name: data.farmName,
      slug: data.slug,
      state: data.state ?? null,
      lga: data.lga ?? null,
      address: data.address ?? null,
      owner_name: user.user_metadata?.full_name ?? null,
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

  // 4. Add creator as owner
  const { error: memberErr } = await admin
    .from("organization_members")
    .insert({
      org_id: org.id,
      user_id: user.id,
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
