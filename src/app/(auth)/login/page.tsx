"use client";

export const dynamic = "force-dynamic";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/icons";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get("next") ?? "/";
  const supabase     = createClient();

  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email) { setError("Enter your email first"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${next}` },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setError(null);
    alert("Check your email — magic link sent!");
  }

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: "var(--accent)",
          display: "grid", placeItems: "center", color: "white", fontWeight: 700, fontSize: 18,
        }}>A</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--fg)" }}>Acre Farm OS</div>
          <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Adigwe Family Farms</div>
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Sign in</h1>
        <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: "0 0 22px" }}>
          Welcome back — sign in to your farm dashboard
        </p>

        {error && (
          <div className="banner danger" style={{ marginBottom: 16 }}>
            <Icons.Alert size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="form-row">
            <label>Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@farm.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            className="btn accent"
            type="submit"
            disabled={loading}
            style={{ height: 38, fontSize: 14, marginTop: 4, justifyContent: "center" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 11, color: "var(--fg-faint)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <button
          className="btn"
          onClick={handleMagicLink}
          disabled={loading}
          style={{ width: "100%", height: 36, justifyContent: "center", fontSize: 13 }}
        >
          <Icons.Bell size={13} /> Send magic link
        </button>

        <p style={{ fontSize: 12, color: "var(--fg-muted)", textAlign: "center", marginTop: 20, marginBottom: 0 }}>
          No account?{" "}
          <a href="/signup" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
