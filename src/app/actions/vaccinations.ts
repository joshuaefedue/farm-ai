"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase: null, user: null };
  return { supabase, user };
}

// ── markVaccinationDone ───────────────────────────────────────────────────────
export async function markVaccinationDone(
  id: string,
  data: {
    administered_date: string;
    administered_by?: string;
    birds_count?: number;
    lot_number?: string;
    notes?: string;
  },
) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("vaccinations")
    .update({
      status: "done",
      administered_date: data.administered_date,
      administered_by: data.administered_by ? user.id : null,
      birds_count: data.birds_count ?? null,
      lot_number: data.lot_number ?? null,
      notes: data.notes ?? null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── createVaccination ─────────────────────────────────────────────────────────
export async function createVaccination(data: {
  org_id: string;
  batch_id?: string;
  vaccine: string;
  route?: string;
  scheduled_date: string;
  birds_count?: number;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("vaccinations").insert({
    org_id: data.org_id,
    batch_id: data.batch_id ?? null,
    vaccine: data.vaccine,
    route: data.route ?? null,
    scheduled_date: data.scheduled_date,
    birds_count: data.birds_count ?? null,
    notes: data.notes ?? null,
    status: "pending",
    administered_date: null,
    lot_number: null,
    administered_by: null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}
