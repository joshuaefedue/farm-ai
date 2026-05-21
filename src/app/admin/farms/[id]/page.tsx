import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin-client";
import s from "../../admin.module.css";
import FarmActions from "./_components/FarmActions";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();

  // ── Fetch all farm data in parallel ────────────────────────────────────────
  const [
    { data: org,     error: orgErr  },
    { data: members                 },
    { data: batches                 },
    { data: orders                  },
    { data: vaxx                    },
  ] = await Promise.all([
    db.from("organizations").select("*").eq("id", id).single(),
    db.from("organization_members")
      .select("id, user_id, role, active, joined_at, profiles(full_name, is_admin)")
      .eq("org_id", id)
      .order("joined_at", { ascending: true }),
    db.from("batches")
      .select("id, name, type, current_count, status, arrival_date, breed")
      .eq("org_id", id)
      .order("created_at", { ascending: false }),
    db.from("orders")
      .select("id, order_date, customer, subtotal, status, payment")
      .eq("org_id", id)
      .order("order_date", { ascending: false })
      .limit(10),
    db.from("vaccinations")
      .select("id, vaccine, scheduled_date, status")
      .eq("org_id", id)
      .order("scheduled_date", { ascending: false })
      .limit(5),
  ]);

  if (orgErr || !org) notFound();

  // ── Derived stats ──────────────────────────────────────────────────────────
  const liveBirds = (batches ?? [])
    .filter((b) => b.status !== "sold")
    .reduce((sum, b) => sum + (b.current_count ?? 0), 0);

  const totalRev = (orders ?? []).reduce((sum, o) => sum + (o.subtotal ?? 0), 0);

  const pendingVaxx = (vaxx ?? []).filter((v) => v.status === "pending").length;

  return (
    <>
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className={s.breadcrumb}>
        <Link href="/admin/farms" className={s.breadLink}>Farm Owners</Link>
        <span className={s.breadSep}>/</span>
        <span className={s.breadCurrent}>{org.name}</span>
        {org.suspended && (
          <span className={`${s.badge} ${s.badgeRed}`} style={{ marginLeft: 8 }}>
            ⏸ Suspended
          </span>
        )}
      </div>

      {/* ── Detail cards ───────────────────────────────────────────────── */}
      <div className={s.detailGrid}>
        {/* Farm profile */}
        <div className={s.detailCard}>
          <div className={s.detailCardTitle}>Farm Profile</div>
          <DetailRow label="Name"       value={org.name} />
          <DetailRow label="Slug"       value={`/${org.slug}`} />
          <DetailRow label="Reg No."    value={org.reg_number} />
          <DetailRow label="State"      value={org.state} />
          <DetailRow label="LGA"        value={org.lga} />
          <DetailRow label="Address"    value={org.address} />
          <DetailRow label="Phone"      value={org.owner_phone} />
          <DetailRow label="WhatsApp"   value={org.wa_number} />
          <DetailRow label="Est. Year"  value={org.established_year?.toString()} />
          <DetailRow label="Size"       value={org.size_ha ? `${org.size_ha} ha` : null} />
          <DetailRow label="Capacity"   value={org.bird_capacity ? fmt(org.bird_capacity) : null} />
          <DetailRow label="Joined"     value={fmtDate(org.created_at)} />
        </div>

        {/* Subscription */}
        <div className={s.detailCard}>
          <div className={s.detailCardTitle}>Subscription & Stats</div>
          <div style={{ marginBottom: 16 }}>
            <DetailRow
              label="Plan"
              value={
                <PlanBadge plan={org.plan} />
              }
            />
            <DetailRow label="Plan expires" value={fmtDate(org.plan_expires_at)} />
            <DetailRow
              label="Status"
              value={
                org.suspended ? (
                  <span className={`${s.badge} ${s.badgeRed}`}>⏸ Suspended</span>
                ) : (
                  <span className={`${s.badge} ${s.badgeGreen}`}>✓ Active</span>
                )
              }
            />
            {org.suspended && (
              <DetailRow label="Suspended at" value={fmtDate(org.suspended_at)} />
            )}
            {org.suspended && org.suspended_note && (
              <DetailRow label="Reason" value={org.suspended_note} />
            )}
          </div>
          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "14px 0" }} />
          <div className={s.detailCardTitle}>Quick Stats</div>
          <DetailRow label="Live Birds"     value={fmt(liveBirds)} />
          <DetailRow label="Active Batches" value={String((batches ?? []).filter((b) => b.status !== "sold").length)} />
          <DetailRow label="Total Orders"   value={fmt((orders ?? []).length)} />
          <DetailRow label="Total Revenue"  value={fmtMoney(totalRev)} />
          <DetailRow label="Pending Vaxx"   value={String(pendingVaxx)} />
          <DetailRow label="Team Members"   value={String((members ?? []).length)} />
        </div>
      </div>

      {/* ── Manage actions (client component) ─────────────────────────── */}
      <FarmActions farm={org} />

      {/* ── Members ────────────────────────────────────────────────────── */}
      <div className={s.sectionHeader}>
        <span className={s.sectionTitle}>Team Members ({(members ?? []).length})</span>
      </div>
      <div className={s.card} style={{ marginBottom: 24 }}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((m) => {
              const profile = m.profiles as unknown as { full_name: string | null; is_admin: boolean } | null;
              return (
                <tr key={m.id}>
                  <td>
                    {profile?.full_name ?? "—"}
                    {profile?.is_admin && (
                      <span className={`${s.badge} ${s.badgeRed}`} style={{ marginLeft: 8, fontSize: 10 }}>
                        admin
                      </span>
                    )}
                  </td>
                  <td>
                    <RoleBadge role={m.role} />
                  </td>
                  <td>
                    {m.active ? (
                      <span className={`${s.badge} ${s.badgeGreen}`} style={{ fontSize: 10 }}>active</span>
                    ) : (
                      <span className={`${s.badge} ${s.badgeGray}`} style={{ fontSize: 10 }}>inactive</span>
                    )}
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{fmtDate(m.joined_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Active Batches ─────────────────────────────────────────────── */}
      <div className={s.sectionHeader}>
        <span className={s.sectionTitle}>Batches ({(batches ?? []).length})</span>
      </div>
      <div className={s.card} style={{ marginBottom: 24 }}>
        {(batches ?? []).length === 0 ? (
          <div className={s.empty}><div className={s.emptyText}>No batches</div></div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Breed</th>
                <th>Birds</th>
                <th>Status</th>
                <th>Arrived</th>
              </tr>
            </thead>
            <tbody>
              {(batches ?? []).map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{b.id}</td>
                  <td>{b.type}</td>
                  <td style={{ color: "var(--muted)" }}>{b.breed ?? "—"}</td>
                  <td>{fmt(b.current_count)}</td>
                  <td>
                    <span className={`${s.badge} ${
                      b.status === "laying"  ? s.badgeGreen :
                      b.status === "growing" ? s.badgeBlue  :
                      s.badgeGray
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>
                    {fmtDate(b.arrival_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Recent Orders ──────────────────────────────────────────────── */}
      <div className={s.sectionHeader}>
        <span className={s.sectionTitle}>Recent Orders (last 10)</span>
      </div>
      <div className={s.card}>
        {(orders ?? []).length === 0 ? (
          <div className={s.empty}><div className={s.emptyText}>No orders</div></div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{o.id}</td>
                  <td>{o.customer}</td>
                  <td style={{ fontWeight: 500 }}>{fmtMoney(o.subtotal)}</td>
                  <td>
                    <span className={`${s.badge} ${
                      o.status === "delivered"  ? s.badgeGreen :
                      o.status === "cancelled"  ? s.badgeRed   :
                      o.status === "confirmed"  ? s.badgeBlue  :
                      s.badgeGray
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <span className={`${s.badge} ${
                      o.payment === "paid"     ? s.badgeGreen  :
                      o.payment === "invoiced" ? s.badgeYellow :
                      s.badgeGray
                    }`}>
                      {o.payment}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>
                    {fmtDate(o.order_date)}
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

// ── Sub-components ─────────────────────────────────────────────────────────────
function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode | null;
}) {
  if (value == null || value === "") return null;
  return (
    <div className={s.detailRow}>
      <span className={s.detailKey}>{label}</span>
      <span className={s.detailVal}>{value}</span>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    free: "badgeGray", pro: "badgeBlue", enterprise: "badgePurple",
  };
  return (
    <span className={`${s.badge} ${s[map[plan] ?? "badgeGray"]}`}>{plan}</span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    owner: "badgeGreen", manager: "badgeBlue", vet: "badgeYellow",
    sales: "badgePurple", logistics: "badgeGray", readonly: "badgeGray",
  };
  return (
    <span className={`${s.badge} ${s[map[role] ?? "badgeGray"]}`}>{role}</span>
  );
}
