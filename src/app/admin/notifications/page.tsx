"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  GraduationCap,
  BookOpen,
  CheckSquare,
  RotateCcw,
  Radio,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Filter,
  Search,
  Clock,
  Sparkles
} from "lucide-react";
import { formatDate } from "@/lib/dateTime";
import { AdminNotification } from "@/components/admin/NotificationCenter";

const NOTIF_ICONS: Record<string, React.ElementType> = {
  INSTRUCTOR_APPROVAL: GraduationCap,
  PERMISSIONS_UPDATED: KeyRound,
  INSTRUCTOR_PERMISSION: KeyRound,
  COURSE_APPROVAL: BookOpen,
  TASK_SUBMISSION: CheckSquare,
  REFUND_REQUEST: RotateCcw,
  LIVE_RESCHEDULE: Radio,
  SYSTEM: ShieldCheck,
};

function formatNotificationTime(dateString: string): { timestamp: string; timeGroup: "Today" | "Earlier" } {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { timestamp: "Recently", timeGroup: "Today" };

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const diffMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    if (diffMinutes < 1) return { timestamp: "Just now", timeGroup: "Today" };
    if (diffMinutes < 60) return { timestamp: `${diffMinutes}m ago`, timeGroup: "Today" };
    if (diffMinutes < 1440 && isToday) return { timestamp: `${Math.floor(diffMinutes / 60)}h ago`, timeGroup: "Today" };

    return {
      timestamp: formatDate(d),
      timeGroup: isToday ? "Today" : "Earlier"
    };
  } catch {
    return { timestamp: "Recently", timeGroup: "Today" };
  }
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "UNREAD" | "PERMISSIONS" | "APPROVALS" | "TASKS" | "REFUNDS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications?limit=50");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications) && data.notifications.length > 0) {
          const mapped: AdminNotification[] = data.notifications.map((n: any) => {
            const timeMeta = formatNotificationTime(n.createdAt);
            const priority: AdminNotification["priority"] =
              n.priority === "URGENT" || n.priority === "CRITICAL"
                ? "Critical"
                : n.priority === "HIGH"
                ? "High"
                : "Normal";

            let defaultActionLabel = "Inspect";
            if (n.entityType === "INSTRUCTOR_PERMISSION" || n.type === "PERMISSIONS_UPDATED") {
              defaultActionLabel = "Review Permissions";
            } else if (n.actionUrl?.includes("instructors")) {
              defaultActionLabel = "Review Profile";
            } else if (n.actionUrl?.includes("courses")) {
              defaultActionLabel = "Review Course";
            }

            return {
              id: n.id,
              type: n.type || "SYSTEM",
              title: n.title,
              message: n.message,
              timestamp: timeMeta.timestamp,
              timeGroup: timeMeta.timeGroup,
              isRead: n.isRead,
              priority,
              actionLabel: defaultActionLabel,
              actionHref: n.actionUrl || "/admin/instructors?tab=permissions"
            };
          });
          setNotifications(mapped);
          return;
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      /* ignore */
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/admin/notifications/read-all", { method: "POST" });
    } catch {
      /* ignore */
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category Filter
    if (activeFilter === "UNREAD") return !n.isRead;
    if (activeFilter === "PERMISSIONS") return n.type === "PERMISSIONS_UPDATED" || n.title.includes("Permission");
    if (activeFilter === "APPROVALS") return n.type === "INSTRUCTOR_APPROVAL" || n.type === "COURSE_APPROVAL";
    if (activeFilter === "TASKS") return n.type === "TASK_SUBMISSION";
    if (activeFilter === "REFUNDS") return n.type === "REFUND_REQUEST";
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-background text-text p-6 md:p-10 max-w-6xl mx-auto pb-32 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-subtext hover:text-text mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
                Admin Notifications Center
              </h1>
              <p className="text-xs sm:text-sm text-subtext mt-0.5">
                Manage administrative requests, instructor course permissions, verification applications, and system alerts.
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-white/10 p-4 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === "ALL"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-background text-subtext hover:text-text border border-white/10"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter("UNREAD")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === "UNREAD"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-background text-subtext hover:text-text border border-white/10"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setActiveFilter("PERMISSIONS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === "PERMISSIONS"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-background text-subtext hover:text-text border border-white/10"
            }`}
          >
            Course Permissions
          </button>
          <button
            onClick={() => setActiveFilter("APPROVALS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === "APPROVALS"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-background text-subtext hover:text-text border border-white/10"
            }`}
          >
            Approvals
          </button>
          <button
            onClick={() => setActiveFilter("TASKS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === "TASKS"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-background text-subtext hover:text-text border border-white/10"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveFilter("REFUNDS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === "REFUNDS"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-background text-subtext hover:text-text border border-white/10"
            }`}
          >
            Refunds
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-white/10 text-text rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-subtext/60"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="py-20 text-center bg-card border border-white/10 rounded-3xl p-8">
            <Check className="w-12 h-12 mx-auto text-emerald-400 mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-text">No notifications found</h3>
            <p className="text-xs text-subtext mt-1">There are no administrative alerts matching your current filter.</p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const Icon = NOTIF_ICONS[item.type] || (item.title.includes("Permission") ? KeyRound : ShieldCheck);
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.isRead) markAsRead(item.id);
                  if (item.actionHref) router.push(item.actionHref);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                  !item.isRead
                    ? "bg-purple-500/10 border-purple-500/40 hover:bg-purple-500/15"
                    : "bg-card border-white/10 hover:border-purple-500/30"
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                      item.priority === "Critical"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : item.priority === "High"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-text group-hover:text-purple-300 transition-colors">
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 ring-2 ring-purple-400/30" />
                      )}
                      <span className="text-[10px] text-subtext/70 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-subtext leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto justify-between sm:justify-end">
                  {!item.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(item.id);
                      }}
                      className="text-xs font-medium text-subtext hover:text-text px-2 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Mark as read
                    </button>
                  )}
                  {item.actionLabel && (
                    <Link
                      href={item.actionHref || "#"}
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>{item.actionLabel}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
