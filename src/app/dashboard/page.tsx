"use client";

import { useEffect, useState } from "react";
import {
  BookOpen, Award, Clock, PlayCircle, Users, Activity,
  CheckCircle, Video, GraduationCap, Download, Share2,
  ArrowRight, Calendar, Tv, Trophy, Sparkles, XCircle, FileText, Lock,
  ListChecks, X, CheckCircle2, PlaySquare, Play, Flame, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RecommendedCourse } from "@/components/student/RecommendedCourse";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";
import { YourLearningSection } from "@/components/student/YourLearningSection";
import { formatDate, formatTime } from "@/lib/dateTime";

interface LiveCourse {
  id: string;
  title: string;
  instructor: any;
  batchName: string;
  thumbnail?: string;
  nextClass: {
    id: string;
    title: string;
    date: string;
    meetingLink: string;
  } | null;
  totalClasses: number;
  status?: string;
}

interface LiveClassItem {
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

interface SelfPacedCourse {
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

interface CertificateData {
  id: string;
  courseId: string;
  courseTitle: string;
  instructor: any;
  issueDate: string;
  certificateUrl: string | null;
}

export function getInstructorName(instructor: any): string {
  if (!instructor) return "Instructor";
  if (typeof instructor === "string") return instructor;
  if (typeof instructor === "object" && instructor.name) return instructor.name;
  return "Instructor";
}

export default function StudentDashboard() {
  const [liveCourses, setLiveCourses] = useState<LiveCourse[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassItem[]>([]);
  const [selfPaced, setSelfPaced] = useState<SelfPacedCourse[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    selfPacedCount: 0,
    liveCoursesCount: 0,
    inProgress: 0,
    completed: 0,
    streak: 0,
    bestStreak: 0,
    totalHours: 0,
    selfPacedHours: 0,
    liveHours: 0,
    weeklyHoursAdded: 0,
    totalXP: 0
  });
  const [loading, setLoading] = useState(true);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedAgendaClass, setSelectedAgendaClass] = useState<LiveClassItem | null>(null);
  const [isEnrolledModalOpen, setIsEnrolledModalOpen] = useState(false);
  const [enrolledTab, setEnrolledTab] = useState<"ALL" | "LIVE" | "SELF_PACED">("ALL");
  const router = useRouter();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, liveRes, spRes, certRes] = await Promise.all([
          fetch("/api/student/dashboard"),
          fetch("/api/student/live-courses"),
          fetch("/api/student/self-paced"),
          fetch("/api/student/certificates"),
        ]);

        if (dashRes.status === 401 || dashRes.status === 403) {
          router.push("/login");
          return;
        }

        const [dashData, liveData, spData, certData] = await Promise.all([
          dashRes.json(),
          liveRes.json(),
          spRes.json(),
          certRes.json(),
        ]);

        const fetchedSelfPaced: SelfPacedCourse[] = spData.courses || [];
        const rawStats = dashData.stats || {};
        
        setStats({
          total: rawStats.total ?? (fetchedSelfPaced.length + (liveData.courses?.length || 0)),
          selfPacedCount: rawStats.selfPacedCount ?? fetchedSelfPaced.length,
          liveCoursesCount: rawStats.liveCoursesCount ?? (liveData.courses?.length || 0),
          inProgress: rawStats.inProgress ?? 0,
          completed: rawStats.completed ?? 0,
          streak: rawStats.streak ?? 0,
          bestStreak: rawStats.bestStreak ?? 0,
          totalHours: rawStats.totalHours ?? 0,
          selfPacedHours: rawStats.selfPacedHours ?? 0,
          liveHours: rawStats.liveHours ?? 0,
          weeklyHoursAdded: rawStats.weeklyHoursAdded ?? 0,
          totalXP: rawStats.totalXP ?? 0,
        });

        const sortedLiveCourses = (liveData.courses || []).sort((a: any, b: any) => {
          const aLive = (a.sessions || []).some((s: any) => s.status === "live") ? 1 : 0;
          const bLive = (b.sessions || []).some((s: any) => s.status === "live") ? 1 : 0;
          return bLive - aLive;
        });

        const sortedLiveClasses = (liveData.classes || []).sort((a: any, b: any) => {
          const aLive = a.status === "ONGOING" || a.status === "LIVE" || a.status === "LIVE_NOW" ? 1 : 0;
          const bLive = b.status === "ONGOING" || b.status === "LIVE" || b.status === "LIVE_NOW" ? 1 : 0;
          if (aLive !== bLive) return bLive - aLive;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setLiveCourses(sortedLiveCourses);
        setLiveClasses(sortedLiveClasses);
        setSelfPaced(fetchedSelfPaced);
        setCertificates(certData.certificates || []);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [router]);

  if (loading) {
    return (
      <div className="w-full min-h-screen py-20 flex flex-col items-center justify-center">
        <Activity className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-subtext font-bold">Synchronizing your dashboard...</p>
      </div>
    );
  }

  const selfPacedCount = selfPaced.length;
  const liveCoursesCount = liveCourses.length;
  const totalCourses = stats.total || (selfPacedCount + liveCoursesCount);

  const selfPacedInProgress = selfPaced.filter(
    (c) => (c.progress || 0) < 100
  ).length;

  const liveCoursesInProgress = liveCoursesCount;
  const totalInProgress = stats.inProgress || (selfPacedInProgress + liveCoursesInProgress);

  const selfPacedCompleted = selfPaced.filter(
    (c) => (c.progress || 0) >= 100
  ).length;

  const liveCoursesCompleted = 0;
  const totalCompleted = stats.completed || (selfPacedCompleted + liveCoursesCompleted);

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-6">
        <div className="max-w-[1650px] mx-auto px-2 sm:px-6 space-y-8">

        {/* ───────── Header & Stats ───────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-black text-text tracking-tight">
                  Student <span className="text-primary">Dashboard</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-subtext mt-1 font-medium">Welcome back. Let's pick up right where you left off.</p>
            </div>
          </div>

          {/* ───────── New Student Onboarding Discovery Banner ───────── */}
          {totalCourses === 0 && (
            <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-purple-50 via-card to-indigo-50 dark:from-purple-950/40 dark:via-card dark:to-indigo-950/40 border border-purple-200 dark:border-purple-500/30 shadow-xl">
              <div className="max-w-2xl space-y-3 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  New Student Onboarding
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-text leading-tight">
                  Ready to master AI Engineering?
                </h2>
                <p className="text-xs sm:text-sm text-subtext leading-relaxed">
                  You haven&apos;t enrolled in any courses or live cohorts yet. Explore our recommended career pathways below. Once you enroll, your live classrooms, video modules, and assignments will unlock immediately.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/courses"
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-2"
                  >
                    <span>Explore All Programs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/calendar"
                    className="px-5 py-2.5 rounded-xl bg-card hover:bg-card/80 border border-border text-text font-bold text-xs transition-all flex items-center gap-2"
                  >
                    <span>Live Cohort Calendar</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
            {/* Card 1: Enrolled Courses (Clickable Hub) */}
            <div
              onClick={() => {
                setEnrolledTab("ALL");
                setIsEnrolledModalOpen(true);
              }}
              className="bg-card/60 border border-border hover:border-primary/60 rounded-xl px-4 py-3 shadow-xs transition-all hover:shadow-md cursor-pointer relative overflow-hidden group flex flex-col justify-between hover:scale-[1.01]"
              title="Click to view all your live and self-paced enrolled courses"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-subtext font-semibold text-[11px] tracking-wider uppercase group-hover:text-primary transition-colors">
                  Enrolled Courses
                </span>
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xl sm:text-2xl font-black text-text">
                    {totalCourses}
                  </div>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    View All <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="text-[11px] text-subtext font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEnrolledTab("SELF_PACED");
                      setIsEnrolledModalOpen(true);
                    }}
                    className="text-amber-700 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                  >
                    {selfPacedCount} Self-Paced
                  </button>
                  <span className="text-subtext/40">•</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEnrolledTab("LIVE");
                      setIsEnrolledModalOpen(true);
                    }}
                    className="text-orange-700 dark:text-orange-400 font-semibold hover:underline cursor-pointer"
                  >
                    {liveCoursesCount} Live
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Total Hours Learned (Divided into Self-Paced and Live) */}
            <div className="bg-card/60 border border-border hover:border-emerald-500/40 rounded-xl px-4 py-3 shadow-xs transition-all hover:shadow-sm relative overflow-hidden group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-subtext font-semibold text-[11px] tracking-wider uppercase">Total Hours Learned</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xl sm:text-2xl font-black text-text">
                    {stats.totalHours.toFixed(1)} hrs
                  </div>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    {stats.weeklyHoursAdded > 0 ? `+${stats.weeklyHoursAdded.toFixed(1)} hrs this week` : '0.0 hrs this week'}
                  </span>
                </div>
                <div className="text-[11px] text-subtext font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                    {stats.selfPacedHours.toFixed(1)} hrs Self-Paced
                  </span>
                  <span className="text-subtext/40">•</span>
                  <span className="text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-400" />
                    {stats.liveHours.toFixed(1)} hrs Live
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Active Streak */}
            <div className="bg-card/60 border border-border hover:border-orange-500/40 rounded-xl px-4 py-3 shadow-xs transition-all hover:shadow-sm relative overflow-hidden group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-subtext font-semibold text-[11px] tracking-wider uppercase">Active Streak</span>
                <div className="p-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20">
                  <Flame className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                  <span>{stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}</span>
                  <Flame className="w-4 h-4 text-orange-700 dark:text-orange-400 fill-orange-500/20" />
                </div>
                <div className="text-[11px] text-subtext font-medium mt-0.5">
                  Personal best: {stats.bestStreak} {stats.bestStreak === 1 ? 'day' : 'days'}
                </div>
              </div>
            </div>

            {/* Card 4: Certificates Earned (Featured / Big & Prominent) */}
            <div
              onClick={() => setIsCertModalOpen(true)}
              className="bg-gradient-to-br from-purple-50 via-card/90 to-purple-100/50 dark:from-purple-950/40 dark:via-card/90 dark:to-purple-900/30 border border-purple-200 dark:border-purple-500/40 hover:border-purple-400 dark:hover:border-purple-500/70 rounded-xl p-3.5 sm:p-4 shadow-sm transition-all hover:shadow-purple-500/20 cursor-pointer relative overflow-hidden group hover:scale-[1.01] flex flex-col justify-between"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
              
              <div className="flex items-center justify-between relative z-10 mb-1.5">
                <span className="text-purple-700 dark:text-purple-300 font-bold text-xs tracking-wider uppercase">Certificates Earned</span>
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 shadow-xs">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              
              <div className="flex items-end justify-between relative z-10">
                <div>
                  <div className="text-2xl font-black text-purple-900 dark:text-purple-200">
                    {certificates.length}
                  </div>
                  <span className="text-[11px] text-purple-700/80 dark:text-purple-300/80 font-medium block mt-0.5">
                    Verified Credentials
                  </span>
                </div>
                
                <span className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 border border-purple-400/40 px-3 py-1 rounded-full flex items-center gap-1 shadow-md shadow-purple-900/40 group-hover:translate-x-0.5 transition-all">
                  <span>Click to View</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── 🚀 Unified "Your Learning" Command Center Section ───────── */}
        <YourLearningSection
          liveClasses={liveClasses}
          selfPaced={selfPaced}
          onOpenAgenda={(item) => setSelectedAgendaClass(item)}
          onOpenEnrolledHub={() => {
            setEnrolledTab("ALL");
            setIsEnrolledModalOpen(true);
          }}
          getInstructorName={getInstructorName}
        />

        {/* ───────── 🧑‍🏫 Dynamic Recommended Course Spotlight Section ───────── */}
        <RecommendedCourse enrolledCourses={selfPaced} liveCourses={liveCourses} />

      </div>

      {/* ───────── 📋 Class Agenda Modal ───────── */}
      {selectedAgendaClass && (() => {
        const agendaDate = new Date(selectedAgendaClass.date);
        const now = new Date();
        const isToday =
          agendaDate.getDate() === now.getDate() &&
          agendaDate.getMonth() === now.getMonth() &&
          agendaDate.getFullYear() === now.getFullYear();

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedAgendaClass(null)}>
            <div 
              className="bg-card border border-border/80 w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ambient Background Glow */}
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60 relative z-10">
                <div className="space-y-2 min-w-0">
                  {/* Badges Row with Prominent Live Date */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                      selectedAgendaClass.status === "ONGOING"
                        ? "bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse"
                        : "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                    }`}>
                      {selectedAgendaClass.status === "ONGOING" ? "🔴 Live Now" : "⏰ Upcoming Session"}
                    </span>

                    {/* Live Date Pill */}
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {isToday ? "Live Today: " : "Live Date: "}
                        {formatDate(agendaDate)} · {formatTime(agendaDate)}
                      </span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-subtext text-[11px] font-medium border border-border/60">
                      {selectedAgendaClass.batchName}
                    </span>
                    {selectedAgendaClass.duration && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-subtext text-[11px] font-medium border border-border/40">
                        ⏱️ {selectedAgendaClass.duration}
                      </span>
                    )}
                  </div>

                  {/* Class Name (Above) */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-text tracking-tight leading-snug">
                      {selectedAgendaClass.courseTitle}
                    </h3>
                    {/* Topic Name (Below) */}
                    <p className="text-sm font-semibold text-primary flex items-center gap-1.5 mt-1">
                      <Tv className="w-4 h-4 text-primary shrink-0" />
                      <span>Session Topic: <strong className="text-text font-bold">{selectedAgendaClass.title}</strong></span>
                    </p>
                  </div>
                  
                  {/* Instructor & Time Details */}
                  <div className="text-xs text-subtext flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                    <span className="flex items-center gap-1 font-medium text-text">
                      <Users className="w-3.5 h-3.5 text-accent" /> Instructor: <strong className="text-text font-semibold">{getInstructorName(selectedAgendaClass.instructor)}</strong>
                    </span>
                    <span className="text-subtext/40">•</span>
                    <span className="text-subtext flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-400" /> Scheduled: {isToday ? "Today at " : ""}{formatTime(agendaDate)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAgendaClass(null)}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-subtext hover:text-text transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto py-5 space-y-5 flex-1 pr-1 scrollbar-thin">
                {/* Topics & Agenda Schedule */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-subtext uppercase tracking-wider flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-primary" />
                      <span>Class Topics & Step-by-Step Agenda</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-primary">
                      {(selectedAgendaClass.agenda || []).length || 5} Topics Planned
                    </span>
                  </div>

                  <div className="space-y-2 bg-background/50 border border-border/70 rounded-2xl p-3.5 sm:p-4">
                    {(
                      selectedAgendaClass.agenda || [
                        "01. Neural Network Foundations & Multilayer Perceptrons (15 mins)",
                        "02. Custom Loss Functions, Gradient Descent & Backprop Calculus (25 mins)",
                        "03. Live PyTorch Implementation: Deep Feedforward & Residual Layers (40 mins)",
                        "04. Regularization Strategies: Dropout, BatchNorm & Gradient Clipping (25 mins)",
                        "05. Live Debugging, Q&A & Hands-On Homework Assignment (15 mins)",
                      ]
                    ).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-xl bg-card/40 hover:bg-card/70 border border-border/40 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-text">
                            {item}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Takeaways */}
                {selectedAgendaClass.takeaways && selectedAgendaClass.takeaways.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-subtext uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <span>What You'll Learn & Build in this Class</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedAgendaClass.takeaways.map((takeaway, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-card/30 border border-border/50 text-xs text-text">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites & Materials */}
                {selectedAgendaClass.prerequisites && (
                  <div className="p-3.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-200/90 text-xs flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-900 dark:text-amber-300 block mb-0.5">Prerequisites & Preparation:</strong>
                      <span>{selectedAgendaClass.prerequisites}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 relative z-10">
                <button
                  onClick={() => setSelectedAgendaClass(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-subtext hover:text-text transition-colors cursor-pointer"
                >
                  Close Agenda
                </button>

                {selectedAgendaClass.status === "ONGOING" ? (
                  <a
                    href={selectedAgendaClass.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all active:scale-95 animate-pulse"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Live Room Now</span>
                  </a>
                ) : (
                  <Link
                    href="/calendar"
                    onClick={() => setSelectedAgendaClass(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/15 dark:hover:bg-orange-500/25 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>View in Calendar</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ───────── 📚 Enrolled Courses Modal (Separated Live vs Self-Paced) ───────── */}
      {isEnrolledModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsEnrolledModalOpen(false)}
        >
          <div 
            className="bg-card border border-border/80 w-full max-w-4xl rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Glow */}
            <div className="absolute -right-12 -top-12 w-56 h-56 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-text tracking-tight">
                    My Enrolled Courses
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-subtext">
                  All your active programs separated into Live Training cohorts and Self-Paced Video courses.
                </p>
              </div>

              <button
                onClick={() => setIsEnrolledModalOpen(false)}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-subtext hover:text-text transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 py-3.5 border-b border-border/40 relative z-10 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setEnrolledTab("ALL")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  enrolledTab === "ALL"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white/[0.04] text-subtext hover:text-text hover:bg-white/[0.08]"
                }`}
              >
                <span>All Courses</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">{totalCourses}</span>
              </button>

              <button
                onClick={() => setEnrolledTab("LIVE")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  enrolledTab === "LIVE"
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                    : "bg-white/[0.04] text-subtext hover:text-orange-700 dark:hover:text-orange-400 hover:bg-white/[0.08]"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span>Live Training</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">{liveCoursesCount}</span>
              </button>

              <button
                onClick={() => setEnrolledTab("SELF_PACED")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  enrolledTab === "SELF_PACED"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "bg-white/[0.04] text-subtext hover:text-amber-700 dark:hover:text-amber-400 hover:bg-white/[0.08]"
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Self-Paced Video</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">{selfPacedCount}</span>
              </button>
            </div>

            {/* Modal Body (Scrollable Course Sections) */}
            <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1 scrollbar-thin">
              
              {/* SECTION 1: LIVE TRAINING COURSES */}
              {(enrolledTab === "ALL" || enrolledTab === "LIVE") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-text uppercase tracking-wider">
                        Live Training Programs ({liveCourses.length})
                      </h4>
                    </div>
                    <span className="text-[11px] text-subtext">Interactive cohorts with instructor</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {liveCourses.map((course) => {
                      const nextClass = course.nextClass;
                      const nextDate = nextClass ? new Date(nextClass.date) : null;
                      const isClassToday = nextDate
                        ? nextDate.getDate() === new Date().getDate() &&
                          nextDate.getMonth() === new Date().getMonth() &&
                          nextDate.getFullYear() === new Date().getFullYear()
                        : false;

                      return (
                        <div
                          key={course.id}
                          className="bg-card/70 border border-orange-200 dark:border-orange-500/30 hover:border-orange-400 dark:hover:border-orange-500/60 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3 relative overflow-hidden group transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30 text-[10px] font-bold uppercase tracking-wider">
                                {course.batchName}
                              </span>
                              <h5 className="font-extrabold text-base text-text leading-snug">
                                {course.title}
                              </h5>
                              <p className="text-xs text-subtext flex items-center gap-1.5">
                                <Users className="w-3 h-3 text-accent" /> Instructor: <strong className="text-text font-semibold">{getInstructorName(course.instructor)}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Next Class Schedule Bar */}
                          {nextClass ? (
                            <div className="p-2.5 rounded-xl bg-background/60 border border-border/50 text-xs flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase block">Next Live Session:</span>
                                <span className="font-semibold text-text truncate block">{nextClass.title}</span>
                                <span className="text-[11px] text-subtext">
                                  {isClassToday ? "Today at " : nextDate ? formatDate(nextDate) + " · " : ""}
                                  {nextDate ? formatTime(nextDate) : ""}
                                </span>
                              </div>
                              {nextClass.meetingLink && (
                                <a
                                  href={nextClass.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 shadow-sm shadow-red-600/20"
                                >
                                  <Video className="w-3 h-3" /> Join Room
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-background/40 border border-border/40 text-xs text-subtext flex items-center justify-between">
                              <span>Total Classes: {course.totalClasses} sessions</span>
                              <Link 
                                href="/calendar" 
                                onClick={() => setIsEnrolledModalOpen(false)}
                                className="text-orange-700 dark:text-orange-400 font-bold hover:underline"
                              >
                                View Schedule →
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: SELF-PACED VIDEO COURSES */}
              {(enrolledTab === "ALL" || enrolledTab === "SELF_PACED") && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-text uppercase tracking-wider">
                        Self-Paced Video Courses ({selfPaced.length})
                      </h4>
                    </div>
                    <span className="text-[11px] text-subtext">Learn on your own schedule</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selfPaced.map((course) => {
                      const courseImage =
                        course.thumbnail ||
                        (course.title.toLowerCase().includes("generative ai")
                          ? "/images/courses/generative-ai.png"
                          : course.title.toLowerCase().includes("machine learning")
                          ? "/images/courses/ml-math.png"
                          : course.title.toLowerCase().includes("python")
                          ? "/images/courses/python-fundamentals.png"
                          : "/images/courses/rag-vector-db.png");

                      return (
                        <div
                          key={course.id}
                          className="bg-card border border-border hover:border-amber-400 dark:hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group"
                        >
                          <div className="h-28 relative overflow-hidden bg-slate-900">
                            <img
                              src={courseImage}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute top-2 right-2 z-10">
                              <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                                {course.progress}% done
                              </span>
                            </div>
                            <div className="absolute bottom-2 left-2.5 z-10 text-white text-[10px] font-semibold flex items-center gap-1">
                              <PlayCircle className="w-3.5 h-3.5 text-primary" />
                              <span>{course.completedLectures}/{course.totalLectures} lectures</span>
                            </div>
                          </div>

                          <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                            <div>
                              <h5 className="font-bold text-sm text-text line-clamp-1 group-hover:text-primary transition-colors" title={course.title}>
                                {course.title}
                              </h5>
                              <p className="text-[11px] text-subtext mt-0.5 flex items-center gap-1">
                                <Users className="w-3 h-3 text-accent" /> {getInstructorName(course.instructor)}
                              </p>
                            </div>

                            {/* Progress bar */}
                            <div>
                              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                            </div>

                            <Link
                              href={`/learn/${course.id}`}
                              onClick={() => setIsEnrolledModalOpen(false)}
                              className="w-full"
                            >
                              <button className="w-full py-1.5 bg-card hover:bg-primary hover:text-white border border-border text-text rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-xs cursor-pointer">
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>Continue Learning</span>
                              </button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 relative z-10">
              <button
                onClick={() => setIsEnrolledModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-subtext hover:text-text transition-colors cursor-pointer"
              >
                Close Hub
              </button>

              <Link
                href="/courses"
                onClick={() => setIsEnrolledModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white transition-colors flex items-center gap-1.5"
              >
                <span>Browse More Programs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Certificates Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsCertModalOpen(false)}>
          <div className="bg-card w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 flex justify-between items-center border-b border-border bg-background/50">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2 text-text">
                  <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" /> My Certificates
                </h3>
                <p className="text-sm text-subtext mt-1">Credentials earned from completed courses</p>
              </div>
              <button onClick={() => setIsCertModalOpen(false)} className="p-2 hover:bg-background rounded-full text-subtext hover:text-text transition-colors border border-transparent hover:border-border">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto grid sm:grid-cols-2 gap-6 bg-background/20">
              {certificates.length === 0 ? (
                <div className="col-span-full py-16 flex flex-col items-center text-center text-subtext">
                  <GraduationCap className="w-16 h-16 mb-4 opacity-20 text-purple-600 dark:text-purple-400"/>
                  <h4 className="text-lg font-bold text-text">No certificates yet</h4>
                  <p className="text-sm mt-1 max-w-xs">Complete your enrolled courses to unlock beautifully crafted certificates.</p>
                </div>
              ) : certificates.map((cert) => (
                 <div key={cert.id} className="border border-border rounded-2xl p-5 bg-card flex flex-col gap-4 group hover:border-purple-400 dark:hover:border-purple-500/30 transition-all shadow-md hover:shadow-xl hover:shadow-purple-500/5 relative overflow-hidden">
                   <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
                   {/* Thumbnail */}
                   <div className="w-full h-36 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200 dark:border-purple-700/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                     <GraduationCap className="w-10 h-10 text-purple-600/60 dark:text-purple-500/50 mb-2" />
                     <div className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-[0.2em]">Certificate of Completion</div>
                     <div className="text-xs font-semibold text-purple-800 dark:text-purple-200 mt-1 truncate px-4 max-w-full italic">{cert.courseTitle}</div>
                   </div>
                   <div className="space-y-1 z-10">
                     <h4 className="font-bold text-text text-sm line-clamp-1" title={cert.courseTitle}>{cert.courseTitle}</h4>
                     <p className="text-xs text-subtext flex items-center justify-between">
                       <span>Issued: {formatDate(cert.issueDate)}</span>
                     </p>
                   </div>
                   <button className="w-full mt-auto flex items-center justify-center gap-2 py-2.5 bg-card border border-border hover:bg-purple-600 hover:border-purple-600 hover:text-white text-text rounded-xl text-sm font-bold transition-all z-10">
                     <FileText className="w-4 h-4" /> Download PDF
                   </button>
                  </div>
                 ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </StudentPortalLayout>
  );
}
