"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Search,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Ban,
  FileText,
  Video,
  Star,
  Sparkles,
  ExternalLink,
  Check,
  X,
  RotateCcw,
  Loader2,
  Code2,
  Briefcase
} from "lucide-react";

export type InstructorTab = "all" | "approvals" | "verified" | "suspended";

export interface InstructorItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  experience?: string;
  skills: string[];
  areasOfExpertise?: string;
  bio?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  teachingVideoUrl?: string;
  teachingVideoType?: string;
  rating: number;
  verificationStatus: "VERIFIED" | "PENDING" | "CHANGES_REQUESTED" | "REJECTED";
  accountStatus: "Active" | "Inactive" | "Suspended";
  joinedDate: string;
  assignedTasksCount?: number;
  liveSessionsCount?: number;
  rawApproval?: any;
}

// Helper to parse skills from string / JSON
function parseSkillsHelper(skillsData?: string | string[] | null, expertise?: string | null): string[] {
  const result: string[] = [];
  if (skillsData) {
    if (Array.isArray(skillsData)) {
      skillsData.forEach((s) => {
        if (typeof s === "string" && s.trim()) result.push(s.trim());
      });
    } else if (typeof skillsData === "string") {
      try {
        const parsed = JSON.parse(skillsData);
        if (Array.isArray(parsed)) {
          parsed.forEach((s) => {
            if (typeof s === "string" && s.trim()) result.push(s.trim());
          });
        }
      } catch {
        skillsData.split(",").forEach((s) => {
          const clean = s.trim();
          if (clean && !result.includes(clean)) result.push(clean);
        });
      }
    }
  }

  if (result.length === 0 && expertise) {
    expertise.split(",").forEach((s) => {
      const clean = s.trim();
      if (clean && !result.includes(clean)) result.push(clean);
    });
  }

  return result;
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
    areasOfExpertise: "Large Language Models & Agentic Workflows",
    bio: "Lead AI Researcher & Instructor with over 15 published research papers.",
    resumeUrl: "https://glarus.edu/resumes/sarah_chen.pdf",
    resumeFileName: "Sarah_Chen_Resume.pdf",
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
    areasOfExpertise: "RAG Architecture & Enterprise AI Agents",
    bio: "Senior AI Engineer passionate about hands-on production agent development.",
    resumeUrl: "https://glarus.edu/resumes/alex_chen_cv.pdf",
    resumeFileName: "Alex_Chen_CV.pdf",
    rating: 4.8,
    verificationStatus: "PENDING",
    accountStatus: "Inactive",
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
    areasOfExpertise: "Modern Fullstack Frontend Systems",
    bio: "Frontend architect teaching modern full-stack web engineering.",
    resumeUrl: "https://glarus.edu/resumes/john_doe.pdf",
    resumeFileName: "John_Doe_Resume.pdf",
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
    skills: ["HTML", "CSS", "JavaScript", "Web Basics"],
    areasOfExpertise: "Web Fundamentals & Responsive UI",
    bio: "Web fundamentals educator.",
    resumeUrl: "https://glarus.edu/resumes/bob_smith.pdf",
    resumeFileName: "Bob_Smith_CV.pdf",
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as InstructorTab) || "all";

  const [activeTab, setActiveTab] = useState<InstructorTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [instructors, setInstructors] = useState<InstructorItem[]>(MOCK_INSTRUCTORS);

  // Sync tab from URL if changed
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as InstructorTab;
    if (tabFromUrl && ["all", "approvals", "verified", "suspended"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Load real API approvals & instructors from database
  useEffect(() => {
    async function loadApprovals() {
      try {
        const res = await fetch("/api/admin/approvals/instructor");
        if (res.ok) {
          const data = await res.json();
          const loadedList: InstructorItem[] = [];

          // Process DB approvals
          if (data.approvals && Array.isArray(data.approvals)) {
            data.approvals.forEach((app: any) => {
              const fullName =
                app.firstName && app.lastName
                  ? `${app.firstName} ${app.lastName}`.trim()
                  : app.user?.name || "Instructor";

              const initials = fullName
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "IN";

              const skills = parseSkillsHelper(app.skills, app.areasOfExpertise);

              const statusMap: Record<string, InstructorItem["verificationStatus"]> = {
                APPROVED: "VERIFIED",
                PENDING: "PENDING",
                CHANGES_REQUESTED: "CHANGES_REQUESTED",
                REJECTED: "REJECTED"
              };

              const verifStatus = statusMap[app.status] || "PENDING";
              const isBlocked = app.user?.status === "BLOCKED";
              const accStatus: InstructorItem["accountStatus"] = isBlocked
                ? "Suspended"
                : verifStatus === "VERIFIED"
                ? "Active"
                : "Inactive";

              loadedList.push({
                id: app.userId || app.id,
                name: fullName,
                email: app.email || app.user?.email || "instructor@glarus.edu",
                avatar: initials,
                phone: app.phone || undefined,
                experience: app.experience || undefined,
                skills: skills.length > 0 ? skills : ["Instructor"],
                areasOfExpertise: app.areasOfExpertise || undefined,
                bio: app.aboutInstructor || app.bio || undefined,
                resumeUrl: app.resumeUrl || undefined,
                resumeFileName: app.resumeFileName || undefined,
                teachingVideoUrl: app.teachingVideoUrl || undefined,
                teachingVideoType: app.teachingVideoType || undefined,
                rating: 5.0,
                verificationStatus: verifStatus,
                accountStatus: accStatus,
                joinedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recent",
                assignedTasksCount: 0,
                liveSessionsCount: 0,
                rawApproval: app
              });
            });
          }

          // If DB has real items, merge with mock items (avoiding id conflicts)
          if (loadedList.length > 0) {
            setInstructors((prev) => {
              const loadedIds = new Set(loadedList.map((i) => i.id));
              const nonConflictingMock = prev.filter((m) => !loadedIds.has(m.id));
              return [...loadedList, ...nonConflictingMock];
            });
          }
        }
      } catch {
        /* ignore */
      }
    }
    loadApprovals();
  }, []);

  const handleToggleSuspend = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInstructors((prev) =>
      prev.map((inst) => {
        if (inst.id === id) {
          const nextStatus: InstructorItem["accountStatus"] =
            inst.accountStatus === "Suspended"
              ? inst.verificationStatus === "VERIFIED"
                ? "Active"
                : "Inactive"
              : "Suspended";

          return {
            ...inst,
            accountStatus: nextStatus
          };
        }
        return inst;
      })
    );
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/instructors/${encodeURIComponent(id)}`);
  };

  // Filtered instructors based on active tab and search
  const filteredInstructors = useMemo(() => {
    return instructors.filter((inst) => {
      // Tab matching
      if (
        activeTab === "approvals" &&
        inst.verificationStatus !== "PENDING" &&
        inst.verificationStatus !== "CHANGES_REQUESTED"
      ) {
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
        const matchExpertise = inst.areasOfExpertise?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchSkills && !matchExpertise) return false;
      }

      // Status filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "ACTIVE" && inst.accountStatus !== "Active") return false;
        if (statusFilter === "INACTIVE" && inst.accountStatus !== "Inactive") return false;
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
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Tab Controls */}
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
            All Instructors ({instructors.length})
          </button>

          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "verified"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Verified
          </button>

          <button
            onClick={() => setActiveTab("suspended")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "suspended"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Suspended
          </button>
        </div>
      </div>

      {/* Main Content: Instructor Table & Filters */}
      <div className="space-y-4">
        {/* Search and Filters Bar */}
        <div className="bg-card border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search instructors by name, email, skills..."
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
              className="bg-background border border-white/10 text-xs font-semibold text-text px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50 cursor-pointer"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
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
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                  <th className="py-4 px-6 w-[32%]">Instructor Profile</th>
                  <th className="py-4 px-4 w-[34%]">Skills</th>
                  <th className="py-4 px-4 text-center">Rating</th>
                  <th className="py-4 px-4 text-center">Verification</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium">
                {filteredInstructors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-subtext space-y-2">
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
                      onClick={() => handleRowClick(inst.id)}
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

                      {/* Skills Column (Form Submitted by Instructor) */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {inst.skills && inst.skills.length > 0 ? (
                            inst.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 truncate max-w-[150px]"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-subtext/50 italic">No skills listed</span>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{inst.rating}</span>
                        </div>
                      </td>

                      {/* Verification Status */}
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
                              : inst.accountStatus === "Inactive"
                              ? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {inst.accountStatus}
                        </span>
                      </td>

                      {/* Actions: Direct Link to Dedicated Inspector Page */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/instructors/${encodeURIComponent(inst.id)}`}
                            title="Inspect Full Profile, Credentials & Courses"
                            className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold text-subtext hover:text-white transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </Link>

                          <button
                            onClick={(e) => handleToggleSuspend(inst.id, e)}
                            title={inst.accountStatus === "Suspended" ? "Activate Account" : "Suspend Account"}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              inst.accountStatus === "Suspended"
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
    </div>
  );
}
