"use client";

import { useId, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { NewOrderInput } from "@/store/admin-store";
import type { Order, OrderItem, Product } from "@/types";

/** Only orders that are still open can take new lines. */
const OPEN_STATUSES = new Set(["pending", "running"]);

const NEW_ORDER = "new";

interface AddToOrderModalProps {
  product: Product;
  orders: Order[];
  onClose: () => void;
  onCreateOrder: (input: NewOrderInput) => void;
  onAddToOrder: (orderId: number, item: OrderItem) => void;
}

type Errors = Partial<Record<"quantity" | "farmerName" | "order", string>>;

/**
 * Turns a catalogue row into an order line.
 *
 * The line snapshots the product's name, unit and price, so later edits to
 * the product never rewrite the history of an order that already exists.
 */
export function AddToOrderModal({
  product,
  orders,
  onClose,
  onCreateOrder,
  onAddToOrder,
}: AddToOrderModalProps) {
  const formId = useId();

  const openOrders = useMemo(
    () => orders.filter((order) => OPEN_STATUSES.has(order.status)),
    [orders],
  );

  const [target, setTarget] = useState<string>(NEW_ORDER);
  const [companyName, setCompanyName] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const isNewOrder = target === NEW_ORDER;

  const orderOptions = useMemo(
    () => [
      { value: NEW_ORDER, label: "Start a new order" },
      ...openOrders.map((order) => ({
        value: String(order.id),
        label: `Order #${order.id}${order.farmerName ? ` · ${order.farmerName}` : ""}`,
      })),
    ],
    [openOrders],
  );

  const parsedQuantity = Number(quantity);
  const lineTotal =
    Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? parsedQuantity * product.price
      : 0;

  const validate = (): Errors => {
    const next: Errors = {};

    if (quantity.trim() === "") {
      next.quantity = "Quantity is required.";
    } else if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      next.quantity = "Enter a quantity greater than 0.";
    } else if (parsedQuantity > product.stock) {
      next.quantity = `Only ${formatNumber(product.stock)} ${product.unit} in stock.`;
    }

    if (isNewOrder && farmerName.trim() === "") {
      next.farmerName = "Farmer name is required.";
    }

    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const item: OrderItem = {
      productId: product.id,
      name: product.name,
      quantity: parsedQuantity,
      unit: product.unit,
      price: product.price,
    };

    if (isNewOrder) {
      onCreateOrder({
        companyName: companyName.trim(),
        farmerName: farmerName.trim(),
        item,
      });
    } else {
      onAddToOrder(Number(target), item);
    }

    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add to order"
      description={`Put ${product.name} on a new or open order.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            {isNewOrder ? "Create order" : "Add to order"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-muted px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {product.name}
            </p>
            <p className="text-xs text-muted">
              {formatCurrency(product.price)} per {product.unit} ·{" "}
              {formatNumber(product.stock)} {product.unit} in stock
            </p>
          </div>
        </div>

        <Select
          label="Order"
          required
          value={target}
          options={orderOptions}
          hint={
            openOrders.length === 0
              ? "No open orders yet, so this starts the first one."
              : undefined
          }
          onChange={(event) => setTarget(event.target.value)}
        />

        {isNewOrder ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Farmer name"
              required
              value={farmerName}
              maxLength={80}
              placeholder="e.g. Mayur Bharadiya"
              error={errors.farmerName}
              onChange={(event) => setFarmerName(event.target.value)}
            />
            <FormInput
              label="Company name"
              value={companyName}
              maxLength={80}
              placeholder="Optional"
              hint="Leave blank for an individual farmer."
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </div>
        ) : null}

        <FormInput
          label={`Quantity (${product.unit})`}
          required
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={quantity}
          placeholder="0"
          error={errors.quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />

        <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
          <span className="text-sm text-muted">Line total</span>
          <span className="text-base font-semibold tabular-nums">
            {formatCurrency(lineTotal)}
          </span>
        </div>
      </form>
    </Modal>
  );
}
