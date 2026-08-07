"use client";

import { useState } from "react";
import {
  Tv,
  Calendar,
  Plus,
  Search,
  Users,
  Clock,
  Video,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  X,
  Edit,
  Trash2,
  Copy,
  BarChart2,
  Download,
  PlayCircle,
  Sparkles,
  Check,
  CalendarDays,
  Radio,
  User,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface LiveSessionItem {
  id: string;
  title: string;
  courseName: string;
  batch: string;
  sessionType: "Q&A Masterclass" | "Live Workshop" | "Curriculum Lecture" | "Guest Session";
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  registeredStudentsCount: number;
  meetingUrl: string;
  status: "Waiting Confirmation" | "Accepted" | "Scheduled" | "Reschedule Requested" | "Live" | "Completed" | "Cancelled";
  ownershipType: "ADMIN_ASSIGNED" | "INSTRUCTOR_CREATED";
  assignedByAdminName?: string;
  rescheduleReason?: string;
  requestedNewDate?: string;
  requestedNewTime?: string;
  recordingUrl?: string;
  attendanceRate?: number;
  averageRating?: number;
  description?: string;
}

const INITIAL_SESSIONS: LiveSessionItem[] = [
  {
    id: "ls-1",
    title: "Agentic AI Q&A & Code Walkthrough",
    courseName: "Mastering Agentic AI & Autonomous Workflows",
    batch: "Batch AI-2026-A",
    sessionType: "Q&A Masterclass",
    date: "2026-08-08",
    time: "18:00",
    durationMinutes: 60,
    registeredStudentsCount: 24,
    meetingUrl: "https://meet.google.com/glarus-ai-masterclass",
    status: "Scheduled",
    ownershipType: "ADMIN_ASSIGNED",
    assignedByAdminName: "Academic Operations Team",
    description: "Live interactive coding session discussing multi-agent orchestration and LangGraph patterns.",
  },
  {
    id: "ls-2",
    title: "Fullstack Next.js 15 Deployment Masterclass",
    courseName: "Full-Stack Web Development Bootcamp",
    batch: "Batch FS-2026-01",
    sessionType: "Live Workshop",
    date: "2026-08-12",
    time: "19:30",
    durationMinutes: 90,
    registeredStudentsCount: 42,
    meetingUrl: "https://zoom.us/j/9948201923",
    status: "Scheduled",
    ownershipType: "INSTRUCTOR_CREATED",
    description: "Step-by-step live walkthrough of deploying serverless architectures to Vercel and AWS.",
  },
  {
    id: "ls-3",
    title: "AI Bootcamp: Multi-Agent System Architecture Review",
    courseName: "Mastering Agentic AI & Autonomous Workflows",
    batch: "Batch AI-2026-A",
    sessionType: "Q&A Masterclass",
    date: "2026-08-14",
    time: "19:00",
    durationMinutes: 90,
    registeredStudentsCount: 48,
    meetingUrl: "https://meet.google.com/glarus-ai-review",
    status: "Waiting Confirmation",
    ownershipType: "ADMIN_ASSIGNED",
    assignedByAdminName: "Academic Operations Team",
    description: "Mandatory Q&A live review assigned by platform admins for Batch AI-2026-A.",
  },
  {
    id: "ls-4",
    title: "Machine Learning Workshop: Cloud Model Deployment",
    courseName: "Mastering Agentic AI & Autonomous Workflows",
    batch: "Batch AI-2026-B",
    sessionType: "Live Workshop",
    date: "2026-08-18",
    time: "18:30",
    durationMinutes: 120,
    registeredStudentsCount: 52,
    meetingUrl: "https://zoom.us/j/9948201923",
    status: "Reschedule Requested",
    ownershipType: "ADMIN_ASSIGNED",
    assignedByAdminName: "Chief Academic Reviewer",
    rescheduleReason: "Scheduled client meeting conflict.",
    requestedNewDate: "2026-08-19",
    requestedNewTime: "18:30",
    description: "Hands-on workshop covering cloud deployment pipeline.",
  },
];

export function InstructorLiveSessionsView() {
  const [sessions, setSessions] = useState<LiveSessionItem[]>(INITIAL_SESSIONS);
  const [viewMode, setViewMode] = useState<"LIST" | "CALENDAR">("LIST");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  /* Toolbar Filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [ownershipTab, setOwnershipTab] = useState<"All" | "ADMIN_ASSIGNED" | "INSTRUCTOR_CREATED">("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  /* Action Required Drawer State */
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false);

  /* Modals */
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [rescheduleAdminSession, setRescheduleAdminSession] = useState<LiveSessionItem | null>(null);
  const [rescheduleInstructorSession, setRescheduleInstructorSession] = useState<LiveSessionItem | null>(null);
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<LiveSessionItem | null>(null);

  /* Reschedule Forms */
  const [adminReason, setAdminReason] = useState("");
  const [adminNewDate, setAdminNewDate] = useState("");
  const [adminNewTime, setAdminNewTime] = useState("18:00");

  const [instructorNewDate, setInstructorNewDate] = useState("");
  const [instructorNewTime, setInstructorNewTime] = useState("18:00");

  const [newSessionForm, setNewSessionForm] = useState({
    title: "",
    courseName: "Mastering Agentic AI & Autonomous Workflows",
    batch: "All Enrolled Students",
    sessionType: "Live Workshop" as LiveSessionItem["sessionType"],
    date: new Date().toISOString().split("T")[0],
    time: "18:00",
    durationMinutes: 60,
    meetingUrl: "https://meet.google.com/",
    description: "",
  });

  /* 4 KPI Counts for List View */
  const upcomingCount = sessions.filter(s => s.status === "Accepted" || s.status === "Scheduled" || s.status === "Waiting Confirmation").length;
  const liveNowCount = sessions.filter(s => s.status === "Live").length;
  const assignedCount = sessions.filter(s => s.ownershipType === "ADMIN_ASSIGNED").length;
  const completedCount = sessions.filter(s => s.status === "Completed").length;

  /* Calendar View KPI Stats */
  const totalSessionsCount = sessions.length;
  const totalRegistrationsCount = sessions.reduce((sum, s) => sum + s.registeredStudentsCount, 0);

  /* Action Required Sessions */
  const actionRequiredList = sessions.filter(s => s.status === "Waiting Confirmation" || s.status === "Reschedule Requested");

  /* Filtered Sessions for List View */
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.courseName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOwnership = ownershipTab === "All" || s.ownershipType === ownershipTab;
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;

    return matchesSearch && matchesOwnership && matchesStatus;
  });

  /* Calendar Filtered Sessions */
  const calendarUpcomingSessions = sessions.filter((s) => {
    if (selectedCalendarDate) {
      return s.date === selectedCalendarDate;
    }
    return s.status !== "Completed" && s.status !== "Cancelled";
  });

  /* Action Handlers */
  const handleAcceptSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "Accepted" } : s));
  };

  const handleAdminRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleAdminSession || !adminNewDate || !adminReason.trim()) return;

    setSessions(prev => prev.map(s => {
      if (s.id === rescheduleAdminSession.id) {
        return {
          ...s,
          status: "Reschedule Requested",
          requestedNewDate: adminNewDate,
          requestedNewTime: adminNewTime,
          rescheduleReason: adminReason.trim(),
        };
      }
      return s;
    }));

    setRescheduleAdminSession(null);
    setAdminReason("");
    setAdminNewDate("");
  };

  const handleInstructorRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleInstructorSession || !instructorNewDate) return;

    setSessions(prev => prev.map(s => {
      if (s.id === rescheduleInstructorSession.id) {
        return {
          ...s,
          date: instructorNewDate,
          time: instructorNewTime,
          status: "Scheduled",
        };
      }
      return s;
    }));

    setRescheduleInstructorSession(null);
    setInstructorNewDate("");
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionForm.title.trim()) return;

    const newS: LiveSessionItem = {
      id: `ls-inst-${Date.now()}`,
      title: newSessionForm.title.trim(),
      courseName: newSessionForm.courseName,
      batch: newSessionForm.batch,
      sessionType: newSessionForm.sessionType,
      date: newSessionForm.date,
      time: newSessionForm.time,
      durationMinutes: Number(newSessionForm.durationMinutes) || 60,
      registeredStudentsCount: 0,
      meetingUrl: newSessionForm.meetingUrl.trim() || "https://meet.google.com/",
      status: "Scheduled",
      ownershipType: "INSTRUCTOR_CREATED",
      description: newSessionForm.description.trim(),
    };

    setSessions([newS, ...sessions]);
    setIsScheduleModalOpen(false);
    setNewSessionForm({
      title: "",
      courseName: "Mastering Agentic AI & Autonomous Workflows",
      batch: "All Enrolled Students",
      sessionType: "Live Workshop",
      date: new Date().toISOString().split("T")[0],
      time: "18:00",
      durationMinutes: 60,
      meetingUrl: "https://meet.google.com/",
      description: "",
    });
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-24 font-sans relative">

      {/* ══════════════════════════════════════════════════════════════
         FULL CALENDAR VIEW MODE (WHEN CLICKED ON CALENDAR)
         ══════════════════════════════════════════════════════════════ */}
      {viewMode === "CALENDAR" ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Back Navigation Bar */}
          <div className="flex items-center justify-between pt-1 pb-1 border-b border-card/60">
            <button
              onClick={() => setViewMode("LIST")}
              className="px-4 py-2 bg-card hover:bg-card/80 text-text font-bold text-xs rounded-xl border border-card flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
              <span>← Back to Live Sessions List</span>
            </button>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white font-extrabold px-4 py-2 rounded-xl shadow-md shadow-primary/20 flex items-center gap-1.5 text-xs transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" /> + Schedule Session
            </button>
          </div>

          {/* Top 4 KPI Cards (Exactly as in Screenshot) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card/60 backdrop-blur-md border border-card/80 rounded-2xl p-4 shadow-md flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-subtext uppercase tracking-wider block">TOTAL SESSIONS</span>
                <span className="text-2xl font-black text-text">{totalSessionsCount}</span>
              </div>
            </div>

            <div className="bg-card/60 backdrop-blur-md border border-card/80 rounded-2xl p-4 shadow-md flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-subtext uppercase tracking-wider block">UPCOMING</span>
                <span className="text-2xl font-black text-text">{upcomingCount}</span>
              </div>
            </div>

            <div className="bg-card/60 backdrop-blur-md border border-card/80 rounded-2xl p-4 shadow-md flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-subtext uppercase tracking-wider block">LIVE NOW</span>
                <span className="text-2xl font-black text-text">{liveNowCount}</span>
              </div>
            </div>

            <div className="bg-card/60 backdrop-blur-md border border-card/80 rounded-2xl p-4 shadow-md flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-subtext uppercase tracking-wider block">TOTAL REGISTRATIONS</span>
                <span className="text-2xl font-black text-text">{totalRegistrationsCount}</span>
              </div>
            </div>
          </div>

          {/* Two Column Layout (Left: Schedule Calendar Widget, Right: Upcoming Sessions) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Schedule Calendar Card Widget */}
            <div className="bg-card/60 backdrop-blur-md border border-card/80 rounded-3xl p-5 shadow-xl h-fit space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-400" />
                  <h3 className="font-extrabold text-base text-text">Schedule Calendar</h3>
                </div>
                <span className="text-xs font-bold text-subtext">Aug 2026</span>
              </div>

              {/* Month Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold pt-2">
                {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => (
                  <span key={d} className="text-[10px] font-black text-subtext py-1">{d}</span>
                ))}
                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1;
                  const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                  const fullDate = `2026-08-${dayStr}`;
                  const hasSession = sessions.some(s => s.date === fullDate);
                  const isSelected = selectedCalendarDate === fullDate;
                  const isToday = dayNum === 5;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (isSelected) setSelectedCalendarDate(null);
                        else setSelectedCalendarDate(fullDate);
                      }}
                      className={`h-9 rounded-xl flex flex-col items-center justify-center relative text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-purple-600 text-white font-black shadow-md shadow-purple-600/30 scale-105"
                          : isToday
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                          : hasSession
                          ? "bg-purple-500 text-white font-extrabold"
                          : "hover:bg-card/80 text-subtext"
                      }`}
                    >
                      <span>{dayNum}</span>
                      {hasSession && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Footer Legend */}
              <div className="pt-4 border-t border-card/60 flex items-center justify-between text-[11px] font-bold text-subtext">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Scheduled Session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400/40" />
                    <span>Today</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-text block">2</span>
                  <span className="text-[10px] text-subtext">Aug 5</span>
                </div>
              </div>
            </div>

            {/* Right Column: Upcoming Live Sessions List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-text flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Upcoming Live Sessions ({calendarUpcomingSessions.length})
                </h3>
                {selectedCalendarDate && (
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Clear Filter ({selectedCalendarDate})
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {calendarUpcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-card/60 backdrop-blur-md border border-card/80 rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all"
                  >
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 uppercase">
                          <Clock className="w-3 h-3" /> UPCOMING
                        </span>
                        <span className="text-xs font-extrabold text-purple-400 bg-purple-500/15 px-3 py-0.5 rounded-full border border-purple-500/30">
                          {session.courseName}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-lg font-black text-text group-hover:text-purple-400 transition-colors">
                        {session.title}
                      </h4>
                      <p className="text-xs text-subtext font-medium mt-1 leading-relaxed">
                        {session.description || "Live interactive session with Q&A and code walkthroughs."}
                      </p>
                    </div>

                    {/* Footer Details & Action Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-card/80">
                      <div className="flex items-center gap-4 text-xs font-bold text-subtext flex-wrap">
                        <span className="flex items-center gap-1 text-text">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" /> {session.date}
                        </span>
                        <span className="flex items-center gap-1 text-text">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> {session.time} ({session.durationMinutes} mins)
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                          <Users className="w-3.5 h-3.5" /> {session.registeredStudentsCount} Enrolled Students
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-2 shrink-0 transition-transform hover:scale-105"
                        >
                          <Video className="w-4 h-4" /> Join / Start Live
                        </a>
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="p-2.5 text-subtext hover:text-rose-400 rounded-xl hover:bg-card border border-card/60 shrink-0"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {calendarUpcomingSessions.length === 0 && (
                  <div className="bg-card/40 border border-card rounded-2xl p-12 text-center text-subtext">
                    <Tv className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="font-extrabold text-sm text-text">No upcoming live sessions on this date</p>
                    <p className="text-xs">Select another date from the schedule calendar.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
           STANDARD MINIMAL LIVE SESSIONS LIST VIEW
           ══════════════════════════════════════════════════════════════ */
        <>
          {/* 1. HERO HEADER */}
          <div className="flex items-center justify-between pt-1 pb-1 border-b border-card/60">
            <div>
              <h1 className="text-2xl font-extrabold text-text tracking-tight flex items-center gap-2.5">
                <Tv className="w-6 h-6 text-primary" />
                Live Sessions
              </h1>
              <p className="text-xs text-subtext font-medium mt-0.5">
                Manage all live classes from one place.
              </p>
            </div>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-primary/20 flex items-center gap-1.5 text-xs transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" /> + Schedule Session
            </button>
          </div>

          {/* 2. EXACTLY 4 KPI STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Upcoming", value: upcomingCount, icon: Clock, color: "text-purple-400" },
              { label: "Live Now", value: liveNowCount, icon: Radio, color: "text-rose-400 animate-pulse" },
              { label: "Assigned", value: assignedCount, icon: ShieldAlert, color: "text-blue-400" },
              { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-emerald-400" },
            ].map((stat, i) => (
              <div key={i} className="bg-card/50 backdrop-blur-md border border-card/80 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-subtext uppercase tracking-wider block">{stat.label}</span>
                  <span className="text-xl font-black text-text mt-0.5 block">{stat.value}</span>
                </div>
                <div className="p-2 rounded-lg bg-card border border-card/60">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* 3. COMPACT ACCENT BAR FOR ACTION REQUIRED */}
          {actionRequiredList.length > 0 && (
            <div className="bg-amber-500/10 border-l-4 border-l-amber-400 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-text">
                  ⚠ Action Required ({actionRequiredList.length})
                </span>
                <span className="hidden sm:inline text-subtext">• {actionRequiredList[0].title}</span>
              </div>

              <button
                onClick={() => setIsActionDrawerOpen(!isActionDrawerOpen)}
                className="text-xs font-black text-amber-400 hover:underline flex items-center gap-1 shrink-0"
              >
                {isActionDrawerOpen ? "Hide" : "View Actions →"}
              </button>
            </div>
          )}

          {/* Collapsible Action Details */}
          <AnimatePresence>
            {isActionDrawerOpen && actionRequiredList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 bg-card/30 border border-amber-500/20 p-3 rounded-2xl"
              >
                {actionRequiredList.map(s => (
                  <div key={s.id} className="p-3 bg-card border border-card rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[9px] font-black text-blue-400 uppercase bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/20">
                        🛡 ASSIGNED BY ADMIN
                      </span>
                      <h4 className="font-extrabold text-text mt-1">{s.title}</h4>
                      <p className="text-[11px] text-subtext">{s.date} at {s.time} • {s.registeredStudentsCount} Students</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {s.status === "Waiting Confirmation" ? (
                        <>
                          <button
                            onClick={() => setRescheduleAdminSession(s)}
                            className="px-3 py-1.5 bg-card hover:bg-card/80 text-subtext font-bold text-[11px] rounded-lg border border-card"
                          >
                            Request Reschedule
                          </button>
                          <button
                            onClick={() => handleAcceptSession(s.id)}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-lg shadow-sm"
                          >
                            Accept
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-extrabold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                          Reschedule Awaiting Admin Approval
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. CLEAN TOOLBAR: TABS + STATUS DROPDOWN + SEARCH + CALENDAR TOGGLE */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/40 border border-card/80 p-2.5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "All", label: "All" },
                { id: "ADMIN_ASSIGNED", label: "Assigned by Admin" },
                { id: "INSTRUCTOR_CREATED", label: "My Sessions" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOwnershipTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    ownershipTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-subtext hover:bg-card hover:text-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Status Dropdown Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-background border border-card rounded-xl px-3 py-1.5 text-xs font-bold text-text focus:outline-none focus:border-primary"
              >
                <option value="All">Status ▼</option>
                <option value="Waiting Confirmation">Waiting Confirmation</option>
                <option value="Accepted">Accepted</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Reschedule Requested">Reschedule Requested</option>
                <option value="Live">Live Now</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-subtext absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-background border border-card rounded-xl pl-9 pr-3 py-1.5 text-xs text-text placeholder:text-subtext/60 font-medium focus:outline-none focus:border-primary"
                />
              </div>

              {/* Calendar Toggle Button */}
              <button
                onClick={() => setViewMode("CALENDAR")}
                className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all"
                title="Switch to Calendar View"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline font-extrabold">📅 Calendar</span>
              </button>
            </div>
          </div>

          {/* 5. COMPACT SESSIONS LIST WITH DISTINCT ACCENT STRIPES */}
          <div className="space-y-2.5">
            {filteredSessions.map((session) => {
              const isAdmin = session.ownershipType === "ADMIN_ASSIGNED";

              return (
                <div
                  key={session.id}
                  className={`bg-card/50 backdrop-blur-md border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:bg-card/70 ${
                    session.status === "Live"
                      ? "border-l-4 border-l-rose-500 border-rose-500/30 bg-rose-500/5"
                      : isAdmin
                      ? "border-l-4 border-l-blue-500 border-card/80 bg-blue-500/5"
                      : "border-l-4 border-l-purple-500 border-card/80 bg-purple-500/5"
                  }`}
                >
                  {/* Left Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAdmin ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded border uppercase bg-blue-500/15 text-blue-400 border-blue-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> 🛡 ASSIGNED BY ADMIN
                        </span>
                      ) : (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded border uppercase bg-purple-500/15 text-purple-400 border-purple-500/30 flex items-center gap-1">
                          <User className="w-3 h-3" /> 👤 CREATED BY YOU
                        </span>
                      )}

                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                          session.status === "Live"
                            ? "bg-rose-500 text-white animate-pulse"
                            : session.status === "Completed"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : session.status === "Waiting Confirmation"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-purple-500/15 text-purple-400 border-purple-500/30"
                        }`}
                      >
                        {session.status}
                      </span>

                      <span className="text-[11px] font-semibold text-subtext">• {session.courseName}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-text truncate">{session.title}</h3>

                    <div className="flex items-center gap-4 text-xs text-subtext font-medium pt-0.5">
                      <span className="flex items-center gap-1 text-text font-bold"><Calendar className="w-3.5 h-3.5 text-purple-400" /> {session.date} • {session.time}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-subtext" /> {session.registeredStudentsCount} Students</span>
                      {isAdmin && (
                        <span className="text-[11px] text-blue-400 font-medium">Assigned by Academic Operations</span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-card/60">
                    {session.status === "Live" ? (
                      <a
                        href={session.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Live
                      </a>
                    ) : session.status === "Completed" ? (
                      <>
                        <a
                          href={session.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Replay
                        </a>
                        <button
                          onClick={() => setSelectedSessionForDetails(session)}
                          className="px-3 py-1.5 bg-card hover:bg-card/80 text-subtext rounded-xl text-xs font-bold"
                        >
                          Analytics
                        </button>
                      </>
                    ) : isAdmin ? (
                      /* Admin Assigned Actions: Accept, Start Live, Request Reschedule */
                      session.status === "Waiting Confirmation" ? (
                        <>
                          <button
                            onClick={() => setRescheduleAdminSession(session)}
                            className="px-3 py-1.5 bg-card hover:bg-card/80 text-subtext text-xs font-bold rounded-xl border border-card"
                          >
                            Request Reschedule
                          </button>
                          <button
                            onClick={() => handleAcceptSession(session.id)}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-sm"
                          >
                            Accept
                          </button>
                        </>
                      ) : session.status === "Reschedule Requested" ? (
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
                          Awaiting Admin Approval
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => setRescheduleAdminSession(session)}
                            className="px-3 py-1.5 bg-card hover:bg-card/80 text-subtext text-xs font-bold rounded-xl border border-card"
                          >
                            Request Reschedule
                          </button>
                          <a
                            href={session.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl shadow-sm flex items-center gap-1"
                          >
                            <Video className="w-3.5 h-3.5" /> Start Live
                          </a>
                        </>
                      )
                    ) : (
                      /* Instructor Created Actions: Start Live, Edit Date, Delete */
                      <>
                        <button
                          onClick={() => setRescheduleInstructorSession(session)}
                          className="px-3 py-1.5 bg-card hover:bg-card/80 text-subtext text-xs font-bold rounded-xl border border-card"
                        >
                          Edit Date
                        </button>
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="p-2 text-subtext hover:text-rose-400 rounded-lg hover:bg-card"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl shadow-sm flex items-center gap-1"
                        >
                          <Video className="w-3.5 h-3.5" /> Start Live
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="bg-card/30 border border-card rounded-2xl p-12 text-center text-subtext">
                <Tv className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="font-extrabold text-sm text-text">No live sessions found</p>
                <p className="text-xs">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
         ADMIN RESCHEDULE REQUEST MODAL
         ══════════════════════════════════════════════════════════════ */}
      {rescheduleAdminSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-background border border-card rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-card pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-400">🛡 Admin Assigned Session</span>
                <h3 className="text-lg font-extrabold text-text">Request Reschedule</h3>
              </div>
              <button onClick={() => setRescheduleAdminSession(null)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminRescheduleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Select New Date *</label>
                  <input
                    type="date"
                    required
                    value={adminNewDate}
                    onChange={(e) => setAdminNewDate(e.target.value)}
                    className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs font-bold text-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Select New Time *</label>
                  <input
                    type="time"
                    required
                    value={adminNewTime}
                    onChange={(e) => setAdminNewTime(e.target.value)}
                    className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs font-bold text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Mandatory Reason for Admin *</label>
                <textarea
                  rows={3}
                  required
                  value={adminReason}
                  onChange={(e) => setAdminReason(e.target.value)}
                  placeholder="Explain why this admin-assigned session needs to be rescheduled..."
                  className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs font-medium text-text"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-card">
                <button type="button" onClick={() => setRescheduleAdminSession(null)} className="px-4 py-2 bg-card text-subtext rounded-xl font-bold text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-primary text-white font-extrabold text-xs rounded-xl shadow-sm">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
         INSTANT RESCHEDULE MODAL (INSTRUCTOR CREATED)
         ══════════════════════════════════════════════════════════════ */}
      {rescheduleInstructorSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-background border border-card rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-card pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-400">👤 Created by You</span>
                <h3 className="text-lg font-extrabold text-text">Reschedule Session</h3>
              </div>
              <button onClick={() => setRescheduleInstructorSession(null)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInstructorRescheduleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">New Date *</label>
                  <input
                    type="date"
                    required
                    value={instructorNewDate}
                    onChange={(e) => setInstructorNewDate(e.target.value)}
                    className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs font-bold text-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">New Time *</label>
                  <input
                    type="time"
                    required
                    value={instructorNewTime}
                    onChange={(e) => setInstructorNewTime(e.target.value)}
                    className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs font-bold text-text"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-card">
                <button type="button" onClick={() => setRescheduleInstructorSession(null)} className="px-4 py-2 bg-card text-subtext rounded-xl font-bold text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white font-extrabold text-xs rounded-xl shadow-sm">
                  Update Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
         SCHEDULE NEW SESSION MODAL (INSTRUCTOR CREATED)
         ══════════════════════════════════════════════════════════════ */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-background border border-card rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-card pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-primary">Instructor Session</span>
                <h3 className="text-lg font-extrabold text-text">Schedule Live Session</h3>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={newSessionForm.title}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, title: e.target.value })}
                  placeholder="e.g. React Masterclass: Server Actions"
                  className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs font-medium text-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newSessionForm.date}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, date: e.target.value })}
                    className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs font-bold text-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={newSessionForm.time}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, time: e.target.value })}
                    className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs font-bold text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Meeting Link *</label>
                <input
                  type="url"
                  required
                  value={newSessionForm.meetingUrl}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, meetingUrl: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs font-medium text-text"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-card">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 bg-card text-subtext rounded-xl font-bold text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-primary text-white font-extrabold text-xs rounded-xl shadow-sm">
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
         SESSION DETAILS MODAL
         ══════════════════════════════════════════════════════════════ */}
      {selectedSessionForDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-background border border-card rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-card pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-primary">Session Details</span>
                <h3 className="text-lg font-extrabold text-text">{selectedSessionForDetails.title}</h3>
              </div>
              <button onClick={() => setSelectedSessionForDetails(null)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-semibold text-subtext">
              <p><span className="text-text font-bold">Course:</span> {selectedSessionForDetails.courseName}</p>
              <p><span className="text-text font-bold">Date & Time:</span> {selectedSessionForDetails.date} at {selectedSessionForDetails.time}</p>
              <p><span className="text-text font-bold">Attendance:</span> {selectedSessionForDetails.attendanceRate || 92}%</p>
              <p><span className="text-text font-bold">Average Rating:</span> ★ {selectedSessionForDetails.averageRating || 4.8}</p>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-card">
              <button onClick={() => setSelectedSessionForDetails(null)} className="px-4 py-2 bg-card text-text rounded-xl font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
