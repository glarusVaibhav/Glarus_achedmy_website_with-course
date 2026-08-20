"use client";

import React, { useState } from "react";
import {
  Activity,
  Calendar,
  DownloadCloud,
  TrendingUp,
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  Sparkles,
  ArrowUpRight,
  Radio,
  Clock,
  Filter
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y" | "custom";

const studentGrowthData = [
  { name: "Week 1", students: 11200, active: 8100 },
  { name: "Week 2", students: 11650, active: 8400 },
  { name: "Week 3", students: 12050, active: 8900 },
  { name: "Week 4", students: 12480, active: 9400 }
];

const revenueData = [
  { month: "Jan", revenue: 1250000, target: 1100000 },
  { month: "Feb", revenue: 1420000, target: 1300000 },
  { month: "Mar", revenue: 1580000, target: 1500000 },
  { month: "Apr", revenue: 1690000, target: 1600000 },
  { month: "May", revenue: 1740000, target: 1700000 },
  { month: "Jun", revenue: 1840000, target: 1800000 }
];

const courseEnrollmentData = [
  { course: "AI Agents", enrolled: 1842, completionRate: 74 },
  { course: "React 19", enrolled: 967, completionRate: 68 },
  { course: "Next.js 14", enrolled: 840, completionRate: 82 },
  { course: "Python DS", enrolled: 3120, completionRate: 62 },
  { course: "Cloud Dev", enrolled: 1200, completionRate: 58 }
];

const liveAttendanceData = [
  { session: "Sess 1", registered: 120, attended: 104 },
  { session: "Sess 2", registered: 95, attended: 88 },
  { session: "Sess 3", registered: 140, attended: 126 },
  { session: "Sess 4", registered: 160, attended: 142 }
];

const categoryDistribution = [
  { name: "AI & ML", value: 45, color: "#8b5cf6" },
  { name: "Full-Stack Web", value: 30, color: "#3b82f6" },
  { name: "Cloud & DevOps", value: 15, color: "#10b981" },
  { name: "Design & UX", value: 10, color: "#f59e0b" }
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  return (
    <div className="space-y-6 pb-12">
      {/* Time Filter Controls & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <div className="flex bg-card p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar shrink-0">
            {(
              [
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "3m", label: "3 Months" },
                { id: "6m", label: "6 Months" },
                { id: "1y", label: "1 Year" },
                { id: "custom", label: "Custom" }
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  timeRange === t.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-subtext hover:text-text hover:bg-white/5"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button className="px-3.5 py-2 rounded-xl bg-card border border-white/10 text-xs font-semibold text-subtext hover:text-text hover:bg-card-hover flex items-center gap-1.5 shadow-sm shrink-0">
            <DownloadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* 6 Top Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase">Gross Revenue</p>
          <h3 className="text-lg sm:text-xl font-black text-emerald-400 mt-1">₹18.4L</h3>
          <span className="text-[10px] text-emerald-400 font-bold">+12.8%</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase">Total Students</p>
          <h3 className="text-lg sm:text-xl font-black text-text mt-1">12,480</h3>
          <span className="text-[10px] text-purple-400 font-bold">+8.4%</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase">Active Faculty</p>
          <h3 className="text-lg sm:text-xl font-black text-text mt-1">84</h3>
          <span className="text-[10px] text-subtext font-bold">98% verified</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase">Total Courses</p>
          <h3 className="text-lg sm:text-xl font-black text-text mt-1">126</h3>
          <span className="text-[10px] text-emerald-400 font-bold">112 live</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase">Enrollment Rate</p>
          <h3 className="text-lg sm:text-xl font-black text-sky-400 mt-1">24.2%</h3>
          <span className="text-[10px] text-sky-400 font-bold">+3.1%</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase">Completion Rate</p>
          <h3 className="text-lg sm:text-xl font-black text-purple-400 mt-1">68.4%</h3>
          <span className="text-[10px] text-purple-400 font-bold">+4.5%</span>
        </div>
      </div>

      {/* Row 1 Charts: Student Growth vs Revenue Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Student Acquisition & Daily Actives</h3>
              <p className="text-xs text-subtext">Total enrollment vs active cohort interactions</p>
            </div>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Active Trend
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentGrowthData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                  itemStyle={{ color: "#a78bfa", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorStudents)" />
                <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trajectory */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Revenue Trajectory vs Target</h3>
              <p className="text-xs text-subtext">Gross platform earnings in INR (₹)</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              +12.8% YoY
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="month" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#666"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                  itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#374151" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Course Completion Dropoff & Live Attendance & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Completion & Dropoff */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text">Course Completion Rates</h3>
            <p className="text-xs text-subtext">Completion percentage by top course</p>
          </div>

          <div className="space-y-3 pt-2">
            {courseEnrollmentData.map((c) => (
              <div key={c.course} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text">{c.course}</span>
                  <span className="font-bold text-purple-300">{c.completionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full ${
                      c.completionRate >= 75
                        ? "bg-emerald-500"
                        : c.completionRate >= 65
                        ? "bg-purple-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${c.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Attendance Trends */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text">Live Session Turnout</h3>
            <p className="text-xs text-subtext">Registered vs actual live attendees</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={liveAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="session" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                />
                <Bar dataKey="registered" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attended" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Distribution */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text">Category Enrollment Share</h3>
            <p className="text-xs text-subtext">Learner distribution across technical disciplines</p>
          </div>

          <div className="space-y-3 pt-2">
            {categoryDistribution.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-semibold text-text">{cat.name}</span>
                </div>
                <span className="font-bold text-text">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
