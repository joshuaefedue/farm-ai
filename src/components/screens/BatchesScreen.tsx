"use client";
import { useState, useMemo, useTransition } from "react";
import { Icons } from "@/components/icons";
import { BATCHES, Batch } from "@/lib/data";
import { naira, num } from "@/lib/utils";
import { TODAY } from "@/lib/data";
import { useBatches } from "@/hooks/useBatches";
import { useHouses } from "@/hooks/useHouses";
import { useOrg } from "@/contexts/OrgContext";
import { createBatch } from "@/app/actions/batches";

type SortCol = keyof Batch | "age";

function CreateBatchModal({
  onClose,
  orgId,
  onSuccess,
  houses,
}: {
  onClose: () => void;
  orgId: string | null;
  onSuccess: () => void;
  houses: { id: string; name: string; type: string | null; capacity: number | null }[];
}) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [data, setData] = useState({
    type: "broiler", breed: "Cobb 500", qty: 5000, house: "",
    arrival: new Date().toISOString().slice(0, 10),
    supplier: "Amo Byng, Awe", costPerBird: 850,
    feedStarter: "Broiler Starter 22%", vaccineProgram: "Standard broiler · 6 doses",
    autoSchedule: true, notifyWhatsApp: true,
  });
  const set = (k: string, v: unknown) => setData((d) => ({ ...d, [k]: v }));

  async function handleCreate() {
    if (!orgId) { setErrMsg("No farm selected"); return; }
    setSaving(true);
    setErrMsg(null);
    const res = await createBatch({
      org_id: orgId,
      type: data.type as "broiler" | "layer" | "dual",
      breed: data.breed,
      start_count: data.qty,
      supplier: data.supplier,
      cost_per_bird: data.costPerBird,
      house_name: data.house || undefined,
      arrival_date: data.arrival,
      auto_schedule: data.autoSchedule,
    });
    setSaving(false);
    if (!res.success) { setErrMsg(res.error ?? "Failed to create batch"); return; }
    onSuccess();
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <h3>Create new batch</h3>
            <div className="sub">Step {step} of 3 · {step === 1 ? "Stock & breed" : step === 2 ? "House & schedule" : "Review"}</div>
          </div>
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          {errMsg && <div className="banner danger" style={{ marginBottom: 12 }}><Icons.Alert size={14} /> {errMsg}</div>}
          {step === 1 && (
            <>
              <div className="form-row">
                <label>Production type</label>
                <div className="btn-group" style={{ width: "fit-content" }}>
                  {["broiler", "layer", "dual"].map((t) => (
                    <button key={t} className={data.type === t ? "active" : ""} onClick={() => set("type", t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="form-grid">
                <div className="form-row">
                  <label>Breed</label>
                  <select className="select" value={data.breed} onChange={(e) => set("breed", e.target.value)}>
                    <option>Cobb 500</option><option>Arbor Acres Plus</option><option>Ross 308</option>
                    <option>Lohmann Brown</option><option>ISA Brown</option><option>Noiler (Local)</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Quantity (chicks)</label>
                  <input className="input" type="number" value={data.qty} onChange={(e) => set("qty", +e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Source hatchery</label>
                  <input className="input" value={data.supplier} onChange={(e) => set("supplier", e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Cost per chick (₦)</label>
                  <input className="input" type="number" value={data.costPerBird} onChange={(e) => set("costPerBird", +e.target.value)} />
                </div>
              </div>
              <div className="banner">
                <div className="icon-dot"><Icons.Info size={12} /></div>
                <div style={{ flex: 1, fontSize: 12.5 }}>
                  Co-op price for {data.breed} is <span className="mono">₦1,150</span> via Ogun Poultry Co-op.
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="form-grid">
                <div className="form-row">
                  <label>House</label>
                  <select className="select" value={data.house} onChange={(e) => set("house", e.target.value)}>
                    <option value="">— select house —</option>
                    {houses.map((h) => (
                      <option key={h.id} value={h.name}>{h.name}{h.capacity ? ` (cap. ${h.capacity.toLocaleString()})` : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label>Arrival date</label>
                  <input className="input" type="date" value={data.arrival} onChange={(e) => set("arrival", e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Starter feed</label>
                  <select className="select" value={data.feedStarter} onChange={(e) => set("feedStarter", e.target.value)}>
                    <option>Broiler Starter 22%</option><option>Layer Starter 20%</option><option>Chick Mash 18%</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Vaccine program</label>
                  <select className="select" value={data.vaccineProgram} onChange={(e) => set("vaccineProgram", e.target.value)}>
                    <option>Standard broiler · 6 doses</option><option>Extended broiler · 8 doses</option>
                    <option>Layer program · 12 doses</option><option>Custom</option>
                  </select>
                </div>
              </div>
              <div className="stack-2">
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={data.autoSchedule} onChange={(e) => set("autoSchedule", e.target.checked)} />
                  Auto-schedule vaccinations based on chick age
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={data.notifyWhatsApp} onChange={(e) => set("notifyWhatsApp", e.target.checked)} />
                  Send reminders to farm staff via WhatsApp
                </label>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="banner success">
                <div className="icon-dot success"><Icons.Check size={12} /></div>
                <div>Ready to create.{data.autoSchedule ? " Acre will auto-schedule vaccinations for this batch." : ""}</div>
              </div>
              <div className="stack-3" style={{ marginTop: 4 }}>
                {[
                  { k: "Breed", v: `${data.breed} · ${data.type}` },
                  { k: "Quantity", v: `${num(data.qty)} chicks` },
                  { k: "House", v: data.house || "—" },
                  { k: "Arrival", v: data.arrival },
                  { k: "Source", v: data.supplier },
                  { k: "Cost per chick", v: naira(data.costPerBird) },
                  { k: "Total chick cost", v: naira(data.costPerBird * data.qty), hi: true },
                  { k: "Starter feed", v: data.feedStarter },
                  { k: "Vaccine program", v: data.vaccineProgram },
                ].map(({ k, v, hi }) => (
                  <div key={k} className="row" style={{ justifyContent: "space-between", padding: "6px 10px", background: hi ? "var(--accent-soft)" : "var(--bg-sunken)", borderRadius: 6, fontSize: 13 }}>
                    <span className="muted">{k}</span>
                    <span className="mono" style={{ fontWeight: hi ? 600 : 400, color: hi ? "var(--accent-soft-fg)" : "inherit" }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <span className="muted" style={{ flex: 1, fontSize: 12 }}>
            {step === 1 && "Tip: switch to layer to load the layer vaccine schedule."}
            {step === 2 && data.autoSchedule && "Schedule will include Marek (D1), Gumboro (D9, D14), Newcastle (D7, D21)."}
            {step === 3 && "Batch ID will be generated automatically."}
          </span>
          {step > 1 && <button className="btn" onClick={() => setStep(step - 1)} disabled={saving}>Back</button>}
          {step < 3
            ? <button className="btn primary" onClick={() => setStep(step + 1)}>Continue</button>
            : <button className="btn accent" onClick={handleCreate} disabled={saving}>
                {saving ? "Creating…" : <><Icons.Check size={14} /> Create batch</>}
              </button>}
        </div>
      </div>
    </div>
  );
}

export default function BatchesScreen({ setRoute }: { setRoute: (r: string) => void }) {
  const { org } = useOrg();
  const { batches, isLoading, refresh } = useBatches();
  const { houses } = useHouses();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ col: SortCol; dir: "asc" | "desc" }>({ col: "arrival", dir: "desc" });
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  // Use real data when available, fallback to mock
  const allBatches = batches.length > 0 ? batches : BATCHES;

  const filtered = useMemo(() => {
    let list = allBatches.slice();
    if (filter === "broiler") list = list.filter((b) => b.type === "broiler");
    if (filter === "layer") list = list.filter((b) => b.type === "layer");
    if (filter === "dual") list = list.filter((b) => b.type === "dual");
    if (filter === "active") list = list.filter((b) => b.status !== "sold");
    if (filter === "sold") list = list.filter((b) => b.status === "sold");
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((b) => b.id.toLowerCase().includes(s) || b.breed.toLowerCase().includes(s) || b.house.toLowerCase().includes(s));
    }
    list.sort((a, b) => {
      const av: unknown = sort.col === "age" ? a.arrival : a[sort.col as keyof Batch];
      const bv: unknown = sort.col === "age" ? b.arrival : b[sort.col as keyof Batch];
      const cmp = (av as number) > (bv as number) ? 1 : (av as number) < (bv as number) ? -1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filter, search, sort, allBatches]);

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const sortBy = (col: SortCol) => setSort((s) => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "desc" });

  const SortHead = ({ col, children, num: isNum }: { col: SortCol; children: React.ReactNode; num?: boolean }) => (
    <th className={isNum ? "num" : ""} style={{ cursor: "pointer", userSelect: "none" }} onClick={() => sortBy(col)}>
      <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
        {children}{sort.col === col && (sort.dir === "asc" ? " ↑" : " ↓")}
      </span>
    </th>
  );

  const total = allBatches.length;
  const active = allBatches.filter((b) => b.status !== "sold").length;
  const liveBirds = allBatches.filter((b) => b.status !== "sold").reduce((s, b) => s + b.currentCount, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Poultry batches</h1>
          <div className="page-sub">
            {isLoading ? "Loading…" : `${active} active · ${total - active} closed · ${liveBirds.toLocaleString()} live birds`}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Download size={14} /> Export CSV</button>
          <button className="btn accent" onClick={() => setShowCreate(true)}><Icons.Plus size={14} /> New batch</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <Icons.Search size={14} />
          <input placeholder="Search by ID, breed, house…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="btn-group">
          {[
            { k: "all", label: `All ${total}` }, { k: "active", label: `Active ${active}` },
            { k: "broiler", label: "Broiler" }, { k: "layer", label: "Layer" }, { k: "dual", label: "Dual" }, { k: "sold", label: "Closed" },
          ].map(({ k, label }) => (
            <button key={k} className={filter === k ? "active" : ""} onClick={() => setFilter(k)}>{label}</button>
          ))}
        </div>
        {selected.size > 0 && (
          <div className="row" style={{ gap: 6, marginLeft: "auto" }}>
            <span className="muted" style={{ fontSize: 12 }}>{selected.size} selected</span>
            <button className="btn sm">Move house</button>
            <button className="btn sm danger">Close batch</button>
          </div>
        )}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 28 }}>
                <input type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((b) => b.id)) : new Set())}
                />
              </th>
              <SortHead col="id">Batch ID</SortHead>
              <th>Breed</th>
              <th>Type</th>
              <SortHead col="house">House</SortHead>
              <SortHead col="arrival" num>Age</SortHead>
              <SortHead col="currentCount" num>Birds</SortHead>
              <SortHead col="mortalityPct" num>Mortality</SortHead>
              <SortHead col="fcr" num>FCR</SortHead>
              <th className="num">Lay / Wt</th>
              <SortHead col="costPerBird" num>Cost/bird</SortHead>
              <th>Status</th>
              <th style={{ width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={13} style={{ textAlign: "center", padding: 24, color: "var(--fg-muted)" }}>Loading batches…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={13} style={{ textAlign: "center", padding: 24, color: "var(--fg-muted)" }}>No batches found</td></tr>
            ) : filtered.map((b) => {
              const age = Math.floor((TODAY.getTime() - b.arrival.getTime()) / 86400000);
              const aliveFrac = b.startCount ? b.currentCount / b.startCount : 0;
              return (
                <tr key={b.id} className={selected.has(b.id) ? "selected" : ""}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(b.id)} onChange={() => toggle(b.id)} />
                  </td>
                  <td className="id-cell" onClick={() => setRoute("batch:" + b.id)} style={{ cursor: "pointer" }}>
                    <span className="row-link">{b.id}</span>
                  </td>
                  <td onClick={() => setRoute("batch:" + b.id)} style={{ cursor: "pointer" }}>{b.breed}</td>
                  <td>
                    <span className={`badge ${b.type === "broiler" ? "warning" : b.type === "layer" ? "accent" : "info"}`}>{b.type}</span>
                  </td>
                  <td>{b.house}</td>
                  <td className="num">{age}<span className="faint">d</span></td>
                  <td className="num">
                    <div>{num(b.currentCount)}</div>
                    <div className="faint mono" style={{ fontSize: 10.5 }}>{(aliveFrac * 100).toFixed(1)}%</div>
                  </td>
                  <td className="num">
                    <span className={b.mortalityPct > 3.5 ? "danger-text" : b.mortalityPct > 2 ? "warning-text" : ""}>
                      {b.mortalityPct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="num">{b.fcr}</td>
                  <td className="num">
                    {b.type === "broiler" || b.type === "dual"
                      ? <span>{b.avgWeight?.toFixed(2)}<span className="faint"> kg</span></span>
                      : <span>{b.eggRate?.toFixed(1)}<span className="faint"> %</span></span>}
                  </td>
                  <td className="num" style={{ fontVariantNumeric: "tabular-nums" }}>{naira(b.costPerBird)}</td>
                  <td>
                    <span className={`badge ${b.status === "laying" ? "success" : b.status === "growing" ? "info" : "outline"}`}>
                      <span className="dot"></span> {b.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn ghost icon-only sm"><Icons.More size={13} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row" style={{ justifyContent: "space-between", marginTop: 12, color: "var(--fg-muted)", fontSize: 12 }}>
        <span>Showing {filtered.length} of {total} batches</span>
        <div className="row" style={{ gap: 4 }}>
          <button className="btn ghost sm" disabled><Icons.ChevDown size={12} style={{ transform: "rotate(90deg)" }} /></button>
          <span className="mono">1</span>
          <button className="btn ghost sm" disabled><Icons.ChevRight size={12} /></button>
        </div>
      </div>

      {showCreate && (
        <CreateBatchModal
          onClose={() => setShowCreate(false)}
          orgId={org?.id ?? null}
          onSuccess={() => startTransition(() => refresh())}
          houses={houses}
        />
      )}
    </div>
  );
}
