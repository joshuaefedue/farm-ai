"use client";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { naira } from "@/lib/utils";

const MANIFEST = [
  { id: "DEL-0051", customer: "Mama Ngozi · Mile 12 Market", items: "80 crates eggs (L)", vehicle: "Lagos-1 · KJA 412 AK", driver: "Emeka Nwosu", departure: "07:30", eta: "09:15", distance: "62 km", status: "in_transit", value: 248000 },
  { id: "DEL-0050", customer: "Shoprite Lekki", items: "40 crates eggs (XL) + 120 kg broiler", vehicle: "Lagos-1 · KJA 412 AK", driver: "Emeka Nwosu", departure: "06:00", eta: "delivered", distance: "74 km", status: "delivered", value: 531600 },
  { id: "DEL-0052", customer: "Ifeoma Caterers · Abeokuta", items: "30 dressed broilers (box)", vehicle: "Ogun-2 · MKJ 211 XA", driver: "Tunde Adeyemi", departure: "10:00", eta: "11:20", distance: "18 km", status: "scheduled", value: 99000 },
  { id: "DEL-0053", customer: "Cooperative pickup · Sango-Ota", items: "200 crates eggs (M)", vehicle: "Ogun-2 · MKJ 211 XA", driver: "Tunde Adeyemi", departure: "13:00", eta: "14:30", distance: "28 km", status: "scheduled", value: 540000 },
  { id: "DEL-0048", customer: "Festac Grocery Hub", items: "60 crates eggs (L)", vehicle: "Lagos-1 · KJA 412 AK", driver: "Emeka Nwosu", departure: "—", eta: "delivered", distance: "68 km", status: "delivered", value: 186000 },
];

const FLEET = [
  { id: "Lagos-1", plate: "KJA 412 AK", type: "Isuzu NPR · 3.5t", driver: "Emeka Nwosu", status: "in_transit", km: 87420, lastService: "Apr 12", nextService: 90000, fuel: 68, fuelCap: 100 },
  { id: "Ogun-2", plate: "MKJ 211 XA", type: "Mitsubishi Canter · 2t", driver: "Tunde Adeyemi (temp)", status: "idle", km: 52180, lastService: "Mar 28", nextService: 54000, fuel: 42, fuelCap: 70 },
  { id: "Pickup-3", plate: "LND 087 KW", type: "Toyota Hilux · pickup", driver: "Unassigned", status: "maintenance", km: 134500, lastService: "May 2", nextService: 136000, fuel: 20, fuelCap: 80 },
];

const ROUTES = [
  { id: "R-01", name: "Lagos North (Mile 12 + Ketu)", stops: 4, avg_km: 72, freq: "Mon / Wed / Fri", cost_km: 95, last_run: "Today" },
  { id: "R-02", name: "Lekki / Victoria Island", stops: 3, avg_km: 88, freq: "Tue / Thu / Sat", cost_km: 95, last_run: "Yesterday" },
  { id: "R-03", name: "Abeokuta Local (Ogun)", stops: 5, avg_km: 32, freq: "Daily", cost_km: 88, last_run: "Today" },
  { id: "R-04", name: "Sango-Ota Cooperative", stops: 1, avg_km: 28, freq: "Mon / Thu", cost_km: 88, last_run: "Today" },
  { id: "R-05", name: "Ibadan Wholesale", stops: 2, avg_km: 114, freq: "Fri only", cost_km: 102, last_run: "Fri 9 May" },
];

const FUEL_DATA = [
  { month: "Jan", litres: 480, cost: 384000 },
  { month: "Feb", litres: 420, cost: 336000 },
  { month: "Mar", litres: 510, cost: 408000 },
  { month: "Apr", litres: 490, cost: 392000 },
  { month: "May", litres: 220, cost: 176000 },
];

export default function LogisticsScreen() {
  const [tab, setTab] = useState("today");

  const delivered = MANIFEST.filter(d => d.status === "delivered").length;
  const inTransit = MANIFEST.filter(d => d.status === "in_transit").length;
  const scheduled = MANIFEST.filter(d => d.status === "scheduled").length;
  const totalValue = MANIFEST.reduce((s, d) => s + d.value, 0);

  const statusBadge = (s: string) => s === "delivered" ? "success" : s === "in_transit" ? "info" : s === "scheduled" ? "outline" : "warning";
  const fleetBadge = (s: string) => s === "in_transit" ? "info" : s === "idle" ? "success" : "warning";

  const maxFuelCost = Math.max(...FUEL_DATA.map(f => f.cost));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Logistics & delivery</h1>
          <div className="page-sub">{delivered} delivered · {inTransit} in transit · {scheduled} scheduled today</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Download size={14} /> Export</button>
          <button className="btn accent"><Icons.Plus size={14} /> New delivery</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi">
          <div className="kpi-label">Deliveries today</div>
          <div className="kpi-value">{MANIFEST.filter(d => ["delivered","in_transit","scheduled"].includes(d.status)).length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>{delivered} done · {inTransit} en route · {scheduled} pending</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Value in transit</div>
          <div className="kpi-value tnum">{naira(totalValue)}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>across {FLEET.filter(f => f.status === "in_transit").length} vehicle(s)</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Fleet active</div>
          <div className="kpi-value">{FLEET.filter(f => f.status !== "maintenance").length} / {FLEET.length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>1 vehicle in maintenance</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Fuel spend · May</div>
          <div className="kpi-value tnum">{naira(176000)}</div>
          <div className="kpi-trend up"><Icons.TrendUp size={11} /><span>+12% MoM</span></div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 12 }}>
        {["today", "fleet", "routes", "fuel"].map(t => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t === "today" ? "Today's manifest" : t === "fleet" ? "Fleet" : t === "routes" ? "Routes" : "Fuel & costs"}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Delivery</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Departs</th>
                    <th>ETA / Done</th>
                    <th className="num">Value</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {MANIFEST.map(d => (
                    <tr key={d.id}>
                      <td className="id-cell"><span className="row-link">{d.id}</span></td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{d.customer.split(" · ")[0]}</div>
                        <div className="faint" style={{ fontSize: 11 }}>{d.items}</div>
                      </td>
                      <td className="muted" style={{ fontSize: 12 }}>{d.vehicle}</td>
                      <td className="mono muted" style={{ fontSize: 12.5 }}>{d.departure}</td>
                      <td className="mono muted" style={{ fontSize: 12.5 }}>{d.eta}</td>
                      <td className="num">{naira(d.value)}</td>
                      <td><span className={`badge ${statusBadge(d.status)}`}>{d.status.replace("_", " ")}</span></td>
                      <td><button className="btn ghost sm icon-only"><Icons.More size={13} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card" style={{ minHeight: 340 }}>
            <div className="card-header"><div className="card-title">Route overview</div></div>
            <div style={{ padding: "0 16px 16px", position: "relative" }}>
              <div style={{ width: "100%", height: 260, background: "var(--bg-sunken)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                <svg width="100%" height="100%" viewBox="0 0 400 260" style={{ opacity: 0.7 }}>
                  <rect width="400" height="260" fill="var(--bg-sunken)" rx="8" />
                  {/* Farm HQ */}
                  <circle cx="120" cy="140" r="8" fill="var(--accent)" />
                  <text x="130" y="144" fontSize="10" fill="var(--fg-muted)" fontFamily="monospace">Farm HQ</text>
                  {/* Mile 12 */}
                  <circle cx="300" cy="60" r="6" fill="var(--info)" />
                  <text x="310" y="64" fontSize="10" fill="var(--fg-muted)" fontFamily="monospace">Mile 12</text>
                  <line x1="120" y1="140" x2="300" y2="60" stroke="var(--info)" strokeWidth="1.5" strokeDasharray="4,3" />
                  {/* Abeokuta */}
                  <circle cx="70" cy="200" r="6" fill="var(--success-soft-fg)" />
                  <text x="80" y="204" fontSize="10" fill="var(--fg-muted)" fontFamily="monospace">Abeokuta</text>
                  <line x1="120" y1="140" x2="70" y2="200" stroke="var(--success-soft-fg)" strokeWidth="1.5" strokeDasharray="4,3" />
                  {/* Sango-Ota */}
                  <circle cx="190" cy="180" r="6" fill="var(--warning-soft-fg)" />
                  <text x="200" y="184" fontSize="10" fill="var(--fg-muted)" fontFamily="monospace">Sango-Ota</text>
                  <line x1="120" y1="140" x2="190" y2="180" stroke="var(--warning-soft-fg)" strokeWidth="1.5" strokeDasharray="4,3" />
                  {/* Lekki */}
                  <circle cx="340" cy="110" r="6" fill="var(--fg-muted)" />
                  <text x="290" y="104" fontSize="10" fill="var(--fg-muted)" fontFamily="monospace">Lekki</text>
                  <line x1="120" y1="140" x2="340" y2="110" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4,3" />
                </svg>
              </div>
              <div className="row" style={{ gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                {[{ label: "In transit", color: "var(--info)" }, { label: "Scheduled", color: "var(--warning-soft-fg)" }, { label: "Delivered", color: "var(--success-soft-fg)" }].map(l => (
                  <div key={l.label} className="row" style={{ gap: 5, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                    <span className="muted">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "fleet" && (
        <div className="grid-3" style={{ gap: 16 }}>
          {FLEET.map(v => (
            <div key={v.id} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{v.id} · {v.plate}</div>
                  <div className="card-sub">{v.type}</div>
                </div>
                <span className={`badge ${fleetBadge(v.status)}`}>{v.status.replace("_", " ")}</span>
              </div>
              <div style={{ padding: "0 16px 16px" }} className="stack-2">
                <div className="row" style={{ justifyContent: "space-between", fontSize: 13 }}>
                  <span className="muted">Driver</span>
                  <span style={{ fontWeight: 500 }}>{v.driver}</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 13 }}>
                  <span className="muted">Odometer</span>
                  <span className="mono">{v.km.toLocaleString()} km</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 13 }}>
                  <span className="muted">Next service</span>
                  <span className={`mono ${v.nextService - v.km < 2000 ? "warning-text" : ""}`}>{v.nextService.toLocaleString()} km</span>
                </div>
                <div>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="muted" style={{ fontSize: 12 }}>Fuel level</span>
                    <span className="mono" style={{ fontSize: 12 }}>{Math.round((v.fuel / v.fuelCap) * 100)}%</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--bg-sunken)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${(v.fuel / v.fuelCap) * 100}%`, height: "100%", background: v.fuel / v.fuelCap < 0.3 ? "var(--warning-soft-fg)" : "var(--success-soft-fg)", borderRadius: 3 }} />
                  </div>
                </div>
                <button className="btn sm" style={{ marginTop: 4 }}>View log</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "routes" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Route</th><th>Stops</th><th className="num">Avg km</th><th>Frequency</th><th className="num">Cost/km</th><th>Last run</th><th></th></tr>
            </thead>
            <tbody>
              {ROUTES.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</div>
                    <div className="faint mono" style={{ fontSize: 11 }}>{r.id}</div>
                  </td>
                  <td className="muted" style={{ fontSize: 13 }}>{r.stops} stops</td>
                  <td className="num mono">{r.avg_km} km</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{r.freq}</td>
                  <td className="num mono">₦{r.cost_km}/km</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{r.last_run}</td>
                  <td><button className="btn ghost sm icon-only"><Icons.More size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "fuel" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Monthly fuel spend</div></div>
            <div style={{ padding: "0 16px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }}>
                {FUEL_DATA.map(f => (
                  <div key={f.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {(f.cost / 1000).toFixed(0)}k
                    </div>
                    <div style={{ width: "100%", height: Math.round((f.cost / maxFuelCost) * 130), background: "var(--accent)", borderRadius: "3px 3px 0 0", opacity: f.month === "May" ? 0.5 : 1 }} />
                    <div style={{ fontSize: 10.5, color: "var(--fg-muted)" }}>{f.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Cost breakdown · May</div></div>
            <div style={{ padding: "0 16px 16px" }} className="stack-2">
              {[
                { label: "Diesel — Lagos-1", value: 98000, pct: 56 },
                { label: "Diesel — Ogun-2", value: 56000, pct: 32 },
                { label: "Maintenance — Pickup-3", value: 22000, pct: 12 },
              ].map(c => (
                <div key={c.label}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{c.label}</span>
                    <span className="mono" style={{ fontSize: 13 }}>{naira(c.value)}</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--bg-sunken)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${c.pct}%`, height: "100%", background: "var(--accent)", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
              <div className="divider" />
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="muted" style={{ fontSize: 13 }}>Total May</span>
                <span className="mono" style={{ fontWeight: 600 }}>{naira(176000)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
