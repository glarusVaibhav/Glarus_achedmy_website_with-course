"use client";

import { useState } from "react";
import {
  Bell,
  ShieldCheck,
  UserCheck,
  Clock,
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Archive,
  Mail,
  X,
  ExternalLink,
  ChevronRight,
  CheckSquare,
  Square,
  Sparkles,
  Inbox
} from "lucide-react";

export interface FullNotification {
  id: string;
  category: "ADMIN" | "STUDENT" | "SYSTEM" | "PAYMENT";
  title: string;
  description: string;
  details?: string;
  timestamp: string;
  isUnread: boolean;
  isArchived: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS_DATA: FullNotification[] = [
  {
    id: "notif-1",
    category: "ADMIN",
    title: "Python Bootcamp Approved",
    description: "Your course 'Mastering Agentic AI & Autonomous Workflows' has been officially approved by platform review.",
    details: "The admin review team evaluated your course syllabus, video lessons, and sandbox exercises. The course is now published on the public catalog.",
    timestamp: "2 minutes ago",
    isUnread: true,
    isArchived: false,
    link: "/instructor/courses"
  },
  {
    id: "notif-2",
    category: "STUDENT",
    title: "Assignment Submitted",
    description: "Rahul Sharma submitted Assignment 2: LangChain Agent Loop Implementation.",
    details: "Rahul submitted code zip file and passing test output for review.",
    timestamp: "12 minutes ago",
    isUnread: true,
    isArchived: false,
    link: "/instructor/assignments"
  },
  {
    id: "notif-3",
    category: "SYSTEM",
    title: "Live Session Reminder",
    description: "Your live session 'Agentic AI Q&A & Code Walkthrough' starts in 20 minutes.",
    details: "Remember to join 5 minutes early to test audio and screen sharing.",
    timestamp: "Today at 17:40",
    isUnread: true,
    isArchived: false,
  },
  {
    id: "notif-4",
    category: "PAYMENT",
    title: "Payout Credited",
    description: "₹4,500 credited successfully for July 2026 student enrollments.",
    details: "Transaction ID: TXN-99482104. Funds processed directly to your registered bank account.",
    timestamp: "Yesterday",
    isUnread: true,
    isArchived: false,
  },
  {
    id: "notif-5",
    category: "STUDENT",
    title: "New Course Review Posted",
    description: "Priya Patel rated your course 5 Stars: 'Incredible explanations of multi-agent patterns!'",
    details: "Student review added to course landing page.",
    timestamp: "2 days ago",
    isUnread: true,
    isArchived: false,
  },
  {
    id: "notif-6",
    category: "ADMIN",
    title: "New Instructor Guidelines Updated",
    description: "Please review the updated 2026 course quality guidelines and sandbox submission rules.",
    details: "All instructors must include practical project assignments in every top-level module.",
    timestamp: "3 days ago",
    isUnread: false,
    isArchived: false,
  },
  {
    id: "notif-7",
    category: "SYSTEM",
    title: "System Maintenance Scheduled",
    description: "Scheduled maintenance on August 10 from 02:00 AM to 04:00 AM UTC.",
    details: "Live sessions will be paused during this 2-hour window.",
    timestamp: "4 days ago",
    isUnread: false,
    isArchived: false,
  },
  {
    id: "notif-8",
    category: "PAYMENT",
    title: "Monthly Tax Invoice Generated",
    description: "Your July 2026 tax statement is ready for download in settings.",
    timestamp: "1 week ago",
    isUnread: false,
    isArchived: false,
  },
];

export function InstructorNotificationsView() {
  const [notifications, setNotifications] = useState<FullNotification[]>(INITIAL_NOTIFICATIONS_DATA);
  const [selectedTab, setSelectedTab] = useState<"All" | "ADMIN" | "STUDENT" | "SYSTEM" | "PAYMENT">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeNotificationModal, setActiveNotificationModal] = useState<FullNotification | null>(null);

  /* Stats */
  const unreadCount = notifications.filter(n => n.isUnread && !n.isArchived).length;
  const readCount = notifications.filter(n => !n.isUnread && !n.isArchived).length;
  const archivedCount = notifications.filter(n => n.isArchived).length;

  /* Filtered list */
  const filteredNotifications = notifications.filter((n) => {
    if (n.isArchived && selectedTab !== "All") return false;
    const matchesTab = selectedTab === "All" || n.category === selectedTab;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const markSelectedAsRead = () => {
    setNotifications(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, isUnread: false } : n));
    setSelectedIds([]);
  };

  const archiveSelected = () => {
    setNotifications(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, isArchived: true } : n));
    setSelectedIds([]);
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  const toggleReadStatus = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: !n.isUnread } : n));
  };

  const deleteOne = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const archiveOne = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isArchived: true } : n));
  };

  const getCategoryBadge = (category: FullNotification["category"]) => {
    switch (category) {
      case "ADMIN":
        return { label: "🛡 ADMIN", badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: ShieldCheck, iconColor: "text-amber-400" };
      case "STUDENT":
        return { label: "👨‍🎓 STUDENT", badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: UserCheck, iconColor: "text-blue-400" };
      case "SYSTEM":
        return { label: "⚙ SYSTEM", badgeBg: "bg-purple-500/15 text-purple-400 border-purple-500/30", icon: Clock, iconColor: "text-purple-400" };
      case "PAYMENT":
        return { label: "💰 PAYMENT", badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CreditCard, iconColor: "text-emerald-400" };
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
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20"><Bell className="w-6 h-6" /></div>
        </div>

        <div className="bg-card/60 backdrop-blur-xl border border-card/80 rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-subtext uppercase tracking-widest block">Read Notifications</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">{readCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-6 h-6" /></div>
        </div>

        <div className="bg-card/60 backdrop-blur-xl border border-card/80 rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-subtext uppercase tracking-widest block">Archived Notifications</span>
            <span className="text-3xl font-black text-subtext mt-1 block">{archivedCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-card border border-card text-subtext"><Archive className="w-6 h-6" /></div>
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
            { id: "SYSTEM", label: "System" },
            { id: "PAYMENT", label: "Payments" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                selectedTab === tab.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-subtext hover:bg-card hover:text-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full bg-background border border-card rounded-xl pl-10 pr-4 py-2 text-xs text-text placeholder:text-subtext/60 font-medium focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* ─── BULK ACTIONS TOOLBAR ─── */}
      {filteredNotifications.length > 0 && (
        <div className="bg-card/60 border border-card/80 rounded-2xl px-5 py-3 flex items-center justify-between text-xs font-bold shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 text-text hover:text-primary transition-colors">
              {selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4 text-subtext" />
              )}
              <span>Select All ({selectedIds.length})</span>
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={markSelectedAsRead}
                className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl transition-all"
              >
                Mark Read
              </button>
              <button
                onClick={archiveSelected}
                className="px-3 py-1.5 bg-card text-subtext hover:text-text border border-card rounded-xl transition-all"
              >
                Archive
              </button>
              <button
                onClick={deleteSelected}
                className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl transition-all"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── NOTIFICATION CARDS LIST ─── */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const config = getCategoryBadge(notification.category);
          const IconComp = config.icon;
          const isSelected = selectedIds.includes(notification.id);

          return (
            <div
              key={notification.id}
              className={`bg-card/60 backdrop-blur-xl border rounded-2xl p-5 shadow-md transition-all flex items-start gap-4 relative group ${
                notification.isUnread
                  ? "border-l-4 border-l-primary border-card/80 bg-primary/5"
                  : "border-card/80"
              }`}
            >
              {/* Checkbox */}
              <button onClick={() => toggleSelectOne(notification.id)} className="mt-1">
                {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-subtext/60 group-hover:text-subtext" />}
              </button>

              {/* Icon */}
              <div className={`p-3 rounded-2xl bg-card border border-card shrink-0 ${config.iconColor}`}>
                <IconComp className="w-5 h-5" />
              </div>

              {/* Card Body */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveNotificationModal(notification)}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${config.badgeBg}`}>
                    {config.label}
                  </span>
                  <span className="text-[11px] font-semibold text-subtext">{notification.timestamp}</span>
                  {notification.isUnread && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse ml-auto" />
                  )}
                </div>

                <h3 className="text-base font-extrabold text-text line-clamp-1 group-hover:text-primary transition-colors">
                  {notification.title}
                </h3>
                <p className="text-xs text-subtext font-medium line-clamp-2 mt-1">
                  {notification.description}
                </p>
              </div>

              {/* Quick Card Actions */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleReadStatus(notification.id)}
                  className="p-2 text-subtext hover:text-primary rounded-lg hover:bg-card transition-colors"
                  title={notification.isUnread ? "Mark as Read" : "Mark as Unread"}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => archiveOne(notification.id)}
                  className="p-2 text-subtext hover:text-amber-400 rounded-lg hover:bg-card transition-colors"
                  title="Archive Notification"
                >
                  <Archive className="w-4 h-4" />
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

        {filteredNotifications.length === 0 && (
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
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Notification Details</span>
                <h3 className="text-xl font-extrabold text-text mt-1">{activeNotificationModal.title}</h3>
                <span className="text-xs text-subtext">{activeNotificationModal.timestamp}</span>
              </div>
              <button onClick={() => setActiveNotificationModal(null)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-text">
              <p className="text-sm font-semibold">{activeNotificationModal.description}</p>
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
                Mark as Read
              </button>

              {activeNotificationModal.link && (
                <a
                  href={activeNotificationModal.link}
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
