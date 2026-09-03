"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Video,
  Users,
  Tv,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  PlayCircle,
  CalendarCheck,
  X,
  Lock,
  Layers,
  GraduationCap,
  TrendingUp,
  Award,
  Check,
  Play,
  FileText,
  User,
  Share2,
  Download,
  Flame,
  Radio,
  BookOpen,
  ArrowUpRight,
  BarChart2,
  Maximize2,
  ExternalLink,
  Bell
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";

/* ═══════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════ */

export interface LiveSessionAgendaItem {
  id: string;
  stepNumber: string;
  timeRange: string;
  title: string;
  description?: string;
}

export interface LiveSessionAttendance {
  status: "present" | "late" | "absent";
  timeAttended?: string; // e.g. "1h 28m / 1h 30m"
  joinedLateMinutes?: number;
}

export interface LiveCourseSession {
  id: string;
  courseId: string;
  courseTitle: string;
  sessionNumber: number;
  sessionCode: string; // e.g. "Session 01"
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "11:30 AM"
  duration: string; // e.g. "1h 30m"
  instructor: {
    name: string;
    title: string;
    avatar?: string;
  };
  batchName: string;
  status: "completed" | "live" | "upcoming" | "rescheduled";
  meetingLink: string;
  recordingUrl?: string;
  recordingStatus?: "available" | "processing";
  attendance?: LiveSessionAttendance;
  topics: string[];
  agenda: LiveSessionAgendaItem[];
}

export interface LiveCourseProgram {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  gradient: string;
  thumbnail: string;
  instructor: {
    name: string;
    title: string;
    avatar?: string;
  };
  sessions: LiveCourseSession[];
}

/* ═══════════════════════════════════════════════════════════════
   DEFAULT LIVE COURSE DATA (Structured Course -> Sessions)
   ═══════════════════════════════════════════════════════════════ */

export default function LiveTrainingPage() {
  const [courses, setCourses] = useState<LiveCourseProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveTraining() {
      try {
        setLoading(true);
        const res = await fetch("/api/student/live-courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data.courses) ? data.courses : []);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Failed to load live courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    loadLiveTraining();
  }, []);

  // Expanded Course in Accordion (Single course expanded or null - starts collapsed by default)
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Modal Detailed View for "View Sessions" (Deep Dive Modal)
  const [modalCourse, setModalCourse] = useState<LiveCourseProgram | null>(null);
  const [modalSessionFilter, setModalSessionFilter] = useState<"all" | "live" | "upcoming" | "completed">("all");

  // View Mode: Course View (Default) vs Calendar View
  const [primaryView, setPrimaryView] = useState<"course" | "calendar">("course");

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCourseFilter, setActiveCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "completed">("all");

  // Calendar Specific State
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "week" | "today" | "list">("month");
  const [currentDate, setCurrentDate] = useState(() => new Date("2026-08-04"));
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-08-04");

  // Secondary Modals
  const [agendaModalSession, setAgendaModalSession] = useState<LiveCourseSession | null>(null);
  const [attendanceModalCourse, setAttendanceModalCourse] = useState<LiveCourseProgram | null>(null);
  const [recordingModalSession, setRecordingModalSession] = useState<LiveCourseSession | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderNote, setReminderNote] = useState("");
  const [reminderSessionId, setReminderSessionId] = useState<string>("");
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Keyboard accessibility for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalCourse(null);
        setAgendaModalSession(null);
        setAttendanceModalCourse(null);
        setRecordingModalSession(null);
        setIsReminderModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute stats helper
  const getCourseStats = (c: LiveCourseProgram) => {
    const total = c.sessions.length;
    const completedSessions = c.sessions.filter((s) => s.status === "completed");
    const completed = completedSessions.length;
    const liveNow = c.sessions.filter((s) => s.status === "live").length;
    const upcoming = c.sessions.filter((s) => s.status === "upcoming").length;
    
    // Only calculate attendance from completed sessions that have finished
    const presentCount = completedSessions.filter(
      (s) => s.attendance?.status === "present" || s.attendance?.status === "late"
    ).length;
    const attendancePercent = completed > 0 
      ? Math.min(100, Math.round((presentCount / completed) * 100)) 
      : 100;
    const progressPercent = Math.min(100, Math.round((completed / Math.max(1, total)) * 100));
    const isLive = liveNow > 0;

    return {
      total,
      completed,
      liveNow,
      upcoming,
      presentCount,
      attendancePercent,
      progressPercent,
      isLive
    };
  };

  // Compute all sessions flat array for Calendar View & Search
  const allSessions: LiveCourseSession[] = useMemo(() => {
    return courses.flatMap((c) => c.sessions);
  }, [courses]);

  // Filtered Courses based on Search Query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter((c) => {
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchInstructor = c.instructor.name.toLowerCase().includes(q);
      const matchBatch = c.badge.toLowerCase().includes(q);
      const matchSession = c.sessions.some(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.topics.some((t) => t.toLowerCase().includes(q))
      );
      return matchTitle || matchDesc || matchInstructor || matchBatch || matchSession;
    });
  }, [courses, searchQuery]);

  // Filtered Sessions for Calendar View
  const filteredSessions = useMemo(() => {
    return allSessions.filter((s) => {
      if (activeCourseFilter !== "all" && s.courseId !== activeCourseFilter) return false;
      if (statusFilter === "live" && s.status !== "live") return false;
      if (statusFilter === "upcoming" && s.status !== "upcoming") return false;
      if (statusFilter === "completed" && s.status !== "completed") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesCourse = s.courseTitle.toLowerCase().includes(q);
        const matchesInstructor = s.instructor.name.toLowerCase().includes(q);
        const matchesTopics = s.topics.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCourse && !matchesInstructor && !matchesTopics) {
          return false;
        }
      }
      return true;
    });
  }, [allSessions, activeCourseFilter, statusFilter, searchQuery]);

  const triggerReminder = (session: LiveCourseSession) => {
    setReminderSessionId(session.id);
    setIsReminderModalOpen(true);
  };

  const handleConfirmReminder = () => {
    setIsReminderModalOpen(false);
    setReminderToast("Live Class reminder scheduled! We'll notify you 15 minutes before the session starts.");
    setTimeout(() => setReminderToast(null), 4000);
  };

  /* ────────── Calendar Calculation Helpers ────────── */
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("en-US", { month: "long" });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const pDay = daysInPrevMonth - i;
      const pMonth = month === 0 ? 11 : month - 1;
      const pYear = month === 0 ? year - 1 : year;
      const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, "0")}-${String(pDay).padStart(2, "0")}`;
      cells.push({ dayNum: pDay, dateStr, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ dayNum: d, dateStr, isCurrentMonth: true });
    }
    const totalCells = cells.length;
    const needed = totalCells > 35 ? 42 : 35;
    for (let n = 1; n <= needed - totalCells; n++) {
      const nMonth = month === 11 ? 0 : month + 1;
      const nYear = month === 11 ? year + 1 : year;
      const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
      cells.push({ dayNum: n, dateStr, isCurrentMonth: false });
    }
    return cells;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth]);

  const todayStr = "2026-08-04";

  const sessionsByDate = useMemo(() => {
    const map: Record<string, LiveCourseSession[]> = {};
    filteredSessions.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [filteredSessions]);

  const selectedDaySessions = useMemo(() => {
    return filteredSessions.filter((s) => s.date === selectedDateStr);
  }, [filteredSessions, selectedDateStr]);

  // Render a Single Session Card in the Vertical Connected Timeline
  const renderTimelineSessionCard = (session: LiveCourseSession) => {
    const isCompleted = session.status === "completed";
    const isLive = session.status === "live";
    const isUpcoming = session.status === "upcoming";

    return (
      <div key={session.id} className="relative group">
        {/* Timeline Node Icon Indicator */}
        <div
          className={`absolute -left-6 sm:-left-9 top-5 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black z-10 transition-all ${
            isLive
              ? "bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/40 animate-pulse scale-110"
              : isCompleted
              ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/20"
              : "bg-[#151b2a] text-slate-400 border-white/[0.12]"
          }`}
        >
          {isCompleted ? (
            <Check className="w-4 h-4 text-white stroke-[2.5]" />
          ) : isLive ? (
            <Radio className="w-4 h-4 animate-spin text-white" />
          ) : (
            <span className="font-mono text-[11px] font-bold text-slate-300">
              {String(session.sessionNumber).padStart(2, "0")}
            </span>
          )}
        </div>

        {/* Session Card Surface */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
            isLive
              ? "bg-gradient-to-r from-red-950/40 via-[#161220] to-[#0e1320] border-red-500/50 shadow-xl shadow-red-500/10 ring-1 ring-red-500/30"
              : isCompleted
              ? "bg-[#101524]/80 hover:bg-[#141b2e] border-white/[0.07] hover:border-emerald-500/40"
              : "bg-[#0f1422]/60 hover:bg-[#13192a] border-white/[0.06] hover:border-white/[0.12]"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left Details */}
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-mono font-black text-purple-400 uppercase tracking-wider">
                  {session.sessionCode}
                </span>
                <span className="text-white/20">•</span>

                {/* Status Badges */}
                {isCompleted && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    COMPLETED
                  </span>
                )}
                {isLive && (
                  <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black animate-pulse flex items-center gap-1 shadow-sm shadow-red-600/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE NOW
                  </span>
                )}
                {isUpcoming && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    UPCOMING
                  </span>
                )}

                {/* Attendance Indicator */}
                {session.attendance && (
                  <>
                    <span className="text-white/20">•</span>
                    {session.attendance.status === "present" && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        ✓ Present {session.attendance.timeAttended && `(${session.attendance.timeAttended})`}
                      </span>
                    )}
                    {session.attendance.status === "late" && (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        ◷ Late (Joined {session.attendance.joinedLateMinutes}m late)
                      </span>
                    )}
                    {session.attendance.status === "absent" && (
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                        × Absent
                      </span>
                    )}
                  </>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                {session.title}
              </h4>

              <p className="text-xs text-slate-400 leading-relaxed">
                {session.description}
              </p>

              <div className="flex items-center gap-3.5 flex-wrap text-xs text-slate-400 pt-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-orange-400" />
                  {isLive ? "Today" : session.date} · {session.startTime} – {session.endTime}
                </span>
                <span>•</span>
                <span>Instructor: <strong className="text-slate-200">{session.instructor.name}</strong></span>
                <span>•</span>
                <span>Duration: {session.duration}</span>
              </div>

              {/* Topic Tags */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {session.topics.map((t, ti) => (
                  <span
                    key={ti}
                    className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[10px] font-medium text-slate-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0 lg:flex-col lg:items-end">
              <button
                onClick={() => setAgendaModalSession(session)}
                className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>View Agenda</span>
              </button>

              {isLive && (
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer animate-pulse"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Live Class Now →</span>
                </a>
              )}

              {isCompleted && session.recordingUrl && (
                <button
                  onClick={() => setRecordingModalSession(session)}
                  className="px-4 py-2 bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Watch Recording</span>
                </button>
              )}

              {isCompleted && session.recordingStatus === "processing" && (
                <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400 animate-spin" /> Recording processing...
                </span>
              )}

              {isUpcoming && (
                <button
                  onClick={() => triggerReminder(session)}
                  className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Set Reminder</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto text-slate-100 space-y-8">

        {/* Global Toast Notification */}
        <AnimatePresence>
          {reminderToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-400/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{reminderToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            1. PAGE HEADER & PRIMARY VIEW TOGGLE
            ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.07] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400 shadow-sm">
                <Radio className="w-7 h-7 animate-pulse text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Live <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Training</span>
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-black flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    LIVE COHORTS
                  </span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">
                  Follow your live courses, view upcoming sessions, track attendance, and access completed recordings.
                </p>
              </div>
            </div>
          </div>

          {/* Primary View Switcher: Course View (Default) vs Calendar View */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#101626]/80 border border-white/[0.08] p-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
              <button
                onClick={() => setPrimaryView("course")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  primaryView === "course"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Course View</span>
              </button>

              <button
                onClick={() => setPrimaryView("calendar")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  primaryView === "calendar"
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Calendar View</span>
              </button>
            </div>

            <button
              onClick={() => {
                setReminderSessionId(allSessions.find(s => s.status === "upcoming")?.id || "");
                setIsReminderModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              <span>Add Reminder</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2. VIEW MODE A: ENROLLED LIVE TRAINING PROGRAMS (HORIZONTAL EXPANDABLE CARDS)
            ══════════════════════════════════════════════════════════ */}
        {primaryView === "course" && (
          <div className="space-y-7 animate-in fade-in duration-300">

            {/* Section Header & Interactive Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                  <span>Enrolled Live Training Programs ({filteredCourses.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any course below to view its complete session series, live room, and recordings.
                </p>
              </div>

              {/* Functional Search Field */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, instructors, topics..."
                  className="w-full bg-[#0e1424]/80 border border-white/[0.08] rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Horizontal Expandable Cards */}
            {filteredCourses.length === 0 ? (
              <div className="py-16 text-center space-y-3 rounded-3xl bg-[#0e1322]/50 border border-dashed border-white/[0.08]">
                <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-bold text-slate-300">No matching live training programs found</p>
                <p className="text-xs text-slate-500">Try adjusting your search keywords.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCourses.map((course) => {
                  const stats = getCourseStats(course);
                  const isExpanded = expandedCourseId === course.id;

                  return (
                    <div
                      key={course.id}
                      className={`rounded-3xl bg-[#0c111e]/90 border transition-all duration-300 shadow-xl overflow-hidden ${
                        stats.isLive
                          ? "border-red-500/40 shadow-red-500/10 ring-1 ring-red-500/20"
                          : isExpanded
                          ? "border-purple-500/40 shadow-purple-500/5 ring-1 ring-purple-500/20"
                          : "border-white/[0.08] hover:border-purple-500/30 hover:shadow-2xl"
                      }`}
                    >
                      {/* Top Horizontal Row (Image Left + Info Right) */}
                      <div className="p-6 sm:p-7 flex flex-col xl:flex-row gap-6">
                        {/* ── COURSE IMAGE (Approx 320-360px on desktop) ── */}
                        <div className="w-full xl:w-[320px] 2xl:w-[360px] h-[190px] rounded-2xl overflow-hidden relative shrink-0 border border-white/[0.08] bg-black/50 group">
                          {/* eslint-disable-next-html-element-suppression */}
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0c111e] via-[#0c111e]/40 to-transparent" />

                          {/* Top-Left Cohort Badge */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-black text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                              {course.badge}
                            </span>
                          </div>

                          {/* Top-Right Live Indicator if Live */}
                          {stats.isLive && (
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/95 text-white text-[10px] font-black animate-pulse shadow-md shadow-red-600/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              🔴 LIVE NOW
                            </div>
                          )}

                          {/* Bottom Badges */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-white drop-shadow flex items-center gap-1">
                              <Tv className="w-3.5 h-3.5 text-purple-400" />
                              {stats.total} Live Sessions
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                              {stats.attendancePercent}% Attendance
                            </span>
                          </div>
                        </div>

                        {/* ── COURSE INFORMATION ON THE RIGHT ── */}
                        <div className="flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest">
                                  {course.tagline}
                                </span>
                                <span className="text-white/20">•</span>
                                <span className="text-xs text-slate-400 font-medium">{course.badge}</span>
                              </div>

                              {stats.isLive && (
                                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                  1 session currently live
                                </span>
                              )}
                            </div>

                            <h3
                              onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                              className="text-xl sm:text-2xl font-black text-white hover:text-purple-300 transition-colors cursor-pointer leading-tight"
                            >
                              {course.title}
                            </h3>

                            <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>

                            {/* Instructor Avatar & Title */}
                            <div className="flex items-center gap-2.5 pt-1">
                              <div className="w-7 h-7 rounded-full overflow-hidden bg-purple-500/20 border border-purple-500/30 shrink-0">
                                {/* eslint-disable-next-html-element-suppression */}
                                <img
                                  src={course.instructor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                                  alt={course.instructor.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-xs text-slate-300 font-bold">
                                {course.instructor.name}
                              </span>
                              <span className="text-white/20">•</span>
                              <span className="text-xs text-slate-400 truncate max-w-[300px]">
                                {course.instructor.title}
                              </span>
                            </div>
                          </div>

                          {/* ── SEGMENTED REFINED STATISTICS ROW ── */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-[#080d1a]/80 border border-white/[0.06] rounded-2xl text-center text-xs">
                            <div className="space-y-0.5">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</div>
                              <div className="font-extrabold text-white text-sm sm:text-base font-mono">{stats.total}</div>
                            </div>
                            <div className="space-y-0.5 border-l border-white/[0.06]">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</div>
                              <div className="font-extrabold text-emerald-400 text-sm sm:text-base font-mono">{stats.completed}</div>
                            </div>
                            <div className="space-y-0.5 border-l border-white/[0.06]">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Now</div>
                              <div className="font-extrabold text-red-400 text-sm sm:text-base font-mono flex items-center justify-center gap-1">
                                {stats.liveNow > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
                                {stats.liveNow}
                              </div>
                            </div>
                            <div className="space-y-0.5 border-l border-white/[0.06]">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming</div>
                              <div className="font-extrabold text-amber-400 text-sm sm:text-base font-mono">{stats.upcoming}</div>
                            </div>
                            <div className="space-y-0.5 border-l border-white/[0.06] col-span-2 sm:col-span-1">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</div>
                              <div className="font-extrabold text-emerald-400 text-sm sm:text-base font-mono">{stats.attendancePercent}%</div>
                            </div>
                          </div>

                          {/* ── PROGRESS & ACTION ROW ── */}
                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Session Progress Bar */}
                            <div className="space-y-1.5 flex-1 max-w-md">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-400">Session Progress</span>
                                <span className="text-slate-200">{stats.completed} / {stats.total} Sessions ({stats.progressPercent}%)</span>
                              </div>
                              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${stats.progressPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Action Button: View Sessions Accordion Toggle */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              <button
                                onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                              >
                                <span>{isExpanded ? "Hide Sessions" : "View Sessions"}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-purple-200" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-purple-200" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── EXPANDED LIVE-SESSION TIMELINE (DIRECTLY INSIDE ACCORDION CARD) ── */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.28, ease: "easeInOut" }}
                            className="border-t border-white/[0.08] bg-[#090d18]/90 p-6 sm:p-8 space-y-6"
                          >
                            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-3">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-400" />
                                <h4 className="text-sm sm:text-base font-black text-white">
                                  Course Live Session Series ({course.sessions.length} Sessions)
                                </h4>
                              </div>
                              <span className="text-xs text-slate-400 font-medium">
                                Step-by-step live learning curriculum
                              </span>
                            </div>

                            {/* Vertical Connected Timeline */}
                            <div className="relative pl-6 sm:pl-9 space-y-6 before:absolute before:left-[15px] sm:before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-purple-500 before:to-slate-700/50">
                              {course.sessions.map((session) => renderTimelineSessionCard(session))}
                            </div>

                            {/* Bottom Close / Dedicated Modal Trigger */}
                            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
                              <button
                                onClick={() => setModalCourse(course)}
                                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Open Full Dedicated Session Experience →</span>
                              </button>

                              <button
                                onClick={() => setExpandedCourseId(null)}
                                className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.07] text-slate-400 hover:text-white text-xs font-semibold rounded-xl cursor-pointer"
                              >
                                Collapse Course Timeline ↑
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            3. VIEW MODE B: CALENDAR VIEW (PRESERVED)
            ══════════════════════════════════════════════════════════ */}
        {primaryView === "calendar" && (
          <div className="space-y-8 animate-in fade-in duration-300">

            {/* Filter Bar: Course Filter + Status + Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Course Filter Dropdown */}
                <div className="flex items-center gap-2 bg-[#0e1424]/80 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs font-bold text-white">
                  <Filter className="w-3.5 h-3.5 text-purple-400" />
                  <select
                    value={activeCourseFilter}
                    onChange={(e) => setActiveCourseFilter(e.target.value)}
                    className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
                  >
                    <option value="all" className="bg-[#0c111e]">All Live Courses ({courses.length})</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0c111e]">
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex items-center gap-1 bg-[#0e1424]/80 border border-white/[0.08] p-1 rounded-xl text-xs font-bold">
                  {(["all", "live", "upcoming", "completed"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                        statusFilter === st
                          ? st === "live"
                            ? "bg-red-600 text-white font-black"
                            : "bg-purple-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {st === "live" ? "🔴 Live" : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="p-2 rounded-xl bg-[#0e1424]/80 hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-sm text-white min-w-[130px] text-center font-mono">
                  {monthName} {year}
                </span>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="p-2 rounded-xl bg-[#0e1424]/80 hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid + Selected Day Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Monthly Calendar Grid */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] shadow-xl space-y-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-2 border-b border-white/[0.06]">
                  <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarCells.map((cell, idx) => {
                    const hasSessions = (sessionsByDate[cell.dateStr] || []).length;
                    const isSelected = cell.dateStr === selectedDateStr;
                    const isToday = cell.dateStr === todayStr;
                    const liveInDay = (sessionsByDate[cell.dateStr] || []).some((s) => s.status === "live");

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDateStr(cell.dateStr)}
                        className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? "border-purple-500 bg-purple-600/20 shadow-md shadow-purple-500/20"
                            : isToday
                            ? "border-orange-500/50 bg-orange-500/10"
                            : cell.isCurrentMonth
                            ? "border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05]"
                            : "border-transparent text-slate-600 opacity-40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-mono font-bold ${isSelected ? "text-purple-300" : isToday ? "text-orange-400 font-black" : "text-slate-300"}`}>
                            {cell.dayNum}
                          </span>
                          {liveInDay && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          )}
                        </div>

                        {hasSessions > 0 && (
                          <div className="space-y-1">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md truncate block ${
                              liveInDay
                                ? "bg-red-600 text-white animate-pulse"
                                : "bg-purple-500/20 text-purple-300"
                            }`}>
                              {hasSessions} {hasSessions === 1 ? "Class" : "Classes"}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 1 Col: Day Schedule */}
              <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h3 className="font-extrabold text-sm text-white">
                    Schedule for {selectedDateStr}
                  </h3>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {selectedDaySessions.length} Events
                  </span>
                </div>

                {selectedDaySessions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                    <CalendarCheck className="w-7 h-7 mx-auto text-slate-600" />
                    <p>No live classes scheduled on this day.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDaySessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-2xl border space-y-2.5 ${
                          session.status === "live"
                            ? "bg-red-950/30 border-red-500/40 shadow-sm"
                            : session.status === "completed"
                            ? "bg-white/[0.02] border-emerald-500/20"
                            : "bg-white/[0.02] border-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-purple-400 uppercase">{session.sessionCode}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            session.status === "live" ? "bg-red-600 text-white" : session.status === "completed" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                          }`}>
                            {session.status.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-white leading-snug">{session.title}</h4>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-400" /> {session.startTime} – {session.endTime}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                          <button
                            onClick={() => setAgendaModalSession(session)}
                            className="text-[11px] font-bold text-purple-400 hover:underline cursor-pointer"
                          >
                            View Agenda
                          </button>
                          {session.status === "live" && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-red-600 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                            >
                              Join Live Class
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            4. MODAL A: DEDICATED "VIEW SESSIONS" FULL-SCREEN MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {modalCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-[#0b101c] border border-white/[0.12] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative text-xs text-slate-200"
              >
                {/* Modal Header */}
                <div className="p-6 sm:p-7 border-b border-white/[0.08] bg-[#0e1424] space-y-4 shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">
                          {modalCourse.badge}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-xs text-slate-400 font-semibold">{modalCourse.tagline}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                        {modalCourse.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                        {modalCourse.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setModalCourse(null)}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filter Pills inside Modal */}
                  <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
                    {(() => {
                      const stats = getCourseStats(modalCourse);
                      return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-400 font-bold">Filter Sessions:</span>
                          {(["all", "live", "upcoming", "completed"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => setModalSessionFilter(st)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                modalSessionFilter === st
                                  ? st === "live"
                                    ? "bg-red-600 text-white font-black"
                                    : "bg-purple-600 text-white"
                                  : "bg-white/[0.04] text-slate-400 hover:text-white"
                              }`}
                            >
                              {st === "all"
                                ? `All (${stats.total})`
                                : st === "live"
                                ? `Live (${stats.liveNow})`
                                : st === "upcoming"
                                ? `Upcoming (${stats.upcoming})`
                                : `Completed (${stats.completed})`}
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    <button
                      onClick={() => {
                        const c = modalCourse;
                        setModalCourse(null);
                        setAttendanceModalCourse(c);
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>View Full Attendance Log</span>
                    </button>
                  </div>
                </div>

                {/* Modal Body: Scrollable Session Timeline */}
                <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
                  <div className="relative pl-6 sm:pl-9 space-y-6 before:absolute before:left-[15px] sm:before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-purple-500 before:to-slate-700/50">
                    {modalCourse.sessions
                      .filter((s) => modalSessionFilter === "all" || s.status === modalSessionFilter)
                      .map((session) => renderTimelineSessionCard(session))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-white/[0.08] bg-[#0e1424] flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Instructor: <strong className="text-slate-200">{modalCourse.instructor.name}</strong>
                  </span>
                  <button
                    onClick={() => setModalCourse(null)}
                    className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold rounded-xl cursor-pointer"
                  >
                    Close Modal
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            5. MODAL B: SESSION AGENDA MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {agendaModalSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                        {agendaModalSession.courseTitle}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {agendaModalSession.sessionCode}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      {agendaModalSession.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {agendaModalSession.date} · {agendaModalSession.startTime} – {agendaModalSession.endTime} ({agendaModalSession.duration})
                    </p>
                  </div>

                  <button
                    onClick={() => setAgendaModalSession(null)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Topics Covered */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Key Topics Covered</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {agendaModalSession.topics.map((t, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timed Step-by-Step Agenda */}
                <div className="space-y-3">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Live Session Timed Schedule</span>
                  <div className="space-y-3">
                    {agendaModalSession.agenda.map((ag) => (
                      <div key={ag.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center font-black text-xs shrink-0">
                          {ag.stepNumber}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-extrabold text-sm text-white">{ag.title}</h5>
                            <span className="text-[11px] font-mono font-bold text-orange-400 shrink-0">{ag.timeRange}</span>
                          </div>
                          {ag.description && (
                            <p className="text-xs text-slate-400 leading-relaxed">{ag.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructor Info */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-300">Session Instructor</p>
                      <p className="text-sm font-black text-purple-400">{agendaModalSession.instructor.name}</p>
                    </div>
                  </div>

                  {agendaModalSession.status === "live" && (
                    <a
                      href={agendaModalSession.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Live Class</span>
                    </a>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setAgendaModalSession(null)}
                    className="px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close Agenda
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            6. MODAL C: ATTENDANCE RECORD MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {attendanceModalCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl relative text-xs"
              >
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                      Live Attendance Record
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {attendanceModalCourse.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verified live class attendance history and session participation log.
                    </p>
                  </div>
                  <button
                    onClick={() => setAttendanceModalCourse(null)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Attendance Metric Bar */}
                {(() => {
                  const stats = getCourseStats(attendanceModalCourse);
                  return (
                    <div className="grid grid-cols-4 gap-3 p-4 bg-black/30 border border-white/[0.06] rounded-2xl text-center">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Attendance</div>
                        <div className="text-xl font-black text-purple-400 font-mono">{stats.attendancePercent}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Attended</div>
                        <div className="text-xl font-black text-emerald-400 font-mono">{stats.presentCount} / {stats.total}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Absent</div>
                        <div className="text-xl font-black text-rose-400 font-mono">0</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Late</div>
                        <div className="text-xl font-black text-amber-400 font-mono">1</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Session by Session Attendance List */}
                <div className="space-y-3">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Session Attendance Log</span>
                  <div className="space-y-2.5">
                    {attendanceModalCourse.sessions.map((s) => (
                      <div key={s.id} className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono font-bold text-purple-400 shrink-0">{s.sessionCode}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{s.title}</p>
                            <p className="text-[11px] text-slate-400">{s.date} · {s.duration}</p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {s.attendance?.status === "present" && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1">
                              ✓ Present {s.attendance.timeAttended && `(${s.attendance.timeAttended.split(" ")[0]})`}
                            </span>
                          )}
                          {s.attendance?.status === "late" && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold text-xs">
                              ◷ Late ({s.attendance.joinedLateMinutes}m)
                            </span>
                          )}
                          {!s.attendance && (
                            <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] text-slate-400 border border-white/[0.06] font-medium text-xs">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setAttendanceModalCourse(null)}
                    className="px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            7. MODAL D: WATCH RECORDING PLAYER MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {recordingModalSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative"
              >
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                      {recordingModalSession.courseTitle} • {recordingModalSession.sessionCode}
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {recordingModalSession.title} (Recorded Session)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Recorded on {recordingModalSession.date} with {recordingModalSession.instructor.name} ({recordingModalSession.duration})
                    </p>
                  </div>
                  <button
                    onClick={() => setRecordingModalSession(null)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Video Player Box */}
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black/90 border border-white/[0.08] relative flex items-center justify-center shadow-inner group">
                  <div className="text-center space-y-3 p-6">
                    <div className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/40 cursor-pointer transition-all hover:scale-110">
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </div>
                    <p className="text-xs font-bold text-white">Click to Play 1080p Recording</p>
                    <p className="text-[11px] text-slate-400">Includes interactive timestamps and synced transcript</p>
                  </div>
                </div>

                {/* Agenda / Chapters */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Lecture Chapters & Timestamps</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recordingModalSession.agenda.map((ag) => (
                      <div
                        key={ag.id}
                        className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-purple-500/40 transition-colors"
                      >
                        <span className="font-bold text-slate-200 truncate">{ag.title}</span>
                        <span className="font-mono text-[11px] text-purple-400 font-bold shrink-0">{ag.timeRange.split("–")[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                  <Link
                    href="/student/recorded-sessions"
                    className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <span>View all recorded sessions in library →</span>
                  </Link>
                  <button
                    onClick={() => setRecordingModalSession(null)}
                    className="px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close Player
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            8. MODAL E: ADD REMINDER MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isReminderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative text-xs"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-orange-500/15 text-orange-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base text-white">Set Live Class Reminder</h3>
                  </div>
                  <button
                    onClick={() => setIsReminderModalOpen(false)}
                    className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Select Course / Session</label>
                    <select
                      value={reminderSessionId}
                      onChange={(e) => setReminderSessionId(e.target.value)}
                      className="w-full bg-[#090d18] border border-white/[0.08] rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
                    >
                      {allSessions.filter(s => s.status === "upcoming").map(s => (
                        <option key={s.id} value={s.id} className="bg-[#090d18]">
                          {s.courseTitle}: {s.title} ({s.date})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Reminder Notes (Optional)</label>
                    <input
                      type="text"
                      value={reminderNote}
                      onChange={(e) => setReminderNote(e.target.value)}
                      placeholder="e.g. Prepare question about LangGraph state"
                      className="w-full bg-[#090d18] border border-white/[0.08] rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[11px] leading-relaxed">
                    🔔 You will receive an automated browser notification and calendar alert 15 minutes before the class begins.
                  </div>

                  <button
                    onClick={handleConfirmReminder}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Confirm Live Class Reminder</span>
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
