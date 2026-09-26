"use client";

import { Menu, PackageOpen, TriangleAlert, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { APP_NAME } from "@/components/layout/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useStorageError } from "@/hooks/use-storage-error";
import { cn } from "@/lib/cn";
import { storageErrorStore } from "@/lib/storage";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const storageError = useStorageError();

  // The drawer overlays the page on small screens, so lock the body behind it.
  useEffect(() => {
    if (!drawerOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  // Close the drawer whenever the route changes, including on back/forward.
  // Adjusting during render keeps the drawer from flashing over the new page.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
  }

  const handleLogout = () => {
    setLogoutOpen(false);
    setDrawerOpen(false);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 border-r border-line transition-[width] duration-200 lg:block",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
          onLogout={() => setLogoutOpen(true)}
        />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          drawerOpen ? "visible" : "invisible",
        )}
      >
        <div
          aria-hidden
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "absolute inset-0 bg-slate-900/40 transition-opacity duration-200",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          aria-label="Sidebar"
          aria-hidden={!drawerOpen}
          className={cn(
            "absolute inset-y-0 left-0 w-64 border-r border-line shadow-pop transition-transform duration-200",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar
            collapsed={false}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            onNavigate={() => setDrawerOpen(false)}
            onLogout={() => setLogoutOpen(true)}
          />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <Menu aria-hidden className="size-5" />
          </button>
          <span className="flex items-center gap-2">
            <PackageOpen aria-hidden className="size-5 text-ink" />
            <span className="text-base font-bold tracking-tight text-ink">
              {APP_NAME}
            </span>
          </span>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {storageError ? (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3"
            >
              <TriangleAlert
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-danger"
              />
              <p className="flex-1 text-sm text-danger">{storageError}</p>
              <button
                type="button"
                onClick={storageErrorStore.clear}
                aria-label="Dismiss storage warning"
                className="-mt-0.5 rounded-lg p-1 text-danger transition-colors hover:bg-danger/10"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          ) : null}

          {children}
        </main>
      </div>

      <ConfirmationDialog
        open={logoutOpen}
        title="Log out?"
        message="Do you really want to logout ?"
        confirmLabel="Log out"
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}
