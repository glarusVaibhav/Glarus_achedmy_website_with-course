"use client";

import React, { useState } from "react";
import { StudentSidebar } from "./StudentSidebar";
import { Menu, Search, Bell, Sparkles } from "lucide-react";
import Link from "next/link";

interface StudentPortalLayoutProps {
  children: React.ReactNode;
}

export function StudentPortalLayout({ children }: StudentPortalLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text flex w-full relative">
      {/* ── Fixed / Collapsible Sidebar ── */}
      <StudentSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* ── Main Scrollable Canvas ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Mobile Mini Top Bar (Only visible on small viewports) */}
        <div className="lg:hidden h-14 border-b border-border/60 px-4 flex items-center justify-between bg-card/60 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-white/[0.05] text-subtext hover:text-text cursor-pointer"
            aria-label="Open student navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text">Student Portal</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
              Glarus
            </span>
          </div>

          <Link
            href="/student/recorded-sessions"
            className="p-2 rounded-xl bg-purple-500/15 text-purple-400 text-xs font-bold flex items-center gap-1 border border-purple-500/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recordings</span>
          </Link>
        </div>

        {/* Inner Page Content */}
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
