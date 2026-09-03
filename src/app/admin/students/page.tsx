"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Eye,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Clock,
  TrendingUp,
  X,
  CreditCard,
  FileText,
  ChevronRight,
  Sparkles,
  Loader2,
  PlayCircle,
  Calendar
} from "lucide-react";
import { MOCK_STUDENTS, StudentItem } from "@/lib/mockStudents";

export type StudentTab = "all" | "active" | "at_risk" | "blocked";

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-subtext space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm font-semibold text-text">Loading Student Directory...</p>
        </div>
      }
    >
      <StudentsContent />
    </Suspense>
  );
}

function StudentsContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StudentTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [students, setStudents] = useState<StudentItem[]>(MOCK_STUDENTS);

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      // Tab filter
      if (activeTab === "active" && stu.status !== "Active") return false;
      if (activeTab === "at_risk" && stu.status !== "At Risk") return false;
      if (activeTab === "blocked" && stu.status !== "Blocked") return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = stu.name.toLowerCase().includes(q);
        const matchEmail = stu.email.toLowerCase().includes(q);
        const matchCourse = stu.enrolledCourses.some((c) => c.title.toLowerCase().includes(q));
        if (!matchName && !matchEmail && !matchCourse) return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && stu.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [students, activeTab, searchQuery, statusFilter]);

  const totalStudentsCount = students.length;
  const activeStudentsCount = students.filter((s) => s.status === "Active").length;
  const atRiskCount = students.filter((s) => s.status === "At Risk").length;
  const blockedCount = students.filter((s) => s.status === "Blocked").length;

  const handleToggleBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === "Blocked" ? "Active" : "Blocked" } : s
      )
    );
  };

  const handleRowClick = (studentId: string) => {
    router.push(`/admin/students/${studentId}`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-card p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            All Students ({totalStudentsCount})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "active"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Active ({activeStudentsCount})
          </button>
          <button
            onClick={() => setActiveTab("at_risk")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "at_risk"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            At Risk ({atRiskCount})
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "blocked"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Blocked ({blockedCount})
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Total Students</p>
          <h3 className="text-xl sm:text-2xl font-black text-text mt-1">{totalStudentsCount}</h3>
          <span className="text-[11px] text-emerald-400 font-semibold">+8.4% this month</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Active Students</p>
          <h3 className="text-xl sm:text-2xl font-black text-purple-400 mt-1">{activeStudentsCount}</h3>
          <span className="text-[11px] text-subtext font-semibold">Learning this week</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">At Risk Learners</p>
          <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{atRiskCount}</h3>
          <span className="text-[11px] text-amber-400 font-semibold">Inactive &gt; 5 days</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Blocked Accounts</p>
          <h3 className="text-xl sm:text-2xl font-black text-red-400 mt-1">{blockedCount}</h3>
          <span className="text-[11px] text-subtext font-semibold">Restricted access</span>
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
            placeholder="Search students by name, email, course..."
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
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-white/10 text-xs font-semibold text-text px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="At Risk">At Risk Only</option>
            <option value="Blocked">Blocked Only</option>
          </select>

          <span className="text-xs font-semibold text-subtext px-2.5 py-1.5 bg-background/50 rounded-xl border border-white/5 whitespace-nowrap">
            {filteredStudents.length} students
          </span>
        </div>
      </div>

      {/* Student Management Directory Table */}
      <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                <th className="py-4 px-6 w-[34%]">Student Profile</th>
                <th className="py-4 px-4 w-[24%]">Enrolled Courses</th>
                <th className="py-4 px-4 text-center">Last Active</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-subtext space-y-2">
                    <Users className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
                    <p className="text-sm font-bold text-text">No students found</p>
                    <p className="text-xs">Try clearing search filters or checking other tabs.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr
                    key={stu.id}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => handleRowClick(stu.id)}
                  >
                    {/* Student Profile Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 border border-white/10">
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

                    {/* Enrolled Courses Summary */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="font-bold text-text text-xs">
                            {stu.enrolledCourses.length} Courses Enrolled
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {stu.enrolledCourses.slice(0, 2).map((c) => (
                            <span
                              key={c.id}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border truncate max-w-[130px] ${
                                c.type === "LIVE"
                                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                  : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                              }`}
                            >
                              {c.title}
                            </span>
                          ))}
                          {stu.enrolledCourses.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/5 text-subtext border border-white/10">
                              +{stu.enrolledCourses.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="py-4 px-4 text-center text-subtext text-xs">
                      <span className="inline-flex items-center gap-1 text-purple-300/90 font-medium">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {stu.lastActive}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                          stu.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : stu.status === "At Risk"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {stu.status}
                      </span>
                    </td>

                    {/* Actions: View Details and Block/Unblock */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/students/${stu.id}`}
                          className="px-3 py-1.5 rounded-lg bg-card hover:bg-purple-600 hover:text-white text-purple-300 border border-white/10 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>

                        <button
                          onClick={(e) => handleToggleBlock(stu.id, e)}
                          title={stu.status === "Blocked" ? "Unblock Student" : "Block Student"}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
