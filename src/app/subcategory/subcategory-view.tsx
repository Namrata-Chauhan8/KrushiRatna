"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { SubCategoryFormModal } from "@/app/subcategory/subcategory-form-modal";
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
  DeleteAction,
  EditAction,
  RowActions,
} from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Thumbnail } from "@/components/ui/thumbnail";
import { usePaginated } from "@/hooks/use-paginated";
import { formatDateTime } from "@/lib/format";
import { RECORD_STATUS_LABELS } from "@/lib/labels";
import { matchesQuery } from "@/lib/search";
import { useAdminStore } from "@/store/admin-store";
import type { SubCategory, SubCategoryInput } from "@/types";

export function SubCategoryView() {
  // Hidden categories take their subcategories out of this page entirely.
  const {
    visibleCategories: categories,
    visibleSubCategories: subCategories,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
  } = useAdminStore();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SubCategory | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SubCategory | null>(null);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categories],
  );

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filtered = useMemo(
    () =>
      subCategories.filter((row) => {
        if (categoryFilter && String(row.categoryId) !== categoryFilter) {
          return false;
        }
        return matchesQuery(
          query,
          row.id,
          row.name,
          categoryNameById.get(row.categoryId),
          RECORD_STATUS_LABELS[row.status],
        );
      }),
    [subCategories, query, categoryFilter, categoryNameById],
  );

  const { page, setPage, pageSize, pageRows, total } = usePaginated(
    filtered,
    `${query}|${categoryFilter}`,
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: SubCategory) => {
    setEditing(row);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = (input: SubCategoryInput) => {
    if (editing) {
      updateSubCategory(editing.id, input);
    } else {
      addSubCategory(input);
    }
    closeForm();
  };

  const confirmDelete = () => {
    if (pendingDelete) deleteSubCategory(pendingDelete.id);
    setPendingDelete(null);
  };

  const columns: Column<SubCategory>[] = [
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
      header: "Sub Category Name",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "category",
      header: "Main Category",
      cell: (row) => (
        <span className="text-muted">
          {categoryNameById.get(row.categoryId) ?? "-"}
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
        title="Subcategories"
        description="Manage and organize product subcategories"
        actions={
          <Button
            onClick={openAdd}
            disabled={categories.length === 0}
            title={
              categories.length === 0
                ? "Create a category first"
                : undefined
            }
          >
            <Plus aria-hidden className="size-4" />
            Add Subcategory
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search subcategories..."
          label="Search subcategories"
          className="sm:max-w-sm sm:flex-1"
        />
        <Select
          label="Filter by main category"
          hideLabel
          value={categoryFilter}
          options={categoryOptions}
          placeholder="All categories"
          className="sm:w-56"
          onChange={(event) => setCategoryFilter(event.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(row) => row.id}
        caption="Product subcategories"
        empty={
          <EmptyState
            title={
              query || categoryFilter
                ? "No matching subcategories"
                : "No subcategories yet"
            }
            description={
              query || categoryFilter
                ? "Try a different search term or clear the category filter."
                : categories.length === 0
                  ? "Subcategories live under a category, so create a category first."
                  : "Add a subcategory to group products under a category."
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
        <SubCategoryFormModal
          key={editing?.id ?? "new"}
          subCategory={editing}
          categoryOptions={categoryOptions}
          takenNames={(categoryId) =>
            subCategories
              .filter(
                (row) => row.categoryId === categoryId && row.id !== editing?.id,
              )
              .map((row) => row.name)
          }
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      <ConfirmationDialog
        open={pendingDelete !== null}
        title="Delete subcategory?"
        message={`"${pendingDelete?.name}" will be removed along with every product under it. This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
