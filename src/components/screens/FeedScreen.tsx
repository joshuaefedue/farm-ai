"use client";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { naira } from "@/lib/utils";
import { useInventory } from "@/hooks/useInventory";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

interface FeedRow {
  id: string;
  name: string;
  stock: number;
  unit: string;
  reorderAt: number;
  unitCost: number;
  supplier: string;
  daysLeft: number | null;
  state: "ok" | "watch" | "low" | "out";
}

// Static mock data for demo mode
const MOCK_FEEDS: FeedRow[] = [
  { id: "FD-001", name: "Layer Mash 18%",       stock: 1800, unit: "kg", reorderAt: 4000, unitCost: 456, supplier: "Olam Premier", daysLeft: 3,  state: "low"   },
  { id: "FD-002", name: "Broiler Starter 22%",  stock: 6400, unit: "kg", reorderAt: 3000, unitCost: 528, supplier: "Amo Byng",     daysLeft: 22, state: "ok"    },
  { id: "FD-003", name: "Broiler Grower 20%",   stock: 4100, unit: "kg", reorderAt: 3000, unitCost: 496, supplier: "Amo Byng",     daysLeft: 14, state: "ok"    },
  { id: "FD-004", name: "Broiler Finisher 18%", stock: 2200, unit: "kg", reorderAt: 3000, unitCost: 472, supplier: "Olam Premier", daysLeft: 8,  state: "watch" },
  { id: "FD-005", name: "Chick Mash",           stock: 900,  unit: "kg", reorderAt: 1000, unitCost: 512, supplier: "Top Feeds",    daysLeft: 6,  state: "watch" },
];

export default function FeedScreen() {
  const { items, isLoading } = useInventory();
  const [search, setSearch] = useState("");

  // Build display rows
  const allFeeds: FeedRow[] = SUPABASE_CONFIGURED
    ? items
        .filter((i) => i.category?.toLowerCase() === "feed")
        .map((i) => {
          const stock = Number(i.quantity);
          const reorderAt = Number(i.reorder_level ?? 0);
          const unitCost = Number(i.unit_cost ?? 0);
          // Rough days-left estimate: assume 400kg/day burn rate for a typical farm
          // In production this would come from actual feed logs
          const dailyEstimate = 400;
          const daysLeft = stock > 0 ? Math.round(stock / dailyEstimate) : 0;
          const state: FeedRow["state"] =
            stock === 0 ? "out" :
            stock < reorderAt ? "low" :
            daysLeft < 14 ? "watch" :
            "ok";
          return {
            id: i.id,
            name: i.name,
            stock,
            unit: i.unit ?? "kg",
            reorderAt,
            unitCost,
            supplier: i.supplier ?? "—",
            daysLeft: stock > 0 ? daysLeft : 0,
            state,
          };
        })
    : MOCK_FEEDS;

  const feeds = allFeeds.filter((f) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = allFeeds.reduce((s, f) => s + f.stock * f.unitCost, 0);
  const lowCount = allFeeds.filter((f) => f.state === "low" || f.state === "out").length;
  const watchCount = allFeeds.filter((f) => f.state === "watch").length;
  const criticalFeed = allFeeds.find((f) => f.state === "low" || f.state === "out");

  if (isLoading) return <div className="page"><div className="empty">Loading feed data…</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feed & water</h1>
          <div className="page-sub">
            {allFeeds.length} feed type{allFeeds.length !== 1 ? "s" : ""} in stock · {naira(totalValue)} on hand
          </div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Truck size={14} /> New delivery</button>
          <button className="btn accent"><Icons.Plus size={14} /> Reorder</button>
        </div>
      </div>

      {criticalFeed && (
        <div className="banner warning" style={{ marginBottom: 12 }}>
          <div className="icon-dot warning"><Icons.Alert size={12} /></div>
          <div style={{ flex: 1 }}>
            <strong>{criticalFeed.name}</strong>{" "}
            {criticalFeed.state === "out" ? "is out of stock." : `will run out in ~${criticalFeed.daysLeft} day${criticalFeed.daysLeft !== 1 ? "s" : ""}.`}{" "}
            {lowCount > 1 ? `${lowCount - 1} other feed${lowCount > 2 ? "s" : ""} also ${lowCount > 2 ? "need" : "needs"} attention.` : ""}
          </div>
          <button className="btn sm">Reorder now</button>
        </div>
      )}

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {[
          { label: "Feed types",  value: allFeeds.length,        hint: "In stock" },
          { label: "Total value", value: naira(totalValue),      hint: "On hand" },
          { label: "Low / Out",   value: lowCount,               hint: `${lowCount} SKU${lowCount !== 1 ? "s" : ""} below reorder`, tone: lowCount > 0 ? "danger" : undefined },
          { label: "Watch",       value: watchCount,             hint: "< 14 days supply", tone: watchCount > 0 ? "warning" : undefined },
        ].map((k) => (
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value tnum" style={{
              color: k.tone === "danger" ? "var(--danger-soft-fg)" : k.tone === "warning" ? "var(--warning-soft-fg)" : "var(--fg)",
            }}>{k.value}</div>
            {k.hint && <span className="muted" style={{ fontSize: 11.5 }}>{k.hint}</span>}
          </div>
        ))}
      </div>

      {allFeeds.length > 0 && (
        <div className="filter-bar" style={{ marginBottom: 12 }}>
          <div className="search-wrap" style={{ flex: 1, maxWidth: 300 }}>
            <Icons.Search size={14} />
            <input placeholder="Search feed type…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      )}

      {feeds.length === 0 && allFeeds.length === 0 ? (
        <div className="empty">
          <Icons.Feed size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
          <div style={{ fontWeight: 500, marginBottom: 4 }}>No feed items in inventory</div>
          <div style={{ fontSize: 13 }}>Add Feed items in Inventory to track stock here</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Feed type</th>
                <th>Supplier</th>
                <th className="num">In stock</th>
                <th className="num">Days left</th>
                <th className="num">Reorder at</th>
                <th className="num">Unit cost</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {feeds.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 500 }}>{f.name}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{f.supplier}</td>
                  <td className="num">
                    <span className={f.state === "out" ? "danger-text" : f.state === "low" ? "warning-text" : ""}>
                      {f.stock.toLocaleString()}
                    </span>
                    <span className="faint"> {f.unit}</span>
                  </td>
                  <td className="num">
                    {f.daysLeft != null ? (
                      <span className={f.daysLeft < 7 ? "danger-text" : f.daysLeft < 14 ? "warning-text" : ""}>
                        {f.daysLeft === 0 ? "Out" : `${f.daysLeft}d`}
                      </span>
                    ) : <span className="faint">—</span>}
                  </td>
                  <td className="num faint">{f.reorderAt > 0 ? `${f.reorderAt.toLocaleString()} ${f.unit}` : "—"}</td>
                  <td className="num" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {f.unitCost > 0 ? `${naira(f.unitCost)} / ${f.unit}` : "—"}
                  </td>
                  <td>
                    <span className={`badge ${f.state === "out" ? "danger" : f.state === "low" ? "danger" : f.state === "watch" ? "warning" : "success"}`}>
                      <span className="dot" />
                      {f.state === "out" ? "Out" : f.state === "low" ? "Low" : f.state === "watch" ? "Watch" : "OK"}
                    </span>
                  </td>
                  <td><button className="btn sm">Reorder</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
