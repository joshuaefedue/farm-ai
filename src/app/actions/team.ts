"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase: null, user: null };
  return { supabase, user };
}

async function assertManagerOrOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  org_id: string,
  user_id: string,
) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", org_id)
    .eq("user_id", user_id)
    .eq("active", true)
    .single();
  if (error || !data) return false;
  return ["owner", "manager"].includes(data.role);
}

// ── inviteMember ──────────────────────────────────────────────────────────────
export async function inviteMember(data: {
  org_id: string;
  email: string;
  full_name: string;
  role: string;
}) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const allowed = await assertManagerOrOwner(supabase, data.org_id, user.id);
  if (!allowed) return { success: false, error: "Only owners/managers can invite members" };

  // look up the invitee by email using the admin client (service role)
  const adminClient = createAdminClient();
  const { data: list, error: listErr } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) return { success: false, error: "Could not look up users" };

  const invitee = list.users.find((u) => u.email === data.email);
  if (!invitee) {
    return {
      success: false,
      error: `No account found for ${data.email}. Ask them to sign up first.`,
    };
  }

  // check if already a member
  const { data: existing } = await supabase
    .from("organization_members")
    .select("id")
    .eq("org_id", data.org_id)
    .eq("user_id", invitee.id)
    .single();

  if (existing) return { success: false, error: "User is already a member of this farm" };

  const { error } = await supabase.from("organization_members").insert({
    org_id: data.org_id,
    user_id: invitee.id,
    role: data.role as "owner" | "manager" | "vet" | "sales" | "logistics" | "readonly",
    active: true,
    invited_by: user.id,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── updateMemberRole ──────────────────────────────────────────────────────────
export async function updateMemberRole(
  member_id: string,
  org_id: string,
  role: string,
) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const allowed = await assertManagerOrOwner(supabase, org_id, user.id);
  if (!allowed) return { success: false, error: "Only owners/managers can change roles" };

  const { error } = await supabase
    .from("organization_members")
    .update({ role: role as "owner" | "manager" | "vet" | "sales" | "logistics" | "readonly" })
    .eq("id", member_id)
    .eq("org_id", org_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── removeMember ──────────────────────────────────────────────────────────────
export async function removeMember(member_id: string, org_id: string) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const allowed = await assertManagerOrOwner(supabase, org_id, user.id);
  if (!allowed) return { success: false, error: "Only owners/managers can remove members" };

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", member_id)
    .eq("org_id", org_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}
