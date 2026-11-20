"use client";

/**
 * Sidebar Navigation
 *
 * Text-only nav with active state and workspace section.
 */

import LanguageSwitcher from "@/components/language-switcher";
import BrandLogo from "@/components/brand-logo";
import { useI18n } from "@/lib/i18n/provider";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Overview", href: "/overview" },
  { label: "Inbox", href: "/inbox" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "DM Logs", href: "/logs" },
  { label: "Settings", href: "/settings" },
  { label: "Diagnostics", href: "/diagnostics" },
] as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  workspaceName,
}: SidebarProps) {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="dashboard-navigation"
        className={`
          fixed top-0 left-0 z-50 h-dvh w-64 max-w-[85vw] shrink-0 bg-surface border-r border-border flex flex-col
          transition-transform duration-200 ease-out
          lg:h-full lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Same reason as the top bar: the drawer is full height, so the
            wordmark would otherwise land under the status bar. */}
        <div
          className="flex items-center justify-between gap-3 px-6 py-5 border-b border-border"
          style={{ paddingTop: "calc(1.25rem + env(safe-area-inset-top))" }}
        >
          <Link href="/dashboard" className="block">
            <BrandLogo className="h-7 w-auto" priority />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded p-2 text-muted hover:bg-surface-hover hover:text-foreground lg:hidden"
            aria-label="Close menu"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`
                  block px-3 py-2.5 rounded text-sm
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-muted hover:bg-blue-50 hover:text-blue-700"
                  }
                `}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-border">
          <div className="mb-4"><LanguageSwitcher /></div>
          <p className="text-sm text-foreground truncate">{workspaceName}</p>
          <p className="text-xs text-muted">{t("Self-hosted")}</p>
        </div>
      </aside>
    </>
  );
}
