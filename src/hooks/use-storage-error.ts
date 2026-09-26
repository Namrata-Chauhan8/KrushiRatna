"use client";

import { useSyncExternalStore } from "react";

import { storageErrorStore } from "@/lib/storage";

/**
 * The last persistence failure, or `null`. Lets the shell warn the user that
 * their changes are only held in memory instead of failing silently.
 */
export function useStorageError(): string | null {
  return useSyncExternalStore(
    storageErrorStore.subscribe,
    storageErrorStore.getSnapshot,
    storageErrorStore.getServerSnapshot,
  );
}
