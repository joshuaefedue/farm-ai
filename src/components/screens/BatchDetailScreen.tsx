"use client";
import { useState, useMemo } from "react";
import { Icons } from "@/components/icons";
import { BATCHES, VAX, BATCH_ACTIVITY, TODAY } from "@/lib/data";
import { naira, num } from "@/lib/utils";

const MILESTONES_BROILER = [
  { day: 0, label: "Arrival" },
  { day: 7, label: "D7 vax" },
  { day: 14, label: "D14" },
  { day: 21, label: "Gumboro" },
  { day: 42, label: "Mid-cycle" },
  { day: 55, label: "Harvest" },
];

const MILESTONES_LAYER = [
  { day: 0, label: "Arrival" },
  { day: 18, label: "Peak lay" },
  { day: 90, label: "Plateau" },
  { day: 300, label: "End of lay" },
];

const DAILY_LOGS = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - i);
  const eggs = Math.round(3200 + Math.random() * 200);
  const mortality = Math.floor(Math.random() * 4);
  const feed = Math.round(460 + Math.random() * 40);
  const temp = (27 + Math.random() * 3).toFixed(1);
  const humidity = Math.round(64 + Math.random() * 14);
  return { date: d, eggs, mortality, feed, temp, humidity };
});

function LogModal({ type, onClose }: { type: string; onClose: () => void }) {
  const titles: Record<string, string> = { mortality: "Log mortality", feed: "Log feed dispensed", eggs: "Log egg collection", weight: "Log weight sample" };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{titles[type] || "Log entry"}</h3>
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-row">
              <label>Date</label>
              <input className="input" type="date" defaultValue="2026-05-13" />
            </div>
            {type === "mortality" && <>
              <div className="form-row">
                <label>Birds dead</label>
                <input className="input" type="number" defaultValue={2} />
              </div>
              <div className="form-row">
                <label>Cause / symptoms</label>
                <select className="select">
                  <option>Respiratory</option>
                  <option>Coccidiosis</option>
                  <option>Newcastle disease</option>
                  <option>Trauma</option>
                  <option>Unknown</option>
                </select>
              </div>
            </>}
            {type === "feed" && <>
              <div className="form-row">
                <label>Feed type</label>
                <select className="select">
                  <option>Layer Mash 18%</option>
                  <option>Layer Concentrate</option>
                  <option>Broiler Starter 22%</option>
                  <option>Broiler Finisher</option>
                </select>
              </div>
              <div className="form-row">
                <label>Quantity (kg)</label>
                <input className="input" type="number" defaultValue={480} />
              </div>
            </>}
            {type === "eggs" && <>
              <div className="form-row">
                <label>Eggs collected</label>
                <input className="input" type="number" defaultValue={3360} />
              </div>
              <div className="form-row">
                <label>Cracked / broken</label>
                <input className="input" type="number" defaultValue={12} />
              </div>
            </>}
            {type === "weight" && <>
              <div className="form-row">
                <label>Sample size (birds)</label>
                <input className="input" type="number" defaultValue={50} />
              </div>
              <div className="form-row">
                <label>Avg weight (kg)</label>
                <input className="input" type="number" step="0.01" defaultValue={1.42} />
              </div>
            </>}
            <div className="form-row">
              <label>Notes</label>
              <input className="input" placeholder="Optional" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn accent" onClick={onClose}><Icons.Check size={14} /> Save log</button>
        </div>
      </div>
    </div>
  );
}

export default function BatchDetailScreen({ batchId }: { batchId: string }) {
  const [tab, setTab] = useState("overview");
  const [logModal, setLogModal] = useState<string | null>(null);

  const batch = useMemo(() => BATCHES.find(b => b.id === batchId) || BATCHES[0], [batchId]);
  const activity = BATCH_ACTIVITY[batch.id] || BATCH_ACTIVITY["default"];
  const batchVax = VAX.filter(v => v.batch === batch.id);

  const ageDays = Math.round((TODAY.getTime() - batch.arrival.getTime()) / 86400000);
  const milestones = batch.type === "layer" ? MILESTONES_LAYER : MILESTONES_BROILER;
  const targetDays = milestones[milestones.length - 1].day;
  const progressPct = Math.min(100, Math.round((ageDays / targetDays) * 100));

  const feedCost = batch.costPerBird * 0.58;
  const chicksPerBird = batch.costPerBird;
  const medPerBird = batch.costPerBird * 0.08;
  const labourPerBird = batch.costPerBird * 0.12;
  const overheadPerBird = batch.costPerBird * 0.10;
  const totalCostPerBird = feedCost + chicksPerBird + medPerBird + labourPerBird + overheadPerBird;
  const projRevPerBird = batch.type === "broiler" ? (batch.avgWeight || 2.2) * 3300 : 4200;
  const projNetPerBird = projRevPerBird - totalCostPerBird;
  const totalCost = totalCostPerBird * batch.currentCount;
  const projTotalRev = projRevPerBird * batch.currentCount;

  const typeBadge = batch.type === "layer" ? "success" : batch.type === "broiler" ? "accent" : "info";
  const statusBadge = batch.status === "laying" ? "success" : batch.status === "growing" ? "accent" : "outline";

  const feedChartData = DAILY_LOGS.slice().reverse().map(d => d.feed);
  const maxFeed = Math.max(...feedChartData);

  const eggChartData = DAILY_LOGS.slice().reverse().map(d => d.eggs);
  const maxEgg = Math.max(...eggChartData);

  const costBreakdown = [
    { label: "Day-old chicks", value: chicksPerBird, color: "var(--accent)" },
    { label: "Feed", value: feedCost, color: "var(--info)" },
    { label: "Medications & vaccines", value: medPerBird, color: "var(--warning-soft-fg)" },
    { label: "Labour", value: labourPerBird, color: "var(--success-soft-fg)" },
    { label: "Overhead", value: overheadPerBird, color: "var(--fg-muted)" },
  ];
  const totalBar = costBreakdown.reduce((s, c) => s + c.value, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{batch.id}</h1>
          <div className="page-sub">{batch.breed} · {batch.house} · Arrived {batch.arrival.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })} · Day {ageDays}</div>
        </div>
        <div className="page-actions">
          <button className="btn ghost" onClick={() => setLogModal("mortality")}><Icons.Mortality size={14} /> Mortality</button>
          <button className="btn ghost" onClick={() => setLogModal("feed")}><Icons.Feed size={14} /> Feed</button>
          {batch.type === "layer" || batch.type === "dual"
            ? <button className="btn ghost" onClick={() => setLogModal("eggs")}><Icons.Egg size={14} /> Eggs</button>
            : <button className="btn ghost" onClick={() => setLogModal("weight")}><Icons.Weight size={14} /> Weight</button>}
          <div className="row" style={{ gap: 6 }}>
            <span className={`badge ${typeBadge}`}>{batch.type}</span>
            <span className={`badge ${statusBadge}`}>{batch.status}</span>
          </div>
        </div>
      </div>

      {/* Lifecycle strip */}
      <div className="card" style={{ marginBottom: 16, padding: "14px 20px" }}>
        <div className="row" style={{ gap: 10, marginBottom: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Lifecycle progress</span>
          <span className="muted" style={{ fontSize: 12 }}>Day {ageDays} / {targetDays}</span>
          <span className="spacer"></span>
          <span className="mono" style={{ fontSize: 12 }}>{progressPct}%</span>
        </div>
        <div style={{ position: "relative", height: 8, background: "var(--bg-sunken)", borderRadius: 4, overflow: "visible" }}>
          <div style={{ width: `${progressPct}%`, height: "100%", background: "var(--accent)", borderRadius: 4 }} />
          {milestones.map(m => {
            const pct = Math.min(100, (m.day / targetDays) * 100);
            return (
              <div key={m.day} style={{ position: "absolute", left: `${pct}%`, top: -4, transform: "translateX(-50%)" }}>
                <div style={{ width: 3, height: 16, background: ageDays >= m.day ? "var(--accent)" : "var(--border)", borderRadius: 2 }} />
                <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "var(--fg-muted)", whiteSpace: "nowrap" }}>{m.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ height: 24 }} />
      </div>

      {/* KPI row */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi">
          <div className="kpi-label">Live birds</div>
          <div className="kpi-value">{num(batch.currentCount)}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>{(100 - batch.mortalityPct).toFixed(1)}% alive</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Mortality</div>
          <div className="kpi-value" style={{ color: batch.mortalityPct > 3 ? "var(--danger-soft-fg)" : "var(--warning-soft-fg)" }}>{batch.mortalityPct}%</div>
          <div className="muted" style={{ fontSize: 11.5 }}>{batch.startCount - batch.currentCount} birds total</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">FCR</div>
          <div className="kpi-value" style={{ color: batch.fcr > 2.5 ? "var(--danger-soft-fg)" : batch.fcr > 2.0 ? "var(--warning-soft-fg)" : "var(--success-soft-fg)" }}>{batch.fcr}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>Target {batch.type === "broiler" ? "≤ 1.85" : "≤ 2.20"}</div>
        </div>
        {(batch.type === "layer" || batch.type === "dual") && batch.eggRate !== undefined && (
          <div className="kpi">
            <div className="kpi-label">Lay rate</div>
            <div className="kpi-value" style={{ color: "var(--success-soft-fg)" }}>{batch.eggRate}%</div>
            <div className="muted" style={{ fontSize: 11.5 }}>Target ≥ 85%</div>
          </div>
        )}
        {(batch.type === "broiler" || (batch.type === "dual" && batch.avgWeight)) && batch.avgWeight !== undefined && (
          <div className="kpi">
            <div className="kpi-label">Avg weight</div>
            <div className="kpi-value">{batch.avgWeight} kg</div>
            <div className="muted" style={{ fontSize: 11.5 }}>Target ≥ 2.2 kg at harvest</div>
          </div>
        )}
      </div>

      <div className="tabs" style={{ marginBottom: 12 }}>
        {["overview", "logs", "vaccinations", "feed", "profitability", "documents"].map(t => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div className="stack-3">
            <div className="card">
              <div className="card-header"><div className="card-title">Activity timeline</div></div>
              <div style={{ padding: "0 16px 16px" }}>
                <div className="timeline">
                  {activity.map((a, i) => (
                    <div key={i} className={`timeline-item${a.level ? ` ${a.level}` : ""}`}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{a.title}</div>
                      {a.meta && <div className="muted" style={{ fontSize: 12 }}>{a.meta}</div>}
                      <div className="row" style={{ gap: 8, marginTop: 2 }}>
                        <span className="faint" style={{ fontSize: 11 }}>{a.time}</span>
                        {a.who && <span className="faint" style={{ fontSize: 11 }}>· {a.who}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Environment (today)</div></div>
              <div style={{ padding: "0 16px 16px" }}>
                <div className="grid-3" style={{ gap: 10 }}>
                  {[
                    { label: "Temperature", value: "28.4°C", ok: true },
                    { label: "Humidity", value: "68%", ok: true },
                    { label: "Ventilation", value: "Normal", ok: true },
                    { label: "Lighting", value: "16h/day", ok: true },
                    { label: "Water flow", value: "Good", ok: true },
                    { label: "Feed access", value: "All lines", ok: true },
                  ].map(e => (
                    <div key={e.label} style={{ padding: "8px 10px", background: "var(--bg-sunken)", borderRadius: 8 }}>
                      <div className="muted" style={{ fontSize: 11 }}>{e.label}</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: e.ok ? "var(--success-soft-fg)" : "var(--danger-soft-fg)" }}>{e.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="stack-3">
            <div className="card">
              <div className="card-header"><div className="card-title">P&L snapshot</div></div>
              <div style={{ padding: "0 16px 16px" }} className="stack-2">
                {[
                  { label: "Total cost to date", value: naira(totalCost), muted: true },
                  { label: "Projected revenue", value: naira(projTotalRev), muted: false },
                  { label: "Projected net", value: naira(projNetPerBird * batch.currentCount), hi: true },
                ].map(r => (
                  <div key={r.label} className="row" style={{ justifyContent: "space-between", padding: "7px 10px", background: r.hi ? "var(--accent-soft)" : "var(--bg-sunken)", borderRadius: 8 }}>
                    <span className="muted" style={{ fontSize: 13 }}>{r.label}</span>
                    <span className="mono" style={{ fontWeight: r.hi ? 700 : 400 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Batch details</div></div>
              <div style={{ padding: "0 16px 16px" }} className="stack-2">
                {[
                  { label: "Batch ID", value: batch.id },
                  { label: "Breed", value: batch.breed },
                  { label: "Supplier", value: batch.supplier },
                  { label: "House", value: batch.house },
                  { label: "Arrival", value: batch.arrival.toLocaleDateString("en-NG") },
                  { label: "Start count", value: num(batch.startCount) },
                  { label: "Cost per bird", value: naira(batch.costPerBird) },
                ].map(r => (
                  <div key={r.label} className="row" style={{ justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                    <span className="muted" style={{ fontSize: 12.5 }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Assigned staff</div></div>
              <div style={{ padding: "0 16px 16px" }} className="stack-2">
                {[
                  { name: "Babatunde Salami", role: "Feed Technician" },
                  { name: "Ngozi Eze", role: "Veterinarian" },
                  { name: "Kunle Fashola", role: "Egg Collector" },
                ].map(s => (
                  <div key={s.name} className="row" style={{ gap: 10 }}>
                    <div className="avatar">{s.name.split(" ").map((x: string) => x[0]).join("").slice(0, 2)}</div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{s.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                {(batch.type === "layer" || batch.type === "dual") && <th className="num">Eggs</th>}
                <th className="num">Mortality</th>
                <th className="num">Feed (kg)</th>
                <th className="num">Temp °C</th>
                <th className="num">Humidity</th>
              </tr>
            </thead>
            <tbody>
              {DAILY_LOGS.map((log, i) => (
                <tr key={i}>
                  <td className="muted" style={{ fontSize: 12.5 }}>{log.date.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                  {(batch.type === "layer" || batch.type === "dual") && <td className="num">{num(log.eggs)}</td>}
                  <td className="num" style={{ color: log.mortality > 3 ? "var(--danger-soft-fg)" : undefined }}>{log.mortality}</td>
                  <td className="num">{log.feed}</td>
                  <td className="num" style={{ color: +log.temp > 30 ? "var(--warning-soft-fg)" : undefined }}>{log.temp}</td>
                  <td className="num">{log.humidity}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "vaccinations" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Vaccine</th><th>Route</th><th>Date</th><th className="num">Birds</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {batchVax.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px 0", color: "var(--fg-muted)" }}>No vaccinations scheduled for this batch.</td></tr>
                : batchVax.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{v.vaccine}</td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{v.route}</td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{v.date.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                    <td className="num">{num(v.birds)}</td>
                    <td><span className={`badge ${v.status === "done" ? "success" : "warning"}`}>{v.status}</span></td>
                    <td>{v.status === "pending" && <button className="btn sm accent"><Icons.Check size={12} /> Log dose</button>}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "feed" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Feed consumption · 14 days</div></div>
            <div style={{ padding: "0 16px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
                {feedChartData.map((v, i) => (
                  <div key={i} title={`${v} kg`} style={{ flex: 1, height: Math.round((v / maxFeed) * 120), background: i === feedChartData.length - 1 ? "var(--accent)" : "var(--accent-soft)", borderRadius: "2px 2px 0 0" }} />
                ))}
              </div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
                <span className="muted" style={{ fontSize: 11 }}>30 Apr</span>
                <span className="muted" style={{ fontSize: 11 }}>Today</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Feed summary</div></div>
            <div style={{ padding: "0 16px 16px" }} className="stack-2">
              {[
                { label: "Current feed type", value: batch.type === "broiler" ? "Broiler Starter 22%" : "Layer Mash 18%" },
                { label: "Daily consumption", value: "~490 kg/day" },
                { label: "FCR to date", value: String(batch.fcr) },
                { label: "Feed cost to date", value: naira(Math.round(feedCost * batch.currentCount)) },
                { label: "Est. feed remaining", value: "~3 days" },
              ].map(r => (
                <div key={r.label} className="row" style={{ justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="muted" style={{ fontSize: 12.5 }}>{r.label}</span>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "profitability" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Cost per bird · breakdown</div></div>
            <div style={{ padding: "0 16px 20px" }} className="stack-3">
              {/* Stacked bar */}
              <div style={{ height: 28, display: "flex", borderRadius: 6, overflow: "hidden" }}>
                {costBreakdown.map(c => (
                  <div key={c.label} style={{ width: `${(c.value / totalBar) * 100}%`, background: c.color, transition: "width 0.3s" }} title={`${c.label}: ${naira(c.value)}`} />
                ))}
              </div>
              <div className="stack-2">
                {costBreakdown.map(c => (
                  <div key={c.label} className="row" style={{ justifyContent: "space-between", fontSize: 13 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0, marginTop: 3 }} />
                      <span>{c.label}</span>
                    </div>
                    <span className="mono">{naira(c.value)}</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontWeight: 500 }}>Total cost per bird</span>
                <span className="mono" style={{ fontWeight: 700 }}>{naira(totalCostPerBird)}</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Projected profitability</div></div>
            <div style={{ padding: "0 16px 16px" }} className="stack-2">
              {[
                { label: "Birds at harvest", value: num(batch.currentCount) },
                { label: "Projected revenue/bird", value: naira(projRevPerBird), hi: false },
                { label: "Total cost", value: naira(totalCost) },
                { label: "Projected total revenue", value: naira(projTotalRev) },
                { label: "Projected net profit", value: naira(projNetPerBird * batch.currentCount), hi: true },
                { label: "Est. ROI", value: `${((projNetPerBird * batch.currentCount / totalCost) * 100).toFixed(1)}%`, hi: false },
              ].map(r => (
                <div key={r.label} className="row" style={{ justifyContent: "space-between", padding: "7px 10px", background: r.hi ? "var(--accent-soft)" : "var(--bg-sunken)", borderRadius: 8 }}>
                  <span className="muted" style={{ fontSize: 13 }}>{r.label}</span>
                  <span className="mono" style={{ fontWeight: (r as { hi?: boolean }).hi ? 700 : 400 }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 16px 16px" }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Benchmark comparison</div>
              {[
                { label: "FCR", yours: batch.fcr, bench: batch.type === "broiler" ? 1.85 : 2.20, lower_better: true },
                { label: "Mortality %", yours: batch.mortalityPct, bench: 3.0, lower_better: true },
              ].map(b => {
                const better = b.lower_better ? b.yours <= b.bench : b.yours >= b.bench;
                return (
                  <div key={b.label} className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, width: 80 }}>{b.label}</span>
                    <span className="mono" style={{ fontSize: 13, color: better ? "var(--success-soft-fg)" : "var(--danger-soft-fg)" }}>{b.yours}</span>
                    <span className="muted" style={{ fontSize: 12 }}>Benchmark: {b.bench}</span>
                    <span className={`badge ${better ? "success" : "warning"}`} style={{ fontSize: 10.5 }}>{better ? "On target" : "Off target"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "documents" && (
        <div className="empty">
          <Icons.Download size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
          <div style={{ fontWeight: 500, color: "var(--fg)", marginBottom: 4 }}>Batch documents</div>
          <div className="muted" style={{ fontSize: 13 }}>Purchase invoices, vaccination records, and sales receipts will appear here.</div>
          <button className="btn sm" style={{ marginTop: 12 }}>Upload document</button>
        </div>
      )}

      {logModal && <LogModal type={logModal} onClose={() => setLogModal(null)} />}
    </div>
  );
}
