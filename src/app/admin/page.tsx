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

  // Attention Center state for interactive quick actions
  const [attentionItems, setAttentionItems] = useState([
    {
      id: "att-1",
      title: "Instructor Verification",
      desc: "3 instructors waiting for verification",
      count: 3,
      priority: "High" as const,
      icon: GraduationCap,
      href: "/admin/instructors?tab=approvals",
      actionText: "Review"
    },
    {
      id: "att-2",
      title: "Course Approvals",
      desc: "5 courses waiting for approval",
      count: 5,
      priority: "High" as const,
      icon: BookOpen,
      href: "/admin/courses?tab=approvals",
      actionText: "Review"
    },
    {
      id: "att-3",
      title: "Instructor Tasks",
      desc: "8 tasks awaiting admin review",
      count: 8,
      priority: "Critical" as const,
      icon: CheckSquare,
      href: "/admin/tasks?tab=under_review",
      actionText: "Review"
    },
    {
      id: "att-4",
      title: "Refund Requests",
      desc: "4 refund requests require action",
      count: 4,
      priority: "Normal" as const,
      icon: RotateCcw,
      href: "/admin/payments?tab=refunds",
      actionText: "Review"
    }
  ]);

  // Instructor Tasks Sample Data
  const recentTasks = [
    {
      id: "TSK-1042",
      title: "AI Bootcamp: Multi-Agent System Review",
      instructor: "Alex Chen",
      type: "Conduct Live Session",
      deadline: "20 Aug",
      amount: 5000,
      status: "Under Review"
    },
    {
      id: "TSK-1043",
      title: "Develop RAG Pipeline Curriculum",
      instructor: "Dr. Sarah Chen",
      type: "Create Course",
      deadline: "28 Aug",
      amount: 15000,
      status: "In Progress"
    },
    {
      id: "TSK-1044",
      title: "Build Python Interactive Labs",
      instructor: "Jessica Lin",
      type: "Create Material",
      deadline: "18 Aug",
      amount: 8500,
      status: "Submitted"
    }
  ];

  // Recently Updated Courses
  const recentCourses = [
    {
      id: "c-1",
      title: "Advanced AI Agents & Autonomous Workflows",
      instructor: "Dr. Sarah Chen",
      category: "AI & ML",
      students: 1842,
      status: "Published",
      updated: "Today, 10:30 AM"
    },
    {
      id: "c-2",
      title: "Mastering Next.js 14 App Router & SSR",
      instructor: "Jordan Walke",
      category: "Web Dev",
      students: 0,
      status: "Pending Review",
      updated: "1 day ago"
    },
    {
      id: "c-3",
      title: "React 19 Enterprise Architecture",
      instructor: "John Doe",
      category: "Frontend",
      students: 967,
      status: "Published",
      updated: "2 days ago"
    },
    {
      id: "c-4",
      title: "Quantum Computing Basics",
      instructor: "Alice Smith",
      category: "Computer Science",
      students: 0,
      status: "Draft",
      updated: "3 days ago"
    }
  ];

  // Recent Instructor Activity
  const recentInstructors = [
    {
      name: "Dr. Sarah Chen",
      course: "Advanced AI Agents",
      status: "Active",
      lastActive: "15m ago",
      performance: "98% (4.9 ★)"
    },
    {
      name: "Alex Chen",
      course: "Autonomous RAG",
      status: "Pending Verification",
      lastActive: "2h ago",
      performance: "Evaluating"
    },
    {
      name: "John Doe",
      course: "React Masterclass",
      status: "Active",
      lastActive: "4h ago",
      performance: "94% (4.7 ★)"
    }
  ];

  // Recent Student Activity
  const recentStudentActivity = [
    {
      student: "Aarav Patel",
      action: "New Enrollment in Python Bootcamp",
      time: "10m ago",
      type: "enroll"
    },
    {
      student: "Lucas Martin",
      action: "Earned Certificate: Advanced AI Engineering",
      time: "42m ago",
      type: "cert"
    },
    {
      student: "Priya Nair",
      action: "Submitted Capstone Assignment (React 19)",
      time: "2h ago",
      type: "assignment"
    },
    {
      student: "Meera Gupta",
      action: "Completed Section 4: Cloud Serverless",
      time: "3h ago",
      type: "complete"
    }
  ];

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
      {/* ── 1. TOP KPI CARDS (4-Card Row) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KPICard
          title="Total Students"
          value="12,480"
          supporting="+8.4% this month"
          icon={Users}
          trendPositive={true}
          href="/admin/students"
        />
        <KPICard
          title="Active Instructors"
          value="84"
          supporting="3 pending approvals"
          icon={GraduationCap}
          trendPositive={true}
          href="/admin/instructors"
          highlightSupporting={true}
        />
        <KPICard
          title="Published Courses"
          value="126"
          supporting="8 pending review"
          icon={BookOpen}
          trendPositive={true}
          href="/admin/courses"
          highlightSupporting={true}
        />
        <KPICard
          title="Revenue"
          value="₹18.4L"
          supporting="+12.8% this month"
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
                <p className="text-sm font-bold text-text">24</p>
              </div>
              <div>
                <p className="text-[10px] text-subtext uppercase">Assigned</p>
                <p className="text-sm font-bold text-sky-400">6</p>
              </div>
              <div>
                <p className="text-[10px] text-subtext uppercase">In Progress</p>
                <p className="text-sm font-bold text-purple-400">7</p>
              </div>
              <div>
                <p className="text-[10px] text-subtext uppercase">Submitted</p>
                <p className="text-sm font-bold text-amber-400">3</p>
              </div>
              <div>
                <p className="text-[10px] text-subtext uppercase">Review</p>
                <p className="text-sm font-bold text-red-400">5</p>
              </div>
              <div>
                <p className="text-[10px] text-subtext uppercase">Completed</p>
                <p className="text-sm font-bold text-emerald-400">3</p>
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
                  {recentTasks.map((t) => (
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
            <span>Showing top 3 urgent tasks</span>
            <Link href="/admin/tasks" className="text-purple-400 hover:text-purple-300 font-semibold">
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
                href="/admin/instructors?tab=live"
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
                  Live Today
                </span>
                <span className="text-xs font-bold text-text">7:00 PM</span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-text leading-snug">
                  Advanced RAG Architecture & Evaluation
                </h4>
                <p className="text-xs text-subtext mt-0.5">Instructor: Alex Chen • 84 registered</p>
              </div>

              <Link
                href="/admin/instructors?tab=live"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>View Session Console</span>
              </Link>
            </div>

            {/* Next Sessions List */}
            <div className="space-y-2 mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtext">Tomorrow & Later</p>
              <div className="p-2.5 rounded-lg bg-background/50 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-text truncate max-w-[170px]">Next.js Streaming Deep Dive</p>
                  <p className="text-[11px] text-subtext">Jordan Walke • Tomorrow, 6:00 PM</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Scheduled
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-background/50 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-text truncate max-w-[170px]">AI Agents Multi-Modal</p>
                  <p className="text-[11px] text-subtext">Dr. Sarah Chen • Friday, 7:30 PM</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/instructors?tab=live"
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
              <p className="text-sm font-bold text-text">126</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Published</p>
              <p className="text-sm font-bold text-emerald-400">112</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Pending</p>
              <p className="text-sm font-bold text-amber-400">8</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Draft/Reject</p>
              <p className="text-sm font-bold text-subtext">6</p>
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
                {recentCourses.map((c) => (
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
                AC
              </div>
              <div>
                <p className="text-xs font-bold text-text">Alex Chen</p>
                <p className="text-[11px] text-subtext">Application submitted 2 hours ago • Autonomous Workflows</p>
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
                {recentInstructors.map((inst) => (
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
            <p className="text-lg font-black text-text mt-0.5">12,480</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-white/5">
            <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Active This Week</p>
            <p className="text-lg font-black text-purple-400 mt-0.5">8,410</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-white/5">
            <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">New This Month</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">+980</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-white/5">
            <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Completion Rate</p>
            <p className="text-lg font-black text-sky-400 mt-0.5">68.4%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Growth Chart */}
          <div className="lg:col-span-2 space-y-2">
            <p className="text-xs font-bold text-text">6-Month Student Growth</p>
            <div className="h-56 bg-background/40 p-3 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studentGrowthTrend}>
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
              {recentStudentActivity.map((act, i) => (
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
              <p className="text-sm font-bold text-emerald-400">₹18.4L</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">This Month</p>
              <p className="text-sm font-bold text-text">₹4.2L</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Pending Payouts</p>
              <p className="text-sm font-bold text-amber-400">₹85,000</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Refund Requests</p>
              <p className="text-sm font-bold text-red-400">4 Active</p>
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
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 pr-2 font-semibold text-text">Aarav Patel</td>
                  <td className="py-2.5 px-2 text-subtext">Python Bootcamp</td>
                  <td className="py-2.5 px-2 text-right font-bold text-emerald-400">₹12,400</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Completed
                    </span>
                  </td>
                  <td className="py-2.5 pl-2 text-right text-subtext">Today</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 pr-2 font-semibold text-text">Lucas Martin</td>
                  <td className="py-2.5 px-2 text-subtext">Advanced AI Engineering</td>
                  <td className="py-2.5 px-2 text-right font-bold text-emerald-400">₹8,990</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Completed
                    </span>
                  </td>
                  <td className="py-2.5 pl-2 text-right text-subtext">Yesterday</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 pr-2 font-semibold text-text">Priya Nair</td>
                  <td className="py-2.5 px-2 text-subtext">React Masterclass</td>
                  <td className="py-2.5 px-2 text-right font-bold text-amber-400">₹999</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Refund Requested
                    </span>
                  </td>
                  <td className="py-2.5 pl-2 text-right text-subtext">Yesterday</td>
                </tr>
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
