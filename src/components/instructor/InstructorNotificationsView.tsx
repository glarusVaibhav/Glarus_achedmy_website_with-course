"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  ShieldCheck,
  UserCheck,
  Clock,
  CreditCard,
  Search,
  CheckCircle2,
  Trash2,
  Archive,
  X,
  ExternalLink,
  ChevronRight,
  CheckSquare,
  Square,
  Sparkles,
  Inbox,
  Radio,
  BookOpen,
  FileCheck,
  RefreshCw,
  Loader2
} from "lucide-react";

export interface FullNotification {
  id: string;
  category: string;
  type?: string;
  priority?: string;
  title: string;
  description: string;
  message?: string;
  details?: string | null;
  timestamp: string;
  timeAgo?: string;
  isRead: boolean;
  isUnread: boolean;
  isArchived: boolean;
  link?: string;
  actionUrl?: string;
  icon?: string;
}

export function InstructorNotificationsView() {
  const [notifications, setNotifications] = useState<FullNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeNotificationModal, setActiveNotificationModal] = useState<FullNotification | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const categoryQuery = selectedTab !== "All" ? `&category=${selectedTab}` : "";
      const searchQueryParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : "";
      const res = await fetch(`/api/instructor/notifications?limit=50${categoryQuery}${searchQueryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
          setTotalCount(data.total || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch instructor notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTab, searchQuery]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const readCount = Math.max(0, totalCount - unreadCount);
  const archivedCount = 0;

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length && notifications.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const markSelectedAsRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (selectedIds.includes(n.id) ? { ...n, isRead: true, isUnread: false } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - selectedIds.length));
      for (const id of selectedIds) {
        fetch(`/api/instructor/notifications/${id}/read`, { method: "PATCH" }).catch(() => {});
      }
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to mark selected as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, isUnread: false })));
      setUnreadCount(0);
      await fetch("/api/instructor/notifications/read-all", { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const deleteSelected = async () => {
    try {
      const idsToDelete = [...selectedIds];
      setNotifications((prev) => prev.filter((n) => !idsToDelete.includes(n.id)));
      setSelectedIds([]);
      for (const id of idsToDelete) {
        fetch(`/api/instructor/notifications/${id}`, { method: "DELETE" }).catch(() => {});
      }
    } catch (err) {
      console.error("Failed to delete selected:", err);
    }
  };

  const toggleReadStatus = async (id: string) => {
    try {
      const target = notifications.find((n) => n.id === id);
      if (!target) return;
      const willBeRead = !target.isRead;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: willBeRead, isUnread: !willBeRead } : n))
      );
      if (willBeRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        await fetch(`/api/instructor/notifications/${id}/read`, { method: "PATCH" });
      }
    } catch (err) {
      console.error("Failed to toggle read status:", err);
    }
  };

  const deleteOne = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await fetch(`/api/instructor/notifications/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete single notification:", err);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "LIVE_SESSION":
      case "LIVE":
        return { label: "🔴 LIVE CLASS", badgeBg: "bg-red-500/15 text-red-400 border-red-500/30", icon: Radio, iconColor: "text-red-400" };
      case "COURSE":
        return { label: "🎓 COURSE", badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: BookOpen, iconColor: "text-blue-400" };
      case "ASSIGNMENT":
        return { label: "📝 ASSIGNMENT", badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: FileCheck, iconColor: "text-amber-400" };
      case "ADMIN":
        return { label: "🛡 ADMIN", badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: ShieldCheck, iconColor: "text-amber-400" };
      case "STUDENT":
        return { label: "👨‍🎓 STUDENT", badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: UserCheck, iconColor: "text-blue-400" };
      case "VERIFICATION":
        return { label: "🛡 VERIFICATION", badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: ShieldCheck, iconColor: "text-emerald-400" };
      case "REMINDER":
      case "SYSTEM":
        return { label: "⚙ SYSTEM", badgeBg: "bg-purple-500/15 text-purple-400 border-purple-500/30", icon: Clock, iconColor: "text-purple-400" };
      case "PAYMENT":
        return { label: "💰 PAYMENT", badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CreditCard, iconColor: "text-emerald-400" };
      default:
        return { label: "🔔 NOTIFICATION", badgeBg: "bg-primary/15 text-primary border-primary/30", icon: Bell, iconColor: "text-primary" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── STATISTICS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card/60 backdrop-blur-xl border border-card/80 rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-subtext uppercase tracking-widest block">Unread Notifications</span>
            <span className="text-3xl font-black text-rose-400 mt-1 block">{unreadCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card/60 backdrop-blur-xl border border-card/80 rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-subtext uppercase tracking-widest block">Total Notifications</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">{totalCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card/60 backdrop-blur-xl border border-card/80 rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-subtext uppercase tracking-widest block">Read Notifications</span>
            <span className="text-3xl font-black text-subtext mt-1 block">{readCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-card border border-card text-subtext">
            <Archive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── CATEGORY TABS & SEARCH BAR ─── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/40 backdrop-blur-xl border border-card/80 rounded-2xl p-4 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "All", label: "All" },
            { id: "ADMIN", label: "Admin" },
            { id: "STUDENT", label: "Students" },
            { id: "LIVE_SESSION", label: "Live Classes" },
            { id: "COURSE", label: "Courses" },
            { id: "ASSIGNMENT", label: "Assignments" },
            { id: "TASK", label: "Tasks" },
            { id: "PAYMENT", label: "Payments" },
            { id: "SYSTEM", label: "System" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                selectedTab === tab.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-subtext hover:bg-card hover:text-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full bg-background border border-card rounded-xl pl-10 pr-4 py-2 text-xs text-text placeholder:text-subtext/60 font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            onClick={() => fetchNotifications()}
            className="p-2.5 bg-card hover:bg-card/80 border border-card/80 rounded-xl text-subtext hover:text-text transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── BULK ACTIONS TOOLBAR ─── */}
      {notifications.length > 0 && (
        <div className="bg-card/60 border border-card/80 rounded-2xl px-5 py-3 flex items-center justify-between text-xs font-bold shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-text hover:text-primary transition-colors"
            >
              {selectedIds.length === notifications.length && notifications.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4 text-subtext" />
              )}
              <span>Select All ({selectedIds.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl transition-all"
              >
                Mark All Read
              </button>
            )}

            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={markSelectedAsRead}
                  className="px-3 py-1.5 bg-card text-subtext hover:text-text border border-card rounded-xl transition-all"
                >
                  Mark Selected Read
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl transition-all"
                >
                  Delete Selected
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── NOTIFICATION CARDS LIST ─── */}
      <div className="space-y-3">
        {isLoading && notifications.length === 0 ? (
          <div className="bg-card/40 border border-card rounded-2xl p-16 text-center text-subtext">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            <p className="font-extrabold text-sm text-text">Loading notifications...</p>
          </div>
        ) : notifications.map((notification) => {
          const config = getCategoryBadge(notification.category);
          const IconComp = config.icon;
          const isSelected = selectedIds.includes(notification.id);
          const timeText = notification.timeAgo || notification.timestamp;

          return (
            <div
              key={notification.id}
              className={`bg-card/60 backdrop-blur-xl border rounded-2xl p-5 shadow-md transition-all flex items-start gap-4 relative group ${
                !notification.isRead
                  ? "border-l-4 border-l-primary border-card/80 bg-primary/5"
                  : "border-card/80"
              }`}
            >
              {/* Checkbox */}
              <button onClick={() => toggleSelectOne(notification.id)} className="mt-1">
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4 text-subtext/60 group-hover:text-subtext" />
                )}
              </button>

              {/* Icon */}
              <div className={`p-3 rounded-2xl bg-card border border-card shrink-0 ${config.iconColor}`}>
                <IconComp className="w-5 h-5" />
              </div>

              {/* Card Body */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => setActiveNotificationModal(notification)}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${config.badgeBg}`}>
                    {config.label}
                  </span>
                  <span className="text-[11px] font-semibold text-subtext">{timeText}</span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse ml-auto" />
                  )}
                </div>

                <h3 className="text-base font-extrabold text-text line-clamp-1 group-hover:text-primary transition-colors">
                  {notification.title}
                </h3>
                <p className="text-xs text-subtext font-medium line-clamp-2 mt-1">
                  {notification.description || notification.message}
                </p>
              </div>

              {/* Quick Card Actions */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleReadStatus(notification.id)}
                  className="p-2 text-subtext hover:text-primary rounded-lg hover:bg-card transition-colors"
                  title={notification.isRead ? "Mark as Unread" : "Mark as Read"}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteOne(notification.id)}
                  className="p-2 text-subtext hover:text-rose-400 rounded-lg hover:bg-card transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && !isLoading && (
          <div className="bg-card/40 border border-card rounded-2xl p-16 text-center text-subtext">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-extrabold text-base text-text">No notifications found</p>
            <p className="text-xs">There are no notifications matching your selected filter.</p>
          </div>
        )}
      </div>

      {/* ─── NOTIFICATION DETAILS MODAL ─── */}
      {activeNotificationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-background border border-card rounded-3xl w-full max-w-xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-card pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Notification Details
                </span>
                <h3 className="text-xl font-extrabold text-text mt-1">
                  {activeNotificationModal.title}
                </h3>
                <span className="text-xs text-subtext">
                  {activeNotificationModal.timeAgo || activeNotificationModal.timestamp}
                </span>
              </div>
              <button
                onClick={() => setActiveNotificationModal(null)}
                className="p-2 text-subtext hover:text-text rounded-xl bg-card"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-text">
              <p className="text-sm font-semibold">
                {activeNotificationModal.description || activeNotificationModal.message}
              </p>
              {activeNotificationModal.details && (
                <div className="p-4 bg-card border border-card rounded-2xl text-subtext leading-relaxed">
                  {activeNotificationModal.details}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-card">
              <button
                onClick={() => {
                  toggleReadStatus(activeNotificationModal.id);
                  setActiveNotificationModal(null);
                }}
                className="px-4 py-2 bg-card hover:bg-card/80 text-text rounded-xl font-bold text-xs"
              >
                {activeNotificationModal.isRead ? "Mark as Unread" : "Mark as Read"}
              </button>

              {(activeNotificationModal.actionUrl || activeNotificationModal.link) && (
                <a
                  href={activeNotificationModal.actionUrl || activeNotificationModal.link}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-extrabold text-xs flex items-center gap-1 shadow-md shadow-primary/20"
                >
                  Open Destination <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
