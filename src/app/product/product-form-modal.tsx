"use client";

import { useId, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { ImageUpload } from "@/components/ui/image-upload";
import { Modal } from "@/components/ui/modal";
import { Select, type SelectOption } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { STATUS_OPTIONS, UNIT_OPTIONS } from "@/lib/options";
import type { Category, Product, ProductInput, Status, SubCategory } from "@/types";

interface ProductFormModalProps {
  /** `null` opens the form in "add" mode. */
  product: Product | null;
  categories: Category[];
  subCategories: SubCategory[];
  onClose: () => void;
  onSubmit: (input: ProductInput) => void;
}

type FieldName =
  | "name"
  | "image"
  | "categoryId"
  | "subCategoryId"
  | "price"
  | "stock";
type Errors = Partial<Record<FieldName, string>>;

/** Price and stock are kept as strings so a half-typed value never becomes NaN. */
interface FormValues {
  name: string;
  image: string;
  categoryId: number;
  subCategoryId: number;
  price: string;
  stock: string;
  unit: string;
  description: string;
  status: Status;
}

const EMPTY: FormValues = {
  name: "",
  image: "",
  categoryId: 0,
  subCategoryId: 0,
  price: "",
  stock: "",
  unit: "kg",
  description: "",
  status: "active",
};

/** Mounted only while open and keyed by record, so initial state is correct. */
export function ProductFormModal({
  product,
  categories,
  subCategories,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const formId = useId();
  const [values, setValues] = useState<FormValues>(() =>
    product
      ? {
          name: product.name,
          image: product.image,
          categoryId: product.categoryId,
          subCategoryId: product.subCategoryId,
          price: String(product.price),
          stock: String(product.stock),
          unit: product.unit,
          description: product.description,
          status: product.status,
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Errors>({});

  const categoryOptions: SelectOption[] = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categories],
  );

  // The subcategory list always follows the selected category.
  const subCategoryOptions: SelectOption[] = useMemo(
    () =>
      subCategories
        .filter((row) => row.categoryId === values.categoryId)
        .map((row) => ({ value: String(row.id), label: row.name })),
    [subCategories, values.categoryId],
  );

  const validate = (): Errors => {
    const next: Errors = {};
    const name = values.name.trim();
    const price = Number(values.price);
    const stock = Number(values.stock);

    if (!name) {
      next.name = "Product name is required.";
    } else if (name.length < 2) {
      next.name = "Use at least 2 characters.";
    }

    if (!values.image) next.image = "Upload a product image.";
    if (!values.categoryId) next.categoryId = "Select a category.";
    if (!values.subCategoryId) next.subCategoryId = "Select a subcategory.";

    if (values.price.trim() === "") {
      next.price = "Price is required.";
    } else if (!Number.isFinite(price) || price <= 0) {
      next.price = "Enter a price greater than 0.";
    }

    if (values.stock.trim() === "") {
      next.stock = "Stock quantity is required.";
    } else if (!Number.isInteger(stock) || stock < 0) {
      next.stock = "Enter a whole number of 0 or more.";
    }

    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      name: values.name.trim(),
      image: values.image,
      categoryId: values.categoryId,
      subCategoryId: values.subCategoryId,
      price: Number(values.price),
      stock: Number(values.stock),
      unit: values.unit,
      description: values.description.trim(),
      status: values.status,
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={product ? "Edit product" : "Add product"}
      description={
        product
          ? "Update pricing, stock and placement for this product."
          : "List a new product under a category and subcategory."
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            {product ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput
          label="Product name"
          required
          value={values.name}
          maxLength={80}
          placeholder="e.g. Hybrid Tomato"
          error={errors.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            required
            value={values.categoryId ? String(values.categoryId) : ""}
            options={categoryOptions}
            placeholder="Select a category"
            error={errors.categoryId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                categoryId: Number(event.target.value),
                // The previous subcategory belongs to the old category.
                subCategoryId: 0,
              }))
            }
          />

          <Select
            label="Sub category"
            required
            value={values.subCategoryId ? String(values.subCategoryId) : ""}
            options={subCategoryOptions}
            placeholder={
              values.categoryId
                ? subCategoryOptions.length > 0
                  ? "Select a subcategory"
                  : "No subcategories in this category"
                : "Select a category first"
            }
            disabled={subCategoryOptions.length === 0}
            error={errors.subCategoryId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                subCategoryId: Number(event.target.value),
              }))
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormInput
            label="Price (₹)"
            required
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={values.price}
            placeholder="0.00"
            error={errors.price}
            onChange={(event) =>
              setValues((current) => ({ ...current, price: event.target.value }))
            }
          />

          <FormInput
            label="Stock quantity"
            required
            type="number"
            min={0}
            step="1"
            inputMode="numeric"
            value={values.stock}
            placeholder="0"
            error={errors.stock}
            onChange={(event) =>
              setValues((current) => ({ ...current, stock: event.target.value }))
            }
          />

          <Select
            label="Unit"
            required
            value={values.unit}
            options={UNIT_OPTIONS}
            onChange={(event) =>
              setValues((current) => ({ ...current, unit: event.target.value }))
            }
          />
        </div>

        <ImageUpload
          label="Product image"
          required
          value={values.image}
          error={errors.image}
          onChange={(image) => setValues((current) => ({ ...current, image }))}
        />

        <TextArea
          label="Description"
          rows={3}
          maxLength={400}
          value={values.description}
          placeholder="Grade, packing and any handling notes."
          hint="Optional, shown to buyers on the product page."
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
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
