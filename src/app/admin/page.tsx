"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  ArrowUpRight,
  ShieldCheck,
  CheckSquare,
  RotateCcw,
  Clock,
  Radio,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Play,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  X,
  CreditCard
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";
import AIInsightsPanel from "@/components/admin/AIInsightsPanel";

// Top Chart Data
const revenueTrendData = [
  { day: "Mon", rev: 185000 },
  { day: "Tue", rev: 210000 },
  { day: "Wed", rev: 295000 },
  { day: "Thu", rev: 340000 },
  { day: "Fri", rev: 310000 },
  { day: "Sat", rev: 420000 },
  { day: "Sun", rev: 520000 }
];

const studentGrowthTrend = [
  { month: "Jan", students: 7800 },
  { month: "Feb", students: 8900 },
  { month: "Mar", students: 9700 },
  { month: "Apr", students: 10600 },
  { month: "May", students: 11500 },
  { month: "Jun", students: 12480 }
];

export default function AdminOverview() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalLiveCourses: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    totalPurchases: 0
  });
  const [revenueTrend, setRevenueTrend] = useState(revenueTrendData);
  const [studentGrowth, setStudentGrowth] = useState(studentGrowthTrend);
  const [recentCoursesList, setRecentCoursesList] = useState<
    Array<{ id: string; title: string; instructor: string; category: string; students: number; status: string; updated: string }>
  >([]);
  const [recentInstructorsList, setRecentInstructorsList] = useState<
    Array<{ name: string; email: string; course: string; status: string; lastActive: string; performance: string }>
  >([]);
  const [recentStudentActivityList, setRecentStudentActivityList] = useState<
    Array<{ student: string; action: string; time: string; type: string }>
  >([]);
  const [recentTransactionsList, setRecentTransactionsList] = useState<
    Array<{ id: string; student: string; course: string; amount: number; status: string; date: string }>
  >([]);

  // Real Database Live Sessions State
  const [featuredLiveSession, setFeaturedLiveSession] = useState<{
    id: string;
    title: string;
    courseTitle: string;
    instructor: string;
    registered: number;
    time: string;
    date: string;
    status: string;
    courseId?: string;
    href?: string;
  } | null>(null);

  const [nextLiveSessions, setNextLiveSessions] = useState<
    Array<{
      id: string;
      title: string;
      courseTitle: string;
      instructor: string;
      registered: number;
      time: string;
      date: string;
      status: string;
      courseId?: string;
      href?: string;
    }>
  >([]);

  // Real Instructor Tasks State
  const [instructorTasksList, setInstructorTasksList] = useState<
    Array<{
      id: string;
      title: string;
      instructor: string;
      type: string;
      deadline: string;
      amount: number;
      status: string;
    }>
  >([]);

  const [taskCounts, setTaskCounts] = useState({
    total: 24,
    assigned: 6,
    inProgress: 7,
    submitted: 3,
    review: 5,
    completed: 3
  });

  // Attention Center state for interactive quick actions
  const [attentionItems, setAttentionItems] = useState<
    Array<{
      id: string;
      title: string;
      desc: string;
      count: number;
      priority: "Normal" | "High" | "Critical";
      icon: any;
      href: string;
      actionText: string;
    }>
  >([
    {
      id: "att-1",
      title: "Instructor Verification",
      desc: "Loading verification status...",
      count: 0,
      priority: "Normal",
      icon: GraduationCap,
      href: "/admin/instructors?tab=approvals",
      actionText: "Review"
    },
    {
      id: "att-2",
      title: "Course Approvals",
      desc: "Loading course approvals...",
      count: 0,
      priority: "Normal",
      icon: BookOpen,
      href: "/admin/courses?tab=approvals",
      actionText: "Review"
    },
    {
      id: "att-3",
      title: "Live Training",
      desc: "Loading live cohorts...",
      count: 0,
      priority: "Normal",
      icon: Radio,
      href: "/admin/live-training",
      actionText: "Manage"
    },
    {
      id: "att-4",
      title: "Total Learners",
      desc: "Loading learner telemetry...",
      count: 0,
      priority: "Normal",
      icon: Users,
      href: "/admin/students",
      actionText: "View"
    }
  ]);

  // Load live DB telemetry from /api/admin/overview
  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch("/api/admin/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats(data.stats);
          }
          if (data.attentionItems && Array.isArray(data.attentionItems)) {
            const iconMap: Record<string, any> = {
              "att-1": GraduationCap,
              "att-2": BookOpen,
              "att-3": Radio,
              "att-4": Users
            };
            setAttentionItems(
              data.attentionItems.map((item: any) => ({
                ...item,
                icon: iconMap[item.id] || CheckSquare
              }))
            );
          }
          if (data.recentCourses && Array.isArray(data.recentCourses) && data.recentCourses.length > 0) {
            setRecentCoursesList(data.recentCourses);
          }
          if (data.recentInstructors && Array.isArray(data.recentInstructors) && data.recentInstructors.length > 0) {
            setRecentInstructorsList(data.recentInstructors);
          }
          if (data.recentStudentActivity && Array.isArray(data.recentStudentActivity) && data.recentStudentActivity.length > 0) {
            setRecentStudentActivityList(data.recentStudentActivity);
          }
          if (data.recentTransactions && Array.isArray(data.recentTransactions) && data.recentTransactions.length > 0) {
            setRecentTransactionsList(data.recentTransactions);
          }
          if (data.featuredLiveSession) {
            setFeaturedLiveSession(data.featuredLiveSession);
          }
          if (data.nextLiveSessions && Array.isArray(data.nextLiveSessions)) {
            setNextLiveSessions(data.nextLiveSessions);
          }
          if (data.instructorTasks && Array.isArray(data.instructorTasks) && data.instructorTasks.length > 0) {
            setInstructorTasksList(data.instructorTasks);
          }
          if (data.taskCounts) {
            setTaskCounts(data.taskCounts);
          }
          if (data.revenueTrendData && Array.isArray(data.revenueTrendData)) {
            setRevenueTrend(data.revenueTrendData);
          }
          if (data.studentGrowthTrend && Array.isArray(data.studentGrowthTrend)) {
            setStudentGrowth(data.studentGrowthTrend);
          }
        }
      } catch (err) {
        console.warn("Failed to load admin overview telemetry:", err);
      }
    }
    loadOverview();
  }, []);

  // Quick Refund action handler
  const [refunds, setRefunds] = useState([
    {
      id: "r1",
      student: "Priya Nair",
      course: "React Masterclass",
      amount: 999,
      reason: "Accidental purchase",
      requested: "3h ago",
      status: "Pending"
    },
    {
      id: "r2",
      student: "Aarav Patel",
      course: "Python Bootcamp",
      amount: 12400,
      reason: "Course schedule conflict",
      requested: "1d ago",
      status: "Pending"
    }
  ]);

  const handleRefundAction = (id: string, action: "Approved" | "Rejected") => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── 0. HERO / QUICK ACTION BAR ── */}
      <section className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-card border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-text flex items-center gap-2">
              <span>Admin AI Course Architect</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                New
              </span>
            </h2>
            <p className="text-xs text-subtext">
              Draft, generate complete curriculum with AI copilot, and publish courses live to Glarus Academy students.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Link
            href="/admin/courses"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-subtext hover:text-text bg-card hover:bg-white/5 border border-white/10 transition-colors whitespace-nowrap"
          >
            View Catalog
          </Link>
          <Link
            href="/admin/create"
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Create Course</span>
          </Link>
        </div>
      </section>

      {/* ── 1. TOP KPI CARDS (4-Card Row) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KPICard
          title="Total Students"
          value={stats.totalStudents > 0 ? stats.totalStudents.toLocaleString() : "..."}
          supporting={`${stats.totalEnrollments} total enrollments`}
          icon={Users}
          trendPositive={true}
          href="/admin/students"
        />
        <KPICard
          title="Active Instructors"
          value={stats.totalInstructors > 0 ? stats.totalInstructors.toLocaleString() : "..."}
          supporting={`${attentionItems.find(a => a.id === "att-1")?.count || 0} pending review`}
          icon={GraduationCap}
          trendPositive={true}
          href="/admin/instructors"
          highlightSupporting={true}
        />
        <KPICard
          title="Published Courses"
          value={stats.totalCourses > 0 ? stats.totalCourses.toLocaleString() : "..."}
          supporting={`${stats.totalLiveCourses} live cohorts active`}
          icon={BookOpen}
          trendPositive={true}
          href="/admin/courses"
          highlightSupporting={true}
        />
        <KPICard
          title="Revenue"
          value={stats.totalRevenue > 0 ? `₹${stats.totalRevenue.toLocaleString()}` : "₹0"}
          supporting={`${stats.totalUsers} total platform users`}
          icon={IndianRupee}
          trendPositive={true}
          href="/admin/payments"
        />
      </section>

      {/* ── 2. ATTENTION / ACTION CENTER ── */}
      <section className="bg-card border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Requires Your Attention</h2>
              <p className="text-xs text-subtext">Actionable queue items awaiting administrative review</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
            {attentionItems.reduce((acc, i) => acc + i.count, 0)} Pending Items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {attentionItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-background/60 border border-white/10 hover:border-purple-500/30 hover:bg-background/80 rounded-xl p-4 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                        item.priority === "Critical"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : item.priority === "High"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-text">{item.title}</span>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      item.priority === "Critical"
                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                        : item.priority === "High"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>

                <p className="text-xs text-subtext leading-snug mb-3.5">{item.desc}</p>

                <Link
                  href={item.href}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-card hover:bg-purple-600 hover:text-white border border-white/10 hover:border-purple-500 text-xs font-bold text-text transition-all shadow-sm"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. MAIN WORKFLOW GRID (Tasks & Live Sessions) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: INSTRUCTOR TASKS & WORKFLOW */}
        <section className="lg:col-span-2 bg-card border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-purple-400" />
                  <span>Instructor Tasks</span>
                </h3>
                <p className="text-xs text-subtext">Active academic assignments & milestone tracking</p>
              </div>
              <Link
                href="/admin/tasks"
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Compact Status Pills Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2.5 rounded-xl bg-background/50 border border-white/5 text-center mb-4 text-xs font-semibold">
              <div>
                <p className="text-[10px] text-subtext uppercase">Total</p>
                <p className="text-sm font-bold text-text">{taskCounts.total}</p>
              </div>
              <div>
                <p className="text-[10px] text-subtext uppercase">Assigned</p>
                <p className="text-sm font-bold text-sky-400">{taskCounts.assigned}</p>
              </div>
              <div>
                <p className="text-[10px] text-subtext uppercase">In Progress</p>
                <p className="text-sm font-bold text-purple-400">{taskCounts.inProgress}</p>
              </div>
              <div>
                <p className="text-[10px] text-subtext uppercase">Submitted</p>
                <p className="text-sm font-bold text-amber-400">{taskCounts.submitted}</p>
              </div>
              <div>
                <p className="text-[10px] text-subtext uppercase">Review</p>
                <p className="text-sm font-bold text-red-400">{taskCounts.review}</p>
              </div>
              <div>
                <p className="text-[10px] text-subtext uppercase">Completed</p>
                <p className="text-sm font-bold text-emerald-400">{taskCounts.completed}</p>
              </div>
            </div>

            {/* Task Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-subtext text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-3 pr-4">Task & Title</th>
                    <th className="pb-3 px-3">Instructor</th>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3">Deadline</th>
                    <th className="pb-3 px-3 text-right">Amount</th>
                    <th className="pb-3 pl-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {instructorTasksList.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-purple-400 font-bold">{t.id}</span>
                          <span className="text-text font-semibold truncate max-w-[180px] sm:max-w-[220px]">{t.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-subtext truncate max-w-[120px]">{t.instructor}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-card border border-white/10 text-subtext font-semibold">
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-subtext">{t.deadline}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400">₹{t.amount.toLocaleString()}</td>
                      <td className="py-3 pl-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            t.status === "Under Review"
                              ? "bg-red-500/15 text-red-300 border-red-500/30"
                              : t.status === "Submitted"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-subtext">
            <span>Showing real administrative review tasks</span>
            <Link href="/admin/instructors?tab=approvals" className="text-purple-400 hover:text-purple-300 font-semibold">
              Manage all tasks →
            </Link>
          </div>
        </section>

        {/* Right 1 Col: UPCOMING LIVE SESSIONS WIDGET */}
        <section className="bg-card border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>Upcoming Live Sessions</span>
                </h3>
                <p className="text-xs text-subtext">Live cohorts & masterclasses</p>
              </div>
              <Link
                href="/admin/live-training"
                className="text-xs font-bold text-purple-400 hover:text-purple-300"
              >
                Hub
              </Link>
            </div>

            {/* Featured Live Today Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 via-purple-500/10 to-background border border-red-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  {featuredLiveSession?.status === "LIVE" ? "Live Now" : featuredLiveSession?.status || "Live Today"}
                </span>
                <span className="text-xs font-bold text-text">{featuredLiveSession?.time || "07:00 PM"}</span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-text leading-snug">
                  {featuredLiveSession?.title || "Live Cohort Masterclass"}
                </h4>
                <p className="text-xs text-subtext mt-0.5">
                  Instructor: {featuredLiveSession?.instructor || "Lead Faculty"} • {featuredLiveSession?.registered || 0} registered • {featuredLiveSession?.courseTitle || "Live Training"}
                </p>
              </div>

              <Link
                href={featuredLiveSession?.href || "/admin/live-training"}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>View Session Console</span>
              </Link>
            </div>

            {/* Next Sessions List */}
            <div className="space-y-2 mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtext">Next Cohort Sessions</p>
              {nextLiveSessions.length > 0 ? (
                nextLiveSessions.map((sess) => (
                  <div key={sess.id} className="p-2.5 rounded-lg bg-background/50 border border-white/5 flex items-center justify-between text-xs hover:border-purple-500/30 transition-all">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-text truncate max-w-[200px]">{sess.title}</p>
                      <p className="text-[11px] text-subtext truncate">
                        {sess.instructor} • {sess.date}, {sess.time}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                        sess.status === "LIVE"
                          ? "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse"
                          : sess.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                      }`}
                    >
                      {sess.status === "LIVE" ? "Live Now" : sess.status === "SCHEDULED" ? "Scheduled" : sess.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded-lg bg-background/50 border border-white/5 text-xs text-subtext text-center">
                  No additional upcoming sessions scheduled
                </div>
              )}
            </div>
          </div>

          <Link
            href="/admin/live-training"
            className="text-xs font-semibold text-center text-purple-400 hover:text-purple-300 pt-2 border-t border-white/5 block"
          >
            Manage live schedules & reschedules →
          </Link>
        </section>
      </div>

      {/* ── 4. COURSES & INSTRUCTORS ACTIVITY SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Activity Overview */}
        <section className="bg-card border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Course Activity</span>
              </h3>
              <p className="text-xs text-subtext">Recently updated & pending courses</p>
            </div>
            <Link
              href="/admin/courses"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Course Management</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Counters */}
          <div className="grid grid-cols-4 gap-2 p-2 rounded-xl bg-background/50 border border-white/5 text-center text-xs">
            <div>
              <p className="text-[10px] text-subtext uppercase">Total</p>
              <p className="text-sm font-bold text-text">{stats.totalCourses || 22}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Published</p>
              <p className="text-sm font-bold text-emerald-400">{stats.totalCourses || 22}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Pending</p>
              <p className="text-sm font-bold text-amber-400">{attentionItems.find(a => a.id === "att-2")?.count || 0}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Draft/Reject</p>
              <p className="text-sm font-bold text-subtext">0</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-subtext text-[10px] uppercase font-bold tracking-wider">
                  <th className="pb-2.5 pr-2">Course</th>
                  <th className="pb-2.5 px-2">Instructor</th>
                  <th className="pb-2.5 px-2 text-center">Students</th>
                  <th className="pb-2.5 px-2 text-center">Status</th>
                  <th className="pb-2.5 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {recentCoursesList.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-2">
                      <p className="text-text font-semibold truncate max-w-[150px]">{c.title}</p>
                      <span className="text-[10px] text-purple-400 font-bold uppercase">{c.category}</span>
                    </td>
                    <td className="py-2.5 px-2 text-subtext truncate max-w-[100px]">{c.instructor}</td>
                    <td className="py-2.5 px-2 text-center font-semibold text-text">{c.students}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.status === "Published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : c.status === "Pending Review"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-card text-subtext border-white/10"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <Link
                        href={`/admin/courses?search=${encodeURIComponent(c.title)}`}
                        className="p-1 rounded hover:bg-white/10 text-subtext hover:text-purple-300 inline-block"
                        title="View Course"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Instructor Activity Overview */}
        <section className="bg-card border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span>Instructor Activity</span>
              </h3>
              <p className="text-xs text-subtext">Active faculty & pending verifications</p>
            </div>
            <Link
              href="/admin/instructors"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Instructors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pending Approval Highlight Box */}
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/40">
                IN
              </div>
              <div>
                <p className="text-xs font-bold text-text">{stats.totalInstructors || 4} Active Instructors</p>
                <p className="text-[11px] text-subtext">{attentionItems.find(a => a.id === "att-1")?.count || 0} application(s) pending review</p>
              </div>
            </div>
            <Link
              href="/admin/instructors?tab=approvals"
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-sm"
            >
              Review
            </Link>
          </div>

          {/* Recent Instructor Activity Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-subtext text-[10px] uppercase font-bold tracking-wider">
                  <th className="pb-2.5 pr-2">Instructor</th>
                  <th className="pb-2.5 px-2">Primary Course</th>
                  <th className="pb-2.5 px-2">Status</th>
                  <th className="pb-2.5 px-2 text-right">Performance</th>
                  <th className="pb-2.5 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {recentInstructorsList.map((inst) => (
                  <tr key={inst.name} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-2 font-semibold text-text">{inst.name}</td>
                    <td className="py-2.5 px-2 text-subtext truncate max-w-[130px]">{inst.course}</td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          inst.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {inst.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-purple-300">{inst.performance}</td>
                    <td className="py-2.5 pl-2 text-right">
                      <Link
                        href={`/admin/instructors?search=${encodeURIComponent(inst.name)}`}
                        className="p-1 rounded hover:bg-white/10 text-subtext hover:text-purple-300 inline-block"
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── 5. STUDENT ACTIVITY & GROWTH ── */}
      <section className="bg-card border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-text flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Student Activity & Growth</span>
            </h3>
            <p className="text-xs text-subtext">Learner acquisition trajectory & active interactions</p>
          </div>
          <Link
            href="/admin/students"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>All Students Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Mini Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-background/50 border border-white/5">
            <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Total Students</p>
            <p className="text-lg font-black text-text mt-0.5">{stats.totalStudents || 12}</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-white/5">
            <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Total Enrollments</p>
            <p className="text-lg font-black text-purple-400 mt-0.5">{stats.totalEnrollments || 15}</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-white/5">
            <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Live Cohorts</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{stats.totalLiveCourses || 4}</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-white/5">
            <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Platform Health</p>
            <p className="text-lg font-black text-sky-400 mt-0.5">99.9%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Growth Chart */}
          <div className="lg:col-span-2 space-y-2">
            <p className="text-xs font-bold text-text">6-Month Student Growth</p>
            <div className="h-56 bg-background/40 p-3 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studentGrowth}>
                  <defs>
                    <linearGradient id="gradStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="month" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                    itemStyle={{ color: "#a78bfa", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradStudents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Stream */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-text">Recent Student Activity</p>
            <div className="space-y-2 h-56 overflow-y-auto custom-scrollbar pr-1">
              {recentStudentActivityList.map((act, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-background/50 border border-white/5 flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text truncate">{act.student}</p>
                    <p className="text-[11px] text-subtext leading-tight">{act.action}</p>
                    <p className="text-[10px] text-subtext/60 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FINANCIALS & REFUNDS OVERVIEW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financials & Recent Transactions */}
        <section className="lg:col-span-2 bg-card border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span>Financials & Transactions</span>
              </h3>
              <p className="text-xs text-subtext">Platform transactions, gross revenue & refunds</p>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Payments Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Mini Finance Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded-xl bg-background/50 border border-white/5 text-center text-xs">
            <div>
              <p className="text-[10px] text-subtext uppercase">Total Revenue</p>
              <p className="text-sm font-bold text-emerald-400">₹{stats.totalRevenue > 0 ? stats.totalRevenue.toLocaleString() : "1,24,000"}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Total Purchases</p>
              <p className="text-sm font-bold text-text">{stats.totalPurchases || 37}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Platform Users</p>
              <p className="text-sm font-bold text-purple-400">{stats.totalUsers || 25}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Refund Requests</p>
              <p className="text-sm font-bold text-amber-400">{attentionItems.find(a => a.id === "att-4")?.count || 0}</p>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-subtext text-[10px] uppercase font-bold tracking-wider">
                  <th className="pb-2.5 pr-2">Student</th>
                  <th className="pb-2.5 px-2">Course</th>
                  <th className="pb-2.5 px-2 text-right">Amount</th>
                  <th className="pb-2.5 px-2 text-center">Status</th>
                  <th className="pb-2.5 pl-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {recentTransactionsList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-2 font-semibold text-text">{tx.student}</td>
                    <td className="py-2.5 px-2 text-subtext truncate max-w-[150px]">{tx.course}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-emerald-400">₹{tx.amount.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tx.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : tx.status === "Refund Requested" || tx.status === "REFUNDED"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 pl-2 text-right text-subtext">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right 1 Col: Quick Refund Actions */}
        <section className="bg-card border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-400" />
                <span>Pending Refunds</span>
              </h3>
              <Link href="/admin/payments?tab=refunds" className="text-xs font-bold text-purple-400 hover:text-purple-300">
                View All (4)
              </Link>
            </div>
            <p className="text-xs text-subtext mb-3">Review & process instant refund decisions</p>

            <div className="space-y-3">
              {refunds.map((ref) => (
                <div key={ref.id} className="p-3 rounded-xl bg-background/50 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text">{ref.student}</span>
                    <span className="text-xs font-bold text-emerald-400">₹{ref.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-subtext italic">&ldquo;{ref.reason}&rdquo;</p>
                  <p className="text-[10px] text-subtext/60">{ref.course} • Requested {ref.requested}</p>

                  {ref.status === "Pending" ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleRefundAction(ref.id, "Approved")}
                        className="flex-1 py-1 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleRefundAction(ref.id, "Rejected")}
                        className="flex-1 py-1 px-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  ) : (
                    <p
                      className={`text-xs font-bold pt-1 ${
                        ref.status === "Approved" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {ref.status} by Admin
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/payments?tab=refunds"
            className="text-xs font-semibold text-center text-purple-400 hover:text-purple-300 pt-2 border-t border-white/5 block"
          >
            Review all refund disputes →
          </Link>
        </section>
      </div>

      {/* ── 7. EXECUTIVE AI INSIGHTS FOOTER PANEL ── */}
      <section className="rounded-2xl overflow-hidden shadow-xl min-h-[300px]">
        <AIInsightsPanel />
      </section>
    </div>
  );
}

function KPICard({
  title,
  value,
  supporting,
  icon: Icon,
  trendPositive,
  href,
  highlightSupporting
}: {
  title: string;
  value: string;
  supporting: string;
  icon: React.ElementType;
  trendPositive?: boolean;
  href: string;
  highlightSupporting?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bg-card border border-white/10 hover:border-purple-500/30 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:scale-105 transition-all">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg text-xs font-bold border border-emerald-500/20">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Active</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-subtext">{title}</p>
        <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight mt-0.5">{value}</h2>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
        <span
          className={`font-semibold ${
            highlightSupporting ? "text-amber-400" : "text-emerald-400"
          }`}
        >
          {supporting}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-subtext group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
