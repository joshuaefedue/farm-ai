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

// ── saveCustomDomain ──────────────────────────────────────────────────────────
export async function saveCustomDomain(org_id: string, domain: string | null) {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  // Only owner can manage custom domain
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", org_id)
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  if (!member || member.role !== "owner") {
    return { success: false, error: "Only the farm owner can manage custom domains" };
  }

  // Normalize: strip protocol, trailing slashes, whitespace
  let cleaned: string | null = null;
  if (domain && domain.trim()) {
    cleaned = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "")
      .replace(/^www\./, "");

    // Basic domain format validation
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
    if (!domainRegex.test(cleaned)) {
      return { success: false, error: "Invalid domain format. Example: store.yourfarm.com" };
    }

    // Check if domain is already used by another org
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("custom_domain", cleaned)
      .neq("id", org_id)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "This domain is already connected to another farm" };
    }
  }

  const { error } = await supabase
    .from("organizations")
    .update({ custom_domain: cleaned, domain_verified: false })
    .eq("id", org_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true, domain: cleaned };
}

// ── verifyCustomDomain ───────────────────────────────────────────────────────
export async function verifyCustomDomain(org_id: string) {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated", verified: false };

  // Only owner can verify
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", org_id)
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  if (!member || member.role !== "owner") {
    return { success: false, error: "Only the farm owner can verify domains", verified: false };
  }

  // Get current domain
  const { data: orgData } = await supabase
    .from("organizations")
    .select("custom_domain")
    .eq("id", org_id)
    .single();

  if (!orgData?.custom_domain) {
    return { success: false, error: "No custom domain configured", verified: false };
  }

  const expectedToken = `acre-verify=${org_id}`;

  try {
    // Use DNS-over-HTTPS (Cloudflare) to resolve TXT records
    // This works in Edge and Node runtimes without needing the dns module
    const resp = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(orgData.custom_domain)}&type=TXT`,
      { headers: { Accept: "application/dns-json" }, cache: "no-store" },
    );

    if (!resp.ok) {
      return { success: false, error: "DNS lookup failed — please try again", verified: false };
    }

    const dns = await resp.json() as { Answer?: Array<{ data: string }> };
    const txtRecords = (dns.Answer ?? []).map((a) => a.data.replace(/"/g, ""));
    const found = txtRecords.some((txt) => txt === expectedToken);

    if (found) {
      await supabase
        .from("organizations")
        .update({ domain_verified: true })
        .eq("id", org_id);

      revalidatePath("/");
      return { success: true, verified: true };
    }

    return {
      success: false,
      verified: false,
      error: `TXT record not found. Add a TXT record with value "${expectedToken}" to ${orgData.custom_domain}`,
    };
  } catch {
    return { success: false, error: "DNS verification failed — check your internet connection", verified: false };
  }
}

// ── removeCustomDomain ───────────────────────────────────────────────────────
export async function removeCustomDomain(org_id: string) {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", org_id)
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  if (!member || member.role !== "owner") {
    return { success: false, error: "Only the farm owner can manage custom domains" };
  }

  const { error } = await supabase
    .from("organizations")
    .update({ custom_domain: null, domain_verified: false })
    .eq("id", org_id);

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
