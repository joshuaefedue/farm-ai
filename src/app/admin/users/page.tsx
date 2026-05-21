import { createAdminClient } from "@/lib/supabase/admin-client";
import s from "../admin.module.css";

export const dynamic = "force-dynamic";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function UsersPage() {
  const db = createAdminClient();

  const [{ data: profiles }, { data: members }, { data: orgs }] = await Promise.all([
    db.from("profiles").select("id, full_name, is_admin, created_at").order("created_at", { ascending: false }),
    db.from("organization_members").select("user_id, org_id, role"),
    db.from("organizations").select("id, name"),
  ]);

  // Build lookup: org_id → org name
  const orgNameById: Record<string, string> = {};
  (orgs ?? []).forEach((o) => { orgNameById[o.id] = o.name; });

  // Build a map of userId → orgs
  const orgsByUser: Record<string, Array<{ name: string; role: string }>> = {};
  (members ?? []).forEach((m) => {
    if (!orgsByUser[m.user_id]) orgsByUser[m.user_id] = [];
    orgsByUser[m.user_id].push({
      name: orgNameById[m.org_id] ?? m.org_id,
      role: m.role,
    });
  });

  return (
    <>
      <div className={s.toolbar}>
        <span className={s.toolbarRight}>
          {profiles?.length ?? 0} registered user{profiles?.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className={s.card}>
        {(profiles ?? []).length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>👥</div>
            <div className={s.emptyText}>No users yet</div>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Farm(s)</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p) => {
                const userOrgs = orgsByUser[p.id] ?? [];
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.full_name ?? "—"}</div>
                      {p.is_admin && (
                        <span className={`${s.badge} ${s.badgeRed}`} style={{ fontSize: 10, marginTop: 3 }}>
                          Platform Admin
                        </span>
                      )}
                    </td>
                    <td>
                      {userOrgs.length > 0 ? (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {userOrgs.map((o, i) => (
                            <span key={i} className={`${s.badge} ${s.badgeGray}`} style={{ fontSize: 10 }}>
                              {o.role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: 12 }}>No org</span>
                      )}
                    </td>
                    <td>
                      {userOrgs.length > 0 ? (
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          {userOrgs.map((o) => o.name).join(", ")}
                        </div>
                      ) : "—"}
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>
                      {fmtDate(p.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
