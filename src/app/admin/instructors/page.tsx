"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  DollarSign,
  Ban,
  Radio,
  FileText,
  Video,
  ChevronRight,
  MoreVertical,
  Layers,
  Star,
  Users,
  BookOpen,
  Calendar,
  Sparkles,
  ExternalLink,
  Check,
  X,
  RotateCcw,
  Loader2
} from "lucide-react";
import InstructorReviewModal from "@/components/admin/InstructorReviewModal";
import { InstructorLiveSessionsView } from "@/components/instructor/InstructorLiveSessionsView";

export type InstructorTab = "all" | "approvals" | "verified" | "suspended" | "live";

interface InstructorItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  experience?: string;
  skills?: string[];
  bio?: string;
  resumeUrl?: string;
  coursesCreated: string[];
  totalStudents: number;
  totalRevenue: number;
  rating: number;
  verificationStatus: "VERIFIED" | "PENDING" | "CHANGES_REQUESTED" | "REJECTED";
  accountStatus: "Active" | "Suspended";
  joinedDate: string;
  assignedTasksCount?: number;
  liveSessionsCount?: number;
}

const MOCK_INSTRUCTORS: InstructorItem[] = [
  {
    id: "inst-1",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@glarus.edu",
    avatar: "SC",
    phone: "+91 98765 43210",
    experience: "8+ years in Machine Learning & AI Engineering at Stanford & Meta",
    skills: ["Agentic AI", "PyTorch", "Autonomous Systems", "RAG"],
    bio: "Lead AI Researcher & Instructor with over 15 published research papers.",
    resumeUrl: "https://glarus.edu/resumes/sarah_chen.pdf",
    coursesCreated: ["Advanced AI Agents", "Autonomous Workflows"],
    totalStudents: 1842,
    totalRevenue: 485600,
    rating: 4.9,
    verificationStatus: "VERIFIED",
    accountStatus: "Active",
    joinedDate: "15 Jan 2026",
    assignedTasksCount: 3,
    liveSessionsCount: 4
  },
  {
    id: "inst-2",
    name: "Alex Chen",
    email: "alex.chen@glarus.edu",
    avatar: "AC",
    phone: "+91 98450 11223",
    experience: "5 years building LLM evaluation frameworks and LangChain/LlamaIndex pipelines",
    skills: ["LangGraph", "Vector DBs", "RAG Pipelines", "FastAPI"],
    bio: "Senior AI Engineer passionate about hands-on production agent development.",
    resumeUrl: "https://glarus.edu/resumes/alex_chen_cv.pdf",
    coursesCreated: ["Advanced RAG Architecture"],
    totalStudents: 310,
    totalRevenue: 85000,
    rating: 4.8,
    verificationStatus: "PENDING",
    accountStatus: "Active",
    joinedDate: "Today, 10:20 AM",
    assignedTasksCount: 2,
    liveSessionsCount: 1
  },
  {
    id: "inst-3",
    name: "John Doe",
    email: "john.doe@glarus.edu",
    avatar: "JD",
    phone: "+91 91234 56780",
    experience: "6 years Senior React Engineer at Stripe & Vercel contributor",
    skills: ["React 19", "Next.js 14", "TypeScript", "TailwindCSS"],
    bio: "Frontend architect teaching modern full-stack web engineering.",
    resumeUrl: "https://glarus.edu/resumes/john_doe.pdf",
    coursesCreated: ["React Masterclass", "TypeScript for Scale"],
    totalStudents: 967,
    totalRevenue: 215400,
    rating: 4.7,
    verificationStatus: "VERIFIED",
    accountStatus: "Active",
    joinedDate: "02 Feb 2026",
    assignedTasksCount: 1,
    liveSessionsCount: 2
  },
  {
    id: "inst-4",
    name: "Bob Smith",
    email: "b.smith@glarus.edu",
    avatar: "BS",
    phone: "+91 99887 76655",
    experience: "2 years junior instructor",
    skills: ["HTML", "CSS", "Basic JavaScript"],
    bio: "Web fundamentals educator.",
    resumeUrl: "https://glarus.edu/resumes/bob_smith.pdf",
    coursesCreated: ["Frontend Basics"],
    totalStudents: 23,
    totalRevenue: 1000,
    rating: 3.2,
    verificationStatus: "REJECTED",
    accountStatus: "Suspended",
    joinedDate: "12 Mar 2026",
    assignedTasksCount: 0,
    liveSessionsCount: 0
  }
];

export default function InstructorsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-subtext space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm font-semibold text-text">Loading Instructor Management...</p>
        </div>
      }
    >
      <InstructorsContent />
    </Suspense>
  );
}

function InstructorsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as InstructorTab) || "all";

  const [activeTab, setActiveTab] = useState<InstructorTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [instructors, setInstructors] = useState<InstructorItem[]>(MOCK_INSTRUCTORS);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorItem | null>(null);

  // Sync tab from URL if changed
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as InstructorTab;
    if (tabFromUrl && ["all", "approvals", "verified", "suspended", "live"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Load real API approvals if available
  useEffect(() => {
    async function loadApprovals() {
      try {
        const res = await fetch("/api/admin/approvals/instructor");
        if (res.ok) {
          const data = await res.json();
          if (data.approvals && Array.isArray(data.approvals)) {
            // merge or sync approvals if returned
          }
        }
      } catch {
        /* ignore */
      }
    }
    loadApprovals();
  }, []);

  const handleDecision = async (
    instructorId: string,
    decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
    feedback?: string
  ) => {
    try {
      await fetch("/api/admin/approvals/instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId, decision, feedback })
      });
    } catch {
      /* ignore */
    }

    setInstructors((prev) =>
      prev.map((inst) => {
        if (inst.id === instructorId || inst.name.includes(instructorId)) {
          return {
            ...inst,
            verificationStatus:
              decision === "APPROVED"
                ? "VERIFIED"
                : decision === "REJECTED"
                ? "REJECTED"
                : "CHANGES_REQUESTED"
          };
        }
        return inst;
      })
    );
    setSelectedInstructor(null);
  };

  const handleToggleSuspend = (id: string) => {
    setInstructors((prev) =>
      prev.map((inst) => {
        if (inst.id === id) {
          return {
            ...inst,
            accountStatus: inst.accountStatus === "Active" ? "Suspended" : "Active"
          };
        }
        return inst;
      })
    );
    if (selectedInstructor?.id === id) {
      setSelectedInstructor((prev) =>
        prev
          ? {
              ...prev,
              accountStatus: prev.accountStatus === "Active" ? "Suspended" : "Active"
            }
          : null
      );
    }
  };

  // Filtered instructors based on active tab and search
  const filteredInstructors = useMemo(() => {
    return instructors.filter((inst) => {
      // Tab matching
      if (activeTab === "approvals" && inst.verificationStatus !== "PENDING" && inst.verificationStatus !== "CHANGES_REQUESTED") {
        return false;
      }
      if (activeTab === "verified" && (inst.verificationStatus !== "VERIFIED" || inst.accountStatus === "Suspended")) {
        return false;
      }
      if (activeTab === "suspended" && inst.accountStatus !== "Suspended") {
        return false;
      }

      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = inst.name.toLowerCase().includes(q);
        const matchEmail = inst.email.toLowerCase().includes(q);
        const matchSkills = inst.skills?.some((s) => s.toLowerCase().includes(q));
        const matchCourse = inst.coursesCreated.some((c) => c.toLowerCase().includes(q));
        if (!matchName && !matchEmail && !matchSkills && !matchCourse) return false;
      }

      // Status filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "ACTIVE" && inst.accountStatus !== "Active") return false;
        if (statusFilter === "SUSPENDED" && inst.accountStatus !== "Suspended") return false;
        if (statusFilter === "PENDING" && inst.verificationStatus !== "PENDING") return false;
      }

      return true;
    });
  }, [instructors, activeTab, searchQuery, statusFilter]);

  const pendingCount = instructors.filter(
    (i) => i.verificationStatus === "PENDING" || i.verificationStatus === "CHANGES_REQUESTED"
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-card p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            All Instructors ({instructors.length})
          </button>

          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "approvals"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            <span>Pending Approvals</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("verified")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "verified"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Verified
          </button>

          <button
            onClick={() => setActiveTab("suspended")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "suspended"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Suspended
          </button>

          <button
            onClick={() => setActiveTab("live")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "live"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            <Radio className="w-3 h-3 text-red-400" />
            <span>Live Sessions</span>
          </button>
        </div>
      </div>

      {/* Main Content: If Live Tab selected, render Live Training console; otherwise render Instructor Table & Filters */}
      {activeTab === "live" ? (
        <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-400 animate-pulse" />
                <span>Instructor Live Sessions Supervisory Hub</span>
              </h2>
              <p className="text-xs text-subtext">
                Supervise scheduled masterclasses, assign instructors, manage room links, and approve reschedule requests.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("all")}
              className="text-xs font-bold text-purple-400 hover:text-purple-300"
            >
              ← Back to Instructors List
            </button>
          </div>
          <InstructorLiveSessionsView />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="bg-card border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search instructors by name, email, skills, courses..."
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
                <option value="ALL">All Account Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="SUSPENDED">Suspended Only</option>
                <option value="PENDING">Pending Verification</option>
              </select>

              <span className="text-xs font-semibold text-subtext px-2 py-1 bg-background/50 rounded-lg border border-white/5">
                {filteredInstructors.length} found
              </span>
            </div>
          </div>

          {/* Instructor Directory Table */}
          <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                    <th className="py-4 px-6 w-[28%]">Instructor Profile</th>
                    <th className="py-4 px-4 w-[20%]">Courses Taught</th>
                    <th className="py-4 px-4 text-center">Students</th>
                    <th className="py-4 px-4 text-center">Rating</th>
                    <th className="py-4 px-4 text-right">Revenue</th>
                    <th className="py-4 px-4 text-center">Verification</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-medium">
                  {filteredInstructors.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-subtext space-y-2">
                        <GraduationCap className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
                        <p className="text-sm font-bold text-text">No instructors match your filter</p>
                        <p className="text-xs">Try clearing search parameters or checking other tabs.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInstructors.map((inst) => (
                      <tr
                        key={inst.id}
                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                        onClick={() => setSelectedInstructor(inst)}
                      >
                        {/* Profile Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 border border-white/10">
                              {inst.avatar}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-text text-sm group-hover:text-purple-300 transition-colors truncate">
                                {inst.name}
                              </h4>
                              <p className="text-subtext text-xs truncate mt-0.5">{inst.email}</p>
                              <span className="text-[10px] text-subtext/60">Joined: {inst.joinedDate}</span>
                            </div>
                          </div>
                        </td>

                        {/* Courses */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {inst.coursesCreated.map((c) => (
                              <span
                                key={c}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 truncate max-w-[150px]"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Students */}
                        <td className="py-4 px-4 text-center font-bold text-text">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background/50 border border-white/5">
                            <Users className="w-3 h-3 text-subtext" />
                            <span>{inst.totalStudents.toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{inst.rating}</span>
                          </div>
                        </td>

                        {/* Revenue */}
                        <td className="py-4 px-4 text-right font-bold text-emerald-400">
                          ₹{inst.totalRevenue.toLocaleString()}
                        </td>

                        {/* Verification */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                              inst.verificationStatus === "VERIFIED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : inst.verificationStatus === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : inst.verificationStatus === "CHANGES_REQUESTED"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                : "bg-red-500/10 text-red-400 border-red-500/30"
                            }`}
                          >
                            {inst.verificationStatus}
                          </span>
                        </td>

                        {/* Account Status */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              inst.accountStatus === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {inst.accountStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedInstructor(inst)}
                              title="Inspect Full Profile"
                              className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold text-subtext hover:text-white transition-all flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>

                            <button
                              onClick={() => handleToggleSuspend(inst.id)}
                              title={inst.accountStatus === "Active" ? "Suspend Account" : "Activate Account"}
                              className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                                inst.accountStatus === "Active"
                                  ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
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
      )}

      {/* ── INSTRUCTOR PROFILE & REVIEW SIDE DRAWER ── */}
      {selectedInstructor && (
        <InstructorProfileDrawer
          instructor={selectedInstructor}
          onClose={() => setSelectedInstructor(null)}
          onDecision={handleDecision}
          onToggleSuspend={handleToggleSuspend}
        />
      )}
    </div>
  );
}

function InstructorProfileDrawer({
  instructor,
  onClose,
  onDecision,
  onToggleSuspend
}: {
  instructor: InstructorItem;
  onClose: () => void;
  onDecision: (
    id: string,
    decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
    feedback?: string
  ) => Promise<void>;
  onToggleSuspend: (id: string) => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleAction = async (decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED") => {
    setProcessing(true);
    try {
      await onDecision(instructor.id, decision, feedback.trim() || undefined);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex justify-end animate-in fade-in">
      <div className="w-full max-w-2xl bg-card border-l border-white/10 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right-8 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-background/50 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-base shadow-md border border-white/10">
              {instructor.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-text">{instructor.name}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${
                    instructor.verificationStatus === "VERIFIED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {instructor.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-subtext mt-0.5">{instructor.email} • {instructor.phone || "+91 98765 00000"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-background hover:bg-card border border-white/10 text-subtext hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-3 p-3.5 rounded-xl bg-background/50 border border-white/5 text-center">
            <div>
              <p className="text-[10px] text-subtext uppercase">Students</p>
              <p className="text-sm font-bold text-text mt-0.5">{instructor.totalStudents.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Revenue</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{instructor.totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Rating</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{instructor.rating} ★</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Tasks / Live</p>
              <p className="text-sm font-bold text-purple-300 mt-0.5">
                {instructor.assignedTasksCount || 2} / {instructor.liveSessionsCount || 1}
              </p>
            </div>
          </div>

          {/* Verification & Resume */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Verification Documents & Credentials</span>
            </h3>

            <div>
              <p className="text-[11px] text-subtext font-semibold uppercase">Professional Experience</p>
              <p className="text-xs text-text mt-0.5 leading-relaxed bg-card p-2.5 rounded-lg border border-white/5">
                {instructor.experience || "5+ years enterprise software and AI development."}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-subtext font-semibold uppercase mb-1">Areas of Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {(instructor.skills || ["Machine Learning", "System Design"]).map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {instructor.resumeUrl && (
              <div className="pt-2 flex items-center justify-between p-2.5 rounded-lg bg-card border border-white/5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-text">Resume_Document.pdf</span>
                </div>
                <a
                  href={instructor.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-[11px] flex items-center gap-1"
                >
                  <span>Preview PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Courses Taught */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-2.5">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Assigned Courses</span>
            </h3>
            <div className="space-y-1.5">
              {instructor.coursesCreated.map((course) => (
                <div key={course} className="p-2.5 rounded-lg bg-card border border-white/5 flex items-center justify-between">
                  <span className="font-semibold text-text">{course}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Decision Feedback Field */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-2">
            <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block">
              Administrative Review Notes / Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add review notes, required document updates, or approval rationale..."
              className="w-full bg-card border border-white/10 rounded-xl p-3 text-xs text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50 resize-none h-20"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-white/10 bg-background/60 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => onToggleSuspend(instructor.id)}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              instructor.accountStatus === "Active"
                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{instructor.accountStatus === "Active" ? "Suspend Instructor" : "Activate Account"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction("CHANGES_REQUESTED")}
              disabled={processing}
              className="py-2 px-3 rounded-xl bg-card hover:bg-white/5 border border-white/10 text-amber-400 text-xs font-bold transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Changes</span>
            </button>

            <button
              onClick={() => handleAction("REJECTED")}
              disabled={processing}
              className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition-all flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            <button
              onClick={() => handleAction("APPROVED")}
              disabled={processing}
              className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve & Verify</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
