"use client";
import { useState, useTransition } from "react";
import { Icons } from "@/components/icons";
import { TODAY } from "@/lib/data";
import { useBatchLogs } from "@/hooks/useBatchLogs";
import { useBatches } from "@/hooks/useBatches";
import { useOrg } from "@/contexts/OrgContext";
import { createBatchLog } from "@/app/actions/batches";
import type { BatchLog } from "@/lib/supabase/types";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
const TODAY_STR = toDateStr(TODAY);

// Static mock egg logs for demo mode
const MOCK_LOGS: BatchLog[] = [
  { id: "e1",  org_id: "", batch_id: "PB-2026-014", log_date: TODAY_STR,              log_type: "eggs", value: 4320, notes: null, logged_by: null, created_at: "" },
  { id: "e2",  org_id: "", batch_id: "PB-2026-012", log_date: TODAY_STR,              log_type: "eggs", value: 3960, notes: null, logged_by: null, created_at: "" },
  { id: "e3",  org_id: "", batch_id: "PB-2026-010", log_date: TODAY_STR,              log_type: "eggs", value: 2560, notes: null, logged_by: null, created_at: "" },
  { id: "e4",  org_id: "", batch_id: "PB-2026-014", log_date: toDateStr(new Date(TODAY.getTime() - 86400000)), log_type: "eggs", value: 4290, notes: null, logged_by: null, created_at: "" },
  { id: "e5",  org_id: "", batch_id: "PB-2026-012", log_date: toDateStr(new Date(TODAY.getTime() - 86400000)), log_type: "eggs", value: 3940, notes: null, logged_by: null, created_at: "" },
  { id: "e6",  org_id: "", batch_id: "PB-2026-010", log_date: toDateStr(new Date(TODAY.getTime() - 86400000)), log_type: "eggs", value: 2550, notes: null, logged_by: null, created_at: "" },
  { id: "e7",  org_id: "", batch_id: "PB-2026-014", log_date: toDateStr(new Date(TODAY.getTime() - 2 * 86400000)), log_type: "eggs", value: 4310, notes: null, logged_by: null, created_at: "" },
  { id: "e8",  org_id: "", batch_id: "PB-2026-012", log_date: toDateStr(new Date(TODAY.getTime() - 2 * 86400000)), log_type: "eggs", value: 3920, notes: null, logged_by: null, created_at: "" },
];

// ── LogCollectionModal ────────────────────────────────────────────────────────
function LogCollectionModal({
  orgId,
  layerBatches,
  onClose,
  onSuccess,
}: {
  orgId: string;
  layerBatches: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    batch_id: layerBatches[0]?.id ?? "",
    value: "",
    log_date: TODAY_STR,
    notes: "",
  });

  function handleSubmit() {
    const eggs = parseInt(form.value);
    if (!form.batch_id) { setError("Select a batch"); return; }
    if (!eggs || eggs <= 0) { setError("Enter egg count"); return; }
    if (!SUPABASE_CONFIGURED) { onSuccess(); onClose(); return; }
    startTransition(async () => {
      const res = await createBatchLog({
        org_id: orgId,
        batch_id: form.batch_id,
        log_type: "eggs",
        value: eggs,
        log_date: form.log_date,
        notes: form.notes || undefined,
      });
      if (!res.success) { setError(res.error ?? "Failed to log collection"); return; }
      onSuccess();
      onClose();
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="icon-dot"><Icons.Egg size={14} /></div>
          <div><h3>Log egg collection</h3><div className="sub">Record today's collection per batch</div></div>
          <div className="spacer" />
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-row" style={{ gridColumn: "span 2" }}>
              <label>Batch</label>
              <select className="select" value={form.batch_id}
                onChange={(e) => setForm({ ...form, batch_id: e.target.value })}>
                {layerBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                {layerBatches.length === 0 && <option value="">No layer batches</option>}
              </select>
            </div>
            <div className="form-row">
              <label>Eggs collected</label>
              <input className="input" type="number" min={1}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="e.g. 4 200"
                autoFocus />
            </div>
            <div className="form-row">
              <label>Collection date</label>
              <input className="input" type="date" value={form.log_date}
                onChange={(e) => setForm({ ...form, log_date: e.target.value })} />
            </div>
            <div className="form-row" style={{ gridColumn: "span 2" }}>
              <label>Notes (optional)</label>
              <input className="input" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Broken eggs, observations…" />
            </div>
          </div>
          {form.value && (
            <div className="banner" style={{ marginTop: 8 }}>
              <div className="icon-dot"><Icons.Info size={12} /></div>
              <span style={{ fontSize: 12 }}>
                {parseInt(form.value || "0").toLocaleString()} eggs · {Math.floor(parseInt(form.value || "0") / 30)} crates of 30
              </span>
            </div>
          )}
          {error && (
            <div className="banner danger" style={{ marginTop: 8 }}>
              <div className="icon-dot danger"><Icons.Alert size={12} /></div>
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose} disabled={isPending}>Cancel</button>
          <button className="btn accent" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : <><Icons.Check size={14} /> Log collection</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EggsScreen ────────────────────────────────────────────────────────────────
export default function EggsScreen() {
  const [showLog, setShowLog] = useState(false);
  const [, startTransition] = useTransition();

  const { org } = useOrg();
  const { logs: dbLogs, isLoading, refresh } = useBatchLogs(undefined, "eggs");
  const { batches } = useBatches();

  const logs: BatchLog[] = SUPABASE_CONFIGURED ? dbLogs : MOCK_LOGS;

  // Layer batches for modal dropdown
  const layerBatches = batches
    .filter((b) => b.type === "layer" || b.type === "dual")
    .map((b) => ({ id: b.id, name: b.name ?? b.id }));

  // KPIs
  const todayLogs = logs.filter((l) => l.log_date === TODAY_STR);
  const totalToday = todayLogs.reduce((s, l) => s + (l.value ?? 0), 0);
  const cratesTotal = Math.floor(totalToday / 30);

  // Yesterday
  const yestStr = toDateStr(new Date(TODAY.getTime() - 86400000));
  const totalYesterday = logs.filter((l) => l.log_date === yestStr).reduce((s, l) => s + l.value, 0);
  const eggDelta = totalYesterday > 0 ? ((totalToday - totalYesterday) / totalYesterday * 100).toFixed(1) : null;

  // Last 30 days total
  const cutoff30 = new Date(TODAY.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const total30 = logs.filter((l) => l.log_date >= cutoff30).reduce((s, l) => s + l.value, 0);

  // Batch name lookup
  const batchName = (id: string) => batches.find((b) => b.id === id)?.name ?? id;

  // Recent logs grouped by date
  const recent = [...logs].sort((a, b) => b.log_date.localeCompare(a.log_date)).slice(0, 50);

  if (isLoading) return <div className="page"><div className="empty">Loading egg production data…</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Egg production</h1>
          <div className="page-sub">
            Today: {totalToday.toLocaleString()} eggs · {cratesTotal} crates · Farm-wide collections
          </div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Download size={14} /> Export</button>
          <button className="btn accent" onClick={() => setShowLog(true)}>
            <Icons.Plus size={14} /> Log collection
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {[
          {
            label: "Today's eggs",
            value: totalToday.toLocaleString(),
            hint: `${cratesTotal} crates of 30`,
            trend: eggDelta ? `${Number(eggDelta) >= 0 ? "+" : ""}${eggDelta}% vs yesterday` : undefined,
            trendDir: eggDelta && Number(eggDelta) >= 0 ? "up" : "down",
          },
          {
            label: "Yesterday",
            value: totalYesterday.toLocaleString(),
            hint: `${Math.floor(totalYesterday / 30)} crates`,
          },
          {
            label: "Last 30 days",
            value: total30.toLocaleString(),
            hint: `${Math.floor(total30 / 30)} crates`,
          },
          {
            label: "Active layer batches",
            value: layerBatches.length,
            hint: layerBatches.slice(0, 2).map((b) => b.name).join(", ") || "No layer batches",
          },
        ].map((k) => (
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value tnum">{k.value}</div>
            <div className="row" style={{ gap: 6 }}>
              {k.trend && (
                <div className={`kpi-trend ${k.trendDir}`}>
                  <Icons.TrendUp size={11} />{k.trend}
                </div>
              )}
              {k.hint && <span className="muted" style={{ fontSize: 11.5 }}>{k.hint}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Collection log table */}
      {recent.length === 0 ? (
        <div className="empty">
          <Icons.Egg size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
          <div style={{ fontWeight: 500, marginBottom: 4 }}>No egg collections logged yet</div>
          <div style={{ fontSize: 13 }}>Log your first collection to track production</div>
          <button className="btn accent sm" style={{ marginTop: 12 }} onClick={() => setShowLog(true)}>
            <Icons.Plus size={12} /> Log collection
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Batch</th>
                <th className="num">Eggs</th>
                <th className="num">Crates (30)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: 12, color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}>
                    {new Date(log.log_date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit" })}
                    {log.log_date === TODAY_STR && <span className="badge accent" style={{ marginLeft: 6, fontSize: 9 }}>Today</span>}
                  </td>
                  <td className="id-cell">{batchName(log.batch_id)}</td>
                  <td className="num" style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {log.value.toLocaleString()}
                  </td>
                  <td className="num faint">{Math.floor(log.value / 30)}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{log.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showLog && (
        <LogCollectionModal
          orgId={org?.id ?? ""}
          layerBatches={layerBatches}
          onClose={() => setShowLog(false)}
          onSuccess={() => startTransition(() => refresh())}
        />
      )}
    </div>
  );
}
