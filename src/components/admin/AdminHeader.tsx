"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Command,
  ShieldCheck,
  LogOut,
  Settings,
  ShieldAlert,
  ChevronDown,
  Menu,
  ExternalLink,
  Sparkles,
  Layers
} from "lucide-react";
import NotificationCenter from "@/components/admin/NotificationCenter";
import GlobalSearchModal from "@/components/admin/GlobalSearchModal";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Good morning, Admin",
    subtitle: "Here's what's happening across Glarus Academy today."
  },
  "/admin/instructors": {
    title: "Instructor Management",
    subtitle: "Verify instructor applications, track teaching performance, and oversee live cohorts."
  },
  "/admin/students": {
    title: "Student Management",
    subtitle: "Track learner enrollments, module completion rates, assignments, and certificates."
  },
  "/admin/courses": {
    title: "Course Management",
    subtitle: "Review submitted curriculums, validate lesson quality, and configure catalog pricing."
  },
  "/admin/tasks": {
    title: "Instructor Task Management",
    subtitle: "Assign structured deliverables, manage review pipelines, and approve instructor payouts."
  },
  "/admin/payments": {
    title: "Payments & Refunds",
    subtitle: "Oversee platform revenue, instructor earnings, payout requests, and student refunds."
  },
  "/admin/analytics": {
    title: "Platform Analytics & Intelligence",
    subtitle: "Enterprise telemetry across learner growth, retention funnels, and revenue metrics."
  },
  "/admin/audit": {
    title: "Audit & Security Logs",
    subtitle: "Immutable real-time audit trail of administrative decisions, security events, and edits."
  },
  "/admin/settings": {
    title: "Platform Settings",
    subtitle: "Configure global academy settings, permissions, commissions, and integrations."
  }
};

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export default function AdminHeader({ onToggleSidebar, isSidebarCollapsed }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener("open-admin-search", handleOpenSearch);
    return () => window.removeEventListener("open-admin-search", handleOpenSearch);
  }, []);

  const currentPage = PAGE_TITLES[pathname] || {
    title: "Admin Portal",
    subtitle: "Glarus Academy Enterprise Administration"
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-20 bg-card/85 backdrop-blur-xl border-b border-white/10 px-6 sm:px-8 flex items-center justify-between transition-all">
        {/* Left: Page Title / Mobile Toggle */}
        <div className="flex items-center gap-4 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-card border border-white/10 text-subtext hover:text-text"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight truncate flex items-center gap-2">
              <span>{currentPage.title}</span>
            </h1>
            <p className="text-xs text-subtext truncate hidden sm:block mt-0.5 font-medium">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Global Search, Notification Center, Profile Menu */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-background/60 hover:bg-background border border-white/10 text-subtext hover:text-text transition-all group w-44 sm:w-64 justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-purple-400 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-medium text-subtext group-hover:text-text truncate">
                Search anything...
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-0.5 text-[10px] font-bold text-subtext/70 bg-card px-1.5 py-0.5 rounded border border-white/10">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </button>

          {/* Global Notification Bell */}
          <NotificationCenter />

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-card border border-white/10 hover:border-purple-500/30 hover:bg-card-hover transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10">
                AD
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-text leading-none">Super Admin</p>
                <p className="text-[10px] text-purple-400 font-semibold mt-0.5">admin@glarus.edu</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-subtext hidden md:block" />
            </button>

            {/* Profile Menu Popover */}
            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-white/5">
                    <p className="text-xs font-bold text-text">System Administrator</p>
                    <p className="text-[11px] text-subtext truncate">admin@glarus.edu</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Session Active
                    </span>
                  </div>

                  <div className="p-1 space-y-0.5 text-xs font-medium">
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-subtext hover:text-text hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-purple-400" />
                      <span>Platform Settings</span>
                    </Link>

                    <Link
                      href="/admin/audit"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-subtext hover:text-text hover:bg-white/5 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Security & Audit Logs</span>
                    </Link>

                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-subtext hover:text-text hover:bg-white/5 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-sky-400" />
                      <span>View Live Platform</span>
                    </Link>
                  </div>

                  <div className="p-1 border-t border-white/5">
                    <Link
                      href="/login"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-xs font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
