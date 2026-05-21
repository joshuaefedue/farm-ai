"use client";

export const dynamic = "force-dynamic";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/icons";

export default function SignupPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPass]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback?next=/onboarding`,
      },
    });

    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/onboarding");
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
          <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Create your farm account</div>
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Create account</h1>
        <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: "0 0 22px" }}>
          Set up your Acre Farm OS account in seconds
        </p>

        {error && (
          <div className="banner danger" style={{ marginBottom: 16 }}>
            <Icons.Alert size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="form-row">
            <label>Full Name</label>
            <input
              className="input"
              placeholder="Chukwuemeka Adigwe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Work Email</label>
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
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            className="btn accent"
            type="submit"
            disabled={loading}
            style={{ height: 38, fontSize: 14, marginTop: 4, justifyContent: "center" }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ fontSize: 12, color: "var(--fg-muted)", textAlign: "center", marginTop: 20, marginBottom: 0 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </a>
        </p>

        <p style={{ fontSize: 11, color: "var(--fg-faint)", textAlign: "center", marginTop: 10, marginBottom: 0 }}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
