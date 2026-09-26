import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface Column<T> {
  /** Stable identity for the column; also used as the React key. */
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  /** Rendered in place of the table body when there is nothing to show. */
  empty?: ReactNode;
  caption?: string;
  /** Extra classes per row, for states like a hidden category. */
  rowClassName?: (row: T) => string | undefined;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  caption,
  rowClassName,
}: DataTableProps<T>) {
  if (rows.length === 0 && empty) {
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        {empty}
      </div>
    );
  }

  return (
    <div className="scroll-slim overflow-x-auto rounded-xl border border-line bg-surface shadow-card">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-line bg-surface-muted">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-3.5 text-xs font-semibold tracking-wide text-muted uppercase",
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn(
                "group border-b border-line/70 transition-colors last:border-0 hover:bg-surface-muted/60",
                rowClassName?.(row),
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 align-middle text-ink",
                    column.cellClassName,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Classes that pin a column to the right edge while the table scrolls.
 * Used for the action column so edit/delete stay reachable on narrow screens.
 */
export const STICKY_ACTION_HEADER =
  "sticky right-0 z-10 bg-surface-muted text-right shadow-[inset_1px_0_0_var(--color-line)]";

export const STICKY_ACTION_CELL =
  "sticky right-0 bg-surface text-right shadow-[inset_1px_0_0_var(--color-line)] transition-colors group-hover:bg-[color-mix(in_srgb,var(--color-surface-muted)_60%,var(--color-surface))]";
