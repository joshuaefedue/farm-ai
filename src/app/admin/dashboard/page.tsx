import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin-client";
import s from "../admin.module.css";

export const dynamic = "force-dynamic";

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtMoney(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminDashboard() {
  const db = createAdminClient();

  // ── Parallel data fetches ──────────────────────────────────────────────────
  const [
    { data: orgs   },
    { data: members },
    { data: batches },
    { data: orders  },
  ] = await Promise.all([
    db.from("organizations").select("*").order("created_at", { ascending: false }),
    db.from("organization_members").select("org_id, user_id, role, profiles(full_name)").eq("role", "owner"),
    db.from("batches").select("org_id, current_count, status"),
    db.from("orders").select("org_id, subtotal, order_date"),
  ]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalFarms    = orgs?.length ?? 0;
  const activeFarms   = orgs?.filter((o) => !o.suspended).length ?? 0;
  const suspendedCount = orgs?.filter((o) => o.suspended).length ?? 0;

  const totalBirds = batches
    ?.filter((b) => b.status !== "sold")
    .reduce((sum, b) => sum + (b.current_count ?? 0), 0) ?? 0;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const monthlyRev = orders
    ?.filter((o) => new Date(o.order_date) >= thisMonth)
    .reduce((sum, o) => sum + (o.subtotal ?? 0), 0) ?? 0;

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const newFarms7d = orgs?.filter((o) => o.created_at >= sevenDaysAgo).length ?? 0;

  // ── Plan distribution ──────────────────────────────────────────────────────
  const planCounts = { free: 0, pro: 0, enterprise: 0 };
  orgs?.forEach((o) => {
    if (o.plan in planCounts) planCounts[o.plan as keyof typeof planCounts]++;
  });

  // ── Build owner lookup ─────────────────────────────────────────────────────
  const ownerByOrg: Record<string, string> = {};
  members?.forEach((m) => {
    const name = (m.profiles as unknown as { full_name: string | null } | null)?.full_name;
    if (name) ownerByOrg[m.org_id] = name;
  });

  // ── Bird count by org ──────────────────────────────────────────────────────
  const birdsByOrg: Record<string, number> = {};
  batches
    ?.filter((b) => b.status !== "sold")
    .forEach((b) => {
      birdsByOrg[b.org_id] = (birdsByOrg[b.org_id] ?? 0) + (b.current_count ?? 0);
    });

  // ── Recent farms (last 10) ─────────────────────────────────────────────────
  const recentFarms = (orgs ?? []).slice(0, 10);

  return (
    <>
      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className={s.statsRow}>
        <div className={s.statCard}>
          <div className={s.statLabel}>Total Farms</div>
          <div className={s.statValue}>{totalFarms}</div>
          <div className={s.statDelta}>+{newFarms7d} this week</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Active Farms</div>
          <div className={s.statValue}>{activeFarms}</div>
          {suspendedCount > 0 && (
            <div className={`${s.statDelta} ${s.statDeltaNeg}`}>
              {suspendedCount} suspended
            </div>
          )}
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Live Birds</div>
          <div className={s.statValue}>{fmt(totalBirds)}</div>
          <div className={s.statDelta}>Across active batches</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Revenue (month)</div>
          <div className={s.statValue}>{fmtMoney(monthlyRev)}</div>
          <div className={s.statDelta}>From orders this month</div>
        </div>
      </div>

      {/* ── Plan distribution ─────────────────────────────────────────────── */}
      <div className={s.sectionHeader}>
        <span className={s.sectionTitle}>Plan Distribution</span>
      </div>
      <div className={s.planRow}>
        <div className={s.planCard}>
          <div className={s.planName} style={{ color: "var(--muted)" }}>Starter (Free)</div>
          <div className={s.planCount}>{planCounts.free}</div>
          <div className={s.planSub}>
            {totalFarms ? Math.round((planCounts.free / totalFarms) * 100) : 0}% of farms
          </div>
        </div>
        <div className={s.planCard}>
          <div className={s.planName} style={{ color: "var(--blue)" }}>Pro ₦49k/mo</div>
          <div className={s.planCount} style={{ color: "var(--blue)" }}>{planCounts.pro}</div>
          <div className={s.planSub}>
            {totalFarms ? Math.round((planCounts.pro / totalFarms) * 100) : 0}% of farms
          </div>
        </div>
        <div className={s.planCard}>
          <div className={s.planName} style={{ color: "var(--purple)" }}>Enterprise</div>
          <div className={s.planCount} style={{ color: "var(--purple)" }}>{planCounts.enterprise}</div>
          <div className={s.planSub}>Custom pricing</div>
        </div>
      </div>

      {/* ── Recent sign-ups ───────────────────────────────────────────────── */}
      <div className={s.sectionHeader}>
        <span className={s.sectionTitle}>Recent Farm Sign-ups</span>
        <Link href="/admin/farms" className={s.sectionLink}>View all →</Link>
      </div>
      <div className={s.card}>
        {recentFarms.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>🏡</div>
            <div className={s.emptyText}>No farms registered yet</div>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Farm</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Plan</th>
                <th>Birds</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentFarms.map((org) => (
                <tr key={org.id}>
                  <td>
                    <Link href={`/admin/farms/${org.id}`} className={s.tableLink}>
                      {org.name}
                    </Link>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {org.slug}
                    </div>
                  </td>
                  <td>{ownerByOrg[org.id] ?? org.owner_name ?? "—"}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12.5 }}>
                    {[org.state, org.lga].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td>
                    <PlanBadge plan={org.plan} />
                  </td>
                  <td>{fmt(birdsByOrg[org.id])}</td>
                  <td>
                    <StatusBadge suspended={org.suspended} />
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 12.5 }}>
                    {fmtDate(org.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ── Mini components ────────────────────────────────────────────────────────────
function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    free:       "badgeGray",
    pro:        "badgeBlue",
    enterprise: "badgePurple",
  };
  return (
    <span className={`${s.badge} ${s[map[plan] ?? "badgeGray"]}`}>
      {plan}
    </span>
  );
}

function StatusBadge({ suspended }: { suspended: boolean }) {
  return suspended ? (
    <span className={`${s.badge} ${s.badgeRed}`}>⏸ Suspended</span>
  ) : (
    <span className={`${s.badge} ${s.badgeGreen}`}>✓ Active</span>
  );
}
