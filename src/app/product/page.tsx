import type { Metadata } from "next";

import { ProductView } from "@/app/product/product-view";

export const metadata: Metadata = { title: "Products" };

export default function ProductPage() {
  return <ProductView />;
}
