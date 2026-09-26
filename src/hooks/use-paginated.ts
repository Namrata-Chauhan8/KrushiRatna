"use client";

import { useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

interface PaginatedResult<T> {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  /** The slice of `rows` belonging to the current page. */
  pageRows: T[];
  total: number;
}

/**
 * Client-side pagination.
 *
 * `resetKey` should carry whatever the caller filters by (search text, status,
 * category, ...). When it changes the view jumps back to page one, which is
 * what a user expects after narrowing a list.
 *
 * Both corrections happen during render rather than in an effect: React
 * restarts the render with the new state before committing, so the user never
 * sees a frame showing the stale page.
 */
export function usePaginated<T>(
  rows: T[],
  resetKey: string,
  pageSize: number = DEFAULT_PAGE_SIZE,
): PaginatedResult<T> {
  const [page, setPage] = useState(1);
  const [lastResetKey, setLastResetKey] = useState(resetKey);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  } else if (page > totalPages) {
    // Deleting the last row on the final page must not strand the user there.
    setPage(totalPages);
  }

  const current = Math.min(page, totalPages);

  const pageRows = useMemo(
    () => rows.slice((current - 1) * pageSize, current * pageSize),
    [rows, current, pageSize],
  );

  return { page: current, setPage, pageSize, pageRows, total: rows.length };
}
