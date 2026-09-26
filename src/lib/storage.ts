/**
 * localStorage-backed collections.
 *
 * The app has no backend, so each collection lives in its own `localStorage`
 * key and is exposed as a React external store. `useSyncExternalStore` renders
 * `getServerSnapshot` (the seed data) during prerender and hydration, then
 * re-renders with `getSnapshot` (the persisted data) immediately afterwards,
 * so persisted edits show up without a hydration mismatch.
 *
 * Writes are the only thing that touch `localStorage` during normal use: a
 * missing key is seeded once from a subscription (an effect), never from a
 * render.
 */

export const STORAGE_KEYS = {
  categories: "admin_categories",
  subCategories: "admin_subcategories",
  products: "admin_products",
  orders: "admin_orders",
} as const;

type Listener = () => void;

interface PersistedCollection<T> {
  subscribe: (listener: Listener) => () => void;
  /** Current value on the client, read from `localStorage` on first access. */
  getSnapshot: () => T[];
  /** Value used while prerendering and hydrating. */
  getServerSnapshot: () => T[];
  set: (updater: (current: T[]) => T[]) => void;
}

/* ------------------------------------------------------------------ *
 * Write-failure reporting
 * ------------------------------------------------------------------ */

let storageError: string | null = null;
const errorListeners = new Set<Listener>();

function reportStorageError(message: string | null) {
  if (storageError === message) return;
  storageError = message;
  errorListeners.forEach((listener) => listener());
}

/**
 * Exposes the last persistence failure so the UI can tell the user their
 * changes are not being saved instead of silently pretending they are.
 */
export const storageErrorStore = {
  subscribe(listener: Listener) {
    errorListeners.add(listener);
    return () => errorListeners.delete(listener);
  },
  getSnapshot: () => storageError,
  getServerSnapshot: () => null,
  clear: () => reportStorageError(null),
};

/** Feature-detects a usable `localStorage` (absent in SSR, blocked in some privacy modes). */
function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Storage schema version.
 *
 * Saved data is deliberately never overwritten by the seed, which means a
 * change to seed data alone never reaches anyone who has already used the app.
 * Bump this when a key's seed changes in a way that *should* reach them, and
 * add the matching step to `migrate()` below.
 */
const SCHEMA_VERSION_KEY = "admin_schema_version";
const SCHEMA_VERSION = 2;

/**
 * Runs once per version bump, at import time — before any collection is read,
 * so a retired dataset never reaches React.
 */
function migrate(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const stored = Number(storage.getItem(SCHEMA_VERSION_KEY)) || 1;
    if (stored >= SCHEMA_VERSION) return;

    // v2: orders stopped shipping with a sample dataset — they are created
    // from the Product page now. Drop the stored orders so the sample ones
    // saved by an earlier build go away instead of lingering forever. The
    // catalogue keys are left alone: those hold hand-entered work.
    if (stored < 2) storage.removeItem(STORAGE_KEYS.orders);

    storage.setItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION));
  } catch {
    // Storage blocked or full — nothing to migrate.
  }
}

migrate();

export function createPersistedCollection<T>(
  key: string,
  seed: T[],
  isValid: (value: unknown) => value is T[],
): PersistedCollection<T> {
  /** Cached so `getSnapshot` returns a stable reference between renders. */
  let cache: T[] | null = null;
  const listeners = new Set<Listener>();

  const notify = () => listeners.forEach((listener) => listener());

  /** Reads the stored value, or `null` when it is missing or unusable. */
  function readStored(): T[] | null {
    const storage = getStorage();
    if (!storage) return null;

    try {
      const raw = storage.getItem(key);
      if (raw === null) return null;

      const parsed: unknown = JSON.parse(raw);
      // Anything can end up in localStorage, including data written by an
      // older version of this app, so reject it if it is not the right shape.
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  const read = (): T[] => readStored() ?? seed;

  function persist(value: T[]): void {
    const storage = getStorage();
    if (!storage) return;

    try {
      storage.setItem(key, JSON.stringify(value));
      reportStorageError(null);
    } catch {
      // Almost always the ~5 MB quota. The in-memory value stays correct for
      // this session; only persistence is lost.
      reportStorageError(
        "Browser storage is full, so the latest change was not saved. It will be lost on refresh.",
      );
    }
  }

  function getSnapshot(): T[] {
    if (cache === null) cache = read();
    return cache;
  }

  return {
    subscribe(listener) {
      if (listeners.size === 0) {
        // Write the seed once for a key that is missing or unusable, from an
        // effect rather than a render. An existing, valid value is never
        // overwritten.
        if (readStored() === null) persist(seed);
        if (typeof window !== "undefined") {
          window.addEventListener("storage", onExternalChange);
        }
      }

      listeners.add(listener);

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", onExternalChange);
        }
      };
    },

    getSnapshot,
    getServerSnapshot: () => seed,

    set(updater) {
      const next = updater(getSnapshot());
      cache = next;
      persist(next);
      notify();
    },
  };

  /** Keeps other tabs of the same app in step. */
  function onExternalChange(event: StorageEvent) {
    // `key === null` means the whole store was cleared.
    if (event.key !== null && event.key !== key) return;
    cache = read();
    notify();
  }
}
