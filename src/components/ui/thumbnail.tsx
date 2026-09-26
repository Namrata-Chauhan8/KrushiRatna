"use client";

import { useImagePreview } from "@/components/ui/image-preview";
import { cn } from "@/lib/cn";
import { placeholderThumbnail } from "@/lib/thumbnails";

interface ThumbnailProps {
  src: string;
  /** Record name, used for the alt text and the preview dialog's title. */
  alt: string;
  className?: string;
}

/**
 * Table thumbnail. Clicking it opens the full image in the shared preview
 * dialog, since 40px is too small to judge an image by.
 *
 * Sources are runtime data URLs (the placeholder tile or an uploaded file),
 * which `next/image` cannot optimise, so this renders a plain `<img>`.
 */
export function Thumbnail({ src, alt, className }: ThumbnailProps) {
  const preview = useImagePreview();

  return (
    <button
      type="button"
      onClick={() => preview.open({ src, name: alt })}
      aria-label={`Preview image for ${alt}`}
      className="block rounded-lg transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || placeholderThumbnail}
        alt={alt}
        loading="lazy"
        className={cn(
          "size-10 rounded-lg border border-line bg-surface-muted object-cover",
          className,
        )}
      />
    </button>
  );
}
