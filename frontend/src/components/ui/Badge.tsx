import clsx from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  primary:
    "bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100",
  success:
    "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  warning:
    "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  error:
    "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Provider-specific badges
type ProviderBadgeProps = {
  provider: "sora" | "veo";
  className?: string;
};

export function ProviderBadge({ provider, className }: ProviderBadgeProps) {
  const styles =
    provider === "sora"
      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      : "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles,
        className
      )}
    >
      {provider === "sora" ? "Sora" : "Veo"}
    </span>
  );
}

// Status indicator dot
type StatusDotProps = {
  status: "pending" | "generating" | "completed" | "failed";
  className?: string;
};

const statusColors: Record<StatusDotProps["status"], string> = {
  pending: "bg-slate-400",
  generating: "bg-yellow-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={clsx("h-1.5 w-1.5 rounded-full", statusColors[status], className)}
    />
  );
}
