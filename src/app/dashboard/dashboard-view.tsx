"use client";

import {
  CheckCircle2,
  Clock,
  Layers,
  ListTree,
  Package,
  ShoppingCart,
  Timer,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";

import { OrdersTrendChart } from "@/components/dashboard/orders-trend-chart";
import { StatusBreakdownChart } from "@/components/dashboard/status-breakdown-chart";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, type StatTone } from "@/components/ui/stat-card";
import { useAdminStore } from "@/store/admin-store";
import type { OrderStatus } from "@/types";

export function DashboardView() {
  // Counts follow what the rest of the app shows: hidden categories, and
  // everything beneath them, are left out.
  const {
    visibleCategories: categories,
    visibleSubCategories: subCategories,
    visibleProducts: products,
    orders,
  } = useAdminStore();

  const stats = useMemo(() => {
    const countByStatus = (status: OrderStatus) =>
      orders.filter((order) => order.status === status).length;

    return [
      { label: "Categories", value: categories.length, icon: Layers, tone: "brand" },
      {
        label: "Sub Categories",
        value: subCategories.length,
        icon: ListTree,
        tone: "brand",
      },
      { label: "Products", value: products.length, icon: Package, tone: "brand" },
      {
        label: "Total Orders",
        value: orders.length,
        icon: ShoppingCart,
        tone: "brand",
      },
      {
        label: "Pending Orders",
        value: countByStatus("pending"),
        icon: Clock,
        tone: "warning",
      },
      {
        label: "Running Orders",
        value: countByStatus("running"),
        icon: Timer,
        tone: "info",
      },
      {
        label: "Completed Orders",
        value: countByStatus("completed"),
        icon: CheckCircle2,
        tone: "success",
      },
      {
        label: "Cancelled Orders",
        value: countByStatus("cancelled"),
        icon: XCircle,
        tone: "danger",
      },
    ] satisfies Array<{
      label: string;
      value: number;
      icon: typeof Layers;
      tone: StatTone;
    }>;
  }, [categories, subCategories, products, orders]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="A live snapshot of the catalogue and the order pipeline."
      />

      <section
        aria-label="Summary statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            tone={stat.tone}
          />
        ))}
      </section>

      <section aria-label="Order insights" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StatusBreakdownChart orders={orders} />
        <OrdersTrendChart orders={orders} />
      </section>
    </div>
  );
}
