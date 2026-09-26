"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { AddToOrderModal } from "@/app/product/add-to-order-modal";
import { ProductFormModal } from "@/app/product/product-form-modal";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  DataTable,
  STICKY_ACTION_CELL,
  STICKY_ACTION_HEADER,
  type Column,
} from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import {
  AddToOrderAction,
  DeleteAction,
  EditAction,
  RowActions,
} from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Thumbnail } from "@/components/ui/thumbnail";
import { usePaginated } from "@/hooks/use-paginated";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { RECORD_STATUS_LABELS } from "@/lib/labels";
import { matchesQuery } from "@/lib/search";
import { useAdminStore } from "@/store/admin-store";
import type { Product, ProductInput } from "@/types";

export function ProductView() {
  // Hidden categories take their subcategories and products off this page.
  const {
    visibleCategories: categories,
    visibleSubCategories: subCategories,
    visibleProducts: products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    addOrderItem,
  } = useAdminStore();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const subCategoryNameById = useMemo(
    () => new Map(subCategories.map((row) => [row.id, row.name])),
    [subCategories],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categories],
  );

  // The subcategory filter only offers children of the selected category.
  const subCategoryFilterOptions = useMemo(
    () =>
      subCategories
        .filter(
          (row) => !categoryFilter || String(row.categoryId) === categoryFilter,
        )
        .map((row) => ({ value: String(row.id), label: row.name })),
    [subCategories, categoryFilter],
  );

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        if (categoryFilter && String(product.categoryId) !== categoryFilter) {
          return false;
        }
        if (
          subCategoryFilter &&
          String(product.subCategoryId) !== subCategoryFilter
        ) {
          return false;
        }
        return matchesQuery(
          query,
          product.id,
          product.name,
          categoryNameById.get(product.categoryId),
          subCategoryNameById.get(product.subCategoryId),
          RECORD_STATUS_LABELS[product.status],
        );
      }),
    [
      products,
      query,
      categoryFilter,
      subCategoryFilter,
      categoryNameById,
      subCategoryNameById,
    ],
  );

  const { page, setPage, pageSize, pageRows, total } = usePaginated(
    filtered,
    `${query}|${categoryFilter}|${subCategoryFilter}`,
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = (input: ProductInput) => {
    if (editing) {
      updateProduct(editing.id, input);
    } else {
      addProduct(input);
    }
    closeForm();
  };

  const confirmDelete = () => {
    if (pendingDelete) deleteProduct(pendingDelete.id);
    setPendingDelete(null);
  };

  const hasFilters = Boolean(query || categoryFilter || subCategoryFilter);

  const columns: Column<Product>[] = [
    {
      key: "id",
      header: "ID",
      cell: (row) => <span className="text-muted tabular-nums">{row.id}</span>,
      headerClassName: "w-16",
    },
    {
      key: "image",
      header: "Image",
      cell: (row) => <Thumbnail src={row.image} alt={row.name} />,
    },
    {
      key: "name",
      header: "Product Name",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => (
        <span className="text-muted">
          {categoryNameById.get(row.categoryId) ?? "-"}
        </span>
      ),
    },
    {
      key: "subCategory",
      header: "Sub Category",
      cell: (row) => (
        <span className="text-muted">
          {subCategoryNameById.get(row.subCategoryId) ?? "-"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatCurrency(row.price)}
          <span className="text-muted"> / {row.unit}</span>
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatNumber(row.stock)}
          <span className="text-muted"> {row.unit}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
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
          <AddToOrderAction
            label={row.name}
            onClick={() => setOrderingProduct(row)}
          />
          <EditAction label={row.name} onClick={() => openEdit(row)} />
          <DeleteAction label={row.name} onClick={() => setPendingDelete(row)} />
        </RowActions>
      ),
      cellClassName: STICKY_ACTION_CELL,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage pricing, stock and availability across the catalogue"
        actions={
          <Button
            onClick={openAdd}
            disabled={subCategories.length === 0}
            title={
              subCategories.length === 0
                ? "Create a category and subcategory first"
                : undefined
            }
          >
            <Plus aria-hidden className="size-4" />
            Add Product
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search products..."
          label="Search products"
          className="lg:max-w-sm lg:flex-1"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            label="Filter by category"
            hideLabel
            value={categoryFilter}
            options={categoryOptions}
            placeholder="All categories"
            className="sm:w-52"
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              // The chosen subcategory may not live in the new category.
              setSubCategoryFilter("");
            }}
          />
          <Select
            label="Filter by subcategory"
            hideLabel
            value={subCategoryFilter}
            options={subCategoryFilterOptions}
            placeholder="All subcategories"
            className="sm:w-52"
            onChange={(event) => setSubCategoryFilter(event.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(row) => row.id}
        caption="Products"
        empty={
          <EmptyState
            title={hasFilters ? "No matching products" : "No products yet"}
            description={
              hasFilters
                ? "Try a different search term or clear the category filters."
                : subCategories.length === 0
                  ? "Products sit under a subcategory, so create a category and a subcategory first."
                  : "Add a product to start selling from this catalogue."
            }
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

      {formOpen ? (
        <ProductFormModal
          key={editing?.id ?? "new"}
          product={editing}
          categories={categories}
          subCategories={subCategories}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      {orderingProduct ? (
        <AddToOrderModal
          key={orderingProduct.id}
          product={orderingProduct}
          orders={orders}
          onClose={() => setOrderingProduct(null)}
          onCreateOrder={createOrder}
          onAddToOrder={addOrderItem}
        />
      ) : null}

      <ConfirmationDialog
        open={pendingDelete !== null}
        title="Delete product?"
        message={`"${pendingDelete?.name}" will be removed from the catalogue. This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
