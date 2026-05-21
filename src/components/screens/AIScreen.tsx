"use client";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { naira } from "@/lib/utils";

const INSIGHTS = [
  { id: 1, title: "Feed stockout risk in 3 days", body: "Layer Mash 18% current stock will last ~3 days at current burn rate. Recommended: raise PO with AgriFeeds today.", severity: "critical", category: "Feed", action: "Raise PO", icon: "warning" },
  { id: 2, title: "PB-2026-013 FCR elevated", body: "Broiler batch PB-2026-013 FCR is 2.31 vs target 1.85. Check feed conversion, water access, and ventilation in House 2.", severity: "warning", category: "Flock", action: "View batch", icon: "warning" },
  { id: 3, title: "Lay rate dip in House 4", body: "House 4 (PB-2026-014) lay rate dropped from 91.4% to 87.2% over 3 days. Possible heat stress or lighting issue.", severity: "warning", category: "Production", action: "Log check", icon: "warning" },
  { id: 4, title: "Outstanding payments — ₦1.28M", body: "3 customers have unpaid invoices older than 7 days. Oldest: Iya Tunde Farms (₦490k, 14d). Send reminder.", severity: "info", category: "Finance", action: "Send reminders", icon: "info" },
  { id: 5, title: "Vaccination due in 2 days", body: "Gumboro (IBD) vaccination for PB-2026-013 (5,200 birds) is scheduled for 15 May. Confirm vaccine stock.", severity: "info", category: "Health", action: "View schedule", icon: "info" },
  { id: 6, title: "PB-2026-010 approaching harvest", body: "Batch PB-2026-010 is at day 51 (target: 55–60). Start lining up buyers. Current weight est. 2.6 kg/bird.", severity: "info", category: "Sales", action: "View batch", icon: "info" },
];

const FORECASTS = [
  { title: "Egg production · next 7 days", value: "~75,800 eggs", detail: "Based on current lay rates + projected flock health", trend: "flat", chartData: [10840, 10720, 10900, 10650, 10810, 10750, 10980] },
  { title: "Broiler harvest ready · 30 days", value: "~11,500 birds", detail: "PB-2026-010 (2,500) + PB-2026-013 (5,200) in window", trend: "up", chartData: [0, 0, 200, 800, 2500, 5200, 11500] },
  { title: "Feed spend forecast · June", value: naira(8400000), detail: "Based on flock size and avg consumption rates", trend: "up", chartData: [1200000, 1250000, 1180000, 1310000, 1290000, 1350000, 1420000] },
  { title: "Revenue forecast · June", value: naira(12800000), detail: "Projected from current orders + seasonal demand", trend: "up", chartData: [1600000, 1820000, 1700000, 1900000, 1750000, 1850000, 2180000] },
];

const AUTOMATIONS = [
  { id: 1, name: "Low stock alert → WhatsApp", desc: "Notify Farm Manager when any feed item drops below reorder point", trigger: "Inventory level", enabled: true, runs: 14, last: "Today 06:00" },
  { id: 2, name: "Daily egg count summary", desc: "Send morning egg collection summary to owner WhatsApp at 08:00", trigger: "Schedule: 08:00", enabled: true, runs: 38, last: "Today 08:00" },
  { id: 3, name: "Order confirmation → customer", desc: "Auto-send order confirmation message on new order creation", trigger: "New order", enabled: true, runs: 22, last: "Yesterday" },
  { id: 4, name: "Invoice overdue reminder", desc: "Send WhatsApp reminder for unpaid invoices >7 days", trigger: "Payment due +7d", enabled: true, runs: 8, last: "3 days ago" },
  { id: 5, name: "Vaccination reminder", desc: "Alert vet 48h before scheduled vaccinations", trigger: "Vax schedule -2d", enabled: true, runs: 5, last: "12 May" },
  { id: 6, name: "Weekly P&L report", desc: "Generate and send weekly P&L summary to farm owner", trigger: "Schedule: Mon 07:00", enabled: false, runs: 0, last: "Never" },
];

const DISEASE_ALERTS = [
  { region: "Sango-Ota, Ogun", disease: "Newcastle Disease", severity: "high", source: "NAQS bulletin", date: "10 May", distance: "28 km" },
  { region: "Ikorodu, Lagos", disease: "Avian Influenza H5N1", severity: "medium", source: "State MOA", date: "8 May", distance: "62 km" },
  { region: "Sagamu, Ogun", disease: "Infectious Bronchitis", severity: "low", source: "Field report", date: "5 May", distance: "40 km" },
];

const CHAT_HISTORY = [
  { from: "user", text: "What is the projected revenue for June?" },
  { from: "ai", text: "Based on current egg production rates, active broiler batches approaching harvest, and historical seasonal demand, June revenue is projected at ₦12.8M — approximately 14% above May's run rate. This assumes PB-2026-010 and PB-2026-013 are harvested and sold by June 15." },
  { from: "user", text: "Which batch is performing worst on FCR?" },
  { from: "ai", text: "PB-2026-013 (House 2, Ross 308 broiler, Day 42) has the highest FCR at 2.31 against a target of 1.85. This is 25% above target. Likely causes include sub-optimal ventilation in the raised slatted house or water nipple blockage. I'd recommend a full health check and adjusting feeding schedule." },
];

export default function AIScreen() {
  const [tab, setTab] = useState("insights");
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState(CHAT_HISTORY);
  const [automations, setAutomations] = useState(AUTOMATIONS);

  const criticalCount = INSIGHTS.filter(i => i.severity === "critical").length;
  const warningCount = INSIGHTS.filter(i => i.severity === "warning").length;

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setChatInput("");
    setChat([...chat, { from: "user", text: q }, { from: "ai", text: "I'm analyzing your farm data to answer that... This is a demo AI response. In production, this would connect to the Acre AI backend using Claude to provide real-time farm intelligence." }]);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Acre AI</h1>
          <div className="page-sub">{criticalCount} critical · {warningCount} warnings · {AUTOMATIONS.filter(a => a.enabled).length} automations active</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Download size={14} /> Export report</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi">
          <div className="kpi-label">Active insights</div>
          <div className="kpi-value" style={{ color: criticalCount > 0 ? "var(--danger-soft-fg)" : "var(--warning-soft-fg)" }}>{INSIGHTS.length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>{criticalCount} critical · {warningCount} warnings</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">June forecast</div>
          <div className="kpi-value tnum">{naira(12800000)}</div>
          <div className="kpi-trend up"><Icons.TrendUp size={11} /><span>+14% vs May</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Automations running</div>
          <div className="kpi-value">{AUTOMATIONS.filter(a => a.enabled).length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>1 disabled</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Disease alerts nearby</div>
          <div className="kpi-value" style={{ color: "var(--warning-soft-fg)" }}>{DISEASE_ALERTS.length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>1 high severity</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 12 }}>
        {["insights", "forecasts", "automations", "disease", "ask"].map(t => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t === "insights" ? "Insights" : t === "forecasts" ? "Forecasts" : t === "automations" ? "Automations" : t === "disease" ? "Disease watch" : "Ask Acre"}
          </button>
        ))}
      </div>

      {tab === "insights" && (
        <div className="stack-3">
          {INSIGHTS.map(ins => (
            <div key={ins.id} className={`banner ${ins.severity === "critical" ? "danger" : ins.severity === "warning" ? "warning" : "success"}`} style={{ padding: 16 }}>
              <div className={`icon-dot ${ins.severity === "critical" ? "danger" : ins.severity === "warning" ? "warning" : "info"}`} style={{ flexShrink: 0, marginTop: 2 }}>
                <Icons.Warning size={12} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="row" style={{ gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{ins.title}</span>
                  <span className="badge outline" style={{ fontSize: 10.5 }}>{ins.category}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--fg)", marginBottom: 8 }}>{ins.body}</div>
                <button className="btn sm">{ins.action}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "forecasts" && (
        <div className="grid-2" style={{ gap: 16 }}>
          {FORECASTS.map(f => {
            const max = Math.max(...f.chartData);
            return (
              <div key={f.title} className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">{f.title}</div>
                    <div className="card-sub">{f.detail}</div>
                  </div>
                  <div className={`kpi-trend ${f.trend}`} style={{ marginLeft: 8 }}>
                    {f.trend === "up" && <Icons.TrendUp size={11} />}
                    {f.trend === "flat" && <span>→</span>}
                  </div>
                </div>
                <div style={{ padding: "0 16px 16px" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", marginBottom: 12 }}>{f.value}</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
                    {f.chartData.map((v, i) => (
                      <div key={i} style={{ flex: 1, height: max > 0 ? Math.max(3, Math.round((v / max) * 60)) : 3, background: i === f.chartData.length - 1 ? "var(--accent)" : "var(--accent-soft)", borderRadius: "2px 2px 0 0", opacity: i === f.chartData.length - 1 ? 1 : 0.7 }} />
                    ))}
                  </div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>7-day projection</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "automations" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Automation</th><th>Trigger</th><th className="num">Runs</th><th>Last run</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {automations.map((a, i) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{a.name}</div>
                    <div className="faint" style={{ fontSize: 11.5 }}>{a.desc}</div>
                  </td>
                  <td><span className="badge outline" style={{ fontSize: 11 }}>{a.trigger}</span></td>
                  <td className="num">{a.runs}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{a.last}</td>
                  <td>
                    <div
                      onClick={() => setAutomations(automations.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))}
                      style={{ width: 36, height: 20, borderRadius: 10, background: a.enabled ? "var(--accent)" : "var(--bg-active)", cursor: "pointer", position: "relative", transition: "background 0.2s", display: "inline-block" }}>
                      <div style={{ position: "absolute", top: 2, left: a.enabled ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </div>
                  </td>
                  <td><button className="btn ghost sm icon-only"><Icons.More size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "disease" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div>
            <div className="section-title" style={{ marginBottom: 8 }}>Active alerts near Ogun State</div>
            <div className="stack-3">
              {DISEASE_ALERTS.map((d, i) => (
                <div key={i} className={`banner ${d.severity === "high" ? "danger" : d.severity === "medium" ? "warning" : "success"}`} style={{ padding: 14 }}>
                  <div className={`icon-dot ${d.severity === "high" ? "danger" : d.severity === "medium" ? "warning" : "info"}`} style={{ flexShrink: 0 }}>
                    <Icons.Warning size={12} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{d.disease}</div>
                    <div style={{ fontSize: 12.5, color: "var(--fg)" }}>{d.region} · {d.distance} from farm</div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>Source: {d.source} · {d.date}</div>
                  </div>
                  <span className={`badge ${d.severity === "high" ? "danger" : d.severity === "medium" ? "warning" : "info"}`}>{d.severity}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Biosecurity checklist</div></div>
            <div style={{ padding: "0 16px 16px" }} className="stack-2">
              {[
                { item: "Footbaths active at all entry points", done: true },
                { item: "Visitor log up to date", done: true },
                { item: "Farm vehicles disinfected after external trips", done: true },
                { item: "No live bird market visits this week", done: false },
                { item: "House ventilation optimized for heat season", done: false },
                { item: "Newcastle booster scheduled for at-risk batches", done: false },
              ].map(c => (
                <div key={c.item} className="row" style={{ gap: 10, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${c.done ? "var(--success-soft-fg)" : "var(--border)"}`, background: c.done ? "var(--success-soft-fg)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {c.done && <Icons.Check size={10} style={{ color: "white" }} />}
                  </div>
                  <span style={{ fontSize: 13, color: c.done ? "var(--fg-muted)" : "var(--fg)", textDecoration: c.done ? "line-through" : "none" }}>{c.item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "ask" && (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--accent-soft)", borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Ask Acre AI about your farm</div>
            <div className="muted" style={{ fontSize: 12.5 }}>Powered by Claude · Has access to your flock, finance, inventory, and sales data</div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", height: 480 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              {chat.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start", gap: 10 }}>
                  {msg.from === "ai" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <Icons.AI size={14} style={{ color: "white" }} />
                    </div>
                  )}
                  <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: msg.from === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: msg.from === "user" ? "var(--accent)" : "var(--bg-sunken)", fontSize: 13.5, lineHeight: 1.5 }}>
                    <div style={{ color: msg.from === "user" ? "white" : "var(--fg)" }}>{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="row" style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", gap: 8 }}>
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder="Ask about your farm…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
              />
              <button className="btn accent" onClick={sendChat} disabled={!chatInput.trim()}>Send</button>
            </div>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {["What's my feed cost per kg of egg?", "Which batch has the best FCR?", "Forecast next month's expenses"].map(q => (
              <button key={q} className="btn sm ghost" onClick={() => setChatInput(q)} style={{ fontSize: 12 }}>{q}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
