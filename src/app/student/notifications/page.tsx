"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";
import {
  Bell,
  Sparkles,
  Clock,
  CheckCircle2,
  PlaySquare,
  Calendar,
  Award,
  Radio,
  FileCheck,
  BookOpen,
  MessageSquare,
  Check,
  ChevronRight,
  Filter,
  Search,
  X,
  Sliders,
  Settings,
  ShieldCheck,
  Layers,
  ArrowLeft,
  Flame,
  CheckCheck,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StudentNotification {
  id: string;
  category: "LIVE" | "RECORDING" | "ASSIGNMENT" | "COURSE" | "CERTIFICATE" | "COMMUNITY";
  courseTitle: string;
  instructorName?: string;
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  href: string;
  actionText: string;
  priority?: "urgent" | "normal";
}

const INITIAL_STUDENT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: "notif-1",
    category: "LIVE",
    courseTitle: "Generative AI & LLM Systems",
    instructorName: "Dr. Alex Vance",
    title: "Live Workshop Starting Soon",
    message: "Your live cohort workshop 'Session 04: RAG & Vector Databases' starts in 20 minutes. Prepare your questions and join the live room.",
    time: "20 minutes ago",
    isUnread: true,
    href: "/calendar",
    actionText: "Join Live Room Now →",
    priority: "urgent"
  },
  {
    id: "notif-2",
    category: "ASSIGNMENT",
    courseTitle: "Generative AI & LLM Systems",
    instructorName: "Dr. Alex Vance",
    title: "Assignment Graded (98/100 · Grade A+)",
    message: "Your submission for 'PyTorch Transformer Attention' has been graded. Feedback: 'Exceptional math derivation and modular attention block implementation.'",
    time: "1 hour ago",
    isUnread: true,
    href: "/student/assignments",
    actionText: "View Grade & Feedback →",
    priority: "normal"
  },
  {
    id: "notif-3",
    category: "COURSE",
    courseTitle: "Advanced Generative AI Masterclass",
    instructorName: "Elena Rostova",
    title: "New Module Unlocked: Fine-Tuning LoRA Models",
    message: "Module 5: Fine-Tuning LoRA & QLoRA Models on Custom Datasets is now available with 4 new video lessons and downloadable notebooks.",
    time: "Yesterday",
    isUnread: true,
    href: "/student/courses",
    actionText: "Start Module 5 →",
    priority: "normal"
  },
  {
    id: "notif-4",
    category: "CERTIFICATE",
    courseTitle: "Advanced Python for AI & Data Pipelines",
    instructorName: "Marcus Thorne",
    title: "Verified Certificate Ready for Download",
    message: "Congratulations! You completed all 20 lectures and capstone projects. Your official credential has been issued and is ready to share on LinkedIn.",
    time: "2 days ago",
    isUnread: false,
    href: "/student/certificates",
    actionText: "View Verified Certificate →",
    priority: "normal"
  },
  {
    id: "notif-5",
    category: "COMMUNITY",
    courseTitle: "AI Automation Engineer",
    instructorName: "Elena Rostova",
    title: "Instructor Answered Your Question",
    message: "Elena Rostova replied to your question: 'How to handle hybrid dense/sparse indexing in Pinecone?' in the cohort live discussion channel.",
    time: "3 days ago",
    isUnread: false,
    href: "/calendar",
    actionText: "Read Instructor Reply →",
    priority: "normal"
  },
  {
    id: "notif-6",
    category: "RECORDING",
    courseTitle: "Generative AI & LLM Systems",
    instructorName: "Dr. Alex Vance",
    title: "New Live Class Recording Available",
    message: "The full 1080p recording and lecture slide decks for 'Session 01: Attention Architectures' are now accessible in your video library.",
    time: "4 days ago",
    isUnread: false,
    href: "/student/recorded-sessions",
    actionText: "Watch Recording →",
    priority: "normal"
  }
];

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<StudentNotification[]>(INITIAL_STUDENT_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Toggle Read Status
  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: !n.isUnread } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  // Filter & Search Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeCategory === "UNREAD" && !n.isUnread) return false;
      if (activeCategory !== "ALL" && activeCategory !== "UNREAD" && n.category !== activeCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchMsg = n.message.toLowerCase().includes(q);
        const matchCourse = n.courseTitle.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchCourse) return false;
      }
      return true;
    });
  }, [notifications, activeCategory, searchQuery]);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const getCategoryConfig = (cat: StudentNotification["category"]) => {
    switch (cat) {
      case "LIVE":
        return {
          label: "🔴 LIVE CLASS",
          badge: "bg-red-500/15 text-red-400 border-red-500/30",
          cardGradient: "bg-gradient-to-r from-red-950/40 via-card/70 to-card border-red-500/30 hover:border-red-500/60 shadow-red-500/5",
          icon: Radio,
          iconBox: "bg-red-500/20 text-red-400 border-red-500/40",
          buttonColor: "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30",
          glowColor: "from-red-500/20 to-transparent",
        };
      case "RECORDING":
        return {
          label: "🎬 RECORDED SESSION",
          badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
          cardGradient: "bg-gradient-to-r from-purple-950/30 via-card/70 to-card border-purple-500/30 hover:border-purple-500/60 shadow-purple-500/5",
          icon: PlaySquare,
          iconBox: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          buttonColor: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30",
          glowColor: "from-purple-500/25 to-transparent",
        };
      case "ASSIGNMENT":
        return {
          label: "📝 ASSIGNMENT",
          badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          cardGradient: "bg-gradient-to-r from-amber-950/30 via-card/70 to-card border-amber-500/30 hover:border-amber-500/60 shadow-amber-500/5",
          icon: FileCheck,
          iconBox: "bg-amber-500/20 text-amber-400 border-amber-500/40",
          buttonColor: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30",
          glowColor: "from-amber-500/20 to-transparent",
        };
      case "COURSE":
        return {
          label: "🎓 COURSE UPDATE",
          badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
          cardGradient: "bg-gradient-to-r from-blue-950/30 via-card/70 to-card border-blue-500/30 hover:border-blue-500/60 shadow-blue-500/5",
          icon: BookOpen,
          iconBox: "bg-blue-500/20 text-blue-400 border-blue-500/40",
          buttonColor: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30",
          glowColor: "from-blue-500/20 to-transparent",
        };
      case "CERTIFICATE":
        return {
          label: "🏆 CERTIFICATE",
          badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          cardGradient: "bg-gradient-to-r from-emerald-950/30 via-card/70 to-card border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-500/5",
          icon: Award,
          iconBox: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
          buttonColor: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30",
          glowColor: "from-emerald-500/20 to-transparent",
        };
      case "COMMUNITY":
        return {
          label: "💬 INSTRUCTOR FEEDBACK",
          badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
          cardGradient: "bg-gradient-to-r from-cyan-950/30 via-card/70 to-card border-cyan-500/30 hover:border-cyan-500/60 shadow-cyan-500/5",
          icon: MessageSquare,
          iconBox: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          buttonColor: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30",
          glowColor: "from-cyan-500/20 to-transparent",
        };
    }
  };

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-8 max-w-[1550px] mx-auto space-y-8 text-text">

        {/* ───────── 1. HERO HEADER SECTION (Cosmic Gradient Glass) ───────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/40 via-card/80 to-blue-950/30 border border-purple-500/30 shadow-2xl relative overflow-hidden">
          {/* Ambient Background Glows */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Title & Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="px-3 py-1 rounded-xl bg-card hover:bg-card/80 border border-card text-subtext hover:text-text text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Portal</span>
                </Link>
                <span className="text-subtext/40">•</span>
                <span className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Student Activity Hub
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 shadow-inner">
                  <Bell className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-text">
                      Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">Notifications</span>
                    </h1>
                    {unreadCount > 0 && (
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        {unreadCount} Unread Alerts
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-subtext mt-1 max-w-2xl font-medium">
                    Live cohort class updates, assignment grading evaluations, newly unlocked modules, and certified credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2.5 bg-card hover:bg-card/80 border border-card rounded-xl text-xs font-bold text-text flex items-center gap-2 transition-all cursor-pointer shadow-xs hover:border-purple-500/40 active:scale-95"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mark All as Read</span>
                </button>
              )}

              <button
                onClick={() => setIsPreferencesOpen(true)}
                className="px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Alert Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* ───────── 2. CATEGORY PILLS & SEARCH BAR ───────── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: "ALL", label: "All Activity", count: notifications.length },
              { id: "UNREAD", label: "Unread", count: unreadCount },
              { id: "LIVE", label: "🔴 Live Classes", count: notifications.filter(n => n.category === "LIVE").length },
              { id: "RECORDING", label: "🎬 Recordings", count: notifications.filter(n => n.category === "RECORDING").length },
              { id: "ASSIGNMENT", label: "📝 Assignments", count: notifications.filter(n => n.category === "ASSIGNMENT").length },
              { id: "COURSE", label: "🎓 Course Updates", count: notifications.filter(n => n.category === "COURSE").length },
              { id: "CERTIFICATE", label: "🏆 Certificates", count: notifications.filter(n => n.category === "CERTIFICATE").length },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveCategory(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                  activeCategory === f.id
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                    : "bg-card/50 border-card text-subtext hover:text-text hover:bg-card/90"
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeCategory === f.id ? "bg-white/20 text-white" : "bg-card text-subtext"}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-card/60 border border-card rounded-xl text-xs text-text placeholder:text-subtext focus:outline-none focus:border-purple-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ───────── 3. NOTIFICATION CARDS LIST ───────── */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-card rounded-3xl bg-card/20 space-y-3 max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-card border border-card text-subtext/40 flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7" />
              </div>
              <h4 className="font-black text-lg text-text">No Notifications Found</h4>
              <p className="text-xs text-subtext leading-relaxed">
                {searchQuery
                  ? `No alerts matched your search "${searchQuery}".`
                  : "You are completely caught up with all live classes, assignments, and curriculum updates."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const config = getCategoryConfig(n.category);
              const IconComp = config.icon;

              return (
                <div
                  key={n.id}
                  className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative group overflow-hidden ${config.cardGradient} ${
                    n.isUnread ? "ring-1 ring-white/10" : ""
                  }`}
                >
                  {/* Subtle Top Glow Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${config.glowColor}`} />

                  {/* Left Node, Badge, and Message */}
                  <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                    {/* Glowing Icon Box */}
                    <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg mt-0.5 group-hover:scale-105 transition-transform ${config.iconBox}`}>
                      <IconComp className="w-6 h-6" />
                    </div>

                    <div className="space-y-2 min-w-0 flex-1">
                      {/* Top Meta Line: Badge, Course, Timestamp */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-xs ${config.badge}`}>
                          {config.label}
                        </span>

                        <span className="text-subtext/40">•</span>

                        <span className="text-xs font-bold text-text flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          {n.courseTitle}
                        </span>

                        <span className="text-subtext/40">•</span>

                        <span className="text-xs text-subtext font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-subtext/70 shrink-0" />
                          {n.time}
                        </span>

                        {n.isUnread && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Notification Title */}
                      <h3 className="font-black text-lg sm:text-xl text-text group-hover:text-white transition-colors leading-snug">
                        {n.title}
                      </h3>

                      {/* Detailed Message */}
                      <p className="text-xs sm:text-sm text-subtext leading-relaxed max-w-4xl">
                        {n.message}
                      </p>

                      {n.instructorName && (
                        <div className="pt-1 text-xs text-subtext font-medium flex items-center gap-1.5">
                          <span>Instructor: <strong className="text-text">{n.instructorName}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action CTAs */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center pt-2 md:pt-0">
                    <button
                      onClick={(e) => toggleRead(n.id, e)}
                      title={n.isUnread ? "Mark as read" : "Mark as unread"}
                      className="p-2.5 rounded-xl bg-card/80 hover:bg-card border border-card text-subtext hover:text-text transition-colors cursor-pointer"
                    >
                      {n.isUnread ? <Check className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4" />}
                    </button>

                    <Link
                      href={n.href}
                      className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-lg active:scale-95 ${config.buttonColor}`}
                    >
                      <span>{n.actionText}</span>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ───────── 4. NOTIFICATION PREFERENCES MODAL ───────── */}
        <AnimatePresence>
          {isPreferencesOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-card rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-card pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-text">Notification Alerts</h3>
                      <p className="text-xs text-subtext">Manage student alert channels</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPreferencesOpen(false)}
                    className="p-2 rounded-xl bg-background text-subtext hover:text-text cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {[
                    { title: "Live Class Reminders", desc: "Get alerted 15 minutes before workshops start.", enabled: true },
                    { title: "Assignment Grades & Feedback", desc: "Instant alert when instructor reviews your code.", enabled: true },
                    { title: "New Module & Lab Releases", desc: "Notification when new lessons are added.", enabled: true },
                    { title: "Browser Push Alerts", desc: "Receive desktop popups for urgent announcements.", enabled: false }
                  ].map((pref, idx) => (
                    <div key={idx} className="p-3.5 bg-background/60 border border-card rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-text">{pref.title}</p>
                        <p className="text-[11px] text-subtext mt-0.5">{pref.desc}</p>
                      </div>
                      <div className="w-10 h-6 bg-purple-600 rounded-full p-1 cursor-pointer flex items-center justify-end">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsPreferencesOpen(false)}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Save Preferences
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
