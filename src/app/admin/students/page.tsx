"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Eye,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Pencil,
  Mail,
  Ban,
  Clock,
  TrendingUp,
  X,
  CreditCard,
  FileText,
  Activity,
  ChevronRight,
  Sparkles,
  Check,
  Percent,
  Loader2
} from "lucide-react";

export type StudentTab = "all" | "progress" | "enrollments" | "certificates";

interface StudentItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourses: {
    id: string;
    title: string;
    progress: number;
    enrolledDate: string;
    completed: boolean;
  }[];
  totalSpent: number;
  assignmentsSubmitted: number;
  quizScoreAvg: number;
  certificatesEarned: number;
  lastActive: string;
  status: "Active" | "At Risk" | "Blocked";
  joinedDate: string;
}

const MOCK_STUDENTS: StudentItem[] = [
  {
    id: "stu-1",
    name: "Aarav Patel",
    email: "aarav.patel@gmail.com",
    avatar: "AP",
    enrolledCourses: [
      { id: "c1", title: "Python Bootcamp", progress: 85, enrolledDate: "10 Jan 2026", completed: false },
      { id: "c2", title: "ML Engineering Masterclass", progress: 60, enrolledDate: "05 Feb 2026", completed: false }
    ],
    totalSpent: 12400,
    assignmentsSubmitted: 8,
    quizScoreAvg: 92,
    certificatesEarned: 1,
    lastActive: "10m ago",
    status: "Active",
    joinedDate: "10 Jan 2026"
  },
  {
    id: "stu-2",
    name: "Priya Nair",
    email: "priya.nair@outlook.com",
    avatar: "PN",
    enrolledCourses: [
      { id: "c3", title: "React Masterclass", progress: 45, enrolledDate: "12 Feb 2026", completed: false },
      { id: "c4", title: "UI/UX Design Pro", progress: 45, enrolledDate: "20 Feb 2026", completed: false }
    ],
    totalSpent: 18750,
    assignmentsSubmitted: 4,
    quizScoreAvg: 78,
    certificatesEarned: 0,
    lastActive: "2h ago",
    status: "Active",
    joinedDate: "12 Feb 2026"
  },
  {
    id: "stu-3",
    name: "Lucas Martin",
    email: "lucas.m@yahoo.com",
    avatar: "LM",
    enrolledCourses: [
      { id: "c5", title: "Advanced AI Engineering", progress: 100, enrolledDate: "01 Jan 2026", completed: true },
      { id: "c6", title: "Autonomous Agents", progress: 82, enrolledDate: "15 Jan 2026", completed: false }
    ],
    totalSpent: 8990,
    assignmentsSubmitted: 14,
    quizScoreAvg: 96,
    certificatesEarned: 2,
    lastActive: "42m ago",
    status: "Active",
    joinedDate: "01 Jan 2026"
  },
  {
    id: "stu-4",
    name: "Meera Gupta",
    email: "meera.g@proton.me",
    avatar: "MG",
    enrolledCourses: [
      { id: "c7", title: "Cloud Computing & Serverless", progress: 15, enrolledDate: "18 Feb 2026", completed: false }
    ],
    totalSpent: 14200,
    assignmentsSubmitted: 1,
    quizScoreAvg: 48,
    certificatesEarned: 0,
    lastActive: "6 days ago",
    status: "At Risk",
    joinedDate: "18 Feb 2026"
  },
  {
    id: "stu-5",
    name: "Vikram Malhotra",
    email: "vikram.m@techcorp.in",
    avatar: "VM",
    enrolledCourses: [
      { id: "c8", title: "Enterprise System Design", progress: 5, enrolledDate: "02 Mar 2026", completed: false }
    ],
    totalSpent: 4500,
    assignmentsSubmitted: 0,
    quizScoreAvg: 0,
    certificatesEarned: 0,
    lastActive: "14 days ago",
    status: "Blocked",
    joinedDate: "02 Mar 2026"
  }
];

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-subtext space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm font-semibold text-text">Loading Student Management...</p>
        </div>
      }
    >
      <StudentsContent />
    </Suspense>
  );
}

function StudentsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<StudentTab>("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [students, setStudents] = useState<StudentItem[]>(MOCK_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      // Tab filter
      if (activeTab === "progress" && stu.status === "Blocked") return false;
      if (activeTab === "certificates" && stu.certificatesEarned === 0) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = stu.name.toLowerCase().includes(q);
        const matchEmail = stu.email.toLowerCase().includes(q);
        const matchCourse = stu.enrolledCourses.some((c) => c.title.toLowerCase().includes(q));
        if (!matchName && !matchEmail && !matchCourse) return false;
      }

      // Course filter
      if (courseFilter !== "ALL") {
        if (!stu.enrolledCourses.some((c) => c.title.toLowerCase().includes(courseFilter.toLowerCase()))) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "ALL" && stu.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [students, activeTab, searchQuery, courseFilter, statusFilter]);

  const totalStudentsCount = students.length;
  const activeStudentsCount = students.filter((s) => s.status === "Active").length;
  const atRiskCount = students.filter((s) => s.status === "At Risk").length;
  const newThisMonthCount = 3;

  const handleToggleBlock = (id: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === "Blocked" ? "Active" : "Blocked" } : s
      )
    );
    if (selectedStudent?.id === id) {
      setSelectedStudent((prev) =>
        prev ? { ...prev, status: prev.status === "Blocked" ? "Active" : "Blocked" } : null
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-purple-400" />
            <span>Student Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-subtext mt-0.5">
            Track student progress, course completions, assignment grades, and manage student accounts.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-card p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            All Students ({totalStudentsCount})
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "progress"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Student Progress
          </button>
          <button
            onClick={() => setActiveTab("enrollments")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "enrollments"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Enrollments
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "certificates"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Certificates
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Total Enrolled Students</p>
          <h3 className="text-xl sm:text-2xl font-black text-text mt-1">{totalStudentsCount}</h3>
          <span className="text-[11px] text-emerald-400 font-semibold">+8.4% overall</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Active Students</p>
          <h3 className="text-xl sm:text-2xl font-black text-purple-400 mt-1">{activeStudentsCount}</h3>
          <span className="text-[11px] text-subtext font-semibold">Active this week</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">New This Month</p>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">+{newThisMonthCount}</h3>
          <span className="text-[11px] text-emerald-400 font-semibold">Recent signups</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">At Risk Learners</p>
          <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{atRiskCount}</h3>
          <span className="text-[11px] text-amber-400 font-semibold">Inactivity &gt; 5 days</span>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-card border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, course..."
            className="w-full bg-background border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50"
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

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-white/10 text-xs font-semibold text-text px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="At Risk">At Risk</option>
            <option value="Blocked">Blocked</option>
          </select>

          <span className="text-xs font-semibold text-subtext px-2 py-1 bg-background/50 rounded-lg border border-white/5">
            {filteredStudents.length} students
          </span>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                <th className="py-4 px-6 w-[28%]">Student Profile</th>
                <th className="py-4 px-4 w-[24%]">Enrolled Courses</th>
                <th className="py-4 px-4 text-center">Avg Progress</th>
                <th className="py-4 px-4 text-center">Assignments</th>
                <th className="py-4 px-4 text-right">Total Spent</th>
                <th className="py-4 px-4 text-center">Last Active</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-subtext space-y-2">
                    <Users className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
                    <p className="text-sm font-bold text-text">No students found</p>
                    <p className="text-xs">Try clearing search filters or checking other tabs.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const avgProgress = Math.round(
                    stu.enrolledCourses.reduce((acc, c) => acc + c.progress, 0) /
                      (stu.enrolledCourses.length || 1)
                  );

                  return (
                    <tr
                      key={stu.id}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudent(stu)}
                    >
                      {/* Profile */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 border border-white/10">
                            {stu.avatar}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-text text-sm group-hover:text-purple-300 transition-colors truncate">
                              {stu.name}
                            </h4>
                            <p className="text-subtext text-xs truncate mt-0.5">{stu.email}</p>
                            <span className="text-[10px] text-subtext/60">Joined: {stu.joinedDate}</span>
                          </div>
                        </div>
                      </td>

                      {/* Courses */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {stu.enrolledCourses.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 truncate max-w-[160px]"
                            >
                              {c.title}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-2">
                          <div className="w-20 h-1.5 bg-background rounded-full overflow-hidden border border-white/10">
                            <div
                              className={`h-full ${
                                avgProgress >= 70
                                  ? "bg-emerald-500"
                                  : avgProgress >= 40
                                  ? "bg-purple-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${avgProgress}%` }}
                            />
                          </div>
                          <span className="font-bold text-text tabular-nums">{avgProgress}%</span>
                        </div>
                      </td>

                      {/* Assignments */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-text">{stu.assignmentsSubmitted}</span>
                        <span className="text-[10px] text-subtext block">
                          Avg {stu.quizScoreAvg}%
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-4 px-4 text-right font-bold text-emerald-400">
                        ₹{stu.totalSpent.toLocaleString()}
                      </td>

                      {/* Last Active */}
                      <td className="py-4 px-4 text-center text-subtext text-[11px]">
                        {stu.lastActive}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            stu.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : stu.status === "At Risk"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {stu.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(stu)}
                            title="Inspect Student Profile"
                            className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold text-subtext hover:text-white transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleToggleBlock(stu.id)}
                            title={stu.status === "Blocked" ? "Unblock Student" : "Block Student"}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                              stu.status === "Blocked"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── STUDENT PROFILE SIDE DRAWER ── */}
      {selectedStudent && (
        <StudentProfileDrawer
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onToggleBlock={handleToggleBlock}
        />
      )}
    </div>
  );
}

function StudentProfileDrawer({
  student,
  onClose,
  onToggleBlock
}: {
  student: StudentItem;
  onClose: () => void;
  onToggleBlock: (id: string) => void;
}) {
  const [messageSent, setMessageSent] = useState(false);
  const [certIssued, setCertIssued] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex justify-end animate-in fade-in">
      <div className="w-full max-w-2xl bg-card border-l border-white/10 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right-8 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-background/50 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold text-base shadow-md border border-white/10">
              {student.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-text">{student.name}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${
                    student.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : student.status === "At Risk"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-subtext mt-0.5">{student.email} • Enrolled {student.joinedDate}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-background hover:bg-card border border-white/10 text-subtext hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-4 gap-3 p-3.5 rounded-xl bg-background/50 border border-white/5 text-center">
            <div>
              <p className="text-[10px] text-subtext uppercase">Total Spent</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{student.totalSpent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Assignments</p>
              <p className="text-sm font-bold text-text mt-0.5">{student.assignmentsSubmitted}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Quiz Avg</p>
              <p className="text-sm font-bold text-purple-300 mt-0.5">{student.quizScoreAvg}%</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Certificates</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{student.certificatesEarned}</p>
            </div>
          </div>

          {/* Enrolled Courses Progress */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Enrolled Courses & Progress</span>
            </h3>

            <div className="space-y-2.5">
              {student.enrolledCourses.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-card border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text">{c.title}</span>
                    <span className="font-bold text-purple-300">{c.progress}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full ${
                        c.progress >= 70 ? "bg-emerald-500" : c.progress >= 40 ? "bg-purple-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-subtext">
                    <span>Enrolled: {c.enrolledDate}</span>
                    <span>{c.completed ? "Course Completed" : "In Progress"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance & Certificates */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Certificates & Achievements</span>
            </h3>

            {student.certificatesEarned > 0 ? (
              <div className="p-3 rounded-lg bg-card border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="font-bold text-text">Advanced AI Engineering Certificate</p>
                    <p className="text-[10px] text-subtext">Issued on 14 Jan 2026 • Verified on Chain</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Verified
                </span>
              </div>
            ) : (
              <p className="text-subtext italic">No certificates issued yet.</p>
            )}

            {!certIssued ? (
              <button
                onClick={() => setCertIssued(true)}
                className="mt-2 py-1.5 px-3 rounded-lg bg-card hover:bg-white/5 border border-white/10 text-purple-300 font-bold text-xs flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Issue Course Certificate</span>
              </button>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Certificate issued successfully!</span>
              </div>
            )}
          </div>

          {/* Send Direct Message / Email */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-2">
            <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block">
              Send Student Notification / Warning
            </label>
            <textarea
              placeholder="Send direct administrative message or attendance reminder..."
              className="w-full bg-card border border-white/10 rounded-xl p-3 text-xs text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50 resize-none h-18"
            />
            {messageSent ? (
              <p className="text-emerald-400 font-semibold text-xs">Message sent to {student.email}</p>
            ) : (
              <button
                onClick={() => setMessageSent(true)}
                className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-background/60 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => onToggleBlock(student.id)}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              student.status === "Blocked"
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{student.status === "Blocked" ? "Unblock Student" : "Block Student Access"}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-card hover:bg-white/5 text-text border border-white/10 text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
