"use client";

import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  /** Noun used in the "Showing 1 to 10 of 79 entries" summary. */
  itemLabel?: string;
}

/**
 * Build the page list: a sliding window of three numbers that trails the
 * current page, so the control never grows past three number buttons.
 *
 *   5 pages, on 1   1 2 3 … next
 *   5 pages, on 4   … 2 3 4 … next
 *   5 pages, on 5   … 3 4 5 next
 *
 * The window only starts sliding once the current page has moved past it —
 * pages 1, 2 and 3 all show the same "1 2 3" window, just with a different
 * page highlighted. `null` marks a gap.
 */
const WINDOW_SIZE = 3;

function pageItems(page: number, totalPages: number): (number | null)[] {
  const start = Math.max(1, page - (WINDOW_SIZE - 1));
  const end = Math.min(totalPages, start + WINDOW_SIZE - 1);

  const items: (number | null)[] = [];
  if (start > 1) items.push(null);
  for (let value = start; value <= end; value += 1) items.push(value);
  if (end < totalPages) items.push(null);

  return items;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  itemLabel = "entries",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const firstRow = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, totalItems);

  const stepClasses =
    "h-9 rounded-lg border border-line px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted" aria-live="polite">
        Showing {firstRow} to {lastRow} of {totalItems} {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          className={stepClasses}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>

        {pageItems(page, totalPages).map((item, index) =>
          item === null ? (
            <span
              key={`gap-${index}`}
              aria-hidden
              className="w-5 text-center text-sm text-faint"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Go to page ${item}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                "size-9 rounded-lg border text-sm font-medium transition-colors",
                item === page
                  ? "border-brand bg-brand text-white"
                  : "border-line text-muted hover:bg-surface-muted",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          className={stepClasses}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
