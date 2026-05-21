"use client";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { naira } from "@/lib/utils";

const POS = [
  { id: "PO-2026-041", vendor: "AgriFeeds Nigeria Ltd", category: "Feed", items: "Layer Mash 18% × 200 bags", amount: 2200000, status: "approved", date: "12 May", delivery: "16 May", raised_by: "Babatunde S." },
  { id: "PO-2026-040", vendor: "VetCare Supplies Ibadan", category: "Vaccine", items: "Newcastle ND-Clone × 30 vials", amount: 345000, status: "delivered", date: "8 May", delivery: "10 May", raised_by: "Ngozi E." },
  { id: "PO-2026-039", vendor: "AgriFeeds Nigeria Ltd", category: "Feed", items: "Broiler Finisher × 150 bags", amount: 1275000, status: "delivered", date: "2 May", delivery: "5 May", raised_by: "Babatunde S." },
  { id: "PO-2026-038", vendor: "FarmEquip Solutions", category: "Equipment", items: "Nipple drinker sets × 12", amount: 180000, status: "pending", date: "11 May", delivery: "TBD", raised_by: "Amaka I." },
  { id: "PO-2026-037", vendor: "ChickHatch Co-op", category: "Chicks", items: "Ross 308 day-old chicks × 5,000", amount: 2750000, status: "delivered", date: "25 Apr", delivery: "28 Apr", raised_by: "Chukwuemeka A." },
  { id: "PO-2026-036", vendor: "Ogun Litter Supplies", category: "Consumables", items: "Wood shavings × 80 bags", amount: 96000, status: "delivered", date: "20 Apr", delivery: "22 Apr", raised_by: "Babatunde S." },
];

const REQS = [
  { id: "REQ-2026-018", item: "Vitamin / Electrolyte sachets × 50", dept: "Health", amount: 62500, raised_by: "Ngozi E.", date: "12 May", status: "pending", urgent: true },
  { id: "REQ-2026-017", item: "Egg crates × 500 units", dept: "Operations", amount: 37500, raised_by: "Kunle F.", date: "11 May", status: "pending", urgent: false },
  { id: "REQ-2026-016", item: "Disinfectant Virkon S × 10 kg", dept: "Health", amount: 28000, raised_by: "Ngozi E.", date: "10 May", status: "approved", urgent: false },
  { id: "REQ-2026-015", item: "Safety gloves + boots set × 14", dept: "Admin", amount: 42000, raised_by: "Amaka I.", date: "9 May", status: "approved", urgent: false },
  { id: "REQ-2026-014", item: "Trough feeders × 30", dept: "Operations", amount: 54000, raised_by: "Babatunde S.", date: "8 May", status: "declined", urgent: false },
];

const VENDORS = [
  { name: "AgriFeeds Nigeria Ltd", category: "Feed", location: "Sagamu, Ogun", contact: "0801 111 2222", rating: 4.8, orders: 18, spend: 12400000, status: "preferred" },
  { name: "VetCare Supplies Ibadan", category: "Vaccine & Medicine", location: "Ibadan, Oyo", contact: "0802 222 3333", rating: 4.5, orders: 9, spend: 1870000, status: "approved" },
  { name: "ChickHatch Co-op", category: "Day-old Chicks", location: "Ikorodu, Lagos", contact: "0803 333 4444", rating: 4.7, orders: 6, spend: 14200000, status: "preferred" },
  { name: "FarmEquip Solutions", category: "Equipment", location: "Ota, Ogun", contact: "0804 444 5555", rating: 4.2, orders: 4, spend: 920000, status: "approved" },
  { name: "Ogun Litter Supplies", category: "Consumables", location: "Abeokuta, Ogun", contact: "0805 555 6666", rating: 4.4, orders: 11, spend: 880000, status: "approved" },
  { name: "NovaBio Agri", category: "Vaccine & Medicine", location: "Lagos Island", contact: "0806 666 7777", rating: 3.9, orders: 2, spend: 340000, status: "pending" },
];

const RFQS = [
  { id: "RFQ-2026-009", item: "Broiler Starter Crumbs × 250 bags", responses: 3, best: "AgriFeeds · ₦3,750,000", deadline: "15 May", status: "open" },
  { id: "RFQ-2026-008", item: "Salmonella vaccine × 50 vials", responses: 2, best: "VetCare · ₦125,000", deadline: "12 May", status: "awarded" },
  { id: "RFQ-2026-007", item: "Solar fan units × 6", responses: 1, best: "FarmEquip · ₦420,000", deadline: "10 May", status: "awarded" },
];

function NewPOModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState([{ desc: "Layer Mash 18%", unit: "bag", qty: 200, price: 11000 }]);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <h3>New purchase order</h3>
            <div className="sub">Step {step} of 2 · {step === 1 ? "PO details" : "Review & submit"}</div>
          </div>
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="form-grid">
                <div className="form-row">
                  <label>Vendor</label>
                  <select className="select"><option>AgriFeeds Nigeria Ltd</option><option>VetCare Supplies Ibadan</option><option>ChickHatch Co-op</option><option>+ Add vendor</option></select>
                </div>
                <div className="form-row">
                  <label>Category</label>
                  <select className="select"><option>Feed</option><option>Vaccine</option><option>Medicine</option><option>Consumables</option><option>Equipment</option><option>Chicks</option></select>
                </div>
                <div className="form-row">
                  <label>Expected delivery</label>
                  <input className="input" type="date" defaultValue="2026-05-18" />
                </div>
                <div className="form-row">
                  <label>Payment terms</label>
                  <select className="select"><option>On delivery</option><option>50% advance</option><option>Net-15</option><option>Net-30</option></select>
                </div>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Item description</th><th>Unit</th><th className="num">Qty</th><th className="num">Unit price</th><th className="num">Total</th><th></th></tr></thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i}>
                        <td><input className="input" style={{ width: "100%", minWidth: 160 }} value={it.desc} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} /></td>
                        <td><input className="input" style={{ width: 70 }} value={it.unit} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))} /></td>
                        <td className="num"><input className="input" type="number" style={{ width: 70, textAlign: "right" }} value={it.qty} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, qty: +e.target.value } : x))} /></td>
                        <td className="num"><input className="input" type="number" style={{ width: 90, textAlign: "right" }} value={it.price} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} /></td>
                        <td className="num mono" style={{ fontVariantNumeric: "tabular-nums" }}>{naira(it.qty * it.price)}</td>
                        <td><button className="btn ghost sm icon-only" onClick={() => setItems(items.filter((_, j) => j !== i))}><Icons.X size={12} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn sm" onClick={() => setItems([...items, { desc: "", unit: "bag", qty: 1, price: 0 }])}><Icons.Plus size={12} /> Add line</button>
              <div className="row" style={{ justifyContent: "flex-end", padding: "10px 12px", background: "var(--accent-soft)", borderRadius: 8 }}>
                <span style={{ fontWeight: 500 }}>PO Total</span>
                <span className="spacer"></span>
                <span className="mono" style={{ fontWeight: 600, fontSize: 17 }}>{naira(total)}</span>
              </div>
            </>
          )}
          {step === 2 && (
            <div className="stack-3">
              <div className="banner success">
                <div className="icon-dot success"><Icons.Check size={12} /></div>
                <div>PO ready for submission. Will be sent to vendor via email + WhatsApp.</div>
              </div>
              {[
                { k: "Vendor", v: "AgriFeeds Nigeria Ltd" },
                { k: "Category", v: "Feed" },
                { k: "Delivery", v: "18 May 2026" },
                { k: "Terms", v: "On delivery" },
                { k: "Items", v: `${items.length} line(s)` },
                { k: "Total", v: naira(total), hi: true },
              ].map(({ k, v, hi }) => (
                <div key={k} className="row" style={{ justifyContent: "space-between", padding: "6px 10px", background: hi ? "var(--accent-soft)" : "var(--bg-sunken)", borderRadius: 6, fontSize: 13 }}>
                  <span className="muted">{k}</span>
                  <span className="mono" style={{ fontWeight: hi ? 600 : 400 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {step > 1 && <button className="btn" onClick={() => setStep(1)}>Back</button>}
          <button className="btn" onClick={onClose}>Cancel</button>
          {step < 2
            ? <button className="btn primary" onClick={() => setStep(2)}>Review PO</button>
            : <button className="btn accent" onClick={onClose}><Icons.Check size={14} /> Submit PO</button>}
        </div>
      </div>
    </div>
  );
}

export default function ProcurementScreen() {
  const [tab, setTab] = useState("pos");
  const [showNewPO, setShowNewPO] = useState(false);

  const totalPOValue = POS.reduce((s, p) => s + p.amount, 0);
  const pendingPOs = POS.filter(p => p.status === "pending" || p.status === "approved").length;

  const poBadge = (s: string) => s === "delivered" ? "success" : s === "approved" ? "accent" : s === "pending" ? "warning" : "outline";
  const reqBadge = (s: string) => s === "approved" ? "success" : s === "pending" ? "warning" : "danger";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Procurement</h1>
          <div className="page-sub">{POS.length} POs this month · {naira(totalPOValue)} total · {pendingPOs} open</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Download size={14} /> Export</button>
          <button className="btn accent" onClick={() => setShowNewPO(true)}><Icons.Plus size={14} /> New PO</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi">
          <div className="kpi-label">PO spend · MTD</div>
          <div className="kpi-value tnum">{naira(totalPOValue)}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>{POS.length} orders placed</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Open POs</div>
          <div className="kpi-value">{pendingPOs}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>1 approved, 1 pending approval</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Pending requisitions</div>
          <div className="kpi-value" style={{ color: "var(--warning-soft-fg)" }}>{REQS.filter(r => r.status === "pending").length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>1 urgent</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Active vendors</div>
          <div className="kpi-value">{VENDORS.filter(v => v.status !== "pending").length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>{VENDORS.filter(v => v.status === "preferred").length} preferred</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 12 }}>
        {["pos", "requisitions", "vendors", "rfqs"].map(t => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t === "pos" ? "Purchase orders" : t === "requisitions" ? "Requisitions" : t === "vendors" ? "Vendors" : "RFQs"}
          </button>
        ))}
      </div>

      {tab === "pos" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>PO #</th><th>Vendor</th><th>Category</th><th>Items</th><th className="num">Amount</th><th>Date</th><th>Delivery</th><th>Raised by</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {POS.map(p => (
                <tr key={p.id}>
                  <td className="id-cell"><span className="row-link">{p.id}</span></td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{p.vendor}</td>
                  <td><span className="badge outline" style={{ fontSize: 11 }}>{p.category}</span></td>
                  <td className="muted" style={{ fontSize: 12 }}>{p.items}</td>
                  <td className="num">{naira(p.amount)}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{p.date}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{p.delivery}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{p.raised_by}</td>
                  <td><span className={`badge ${poBadge(p.status)}`}>{p.status}</span></td>
                  <td><button className="btn ghost sm icon-only"><Icons.More size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "requisitions" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Req #</th><th>Item</th><th>Dept</th><th className="num">Est. amount</th><th>Raised by</th><th>Date</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {REQS.map(r => (
                <tr key={r.id}>
                  <td className="id-cell">
                    <span className="row-link">{r.id}</span>
                    {r.urgent && <div><span className="badge danger" style={{ fontSize: 10 }}>Urgent</span></div>}
                  </td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{r.item}</td>
                  <td><span className="badge outline" style={{ fontSize: 11 }}>{r.dept}</span></td>
                  <td className="num">{naira(r.amount)}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{r.raised_by}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{r.date}</td>
                  <td><span className={`badge ${reqBadge(r.status)}`}>{r.status}</span></td>
                  <td>
                    {r.status === "pending" && (
                      <div className="row" style={{ gap: 4 }}>
                        <button className="btn sm accent">Approve</button>
                        <button className="btn sm ghost danger">Decline</button>
                      </div>
                    )}
                    {r.status !== "pending" && <button className="btn ghost sm icon-only"><Icons.More size={13} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "vendors" && (
        <div className="grid-3" style={{ gap: 16 }}>
          {VENDORS.map(v => (
            <div key={v.name} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{v.name}</div>
                  <div className="card-sub">{v.location}</div>
                </div>
                <span className={`badge ${v.status === "preferred" ? "accent" : v.status === "approved" ? "success" : "warning"}`}>{v.status}</span>
              </div>
              <div style={{ padding: "0 16px 16px" }} className="stack-2">
                <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5 }}>
                  <span className="muted">Category</span>
                  <span style={{ fontWeight: 500 }}>{v.category}</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5 }}>
                  <span className="muted">Contact</span>
                  <span className="mono">{v.contact}</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5 }}>
                  <span className="muted">Total orders</span>
                  <span>{v.orders}</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5 }}>
                  <span className="muted">Total spend</span>
                  <span className="mono">{naira(v.spend)}</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5 }}>
                  <span className="muted">Rating</span>
                  <span className="mono" style={{ color: "var(--accent)" }}>★ {v.rating}</span>
                </div>
                <button className="btn sm" style={{ marginTop: 4 }}>View history</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "rfqs" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>RFQ #</th><th>Item</th><th className="num">Responses</th><th>Best quote</th><th>Deadline</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {RFQS.map(r => (
                <tr key={r.id}>
                  <td className="id-cell"><span className="row-link">{r.id}</span></td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{r.item}</td>
                  <td className="num">{r.responses}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{r.best}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{r.deadline}</td>
                  <td><span className={`badge ${r.status === "open" ? "accent" : "success"}`}>{r.status}</span></td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      {r.status === "open" && <button className="btn sm accent">Award</button>}
                      <button className="btn ghost sm icon-only"><Icons.More size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNewPO && <NewPOModal onClose={() => setShowNewPO(false)} />}
    </div>
  );
}
