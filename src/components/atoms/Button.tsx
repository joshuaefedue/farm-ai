import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "accent" | "ghost";
type ButtonSize = "sm" | "md";

const variantStyles: Record<ButtonVariant, string> = {
  default: "border border-border bg-card text-fg hover:bg-hover",
  accent:  "border-transparent bg-accent text-accent-fg hover:opacity-90",
  ghost:   "border-transparent bg-transparent text-muted hover:text-fg hover:bg-hover",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-2xs gap-1",
  md: "h-8 px-3 text-sm gap-1.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center rounded-sm font-medium transition-colors cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
