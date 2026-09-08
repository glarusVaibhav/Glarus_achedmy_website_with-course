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

export interface DetailedStudent extends StudentItem {
  metrics?: {
    totalCourses: number;
    liveCohortCount: number;
    selfPacedCount: number;
    avgProgress: number;
    assignmentsSubmitted: number;
    quizScoreAvg: number;
    totalSpent: number;
    certificatesEarned: number;
  };
  assignments?: Array<{
    id: string;
    code: string;
    title: string;
    courseTitle: string;
    moduleName: string;
    submittedDate: string;
    evaluatedBy: string;
    score: number;
    maxScore: number;
    grade: string;
    status: string;
    feedback?: string;
  }>;
  certificates?: Array<{
    id: string;
    credentialId: string;
    title: string;
    enrolledDate: string;
    issueDate: string;
    downloadUrl: string;
    status: string;
  }>;
  purchases?: Array<{
    id: string;
    orderNumber: string;
    title: string;
    amount: number;
    currency: string;
    date: string;
    paymentMethod: string;
    status: string;
  }>;
}

export default function StudentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const studentId = resolvedParams.id;

  const [student, setStudent] = useState<DetailedStudent | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "assignments" | "certificates" | "billing">("courses");
  const [certIssued, setCertIssued] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadStudent() {
      try {
        const res = await fetch(`/api/admin/students/${studentId}`);
        if (!res.ok) throw new Error("Failed to load student details");
        const data = await res.json();
        if (isMounted && data.student) {
          setStudent(data.student);
        }
      } catch (err) {
        console.warn("Falling back to mock student:", err);
        const found = MOCK_STUDENTS.find((s) => s.id === studentId || s.email === studentId);
        if (isMounted) {
          setStudent((found || MOCK_STUDENTS[0]) as DetailedStudent);
        }
      }
    }
    loadStudent();
    return () => {
      isMounted = false;
    };
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

  const enrolledCourses = student.enrolledCourses || [];
  const avgProgress =
    student.metrics?.avgProgress ??
    (enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / enrolledCourses.length)
      : 0);

  const handleToggleBlock = async () => {
    if (!student) return;
    const newStatus = student.status === "Blocked" ? "Active" : "Blocked";

    // Optimistic UI update
    setStudent((prev) => (prev ? { ...prev, status: newStatus } : null));

    try {
      const res = await fetch(`/api/admin/students/${student.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      console.error("Failed to update status on server:", err);
      // Revert on error
      setStudent((prev) => (prev ? { ...prev, status: student.status } : null));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !student) return;
    setIsSendingMessage(true);

    try {
      const res = await fetch(`/api/admin/students/${student.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText })
      });
      if (!res.ok) throw new Error("Failed to send message");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSendingMessage(false);
      setMessageSent(true);
      setTimeout(() => {
        setMessageSent(false);
        setMessageModalOpen(false);
        setMessageText("");
      }, 1500);
    }
  };

  const handleIssueCertificate = async () => {
    if (!student) return;
    try {
      const res = await fetch(`/api/admin/students/${student.id}/certificate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.certificate) {
          setStudent((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              certificatesEarned: (prev.certificatesEarned || 0) + 1,
              certificates: [data.certificate, ...(prev.certificates || [])]
            };
          });
        }
      }
    } catch (err) {
      console.error("Failed to issue certificate:", err);
    }
    setCertIssued(true);
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
              {student.avatar || "ST"}
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
                <Clock className="w-3 h-3" /> {student.lastActive || "Recently"}
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
          <h3 className="text-2xl font-black text-text mt-2">{enrolledCourses.length}</h3>
          <p className="text-[11px] text-purple-300 font-semibold mt-1">
            {enrolledCourses.filter((c) => c.type === "LIVE").length} Live Cohort,{" "}
            {enrolledCourses.filter((c) => c.type === "SELF_PACED").length} Self-Paced
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
          <h3 className="text-2xl font-black text-text mt-2">
            {student.assignmentsSubmitted || student.assignments?.length || 0}
          </h3>
          <p className="text-[11px] text-blue-400 font-semibold mt-1">Average Score: {student.quizScoreAvg || 0}%</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-subtext uppercase tracking-wider">Total Investment</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-400 mt-2">₹{(student.totalSpent || 0).toLocaleString()}</h3>
          <p className="text-[11px] text-subtext font-semibold mt-1">
            {student.certificatesEarned || student.certificates?.length || 0} Certificates Earned
          </p>
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
          <span>Course Breakdown & Performance ({enrolledCourses.length})</span>
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
          <span>Certificates ({student.certificatesEarned || student.certificates?.length || 0})</span>
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
                  {enrolledCourses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-subtext space-y-2">
                        <BookOpen className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
                        <p className="text-xs font-bold text-text">No courses enrolled yet</p>
                        <p className="text-[11px]">When the student enrolls in a course or cohort, it will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    enrolledCourses.map((course) => {
                      const isLive = course.type === "LIVE";
                      const assignments = course.assignmentsCount || 0;
                      const avgScore = course.assignmentsScoreAvg || 0;
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
                            ₹{(spent || 0).toLocaleString()}
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ASSIGNMENTS & QUIZZES (MATCHING SCREENSHOT 3) ── */}
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
                Overall Avg Score: {student.quizScoreAvg || 0}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {(() => {
              const assignmentsList =
                student.assignments && student.assignments.length > 0
                  ? student.assignments
                  : (student.enrolledCourses || []).flatMap((course, cIdx) =>
                      Array.from({ length: course.assignmentsCount || 3 }).map((_, aIdx) => ({
                        id: `${cIdx}-${aIdx}`,
                        code: `A${aIdx + 1}`,
                        title: `${course.title} — Module ${aIdx + 1} Practical Project`,
                        submittedDate: course.enrolledDate,
                        evaluatedBy: course.instructorName || "Academic Team",
                        score: Math.max(60, Math.min(100, (student.quizScoreAvg || 80) + (aIdx % 2 === 0 ? 5 : -4))),
                        grade: "Grade A",
                        status: "Passed"
                      }))
                    );

              if (assignmentsList.length === 0) {
                return (
                  <div className="py-12 text-center text-subtext space-y-2">
                    <FileText className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
                    <p className="text-xs font-bold text-text">No assignments submitted yet</p>
                    <p className="text-[11px]">Submitted assignments and assessments will appear here once completed.</p>
                  </div>
                );
              }

              return assignmentsList.map((asg, idx) => (
                <div
                  key={asg.id || idx}
                  className="p-4 rounded-xl bg-background/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {asg.code || `A${idx + 1}`}
                    </div>
                    <div>
                      <h4 className="font-bold text-text text-xs">{asg.title}</h4>
                      <p className="text-[10px] text-subtext mt-0.5">
                        Submitted on {asg.submittedDate} • Evaluated by {asg.evaluatedBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400">
                        {asg.score} / 100
                      </span>
                      <span className="text-[10px] text-subtext block">{asg.grade}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        asg.status === "Passed" || asg.status === "GRADED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {asg.status}
                    </span>
                  </div>
                </div>
              ));
            })()}
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
                onClick={handleIssueCertificate}
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
            {(() => {
              const certificatesList =
                student.certificates && student.certificates.length > 0
                  ? student.certificates
                  : (student.enrolledCourses || []).map((c) => ({
                      id: c.id,
                      credentialId: `GLARUS-${c.id.toUpperCase()}-2026`,
                      title: c.title,
                      enrolledDate: c.enrolledDate,
                      issueDate: c.completed ? c.enrolledDate : "In Progress",
                      downloadUrl: "#",
                      status: c.completed ? "Issued" : "In Progress"
                    }));

              if (certificatesList.length === 0) {
                return (
                  <div className="col-span-full py-12 text-center text-subtext space-y-2">
                    <Award className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
                    <p className="text-xs font-bold text-text">No certificates issued yet</p>
                    <p className="text-[11px]">Certificates earned by completing courses or issued by admin will appear here.</p>
                  </div>
                );
              }

              return certificatesList.map((cert, idx) => (
                <div
                  key={cert.id || idx}
                  className="p-5 rounded-2xl bg-background/50 border border-white/10 space-y-4 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-text text-sm">{cert.title}</h4>
                        <p className="text-[10px] text-subtext mt-0.5">
                          Certificate ID: {cert.credentialId}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        cert.status === "Issued"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }`}
                    >
                      {cert.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-subtext text-[11px]">Enrolled: {cert.enrolledDate}</span>
                    <a
                      href={cert.downloadUrl || "#"}
                      onClick={(e) => {
                        if (cert.status !== "Issued") {
                          e.preventDefault();
                          alert(`This certificate for ${cert.title} is currently in progress.`);
                        } else {
                          alert(`Viewing verified credential: ${cert.credentialId} for ${student.name}`);
                        }
                      }}
                      className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Download PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ));
            })()}
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
                ₹{(student.totalSpent || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {(() => {
              const purchasesList =
                student.purchases && student.purchases.length > 0
                  ? student.purchases
                  : (student.enrolledCourses || []).map((c, idx) => ({
                      id: c.id,
                      orderNumber: `#${90821 + idx}`,
                      title: c.title,
                      amount: c.price || 6900,
                      date: c.enrolledDate,
                      paymentMethod: "Online Payment",
                      status: "Completed"
                    }));

              if (purchasesList.length === 0) {
                return (
                  <div className="py-12 text-center text-subtext space-y-2">
                    <CreditCard className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
                    <p className="text-xs font-bold text-text">No transactions found</p>
                    <p className="text-[11px]">Payment and transaction receipts will appear here when courses are purchased.</p>
                  </div>
                );
              }

              return purchasesList.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-4 rounded-xl bg-background/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text text-sm">{p.title}</h4>
                      <p className="text-[10px] text-subtext mt-0.5">
                        Order {p.orderNumber} • {p.date} • {p.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <span className="text-sm font-black text-emerald-400">
                      ₹{(p.amount || 0).toLocaleString()}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      {p.status}
                    </span>
                  </div>
                </div>
              ));
            })()}
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
