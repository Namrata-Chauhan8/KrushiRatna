"use client";

import { useState } from "react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getMonthlyOrderTrend, niceCeiling } from "@/lib/chart-data";
import { cn } from "@/lib/cn";
import type { Order } from "@/types";

const MONTHS_SHOWN = 6;

/**
 * Orders placed per month, trailing six months.
 *
 * A single series encoding magnitude — sequential color (one hue), and per
 * `marks-and-anatomy.md` a lone series needs no legend box: the card title
 * already says what's plotted.
 */
export function OrdersTrendChart({ orders }: { orders: Order[] }) {
  const points = getMonthlyOrderTrend(orders, MONTHS_SHOWN);
  const maxCount = Math.max(...points.map((point) => point.count));
  const ceiling = niceCeiling(maxCount);
  const [hovered, setHovered] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <ChartCard
        title="Orders trend"
        description="Orders placed in each of the last six months."
        chart={<EmptyState title="No orders yet" />}
        table={<EmptyState title="No orders yet" />}
      />
    );
  }

  const chart = (
    <div className="grid grid-cols-[32px_1fr] gap-x-2">
      {/* Y-axis ticks: max, half and zero, aligned to the gridlines below. */}
      <div className="flex h-44 flex-col justify-between pb-px text-right text-[11px] text-faint tabular-nums">
        <span>{ceiling}</span>
        <span>{Math.round(ceiling / 2)}</span>
        <span>0</span>
      </div>

      <div className="relative h-44">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
        <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line" />

        <div className="absolute inset-0 flex items-end justify-between gap-1.5 px-1">
          {points.map((point) => {
            const heightPercent = (point.count / ceiling) * 100;
            const isHovered = hovered === point.key;

            return (
              <div
                key={point.key}
                tabIndex={0}
                role="img"
                aria-label={`${point.fullLabel}: ${point.count} ${point.count === 1 ? "order" : "orders"}`}
                className="relative flex h-full flex-1 items-end justify-center focus:outline-none"
                onMouseEnter={() => setHovered(point.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(point.key)}
                onBlur={() => setHovered(null)}
              >
                <div
                  aria-hidden
                  className={cn(
                    "w-6 max-w-full rounded-t-[4px] bg-brand transition-opacity",
                    isHovered && "opacity-85 ring-2 ring-brand/40",
                  )}
                  style={{
                    height: `${heightPercent}%`,
                    minHeight: point.count > 0 ? 3 : 0,
                  }}
                />

                {isHovered ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-pop"
                  >
                    <span className="tabular-nums">{point.count}</span>{" "}
                    {point.count === 1 ? "order" : "orders"}
                    <span className="absolute top-full left-1/2 -mt-1 size-2 -translate-x-1/2 rotate-45 bg-ink" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div />
      <div className="flex justify-between gap-1.5 px-1 pt-2 text-center text-[11px] text-muted">
        {points.map((point) => (
          <span key={point.key} className="flex-1 truncate">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );

  const table = (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className="py-2 pr-4 font-semibold text-muted">
            Month
          </th>
          <th scope="col" className="py-2 text-right font-semibold text-muted">
            Orders
          </th>
        </tr>
      </thead>
      <tbody>
        {points.map((point) => (
          <tr key={point.key} className="border-b border-line/70 last:border-0">
            <td className="py-2 pr-4">{point.fullLabel}</td>
            <td className="py-2 text-right tabular-nums">{point.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartCard
      title="Orders trend"
      description="Orders placed in each of the last six months."
      chart={chart}
      table={table}
    />
  );
}
