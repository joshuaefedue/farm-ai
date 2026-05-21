"use client";
import { useState, useTransition } from "react";
import { Icons } from "@/components/icons";
import { TODAY } from "@/lib/data";
import { naira } from "@/lib/utils";
import { useInventory } from "@/hooks/useInventory";
import { useOrg } from "@/contexts/OrgContext";
import { createInventoryItem, adjustStock } from "@/app/actions/inventory";
import type { InventoryItem } from "@/hooks/useInventory";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

const D = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

// Normalised display shape used by table rows
interface DisplayItem {
  id: string;
  sku: string;
  name: string;
  cat: string;
  stock: number;
  unit: string;
  reorderAt: number;
  value: number;
  location: string;
  expiry: Date | null;
  supplier: string;
}

function fromDB(item: InventoryItem): DisplayItem {
  return {
    id: item.id,
    sku: item.id.slice(0, 8).toUpperCase(),
    name: item.name,
    cat: item.category ?? "Other",
    stock: Number(item.quantity),
    unit: item.unit ?? "units",
    reorderAt: Number(item.reorder_level ?? 0),
    value: Number(item.quantity) * Number(item.unit_cost ?? 0),
    location: item.location ?? "—",
    expiry: item.expiry_date ? D(item.expiry_date) : null,
    supplier: item.supplier ?? "—",
  };
}

// Static mock items — shown when Supabase is not configured
const STATIC_ITEMS: DisplayItem[] = [
  { id: "FD-001", sku: "FD-001", name: "Layer Mash 18%",        cat: "Feed",        stock: 1.8,  unit: "t",      reorderAt: 4,   value: 820800,   location: "Store A · Bay 1",   expiry: D("2026-08-20"), supplier: "Olam Premier" },
  { id: "FD-002", sku: "FD-002", name: "Broiler Starter 22%",   cat: "Feed",        stock: 6.4,  unit: "t",      reorderAt: 3,   value: 3379200,  location: "Store A · Bay 2",   expiry: D("2026-07-12"), supplier: "Amo Byng" },
  { id: "FD-003", sku: "FD-003", name: "Broiler Grower 20%",    cat: "Feed",        stock: 4.1,  unit: "t",      reorderAt: 3,   value: 2033600,  location: "Store A · Bay 3",   expiry: D("2026-07-08"), supplier: "Amo Byng" },
  { id: "FD-004", sku: "FD-004", name: "Broiler Finisher 18%",  cat: "Feed",        stock: 2.2,  unit: "t",      reorderAt: 3,   value: 1038400,  location: "Store A · Bay 4",   expiry: D("2026-07-08"), supplier: "Olam Premier" },
  { id: "FD-005", sku: "FD-005", name: "Chick Mash",            cat: "Feed",        stock: 0.9,  unit: "t",      reorderAt: 1,   value: 460800,   location: "Store A · Bay 5",   expiry: D("2026-06-22"), supplier: "Top Feeds" },
  { id: "VX-101", sku: "VX-101", name: "Newcastle Lasota",      cat: "Vaccine",     stock: 24,   unit: "vials",  reorderAt: 10,  value: 144000,   location: "Cold room · Shelf 2", expiry: D("2026-11-05"), supplier: "Animal Care" },
  { id: "VX-102", sku: "VX-102", name: "Gumboro IBDmax",        cat: "Vaccine",     stock: 8,    unit: "vials",  reorderAt: 12,  value: 64000,    location: "Cold room · Shelf 2", expiry: D("2026-09-18"), supplier: "Animal Care" },
  { id: "VX-103", sku: "VX-103", name: "Marek HVT",             cat: "Vaccine",     stock: 0,    unit: "vials",  reorderAt: 6,   value: 0,        location: "Cold room · Shelf 1", expiry: null,            supplier: "Zoetis" },
  { id: "VX-104", sku: "VX-104", name: "Fowl pox FP-LT",        cat: "Vaccine",     stock: 12,   unit: "vials",  reorderAt: 6,   value: 60000,    location: "Cold room · Shelf 1", expiry: D("2027-01-22"), supplier: "Zoetis" },
  { id: "VX-105", sku: "VX-105", name: "ILT live",              cat: "Vaccine",     stock: 4,    unit: "vials",  reorderAt: 4,   value: 32000,    location: "Cold room · Shelf 3", expiry: D("2026-06-08"), supplier: "Animal Care" },
  { id: "MD-201", sku: "MD-201", name: "Sulfa drug (Embazin)",  cat: "Medicine",    stock: 18,   unit: "sachets", reorderAt: 10, value: 54000,    location: "Pharmacy · Shelf A",  expiry: D("2026-12-30"), supplier: "Vet Plus" },
  { id: "MD-202", sku: "MD-202", name: "Vitamin premix",        cat: "Medicine",    stock: 32,   unit: "sachets", reorderAt: 15, value: 48000,    location: "Pharmacy · Shelf A",  expiry: D("2027-03-04"), supplier: "Vet Plus" },
  { id: "MD-203", sku: "MD-203", name: "Coccidiostat",          cat: "Medicine",    stock: 6,    unit: "sachets", reorderAt: 8,  value: 21000,    location: "Pharmacy · Shelf B",  expiry: D("2026-09-12"), supplier: "Vet Plus" },
  { id: "CN-301", sku: "CN-301", name: "Egg crates (30-egg)",   cat: "Consumables", stock: 1840, unit: "pcs",    reorderAt: 500, value: 184000,   location: "Pack room",           expiry: null,            supplier: "Eko Plastics" },
  { id: "CN-302", sku: "CN-302", name: "Disinfectant (Virkon S)", cat: "Consumables", stock: 14, unit: "kg",     reorderAt: 10,  value: 98000,    location: "Store B",             expiry: D("2028-05-01"), supplier: "Vet Plus" },
  { id: "CN-303", sku: "CN-303", name: "Wood shavings (bedding)", cat: "Consumables", stock: 32, unit: "bags",   reorderAt: 20,  value: 96000,    location: "Yard",                expiry: null,            supplier: "Local · Sawmill Ote" },
  { id: "EQ-401", sku: "EQ-401", name: "Drinker (auto)",        cat: "Equipment",   stock: 22,   unit: "pcs",    reorderAt: 6,   value: 264000,   location: "Workshop",            expiry: null,            supplier: "Big Dutchman" },
  { id: "EQ-402", sku: "EQ-402", name: "Feeder pan",            cat: "Equipment",   stock: 38,   unit: "pcs",    reorderAt: 10,  value: 152000,   location: "Workshop",            expiry: null,            supplier: "Big Dutchman" },
  { id: "EQ-403", sku: "EQ-403", name: "Brooder heater (gas)", cat: "Equipment",   stock: 4,    unit: "pcs",    reorderAt: 2,   value: 320000,   location: "Workshop",            expiry: null,            supplier: "Big Dutchman" },
];

// ── ReceiveStockModal ─────────────────────────────────────────────────────────
function ReceiveStockModal({
  orgId,
  items,
  onClose,
  onSuccess,
}: {
  orgId: string;
  items: DisplayItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"restock" | "new">("restock");

  // Restock mode: lines of (itemId, qty to add)
  const [lines, setLines] = useState<{ itemId: string; qty: number }[]>([{ itemId: "", qty: 0 }]);

  // New item mode
  const [form, setForm] = useState({
    name: "", category: "Feed", unit: "kg",
    quantity: 0, reorder_level: 0, unit_cost: 0,
    supplier: "", location: "", expiry_date: "",
  });

  function handleRestock() {
    const valid = lines.filter((l) => l.itemId && l.qty > 0);
    if (!valid.length) { setError("Add at least one item with a quantity"); return; }
    startTransition(async () => {
      for (const line of valid) {
        const res = await adjustStock(line.itemId, orgId, line.qty);
        if (!res.success) { setError(res.error ?? "Failed to adjust stock"); return; }
      }
      onSuccess();
      onClose();
    });
  }

  function handleCreate() {
    if (!form.name.trim()) { setError("Item name is required"); return; }
    startTransition(async () => {
      const res = await createInventoryItem({
        org_id: orgId,
        name: form.name,
        category: form.category || undefined,
        unit: form.unit || undefined,
        quantity: form.quantity,
        reorder_level: form.reorder_level || undefined,
        unit_cost: form.unit_cost || undefined,
        supplier: form.supplier || undefined,
        location: form.location || undefined,
        expiry_date: form.expiry_date || undefined,
      });
      if (!res.success) { setError(res.error ?? "Failed to create item"); return; }
      onSuccess();
      onClose();
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ flex: 1 }}>Receive stock</h3>
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="btn-group" style={{ marginBottom: 16 }}>
            <button className={mode === "restock" ? "active" : ""} onClick={() => setMode("restock")}>Restock existing</button>
            <button className={mode === "new" ? "active" : ""} onClick={() => setMode("new")}>Add new item</button>
          </div>

          {mode === "restock" && (
            <>
              <div className="table-wrap" style={{ marginTop: 4 }}>
                <table className="table">
                  <thead><tr><th>Item</th><th className="num">Qty to add</th><th></th></tr></thead>
                  <tbody>
                    {lines.map((line, idx) => (
                      <tr key={idx}>
                        <td>
                          <select
                            className="select"
                            value={line.itemId}
                            onChange={(e) => setLines(lines.map((l, i) => i === idx ? { ...l, itemId: e.target.value } : l))}
                          >
                            <option value="">— select item —</option>
                            {items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.stock} {item.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="num">
                          <input
                            className="input"
                            type="number"
                            min={1}
                            value={line.qty || ""}
                            onChange={(e) => setLines(lines.map((l, i) => i === idx ? { ...l, qty: Number(e.target.value) } : l))}
                            style={{ width: 80, textAlign: "right" }}
                          />
                        </td>
                        <td>
                          <button className="btn ghost sm icon-only" onClick={() => setLines(lines.filter((_, i) => i !== idx))}>
                            <Icons.X size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn sm" style={{ marginTop: 8 }} onClick={() => setLines([...lines, { itemId: "", qty: 0 }])}>
                <Icons.Plus size={12} /> Add line
              </button>
            </>
          )}

          {mode === "new" && (
            <div className="form-grid">
              <div className="form-row" style={{ gridColumn: "span 2" }}>
                <label>Item Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Layer Mash 18%" />
              </div>
              <div className="form-row">
                <label>Category</label>
                <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Feed</option><option>Vaccine</option><option>Medicine</option><option>Consumables</option><option>Equipment</option>
                </select>
              </div>
              <div className="form-row">
                <label>Unit</label>
                <input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, vials, pcs…" />
              </div>
              <div className="form-row">
                <label>Initial Quantity</label>
                <input className="input" type="number" min={0} value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              </div>
              <div className="form-row">
                <label>Reorder Level</label>
                <input className="input" type="number" min={0} value={form.reorder_level || ""} onChange={(e) => setForm({ ...form, reorder_level: Number(e.target.value) })} />
              </div>
              <div className="form-row">
                <label>Unit Cost (₦)</label>
                <input className="input" type="number" min={0} value={form.unit_cost || ""} onChange={(e) => setForm({ ...form, unit_cost: Number(e.target.value) })} />
              </div>
              <div className="form-row">
                <label>Supplier</label>
                <input className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Storage Location</label>
                <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Store A · Bay 1" />
              </div>
              <div className="form-row">
                <label>Expiry Date</label>
                <input className="input" type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
              </div>
            </div>
          )}

          {error && (
            <div className="banner danger" style={{ marginTop: 12 }}>
              <div className="icon-dot danger"><Icons.Alert size={12} /></div>
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose} disabled={isPending}>Cancel</button>
          <button
            className="btn accent"
            onClick={mode === "restock" ? handleRestock : handleCreate}
            disabled={isPending}
          >
            {isPending ? "Saving…" : <><Icons.Check size={14} /> Confirm receipt</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AdjustStockModal ──────────────────────────────────────────────────────────
function AdjustStockModal({
  item,
  orgId,
  onClose,
  onSuccess,
}: {
  item: DisplayItem;
  orgId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [delta, setDelta] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  function handleAdjust() {
    if (delta === 0) { setError("Enter a non-zero adjustment"); return; }
    startTransition(async () => {
      const res = await adjustStock(item.id, orgId, delta);
      if (!res.success) { setError(res.error ?? "Failed to adjust stock"); return; }
      onSuccess();
      onClose();
    });
  }

  const newQty = Math.max(0, item.stock + delta);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="icon-dot"><Icons.Inventory size={14} /></div>
          <div>
            <h3>Adjust Stock</h3>
            <div className="sub">{item.name}</div>
          </div>
          <div className="spacer" />
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="banner" style={{ marginBottom: 12 }}>
            <div className="icon-dot"><Icons.Info size={12} /></div>
            <span style={{ fontSize: 12 }}>Current stock: <strong>{item.stock} {item.unit}</strong> · Location: {item.location}</span>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label>Adjustment (negative to reduce)</label>
              <input
                className="input"
                type="number"
                value={delta || ""}
                onChange={(e) => { setDelta(Number(e.target.value)); setError(null); }}
                placeholder="+10 to add, -5 to remove"
                autoFocus
              />
            </div>
          </div>
          {delta !== 0 && (
            <div className={`banner ${delta < 0 && newQty === 0 ? "warning" : ""}`} style={{ marginTop: 8 }}>
              <div className="icon-dot"><Icons.Info size={12} /></div>
              <span style={{ fontSize: 12 }}>New quantity will be: <strong>{newQty} {item.unit}</strong></span>
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
          <button className="btn accent" onClick={handleAdjust} disabled={isPending}>
            {isPending ? "Saving…" : <><Icons.Check size={14} /> Apply</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── InventoryScreen ───────────────────────────────────────────────────────────
export default function InventoryScreen() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showReceive, setShowReceive] = useState(false);
  const [adjustItem, setAdjustItem] = useState<DisplayItem | null>(null);
  const [, startTransition] = useTransition();

  const { org } = useOrg();
  const { items: dbItems, isLoading, refresh } = useInventory();

  const ITEMS: DisplayItem[] = SUPABASE_CONFIGURED ? dbItems.map(fromDB) : STATIC_ITEMS;

  const filtered = ITEMS.filter((i) => {
    if (tab !== "all" && i.cat.toLowerCase() !== tab) return false;
    if (search) {
      const s = search.toLowerCase();
      return i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s);
    }
    return true;
  });

  const totalValue = ITEMS.reduce((s, i) => s + i.value, 0);
  const lowStock = ITEMS.filter((i) => i.stock > 0 && i.stock < i.reorderAt).length;
  const outOfStock = ITEMS.filter((i) => i.stock === 0).length;
  const expiringSoon = ITEMS.filter((i) => i.expiry && (i.expiry.getTime() - TODAY.getTime()) < 30 * 86400000).length;

  const catBadge = (cat: string) =>
    cat === "Feed" ? "accent" : cat === "Vaccine" ? "info" : cat === "Medicine" ? "warning" : "outline";

  if (isLoading) {
    return <div className="page"><div className="empty">Loading inventory…</div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <div className="page-sub">{ITEMS.length} SKUs · {naira(totalValue)} on hand</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Search size={14} /> Scan QR</button>
          <button className="btn"><Icons.Download size={14} /> Export</button>
          <button className="btn accent" onClick={() => setShowReceive(true)}><Icons.Plus size={14} /> Receive stock</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {[
          { label: "On-hand value", value: naira(totalValue), trend: "+₦340k vs last week", trendDir: "up" },
          { label: "Low stock",     value: lowStock,    hint: `${lowStock} SKUs below reorder`, tone: lowStock > 0 ? "warning" : undefined },
          { label: "Out of stock",  value: outOfStock,  hint: outOfStock > 0 ? `${outOfStock} SKU${outOfStock > 1 ? "s" : ""}` : "None", tone: outOfStock > 0 ? "danger" : undefined },
          { label: "Expiring < 30d", value: expiringSoon, hint: expiringSoon > 0 ? `${expiringSoon} item${expiringSoon > 1 ? "s" : ""}` : "None", tone: expiringSoon > 0 ? "warning" : undefined },
        ].map((k) => (
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value tnum" style={{
              color: k.tone === "warning" ? "var(--warning-soft-fg)" : k.tone === "danger" ? "var(--danger-soft-fg)" : "var(--fg)",
            }}>{k.value}</div>
            <div className="row" style={{ gap: 6 }}>
              {"trend" in k && k.trend && <div className={`kpi-trend ${k.trendDir}`}><Icons.TrendUp size={11} />{k.trend}</div>}
              {k.hint && <span className="muted" style={{ fontSize: 11.5 }}>{k.hint}</span>}
            </div>
          </div>
        ))}
      </div>

      {(outOfStock + lowStock + expiringSoon) > 0 && (
        <div className="banner warning" style={{ marginBottom: 12 }}>
          <div className="icon-dot warning"><Icons.Alert size={12} /></div>
          <div style={{ flex: 1 }}>
            <strong>{outOfStock + lowStock} items need action.</strong>{" "}
            {outOfStock > 0 ? `${outOfStock} out of stock · ` : ""}
            {lowStock > 0 ? `${lowStock} below reorder level.` : ""}
          </div>
          <button className="btn sm" onClick={() => setShowReceive(true)}>Receive stock</button>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <Icons.Search size={14} />
          <input placeholder="Search name, SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="btn-group">
          {["all", "feed", "vaccine", "medicine", "consumables", "equipment"].map((t) => (
            <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>{filtered.length} of {ITEMS.length}</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th><th>Item</th><th>Category</th><th>Location</th>
              <th className="num">On hand</th><th className="num">Reorder at</th>
              <th>Stock level</th><th>Expiry</th><th className="num">Value</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <div className="empty" style={{ padding: "32px 16px" }}>
                    <Icons.Inventory size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <div style={{ fontWeight: 500 }}>No inventory items yet</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      {search ? "No items match your search" : "Start by adding your first item"}
                    </div>
                    {!search && (
                      <button className="btn accent sm" style={{ marginTop: 12 }} onClick={() => setShowReceive(true)}>
                        <Icons.Plus size={12} /> Add first item
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : filtered.map((it) => {
              const pct = it.reorderAt > 0 ? Math.min(100, (it.stock / (it.reorderAt * 3)) * 100) : 100;
              const expDays = it.expiry ? Math.round((it.expiry.getTime() - TODAY.getTime()) / 86400000) : null;
              return (
                <tr key={it.sku}>
                  <td className="id-cell"><div>{it.sku}</div></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{it.name}</div>
                    <div className="faint" style={{ fontSize: 11 }}>{it.supplier}</div>
                  </td>
                  <td><span className={`badge ${catBadge(it.cat)}`}>{it.cat}</span></td>
                  <td className="muted" style={{ fontSize: 12 }}>{it.location}</td>
                  <td className="num">
                    <span className={it.stock === 0 ? "danger-text" : it.stock < it.reorderAt ? "warning-text" : ""}>{it.stock}</span>
                    <span className="faint"> {it.unit}</span>
                  </td>
                  <td className="num faint">{it.reorderAt} {it.unit}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <div className={`bar ${it.stock === 0 ? "danger" : it.stock < it.reorderAt ? "warning" : ""}`} style={{ width: 90 }}>
                        <span style={{ width: `${pct}%` }}></span>
                      </div>
                      <span className={`badge ${it.stock === 0 ? "danger" : it.stock < it.reorderAt ? "warning" : "success"}`} style={{ fontSize: 10 }}>
                        {it.stock === 0 ? "Out" : it.stock < it.reorderAt ? "Low" : "OK"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {it.expiry ? (
                      <span style={{ color: expDays !== null && expDays < 30 ? "var(--warning-soft-fg)" : "var(--fg-muted)", fontSize: 12 }}>
                        {it.expiry.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit" })}
                        {" · "}<span className="mono">{expDays}d</span>
                      </span>
                    ) : <span className="faint">—</span>}
                  </td>
                  <td className="num" style={{ fontVariantNumeric: "tabular-nums" }}>{naira(it.value)}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <button
                        className="btn sm"
                        onClick={() => SUPABASE_CONFIGURED ? setAdjustItem(it) : undefined}
                        disabled={!SUPABASE_CONFIGURED}
                      >
                        Adjust
                      </button>
                      <button className="btn ghost sm icon-only"><Icons.More size={12} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showReceive && (
        <ReceiveStockModal
          orgId={org?.id ?? ""}
          items={ITEMS}
          onClose={() => setShowReceive(false)}
          onSuccess={() => startTransition(() => refresh())}
        />
      )}
      {adjustItem && (
        <AdjustStockModal
          item={adjustItem}
          orgId={org?.id ?? ""}
          onClose={() => setAdjustItem(null)}
          onSuccess={() => { startTransition(() => refresh()); }}
        />
      )}
    </div>
  );
}
