"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Video,
  FileText,
  Code2,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Radio,
  X,
  AlertCircle,
  Check,
  ChevronRight,
  Laptop
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EnrolledSessionItem {
  id: string;
  sessionNumber: number;
  sessionCode: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: "LIVE_NOW" | "UPCOMING" | "COMPLETED" | "MISSED";
  isLiveNow: boolean;
  canJoin: boolean;
  attendance: "PRESENT" | "LATE" | "ABSENT" | "PENDING";
  recording: {
    status: "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "UNAVAILABLE";
    progressPercent: number;
    resumeSeconds: number;
    durationFormatted: string;
  };
  assignment?: {
    title: string;
    dueDate: string;
    status: string;
  } | null;
  agenda: string[];
  learningOutcomes: string[];
  resources?: { title: string; type: string }[];
  preparation?: string;
  project?: string | null;
}

interface EnrolledCourseData {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  instructor: {
    name: string;
    role: string;
    expertise: string;
    avatar: string;
    bio: string;
  };
  learningOutcomes: string[];
  sessions: EnrolledSessionItem[];
  certificate?: { id: string; credentialId: string | null } | null;
}

interface StudentStats {
  courseProgress: number;
  attendanceRate: number;
  attendedSessionsCount: number;
  totalSessionsCount: number;
  assignmentsSubmittedCount: number;
  totalAssignmentsCount: number;
  recordingsWatchedCount: number;
  totalRecordingsCount: number;
  certificateStatus: "ISSUED" | "READY_TO_CLAIM" | "IN_PROGRESS";
}

interface LiveCourseEnrolledViewProps {
  course: EnrolledCourseData;
  studentStats: StudentStats;
  enrollment: {
    id: string;
    batchName: string;
    enrolledAt: string;
    progress: number;
  };
  nextSession?: {
    id: string;
    sessionNumber: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    isLiveNow: boolean;
    canJoin: boolean;
  } | null;
  batch: {
    name: string;
    startDate: string;
    expectedCompletion: string;
    schedule: string;
    time: string;
    attendanceRate: number;
    totalStudents: number;
  };
}

export default function LiveCourseEnrolledView({
  course,
  studentStats,
  enrollment,
  nextSession,
  batch,
}: LiveCourseEnrolledViewProps) {
  const router = useRouter();

  // Active Session Filter in Timeline
  const [activeTimelineFilter, setActiveTimelineFilter] = useState<"ALL" | "UPCOMING" | "COMPLETED">("ALL");

  // Selected Session for Drawer
  const [selectedSessionForDrawer, setSelectedSessionForDrawer] = useState<EnrolledSessionItem | null>(null);

  // Joining loading state
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Handle Secure Live Join API
  const handleJoinLiveClass = async (sessionId: string) => {
    try {
      setJoiningSessionId(sessionId);
      setJoinError(null);

      const res = await fetch(`/api/student/live-sessions/${sessionId}/join`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Unable to join live classroom. Room may not be active yet.");
      }

      // Navigate into interactive Zoom Video SDK live room
      router.push(`/live-classes/room/${sessionId}`);
    } catch (err: any) {
      setJoinError(err.message || "Failed to join live class");
    } finally {
      setJoiningSessionId(null);
    }
  };

  const filteredSessions = course.sessions.filter((s) => {
    if (activeTimelineFilter === "UPCOMING") return s.status === "UPCOMING" || s.status === "LIVE_NOW";
    if (activeTimelineFilter === "COMPLETED") return s.status === "COMPLETED";
    return true;
  });

  const isAnySessionLiveNow = course.sessions.some((s) => s.isLiveNow);
  const currentLiveSession = course.sessions.find((s) => s.isLiveNow);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ───────── 1. Navigation & Access Unlocked Banner ───────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <Link
            href="/courses?type=live"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-primary" />
            <span>Back to Live Classes</span>
          </Link>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>COURSE PURCHASED · ACCESS UNLOCKED</span>
          </div>
        </div>

        {/* ───────── 2. Enrolled Hero & Next Live Class Section ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Course Overview */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                  {enrollment.batchName || "Enrolled Cohort"}
                </span>
                <span className="px-3 py-1 rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 text-xs font-bold">
                  {course.level}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                {course.title}
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">
                {course.description}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/70">
              <Link
                href="/student/assignments"
                className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold flex items-center gap-2 border border-border transition-all"
              >
                <Code2 className="w-4 h-4 text-purple-500" />
                <span>View Assignments</span>
              </Link>
              <Link
                href="/student/recorded-sessions"
                className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold flex items-center gap-2 border border-border transition-all"
              >
                <Video className="w-4 h-4 text-indigo-500" />
                <span>Session Recordings</span>
              </Link>
            </div>
          </div>

          {/* Right: Next Live Class Card */}
          <div className="lg:col-span-5 w-full">
            {nextSession ? (
              <div className="h-full rounded-3xl bg-gradient-to-br from-purple-900/30 via-indigo-950/20 to-card border border-purple-500/30 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden backdrop-blur-md">
                
                {/* Status Badge */}
                <div className="flex items-center justify-between gap-3">
                  {nextSession.isLiveNow ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-500/30">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      🔴 LIVE NOW
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5" />
                      NEXT LIVE CLASS
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    Session {String(nextSession.sessionNumber).padStart(2, "0")}
                  </span>
                </div>

                {/* Session Title & Schedule */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-black text-foreground">
                    {nextSession.title}
                  </h3>
                  <div className="space-y-1.5 text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>{new Date(nextSession.date).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>{nextSession.startTime} – {nextSession.endTime} ({nextSession.duration})</span>
                    </div>
                  </div>
                </div>

                {/* Join Button / View Details */}
                <div className="space-y-2 pt-2">
                  {nextSession.isLiveNow || nextSession.canJoin ? (
                    <button
                      onClick={() => handleJoinLiveClass(nextSession.id)}
                      disabled={joiningSessionId === nextSession.id}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <Radio className="w-5 h-5" />
                      <span>{joiningSessionId === nextSession.id ? "Connecting to Live Room..." : "JOIN LIVE CLASS NOW →"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const target = course.sessions.find(s => s.id === nextSession.id) || null;
                        setSelectedSessionForDrawer(target);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>View Session Agenda & Materials</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {joinError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{joinError}</span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full rounded-3xl bg-card border border-border/80 p-8 flex flex-col items-center justify-center text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <h4 className="text-base font-bold text-foreground">All Live Sessions Completed</h4>
                <p className="text-xs text-muted-foreground max-w-xs font-medium">
                  You have completed all scheduled live classes. Check your recordings and certificate status below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ───────── 3. Student Progress Summary Cards ───────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border/70 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-foreground">{studentStats.courseProgress}%</div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Course Progress</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/70 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{studentStats.attendanceRate}%</div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Attendance</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/70 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {studentStats.attendedSessionsCount} / {studentStats.totalSessionsCount}
            </div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sessions</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/70 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {studentStats.assignmentsSubmittedCount} / {studentStats.totalAssignmentsCount}
            </div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Assignments</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/70 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {studentStats.recordingsWatchedCount} / {studentStats.totalRecordingsCount}
            </div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Recordings</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/70 text-center space-y-1">
            <div className="text-sm font-black text-purple-600 dark:text-purple-400 truncate">
              {studentStats.certificateStatus === "ISSUED" ? "ISSUED" : studentStats.certificateStatus === "READY_TO_CLAIM" ? "READY" : "IN PROGRESS"}
            </div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Certificate</div>
          </div>
        </div>

        {/* ───────── 4. Private Session Timeline (YOUR LIVE SESSION SCHEDULE) ───────── */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div className="space-y-1">
              <h2 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                Enrolled Schedule
              </h2>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                Your Live Session Schedule
              </h3>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              {(["ALL", "UPCOMING", "COMPLETED"] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setActiveTimelineFilter(filterKey)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTimelineFilter === filterKey
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filterKey.charAt(0) + filterKey.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline List */}
          <div className="space-y-4">
            {filteredSessions.map((sess) => {
              return (
                <div
                  key={sess.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    sess.isLiveNow
                      ? "bg-red-500/5 border-red-500/40 shadow-lg shadow-red-900/10"
                      : sess.status === "COMPLETED"
                      ? "bg-card border-border/80"
                      : "bg-card/70 border-border/80 hover:border-purple-500/40"
                  }`}
                >
                  {/* Left: Session Number & Info */}
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono shrink-0">
                      {String(sess.sessionNumber).padStart(2, "0")}
                    </span>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base sm:text-lg font-bold text-foreground">
                          {sess.title}
                        </h4>

                        {/* Status Pills */}
                        {sess.isLiveNow && (
                          <span className="px-2.5 py-0.5 rounded-md bg-red-500 text-white text-[11px] font-black uppercase tracking-wider animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                        {sess.status === "COMPLETED" && (
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                            sess.attendance === "PRESENT"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                          }`}>
                            {sess.attendance === "PRESENT" ? "✓ Attended" : "Completed"}
                          </span>
                        )}
                        {sess.status === "UPCOMING" && !sess.isLiveNow && (
                          <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-bold border border-purple-500/20">
                            Upcoming
                          </span>
                        )}
                      </div>

                      {/* Date, Time & Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          {new Date(sess.date).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          {sess.startTime} – {sess.endTime}
                        </span>

                        {/* Recording status pill if completed */}
                        {sess.status === "COMPLETED" && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                              <Video className="w-3 h-3" /> Recording Available
                            </span>
                          </>
                        )}

                        {/* Assignment pill if present */}
                        {sess.assignment && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Code2 className="w-3 h-3" /> {sess.assignment.status === "SUBMITTED" ? "Assignment Submitted" : "Assignment Available"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {sess.isLiveNow || sess.canJoin ? (
                      <button
                        onClick={() => handleJoinLiveClass(sess.id)}
                        disabled={joiningSessionId === sess.id}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-900/20 transition-all flex items-center gap-2 cursor-pointer animate-pulse"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>{joiningSessionId === sess.id ? "Joining..." : "JOIN CLASS"}</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => setSelectedSessionForDrawer(sess)}
                      className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ───────── 5. Student Batch & Schedule Card ───────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Your Batch Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                Enrolled Cohort
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
                ACTIVE
              </span>
            </div>

            <h4 className="text-xl font-black text-foreground">{batch.name}</h4>

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground font-medium pt-2 border-t border-border/60">
              <div>
                <span className="block text-[11px] text-muted-foreground font-semibold">Start Date</span>
                <span className="text-foreground font-bold">{batch.startDate}</span>
              </div>
              <div>
                <span className="block text-[11px] text-muted-foreground font-semibold">Expected Completion</span>
                <span className="text-foreground font-bold">{batch.expectedCompletion}</span>
              </div>
              <div>
                <span className="block text-[11px] text-muted-foreground font-semibold">Days Schedule</span>
                <span className="text-foreground font-bold">{batch.schedule}</span>
              </div>
              <div>
                <span className="block text-[11px] text-muted-foreground font-semibold">Class Time</span>
                <span className="text-foreground font-bold">{batch.time}</span>
              </div>
            </div>
          </div>

          {/* Instructor & Cohort Mentorship */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-4">
            <h3 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              Lead Instructor
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                {course.instructor?.name?.charAt(0) || "I"}
              </div>
              <div>
                <h4 className="text-base font-black text-foreground">{course.instructor?.name}</h4>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">{course.instructor?.role}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{course.instructor?.expertise}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-medium leading-relaxed border-t border-border/60 pt-3">
              Have questions during the live cohort? Reach out in the private Discord cohort channel for 1-on-1 office hours and project reviews.
            </p>
          </div>
        </div>

        {/* ───────── 6. Session Detail Drawer / Modal ───────── */}
        <AnimatePresence>
          {selectedSessionForDrawer && (
            <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-xl h-full bg-background border-l border-border shadow-2xl p-6 sm:p-8 overflow-y-auto space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Drawer Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
                    <div>
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider font-mono">
                        Session {String(selectedSessionForDrawer.sessionNumber).padStart(2, "0")}
                      </span>
                      <h3 className="text-xl font-black text-foreground mt-1">
                        {selectedSessionForDrawer.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedSessionForDrawer(null)}
                      className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Schedule & Timing */}
                  <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>{new Date(selectedSessionForDrawer.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>{selectedSessionForDrawer.startTime} – {selectedSessionForDrawer.endTime} ({selectedSessionForDrawer.duration})</span>
                    </div>
                  </div>

                  {/* Live Join CTA if Live */}
                  {selectedSessionForDrawer.isLiveNow && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-wider">
                        <Radio className="w-4 h-4 animate-pulse" />
                        Class is Live Right Now
                      </div>
                      <button
                        onClick={() => handleJoinLiveClass(selectedSessionForDrawer.id)}
                        disabled={joiningSessionId === selectedSessionForDrawer.id}
                        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                      >
                        {joiningSessionId === selectedSessionForDrawer.id ? "Connecting..." : "ENTER LIVE CLASSROOM NOW →"}
                      </button>
                    </div>
                  )}

                  {/* Agenda */}
                  {selectedSessionForDrawer.agenda && selectedSessionForDrawer.agenda.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-500" />
                        Session Agenda & Topics
                      </h4>
                      <div className="space-y-2">
                        {selectedSessionForDrawer.agenda.map((ag, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-card border border-border/70 flex items-center gap-3 text-xs font-medium text-foreground"
                          >
                            <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{ag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning Outcomes */}
                  {selectedSessionForDrawer.learningOutcomes && selectedSessionForDrawer.learningOutcomes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Key Takeaways
                      </h4>
                      <ul className="space-y-2 text-xs text-muted-foreground font-medium">
                        {selectedSessionForDrawer.learningOutcomes.map((lo, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-500 font-bold">•</span>
                            <span>{lo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Resources */}
                  {selectedSessionForDrawer.resources && selectedSessionForDrawer.resources.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Session Downloads & Notebooks
                      </h4>
                      <div className="space-y-2">
                        {selectedSessionForDrawer.resources.map((res, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-card border border-border/70 flex items-center justify-between text-xs font-semibold text-foreground"
                          >
                            <span>{res.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                              {res.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => setSelectedSessionForDrawer(null)}
                    className="w-full py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-all cursor-pointer"
                  >
                    Close Session Drawer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ───────── 7. Mobile Sticky Live CTA Banner ───────── */}
        {isAnySessionLiveNow && currentLiveSession && (
          <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
            <div className="p-4 rounded-2xl bg-red-600 text-white shadow-2xl flex items-center justify-between gap-4 border border-red-400/30 animate-bounce">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider">LIVE CLASS ACTIVE</span>
              </div>
              <button
                onClick={() => handleJoinLiveClass(currentLiveSession.id)}
                className="px-4 py-2 rounded-xl bg-white text-red-600 font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                JOIN NOW →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
