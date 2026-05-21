"use client";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { naira } from "@/lib/utils";

const CUSTOMERS = [
  { id: "CUS-001", name: "Mama Ngozi", biz: "Mile 12 Market", type: "Wholesale", phone: "0801 234 5678", channel: "WhatsApp", ltv: 4820000, orders: 34, lastOrder: "Today", status: "active", tags: ["eggs", "bulk"] },
  { id: "CUS-002", name: "Shoprite Lekki", biz: "Retail chain", type: "Retail B2B", phone: "0802 345 6789", channel: "Email", ltv: 8140000, orders: 22, lastOrder: "Yesterday", status: "active", tags: ["eggs", "broiler"] },
  { id: "CUS-003", name: "Ifeoma Caterers", biz: "Event catering", type: "Wholesale", phone: "0803 456 7890", channel: "WhatsApp", ltv: 2290000, orders: 18, lastOrder: "5 May", status: "active", tags: ["broiler", "dressed"] },
  { id: "CUS-004", name: "Festac Grocery Hub", biz: "Grocery store", type: "Retail B2B", phone: "0804 567 8901", channel: "WhatsApp", ltv: 1870000, orders: 15, lastOrder: "8 May", status: "active", tags: ["eggs"] },
  { id: "CUS-005", name: "Iya Tunde Farms", biz: "Small farm gate", type: "Cooperative", phone: "0805 678 9012", channel: "WhatsApp", ltv: 890000, orders: 9, lastOrder: "2 May", status: "inactive", tags: ["eggs", "coop"] },
  { id: "CUS-006", name: "Abeokuta FoodHub", biz: "Wholesale market", type: "Wholesale", phone: "0806 789 0123", channel: "WhatsApp", ltv: 3140000, orders: 27, lastOrder: "10 May", status: "active", tags: ["eggs", "bulk"] },
  { id: "CUS-007", name: "Northern Cooperative", biz: "Cooperative block", type: "Cooperative", phone: "0807 890 1234", channel: "WhatsApp", ltv: 6200000, orders: 41, lastOrder: "Today", status: "active", tags: ["eggs", "coop", "bulk"] },
];

const SUPPLIERS = [
  { id: "SUP-001", name: "AgriFeeds Nigeria Ltd", category: "Feed", contact: "Emeka Dike", phone: "0801 111 2222", email: "sales@agrifeeds.ng", spend: 12400000, status: "preferred" },
  { id: "SUP-002", name: "ChickHatch Co-op", category: "Day-old Chicks", contact: "Ade Olaitan", phone: "0802 222 3333", email: "orders@chickhatch.com", spend: 14200000, status: "preferred" },
  { id: "SUP-003", name: "VetCare Supplies", category: "Vaccines & Medicine", contact: "Dr. Bello", phone: "0803 333 4444", email: "vet@vetcare.ng", spend: 1870000, status: "approved" },
  { id: "SUP-004", name: "FarmEquip Solutions", category: "Equipment", contact: "Gbenga Olu", phone: "0804 444 5555", email: "info@farmequip.ng", spend: 920000, status: "approved" },
];

const TICKETS = [
  { id: "TKT-0021", customer: "Shoprite Lekki", issue: "2 crates cracked eggs in last delivery", priority: "high", status: "open", date: "12 May", assigned: "Adaeze O." },
  { id: "TKT-0020", customer: "Ifeoma Caterers", issue: "Invoice for April not received", priority: "medium", status: "resolved", date: "8 May", assigned: "Chioma O." },
  { id: "TKT-0019", customer: "Mama Ngozi", issue: "Weight short on 3kg packs", priority: "high", status: "in_progress", date: "7 May", assigned: "Adaeze O." },
  { id: "TKT-0018", customer: "Festac Grocery Hub", issue: "Delivery 2 days late", priority: "low", status: "resolved", date: "4 May", assigned: "Emeka N." },
];

const SEGMENTS = [
  { name: "WhatsApp buyers", count: 5, revenue_share: 58, desc: "All customers who order via WhatsApp" },
  { name: "Cooperative block", count: 2, revenue_share: 29, desc: "Members of registered cooperatives" },
  { name: "Bulk (>100 crates/wk)", count: 3, revenue_share: 61, desc: "High-volume egg buyers" },
  { name: "Broiler accounts", count: 2, revenue_share: 18, desc: "Customers who buy live or dressed broiler" },
  { name: "Inactive 30d+", count: 1, revenue_share: 0, desc: "No order in last 30 days" },
];

const THREAD = [
  { from: "Mama Ngozi", time: "07:14", text: "Good morning, please confirm my order for today — 80 crates large eggs" },
  { from: "me", time: "07:18", text: "Good morning Mama Ngozi! Confirmed ✅ 80 crates large eggs. Lagos-1 truck departs at 07:30, arrives Mile 12 by 09:15 insha Allah." },
  { from: "Mama Ngozi", time: "07:22", text: "OK thank you. Oga please I want to add 5 crates XL if you have" },
  { from: "me", time: "07:25", text: "Yes we have XL available. Adding 5 crates XL to your order. New total: 85 crates. Invoice updated." },
  { from: "Mama Ngozi", time: "07:28", text: "Eiya God bless you. I'll pay everything when truck reach." },
];

export default function CRMScreen() {
  const [tab, setTab] = useState("customers");
  const [activeThread, setActiveThread] = useState(0);
  const [replyText, setReplyText] = useState("");

  const totalLTV = CUSTOMERS.filter(c => c.status === "active").reduce((s, c) => s + c.ltv, 0);
  const openTickets = TICKETS.filter(t => t.status !== "resolved").length;

  const ticketBadge = (p: string) => p === "high" ? "danger" : p === "medium" ? "warning" : "outline";
  const ticketStatus = (s: string) => s === "resolved" ? "success" : s === "in_progress" ? "info" : "warning";

  const INBOX = CUSTOMERS.filter(c => c.channel === "WhatsApp");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">CRM</h1>
          <div className="page-sub">{CUSTOMERS.filter(c => c.status === "active").length} active customers · {naira(totalLTV)} total LTV · {openTickets} open tickets</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Download size={14} /> Export</button>
          <button className="btn accent"><Icons.Plus size={14} /> Add customer</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi">
          <div className="kpi-label">Active customers</div>
          <div className="kpi-value">{CUSTOMERS.filter(c => c.status === "active").length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>1 inactive 30d+</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total LTV</div>
          <div className="kpi-value tnum">{naira(totalLTV)}</div>
          <div className="kpi-trend up"><Icons.TrendUp size={11} /><span>+24% YoY</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Open tickets</div>
          <div className="kpi-value" style={{ color: "var(--warning-soft-fg)" }}>{openTickets}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>2 high priority</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">WhatsApp conversations</div>
          <div className="kpi-value">{INBOX.length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>4 unread messages</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 12 }}>
        {["customers", "suppliers", "tickets", "segments", "whatsapp"].map(t => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t === "customers" ? "Customers" : t === "suppliers" ? "Suppliers" : t === "tickets" ? `Tickets${openTickets > 0 ? ` (${openTickets})` : ""}` : t === "segments" ? "Segments" : "WhatsApp inbox"}
          </button>
        ))}
      </div>

      {tab === "customers" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Customer</th><th>Type</th><th>Channel</th><th className="num">LTV</th><th className="num">Orders</th><th>Last order</th><th>Tags</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {CUSTOMERS.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                    <div className="faint mono" style={{ fontSize: 11 }}>{c.phone}</div>
                  </td>
                  <td><span className="badge outline" style={{ fontSize: 11 }}>{c.type}</span></td>
                  <td>
                    {c.channel === "WhatsApp"
                      ? <span className="badge outline" style={{ fontSize: 11 }}><Icons.WhatsApp size={10} className="whatsapp-icon" /> WA</span>
                      : <span className="badge outline" style={{ fontSize: 11 }}>{c.channel}</span>}
                  </td>
                  <td className="num">{naira(c.ltv)}</td>
                  <td className="num">{c.orders}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{c.lastOrder}</td>
                  <td>
                    <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                      {c.tags.map(tag => <span key={tag} className="badge info" style={{ fontSize: 10 }}>{tag}</span>)}
                    </div>
                  </td>
                  <td><span className={`badge ${c.status === "active" ? "success" : "outline"}`}>{c.status}</span></td>
                  <td><button className="btn ghost sm icon-only"><Icons.More size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "suppliers" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Supplier</th><th>Category</th><th>Contact</th><th>Phone</th><th className="num">Total spend</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {SUPPLIERS.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</td>
                  <td><span className="badge outline" style={{ fontSize: 11 }}>{s.category}</span></td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{s.contact}</td>
                  <td className="mono muted" style={{ fontSize: 12 }}>{s.phone}</td>
                  <td className="num">{naira(s.spend)}</td>
                  <td><span className={`badge ${s.status === "preferred" ? "accent" : "success"}`}>{s.status}</span></td>
                  <td><button className="btn ghost sm icon-only"><Icons.More size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "tickets" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Ticket</th><th>Customer</th><th>Issue</th><th>Priority</th><th>Date</th><th>Assigned</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {TICKETS.map(t => (
                <tr key={t.id}>
                  <td className="id-cell"><span className="row-link">{t.id}</span></td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{t.customer}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{t.issue}</td>
                  <td><span className={`badge ${ticketBadge(t.priority)}`}>{t.priority}</span></td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{t.date}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{t.assigned}</td>
                  <td><span className={`badge ${ticketStatus(t.status)}`}>{t.status.replace("_", " ")}</span></td>
                  <td><button className="btn ghost sm icon-only"><Icons.More size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "segments" && (
        <div className="grid-3" style={{ gap: 16 }}>
          {SEGMENTS.map(s => (
            <div key={s.name} className="card">
              <div className="card-header">
                <div className="card-title">{s.name}</div>
                <span className="badge accent">{s.count} customers</span>
              </div>
              <div style={{ padding: "0 16px 16px" }} className="stack-2">
                <div className="muted" style={{ fontSize: 12.5 }}>{s.desc}</div>
                <div>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="muted" style={{ fontSize: 12 }}>Revenue share</span>
                    <span className="mono" style={{ fontSize: 12.5 }}>{s.revenue_share}%</span>
                  </div>
                  <div style={{ width: "100%", height: 5, background: "var(--bg-sunken)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${s.revenue_share}%`, height: "100%", background: "var(--accent)", borderRadius: 3 }} />
                  </div>
                </div>
                <button className="btn sm">View segment</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "whatsapp" && (
        <div style={{ display: "flex", gap: 16, height: 520 }}>
          <div style={{ width: 280, borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 13 }}>
              Conversations <span className="badge danger" style={{ marginLeft: 6, fontSize: 10 }}>4</span>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {INBOX.map((c, i) => (
                <div key={c.id} className={`row ${activeThread === i ? "selected" : ""}`} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)", gap: 10 }} onClick={() => setActiveThread(i)}>
                  <div className="avatar" style={{ flexShrink: 0 }}>{c.name.split(" ").map(x => x[0]).join("").slice(0, 2)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div className="faint" style={{ fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.biz}</div>
                  </div>
                  <div className="muted" style={{ fontSize: 10.5, flexShrink: 0 }}>{c.lastOrder}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, borderRadius: 10, border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
            <div className="row" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", gap: 10 }}>
              <div className="avatar">{INBOX[activeThread]?.name.split(" ").map((x: string) => x[0]).join("").slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{INBOX[activeThread]?.name}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>{INBOX[activeThread]?.biz} · {INBOX[activeThread]?.phone}</div>
              </div>
              <button className="btn sm ghost">View profile</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {THREAD.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "75%", padding: "8px 12px", borderRadius: msg.from === "me" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: msg.from === "me" ? "var(--accent)" : "var(--bg-sunken)", fontSize: 13 }}>
                    <div style={{ color: msg.from === "me" ? "white" : "var(--fg)" }}>{msg.text}</div>
                    <div style={{ fontSize: 10.5, marginTop: 4, opacity: 0.7, textAlign: "right", color: msg.from === "me" ? "rgba(255,255,255,0.8)" : "var(--fg-muted)" }}>{msg.time}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "6px 10px", background: "var(--accent-soft)", borderRadius: 8, fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500 }}>AI suggest:</span>
                  <span className="muted" style={{ marginLeft: 6 }}>Generate invoice for 85 crates and send to Mama Ngozi · payment due on delivery</span>
                </div>
                <button className="btn sm accent">Use</button>
                <button className="btn sm ghost">Dismiss</button>
              </div>
            </div>
            <div className="row" style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", gap: 8 }}>
              <input className="input" style={{ flex: 1 }} placeholder="Type a message…" value={replyText} onChange={e => setReplyText(e.target.value)} />
              <button className="btn accent icon-only" style={{ padding: "0 14px" }}><Icons.WhatsApp size={14} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
