"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
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
  Lock
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarEvent {
  id: string;
  title: string;
  instructor: string;
  courseTitle: string;
  batchName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  duration: string;
  status: "live" | "upcoming" | "completed" | "rescheduled";
  meetingLink: string;
  recordingUrl?: string;
  description?: string;
}

export default function LiveCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar State: Default to current date (Aug 2026 or system date)
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    // Default to August 2026 if current year is not 2026
    if (d.getFullYear() !== 2026) {
      return new Date("2026-08-04");
    }
    return d;
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date();
    if (d.getFullYear() !== 2026) return "2026-08-04";
    return d.toISOString().split("T")[0];
  });

  // Controls & Filters
  const [viewMode, setViewMode] = useState<"month" | "week" | "today" | "list">("month");
  const [activeFilter, setActiveFilter] = useState<"all" | "live" | "upcoming" | "completed" | "batch">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredDayStr, setHoveredDayStr] = useState<string | null>(null);

  // Add Reminder Modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderSubmitted, setReminderSubmitted] = useState(false);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const res = await fetch("/api/student/live-calendar");
        if (res.ok) {
          const data = await res.json();
          if (data.events) {
            setEvents(data.events);
          }
        }
      } catch (err) {
        console.error("Failed to load calendar events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarEvents();
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Filter by category
      if (activeFilter === "live" && ev.status !== "live") return false;
      if (activeFilter === "upcoming" && ev.status !== "upcoming") return false;
      if (activeFilter === "completed" && ev.status !== "completed") return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesCourse = ev.courseTitle.toLowerCase().includes(q);
        const matchesInstructor = ev.instructor.toLowerCase().includes(q);
        const matchesBatch = ev.batchName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCourse && !matchesInstructor && !matchesBatch) {
          return false;
        }
      }

      return true;
    });
  }, [events, activeFilter, searchQuery]);

  // Selected Day Events
  const selectedDayEvents = useMemo(() => {
    return filteredEvents.filter((ev) => ev.date === selectedDateStr);
  }, [filteredEvents, selectedDateStr]);

  // Calendar Calculation Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthName = currentDate.toLocaleString("en-US", { month: "long" });

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0-6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Grid Cells Generation
  const calendarCells = useMemo(() => {
    const cells = [];

    // Previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const pDay = daysInPrevMonth - i;
      const pMonth = month === 0 ? 11 : month - 1;
      const pYear = month === 0 ? year - 1 : year;
      const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, "0")}-${String(pDay).padStart(2, "0")}`;
      cells.push({
        dayNum: pDay,
        dateStr,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
      });
    }

    // Next month leading days to complete 35 or 42 grid cells
    const totalCellsSoFar = cells.length;
    const totalCellsNeeded = totalCellsSoFar > 35 ? 42 : 35;
    for (let n = 1; n <= totalCellsNeeded - totalCellsSoFar; n++) {
      const nMonth = month === 11 ? 0 : month + 1;
      const nYear = month === 11 ? year + 1 : year;
      const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
      cells.push({
        dayNum: n,
        dateStr,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth]);

  // Today Date string formatted
  const todayStr = useMemo(() => {
    const d = new Date();
    if (d.getFullYear() !== 2026) return "2026-08-04";
    return d.toISOString().split("T")[0];
  }, []);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayClick = () => {
    const today = new Date();
    const tStr = today.getFullYear() === 2026 ? today.toISOString().split("T")[0] : "2026-08-04";
    setCurrentDate(new Date("2026-08-04"));
    setSelectedDateStr(tStr);
    setViewMode("month");
  };

  // Map events to date lookup
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Helper to format date header
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateStr) return "";
    const [y, m, d] = selectedDateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedDateStr]);

  return (
    <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto text-text">
      {/* ───────── 1. HEADER SECTION ───────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-card pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-card hover:bg-card/80 border border-card text-subtext hover:text-text transition-colors text-xs font-bold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <CalendarIcon className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Live Training <span className="text-orange-500">Calendar</span>
              </h1>
              <p className="text-subtext text-sm mt-0.5">
                Manage your upcoming live sessions, interactive workshops, and recordings.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-card/80 border border-card p-1 rounded-2xl flex items-center gap-1 shadow-sm">
            {[
              { id: "today", label: "Today", action: handleTodayClick },
              { id: "month", label: "This Month", action: () => setViewMode("month") },
              { id: "week", label: "This Week", action: () => setViewMode("week") },
              { id: "list", label: "View List", action: () => setViewMode("list") },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={btn.action}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === btn.id && btn.id !== "today"
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-subtext hover:text-text hover:bg-background/50"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Reminder
          </button>
        </div>
      </div>

      {/* ───────── 2. SEARCH & FILTER BAR ───────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Sessions" },
            { id: "live", label: "🔴 Live Now" },
            { id: "upcoming", label: "🟠 Upcoming" },
            { id: "completed", label: "🟢 Completed" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                activeFilter === f.id
                  ? "bg-primary/10 border-primary text-primary shadow-sm"
                  : "bg-card/50 border-card text-subtext hover:text-text hover:border-card/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, instructor, course..."
            className="w-full bg-card/60 border border-card rounded-xl pl-10 pr-8 py-2 text-xs text-text placeholder-subtext focus:outline-none focus:border-orange-500/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ───────── 3. MAIN CONTENT LAYOUT ───────── */}
      {viewMode === "list" ? (
        /* Agenda List View */
        <div className="bg-card/40 border border-card rounded-3xl p-6 shadow-inner max-w-4xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-orange-500" /> Session Agenda List ({filteredEvents.length})
          </h3>
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-subtext">No sessions match your search or filter.</div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-background border border-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-[70px] text-center p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold text-xs">
                    <div>{ev.date}</div>
                    <div className="text-[10px] text-subtext mt-0.5">{ev.startTime}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-card text-subtext border border-card">
                      {ev.batchName}
                    </span>
                    <h4 className="font-bold text-text text-base mt-1">{ev.title}</h4>
                    <p className="text-xs text-subtext flex items-center gap-2 mt-0.5">
                      <span>Course: {ev.courseTitle}</span> • <span>Instructor: {ev.instructor}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={ev.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md ${
                    ev.status === "live"
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 animate-pulse"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  {ev.status === "live" ? "Join Live Now" : "Join Session"}
                </a>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Calendar Month / Two-Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ────── LEFT COLUMN: CALENDAR GRID (70% on desktop = 8 cols) ────── */}
          <div className="lg:col-span-8 bg-card/30 border border-card rounded-3xl p-5 lg:p-7 shadow-xl backdrop-blur-sm">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-card hover:bg-card/80 border border-card text-subtext hover:text-text transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl lg:text-2xl font-black text-text tracking-wide">
                  {monthName} <span className="text-orange-500">{year}</span>
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-card hover:bg-card/80 border border-card text-subtext hover:text-text transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-subtext">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Current Month
              </div>
            </div>

            {/* Weekday Names Header */}
            <div className="grid grid-cols-7 gap-2 mb-3 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-xs font-extrabold text-subtext uppercase tracking-wider py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell) => {
                const isSelected = cell.dateStr === selectedDateStr;
                const isToday = cell.dateStr === todayStr;
                const dayEvents = eventsByDate[cell.dateStr] || [];

                const hasLive = dayEvents.some((e) => e.status === "live");
                const hasUpcoming = dayEvents.some((e) => e.status === "upcoming");
                const hasCompleted = dayEvents.some((e) => e.status === "completed");
                const hasRescheduled = dayEvents.some((e) => e.status === "rescheduled");

                return (
                  <div
                    key={cell.dateStr}
                    relative-tooltip="true"
                    onMouseEnter={() => setHoveredDayStr(cell.dateStr)}
                    onMouseLeave={() => setHoveredDayStr(null)}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`relative group h-20 sm:h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                      !cell.isCurrentMonth
                        ? "opacity-35 border-transparent bg-background/20 hover:opacity-60"
                        : isSelected
                        ? "bg-orange-500 text-white font-extrabold border-orange-500 shadow-xl shadow-orange-500/25 ring-2 ring-orange-500/40"
                        : isToday
                        ? "border-orange-500/80 ring-2 ring-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 text-text"
                        : "bg-background/80 border-card hover:border-orange-500/50 hover:bg-card/90 text-text"
                    }`}
                  >
                    {/* Top Row: Day Number & Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm sm:text-base font-extrabold ${
                          isSelected
                            ? "text-white"
                            : isToday
                            ? "text-orange-500 font-black"
                            : cell.isCurrentMonth
                            ? "text-text"
                            : "text-subtext"
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Today Pill */}
                      {isToday && !isSelected && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          TODAY
                        </span>
                      )}
                    </div>

                    {/* Indicator Dots */}
                    <div className="flex items-center gap-1 flex-wrap mt-auto">
                      {hasLive && (
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSelected ? "bg-white shadow-sm" : "bg-red-500 animate-pulse"
                          }`}
                          title="Live Now"
                        />
                      )}
                      {hasUpcoming && (
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSelected ? "bg-white/90" : "bg-orange-500"
                          }`}
                          title="Upcoming Class"
                        />
                      )}
                      {hasCompleted && (
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSelected ? "bg-white/70" : "bg-emerald-500"
                          }`}
                          title="Completed Session"
                        />
                      )}
                      {hasRescheduled && (
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSelected ? "bg-white/70" : "bg-blue-500"
                          }`}
                          title="Rescheduled"
                        />
                      )}
                    </div>

                    {/* Rich Hover Tooltip */}
                    <AnimatePresence>
                      {hoveredDayStr === cell.dateStr && dayEvents.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 p-3 rounded-2xl bg-card border border-orange-500/30 shadow-2xl backdrop-blur-md pointer-events-none text-left"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-orange-400 border-b border-card pb-1.5 mb-2">
                            <span>{cell.dateStr}</span>
                            <span>{dayEvents.length} {dayEvents.length === 1 ? "Class" : "Classes"}</span>
                          </div>
                          <div className="space-y-1.5">
                            {dayEvents.map((e) => (
                              <div key={e.id} className="text-[11px] text-text flex items-center justify-between gap-2">
                                <span className="text-subtext font-mono text-[10px]">{e.startTime}</span>
                                <span className="font-semibold truncate">{e.title}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Calendar Legend Bar */}
            <div className="mt-8 pt-5 border-t border-card/60 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-bold text-subtext uppercase tracking-wider text-[11px]">Legend:</span>
                <span className="flex items-center gap-1.5 text-text">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> 🔴 Live Now
                </span>
                <span className="flex items-center gap-1.5 text-text">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 🟠 Upcoming
                </span>
                <span className="flex items-center gap-1.5 text-text">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 🟢 Completed
                </span>
                <span className="flex items-center gap-1.5 text-text">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 🔵 Rescheduled
                </span>
              </div>

              <span className="text-subtext font-medium">Click any date to view scheduled classes</span>
            </div>
          </div>

          {/* ────── RIGHT COLUMN: SELECTED DAY DETAILS (30% on desktop = 4 cols) ────── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card/40 border border-card rounded-3xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5 border-b border-card pb-4">
                <div>
                  <h3 className="text-xl font-black text-text">{formattedSelectedDate}</h3>
                  <p className="text-xs text-subtext mt-0.5">
                    {selectedDayEvents.length} {selectedDayEvents.length === 1 ? "Scheduled Class" : "Scheduled Classes"}
                  </p>
                </div>
                {selectedDayEvents.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
                    {selectedDayEvents.length} Active
                  </span>
                )}
              </div>

              {/* Day Events Cards List */}
              {selectedDayEvents.length === 0 ? (
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center bg-card/20 border-2 border-dashed border-card rounded-2xl">
                  <CalendarIcon className="w-12 h-12 text-subtext/30 mb-3" />
                  <p className="font-bold text-text text-base">No classes scheduled</p>
                  <p className="text-xs text-subtext mt-1 mb-5">Enjoy your free day or explore self-paced modules.</p>
                  <Link
                    href="/courses"
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    Explore Self-Paced Courses <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayEvents.map((ev) => {
                    const isLive = ev.status === "live";
                    const isUpcoming = ev.status === "upcoming";
                    const isCompleted = ev.status === "completed";
                    const isRescheduled = ev.status === "rescheduled";

                    return (
                      <div
                        key={ev.id}
                        className={`rounded-2xl p-5 border transition-all shadow-md flex flex-col justify-between gap-4 ${
                          isLive
                            ? "bg-gradient-to-br from-red-950/40 via-card to-card border-2 border-red-500/60 ring-1 ring-red-500/30 shadow-red-500/10"
                            : isUpcoming
                            ? "bg-background border-card hover:border-orange-500/40"
                            : isCompleted
                            ? "bg-card/60 border-emerald-500/30 opacity-90"
                            : "bg-card/60 border-blue-500/30 opacity-90"
                        }`}
                      >
                        {/* Status Badge & Batch */}
                        <div className="flex items-center justify-between">
                          {isLive ? (
                            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                              🔴 LIVE NOW
                            </div>
                          ) : isUpcoming ? (
                            <div className="flex items-center gap-1.5 bg-orange-500/15 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
                              <Clock className="w-3.5 h-3.5" /> UPCOMING
                            </div>
                          ) : isCompleted ? (
                            <div className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
                              <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
                              <AlertCircle className="w-3.5 h-3.5" /> RESCHEDULED
                            </div>
                          )}

                          <span className="text-[11px] font-bold text-subtext bg-card px-2.5 py-1 rounded-md border border-card">
                            {ev.batchName}
                          </span>
                        </div>

                        {/* Title & Metadata */}
                        <div>
                          <h4 className="font-extrabold text-text text-base leading-snug">{ev.title}</h4>

                          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-card/60 text-xs">
                            <div className="text-subtext flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-orange-500" />
                              <span>{ev.startTime} - {ev.endTime}</span>
                            </div>
                            <div className="text-subtext flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-accent" />
                              <span className="truncate">{ev.instructor}</span>
                            </div>
                          </div>

                          <p className="text-xs text-subtext mt-2 flex items-center gap-1.5 truncate">
                            <Tv className="w-3.5 h-3.5 text-primary" /> {ev.courseTitle}
                          </p>

                          {ev.description && (
                            <p className="text-xs text-subtext/80 mt-2 bg-card/50 p-2.5 rounded-xl border border-card/60 italic">
                              "{ev.description}"
                            </p>
                          )}
                        </div>

                        {/* Card Action Button */}
                        <div className="pt-2">
                          {isLive ? (
                            <a
                              href={ev.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-95 animate-pulse"
                            >
                              <Video className="w-4 h-4" /> Join Live Room
                            </a>
                          ) : isUpcoming ? (
                            <button
                              disabled
                              className="w-full py-2.5 bg-card/60 text-subtext/70 border border-card/80 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-not-allowed select-none opacity-80"
                              title="Class has not started yet. Join button activates when the live session starts."
                            >
                              <Lock className="w-3.5 h-3.5 opacity-60" /> Starts at {ev.startTime}
                            </button>
                          ) : isCompleted ? (
                            <a
                              href={ev.recordingUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                            >
                              <PlayCircle className="w-4 h-4" /> Watch Recording
                            </a>
                          ) : (
                            <button
                              disabled
                              className="w-full py-2.5 bg-card/60 text-subtext font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-card cursor-not-allowed"
                            >
                              <AlertCircle className="w-4 h-4" /> Rescheduled Session
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────── 4. ADD REMINDER MODAL ───────── */}
      <AnimatePresence>
        {isReminderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-card w-full max-w-md p-6 rounded-3xl shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setIsReminderModalOpen(false);
                  setReminderSubmitted(false);
                }}
                className="absolute right-4 top-4 text-subtext hover:text-text p-1.5 rounded-xl hover:bg-background/50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-text text-xl">Set Class Reminder</h3>
                  <p className="text-xs text-subtext">Add session alert to your calendar</p>
                </div>
              </div>

              {reminderSubmitted ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-text">Reminder Added Successfully!</p>
                  <p className="text-xs text-subtext">You will receive notifications before the session begins.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setReminderSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-bold text-subtext block mb-1">Select Session</label>
                    <select className="w-full bg-background border border-card rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-orange-500">
                      {filteredEvents.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.date} - {e.title} ({e.startTime})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-subtext block mb-1">Reminder Timing</label>
                    <select className="w-full bg-background border border-card rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-orange-500">
                      <option>15 Minutes Before</option>
                      <option>30 Minutes Before</option>
                      <option>1 Hour Before</option>
                      <option>1 Day Before</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all mt-2"
                  >
                    <Plus className="w-4 h-4" /> Save Reminder
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
