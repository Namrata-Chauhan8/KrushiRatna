"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { toStoredImage } from "@/lib/image";
import { placeholderThumbnail } from "@/lib/thumbnails";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

interface ImageUploadProps {
  label: string;
  /** Data URL of the current image, or an empty string. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

/**
 * There is no upload endpoint, so the chosen file is scaled down to a
 * thumbnail and kept as a data URL. That is the same `string` shape the seeded
 * mock images use, which keeps the rest of the app unaware of the difference,
 * and it keeps the persisted store well inside the browser storage quota.
 */
export function ImageUpload({
  label,
  value,
  onChange,
  error,
  required,
}: ImageUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const shownError = error ?? localError;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      setLocalError("Choose a PNG, JPG, WEBP or SVG image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("Image must be 5 MB or smaller.");
      return;
    }

    setBusy(true);
    try {
      const stored = await toStoredImage(file);
      setLocalError(undefined);
      onChange(stored);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "That image could not be read.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span aria-hidden className="ml-0.5 text-danger">
            *
          </span>
        ) : null}
      </span>

      <div
        className={cn(
          "flex items-center gap-4 rounded-lg border border-dashed p-3",
          shownError ? "border-danger" : "border-line",
        )}
      >
        {/* Data URLs are generated at runtime, so next/image cannot optimise them. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value || placeholderThumbnail}
          alt={value ? "Selected image preview" : "No image selected"}
          className="size-16 shrink-0 rounded-lg border border-line bg-surface-muted object-cover"
        />

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            aria-describedby={shownError ? `${id}-error` : undefined}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ImagePlus aria-hidden className="size-4" />
            {busy ? "Processing..." : value ? "Replace image" : "Upload image"}
          </button>

          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setLocalError(undefined);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <Trash2 aria-hidden className="size-4" />
              Remove
            </button>
          ) : null}

          <p className="w-full text-xs text-muted">
            PNG, JPG, WEBP or SVG. Stored as a 256 px thumbnail.
          </p>
        </div>

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
          }}
        />
      </div>

      {shownError ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}
