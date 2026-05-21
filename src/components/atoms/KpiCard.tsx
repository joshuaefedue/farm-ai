import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Sparkline } from "./Sparkline";

type TrendDir = "up" | "down";

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendDir?: TrendDir;
  hint?: string;
  sparkData?: number[];
  sparkColor?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  unit,
  trend,
  trendDir,
  hint,
  sparkData,
  sparkColor,
  className,
}: KpiCardProps) {
  return (
    <div className={cn("bg-card shadow-card rounded p-5 flex flex-col gap-1", className)}>
      <div className="text-xs font-semibold text-muted uppercase tracking-[0.05em]">
        {label}
      </div>

      <div className="tnum text-3xl font-bold text-fg mt-0.5 leading-none">
        {value}
        {unit && (
          <span className="text-xs font-normal text-muted ml-1.5">{unit}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-0.5">
        {trend && trendDir && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              trendDir === "up" ? "text-success" : "text-danger"
            )}
          >
            {trendDir === "up" ? (
              <Icons.TrendUp size={12} />
            ) : (
              <Icons.TrendDown size={12} />
            )}
            {trend}
          </span>
        )}
        {hint && <span className="text-xs text-faint">{hint}</span>}
      </div>

      {sparkData && (
        <div className="mt-2">
          <Sparkline data={sparkData} color={sparkColor ?? "var(--accent)"} />
        </div>
      )}
    </div>
  );
}
