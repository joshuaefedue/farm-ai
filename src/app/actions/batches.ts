"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── helpers ────────────────────────────────────────────────────────────────────
async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase: null, user: null };
  return { supabase, user };
}

async function nextBatchId(supabase: Awaited<ReturnType<typeof createClient>>, year: number) {
  const { data } = await supabase
    .from("batches")
    .select("id")
    .like("id", `PB-${year}-%`)
    .order("id", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return `PB-${year}-001`;
  const last = data[0].id; // e.g. "PB-2026-014"
  const num = parseInt(last.split("-")[2] ?? "0", 10);
  return `PB-${year}-${String(num + 1).padStart(3, "0")}`;
}

// ── createBatch ───────────────────────────────────────────────────────────────
export async function createBatch(data: {
  org_id: string;
  type: "layer" | "broiler" | "dual";
  breed?: string;
  start_count?: number;
  supplier?: string;
  cost_per_bird?: number;
  house_id?: string;
  house_name?: string;
  arrival_date?: string;
  auto_schedule?: boolean;
}) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const year = new Date().getFullYear();
  const batchId = await nextBatchId(supabase, year);

  const { error } = await supabase.from("batches").insert({
    id: batchId,
    org_id: data.org_id,
    name: null,
    type: data.type,
    breed: data.breed ?? null,
    start_count: data.start_count ?? null,
    current_count: data.start_count ?? null,
    supplier: data.supplier ?? null,
    cost_per_bird: data.cost_per_bird ?? null,
    house_id: data.house_id ?? null,
    house_name: data.house_name ?? null,
    arrival_date: data.arrival_date ?? null,
    status: "growing",
    mortality_pct: 0,
    fcr: 0,
    egg_rate: null,
    avg_weight: null,
  });

  if (error) return { success: false, error: error.message };

  // auto-schedule vaccinations if requested
  if (data.auto_schedule && data.arrival_date) {
    await scheduleVaccinations(
      supabase,
      data.org_id,
      batchId,
      data.arrival_date,
      data.start_count ?? 0,
      data.type,
    );
  }

  revalidatePath("/");
  return { success: true, batchId };
}

// ── updateBatch ───────────────────────────────────────────────────────────────
export async function updateBatch(
  id: string,
  org_id: string,
  updates: {
    breed?: string;
    status?: "laying" | "growing" | "sold";
    house_name?: string;
    current_count?: number;
    fcr?: number;
    egg_rate?: number;
    avg_weight?: number;
  },
) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("batches")
    .update(updates)
    .eq("id", id)
    .eq("org_id", org_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── closeBatch ────────────────────────────────────────────────────────────────
export async function closeBatch(id: string, org_id: string) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("batches")
    .update({ status: "sold" })
    .eq("id", id)
    .eq("org_id", org_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── createBatchLog ────────────────────────────────────────────────────────────
export async function createBatchLog(data: {
  org_id: string;
  batch_id: string;
  log_type: "mortality" | "feed" | "eggs" | "weight";
  value: number;
  log_date?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("batch_logs").insert({
    org_id: data.org_id,
    batch_id: data.batch_id,
    log_type: data.log_type,
    value: data.value,
    log_date: data.log_date ?? new Date().toISOString().slice(0, 10),
    notes: data.notes ?? null,
    logged_by: user.id,
  });

  if (error) return { success: false, error: error.message };

  // recalculate mortality_pct when logging deaths
  if (data.log_type === "mortality") {
    const { data: batch } = await supabase
      .from("batches")
      .select("start_count")
      .eq("id", data.batch_id)
      .single();

    const { data: logs } = await supabase
      .from("batch_logs")
      .select("value")
      .eq("batch_id", data.batch_id)
      .eq("log_type", "mortality");

    if (batch?.start_count && logs) {
      const totalDead = logs.reduce((s, l) => s + (l.value ?? 0), 0);
      const pct = (totalDead / batch.start_count) * 100;
      const newCount = Math.max(0, batch.start_count - totalDead);

      await supabase
        .from("batches")
        .update({ mortality_pct: pct, current_count: newCount })
        .eq("id", data.batch_id);
    }
  }

  revalidatePath("/");
  return { success: true };
}

// ── internal: scheduleVaccinations ───────────────────────────────────────────
async function scheduleVaccinations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  org_id: string,
  batch_id: string,
  arrival_date: string,
  bird_count: number,
  batch_type: string,
) {
  const SCHEDULE = [
    { day: 1,   vaccine: "Marek's HVT",           route: "Sub-cut injection", types: ["broiler", "layer", "dual"] },
    { day: 7,   vaccine: "Newcastle B1",            route: "Drinking water",    types: ["broiler", "layer", "dual"] },
    { day: 14,  vaccine: "Gumboro D1 (IBD)",        route: "Drinking water",    types: ["broiler", "layer", "dual"] },
    { day: 21,  vaccine: "Newcastle + Gumboro D2",  route: "Drinking water",    types: ["broiler", "layer", "dual"] },
    { day: 28,  vaccine: "Fowl Pox FP-LT",         route: "Wing web",          types: ["layer", "dual"] },
    { day: 35,  vaccine: "ILT (Laryngo)",           route: "Eye drop",          types: ["layer"] },
    { day: 42,  vaccine: "NDV booster",             route: "Spray",             types: ["broiler", "layer", "dual"] },
    { day: 56,  vaccine: "ILT booster",             route: "Eye drop",          types: ["layer"] },
    { day: 90,  vaccine: "Newcastle Lasota",        route: "Drinking water",    types: ["layer", "dual"] },
    { day: 120, vaccine: "Newcastle booster",       route: "Drinking water",    types: ["layer", "dual"] },
  ];

  const arrivalMs = new Date(arrival_date).getTime();
  const rows = SCHEDULE
    .filter((s) => s.types.includes(batch_type))
    .map((s) => {
      const d = new Date(arrivalMs + s.day * 86400000);
      return {
        org_id,
        batch_id,
        vaccine: s.vaccine,
        route: s.route,
        scheduled_date: d.toISOString().slice(0, 10),
        birds_count: bird_count,
        status: "pending" as const,
        administered_date: null,
        lot_number: null,
        notes: null,
        administered_by: null,
      };
    });

  if (rows.length > 0) {
    await supabase.from("vaccinations").insert(rows);
  }
}
