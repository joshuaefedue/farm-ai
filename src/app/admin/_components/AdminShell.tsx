"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import s from "../admin.module.css";

interface AdminShellProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
}

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard",   icon: "▣" },
  { href: "/admin/farms",     label: "Farm Owners",  icon: "🏡" },
  { href: "/admin/users",     label: "All Users",    icon: "👥" },
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminShell({ children, adminName, adminEmail }: AdminShellProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const activeHref = NAV.find((n) => pathname.startsWith(n.href))?.href ?? "";

  async function handleSignOut() {
    // Clear the session by calling the auth signout
    await fetch("/auth/signout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  // Derive page title
  const pageTitle =
    NAV.find((n) => pathname.startsWith(n.href))?.label ?? "Admin Console";

  return (
    <div className={s.root}>
      {/* ── Sidebar ── */}
      <aside className={s.sidebar}>
        <div className={s.sidebarBrand}>
          <span className={s.brandIcon}>A</span>
          <div>
            <div className={s.brandText}>Acre Farm OS</div>
            <div className={s.brandSub}>Admin Console</div>
          </div>
        </div>

        <nav className={s.nav}>
          <div className={s.navSection}>Platform</div>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${s.navItem} ${pathname.startsWith(item.href) ? s.navActive : ""}`}
            >
              <span className={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={s.sidebarFooter}>
          <span className={s.avatar}>{initials(adminName)}</span>
          <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
            <div className={s.avatarName}>{adminName}</div>
            <div className={s.avatarRole}>Platform Admin</div>
          </div>
          <button
            className={s.signOutBtn}
            onClick={handleSignOut}
            title="Sign out"
          >
            ⏏
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={s.main}>
        <header className={s.topBar}>
          <span className={s.topBarTitle}>{pageTitle}</span>
          <span className={s.adminBadge}>Admin</span>
        </header>
        <main className={s.content}>{children}</main>
      </div>
    </div>
  );
}
