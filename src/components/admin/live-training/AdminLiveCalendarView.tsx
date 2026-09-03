"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Radio,
  UserCheck,
  Edit3,
  ExternalLink,
  Plus,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  Globe,
  Copy,
  Sparkles,
  BookOpen,
  Users,
  CheckCircle2,
  List,
  Grid3X3,
  Columns,
  ChevronDown,
  SlidersHorizontal,
  MapPin,
  Play,
  Share2,
  CalendarCheck,
  Tag
} from "lucide-react";

type ViewType = "MONTH" | "WEEK" | "DAY" | "AGENDA";

export default function AdminLiveCalendarView() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<ViewType>("MONTH");
  const [selectedSessionModal, setSelectedSessionModal] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedInstructorFilter, setSelectedInstructorFilter] = useState("ALL");
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Kolkata (IST)");

  // Reschedule Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    newStartTime: "07:00 PM",
    newEndTime: "09:00 PM",
    reason: ""
  });
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Quick Schedule Modal
  const [quickScheduleModalOpen, setQuickScheduleModalOpen] = useState(false);
  const [quickScheduleForm, setQuickScheduleForm] = useState({
    liveCourseId: "",
    title: "",
    description: "",
    date: "",
    startTime: "07:00 PM",
    endTime: "09:00 PM",
    duration: "120 min",
    meetingUrl: "https://meet.google.com/new"
  });
  const [isQuickScheduling, setIsQuickScheduling] = useState(false);

  // Day Overflow Popover
  const [dayPopoverData, setDayPopoverData] = useState<{ date: string; sessions: any[] } | null>(null);

  // Toast / Notifications
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Meeting link copied to clipboard!", "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sessRes, courseRes, assignRes] = await Promise.allSettled([
        fetch("/api/admin/live-training/sessions"),
        fetch("/api/admin/live-training/courses"),
        fetch("/api/admin/live-training/assignments")
      ]);

      if (sessRes.status === "fulfilled" && sessRes.value.ok) {
        const data = await sessRes.value.json();
        setSessions(data.sessions || []);
      }
      if (courseRes.status === "fulfilled" && courseRes.value.ok) {
        const data = await courseRes.value.json();
        setCourses(data.courses || []);
      }
      if (assignRes.status === "fulfilled" && assignRes.value.ok) {
        const data = await assignRes.value.json();
        setInstructors(data.instructors || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch latest calendar telemetry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Search
      const matchSearch =
        !searchTerm ||
        s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.assignedInstructor?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Course
      const matchCourse =
        selectedCourseFilter === "ALL" || s.courseId === selectedCourseFilter;

      // Status
      const matchStatus =
        selectedStatusFilter === "ALL" || s.status === selectedStatusFilter;

      // Instructor
      const matchInstructor =
        selectedInstructorFilter === "ALL" ||
        s.assignedInstructor?.id === selectedInstructorFilter ||
        s.assignedInstructor?.name === selectedInstructorFilter;

      return matchSearch && matchCourse && matchStatus && matchInstructor;
    });
  }, [sessions, searchTerm, selectedCourseFilter, selectedStatusFilter, selectedInstructorFilter]);

  // Calendar Telemetry Metrics
  const metrics = useMemo(() => {
    const total = sessions.length;
    const liveNow = sessions.filter((s) => s.status === "LIVE").length;
    const completed = sessions.filter((s) => s.status === "COMPLETED").length;
    const scheduled = sessions.filter((s) => s.status === "SCHEDULED").length;

    // Upcoming this week
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);
    const thisWeek = sessions.filter((s) => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return d >= now && d <= endOfWeek;
    }).length;

    return { total, liveNow, completed, scheduled, thisWeek };
  }, [sessions]);

  // Calendar Date Navigation
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (calendarView === "MONTH") {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarView === "WEEK") {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (calendarView === "MONTH") {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarView === "WEEK") {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Grid Calculation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const dateObj = new Date(year, month - 1, dayNum);
      const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      days.push({
        date: dateObj,
        dayNum,
        isCurrentMonth: false,
        isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
        dateKey
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      days.push({
        date: dateObj,
        dayNum: i,
        isCurrentMonth: true,
        isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
        dateKey
      });
    }

    // Next month filler days (fill up to 35 or 42 grid slots)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const dateObj = new Date(year, month + 1, i);
      const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      days.push({
        date: dateObj,
        dayNum: i,
        isCurrentMonth: false,
        isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
        dateKey
      });
    }

    return days;
  }, [currentDate]);

  // Week Grid Calculation
  const weekData = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay(); // 0 is Sunday
    const firstDay = new Date(curr);
    firstDay.setDate(curr.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({
        date: d,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        isToday: new Date().toISOString().split("T")[0] === dateKey,
        isWeekend: i === 0 || i === 6,
        dateKey
      });
    }
    return days;
  }, [currentDate]);

  // Map filtered sessions to dates
  const sessionsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredSessions.forEach((sess) => {
      if (sess.date) {
        // Normalize date key to YYYY-MM-DD
        const d = new Date(sess.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (!map[key]) map[key] = [];
        map[key].push(sess);
      }
    });
    return map;
  }, [filteredSessions]);

  // Reschedule Action
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionModal || !rescheduleForm.newDate || !rescheduleForm.reason) return;

    setIsRescheduling(true);
    try {
      const res = await fetch(`/api/admin/live-training/sessions/${selectedSessionModal.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rescheduleForm)
      });

      if (res.ok) {
        setRescheduleModalOpen(false);
        setSelectedSessionModal(null);
        showToast("Live session successfully rescheduled!", "success");
        fetchData();
      } else {
        showToast("Failed to reschedule session.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to server", "error");
    } finally {
      setIsRescheduling(false);
    }
  };

  // Quick Schedule Action
  const handleQuickScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScheduleForm.liveCourseId || !quickScheduleForm.title || !quickScheduleForm.date) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setIsQuickScheduling(true);
    try {
      const res = await fetch("/api/admin/live-training/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickScheduleForm)
      });

      if (res.ok) {
        setQuickScheduleModalOpen(false);
        showToast("New live session scheduled successfully!", "success");
        setQuickScheduleForm({
          liveCourseId: "",
          title: "",
          description: "",
          date: "",
          startTime: "07:00 PM",
          endTime: "09:00 PM",
          duration: "120 min",
          meetingUrl: "https://meet.google.com/new"
        });
        fetchData();
      } else {
        showToast("Failed to schedule session.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while creating session", "error");
    } finally {
      setIsQuickScheduling(false);
    }
  };

  const openQuickScheduleForDate = (dateKey: string) => {
    setQuickScheduleForm((prev) => ({
      ...prev,
      date: dateKey,
      liveCourseId: courses[0]?.id || ""
    }));
    setQuickScheduleModalOpen(true);
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const yearNum = currentDate.getFullYear();
  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  const currentDayFormatted = currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const currentDayKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-16 text-text select-none">
      {/* ═══════════════════════════════════════════════════════════════
          TOAST NOTIFICATION
          ═══════════════════════════════════════════════════════════════ */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div
            className={`px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-2.5 text-xs font-bold ${
              toastMessage.type === "success"
                ? "bg-emerald-950/80 text-emerald-200 border-emerald-500/40 shadow-emerald-900/30"
                : toastMessage.type === "error"
                ? "bg-rose-950/80 text-rose-200 border-rose-500/40 shadow-rose-900/30"
                : "bg-purple-950/80 text-purple-200 border-purple-500/40 shadow-purple-900/30"
            }`}
          >
            {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toastMessage.type === "info" && <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TOP HEADER & TELEMETRY BANNER (COMPACT)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card/90 to-purple-950/20 border border-white/10 p-4 sm:p-5 shadow-xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                </span>
                Live Schedule Telemetry
              </span>
              <span className="text-[11px] text-subtext/60">•</span>
              <span className="text-[11px] text-subtext font-semibold flex items-center gap-1">
                <Globe className="w-3 h-3 text-indigo-400" />
                {selectedTimezone}
              </span>
              <span className="text-[11px] text-subtext/60">•</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                {metrics.liveNow > 0 ? `${metrics.liveNow} Live Workshop Now` : "Real-time Sync Active"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              Master Live Training Calendar
            </h1>
            <p className="text-xs text-subtext max-w-xl font-normal leading-relaxed">
              Schedule, monitor, and reschedule live workshop cohorts and sessions across the academy.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setQuickScheduleForm((prev) => ({
                  ...prev,
                  date: todayKey,
                  liveCourseId: courses[0]?.id || ""
                }));
                setQuickScheduleModalOpen(true);
              }}
              className="group px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-purple-600/30 transition-all duration-200 flex items-center gap-1.5 border border-purple-400/30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Session</span>
            </button>

            <Link
              href="/admin/live-training/create"
              className="px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/15 text-text hover:text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 hover:border-purple-500/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Create Cohort</span>
            </Link>

            <button
              onClick={fetchData}
              title="Refresh telemetry"
              className="p-2 rounded-xl bg-card hover:bg-card-hover border border-white/15 text-subtext hover:text-text transition-all hover:border-white/30 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-purple-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── KPI METRICS STRIP (COMPACT) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-4 pt-3.5 border-t border-white/10">
          <div className="p-2.5 sm:p-3 rounded-xl bg-background/50 border border-white/5 space-y-0.5">
            <div className="flex items-center justify-between text-subtext">
              <span className="text-[9px] font-bold uppercase tracking-wider">Total Sessions</span>
              <CalendarCheck className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-white">{metrics.total}</p>
            <p className="text-[9px] text-purple-300/80 font-semibold">{metrics.scheduled} Scheduled</p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-background/50 border border-white/5 space-y-0.5">
            <div className="flex items-center justify-between text-subtext">
              <span className="text-[9px] font-bold uppercase tracking-wider">Live Now</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-lg sm:text-xl font-black text-emerald-400">{metrics.liveNow}</p>
            <p className="text-[9px] text-emerald-300/80 font-semibold">Broadcasting now</p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-background/50 border border-white/5 space-y-0.5">
            <div className="flex items-center justify-between text-subtext">
              <span className="text-[9px] font-bold uppercase tracking-wider">This Week</span>
              <Clock className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-sky-300">{metrics.thisWeek}</p>
            <p className="text-[9px] text-sky-400/80 font-semibold">Active next 7 days</p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-background/50 border border-white/5 space-y-0.5">
            <div className="flex items-center justify-between text-subtext">
              <span className="text-[9px] font-bold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-slate-300">{metrics.completed}</p>
            <p className="text-[9px] text-slate-400 font-semibold">Recordings ready</p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-background/50 border border-white/5 space-y-0.5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-subtext">
              <span className="text-[9px] font-bold uppercase tracking-wider">Courses Active</span>
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-amber-300">{courses.length}</p>
            <p className="text-[9px] text-amber-400/80 font-semibold">{instructors.length} Instructors</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          NAVBAR & FILTER TOOLBAR (COMPACT)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-card/90 border border-white/10 shadow-lg backdrop-blur-xl space-y-3">
        {/* Row 1: Month/Date Navigation + View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Prev/Next/Date Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-background/80 border border-white/10">
              <button
                onClick={handlePrev}
                title="Previous"
                className="p-1.5 rounded-lg hover:bg-white/10 text-subtext hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                title="Next"
                className="p-1.5 rounded-lg hover:bg-white/10 text-subtext hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>
                  {calendarView === "DAY" ? currentDayFormatted : `${monthName} ${yearNum}`}
                </span>
                {calendarView === "WEEK" && (
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.2 rounded-md border border-purple-500/20">
                    Week {Math.ceil(currentDate.getDate() / 7)}
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Right: View Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-background/80 border border-white/10 text-xs font-bold self-start sm:self-auto shadow-inner">
            {(
              [
                { id: "MONTH", label: "Month", icon: Grid3X3 },
                { id: "WEEK", label: "Week", icon: Columns },
                { id: "DAY", label: "Day", icon: CalendarIcon },
                { id: "AGENDA", label: "Agenda", icon: List }
              ] as const
            ).map((tab) => {
              const IconComp = tab.icon;
              const isActive = calendarView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCalendarView(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm border border-purple-400/40"
                      : "text-subtext hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Search and Advanced Filters (Compact) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2.5 border-t border-white/10">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-subtext absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search session, topic, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 sm:h-9 pl-8 pr-7 rounded-xl bg-background/70 border border-white/10 text-xs text-white placeholder-subtext/60 focus:outline-none focus:border-purple-500/50 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtext hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Course Dropdown */}
          <div className="relative">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full h-8 sm:h-9 px-3 rounded-xl bg-background/70 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50 appearance-none font-semibold cursor-pointer"
            >
              <option value="ALL">All Cohort Tracks ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-card text-white">
                  {c.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-subtext absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full h-8 sm:h-9 px-3 rounded-xl bg-background/70 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50 appearance-none font-semibold cursor-pointer"
            >
              <option value="ALL">All Session Statuses</option>
              <option value="SCHEDULED" className="bg-card text-white">Scheduled</option>
              <option value="LIVE" className="bg-card text-white">🔴 Live Now</option>
              <option value="COMPLETED" className="bg-card text-white">✅ Completed</option>
              <option value="RESCHEDULED" className="bg-card text-white">⚠️ Rescheduled</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-subtext absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Timezone Selector */}
          <div className="relative">
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="w-full h-8 sm:h-9 px-3 rounded-xl bg-background/70 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50 appearance-none font-semibold cursor-pointer"
            >
              <option value="Asia/Kolkata (IST)">IST (UTC+05:30)</option>
              <option value="America/New_York (EST)">EST (UTC-05:00)</option>
              <option value="America/Los_Angeles (PST)">PST (UTC-08:00)</option>
              <option value="UTC (GMT)">UTC (GMT+00:00)</option>
              <option value="Asia/Singapore (SGT)">SGT (UTC+08:00)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-subtext absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 1: MONTH CALENDAR GRID (CLEAN & COMPACT PROPORTIONS)
          ═══════════════════════════════════════════════════════════════ */}
      {calendarView === "MONTH" && (
        <div className="rounded-2xl bg-card/90 border border-white/10 overflow-hidden shadow-xl backdrop-blur-xl">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-background/70 text-center py-2 text-[10px] font-black uppercase tracking-wider text-subtext">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <span key={day} className={idx === 0 || idx === 6 ? "text-purple-400/80" : ""}>
                {day}
              </span>
            ))}
          </div>

          {/* Grid Cells - Compact Min-Height */}
          <div className="grid grid-cols-7 divide-x divide-y divide-white/5">
            {monthData.map((cell, idx) => {
              const daySessions = sessionsByDate[cell.dateKey] || [];
              const isToday = cell.dateKey === todayKey;
              const hasSessions = daySessions.length > 0;

              return (
                <div
                  key={idx}
                  className={`group relative min-h-[75px] sm:min-h-[85px] p-1.5 flex flex-col justify-between transition-all duration-150 ${
                    cell.isCurrentMonth
                      ? cell.isWeekend
                        ? "bg-card/40 hover:bg-card/70"
                        : "bg-card/60 hover:bg-card/80"
                      : "bg-background/20 opacity-30 hover:opacity-75"
                  } ${isToday ? "ring-1.5 ring-inset ring-purple-500 bg-purple-950/20" : ""}`}
                >
                  {/* Top Bar: Date Number + Quick Add (+) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[11px] font-black transition-all ${
                          isToday
                            ? "w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm text-[10px]"
                            : cell.isCurrentMonth
                            ? cell.isWeekend
                              ? "text-purple-300/80"
                              : "text-white"
                            : "text-subtext/60"
                        }`}
                      >
                        {cell.dayNum}
                      </span>
                      {isToday && (
                        <span className="hidden sm:inline text-[8px] font-black uppercase text-purple-400 bg-purple-500/20 px-1 py-0.1 rounded border border-purple-500/30">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {hasSessions && (
                        <span className="text-[9px] font-black text-purple-300 bg-purple-500/15 px-1 py-0.2 rounded border border-purple-500/20">
                          {daySessions.length} {daySessions.length === 1 ? "sess" : "sess"}
                        </span>
                      )}

                      {/* Quick Add Button on Hover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickScheduleForDate(cell.dateKey);
                        }}
                        title={`Schedule session on ${cell.dateKey}`}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Middle: Sessions Chips (Compact) */}
                  <div className="space-y-1 my-1 flex-1 overflow-hidden">
                    {daySessions.slice(0, 2).map((sess) => {
                      const isLive = sess.status === "LIVE";
                      const isDone = sess.status === "COMPLETED";

                      return (
                        <button
                          key={sess.id}
                          type="button"
                          onClick={() => setSelectedSessionModal(sess)}
                          className={`w-full text-left p-1 rounded-md border transition-all group/item text-[9px] font-bold block shadow-xs cursor-pointer ${
                            isLive
                              ? "bg-rose-500/20 text-rose-200 border-rose-500/40 hover:bg-rose-500/30 animate-pulse"
                              : isDone
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/25"
                              : "bg-purple-950/40 text-purple-200 border-purple-500/30 hover:bg-purple-900/50 hover:border-purple-400/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate flex items-center gap-0.5 font-extrabold">
                              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />}
                              {isDone && <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
                              S{sess.sessionNumber}: {sess.title}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[8px] text-subtext/80 mt-0.2">
                            <span className="truncate">{sess.startTime}</span>
                            {sess.assignedInstructor?.name && (
                              <span className="truncate text-purple-300/80">
                                {sess.assignedInstructor.name.split(" ")[0]}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Overflow More Indicator */}
                    {daySessions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setDayPopoverData({ date: cell.dateKey, sessions: daySessions })}
                        className="w-full text-center py-0.2 rounded bg-white/5 hover:bg-white/10 text-[8px] font-black text-purple-300 transition-colors"
                      >
                        +{daySessions.length - 2} more
                      </button>
                    )}
                  </div>

                  <div className="h-0.5" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 2: WEEK TIMELINE GRID
          ═══════════════════════════════════════════════════════════════ */}
      {calendarView === "WEEK" && (
        <div className="rounded-3xl bg-card/90 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Week Day Header */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-background/70 divide-x divide-white/5">
            {weekData.map((d) => (
              <div
                key={d.dateKey}
                className={`py-3 px-2 text-center space-y-0.5 transition-colors ${
                  d.isToday ? "bg-purple-950/30" : ""
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-subtext">
                  {d.dayName}
                </p>
                <p
                  className={`text-sm font-black ${
                    d.isToday ? "text-purple-400" : "text-white"
                  }`}
                >
                  {d.dayNum}
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => openQuickScheduleForDate(d.dateKey)}
                    className="text-[9px] font-bold text-purple-300/80 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/20 transition-all"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Week Columns with Event Cards */}
          <div className="grid grid-cols-7 divide-x divide-white/5 min-h-[480px]">
            {weekData.map((d) => {
              const daySessions = sessionsByDate[d.dateKey] || [];

              return (
                <div
                  key={d.dateKey}
                  className={`p-2 space-y-2 flex flex-col ${
                    d.isToday ? "bg-purple-950/10" : "bg-card/40"
                  }`}
                >
                  {daySessions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-3 opacity-30 text-xs text-subtext">
                      <span>No sessions</span>
                    </div>
                  ) : (
                    daySessions.map((sess) => (
                      <div
                        key={sess.id}
                        onClick={() => setSelectedSessionModal(sess)}
                        className={`p-2.5 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-sm space-y-1.5 ${
                          sess.status === "LIVE"
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-200"
                            : sess.status === "COMPLETED"
                            ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-200"
                            : "bg-background/80 hover:bg-background border-purple-500/30 text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                            S{sess.sessionNumber}
                          </span>
                          <span className="text-[9px] font-bold text-subtext">
                            {sess.startTime}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold leading-tight line-clamp-2">
                          {sess.title}
                        </h4>

                        <p className="text-[10px] text-subtext/80 truncate">
                          {sess.courseTitle}
                        </p>

                        {sess.assignedInstructor && (
                          <div className="flex items-center gap-1.5 pt-1 border-t border-white/5 text-[10px] text-purple-300">
                            <UserCheck className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="truncate font-semibold">
                              {sess.assignedInstructor.name}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 3: DAY TIMELINE & AGENDA
          ═══════════════════════════════════════════════════════════════ */}
      {calendarView === "DAY" && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-card/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Day Schedule Telemetry
                </span>
                <span className="text-xs text-subtext">•</span>
                <span className="text-xs text-subtext font-semibold">
                  {(sessionsByDate[currentDayKey] || []).length} Scheduled Sessions
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                {currentDayFormatted}
              </h3>
            </div>

            <button
              onClick={() => openQuickScheduleForDate(currentDayKey)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Session for this Day</span>
            </button>
          </div>

          <div className="space-y-3">
            {(sessionsByDate[currentDayKey] || []).length === 0 ? (
              <div className="p-12 rounded-3xl bg-card/60 border border-white/10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Live Sessions on this Day</h4>
                <p className="text-xs text-subtext max-w-sm mx-auto">
                  Take a break or schedule a new live cohort workshop directly for this date.
                </p>
                <button
                  onClick={() => openQuickScheduleForDate(currentDayKey)}
                  className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
                >
                  + Schedule Session Now
                </button>
              </div>
            ) : (
              (sessionsByDate[currentDayKey] || []).map((sess) => (
                <div
                  key={sess.id}
                  className="p-5 rounded-3xl bg-card/90 border border-white/10 hover:border-purple-500/40 shadow-xl backdrop-blur-xl transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-sm shrink-0 shadow-inner">
                      S{sess.sessionNumber}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {sess.courseTitle}
                        </span>
                        {sess.status === "LIVE" && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                            Live Now
                          </span>
                        )}
                        {sess.status === "COMPLETED" && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Completed
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-black text-white">
                        {sess.title}
                      </h4>

                      <p className="text-xs text-subtext line-clamp-1">
                        {sess.description || "Live interactive cohort session with coding lab and live Q&A."}
                      </p>

                      <div className="flex items-center gap-4 pt-1 text-xs text-subtext flex-wrap">
                        <span className="flex items-center gap-1 text-purple-300 font-bold">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          {sess.startTime} - {sess.endTime} ({sess.duration})
                        </span>
                        <span className="flex items-center gap-1 text-text font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                          {sess.assignedInstructor?.name || "Unassigned"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                    {sess.meetingUrl && (
                      <button
                        onClick={() => copyToClipboard(sess.meetingUrl, sess.id)}
                        className="px-3.5 py-2 rounded-xl bg-background/80 hover:bg-background border border-white/10 text-xs font-bold text-subtext hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        {copiedId === sess.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === sess.id ? "Copied" : "Copy Link"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setRescheduleForm({
                          newDate: sess.date ? new Date(sess.date).toISOString().split("T")[0] : "",
                          newStartTime: sess.startTime || "07:00 PM",
                          newEndTime: sess.endTime || "09:00 PM",
                          reason: ""
                        });
                        setSelectedSessionModal(sess);
                        setRescheduleModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
                    >
                      Reschedule
                    </button>

                    <button
                      onClick={() => setSelectedSessionModal(sess)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
                    >
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 4: AGENDA / STREAM VIEW
          ═══════════════════════════════════════════════════════════════ */}
      {calendarView === "AGENDA" && (
        <div className="p-6 rounded-3xl bg-card/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black text-white">
                Upcoming Live Sessions Stream ({filteredSessions.length})
              </h3>
              <p className="text-xs text-subtext">
                Chronological list of all live classes filtered by active criteria.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredSessions.length === 0 ? (
              <div className="p-10 text-center text-xs text-subtext">
                No matching sessions found for current filters.
              </div>
            ) : (
              filteredSessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => setSelectedSessionModal(sess)}
                  className="p-4 rounded-2xl bg-background/60 hover:bg-background border border-white/5 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-300 font-black text-xs shrink-0">
                      S{sess.sessionNumber}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {sess.title}
                      </h4>
                      <p className="text-[11px] text-subtext">
                        {sess.courseTitle} • {sess.assignedInstructor?.name || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-purple-300">
                        {sess.date ? new Date(sess.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "TBA"}
                      </p>
                      <p className="text-[10px] text-subtext">
                        {sess.startTime} - {sess.endTime}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        sess.status === "LIVE"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                          : sess.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {sess.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DAY OVERFLOW POPOVER MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {dayPopoverData && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-card border border-white/15 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-400" />
                Sessions on {dayPopoverData.date}
              </h3>
              <button onClick={() => setDayPopoverData(null)} className="text-subtext hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {dayPopoverData.sessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => {
                    setDayPopoverData(null);
                    setSelectedSessionModal(sess);
                  }}
                  className="p-3 rounded-xl bg-background/60 hover:bg-background border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">S{sess.sessionNumber}: {sess.title}</span>
                    <span className="text-[10px] text-purple-300 font-bold">{sess.startTime}</span>
                  </div>
                  <p className="text-[10px] text-subtext truncate">{sess.courseTitle}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-white/10">
              <button
                onClick={() => {
                  const d = dayPopoverData.date;
                  setDayPopoverData(null);
                  openQuickScheduleForDate(d);
                }}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Session</span>
              </button>
              <button
                onClick={() => setDayPopoverData(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          QUICK SCHEDULE SESSION MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {quickScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickScheduleSubmit}
            className="w-full max-w-lg rounded-3xl bg-card border border-white/15 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Schedule Live Workshop Session
              </h3>
              <button
                type="button"
                onClick={() => setQuickScheduleModalOpen(false)}
                className="text-subtext hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-white">Target Live Course / Cohort *</label>
                <select
                  required
                  value={quickScheduleForm.liveCourseId}
                  onChange={(e) => setQuickScheduleForm({ ...quickScheduleForm, liveCourseId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">Select a Course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-card text-white">
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Session Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Transformers & Attention Mechanisms Lab"
                  value={quickScheduleForm.title}
                  onChange={(e) => setQuickScheduleForm({ ...quickScheduleForm, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief agenda or summary for learners..."
                  value={quickScheduleForm.description}
                  onChange={(e) => setQuickScheduleForm({ ...quickScheduleForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="font-bold text-white">Date *</label>
                  <input
                    type="date"
                    required
                    value={quickScheduleForm.date}
                    onChange={(e) => setQuickScheduleForm({ ...quickScheduleForm, date: e.target.value })}
                    className="w-full h-10 px-2.5 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="font-bold text-white">Start Time</label>
                  <input
                    type="text"
                    value={quickScheduleForm.startTime}
                    onChange={(e) => setQuickScheduleForm({ ...quickScheduleForm, startTime: e.target.value })}
                    className="w-full h-10 px-2.5 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="font-bold text-white">End Time</label>
                  <input
                    type="text"
                    value={quickScheduleForm.endTime}
                    onChange={(e) => setQuickScheduleForm({ ...quickScheduleForm, endTime: e.target.value })}
                    className="w-full h-10 px-2.5 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Meeting URL</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd"
                  value={quickScheduleForm.meetingUrl}
                  onChange={(e) => setQuickScheduleForm({ ...quickScheduleForm, meetingUrl: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setQuickScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isQuickScheduling}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/30"
              >
                {isQuickScheduling ? "Scheduling..." : "Create Live Session"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SESSION DETAIL MODAL / DRAWER
          ═══════════════════════════════════════════════════════════════ */}
      {selectedSessionModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-white/15 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Session {selectedSessionModal.sessionNumber}
                </span>
                <span className="text-xs text-subtext font-semibold truncate max-w-xs">
                  {selectedSessionModal.courseTitle}
                </span>
              </div>
              <button onClick={() => setSelectedSessionModal(null)} className="text-subtext hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{selectedSessionModal.title}</h3>
              <p className="text-xs text-subtext mt-1">{selectedSessionModal.description || "Interactive live session with industry expert instructor."}</p>
            </div>

            <div className="p-4 rounded-2xl bg-background/60 border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-subtext">Date & Time:</span>
                <span className="font-bold text-white">
                  {selectedSessionModal.date ? new Date(selectedSessionModal.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "TBA"}{" "}
                  ({selectedSessionModal.startTime} - {selectedSessionModal.endTime})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-subtext">Duration:</span>
                <span className="font-bold text-white">{selectedSessionModal.duration || "120 min"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-subtext">Assigned Instructor:</span>
                <span className="font-bold text-purple-300">
                  {selectedSessionModal.assignedInstructor?.name || "Unassigned"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-subtext">Meeting Link:</span>
                {selectedSessionModal.meetingUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedSessionModal.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-purple-400 hover:underline truncate max-w-[160px]"
                    >
                      {selectedSessionModal.meetingUrl}
                    </a>
                    <button
                      onClick={() => copyToClipboard(selectedSessionModal.meetingUrl, "modal")}
                      className="p-1 rounded hover:bg-white/10 text-subtext hover:text-white"
                      title="Copy meeting URL"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-subtext italic">Not yet configured</span>
                )}
              </div>
            </div>

            {/* Agenda Timeline Preview */}
            {selectedSessionModal.agenda?.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                <p className="text-[11px] font-black uppercase tracking-wider text-subtext">Agenda Timeline</p>
                {selectedSessionModal.agenda.map((ag: any, i: number) => (
                  <div key={i} className="flex justify-between p-2 rounded-xl bg-card/60 border border-white/5 text-[11px]">
                    <span className="font-bold text-white truncate">{ag.title}</span>
                    <span className="text-purple-300 font-semibold shrink-0">{ag.duration}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setRescheduleForm({
                    newDate: selectedSessionModal.date ? new Date(selectedSessionModal.date).toISOString().split("T")[0] : "",
                    newStartTime: selectedSessionModal.startTime || "07:00 PM",
                    newEndTime: selectedSessionModal.endTime || "09:00 PM",
                    reason: ""
                  });
                  setRescheduleModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
              >
                Reschedule
              </button>

              <Link
                href={`/admin/live-training/courses/${selectedSessionModal.courseId}/sessions/${selectedSessionModal.id}`}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Full Session</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          RESCHEDULE MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {rescheduleModalOpen && selectedSessionModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleRescheduleSubmit}
            className="w-full max-w-lg rounded-3xl bg-card border border-white/15 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                Reschedule Live Session
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="text-subtext hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-white">New Date *</label>
                <input
                  type="date"
                  required
                  value={rescheduleForm.newDate}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-white">New Start Time</label>
                  <input
                    type="text"
                    value={rescheduleForm.newStartTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, newStartTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white">New End Time</label>
                  <input
                    type="text"
                    value={rescheduleForm.newEndTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, newEndTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Reason for Rescheduling *</label>
                <textarea
                  rows={2}
                  required
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  placeholder="Mandatory reason for audit logs..."
                  className="w-full p-2.5 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRescheduling}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black shadow-md shadow-amber-500/30"
              >
                {isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
