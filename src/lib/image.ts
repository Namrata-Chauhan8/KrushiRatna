/**
 * Image preparation for `localStorage`.
 *
 * Uploaded images are kept as data URLs inside the persisted collections, and
 * the whole store has to fit in roughly 5 MB. A raw 2 MB photo becomes a
 * ~2.7 MB data URL and would blow that budget after a couple of uploads, so
 * every upload is scaled down to thumbnail size first — the UI never renders
 * these larger than 64 px.
 */

/** Longest edge, in pixels, of a stored image. */
const MAX_EDGE = 256;

/** Small SVGs are stored as-is; they stay crisp and cost almost nothing. */
const MAX_INLINE_SVG_BYTES = 16 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("That image could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That image could not be decoded."));
    image.src = src;
  });
}

/** True when the browser can encode WEBP, which compresses far better than PNG. */
function supportsWebp(canvas: HTMLCanvasElement): boolean {
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

/**
 * Read a picked file and return a small data URL safe to persist.
 * Falls back to the original data URL if the browser cannot rasterise it.
 */
export async function toStoredImage(file: File): Promise<string> {
  const original = await readAsDataUrl(file);

  if (file.type === "image/svg+xml" && file.size <= MAX_INLINE_SVG_BYTES) {
    return original;
  }

  try {
    const image = await loadImage(original);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) return original;

    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const context = canvas.getContext("2d");
    if (!context) return original;

    const webp = supportsWebp(canvas);
    if (!webp) {
      // JPEG has no alpha channel, so flatten onto the surface colour the
      // thumbnails sit on rather than letting transparency turn black.
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const encoded = canvas.toDataURL(
      webp ? "image/webp" : "image/jpeg",
      0.82,
    );

    // Vector sources can rasterise larger than they started; keep the smaller.
    return encoded.length < original.length ? encoded : original;
  } catch {
    return original;
  }
}
