"use client";

import { Eye, EyeOff, ShoppingCart, SquarePen, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const baseClasses =
  "inline-flex size-8 items-center justify-center rounded-lg transition-colors";

interface ActionProps {
  onClick: () => void;
  /** Names the record, e.g. "Wheat" — used to build the accessible label. */
  label: string;
}

export function EditAction({ onClick, label }: ActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit ${label}`}
      title={`Edit ${label}`}
      className={cn(baseClasses, "text-muted hover:bg-brand-soft hover:text-brand")}
    >
      <SquarePen aria-hidden className="size-4" />
    </button>
  );
}

export function DeleteAction({ onClick, label }: ActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Delete ${label}`}
      title={`Delete ${label}`}
      className={cn(baseClasses, "text-danger hover:bg-danger-soft")}
    >
      <Trash2 aria-hidden className="size-4" />
    </button>
  );
}

export function ViewAction({ onClick, label }: ActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${label}`}
      title={`View ${label}`}
      className={cn(baseClasses, "text-muted hover:bg-brand-soft hover:text-brand")}
    >
      <Eye aria-hidden className="size-4" />
    </button>
  );
}

/** Soft-delete for categories: reversible, so it is not styled as destructive. */
export function HideAction({ onClick, label }: ActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Hide ${label}`}
      title={`Hide ${label}`}
      className={cn(baseClasses, "text-muted hover:bg-surface-muted hover:text-ink")}
    >
      <EyeOff aria-hidden className="size-4" />
    </button>
  );
}

export function UnhideAction({ onClick, label }: ActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Unhide ${label}`}
      title={`Unhide ${label}`}
      className={cn(baseClasses, "text-brand hover:bg-brand-soft")}
    >
      <Eye aria-hidden className="size-4" />
    </button>
  );
}

export function AddToOrderAction({ onClick, label }: ActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Add ${label} to an order`}
      title={`Add ${label} to an order`}
      className={cn(baseClasses, "text-muted hover:bg-brand-soft hover:text-brand")}
    >
      <ShoppingCart aria-hidden className="size-4" />
    </button>
  );
}

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-1">{children}</div>;
}
