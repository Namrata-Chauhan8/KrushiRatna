/**
 * Aggregation for the dashboard's charts.
 *
 * Kept separate from the components so the numbers can be unit-reasoned-about
 * independent of rendering: each function takes the live `orders` array and
 * returns plain, chart-ready rows.
 */

import { MONTHS } from "@/lib/format";
import type { Order, OrderStatus } from "@/types";

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "running",
  "completed",
  "cancelled",
];

export interface StatusBreakdownRow {
  status: OrderStatus;
  count: number;
  /** 0–100, rounded; shares sum to ~100 modulo rounding. */
  percent: number;
}

/** Order counts by status, in the fixed pipeline order (not sorted by size). */
export function getStatusBreakdown(orders: Order[]): StatusBreakdownRow[] {
  const total = orders.length;

  return STATUS_ORDER.map((status) => {
    const count = orders.filter((order) => order.status === status).length;
    return {
      status,
      count,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });
}

export interface MonthlyTrendPoint {
  /** `2026-8` — unique per calendar month, used only for bucketing. */
  key: string;
  /** `Apr '26` — compact axis label that stays correct across a year boundary. */
  label: string;
  /** `April 2026` — for the accessible name, where brevity doesn't matter. */
  fullLabel: string;
  count: number;
}

/**
 * Orders created per calendar month (UTC) for the trailing `months` months,
 * ending at `reference`'s month. Zero-filled, oldest first.
 */
export function getMonthlyOrderTrend(
  orders: Order[],
  months = 6,
  reference: Date = new Date(),
): MonthlyTrendPoint[] {
  const points: MonthlyTrendPoint[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - offset, 1),
    );
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    points.push({
      key: `${year}-${month}`,
      label: `${MONTHS[month]} '${String(year).slice(2)}`,
      fullLabel: `${MONTHS[month]} ${year}`,
      count: 0,
    });
  }

  const indexByKey = new Map(points.map((point, index) => [point.key, index]));

  for (const order of orders) {
    const created = new Date(order.createdAt);
    if (Number.isNaN(created.getTime())) continue;

    const key = `${created.getUTCFullYear()}-${created.getUTCMonth()}`;
    const index = indexByKey.get(key);
    if (index !== undefined) points[index].count += 1;
  }

  return points;
}

/** Round a max value up to a clean axis ceiling: 4, 6, 10, 20, 50, 100, ... */
export function niceCeiling(max: number): number {
  if (max <= 0) return 4;

  const step = max <= 10 ? 2 : max <= 20 ? 5 : max <= 50 ? 10 : max <= 100 ? 20 : 50;
  return Math.ceil(max / step) * step;
}
