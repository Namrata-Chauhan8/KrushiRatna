"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { CategoryFormModal } from "@/app/category/category-form-modal";
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
import {
  EditAction,
  HideAction,
  RowActions,
  UnhideAction,
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
import type { Category, CategoryInput } from "@/types";

/** The Category table is the one place hidden categories remain visible. */
type Visibility = "all" | "visible" | "hidden";

export function CategoryView() {
  const { categories, addCategory, updateCategory, setCategoryHidden } =
    useAdminStore();

  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const hiddenCount = categories.filter(
    (category) => category.hidden === true,
  ).length;

  const visibilityOptions = [
    { value: "all", label: `All categories (${categories.length})` },
    { value: "visible", label: `Visible (${categories.length - hiddenCount})` },
    { value: "hidden", label: `Hidden (${hiddenCount})` },
  ];

  const filtered = useMemo(
    () =>
      categories.filter((category) => {
        const isHidden = category.hidden === true;
        if (visibility === "visible" && isHidden) return false;
        if (visibility === "hidden" && !isHidden) return false;

        return matchesQuery(
          query,
          category.id,
          category.name,
          RECORD_STATUS_LABELS[category.status],
          isHidden ? "hidden" : "visible",
        );
      }),
    [categories, query, visibility],
  );

  const { page, setPage, pageSize, pageRows, total } = usePaginated(
    filtered,
    `${query}|${visibility}`,
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = (input: CategoryInput) => {
    if (editing) {
      updateCategory(editing.id, input);
    } else {
      addCategory(input);
    }
    closeForm();
  };

  const columns: Column<Category>[] = [
    {
      key: "id",
      header: "ID",
      cell: (row) => <span className="text-muted tabular-nums">{row.id}</span>,
      headerClassName: "w-16",
    },
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <span className="flex items-center gap-2">
          <span className="font-medium">{row.name}</span>
          {row.hidden === true ? (
            <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted ring-1 ring-line ring-inset">
              Hidden
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "image",
      header: "Image",
      cell: (row) => <Thumbnail src={row.image} alt={row.name} />,
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
          {row.hidden === true ? (
            <UnhideAction
              label={row.name}
              onClick={() => setCategoryHidden(row.id, false)}
            />
          ) : (
            <HideAction
              label={row.name}
              onClick={() => setCategoryHidden(row.id, true)}
            />
          )}
        </RowActions>
      ),
      cellClassName: STICKY_ACTION_CELL,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage and organize product categories"
        actions={
          <Button onClick={openAdd}>
            <Plus aria-hidden className="size-4" />
            Add Category
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search categories..."
          label="Search categories"
          className="sm:max-w-sm sm:flex-1"
        />
        <Select
          label="Filter by visibility"
          hideLabel
          value={visibility}
          options={visibilityOptions}
          className="sm:w-52"
          onChange={(event) => setVisibility(event.target.value as Visibility)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(row) => row.id}
        caption="Product categories"
        rowClassName={(row) =>
          row.hidden === true ? "bg-surface-muted/40 opacity-60" : undefined
        }
        empty={
          <EmptyState
            title={
              query || visibility !== "all"
                ? "No matching categories"
                : "No categories yet"
            }
            description={
              query || visibility !== "all"
                ? "Try a different name, or clear the search and visibility filter."
                : "Add your first category to start building the catalogue."
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
        <CategoryFormModal
          key={editing?.id ?? "new"}
          category={editing}
          existingNames={categories
            .filter((category) => category.id !== editing?.id)
            .map((category) => category.name)}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
