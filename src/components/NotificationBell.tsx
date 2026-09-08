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
  Inbox,
  Check,
  ArrowUpRight
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
  timestamp?: string;
  timeAgo?: string;
  isUnread: boolean;
  link?: string;
  actionUrl?: string;
  icon?: string;
}

// Clean leading emojis from titles for a sleek, typography-driven UI
function cleanText(text: string): string {
  if (!text) return "";
  return text.replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}\s•\-]+/u, "").trim();
}

export function NotificationBell() {
  const { user } = useAuth();
  const isInstructor = user?.role === "INSTRUCTOR";
  const isAdmin = user?.role === "ADMIN";
  const isStudent = !isInstructor && !isAdmin;

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

  const apiBasePath = isStudent ? "/api/student/notifications" : "/api/instructor/notifications";

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${apiBasePath}?limit=8`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(
            typeof data.unreadCount === "number"
              ? data.unreadCount
              : data.notifications.filter((n: any) => n.isUnread).length
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications in bell:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, apiBasePath]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
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
      await fetch(`${apiBasePath}/read-all`, { method: "PATCH" });
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
      await fetch(`${apiBasePath}/${id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark single notification as read:", err);
    }
  };

  if (!user) return null;

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "LIVE_SESSION":
      case "LIVE":
        return {
          label: "Live Class",
          badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          icon: Radio,
          iconBg: "bg-rose-500/10 text-rose-400",
        };
      case "RECORDING":
        return {
          label: "Recording",
          badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/20",
          icon: PlaySquare,
          iconBg: "bg-purple-500/10 text-purple-300",
        };
      case "ASSIGNMENT":
        return {
          label: "Assignment",
          badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
          icon: FileCheck,
          iconBg: "bg-amber-500/10 text-amber-300",
        };
      case "COURSE":
        return {
          label: "Course",
          badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
          icon: BookOpen,
          iconBg: "bg-blue-500/10 text-blue-300",
        };
      case "TASK":
        return {
          label: "Task",
          badgeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
          icon: CheckSquare,
          iconBg: "bg-indigo-500/10 text-indigo-300",
        };
      case "CERTIFICATE":
        return {
          label: "Certificate",
          badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
          icon: Award,
          iconBg: "bg-emerald-500/10 text-emerald-300",
        };
      case "PAYMENT":
        return {
          label: "Payment",
          badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
          icon: CreditCard,
          iconBg: "bg-emerald-500/10 text-emerald-300",
        };
      case "VERIFICATION":
        return {
          label: "Verification",
          badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
          icon: ShieldCheck,
          iconBg: "bg-emerald-500/10 text-emerald-300",
        };
      case "STUDENT":
        return {
          label: "Student",
          badgeBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
          icon: UserCheck,
          iconBg: "bg-cyan-500/10 text-cyan-300",
        };
      default:
        return {
          label: "Update",
          badgeBg: "bg-white/[0.06] text-neutral-300 border-white/10",
          icon: Bell,
          iconBg: "bg-white/[0.06] text-neutral-300",
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
        className="relative p-2 text-neutral-400 hover:text-white transition-colors rounded-xl hover:bg-white/[0.06] focus:outline-none cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-gradient-to-r from-rose-500 to-pink-500 text-[9px] font-bold text-white shadow-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* ── PREMIUM MINIMALIST DROPDOWN ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-80 sm:w-[380px] bg-[#0c1017]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  href={allNotificationsLink}
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] font-semibold text-primary hover:text-primary/90 flex items-center gap-0.5 transition-colors"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Notification List with Smooth Dark Scrollbar */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent">
              {notifications.map((item) => {
                const config = getCategoryConfig(item.category);
                const IconComponent = config.icon;
                const targetLink = item.actionUrl || item.link || allNotificationsLink;
                const timeDisplay = item.timeAgo || item.timestamp || "Just now";
                const displayTitle = cleanText(item.title);
                const displayDesc = cleanText(item.description || (item as any).message);

                return (
                  <Link
                    key={item.id}
                    href={targetLink}
                    onClick={() => {
                      if (item.isUnread) markSingleAsRead(item.id);
                      setIsOpen(false);
                    }}
                    className={`p-3.5 transition-all flex items-start gap-3 relative group hover:bg-white/[0.04] ${
                      item.isUnread ? "bg-white/[0.02]" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* Unread Glow Dot */}
                    {item.isUnread && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                    )}

                    {/* Subtle Category Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${config.iconBg}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border tracking-wide uppercase ${config.badgeBg}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {timeDisplay}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-neutral-100 group-hover:text-white transition-colors line-clamp-1 leading-snug">
                        {displayTitle}
                      </h4>

                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed font-normal">
                        {displayDesc}
                      </p>
                    </div>
                  </Link>
                );
              })}

              {notifications.length === 0 && !isLoading && (
                <div className="p-10 text-center text-neutral-400 space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-neutral-500 mb-2">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-neutral-200">All caught up</p>
                  <p className="text-[11px] text-neutral-400">No new notifications at this time.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-white/[0.02] border-t border-white/[0.08] text-center">
              <Link
                href={allNotificationsLink}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors w-full py-2 rounded-xl hover:bg-white/[0.04]"
              >
                <span>Go to Notifications Hub</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
