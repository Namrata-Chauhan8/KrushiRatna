"use client";

import { ChevronLeft, LogOut, PackageOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME, NAV_SECTIONS } from "@/components/layout/nav";
import { cn } from "@/lib/cn";

interface SidebarProps {
  /** Desktop rail state; ignored inside the mobile drawer. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Called after a navigation so the mobile drawer can close itself. */
  onNavigate?: () => void;
  onLogout: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  onNavigate,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-surface">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2 border-b border-line px-3",
          collapsed ? "justify-center" : "justify-between pl-4",
        )}
      >
        {collapsed ? null : (
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex min-w-0 items-center gap-2"
          >
            <PackageOpen aria-hidden className="size-6 shrink-0 text-ink" />
            <span className="truncate text-lg font-bold tracking-tight text-ink">
              {APP_NAME}
            </span>
          </Link>
        )}

        {/* Doubles as the brand mark while the rail is collapsed. */}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className="hidden rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-ink lg:block"
        >
          <ChevronLeft
            aria-hidden
            className={cn("size-5 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      <nav
        aria-label="Main"
        className="scroll-slim flex-1 overflow-y-auto px-3 py-5"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6 last:mb-0">
            {collapsed ? (
              <div className="mx-2 mb-2 border-t border-line" />
            ) : (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-faint uppercase">
                {section.title}
              </p>
            )}

            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-brand-soft text-brand-strong"
                          : "text-muted hover:bg-surface-muted hover:text-ink",
                      )}
                    >
                      <Icon aria-hidden className="size-[18px] shrink-0" />
                      {collapsed ? (
                        <span className="sr-only">{item.label}</span>
                      ) : (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-danger-soft hover:text-danger",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut aria-hidden className="size-[18px] shrink-0" />
          {collapsed ? <span className="sr-only">Logout</span> : "Logout"}
        </button>
      </div>
    </div>
  );
}
