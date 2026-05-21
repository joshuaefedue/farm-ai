"use client";
import { useState, useTransition } from "react";
import { Icons } from "@/components/icons";
import { num } from "@/lib/utils";
import { useHouses } from "@/hooks/useHouses";
import { useBatches } from "@/hooks/useBatches";
import { useOrg } from "@/contexts/OrgContext";
import { createHouse } from "@/app/actions/houses";
import type { House } from "@/lib/supabase/types";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

// ── AddHouseModal ─────────────────────────────────────────────────────────────
function AddHouseModal({
  orgId,
  onClose,
  onSuccess,
}: {
  orgId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "Open-sided · deep litter",
    capacity: "",
  });

  function handleSubmit() {
    if (!form.name.trim()) { setError("House name is required"); return; }
    if (!SUPABASE_CONFIGURED) { onSuccess(); onClose(); return; }
    startTransition(async () => {
      const res = await createHouse({
        org_id: orgId,
        name: form.name.trim(),
        type: form.type || undefined,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
      });
      if (!res.success) { setError(res.error ?? "Failed to create house"); return; }
      onSuccess();
      onClose();
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="icon-dot"><Icons.House size={14} /></div>
          <div>
            <h3>Add house</h3>
            <div className="sub">Register a new poultry house</div>
          </div>
          <div className="spacer" />
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-row" style={{ gridColumn: "span 2" }}>
              <label>House Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(null); }}
                placeholder="e.g. House 7 or Block A"
                autoFocus
              />
            </div>
            <div className="form-row" style={{ gridColumn: "span 2" }}>
              <label>House Type</label>
              <select
                className="select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>Open-sided · deep litter</option>
                <option>Open-sided · raised slatted</option>
                <option>Semi-closed · deep litter</option>
                <option>Closed · tunnel ventilated</option>
                <option>Battery cage system</option>
                <option>Free-range housing</option>
              </select>
            </div>
            <div className="form-row" style={{ gridColumn: "span 2" }}>
              <label>Bird Capacity</label>
              <input
                className="input"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                placeholder="e.g. 5000"
              />
            </div>
          </div>
          {error && (
            <div className="banner danger" style={{ marginTop: 12 }}>
              <div className="icon-dot danger"><Icons.Alert size={12} /></div>
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose} disabled={isPending}>Cancel</button>
          <button className="btn accent" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : <><Icons.Check size={14} /> Add house</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HousesScreen ──────────────────────────────────────────────────────────────
export default function HousesScreen() {
  const [showAdd, setShowAdd] = useState(false);
  const [, startTransition] = useTransition();

  const { org } = useOrg();
  const { houses, isLoading, refresh } = useHouses();
  const { batches } = useBatches();

  const occupied = houses.filter((h) => {
    return batches.some((b) => b.house === h.name && b.status !== "sold");
  });
  const totalCapacity = houses.reduce((s, h) => s + (h.capacity ?? 0), 0);

  if (isLoading) {
    return <div className="page"><div className="empty">Loading houses…</div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Houses</h1>
          <div className="page-sub">
            {houses.length} poultry house{houses.length !== 1 ? "s" : ""} ·{" "}
            {totalCapacity.toLocaleString()}-bird total capacity ·{" "}
            {occupied.length} occupied
          </div>
        </div>
        <div className="page-actions">
          <button className="btn accent" onClick={() => setShowAdd(true)}>
            <Icons.Plus size={14} /> Add house
          </button>
        </div>
      </div>

      {houses.length === 0 ? (
        <div className="empty">
          <Icons.House size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
          <div style={{ fontWeight: 500, marginBottom: 4 }}>No houses yet</div>
          <div style={{ fontSize: 13 }}>Add your first poultry house to start assigning batches</div>
          <button className="btn accent sm" style={{ marginTop: 12 }} onClick={() => setShowAdd(true)}>
            <Icons.Plus size={12} /> Add first house
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {houses.map((h: House) => {
            // find active batch occupying this house
            const batch = batches.find(
              (b) => (b.house === h.name || b.house === h.id) && b.status !== "sold"
            );
            const occ = batch && h.capacity ? batch.currentCount / h.capacity : 0;

            return (
              <div key={h.id} className="card" style={{ padding: 16 }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "var(--bg-sunken)",
                      display: "grid", placeItems: "center",
                    }}>
                      <Icons.House size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{h.name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>
                        {h.type ?? "—"} · cap. {h.capacity ? h.capacity.toLocaleString() : "—"}
                      </div>
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
                      <span className="mono">
                        {num(batch.currentCount)} / {h.capacity ? num(h.capacity) : "—"}
                      </span>
                    </div>
                    <div className="bar"><span style={{ width: `${Math.min(100, occ * 100)}%` }}></span></div>
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
      )}

      {showAdd && (
        <AddHouseModal
          orgId={org?.id ?? ""}
          onClose={() => setShowAdd(false)}
          onSuccess={() => startTransition(() => refresh())}
        />
      )}
    </div>
  );
}
