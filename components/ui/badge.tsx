import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const variantClasses = {
  allowed: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  avoid: "bg-red-50 text-red-700 ring-red-600/15",
  moderation: "bg-amber-50 text-amber-700 ring-amber-600/15",
  default: "bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)] ring-[var(--color-border)]",
  info: "bg-sage-50 text-sage-700 ring-sage-600/15",
  accent: "bg-coral-50 text-coral-600 ring-coral-500/15",
} as const;

type BadgeVariant = keyof typeof variantClasses;

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5",
        "text-xs font-medium ring-1 ring-inset",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeVariant };
