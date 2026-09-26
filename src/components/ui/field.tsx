import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Label + control + error text, shared by every form control. */
export function Field({
  id,
  label,
  error,
  required,
  hint,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span aria-hidden className="ml-0.5 text-danger">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/** Shared control chrome so inputs, selects and textareas stay identical. */
export const controlClasses = (invalid?: boolean) =>
  cn(
    "w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-ink transition-colors",
    "placeholder:text-faint focus:outline-none focus:ring-2",
    invalid
      ? "border-danger focus:border-danger focus:ring-danger/15"
      : "border-line focus:border-brand focus:ring-brand/15",
  );
