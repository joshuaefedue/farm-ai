import { cn } from "@/lib/utils";

type BadgeVariant = "accent" | "warning" | "danger" | "success" | "info" | "outline" | "default";

const variantStyles: Record<BadgeVariant, string> = {
  accent:  "bg-accent-subtle text-accent",
  warning: "bg-warning-subtle text-warning",
  danger:  "bg-danger-subtle text-danger",
  success: "bg-success-subtle text-success",
  info:    "bg-info-subtle text-info",
  outline: "border border-border bg-transparent text-muted",
  default: "bg-subtle text-muted",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "default", children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-2xs font-medium leading-snug",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
