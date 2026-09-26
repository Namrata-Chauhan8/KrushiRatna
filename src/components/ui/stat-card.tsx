import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

/** Accent used for the icon tile; mirrors the tone of the metric. */
export type StatTone = "brand" | "success" | "danger" | "info" | "warning";

const TONES: Record<StatTone, string> = {
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
};

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: StatTone;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
}: StatCardProps) {
  return (
    <article className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-5 py-5 shadow-card">
      <div className="min-w-0 space-y-2">
        <p className="truncate text-sm text-muted">{label}</p>
        <p className="text-3xl font-bold tracking-tight text-ink tabular-nums">
          {formatNumber(value)}
        </p>
      </div>
      <span
        aria-hidden
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          TONES[tone],
        )}
      >
        <Icon className="size-5" />
      </span>
    </article>
  );
}
