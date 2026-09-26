"use client";

import { ChevronDown } from "lucide-react";
import { useId, type SelectHTMLAttributes } from "react";

import { controlClasses, Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children"> {
  label: string;
  options: SelectOption[];
  /** Shown as a disabled first entry when the value is empty. */
  placeholder?: string;
  error?: string;
  hint?: string;
  /** Hides the visible label but keeps it for screen readers (toolbar filters). */
  hideLabel?: boolean;
}

export function Select({
  label,
  options,
  placeholder,
  error,
  hint,
  required,
  className,
  hideLabel,
  ...props
}: SelectProps) {
  const id = useId();

  const control = (
    <div className="relative">
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(controlClasses(Boolean(error)), "appearance-none pr-9")}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint"
      />
    </div>
  );

  if (hideLabel) {
    return (
      <div className={className}>
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        {control}
      </div>
    );
  }

  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      {control}
    </Field>
  );
}
