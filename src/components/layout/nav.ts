import {
  LayoutGrid,
  Layers,
  ListTree,
  Package,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Main",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutGrid }],
  },
  {
    title: "Crop - Sell",
    items: [
      { href: "/category", label: "Category", icon: Layers },
      { href: "/subcategory", label: "Sub Category", icon: ListTree },
      { href: "/product", label: "Product", icon: Package },
      { href: "/orders", label: "Orders", icon: ShoppingCart },
    ],
  },
];

export const APP_NAME = "Krushiratna";
