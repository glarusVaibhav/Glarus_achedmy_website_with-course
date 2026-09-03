"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Award,
  Clock,
  Mail,
  Phone,
  MapPin,
  Ban,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Video,
  FileText,
  CreditCard,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Calendar,
  Check,
  RotateCcw,
  Send,
  Layers,
  GraduationCap
} from "lucide-react";
import { MOCK_STUDENTS, StudentItem, EnrolledCourseItem } from "@/lib/mockStudents";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const studentId = resolvedParams.id;

  const [student, setStudent] = useState<StudentItem | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "assignments" | "certificates" | "billing">("courses");
  const [certIssued, setCertIssued] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    // Find matching student
    const found = MOCK_STUDENTS.find((s) => s.id === studentId || s.email === studentId);
    if (found) {
      setStudent(found);
    } else {
      // Fallback to first student if not found or sample
      setStudent(MOCK_STUDENTS[0]);
    }
  }, [studentId]);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 animate-pulse">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-text">Loading Student Profile...</p>
      </div>
    );
  }

  const avgProgress = Math.round(
    student.enrolledCourses.reduce((acc, c) => acc + c.progress, 0) /
      (student.enrolledCourses.length || 1)
  );

  const handleToggleBlock = () => {
    setStudent((prev) =>
      prev ? { ...prev, status: prev.status === "Blocked" ? "Active" : "Blocked" } : null
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessageModalOpen(false);
      setMessageText("");
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-16 font-sans animate-in fade-in duration-300">
      {/* ── TOP BACK NAVIGATION ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card/80 border border-white/10 text-xs font-bold text-subtext hover:text-text transition-all shadow-sm hover:-translate-x-0.5 group"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Students Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessageModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Message Student</span>
          </button>

          <button
            onClick={handleToggleBlock}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              student.status === "Blocked"
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{student.status === "Blocked" ? "Unblock Account" : "Block Student"}</span>
          </button>
        </div>
      </div>

      {/* ── STUDENT PROFILE HERO CARD ── */}
      <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/15 shrink-0">
              {student.avatar}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
                  {student.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black border uppercase tracking-wider ${
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

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-subtext font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  {student.email}
                </span>
                {student.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                    {student.phone}
                  </span>
                )}
                {student.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    {student.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Enrolled since {student.joinedDate}
                </span>
              </div>

              {student.bio && (
                <p className="text-xs text-subtext/90 max-w-2xl leading-relaxed pt-1">
                  {student.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center bg-background/50 border border-white/5 p-3 rounded-2xl">
            <div className="text-right px-3">
              <span className="text-[10px] uppercase font-bold text-subtext block">Last Online</span>
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1 justify-end mt-0.5">
                <Clock className="w-3 h-3" /> {student.lastActive}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KEY METRICS OVERVIEW CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-subtext uppercase tracking-wider">Enrolled Courses</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-text mt-2">{student.enrolledCourses.length}</h3>
          <p className="text-[11px] text-purple-300 font-semibold mt-1">
            {student.enrolledCourses.filter((c) => c.type === "LIVE").length} Live Cohort,{" "}
            {student.enrolledCourses.filter((c) => c.type === "SELF_PACED").length} Self-Paced
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-subtext uppercase tracking-wider">Avg Progress</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-text mt-2">{avgProgress}%</h3>
          <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-white/5 mt-2">
            <div
              className={`h-full ${
                avgProgress >= 70 ? "bg-emerald-500" : avgProgress >= 40 ? "bg-purple-500" : "bg-amber-500"
              }`}
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-subtext uppercase tracking-wider">Assignments & Quizzes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-text mt-2">{student.assignmentsSubmitted}</h3>
          <p className="text-[11px] text-blue-400 font-semibold mt-1">Average Score: {student.quizScoreAvg}%</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-subtext uppercase tracking-wider">Total Investment</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-400 mt-2">₹{student.totalSpent.toLocaleString()}</h3>
          <p className="text-[11px] text-subtext font-semibold mt-1">{student.certificatesEarned} Certificates Earned</p>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex bg-card p-1 rounded-2xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar w-fit">
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "courses"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Course Breakdown & Performance ({student.enrolledCourses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "assignments"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Assignments & Scores</span>
        </button>

        <button
          onClick={() => setActiveTab("certificates")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "certificates"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Certificates ({student.certificatesEarned})</span>
        </button>

        <button
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "billing"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Purchases & Transactions</span>
        </button>
      </div>

      {/* ── TAB 1: ENROLLED COURSES BREAKDOWN (MATCHING SCREENSHOT VISUALS) ── */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            {/* Table Header with Delivery Format Indicators */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-text">Course-by-Course Learning Analytics</h3>
                <p className="text-xs text-subtext mt-0.5">
                  Detailed progress, assignment completion, and investment details for each enrolled course.
                </p>
              </div>

              {/* Delivery Format Legend */}
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Cohorts
                </span>
                <span className="inline-flex items-center gap-1.5 text-purple-400 font-semibold bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  <PlayCircle className="w-3 h-3" />
                  Self-Paced Courses
                </span>
              </div>
            </div>

            {/* Courses Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-white/10 bg-background/30 text-[10px] font-black text-subtext uppercase tracking-wider">
                    <th className="py-4 px-6 w-[34%]">Enrolled Courses</th>
                    <th className="py-4 px-4 w-[24%] text-center">Avg Progress</th>
                    <th className="py-4 px-4 w-[16%] text-center">Assignments</th>
                    <th className="py-4 px-4 w-[14%] text-right">Total Spent</th>
                    <th className="py-4 px-6 w-[12%] text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-medium">
                  {student.enrolledCourses.map((course) => {
                    const isLive = course.type === "LIVE";
                    const assignments = course.assignmentsCount || Math.ceil(course.progress / 15);
                    const avgScore = course.assignmentsScoreAvg || Math.min(100, Math.max(50, course.progress + 10));
                    const spent = course.price || (isLive ? 6900 : 5500);

                    return (
                      <tr key={course.id} className="hover:bg-white/5 transition-colors group">
                        {/* 1. Enrolled Course Column */}
                        <td className="py-5 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {isLive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider shadow-sm shadow-emerald-500/10">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  LIVE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider shadow-sm">
                                  <PlayCircle className="w-3 h-3 text-purple-400" />
                                  SELF-PACED
                                </span>
                              )}
                              <span className="font-bold text-text text-sm group-hover:text-purple-300 transition-colors">
                                {course.title}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-subtext">
                              {course.batchName && (
                                <span className="text-emerald-400/90 font-semibold">
                                  Cohort: {course.batchName}
                                </span>
                              )}
                              {course.nextSession && (
                                <span className="text-purple-300 font-medium">
                                  • Next Session: {course.nextSession}
                                </span>
                              )}
                              {course.instructorName && (
                                <span>• Instructor: {course.instructorName}</span>
                              )}
                              <span>• Enrolled: {course.enrolledDate}</span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Progress Column with Styled Progress Bar */}
                        <td className="py-5 px-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-28 sm:w-36 h-2 bg-background rounded-full overflow-hidden border border-white/10 p-0.5">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  course.progress >= 70
                                    ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                                    : course.progress >= 40
                                    ? "bg-purple-500 shadow-sm shadow-purple-500/50"
                                    : "bg-amber-400 shadow-sm shadow-amber-400/50"
                                }`}
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="font-black text-text text-sm tabular-nums">
                              {course.progress}%
                            </span>
                          </div>
                          <span className="text-[10px] text-subtext/70 block mt-1">
                            {course.completedModules || Math.round((course.progress / 100) * (course.totalModules || 12))} of{" "}
                            {course.totalModules || 12} Modules Completed
                          </span>
                        </td>

                        {/* 3. Assignments Column */}
                        <td className="py-5 px-4 text-center">
                          <span className="font-black text-text text-sm">{assignments}</span>
                          <span className="text-[10px] font-bold text-subtext block mt-0.5">
                            Avg {avgScore}%
                          </span>
                        </td>

                        {/* 4. Total Spent Column */}
                        <td className="py-5 px-4 text-right font-black text-emerald-400 text-sm tabular-nums">
                          ₹{spent.toLocaleString()}
                        </td>

                        {/* 5. Details Action */}
                        <td className="py-5 px-6 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                              course.completed
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : course.progress > 0
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                            }`}
                          >
                            {course.completed ? "Completed" : course.progress > 0 ? "In Progress" : "Not Started"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ASSIGNMENTS & QUIZZES ── */}
      {activeTab === "assignments" && (
        <div className="bg-card border border-white/10 rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-black text-text">Submitted Assignments & Assessments</h3>
              <p className="text-xs text-subtext mt-0.5">
                Evaluation results and instructor feedback for submitted homework and quizzes.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400">
                Overall Avg Score: {student.quizScoreAvg}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {student.enrolledCourses.flatMap((course, cIdx) =>
              Array.from({ length: course.assignmentsCount || 3 }).map((_, aIdx) => {
                const score = Math.max(60, Math.min(100, student.quizScoreAvg + (aIdx % 2 === 0 ? 5 : -4)));
                return (
                  <div
                    key={`${cIdx}-${aIdx}`}
                    className="p-4 rounded-xl bg-background/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                        A{aIdx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-text text-xs">
                          {course.title} — Module {aIdx + 1} Practical Project
                        </h4>
                        <p className="text-[10px] text-subtext mt-0.5">
                          Submitted on {course.enrolledDate} • Evaluated by {course.instructorName || "Academic Team"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400">{score} / 100</span>
                        <span className="text-[10px] text-subtext block">Grade A</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Passed
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: CERTIFICATES ── */}
      {activeTab === "certificates" && (
        <div className="bg-card border border-white/10 rounded-2xl shadow-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-black text-text">Course Certificates & Credentials</h3>
              <p className="text-xs text-subtext mt-0.5">
                Official verified completion certificates for completed courses.
              </p>
            </div>

            {!certIssued ? (
              <button
                onClick={() => setCertIssued(true)}
                className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Issue New Certificate</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Certificate Generated!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.enrolledCourses.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-background/50 border border-white/10 space-y-4 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text text-sm">{c.title}</h4>
                      <p className="text-[10px] text-subtext mt-0.5">Certificate ID: GLARUS-{c.id.toUpperCase()}-2026</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {c.completed ? "Issued" : "In Progress"}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-subtext text-[11px]">Enrolled: {c.enrolledDate}</span>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading certificate for ${student.name} - ${c.title}`);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Download PDF</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: PURCHASES & TRANSACTIONS ── */}
      {activeTab === "billing" && (
        <div className="bg-card border border-white/10 rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-black text-text">Payment & Transaction History</h3>
              <p className="text-xs text-subtext mt-0.5">
                All order records, invoices, and billing history for this student.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-subtext">Total Lifetime Spent:</span>
              <span className="text-sm font-black text-emerald-400 block">
                ₹{student.totalSpent.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {student.enrolledCourses.map((c, idx) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-background/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text text-sm">{c.title}</h4>
                    <p className="text-[10px] text-subtext mt-0.5">
                      Order #{90821 + idx} • {c.enrolledDate} • Online Payment
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span className="text-sm font-black text-emerald-400">
                    ₹{(c.price || 6900).toLocaleString()}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MESSAGE STUDENT MODAL ── */}
      {messageModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>Send Direct Notification to {student.name}</span>
              </h3>
              <button
                onClick={() => setMessageModalOpen(false)}
                className="text-subtext hover:text-text p-1 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {messageSent ? (
              <div className="py-8 text-center space-y-2 text-emerald-400">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="font-bold text-sm">Message sent successfully to {student.email}!</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Write your message or academic note for ${student.name}...`}
                  rows={4}
                  className="w-full bg-background border border-white/10 rounded-xl p-3 text-xs text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50 resize-none font-medium"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMessageModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-background border border-white/10 text-xs font-bold text-subtext hover:text-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
