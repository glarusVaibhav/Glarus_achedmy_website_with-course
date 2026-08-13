"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  X,
  PlayCircle,
  Sparkles,
  Check,
  CalendarDays,
  Radio,
  Search,
  Filter,
  DollarSign,
  FileText,
  History,
  Info,
  ExternalLink,
  Lock,
  ChevronRight,
  Tv,
  Layers,
  ArrowUpRight,
  ArrowRight,
  CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type SessionStatus =
  | "Waiting Confirmation"
  | "Accepted"
  | "Reschedule Requested"
  | "Live"
  | "Completed"
  | "Cancelled";

export type PaymentStatus = "Pending" | "Approved" | "Processing" | "Paid" | "On Hold";

export interface ActivityHistoryItem {
  timestamp: string;
  event: string;
  actor: string;
  note?: string;
}

export interface LiveSessionItem {
  id: string;
  taskIdRef?: string;
  title: string;
  courseName: string;
  batch: string;
  sessionType: "Q&A Masterclass" | "Live Workshop" | "Curriculum Lecture" | "Guest Session";
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  registeredStudentsCount: number;
  meetingUrl: string;
  status: SessionStatus;
  approvalStatus: "Approved by Academic Operations" | "Approved" | "Pending Confirmation";
  assignedByAdminName: string;
  assignedAt: string;
  compensationAmount?: number;
  paymentStatus?: PaymentStatus;
  rescheduleReason?: string;
  requestedNewDate?: string;
  requestedNewTime?: string;
  recordingUrl?: string;
  attendanceRate?: number;
  averageRating?: number;
  description?: string;
  requirements?: string[];
  resources?: Array<{ label: string; url: string }>;
  activityHistory: ActivityHistoryItem[];
}

const INITIAL_APPROVED_SESSIONS: LiveSessionItem[] = [
  {
    id: "ls-1",
    taskIdRef: "TSK-1046",
    title: "Agentic AI & Code Walkthrough",
    courseName: "Mastering Agentic AI & Autonomous Workflows",
    batch: "Batch AI-2026-A",
    sessionType: "Q&A Masterclass",
    date: "Today, 10 Aug 2026",
    time: "10:45 AM – 12:00 PM",
    durationMinutes: 75,
    registeredStudentsCount: 24,
    meetingUrl: "https://meet.google.com/glarus-ai-masterclass",
    status: "Live",
    approvalStatus: "Approved by Academic Operations",
    assignedByAdminName: "Academic Operations Team",
    assignedAt: "2026-08-01",
    compensationAmount: 5000,
    paymentStatus: "Pending",
    description: "Ongoing live interactive coding session discussing multi-agent orchestration and LangGraph patterns.",
    requirements: [
      "Conduct live pair-programming and LangGraph swarm walk-through",
      "Answer student questions on memory state checkpointing",
      "Ensure live HD recording is captured for replay archive",
    ],
    resources: [
      { label: "LangGraph Starter Repo", url: "https://github.com/example/langgraph-starter" },
      { label: "Session Slide Deck", url: "https://example.com/slides/agentic-qna" },
    ],
    activityHistory: [
      { timestamp: "2026-08-01 10:00 AM", event: "Admin assigned task created", actor: "Academic Operations Team" },
      { timestamp: "2026-08-02 02:15 PM", event: "Instructor accepted task assignment", actor: "Instructor" },
      { timestamp: "2026-08-03 10:00 AM", event: "Admin approved & activated live session", actor: "Academic Operations Team" },
      { timestamp: "2026-08-10 10:45 AM", event: "Live class broadcast started", actor: "System" },
    ],
  },
  {
    id: "ls-2",
    taskIdRef: "TSK-1039",
    title: "Fullstack Next.js 15 Deployment Masterclass",
    courseName: "Full-Stack Web Development Bootcamp",
    batch: "Batch FS-2026-01",
    sessionType: "Live Workshop",
    date: "24 Aug 2026",
    time: "06:00 PM – 07:30 PM",
    durationMinutes: 90,
    registeredStudentsCount: 42,
    meetingUrl: "https://zoom.us/j/9948201923",
    status: "Accepted",
    approvalStatus: "Approved by Academic Operations",
    assignedByAdminName: "Chief Academic Reviewer",
    assignedAt: "2026-08-05",
    compensationAmount: 5000,
    paymentStatus: "Pending",
    description: "Scheduled live masterclass on deploying fullstack AI apps with server actions, Prisma, and Vercel.",
    requirements: [
      "Demonstrate live database schema migration with Prisma",
      "Walk through production deployment and environment variable security",
    ],
    resources: [
      { label: "Deployment Checklist", url: "https://example.com/docs/next15-deploy" },
    ],
    activityHistory: [
      { timestamp: "2026-08-05 09:00 AM", event: "Admin assigned task", actor: "Chief Academic Reviewer" },
      { timestamp: "2026-08-06 04:30 PM", event: "Instructor accepted assignment", actor: "Instructor" },
      { timestamp: "2026-08-07 10:00 AM", event: "Admin approved & scheduled", actor: "Chief Academic Reviewer" },
    ],
  },
  {
    id: "ls-4",
    taskIdRef: "TSK-1040",
    title: "Machine Learning Workshop: Cloud Model Deployment",
    courseName: "Applied Machine Learning & MLOps",
    batch: "Batch AI-2026-B",
    sessionType: "Live Workshop",
    date: "26 Aug 2026",
    time: "06:30 PM – 08:30 PM",
    durationMinutes: 120,
    registeredStudentsCount: 52,
    meetingUrl: "https://zoom.us/j/9948201923",
    status: "Reschedule Requested",
    approvalStatus: "Approved",
    assignedByAdminName: "Chief Academic Reviewer",
    assignedAt: "2026-08-06",
    compensationAmount: 7500,
    paymentStatus: "Pending",
    rescheduleReason: "Scheduled client meeting conflict on original slot.",
    requestedNewDate: "2026-08-27",
    requestedNewTime: "07:00 PM",
    description: "Hands-on workshop covering cloud deployment pipeline, Docker sandboxes, and vLLM GPU inference.",
    requirements: [
      "Prepare AWS / Modal inference container walk-through",
      "Walk through latency benchmarking and cost optimization",
    ],
    activityHistory: [
      { timestamp: "2026-08-06 01:00 PM", event: "Admin assigned task", actor: "Chief Academic Reviewer" },
      { timestamp: "2026-08-07 10:20 AM", event: "Instructor requested reschedule to Aug 27 at 07:00 PM", actor: "Instructor", note: "Reason: Scheduled client meeting conflict." },
    ],
  },
  {
    id: "ls-5",
    taskIdRef: "TSK-1048",
    title: "Introduction to Agentic ReAct Loops & Tools",
    courseName: "Mastering Agentic AI & Autonomous Workflows",
    batch: "Batch AI-2026-A",
    sessionType: "Curriculum Lecture",
    date: "05 Aug 2026",
    time: "10:00 AM – 12:00 PM",
    durationMinutes: 120,
    registeredStudentsCount: 45,
    meetingUrl: "https://meet.google.com/glarus-ai-react-archived",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    status: "Completed",
    approvalStatus: "Approved",
    attendanceRate: 96,
    averageRating: 4.9,
    assignedByAdminName: "Academic Operations Team",
    assignedAt: "2026-07-25",
    compensationAmount: 5000,
    paymentStatus: "Processing",
    description: "Completed foundation session on reasoning, acting loops, and custom Python tool definitions.",
    activityHistory: [
      { timestamp: "2026-07-25 10:00 AM", event: "Admin assigned task", actor: "Academic Operations Team" },
      { timestamp: "2026-07-26 12:00 PM", event: "Instructor accepted assignment", actor: "Instructor" },
      { timestamp: "2026-08-05 07:30 PM", event: "Live class completed successfully (96% attendance)", actor: "System" },
      { timestamp: "2026-08-06 11:00 AM", event: "Compensation ₹5,000 approved, processing payment", actor: "Finance Admin" },
    ],
  },
  {
    id: "ls-6",
    taskIdRef: "TSK-1049",
    title: "Vector Embeddings & Semantic Search Masterclass",
    courseName: "Agentic AI & Autonomous Workflows",
    batch: "Batch AI-2026-A",
    sessionType: "Live Workshop",
    date: "02 Aug 2026",
    time: "06:00 PM – 08:00 PM",
    durationMinutes: 120,
    registeredStudentsCount: 44,
    meetingUrl: "https://meet.google.com/glarus-ai-vectors",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    status: "Completed",
    approvalStatus: "Approved",
    attendanceRate: 92,
    averageRating: 4.8,
    assignedByAdminName: "Academic Operations Team",
    assignedAt: "2026-07-20",
    compensationAmount: 6000,
    paymentStatus: "Paid",
    description: "Deep dive into cosine similarity, HNSW indexing, and hybrid dense/sparse retrieval.",
    activityHistory: [
      { timestamp: "2026-07-20 11:00 AM", event: "Admin assigned task", actor: "Academic Operations Team" },
      { timestamp: "2026-07-21 09:15 AM", event: "Instructor accepted assignment", actor: "Instructor" },
      { timestamp: "2026-08-02 08:00 PM", event: "Live class completed successfully", actor: "System" },
      { timestamp: "2026-08-04 03:30 PM", event: "Compensation ₹6,000 paid via direct deposit", actor: "Finance Admin" },
    ],
  },
];

interface InstructorLiveSessionsViewProps {
  onNavigateTab?: (tabName: string) => void;
}

export function InstructorLiveSessionsView({ onNavigateTab }: InstructorLiveSessionsViewProps) {
  const [sessions, setSessions] = useState<LiveSessionItem[]>(INITIAL_APPROVED_SESSIONS);
  const [viewMode, setViewMode] = useState<"LIST" | "CALENDAR">("LIST");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  /* Toolbar Filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNavTab, setSelectedNavTab] = useState<string>("All");

  /* Modals & Side Drawer */
  const [rescheduleSession, setRescheduleSession] = useState<LiveSessionItem | null>(null);
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<LiveSessionItem | null>(null);

  /* Reschedule Form State */
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleNewDate, setRescheduleNewDate] = useState("");
  const [rescheduleNewTime, setRescheduleNewTime] = useState("18:00");

  /* Confirmation Success Toast State */
  const [acceptedToast, setAcceptedToast] = useState<{ title: string; date: string; time: string; compensation?: number } | null>(null);

  /* ─────────────────────────────────────────────────────────────────
     METRIC COUNTS (APPROVED LIVE SESSIONS)
     ───────────────────────────────────────────────────────────────── */
  const liveNowCount = sessions.filter(s => s.status === "Live").length;
  const upcomingCount = sessions.filter(s => s.status === "Accepted" || s.status === "Waiting Confirmation").length;
  const completedCount = sessions.filter(s => s.status === "Completed").length;

  const totalEarnings = sessions
    .filter(s => s.status === "Completed" && (s.paymentStatus === "Paid" || s.paymentStatus === "Processing"))
    .reduce((sum, s) => sum + (s.compensationAmount || 0), 0);

  /* ─────────────────────────────────────────────────────────────────
     FILTER LOGIC
     ───────────────────────────────────────────────────────────────── */
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.batch.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedNavTab === "Live Now") return s.status === "Live";
    if (selectedNavTab === "Upcoming") return s.status === "Accepted" || s.status === "Waiting Confirmation";
    if (selectedNavTab === "Reschedule Pending") return s.status === "Reschedule Requested";
    if (selectedNavTab === "Completed") return s.status === "Completed";
    return true; // "All"
  });

  /* Calendar Filtered Sessions (Read-Only) */
  const calendarSessions = sessions.filter((s) => {
    if (selectedCalendarDate) {
      return s.date.includes(selectedCalendarDate);
    }
    return s.status !== "Completed" && s.status !== "Cancelled";
  });

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleSession || !rescheduleNewDate || !rescheduleReason.trim()) return;

    const nowStr = new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    setSessions(prev =>
      prev.map(s => {
        if (s.id === rescheduleSession.id) {
          return {
            ...s,
            status: "Reschedule Requested",
            requestedNewDate: rescheduleNewDate,
            requestedNewTime: rescheduleNewTime,
            rescheduleReason: rescheduleReason.trim(),
            activityHistory: [
              ...s.activityHistory,
              {
                timestamp: nowStr,
                event: `Instructor requested reschedule to ${rescheduleNewDate} at ${rescheduleNewTime}`,
                actor: "Instructor",
                note: `Reason: ${rescheduleReason.trim()}`,
              },
            ],
          };
        }
        return s;
      })
    );

    setRescheduleSession(null);
    setRescheduleReason("");
    setRescheduleNewDate("");
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 font-sans text-slate-200">
      {/* ─────────────────────────────────────────────────────────────
         1. EXECUTIVE PAGE HEADER
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[26px] font-semibold text-white tracking-tight">
              Live Sessions
            </h1>
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              Approved Live Classes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
            Your approved and scheduled live training sessions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("Tasks")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border border-white/[0.08] transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Tasks (Workflow Hub)</span>
            </button>
          )}

          <button
            onClick={() => setViewMode(viewMode === "LIST" ? "CALENDAR" : "LIST")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-150 cursor-pointer ${
              viewMode === "CALENDAR"
                ? "bg-white/10 text-white border-white/20 shadow-sm"
                : "bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/[0.08]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{viewMode === "CALENDAR" ? "List View" : "Calendar View"}</span>
          </button>
        </div>
      </div>

      {viewMode === "CALENDAR" ? (
        /* ══════════════════════════════════════════════════════════════
           REFINED CALENDAR VIEW
           ══════════════════════════════════════════════════════════════ */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode("LIST")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to All Live Sessions
            </button>
            <span className="text-xs text-slate-400 font-mono">August 2026 Schedule</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Widget */}
            <div className="bg-[#121824]/90 border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-semibold text-sm text-slate-200">Approved Schedule</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Aug 2026</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs pt-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <span key={d} className="text-[11px] font-semibold text-slate-500 py-1">{d}</span>
                ))}
                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1;
                  const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                  const fullDate = `2026-08-${dayStr}`;
                  const hasSession = sessions.some(s => s.date.includes(dayStr));
                  const isSelected = selectedCalendarDate === dayStr;
                  const isToday = dayNum === 10;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedCalendarDate(isSelected ? null : dayStr);
                      }}
                      className={`h-8 rounded-lg flex flex-col items-center justify-center relative text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white font-semibold shadow-sm"
                          : isToday
                          ? "border border-indigo-500/50 text-indigo-300 bg-indigo-500/10"
                          : hasSession
                          ? "bg-white/[0.08] text-slate-200 font-semibold hover:bg-white/[0.12]"
                          : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                      }`}
                    >
                      <span>{dayNum}</span>
                      {hasSession && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-indigo-400 absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" /> Scheduled
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border border-indigo-400" /> Today
                  </span>
                </div>
                <span>{sessions.length} sessions</span>
              </div>
            </div>

            {/* Schedule List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Scheduled Live Sessions ({calendarSessions.length})
                </h3>
                {selectedCalendarDate && (
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {calendarSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-[#121824]/90 border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-4 transition-all duration-150 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-0.5">{session.courseName}</span>
                        <h4 className="text-sm font-semibold text-slate-100">{session.title}</h4>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-xs font-medium text-slate-300 block">{session.date}</span>
                        <span className="text-[11px] text-slate-400">{session.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                      <span className="text-slate-400">Approved • ₹{session.compensationAmount?.toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedSessionForDetails(session)}
                          className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg text-xs font-medium border border-white/[0.08] transition-colors"
                        >
                          Details
                        </button>
                        {session.status === "Live" && (
                          <a
                            href={session.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Enter Live Room
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
           STANDARD VIEW: METRICS STRIP + SESSION CARDS
           ══════════════════════════════════════════════════════════════ */
        <>
          {/* ─────────────────────────────────────────────────────────────
             2. REFINED HORIZONTAL METRICS STRIP
             ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                id: "Live Now",
                label: "LIVE NOW",
                value: liveNowCount,
                desc: "Currently active",
                accent: liveNowCount > 0 ? "text-rose-400" : "text-slate-100",
                dot: liveNowCount > 0 ? "bg-rose-500 animate-ping" : "bg-slate-600",
              },
              {
                id: "Upcoming",
                label: "UPCOMING",
                value: upcomingCount,
                desc: "Scheduled & confirmed",
                accent: "text-slate-100",
                dot: "bg-indigo-400",
              },
              {
                id: "Completed",
                label: "COMPLETED",
                value: completedCount,
                desc: "Delivered classes",
                accent: "text-slate-100",
                dot: "bg-emerald-400",
              },
              {
                id: "All",
                label: "TOTAL EARNINGS",
                value: `₹${(totalEarnings / 1000).toFixed(0)}K`,
                desc: "Live training revenue",
                accent: "text-slate-100",
                dot: "bg-emerald-500",
              },
            ].map((metric) => {
              const isSelected = selectedNavTab === metric.id && metric.id !== "All";
              return (
                <button
                  key={metric.label}
                  onClick={() => setSelectedNavTab(metric.id)}
                  className={`bg-[#121824]/90 border rounded-2xl p-4 text-left transition-all duration-150 cursor-pointer hover:border-white/[0.16] hover:bg-[#151D2C] ${
                    isSelected ? "border-indigo-500/40 bg-[#162032]" : "border-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
                      {metric.label}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${metric.dot}`} />
                  </div>
                  <div className={`text-xl sm:text-2xl font-semibold tracking-tight ${metric.accent}`}>
                    {metric.value}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-normal">
                    {metric.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────────
             3. CONTROL BAR & SEGMENTED FILTER NAVIGATION
             ───────────────────────────────────────────────────────────── */}
          <div className="bg-[#121824]/90 border border-white/[0.08] p-2 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Nav Tabs */}
            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "All", label: "All Live Sessions" },
                { id: "Live Now", label: "Live Now", count: liveNowCount, isLive: true },
                { id: "Upcoming", label: "Upcoming", count: upcomingCount },
                { id: "Reschedule Pending", label: "Reschedule Pending" },
                { id: "Completed", label: "Completed" },
              ].map((tab) => {
                const isActive = selectedNavTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedNavTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    {tab.isLive && (
                      <span className={`w-1.5 h-1.5 rounded-full ${liveNowCount > 0 ? "bg-rose-500 animate-ping" : "bg-slate-600"}`} />
                    )}
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? "bg-white/20 text-white" : "bg-white/[0.06] text-slate-400"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Input on Right */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search live sessions..."
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/[0.2] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
             4. APPROVED LIVE SESSION CARDS / ROWS
             ───────────────────────────────────────────────────────────── */}
          <div className="space-y-2.5">
            {filteredSessions.map((session) => {
              const isLive = session.status === "Live";
              const isCompleted = session.status === "Completed";
              const isReschedulePending = session.status === "Reschedule Requested";

              return (
                <div
                  key={session.id}
                  className={`border rounded-2xl p-4 sm:p-5 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCompleted
                      ? "bg-[#101520]/60 border-white/[0.04] opacity-80 hover:opacity-100 hover:bg-[#121824]"
                      : isLive
                      ? "bg-[#151421] border-rose-500/30 hover:border-rose-500/50 shadow-sm"
                      : "bg-[#121824]/90 border-white/[0.08] hover:border-white/[0.14] hover:bg-[#151D2C]"
                  }`}
                >
                  {/* LEFT: Status, Title, Course */}
                  <div className="space-y-1 min-w-0 md:max-w-[42%] flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isLive ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                            LIVE NOW
                          </span>
                        </div>
                      ) : isReschedulePending ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                          <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                            RESCHEDULE PENDING
                          </span>
                        </div>
                      ) : isCompleted ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400 text-xs font-semibold">✓</span>
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                            COMPLETED
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                            UPCOMING
                          </span>
                        </div>
                      )}

                      <span className="text-[10px] text-slate-500 font-medium">
                        • {session.approvalStatus}
                      </span>
                    </div>

                    <h3
                      onClick={() => setSelectedSessionForDetails(session)}
                      className={`text-[15px] font-semibold tracking-tight hover:text-indigo-300 transition-colors cursor-pointer ${
                        isCompleted ? "text-slate-300" : "text-white"
                      }`}
                    >
                      {session.title}
                    </h3>

                    <p className="text-xs text-slate-400 font-normal truncate">
                      {session.sessionType} • {session.courseName}
                    </p>
                  </div>

                  {/* CENTER: Date & Time, Assigned By, Compensation */}
                  <div className="text-xs text-slate-400 space-y-1 md:px-4 md:border-l md:border-white/[0.06] shrink-0">
                    <div className="font-medium text-slate-200">
                      {session.date} • {session.time}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {session.durationMinutes} mins • {session.registeredStudentsCount} enrolled
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      {session.compensationAmount && (
                        <span className="text-slate-300 font-medium">
                          Compensation ₹{session.compensationAmount.toLocaleString()}
                        </span>
                      )}
                      {session.paymentStatus && (
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                          session.paymentStatus === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : session.paymentStatus === "Processing"
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "bg-white/[0.04] text-slate-400"
                        }`}>
                          {session.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => setSelectedSessionForDetails(session)}
                      className="px-3 py-2 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
                    >
                      Details
                    </button>

                    {isLive ? (
                      <a
                        href={session.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" /> Enter Live Room
                      </a>
                    ) : isCompleted ? (
                      session.recordingUrl ? (
                        <a
                          href={session.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-slate-400" /> Replay
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500 px-2 py-1 font-medium">Delivered</span>
                      )
                    ) : isReschedulePending ? (
                      <span className="text-xs font-medium text-purple-300 bg-purple-500/10 px-3 py-2 rounded-xl border border-purple-500/20">
                        Awaiting Admin Approval
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => setRescheduleSession(session)}
                          className="px-3 py-2 bg-white/[0.03] hover:bg-white/[0.07] text-slate-400 hover:text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                        >
                          Reschedule
                        </button>
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" /> Start Live
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {filteredSessions.length === 0 && (
              <div className="bg-[#121824]/60 border border-white/[0.08] rounded-2xl p-12 text-center text-slate-400 space-y-2">
                <Tv className="w-8 h-8 mx-auto text-slate-600 stroke-[1.5]" />
                <h4 className="font-medium text-sm text-slate-300">No active live sessions</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Approved live training sessions will appear here once they are assigned by Admin and approved.
                </p>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab("Tasks")}
                    className="mt-3 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Check Assigned Tasks Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
         5. "DETAILS" SIDE DRAWER
         ───────────────────────────────────────────────────────────── */}
      {selectedSessionForDetails && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div className="bg-[#101520] border-l border-white/[0.08] w-full max-w-lg h-full p-6 sm:p-7 overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Approved Session
                  </span>
                  {selectedSessionForDetails.taskIdRef && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      Source: Task #{selectedSessionForDetails.taskIdRef}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mt-1 leading-snug">
                  {selectedSessionForDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSessionForDetails(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.06] transition-colors cursor-pointer shrink-0 ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Two-Column Clean Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Course</span>
                <p className="font-medium text-slate-200">{selectedSessionForDetails.courseName}</p>
                <p className="text-[11px] text-indigo-400 font-mono">{selectedSessionForDetails.batch}</p>
              </div>

              <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Date & Time</span>
                <p className="font-medium text-slate-200">{selectedSessionForDetails.date}</p>
                <p className="text-[11px] text-slate-400">{selectedSessionForDetails.time} ({selectedSessionForDetails.durationMinutes}m)</p>
              </div>

              <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Approval Status</span>
                <p className="font-medium text-emerald-400">{selectedSessionForDetails.approvalStatus}</p>
                <p className="text-[11px] text-slate-400">{selectedSessionForDetails.sessionType}</p>
              </div>

              <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Compensation</span>
                <p className="font-semibold text-slate-200">
                  ₹{selectedSessionForDetails.compensationAmount?.toLocaleString() || "5,000"}
                </p>
                <p className="text-[11px] text-emerald-400 font-medium">Status: {selectedSessionForDetails.paymentStatus}</p>
              </div>
            </div>

            {/* Description */}
            {selectedSessionForDetails.description && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Notes & Objective</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                  {selectedSessionForDetails.description}
                </p>
              </div>
            )}

            {/* Teaching Requirements Checklist */}
            {selectedSessionForDetails.requirements && selectedSessionForDetails.requirements.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Key Objectives</span>
                <div className="space-y-1.5">
                  {selectedSessionForDetails.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Link Endpoint */}
            <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between gap-3">
              <div className="truncate">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Room URL</span>
                <p className="text-xs font-mono text-slate-300 truncate">{selectedSessionForDetails.meetingUrl}</p>
              </div>
              <a
                href={selectedSessionForDetails.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Launch
              </a>
            </div>

            {/* Activity History Timeline */}
            <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Activity & Approval Timeline</span>
              </div>
              <div className="space-y-2.5">
                {selectedSessionForDetails.activityHistory.map((act, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-200">{act.event}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {act.timestamp} • {act.actor}
                      </div>
                      {act.note && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">{act.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Close Action */}
            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setSelectedSessionForDetails(null)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         6. "REQUEST RESCHEDULE" MODAL
         ───────────────────────────────────────────────────────────── */}
      {rescheduleSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div className="bg-[#121824] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-semibold uppercase text-indigo-400">Schedule Change</span>
                <h3 className="text-base font-semibold text-white">Request Session Reschedule</h3>
              </div>
              <button
                onClick={() => setRescheduleSession(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/[0.04] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Schedule Summary */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Current Schedule</span>
              <p className="font-semibold text-slate-200">{rescheduleSession.title}</p>
              <p className="text-slate-400">{rescheduleSession.date} • {rescheduleSession.time}</p>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleNewDate}
                    onChange={(e) => setRescheduleNewDate(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Time *</label>
                  <input
                    type="time"
                    required
                    value={rescheduleNewTime}
                    onChange={(e) => setRescheduleNewTime(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Describe why this assigned time slot needs to be rescheduled..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Reschedule requests will be reviewed and confirmed by Academic Operations.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setRescheduleSession(null)}
                  className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-xl font-medium text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
