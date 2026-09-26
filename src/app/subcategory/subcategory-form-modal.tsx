"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { ImageUpload } from "@/components/ui/image-upload";
import { Modal } from "@/components/ui/modal";
import { Select, type SelectOption } from "@/components/ui/select";
import { STATUS_OPTIONS } from "@/lib/options";
import type { Status, SubCategory, SubCategoryInput } from "@/types";

interface SubCategoryFormModalProps {
  /** `null` opens the form in "add" mode. */
  subCategory: SubCategory | null;
  categoryOptions: SelectOption[];
  /** Names already used inside the selected category. */
  takenNames: (categoryId: number) => string[];
  onClose: () => void;
  onSubmit: (input: SubCategoryInput) => void;
}

type Errors = Partial<Record<"name" | "image" | "categoryId", string>>;

const EMPTY: SubCategoryInput = {
  name: "",
  image: "",
  categoryId: 0,
  status: "active",
};

/** Mounted only while open and keyed by record, so initial state is correct. */
export function SubCategoryFormModal({
  subCategory,
  categoryOptions,
  takenNames,
  onClose,
  onSubmit,
}: SubCategoryFormModalProps) {
  const formId = useId();
  const [values, setValues] = useState<SubCategoryInput>(() =>
    subCategory
      ? {
          name: subCategory.name,
          image: subCategory.image,
          categoryId: subCategory.categoryId,
          status: subCategory.status,
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const next: Errors = {};
    const name = values.name.trim();

    if (!name) {
      next.name = "Subcategory name is required.";
    } else if (name.length < 2) {
      next.name = "Use at least 2 characters.";
    } else if (
      values.categoryId &&
      takenNames(values.categoryId).some(
        (existing) => existing.toLowerCase() === name.toLowerCase(),
      )
    ) {
      next.name = "This category already has a subcategory with that name.";
    }

    if (!values.categoryId) next.categoryId = "Select a main category.";
    if (!values.image) next.image = "Upload a subcategory image.";

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
      title={subCategory ? "Edit subcategory" : "Add subcategory"}
      description={
        subCategory
          ? "Update this subcategory and the category it belongs to."
          : "Create a subcategory under an existing main category."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            {subCategory ? "Save changes" : "Add subcategory"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput
          label="Sub category name"
          required
          value={values.name}
          maxLength={60}
          placeholder="e.g. Tomato"
          error={errors.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
        />

        <Select
          label="Main category"
          required
          value={values.categoryId ? String(values.categoryId) : ""}
          options={categoryOptions}
          placeholder="Select a category"
          error={errors.categoryId}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              categoryId: Number(event.target.value),
            }))
          }
        />

        <ImageUpload
          label="Sub category image"
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
