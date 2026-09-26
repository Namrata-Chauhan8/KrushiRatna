/** Shared domain types for the admin dashboard. */

export type Status = "active" | "inactive";

export type OrderStatus = "pending" | "running" | "completed" | "cancelled";

export interface Category {
  id: number;
  name: string;
  image: string;
  status: Status;
  /**
   * Categories are hidden rather than deleted. A hidden category — and every
   * subcategory and product beneath it — drops out of every page and dropdown
   * except the Category table itself, where it can be restored.
   *
   * Optional so catalogues persisted before this field existed still load.
   */
  hidden?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  id: number;
  name: string;
  image: string;
  categoryId: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  categoryId: number;
  subCategoryId: number;
  price: number;
  stock: number;
  unit: string;
  description: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface Order {
  id: number;
  companyName: string;
  farmerName: string;
  items: OrderItem[];
  finalPrice: number | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

/** Shape used by every add/edit form before it becomes a record. */
export type CategoryInput = Pick<Category, "name" | "image" | "status">;
export type SubCategoryInput = Pick<
  SubCategory,
  "name" | "image" | "categoryId" | "status"
>;
export type ProductInput = Pick<
  Product,
  | "name"
  | "image"
  | "categoryId"
  | "subCategoryId"
  | "price"
  | "stock"
  | "unit"
  | "description"
  | "status"
>;
