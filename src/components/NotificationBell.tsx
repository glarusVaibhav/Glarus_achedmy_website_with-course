"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  CreditCard, 
  ChevronRight,
  Radio,
  FileCheck,
  Award,
  BookOpen,
  MessageSquare,
  CheckSquare,
  Sparkles,
  PlaySquare,
  Inbox
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export interface HeaderNotification {
  id: string;
  category: string;
  type?: string;
  priority?: string;
  title: string;
  description: string;
  timestamp: string;
  timeAgo?: string;
  isUnread: boolean;
  link?: string;
  actionUrl?: string;
  icon?: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const isInstructor = user?.role === "INSTRUCTOR";
  const isAdmin = user?.role === "ADMIN";

  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allNotificationsLink = isInstructor
    ? "/instructor/notifications"
    : isAdmin
    ? "/admin/notifications"
    : "/student/notifications";

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const endpoint = isInstructor || isAdmin ? "/api/instructor/notifications?limit=10" : "/api/instructor/notifications?limit=10";
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : data.notifications.filter((n: any) => n.isUnread).length);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications in bell:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isInstructor, isAdmin]);

  useEffect(() => {
    fetchNotifications();
    // Poll unread count every 45 seconds
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
      setUnreadCount(0);
      await fetch("/api/instructor/notifications/read-all", { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const markSingleAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await fetch(`/api/instructor/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark single notification as read:", err);
    }
  };

  if (!user) return null;

  const getCategoryConfig = (category: string, iconStr?: string) => {
    switch (category) {
      case "LIVE_SESSION":
      case "LIVE":
        return {
          label: "🔴 LIVE CLASS",
          badgeBg: "bg-red-500/15 text-red-400 border-red-500/30",
          icon: Radio,
          iconColor: "text-red-400",
        };
      case "RECORDING":
        return {
          label: "🎬 RECORDING",
          badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
          icon: PlaySquare,
          iconColor: "text-purple-400",
        };
      case "ASSIGNMENT":
        return {
          label: "📝 ASSIGNMENT",
          badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          icon: FileCheck,
          iconColor: "text-amber-400",
        };
      case "COURSE":
        return {
          label: "🎓 COURSE",
          badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
          icon: BookOpen,
          iconColor: "text-blue-400",
        };
      case "TASK":
        return {
          label: "📋 TASK",
          badgeBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
          icon: CheckSquare,
          iconColor: "text-indigo-400",
        };
      case "CERTIFICATE":
        return {
          label: "🏆 CERTIFICATE",
          badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          icon: Award,
          iconColor: "text-emerald-400",
        };
      case "ADMIN":
        return {
          label: "🛡 ADMIN",
          badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          icon: ShieldCheck,
          iconColor: "text-amber-400",
        };
      case "STUDENT":
        return {
          label: "👨‍🎓 STUDENT",
          badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
          icon: UserCheck,
          iconColor: "text-blue-400",
        };
      case "VERIFICATION":
        return {
          label: "🛡 VERIFICATION",
          badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          icon: ShieldCheck,
          iconColor: "text-emerald-400",
        };
      case "REMINDER":
      case "SYSTEM":
        return {
          label: "⚙ SYSTEM",
          badgeBg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
          icon: Clock,
          iconColor: "text-purple-400",
        };
      case "PAYMENT":
        return {
          label: "💰 PAYMENT",
          badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          icon: CreditCard,
          iconColor: "text-emerald-400",
        };
      default:
        return {
          label: "🔔 NOTIFICATION",
          badgeBg: "bg-primary/15 text-primary border-primary/30",
          icon: Bell,
          iconColor: "text-primary",
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── BELL TRIGGER BUTTON ── */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-subtext hover:text-text transition-colors rounded-xl hover:bg-card/60 focus:outline-none cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-rose-500 text-[10px] font-black text-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* ── DROPDOWN ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-background/95 backdrop-blur-xl border border-card/80 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-card/40 border-b border-card/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="font-extrabold text-sm text-text">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-subtext hover:text-primary transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  href={allNotificationsLink}
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-card/60">
              {notifications.map((item) => {
                const config = getCategoryConfig(item.category, item.icon);
                const IconComponent = config.icon;
                const targetLink = item.actionUrl || item.link || allNotificationsLink;
                const timeDisplay = item.timeAgo || item.timestamp;

                return (
                  <Link
                    key={item.id}
                    href={targetLink}
                    onClick={() => {
                      markSingleAsRead(item.id);
                      setIsOpen(false);
                    }}
                    className={`p-3.5 transition-colors hover:bg-card/40 flex items-start gap-3 relative block ${
                      item.isUnread ? "bg-primary/5" : ""
                    }`}
                  >
                    {item.isUnread && (
                      <span className="absolute left-1 top-4 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    <div
                      className={`p-2 rounded-xl bg-card border border-card/80 shrink-0 ${config.iconColor}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${config.badgeBg}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-[10px] text-subtext font-medium">
                          {timeDisplay}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-text line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-subtext line-clamp-2 mt-0.5">
                        {item.description || (item as any).message}
                      </p>
                    </div>
                  </Link>
                );
              })}

              {notifications.length === 0 && !isLoading && (
                <div className="p-8 text-center text-subtext">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold">No notifications yet</p>
                  <p className="text-[10px]">You are completely caught up!</p>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-3 bg-card/30 border-t border-card/60 text-center">
              <Link
                href={allNotificationsLink}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold text-primary hover:text-primary/80 transition-colors w-full py-1.5 rounded-xl hover:bg-primary/10"
              >
                View All Notifications <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
