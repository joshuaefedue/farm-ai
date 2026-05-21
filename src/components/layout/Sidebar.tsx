"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { useOrg } from "@/contexts/OrgContext";

type Route = string;

interface NavItemProps {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  count?: number | string;
  dot?: boolean;
  soon?: boolean;
  onClick?: () => void;
  sub?: boolean;
}

function NavItem({ icon, label, active, disabled, count, dot, soon, onClick, sub }: NavItemProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={cn(
        "w-full flex items-center gap-2 rounded-[6px] text-left transition-colors",
        sub ? "text-xs py-1.5 px-2 pl-8" : "text-sm py-1.5 px-2",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer",
        active
          ? "bg-sidebar-active text-sidebar-fg font-medium"
          : "text-[rgba(232,228,219,0.7)] hover:bg-sidebar-hover hover:text-sidebar-fg"
      )}
    >
      {icon && (
        <span className={cn("shrink-0", active ? "text-sidebar-fg" : "text-[rgba(232,228,219,0.5)]")}>
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {soon && (
        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.08)] text-[rgba(232,228,219,0.5)]">
          Soon
        </span>
      )}
      {count !== undefined && (
        <span className="ml-auto text-[11px] font-medium px-1.5 py-0.5 min-w-[18px] text-center rounded-full bg-[rgba(255,255,255,0.1)] text-[rgba(232,228,219,0.6)]">
          {count}
        </span>
      )}
      {dot && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
      )}
    </button>
  );
}

function NavSection({ children }: { children: React.ReactNode }) {
  return <div className="mb-1">{children}</div>;
}

function NavLabel({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div className="flex items-center justify-between px-2 pt-4 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted">
        {children}
      </span>
      {badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255,200,80,0.15)] text-[#f6c55a]">
          {badge}
        </span>
      )}
    </div>
  );
}

interface SidebarProps {
  route: Route;
  setRoute: (r: Route) => void;
  theme: string;
  setTheme: (t: string) => void;
}

export function Sidebar({ route, setRoute }: SidebarProps) {
  const { org, orgs, switchOrg, user, profile, role, signOut } = useOrg();
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isPoultryOpen =
    route === "batches" ||
    route.startsWith("batch:") ||
    ["vaccinations", "sales", "feed", "mortality", "eggs", "houses"].includes(route);

  // Display name helpers
  const orgName    = org?.name ?? "My Farm";
  const orgSub     = org ? `${org.state ?? ""}${org.lga ? " · " + org.lga : ""}` : "—";
  const userName   = profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const userInitials = userName.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();
  const userRole   = role ?? "member";

  return (
    <aside className="w-[232px] shrink-0 flex flex-col h-full bg-sidebar-bg border-r border-sidebar-border overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <div className="w-7 h-7 rounded-[8px] bg-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
          A
        </div>
        <div>
          <div className="text-sidebar-fg text-sm font-semibold leading-none">Acre</div>
          <div className="text-[rgba(232,228,219,0.4)] text-[10.5px] mt-0.5">Farm OS · v3.4</div>
        </div>
      </div>

      {/* Farm / org switcher */}
      <div className="relative mx-3 mb-3">
        <button
          className="w-full flex items-center gap-2 rounded-[8px] px-2.5 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] transition-colors text-left"
          onClick={() => setShowOrgMenu(!showOrgMenu)}
        >
          <div className="w-5 h-5 rounded bg-accent shrink-0 flex items-center justify-center text-white text-[9px] font-bold">
            {orgName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sidebar-fg text-xs font-medium truncate">{orgName}</div>
            <div className="text-[rgba(232,228,219,0.4)] text-[10px] truncate">{orgSub}</div>
          </div>
          <Icons.ChevDown size={12} className="text-sidebar-muted shrink-0" />
        </button>
        {showOrgMenu && orgs.length > 1 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
            background: "#1a1812", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: 4,
          }}>
            {orgs.map((o) => (
              <button
                key={o.id}
                onClick={() => { switchOrg(o.id); setShowOrgMenu(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", borderRadius: 6, fontSize: 12,
                  background: org?.id === o.id ? "rgba(255,255,255,0.08)" : "transparent",
                  color: "rgba(232,228,219,0.85)", cursor: "pointer", border: "none",
                  textAlign: "left",
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 4, background: "var(--accent)", display: "grid", placeItems: "center", color: "white", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                  {o.name.charAt(0)}
                </div>
                <span className="truncate">{o.name}</span>
                {org?.id === o.id && <Icons.Check size={11} style={{ flexShrink: 0, color: "var(--accent)" }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4">
        <NavSection>
          <NavItem
            icon={<Icons.Dashboard size={15} />}
            label="Overview"
            active={route === "dashboard"}
            onClick={() => setRoute("dashboard")}
          />
        </NavSection>

        <NavLabel>Livestock</NavLabel>

        <NavSection>
          <NavItem
            icon={<Icons.Chick size={15} />}
            label="Poultry"
            count={6}
            active={isPoultryOpen}
            onClick={() => setRoute("batches")}
          />
          {isPoultryOpen && (
            <div className="mt-0.5 mb-0.5">
              <NavItem label="Batches" sub active={route === "batches" || route.startsWith("batch:")} onClick={() => setRoute("batches")} />
              <NavItem label="Houses" sub active={route === "houses"} onClick={() => setRoute("houses")} />
              <NavItem label="Feed & water" sub active={route === "feed"} onClick={() => setRoute("feed")} />
              <NavItem label="Vaccinations" sub active={route === "vaccinations"} dot onClick={() => setRoute("vaccinations")} />
              <NavItem label="Mortality" sub active={route === "mortality"} onClick={() => setRoute("mortality")} />
              <NavItem label="Egg production" sub active={route === "eggs"} onClick={() => setRoute("eggs")} />
              <NavItem label="Sales" sub active={route === "sales"} onClick={() => setRoute("sales")} />
            </div>
          )}
          <NavItem icon={<Icons.Fish size={15} />} label="Fish" disabled soon />
          <NavItem icon={<Icons.Snail size={15} />} label="Snail" disabled soon />
          <NavItem icon={<Icons.Crops size={15} />} label="Crops" disabled soon />
        </NavSection>

        <NavLabel badge="Sync">Operations</NavLabel>

        <NavSection>
          <NavItem icon={<Icons.Inventory size={15} />} label="Inventory" count={19} active={route === "inventory"} onClick={() => setRoute("inventory")} />
          <NavItem icon={<Icons.Truck size={15} />} label="Procurement" dot active={route === "procurement"} onClick={() => setRoute("procurement")} />
          <NavItem icon={<Icons.Money size={15} />} label="Finance" active={route === "finance"} onClick={() => setRoute("finance")} />
          <NavItem icon={<Icons.People size={15} />} label="HR & Payroll" count={14} active={route === "hr"} onClick={() => setRoute("hr")} />
          <NavItem icon={<Icons.Cart size={15} />} label="Marketplace" active={route === "marketplace"} onClick={() => setRoute("marketplace")} />
          <NavItem icon={<Icons.Chat size={15} />} label="CRM" count={4} active={route === "crm"} onClick={() => setRoute("crm")} />
          <NavItem icon={<Icons.Truck size={15} />} label="Logistics" active={route === "logistics"} onClick={() => setRoute("logistics")} />
          <NavItem icon={<Icons.Sparkles size={15} />} label="AI & Automation" active={route === "ai"} onClick={() => setRoute("ai")} />
        </NavSection>

        <NavLabel>System</NavLabel>
        <NavSection>
          <NavItem icon={<Icons.Phone size={15} />} label="Field app preview" />
          <NavItem icon={<Icons.Settings size={15} />} label="Settings" active={route === "settings"} onClick={() => setRoute("settings")} />
        </NavSection>
      </nav>

      {/* Footer / user */}
      <div className="relative border-t border-sidebar-border px-3 py-3">
        {showUserMenu && (
          <div style={{
            position: "absolute", bottom: "calc(100% + 4px)", left: 8, right: 8, zIndex: 50,
            background: "#1a1812", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: 4,
          }}>
            <button
              onClick={() => setRoute("settings")}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, fontSize: 12, color: "rgba(232,228,219,0.85)", background: "transparent", cursor: "pointer", border: "none", textAlign: "left" }}
            >
              <Icons.Settings size={13} /> Settings
            </button>
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
            <button
              onClick={signOut}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, fontSize: 12, color: "rgba(229,100,80,0.9)", background: "transparent", cursor: "pointer", border: "none", textAlign: "left" }}
            >
              <Icons.X size={13} /> Sign out
            </button>
          </div>
        )}
        <button
          className="w-full flex items-center gap-2.5"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.15)] flex items-center justify-center text-sidebar-fg text-[11px] font-semibold shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sidebar-fg text-xs font-medium truncate">{userName}</div>
            <div className="text-sidebar-muted text-[10px] capitalize">{userRole}</div>
          </div>
          <Icons.More size={13} className="text-sidebar-muted shrink-0" />
        </button>
      </div>
    </aside>
  );
}
