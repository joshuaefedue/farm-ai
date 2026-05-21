"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import s from "../admin.module.css";

export const dynamic = "force-dynamic";

type FarmRow = {
  id: string;
  name: string;
  slug: string;
  state: string | null;
  lga: string | null;
  plan: string;
  bird_capacity: number | null;
  suspended: boolean;
  created_at: string;
  owner_name: string | null;
  ownerProfile: string | null;
  liveBirds: number;
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function FarmsPage() {
  const [farms, setFarms]       = useState<FarmRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState("");
  const [planFilter, setPlan]   = useState("all");
  const [statusFilter, setStatus] = useState("all");
  const [, startTransition]     = useTransition();

  useEffect(() => {
    loadFarms();
  }, []);

  async function loadFarms() {
    setLoading(true);
    const db = createClient();

    const [{ data: orgs }, { data: members }, { data: batches }] = await Promise.all([
      db.from("organizations").select("*").order("created_at", { ascending: false }),
      db.from("organization_members").select("org_id, role, profiles(full_name)").eq("role", "owner"),
      db.from("batches").select("org_id, current_count, status").neq("status", "sold"),
    ]);

    const ownerByOrg: Record<string, string> = {};
    (members ?? []).forEach((m) => {
      const p = m.profiles as unknown as { full_name: string | null } | null;
      if (p?.full_name) ownerByOrg[m.org_id] = p.full_name;
    });

    const birdsByOrg: Record<string, number> = {};
    (batches ?? []).forEach((b) => {
      birdsByOrg[b.org_id] = (birdsByOrg[b.org_id] ?? 0) + (b.current_count ?? 0);
    });

    const rows: FarmRow[] = (orgs ?? []).map((o) => ({
      id: o.id, name: o.name, slug: o.slug,
      state: o.state, lga: o.lga, plan: o.plan,
      bird_capacity: o.bird_capacity,
      suspended: o.suspended,
      created_at: o.created_at,
      owner_name: o.owner_name,
      ownerProfile: ownerByOrg[o.id] ?? null,
      liveBirds: birdsByOrg[o.id] ?? 0,
    }));

    setFarms(rows);
    setLoading(false);
  }

  async function toggleSuspend(farm: FarmRow) {
    const db = createClient();
    await db
      .from("organizations")
      .update({ suspended: !farm.suspended, suspended_at: !farm.suspended ? new Date().toISOString() : null })
      .eq("id", farm.id);
    startTransition(() => {
      setFarms((prev) =>
        prev.map((f) => (f.id === farm.id ? { ...f, suspended: !f.suspended } : f))
      );
    });
  }

  async function changePlan(farm: FarmRow, newPlan: string) {
    const db = createClient();
    await db.from("organizations").update({ plan: newPlan }).eq("id", farm.id);
    startTransition(() => {
      setFarms((prev) =>
        prev.map((f) => (f.id === farm.id ? { ...f, plan: newPlan } : f))
      );
    });
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = farms.filter((f) => {
    const owner  = f.ownerProfile ?? f.owner_name ?? "";
    const q      = query.toLowerCase();
    const matchQ = !q ||
      f.name.toLowerCase().includes(q) ||
      f.slug.toLowerCase().includes(q) ||
      owner.toLowerCase().includes(q) ||
      (f.state ?? "").toLowerCase().includes(q);
    const matchP = planFilter === "all"  || f.plan === planFilter;
    const matchS = statusFilter === "all"
      ? true
      : statusFilter === "active"    ? !f.suspended
      : statusFilter === "suspended" ? f.suspended
      : true;
    return matchQ && matchP && matchS;
  });

  return (
    <>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}>🔍</span>
          <input
            className={s.searchInput}
            placeholder="Search farms, owners, states…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select
          className={s.filterSelect}
          value={planFilter}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          className={s.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        <span className={s.toolbarRight}>
          {loading ? "Loading…" : `${filtered.length} farm${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className={s.card}>
        {loading ? (
          <div className={s.empty}>
            <div style={{ color: "var(--muted)", padding: "48px 0", textAlign: "center" }}>
              Loading farms…
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>🏡</div>
            <div className={s.emptyText}>No farms found</div>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Farm</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Plan</th>
                <th>Live Birds</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((farm) => (
                <tr key={farm.id}>
                  <td>
                    <Link href={`/admin/farms/${farm.id}`} className={s.tableLink}>
                      {farm.name}
                    </Link>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      /{farm.slug}
                    </div>
                  </td>
                  <td>{farm.ownerProfile ?? farm.owner_name ?? "—"}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>
                    {[farm.state, farm.lga].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td>
                    <select
                      className={s.planSelect}
                      value={farm.plan}
                      onChange={(e) => changePlan(farm, e.target.value)}
                      title="Change plan"
                    >
                      <option value="free">free</option>
                      <option value="pro">pro</option>
                      <option value="enterprise">enterprise</option>
                    </select>
                  </td>
                  <td>{farm.liveBirds > 0 ? fmt(farm.liveBirds) : "—"}</td>
                  <td>
                    {farm.suspended ? (
                      <span className={`${s.badge} ${s.badgeRed}`}>⏸ Suspended</span>
                    ) : (
                      <span className={`${s.badge} ${s.badgeGreen}`}>✓ Active</span>
                    )}
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>
                    {fmtDate(farm.created_at)}
                  </td>
                  <td>
                    <div className={s.btnGroup}>
                      <Link
                        href={`/admin/farms/${farm.id}`}
                        className={`${s.btn} ${s.btnGhost}`}
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        View
                      </Link>
                      <button
                        className={`${s.btn} ${farm.suspended ? s.btnPrimary : s.btnDanger}`}
                        style={{ fontSize: 11, padding: "4px 8px" }}
                        onClick={() => toggleSuspend(farm)}
                      >
                        {farm.suspended ? "Activate" : "Suspend"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
