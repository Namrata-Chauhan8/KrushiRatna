"use client";

import { Table2 } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

/**
 * Card shell shared by every dashboard chart.
 *
 * Every chart ships a "View as table" twin — the same numbers, as an
 * ordinary `<table>` — so nothing here is readable only by seeing color or
 * bar length. The toggle is local to the card; switching one chart to its
 * table never affects the others.
 */
interface ChartCardProps {
  title: string;
  description?: string;
  chart: ReactNode;
  table: ReactNode;
}

export function ChartCard({ title, description, chart, table }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-xl border border-line bg-surface p-5 shadow-card"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h2 id={titleId} className="text-sm font-semibold text-ink">
            {title}
          </h2>
          {description ? (
            <p className="text-xs text-muted">{description}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setShowTable((value) => !value)}
          aria-pressed={showTable}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <Table2 aria-hidden className="size-3.5" />
          {showTable ? "View chart" : "View as table"}
        </button>
      </header>

      <div className="mt-5">{showTable ? table : chart}</div>
    </section>
  );
}
