import type { OrderStatus, Status } from "@/types";

/** Display names for the catalogue active/inactive flag. */
export const RECORD_STATUS_LABELS: Record<Status, string> = {
  active: "Active",
  inactive: "Inactive",
};

/** Display names for the order lifecycle. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  cancelled: "Cancelled",
};
