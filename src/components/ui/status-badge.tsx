import { cn } from "@/lib/cn";
import { ORDER_STATUS_LABELS, RECORD_STATUS_LABELS } from "@/lib/labels";
import type { OrderStatus, Status } from "@/types";

/** Catalogue rows use soft, outlined pills. */
const RECORD_TONES: Record<Status, string> = {
  active: "bg-success-soft text-success ring-success/25",
  inactive: "bg-surface-muted text-muted ring-line",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        RECORD_TONES[status],
      )}
    >
      {RECORD_STATUS_LABELS[status]}
    </span>
  );
}

/** Orders use solid pills so the lifecycle reads at a glance. */
const ORDER_TONES: Record<OrderStatus, string> = {
  pending: "bg-warning text-white",
  running: "bg-info text-white",
  completed: "bg-success text-white",
  cancelled: "bg-danger text-white",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        ORDER_TONES[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
