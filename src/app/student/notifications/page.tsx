"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";
import {
  Bell,
  Clock,
  PlaySquare,
  Award,
  Radio,
  FileCheck,
  BookOpen,
  Check,
  ChevronRight,
  Search,
  X,
  Sliders,
  ShieldCheck,
  ArrowLeft,
  CheckCheck,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  CreditCard,
  Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/dateTime";

export interface StudentNotificationItem {
  id: string;
  category: string;
  type?: string;
  priority?: "URGENT" | "HIGH" | "NORMAL" | "LOW";
  title: string;
  message: string;
  description?: string;
  details?: string;
  isRead: boolean;
  isUnread: boolean;
  isArchived?: boolean;
  timeAgo?: string;
  createdAt?: string;
  actionUrl?: string;
  link?: string;
  icon?: string;
  actor?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  metadata?: any;
}

// Clean leading emojis for a modern, typography-driven luxury feel
function cleanText(text: string): string {
  if (!text) return "";
  return text.replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}\s•\-]+/u, "").trim();
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Fetch student notifications from API
  const fetchNotifications = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      else setIsRefreshing(true);

      const res = await fetch("/api/student/notifications?limit=50");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(
            typeof data.unreadCount === "number"
              ? data.unreadCount
              : data.notifications.filter((n: any) => !n.isRead).length
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch student notifications:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 40000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Toggle Read / Unread Status
  const toggleRead = async (id: string, currentReadStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetStatus = !currentReadStatus;

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: targetStatus, isUnread: !targetStatus } : n
      )
    );
    setUnreadCount((prev) => (targetStatus ? Math.max(0, prev - 1) : prev + 1));

    try {
      await fetch(`/api/student/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: targetStatus }),
      });
    } catch (err) {
      console.error("Failed to toggle notification status:", err);
    }
  };

  // Mark All Notifications as Read
  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, isUnread: false }))
    );
    setUnreadCount(0);

    try {
      await fetch("/api/student/notifications/read-all", { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemToDelete = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (itemToDelete && !itemToDelete.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await fetch(`/api/student/notifications/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Filter & Search Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isUnread = !n.isRead;
      if (activeCategory === "UNREAD" && !isUnread) return false;

      if (activeCategory !== "ALL" && activeCategory !== "UNREAD") {
        if (activeCategory === "LIVE" && n.category !== "LIVE_SESSION" && n.category !== "LIVE") return false;
        if (activeCategory === "RECORDING" && n.category !== "RECORDING") return false;
        if (activeCategory === "ASSIGNMENT" && n.category !== "ASSIGNMENT") return false;
        if (activeCategory === "COURSE" && n.category !== "COURSE") return false;
        if (activeCategory === "CERTIFICATE" && n.category !== "CERTIFICATE") return false;
        if (activeCategory === "PAYMENT" && n.category !== "PAYMENT") return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (n.title || "").toLowerCase().includes(q);
        const matchMsg = (n.message || n.description || "").toLowerCase().includes(q);
        const matchCategory = (n.category || "").toLowerCase().includes(q);
        const matchActor = (n.actor?.name || "").toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchCategory && !matchActor) return false;
      }
      return true;
    });
  }, [notifications, activeCategory, searchQuery]);

  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case "LIVE_SESSION":
      case "LIVE":
        return {
          label: "Live Class",
          badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          iconBg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
          icon: Radio,
          actionText: "Join Live Room",
          defaultHref: "/calendar",
        };
      case "RECORDING":
        return {
          label: "Recording",
          badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/20",
          iconBg: "bg-purple-500/10 text-purple-300 border border-purple-500/20",
          icon: PlaySquare,
          actionText: "Watch Recording",
          defaultHref: "/student/recorded-sessions",
        };
      case "ASSIGNMENT":
        return {
          label: "Assignment",
          badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
          iconBg: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
          icon: FileCheck,
          actionText: "View Assignment",
          defaultHref: "/student/assignments",
        };
      case "COURSE":
        return {
          label: "Course Update",
          badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
          iconBg: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
          icon: BookOpen,
          actionText: "Open Course",
          defaultHref: "/student/courses",
        };
      case "CERTIFICATE":
        return {
          label: "Certificate",
          badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
          iconBg: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
          icon: Award,
          actionText: "View Certificate",
          defaultHref: "/student/certificates",
        };
      case "PAYMENT":
        return {
          label: "Payment",
          badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
          iconBg: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
          icon: CreditCard,
          actionText: "View Invoices",
          defaultHref: "/student/payments",
        };
      default:
        return {
          label: "Platform",
          badgeBg: "bg-white/[0.06] text-neutral-300 border-white/10",
          iconBg: "bg-white/[0.06] text-neutral-300 border border-white/10",
          icon: Bell,
          actionText: "View Details",
          defaultHref: "/dashboard",
        };
    }
  };

  const getFilterCounts = (id: string) => {
    switch (id) {
      case "ALL":
        return notifications.length;
      case "UNREAD":
        return unreadCount;
      case "LIVE":
        return notifications.filter((n) => n.category === "LIVE_SESSION" || n.category === "LIVE").length;
      case "RECORDING":
        return notifications.filter((n) => n.category === "RECORDING").length;
      case "ASSIGNMENT":
        return notifications.filter((n) => n.category === "ASSIGNMENT").length;
      case "COURSE":
        return notifications.filter((n) => n.category === "COURSE").length;
      case "CERTIFICATE":
        return notifications.filter((n) => n.category === "CERTIFICATE").length;
      default:
        return 0;
    }
  };

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-8 max-w-6xl mx-auto space-y-6 text-neutral-200">

        {/* ───────── 1. MINIMAL HEADER ───────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="text-neutral-400 hover:text-white transition-colors text-xs flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20 text-xs font-semibold">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchNotifications(false)}
              disabled={isLoading || isRefreshing}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark all as read</span>
              </button>
            )}

            <button
              onClick={() => setIsPreferencesOpen(true)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Alert Preferences"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ───────── 2. CATEGORY PILLS & SEARCH ───────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: "ALL", label: "All" },
              { id: "UNREAD", label: "Unread" },
              { id: "LIVE", label: "Live Classes" },
              { id: "RECORDING", label: "Recordings" },
              { id: "ASSIGNMENT", label: "Assignments" },
              { id: "COURSE", label: "Courses" },
              { id: "CERTIFICATE", label: "Certificates" },
            ].map((f) => {
              const count = getFilterCounts(f.id);
              const isActive = activeCategory === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveCategory(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                    isActive
                      ? "bg-white text-neutral-900 border-white shadow-xs font-bold"
                      : "bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <span>{f.label}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                        isActive
                          ? "bg-neutral-200 text-neutral-900"
                          : "bg-white/[0.06] text-neutral-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ───────── 3. NOTIFICATION LIST ───────── */}
        <div className="space-y-2.5">
          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-pulse flex items-start gap-3.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-3 bg-white/[0.06] rounded" />
                    <div className="w-2/3 h-4 bg-white/[0.06] rounded" />
                    <div className="w-full h-3 bg-white/[0.06] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 px-4 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01] space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-neutral-500 mb-1">
                <Inbox className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm text-neutral-200">No Notifications</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {searchQuery
                  ? `No alerts matched your search "${searchQuery}".`
                  : activeCategory === "UNREAD"
                  ? "You have read all notifications. Everything is caught up!"
                  : "You're all caught up with your courses, assignments, and class schedules."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const config = getCategoryConfig(n.category);
              const IconComp = config.icon;
              const isUnread = !n.isRead;
              const targetLink = n.actionUrl || n.link || config.defaultHref;
              const timeDisplay = n.timeAgo || (n.createdAt ? formatDate(n.createdAt) : "Just now");
              const displayTitle = cleanText(n.title);
              const displayDesc = cleanText(n.message || n.description || "");

              return (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative group ${
                    isUnread
                      ? "bg-white/[0.035] border-white/[0.12] shadow-xs"
                      : "bg-white/[0.015] border-white/[0.06] opacity-80 hover:opacity-100 hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Left Icon & Text */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 mt-0.5 ${config.iconBg}`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Meta top line */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border tracking-wide uppercase ${config.badgeBg}`}
                        >
                          {config.label}
                        </span>

                        {n.priority === "URGENT" && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/20 text-[9px] font-semibold uppercase">
                            Urgent
                          </span>
                        )}

                        <span className="text-neutral-500">•</span>

                        <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          {timeDisplay}
                        </span>

                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-sm sm:text-[15px] text-white group-hover:text-primary transition-colors leading-snug">
                        {displayTitle}
                      </h3>

                      {/* Message */}
                      <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl font-normal">
                        {displayDesc}
                      </p>

                      {n.actor?.name && (
                        <p className="text-[11px] text-neutral-500 pt-0.5">
                          From <span className="text-neutral-300 font-medium">{n.actor.name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Action CTAs */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={(e) => toggleRead(n.id, n.isRead, e)}
                      title={n.isRead ? "Mark as unread" : "Mark as read"}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {n.isRead ? <Clock className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>

                    <button
                      onClick={(e) => deleteNotification(n.id, e)}
                      title="Delete alert"
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-neutral-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={targetLink}
                      onClick={() => {
                        if (!n.isRead) {
                          toggleRead(n.id, false, { stopPropagation: () => {} } as any);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-neutral-900 hover:bg-neutral-200 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>{config.actionText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ───────── 4. ALERT PREFERENCES MODAL ───────── */}
        <AnimatePresence>
          {isPreferencesOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-[#0f141c] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/[0.06] text-white">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Notification Channels</h3>
                      <p className="text-xs text-neutral-400">Manage student notification delivery</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPreferencesOpen(false)}
                    className="p-1.5 rounded-lg bg-white/[0.04] text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    { title: "Live Class Reminders", desc: "Alerts 15 minutes before workshops start." },
                    { title: "Assignment Grades & Feedback", desc: "Instant alert when instructor reviews your code." },
                    { title: "New Module & Lab Releases", desc: "Notification when new lectures are added." },
                    { title: "Course Milestones & Badges", desc: "Milestones and certificate achievements." },
                  ].map((pref, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-neutral-200">{pref.title}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{pref.desc}</p>
                      </div>
                      <div className="w-9 h-5 bg-primary rounded-full p-0.5 cursor-pointer flex items-center justify-end">
                        <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsPreferencesOpen(false)}
                    className="px-4 py-2 bg-white text-neutral-900 font-semibold text-xs rounded-xl hover:bg-neutral-200 transition-colors shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </StudentPortalLayout>
  );
}
