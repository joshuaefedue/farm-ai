"use client";
import { useState, useTransition } from "react";
import { Icons } from "@/components/icons";
import { ORDERS, Order } from "@/lib/data";
import { naira } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { useOrg } from "@/contexts/OrgContext";
import { createOrder } from "@/app/actions/orders";

function SalesKPI({ label, value, trend, trendDir, hint, tone }: {
  label: string; value: string | number; trend?: string; trendDir?: string; hint?: string; tone?: string;
}) {
  const toneColor = tone === "warning" ? "var(--warning-soft-fg)" : tone === "danger" ? "var(--danger-soft-fg)" : "var(--fg)";
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value tnum" style={{ color: toneColor }}>{value}</div>
      <div className="row" style={{ gap: 6 }}>
        {trend && <div className={`kpi-trend ${trendDir}`}>{trendDir === "up" && <Icons.TrendUp size={11} />}{trendDir === "down" && <Icons.TrendDown size={11} />}<span>{trend}</span></div>}
        {hint && <span className="muted" style={{ fontSize: 11.5 }}>{hint}</span>}
      </div>
    </div>
  );
}

function CreateOrderModal({
  onClose,
  orgId,
  onSuccess,
}: {
  onClose: () => void;
  orgId: string | null;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [customer, setCustomer] = useState("Mama Ngozi · Mile 12 Market");
  const [channel, setChannel] = useState("WhatsApp");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState("Cash on delivery");
  const [phone, setPhone] = useState("");

  const skus = [
    { sku: "EGG-L",    name: "Eggs · Large",       unit: "crate", price: 3100 },
    { sku: "EGG-XL",   name: "Eggs · Extra large",  unit: "crate", price: 3400 },
    { sku: "EGG-M",    name: "Eggs · Medium",       unit: "crate", price: 2700 },
    { sku: "BRO-DRSD", name: "Dressed broiler",     unit: "kg",    price: 3300 },
    { sku: "BRO-LIVE", name: "Live broiler",        unit: "bird",  price: 4800 },
  ];
  const [items, setItems] = useState([{ sku: "EGG-L", qty: 80 }]);
  const total = items.reduce((s, it) => {
    const p = skus.find((sk) => sk.sku === it.sku)?.price || 0;
    return s + p * it.qty;
  }, 0);

  const itemsSummary = items.map((it) => {
    const sku = skus.find((sk) => sk.sku === it.sku);
    return `${it.qty}× ${sku?.name ?? it.sku}`;
  }).join(", ");

  async function handleCreate() {
    if (!orgId) { setErrMsg("No farm selected"); return; }
    setSaving(true);
    setErrMsg(null);
    const res = await createOrder({
      org_id: orgId,
      customer,
      channel,
      items: itemsSummary,
      subtotal: total,
      payment_method: paymentTerms,
      phone: phone || undefined,
      is_coop: channel === "Cooperative",
    });
    setSaving(false);
    if (!res.success) { setErrMsg(res.error ?? "Failed to create order"); return; }
    onSuccess();
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <h3>New order</h3>
            <div className="sub">Step {step} of 2 · {step === 1 ? "Build order" : "Confirm & send"}</div>
          </div>
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          {errMsg && <div className="banner danger" style={{ marginBottom: 12 }}><Icons.Alert size={14} /> {errMsg}</div>}
          {step === 1 && (
            <>
              <div className="form-grid">
                <div className="form-row">
                  <label>Customer</label>
                  <input className="input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name" />
                </div>
                <div className="form-row">
                  <label>Channel</label>
                  <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
                    <option>WhatsApp</option><option>Wholesale</option><option>Cooperative</option><option>Retail B2B</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Delivery date</label>
                  <input className="input" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Payment terms</label>
                  <select className="select" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
                    <option>Cash on delivery</option><option>Net-7</option><option>Net-30</option><option>Prepaid</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Phone (optional)</label>
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" />
                </div>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>SKU</th><th>Item</th><th className="num">Qty</th><th className="num">Unit price</th><th className="num">Total</th><th></th></tr></thead>
                  <tbody>
                    {items.map((it, i) => {
                      const sku = skus.find((s) => s.sku === it.sku)!;
                      return (
                        <tr key={i}>
                          <td><select className="select" style={{ width: 110 }} value={it.sku} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, sku: e.target.value } : x))}>{skus.map((s) => <option key={s.sku} value={s.sku}>{s.sku}</option>)}</select></td>
                          <td>{sku?.name}</td>
                          <td className="num"><input className="input" type="number" style={{ width: 70, textAlign: "right" }} value={it.qty} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, qty: +e.target.value } : x))} /></td>
                          <td className="num">{naira(sku?.price || 0)}</td>
                          <td className="num">{naira((sku?.price || 0) * it.qty)}</td>
                          <td><button className="btn ghost sm icon-only" onClick={() => setItems(items.filter((_, j) => j !== i))}><Icons.X size={12} /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button className="btn sm" onClick={() => setItems([...items, { sku: "EGG-M", qty: 20 }])}><Icons.Plus size={12} /> Add line</button>
              <div className="row" style={{ justifyContent: "flex-end", padding: "10px 12px", background: "var(--accent-soft)", borderRadius: 8 }}>
                <span style={{ fontWeight: 500 }}>Subtotal</span>
                <span className="spacer"></span>
                <span className="mono" style={{ fontWeight: 600, fontSize: 17 }}>{naira(total)}</span>
              </div>
            </>
          )}
          {step === 2 && (
            <div className="stack-3">
              <div className="banner success">
                <div className="icon-dot success"><Icons.Check size={12} /></div>
                <div>Order ready to save.</div>
              </div>
              {[
                { k: "Customer",      v: customer },
                { k: "Channel",       v: channel },
                { k: "Delivery date", v: deliveryDate },
                { k: "Payment",       v: paymentTerms },
                { k: "Items",         v: `${items.length} line(s)` },
                { k: "Total",         v: naira(total), hi: true },
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
          {step > 1 && <button className="btn" onClick={() => setStep(1)} disabled={saving}>Back</button>}
          {step < 2
            ? <button className="btn primary" onClick={() => setStep(2)}>Review order</button>
            : <button className="btn accent" onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : <><Icons.Check size={14} /> Create order</>}
              </button>}
        </div>
      </div>
    </div>
  );
}

function channelIcon(channel: string) {
  if (channel === "WhatsApp") return <Icons.WhatsApp size={11} className="whatsapp-icon" />;
  if (channel === "Cooperative") return <Icons.People size={11} />;
  if (channel === "Wholesale") return <Icons.Batches size={11} />;
  if (channel === "Retail B2B") return <Icons.Cart size={11} />;
  return null;
}

// Normalise DB order to display shape
function toDisplayOrder(o: import("@/lib/supabase/types").Order): Order {
  return {
    id: o.id,
    date: new Date(o.order_date),
    customer: o.customer,
    channel: o.channel ?? "—",
    items: o.items ?? "—",
    subtotal: o.subtotal,
    status: o.status as Order["status"],
    payment: o.payment as Order["payment"],
    paymentMethod: o.payment_method ?? "",
    coop: o.is_coop,
    phone: o.phone ?? "",
  };
}

export default function SalesScreen() {
  const { org } = useOrg();
  const { orders: dbOrders, isLoading, refresh } = useOrders();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [, startTransition] = useTransition();

  // Use real DB orders or mock fallback
  const orders: Order[] = dbOrders.length > 0
    ? dbOrders.map((o) => {
        // if it's already a MockOrder shape (from mock fallback), return as-is
        if ("date" in o) return o as unknown as Order;
        return toDisplayOrder(o as unknown as import("@/lib/supabase/types").Order);
      })
    : ORDERS;

  const filtered = orders.filter((o) => {
    if (filter === "pending" && o.status !== "pending") return false;
    if (filter === "whatsapp" && o.channel !== "WhatsApp") return false;
    if (filter === "coop" && !o.coop) return false;
    if (filter === "unpaid" && o.payment === "paid") return false;
    if (search) {
      const s = search.toLowerCase();
      return o.id.toLowerCase().includes(s) || o.customer.toLowerCase().includes(s);
    }
    return true;
  });

  const total = orders.reduce((s, o) => s + o.subtotal, 0);
  const unpaidAmt = orders.filter((o) => o.payment !== "paid").reduce((s, o) => s + o.subtotal, 0);
  const whatsAppCount = orders.filter((o) => o.channel === "WhatsApp").length;
  const coopCount = orders.filter((o) => o.coop).length;
  const openCount = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;

  const statusBadge = (s: string) => s === "delivered" ? "success" : s === "out_for_delivery" ? "info" : s === "confirmed" ? "accent" : "outline";
  const paymentBadge = (p: string) => p === "paid" ? "success" : p === "invoiced" ? "info" : "warning";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales & orders</h1>
          <div className="page-sub">
            {isLoading ? "Loading…" : `${orders.length} orders · ${naira(total)} gross · ${coopCount} via cooperative`}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Download size={14} /> Export</button>
          <button className="btn"><Icons.WhatsApp size={14} className="whatsapp-icon" /> Inbox <span className="badge danger" style={{ fontSize: 10.5, padding: "0 5px", marginLeft: 4 }}>4</span></button>
          <button className="btn accent" onClick={() => setShowCreate(true)}><Icons.Plus size={14} /> New order</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <SalesKPI label="Revenue · this week" value={naira(total)} trend="+18% WoW" trendDir="up" />
        <SalesKPI label="Open orders" value={openCount} hint={`${orders.filter((o) => o.status === "pending").length} pending`} />
        <SalesKPI label="Outstanding" value={naira(unpaidAmt)} hint="unpaid invoices" tone="warning" />
        <SalesKPI label="WhatsApp orders" value={`${whatsAppCount} / ${orders.length}`} hint={`${orders.length ? Math.round(whatsAppCount / orders.length * 100) : 0}% of total`} />
      </div>

      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <Icons.Search size={14} />
          <input placeholder="Search orders, customers…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="btn-group">
          {["all", "pending", "unpaid", "whatsapp", "coop"].map((k) => (
            <button key={k} className={filter === k ? "active" : ""} onClick={() => setFilter(k)}>{k}</button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th><th>Customer</th><th>Channel</th><th>Items</th>
              <th className="num">Amount</th><th>Payment</th><th>Status</th><th>Date</th><th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 24, color: "var(--fg-muted)" }}>Loading orders…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 24, color: "var(--fg-muted)" }}>No orders found</td></tr>
            ) : filtered.map((o) => (
              <tr key={o.id}>
                <td className="id-cell">
                  <span className="row-link">{o.id}</span>
                  {o.coop && <div><span className="badge accent" style={{ fontSize: 10 }}>Co-op</span></div>}
                </td>
                <td>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{o.customer}</div>
                  <div className="faint mono" style={{ fontSize: 11 }}>{o.phone}</div>
                </td>
                <td><span className="badge outline" style={{ fontSize: 11 }}>{channelIcon(o.channel)} {o.channel}</span></td>
                <td className="muted" style={{ fontSize: 12.5 }}>{o.items}</td>
                <td className="num">{naira(o.subtotal)}</td>
                <td><span className={`badge ${paymentBadge(o.payment)}`}>{o.payment}</span></td>
                <td><span className={`badge ${statusBadge(o.status)}`}><span className="dot"></span> {o.status.replace(/_/g, " ")}</span></td>
                <td className="id-cell">{o.date.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                <td>
                  <div className="row" style={{ gap: 4 }}>
                    <button className="btn sm ghost icon-only" title="WhatsApp"><Icons.WhatsApp size={13} className="whatsapp-icon" /></button>
                    <button className="btn ghost sm icon-only"><Icons.More size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          orgId={org?.id ?? null}
          onSuccess={() => startTransition(() => refresh())}
        />
      )}
    </div>
  );
}
