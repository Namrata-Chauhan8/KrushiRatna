"use client";

import { useId, type TextareaHTMLAttributes } from "react";

import { controlClasses, Field } from "@/components/ui/field";

interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextArea({
  label,
  error,
  hint,
  required,
  className,
  rows = 3,
  ...props
}: TextAreaProps) {
  const id = useId();

  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={controlClasses(Boolean(error))}
        {...props}
      />
    </Field>
  );
}
