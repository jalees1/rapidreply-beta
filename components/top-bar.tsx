"use client";

/**
 * Top Bar
 *
 * Page title, mobile hamburger, and connection status.
 */

import type { StaticMessageKey } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const pageTitles: Record<string, StaticMessageKey> = {
  "/dashboard": "Dashboard",
  "/overview": "Overview",
  "/inbox": "Inbox",
  "/campaigns/import": "Import campaigns",
  "/campaigns": "Campaigns",
  "/campaigns/new": "New Campaign",
  "/automations": "Campaigns",
  "/automations/new": "New Campaign",
  "/logs": "DM Logs",
  "/settings": "Settings",
  "/diagnostics": "Diagnostics",
};

interface TopBarProps {
  onMenuClick: () => void;
  isMenuOpen: boolean;
  workspaceName: string;
  userName: string | null;
  userEmail: string | null;
  instagramUsername: string | null;
  instagramAccountCount: number;
}

export default function TopBar({
  onMenuClick,
  isMenuOpen,
  workspaceName,
  userName,
  userEmail,
  instagramUsername,
  instagramAccountCount,
}: TopBarProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenu = useRef<HTMLDivElement>(null);
  const title: StaticMessageKey = pageTitles[pathname] ?? (
    pathname.endsWith("/edit") ? "Edit campaign"
      : pathname.startsWith("/campaigns/") ? "Campaign details" : "Dashboard"
  );
  const accountName = userName?.trim() || userEmail?.split("@")[0] || "Account";
  const initials = accountName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!profileMenu.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function handleSignOut() {
    setProfileOpen(false);
    void signOut({ callbackUrl: "/login" });
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 lg:px-8 border-b border-border bg-background"
      // Installed to the home screen the app starts at the very top of the
      // display, so without this the title sits under the clock and battery.
      // The inset is 0 in a browser tab and on desktop.
      style={{
        height: "calc(4rem + env(safe-area-inset-top))",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden shrink-0 rounded border border-border p-2 text-muted hover:bg-surface-hover hover:text-foreground"
          aria-label={t("Toggle sidebar")}
          aria-controls="dashboard-navigation"
          aria-expanded={isMenuOpen}
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
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <h1 className="truncate text-base font-semibold sm:text-lg">{t(title)}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {instagramAccountCount > 0 ? (
          <a
            href="/settings"
            className="flex max-w-44 items-center gap-2 rounded border border-border bg-surface px-2.5 py-2 text-sm text-foreground hover:border-border-hover hover:bg-surface-hover sm:max-w-64"
            aria-label={`Instagram connected: ${
              instagramAccountCount > 1
                ? `${instagramAccountCount} accounts`
                : `@${instagramUsername}`
            }`}
          >
            <InstagramIcon />
            <span className="hidden truncate sm:inline">
              {instagramAccountCount > 1
                ? t("{count} accounts", { count: instagramAccountCount })
                : `@${instagramUsername}`}
            </span>
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
          </a>
        ) : (
          <a
            href="/api/instagram/connect"
            className="rr-button-primary shrink-0 whitespace-nowrap px-3 py-2 text-sm font-semibold text-white"
          >
            <span className="sm:hidden">{t("Connect")}</span>
            <span className="hidden sm:inline">{t("Connect Instagram")}</span>
          </a>
        )}

        <div className="relative" ref={profileMenu}>
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-label="Open account menu"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex size-9 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background shadow-sm hover:opacity-90"
          >
            {initials || "A"}
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-semibold text-foreground">{accountName}</p>
                {userEmail && <p className="mt-0.5 truncate text-xs text-muted">{userEmail}</p>}
                <p className="mt-2 truncate text-xs text-muted">{workspaceName}</p>
              </div>

              <div className="border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <InstagramIcon />
                  <span className="truncate">
                    {instagramAccountCount > 0
                      ? instagramAccountCount > 1
                        ? `${instagramAccountCount} Instagram accounts connected`
                        : `@${instagramUsername} connected`
                      : "No Instagram account connected"}
                  </span>
                </div>
              </div>

              <div className="p-2">
                <a
                  href="/settings"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center rounded px-3 py-2 text-sm text-foreground hover:bg-surface-hover"
                >
                  Account settings
                </a>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex w-full items-center rounded px-3 py-2 text-left text-sm font-medium text-error hover:bg-error/10"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
