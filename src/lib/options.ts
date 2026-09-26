import type { SelectOption } from "@/components/ui/select";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import type { OrderStatus } from "@/types";

export const STATUS_OPTIONS: SelectOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const ORDER_STATUS_OPTIONS: SelectOption[] = (
  ["pending", "running", "completed", "cancelled"] satisfies OrderStatus[]
).map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status] }));

/** Units a product can be priced in. */
export const UNIT_OPTIONS: SelectOption[] = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "quintal", label: "Quintal" },
  { value: "box", label: "Box" },
  { value: "bunch", label: "Bunch" },
  { value: "bag", label: "Bag" },
];
