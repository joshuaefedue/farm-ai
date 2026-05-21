"use client";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { naira } from "@/lib/utils";

const PRODUCTS = [
  { id: "EGG-L", name: "Eggs · Large", category: "Eggs", unit: "crate (30 eggs)", price: 3100, stock: 140, status: "active", img: null, orders_week: 18, revenue: 558000 },
  { id: "EGG-XL", name: "Eggs · Extra Large", category: "Eggs", unit: "crate (30 eggs)", price: 3400, stock: 60, status: "active", img: null, orders_week: 8, revenue: 272000 },
  { id: "EGG-M", name: "Eggs · Medium", category: "Eggs", unit: "crate (30 eggs)", price: 2700, stock: 80, status: "active", img: null, orders_week: 11, revenue: 297000 },
  { id: "BRO-DRSD", name: "Dressed broiler", category: "Broiler", unit: "kg", price: 3300, stock: 420, status: "active", img: null, orders_week: 9, revenue: 297000 },
  { id: "BRO-LIVE", name: "Live broiler", category: "Broiler", unit: "bird", price: 4800, stock: 310, status: "active", img: null, orders_week: 6, revenue: 288000 },
  { id: "MANURE-BAG", name: "Poultry manure", category: "By-products", unit: "50 kg bag", price: 2500, stock: 200, status: "active", img: null, orders_week: 4, revenue: 50000 },
];

const CHANNELS = [
  { name: "WhatsApp Direct", type: "whatsapp", orders: 34, revenue: 1240000, enabled: true, desc: "Orders via farm's WhatsApp number (08xx xxx xxxx)" },
  { name: "Cooperative network", type: "coop", orders: 18, revenue: 890000, enabled: true, desc: "Sango-Ota & Northern cooperative bulk orders" },
  { name: "Wholesale direct", type: "wholesale", orders: 14, revenue: 1680000, enabled: true, desc: "Mile 12, Abeokuta wholesale buyers" },
  { name: "Acre marketplace", type: "online", orders: 4, revenue: 148000, enabled: false, desc: "List products on the Acre online marketplace" },
  { name: "Shoprite portal", type: "retail", orders: 6, revenue: 420000, enabled: true, desc: "Dedicated B2B portal integration" },
];

const PROMOS = [
  { id: "PROMO-001", name: "Eid bulk deal", desc: "Buy 200+ crates, get 5% off eggs + free delivery", products: "All eggs", discount: "5%", start: "5 May", end: "20 May", uses: 8, status: "active" },
  { id: "PROMO-002", name: "Broiler Ramadan special", desc: "Live broiler discount during festive period", products: "BRO-LIVE", discount: "₦300/bird", start: "1 Mar", end: "30 Mar", uses: 14, status: "expired" },
  { id: "PROMO-003", name: "Cooperative loyalty", desc: "Registered co-ops: 3% off on repeat monthly orders", products: "All", discount: "3%", start: "1 Jan", end: "31 Dec", uses: 31, status: "active" },
];

const REVIEWS = [
  { customer: "Mama Ngozi", rating: 5, text: "Very fresh eggs, good size. Always on time.", date: "10 May", product: "Eggs · Large" },
  { customer: "Shoprite Lekki", rating: 4, text: "Good quality, occasional size inconsistency in XL batch.", date: "8 May", product: "Eggs · Extra Large" },
  { customer: "Ifeoma Caterers", rating: 5, text: "The dressed broilers are always clean and well-portioned.", date: "5 May", product: "Dressed broiler" },
  { customer: "Festac Grocery", rating: 4, text: "Reliable delivery. Once had a late delivery but resolved quickly.", date: "2 May", product: "Eggs · Large" },
  { customer: "Northern Cooperative", rating: 5, text: "Consistent quality, good pricing for bulk.", date: "28 Apr", product: "Eggs · Medium" },
];

export default function MarketplaceScreen() {
  const [tab, setTab] = useState("products");
  const [channels, setChannels] = useState(CHANNELS.map(c => ({ ...c })));

  const totalWeekRevenue = PRODUCTS.reduce((s, p) => s + p.revenue, 0);
  const enabledChannels = channels.filter(c => c.enabled).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Marketplace & sales channels</h1>
          <div className="page-sub">{PRODUCTS.filter(p => p.status === "active").length} active products · {enabledChannels} channels · {naira(totalWeekRevenue)} this week</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Download size={14} /> Export</button>
          <button className="btn accent"><Icons.Plus size={14} /> Add product</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi">
          <div className="kpi-label">Weekly revenue</div>
          <div className="kpi-value tnum">{naira(totalWeekRevenue)}</div>
          <div className="kpi-trend up"><Icons.TrendUp size={11} /><span>+18% WoW</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Active products</div>
          <div className="kpi-value">{PRODUCTS.filter(p => p.status === "active").length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>across 3 categories</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Sales channels</div>
          <div className="kpi-value">{enabledChannels} / {channels.length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>1 channel disabled</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg rating</div>
          <div className="kpi-value" style={{ color: "var(--accent)" }}>★ 4.6</div>
          <div className="muted" style={{ fontSize: 11.5 }}>{REVIEWS.length} reviews</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 12 }}>
        {["products", "channels", "storefront", "promotions", "reviews"].map(t => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div className="grid-3" style={{ gap: 16 }}>
          {PRODUCTS.map(p => (
            <div key={p.id} className="card" style={{ cursor: "pointer" }}>
              <div style={{ width: "100%", height: 120, background: "var(--bg-sunken)", borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.category === "Eggs" ? <Icons.Egg size={40} style={{ opacity: 0.25 }} /> : <Icons.Batches size={40} style={{ opacity: 0.25 }} />}
              </div>
              <div style={{ padding: 14 }} className="stack-2">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{p.unit} · {p.id}</div>
                </div>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }} className="mono">{naira(p.price)}</span>
                  <span className={`badge ${p.stock > 100 ? "success" : p.stock > 30 ? "warning" : "danger"}`}>{p.stock} in stock</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5 }}>
                  <span className="muted">{p.orders_week} orders this week</span>
                  <span className="mono muted">{naira(p.revenue)}</span>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn sm" style={{ flex: 1 }}>Edit price</button>
                  <button className="btn sm ghost icon-only"><Icons.More size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "channels" && (
        <div className="grid-2" style={{ gap: 16 }}>
          {channels.map((ch, i) => (
            <div key={ch.name} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{ch.name}</div>
                  <div className="card-sub">{ch.desc}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`badge ${ch.enabled ? "success" : "outline"}`}>{ch.enabled ? "active" : "off"}</span>
                  <div
                    onClick={() => setChannels(channels.map((c, j) => j === i ? { ...c, enabled: !c.enabled } : c))}
                    style={{ width: 36, height: 20, borderRadius: 10, background: ch.enabled ? "var(--accent)" : "var(--bg-active)", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                    <div style={{ position: "absolute", top: 2, left: ch.enabled ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: "0 16px 16px" }}>
                <div className="row" style={{ gap: 24 }}>
                  <div className="stack-2">
                    <span className="muted" style={{ fontSize: 12 }}>Orders this week</span>
                    <span style={{ fontWeight: 600 }}>{ch.orders}</span>
                  </div>
                  <div className="stack-2">
                    <span className="muted" style={{ fontSize: 12 }}>Revenue this week</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{naira(ch.revenue)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "storefront" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Storefront preview</div></div>
            <div style={{ padding: "0 16px 20px" }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "var(--accent)", padding: "20px 24px", color: "white" }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>Adigwe Family Farms</div>
                  <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 4 }}>Ogun State · Fresh farm products · Direct ordering via WhatsApp</div>
                </div>
                <div style={{ padding: 16 }} className="stack-2">
                  {PRODUCTS.slice(0, 3).map(p => (
                    <div key={p.id} className="row" style={{ padding: "8px 10px", background: "var(--bg-sunken)", borderRadius: 8, gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--bg-active)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icons.Egg size={18} style={{ opacity: 0.4 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{p.unit}</div>
                      </div>
                      <div className="mono" style={{ fontWeight: 600 }}>{naira(p.price)}</div>
                    </div>
                  ))}
                  <div className="row" style={{ justifyContent: "center", padding: "8px 0" }}>
                    <div className="muted" style={{ fontSize: 12 }}>Order via WhatsApp: <span className="mono" style={{ color: "var(--accent)" }}>0801 234 5678</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Storefront stats · this week</div></div>
            <div style={{ padding: "0 16px 16px" }} className="stack-3">
              {[
                { label: "WhatsApp link clicks", value: "—" },
                { label: "Catalogue views", value: 84 },
                { label: "Direct enquiries", value: 12 },
                { label: "Conversion rate", value: "67%" },
              ].map(s => (
                <div key={s.label} className="row" style={{ justifyContent: "space-between", padding: "8px 10px", background: "var(--bg-sunken)", borderRadius: 8 }}>
                  <span className="muted" style={{ fontSize: 13 }}>{s.label}</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "promotions" && (
        <>
          <div className="filter-bar">
            <div className="section-title" style={{ marginBottom: 0 }}>Active & past promotions</div>
            <button className="btn accent"><Icons.Plus size={14} /> Create promotion</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Promo</th><th>Description</th><th>Products</th><th>Discount</th><th>Period</th><th className="num">Uses</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {PROMOS.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                      <div className="faint mono" style={{ fontSize: 11 }}>{p.id}</div>
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>{p.desc}</td>
                    <td className="muted" style={{ fontSize: 12 }}>{p.products}</td>
                    <td className="mono" style={{ fontWeight: 500 }}>{p.discount}</td>
                    <td className="muted" style={{ fontSize: 12 }}>{p.start} – {p.end}</td>
                    <td className="num">{p.uses}</td>
                    <td><span className={`badge ${p.status === "active" ? "success" : "outline"}`}>{p.status}</span></td>
                    <td><button className="btn ghost sm icon-only"><Icons.More size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "reviews" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div className="stack-3">
            {REVIEWS.map((r, i) => (
              <div key={i} className="card">
                <div style={{ padding: 14 }} className="stack-2">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.customer}</span>
                      <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>{r.product}</span>
                    </div>
                    <div className="row" style={{ gap: 4 }}>
                      <span style={{ color: "var(--accent)", fontSize: 13 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      <span className="muted" style={{ fontSize: 11.5 }}>{r.date}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--fg)" }}>{r.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Rating breakdown</div></div>
            <div style={{ padding: "0 16px 16px" }} className="stack-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = REVIEWS.filter(r => r.rating === star).length;
                return (
                  <div key={star} className="row" style={{ gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 12.5, color: "var(--accent)", width: 20 }}>{"★".repeat(star)}</span>
                    <div style={{ flex: 1, height: 8, background: "var(--bg-sunken)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${(count / REVIEWS.length) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 4 }} />
                    </div>
                    <span className="mono muted" style={{ fontSize: 12, width: 20, textAlign: "right" }}>{count}</span>
                  </div>
                );
              })}
              <div className="divider" />
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="muted" style={{ fontSize: 13 }}>Average</span>
                <span className="mono" style={{ fontWeight: 600, color: "var(--accent)" }}>★ 4.6 / 5</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
