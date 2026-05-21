"use client";
import { Icons } from "@/components/icons";
import { BATCHES, HOUSES } from "@/lib/data";
import { num } from "@/lib/utils";

export default function HousesScreen() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Houses</h1>
          <div className="page-sub">6 poultry houses · 30,200-bird total capacity · 5 occupied</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Plus size={14} /> Add house</button>
        </div>
      </div>
      <div className="grid-3">
        {HOUSES.map((h) => {
          const batch = BATCHES.find((b) => b.id === h.batch);
          const occ = batch ? batch.currentCount / h.capacity : 0;
          return (
            <div key={h.id} className="card" style={{ padding: 16 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <div className="row" style={{ gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-sunken)", display: "grid", placeItems: "center" }}>
                    <Icons.House size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{h.id}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>{h.type} · cap. {h.capacity.toLocaleString()}</div>
                  </div>
                </div>
                <span className={`badge ${batch ? "success" : "outline"}`}>
                  {batch ? "Occupied" : "Empty"}
                </span>
              </div>
              {batch ? (
                <>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>{batch.breed}</div>
                  <div className="row" style={{ justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span className="muted">Birds</span>
                    <span className="mono">{num(batch.currentCount)} / {num(h.capacity)}</span>
                  </div>
                  <div className="bar"><span style={{ width: `${occ * 100}%` }}></span></div>
                  <div className="row" style={{ justifyContent: "space-between", fontSize: 11.5, marginTop: 6, color: "var(--fg-muted)" }}>
                    <span>{(occ * 100).toFixed(0)}% occupied</span>
                    <span className="mono">{batch.id}</span>
                  </div>
                </>
              ) : (
                <div className="empty" style={{ padding: 14 }}>Ready for new batch</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
