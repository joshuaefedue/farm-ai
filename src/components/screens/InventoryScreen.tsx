"use client";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { TODAY } from "@/lib/data";
import { naira } from "@/lib/utils";

const D = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

const ITEMS = [
  { sku: "FD-001", barcode: "6009-871-0021", name: "Layer Mash 18%", cat: "Feed", stock: 1.8, unit: "t", reorderAt: 4, value: 820800, location: "Store A · Bay 1", expiry: D("2026-08-20"), supplier: "Olam Premier" },
  { sku: "FD-002", barcode: "6009-871-0038", name: "Broiler Starter 22%", cat: "Feed", stock: 6.4, unit: "t", reorderAt: 3, value: 3379200, location: "Store A · Bay 2", expiry: D("2026-07-12"), supplier: "Amo Byng" },
  { sku: "FD-003", barcode: "6009-871-0045", name: "Broiler Grower 20%", cat: "Feed", stock: 4.1, unit: "t", reorderAt: 3, value: 2033600, location: "Store A · Bay 3", expiry: D("2026-07-08"), supplier: "Amo Byng" },
  { sku: "FD-004", barcode: "6009-871-0052", name: "Broiler Finisher 18%", cat: "Feed", stock: 2.2, unit: "t", reorderAt: 3, value: 1038400, location: "Store A · Bay 4", expiry: D("2026-07-08"), supplier: "Olam Premier" },
  { sku: "FD-005", barcode: "6009-871-0069", name: "Chick Mash", cat: "Feed", stock: 0.9, unit: "t", reorderAt: 1, value: 460800, location: "Store A · Bay 5", expiry: D("2026-06-22"), supplier: "Top Feeds" },
  { sku: "VX-101", barcode: "6009-872-1014", name: "Newcastle Lasota", cat: "Vaccine", stock: 24, unit: "vials", reorderAt: 10, value: 144000, location: "Cold room · Shelf 2", expiry: D("2026-11-05"), supplier: "Animal Care" },
  { sku: "VX-102", barcode: "6009-872-1021", name: "Gumboro IBDmax", cat: "Vaccine", stock: 8, unit: "vials", reorderAt: 12, value: 64000, location: "Cold room · Shelf 2", expiry: D("2026-09-18"), supplier: "Animal Care" },
  { sku: "VX-103", barcode: "6009-872-1038", name: "Marek HVT", cat: "Vaccine", stock: 0, unit: "vials", reorderAt: 6, value: 0, location: "Cold room · Shelf 1", expiry: null, supplier: "Zoetis" },
  { sku: "VX-104", barcode: "6009-872-1045", name: "Fowl pox FP-LT", cat: "Vaccine", stock: 12, unit: "vials", reorderAt: 6, value: 60000, location: "Cold room · Shelf 1", expiry: D("2027-01-22"), supplier: "Zoetis" },
  { sku: "VX-105", barcode: "6009-872-1052", name: "ILT live", cat: "Vaccine", stock: 4, unit: "vials", reorderAt: 4, value: 32000, location: "Cold room · Shelf 3", expiry: D("2026-06-08"), supplier: "Animal Care" },
  { sku: "MD-201", barcode: "6009-873-2015", name: "Sulfa drug (Embazin)", cat: "Medicine", stock: 18, unit: "sachets", reorderAt: 10, value: 54000, location: "Pharmacy · Shelf A", expiry: D("2026-12-30"), supplier: "Vet Plus" },
  { sku: "MD-202", barcode: "6009-873-2022", name: "Vitamin premix", cat: "Medicine", stock: 32, unit: "sachets", reorderAt: 15, value: 48000, location: "Pharmacy · Shelf A", expiry: D("2027-03-04"), supplier: "Vet Plus" },
  { sku: "MD-203", barcode: "6009-873-2039", name: "Coccidiostat", cat: "Medicine", stock: 6, unit: "sachets", reorderAt: 8, value: 21000, location: "Pharmacy · Shelf B", expiry: D("2026-09-12"), supplier: "Vet Plus" },
  { sku: "CN-301", barcode: "6009-874-3018", name: "Egg crates (30-egg)", cat: "Consumables", stock: 1840, unit: "pcs", reorderAt: 500, value: 184000, location: "Pack room", expiry: null, supplier: "Eko Plastics" },
  { sku: "CN-302", barcode: "6009-874-3025", name: "Disinfectant (Virkon S)", cat: "Consumables", stock: 14, unit: "kg", reorderAt: 10, value: 98000, location: "Store B", expiry: D("2028-05-01"), supplier: "Vet Plus" },
  { sku: "CN-303", barcode: "6009-874-3032", name: "Wood shavings (bedding)", cat: "Consumables", stock: 32, unit: "bags", reorderAt: 20, value: 96000, location: "Yard", expiry: null, supplier: "Local · Sawmill Ote" },
  { sku: "EQ-401", barcode: "6009-875-4011", name: "Drinker (auto)", cat: "Equipment", stock: 22, unit: "pcs", reorderAt: 6, value: 264000, location: "Workshop", expiry: null, supplier: "Big Dutchman" },
  { sku: "EQ-402", barcode: "6009-875-4028", name: "Feeder pan", cat: "Equipment", stock: 38, unit: "pcs", reorderAt: 10, value: 152000, location: "Workshop", expiry: null, supplier: "Big Dutchman" },
  { sku: "EQ-403", barcode: "6009-875-4035", name: "Brooder heater (gas)", cat: "Equipment", stock: 4, unit: "pcs", reorderAt: 2, value: 320000, location: "Workshop", expiry: null, supplier: "Big Dutchman" },
];

function ReceiveStockModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ flex: 1 }}>Receive stock</h3>
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-row"><label>Supplier</label><select className="select"><option>Olam Premier Feeds</option><option>Amo Byng</option><option>Animal Care Services</option><option>Vet Plus</option></select></div>
            <div className="form-row"><label>Linked PO</label><select className="select"><option>PO-2026-082 · ₦1,840,000</option><option>None (walk-in)</option></select></div>
            <div className="form-row"><label>Waybill number</label><input className="input" defaultValue="WB-OLAM-04221" /></div>
            <div className="form-row"><label>Received by</label><select className="select"><option>Bashir M. · Inventory officer</option></select></div>
          </div>
          <div className="banner">
            <div className="icon-dot"><Icons.Info size={12} /></div>
            <div style={{ flex: 1, fontSize: 12.5 }}>Scan a QR / barcode on each pallet to auto-fill rows — or add items manually below.</div>
            <button className="btn sm">Start scanner</button>
          </div>
          <div className="table-wrap" style={{ marginTop: 4 }}>
            <table className="table">
              <thead><tr><th>SKU</th><th>Item</th><th className="num">Qty</th><th>Unit</th><th>Lot / batch</th><th>Expiry</th><th></th></tr></thead>
              <tbody>
                <tr>
                  <td className="id-cell">FD-001</td><td>Layer Mash 18%</td><td className="num">5</td><td>t</td><td className="id-cell">OL-0426-A</td><td>20 Aug 2026</td>
                  <td><button className="btn ghost sm icon-only"><Icons.X size={12} /></button></td>
                </tr>
                <tr>
                  <td className="id-cell">FD-005</td><td>Chick Mash</td><td className="num">2</td><td>t</td><td className="id-cell">OL-0426-B</td><td>22 Jun 2026</td>
                  <td><button className="btn ghost sm icon-only"><Icons.X size={12} /></button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="btn sm"><Icons.Plus size={12} /> Add line</button>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn accent" onClick={onClose}><Icons.Check size={14} /> Confirm receipt</button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryScreen() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showReceive, setShowReceive] = useState(false);

  const filtered = ITEMS.filter((i) => {
    if (tab !== "all" && i.cat.toLowerCase() !== tab) return false;
    if (search) {
      const s = search.toLowerCase();
      return i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s) || i.barcode.includes(s);
    }
    return true;
  });

  const totalValue = ITEMS.reduce((s, i) => s + i.value, 0);
  const lowStock = ITEMS.filter((i) => i.stock > 0 && i.stock < i.reorderAt).length;
  const outOfStock = ITEMS.filter((i) => i.stock === 0).length;
  const expiringSoon = ITEMS.filter((i) => i.expiry && (i.expiry.getTime() - TODAY.getTime()) < 30 * 86400000).length;

  const catBadge = (cat: string) => cat === "Feed" ? "accent" : cat === "Vaccine" ? "info" : cat === "Medicine" ? "warning" : "outline";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <div className="page-sub">{ITEMS.length} SKUs across 4 categories · {naira(totalValue)} on hand</div>
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
          { label: "Low stock", value: lowStock, hint: `${lowStock} SKUs below reorder`, tone: "warning" },
          { label: "Out of stock", value: outOfStock, hint: "Marek HVT · 1 SKU", tone: "danger" },
          { label: "Expiring < 30d", value: expiringSoon, hint: "ILT live · Chick Mash", tone: "warning" },
        ].map((k) => (
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value tnum" style={{ color: k.tone === "warning" ? "var(--warning-soft-fg)" : k.tone === "danger" ? "var(--danger-soft-fg)" : "var(--fg)" }}>{k.value}</div>
            <div className="row" style={{ gap: 6 }}>
              {k.trend && <div className={`kpi-trend ${k.trendDir}`}><Icons.TrendUp size={11} />{k.trend}</div>}
              {k.hint && <span className="muted" style={{ fontSize: 11.5 }}>{k.hint}</span>}
            </div>
          </div>
        ))}
      </div>

      {(outOfStock + lowStock + expiringSoon) > 0 && (
        <div className="banner warning" style={{ marginBottom: 12 }}>
          <div className="icon-dot warning"><Icons.Alert size={12} /></div>
          <div style={{ flex: 1 }}>
            <strong>{outOfStock + lowStock} items need action.</strong> Acre has drafted a purchase requisition for ₦1.24M — review in Procurement.
          </div>
          <button className="btn sm">Review draft PR</button>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <Icons.Search size={14} />
          <input placeholder="Search SKU, name, barcode…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
            {filtered.map((it) => {
              const pct = Math.min(100, (it.stock / (it.reorderAt * 3)) * 100);
              const expDays = it.expiry ? Math.round((it.expiry.getTime() - TODAY.getTime()) / 86400000) : null;
              return (
                <tr key={it.sku}>
                  <td className="id-cell">
                    <div>{it.sku}</div>
                    <div className="faint" style={{ fontSize: 10.5 }}>{it.barcode}</div>
                  </td>
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
                        {it.expiry.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit" })} · <span className="mono">{expDays}d</span>
                      </span>
                    ) : <span className="faint">—</span>}
                  </td>
                  <td className="num" style={{ fontVariantNumeric: "tabular-nums" }}>{naira(it.value)}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <button className="btn sm">Adjust</button>
                      <button className="btn ghost sm icon-only"><Icons.More size={12} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showReceive && <ReceiveStockModal onClose={() => setShowReceive(false)} />}
    </div>
  );
}
