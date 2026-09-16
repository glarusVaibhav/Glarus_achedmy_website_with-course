"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Calendar,
  PlayCircle,
  FileCheck,
  Award,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

export interface StudentNavItem {
  id: string;
  name: string;
  href: string;
  icon: React.ElementType;
  iconColor: string;
  iconBox: string;
  activeBg: string;
  badgeColor: string;
}

export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/dashboard",
    icon: Activity,
    iconColor: "text-sky-400",
    iconBox: "bg-sky-500/10 border-sky-500/20 group-hover:border-sky-500/40 group-hover:bg-sky-500/15",
    activeBg: "bg-[#0d1829] border-white/80 text-white shadow-lg shadow-sky-950/40",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  {
    id: "courses",
    name: "Self-Paced Courses",
    href: "/student/courses",
    icon: BookOpen,
    iconColor: "text-purple-400",
    iconBox: "bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40 group-hover:bg-purple-500/15",
    activeBg: "bg-[#18112e] border-white/80 text-white shadow-lg shadow-purple-950/40",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    id: "live-classes",
    name: "Live Training",
    href: "/calendar",
    icon: Calendar,
    iconColor: "text-rose-400",
    iconBox: "bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40 group-hover:bg-rose-500/15",
    activeBg: "bg-[#25101a] border-white/80 text-white shadow-lg shadow-rose-950/40",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  {
    id: "recorded-sessions",
    name: "Class Recordings",
    href: "/student/recorded-sessions",
    icon: PlayCircle,
    iconColor: "text-emerald-400",
    iconBox: "bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/15",
    activeBg: "bg-[#0b201a] border-white/80 text-white shadow-lg shadow-emerald-950/40",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "assignments",
    name: "Assignments",
    href: "/student/assignments",
    icon: FileCheck,
    iconColor: "text-amber-400",
    iconBox: "bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40 group-hover:bg-amber-500/15",
    activeBg: "bg-[#24190c] border-white/80 text-white shadow-lg shadow-amber-950/40",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    id: "certificates",
    name: "Certificates",
    href: "/student/certificates",
    icon: Award,
    iconColor: "text-indigo-400",
    iconBox: "bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/15",
    activeBg: "bg-[#14182e] border-white/80 text-white shadow-lg shadow-indigo-950/40",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  {
    id: "payments",
    name: "Payments",
    href: "/student/payments",
    icon: CreditCard,
    iconColor: "text-cyan-400",
    iconBox: "bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/15",
    activeBg: "bg-[#0d1d29] border-white/80 text-white shadow-lg shadow-cyan-950/40",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  {
    id: "settings",
    name: "Settings",
    href: "/settings",
    icon: Settings,
    iconColor: "text-slate-400",
    iconBox: "bg-slate-500/10 border-slate-500/20 group-hover:border-slate-500/40 group-hover:bg-slate-500/15",
    activeBg: "bg-[#171c26] border-white/80 text-white shadow-lg shadow-slate-950/40",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  },
];

interface StudentSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  sidebarWidth?: number;
  onWidthChange?: (width: number) => void;
  isDragging?: boolean;
  setIsDragging?: (dragging: boolean) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function StudentSidebar({
  collapsed = false,
  onToggleCollapse,
  sidebarWidth = 288,
  onWidthChange,
  isDragging = false,
  setIsDragging,
  mobileOpen = false,
  onCloseMobile,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

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
        return navBadges.selfPacedCount > 0 ? `${navBadges.selfPacedCount} Active` : null;
      case "live-classes":
        return navBadges.hasLiveNow ? "LIVE" : null;
      case "recorded-sessions":
        return navBadges.recordingsCount > 0 ? `${navBadges.recordingsCount} Ready` : null;
      case "assignments":
        return navBadges.assignmentsCount > 0 ? `${navBadges.assignmentsCount}` : null;
      case "certificates":
        return navBadges.certificatesCount > 0 ? `${navBadges.certificatesCount}` : null;
      default:
        return null;
    }
  };

  /* ── Draggable Width Handlers ── */
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (collapsed) return;
    setIsDragging?.(true);

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth + deltaX;
      if (newWidth < 220) newWidth = 220;
      if (newWidth > 480) newWidth = 480;
      onWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging?.(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClick = () => {
    if (!collapsed) {
      onWidthChange?.(288);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "S";

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
        style={!collapsed ? { width: `${sidebarWidth}px` } : undefined}
        className={`fixed left-0 bg-[#080C14] border-r border-card/60 flex flex-col justify-between pt-5 pb-6 select-none ${
          isDragging ? "transition-none" : "transition-[width] duration-200 ease-out"
        } ${
          collapsed ? "w-20" : ""
        } ${
          mobileOpen
            ? "translate-x-0 top-0 z-50 h-screen w-72"
            : "-translate-x-full lg:translate-x-0 top-16 z-30 h-[calc(100vh-4rem)]"
        }`}
      >
        {/* ── Draggable Resize Handle on Right Border ── */}
        {!collapsed && (
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            title="Drag to resize sidebar (Double click to reset)"
            className={`hidden lg:flex absolute top-0 -right-1 bottom-0 w-2.5 cursor-col-resize z-40 group items-center justify-center transition-colors ${
              isDragging ? "bg-primary/50" : "hover:bg-primary/30"
            }`}
          >
            {/* Visual Grip Indicator on Hover / Drag */}
            <div
              className={`w-0.5 rounded-full transition-all duration-150 ${
                isDragging
                  ? "bg-primary h-12 shadow-[0_0_8px_rgba(124,58,237,0.8)]"
                  : "bg-white/20 h-6 group-hover:bg-primary group-hover:h-10"
              }`}
            />
          </div>
        )}

        {/* ── Top Minimal Header (Clean, unobtrusive to top logo) ── */}
        <div className={`px-4 mb-2 flex items-center justify-between shrink-0 ${collapsed ? "px-2 justify-center" : ""}`}>
          {!collapsed ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-subtext/60">
                Navigation
              </span>

              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-lg text-subtext hover:text-text hover:bg-white/[0.06] transition-colors hidden lg:flex cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-subtext hover:text-text hover:bg-white/[0.06] transition-colors hidden lg:flex cursor-pointer mx-auto"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* ── Navigation List (Instructor Studio Style) ── */}
        <nav className="flex-1 space-y-2 px-3.5 overflow-y-auto no-scrollbar">
          {STUDENT_NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            const badgeValue = getItemBadge(item.id);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.name : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all font-semibold text-sm group cursor-pointer border ${
                  active
                    ? item.activeBg
                    : "text-slate-300 hover:text-white hover:bg-white/[0.04] border-transparent"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                {/* Colorful Icon Box */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    item.iconBox
                  } ${
                    active
                      ? "scale-105 shadow-sm"
                      : "opacity-90 group-hover:opacity-100 group-hover:scale-105"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>

                {/* Name */}
                {!collapsed && (
                  <span className="flex-1 text-left font-medium text-xs sm:text-sm truncate">
                    {item.name}
                  </span>
                )}

                {/* Colorful Pill Badge */}
                {!collapsed && badgeValue !== null && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-xs shrink-0 ${
                      active
                        ? "bg-white/20 text-white border-white/30"
                        : item.badgeColor
                    }`}
                  >
                    {badgeValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Section (Instructor Studio Style Avatar Pill) ── */}
        <div className="px-4 pt-4 border-t border-card/40 shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              {/* User Profile Avatar Pill */}
              <Link
                href="/settings"
                className="flex items-center gap-3 group p-1.5 -ml-1 rounded-2xl hover:bg-white/[0.04] transition-colors overflow-hidden"
                title="Account Settings"
              >
                <div className="w-9 h-9 rounded-full bg-[#111827] border border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:border-primary/60 group-hover:scale-105 transition-all shrink-0">
                  {userInitial}
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-bold text-text group-hover:text-primary transition-colors truncate max-w-[120px]">
                    {user?.name || "Student"}
                  </div>
                  <div className="text-[10px] font-semibold text-subtext flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    Active Learner
                  </div>
                </div>
              </Link>

              {/* Streak Badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] font-bold text-orange-400 shrink-0"
                title={`${navBadges.streak}-Day Streak`}
              >
                <Flame className={`w-3.5 h-3.5 ${navBadges.streak > 0 ? "animate-bounce" : ""}`} />
                <span>{navBadges.streak}d</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/settings"
                className="w-9 h-9 rounded-full bg-[#111827] border border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-md hover:border-primary/60 transition-all"
                title={user?.name || "Student Account"}
              >
                {userInitial}
              </Link>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-xl text-subtext hover:text-text hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Expand Sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
