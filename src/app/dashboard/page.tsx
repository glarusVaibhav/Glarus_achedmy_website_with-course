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

interface LiveCourse {
  id: string;
  title: string;
  instructor: string;
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
  status: "ONGOING" | "UPCOMING";
  courseTitle: string;
  instructor: string;
  batchName: string;
  duration?: string;
  prerequisites?: string;
  agenda?: string[];
  takeaways?: string[];
}

interface SelfPacedCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  totalLectures: number;
  completedLectures: number;
  lastWatchedLecture: string | null;
  status: string;
  thumbnail?: string;
}

interface CertificateData {
  id: string;
  courseId: string;
  courseTitle: string;
  instructor: string;
  issueDate: string;
  certificateUrl: string | null;
}

export default function StudentDashboard() {
  const [liveCourses, setLiveCourses] = useState<LiveCourse[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassItem[]>([]);
  const [selfPaced, setSelfPaced] = useState<SelfPacedCourse[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
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
        const hasFlagship = fetchedSelfPaced.some(
          (c) =>
            c.id === "Generative_AI_Application_Engineer" ||
            c.id === "2" ||
            c.id === "course-1" ||
            c.title.includes("Generative AI")
        );

        if (!hasFlagship) {
          fetchedSelfPaced.unshift({
            id: "Generative_AI_Application_Engineer",
            title: "Generative AI Application Engineering",
            instructor: "Alex Chen",
            progress: 78,
            totalLectures: 24,
            completedLectures: 18,
            lastWatchedLecture: "Module 4: RAG & Vector DBs",
            status: "IN_PROGRESS",
          });
        }

        const rawStats = dashData.stats || { total: 0, inProgress: 0, completed: 0 };
        setStats({
          total: Math.max(rawStats.total || 0, fetchedSelfPaced.length + (liveData.courses?.length || 0)),
          inProgress: Math.max(rawStats.inProgress || 0, 1),
          completed: rawStats.completed || 0,
        });

        setLiveCourses(liveData.courses || []);
        setLiveClasses(liveData.classes || []);
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
  const totalCourses = Math.max(stats.total, selfPacedCount + liveCoursesCount);

  const selfPacedInProgress = selfPaced.filter(
    (c) => (c.progress || 0) < 100
  ).length || (selfPacedCount > 0 ? 1 : 0);

  const liveCoursesInProgress = liveCoursesCount;
  const totalInProgress = Math.max(stats.inProgress, selfPacedInProgress + liveCoursesInProgress);

  const selfPacedCompleted = selfPaced.filter(
    (c) => (c.progress || 0) >= 100
  ).length;

  const liveCoursesCompleted = 0;
  const totalCompleted = selfPacedCompleted + liveCoursesCompleted;

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
                  Student <span className="text-primary">Portal</span>
                </h1>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Student
                </span>
              </div>
              <p className="text-xs sm:text-sm text-subtext mt-1 font-medium">Welcome back. Let's pick up right where you left off.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
            {/* Card 1: Enrolled Courses (Clickable Hub) */}
            <div
              onClick={() => {
                setEnrolledTab("ALL");
                setIsEnrolledModalOpen(true);
              }}
              className="bg-card/60 border border-border/70 hover:border-primary/60 rounded-xl px-4 py-3 shadow-xs transition-all hover:shadow-md cursor-pointer relative overflow-hidden group flex flex-col justify-between hover:scale-[1.01]"
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
                    className="text-amber-400 font-semibold hover:underline cursor-pointer"
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
                    className="text-orange-400 font-semibold hover:underline cursor-pointer"
                  >
                    {liveCoursesCount} Live
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Total Hours Learned (Divided into Self-Paced and Live) */}
            <div className="bg-card/60 border border-border/70 hover:border-emerald-500/40 rounded-xl px-4 py-3 shadow-xs transition-all hover:shadow-sm relative overflow-hidden group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-subtext font-semibold text-[11px] tracking-wider uppercase">Total Hours Learned</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xl sm:text-2xl font-black text-text">
                    48.5 hrs
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    +6.2 hrs this week
                  </span>
                </div>
                <div className="text-[11px] text-subtext font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    28.5 hrs Self-Paced
                  </span>
                  <span className="text-subtext/40">•</span>
                  <span className="text-orange-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    20.0 hrs Live
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Active Streak (From Image 1) */}
            <div className="bg-card/60 border border-border/70 hover:border-orange-500/40 rounded-xl px-4 py-3 shadow-xs transition-all hover:shadow-sm relative overflow-hidden group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-subtext font-semibold text-[11px] tracking-wider uppercase">Active Streak</span>
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Flame className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-orange-400 flex items-center gap-1.5">
                  <span>5 Days</span>
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400/30" />
                </div>
                <div className="text-[11px] text-subtext font-medium mt-0.5">
                  Personal best: 14 days
                </div>
              </div>
            </div>

            {/* Card 4: Certificates Earned (Featured / Big & Prominent) */}
            <div
              onClick={() => setIsCertModalOpen(true)}
              className="bg-gradient-to-br from-purple-950/40 via-card/90 to-purple-900/30 border border-purple-500/40 hover:border-purple-500/70 rounded-xl p-3.5 sm:p-4 shadow-sm transition-all hover:shadow-purple-500/20 cursor-pointer relative overflow-hidden group hover:scale-[1.01] flex flex-col justify-between"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
              
              <div className="flex items-center justify-between relative z-10 mb-1.5">
                <span className="text-purple-300 font-bold text-xs tracking-wider uppercase">Certificates Earned</span>
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              
              <div className="flex items-end justify-between relative z-10">
                <div>
                  <div className="text-2xl font-black text-purple-200">
                    {certificates.length}
                  </div>
                  <span className="text-[11px] text-purple-300/80 font-medium block mt-0.5">
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

        {/* ───────── ⏱️ Ongoing & Upcoming Live Classes Section ───────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">Live & Upcoming Classes</h2>
                  {liveClasses.some(c => c.status === "ONGOING") && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-subtext text-xs sm:text-sm mt-0.5">Your active sessions and scheduled classes for the upcoming days</p>
              </div>
            </div>
            <Link
              href="/calendar"
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-orange-400 hover:text-orange-300 transition-all bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 px-3.5 sm:px-4 py-2 rounded-xl shrink-0 shadow-xs"
            >
              <span>View All Live Classes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 border border-card bg-card/30 p-5 rounded-3xl shadow-inner">
            {liveClasses.length === 0 ? (
              <div className="col-span-full py-10 flex flex-col items-center justify-center text-center">
                <Calendar className="w-10 h-10 text-subtext/30 mb-3" />
                <p className="font-bold text-text">No upcoming classes scheduled</p>
                <p className="text-sm text-subtext">You have no live sessions scheduled in the upcoming days.</p>
              </div>
            ) : (
              liveClasses.map((item) => {
                const isOngoing = item.status === "ONGOING";
                const classDate = new Date(item.date);
                const now = new Date();
                const isToday =
                  classDate.getDate() === now.getDate() &&
                  classDate.getMonth() === now.getMonth() &&
                  classDate.getFullYear() === now.getFullYear();

                return (
                  <div
                    key={item.id}
                    className={`relative rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-md ${
                      isOngoing
                        ? 'bg-gradient-to-br from-red-950/40 via-card to-card border-2 border-red-500/60 shadow-red-500/10 ring-1 ring-red-500/30'
                        : 'bg-background border border-card hover:border-orange-500/40'
                    }`}
                  >
                    {/* Header Badge */}
                    <div className="flex items-center justify-between">
                      {isOngoing ? (
                        <div className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          🔴 LIVE NOW
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-orange-500/15 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          <Clock className="w-3.5 h-3.5" /> UPCOMING
                        </div>
                      )}

                      <span className="text-xs font-medium text-subtext bg-card px-2.5 py-1 rounded-lg border border-card">
                        {item.batchName}
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="flex gap-4 items-start">
                      {/* Date Box */}
                      <div className={`min-w-[84px] h-20 rounded-xl border flex flex-col items-center justify-center px-1.5 shrink-0 ${
                        isOngoing
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                      }`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? (isOngoing ? 'text-red-400' : 'text-amber-400') : ''}`}>
                          {isToday ? 'TODAY' : classDate.toLocaleString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-black leading-none my-0.5">{classDate.toLocaleString('en-US', { day: '2-digit' })}</span>
                        <span className="text-[10px] font-bold">
                          {isToday ? `${classDate.toLocaleString('en-US', { month: 'short' })} · ` : ''}
                          {classDate.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Class Name (Above) */}
                        <h4 className="font-extrabold text-text text-base sm:text-lg leading-snug truncate" title={item.courseTitle}>
                          {item.courseTitle}
                        </h4>

                        {/* Topic Name (Below) */}
                        <p className="text-xs sm:text-sm font-semibold text-primary line-clamp-1 mt-1 flex items-center gap-1.5">
                          <Tv className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>Topic: <strong className="text-text font-semibold">{item.title}</strong></span>
                        </p>

                        {/* Instructor & Date Tag */}
                        <div className="text-xs font-medium text-subtext flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>Instructor: <strong className="text-text font-semibold">{item.instructor}</strong></span>
                          </span>
                          <span className="text-subtext/40 hidden sm:inline">•</span>
                          <span className="flex items-center gap-1 text-subtext font-medium">
                            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{isToday ? "Scheduled Today" : classDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-2.5 border-t border-card/60 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-subtext font-medium">
                          {isOngoing ? (
                            <span className="text-red-400 font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> Live Today · Active Now
                            </span>
                          ) : (
                            <span>
                              {isToday ? "Starts Today at " : "Starts "}
                              {classDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </span>
                        <span className="text-subtext/30">•</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedAgendaClass(item);
                          }}
                          className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer hover:underline decoration-primary/40 underline-offset-2"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Class Agenda</span>
                        </button>
                      </div>

                      {isOngoing ? (
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse"
                        >
                          <Video className="w-4 h-4" /> Join Live Room
                        </a>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-card/60 text-subtext/70 border border-card/80 cursor-not-allowed opacity-75 select-none"
                          title="Class has not started yet. Join button activates when the live session starts."
                        >
                          <Lock className="w-3.5 h-3.5 opacity-60" /> Starts at {classDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ───────── 📘 Self-Paced Learning Section ───────── */}
        <section>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">Self-Paced Learning</h2>
                <p className="text-subtext text-xs sm:text-sm mt-0.5">Learn at your own pace with structured video modules & code exercises</p>
              </div>
            </div>

            <Link
              href="/student/courses"
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-all bg-primary/15 hover:bg-primary/25 border border-primary/30 px-3.5 sm:px-4 py-2 rounded-xl shrink-0 shadow-xs"
            >
              <span>View All Self-Paced Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {selfPaced.length === 0 ? (
            <div className="w-full py-12 border-2 border-dashed border-card rounded-2xl flex flex-col items-center justify-center bg-card/20">
              <BookOpen className="w-10 h-10 text-subtext/30 mb-3" />
              <p className="text-text font-bold text-base">No self-paced courses enrolled</p>
              <p className="text-subtext text-xs mt-1 mb-4">Browse video-based courses you can complete at your own schedule.</p>
              <Link href="/courses" className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg transition-colors text-xs flex items-center gap-2">
                Browse Courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {selfPaced.map((course) => {
                const courseImage =
                  course.thumbnail ||
                  (course.title.toLowerCase().includes("generative ai")
                    ? "/images/courses/generative-ai.png"
                    : course.title.toLowerCase().includes("machine learning")
                    ? "/images/courses/ml-math.png"
                    : course.title.toLowerCase().includes("python")
                    ? "/images/courses/python-fundamentals.png"
                    : course.title.toLowerCase().includes("rag") || course.title.toLowerCase().includes("vector")
                    ? "/images/courses/rag-vector-db.png"
                    : "/images/courses/generative-ai.png");

                return (
                  <div key={course.id} className="bg-card border border-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-primary/30 transition-all group flex flex-col">
                    {/* Course Image Header with Scrim */}
                    <div className="h-32 relative overflow-hidden bg-slate-900">
                      <img
                        src={courseImage}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient Scrim for high contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                      {/* Top Right Status Badge */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        {course.status === "COMPLETED" ? (
                          <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 shadow-md">
                            {course.progress}% done
                          </span>
                        )}
                      </div>

                      {/* Bottom Lecture Tag */}
                      <div className="absolute bottom-2 left-3 z-10 flex items-center gap-1.5 text-white text-[11px] font-semibold drop-shadow-md">
                        <div className="w-5 h-5 rounded-full bg-primary/90 backdrop-blur-xs flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-3.5 h-3.5" />
                        </div>
                        <span>{course.completedLectures}/{course.totalLectures} Lectures</span>
                      </div>
                    </div>

                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base text-text line-clamp-1 group-hover:text-primary transition-colors" title={course.title}>
                        {course.title}
                      </h3>
                      <p className="text-subtext text-xs mt-1 flex items-center gap-1.5 opacity-85">
                        <Users className="w-3 h-3 text-accent shrink-0" /> By {course.instructor}
                      </p>

                      {course.lastWatchedLecture && (
                        <p className="text-[11px] text-primary/90 font-medium mt-1 flex items-center gap-1 truncate">
                          <Sparkles className="w-3 h-3 shrink-0" /> Last: {course.lastWatchedLecture}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1.5">
                        <span className={course.progress === 100 ? "text-emerald-500 flex items-center gap-1" : "text-subtext"}>
                          {course.progress === 100 ? (
                            <><CheckCircle className="w-3 h-3" /> Complete</>
                          ) : (
                            `${course.completedLectures}/${course.totalLectures} lectures`
                          )}
                        </span>
                        <span className="text-text font-bold">{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-accent"}`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                      <Link href={`/learn/${course.id}`} className="w-full">
                        <button className="w-full py-2 bg-background hover:bg-primary hover:text-white border border-card group-hover:border-primary/40 text-text rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs h-9 cursor-pointer">
                          <PlayCircle className="w-4 h-4" />
                          <span>{course.progress === 0 ? "Start Learning" : course.progress === 100 ? "Review Material" : "Continue Learning"}</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

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
                        {agendaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {agendaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      <Users className="w-3.5 h-3.5 text-accent" /> Instructor: <strong className="text-text font-semibold">{selectedAgendaClass.instructor}</strong>
                    </span>
                    <span className="text-subtext/40">•</span>
                    <span className="text-subtext flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-400" /> Scheduled: {isToday ? "Today at " : ""}{agendaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>What You'll Learn & Build in this Class</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedAgendaClass.takeaways.map((takeaway, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-card/30 border border-border/50 text-xs text-text">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites & Materials */}
                {selectedAgendaClass.prerequisites && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 block mb-0.5">Prerequisites & Preparation:</strong>
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
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 flex items-center gap-2 transition-colors cursor-pointer"
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
                    : "bg-white/[0.04] text-subtext hover:text-orange-400 hover:bg-white/[0.08]"
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
                    : "bg-white/[0.04] text-subtext hover:text-amber-400 hover:bg-white/[0.08]"
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
                      <div className="p-1 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
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
                          className="bg-card/70 border border-orange-500/30 hover:border-orange-500/60 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3 relative overflow-hidden group transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[10px] font-bold uppercase tracking-wider">
                                {course.batchName}
                              </span>
                              <h5 className="font-extrabold text-base text-text leading-snug">
                                {course.title}
                              </h5>
                              <p className="text-xs text-subtext flex items-center gap-1.5">
                                <Users className="w-3 h-3 text-accent" /> Instructor: <strong className="text-text font-semibold">{course.instructor}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Next Class Schedule Bar */}
                          {nextClass ? (
                            <div className="p-2.5 rounded-xl bg-background/60 border border-border/50 text-xs flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-orange-400 uppercase block">Next Live Session:</span>
                                <span className="font-semibold text-text truncate block">{nextClass.title}</span>
                                <span className="text-[11px] text-subtext">
                                  {isClassToday ? "Today at " : nextDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + " · "}
                                  {nextDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                className="text-orange-400 font-bold hover:underline"
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
                      <div className="p-1 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
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
                          className="bg-card border border-border/70 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group"
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
                              <PlayCircle className="w-3 h-3 text-primary" />
                              <span>{course.completedLectures}/{course.totalLectures} lectures</span>
                            </div>
                          </div>

                          <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                            <div>
                              <h5 className="font-bold text-sm text-text line-clamp-1 group-hover:text-primary transition-colors" title={course.title}>
                                {course.title}
                              </h5>
                              <p className="text-[11px] text-subtext mt-0.5 flex items-center gap-1">
                                <Users className="w-3 h-3 text-accent" /> {course.instructor}
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
                              <button className="w-full py-1.5 bg-background hover:bg-primary hover:text-white border border-border text-text rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-xs cursor-pointer">
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
          <div className="bg-card w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-card animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 flex justify-between items-center border-b border-card bg-background/50">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2 text-text">
                  <Trophy className="w-6 h-6 text-purple-500" /> My Certificates
                </h3>
                <p className="text-sm text-subtext mt-1">Credentials earned from completed courses</p>
              </div>
              <button onClick={() => setIsCertModalOpen(false)} className="p-2 hover:bg-background rounded-full text-subtext hover:text-text transition-colors border border-transparent hover:border-card">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto grid sm:grid-cols-2 gap-6 bg-background/20">
              {certificates.length === 0 ? (
                <div className="col-span-full py-16 flex flex-col items-center text-center text-subtext">
                  <GraduationCap className="w-16 h-16 mb-4 opacity-20 text-purple-500"/>
                  <h4 className="text-lg font-bold text-text">No certificates yet</h4>
                  <p className="text-sm mt-1 max-w-xs">Complete your enrolled courses to unlock beautifully crafted certificates.</p>
                </div>
              ) : certificates.map((cert) => (
                 <div key={cert.id} className="border border-card rounded-2xl p-5 bg-card flex flex-col gap-4 group hover:border-purple-500/30 transition-all shadow-md hover:shadow-xl hover:shadow-purple-500/5 relative overflow-hidden">
                   <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
                   {/* Thumbnail */}
                   <div className="w-full h-36 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200 dark:border-purple-700/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                     <GraduationCap className="w-10 h-10 text-purple-500/50 mb-2" />
                     <div className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-[0.2em]">Certificate of Completion</div>
                     <div className="text-xs font-semibold text-purple-800 dark:text-purple-200 mt-1 truncate px-4 max-w-full italic">{cert.courseTitle}</div>
                   </div>
                   <div className="space-y-1 z-10">
                     <h4 className="font-bold text-text text-sm line-clamp-1" title={cert.courseTitle}>{cert.courseTitle}</h4>
                     <p className="text-xs text-subtext flex items-center justify-between">
                       <span>Issued: {new Date(cert.issueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                     </p>
                   </div>
                   <button className="w-full mt-auto flex items-center justify-center gap-2 py-2.5 bg-background border border-card hover:bg-purple-500 hover:border-purple-500 hover:text-white text-text rounded-xl text-sm font-bold transition-all z-10">
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
