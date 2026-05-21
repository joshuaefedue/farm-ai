"use client";
import { Icons } from "@/components/icons";

export default function EggsScreen() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Egg production</h1>
          <div className="page-sub">Today: 10,840 eggs · 361 crates · 87.2% farm-wide lay rate</div>
        </div>
        <div className="page-actions">
          <button className="btn accent"><Icons.Plus size={14} /> Log collection</button>
        </div>
      </div>
      <div className="empty">
        <Icons.Egg size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
        <div style={{ fontWeight: 500, color: "var(--fg)", marginBottom: 4 }}>Per-batch egg collection</div>
        <div>
          Egg collection happens per layer batch — open{" "}
          <span className="mono">PB-2026-014</span>,{" "}
          <span className="mono">PB-2026-012</span> or{" "}
          <span className="mono">PB-2026-010</span> to log.
        </div>
      </div>
    </div>
  );
}
