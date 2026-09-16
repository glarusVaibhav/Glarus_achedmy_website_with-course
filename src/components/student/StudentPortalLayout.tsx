"use client";

import React, { useState, useEffect } from "react";
import { StudentSidebar } from "./StudentSidebar";
import { Menu, Sparkles } from "lucide-react";
import Link from "next/link";

interface StudentPortalLayoutProps {
  children: React.ReactNode;
}

export function StudentPortalLayout({ children }: StudentPortalLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isDragging, setIsDragging] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem("glarus-student-sidebar-width");
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= 220 && parsed <= 500) {
          setSidebarWidth(parsed);
        }
      }
      const savedCollapsed = localStorage.getItem("glarus-student-sidebar-collapsed");
      if (savedCollapsed) {
        setCollapsed(savedCollapsed === "true");
      }
    } catch {
      /* silent */
    }
  }, []);

  const handleToggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("glarus-student-sidebar-collapsed", String(next));
    } catch {
      /* silent */
    }
  };

  const handleWidthChange = (newWidth: number) => {
    setSidebarWidth(newWidth);
    try {
      localStorage.setItem("glarus-student-sidebar-width", String(newWidth));
    } catch {
      /* silent */
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex w-full relative">
      {/* ── Fixed / Collapsible & Draggable Sidebar ── */}
      <StudentSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        sidebarWidth={sidebarWidth}
        onWidthChange={handleWidthChange}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* ── Main Scrollable Canvas (Dynamically adapts to sidebar width) ── */}
      <div
        style={{
          paddingLeft: collapsed ? "80px" : `${sidebarWidth}px`,
        }}
        className={`flex-1 flex flex-col min-w-0 ${
          isDragging ? "transition-none select-none" : "transition-[padding] duration-200 ease-out"
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
