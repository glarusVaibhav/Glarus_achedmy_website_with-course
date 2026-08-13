"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Sparkles,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AdminNotification {
  id: string;
  type: "INSTRUCTOR_APPROVAL" | "COURSE_APPROVAL" | "TASK_SUBMISSION" | "REFUND_REQUEST" | "LIVE_RESCHEDULE" | "SYSTEM";
  title: string;
  message: string;
  timestamp: string;
  timeGroup: "Today" | "Earlier";
  isRead: boolean;
  priority: "Critical" | "High" | "Normal";
  actionLabel?: string;
  actionHref?: string;
}

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "notif-1",
    type: "INSTRUCTOR_APPROVAL",
    title: "Instructor Verification Application",
    message: "Alex Chen applied for Instructor status with 5+ yrs experience & uploaded resume.",
    timestamp: "25m ago",
    timeGroup: "Today",
    isRead: false,
    priority: "High",
    actionLabel: "Review Profile",
    actionHref: "/admin/instructors?tab=approvals"
  },
  {
    id: "notif-2",
    type: "TASK_SUBMISSION",
    title: "Task Deliverable Submitted",
    message: "Jessica Lin submitted deliverables for 'TSK-1044: Build Python Code Lab'.",
    timestamp: "1h ago",
    timeGroup: "Today",
    isRead: false,
    priority: "Critical",
    actionLabel: "Review Task",
    actionHref: "/admin/tasks?search=TSK-1044"
  },
  {
    id: "notif-3",
    type: "REFUND_REQUEST",
    title: "Refund Request Requires Action",
    message: "Priya Nair requested a refund of ₹999 for 'React Masterclass' (Accidental purchase).",
    timestamp: "3h ago",
    timeGroup: "Today",
    isRead: false,
    priority: "Normal",
    actionLabel: "Process Refund",
    actionHref: "/admin/payments?tab=refunds"
  },
  {
    id: "notif-4",
    type: "COURSE_APPROVAL",
    title: "Course Ready for Validation",
    message: "Jordan Walke submitted 'Mastering Next.js 14' (14h 20m, 2 sections).",
    timestamp: "Yesterday",
    timeGroup: "Earlier",
    isRead: true,
    priority: "High",
    actionLabel: "Inspect Course",
    actionHref: "/admin/courses?tab=approvals"
  },
  {
    id: "notif-5",
    type: "LIVE_RESCHEDULE",
    title: "Live Session Reschedule Request",
    message: "Alex Chen requested shifting 'Advanced RAG Architecture' from 6:00 PM to 7:00 PM.",
    timestamp: "2 days ago",
    timeGroup: "Earlier",
    isRead: true,
    priority: "Normal",
    actionLabel: "View Schedule",
    actionHref: "/admin/instructors?tab=live"
  }
];

const NOTIF_ICONS: Record<AdminNotification["type"], React.ElementType> = {
  INSTRUCTOR_APPROVAL: GraduationCap,
  COURSE_APPROVAL: BookOpen,
  TASK_SUBMISSION: CheckSquare,
  REFUND_REQUEST: RotateCcw,
  LIVE_RESCHEDULE: Radio,
  SYSTEM: ShieldCheck
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"All" | "Unread">("All");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-card border border-white/10 text-subtext hover:text-text hover:bg-card-hover transition-all focus:outline-none"
        title="Admin Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-background animate-pulse">
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
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-subtext hover:text-text hover:bg-white/5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-card text-xs">
              <button
                onClick={() => setActiveFilter("All")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeFilter === "All"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-subtext hover:text-text"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter("Unread")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
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
                  <p className="text-xs">No notifications require administrative review.</p>
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
  const Icon = NOTIF_ICONS[item.type] || ShieldCheck;

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
                className="text-[10px] text-subtext hover:text-text px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
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
