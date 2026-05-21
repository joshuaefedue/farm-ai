"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Organization } from "@/lib/supabase/types";
import { suspendFarm, activateFarm, changeFarmPlan, deleteFarm } from "../actions";
import s from "../../../admin.module.css";

export default function FarmActions({ farm }: { farm: Organization }) {
  const router             = useRouter();
  const [, startTransition] = useTransition();
  const [suspendNote, setSuspendNote] = useState("");
  const [showSuspend, setShowSuspend] = useState(false);
  const [showDelete, setShowDelete]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState<{ text: string; ok: boolean } | null>(null);

  async function doSuspend() {
    setSaving(true);
    try {
      await suspendFarm(farm.id, suspendNote);
      setMsg({ text: "Farm suspended.", ok: false });
      setShowSuspend(false);
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setMsg({ text: (e as Error).message, ok: false });
    } finally { setSaving(false); }
  }

  async function doActivate() {
    setSaving(true);
    try {
      await activateFarm(farm.id);
      setMsg({ text: "Farm activated.", ok: true });
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setMsg({ text: (e as Error).message, ok: false });
    } finally { setSaving(false); }
  }

  async function doChangePlan(plan: "free" | "pro" | "enterprise") {
    setSaving(true);
    try {
      await changeFarmPlan(farm.id, plan);
      setMsg({ text: `Plan updated to ${plan}.`, ok: true });
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setMsg({ text: (e as Error).message, ok: false });
    } finally { setSaving(false); }
  }

  async function doDelete() {
    if (deleteConfirm !== farm.name) return;
    setSaving(true);
    try {
      await deleteFarm(farm.id);
      router.push("/admin/farms");
    } catch (e: unknown) {
      setMsg({ text: (e as Error).message, ok: false });
      setSaving(false);
    }
  }

  return (
    <>
      {/* ── Toast message ─────────────────────────────────────────────── */}
      {msg && (
        <div
          style={{
            background: msg.ok ? "var(--green-bg)" : "var(--red-bg)",
            color:      msg.ok ? "var(--green)"    : "var(--red)",
            border:     `1px solid ${msg.ok ? "var(--green)" : "var(--red)"}`,
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 16,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {msg.text}
          <button
            onClick={() => setMsg(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 16 }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Plan management ───────────────────────────────────────────── */}
      <div className={s.card} style={{ padding: "20px", marginBottom: 24 }}>
        <div className={s.detailCardTitle} style={{ marginBottom: 14 }}>Manage Subscription</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(["free", "pro", "enterprise"] as const).map((p) => (
            <button
              key={p}
              className={`${s.btn} ${farm.plan === p ? s.btnPrimary : s.btnGhost}`}
              disabled={saving || farm.plan === p}
              onClick={() => doChangePlan(p)}
            >
              {p === farm.plan ? `✓ ${p} (current)` : `Switch to ${p}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Suspend / Activate ────────────────────────────────────────── */}
      {!farm.suspended ? (
        <div className={s.dangerZone} style={{ marginBottom: 24 }}>
          <div className={s.dangerTitle}>⚠ Suspend Farm</div>
          <div className={s.dangerDesc}>
            Suspending will block all users on this farm from accessing the dashboard.
            They will see a "Farm suspended" screen until you re-activate.
          </div>
          {showSuspend ? (
            <div>
              <textarea
                value={suspendNote}
                onChange={(e) => setSuspendNote(e.target.value)}
                placeholder="Reason for suspension (optional)…"
                rows={2}
                style={{
                  width: "100%", maxWidth: 480,
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 6, color: "var(--text)", padding: "8px 10px",
                  fontSize: 13, marginBottom: 10, resize: "vertical",
                  outline: "none",
                }}
              />
              <div className={s.dangerActions}>
                <button
                  className={`${s.btn} ${s.btnDanger}`}
                  disabled={saving}
                  onClick={doSuspend}
                >
                  {saving ? "Suspending…" : "Confirm Suspend"}
                </button>
                <button
                  className={`${s.btn} ${s.btnGhost}`}
                  onClick={() => setShowSuspend(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={s.dangerActions}>
              <button
                className={`${s.btn} ${s.btnDanger}`}
                onClick={() => setShowSuspend(true)}
              >
                Suspend Farm
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={s.card} style={{ padding: "20px", marginBottom: 24, border: "1px solid var(--green)" }}>
          <div className={s.detailCardTitle} style={{ color: "var(--green)", marginBottom: 10 }}>
            Re-activate Farm
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
            This farm is currently suspended.
            {farm.suspended_note && ` Reason: "${farm.suspended_note}".`}
            {" "}Activating will restore full access immediately.
          </div>
          <button
            className={`${s.btn} ${s.btnPrimary}`}
            disabled={saving}
            onClick={doActivate}
          >
            {saving ? "Activating…" : "✓ Activate Farm"}
          </button>
        </div>
      )}

      {/* ── Delete ────────────────────────────────────────────────────── */}
      <div className={s.dangerZone}>
        <div className={s.dangerTitle}>🗑 Delete Farm Permanently</div>
        <div className={s.dangerDesc}>
          This will permanently delete <strong>{farm.name}</strong> and ALL associated data —
          batches, orders, members, vaccinations, inventory, alerts. This action cannot be undone.
        </div>
        {showDelete ? (
          <div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>
              Type <strong style={{ color: "var(--text)" }}>{farm.name}</strong> to confirm deletion:
            </div>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={farm.name}
              style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text)", padding: "7px 10px",
                fontSize: 13, marginBottom: 10, outline: "none", width: "100%", maxWidth: 360,
              }}
            />
            <div className={s.dangerActions}>
              <button
                className={`${s.btn} ${s.btnDanger}`}
                disabled={saving || deleteConfirm !== farm.name}
                onClick={doDelete}
              >
                {saving ? "Deleting…" : "Delete permanently"}
              </button>
              <button
                className={`${s.btn} ${s.btnGhost}`}
                onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={s.dangerActions}>
            <button
              className={`${s.btn} ${s.btnDanger}`}
              onClick={() => setShowDelete(true)}
            >
              Delete Farm
            </button>
          </div>
        )}
      </div>
    </>
  );
}
