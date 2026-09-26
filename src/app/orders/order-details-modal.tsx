"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { ORDER_STATUS_OPTIONS } from "@/lib/options";
import type { Order, OrderStatus } from "@/types";

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  /** Applied immediately and persisted; the dashboard counters follow. */
  onStatusChange: (status: OrderStatus) => void;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
}: OrderDetailsModalProps) {
  const itemsTotal =
    order?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;

  return (
    <Modal
      open={order !== null}
      onClose={onClose}
      title={order ? `Order #${order.id}` : "Order"}
      description="Full breakdown of the products, quantities and pricing on this order."
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {order ? (
        <div className="space-y-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Detail label="Order ID">
              <span className="tabular-nums">{order.id}</span>
            </Detail>
            <Detail label="Status">
              <Select
                label={`Status for order ${order.id}`}
                hideLabel
                value={order.status}
                options={ORDER_STATUS_OPTIONS}
                className="max-w-48"
                onChange={(event) =>
                  onStatusChange(event.target.value as OrderStatus)
                }
              />
            </Detail>
            <Detail label="Company">{order.companyName || "-"}</Detail>
            <Detail label="Farmer">{order.farmerName || "-"}</Detail>
            <Detail label="Created">{formatDateTime(order.createdAt)}</Detail>
            <Detail label="Last updated">{formatDateTime(order.updatedAt)}</Detail>
          </dl>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-ink">Products</h3>
            <div className="scroll-slim overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-max border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-muted">
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-semibold tracking-wide text-muted uppercase"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-right text-xs font-semibold tracking-wide text-muted uppercase"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-right text-xs font-semibold tracking-wide text-muted uppercase"
                    >
                      Rate
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-right text-xs font-semibold tracking-wide text-muted uppercase"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-b border-line/70 last:border-0"
                    >
                      <td className="px-4 py-2.5">{item.name}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {formatNumber(item.quantity)} {item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-line bg-surface-muted">
                    <th
                      scope="row"
                      colSpan={3}
                      className="px-4 py-2.5 text-right text-sm font-medium text-muted"
                    >
                      Order value
                    </th>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold tabular-nums">
                      {formatCurrency(itemsTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <div className="flex items-center justify-between rounded-xl border border-line bg-surface-muted px-4 py-3">
            <span className="text-sm font-medium text-muted">Final price</span>
            <span className="text-lg font-bold tabular-nums">
              {order.finalPrice === null
                ? "Not settled yet"
                : formatCurrency(order.finalPrice)}
            </span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
