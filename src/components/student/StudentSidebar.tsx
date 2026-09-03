"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  PlaySquare,
  FileCheck,
  Award,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";

export interface StudentNavItem {
  id: string;
  name: string;
  href: string;
  icon: React.ElementType;
  isSpecial?: boolean;
}

export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "courses",
    name: "Self-Paced Courses",
    href: "/student/courses",
    icon: BookOpen,
  },
  {
    id: "live-classes",
    name: "Live Training",
    href: "/calendar",
    icon: Calendar,
  },
  {
    id: "recorded-sessions",
    name: "Class Recordings",
    href: "/student/recorded-sessions",
    icon: PlaySquare,
    isSpecial: true,
  },
  {
    id: "assignments",
    name: "Assignments",
    href: "/student/assignments",
    icon: FileCheck,
  },
  {
    id: "certificates",
    name: "Certificates",
    href: "/student/certificates",
    icon: Award,
  },
  {
    id: "payments",
    name: "Payments",
    href: "/student/payments",
    icon: CreditCard,
  },
  {
    id: "settings",
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface StudentSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function StudentSidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: StudentSidebarProps) {
  const pathname = usePathname();

  const [navBadges, setNavBadges] = useState<{
    selfPacedCount: number;
    hasLiveNow: boolean;
    recordingsCount: number;
    assignmentsCount: number;
    certificatesCount: number;
    streak: number;
  }>({
    selfPacedCount: 0,
    hasLiveNow: false,
    recordingsCount: 0,
    assignmentsCount: 0,
    certificatesCount: 0,
    streak: 0,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadDynamicBadges() {
      try {
        const [dashRes, liveRes, asgRes, recRes] = await Promise.all([
          fetch("/api/student/dashboard"),
          fetch("/api/student/live-courses"),
          fetch("/api/student/assignments"),
          fetch("/api/student/recordings"),
        ]);

        if (!isMounted) return;

        let selfPaced = 0;
        let hasLive = false;
        let certs = 0;
        let streakVal = 0;
        let asgCount = 0;
        let recCount = 0;

        if (dashRes.ok) {
          const d = await dashRes.json();
          selfPaced = d.stats?.selfPacedCount || 0;
          certs = d.certificatesCount || 0;
          streakVal = d.stats?.streak || 0;
        }

        if (liveRes.ok) {
          const l = await liveRes.json();
          hasLive = (l.classes || []).some((c: any) => c.status === "ONGOING");
        }

        if (asgRes.ok) {
          const a = await asgRes.json();
          asgCount = (a.assignments || []).length;
        }

        if (recRes.ok) {
          const r = await recRes.json();
          recCount = (r.recordings || []).length;
        }

        setNavBadges({
          selfPacedCount: selfPaced,
          hasLiveNow: hasLive,
          recordingsCount: recCount,
          assignmentsCount: asgCount,
          certificatesCount: certs,
          streak: streakVal,
        });
      } catch {
        /* silent */
      }
    }

    loadDynamicBadges();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const isItemActive = (item: StudentNavItem) => {
    if (item.href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/student/dashboard";
    }
    if (item.id === "courses") {
      return pathname === "/student/courses" || pathname?.startsWith("/student/courses");
    }
    if (item.id === "recorded-sessions") {
      return (
        pathname?.startsWith("/student/recorded-sessions") ||
        pathname?.startsWith("/dashboard/recorded-sessions")
      );
    }
    return pathname?.startsWith(item.href);
  };

  const getItemBadge = (itemId: string) => {
    switch (itemId) {
      case "courses":
        return navBadges.selfPacedCount > 0
          ? { label: `${navBadges.selfPacedCount} Active`, color: "bg-blue-500/15 text-blue-300 border-blue-500/30" }
          : null;
      case "live-classes":
        return navBadges.hasLiveNow
          ? { label: "LIVE", color: "bg-orange-500/15 text-orange-400 border-orange-500/30 animate-pulse" }
          : null;
      case "recorded-sessions":
        return navBadges.recordingsCount > 0
          ? { label: `${navBadges.recordingsCount} Ready`, color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" }
          : null;
      case "assignments":
        return navBadges.assignmentsCount > 0
          ? { label: `${navBadges.assignmentsCount}`, color: "bg-amber-500/15 text-amber-300 border-amber-500/30" }
          : null;
      case "certificates":
        return navBadges.certificatesCount > 0
          ? { label: `${navBadges.certificatesCount}`, color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" }
          : null;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-card/95 backdrop-blur-xl border-r border-border/70 flex flex-col justify-between transition-all duration-300 select-none ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* ── Top Header Brand ── */}
        <div className="h-16 px-4 border-b border-border/60 flex items-center justify-between shrink-0 bg-background/30">
          {!collapsed ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
              title="Glarus Academy Student Portal"
            >
              <Logo className="h-7 w-auto max-w-[125px]" />
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Student
              </span>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto hover:opacity-90 transition-opacity" title="Glarus Academy">
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shadow-xs">
                GA
              </div>
            </Link>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg text-subtext hover:text-text hover:bg-white/[0.06] transition-colors hidden lg:flex cursor-pointer ${
                collapsed ? "mx-auto mt-0" : ""
              }`}
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* ── Navigation Links ── */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-subtext/70">
              Student Navigation
            </div>
          )}

          {STUDENT_NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            const isRecorded = item.id === "recorded-sessions";
            const badgeData = getItemBadge(item.id);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  active
                    ? isRecorded
                      ? "bg-gradient-to-r from-purple-600/20 via-purple-500/15 to-indigo-600/10 border border-purple-500/35 text-white font-bold shadow-xs shadow-purple-900/10"
                      : "bg-primary/15 text-primary border border-primary/25 font-bold"
                    : "text-subtext hover:text-text hover:bg-white/[0.04] border border-transparent"
                }`}
                title={collapsed ? item.name : undefined}
              >
                {/* Active Indicator Accent Line on Left */}
                {active && (
                  <motion.div
                    layoutId="studentSidebarActiveBar"
                    className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${
                      isRecorded
                        ? "bg-gradient-to-b from-purple-400 to-indigo-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                        : "bg-primary shadow-[0_0_6px_rgba(124,58,237,0.6)]"
                    }`}
                  />
                )}

                {/* Icon with glow when active */}
                <div
                  className={`relative flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    active
                      ? isRecorded
                        ? "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                        : "text-primary"
                      : isRecorded
                      ? "text-purple-400/80 group-hover:text-purple-300"
                      : "text-subtext group-hover:text-text"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isRecorded && active ? "text-purple-300" : ""}`} />
                </div>

                {/* Name & Badge */}
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span
                      className={`truncate ${
                        active
                          ? isRecorded
                            ? "text-white font-bold tracking-tight"
                            : "text-text font-bold"
                          : ""
                      }`}
                    >
                      {item.name}
                    </span>

                    {badgeData && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          badgeData.color || "bg-card text-subtext border-border"
                        }`}
                      >
                        {badgeData.label}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Footer Streak Card / Quick Switcher ── */}
        {!collapsed ? (
          <div className="p-3 border-t border-border/60 bg-background/20 space-y-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-950/30 via-card to-indigo-950/20 border border-purple-500/20 text-xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 shadow-xs">
                <Flame className={`w-4 h-4 ${navBadges.streak > 0 ? "animate-bounce" : ""}`} />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="font-bold text-text text-[11px] flex items-center gap-1">
                  <span>{navBadges.streak > 0 ? `${navBadges.streak}-Day Streak` : "Start Your Streak"}</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-[10px] text-subtext truncate mt-0.5">
                  {navBadges.streak > 0 ? "Continuous active learner" : "Learn today to build momentum"}
                </div>
              </div>
            </div>

            <Link
              href="/courses"
              className="w-full py-1.5 px-3 rounded-lg text-[11px] font-medium text-subtext hover:text-text hover:bg-white/[0.04] transition-colors flex items-center justify-between"
            >
              <span>Explore Catalog</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="p-3 border-t border-border/60 flex justify-center">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-xs" title={`${navBadges.streak}-Day Streak Active`}>
              <Flame className="w-4 h-4" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
