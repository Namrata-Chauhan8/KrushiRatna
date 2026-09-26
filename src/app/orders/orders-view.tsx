"use client";

import { FileDown } from "lucide-react";
import { useMemo, useState } from "react";

import { OrderDetailsModal } from "@/app/orders/order-details-modal";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  STICKY_ACTION_CELL,
  STICKY_ACTION_HEADER,
  type Column,
} from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions, ViewAction } from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { usePaginated } from "@/hooks/use-paginated";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { ORDER_STATUS_OPTIONS } from "@/lib/options";
import { matchesQuery } from "@/lib/search";
import { downloadXlsx, type SheetColumn } from "@/lib/xlsx";
import { useAdminStore } from "@/store/admin-store";
import type { Order } from "@/types";

/** Layout of the exported workbook, kept next to the on-screen table. */
const EXPORT_COLUMNS: SheetColumn<Order>[] = [
  { header: "Order ID", width: 10, value: (order) => order.id },
  { header: "Company Name", width: 28, value: (order) => order.companyName || "-" },
  { header: "Farmer Name", width: 24, value: (order) => order.farmerName || "-" },
  {
    header: "Products",
    width: 46,
    value: (order) =>
      order.items
        .map((item) => `${item.name} (${item.quantity} ${item.unit})`)
        .join(", "),
  },
  {
    header: "Items",
    width: 8,
    value: (order) => order.items.length,
  },
  {
    header: "Order Value (INR)",
    width: 18,
    value: (order) =>
      order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },
  {
    header: "Final Price (INR)",
    width: 18,
    value: (order) => order.finalPrice,
  },
  {
    header: "Status",
    width: 14,
    value: (order) => ORDER_STATUS_LABELS[order.status],
  },
  {
    header: "Created At",
    width: 22,
    value: (order) => formatDateTime(order.createdAt),
  },
  {
    header: "Updated At",
    width: 22,
    value: (order) => formatDateTime(order.updatedAt),
  },
];

export function OrdersView() {
  const { orders, updateOrderStatus } = useAdminStore();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // Held by id, not by value, so the dialog re-renders with the latest order
  // after its status is changed.
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        if (statusFilter && order.status !== statusFilter) return false;
        return matchesQuery(
          query,
          order.id,
          order.companyName,
          order.farmerName,
          ORDER_STATUS_LABELS[order.status],
          ...order.items.map((item) => item.name),
        );
      }),
    [orders, query, statusFilter],
  );

  const { page, setPage, pageSize, pageRows, total } = usePaginated(
    filtered,
    `${query}|${statusFilter}`,
  );

  const selected = orders.find((order) => order.id === selectedId) ?? null;

  /** Exports exactly what the current search and filter show. */
  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadXlsx(`orders-${stamp}.xlsx`, filtered, EXPORT_COLUMNS, "Orders");
  };

  const columns: Column<Order>[] = [
    {
      key: "id",
      header: "ID",
      cell: (row) => <span className="tabular-nums">{row.id}</span>,
      headerClassName: "w-20",
    },
    {
      key: "company",
      header: "Company Name",
      cell: (row) => (
        <span className="font-medium">{row.companyName || "-"}</span>
      ),
    },
    {
      key: "farmer",
      header: "Farmer Name",
      cell: (row) => <span>{row.farmerName || "-"}</span>,
    },
    {
      key: "finalPrice",
      header: "Final Price",
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatCurrency(row.finalPrice)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Created At",
      cell: (row) => (
        <span className="whitespace-nowrap text-muted">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated At",
      cell: (row) => (
        <span className="whitespace-nowrap text-muted">
          {formatDateTime(row.updatedAt)}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      headerClassName: STICKY_ACTION_HEADER,
      cell: (row) => (
        <RowActions>
          <ViewAction
            label={`order ${row.id}`}
            onClick={() => setSelectedId(row.id)}
          />
        </RowActions>
      ),
      cellClassName: STICKY_ACTION_CELL,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage and track orders"
        actions={
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            <FileDown aria-hidden className="size-4" />
            Download Excel Report
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search orders..."
          label="Search orders"
          className="sm:max-w-sm sm:flex-1"
        />
        <Select
          label="Filter by status"
          hideLabel
          value={statusFilter}
          options={ORDER_STATUS_OPTIONS}
          placeholder="All statuses"
          className="sm:w-48"
          onChange={(event) => setStatusFilter(event.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(row) => row.id}
        caption="Orders"
        empty={
          <EmptyState
            title="No matching orders"
            description="Try a different search term or clear the status filter."
          />
        }
      />

      {total > 0 ? (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={setPage}
        />
      ) : null}

      <OrderDetailsModal
        order={selected}
        onClose={() => setSelectedId(null)}
        onStatusChange={(status) => {
          if (selectedId !== null) updateOrderStatus(selectedId, status);
        }}
      />
    </div>
  );
}
