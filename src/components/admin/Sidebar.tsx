"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CheckSquare,
  CreditCard,
  Activity,
  ShieldAlert,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";

export interface NavGroup {
  groupTitle: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[];
}

const SIDEBAR_NAVIGATION: NavGroup[] = [
  {
    groupTitle: "MAIN",
    items: [
      { name: "Overview", href: "/admin", icon: LayoutDashboard }
    ]
  },
  {
    groupTitle: "PEOPLE",
    items: [
      {
        name: "Instructor Management",
        href: "/admin/instructors",
        icon: GraduationCap,
        badge: 3,
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
      },
      {
        name: "Student Management",
        href: "/admin/students",
        icon: Users
      }
    ]
  },
  {
    groupTitle: "ACADEMIC",
    items: [
      {
        name: "Course Management",
        href: "/admin/courses",
        icon: BookOpen,
        badge: 5,
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        name: "Task Management",
        href: "/admin/tasks",
        icon: CheckSquare,
        badge: 8,
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ]
  },
  {
    groupTitle: "OPERATIONS",
    items: [
      {
        name: "Payments & Refunds",
        href: "/admin/payments",
        icon: CreditCard,
        badge: 4,
        badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30"
      }
    ]
  },
  {
    groupTitle: "INSIGHTS",
    items: [
      {
        name: "Analytics",
        href: "/admin/analytics",
        icon: Activity
      }
    ]
  },
  {
    groupTitle: "SYSTEM",
    items: [
      {
        name: "Audit Logs",
        href: "/admin/audit",
        icon: ShieldAlert
      },
      {
        name: "Platform Settings",
        href: "/admin/settings",
        icon: Settings
      }
    ]
  }
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const pathname = usePathname();

  const isRouteActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
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
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-card/95 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between transition-all duration-300 select-none ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-background/40">
          {!collapsed ? (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 group cursor-pointer overflow-hidden"
              title="Glarus Academy Admin Portal"
            >
              <Logo className="h-7 w-auto max-w-[130px]" />
              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                Admin
              </span>
            </Link>
          ) : (
            <Link href="/admin" className="mx-auto" title="Glarus Academy Admin">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-sm">
                GA
              </div>
            </Link>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg text-subtext hover:text-text hover:bg-white/5 transition-colors hidden lg:flex ${
                collapsed ? "mx-auto mt-2" : ""
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

        {/* Grouped Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {SIDEBAR_NAVIGATION.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              {!collapsed ? (
                <p className="px-3 text-[10px] font-bold text-subtext/70 uppercase tracking-widest mb-1.5">
                  {group.groupTitle}
                </p>
              ) : (
                <div className="h-1 my-2 border-t border-white/5" />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isRouteActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        collapsed ? "justify-center" : "justify-between"
                      } ${
                        active
                          ? "bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold shadow-sm"
                          : "text-subtext hover:text-text hover:bg-white/5 border border-transparent"
                      }`}
                      title={collapsed ? `${item.name} ${item.badge ? `(${item.badge})` : ""}` : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            active
                              ? "text-purple-400 scale-105"
                              : "text-subtext/70 group-hover:text-text group-hover:scale-105"
                          }`}
                        />
                        {!collapsed && (
                          <span className="text-xs font-semibold truncate">
                            {item.name}
                          </span>
                        )}
                      </div>

                      {!collapsed && item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black border tracking-tight shrink-0 ${
                            item.badgeColor || "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Small badge dot if collapsed */}
                      {collapsed && item.badge !== undefined && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-card" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Area: View Live Site & Admin Profile */}
        <div className="p-3 border-t border-white/10 space-y-2 bg-background/30 shrink-0">
          <Link
            href="/"
            target="_blank"
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-xl bg-card hover:bg-card-hover text-xs font-semibold text-subtext hover:text-text border border-white/10 transition-colors ${
              collapsed ? "justify-center" : "justify-between"
            }`}
            title="View Live Site"
          >
            <div className="flex items-center gap-2 truncate">
              <ExternalLink className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              {!collapsed && <span className="truncate">View Live Site</span>}
            </div>
            {!collapsed && (
              <span className="text-[9px] font-bold text-subtext/60 uppercase">GA</span>
            )}
          </Link>

          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-background/50 border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-white/10">
                AD
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text truncate">Admin Portal</p>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Enterprise v2.4
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
