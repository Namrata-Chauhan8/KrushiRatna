"use client";

import { CheckCircle2, Clock, Timer, XCircle, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { getStatusBreakdown } from "@/lib/chart-data";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import type { Order, OrderStatus } from "@/types";

/**
 * Status is state, not identity, so it always carries its own reserved
 * color and — since color alone is never enough to read a status — an icon
 * and a label beside every bar, not just a tint.
 */
const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  pending: Clock,
  running: Timer,
  completed: CheckCircle2,
  cancelled: XCircle,
};

const BAR_FILL: Record<OrderStatus, string> = {
  pending: "bg-warning",
  running: "bg-info",
  completed: "bg-success",
  cancelled: "bg-danger",
};

const LABEL_TEXT: Record<OrderStatus, string> = {
  pending: "text-warning",
  running: "text-info",
  completed: "text-success",
  cancelled: "text-danger",
};

export function StatusBreakdownChart({ orders }: { orders: Order[] }) {
  const rows = getStatusBreakdown(orders);
  const maxCount = Math.max(1, ...rows.map((row) => row.count));
  const [hovered, setHovered] = useState<OrderStatus | null>(null);

  if (orders.length === 0) {
    return (
      <ChartCard
        title="Orders by status"
        description="Share of every order currently in the pipeline."
        chart={<EmptyState title="No orders yet" />}
        table={<EmptyState title="No orders yet" />}
      />
    );
  }

  const chart = (
    <ul className="space-y-5">
      {rows.map((row) => {
        const Icon = STATUS_ICONS[row.status];
        const widthPercent = (row.count / maxCount) * 100;

        return (
          <li key={row.status} className="flex items-center gap-3">
            <span
              className={cn(
                "flex w-[104px] shrink-0 items-center gap-1.5 text-sm font-medium",
                LABEL_TEXT[row.status],
              )}
            >
              <Icon aria-hidden className="size-4 shrink-0" />
              {ORDER_STATUS_LABELS[row.status]}
            </span>

            {/* The whole track is the hit/focus target, not just the fill —
                so a status with a low count is still easy to point at. */}
            <div
              tabIndex={0}
              role="img"
              aria-label={`${ORDER_STATUS_LABELS[row.status]}: ${row.count} ${row.count === 1 ? "order" : "orders"}, ${row.percent}% of total`}
              className="relative h-6 flex-1 rounded-md bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              onMouseEnter={() => setHovered(row.status)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(row.status)}
              onBlur={() => setHovered(null)}
            >
              <div
                aria-hidden
                className={cn(
                  "h-full rounded-r-[4px] transition-[width,opacity]",
                  BAR_FILL[row.status],
                  hovered === row.status && "opacity-85",
                )}
                style={{ width: `${row.count > 0 ? Math.max(widthPercent, 3) : 0}%` }}
              />

              {hovered === row.status ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-8 left-0 z-10 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-pop"
                >
                  <span className="tabular-nums">{row.count}</span>{" "}
                  {row.count === 1 ? "order" : "orders"} · {row.percent}%
                  {/* Points down at the bar it belongs to, so it reads
                      unambiguously even this close to the row above. */}
                  <span className="absolute top-full left-3 -mt-1 size-2 rotate-45 bg-ink" />
                </div>
              ) : null}
            </div>

            <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">
              {row.count}
            </span>
          </li>
        );
      })}
    </ul>
  );

  const table = (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className="py-2 pr-4 font-semibold text-muted">
            Status
          </th>
          <th scope="col" className="py-2 pr-4 text-right font-semibold text-muted">
            Orders
          </th>
          <th scope="col" className="py-2 text-right font-semibold text-muted">
            Share
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.status} className="border-b border-line/70 last:border-0">
            <td className="py-2 pr-4">{ORDER_STATUS_LABELS[row.status]}</td>
            <td className="py-2 pr-4 text-right tabular-nums">{row.count}</td>
            <td className="py-2 text-right tabular-nums">{row.percent}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartCard
      title="Orders by status"
      description="Share of every order currently in the pipeline."
      chart={chart}
      table={table}
    />
  );
}
