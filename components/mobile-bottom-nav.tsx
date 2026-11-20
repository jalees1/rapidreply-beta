"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Overview", href: "/overview", icon: ChartIcon },
  { label: "Campaigns", href: "/campaigns", icon: CampaignIcon },
  { label: "Inbox", href: "/inbox", icon: InboxIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${
                active
                  ? "text-blue-700"
                  : "text-muted hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl transition-colors ${
                  active ? "bg-blue-100 text-blue-700" : ""
                }`}
              >
                <Icon active={active} />
              </span>
              <span className="max-w-full truncate px-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function IconFrame({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <IconFrame active={active}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill={active ? "currentColor" : "none"} />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" fill={active ? "currentColor" : "none"} />
    </IconFrame>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <IconFrame active={active}>
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 4-4 3 2 4-6" />
    </IconFrame>
  );
}

function CampaignIcon({ active }: { active: boolean }) {
  return (
    <IconFrame active={active}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m10 9 5 3-5 3z" fill={active ? "var(--color-background)" : "currentColor"} stroke="none" />
    </IconFrame>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <IconFrame active={active}>
      <path d="M4 5h16v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" />
      <path d="M4 14h4l1.5 2h5L16 14h4" fill={active ? "var(--color-background)" : "none"} />
    </IconFrame>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <IconFrame active={active}>
      <circle cx="12" cy="12" r="3" fill={active ? "var(--color-background)" : "none"} />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-3v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H5v-3h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h3v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v3h-.2a1.7 1.7 0 0 0-1.6 1z" />
    </IconFrame>
  );
}
