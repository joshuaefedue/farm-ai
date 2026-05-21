"use client";
import { useState, useTransition } from "react";
import { Icons } from "@/components/icons";
import { VAX, BATCHES, TODAY } from "@/lib/data";
import { num } from "@/lib/utils";
import { useVaccinations } from "@/hooks/useVaccinations";
import { markVaccinationDone } from "@/app/actions/vaccinations";

const VACCINE_INVENTORY = [
  { name: "Newcastle Lasota", type: "Live", doses: 12000, unit: "dose vial", expiry: "2026-08-15", status: "ok" },
  { name: "Gumboro D2 (IBD)", type: "Live", doses: 8000, unit: "dose vial", expiry: "2026-07-01", status: "ok" },
  { name: "ILT (Laryngotracheitis)", type: "Live", doses: 5000, unit: "dose vial", expiry: "2026-06-20", status: "low" },
  { name: "Fowl Pox FP-LT", type: "Live", doses: 0, unit: "dose vial", expiry: "—", status: "out" },
  { name: "Marek's HVT", type: "Live", doses: 6000, unit: "dose vial", expiry: "2026-09-30", status: "ok" },
  { name: "NDV ND-Clone 45", type: "Live", doses: 10000, unit: "dose vial", expiry: "2026-10-15", status: "ok" },
];

const STANDARD_SCHEDULE = [
  { day: 1, vaccine: "Marek's HVT", route: "Sub-cut injection", types: ["broiler", "layer", "dual"] },
  { day: 7, vaccine: "Newcastle B1", route: "Drinking water", types: ["broiler", "layer", "dual"] },
  { day: 14, vaccine: "Gumboro D1 (IBD)", route: "Drinking water", types: ["broiler", "layer", "dual"] },
  { day: 21, vaccine: "Newcastle + Gumboro D2", route: "Drinking water", types: ["broiler", "layer", "dual"] },
  { day: 28, vaccine: "Fowl Pox FP-LT", route: "Wing web", types: ["layer", "dual"] },
  { day: 35, vaccine: "ILT (Laryngo)", route: "Eye drop", types: ["layer"] },
  { day: 42, vaccine: "NDV booster", route: "Spray", types: ["broiler", "layer", "dual"] },
  { day: 56, vaccine: "ILT booster", route: "Eye drop", types: ["layer"] },
  { day: 90, vaccine: "Newcastle Lasota", route: "Drinking water", types: ["layer", "dual"] },
  { day: 120, vaccine: "Newcastle booster", route: "Drinking water", types: ["layer", "dual"] },
];

// Normalised view model used by this screen
interface VaxItem {
  id: string;
  vaccine: string;
  route: string | null;
  batch: string | null;
  house: string | null;
  date: Date;
  birds: number;
  status: "pending" | "done";
}

function getDaysUntil(date: Date): number {
  return Math.round((date.getTime() - TODAY.getTime()) / 86400000);
}

function LogDoseModal({
  vaxEntry,
  onClose,
  onSuccess,
}: {
  vaxEntry: VaxItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [dateVal, setDateVal] = useState(TODAY.toISOString().slice(0, 10));
  const [administeredBy, setAdministeredBy] = useState("Dr. Ngozi Eze");
  const [birds, setBirds] = useState(vaxEntry.birds);
  const [lot, setLot] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    setSaving(true);
    setErrMsg(null);
    const res = await markVaccinationDone(vaxEntry.id, {
      administered_date: dateVal,
      administered_by: administeredBy,
      birds_count: birds,
      lot_number: lot || undefined,
      notes: notes || undefined,
    });
    setSaving(false);
    if (!res.success) { setErrMsg(res.error ?? "Failed to log dose"); return; }
    onSuccess();
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Log vaccine dose</h3>
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          {errMsg && <div className="banner danger" style={{ marginBottom: 12 }}><Icons.Alert size={14} /> {errMsg}</div>}
          <div className="banner success" style={{ marginBottom: 12 }}>
            <div className="icon-dot success"><Icons.Check size={12} /></div>
            <div>{vaxEntry.vaccine}{vaxEntry.batch ? ` for ${vaxEntry.batch}` : ""} — {num(vaxEntry.birds)} birds</div>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label>Date administered</label>
              <input className="input" type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Administered by</label>
              <select className="select" value={administeredBy} onChange={(e) => setAdministeredBy(e.target.value)}>
                <option>Dr. Ngozi Eze</option>
                <option>Babatunde Salami</option>
                <option>External vet</option>
              </select>
            </div>
            <div className="form-row">
              <label>Birds vaccinated</label>
              <input className="input" type="number" value={birds} onChange={(e) => setBirds(+e.target.value)} />
            </div>
            <div className="form-row">
              <label>Batch / lot number</label>
              <input className="input" placeholder="Vaccine lot #" value={lot} onChange={(e) => setLot(e.target.value)} />
            </div>
            <div className="form-row" style={{ gridColumn: "1 / -1" }}>
              <label>Notes</label>
              <input className="input" placeholder="Any adverse reactions?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn accent" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : <><Icons.Check size={14} /> Mark as done</>}
          </button>
        </div>
      </div>
    </div>
  );
}

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAY_2026_FIRST_DOW = 4;

export default function VaccinationsScreen() {
  const { vaccinations: dbVax, isLoading, refresh } = useVaccinations();
  const [view, setView] = useState("list");
  const [logEntry, setLogEntry] = useState<VaxItem | null>(null);
  const [, startTransition] = useTransition();

  // Normalise DB vaccinations to VaxItem, fallback to mock if empty
  const items: VaxItem[] = (() => {
    if (isLoading) return [];
    if (Array.isArray(dbVax) && dbVax.length > 0 && "scheduled_date" in dbVax[0]) {
      // Real DB data (Vaccination type)
      return (dbVax as import("@/lib/supabase/types").Vaccination[]).map((v) => ({
        id: v.id,
        vaccine: v.vaccine,
        route: v.route,
        batch: v.batch_id ?? null,
        house: null,
        date: new Date(v.scheduled_date),
        birds: v.birds_count ?? 0,
        status: v.status as "pending" | "done",
      }));
    }
    // Mock data fallback
    return VAX.map((v) => ({
      id: String(v.id),
      vaccine: v.vaccine,
      route: v.route,
      batch: v.batch,
      house: BATCHES.find((b) => b.id === v.batch)?.house ?? null,
      date: v.date,
      birds: v.birds,
      status: v.status as "pending" | "done",
    }));
  })();

  const overdue = items.filter((v) => v.status === "pending" && getDaysUntil(v.date) < 0);
  const today_vax = items.filter((v) => v.status === "pending" && getDaysUntil(v.date) === 0);
  const upcoming = items.filter((v) => v.status === "pending" && getDaysUntil(v.date) > 0 && getDaysUntil(v.date) <= 14);
  const done_vax = items.filter((v) => v.status === "done");
  const further = items.filter((v) => v.status === "pending" && getDaysUntil(v.date) > 14);

  const calendarEvents: Record<number, VaxItem[]> = {};
  items.forEach((v) => {
    if (v.date.getMonth() === 4 && v.date.getFullYear() === 2026) {
      const d = v.date.getDate();
      if (!calendarEvents[d]) calendarEvents[d] = [];
      calendarEvents[d].push(v);
    }
  });

  const totalCells = MAY_2026_FIRST_DOW + 31;
  const calCells = Array.from({ length: Math.ceil(totalCells / 7) * 7 }, (_, i) => {
    const day = i - MAY_2026_FIRST_DOW + 1;
    return day >= 1 && day <= 31 ? day : null;
  });

  const VaxRow = ({ v }: { v: VaxItem }) => {
    const days = getDaysUntil(v.date);
    return (
      <tr>
        <td>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{v.vaccine}</div>
          <div className="faint" style={{ fontSize: 11.5 }}>{v.route}</div>
        </td>
        <td className="id-cell">{v.batch ?? "—"}</td>
        <td className="muted" style={{ fontSize: 12 }}>{v.house ?? "—"}</td>
        <td className="muted" style={{ fontSize: 12.5 }}>{v.date.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
        <td className="num">{num(v.birds)}</td>
        <td>
          {v.status === "done"
            ? <span className="badge success">done</span>
            : days < 0
              ? <span className="badge danger">overdue {Math.abs(days)}d</span>
              : days === 0
                ? <span className="badge warning">today</span>
                : <span className="badge outline">in {days}d</span>}
        </td>
        <td>
          {v.status === "pending" && (
            <button className="btn sm accent" onClick={() => setLogEntry(v)}><Icons.Check size={12} /> Log</button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vaccinations</h1>
          <div className="page-sub">
            {isLoading ? "Loading…" : `${overdue.length} overdue · ${today_vax.length} today · ${upcoming.length} upcoming · ${done_vax.length} completed`}
          </div>
        </div>
        <div className="page-actions">
          <div className="btn-group">
            {["calendar", "list", "programs"].map((v) => (
              <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn accent"><Icons.Plus size={14} /> Schedule vaccine</button>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="banner danger" style={{ marginBottom: 16 }}>
          <div className="icon-dot danger"><Icons.Warning size={12} /></div>
          <div><strong>{overdue.length} overdue vaccination(s)</strong> — {overdue.map((v) => v.vaccine).join(", ")}. Please log or reschedule immediately.</div>
        </div>
      )}

      {view === "calendar" && (
        <div className="card">
          <div className="card-header"><div className="card-title">May 2026</div></div>
          <div style={{ padding: "0 16px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
              {WEEK_DAYS.map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 11.5, fontWeight: 600, color: "var(--fg-muted)", padding: "4px 0" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {calCells.map((day, i) => {
                const events = day ? calendarEvents[day] || [] : [];
                const isToday = day === TODAY.getDate();
                return (
                  <div key={i} style={{ minHeight: 64, padding: 4, borderRadius: 6, background: day ? (isToday ? "var(--accent-soft)" : "var(--bg-sunken)") : "transparent", border: isToday ? "1px solid var(--accent)" : "1px solid transparent" }}>
                    {day && (
                      <>
                        <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "var(--accent)" : "var(--fg)", marginBottom: 2 }}>{day}</div>
                        {events.map((e, j) => (
                          <div key={j} style={{ fontSize: 10, padding: "2px 4px", borderRadius: 3, background: e.status === "done" ? "var(--success-soft-fg)" : getDaysUntil(e.date) < 0 ? "var(--danger-soft-fg)" : "var(--accent)", color: "white", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {e.vaccine.split(" ")[0]}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="stack-3">
          {isLoading && <div className="muted" style={{ padding: 24, textAlign: "center" }}>Loading vaccinations…</div>}
          {[
            { label: "Overdue", color: "var(--danger-soft-fg)", list: overdue },
            { label: "Today", color: "var(--warning-soft-fg)", list: today_vax },
            { label: "Upcoming · next 14 days", color: undefined, list: upcoming },
            { label: "Further out", color: undefined, list: further },
            { label: "Completed", color: undefined, list: done_vax },
          ].filter((g) => g.list.length > 0).map((g) => (
            <div key={g.label}>
              <div className="section-title" style={{ color: g.color, marginBottom: 8 }}>{g.label} ({g.list.length})</div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Vaccine</th><th>Batch</th><th>House</th><th>Date</th><th className="num">Birds</th><th>Status</th><th></th></tr></thead>
                  <tbody>{g.list.map((v) => <VaxRow key={v.id} v={v} />)}</tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "programs" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Standard vaccination schedule</div></div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Day</th><th>Vaccine</th><th>Route</th><th>Types</th></tr></thead>
                <tbody>
                  {STANDARD_SCHEDULE.map((s) => (
                    <tr key={s.day}>
                      <td className="mono" style={{ fontWeight: 600, fontSize: 12 }}>D+{s.day}</td>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{s.vaccine}</td>
                      <td className="muted" style={{ fontSize: 12 }}>{s.route}</td>
                      <td>
                        <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                          {s.types.map((t) => <span key={t} className={`badge ${t === "broiler" ? "accent" : t === "layer" ? "success" : "info"}`} style={{ fontSize: 10 }}>{t}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Vaccine inventory</div></div>
            <div style={{ padding: "0 16px 16px" }} className="stack-2">
              {VACCINE_INVENTORY.map((v) => (
                <div key={v.name} className="row" style={{ padding: "8px 10px", background: "var(--bg-sunken)", borderRadius: 8, gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{v.name}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>{v.type} · Exp: {v.expiry}</div>
                  </div>
                  <div className="row" style={{ gap: 8, alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 12.5 }}>{num(v.doses)} doses</span>
                    <span className={`badge ${v.status === "ok" ? "success" : v.status === "low" ? "warning" : "danger"}`}>{v.status}</span>
                  </div>
                </div>
              ))}
              <button className="btn sm" style={{ marginTop: 4 }}>Restock vaccines</button>
            </div>
          </div>
        </div>
      )}

      {logEntry && (
        <LogDoseModal
          vaxEntry={logEntry}
          onClose={() => setLogEntry(null)}
          onSuccess={() => startTransition(() => refresh())}
        />
      )}
    </div>
  );
}
