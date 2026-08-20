"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Command,
  LogOut,
  Settings,
  ShieldAlert,
  ChevronDown,
  Menu,
  User,
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CheckSquare,
  CreditCard,
  Activity,
  Sparkles,
  Plus,
  Radio,
  Video,
  Calendar,
  UserCheck
} from "lucide-react";
import NotificationCenter from "@/components/admin/NotificationCenter";
import GlobalSearchModal from "@/components/admin/GlobalSearchModal";

interface PageMeta {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const PAGE_TITLES: Record<string, PageMeta> = {
  "/admin": {
    title: "Good morning, Admin",
    subtitle: "Here's what's happening across Glarus Academy today.",
    icon: LayoutDashboard
  },
  "/admin/instructors": {
    title: "Instructor Management",
    subtitle: "Verify instructor applications, track teaching performance, and oversee live cohorts.",
    icon: GraduationCap
  },
  "/admin/students": {
    title: "Student Management",
    subtitle: "Track learner enrollments, module completion rates, assignments, and certificates.",
    icon: Users
  },
  "/admin/courses": {
    title: "Course Management",
    subtitle: "Review submitted curriculums, validate lesson quality, and configure catalog pricing.",
    icon: BookOpen
  },
  "/admin/create": {
    title: "Course Creator & AI Architect",
    subtitle: "Draft, architect with AI copilot, and publish courses directly to Glarus Academy.",
    icon: Sparkles
  },
  "/admin/tasks": {
    title: "Instructor Task Management",
    subtitle: "Assign structured deliverables, manage review pipelines, and approve instructor payouts.",
    icon: CheckSquare
  },
  "/admin/live-training/create": {
    title: "Create Live Course & AI Architect",
    subtitle: "Design scheduled cohorts, generate session agendas with AI, and assign instructors.",
    icon: Sparkles
  },
  "/admin/live-training/sessions": {
    title: "Live Training Sessions",
    subtitle: "Monitor and manage individual live workshop sessions across all active cohorts.",
    icon: Video
  },
  "/admin/live-training/instructor-assignments": {
    title: "Instructor Live Assignments & Permissions",
    subtitle: "Configure instructor allocations, session editing rights, and scheduling permissions.",
    icon: UserCheck
  },
  "/admin/live-training/calendar": {
    title: "Live Training Master Calendar",
    subtitle: "Interactive schedule of all upcoming, active, and completed live cohort sessions.",
    icon: Calendar
  },
  "/admin/live-training": {
    title: "Live Training & Cohort Management",
    subtitle: "Oversee live bootcamps, scheduled sessions, cohort tracks, and instructor allocations.",
    icon: Radio
  },
  "/admin/payments": {
    title: "Payments & Refunds",
    subtitle: "Oversee platform revenue, instructor earnings, payout requests, and student refunds.",
    icon: CreditCard
  },
  "/admin/analytics": {
    title: "Platform Analytics & Intelligence",
    subtitle: "Enterprise telemetry across learner growth, retention funnels, and revenue metrics.",
    icon: Activity
  },
  "/admin/audit": {
    title: "Audit & Security Logs",
    subtitle: "Immutable real-time audit trail of administrative decisions, security events, and edits.",
    icon: ShieldAlert
  },
  "/admin/settings": {
    title: "Platform Settings",
    subtitle: "Configure global academy settings, permissions, commissions, and integrations.",
    icon: Settings
  }
};

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener("open-admin-search", handleOpenSearch);
    return () => window.removeEventListener("open-admin-search", handleOpenSearch);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matchedKey =
    Object.keys(PAGE_TITLES)
      .sort((a, b) => b.length - a.length)
      .find(
        (key) => key === pathname || (key !== "/admin" && pathname.startsWith(key))
      ) || "/admin";

  const currentPage = PAGE_TITLES[matchedKey] || {
    title: "Admin Portal",
    subtitle: "Glarus Academy Enterprise Administration",
    icon: LayoutDashboard
  };
  const PageIcon = currentPage.icon;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-card/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 flex-nowrap transition-all">
        {/* Left: Mobile Toggle + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-subtext hover:text-text hover:bg-white/5 transition-colors"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 items-center justify-center shrink-0">
              <PageIcon className="w-4 h-4 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-text tracking-tight truncate leading-tight">
                {currentPage.title}
              </h1>
              <p className="text-[11px] text-subtext truncate hidden md:block leading-tight">
                {currentPage.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Global Search (⌘K) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2.5 h-9 pl-3 pr-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 text-subtext hover:text-text transition-all w-52 lg:w-64"
          >
            <Search className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-xs font-medium truncate flex-1 text-left">
              Search anything...
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-subtext/70 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 shrink-0">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </span>
          </button>
          {/* Compact search icon for small screens */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-lg text-subtext hover:text-text hover:bg-white/5 transition-colors"
            title="Search (⌘K)"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Create Course Button */}
          {pathname !== "/admin/create" && (
            <Link
              href="/admin/create"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 hover:border-purple-500/60 shadow-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Create Course</span>
            </Link>
          )}

          {/* Notification Bell */}
          <NotificationCenter />

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2.5 h-11 px-1.5 sm:px-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
              aria-expanded={profileMenuOpen}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs border border-white/10 shrink-0">
                AD
              </div>
              <div className="hidden md:block text-left leading-tight">
                <p className="text-xs font-semibold text-text">Super Admin</p>
                <p className="text-[11px] text-subtext hidden lg:block">admin@glarus.edu</p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-subtext hidden md:block transition-transform duration-200 ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Menu Popover */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-white/5">
                  <p className="text-xs font-bold text-text">Super Admin</p>
                  <p className="text-[11px] text-subtext truncate">admin@glarus.edu</p>
                </div>

                <div className="p-1 space-y-0.5 text-xs font-medium">
                  <Link
                    href="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-subtext hover:text-text hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-subtext hover:text-text hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="p-1 border-t border-white/5">
                  <Link
                    href="/login"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
