"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface TopbarProps {
  crumbs: string[];
  theme: string;
  setTheme: (t: string) => void;
}

function IconBtn({
  children,
  badge,
  title,
  onClick,
}: {
  children: React.ReactNode;
  badge?: number;
  title?: string;
  onClick?: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="relative w-8 h-8 flex items-center justify-center rounded-sm text-muted hover:text-fg hover:bg-hover transition-colors"
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

export function Topbar({ crumbs, theme, setTheme }: TopbarProps) {
  return (
    <div className="h-12 flex items-center gap-3 px-5 border-b border-border bg-card shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm text-muted">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <Icons.ChevRight size={12} className="text-faint" />}
            <span className={cn(i === crumbs.length - 1 ? "text-fg font-medium" : "")}>
              {c}
            </span>
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <button className="hidden md:flex items-center gap-2 h-8 pl-3 pr-2 rounded-sm border border-border bg-subtle text-muted text-sm hover:border-border-strong transition-colors">
        <Icons.Search size={13} />
        <span className="text-sm text-faint">Search batches, orders…</span>
        <kbd className="ml-2 text-2xs bg-card border border-border rounded px-1 py-0.5 font-mono text-faint">
          ⌘K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <IconBtn title="Field app preview">
          <Icons.Phone size={14} />
        </IconBtn>
        <IconBtn
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Icons.Sun size={14} /> : <Icons.Moon size={14} />}
        </IconBtn>
        <IconBtn title="Alerts" badge={3}>
          <Icons.Bell size={14} />
        </IconBtn>
      </div>
    </div>
  );
}
