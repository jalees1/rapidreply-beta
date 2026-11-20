"use client";

import { useState } from "react";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";

interface DashboardShellProps {
  children: React.ReactNode;
  workspaceName: string;
  userName: string | null;
  userEmail: string | null;
  instagramUsername: string | null;
  instagramAccountCount: number;
}

export default function DashboardShell({
  children,
  workspaceName,
  userName,
  userEmail,
  instagramUsername,
  instagramAccountCount,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // h-dvh, not h-screen: on mobile browsers the URL bar eats into 100vh, which
    // would push the composer and pagination controls below the fold.
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        workspaceName={workspaceName}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          isMenuOpen={sidebarOpen}
          workspaceName={workspaceName}
          userName={userName}
          userEmail={userEmail}
          instagramUsername={instagramUsername}
          instagramAccountCount={instagramAccountCount}
        />

        {/* overflow-x-hidden: enabling vertical scrolling makes the browser
            allow horizontal scrolling too, which lets a wide child drag the
            whole page sideways on a phone. */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-5 pb-24 sm:py-6 lg:px-8 lg:pb-6">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
