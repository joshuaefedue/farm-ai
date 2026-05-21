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
const CUTOFF_30 = toDateStr(new Date(TODAY.getTime() - 30 * 86400000));

// Static mock mortality logs for demo mode
const MOCK_LOGS: BatchLog[] = [
  { id: "m1",  org_id: "", batch_id: "PB-2026-014", log_date: TODAY_STR,                          log_type: "mortality", value: 3,  notes: "Found 3 dead — no visible cause", logged_by: null, created_at: "" },
  { id: "m2",  org_id: "", batch_id: "PB-2026-015", log_date: TODAY_STR,                          log_type: "mortality", value: 8,  notes: "Respiratory signs, isolated 2",    logged_by: null, created_at: "" },
  { id: "m3",  org_id: "", batch_id: "PB-2026-013", log_date: toDateStr(new Date(TODAY.getTime() - 86400000)),           log_type: "mortality", value: 2,  notes: null,                          logged_by: null, created_at: "" },
  { id: "m4",  org_id: "", batch_id: "PB-2026-016", log_date: toDateStr(new Date(TODAY.getTime() - 2 * 86400000)),       log_type: "mortality", value: 12, notes: "Heat stress — ventilation adjusted", logged_by: null, created_at: "" },
  { id: "m5",  org_id: "", batch_id: "PB-2026-014", log_date: toDateStr(new Date(TODAY.getTime() - 3 * 86400000)),       log_type: "mortality", value: 4,  notes: null,                          logged_by: null, created_at: "" },
  { id: "m6",  org_id: "", batch_id: "PB-2026-015", log_date: toDateStr(new Date(TODAY.getTime() - 5 * 86400000)),       log_type: "mortality", value: 6,  notes: "Gumboro suspected",           logged_by: null, created_at: "" },
  { id: "m7",  org_id: "", batch_id: "PB-2026-013", log_date: toDateStr(new Date(TODAY.getTime() - 7 * 86400000)),       log_type: "mortality", value: 5,  notes: null,                          logged_by: null, created_at: "" },
];

// ── LogMortalityModal ─────────────────────────────────────────────────────────
function LogMortalityModal({
  orgId,
  batches,
  onClose,
  onSuccess,
}: {
  orgId: string;
  batches: Array<{ id: string; name: string; currentCount: number }>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    batch_id: batches[0]?.id ?? "",
    value: "",
    log_date: TODAY_STR,
    notes: "",
  });

  function handleSubmit() {
    const count = parseInt(form.value);
    if (!form.batch_id) { setError("Select a batch"); return; }
    if (!count || count <= 0) { setError("Enter number of birds lost"); return; }
    if (!SUPABASE_CONFIGURED) { onSuccess(); onClose(); return; }
    startTransition(async () => {
      const res = await createBatchLog({
        org_id: orgId,
        batch_id: form.batch_id,
        log_type: "mortality",
        value: count,
        log_date: form.log_date,
        notes: form.notes || undefined,
      });
      if (!res.success) { setError(res.error ?? "Failed to log mortality"); return; }
      onSuccess();
      onClose();
    });
  }

  const selectedBatch = batches.find((b) => b.id === form.batch_id);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="icon-dot danger"><Icons.Mortality size={14} /></div>
          <div><h3>Log mortality</h3><div className="sub">Record bird deaths for a batch</div></div>
          <div className="spacer" />
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-row" style={{ gridColumn: "span 2" }}>
              <label>Batch</label>
              <select className="select" value={form.batch_id}
                onChange={(e) => setForm({ ...form, batch_id: e.target.value })}>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.currentCount.toLocaleString()} birds)</option>
                ))}
                {batches.length === 0 && <option value="">No active batches</option>}
              </select>
            </div>
            <div className="form-row">
              <label>Birds lost</label>
              <input className="input" type="number" min={1}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="e.g. 5"
                autoFocus />
            </div>
            <div className="form-row">
              <label>Date</label>
              <input className="input" type="date" value={form.log_date}
                onChange={(e) => setForm({ ...form, log_date: e.target.value })} />
            </div>
            <div className="form-row" style={{ gridColumn: "span 2" }}>
              <label>Cause / Notes</label>
              <input className="input" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Suspected Gumboro, heat stress…" />
            </div>
          </div>
          {form.value && selectedBatch && selectedBatch.currentCount > 0 && (
            <div className={`banner ${parseInt(form.value) / selectedBatch.currentCount * 100 > 2 ? "warning" : ""}`} style={{ marginTop: 8 }}>
              <div className={`icon-dot ${parseInt(form.value) / selectedBatch.currentCount * 100 > 2 ? "warning" : ""}`}><Icons.Alert size={12} /></div>
              <span style={{ fontSize: 12 }}>
                {(parseInt(form.value) / selectedBatch.currentCount * 100).toFixed(2)}% of {selectedBatch.currentCount.toLocaleString()} birds
                {parseInt(form.value) / selectedBatch.currentCount * 100 > 2 && " — exceeds 2% threshold"}
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
            {isPending ? "Saving…" : <><Icons.Check size={14} /> Log mortality</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MortalityScreen ───────────────────────────────────────────────────────────
export default function MortalityScreen() {
  const [showLog, setShowLog] = useState(false);
  const [, startTransition] = useTransition();

  const { org } = useOrg();
  const { logs: dbLogs, isLoading, refresh } = useBatchLogs(undefined, "mortality");
  const { batches } = useBatches();

  const logs: BatchLog[] = SUPABASE_CONFIGURED ? dbLogs : MOCK_LOGS;

  // Active batches for modal
  const activeBatches = batches
    .filter((b) => b.status !== "sold")
    .map((b) => ({ id: b.id, name: b.name ?? b.id, currentCount: b.currentCount ?? 0 }));

  // KPIs
  const total30 = logs.filter((l) => l.log_date >= CUTOFF_30).reduce((s, l) => s + l.value, 0);
  const totalToday = logs.filter((l) => l.log_date === TODAY_STR).reduce((s, l) => s + l.value, 0);

  // Farm-wide mortality % across active batches
  const totalBirds = batches.filter((b) => b.status !== "sold").reduce((s, b) => s + (b.startCount ?? 0), 0);
  const allTimeDead = logs.reduce((s, l) => s + l.value, 0);
  const farmMortalityPct = totalBirds > 0 ? ((allTimeDead / totalBirds) * 100).toFixed(2) : "—";

  // Batch name lookup
  const batchName = (id: string) => batches.find((b) => b.id === id)?.name ?? id;

  // Spike detection (any single day > 2% of batch size)
  const highDays = logs.filter((l) => {
    const batch = batches.find((b) => b.id === l.batch_id);
    if (!batch || !batch.startCount) return false;
    return (l.value / batch.startCount) * 100 > 2;
  });

  const recent = [...logs].sort((a, b) => b.log_date.localeCompare(a.log_date)).slice(0, 60);

  if (isLoading) return <div className="page"><div className="empty">Loading mortality data…</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mortality</h1>
          <div className="page-sub">Last 30 days · {total30.toLocaleString()} birds lost · {farmMortalityPct}% farm-wide</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Download size={14} /> Export</button>
          <button className="btn accent" onClick={() => setShowLog(true)}>
            <Icons.Plus size={14} /> Log mortality
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {[
          { label: "Today",        value: totalToday,               hint: `${totalToday} birds`, tone: totalToday > 10 ? "warning" : undefined },
          { label: "Last 30 days", value: total30.toLocaleString(), hint: "All batches combined" },
          { label: "Farm-wide %",  value: `${farmMortalityPct}%`,  hint: "Vs start counts",  tone: parseFloat(farmMortalityPct) > 5 ? "danger" : parseFloat(farmMortalityPct) > 2 ? "warning" : undefined },
          { label: "Spike alerts", value: highDays.length,         hint: "> 2% / day threshold", tone: highDays.length > 0 ? "danger" : undefined },
        ].map((k) => (
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value tnum" style={{
              color: k.tone === "danger" ? "var(--danger-soft-fg)" : k.tone === "warning" ? "var(--warning-soft-fg)" : "var(--fg)",
            }}>{k.value}</div>
            <div className="row" style={{ gap: 6 }}>
              {k.hint && <span className="muted" style={{ fontSize: 11.5 }}>{k.hint}</span>}
            </div>
          </div>
        ))}
      </div>

      {highDays.length > 0 && (
        <div className="banner danger" style={{ marginBottom: 12 }}>
          <div className="icon-dot danger"><Icons.Alert size={12} /></div>
          <div style={{ flex: 1 }}>
            <strong>{highDays.length} high-mortality event{highDays.length > 1 ? "s" : ""} detected.</strong>{" "}
            Check affected batches immediately — consider vet consultation.
          </div>
          <button className="btn sm">View batches</button>
        </div>
      )}

      {recent.length === 0 ? (
        <div className="empty">
          <Icons.Mortality size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
          <div style={{ fontWeight: 500, marginBottom: 4 }}>No mortality logs yet</div>
          <div style={{ fontSize: 13 }}>Record bird deaths to track health trends across batches</div>
          <button className="btn accent sm" style={{ marginTop: 12 }} onClick={() => setShowLog(true)}>
            <Icons.Plus size={12} /> Log first event
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Batch</th>
                <th className="num">Birds lost</th>
                <th className="num">% of batch</th>
                <th>Notes / Cause</th>
                <th>Alert</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((log) => {
                const batch = batches.find((b) => b.id === log.batch_id);
                const pct = batch?.startCount ? ((log.value / batch.startCount) * 100) : null;
                const isSpike = pct != null && pct > 2;
                return (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {new Date(log.log_date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit" })}
                      {log.log_date === TODAY_STR && <span className="badge accent" style={{ marginLeft: 6, fontSize: 9 }}>Today</span>}
                    </td>
                    <td className="id-cell">{batchName(log.batch_id)}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{log.value.toLocaleString()}</td>
                    <td className="num">
                      {pct != null ? (
                        <span style={{ color: pct > 2 ? "var(--danger-soft-fg)" : pct > 1 ? "var(--warning-soft-fg)" : "var(--fg-muted)", fontSize: 12 }}>
                          {pct.toFixed(2)}%
                        </span>
                      ) : <span className="faint">—</span>}
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>{log.notes ?? "—"}</td>
                    <td>
                      {isSpike ? (
                        <span className="badge danger" style={{ fontSize: 10 }}>
                          <span className="dot" /> Spike
                        </span>
                      ) : (
                        <span className="badge success" style={{ fontSize: 10 }}>Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showLog && (
        <LogMortalityModal
          orgId={org?.id ?? ""}
          batches={activeBatches}
          onClose={() => setShowLog(false)}
          onSuccess={() => startTransition(() => refresh())}
        />
      )}
    </div>
  );
}
