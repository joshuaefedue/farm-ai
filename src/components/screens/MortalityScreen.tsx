"use client";
import { Icons } from "@/components/icons";

export default function MortalityScreen() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mortality</h1>
          <div className="page-sub">Last 30 days · 261 birds lost · 1.29% farm-wide</div>
        </div>
        <div className="page-actions">
          <button className="btn accent"><Icons.Plus size={14} /> Log mortality</button>
        </div>
      </div>
      <div className="empty">
        <Icons.Mortality size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
        <div style={{ fontWeight: 500, color: "var(--fg)", marginBottom: 4 }}>Drill into mortality from each batch</div>
        <div>Per-batch mortality logs are richer — open a batch to see cause analysis, photo evidence, and vet correlation.</div>
      </div>
    </div>
  );
}
