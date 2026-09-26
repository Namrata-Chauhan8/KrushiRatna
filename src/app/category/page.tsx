import type { Metadata } from "next";

import { CategoryView } from "@/app/category/category-view";

export const metadata: Metadata = { title: "Categories" };

export default function CategoryPage() {
  return <CategoryView />;
}
