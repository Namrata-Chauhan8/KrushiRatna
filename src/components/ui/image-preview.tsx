"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Modal } from "@/components/ui/modal";
import { placeholderThumbnail } from "@/lib/thumbnails";

interface PreviewTarget {
  src: string;
  /** Record name — used as the dialog title and the image's alt text. */
  name: string;
}

interface ImagePreviewApi {
  open: (target: PreviewTarget) => void;
}

const ImagePreviewContext = createContext<ImagePreviewApi | null>(null);

/**
 * Mounts one preview dialog for the whole app.
 *
 * Table thumbnails are tiny, so clicking one opens the full image here. A
 * single shared dialog means a table of 50 rows doesn't mount 50 modals.
 */
export function ImagePreviewProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<PreviewTarget | null>(null);

  const open = useCallback((next: PreviewTarget) => setTarget(next), []);
  const api = useMemo<ImagePreviewApi>(() => ({ open }), [open]);

  return (
    <ImagePreviewContext.Provider value={api}>
      {children}

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title={target?.name ?? "Image"}
        description="Image preview"
        size="sm"
      >
        {target ? (
          /*
           * Uploads are stored as 256px thumbnails to stay inside the browser
           * storage quota, so the preview is boxed at a size that suits them —
           * a wider dialog would just frame a small image in empty space. The
           * square box with object-contain keeps any aspect ratio centred.
           */
          <div className="mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-xl border border-line bg-surface-muted">
            {/* Runtime data URLs, which next/image cannot optimise. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={target.src || placeholderThumbnail}
              alt={target.name}
              className="size-full object-contain"
            />
          </div>
        ) : null}
      </Modal>
    </ImagePreviewContext.Provider>
  );
}

export function useImagePreview(): ImagePreviewApi {
  const api = useContext(ImagePreviewContext);
  if (!api) {
    throw new Error("useImagePreview must be used inside <ImagePreviewProvider>");
  }
  return api;
}
