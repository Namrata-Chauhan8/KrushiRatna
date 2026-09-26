"use client";

import { Search } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Accessible name; falls back to the placeholder. */
  label?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  label,
  className,
}: SearchInputProps) {
  const id = useId();

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label ?? placeholder}
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-11 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-sm text-ink",
          "placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none",
        )}
      />
    </div>
  );
}
