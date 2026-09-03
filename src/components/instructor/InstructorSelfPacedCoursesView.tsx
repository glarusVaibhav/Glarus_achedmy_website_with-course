"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Plus,
  ArrowLeft,
  Video,
  Code2,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Eye,
  Layers,
  ChevronDown,
  ChevronUp,
  PlaySquare,
  AlertCircle,
  Send,
  Lock,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Filter,
  Check,
  X,
  SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CourseLifecycleStatus, getGovernanceDisplay } from "@/lib/coursePermissions";
import { CourseDataGrid, DataGridCourseItem } from "./courses/CourseDataGrid";
import { CourseCardView } from "./courses/CourseCardView";
import { CourseReviewDrawer, DrawerCourseData } from "./courses/CourseReviewDrawer";

export interface SelfPacedLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  hasSandbox?: boolean;
  sandboxLang?: string;
  hasQuiz?: boolean;
  isFreePreview?: boolean;
}

export interface SelfPacedModule {
  id: string;
  moduleNumber: number;
  title: string;
  description: string;
  lessonsCount: number;
  totalDuration: string;
  lessons: SelfPacedLesson[];
}

export interface SelfPacedCourseItem extends DataGridCourseItem {
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  description: string;
  modules: SelfPacedModule[];
}

const INITIAL_DEMO_COURSES: SelfPacedCourseItem[] = [
  {
    id: "sp-course-1",
    title: "Generative AI & LLM Systems",
    subtitle: "Production LLM architecture, vector retrieval pipelines, and enterprise multi-agent workflows.",
    category: "Artificial Intelligence",
    trackBadge: "Evening Track #1 · Production GenAI",
    level: "Advanced",
    status: "PUBLISHED",
    totalModules: 10,
    totalLessons: 45,
    totalStudents: 420,
    submissionDate: "Jul 28, 2026",
    lastActivityText: "Approved by Admin · Live on Catalog",
    iconType: "brain",
    description: "Master LLM application development, RAG pipelines, fine-tuning with PEFT/LoRA, and multi-agent coordination.",
    createdAt: "2026-07-15",
    updatedAt: "2026-08-16",
    modules: [
      {
        id: "mod-1",
        moduleNumber: 1,
        title: "LLM Architecture & Tokenizer Internals",
        description: "Transformer attention mechanisms, RoPE embeddings, KV cache optimization.",
        lessonsCount: 4,
        totalDuration: "1h 45m",
        lessons: [
          { id: "les-1", title: "Introduction to Modern Transformer Models", duration: "25 min", isFreePreview: true, videoUrl: "https://example.com/v1" },
          { id: "les-2", title: "Byte-Pair Encoding & Tokenizer Deep Dive", duration: "30 min", hasSandbox: true, sandboxLang: "python" },
          { id: "les-3", title: "Self-Attention, FlashAttention & Inference Bottlenecks", duration: "35 min" },
          { id: "les-4", title: "Module 1 Assessment: Architecture Quiz", duration: "15 min", hasQuiz: true }
        ]
      },
      {
        id: "mod-2",
        moduleNumber: 2,
        title: "Vector Embeddings & Hybrid RAG Retrieval",
        description: "Dense and sparse vector embeddings, reciprocal rank fusion, and semantic re-ranking.",
        lessonsCount: 5,
        totalDuration: "2h 10m",
        lessons: [
          { id: "les-5", title: "Chunking Strategies & Context Fragmentation", duration: "25 min" },
          { id: "les-6", title: "Building Qdrant & PGVector Indices", duration: "35 min", hasSandbox: true, sandboxLang: "python" },
          { id: "les-7", title: "Cross-Encoder Re-ranking with Cohere", duration: "30 min" }
        ]
      }
    ]
  },
  {
    id: "sp-course-2",
    title: "AI Automation Engineer",
    subtitle: "Build intelligent workflows, autonomous multi-agent automations, and custom webhook connectors.",
    category: "Artificial Intelligence",
    trackBadge: "Evening Track #2 · Automations",
    level: "Intermediate",
    status: "APPROVED",
    totalModules: 10,
    totalLessons: 45,
    totalStudents: 350,
    submissionDate: "Aug 16, 2026",
    lastActivityText: "Approved by Admin · Awaiting Publication",
    iconType: "cpu",
    description: "Learn how to build AI-first automations using Make.com, n8n, CrewAI, and LangGraph with external APIs.",
    createdAt: "2026-07-20",
    updatedAt: "2026-08-14",
    modules: [
      {
        id: "mod-201",
        moduleNumber: 1,
        title: "Foundations of AI-Powered Workflows",
        description: "Trigger architectures, webhooks, and asynchronous execution.",
        lessonsCount: 4,
        totalDuration: "1h 30m",
        lessons: [
          { id: "les-201", title: "Introduction to AI Automations", duration: "20 min", isFreePreview: true },
          { id: "les-202", title: "Webhook Design & Payload Verification", duration: "30 min", hasSandbox: true, sandboxLang: "typescript" },
          { id: "les-203", title: "LLM API Integrations & Rate Limit Handling", duration: "40 min" }
        ]
      }
    ]
  },
  {
    id: "sp-course-3",
    title: "Enterprise Multi-Agent Swarms",
    subtitle: "Autonomous multi-agent orchestration, swarm intelligence, and memory persistence.",
    category: "Artificial Intelligence",
    trackBadge: "Track #1 · Multi-Agent",
    level: "Advanced",
    status: "UNDER_REVIEW",
    totalModules: 8,
    totalLessons: 32,
    totalStudents: 180,
    submissionDate: "Aug 18, 2026",
    lastActivityText: "Submitted Aug 18, 2026 · Waiting for Admin approval",
    iconType: "workflow",
    description: "Build robust multi-agent systems with hierarchical task planning and dynamic tool calling.",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-18",
    modules: [
      {
        id: "mod-301",
        moduleNumber: 1,
        title: "Agentic Architecture & Tool Handshakes",
        description: "ReAct patterns, planning loops, and reflection agents.",
        lessonsCount: 4,
        totalDuration: "2h 00m",
        lessons: [
          { id: "les-301", title: "Principles of Agentic Reasoning", duration: "30 min", isFreePreview: true },
          { id: "les-302", title: "Building Custom Tool Registries", duration: "45 min", hasSandbox: true, sandboxLang: "python" }
        ]
      }
    ]
  },
  {
    id: "sp-course-4",
    title: "Applied Machine Learning & MLOps",
    subtitle: "From scikit-learn and PyTorch modeling to Docker containerization and Kubernetes inference.",
    category: "Data Science & ML",
    trackBadge: "Track #1 · Production MLOps",
    level: "Advanced",
    status: "CHANGES_REQUESTED",
    totalModules: 6,
    totalLessons: 28,
    totalStudents: 280,
    submissionDate: "Aug 15, 2026",
    adminFeedback: "Please update the course objectives and add hands-on Docker exercises in Module 3 before resubmitting.",
    lastActivityText: "Admin requested changes · Module 03",
    iconType: "layers",
    description: "Learn ML system design, feature stores with Feast, CI/CD for model weights, and monitoring model drift.",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-15",
    modules: [
      {
        id: "mod-401",
        moduleNumber: 1,
        title: "Data Pipelines & Feature Engineering",
        description: "Distributed data preprocessing with Polars and DuckDB.",
        lessonsCount: 4,
        totalDuration: "1h 50m",
        lessons: [
          { id: "les-401", title: "High-Throughput Data Processing", duration: "30 min", isFreePreview: true },
          { id: "les-402", title: "Feature Store Setup with Feast", duration: "45 min", hasSandbox: true, sandboxLang: "python" }
        ]
      }
    ]
  },
  {
    id: "sp-course-5",
    title: "Autonomous Robotics & Vision AI",
    subtitle: "Edge perception with YOLOv10, spatial depth estimation, and ROS2 integration.",
    category: "Artificial Intelligence",
    trackBadge: "Track #3 · Edge Robotics",
    level: "Advanced",
    status: "DRAFT",
    totalModules: 10,
    totalLessons: 38,
    totalStudents: 0,
    lastActivityText: "Draft saved today",
    iconType: "cpu",
    description: "Design real-time robotic vision systems with edge tensor accelerators and SLAM navigation.",
    createdAt: "2026-08-10",
    updatedAt: "2026-08-18",
    modules: [
      {
        id: "mod-501",
        moduleNumber: 1,
        title: "Introduction to Edge AI & Camera Sensors",
        description: "Camera calibration, intrinsic matrix, and video stream decoding.",
        lessonsCount: 3,
        totalDuration: "1h 20m",
        lessons: [
          { id: "les-501", title: "Sensor Interfacing & GStreamer Pipelines", duration: "30 min", isFreePreview: true }
        ]
      }
    ]
  }
];

interface InstructorSelfPacedCoursesViewProps {
  dbCourses?: any[];
  isDemoUser?: boolean;
  onCreateCourse: () => void;
  onOpenCourseBuilder?: (courseId: string) => void;
  onNavigateTab?: (tabName: string, filterOptions?: any) => void;
}

export function InstructorSelfPacedCoursesView({
  dbCourses = [],
  isDemoUser = false,
  onCreateCourse,
  onOpenCourseBuilder,
  onNavigateTab,
}: InstructorSelfPacedCoursesViewProps) {
  // Sync state with DB courses and demo items
  const [courses, setCourses] = useState<SelfPacedCourseItem[]>(() => {
    if (dbCourses && dbCourses.length > 0) {
      const mappedDbCourses: SelfPacedCourseItem[] = dbCourses.map((c, i) => {
        let status: CourseLifecycleStatus = "DRAFT";
        if (c.status === "APPROVED") {
          status = "PUBLISHED";
        } else if (c.courseApproval?.status === "APPROVED") {
          status = "APPROVED";
        } else if (c.courseApproval?.status === "CHANGES_REQUESTED") {
          status = "CHANGES_REQUESTED";
        } else if (c.status === "PENDING" || c.courseApproval?.status === "PENDING") {
          status = "UNDER_REVIEW";
        }

        const totalMods = c.modules?.length || 0;
        const totalLes = c.modules?.reduce((acc: number, m: any) => acc + (m.lectures?.length || 0), 0) || 0;

        return {
          id: c.id || `db-course-${i}`,
          title: c.title || "Untitled Course",
          subtitle: c.description || "Self-paced learning curriculum.",
          category: "Artificial Intelligence",
          trackBadge: `Track #${i + 1} · Self-Paced`,
          level: "All Levels",
          status,
          totalModules: totalMods,
          totalLessons: totalLes,
          totalStudents: c.enrollments?.length || 0,
          submissionDate: c.courseApproval?.createdAt
            ? new Date(c.courseApproval.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "",
          adminFeedback: c.courseApproval?.feedback || (status === "CHANGES_REQUESTED" ? "Please update module objectives and add hands-on projects." : undefined),
          lastActivityText:
            status === "PUBLISHED"
              ? "Live on Academy Catalog"
              : status === "APPROVED"
              ? "Approved by Admin · Awaiting Publication"
              : status === "UNDER_REVIEW"
              ? "Submitted for Admin Review"
              : status === "CHANGES_REQUESTED"
              ? "Admin requested changes"
              : "Draft saved",
          iconType: (i % 2 === 0 ? "brain" : "cpu") as any,
          description: c.description || "",
          createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
          updatedAt: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
          modules: []
        };
      });
      return mappedDbCourses;
    }
    return isDemoUser ? INITIAL_DEMO_COURSES : [];
  });

  useEffect(() => {
    if (isDemoUser && courses.length === 0 && (!dbCourses || dbCourses.length === 0)) {
      setCourses(INITIAL_DEMO_COURSES);
    }
  }, [isDemoUser, dbCourses]);

  // Sync state if dbCourses updates from API
  useEffect(() => {
    if (dbCourses && dbCourses.length > 0) {
      setCourses(() => {
        const mappedDbCourses: SelfPacedCourseItem[] = dbCourses.map((c, i) => {
          let status: CourseLifecycleStatus = "DRAFT";
          if (c.status === "APPROVED") {
            status = "PUBLISHED";
          } else if (c.courseApproval?.status === "APPROVED") {
            status = "APPROVED";
          } else if (c.courseApproval?.status === "CHANGES_REQUESTED") {
            status = "CHANGES_REQUESTED";
          } else if (c.status === "PENDING" || c.courseApproval?.status === "PENDING") {
            status = "UNDER_REVIEW";
          }

          const totalMods = c.modules?.length || 0;
          const totalLes = c.modules?.reduce((acc: number, m: any) => acc + (m.lectures?.length || 0), 0) || 0;

          return {
            id: c.id || `db-course-${i}`,
            title: c.title || "Untitled Course",
            subtitle: c.description || "Self-paced learning curriculum.",
            category: "Artificial Intelligence",
            trackBadge: `Track #${i + 1} · Self-Paced`,
            level: "All Levels",
            status,
            totalModules: totalMods,
            totalLessons: totalLes,
            totalStudents: c.enrollments?.length || 0,
            submissionDate: c.courseApproval?.createdAt
              ? new Date(c.courseApproval.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "",
            adminFeedback: c.courseApproval?.feedback || (status === "CHANGES_REQUESTED" ? "Please update module objectives and add hands-on projects." : undefined),
            lastActivityText:
              status === "PUBLISHED"
                ? "Live on Academy Catalog"
                : status === "APPROVED"
                ? "Approved by Admin · Awaiting Publication"
                : status === "UNDER_REVIEW"
                ? "Submitted for Admin Review"
                : status === "CHANGES_REQUESTED"
                ? "Admin requested changes"
                : "Draft saved",
            iconType: (i % 2 === 0 ? "brain" : "cpu") as any,
            description: c.description || "",
            createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
            updatedAt: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
            modules: []
          };
        });
        return mappedDbCourses;
      });
    }
  }, [dbCourses]);

  // View state: Table (Default) vs Cards
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "name" | "modules" | "lessons" | "learners" | "status">("recent");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isItemsPerPageOpen, setIsItemsPerPageOpen] = useState(false);

  // Search input ref for Ctrl+K
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected Course for Curriculum Drill-down
  const [selectedCourseForModules, setSelectedCourseForModules] = useState<SelfPacedCourseItem | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>("mod-1");

  // Drawers & Modals
  const [reviewDrawerCourse, setReviewDrawerCourse] = useState<DrawerCourseData | null>(null);
  const [submitModalCourse, setSubmitModalCourse] = useState<SelfPacedCourseItem | null>(null);
  const [editModalCourse, setEditModalCourse] = useState<SelfPacedCourseItem | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Edit form state (NO price or readiness)
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editCategory, setEditCategory] = useState("Artificial Intelligence");
  const [editTrackBadge, setEditTrackBadge] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);
  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard shortcut: Ctrl+K / ⌘K focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter count statistics
  const counts = useMemo(() => {
    return {
      ALL: courses.length,
      DRAFT: courses.filter(c => c.status === "DRAFT").length,
      UNDER_REVIEW: courses.filter(c => c.status === "UNDER_REVIEW").length,
      CHANGES_REQUESTED: courses.filter(c => c.status === "CHANGES_REQUESTED").length,
      APPROVED: courses.filter(c => c.status === "APPROVED").length,
      PUBLISHED: courses.filter(c => c.status === "PUBLISHED").length,
    };
  }, [courses]);

  // Filtered & Sorted courses
  const filteredAndSortedCourses = useMemo(() => {
    let result = courses.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.trackBadge.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.status.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === "ALL") return true;
      if (statusFilter === "DRAFT") return c.status === "DRAFT";
      if (statusFilter === "UNDER_REVIEW") return c.status === "UNDER_REVIEW";
      if (statusFilter === "CHANGES_REQUESTED") return c.status === "CHANGES_REQUESTED";
      if (statusFilter === "APPROVED") return c.status === "APPROVED";
      if (statusFilter === "PUBLISHED") return c.status === "PUBLISHED";
      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name":
          return a.title.localeCompare(b.title);
        case "modules":
          return b.totalModules - a.totalModules;
        case "lessons":
          return b.totalLessons - a.totalLessons;
        case "learners":
          return b.totalStudents - a.totalStudents;
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [courses, searchQuery, statusFilter, sortBy]);

  // Paginated Courses
  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCourses.slice(start, start + itemsPerPage);
  }, [filteredAndSortedCourses, currentPage, itemsPerPage]);

  // Adjust page if out of bounds after filter change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // 1. Submit for Review Handler (Draft / Changes Requested -> Under Review)
  const handleConfirmSubmitForReview = async () => {
    if (!submitModalCourse) return;
    setIsProcessingAction(true);

    try {
      await fetch("/api/instructor/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: submitModalCourse.id,
          action: "SUBMIT_FOR_REVIEW"
        })
      });
    } catch (e) {
      console.warn("Backend sync notice:", e);
    }

    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setCourses((prev) =>
      prev.map((c) =>
        c.id === submitModalCourse.id
          ? {
              ...c,
              status: "UNDER_REVIEW",
              submissionDate: todayStr,
              lastActivityText: `Submitted ${todayStr} · Waiting for Admin approval`,
              adminFeedback: undefined,
              updatedAt: todayStr
            }
          : c
      )
    );

    setIsProcessingAction(false);
    setSubmitModalCourse(null);
    showToast(`Course "${submitModalCourse.title}" submitted to Admin for quality review!`);
  };

  // Open Edit Modal
  const handleOpenEdit = (course: { id: string }) => {
    const fullCourse = courses.find(c => c.id === course.id);
    if (!fullCourse) return;
    setEditModalCourse(fullCourse);
    setEditTitle(fullCourse.title);
    setEditSubtitle(fullCourse.subtitle || "");
    setEditCategory(fullCourse.category || "Artificial Intelligence");
    setEditTrackBadge(fullCourse.trackBadge || "Self-Paced Track");
    setEditDescription(fullCourse.description || "");
  };

  // Save Course Edit
  const handleSaveCourseEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalCourse) return;

    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    setCourses((prev) =>
      prev.map((c) =>
        c.id === editModalCourse.id
          ? {
              ...c,
              title: editTitle,
              subtitle: editSubtitle,
              category: editCategory,
              trackBadge: editTrackBadge,
              description: editDescription,
              updatedAt: todayStr
            }
          : c
      )
    );

    if (selectedCourseForModules && selectedCourseForModules.id === editModalCourse.id) {
      setSelectedCourseForModules((prev) =>
        prev
          ? {
              ...prev,
              title: editTitle,
              subtitle: editSubtitle,
              category: editCategory,
              trackBadge: editTrackBadge,
              description: editDescription
            }
          : null
      );
    }

    setEditModalCourse(null);
    showToast(`Course "${editTitle}" updated successfully!`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#111722] border border-purple-500/30 text-white rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          DRILL-DOWN: DETAILED CURRICULUM VIEW (When Selected)
          ═══════════════════════════════════════════════════════════ */}
      {selectedCourseForModules ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header Strip with Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedCourseForModules(null)}
                className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/[0.06]"
                title="Back to All Courses"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedCourseForModules.status === "PUBLISHED" && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                      Published & Live
                    </span>
                  )}
                  {selectedCourseForModules.status === "APPROVED" && (
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3 text-violet-400" />
                      Approved by Admin · Awaiting Publication
                    </span>
                  )}
                  {selectedCourseForModules.status === "UNDER_REVIEW" && (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-400 animate-pulse" />
                      Under Review
                    </span>
                  )}
                  {selectedCourseForModules.status === "CHANGES_REQUESTED" && (
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-orange-400" />
                      Changes Requested
                    </span>
                  )}
                  {selectedCourseForModules.status === "DRAFT" && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                      Draft
                    </span>
                  )}

                  <span className="text-xs text-slate-400 font-mono">
                    {selectedCourseForModules.totalModules} Modules · {selectedCourseForModules.totalLessons} Lessons
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedCourseForModules.totalStudents} Active Learners
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                  {selectedCourseForModules.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Review Drawer Button */}
              <button
                onClick={() => setReviewDrawerCourse(selectedCourseForModules)}
                className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Governance Review</span>
              </button>

              {/* Submit for Review if Draft or Changes Requested */}
              {(selectedCourseForModules.status === "DRAFT" || selectedCourseForModules.status === "CHANGES_REQUESTED") && (
                <button
                  onClick={() => setSubmitModalCourse(selectedCourseForModules)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{selectedCourseForModules.status === "CHANGES_REQUESTED" ? "Resubmit for Review" : "Submit for Review"}</span>
                </button>
              )}

              {/* Edit Course Details */}
              {selectedCourseForModules.status !== "UNDER_REVIEW" && (
                <button
                  onClick={() => handleOpenEdit(selectedCourseForModules)}
                  className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>
          </div>

          {/* Module Breakdown Accordion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Curriculum Structure ({selectedCourseForModules.modules?.length || 0} Modules)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {selectedCourseForModules.totalStudents} enrolled learners
              </p>
            </div>

            <div className="space-y-2.5">
              {selectedCourseForModules.modules && selectedCourseForModules.modules.length > 0 ? (
                selectedCourseForModules.modules.map((mod) => {
                  const isExpanded = expandedModuleId === mod.id;
                  return (
                    <div
                      key={mod.id}
                      className="rounded-2xl bg-[#0C1118] border border-white/[0.06] overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                        className="w-full p-3 sm:p-4 flex items-center justify-between text-left gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg shrink-0 border border-purple-500/20">
                            {String(mod.moduleNumber).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{mod.title}</h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{mod.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
                          <span className="hidden sm:inline font-mono">{mod.lessons.length} Lessons</span>
                          <span className="font-mono text-[11px] text-slate-500">· {mod.totalDuration}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-3 pt-1 border-t border-white/[0.04] divide-y divide-white/[0.04]">
                          {mod.lessons.map((les, lIdx) => (
                            <div
                              key={les.id}
                              className="py-2.5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="font-mono text-slate-500 w-5 text-right">{lIdx + 1}.</span>
                                <PlaySquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span className="font-medium text-slate-200 truncate">{les.title}</span>
                                {les.isFreePreview && (
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0 border border-emerald-500/20">
                                    Free Preview
                                  </span>
                                )}
                                {les.hasSandbox && (
                                  <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1 border border-sky-500/20">
                                    <Code2 className="w-2.5 h-2.5" />
                                    <span>{les.sandboxLang || "Sandbox"}</span>
                                  </span>
                                )}
                                {les.hasQuiz && (
                                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0 border border-amber-500/20">
                                    Quiz
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-mono text-slate-500 text-[11px]">{les.duration}</span>
                                <Link
                                  href={`/learn/${encodeURIComponent(selectedCourseForModules.title.replace(/\s+/g, "_"))}`}
                                  className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                                  title="Preview Lesson Player"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 rounded-2xl bg-[#0C1118] border border-dashed border-white/[0.08] text-center space-y-3">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No modules added yet for this course</p>
                  <button
                    onClick={onCreateCourse}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Open AI Course Builder
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════
            MAIN VIEW: PREMIUM SAAS COURSE MANAGEMENT INTERFACE
            ═══════════════════════════════════════════════════════════ */
        <div className="space-y-4">
          {/* 1. Header: Page Title & Subtitle + Search + Create Course */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Self-Paced Courses
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Create, manage, and monitor your on-demand courses and learners.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search Bar with Ctrl+K focus */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-12 py-1.5 bg-[#0C1118] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9px] font-mono text-slate-400 select-none">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* 2. Filter Bar & View Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Segmented Status Filters */}
            <div className="flex items-center gap-1.5 bg-[#0C1118] border border-white/[0.06] p-1 rounded-xl text-xs font-medium overflow-x-auto custom-scrollbar max-w-full">
              {[
                { id: "ALL", label: "All", count: counts.ALL },
                { id: "DRAFT", label: "Draft", count: counts.DRAFT },
                { id: "UNDER_REVIEW", label: "Under Review", count: counts.UNDER_REVIEW },
                { id: "CHANGES_REQUESTED", label: "Changes Requested", count: counts.CHANGES_REQUESTED },
                { id: "APPROVED", label: "Approved", count: counts.APPROVED },
                { id: "PUBLISHED", label: "Published", count: counts.PUBLISHED },
              ].map((f) => {
                const isActive = statusFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-2 border text-xs ${
                      isActive
                        ? "bg-purple-600/20 border-purple-500/40 text-white font-bold shadow-xs"
                        : "text-slate-400 hover:text-white border-transparent hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-purple-500/30 text-purple-200"
                          : "bg-white/[0.05] text-slate-500"
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle & Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              {/* View Toggle */}
              <div className="flex items-center bg-[#0C1118] border border-white/[0.06] p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-purple-600/20 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                  title="Table Data Grid (Default)"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-purple-600/20 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="px-3 py-1.5 bg-[#0C1118] border border-white/[0.06] hover:border-white/[0.1] rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Sort: {sortBy === "recent" ? "Recent" : sortBy === "oldest" ? "Oldest" : sortBy === "name" ? "Course Name" : sortBy === "modules" ? "Modules" : sortBy === "lessons" ? "Lessons" : sortBy === "learners" ? "Learners" : "Status"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isSortDropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-9 w-44 rounded-xl bg-[#111722] border border-white/[0.1] shadow-2xl p-1 z-30 space-y-0.5 text-xs text-slate-200"
                  >
                    {[
                      { id: "recent", label: "Recent Update" },
                      { id: "oldest", label: "Oldest" },
                      { id: "name", label: "Course Name" },
                      { id: "modules", label: "Modules Count" },
                      { id: "lessons", label: "Lessons Count" },
                      { id: "learners", label: "Learners Count" },
                      { id: "status", label: "Status" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSortBy(s.id as any);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                          sortBy === s.id
                            ? "bg-purple-600/20 text-purple-300 font-bold"
                            : "hover:bg-white/[0.06]"
                        }`}
                      >
                        <span>{s.label}</span>
                        {sortBy === s.id && <Check className="w-3 h-3 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Main Content: Data Grid or Cards or Empty State */}
          {filteredAndSortedCourses.length === 0 ? (
            /* Premium Empty State */
            <div className="py-20 text-center space-y-4 rounded-2xl bg-[#0C1118] border border-dashed border-white/[0.06] p-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-white">
                  {statusFilter === "ALL" && !searchQuery
                    ? "Start your first course"
                    : "No courses found"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {statusFilter === "ALL" && !searchQuery
                    ? "Build and author your curriculum with AI generation and structured modules."
                    : "Try adjusting your search criteria or clear status filters to view all courses."}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                {searchQuery || statusFilter !== "ALL" ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
                    }}
                    className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={onCreateCourse}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Create Course</span>
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === "table" ? (
            <CourseDataGrid
              courses={paginatedCourses}
              startIndex={(currentPage - 1) * itemsPerPage}
              onOpenCurriculum={(c) => {
                const fullCourse = courses.find(item => item.id === c.id);
                setSelectedCourseForModules(fullCourse || (c as any));
              }}
              onEditCourse={handleOpenEdit}
              onOpenReviewDrawer={(c) => setReviewDrawerCourse(c)}
              onSubmitForReview={(c) => {
                const fullCourse = courses.find(item => item.id === c.id);
                setSubmitModalCourse(fullCourse || (c as any));
              }}
              onDuplicate={(c) => {
                const newCourse: SelfPacedCourseItem = {
                  ...(c as SelfPacedCourseItem),
                  id: `dup-${Date.now()}`,
                  title: `${c.title} (Copy)`,
                  status: "DRAFT",
                  submissionDate: undefined,
                  adminFeedback: undefined,
                  totalStudents: 0,
                  lastActivityText: "Draft created",
                  createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                  updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                };
                setCourses(prev => [newCourse, ...prev]);
                showToast(`Duplicated course "${c.title}" as draft.`);
              }}
              onArchive={(c) => {
                setCourses(prev => prev.filter(item => item.id !== c.id));
                showToast(`Archived course "${c.title}".`);
              }}
            />
          ) : (
            <CourseCardView
              courses={paginatedCourses}
              onOpenCurriculum={(c) => {
                const fullCourse = courses.find(item => item.id === c.id);
                setSelectedCourseForModules(fullCourse || (c as any));
              }}
              onEditCourse={handleOpenEdit}
              onOpenReviewDrawer={(c) => setReviewDrawerCourse(c)}
              onSubmitForReview={(c) => {
                const fullCourse = courses.find(item => item.id === c.id);
                setSubmitModalCourse(fullCourse || (c as any));
              }}
              onDuplicate={(c) => {
                const newCourse: SelfPacedCourseItem = {
                  ...(c as SelfPacedCourseItem),
                  id: `dup-${Date.now()}`,
                  title: `${c.title} (Copy)`,
                  status: "DRAFT",
                  submissionDate: undefined,
                  adminFeedback: undefined,
                  totalStudents: 0,
                  lastActivityText: "Draft created",
                  createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                  updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                };
                setCourses(prev => [newCourse, ...prev]);
                showToast(`Duplicated course "${c.title}" as draft.`);
              }}
              onArchive={(c) => {
                setCourses(prev => prev.filter(item => item.id !== c.id));
                showToast(`Archived course "${c.title}".`);
              }}
            />
          )}

          {/* 4. Pagination Strip */}
          {filteredAndSortedCourses.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-xs text-slate-400">
              <span className="font-mono">
                Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredAndSortedCourses.length)} of {filteredAndSortedCourses.length} courses
              </span>

              {/* Compact Pagination Controls */}
              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0C1118] border border-white/[0.06] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                        : "bg-[#0C1118] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0C1118] border border-white/[0.06] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  ›
                </button>
              </div>

              {/* Rows Per Page */}
              <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-[11px]">
                <span>Rows:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#0C1118] border border-white/[0.08] text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          DRAWER: ADMIN GOVERNANCE & AUDIT TRAIL REVIEW DRAWER
          ═══════════════════════════════════════════════════════════ */}
      <CourseReviewDrawer
        course={reviewDrawerCourse}
        isOpen={!!reviewDrawerCourse}
        onClose={() => setReviewDrawerCourse(null)}
        onSubmitForReview={(c) => {
          const fullCourse = courses.find(item => item.id === c.id);
          setSubmitModalCourse(fullCourse || (c as any));
        }}
        onOpenCurriculum={(c) => {
          const fullCourse = courses.find(item => item.id === c.id);
          setSelectedCourseForModules(fullCourse || (c as any));
        }}
        onEditCourse={(c) => handleOpenEdit(c)}
      />

      {/* ═══════════════════════════════════════════════════════════
          MODAL: SUBMIT COURSE FOR ADMIN REVIEW
          ═══════════════════════════════════════════════════════════ */}
      {submitModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0C1118] border border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                <Send className="w-5 h-5" />
              </div>
              <button
                onClick={() => setSubmitModalCourse(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Submit for Admin Quality Review?
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You are about to submit <strong className="text-white">"{submitModalCourse.title}"</strong> to Platform Administrators for quality & syllabus verification.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Curriculum Size:</span>
                <span>{submitModalCourse.totalModules} Modules · {submitModalCourse.totalLessons} Lessons</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Track:</span>
                <span>{submitModalCourse.trackBadge}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmitModalCourse(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleConfirmSubmitForReview}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isProcessingAction ? "Submitting..." : "Confirm & Submit"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: EDIT COURSE DETAILS (Cleaned - No Price/Readiness)
          ═══════════════════════════════════════════════════════════ */}
      {editModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0C1118] border border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold text-white">Edit Course Information</h3>
                <p className="text-xs text-slate-400 mt-0.5">Update title, track badge, and syllabus metadata.</p>
              </div>
              <button
                onClick={() => setEditModalCourse(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourseEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111722] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Subtitle / Summary
                </label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111722] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#111722] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Track Badge
                  </label>
                  <input
                    type="text"
                    value={editTrackBadge}
                    onChange={(e) => setEditTrackBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#111722] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Detailed Course Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111722] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setEditModalCourse(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
