"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Loader2,
  Plus,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  TrendingUp,
  Award,
  Flame,
  BarChart3,
  Percent,
  ArrowUpRight,
  Zap,
  LayoutGrid,
  List,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import CourseReviewModal from "@/components/admin/CourseReviewModal";

export type CourseTab = "all" | "approvals" | "published" | "drafts" | "rejected";
export type CourseDeliveryMode = "SELF_PACED" | "LIVE_TRAINING" | "ALL";
export type CourseViewMode = "CATALOG" | "ANALYTICS";
export type ChartMetricType = "REVENUE" | "STUDENTS" | "RATING" | "COMPLETION";

export interface CourseItem {
  id: string;
  title: string;
  shortTitle?: string;
  instructor: string;
  instructorEmail?: string;
  category: string;
  price: number;
  enrolledStudents: number;
  revenue: number;
  refundRate: number;
  status: "PUBLISHED" | "PENDING_APPROVAL" | "DRAFT" | "REJECTED" | "ACTIVE" | "COMPLETED";
  type: "SELF_PACED" | "LIVE_TRAINING";
  submittedAt?: string;
  updatedAt: string;
  duration: string;
  sectionsCount: number;
  lessonsCount: number;
  totalSessions?: number;
  liveCohortBatch?: string;
  liveStartDate?: string;
  liveLink?: string;
  description: string;
  thumbnailGradient: string;
  rating: number;
  reviewsCount?: number;
  trendingVelocity?: string;
  completionRate?: number;
  attendanceRate?: number;
  maxSeats?: number;
  seatFillRate?: number;
  outcomes?: string[];
  curriculum?: {
    sectionTitle: string;
    lessons: { title: string; type: "video" | "assignment" | "quiz"; duration: string }[];
  }[];
}

const MOCK_COURSES: CourseItem[] = [
  // ── 1. SELF-PACED COURSES ──
  {
    id: "crs-101",
    title: "Advanced AI Agents & Autonomous Workflows",
    shortTitle: "AI Agents & Workflows",
    instructor: "Dr. Sarah Chen",
    instructorEmail: "sarah.chen@glarus.edu",
    category: "Artificial Intelligence",
    price: 1499,
    enrolledStudents: 1842,
    revenue: 485600,
    refundRate: 1.2,
    status: "PUBLISHED",
    type: "SELF_PACED",
    updatedAt: "Today, 10:30 AM",
    duration: "18h 40m",
    sectionsCount: 6,
    lessonsCount: 34,
    description: "Deep dive into multi-agent systems, Tool-calling LLMs, LangGraph, and enterprise production deployments.",
    thumbnailGradient: "from-purple-900 to-indigo-950",
    rating: 4.9,
    reviewsCount: 142,
    trendingVelocity: "+42% this month",
    completionRate: 86.4,
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
    id: "crs-103",
    title: "React 19 Enterprise Architecture & State Machines",
    shortTitle: "React 19 Architecture",
    instructor: "John Doe",
    instructorEmail: "john.doe@glarus.edu",
    category: "Frontend Engineering",
    price: 999,
    enrolledStudents: 967,
    revenue: 215400,
    refundRate: 2.1,
    status: "PUBLISHED",
    type: "SELF_PACED",
    updatedAt: "2 days ago",
    duration: "12h 00m",
    sectionsCount: 5,
    lessonsCount: 28,
    description: "Enterprise patterns for React 19, actions hook, optimistic updates, and large-scale codebases.",
    thumbnailGradient: "from-sky-950 to-blue-900",
    rating: 4.7,
    reviewsCount: 78,
    trendingVelocity: "+28% this month",
    completionRate: 74.2,
    outcomes: ["Use useActionState and useOptimistic", "Refactor legacy Redux to modern React 19", "Optimize bundle size"]
  },
  {
    id: "crs-102",
    title: "Mastering Next.js 14 App Router & Server Actions",
    shortTitle: "Next.js 14 App Router",
    instructor: "Jordan Walke",
    instructorEmail: "jordan.w@glarus.edu",
    category: "Web Development",
    price: 3499,
    enrolledStudents: 120,
    revenue: 419880,
    refundRate: 0.8,
    status: "PENDING_APPROVAL",
    type: "SELF_PACED",
    submittedAt: "Yesterday, 4:15 PM",
    updatedAt: "1 day ago",
    duration: "14h 20m",
    sectionsCount: 4,
    lessonsCount: 22,
    description: "Complete full-stack Next.js bootcamp exploring Server Components, Streaming, Suspense, and DB transactions.",
    thumbnailGradient: "from-neutral-900 to-slate-900",
    rating: 4.85,
    reviewsCount: 19,
    trendingVelocity: "+64% surge",
    completionRate: 81.0,
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
    id: "crs-105",
    title: "Cloud Computing & Serverless Microservices",
    shortTitle: "Cloud Serverless",
    instructor: "David Miller",
    category: "Cloud & DevOps",
    price: 1999,
    enrolledStudents: 84,
    revenue: 167916,
    refundRate: 1.0,
    status: "PUBLISHED",
    type: "SELF_PACED",
    updatedAt: "5 days ago",
    duration: "10h 30m",
    sectionsCount: 4,
    lessonsCount: 18,
    description: "Build fault-tolerant serverless microservices with AWS Lambda, EventBridge, and DynamoDB.",
    thumbnailGradient: "from-amber-950 to-orange-900",
    rating: 4.6,
    reviewsCount: 11,
    trendingVelocity: "+12% this month",
    completionRate: 68.5
  },
  {
    id: "crs-104",
    title: "Quantum Computing Basics & Qiskit Algorithms",
    shortTitle: "Quantum Computing",
    instructor: "Alice Smith",
    category: "Computer Science",
    price: 2199,
    enrolledStudents: 0,
    revenue: 0,
    refundRate: 0,
    status: "REJECTED",
    type: "SELF_PACED",
    submittedAt: "3 days ago",
    updatedAt: "3 days ago",
    duration: "8h 15m",
    sectionsCount: 3,
    lessonsCount: 15,
    description: "Foundational quantum algorithms, qubits, superposition, and entanglement with Python Qiskit.",
    thumbnailGradient: "from-emerald-950 to-teal-900",
    rating: 0
  },

  // ── 2. LIVE TRAINING COHORTS ──
  {
    id: "live-crs-201",
    title: "FAANG Generative AI & Large Language Models Immersion",
    shortTitle: "FAANG GenAI Live",
    instructor: "Dr. Sarah Chen",
    instructorEmail: "sarah.chen@glarus.edu",
    category: "Generative AI",
    price: 14999,
    enrolledStudents: 48,
    maxSeats: 50,
    seatFillRate: 96,
    revenue: 719952,
    refundRate: 0.5,
    status: "ACTIVE",
    type: "LIVE_TRAINING",
    updatedAt: "Active Cohort",
    duration: "6 Weeks",
    sectionsCount: 6,
    lessonsCount: 12,
    totalSessions: 12,
    liveCohortBatch: "Weekend Live Batch Alpha",
    liveStartDate: "Starts 01 Mar • 07:00 PM IST",
    liveLink: "/admin/live-training/courses/live-crs-201",
    description: "Live interactive cohort covering deep LLM fine-tuning, retrieval optimization, and evaluation suites.",
    thumbnailGradient: "from-emerald-950 via-teal-950 to-slate-950",
    rating: 4.95,
    reviewsCount: 38,
    attendanceRate: 98.4,
    trendingVelocity: "🔥 Sold out in 3 days",
    outcomes: ["Master direct LLM prompt alignment", "Build enterprise RAG pipelines", "Deploy on Kubernetes clusters"]
  },
  {
    id: "live-crs-202",
    title: "Production Agentic AI & LangGraph Bootcamp",
    shortTitle: "LangGraph Agentic Live",
    instructor: "Alex Chen",
    instructorEmail: "alex.chen@glarus.edu",
    category: "Autonomous Systems",
    price: 9999,
    enrolledStudents: 32,
    maxSeats: 40,
    seatFillRate: 80,
    revenue: 319968,
    refundRate: 0,
    status: "PUBLISHED",
    type: "LIVE_TRAINING",
    updatedAt: "Starts Soon",
    duration: "4 Weeks",
    sectionsCount: 4,
    lessonsCount: 8,
    totalSessions: 8,
    liveCohortBatch: "Weekday Evening Cohort 2",
    liveStartDate: "Starts 10 Mar • 08:00 PM IST",
    liveLink: "/admin/live-training/courses/live-crs-202",
    description: "Hands-on live workshop building stateful multi-agent systems with cyclic execution graphs.",
    thumbnailGradient: "from-indigo-950 via-purple-950 to-slate-950",
    rating: 4.88,
    reviewsCount: 22,
    attendanceRate: 94.2,
    trendingVelocity: "⚡ 80% capacity in 48h",
    outcomes: ["Build cyclic LangGraph workflows", "Integrate human-in-the-loop approvals", "Stream agent tokens to Next.js"]
  },
  {
    id: "live-crs-203",
    title: "Full-Stack AI SaaS Engineering with Next.js 15 & Python",
    shortTitle: "Full-Stack AI SaaS Live",
    instructor: "John Doe",
    instructorEmail: "john.doe@glarus.edu",
    category: "Full-Stack AI",
    price: 12499,
    enrolledStudents: 24,
    maxSeats: 30,
    seatFillRate: 80,
    revenue: 299976,
    refundRate: 0,
    status: "PENDING_APPROVAL",
    type: "LIVE_TRAINING",
    submittedAt: "2 days ago",
    updatedAt: "2 days ago",
    duration: "5 Weeks",
    sectionsCount: 5,
    lessonsCount: 10,
    totalSessions: 10,
    liveCohortBatch: "Spring Live Cohort",
    liveStartDate: "Starts 20 Mar",
    liveLink: "/admin/live-training/courses/live-crs-203",
    description: "Complete live cohort building and scaling monetized AI web applications from zero to revenue.",
    thumbnailGradient: "from-blue-950 via-sky-950 to-slate-950",
    rating: 4.82,
    reviewsCount: 14,
    attendanceRate: 92.0,
    trendingVelocity: "+35% week-over-week"
  }
];

// Historical Enrollment Trend Data (6-Month Area Chart)
const MONTHLY_TREND_DATA = [
  { month: "Oct", selfPaced: 420, liveTraining: 110, revenue: 680000 },
  { month: "Nov", selfPaced: 650, liveTraining: 180, revenue: 1050000 },
  { month: "Dec", selfPaced: 920, liveTraining: 260, revenue: 1480000 },
  { month: "Jan", selfPaced: 1350, liveTraining: 380, revenue: 1980000 },
  { month: "Feb", selfPaced: 2100, liveTraining: 620, revenue: 2440000 },
  { month: "Mar (Est)", selfPaced: 2850, liveTraining: 890, revenue: 3150000 }
];

// Category Share Colors
const CATEGORY_COLORS = ["#a855f7", "#10b981", "#0ea5e9", "#f59e0b", "#ec4899"];

export default function CourseManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-subtext space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm font-semibold text-text">Loading Course Management...</p>
        </div>
      }
    >
      <CourseManagementContent />
    </Suspense>
  );
}

function CourseManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as CourseTab) || "all";

  // Delivery mode: Defaults to ALL
  const [deliveryMode, setDeliveryMode] = useState<CourseDeliveryMode>("ALL");
  const [viewMode, setViewMode] = useState<CourseViewMode>("CATALOG");
  const [chartMetric, setChartMetric] = useState<ChartMetricType>("REVENUE");
  const [activeTab, setActiveTab] = useState<CourseTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [courses, setCourses] = useState<CourseItem[]>(MOCK_COURSES);

  // Sync tab from URL if changed
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as CourseTab;
    if (tabFromUrl && ["all", "approvals", "published", "drafts", "rejected"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Load real courses from database & live training API
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [coursesRes, liveRes] = await Promise.all([
          fetch("/api/admin/courses"),
          fetch("/api/admin/live-training/courses")
        ]);

        const dbCourseList: CourseItem[] = [];

        // 1. Process Self-Paced Courses from DB
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          if (data.courses && Array.isArray(data.courses)) {
            data.courses.forEach((c: any) => {
              const statusMap: Record<string, CourseItem["status"]> = {
                APPROVED: "PUBLISHED",
                PENDING: "PENDING_APPROVAL",
                REJECTED: "REJECTED"
              };

              dbCourseList.push({
                id: c.id,
                title: c.title,
                shortTitle: c.title.length > 22 ? `${c.title.substring(0, 20)}...` : c.title,
                instructor: c.instructor?.name || "Faculty Member",
                instructorEmail: c.instructor?.email,
                category: "AI & Technology",
                price: c.price || 999,
                enrolledStudents: c.enrollments?.length || 0,
                revenue: (c.purchases?.length || 0) * (c.price || 999),
                refundRate: 0,
                status: statusMap[c.status] || "PUBLISHED",
                type: "SELF_PACED",
                updatedAt: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "Recent",
                duration: `${c.modules?.length || 4} Modules`,
                sectionsCount: c.modules?.length || 4,
                lessonsCount: (c.modules?.length || 4) * 5,
                description: c.description || "",
                thumbnailGradient: "from-purple-900 to-indigo-950",
                rating: c.rating || 5.0,
                reviewsCount: c.reviewsCount || 8,
                trendingVelocity: "+15% this month",
                completionRate: 78.5
              });
            });
          }
        }

        // 2. Process Live Training Courses from DB
        if (liveRes.ok) {
          const lData = await liveRes.json();
          if (lData.courses && Array.isArray(lData.courses)) {
            lData.courses.forEach((lc: any) => {
              const statusMap: Record<string, CourseItem["status"]> = {
                PUBLISHED: "PUBLISHED",
                ACTIVE: "ACTIVE",
                DRAFT: "DRAFT",
                COMPLETED: "COMPLETED"
              };

              const enrolled = lc.enrolledCount || 0;
              const maxS = lc.maxStudents || 50;

              dbCourseList.push({
                id: lc.id,
                title: lc.title,
                shortTitle: lc.title.length > 22 ? `${lc.title.substring(0, 20)}...` : lc.title,
                instructor: lc.leadInstructor?.name || "Lead Faculty",
                instructorEmail: lc.leadInstructor?.email,
                category: lc.category || "Generative AI",
                price: 9999,
                enrolledStudents: enrolled,
                maxSeats: maxS,
                seatFillRate: Math.round((enrolled / maxS) * 100),
                revenue: enrolled * 9999,
                refundRate: 0,
                status: statusMap[lc.status] || "ACTIVE",
                type: "LIVE_TRAINING",
                updatedAt: lc.startDate ? `Starts ${new Date(lc.startDate).toLocaleDateString()}` : "Active Cohort",
                duration: lc.duration || "6 Weeks",
                sectionsCount: lc.totalSessions || 8,
                lessonsCount: lc.totalSessions || 8,
                totalSessions: lc.totalSessions || 8,
                liveCohortBatch: lc.level ? `${lc.level} Live Cohort` : "Active Live Cohort",
                liveStartDate: lc.startDate ? `Starts ${new Date(lc.startDate).toLocaleDateString()}` : "Live Schedule",
                liveLink: `/admin/live-training/courses/${lc.id}`,
                description: lc.description || "",
                thumbnailGradient: lc.thumbnailGradient || "from-emerald-950 to-slate-950",
                rating: 4.9,
                reviewsCount: 16,
                attendanceRate: 95.0,
                trendingVelocity: "⚡ Active live cohort"
              });
            });
          }
        }

        // Merge non-conflicting mock courses
        if (dbCourseList.length > 0) {
          setCourses((prev) => {
            const dbIds = new Set(dbCourseList.map((c) => c.id));
            const remainingMock = prev.filter((m) => !dbIds.has(m.id));
            return [...dbCourseList, ...remainingMock];
          });
        }
      } catch {
        /* ignore */
      }
    }

    loadCatalog();
  }, []);

  // Counts & Filtered data
  const selfPacedCourses = useMemo(() => courses.filter((c) => c.type === "SELF_PACED"), [courses]);
  const liveCourses = useMemo(() => courses.filter((c) => c.type === "LIVE_TRAINING"), [courses]);

  const pendingCount = courses.filter((c) => c.status === "PENDING_APPROVAL").length;
  const publishedCount = courses.filter((c) => c.status === "PUBLISHED" || c.status === "ACTIVE").length;
  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledStudents, 0);
  const totalRevenue = courses.reduce((acc, c) => acc + c.revenue, 0);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category && c.category !== "Self-Paced") set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  // Filtered Courses based on mode + tab + search
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (deliveryMode === "SELF_PACED" && c.type !== "SELF_PACED") return false;
      if (deliveryMode === "LIVE_TRAINING" && c.type !== "LIVE_TRAINING") return false;

      if (activeTab === "approvals" && c.status !== "PENDING_APPROVAL") return false;
      if (activeTab === "published" && c.status !== "PUBLISHED" && c.status !== "ACTIVE") return false;
      if (activeTab === "drafts" && c.status !== "DRAFT") return false;
      if (activeTab === "rejected" && c.status !== "REJECTED") return false;

      if (selectedCategory !== "ALL" && c.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchInstructor = c.instructor.toLowerCase().includes(q);
        const matchCat = c.category.toLowerCase().includes(q);
        if (!matchTitle && !matchInstructor && !matchCat) return false;
      }

      return true;
    });
  }, [courses, deliveryMode, activeTab, selectedCategory, searchQuery]);

  // Comparative Chart Data: Top Courses Bar Chart
  const comparisonChartData = useMemo(() => {
    const sorted = [...filteredCourses].sort((a, b) => {
      if (chartMetric === "REVENUE") return b.revenue - a.revenue;
      if (chartMetric === "STUDENTS") return b.enrolledStudents - a.enrolledStudents;
      if (chartMetric === "RATING") return b.rating - a.rating;
      return (b.completionRate || b.attendanceRate || 0) - (a.completionRate || a.attendanceRate || 0);
    });

    return sorted.slice(0, 6).map((c) => ({
      name: c.shortTitle || (c.title.length > 18 ? `${c.title.substring(0, 16)}...` : c.title),
      fullTitle: c.title,
      revenue: c.revenue,
      students: c.enrolledStudents,
      rating: c.rating,
      efficiency: c.type === "LIVE_TRAINING" ? c.attendanceRate || 95 : c.completionRate || 80,
      type: c.type
    }));
  }, [filteredCourses, chartMetric]);

  // Category Distribution Data for Donut Chart
  const categoryDistributionData = useMemo(() => {
    const map = new Map<string, number>();
    courses.forEach((c) => {
      const cat = c.category || "Other";
      map.set(cat, (map.get(cat) || 0) + (c.revenue > 0 ? c.revenue : 50000));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [courses]);

  // Handle row click
  const handleCourseClick = (course: CourseItem) => {
    if (course.type === "LIVE_TRAINING") {
      router.push(course.liveLink || `/admin/live-training/courses/${encodeURIComponent(course.id)}`);
    } else {
      router.push(`/admin/courses/${encodeURIComponent(course.id)}`);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans animate-in fade-in duration-300">
      {/* ── TOP LEVEL: COURSE TYPE SELECTION HERO CARDS (USER PERSPECTIVE) ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-black text-subtext uppercase tracking-widest">
              Select Course Delivery Format
            </h2>
            <p className="text-[11px] text-subtext">
              Choose between Self-Paced Video Curriculums or Live Training Cohorts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Catalog Directory vs Visual Graph Analytics */}
            <div className="flex bg-card p-1 rounded-xl border border-white/10 shadow-inner">
              <button
                onClick={() => setViewMode("CATALOG")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "CATALOG"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-subtext hover:text-text"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Catalog Directory</span>
              </button>

              <button
                onClick={() => setViewMode("ANALYTICS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "ANALYTICS"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
                    : "text-subtext hover:text-purple-300"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Course Analytics (Graphs & Rankings)</span>
              </button>
            </div>

            <button
              onClick={() => setDeliveryMode("ALL")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                deliveryMode === "ALL"
                  ? "bg-purple-600/20 text-purple-300 border-purple-500/40"
                  : "bg-card text-subtext hover:text-text border-white/10"
              }`}
            >
              All Formats ({courses.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OPTION 1: SELF-PACED COURSES */}
          <div
            onClick={() => setDeliveryMode("SELF_PACED")}
            className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden shadow-xl group ${
              deliveryMode === "SELF_PACED"
                ? "bg-gradient-to-br from-purple-950/60 via-card to-card border-purple-500 shadow-purple-500/10 ring-2 ring-purple-500/30 scale-[1.01]"
                : "bg-card border-white/10 hover:border-purple-500/40 hover:bg-card/90"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    deliveryMode === "SELF_PACED"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20"
                  }`}
                >
                  <PlayCircle className="w-7 h-7" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-text">Self-Paced Courses</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {selfPacedCourses.length} Courses
                    </span>
                  </div>
                  <p className="text-xs text-subtext mt-1 leading-relaxed">
                    On-demand video lessons, structured modules, and recorded practical assignments for independent learning.
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                    deliveryMode === "SELF_PACED"
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "border-white/20 text-transparent"
                  }`}
                >
                  ✓
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-purple-300 font-bold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Modules & Quizzes
              </span>
              <span className="text-subtext group-hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors">
                <span>View Self-Paced Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* OPTION 2: LIVE TRAINING COHORTS */}
          <div
            onClick={() => setDeliveryMode("LIVE_TRAINING")}
            className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden shadow-xl group ${
              deliveryMode === "LIVE_TRAINING"
                ? "bg-gradient-to-br from-emerald-950/60 via-card to-card border-emerald-500 shadow-emerald-500/10 ring-2 ring-emerald-500/30 scale-[1.01]"
                : "bg-card border-white/10 hover:border-emerald-500/40 hover:bg-card/90"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    deliveryMode === "LIVE_TRAINING"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
                  }`}
                >
                  <Radio className="w-7 h-7 animate-pulse" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-text">Live Training & Cohorts</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {liveCourses.length} Live Cohorts
                    </span>
                  </div>
                  <p className="text-xs text-subtext mt-1 leading-relaxed">
                    Interactive live classes, cohort batches, scheduled workshops, and dedicated instructor assignments.
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                    deliveryMode === "LIVE_TRAINING"
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "border-white/20 text-transparent"
                  }`}
                >
                  ✓
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <Video className="w-3.5 h-3.5" /> Interactive Zoom/Meet Cohorts
              </span>

              <Link
                href="/admin/live-training"
                onClick={(e) => e.stopPropagation()}
                className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Open Live Training Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODE 1: VISUAL GRAPH ANALYTICS & COMPARISON CHARTS ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {viewMode === "ANALYTICS" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* 1. INTERACTIVE COMPARATIVE BAR CHART (TOP VS TRENDING COURSES) */}
          <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h3 className="text-base font-black text-text flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span>
                    {deliveryMode === "LIVE_TRAINING"
                      ? "Live Training Cohort Comparative Analytics"
                      : deliveryMode === "SELF_PACED"
                      ? "Self-Paced Course Performance Analytics"
                      : "Top Courses & Cohorts Comparative Graph"}
                  </span>
                </h3>
                <p className="text-xs text-subtext mt-1">
                  Compare performance metrics across top grossing curriculums and fastest-selling cohorts.
                </p>
              </div>

              {/* Metric Selector for Bar Chart */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-subtext uppercase tracking-wider mr-1 hidden sm:inline">
                  Metric:
                </span>
                <div className="flex bg-background/60 p-1 rounded-xl border border-white/10 shadow-inner">
                  <button
                    onClick={() => setChartMetric("REVENUE")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartMetric === "REVENUE"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                        : "text-subtext hover:text-text"
                    }`}
                  >
                    Revenue (₹)
                  </button>

                  <button
                    onClick={() => setChartMetric("STUDENTS")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartMetric === "STUDENTS"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm"
                        : "text-subtext hover:text-text"
                    }`}
                  >
                    Enrollments
                  </button>

                  <button
                    onClick={() => setChartMetric("RATING")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartMetric === "RATING"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-subtext hover:text-text"
                    }`}
                  >
                    Rating (★)
                  </button>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart Container */}
            <div className="h-[340px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <BarChart data={comparisonChartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#ffffff60"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#ffffff15" }}
                  />
                  <YAxis
                    stroke="#ffffff60"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#ffffff15" }}
                    tickFormatter={(val) =>
                      chartMetric === "REVENUE"
                        ? `₹${(val / 1000).toFixed(0)}k`
                        : chartMetric === "RATING"
                        ? `${val}★`
                        : `${val}`
                    }
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card/95 backdrop-blur-md p-4 rounded-2xl border border-white/15 shadow-2xl space-y-2 text-xs">
                            <p className="font-black text-text text-sm">{data.fullTitle}</p>
                            <div className="space-y-1 text-[11px] pt-1 border-t border-white/10">
                              <p className="flex justify-between gap-4">
                                <span className="text-subtext">Delivery Format:</span>
                                <span className="font-bold text-purple-300">
                                  {data.type === "LIVE_TRAINING" ? "Live Cohort" : "Self-Paced"}
                                </span>
                              </p>
                              <p className="flex justify-between gap-4">
                                <span className="text-subtext">Gross Revenue:</span>
                                <span className="font-black text-emerald-400">₹{data.revenue.toLocaleString()}</span>
                              </p>
                              <p className="flex justify-between gap-4">
                                <span className="text-subtext">Enrolled Students:</span>
                                <span className="font-bold text-text">{data.students.toLocaleString()}</span>
                              </p>
                              <p className="flex justify-between gap-4">
                                <span className="text-subtext">Student Rating:</span>
                                <span className="font-bold text-amber-400">★ {data.rating || "5.0"}</span>
                              </p>
                              <p className="flex justify-between gap-4">
                                <span className="text-subtext">
                                  {data.type === "LIVE_TRAINING" ? "Attendance Rate:" : "Completion Rate:"}
                                </span>
                                <span className="font-bold text-sky-400">{data.efficiency}%</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={
                      chartMetric === "REVENUE"
                        ? "revenue"
                        : chartMetric === "STUDENTS"
                        ? "students"
                        : "rating"
                    }
                    radius={[8, 8, 0, 0]}
                  >
                    {comparisonChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.type === "LIVE_TRAINING"
                            ? "#10b981"
                            : index === 0
                            ? "#a855f7"
                            : index === 1
                            ? "#8b5cf6"
                            : "#6366f1"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-subtext pt-2 border-t border-white/5">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-600" />
                  <span>Self-Paced Courses</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span>Live Training Cohorts</span>
                </span>
              </div>
              <span className="font-semibold text-purple-300">Updated with live platform transactions</span>
            </div>
          </div>

          {/* 2. DUAL GRAPHS: 6-MONTH GROWTH TRAJECTORY & REVENUE DISTRIBUTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 6-Month Enrollment Growth (Area Chart) - 7 Cols */}
            <div className="lg:col-span-7 bg-card border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-text flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Monthly Enrollment Growth Trajectory (6 Months)</span>
                  </h4>
                  <p className="text-xs text-subtext mt-0.5">
                    Self-Paced vs Live Cohort learner adoption rate.
                  </p>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                  +148% H2 Surge
                </span>
              </div>

              <div className="h-[260px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                  <AreaChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSelfPaced" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="month" stroke="#ffffff60" fontSize={11} tickLine={false} />
                    <YAxis stroke="#ffffff60" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xl text-xs space-y-1.5">
                              <p className="font-black text-text">{label}</p>
                              <p className="text-purple-300 font-bold">
                                Self-Paced: {payload[0]?.value} learners
                              </p>
                              <p className="text-emerald-400 font-bold">
                                Live Cohorts: {payload[1]?.value} learners
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="selfPaced"
                      name="Self-Paced"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSelfPaced)"
                    />
                    <Area
                      type="monotone"
                      dataKey="liveTraining"
                      name="Live Training"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorLive)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-subtext pt-2 border-t border-white/5">
                <span className="flex items-center gap-1 text-purple-300 font-bold">
                  ● Self-Paced (2,850 learners)
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  ● Live Cohorts (890 learners)
                </span>
              </div>
            </div>

            {/* Category Revenue Share (Donut / Pie Chart) - 5 Cols */}
            <div className="lg:col-span-5 bg-card border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-text flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-purple-400" />
                    <span>Domain Category Share</span>
                  </h4>
                  <p className="text-xs text-subtext mt-0.5">
                    Gross revenue contribution by subject.
                  </p>
                </div>
              </div>

              <div className="h-[210px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                  <PieChart>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="bg-card/95 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-xl text-xs space-y-1">
                              <p className="font-bold text-text">{data.name}</p>
                              <p className="font-black text-emerald-400">
                                ₹{Number(data.value).toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] pt-2 border-t border-white/5">
                {categoryDistributionData.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 font-medium text-text">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. SIDE-BY-SIDE COURSE COMPARISON MATRIX TABLE */}
          <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h4 className="text-sm font-black text-text flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Performance Leaderboard & Comparative Ranking</span>
                </h4>
                <p className="text-xs text-subtext mt-0.5">
                  Compare rankings across both Self-Paced Curriculums and Live Cohort Batches.
                </p>
              </div>

              <span className="text-xs font-bold text-purple-300">
                Comparing {filteredCourses.length} Courses
              </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1050px]">
                <thead>
                  <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-6 w-[32%]">Course / Cohort Title</th>
                    <th className="py-3 px-4 w-[16%]">Format & Instructor</th>
                    <th className="py-3 px-4 text-right">Revenue (₹)</th>
                    <th className="py-3 px-4 text-center">Enrolled / Seats</th>
                    <th className="py-3 px-4 text-center">Trending Velocity</th>
                    <th className="py-3 px-4 text-center">Rating & Engagement</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-medium">
                  {filteredCourses
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((course, idx) => {
                      const isLive = course.type === "LIVE_TRAINING";
                      const rankBadge =
                        idx === 0
                          ? "bg-amber-500 text-black font-black"
                          : idx === 1
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold"
                          : idx === 2
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold"
                          : "bg-white/5 text-subtext border border-white/10";

                      return (
                        <tr
                          key={course.id}
                          className="hover:bg-white/5 transition-colors cursor-pointer group"
                          onClick={() => handleCourseClick(course)}
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center mx-auto text-xs ${rankBadge}`}>
                              #{idx + 1}
                            </span>
                          </td>

                          {/* Title & Category */}
                          <td className="py-4 px-6">
                            <div className="min-w-0">
                              <h5 className="font-bold text-text text-sm group-hover:text-purple-300 transition-colors truncate">
                                {course.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-subtext uppercase tracking-wider">
                                  {course.category}
                                </span>
                                {isLive && (
                                  <span className="text-[10px] font-semibold text-emerald-400">
                                    • {course.liveCohortBatch}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Format & Instructor */}
                          <td className="py-4 px-4">
                            <div>
                              <span
                                className={`inline-block px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider mb-1 ${
                                  isLive
                                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                    : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                                }`}
                              >
                                {isLive ? "Live Cohort" : "Self-Paced"}
                              </span>
                              <p className="font-bold text-text text-xs truncate">{course.instructor}</p>
                            </div>
                          </td>

                          {/* Revenue */}
                          <td className="py-4 px-4 text-right font-black text-emerald-400 text-sm">
                            ₹{course.revenue.toLocaleString()}
                          </td>

                          {/* Enrolled / Seats Fill Rate */}
                          <td className="py-4 px-4 text-center">
                            {isLive ? (
                              <div>
                                <span className="font-bold text-text">
                                  {course.enrolledStudents} / {course.maxSeats || 50}
                                </span>
                                <div className="w-24 bg-background/80 h-1.5 rounded-full mx-auto mt-1 overflow-hidden border border-white/5">
                                  <div
                                    className="bg-emerald-400 h-full rounded-full"
                                    style={{ width: `${course.seatFillRate || 80}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="font-bold text-text inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background/50 border border-white/5">
                                <Users className="w-3 h-3 text-subtext" />
                                <span>{course.enrolledStudents.toLocaleString()}</span>
                              </div>
                            )}
                          </td>

                          {/* Trending Velocity */}
                          <td className="py-4 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold inline-flex items-center gap-1">
                              <Flame className="w-3 h-3 fill-amber-400" />
                              <span>{course.trendingVelocity || "+24% surge"}</span>
                            </span>
                          </td>

                          {/* Rating & Engagement */}
                          <td className="py-4 px-4 text-center">
                            <div>
                              <span className="font-bold text-amber-400 inline-flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {course.rating > 0 ? course.rating : "5.0"}
                              </span>
                              <span className="text-[10px] text-subtext block mt-0.5">
                                {isLive
                                  ? `${course.attendanceRate || 95}% Attendance`
                                  : `${course.completionRate || 78}% Completion`}
                              </span>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            {isLive ? (
                              <Link
                                href={course.liveLink || `/admin/live-training/courses/${course.id}`}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-xs font-bold text-emerald-300 transition-all inline-flex items-center gap-1 shadow-sm"
                              >
                                <span>Manage Live</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            ) : (
                              <Link
                                href={`/admin/courses/${course.id}`}
                                className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold text-subtext hover:text-white transition-all inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </Link>
                            )}
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODE 2: STANDARD CATALOG DIRECTORY TABLE ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {viewMode === "CATALOG" && (
        <div className="space-y-6">
          {/* KPI METRICS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-card border border-white/10 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">
                  {deliveryMode === "SELF_PACED"
                    ? "Self-Paced Courses"
                    : deliveryMode === "LIVE_TRAINING"
                    ? "Live Cohorts"
                    : "Total Catalog"}
                </p>
                <BookOpen className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-text mt-1">{filteredCourses.length}</h3>
              <span className="text-[10px] text-subtext font-semibold">
                {deliveryMode === "ALL"
                  ? `${selfPacedCourses.length} Self-Paced • ${liveCourses.length} Live`
                  : `${publishedCount} Published & Active`}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-white/10 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Published / Active</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{publishedCount}</h3>
              <span className="text-[10px] text-emerald-400 font-semibold">Live on platform</span>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-white/10 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Pending Approvals</p>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{pendingCount}</h3>
              <span className="text-[10px] text-amber-400 font-semibold">Requires validation</span>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-white/10 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Total Enrolled</p>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-text mt-1">{totalStudents.toLocaleString()}</h3>
              <span className="text-[10px] text-emerald-400 font-semibold">
                ₹{(totalRevenue / 100000).toFixed(1)}L total revenue
              </span>
            </div>
          </div>

          {/* FILTER CONTROLS & CREATE BUTTON */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex bg-card p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "all"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-subtext hover:text-text hover:bg-white/5"
                }`}
              >
                All ({filteredCourses.length})
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
                onClick={() => setActiveTab("published")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "published"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-subtext hover:text-text hover:bg-white/5"
                }`}
              >
                Published / Active
              </button>

              <button
                onClick={() => setActiveTab("drafts")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "drafts"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-subtext hover:text-text hover:bg-white/5"
                }`}
              >
                Drafts
              </button>

              <button
                onClick={() => setActiveTab("rejected")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "rejected"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-subtext hover:text-text hover:bg-white/5"
                }`}
              >
                Rejected
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-end lg:self-auto">
              {deliveryMode === "LIVE_TRAINING" ? (
                <Link
                  href="/admin/live-training"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Go to Live Training Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href="/admin/create"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Course</span>
                </Link>
              )}
            </div>
          </div>

          {/* SEARCH & CATEGORY BAR */}
          <div className="bg-card border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, instructor, category..."
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-background border border-white/10 text-xs font-semibold text-text px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <span className="text-xs font-semibold text-subtext px-2.5 py-1.5 bg-background/50 rounded-xl border border-white/5 whitespace-nowrap">
                {filteredCourses.length} results
              </span>
            </div>
          </div>

          {/* COURSES TABLE */}
          <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                    <th className="py-4 px-6 w-[34%]">Course Title & Format</th>
                    <th className="py-4 px-4 w-[18%]">Instructor</th>
                    <th className="py-4 px-4 text-center">Students</th>
                    <th className="py-4 px-4 text-right">Price</th>
                    <th className="py-4 px-4 text-right">Revenue</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-center">Published Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-medium">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-subtext space-y-2">
                        <BookOpen className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
                        <p className="text-sm font-bold text-text">No courses match your filter</p>
                        <p className="text-xs">Try switching between Self-Paced & Live Training formats above.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => {
                      const isLive = course.type === "LIVE_TRAINING";
                      const isPublished = course.status === "PUBLISHED" || course.status === "ACTIVE";

                      return (
                        <tr
                          key={course.id}
                          className="hover:bg-white/5 transition-colors group cursor-pointer"
                          onClick={() => handleCourseClick(course)}
                        >
                          {/* 1. Title & Details with Delivery Format Badges */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              {/* Format Icon */}
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md border ${
                                  isLive
                                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10"
                                    : "bg-purple-950/60 text-purple-300 border-purple-500/30"
                                }`}
                              >
                                {isLive ? <Radio className="w-5 h-5 animate-pulse" /> : <Play className="w-4 h-4" />}
                              </div>

                              <div className="min-w-0">
                                {/* Clean Format Badge & Domain Category */}
                                <div className="flex items-center gap-1.5 mb-1">
                                  {isLive ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      Live Training
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                      <PlayCircle className="w-2.5 h-2.5" />
                                      Self-Paced
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold text-subtext uppercase tracking-wider">
                                    {course.category}
                                  </span>
                                </div>

                                <h4 className="font-bold text-text text-sm group-hover:text-purple-300 transition-colors truncate">
                                  {course.title}
                                </h4>

                                <p className="text-[11px] text-subtext/70 truncate mt-0.5">
                                  {isLive
                                    ? `${course.liveCohortBatch || "Active Live Cohort"} • ${course.totalSessions || 8} Live Sessions`
                                    : `${course.duration} • ${course.sectionsCount} Sections • ${course.lessonsCount} Lessons`}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 2. Instructor */}
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-bold text-text text-xs">{course.instructor}</p>
                              <span className="text-[10px] text-subtext">
                                {isLive ? "Lead Faculty" : "Course Author"}
                              </span>
                            </div>
                          </td>

                          {/* 3. Students */}
                          <td className="py-4 px-4 text-center font-bold text-text">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background/50 border border-white/5">
                              <Users className="w-3 h-3 text-subtext" />
                              <span>{course.enrolledStudents.toLocaleString()}</span>
                            </div>
                          </td>

                          {/* 4. Price */}
                          <td className="py-4 px-4 text-right font-black text-text">
                            ₹{course.price.toLocaleString()}
                          </td>

                          {/* 5. Revenue */}
                          <td className="py-4 px-4 text-right font-bold text-emerald-400">
                            ₹{course.revenue.toLocaleString()}
                          </td>

                          {/* 6. Status */}
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                                course.status === "PUBLISHED" || course.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : course.status === "PENDING_APPROVAL"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : course.status === "DRAFT"
                              ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                              }`}
                            >
                              {course.status.replace("_", " ")}
                            </span>
                          </td>

                          {/* 7. Published Date / Status */}
                          <td className="py-4 px-4 text-center text-[11px]">
                            {isPublished ? (
                              <div className="font-semibold text-text">
                                <span>{isLive ? course.liveStartDate : course.updatedAt}</span>
                              </div>
                            ) : course.status === "PENDING_APPROVAL" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </span>
                            ) : course.status === "DRAFT" ? (
                              <span className="text-[10px] font-medium text-subtext/60 italic">
                                Unpublished Draft
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-red-400/80 italic">
                                Not Published
                              </span>
                            )}
                          </td>

                          {/* 8. Actions */}
                          <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {isLive ? (
                                <Link
                                  href={course.liveLink || `/admin/live-training/courses/${course.id}`}
                                  title="Manage Live Cohort, Sessions & Instructors"
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-xs font-bold text-emerald-300 transition-all inline-flex items-center gap-1 shadow-sm cursor-pointer"
                                >
                                  <Radio className="w-3.5 h-3.5" />
                                  <span>Manage Live</span>
                                  <ArrowRight className="w-3 h-3 ml-0.5" />
                                </Link>
                              ) : (
                                <Link
                                  href={`/admin/courses/${encodeURIComponent(course.id)}`}
                                  title="Inspect Full Course, Videos, Quizzes & Assignments"
                                  className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold text-subtext hover:text-white transition-all inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect</span>
                                </Link>
                              )}
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
        </div>
      )}
    </div>
  );
}
