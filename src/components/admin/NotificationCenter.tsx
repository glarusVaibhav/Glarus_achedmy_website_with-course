"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  GraduationCap,
  BookOpen,
  CheckSquare,
  RotateCcw,
  Radio,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  Sparkles,
  X,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, formatTime } from "@/lib/dateTime";

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  timeGroup: "Today" | "Earlier";
  isRead: boolean;
  priority: "Critical" | "High" | "Normal";
  actionLabel?: string;
  actionHref?: string;
}

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

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"All" | "Unread">("All");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchAdminNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications?limit=30");
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
      /* ignore fetch error */
    }
  }, []);

  useEffect(() => {
    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchAdminNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const handleAction = (item: AdminNotification) => {
    markAsRead(item.id);
    if (item.actionHref) {
      router.push(item.actionHref);
      setIsOpen(false);
    }
  };

  const displayedNotifications = notifications.filter((n) =>
    activeFilter === "Unread" ? !n.isRead : true
  );

  const todayList = displayedNotifications.filter((n) => n.timeGroup === "Today");
  const earlierList = displayedNotifications.filter((n) => n.timeGroup === "Earlier");

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchAdminNotifications();
        }}
        className="relative p-2 rounded-lg text-subtext hover:text-text hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
        title="Admin Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-4.5 px-1 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-card animate-pulse shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[550px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-text">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {unreadCount} pending
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/admin/notifications");
                  }}
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View all</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-subtext hover:text-text hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-card text-xs">
              <button
                onClick={() => setActiveFilter("All")}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeFilter === "All"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-subtext hover:text-text"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter("Unread")}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeFilter === "Unread"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-subtext hover:text-text"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
              {displayedNotifications.length === 0 ? (
                <div className="py-12 text-center text-subtext space-y-1">
                  <Check className="w-8 h-8 mx-auto opacity-30 text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-text">All caught up!</p>
                  <p className="text-xs">No pending notifications require administrative review.</p>
                </div>
              ) : (
                <>
                  {todayList.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-3 pt-1">
                        Today
                      </p>
                      {todayList.map((item) => (
                        <NotificationCard
                          key={item.id}
                          item={item}
                          onAction={() => handleAction(item)}
                          onMarkRead={(e) => markAsRead(item.id, e)}
                        />
                      ))}
                    </div>
                  )}

                  {earlierList.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-subtext px-3 pt-1">
                        Earlier
                      </p>
                      {earlierList.map((item) => (
                        <NotificationCard
                          key={item.id}
                          item={item}
                          onAction={() => handleAction(item)}
                          onMarkRead={(e) => markAsRead(item.id, e)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer: View All Notifications */}
            <div className="p-2.5 bg-background/50 border-t border-white/10 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/admin/notifications");
                }}
                className="w-full py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-purple-500/20 hover:border-purple-500/40"
              >
                <span>View All Notifications</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationCard({
  item,
  onAction,
  onMarkRead
}: {
  item: AdminNotification;
  onAction: () => void;
  onMarkRead: (e: React.MouseEvent) => void;
}) {
  const Icon = NOTIF_ICONS[item.type] || (item.title.includes("Permission") ? KeyRound : ShieldCheck);

  return (
    <div
      onClick={onAction}
      className={`p-3 rounded-xl border transition-all cursor-pointer group ${
        !item.isRead
          ? "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/15"
          : "bg-background/40 border-white/5 hover:bg-white/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
            item.priority === "Critical"
              ? "bg-red-500/10 text-red-400 border-red-500/30"
              : item.priority === "High"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-purple-500/10 text-purple-400 border-purple-500/30"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <h4 className="text-xs font-bold text-text truncate group-hover:text-purple-300 transition-colors">
              {item.title}
            </h4>
            <span className="text-[10px] text-subtext shrink-0">{item.timestamp}</span>
          </div>
          <p className="text-xs text-subtext leading-relaxed line-clamp-2">{item.message}</p>

          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
            {item.actionLabel ? (
              <span className="text-[11px] font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
                <span>{item.actionLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            ) : <span />}

            {!item.isRead && (
              <button
                onClick={onMarkRead}
                title="Mark as read"
                className="text-[10px] text-subtext hover:text-text px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
              >
                Mark read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
