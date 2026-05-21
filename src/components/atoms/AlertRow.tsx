import { cn } from "@/lib/utils";
import { Icons, IconName } from "@/components/icons";
import { AlertLevel } from "@/lib/data";

const dotStyles: Record<AlertLevel, string> = {
  danger:  "bg-danger-subtle text-danger",
  warning: "bg-warning-subtle text-warning",
  info:    "bg-info-subtle text-info",
  success: "bg-success-subtle text-success",
};

interface AlertRowProps {
  level: AlertLevel;
  icon: IconName;
  title: string;
  meta: string;
  time: string;
  last?: boolean;
}

export function AlertRow({ level, icon, title, meta, time, last }: AlertRowProps) {
  const IconCmp = Icons[icon] ?? Icons.Info;
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3",
        !last && "border-b border-border"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          dotStyles[level]
        )}
      >
        <IconCmp size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-fg leading-snug">{title}</div>
        <div className="text-xs text-muted mt-0.5 leading-snug">{meta}</div>
      </div>
      <div className="text-2xs text-faint whitespace-nowrap shrink-0 mt-0.5">{time}</div>
    </div>
  );
}
