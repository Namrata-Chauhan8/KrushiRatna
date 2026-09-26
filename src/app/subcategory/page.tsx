import type { Metadata } from "next";

import { SubCategoryView } from "@/app/subcategory/subcategory-view";

export const metadata: Metadata = { title: "Subcategories" };

export default function SubCategoryPage() {
  return <SubCategoryView />;
}
