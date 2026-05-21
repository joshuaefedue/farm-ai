"use client";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { naira } from "@/lib/utils";

const D = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

function KpiBox({ label, value, hint, trend, trendDir }: { label: string; value: string; hint?: string; trend?: string; trendDir?: string }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value tnum">{value}</div>
      <div className="row" style={{ gap: 6 }}>
        {trend && <div className={`kpi-trend ${trendDir}`}>{trendDir === "up" ? <Icons.TrendUp size={11} /> : trendDir === "down" ? <Icons.TrendDown size={11} /> : null}{trend}</div>}
        {hint && <span className="muted" style={{ fontSize: 11.5 }}>{hint}</span>}
      </div>
    </div>
  );
}

function FinanceChart({ months, revSeries, expSeries }: { months: string[]; revSeries: number[]; expSeries: number[] }) {
  const W = 700, H = 240, P = { l: 36, r: 16, t: 14, b: 28 };
  const max = Math.max(...revSeries, ...expSeries) + 2;
  const innerW = W - P.l - P.r, innerH = H - P.t - P.b;
  const x = (i: number) => P.l + (i / (months.length - 1)) * innerW;
  const y = (v: number) => P.t + innerH - (v / max) * innerH;
  const path = (s: number[]) => s.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 240 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={P.l} x2={W - P.r} y1={P.t + innerH * t} y2={P.t + innerH * t} className="chart-gridline" />
      ))}
      <path d={path(revSeries) + ` L${x(months.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`} className="chart-area acc" />
      <path d={path(revSeries)} className="chart-line acc" />
      <path d={path(expSeries)} className="chart-line dng" />
      {months.map((m, i) => (
        <text key={m} x={x(i)} y={H - 10} textAnchor="middle" className="chart-axis">{m}</text>
      ))}
      <text x={P.l - 6} y={y(max)} textAnchor="end" className="chart-axis">{Math.round(max)}M</text>
      <text x={P.l - 6} y={y(0)} textAnchor="end" className="chart-axis">0</text>
    </svg>
  );
}

function FinanceOverview() {
  const revByCat = [
    { label: "Egg sales", amount: 14200000, color: "oklch(0.55 0.11 145)" },
    { label: "Broiler sales", amount: 7800000, color: "oklch(0.55 0.13 75)" },
    { label: "Live bird (Noiler)", amount: 1980000, color: "oklch(0.55 0.13 30)" },
    { label: "Cooperative resale", amount: 820000, color: "oklch(0.55 0.13 245)" },
  ];
  const expByCat = [
    { label: "Feed", amount: 10800000, color: "oklch(0.55 0.13 75)" },
    { label: "Chicks", amount: 3120000, color: "oklch(0.55 0.13 30)" },
    { label: "Labour", amount: 2240000, color: "oklch(0.55 0.13 245)" },
    { label: "Vaccines / medicine", amount: 980000, color: "oklch(0.55 0.11 145)" },
    { label: "Utilities", amount: 620000, color: "oklch(0.55 0.11 200)" },
    { label: "Logistics", amount: 440000, color: "oklch(0.55 0.13 320)" },
  ];
  const totalRev = revByCat.reduce((s, r) => s + r.amount, 0);
  const totalExp = expByCat.reduce((s, e) => s + e.amount, 0);
  const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  const revSeries = [16, 17.2, 18.4, 19.1, 18.6, 19.8, 21.2, 20.4, 21.8, 22.6, 21, 24.8];
  const expSeries = [12.4, 13.1, 13.8, 14.4, 14, 14.9, 16.1, 15.4, 16.2, 16.8, 16.2, 18.2];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Revenue vs expenses · 12 months</div>
            <div className="card-sub">Net margin trending +2pp QoQ</div>
          </div>
          <div className="row" style={{ gap: 12, fontSize: 11.5 }}>
            <span className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 2, background: "var(--accent)", display: "block" }}></span><span className="muted">Revenue</span></span>
            <span className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 2, background: "var(--danger)", display: "block" }}></span><span className="muted">Expenses</span></span>
          </div>
        </div>
        <div style={{ padding: "0 16px 16px" }}><FinanceChart months={months} revSeries={revSeries} expSeries={expSeries} /></div>
      </div>
      <div className="stack-4">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Revenue mix</div><div className="card-sub">{naira(totalRev)} MTD</div></div>
          </div>
          <div className="bar-stack" style={{ height: 10, borderRadius: 4, overflow: "hidden" }}>
            {revByCat.map((r) => <div key={r.label} style={{ width: `${(r.amount / totalRev) * 100}%`, background: r.color, height: "100%" }}></div>)}
          </div>
          <div className="stack-2" style={{ marginTop: 12 }}>
            {revByCat.map((r) => (
              <div key={r.label} className="row" style={{ gap: 8, fontSize: 12.5 }}>
                <span style={{ width: 10, height: 10, background: r.color, borderRadius: 2, flexShrink: 0, display: "block" }}></span>
                <span style={{ flex: 1 }}>{r.label}</span>
                <span className="mono">{naira(r.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Expense mix</div><div className="card-sub">{naira(totalExp)} MTD</div></div>
          </div>
          <div className="bar-stack" style={{ height: 10, borderRadius: 4, overflow: "hidden" }}>
            {expByCat.map((r) => <div key={r.label} style={{ width: `${(r.amount / totalExp) * 100}%`, background: r.color, height: "100%" }}></div>)}
          </div>
          <div className="stack-2" style={{ marginTop: 12 }}>
            {expByCat.map((r) => (
              <div key={r.label} className="row" style={{ gap: 8, fontSize: 12.5 }}>
                <span style={{ width: 10, height: 10, background: r.color, borderRadius: 2, flexShrink: 0, display: "block" }}></span>
                <span style={{ flex: 1 }}>{r.label}</span>
                <span className="mono faint" style={{ fontSize: 11 }}>{((r.amount / totalExp) * 100).toFixed(1)}%</span>
                <span className="mono" style={{ minWidth: 90, textAlign: "right" }}>{naira(r.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Transactions() {
  const txns = [
    { id: "TX-12048", date: D("2026-05-13"), type: "income", cat: "Egg sales", desc: "Mama Ngozi · ORD-2061 · 320 crates L", amount: 992000, account: "Opay", ref: "ORD-2061" },
    { id: "TX-12047", date: D("2026-05-13"), type: "expense", cat: "Feed", desc: "Olam Premier · PO-2026-082 · Layer Mash 5t", amount: 1184000, account: "GTBank current", ref: "PO-2026-082" },
    { id: "TX-12046", date: D("2026-05-13"), type: "income", cat: "Broiler", desc: "Shoprite Lekki · ORD-2062 · partial", amount: 920000, account: "GTBank current", ref: "ORD-2062" },
    { id: "TX-12045", date: D("2026-05-12"), type: "expense", cat: "Labour", desc: "Mid-month allowances · 14 staff", amount: 420000, account: "GTBank current", ref: "PAY-2026-05-MID" },
    { id: "TX-12044", date: D("2026-05-12"), type: "expense", cat: "Vaccines", desc: "Animal Care · PO-2026-081", amount: 312000, account: "GTBank current", ref: "PO-2026-081" },
    { id: "TX-12043", date: D("2026-05-12"), type: "income", cat: "Egg sales", desc: "Femi · Mowe roadside · ORD-2066", amount: 130200, account: "Cash", ref: "ORD-2066" },
    { id: "TX-12042", date: D("2026-05-11"), type: "income", cat: "Co-op resale", desc: "Ogun Co-op · 1,200 DOC broilers", amount: 1380000, account: "GTBank current", ref: "ORD-2064" },
    { id: "TX-12041", date: D("2026-05-11"), type: "expense", cat: "Utilities", desc: "NEPA bill · April", amount: 187000, account: "GTBank current", ref: "BL-04-26" },
  ];
  return (
    <>
      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}><Icons.Search size={14} /><input placeholder="Search txn ID, reference…" /></div>
        <div className="btn-group">
          <button className="active">All</button><button>Income</button><button>Expense</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Date</th><th>Txn #</th><th>Category</th><th>Description</th><th>Account</th><th>Reference</th><th className="num">Amount</th></tr></thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id}>
                <td className="id-cell">{t.date.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                <td className="id-cell">{t.id}</td>
                <td><span className={`badge ${t.type === "income" ? "success" : "warning"}`}>{t.cat}</span></td>
                <td style={{ fontSize: 13 }}>{t.desc}</td>
                <td className="muted" style={{ fontSize: 12 }}>{t.account}</td>
                <td className="id-cell">{t.ref}</td>
                <td className="num" style={{ color: t.type === "income" ? "var(--success-soft-fg)" : "var(--danger-soft-fg)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                  {t.type === "income" ? "+" : "−"}{naira(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PnLTab() {
  const rows = [
    { section: "Revenue", items: [{ l: "Egg sales — retail / wholesale", v: 14200000 }, { l: "Broiler sales — live & dressed", v: 7800000 }, { l: "Live Noiler sales", v: 1980000 }, { l: "Cooperative resale (DOC)", v: 820000 }] },
    { section: "COGS", items: [{ l: "Feed consumed", v: 10800000, neg: true }, { l: "Day-old chicks placed", v: 3120000, neg: true }, { l: "Vaccines & medicine", v: 980000, neg: true }] },
    { section: "Operating expenses", items: [{ l: "Salaries & wages", v: 2240000, neg: true }, { l: "Utilities (NEPA, diesel)", v: 620000, neg: true }, { l: "Logistics & delivery", v: 440000, neg: true }, { l: "Maintenance & sanitation", v: 220000, neg: true }] },
  ];
  const totalRev = rows[0].items.reduce((s, i) => s + i.v, 0);
  const totalCogs = rows[1].items.reduce((s, i) => s + i.v, 0);
  const totalOpex = rows[2].items.reduce((s, i) => s + i.v, 0);
  const grossMargin = totalRev - totalCogs;
  const netIncome = grossMargin - totalOpex;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header">
          <div><div className="card-title">Profit & loss · May 2026</div><div className="card-sub">Through 13 May · provisional</div></div>
          <button className="btn sm">Print</button>
        </div>
        <table className="table">
          <tbody>
            {rows.map((s) => (
              <>
                <tr key={s.section} style={{ background: "var(--bg-sunken)" }}>
                  <td colSpan={2} style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-muted)" }}>{s.section}</td>
                </tr>
                {s.items.map((i) => (
                  <tr key={i.l}>
                    <td style={{ paddingLeft: 24 }}>{i.l}</td>
                    <td className="num mono">{"neg" in i && i.neg && "−"}{naira(i.v)}</td>
                  </tr>
                ))}
              </>
            ))}
            <tr style={{ background: "var(--bg-sunken)", borderTop: "2px solid var(--border-strong)" }}>
              <td style={{ fontWeight: 600 }}>Gross margin</td>
              <td className="num mono" style={{ fontWeight: 600 }}>{naira(grossMargin)}</td>
            </tr>
            <tr>
              <td className="muted" style={{ paddingLeft: 24, fontSize: 12 }}>Margin %</td>
              <td className="num mono">{((grossMargin / totalRev) * 100).toFixed(1)}%</td>
            </tr>
            <tr style={{ background: "var(--accent-soft)", color: "var(--accent-soft-fg)" }}>
              <td style={{ fontWeight: 700, fontSize: 14 }}>Net income</td>
              <td className="num mono" style={{ fontWeight: 700, fontSize: 14 }}>{naira(netIncome)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="stack-4">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 8 }}>Margin by module</div>
          {[{ l: "Layer batches (×3)", m: 4.2, pct: 67 }, { l: "Broiler batches (×2)", m: 1.8, pct: 28 }, { l: "Dual / Noiler", m: 0.3, pct: 5 }].map((m) => (
            <div key={m.l} style={{ marginBottom: 10 }}>
              <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <span>{m.l}</span><span className="mono">{naira(m.m * 1000000)} · {m.pct}%</span>
              </div>
              <div className="bar"><span style={{ width: `${m.pct}%` }}></span></div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 8 }}>Year-on-year</div>
          <div className="stack-2">
            {[{ l: "Revenue MTD vs May 2025", v: "+34.2%" }, { l: "Cost per dozen eggs", v: "−8.4%" }, { l: "Net margin", v: "+5.1 pp" }].map((r) => (
              <div key={r.l} className="row" style={{ justifyContent: "space-between" }}>
                <span className="muted">{r.l}</span><span className="mono success-text">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BudgetsTab() {
  const budgets = [
    { cat: "Feed", allocated: 14000000, spent: 10800000 },
    { cat: "Day-old chicks", allocated: 4000000, spent: 3120000 },
    { cat: "Vaccines & medicine", allocated: 1200000, spent: 980000 },
    { cat: "Salaries & wages", allocated: 2400000, spent: 2240000 },
    { cat: "Utilities", allocated: 800000, spent: 620000 },
    { cat: "Logistics & delivery", allocated: 400000, spent: 440000 },
    { cat: "Maintenance", allocated: 300000, spent: 220000 },
  ];
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="card-header">
        <div><div className="card-title">May 2026 budget</div><div className="card-sub">63% of month elapsed · 67% of budget spent</div></div>
        <button className="btn sm">Edit budget</button>
      </div>
      <table className="table">
        <thead><tr><th>Category</th><th className="num">Allocated</th><th className="num">Spent</th><th className="num">Remaining</th><th>Burn</th><th>Status</th></tr></thead>
        <tbody>
          {budgets.map((b) => {
            const pct = (b.spent / b.allocated) * 100;
            const over = b.spent > b.allocated;
            return (
              <tr key={b.cat}>
                <td style={{ fontWeight: 500 }}>{b.cat}</td>
                <td className="num" style={{ fontVariantNumeric: "tabular-nums" }}>{naira(b.allocated)}</td>
                <td className="num" style={{ fontVariantNumeric: "tabular-nums" }}>{naira(b.spent)}</td>
                <td className="num" style={{ color: over ? "var(--danger-soft-fg)" : "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}>{naira(b.allocated - b.spent)}</td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <div className={`bar ${over ? "danger" : pct > 80 ? "warning" : ""}`} style={{ width: 120 }}>
                      <span style={{ width: `${Math.min(100, pct)}%` }}></span>
                    </div>
                    <span className="mono faint" style={{ fontSize: 11 }}>{pct.toFixed(0)}%</span>
                  </div>
                </td>
                <td><span className={`badge ${over ? "danger" : pct > 80 ? "warning" : "success"}`}><span className="dot"></span>{over ? "Over" : pct > 80 ? "Watch" : "Healthy"}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const TABS = ["overview", "transactions", "P&L", "cashflow", "budgets", "reconciliation"];

export default function FinanceScreen() {
  const [tab, setTab] = useState("overview");
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance</h1>
          <div className="page-sub">May 2026 · ₦24.8M revenue · ₦18.2M expenses · 26.6% margin</div>
        </div>
        <div className="page-actions">
          <div className="btn-group">
            {["This week", "MTD", "YTD", "Custom"].map((t, i) => (
              <button key={t} className={i === 1 ? "active" : ""}>{t}</button>
            ))}
          </div>
          <button className="btn"><Icons.Download size={14} /> Export</button>
          <button className="btn accent"><Icons.Plus size={14} /> Record txn</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiBox label="Cash on hand" value={naira(8420000)} hint="GTBank ₦5.8M · Opay ₦2.1M · Cash ₦520k" />
        <KpiBox label="Revenue MTD" value={naira(24800000)} trend="+18% MoM" trendDir="up" />
        <KpiBox label="Expenses MTD" value={naira(18200000)} trend="+12% MoM" trendDir="down" />
        <KpiBox label="Net margin" value="26.6%" trend="+2.4 pp" trendDir="up" />
      </div>

      <div className="tabs">
        {TABS.map((t) => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      {tab === "overview" && <FinanceOverview />}
      {tab === "transactions" && <Transactions />}
      {tab === "P&L" && <PnLTab />}
      {tab === "budgets" && <BudgetsTab />}
      {(tab === "cashflow" || tab === "reconciliation") && (
        <div className="empty">
          <div style={{ fontWeight: 500, color: "var(--fg)", marginBottom: 4 }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</div>
          <div>This view is available in the full build.</div>
        </div>
      )}
    </div>
  );
}
