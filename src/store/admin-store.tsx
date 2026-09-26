"use client";

/**
 * The application's data layer.
 *
 * There is no backend, so each collection is persisted to its own
 * `localStorage` key (see `src/lib/storage.ts`) and read through
 * `useSyncExternalStore`. Edits survive refreshes, tab restarts and the
 * simulated logout; the seed data in `src/data` is only used the first time
 * the app runs, or when the user explicitly resets.
 *
 * Every page reads and writes through this provider, so an add on the Category
 * page is immediately visible in the Subcategory dropdown, the Product filters
 * and the dashboard counters.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";


import { nowIso } from "@/lib/format";
import { createPersistedCollection, STORAGE_KEYS } from "@/lib/storage";
import {
  isCategoryArray,
  isOrderArray,
  isProductArray,
  isSubCategoryArray,
} from "@/store/validators";
import type {
  Category,
  CategoryInput,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductInput,
  SubCategory,
  SubCategoryInput,
} from "@/types";

/* Module-level stores: one per localStorage key, shared by every component. */
const categories: Category[] = [];
const subCategories: SubCategory[] = [];
const products: Product[] = [];
const orders: Order[] = [];


const categoryStore = createPersistedCollection<Category>(
  STORAGE_KEYS.categories,
  categories,
  isCategoryArray,
);
const subCategoryStore = createPersistedCollection<SubCategory>(
  STORAGE_KEYS.subCategories,
  subCategories,
  isSubCategoryArray,
);
const productStore = createPersistedCollection<Product>(
  STORAGE_KEYS.products,
  products,
  isProductArray,
);
const orderStore = createPersistedCollection<Order>(
  STORAGE_KEYS.orders,
  orders,
  isOrderArray,
);

interface AdminStore {
  categories: Category[];
  subCategories: SubCategory[];
  products: Product[];
  orders: Order[];

  /** Categories and subcategories under a hidden category, filtered out. */
  visibleCategories: Category[];
  visibleSubCategories: SubCategory[];
  visibleProducts: Product[];

  addCategory: (input: CategoryInput) => void;
  updateCategory: (id: number, input: CategoryInput) => void;
  /** Hiding replaces deletion: reversible, and nothing is thrown away. */
  setCategoryHidden: (id: number, hidden: boolean) => void;

  addSubCategory: (input: SubCategoryInput) => void;
  updateSubCategory: (id: number, input: SubCategoryInput) => void;
  deleteSubCategory: (id: number) => void;

  addProduct: (input: ProductInput) => void;
  updateProduct: (id: number, input: ProductInput) => void;
  deleteProduct: (id: number) => void;

  updateOrderStatus: (id: number, status: OrderStatus) => void;
  /** Starts a new order holding a single product line. */
  createOrder: (input: NewOrderInput) => void;
  /** Appends a line to an open order, merging into an existing line. */
  addOrderItem: (orderId: number, item: OrderItem) => void;
}

export interface NewOrderInput {
  companyName: string;
  farmerName: string;
  item: OrderItem;
}

const AdminStoreContext = createContext<AdminStore | null>(null);

const nextId = (rows: { id: number }[]) =>
  rows.reduce((highest, row) => Math.max(highest, row.id), 0) + 1;

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const categories = useSyncExternalStore(
    categoryStore.subscribe,
    categoryStore.getSnapshot,
    categoryStore.getServerSnapshot,
  );
  const subCategories = useSyncExternalStore(
    subCategoryStore.subscribe,
    subCategoryStore.getSnapshot,
    subCategoryStore.getServerSnapshot,
  );
  const products = useSyncExternalStore(
    productStore.subscribe,
    productStore.getSnapshot,
    productStore.getServerSnapshot,
  );
  const orders = useSyncExternalStore(
    orderStore.subscribe,
    orderStore.getSnapshot,
    orderStore.getServerSnapshot,
  );

  const addCategory = useCallback((input: CategoryInput) => {
    categoryStore.set((current) => [
      {
        id: nextId(current),
        ...input,
        hidden: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      ...current,
    ]);
  }, []);

  const updateCategory = useCallback((id: number, input: CategoryInput) => {
    categoryStore.set((current) =>
      current.map((category) =>
        category.id === id
          ? { ...category, ...input, updatedAt: nowIso() }
          : category,
      ),
    );
  }, []);

  /**
   * Hiding is the replacement for deleting a category. Nothing is removed —
   * the subcategories and products beneath it stay in storage and come back
   * intact when the category is unhidden; they are simply filtered out of
   * every view while it is hidden.
   */
  const setCategoryHidden = useCallback((id: number, hidden: boolean) => {
    categoryStore.set((current) =>
      current.map((category) =>
        category.id === id
          ? { ...category, hidden, updatedAt: nowIso() }
          : category,
      ),
    );
  }, []);

  const addSubCategory = useCallback((input: SubCategoryInput) => {
    subCategoryStore.set((current) => [
      { id: nextId(current), ...input, createdAt: nowIso(), updatedAt: nowIso() },
      ...current,
    ]);
  }, []);

  const updateSubCategory = useCallback(
    (id: number, input: SubCategoryInput) => {
      subCategoryStore.set((current) =>
        current.map((row) =>
          row.id === id ? { ...row, ...input, updatedAt: nowIso() } : row,
        ),
      );
      // Keep products in step when a subcategory is moved to another category.
      productStore.set((current) =>
        current.map((product) =>
          product.subCategoryId === id
            ? { ...product, categoryId: input.categoryId }
            : product,
        ),
      );
    },
    [],
  );

  const deleteSubCategory = useCallback((id: number) => {
    subCategoryStore.set((current) => current.filter((row) => row.id !== id));
    productStore.set((current) =>
      current.filter((row) => row.subCategoryId !== id),
    );
  }, []);

  const addProduct = useCallback((input: ProductInput) => {
    productStore.set((current) => [
      { id: nextId(current), ...input, createdAt: nowIso(), updatedAt: nowIso() },
      ...current,
    ]);
  }, []);

  const updateProduct = useCallback((id: number, input: ProductInput) => {
    productStore.set((current) =>
      current.map((product) =>
        product.id === id ? { ...product, ...input, updatedAt: nowIso() } : product,
      ),
    );
  }, []);

  const deleteProduct = useCallback((id: number) => {
    productStore.set((current) => current.filter((product) => product.id !== id));
  }, []);

  const updateOrderStatus = useCallback((id: number, status: OrderStatus) => {
    orderStore.set((current) =>
      current.map((order) => {
        if (order.id !== id) return order;

        // A settled order carries its agreed value; anything else is still open.
        const finalPrice =
          status === "completed"
            ? order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              )
            : null;

        return { ...order, status, finalPrice, updatedAt: nowIso() };
      }),
    );
  }, []);

  const createOrder = useCallback((input: NewOrderInput) => {
    orderStore.set((current) => [
      {
        id: nextId(current),
        companyName: input.companyName,
        farmerName: input.farmerName,
        items: [input.item],
        // A new order is not settled, so it carries no agreed price yet.
        finalPrice: null,
        status: "pending",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      ...current,
    ]);
  }, []);

  const addOrderItem = useCallback((orderId: number, item: OrderItem) => {
    orderStore.set((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;

        // The same product added twice becomes one line carrying more of it,
        // rather than two lines sharing a product id.
        const alreadyOnOrder = order.items.some(
          (line) => line.productId === item.productId,
        );

        const items = alreadyOnOrder
          ? order.items.map((line) =>
              line.productId === item.productId
                ? { ...line, quantity: line.quantity + item.quantity }
                : line,
            )
          : [...order.items, item];

        return { ...order, items, updatedAt: nowIso() };
      }),
    );
  }, []);

  /**
   * Everything under a hidden category drops out of the rest of the app.
   * Derived once here so no page has to remember to filter.
   */
  const visibleCategories = useMemo(
    () => categories.filter((category) => category.hidden !== true),
    [categories],
  );

  const hiddenCategoryIds = useMemo(
    () =>
      new Set(
        categories
          .filter((category) => category.hidden === true)
          .map((category) => category.id),
      ),
    [categories],
  );

  const visibleSubCategories = useMemo(
    () => subCategories.filter((row) => !hiddenCategoryIds.has(row.categoryId)),
    [subCategories, hiddenCategoryIds],
  );

  const visibleProducts = useMemo(
    () => products.filter((row) => !hiddenCategoryIds.has(row.categoryId)),
    [products, hiddenCategoryIds],
  );

  const value = useMemo<AdminStore>(
    () => ({
      categories,
      subCategories,
      products,
      orders,
      visibleCategories,
      visibleSubCategories,
      visibleProducts,
      addCategory,
      updateCategory,
      setCategoryHidden,
      addSubCategory,
      updateSubCategory,
      deleteSubCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      updateOrderStatus,
      createOrder,
      addOrderItem,
    }),
    [
      categories,
      subCategories,
      products,
      orders,
      visibleCategories,
      visibleSubCategories,
      visibleProducts,
      addCategory,
      updateCategory,
      setCategoryHidden,
      addSubCategory,
      updateSubCategory,
      deleteSubCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      updateOrderStatus,
      createOrder,
      addOrderItem,
    ],
  );

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore(): AdminStore {
  const store = useContext(AdminStoreContext);
  if (!store) {
    throw new Error("useAdminStore must be used inside <AdminStoreProvider>");
  }
  return store;
}
