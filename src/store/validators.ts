/**
 * Runtime guards for data coming back out of `localStorage`.
 *
 * Stored JSON is outside the type system's reach — it can be stale from an
 * older build, hand-edited, or corrupted — so every collection is checked
 * before it is trusted. A collection that fails falls back to its seed.
 */

import type {
  Category,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Status,
  SubCategory,
} from "@/types";

type Unknown = Record<string, unknown>;

const isObject = (value: unknown): value is Unknown =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

const RECORD_STATUSES: Status[] = ["active", "inactive"];
const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "running",
  "completed",
  "cancelled",
];

const isStatus = (value: unknown): value is Status =>
  RECORD_STATUSES.includes(value as Status);

const isOrderStatus = (value: unknown): value is OrderStatus =>
  ORDER_STATUSES.includes(value as OrderStatus);

/** Fields every catalogue record shares. */
function hasRecordShape(value: unknown): value is Unknown {
  return (
    isObject(value) &&
    isNumber(value.id) &&
    isString(value.name) &&
    isString(value.image) &&
    isStatus(value.status) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

/** Builds an array guard from a single-item guard. */
function arrayOf<T>(isItem: (value: unknown) => boolean) {
  return (value: unknown): value is T[] =>
    Array.isArray(value) && value.every(isItem);
}

export const isCategoryArray = arrayOf<Category>(
  (value) =>
    hasRecordShape(value) &&
    // Absent on catalogues saved before hiding existed; treated as visible.
    (value.hidden === undefined || typeof value.hidden === "boolean"),
);

export const isSubCategoryArray = arrayOf<SubCategory>(
  (value) => hasRecordShape(value) && isNumber(value.categoryId),
);

export const isProductArray = arrayOf<Product>(
  (value) =>
    hasRecordShape(value) &&
    isNumber(value.categoryId) &&
    isNumber(value.subCategoryId) &&
    isNumber(value.price) &&
    isNumber(value.stock) &&
    isString(value.unit) &&
    isString(value.description),
);

const isOrderItem = (value: unknown): value is OrderItem =>
  isObject(value) &&
  isNumber(value.productId) &&
  isString(value.name) &&
  isNumber(value.quantity) &&
  isString(value.unit) &&
  isNumber(value.price);

export const isOrderArray = arrayOf<Order>(
  (value) =>
    isObject(value) &&
    isNumber(value.id) &&
    isString(value.companyName) &&
    isString(value.farmerName) &&
    Array.isArray(value.items) &&
    value.items.every(isOrderItem) &&
    (value.finalPrice === null || isNumber(value.finalPrice)) &&
    isOrderStatus(value.status) &&
    isString(value.createdAt) &&
    isString(value.updatedAt),
);
