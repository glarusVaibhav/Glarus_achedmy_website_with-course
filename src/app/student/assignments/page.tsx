"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";
import {
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PlaySquare,
  Award,
  Upload,
  Search,
  Filter,
  Layers,
  Sparkles,
  BookOpen,
  Check,
  ChevronDown,
  X,
  ExternalLink,
  GitBranch,
  Code2,
  Globe,
  FileText,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface StudentAssignmentItem {
  id: string;
  title: string;
  course: string;
  courseId: string;
  module: string;
  instructor: string;
  dueDate: string;
  dueTimestamp: string;
  status: "PENDING" | "IN_REVIEW" | "GRADED";
  points: string;
  totalMarks: number;
  score?: string;
  scoreNumeric?: number;
  description: string;
  instructions?: string[];
  feedback?: string;
  gradedDate?: string;
  submission?: {
    githubUrl?: string;
    liveUrl?: string;
    fileName?: string;
    notes?: string;
    submittedAt?: string;
  };
}

const INITIAL_STUDENT_ASSIGNMENTS: StudentAssignmentItem[] = [
  {
    id: "asg-1",
    title: "Building an Autonomous Research Agent with LangGraph",
    course: "Advanced Generative AI Masterclass",
    courseId: "c-genai-adv",
    module: "Module 6: Multi-Agent Graphs & Workflows",
    instructor: "Dr. Alex Vance",
    dueDate: "Aug 24, 2026",
    dueTimestamp: "2026-08-24T23:59:00",
    status: "PENDING",
    points: "100 Pts",
    totalMarks: 100,
    description: "Implement a cyclical multi-agent graph with supervisor routing and persistent SQLite checkpointing in Python.",
    instructions: [
      "Use LangGraph with StateGraph to construct supervisor and worker agents.",
      "Integrate Tavily or SerpAPI tool nodes for live web retrieval.",
      "Implement thread memory and checkpoint resumption.",
      "Submit your GitHub repo with a requirements.txt and sample run notebook."
    ]
  },
  {
    id: "asg-2",
    title: "Hybrid Vector Indexing & BM25 Benchmark Challenge",
    course: "Advanced Generative AI Masterclass",
    courseId: "c-genai-adv",
    module: "Module 4: Advanced RAG Architecture",
    instructor: "Elena Rostova",
    dueDate: "Aug 21, 2026",
    dueTimestamp: "2026-08-21T23:59:00",
    status: "IN_REVIEW",
    points: "100 Pts",
    totalMarks: 100,
    description: "Build a Reciprocal Rank Fusion (RRF) pipeline and measure Recall@10 against baseline dense retrieval over 5,000 documents.",
    submission: {
      githubUrl: "https://github.com/learner-student/hybrid-rrf-benchmark",
      liveUrl: "https://rag-benchmark-demo.vercel.app",
      fileName: "benchmark_evaluation_report.pdf",
      notes: "Achieved a 28% higher Recall@10 with cross-encoder reranking.",
      submittedAt: "Aug 19, 2026 at 04:30 PM"
    }
  },
  {
    id: "asg-3",
    title: "Fine-Tuning Llama 3.3 with LoRA & Unsloth",
    course: "Advanced Generative AI Masterclass",
    courseId: "c-genai-adv",
    module: "Module 8: Parameter Efficient Fine-Tuning",
    instructor: "Dr. Alex Vance",
    dueDate: "Aug 28, 2026",
    dueTimestamp: "2026-08-28T23:59:00",
    status: "PENDING",
    points: "150 Pts",
    totalMarks: 150,
    description: "Quantize and fine-tune an instruction model on custom customer support reasoning dataset with 4-bit QLoRA."
  },
  {
    id: "asg-4",
    title: "Custom PyTorch Loss & Transformer Block Implementation",
    course: "Generative AI & LLM Systems",
    courseId: "c-llm-sys",
    module: "Module 3: Transformer Deep-Dive",
    instructor: "Dr. Alex Vance",
    dueDate: "Aug 10, 2026",
    dueTimestamp: "2026-08-10T23:59:00",
    status: "GRADED",
    score: "98/100",
    scoreNumeric: 98,
    points: "100 Pts",
    totalMarks: 100,
    description: "Implement scaled dot-product multi-head attention with causal masking, LayerNorm, and RoPE positional encodings in PyTorch.",
    gradedDate: "Aug 12, 2026",
    feedback: "Outstanding work! Your RoPE vector rotation and causal mask tensors are cleanly vectorized with zero CPU bottlenecks. 98/100 awarded.",
    submission: {
      githubUrl: "https://github.com/learner-student/pytorch-transformer-from-scratch",
      fileName: "transformer_blocks_submission.zip",
      notes: "Includes test suite validating attention tensor shapes across batch sizes.",
      submittedAt: "Aug 09, 2026 at 11:15 PM"
    }
  },
  {
    id: "asg-5",
    title: "KV-Cache Memory Optimization & PagedAttention Simulation",
    course: "Generative AI & LLM Systems",
    courseId: "c-llm-sys",
    module: "Module 7: High-Throughput Model Serving",
    instructor: "Dr. Alex Vance",
    dueDate: "Sep 02, 2026",
    dueTimestamp: "2026-09-02T23:59:00",
    status: "PENDING",
    points: "100 Pts",
    totalMarks: 100,
    description: "Simulate a virtual memory page table for continuous batching of variable length prompt responses."
  },
  {
    id: "asg-6",
    title: "Full-Stack Next.js 15 Server Actions & Prisma E-Commerce",
    course: "Full-Stack Web Development Bootcamp",
    courseId: "c-web-bootcamp",
    module: "Module 5: Next.js 15 App Router",
    instructor: "Sarah Jenkins",
    dueDate: "Aug 08, 2026",
    dueTimestamp: "2026-08-08T23:59:00",
    status: "GRADED",
    score: "94/100",
    scoreNumeric: 94,
    points: "100 Pts",
    totalMarks: 100,
    description: "Build an end-to-end e-commerce store with optimistic UI updates, Server Actions, PostgreSQL, and Stripe webhook handling.",
    gradedDate: "Aug 11, 2026",
    feedback: "Great architecture and clean Prisma schema migrations! Minor note: consider adding debounce on search queries.",
    submission: {
      githubUrl: "https://github.com/learner-student/next15-ecommerce-platform",
      liveUrl: "https://next-storefront-demo.vercel.app",
      submittedAt: "Aug 07, 2026 at 08:45 PM"
    }
  },
  {
    id: "asg-7",
    title: "Real-Time WebSocket Collaboration Room & Canvas",
    course: "Full-Stack Web Development Bootcamp",
    courseId: "c-web-bootcamp",
    module: "Module 8: WebSockets & Distributed State",
    instructor: "Sarah Jenkins",
    dueDate: "Aug 30, 2026",
    dueTimestamp: "2026-08-30T23:59:00",
    status: "PENDING",
    points: "100 Pts",
    totalMarks: 100,
    description: "Create a shared multi-user whiteboarding canvas with conflict-free replicated data types (CRDTs) and Socket.io."
  },
  {
    id: "asg-8",
    title: "Backpropagation Matrix Calculus & Gradient Descent From Scratch",
    course: "Mathematics & Foundations of Deep Learning",
    courseId: "c-math-ai",
    module: "Module 2: Multivariable Calculus for Neural Nets",
    instructor: "Dr. Sophia Rivera",
    dueDate: "Aug 05, 2026",
    dueTimestamp: "2026-08-05T23:59:00",
    status: "GRADED",
    score: "96/100",
    scoreNumeric: 96,
    points: "100 Pts",
    totalMarks: 100,
    description: "Derive and implement analytical Jacobians and matrix gradients for 3-layer MLP in pure NumPy without PyTorch autograd.",
    gradedDate: "Aug 07, 2026",
    feedback: "Flawless mathematical derivation of the chain rule over weight tensors. NumPy vectorization is spotless.",
    submission: {
      githubUrl: "https://github.com/learner-student/numpy-backprop-calculus",
      fileName: "backprop_derivation_proofs.pdf",
      submittedAt: "Aug 04, 2026 at 06:10 PM"
    }
  },
  {
    id: "asg-9",
    title: "Multi-Agent Consensus Protocol & Tool Execution Sandbox",
    course: "Autonomous AI Agents & Swarms",
    courseId: "c-agents-swarm",
    module: "Module 4: Agent Consensus & Voting",
    instructor: "Marcus Thorne",
    dueDate: "Aug 22, 2026",
    dueTimestamp: "2026-08-22T23:59:00",
    status: "IN_REVIEW",
    points: "120 Pts",
    totalMarks: 120,
    description: "Implement a 3-agent debate protocol where a moderator agent aggregates consensus before triggering code execution.",
    submission: {
      githubUrl: "https://github.com/learner-student/multi-agent-debate-protocol",
      notes: "Implemented timeout fallback with majority voting heuristic.",
      submittedAt: "Aug 18, 2026 at 09:20 AM"
    }
  }
];

function StudentAssignmentsContent() {
  const searchParams = useSearchParams();
  const initialCourseParam = searchParams.get("course") || searchParams.get("courseTitle") || "ALL";
  const initialStatusParam = searchParams.get("status") || "ALL";

  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>(INITIAL_STUDENT_ASSIGNMENTS);
  const [selectedCourse, setSelectedCourse] = useState<string>(initialCourseParam);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusParam);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"due_date" | "points" | "status" | "title">("due_date");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  /* ── Interactive Modals ── */
  const [submittingAssignment, setSubmittingAssignment] = useState<StudentAssignmentItem | null>(null);
  const [viewingFeedback, setViewingFeedback] = useState<StudentAssignmentItem | null>(null);
  const [viewingDetails, setViewingDetails] = useState<StudentAssignmentItem | null>(null);

  /* ── Submission Form State ── */
  const [submitGithub, setSubmitGithub] = useState("");
  const [submitLiveUrl, setSubmitLiveUrl] = useState("");
  const [submitNotes, setSubmitNotes] = useState("");
  const [submitFileName, setSubmitFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* ── Distinct Courses with Counts ── */
  const coursesList = useMemo(() => {
    const courseMap: Record<string, { name: string; count: number; pendingCount: number }> = {};

    assignments.forEach((asg) => {
      if (!courseMap[asg.course]) {
        courseMap[asg.course] = { name: asg.course, count: 0, pendingCount: 0 };
      }
      courseMap[asg.course].count += 1;
      if (asg.status === "PENDING") {
        courseMap[asg.course].pendingCount += 1;
      }
    });

    return Object.values(courseMap);
  }, [assignments]);

  /* ── Filtered & Sorted Assignments ── */
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      // 1. Course Filter
      if (selectedCourse !== "ALL") {
        const matchesCourse =
          item.course.toLowerCase() === selectedCourse.toLowerCase() ||
          item.course.toLowerCase().includes(selectedCourse.toLowerCase()) ||
          selectedCourse.toLowerCase().includes(item.course.toLowerCase()) ||
          item.courseId.toLowerCase() === selectedCourse.toLowerCase();

        if (!matchesCourse) return false;
      }

      // 2. Status Filter
      if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
        return false;
      }

      // 3. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.course.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.instructor.toLowerCase().includes(q) ||
          item.module.toLowerCase().includes(q);

        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "due_date") {
        return new Date(a.dueTimestamp).getTime() - new Date(b.dueTimestamp).getTime();
      }
      if (sortBy === "points") {
        return b.totalMarks - a.totalMarks;
      }
      if (sortBy === "status") {
        const order = { PENDING: 1, IN_REVIEW: 2, GRADED: 3 };
        return order[a.status] - order[b.status];
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [assignments, selectedCourse, selectedStatus, searchQuery, sortBy]);

  /* ── Key Statistics ── */
  const stats = useMemo(() => {
    const total = assignments.length;
    const pending = assignments.filter((a) => a.status === "PENDING").length;
    const inReview = assignments.filter((a) => a.status === "IN_REVIEW").length;
    const graded = assignments.filter((a) => a.status === "GRADED").length;

    const scored = assignments.filter((a) => a.scoreNumeric !== undefined);
    const avgScore = scored.length > 0
      ? Math.round(scored.reduce((acc, a) => acc + (a.scoreNumeric || 0), 0) / scored.length)
      : 96;

    return { total, pending, inReview, graded, avgScore };
  }, [assignments]);

  /* ── Handle Assignment Submission ── */
  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    if (!submitGithub.trim() && !submitLiveUrl.trim() && !submitFileName.trim()) {
      showToast("Please provide at least a GitHub repository, live URL, or project file.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setAssignments((prev) =>
        prev.map((item) => {
          if (item.id === submittingAssignment.id) {
            return {
              ...item,
              status: "IN_REVIEW",
              submission: {
                githubUrl: submitGithub || undefined,
                liveUrl: submitLiveUrl || undefined,
                fileName: submitFileName || "project_source_archive.zip",
                notes: submitNotes || undefined,
                submittedAt: "Just now"
              }
            };
          }
          return item;
        })
      );

      setIsSubmitting(false);
      showToast(`Assignment "${submittingAssignment.title}" submitted successfully!`);
      setSubmittingAssignment(null);
      setSubmitGithub("");
      setSubmitLiveUrl("");
      setSubmitNotes("");
      setSubmitFileName("");
    }, 600);
  };

  const handleOpenSubmit = (item: StudentAssignmentItem) => {
    setSubmittingAssignment(item);
    setSubmitGithub(item.submission?.githubUrl || "");
    setSubmitLiveUrl(item.submission?.liveUrl || "");
    setSubmitNotes(item.submission?.notes || "");
    setSubmitFileName(item.submission?.fileName || "");
  };

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* ── Toast Notification ── */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="fixed bottom-8 right-8 z-[130] flex items-center gap-3 px-4 py-3 bg-[#111827] border border-amber-500/40 text-white rounded-xl shadow-2xl text-xs font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════
            1. PAGE HEADER & QUICK ACTIONS
            ═══════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  My <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Assignments</span> & Projects
                </h1>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Assessment Hub
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Hands-on coding assessments, real-world capstone challenges, and instructor grading.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center shrink-0 flex-wrap">
            <Link
              href="/student/recorded-sessions"
              className="px-4 py-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <PlaySquare className="w-4 h-4" />
              <span>Review Class Recordings</span>
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            2. KEY SUMMARY METRICS BAR
            ═══════════════════════════════════════════════ */}
        <div className="bg-[#0E131F] border border-white/[0.08] rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
          <div className="flex items-center gap-3 px-2 pt-2 sm:pt-0">
            <div className="p-2.5 rounded-xl bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Total Assigned</div>
              <div className="text-lg font-black text-white">{stats.total}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-2 sm:pt-0 sm:pl-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-amber-300/80 font-medium">Pending Action</div>
              <div className="text-lg font-black text-amber-300">{stats.pending}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-2 sm:pt-0 sm:pl-4">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-sky-300/80 font-medium">Under Review</div>
              <div className="text-lg font-black text-sky-300">{stats.inReview}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-2 sm:pt-0 sm:pl-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-emerald-300/80 font-medium">Graded & Passed</div>
              <div className="text-lg font-black text-emerald-300">{stats.graded}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-2 sm:pt-0 sm:pl-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-purple-300/80 font-medium">Average Score</div>
              <div className="text-lg font-black text-purple-300">{stats.avgScore}%</div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            3. COURSE FILTER TABS (THE MAIN USER REQUEST)
            ═══════════════════════════════════════════════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              Filter by Enrolled Course:
            </span>

            {selectedCourse !== "ALL" && (
              <button
                onClick={() => setSelectedCourse("ALL")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Reset to All Courses</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Horizontal Scrollable Course Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCourse("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                selectedCourse === "ALL"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-[#0E131F] text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.16]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>All Courses</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedCourse === "ALL" ? "bg-slate-950/20 text-slate-950" : "bg-white/[0.08] text-slate-300"
              }`}>
                {assignments.length}
              </span>
            </button>

            {coursesList.map((c) => {
              const isSelected = selectedCourse === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelectedCourse(c.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/25"
                      : "bg-[#0E131F] text-slate-300 hover:text-white border border-white/[0.08] hover:border-amber-500/30"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected ? "bg-slate-950/20 text-slate-950" : "bg-white/[0.08] text-slate-300"
                  }`}>
                    {c.count}
                  </span>
                  {c.pendingCount > 0 && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            4. SEARCH & STATUS FILTER TOOLBAR
            ═══════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0E131F] border border-white/[0.08]">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments by topic, instructions, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs + Sort Dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Pills */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedStatus === "ALL"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All ({assignments.filter(a => selectedCourse === "ALL" || a.course === selectedCourse).length})
              </button>
              <button
                onClick={() => setSelectedStatus("PENDING")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedStatus === "PENDING"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedStatus("IN_REVIEW")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedStatus === "IN_REVIEW"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                In Review
              </button>
              <button
                onClick={() => setSelectedStatus("GRADED")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedStatus === "GRADED"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Graded
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500/40 cursor-pointer"
              >
                <option value="due_date">Due Date</option>
                <option value="points">Total Points</option>
                <option value="status">Status</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            5. ACTIVE FILTER APPLIED BANNER
            ═══════════════════════════════════════════════ */}
        {selectedCourse !== "ALL" && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-300">Filtered for course:</span>
              <strong className="text-amber-300 font-bold">{selectedCourse}</strong>
              <span className="text-slate-500 font-mono">({filteredAssignments.length} assessments)</span>
            </div>

            <button
              onClick={() => setSelectedCourse("ALL")}
              className="text-slate-300 hover:text-white font-semibold underline cursor-pointer"
            >
              Show All Courses
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            6. ASSIGNMENTS GRID
            ═══════════════════════════════════════════════ */}
        {filteredAssignments.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0E131F] border border-white/[0.08] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-slate-400 flex items-center justify-center mx-auto border border-white/[0.08]">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No assignments found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No assignments matching your current filter criteria ({selectedCourse !== "ALL" ? `Course: ${selectedCourse}, ` : ""}{selectedStatus !== "ALL" ? `Status: ${selectedStatus}` : "all filters"}).
            </p>
            <button
              onClick={() => {
                setSelectedCourse("ALL");
                setSelectedStatus("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((item) => (
              <div
                key={item.id}
                className="bg-[#0E131F] border border-white/[0.08] hover:border-amber-500/40 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <div className="space-y-2.5">
                  {/* Top Status & Points */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === "PENDING"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : item.status === "IN_REVIEW"
                        ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                        : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      {item.status === "PENDING" && "PENDING SUBMISSION"}
                      {item.status === "IN_REVIEW" && "IN REVIEW"}
                      {item.status === "GRADED" && "GRADED & PASSED"}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-300 bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/[0.06]">
                      {item.points}
                    </span>
                  </div>

                  {/* Course Title Badge (Clickable to Filter) */}
                  <button
                    onClick={() => setSelectedCourse(item.course)}
                    className="text-[11px] font-extrabold text-amber-400/90 hover:text-amber-300 tracking-wide uppercase text-left transition-colors cursor-pointer"
                  >
                    {item.course}
                  </button>

                  {/* Assignment Title */}
                  <h3
                    onClick={() => setViewingDetails(item)}
                    className="font-bold text-base text-white leading-snug group-hover:text-amber-200 transition-colors line-clamp-2 cursor-pointer"
                  >
                    {item.title}
                  </h3>

                  {/* Module info & Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <p className="text-[11px] text-slate-400 pt-0.5">
                    Instructor: <strong className="text-slate-300 font-medium">{item.instructor}</strong>
                  </p>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Due {item.dueDate}
                  </span>

                  {item.status === "GRADED" ? (
                    <button
                      onClick={() => setViewingFeedback(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Score: {item.score}</span>
                    </button>
                  ) : item.status === "IN_REVIEW" ? (
                    <button
                      onClick={() => handleOpenSubmit(item)}
                      className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 font-bold transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Update Work</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenSubmit(item)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 text-xs hover:scale-[1.02]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit Work →</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            7. SUBMISSION MODAL
            ═══════════════════════════════════════════════ */}
        <AnimatePresence>
          {submittingAssignment && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-xs"
                onClick={() => setSubmittingAssignment(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0E131F] border border-amber-500/30 rounded-2xl p-6 sm:p-7 max-w-xl w-full relative z-10 shadow-2xl space-y-5 text-slate-200 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {submittingAssignment.course}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                      Submit: {submittingAssignment.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Due: {submittingAssignment.dueDate} · Points: {submittingAssignment.points}
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmittingAssignment(null)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
                  {/* GitHub Repo URL */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                      GitHub Repository URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/your-username/assignment-repo"
                      value={submitGithub}
                      onChange={(e) => setSubmitGithub(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  {/* Live Demo URL */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Live Deployment URL (Optional):
                    </label>
                    <input
                      type="url"
                      placeholder="https://your-deployed-agent.vercel.app"
                      value={submitLiveUrl}
                      onChange={(e) => setSubmitLiveUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  {/* File Upload Attachment */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-slate-400" />
                      Attach Source Code Archive or PDF:
                    </label>
                    <div className="p-4 border border-dashed border-white/[0.14] rounded-xl bg-white/[0.02] text-center space-y-2">
                      <FileText className="w-6 h-6 text-amber-400 mx-auto opacity-80" />
                      <div className="text-xs text-slate-300">
                        {submitFileName ? (
                          <span className="font-bold text-amber-300">{submitFileName}</span>
                        ) : (
                          <span>Drag and drop your .zip, .py, or .pdf file, or browse</span>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        id="asg-file-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSubmitFileName(file.name);
                        }}
                      />
                      <label
                        htmlFor="asg-file-upload"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>

                  {/* Submission Notes */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      Notes for the Instructor (Optional):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mention any bonus features, specific benchmarks achieved, or dependencies needed..."
                      value={submitNotes}
                      onChange={(e) => setSubmitNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  {/* Modal Actions */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmittingAssignment(null)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Confirm & Submit Assessment</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════
            8. INSTRUCTOR FEEDBACK & GRADE DETAILS MODAL
            ═══════════════════════════════════════════════ */}
        <AnimatePresence>
          {viewingFeedback && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-xs"
                onClick={() => setViewingFeedback(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0E131F] border border-emerald-500/40 rounded-2xl p-6 sm:p-7 max-w-lg w-full relative z-10 shadow-2xl space-y-5 text-slate-200"
              >
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        Graded & Verified
                      </span>
                      <h2 className="text-lg font-bold text-white">
                        {viewingFeedback.title}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingFeedback(null)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Score Highlight Box */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 font-medium">Awarded Score</div>
                      <div className="text-2xl font-black text-emerald-300">{viewingFeedback.score}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 font-medium">Evaluated by</div>
                      <div className="text-sm font-bold text-white">{viewingFeedback.instructor}</div>
                      <div className="text-[10px] text-slate-400">{viewingFeedback.gradedDate}</div>
                    </div>
                  </div>

                  {/* Feedback Notes */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      Instructor Feedback & Comments:
                    </h4>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-300 leading-relaxed font-sans">
                      {viewingFeedback.feedback || "Great implementation! All unit test cases and execution requirements were met successfully."}
                    </div>
                  </div>

                  {/* Your Submitted Work */}
                  {viewingFeedback.submission && (
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                        Submitted Deliverables:
                      </h4>
                      <div className="space-y-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px]">
                        {viewingFeedback.submission.githubUrl && (
                          <a
                            href={viewingFeedback.submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:underline flex items-center gap-1"
                          >
                            <GitBranch className="w-3 h-3" />
                            <span>{viewingFeedback.submission.githubUrl}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {viewingFeedback.submission.fileName && (
                          <div className="text-slate-300 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>{viewingFeedback.submission.fileName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setViewingFeedback(null)}
                      className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════
            9. ASSIGNMENT DETAILS & INSTRUCTIONS MODAL
            ═══════════════════════════════════════════════ */}
        <AnimatePresence>
          {viewingDetails && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-xs"
                onClick={() => setViewingDetails(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0E131F] border border-white/[0.14] rounded-2xl p-6 sm:p-7 max-w-lg w-full relative z-10 shadow-2xl space-y-5 text-slate-200"
              >
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {viewingDetails.course}
                    </span>
                    <h2 className="text-lg font-bold text-white mt-0.5">
                      {viewingDetails.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setViewingDetails(null)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-300">Description</h4>
                    <p className="text-slate-400 leading-relaxed">{viewingDetails.description}</p>
                  </div>

                  {viewingDetails.instructions && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-300">Deliverable Requirements:</h4>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                        {viewingDetails.instructions.map((inst, idx) => (
                          <li key={idx} className="leading-relaxed">{inst}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-slate-300">
                    <span>Deadline: <strong className="text-white">{viewingDetails.dueDate}</strong></span>
                    <span>Total: <strong className="text-amber-400">{viewingDetails.points}</strong></span>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setViewingDetails(null)}
                      className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      Close
                    </button>
                    {viewingDetails.status !== "GRADED" && (
                      <button
                        onClick={() => {
                          const item = viewingDetails;
                          setViewingDetails(null);
                          handleOpenSubmit(item);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs cursor-pointer shadow-md shadow-amber-500/20"
                      >
                        Submit Work →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </StudentPortalLayout>
  );
}

export default function StudentAssignmentsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400 text-sm">Loading assignments...</div>}>
      <StudentAssignmentsContent />
    </Suspense>
  );
}
