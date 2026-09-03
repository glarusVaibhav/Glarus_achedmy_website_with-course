"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Clock,
  Video,
  BookOpen,
  ClipboardCheck,
  Users,
  UserRound,
  FileText,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronRight,
  X,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  Info,
  Check,
  History,
  Layers,
  HelpCircle,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type TaskType =
  | "LIVE_SESSION"
  | "COURSE_CREATION"
  | "ASSIGNMENT_CREATION"
  | "MENTORSHIP"
  | "CONTENT_REVIEW"
  | "OTHER";

export type TaskStatus =
  | "AWAITING_RESPONSE"
  | "PENDING_ADMIN_APPROVAL"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DECLINED"
  | "CHANGES_REQUESTED"
  | "CANCELLED";

export type TaskPriority = "Urgent" | "High" | "Normal" | "Low";

export interface TaskTimelineEvent {
  timestamp: string;
  title: string;
  actor: string;
  note?: string;
}

export interface InstructorTaskItem {
  id: string;
  type: TaskType;
  title: string;
  contextCourse?: string;
  contextModule?: string;
  assignedBy: string;
  assignedAt: string;
  deadline: string;
  deadlineRelative: string;
  deadlineUrgent?: boolean;
  deadlineOverdue?: boolean;
  compensation: number;
  paymentStatus: "Pending" | "Processing" | "Paid" | "Approved";
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  deliverables?: string[];
  sessionDetails?: {
    date: string;
    time: string;
    durationMinutes: number;
    meetingUrl?: string;
    studentCount?: number;
    studentName?: string;
  };
  adminNotes?: string;
  instructorResponseNote?: string;
  timeline: TaskTimelineEvent[];
  targetModuleRoute: "Live Sessions" | "Create Course" | "Assignments" | "Students" | "Dashboard";
}

export const INITIAL_TASKS: InstructorTaskItem[] = [
  {
    id: "TSK-1042",
    type: "LIVE_SESSION",
    title: "AI Bootcamp: Multi-Agent System Architecture Review",
    contextCourse: "Agentic AI & Autonomous Workflows",
    contextModule: "Batch AI-2026-A • Capstone Module",
    assignedBy: "Academic Operations",
    assignedAt: "12 Aug · 10:20 AM",
    deadline: "20 Aug 2026",
    deadlineRelative: "Due in 8 days",
    compensation: 5000,
    paymentStatus: "Pending",
    priority: "Urgent",
    status: "AWAITING_RESPONSE",
    description: "Conduct an interactive 90-minute live architecture review of student capstone multi-agent implementations and memory state checkpoints.",
    deliverables: [
      "Conduct 90-minute live code walkthrough & Q&A",
      "Evaluate student PR tool calling workflows",
      "Submit student attendance & rubric feedback report",
    ],
    sessionDetails: {
      date: "Thu, 20 Aug 2026",
      time: "10:00 AM – 11:30 AM",
      durationMinutes: 90,
      meetingUrl: "https://meet.google.com/glarus-ai-review",
      studentCount: 48,
    },
    adminNotes: "Please ensure high-definition screen sharing for LangGraph graph inspection. Student attendance will be synced automatically.",
    timeline: [
      { timestamp: "12 Aug · 10:20 AM", title: "Admin Assigned Task", actor: "Academic Operations", note: "Compensation ₹5,000 assigned." },
    ],
    targetModuleRoute: "Live Sessions",
  },
  {
    id: "TSK-1043",
    type: "ASSIGNMENT_CREATION",
    title: "Create Final Capstone Assessment for Agentic AI",
    contextCourse: "Agentic AI & Autonomous Workflows",
    contextModule: "Module 8: Evaluation & Benchmarking",
    assignedBy: "Chief Academic Reviewer",
    assignedAt: "11 Aug · 03:45 PM",
    deadline: "25 Aug 2026",
    deadlineRelative: "Due in 2 days",
    deadlineUrgent: true,
    compensation: 3000,
    paymentStatus: "Pending",
    priority: "High",
    status: "AWAITING_RESPONSE",
    description: "Design and publish a multi-criteria assignment with test cases for multi-agent ReAct orchestration and JSON tool parsing.",
    deliverables: [
      "Create grading rubric with 4 weighted evaluation criteria",
      "Provide starter GitHub repository and test suite",
      "Set up automated sandbox evaluation parameters",
    ],
    adminNotes: "Focus on real-world tool execution failure modes and rollback handling.",
    timeline: [
      { timestamp: "11 Aug · 03:45 PM", title: "Admin Assigned Task", actor: "Chief Academic Reviewer", note: "Compensation ₹3,000 assigned." },
    ],
    targetModuleRoute: "Assignments",
  },
  {
    id: "TSK-1044",
    type: "COURSE_CREATION",
    title: "Build \"Generative AI for Enterprise\" Masterclass",
    contextCourse: "Enterprise AI Specialization",
    contextModule: "Full Curriculum (10 Modules)",
    assignedBy: "Academic Operations",
    assignedAt: "10 Aug · 09:15 AM",
    deadline: "30 Aug 2026",
    deadlineRelative: "Due in 18 days",
    compensation: 15000,
    paymentStatus: "Pending",
    priority: "Normal",
    status: "PENDING_ADMIN_APPROVAL",
    description: "Author and record an end-to-end curriculum on enterprise LLM deployment, private RAG pipelines, and security guardrails.",
    deliverables: [
      "10 structured syllabus modules with AI assistance",
      "20 video lectures with transcripts & slides",
      "5 interactive coding quizzes & sandboxes",
    ],
    adminNotes: "Proposal accepted by instructor. Currently awaiting secondary review from Academic Dean.",
    instructorResponseNote: "Accepted on Aug 10. Ready to begin module recording once confirmed.",
    timeline: [
      { timestamp: "10 Aug · 09:15 AM", title: "Admin Assigned Task", actor: "Academic Operations", note: "Compensation ₹15,000 assigned." },
      { timestamp: "10 Aug · 11:30 AM", title: "Instructor Accepted Task", actor: "Instructor", note: "Ready to begin syllabus construction." },
    ],
    targetModuleRoute: "Create Course",
  },
  {
    id: "TSK-1045",
    type: "MENTORSHIP",
    title: "1:1 Career & Architecture Mentorship Session",
    contextCourse: "Agentic AI Professional Track",
    contextModule: "Student 1-on-1 Advising",
    assignedBy: "Student Success Team",
    assignedAt: "09 Aug · 02:00 PM",
    deadline: "22 Aug 2026",
    deadlineRelative: "Tomorrow · 4:00 PM",
    compensation: 1500,
    paymentStatus: "Approved",
    priority: "Normal",
    status: "APPROVED",
    description: "Provide personalized career counseling and architecture feedback on student portfolio projects and AI engineer interviews.",
    deliverables: [
      "60-minute 1-on-1 Google Meet advising session",
      "Review student GitHub portfolio and resume",
      "Submit mentorship summary notes",
    ],
    sessionDetails: {
      date: "Fri, 22 Aug 2026",
      time: "04:00 PM – 05:00 PM",
      durationMinutes: 60,
      studentName: "Alex Rivera (Batch AI-2026-A)",
      meetingUrl: "https://meet.google.com/glarus-mentor-alex",
    },
    adminNotes: "Student has prepared a draft autonomous customer agent for your review.",
    timeline: [
      { timestamp: "09 Aug · 02:00 PM", title: "Admin Assigned Task", actor: "Student Success Team", note: "Compensation ₹1,500 assigned." },
      { timestamp: "09 Aug · 03:15 PM", title: "Instructor Accepted", actor: "Instructor" },
      { timestamp: "09 Aug · 04:00 PM", title: "Admin Approved Acceptance", actor: "Student Success Team", note: "Task activated into Mentorship Schedule." },
    ],
    targetModuleRoute: "Live Sessions",
  },
  {
    id: "TSK-1046",
    type: "LIVE_SESSION",
    title: "Agentic AI Q&A & Code Walkthrough",
    contextCourse: "Mastering Agentic AI & Autonomous Workflows",
    contextModule: "Batch AI-2026-A • Live Masterclass",
    assignedBy: "Academic Operations",
    assignedAt: "01 Aug · 10:00 AM",
    deadline: "10 Aug 2026",
    deadlineRelative: "Live Now",
    compensation: 5000,
    paymentStatus: "Pending",
    priority: "Urgent",
    status: "APPROVED",
    description: "Ongoing live interactive coding session discussing multi-agent orchestration and LangGraph patterns.",
    deliverables: [
      "Conduct live pair-programming and swarm walkthrough",
      "Answer student questions on memory state checkpointing",
    ],
    sessionDetails: {
      date: "Today, 10 Aug 2026",
      time: "10:45 AM – 12:00 PM",
      durationMinutes: 75,
      meetingUrl: "https://meet.google.com/glarus-ai-masterclass",
      studentCount: 24,
    },
    timeline: [
      { timestamp: "01 Aug · 10:00 AM", title: "Admin Assigned Task", actor: "Academic Operations" },
      { timestamp: "02 Aug · 02:15 PM", title: "Instructor Accepted", actor: "Instructor" },
      { timestamp: "03 Aug · 10:00 AM", title: "Admin Approved", actor: "Academic Operations" },
      { timestamp: "10 Aug · 10:45 AM", title: "Live Broadcast Started", actor: "System" },
    ],
    targetModuleRoute: "Live Sessions",
  },
  {
    id: "TSK-1047",
    type: "CONTENT_REVIEW",
    title: "Review Advanced RAG Benchmark Solutions",
    contextCourse: "Enterprise AI Specialization",
    contextModule: "Module 4: Hybrid Search",
    assignedBy: "Chief Academic Reviewer",
    assignedAt: "08 Aug · 11:00 AM",
    deadline: "18 Aug 2026",
    deadlineRelative: "Due in 4 days",
    compensation: 4000,
    paymentStatus: "Pending",
    priority: "Normal",
    status: "IN_PROGRESS",
    description: "Verify technical accuracy, code solutions, and benchmark rubrics for 12 hybrid sparse/dense retrieval exercises.",
    deliverables: [
      "Technical code audit of BM25 + Qdrant implementations",
      "Verify Docker execution container script",
    ],
    timeline: [
      { timestamp: "08 Aug · 11:00 AM", title: "Admin Assigned Task", actor: "Chief Academic Reviewer" },
      { timestamp: "08 Aug · 01:00 PM", title: "Instructor Accepted", actor: "Instructor" },
      { timestamp: "08 Aug · 02:30 PM", title: "Admin Approved", actor: "Chief Academic Reviewer" },
    ],
    targetModuleRoute: "Create Course",
  },
  {
    id: "TSK-1048",
    type: "LIVE_SESSION",
    title: "Introduction to Agentic ReAct Loops & Tools",
    contextCourse: "Mastering Agentic AI & Autonomous Workflows",
    contextModule: "Batch AI-2026-A • Lecture 1",
    assignedBy: "Academic Operations",
    assignedAt: "25 Jul · 10:00 AM",
    deadline: "05 Aug 2026",
    deadlineRelative: "Completed",
    compensation: 5000,
    paymentStatus: "Processing",
    priority: "Normal",
    status: "COMPLETED",
    description: "Foundation lecture delivered on reasoning and acting loops with custom tool definitions.",
    sessionDetails: {
      date: "05 Aug 2026",
      time: "10:00 AM – 12:00 PM",
      durationMinutes: 120,
      studentCount: 45,
    },
    timeline: [
      { timestamp: "25 Jul · 10:00 AM", title: "Admin Assigned Task", actor: "Academic Operations" },
      { timestamp: "26 Jul · 12:00 PM", title: "Instructor Accepted", actor: "Instructor" },
      { timestamp: "27 Jul · 09:00 AM", title: "Admin Approved", actor: "Academic Operations" },
      { timestamp: "05 Aug · 12:00 PM", title: "Live Class Delivered (96% attendance)", actor: "System" },
      { timestamp: "06 Aug · 11:00 AM", title: "Payment Approved (₹5,000)", actor: "Finance Admin" },
    ],
    targetModuleRoute: "Live Sessions",
  },
  {
    id: "TSK-1049",
    type: "LIVE_SESSION",
    title: "Vector Embeddings & Semantic Search Masterclass",
    contextCourse: "Agentic AI & Autonomous Workflows",
    contextModule: "Batch AI-2026-A • Workshop",
    assignedBy: "Academic Operations",
    assignedAt: "20 Jul · 11:00 AM",
    deadline: "02 Aug 2026",
    deadlineRelative: "Completed",
    compensation: 6000,
    paymentStatus: "Paid",
    priority: "Normal",
    status: "COMPLETED",
    description: "Deep dive into cosine similarity, HNSW indexing, and hybrid dense/sparse retrieval.",
    sessionDetails: {
      date: "02 Aug 2026",
      time: "06:00 PM – 08:00 PM",
      durationMinutes: 120,
      studentCount: 44,
    },
    timeline: [
      { timestamp: "20 Jul · 11:00 AM", title: "Admin Assigned Task", actor: "Academic Operations" },
      { timestamp: "21 Jul · 09:15 AM", title: "Instructor Accepted", actor: "Instructor" },
      { timestamp: "22 Jul · 10:00 AM", title: "Admin Approved", actor: "Academic Operations" },
      { timestamp: "02 Aug · 08:00 PM", title: "Live Class Delivered", actor: "System" },
      { timestamp: "04 Aug · 03:30 PM", title: "Payment Completed (₹6,000 via Direct Deposit)", actor: "Finance Admin" },
    ],
    targetModuleRoute: "Live Sessions",
  },
];

interface InstructorTasksViewProps {
  isDemoUser?: boolean;
  onNavigateTab?: (tabName: string) => void;
}

export function InstructorTasksView({ isDemoUser = false, onNavigateTab }: InstructorTasksViewProps) {
  const [tasks, setTasks] = useState<InstructorTaskItem[]>(isDemoUser ? INITIAL_TASKS : []);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    if (isDemoUser && tasks.length === 0) {
      setTasks(INITIAL_TASKS);
    }
  }, [isDemoUser]);

  /* Modals & Drawer State */
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<InstructorTaskItem | null>(null);
  const [declineTaskModal, setDeclineTaskModal] = useState<InstructorTaskItem | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [requestChangesModal, setRequestChangesModal] = useState<InstructorTaskItem | null>(null);
  const [changeReason, setChangeReason] = useState("");
  const [suggestedDate, setSuggestedDate] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("18:00");

  /* Toast Confirmation */
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle?: string; type?: "success" | "info" } | null>(null);

  const showToast = (title: string, subtitle?: string, type: "success" | "info" = "success") => {
    setToastMessage({ title, subtitle, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  /* ─────────────────────────────────────────────────────────────
     METRICS CALCULATION
     ───────────────────────────────────────────────────────────── */
  const pendingActionCount = tasks.filter(t => t.status === "AWAITING_RESPONSE").length;
  const acceptedPendingApprovalCount = tasks.filter(t => t.status === "PENDING_ADMIN_APPROVAL").length;
  const activeCount = tasks.filter(t => t.status === "APPROVED").length;
  const inProgressCount = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const completedCount = tasks.filter(t => t.status === "COMPLETED").length;

  const totalEarnings = tasks
    .filter(t => t.status === "COMPLETED" && (t.paymentStatus === "Paid" || t.paymentStatus === "Processing"))
    .reduce((sum, t) => sum + (t.compensation || 0), 0);

  const pendingPayment = tasks
    .filter(t => t.status === "COMPLETED" && t.paymentStatus === "Processing")
    .reduce((sum, t) => sum + (t.compensation || 0), 0);

  /* ─────────────────────────────────────────────────────────────
     FILTERING
     ───────────────────────────────────────────────────────────── */
  const filteredTasks = tasks.filter((task) => {
    // Search
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.contextCourse && task.contextCourse.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.contextModule && task.contextModule.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.assignedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Type Filter
    if (typeFilter !== "ALL" && task.type !== typeFilter) return false;

    // Status Filter
    if (statusFilter === "Action Required") return task.status === "AWAITING_RESPONSE";
    if (statusFilter === "Pending Approval") return task.status === "PENDING_ADMIN_APPROVAL";
    if (statusFilter === "Active") return task.status === "APPROVED";
    if (statusFilter === "In Progress") return task.status === "IN_PROGRESS";
    if (statusFilter === "Completed") return task.status === "COMPLETED";
    if (statusFilter === "Declined") return task.status === "DECLINED" || task.status === "CANCELLED";

    return true; // "All"
  });

  /* ─────────────────────────────────────────────────────────────
     LIFECYCLE HANDLERS
     ───────────────────────────────────────────────────────────── */
  const handleAcceptTask = (taskId: string) => {
    const nowStr = new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: "PENDING_ADMIN_APPROVAL",
            timeline: [
              ...t.timeline,
              {
                timestamp: nowStr,
                title: "Instructor Accepted Task",
                actor: "Instructor",
                note: "Sent to Admin for final confirmation.",
              },
            ],
          };
        }
        return t;
      })
    );

    // Update opened drawer if active
    if (selectedTaskForDetails && selectedTaskForDetails.id === taskId) {
      setSelectedTaskForDetails(prev => prev ? {
        ...prev,
        status: "PENDING_ADMIN_APPROVAL",
        timeline: [
          ...prev.timeline,
          {
            timestamp: nowStr,
            title: "Instructor Accepted Task",
            actor: "Instructor",
            note: "Sent to Admin for final confirmation.",
          },
        ],
      } : null);
    }

    showToast(
      "Task Accepted Successfully",
      "Your acceptance has been submitted and is awaiting Admin confirmation."
    );
  };

  const handleDeclineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineTaskModal || !declineReason.trim()) return;

    const nowStr = new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    setTasks(prev =>
      prev.map(t => {
        if (t.id === declineTaskModal.id) {
          return {
            ...t,
            status: "DECLINED",
            instructorResponseNote: declineReason.trim(),
            timeline: [
              ...t.timeline,
              {
                timestamp: nowStr,
                title: "Instructor Declined Task",
                actor: "Instructor",
                note: `Reason: ${declineReason.trim()}`,
              },
            ],
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetails && selectedTaskForDetails.id === declineTaskModal.id) {
      setSelectedTaskForDetails(null);
    }

    setDeclineTaskModal(null);
    setDeclineReason("");
    showToast("Task Declined", "Admin has been notified of your response.", "info");
  };

  const handleRequestChangesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestChangesModal || !changeReason.trim()) return;

    const nowStr = new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    setTasks(prev =>
      prev.map(t => {
        if (t.id === requestChangesModal.id) {
          return {
            ...t,
            status: "CHANGES_REQUESTED",
            instructorResponseNote: changeReason.trim(),
            timeline: [
              ...t.timeline,
              {
                timestamp: nowStr,
                title: `Instructor Requested Changes`,
                actor: "Instructor",
                note: `Proposed: ${suggestedDate ? `${suggestedDate} at ${suggestedTime}. ` : ""}${changeReason.trim()}`,
              },
            ],
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetails && selectedTaskForDetails.id === requestChangesModal.id) {
      setSelectedTaskForDetails(prev => prev ? {
        ...prev,
        status: "CHANGES_REQUESTED",
        timeline: [
          ...prev.timeline,
          {
            timestamp: nowStr,
            title: `Instructor Requested Changes`,
            actor: "Instructor",
            note: `Proposed: ${suggestedDate ? `${suggestedDate} at ${suggestedTime}. ` : ""}${changeReason.trim()}`,
          },
        ],
      } : null);
    }

    setRequestChangesModal(null);
    setChangeReason("");
    setSuggestedDate("");
    showToast("Changes Requested", "Admin will review your proposed adjustments.", "info");
  };

  const handleOpenTaskModule = (task: InstructorTaskItem) => {
    if (onNavigateTab) {
      onNavigateTab(task.targetModuleRoute);
    }
  };

  /* Helper for Task Type Icon */
  const renderTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case "LIVE_SESSION":
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case "COURSE_CREATION":
        return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
      case "ASSIGNMENT_CREATION":
        return <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400" />;
      case "MENTORSHIP":
        return <Users className="w-3.5 h-3.5 text-amber-400" />;
      case "CONTENT_REVIEW":
        return <FileText className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatTaskTypeLabel = (type: TaskType) => {
    switch (type) {
      case "LIVE_SESSION":
        return "Live Session";
      case "COURSE_CREATION":
        return "Course Creation";
      case "ASSIGNMENT_CREATION":
        return "Assignment";
      case "MENTORSHIP":
        return "1:1 Mentorship";
      case "CONTENT_REVIEW":
        return "Content Review";
      default:
        return "Admin Task";
    }
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 font-sans text-slate-200">
      {/* ─────────────────────────────────────────────────────────────
         TOAST CONFIRMATION NOTIFICATION
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-6 right-6 z-50 bg-[#0F172A]/95 border border-indigo-500/30 text-slate-100 px-4 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl max-w-sm flex items-start gap-3"
          >
            <div className="p-1.5 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0 mt-0.5 border border-indigo-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-semibold text-slate-100">{toastMessage.title}</div>
              {toastMessage.subtitle && (
                <p className="text-slate-400 mt-0.5">{toastMessage.subtitle}</p>
              )}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-500 hover:text-slate-300 p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
         1. EXECUTIVE HEADER
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[26px] font-semibold text-white tracking-tight">
              Tasks
            </h1>
            <span className="text-[10px] font-medium text-slate-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-md">
              Admin Assigned Work
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
            Manage assignments, live sessions, courses, mentorships and other work assigned by the Admin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-xl font-mono">
            {tasks.length} Total Assigned Tasks
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         2. PREMIUM EXECUTIVE METRICS ROW
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {[
          {
            id: "Action Required",
            label: "PENDING ACTION",
            value: pendingActionCount,
            desc: "Need your response",
            accent: pendingActionCount > 0 ? "text-amber-400" : "text-slate-100",
            dot: pendingActionCount > 0 ? "bg-amber-400 animate-pulse" : "bg-slate-600",
          },
          {
            id: "Pending Approval",
            label: "ACCEPTED",
            value: acceptedPendingApprovalCount,
            desc: "Awaiting Admin Approval",
            accent: "text-slate-100",
            dot: "bg-purple-400",
          },
          {
            id: "Active",
            label: "ACTIVE",
            value: activeCount,
            desc: "Currently assigned",
            accent: "text-slate-100",
            dot: "bg-indigo-400",
          },
          {
            id: "In Progress",
            label: "IN PROGRESS",
            value: inProgressCount,
            desc: "Work underway",
            accent: "text-slate-100",
            dot: "bg-blue-400",
          },
          {
            id: "Completed",
            label: "COMPLETED",
            value: completedCount,
            desc: "Successfully delivered",
            accent: "text-slate-100",
            dot: "bg-emerald-400",
          },
          {
            id: "All",
            label: "TOTAL EARNINGS",
            value: `₹${(totalEarnings / 1000).toFixed(0)}K`,
            desc: "Delivered work",
            accent: "text-slate-100",
            dot: "bg-emerald-500",
          },
          {
            id: "All",
            label: "PENDING PAYMENT",
            value: `₹${(pendingPayment / 1000).toFixed(0)}K`,
            desc: "Awaiting processing",
            accent: "text-slate-100",
            dot: "bg-slate-500",
          },
        ].map((metric, i) => {
          const isSelected = statusFilter === metric.id && metric.id !== "All";
          return (
            <button
              key={i}
              onClick={() => {
                if (metric.id !== "All") setStatusFilter(metric.id);
              }}
              className={`bg-[#121824]/90 border rounded-xl p-3 text-left transition-all duration-150 cursor-pointer hover:border-white/[0.16] hover:bg-[#151D2C] ${
                isSelected ? "border-indigo-500/40 bg-[#162032]" : "border-white/[0.08]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-semibold text-slate-400 tracking-wider truncate">
                  {metric.label}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${metric.dot}`} />
              </div>
              <div className={`text-lg sm:text-xl font-semibold tracking-tight ${metric.accent}`}>
                {metric.value}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-normal truncate">
                {metric.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
         3. TASK NAVIGATION & FILTER BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121824]/90 border border-white/[0.08] p-2 rounded-2xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Status Nav Tabs */}
        <div className="flex items-center gap-1 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: "All", label: "All Tasks" },
            { id: "Action Required", label: "Action Required", count: pendingActionCount, highlight: true },
            { id: "Pending Approval", label: "Pending Approval", count: acceptedPendingApprovalCount },
            { id: "Active", label: "Active", count: activeCount },
            { id: "In Progress", label: "In Progress", count: inProgressCount },
            { id: "Completed", label: "Completed" },
            { id: "Declined", label: "Declined" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    tab.highlight && !isActive ? "bg-amber-500/20 text-amber-300" : isActive ? "bg-white/20 text-white" : "bg-white/[0.06] text-slate-400"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Search & Type Filter Controls */}
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
          {/* Type Filter Select */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] focus:border-white/[0.2] text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none appearance-none pr-7 cursor-pointer"
            >
              <option value="ALL" className="bg-[#121824] text-slate-200">All Types</option>
              <option value="LIVE_SESSION" className="bg-[#121824] text-slate-200">Live Session</option>
              <option value="COURSE_CREATION" className="bg-[#121824] text-slate-200">Course Creation</option>
              <option value="ASSIGNMENT_CREATION" className="bg-[#121824] text-slate-200">Assignment</option>
              <option value="MENTORSHIP" className="bg-[#121824] text-slate-200">Mentorship</option>
              <option value="CONTENT_REVIEW" className="bg-[#121824] text-slate-200">Content Review</option>
            </select>
            <Filter className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/[0.2] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         4. TASK CARDS LIST
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const isAwaiting = task.status === "AWAITING_RESPONSE";
          const isPendingAdmin = task.status === "PENDING_ADMIN_APPROVAL";
          const isApproved = task.status === "APPROVED";
          const isInProgress = task.status === "IN_PROGRESS";
          const isCompleted = task.status === "COMPLETED";
          const isDeclined = task.status === "DECLINED" || task.status === "CANCELLED";
          const isChangesRequested = task.status === "CHANGES_REQUESTED";

          return (
            <div
              key={task.id}
              className={`border rounded-2xl p-4 sm:p-5 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isCompleted
                  ? "bg-[#101520]/60 border-white/[0.04] opacity-80 hover:opacity-100 hover:bg-[#121824]"
                  : isAwaiting
                  ? "bg-[#161C26] border-amber-500/25 hover:border-amber-500/40"
                  : isPendingAdmin
                  ? "bg-[#141828] border-purple-500/25 hover:border-purple-500/40"
                  : isApproved
                  ? "bg-[#121824]/95 border-indigo-500/25 hover:border-indigo-500/40"
                  : "bg-[#121824]/90 border-white/[0.08] hover:border-white/[0.14] hover:bg-[#151D2C]"
              }`}
            >
              {/* LEFT: Task Type, Title, Course Context */}
              <div className="space-y-1 min-w-0 md:max-w-[44%] flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Task Type Tag */}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300 flex items-center gap-1">
                    {renderTaskTypeIcon(task.type)}
                    <span>{formatTaskTypeLabel(task.type)}</span>
                  </span>

                  {/* Priority indicator if Urgent / High */}
                  {task.priority === "Urgent" && (
                    <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Urgent
                    </span>
                  )}

                  {/* Status Indicator */}
                  {isAwaiting ? (
                    <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                      ACTION REQUIRED
                    </span>
                  ) : isPendingAdmin ? (
                    <span className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
                      PENDING ADMIN APPROVAL
                    </span>
                  ) : isApproved ? (
                    <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                      APPROVED · ACTIVE
                    </span>
                  ) : isInProgress ? (
                    <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                      IN PROGRESS
                    </span>
                  ) : isChangesRequested ? (
                    <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                      CHANGES REQUESTED
                    </span>
                  ) : isDeclined ? (
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      DECLINED
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      COMPLETED
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => setSelectedTaskForDetails(task)}
                  className={`text-[15px] font-semibold tracking-tight hover:text-indigo-300 transition-colors cursor-pointer ${
                    isCompleted ? "text-slate-300" : "text-white"
                  }`}
                >
                  {task.title}
                </h3>

                <p className="text-xs text-slate-400 font-normal truncate">
                  {task.contextCourse} {task.contextModule ? `• ${task.contextModule}` : ""}
                </p>
              </div>

              {/* CENTER: Deadline, Assigned By, Compensation */}
              <div className="text-xs text-slate-400 space-y-1 md:px-4 md:border-l md:border-white/[0.06] shrink-0">
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{task.deadline}</span>
                  <span className={`text-[11px] font-normal ${
                    task.deadlineUrgent ? "text-amber-400" : isCompleted ? "text-emerald-400" : "text-slate-400"
                  }`}>
                    ({task.deadlineRelative})
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Assigned by {task.assignedBy}
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-300 font-medium">
                    Compensation ₹{task.compensation.toLocaleString()}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                    task.paymentStatus === "Paid"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : task.paymentStatus === "Processing"
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "bg-white/[0.04] text-slate-400"
                  }`}>
                    {task.paymentStatus}
                  </span>
                </div>
              </div>

              {/* RIGHT: Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Details Button */}
                <button
                  onClick={() => setSelectedTaskForDetails(task)}
                  className="px-3 py-2 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
                >
                  Details
                </button>

                {/* Workflow Actions */}
                {isAwaiting ? (
                  <>
                    <button
                      onClick={() => setRequestChangesModal(task)}
                      className="px-3 py-2 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleAcceptTask(task.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-sm transition-colors cursor-pointer"
                    >
                      Accept Task
                    </button>
                  </>
                ) : isPendingAdmin ? (
                  <span className="text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-2 rounded-xl">
                    Awaiting Admin Approval
                  </span>
                ) : isApproved || isInProgress ? (
                  <button
                    onClick={() => handleOpenTaskModule(task)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open in {task.targetModuleRoute}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : isCompleted ? (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-medium">
                    ✓ Delivered
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 px-3 py-1.5 font-medium">
                    Closed
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="bg-[#121824]/60 border border-white/[0.08] rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <CheckSquare className="w-8 h-8 mx-auto text-slate-600 stroke-[1.5]" />
            <h4 className="font-medium text-sm text-slate-300">You&apos;re all caught up</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No tasks currently match this category or filter. Any new work assigned by Admin will appear here.
            </p>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
         5. TASK DETAIL DRAWER (SLIDE-OVER RIGHT SHEET)
         ───────────────────────────────────────────────────────────── */}
      {selectedTaskForDetails && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div className="bg-[#101520] border-l border-white/[0.08] w-full max-w-lg h-full p-6 sm:p-7 overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-right-4 duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    {formatTaskTypeLabel(selectedTaskForDetails.type)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">#{selectedTaskForDetails.id}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mt-1 leading-snug">
                  {selectedTaskForDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskForDetails(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.06] transition-colors cursor-pointer shrink-0 ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Two-Column Clean Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Course Context</span>
                <p className="font-medium text-slate-200">{selectedTaskForDetails.contextCourse || "General"}</p>
                {selectedTaskForDetails.contextModule && (
                  <p className="text-[11px] text-indigo-400 truncate">{selectedTaskForDetails.contextModule}</p>
                )}
              </div>

              <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Assigned By</span>
                <p className="font-medium text-slate-200">{selectedTaskForDetails.assignedBy}</p>
                <p className="text-[11px] text-slate-400">{selectedTaskForDetails.assignedAt}</p>
              </div>

              <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Deadline</span>
                <p className="font-medium text-slate-200">{selectedTaskForDetails.deadline}</p>
                <p className="text-[11px] text-amber-400">{selectedTaskForDetails.deadlineRelative}</p>
              </div>

              <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Compensation</span>
                <p className="font-semibold text-slate-200 text-sm">₹{selectedTaskForDetails.compensation.toLocaleString()}</p>
                <p className="text-[11px] text-emerald-400 font-medium">Payment: {selectedTaskForDetails.paymentStatus}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Task Objective</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06]">
                {selectedTaskForDetails.description}
              </p>
            </div>

            {/* Expected Deliverables */}
            {selectedTaskForDetails.deliverables && selectedTaskForDetails.deliverables.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Expected Deliverables</span>
                <div className="space-y-1.5">
                  {selectedTaskForDetails.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session Info if Live Session or Mentorship */}
            {selectedTaskForDetails.sessionDetails && (
              <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-2 text-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Scheduled Slot Information</span>
                <div className="flex items-center justify-between text-slate-200 font-medium">
                  <span>📅 {selectedTaskForDetails.sessionDetails.date}</span>
                  <span>⏰ {selectedTaskForDetails.sessionDetails.time}</span>
                </div>
                {selectedTaskForDetails.sessionDetails.studentName && (
                  <div className="text-indigo-400 font-medium text-[11px]">
                    Student: {selectedTaskForDetails.sessionDetails.studentName}
                  </div>
                )}
                {selectedTaskForDetails.sessionDetails.meetingUrl && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">{selectedTaskForDetails.sessionDetails.meetingUrl}</span>
                    <a
                      href={selectedTaskForDetails.sessionDetails.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Test Link
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Admin Notes */}
            {selectedTaskForDetails.adminNotes && (
              <div className="p-3 bg-amber-500/[0.04] border border-amber-500/20 rounded-xl text-xs space-y-1">
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3" /> Admin Guidance
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{selectedTaskForDetails.adminNotes}</p>
              </div>
            )}

            {/* Workflow Vertical Timeline */}
            <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Workflow & Approval Timeline</span>
              </div>
              <div className="space-y-3 pl-2 border-l border-white/[0.08] ml-2">
                {selectedTaskForDetails.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-3 text-xs space-y-0.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 absolute -left-[17px] top-1" />
                    <div className="font-medium text-slate-200">{event.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{event.timestamp} • {event.actor}</div>
                    {event.note && (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">{event.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
              {selectedTaskForDetails.status === "AWAITING_RESPONSE" ? (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeclineTaskModal(selectedTaskForDetails)}
                      className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => setRequestChangesModal(selectedTaskForDetails)}
                      className="px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-xl text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
                    >
                      Request Changes
                    </button>
                  </div>
                  <button
                    onClick={() => handleAcceptTask(selectedTaskForDetails.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-sm transition-colors cursor-pointer"
                  >
                    Accept Task
                  </button>
                </>
              ) : selectedTaskForDetails.status === "PENDING_ADMIN_APPROVAL" ? (
                <div className="w-full text-center text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 py-2.5 rounded-xl font-medium">
                  Accepted • Awaiting Admin Confirmation
                </div>
              ) : selectedTaskForDetails.status === "APPROVED" || selectedTaskForDetails.status === "IN_PROGRESS" ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-indigo-400 font-medium">Active in {selectedTaskForDetails.targetModuleRoute}</span>
                  <button
                    onClick={() => {
                      handleOpenTaskModule(selectedTaskForDetails);
                      setSelectedTaskForDetails(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Open in {selectedTaskForDetails.targetModuleRoute}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-end w-full">
                  <button
                    onClick={() => setSelectedTaskForDetails(null)}
                    className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         6. DECLINE TASK MODAL
         ───────────────────────────────────────────────────────────── */}
      {declineTaskModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-semibold uppercase text-rose-400">Task Response</span>
                <h3 className="text-base font-semibold text-white">Decline Task Assignment</h3>
              </div>
              <button
                onClick={() => setDeclineTaskModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/[0.04] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Task to Decline</span>
              <p className="font-semibold text-slate-200">{declineTaskModal.title}</p>
              <p className="text-slate-400">Assigned by {declineTaskModal.assignedBy} • ₹{declineTaskModal.compensation.toLocaleString()}</p>
            </div>

            <form onSubmit={handleDeclineSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Declining *</label>
                <textarea
                  rows={3}
                  required
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Provide context on why you are declining this task..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setDeclineTaskModal(null)}
                  className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-xl font-medium text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Decline Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         7. REQUEST CHANGES MODAL
         ───────────────────────────────────────────────────────────── */}
      {requestChangesModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-semibold uppercase text-indigo-400">Task Negotiation</span>
                <h3 className="text-base font-semibold text-white">Request Changes</h3>
              </div>
              <button
                onClick={() => setRequestChangesModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/[0.04] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Current Assignment</span>
              <p className="font-semibold text-slate-200">{requestChangesModal.title}</p>
              <p className="text-slate-400">Deadline: {requestChangesModal.deadline}</p>
            </div>

            <form onSubmit={handleRequestChangesSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Suggested Date (Optional)</label>
                  <input
                    type="date"
                    value={suggestedDate}
                    onChange={(e) => setSuggestedDate(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Suggested Time</label>
                  <input
                    type="time"
                    value={suggestedTime}
                    onChange={(e) => setSuggestedTime(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Proposed Adjustments / Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="Describe your suggested changes or timeline adjustment..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setRequestChangesModal(null)}
                  className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-xl font-medium text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
