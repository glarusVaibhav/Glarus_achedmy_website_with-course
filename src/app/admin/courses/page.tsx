"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  PlayCircle,
  Users,
  IndianRupee,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Clock,
  Video,
  FileText,
  DollarSign,
  Radio,
  Star,
  Loader2
} from "lucide-react";
import CourseReviewModal from "@/components/admin/CourseReviewModal";

export type CourseTab = "all" | "approvals" | "published" | "drafts" | "rejected";

interface CourseItem {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  enrolledStudents: number;
  revenue: number;
  refundRate: number;
  status: "PUBLISHED" | "PENDING_APPROVAL" | "DRAFT" | "REJECTED";
  submittedAt?: string;
  updatedAt: string;
  duration: string;
  sectionsCount: number;
  lessonsCount: number;
  description: string;
  thumbnailGradient: string;
  rating: number;
  outcomes?: string[];
  curriculum?: {
    sectionTitle: string;
    lessons: { title: string; type: "video" | "assignment" | "quiz"; duration: string }[];
  }[];
}

const MOCK_COURSES: CourseItem[] = [
  {
    id: "crs-101",
    title: "Advanced AI Agents & Autonomous Workflows",
    instructor: "Dr. Sarah Chen",
    category: "Artificial Intelligence",
    price: 1499,
    enrolledStudents: 1842,
    revenue: 485600,
    refundRate: 1.2,
    status: "PUBLISHED",
    updatedAt: "Today, 10:30 AM",
    duration: "18h 40m",
    sectionsCount: 6,
    lessonsCount: 34,
    description: "Deep dive into multi-agent systems, Tool-calling LLMs, LangGraph, and enterprise production deployments.",
    thumbnailGradient: "from-purple-900 to-indigo-950",
    rating: 4.9,
    outcomes: ["Build multi-agent stateful graphs", "Implement self-correcting RAG", "Deploy with FastAPI & Docker"],
    curriculum: [
      {
        sectionTitle: "Section 1: Foundations of Agentic AI",
        lessons: [
          { title: "Introduction to ReAct Framework", type: "video", duration: "18m 10s" },
          { title: "Tool Calling & Structured Outputs", type: "video", duration: "24m 30s" },
          { title: "Building your First Agent Loop", type: "assignment", duration: "45m" }
        ]
      },
      {
        sectionTitle: "Section 2: Multi-Agent Collaboration",
        lessons: [
          { title: "Hierarchical Agent Supervisors", type: "video", duration: "32m 00s" },
          { title: "Memory & State Synchronization", type: "video", duration: "28m 15s" }
        ]
      }
    ]
  },
  {
    id: "crs-102",
    title: "Mastering Next.js 14 App Router & Server Actions",
    instructor: "Jordan Walke",
    category: "Web Development",
    price: 3499,
    enrolledStudents: 0,
    revenue: 0,
    refundRate: 0,
    status: "PENDING_APPROVAL",
    submittedAt: "Yesterday, 4:15 PM",
    updatedAt: "1 day ago",
    duration: "14h 20m",
    sectionsCount: 4,
    lessonsCount: 22,
    description: "Complete full-stack Next.js bootcamp exploring Server Components, Streaming, Suspense, and DB transactions.",
    thumbnailGradient: "from-neutral-900 to-slate-900",
    rating: 0,
    outcomes: ["Master Server & Client Components", "Build performant SSR architectures", "Deploy on Vercel with Edge Middleware"],
    curriculum: [
      {
        sectionTitle: "Section 1: App Router Mental Model",
        lessons: [
          { title: "Server vs Client Component Boundaries", type: "video", duration: "16m 40s" },
          { title: "Server Actions & Mutations", type: "video", duration: "22m 10s" }
        ]
      },
      {
        sectionTitle: "Section 2: Streaming & Suspense",
        lessons: [
          { title: "Dynamic Routing & Streaming UI", type: "video", duration: "29m 30s" }
        ]
      }
    ]
  },
  {
    id: "crs-103",
    title: "React 19 Enterprise Architecture & State Machines",
    instructor: "John Doe",
    category: "Frontend",
    price: 999,
    enrolledStudents: 967,
    revenue: 215400,
    refundRate: 2.1,
    status: "PUBLISHED",
    updatedAt: "2 days ago",
    duration: "12h 00m",
    sectionsCount: 5,
    lessonsCount: 28,
    description: "Enterprise patterns for React 19, actions hook, optimistic updates, and large-scale codebases.",
    thumbnailGradient: "from-sky-950 to-blue-900",
    rating: 4.7,
    outcomes: ["Use useActionState and useOptimistic", "Refactor legacy Redux to modern React 19", "Optimize bundle size"]
  },
  {
    id: "crs-104",
    title: "Quantum Computing Basics & Qiskit Algorithms",
    instructor: "Alice Smith",
    category: "Computer Science",
    price: 2199,
    enrolledStudents: 0,
    revenue: 0,
    refundRate: 0,
    status: "REJECTED",
    submittedAt: "3 days ago",
    updatedAt: "3 days ago",
    duration: "8h 15m",
    sectionsCount: 3,
    lessonsCount: 15,
    description: "Foundational quantum algorithms, qubits, superposition, and entanglement with Python Qiskit.",
    thumbnailGradient: "from-emerald-950 to-teal-900",
    rating: 0
  },
  {
    id: "crs-105",
    title: "Cloud Computing & Serverless Microservices",
    instructor: "David Miller",
    category: "Cloud & DevOps",
    price: 1999,
    enrolledStudents: 0,
    revenue: 0,
    refundRate: 0,
    status: "DRAFT",
    updatedAt: "5 days ago",
    duration: "10h 30m",
    sectionsCount: 4,
    lessonsCount: 18,
    description: "Drafting serverless infrastructure course with AWS Lambda, DynamoDB, and Terraform.",
    thumbnailGradient: "from-amber-950 to-orange-900",
    rating: 0
  }
];

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-subtext space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm font-semibold text-text">Loading Course Management...</p>
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as CourseTab) || "all";

  const [activeTab, setActiveTab] = useState<CourseTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [courses, setCourses] = useState<CourseItem[]>(MOCK_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  // Sync tab from URL if changed
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as CourseTab;
    if (tabFromUrl && ["all", "approvals", "published", "drafts", "rejected"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Load real API courses if present
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/admin/courses");
        if (res.ok) {
          const data = await res.json();
          if (data.pendingCourses && Array.isArray(data.pendingCourses)) {
            // merge pending courses
          }
        }
      } catch {
        /* ignore */
      }
    }
    loadCourses();
  }, []);

  const handleDecision = async (
    courseId: string,
    decision: "PUBLISHED" | "REJECTED" | "CHANGES_REQUESTED"
  ) => {
    try {
      const endpoint =
        decision === "PUBLISHED"
          ? `/api/admin/courses/${courseId}/approve`
          : `/api/admin/courses/${courseId}/reject`;
      await fetch(endpoint, { method: "POST" });
    } catch {
      /* ignore */
    }

    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, status: decision === "PUBLISHED" ? "PUBLISHED" : "REJECTED" } : c
      )
    );
    setSelectedCourse(null);
  };

  const handleTogglePublish = (id: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: c.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
          };
        }
        return c;
      })
    );
  };

  // Filter courses based on active tab and query
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Tab matching
      if (activeTab === "approvals" && c.status !== "PENDING_APPROVAL") return false;
      if (activeTab === "published" && c.status !== "PUBLISHED") return false;
      if (activeTab === "drafts" && c.status !== "DRAFT") return false;
      if (activeTab === "rejected" && c.status !== "REJECTED") return false;

      // Query matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchInstructor = c.instructor.toLowerCase().includes(q);
        const matchCat = c.category.toLowerCase().includes(q);
        if (!matchTitle && !matchInstructor && !matchCat) return false;
      }

      // Category filter
      if (categoryFilter !== "ALL" && c.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [courses, activeTab, searchQuery, categoryFilter]);

  const pendingApprovalsCount = courses.filter((c) => c.status === "PENDING_APPROVAL").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-purple-400" />
            <span>Course Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-subtext mt-0.5">
            Validate course curriculums, review lecture video quality, manage pricing, and control catalog visibility.
          </p>
        </div>

        {/* Tabs Selector */}
        <div className="flex bg-card p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            All Courses ({courses.length})
          </button>

          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "approvals"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            <span>Pending Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-black">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("published")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "published"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Published
          </button>

          <button
            onClick={() => setActiveTab("drafts")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "drafts"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Drafts
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "rejected"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title, instructor, category..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-white/10 text-xs font-semibold text-text px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50"
          >
            <option value="ALL">All Categories</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Web Development">Web Development</option>
            <option value="Frontend">Frontend</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Cloud & DevOps">Cloud & DevOps</option>
          </select>

          <span className="text-xs font-semibold text-subtext px-2 py-1 bg-background/50 rounded-lg border border-white/5">
            {filteredCourses.length} courses
          </span>
        </div>
      </div>

      {/* Course Directory Table */}
      <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                <th className="py-4 px-6 w-[32%]">Course Title & Details</th>
                <th className="py-4 px-4 w-[18%]">Instructor</th>
                <th className="py-4 px-4 text-center">Students</th>
                <th className="py-4 px-4 text-right">Price</th>
                <th className="py-4 px-4 text-right">Revenue</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Updated</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-subtext space-y-2">
                    <BookOpen className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
                    <p className="text-sm font-bold text-text">No courses match your filter</p>
                    <p className="text-xs">Try clearing your search query or selecting a different tab.</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCourse(course)}
                  >
                    {/* Course Title & Thumb */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.thumbnailGradient} flex items-center justify-center text-white/80 shrink-0 border border-white/10 shadow-inner group-hover:scale-105 transition-transform`}
                        >
                          <PlayCircle className="w-6 h-6 text-purple-300" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-text text-sm group-hover:text-purple-300 transition-colors truncate max-w-[280px]">
                            {course.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                              {course.category}
                            </span>
                            <span className="text-[10px] text-subtext">•</span>
                            <span className="text-[10px] text-subtext">{course.duration}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-text truncate">{course.instructor}</p>
                      <span className="text-[10px] text-subtext">Faculty</span>
                    </td>

                    {/* Students */}
                    <td className="py-4 px-4 text-center font-bold text-text">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background/50 border border-white/5">
                        <Users className="w-3 h-3 text-subtext" />
                        <span>{course.enrolledStudents.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 text-right font-bold text-text">
                      ₹{course.price.toLocaleString()}
                    </td>

                    {/* Revenue */}
                    <td className="py-4 px-4 text-right font-bold text-emerald-400">
                      ₹{course.revenue.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                          course.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : course.status === "PENDING_APPROVAL"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : course.status === "REJECTED"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-card text-subtext border-white/10"
                        }`}
                      >
                        {course.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Updated */}
                    <td className="py-4 px-4 text-center text-subtext text-[11px]">
                      {course.updatedAt}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          title="Inspect Curriculum & Content"
                          className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold text-subtext hover:text-white transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
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

      {/* ── COURSE REVIEW & CURRICULUM INSPECTION SIDE DRAWER ── */}
      {selectedCourse && (
        <CourseInspectionDrawer
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onDecision={handleDecision}
          onTogglePublish={handleTogglePublish}
        />
      )}
    </div>
  );
}

function CourseInspectionDrawer({
  course,
  onClose,
  onDecision,
  onTogglePublish
}: {
  course: CourseItem;
  onClose: () => void;
  onDecision: (id: string, decision: "PUBLISHED" | "REJECTED" | "CHANGES_REQUESTED") => Promise<void>;
  onTogglePublish: (id: string) => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [priceInput, setPriceInput] = useState(course.price);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex justify-end animate-in fade-in">
      <div className="w-full max-w-2xl bg-card border-l border-white/10 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right-8 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-background/50 shrink-0">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.thumbnailGradient} flex items-center justify-center text-white font-bold text-base shadow-md border border-white/10`}
            >
              <Play className="w-5 h-5 fill-current text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-text truncate max-w-[320px]">{course.title}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider shrink-0 ${
                    course.status === "PUBLISHED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : course.status === "PENDING_APPROVAL"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {course.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-subtext mt-0.5">
                Instructor: {course.instructor} • {course.category} • {course.duration}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-background hover:bg-card border border-white/10 text-subtext hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-3 p-3.5 rounded-xl bg-background/50 border border-white/5 text-center">
            <div>
              <p className="text-[10px] text-subtext uppercase">Price</p>
              <p className="text-sm font-bold text-text mt-0.5">₹{course.price}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Enrolled</p>
              <p className="text-sm font-bold text-purple-300 mt-0.5">{course.enrolledStudents}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Revenue</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{course.revenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Refund Rate</p>
              <p className="text-sm font-bold text-sky-400 mt-0.5">{course.refundRate}%</p>
            </div>
          </div>

          {/* AI Quality Flag Analysis */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>AI Audio/Visual Quality Assessment</span>
            </div>
            <p className="text-xs text-subtext leading-relaxed">
              Curriculum video streams mapped cleanly at 1080p 60fps. Audio clarity score: <span className="text-text font-bold">96/100</span>. Code exercises contain test validation harnesses.
            </p>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-2">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Course Description & Learning Outcomes</span>
            </h3>
            <p className="text-xs text-text leading-relaxed bg-card p-3 rounded-lg border border-white/5">
              {course.description}
            </p>

            {course.outcomes && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-subtext uppercase">Target Outcomes:</p>
                {course.outcomes.map((o, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-text">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Curriculum Structure Breakdown */}
          {course.curriculum && (
            <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-3">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Curriculum & Lecture Syllabus</span>
              </h3>

              <div className="space-y-3">
                {course.curriculum.map((sec, i) => (
                  <div key={i} className="p-3 rounded-lg bg-card border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text">{sec.sectionTitle}</span>
                      <span className="text-[10px] text-subtext">{sec.lessons.length} Lessons</span>
                    </div>

                    <div className="space-y-1 pl-2 border-l-2 border-purple-500/30">
                      {sec.lessons.map((les, j) => (
                        <div key={j} className="flex items-center justify-between py-1 text-[11px]">
                          <div className="flex items-center gap-2">
                            {les.type === "video" ? (
                              <Video className="w-3.5 h-3.5 text-purple-400" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-sky-400" />
                            )}
                            <span className="text-text">{les.title}</span>
                          </div>
                          <span className="text-subtext font-mono">{les.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Feedback Box */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-2">
            <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block">
              Administrative Review Notes / Action Rationale
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter change requests, review feedback or approval notes..."
              className="w-full bg-card border border-white/10 rounded-xl p-3 text-xs text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50 resize-none h-20"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-background/60 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => onTogglePublish(course.id)}
            className="py-2 px-3 rounded-xl bg-card hover:bg-white/5 border border-white/10 text-xs font-bold text-subtext hover:text-text transition-all"
          >
            {course.status === "PUBLISHED" ? "Unpublish to Draft" : "Publish Directly"}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDecision(course.id, "CHANGES_REQUESTED")}
              className="py-2 px-3 rounded-xl bg-card hover:bg-white/5 border border-white/10 text-amber-400 text-xs font-bold transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Changes</span>
            </button>

            <button
              onClick={() => onDecision(course.id, "REJECTED")}
              className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition-all flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            <button
              onClick={() => onDecision(course.id, "PUBLISHED")}
              className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve & Publish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
