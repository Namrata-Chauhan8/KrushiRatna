"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { ImageUpload } from "@/components/ui/image-upload";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { STATUS_OPTIONS } from "@/lib/options";
import type { Category, CategoryInput, Status } from "@/types";

interface CategoryFormModalProps {
  /** `null` opens the form in "add" mode. */
  category: Category | null;
  /** Names already taken, used for the duplicate check. */
  existingNames: string[];
  onClose: () => void;
  onSubmit: (input: CategoryInput) => void;
}

type Errors = Partial<Record<"name" | "image", string>>;

const EMPTY: CategoryInput = { name: "", image: "", status: "active" };

/**
 * Mounted only while the dialog is open, and keyed by the record being edited,
 * so the initial state below is always the right starting point.
 */
export function CategoryFormModal({
  category,
  existingNames,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const formId = useId();
  const [values, setValues] = useState<CategoryInput>(() =>
    category
      ? { name: category.name, image: category.image, status: category.status }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const next: Errors = {};
    const name = values.name.trim();

    if (!name) {
      next.name = "Category name is required.";
    } else if (name.length < 2) {
      next.name = "Use at least 2 characters.";
    } else if (
      existingNames.some(
        (existing) => existing.toLowerCase() === name.toLowerCase(),
      )
    ) {
      next.name = "A category with this name already exists.";
    }

    if (!values.image) next.image = "Upload a category image.";

    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({ ...values, name: values.name.trim() });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={category ? "Edit category" : "Add category"}
      description={
        category
          ? "Update the details of this product category."
          : "Create a new top-level product category."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            {category ? "Save changes" : "Add category"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput
          label="Category name"
          required
          value={values.name}
          maxLength={60}
          placeholder="e.g. Vegetables"
          error={errors.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
        />

        <ImageUpload
          label="Category image"
          required
          value={values.image}
          error={errors.image}
          onChange={(image) => setValues((current) => ({ ...current, image }))}
        />

        <Select
          label="Status"
          required
          value={values.status}
          options={STATUS_OPTIONS}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              status: event.target.value as Status,
            }))
          }
        />
      </form>
    </Modal>
  );
}
