"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  PlayCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  Tv,
  CheckCircle,
  FileText,
  Lock,
  Layers,
  GraduationCap,
  Play,
  Flame,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { formatDate, formatTime, parseDate } from "@/lib/dateTime";

export interface LiveClassItem {
  id: string;
  title: string;
  date: string;
  meetingLink: string;
  status: "ONGOING" | "UPCOMING" | string;
  courseTitle: string;
  instructor: any;
  batchName: string;
  duration?: string;
  prerequisites?: string;
  agenda?: string[];
  takeaways?: string[];
  thumbnail?: string;
}

export interface SelfPacedCourse {
  id: string;
  title: string;
  instructor: any;
  progress: number;
  totalLectures: number;
  completedLectures: number;
  lastWatchedLecture: string | null;
  lastAccessedAt?: string | null;
  hasActiveStudy?: boolean;
  studyTimestamp?: number;
  status: string;
  thumbnail?: string;
}

interface YourLearningSectionProps {
  liveClasses: LiveClassItem[];
  selfPaced: SelfPacedCourse[];
  onOpenAgenda: (item: LiveClassItem) => void;
  onOpenEnrolledHub?: () => void;
  getInstructorName: (instructor: any) => string;
}

export function YourLearningSection({
  liveClasses,
  selfPaced,
  onOpenAgenda,
  onOpenEnrolledHub,
  getInstructorName,
}: YourLearningSectionProps) {
  const router = useRouter();

  // -------------------------------------------------------------
  // 1. LIVE SESSION SELECTION LOGIC
  // Priority 1: Currently Live Class (ONGOING / LIVE)
  // Priority 2: Most Recent Upcoming Class
  // Priority 3: Empty State (null)
  // -------------------------------------------------------------
  const currentlyLiveSession = liveClasses.find(
    (c) =>
      c.status === "ONGOING" ||
      (c as any).status === "LIVE" ||
      (c as any).status === "LIVE_NOW"
  );

  const upcomingSessions = liveClasses.filter(
    (c) => c.status === "UPCOMING" || c.status !== "ONGOING"
  );

  const mostRecentUpcomingSession =
    upcomingSessions.length > 0
      ? [...upcomingSessions].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0]
      : !currentlyLiveSession && liveClasses.length > 0
      ? liveClasses[0]
      : null;

  const displayLiveSession =
    currentlyLiveSession ?? mostRecentUpcomingSession ?? null;
  const isLiveNow = Boolean(
    currentlyLiveSession && displayLiveSession?.id === currentlyLiveSession.id
  );

  // Parse session date / time details
  const sessionDate = displayLiveSession
    ? parseDate(displayLiveSession.date) || new Date(displayLiveSession.date)
    : null;

  const now = new Date();
  const isToday = sessionDate
    ? sessionDate.getDate() === now.getDate() &&
      sessionDate.getMonth() === now.getMonth() &&
      sessionDate.getFullYear() === now.getFullYear()
    : false;

  const isTomorrow = sessionDate
    ? (() => {
        const tom = new Date(now);
        tom.setDate(tom.getDate() + 1);
        return (
          sessionDate.getDate() === tom.getDate() &&
          sessionDate.getMonth() === tom.getMonth() &&
          sessionDate.getFullYear() === tom.getFullYear()
        );
      })()
    : false;

  const liveDateFormatted = isToday
    ? `Today · ${sessionDate ? formatTime(sessionDate) : ""}`
    : isTomorrow
    ? `Tomorrow · ${sessionDate ? formatTime(sessionDate) : ""}`
    : sessionDate
    ? `${formatDate(sessionDate)} · ${formatTime(sessionDate)}`
    : "";

  const liveCourseImage = displayLiveSession
    ? displayLiveSession.thumbnail ||
      (displayLiveSession.courseTitle.toLowerCase().includes("generative ai") ||
      displayLiveSession.courseTitle.toLowerCase().includes("genai")
        ? "/images/courses/generative-ai.png"
        : displayLiveSession.courseTitle.toLowerCase().includes("machine learning") ||
          displayLiveSession.courseTitle.toLowerCase().includes("ml")
        ? "/images/courses/ml-math.png"
        : displayLiveSession.courseTitle.toLowerCase().includes("python")
        ? "/images/courses/python-fundamentals.png"
        : "/images/courses/rag-vector-db.png")
    : null;

  // -------------------------------------------------------------
  // 2. SELF-PACED COURSE SELECTION LOGIC
  // Displays the LAST / MOST RECENT course the student was studying
  // -------------------------------------------------------------
  const sortedByLastStudied = [...selfPaced].sort((a, b) => {
    // 1. Actively studied courses come first (highest study timestamp)
    if (a.hasActiveStudy && b.hasActiveStudy) {
      return (b.studyTimestamp || 0) - (a.studyTimestamp || 0);
    }
    if (a.hasActiveStudy) return -1;
    if (b.hasActiveStudy) return 1;

    // 2. In-progress courses (0 < progress < 100) before unstarted courses
    const inProgA = (a.progress || 0) > 0 && (a.progress || 0) < 100 ? 1 : 0;
    const inProgB = (b.progress || 0) > 0 && (b.progress || 0) < 100 ? 1 : 0;
    if (inProgA !== inProgB) return inProgB - inProgA;

    // 3. Last accessed timestamp
    const timeA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
    const timeB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;

    const hasLastWatchedA = Boolean(a.lastWatchedLecture);
    const hasLastWatchedB = Boolean(b.lastWatchedLecture);
    if (hasLastWatchedA !== hasLastWatchedB) return hasLastWatchedB ? 1 : -1;
    return (b.progress || 0) - (a.progress || 0);
  });

  const displaySelfPacedCourse = sortedByLastStudied[0] ?? null;

  const spProgressPercent = displaySelfPacedCourse
    ? Math.min(100, Math.max(0, displaySelfPacedCourse.progress || 0))
    : 0;

  const spIsCompleted =
    spProgressPercent >= 100 ||
    displaySelfPacedCourse?.status === "COMPLETED";
  const spIsNotStarted = spProgressPercent === 0;

  const spCourseImage = displaySelfPacedCourse
    ? displaySelfPacedCourse.thumbnail ||
      (displaySelfPacedCourse.title.toLowerCase().includes("generative ai")
        ? "/images/courses/generative-ai.png"
        : displaySelfPacedCourse.title.toLowerCase().includes("machine learning")
        ? "/images/courses/ml-math.png"
        : displaySelfPacedCourse.title.toLowerCase().includes("python")
        ? "/images/courses/python-fundamentals.png"
        : displaySelfPacedCourse.title.toLowerCase().includes("rag") ||
          displaySelfPacedCourse.title.toLowerCase().includes("vector")
        ? "/images/courses/rag-vector-db.png"
        : "/images/courses/generative-ai.png")
    : "/images/courses/generative-ai.png";

  return (
    <section className="relative w-full">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* UNIFIED "YOUR LEARNING" COMMAND CENTER WORKSPACE               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl border border-border/80 bg-card/60 dark:bg-[#0c101d]/90 backdrop-blur-xl shadow-xl p-6 sm:p-8 lg:p-10 overflow-hidden group/main">
        {/* Subtle Ambient Background Lighting (Purple/Pink Left, Cyan/Blue Right) */}
        <div className="absolute -left-24 -top-24 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover/main:bg-purple-600/20" />
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover/main:bg-cyan-500/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent pointer-events-none" />

        {/* ───────────────── TWO HALVES WORKSPACE ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 relative items-stretch z-10">
          {/* Subtle Vertical Divider between the two areas on desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-border/60 to-transparent -translate-x-1/2 pointer-events-none" />

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* LEFT HALF: LIVE TRAINING                                   */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div
            onClick={() => router.push("/calendar")}
            className="flex flex-col justify-between h-full rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-purple-500/[0.03] via-transparent to-pink-500/[0.02] dark:from-purple-950/20 dark:via-transparent dark:to-pink-950/10 border border-border/50 hover:border-purple-500/40 transition-all duration-300 group/live cursor-pointer relative overflow-hidden shadow-xs hover:shadow-purple-500/5"
          >
            {/* Top Area Heading & Action */}
            <div className="flex items-start justify-between gap-3 mb-4 shrink-0 sm:min-h-[58px]">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-text tracking-tight flex items-center gap-2">
                  <span>Live Training</span>
                  {isLiveNow && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-subtext mt-1 leading-snug">
                  Join scheduled live classes & interact with instructors.
                </p>
              </div>

              <Link
                href="/calendar"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-bold text-primary hover:text-primary-hover dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1 shrink-0 whitespace-nowrap group-hover/live:translate-x-0.5 transition-all mt-0.5"
              >
                <span className="hidden sm:inline">View All Live Classes</span>
                <span className="sm:hidden">All Live</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Dynamic Content: Distinct Elevated "Upcoming Class" Panel */}
            {displayLiveSession ? (
              <div className="w-full flex-1 flex flex-col justify-between rounded-2xl p-5 sm:p-6 bg-purple-950/20 dark:bg-[#121629]/90 border border-purple-500/25 hover:border-purple-500/45 transition-all duration-300 shadow-lg shadow-purple-950/20 gap-4 relative overflow-hidden group/session">
                {/* Subtle ambient gradient highlight inside the inner panel */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* TOP ROW: Status badge on Left, Cohort badge on Right */}
                <div className="flex items-center justify-between gap-2 relative z-10 shrink-0">
                  {isLiveNow ? (
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-500 dark:text-red-400 text-[11px] font-extrabold tracking-wider uppercase shadow-xs animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>LIVE NOW</span>
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[11px] font-extrabold tracking-wider uppercase">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      <span>NEXT SCHEDULED LIVE CLASS</span>
                    </div>
                  )}

                  <span className="text-[11px] font-bold text-subtext bg-white/[0.05] px-3 py-1 rounded-lg border border-border/70 tracking-wide shrink-0">
                    {displayLiveSession.batchName || "Main Cohort"}
                  </span>
                </div>

                {/* MIDDLE CONTENT: Course & Session Title + Instructor */}
                <div className="space-y-2 relative z-10 flex-1 my-1">
                  <h4
                    className="text-lg sm:text-xl font-bold text-text tracking-tight leading-snug group-hover/session:text-purple-300 transition-colors line-clamp-1"
                    title={displayLiveSession.courseTitle || displayLiveSession.title}
                  >
                    {displayLiveSession.courseTitle || displayLiveSession.title}
                  </h4>

                  <p className="text-xs sm:text-sm font-medium text-primary dark:text-purple-300 line-clamp-1 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">
                      Session: <strong className="text-text font-semibold">{displayLiveSession.title || "Interactive Cohort Class"}</strong>
                    </span>
                  </p>

                  <p className="text-xs sm:text-sm font-medium text-subtext flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>By <strong className="text-text font-semibold">{getInstructorName(displayLiveSession.instructor)}</strong></span>
                  </p>
                </div>

                {/* BOTTOM ROW: Schedule & Agenda on Left, Action Button on Right */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 shrink-0">
                  <div className="flex items-center gap-2.5 text-xs text-subtext min-w-0 flex-1 flex-wrap">
                    {liveDateFormatted && (
                      <div className="flex items-center gap-1.5 text-text font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{liveDateFormatted}</span>
                      </div>
                    )}

                    {liveDateFormatted && displayLiveSession.agenda && displayLiveSession.agenda.length > 0 && (
                      <span className="text-border/80">|</span>
                    )}

                    {displayLiveSession.agenda && displayLiveSession.agenda.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onOpenAgenda(displayLiveSession);
                        }}
                        className="text-xs font-bold text-primary hover:text-primary-hover dark:text-purple-400 dark:hover:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Class Agenda</span>
                      </button>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center">
                    {isLiveNow ? (
                      <Link
                        href={`/live-classes/room/${displayLiveSession.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full sm:w-auto min-w-[140px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 active:scale-95 transition-all animate-pulse"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Live Class →</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        title="This live session has not started yet. The join button will be activated once the class goes live."
                        className="w-full sm:w-auto min-w-[140px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-white/[0.04] dark:bg-white/[0.06] border border-border/80 text-subtext/60 cursor-not-allowed opacity-60 select-none"
                      >
                        <Lock className="w-3.5 h-3.5 text-subtext/50" />
                        <span>Join Class</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State for Live Training */
              <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-purple-950/10 border border-purple-500/15 space-y-3 min-h-[190px]">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-primary border border-purple-500/20">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">No upcoming live classes</h4>
                  <p className="text-xs text-subtext mt-0.5 max-w-xs">
                    You have no live sessions scheduled right now. Check the live calendar to explore cohorts.
                  </p>
                </div>
                <Link
                  href="/calendar"
                  onClick={(e) => e.stopPropagation()}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 transition-all mt-2"
                >
                  <span>Explore Live Calendar →</span>
                </Link>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* RIGHT HALF: SELF-PACED LEARNING                            */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div
            onClick={() => router.push("/student/courses")}
            className="flex flex-col justify-between h-full rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-blue-500/[0.02] dark:from-cyan-950/20 dark:via-transparent dark:to-blue-950/10 border border-border/50 hover:border-cyan-500/40 transition-all duration-300 group/sp cursor-pointer relative overflow-hidden shadow-xs hover:shadow-cyan-500/5"
          >
            {/* Top Area Heading & Action */}
            <div className="flex items-start justify-between gap-3 mb-4 shrink-0 sm:min-h-[58px]">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-text tracking-tight flex items-center gap-2">
                  <span>Self-Paced Learning</span>
                </h3>
                <p className="text-xs sm:text-sm text-subtext mt-1 leading-snug">
                  Learn at your own pace with structured video modules & exercises.
                </p>
              </div>

              <Link
                href="/student/courses"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 shrink-0 whitespace-nowrap group-hover/sp:translate-x-0.5 transition-all mt-0.5"
              >
                <span className="hidden sm:inline">View All Courses</span>
                <span className="sm:hidden">All Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Dynamic Content: In-Progress / Enrolled vs Empty */}
            {displaySelfPacedCourse ? (
              <div className="w-full flex-1 flex flex-col justify-between rounded-2xl p-5 sm:p-6 bg-cyan-950/20 dark:bg-[#0e1626]/90 border border-cyan-500/25 hover:border-cyan-500/45 transition-all duration-300 shadow-lg shadow-cyan-950/20 gap-4 relative overflow-hidden group/featured">
                {/* Subtle ambient gradient highlight inside the inner panel */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Status Indicator Row */}
                <div className="flex items-center justify-between gap-2 relative z-10 shrink-0">
                  {spIsCompleted ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold tracking-wider uppercase">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>COMPLETED</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-extrabold tracking-wider uppercase">
                      <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>RECENTLY WATCHED</span>
                    </div>
                  )}

                  <span className="text-[11px] font-bold text-subtext bg-white/[0.05] px-3 py-1 rounded-lg border border-border/70 tracking-wide shrink-0">
                    {displaySelfPacedCourse.completedLectures} / {displaySelfPacedCourse.totalLectures} lectures
                  </span>
                </div>

                {/* MIDDLE CONTENT: Course & Lesson Title + Instructor */}
                <div className="space-y-2 relative z-10 flex-1 my-1">
                  <h4
                    className="text-lg sm:text-xl font-bold text-text tracking-tight leading-snug group-hover/featured:text-cyan-400 transition-colors line-clamp-1"
                    title={displaySelfPacedCourse.title}
                  >
                    {displaySelfPacedCourse.title}
                  </h4>

                  <p className="text-xs sm:text-sm font-medium text-cyan-600 dark:text-cyan-400 line-clamp-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      Next Up: <strong className="text-text font-semibold">{displaySelfPacedCourse.lastWatchedLecture || "Course Introduction"}</strong>
                    </span>
                  </p>

                  <p className="text-xs sm:text-sm font-medium text-subtext flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>By <strong className="text-text font-semibold">{getInstructorName(displaySelfPacedCourse.instructor)}</strong></span>
                  </p>
                </div>

                {/* BOTTOM ROW: Progress Bar on Left, Action Button on Right */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 shrink-0">
                  {/* Progress Bar Info */}
                  <div className="space-y-1.5 flex-1 min-w-0 sm:pr-4">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-subtext truncate">
                        Progress: {displaySelfPacedCourse.completedLectures} / {displaySelfPacedCourse.totalLectures} lectures
                      </span>
                      <span className="text-cyan-400 font-black ml-2 shrink-0">{spProgressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/30 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          spIsCompleted
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
                        }`}
                        style={{ width: `${spProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 flex items-center">
                    <Link
                      href={`/learn/${displaySelfPacedCourse.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full sm:w-auto min-w-[140px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/25 active:scale-95 transition-all text-center whitespace-nowrap"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>
                        {spIsNotStarted
                          ? "Start Learning →"
                          : spIsCompleted
                          ? "Review Course →"
                          : "Continue Learning →"}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State for Self-Paced Learning */
              <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-cyan-950/10 border border-cyan-500/15 space-y-3 min-h-[190px]">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">No self-paced courses yet</h4>
                  <p className="text-xs text-subtext mt-0.5 max-w-xs">
                    Explore our course library to start learning structured video modules at your own pace.
                  </p>
                </div>
                <Link
                  href="/courses"
                  onClick={(e) => e.stopPropagation()}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-700 dark:text-cyan-300 hover:text-white border border-cyan-500/20 transition-all mt-2"
                >
                  <span>Explore Courses →</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
