"use client";

export const dynamic = "force-dynamic";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { completeOnboarding } from "@/app/actions/onboarding";
import { createClient } from "@/lib/supabase/client";

const STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep]         = useState<Step>(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [seedDemo, setSeedDemo] = useState(true);

  const [form, setForm] = useState({
    farmName:    "",
    state:       "Ogun",
    lga:         "",
    address:     "",
    ownerPhone:  "",
    waNumber:    "",
    birdCapacity: "5000",
    regNumber:   "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.farmName.trim()) { setError("Farm name is required"); return; }
    setLoading(true);
    setError(null);

    try {
      // Get user from browser session (localStorage — always works after sign-in)
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError("Session not found — please sign in again.");
        setLoading(false);
        return;
      }

      const res = await completeOnboarding({
        userId: session.user.id,
        ownerName: session.user.user_metadata?.full_name ?? undefined,
        farmName: form.farmName.trim(),
        slug: slugify(form.farmName.trim()) + "-" + Math.random().toString(36).slice(2, 6),
        state: form.state || undefined,
        lga: form.lga || undefined,
        address: form.address || undefined,
        ownerPhone: form.ownerPhone || undefined,
        waNumber: form.waNumber || undefined,
        birdCapacity: form.birdCapacity ? parseInt(form.birdCapacity) : undefined,
        regNumber: form.regNumber || undefined,
        seedDemo,
      });

      if (!res.success) {
        setError(res.error ?? "Failed to create farm");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const STEPS = ["Your farm", "Location", "Review"];

  return (
    <div style={{ width: "100%", maxWidth: 520 }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: "var(--accent)",
          display: "grid", placeItems: "center", color: "white", fontWeight: 700, fontSize: 18,
        }}>A</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Acre Farm OS</div>
          <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Let's set up your farm</div>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
        {STEPS.map((label, i) => {
          const n = (i + 1) as Step;
          const done = step > n;
          const active = step === n;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 600,
                  display: "grid", placeItems: "center", flexShrink: 0,
                  background: done ? "var(--accent)" : active ? "var(--accent)" : "var(--bg-subtle)",
                  color: done || active ? "white" : "var(--fg-muted)",
                }}>
                  {done ? <Icons.Check size={12} /> : n}
                </div>
                <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "var(--fg)" : "var(--fg-muted)", whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1, background: done ? "var(--accent)" : "var(--border)", margin: "0 10px" }} />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: 28 }}>
          {error && (
            <div className="banner danger" style={{ marginBottom: 16 }}>
              <Icons.Alert size={14} /> {error}
            </div>
          )}

          {/* Step 1: Farm basics */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>Your farm details</h2>
                <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>Tell us about your farm so we can set up your ERP</p>
              </div>
              <div className="form-grid">
                <div className="form-row" style={{ gridColumn: "span 2" }}>
                  <label>Farm Name *</label>
                  <input className="input" value={form.farmName} onChange={(e) => set("farmName", e.target.value)}
                    placeholder="e.g. Adigwe Family Farms" required />
                </div>
                <div className="form-row">
                  <label>CAC Registration No.</label>
                  <input className="input" value={form.regNumber} onChange={(e) => set("regNumber", e.target.value)}
                    placeholder="CAC/RC-XXXXXXX" />
                </div>
                <div className="form-row">
                  <label>Total Bird Capacity</label>
                  <input className="input" type="number" value={form.birdCapacity}
                    onChange={(e) => set("birdCapacity", e.target.value)} placeholder="5000" />
                </div>
                <div className="form-row">
                  <label>WhatsApp Business No.</label>
                  <input className="input" value={form.waNumber} onChange={(e) => set("waNumber", e.target.value)}
                    placeholder="234801234567 (no +)" />
                </div>
                <div className="form-row">
                  <label>Owner Phone</label>
                  <input className="input" value={form.ownerPhone} onChange={(e) => set("ownerPhone", e.target.value)}
                    placeholder="+234 801 234 5678" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>Farm location</h2>
                <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>Used for delivery zones, disease alerts, and regional reports</p>
              </div>
              <div className="form-grid">
                <div className="form-row">
                  <label>State</label>
                  <select className="select" value={form.state} onChange={(e) => set("state", e.target.value)}>
                    {STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>LGA</label>
                  <input className="input" value={form.lga} onChange={(e) => set("lga", e.target.value)}
                    placeholder="e.g. Sagamu" />
                </div>
                <div className="form-row" style={{ gridColumn: "span 2" }}>
                  <label>Full Address</label>
                  <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)}
                    placeholder="Plot 15, Adigwe Road, Sagamu Industrial Layout" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>Almost there!</h2>
                <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>Review your farm details before we create your workspace</p>
              </div>
              <div style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", padding: 14, fontSize: 13 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                  {[
                    ["Farm Name", form.farmName],
                    ["State / LGA", `${form.state}${form.lga ? ` · ${form.lga}` : ""}`],
                    ["Bird Capacity", form.birdCapacity ? parseInt(form.birdCapacity).toLocaleString() : "—"],
                    ["WA Number", form.waNumber || "—"],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-muted)" }}>{label}</div>
                      <div style={{ fontWeight: 500, marginTop: 2 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: seedDemo ? "var(--accent-subtle)" : "var(--bg-card)" }}>
                <input type="checkbox" checked={seedDemo} onChange={(e) => setSeedDemo(e.target.checked)} style={{ marginTop: 2, accentColor: "var(--accent)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Load demo data</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
                    Pre-fill your farm with sample batches, orders and vaccinations so you can explore the ERP immediately. You can delete it later.
                  </div>
                </div>
              </label>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 1 && (
              <button type="button" className="btn" onClick={() => setStep((s) => (s - 1) as Step)}>
                Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 3 ? (
              <button
                type="button"
                className="btn accent"
                style={{ paddingLeft: 20, paddingRight: 20 }}
                onClick={() => {
                  if (step === 1 && !form.farmName.trim()) { setError("Farm name is required"); return; }
                  setError(null);
                  setStep((s) => (s + 1) as Step);
                }}
              >
                Continue <Icons.ChevRight size={13} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn accent"
                disabled={loading}
                style={{ paddingLeft: 20, paddingRight: 20 }}
              >
                {loading ? "Creating farm…" : "🌿 Create my farm"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
