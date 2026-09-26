"use client";

import { useId, type InputHTMLAttributes } from "react";

import { controlClasses, Field } from "@/components/ui/field";

interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormInput({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: FormInputProps) {
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
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={controlClasses(Boolean(error))}
        {...props}
      />
    </Field>
  );
}
