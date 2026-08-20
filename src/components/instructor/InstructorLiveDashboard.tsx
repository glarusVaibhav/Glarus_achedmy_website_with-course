"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Users,
  ArrowRight,
  ExternalLink,
  PlayCircle,
  FileText,
  Search,
  X,
  Sparkles,
  BookOpen,
  ClipboardList,
  AlertCircle,
  Check,
  CalendarDays,
  Radio,
  Layers,
  ChevronRight,
  Award,
  Download,
  Share2,
  HelpCircle,
  ShieldCheck,
  CheckSquare,
  Eye,
  TrendingUp,
  MessageSquare,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

export type LiveClassStatus = "LIVE_NOW" | "STARTS_SOON" | "UPCOMING" | "COMPLETED";

export interface LiveClassTopic {
  timeRange: string;
  title: string;
  description?: string;
}

export interface LiveClassResource {
  label: string;
  url: string;
  type: "github" | "slides" | "doc" | "link";
}

export interface StudentAssignmentItem {
  id: string;
  title: string;
  module: string;
  dueDate: string;
  status: "Submitted" | "Pending Review" | "Graded" | "Missing";
  score: number | null;
  totalMarks: number;
  submittedAt?: string;
  submittedText?: string;
  submittedFileName?: string;
  feedback?: string;
}

export interface LiveClassStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  attendanceStatus: "Present" | "Attended" | "Expected" | "Missed" | "Late";
  courseProgress: number; // 0 - 100
  assignmentSummary: string; // e.g. "3/4 Submitted"
  lastActive: string;
  assignments: StudentAssignmentItem[];
}

export interface LiveClassItem {
  id: string;
  title: string;
  courseName: string;
  moduleName: string;
  batch: string;
  status: LiveClassStatus;
  statusLabel: string; // "LIVE NOW" | "STARTS AT 7:00 PM" | "UPCOMING" | "COMPLETED"
  dateLabel: string; // "Today", "Tomorrow", "18 Aug 2026", "05 Aug 2026"
  timeRange: string; // "10:45 AM – 12:00 PM"
  durationMinutes: number;
  studentCount: number;
  adminAssignedBy: string;
  meetingUrl?: string;
  recordingUrl?: string;
  attendanceRate?: number;
  averageRating?: number;
  compensationAmount: number;
  description: string;
  learningObjectives: string[];
  topics: LiveClassTopic[];
  teachingNotes: string[];
  resources: LiveClassResource[];
  students: LiveClassStudent[];
}

/* ═══════════════════════════════════════════════
   MOCK SEED DATA
   ═══════════════════════════════════════════════ */

const SAMPLE_ASSIGNMENTS_ALEX: StudentAssignmentItem[] = [
  {
    id: "asg-m8-1",
    title: "Module 8 Assessment — Agentic LangGraph Pipeline",
    module: "Module 8",
    dueDate: "Yesterday",
    status: "Submitted",
    score: null,
    totalMarks: 100,
    submittedAt: "Yesterday at 11:20 PM",
    submittedText: "Implemented a multi-agent supervisor graph with SQLite state checkpointing and custom tool nodes for web retrieval.",
    submittedFileName: "alex_agentic_pipeline.zip",
    feedback: "",
  },
  {
    id: "asg-m8-2",
    title: "Agentic AI Capstone Project",
    module: "Module 8",
    dueDate: "In 2 days",
    status: "Pending Review",
    score: null,
    totalMarks: 100,
    submittedAt: "Today at 08:30 AM",
    submittedText: "Created full autonomous code reviewer agent with GitHub webhook integration and automated PR comments.",
    submittedFileName: "agent_code_reviewer_v1.tar.gz",
    feedback: "Awaiting instructor final evaluation.",
  },
  {
    id: "asg-m7-1",
    title: "ReAct Loop Implementation",
    module: "Module 7",
    dueDate: "03 Aug 2026",
    status: "Graded",
    score: 94,
    totalMarks: 100,
    submittedAt: "02 Aug 2026",
    submittedText: "Built deterministic reasoning steps with retry loops and OpenAI function calling.",
    submittedFileName: "react_loop_alex.py",
    feedback: "Outstanding architecture! Clean exception boundaries and clear step logs.",
  },
];

const SAMPLE_ASSIGNMENTS_RAHUL: StudentAssignmentItem[] = [
  {
    id: "asg-m8-1",
    title: "Module 8 Assessment — Agentic LangGraph Pipeline",
    module: "Module 8",
    dueDate: "Yesterday",
    status: "Graded",
    score: 88,
    totalMarks: 100,
    submittedAt: "Yesterday at 06:15 PM",
    submittedText: "Built 3-node graph with search, analyzer, and formatter nodes.",
    submittedFileName: "rahul_langgraph_hw.zip",
    feedback: "Good modular structure. Consider adding query cache to avoid duplicate API calls.",
  },
  {
    id: "asg-m8-2",
    title: "Agentic AI Capstone Project",
    module: "Module 8",
    dueDate: "In 2 days",
    status: "Pending Review",
    score: null,
    totalMarks: 100,
    submittedAt: "Today at 09:40 AM",
    submittedText: "Autonomous Customer Support Agent with human-in-the-loop escalation.",
    submittedFileName: "rahul_capstone_project.zip",
  },
  {
    id: "asg-m7-1",
    title: "ReAct Loop Implementation",
    module: "Module 7",
    dueDate: "03 Aug 2026",
    status: "Graded",
    score: 85,
    totalMarks: 100,
    submittedAt: "01 Aug 2026",
    submittedText: "Implemented reasoning loops with custom calculator tool.",
    submittedFileName: "react_rahul.py",
    feedback: "Well executed. Handled syntax errors gracefully.",
  },
];

const SAMPLE_ASSIGNMENTS_ANKIT: StudentAssignmentItem[] = [
  {
    id: "asg-m8-1",
    title: "Module 8 Assessment — Agentic LangGraph Pipeline",
    module: "Module 8",
    dueDate: "Yesterday",
    status: "Pending Review",
    score: null,
    totalMarks: 100,
    submittedAt: "Yesterday at 11:45 PM",
    submittedText: "Multi-agent research swarm using LangGraph state graphs.",
    submittedFileName: "ankit_swarm.zip",
  },
  {
    id: "asg-m8-2",
    title: "Agentic AI Capstone Project",
    module: "Module 8",
    dueDate: "In 2 days",
    status: "Missing",
    score: null,
    totalMarks: 100,
  },
  {
    id: "asg-m7-1",
    title: "ReAct Loop Implementation",
    module: "Module 7",
    dueDate: "03 Aug 2026",
    status: "Graded",
    score: 78,
    totalMarks: 100,
    submittedAt: "03 Aug 2026",
    submittedText: "Basic ReAct agent with Wikipedia tool lookup.",
    submittedFileName: "react_ankit.py",
    feedback: "Good start. Needed more robust JSON response parsing.",
  },
];

const INITIAL_LIVE_CLASSES: LiveClassItem[] = [
  /* ─────────────────────────────────────────────
     1. TODAY'S CLASSES (Live Now & Evening)
     ───────────────────────────────────────────── */
  {
    id: "class-today-1",
    title: "Agentic AI & Code Walkthrough",
    courseName: "Generative AI & LLM Systems",
    moduleName: "Module 8 · Live Training",
    batch: "Batch AI-2026-A",
    status: "LIVE_NOW",
    statusLabel: "LIVE NOW",
    dateLabel: "Today",
    timeRange: "10:45 AM – 12:00 PM",
    durationMinutes: 75,
    studentCount: 24,
    adminAssignedBy: "Academic Operations Team",
    meetingUrl: "https://meet.google.com/glarus-ai-masterclass",
    compensationAmount: 5000,
    description: "Ongoing live interactive coding session discussing multi-agent orchestration, LangGraph swarms, memory checkpointing, and tool calling patterns.",
    learningObjectives: [
      "Master multi-agent StateGraph orchestration with conditional routing",
      "Implement persistent memory checkpointers using SQLite / Postgres",
      "Build custom tool schemas with Pydantic and automated error handling",
      "Deploy human-in-the-loop interruption gates for sensitive tool execution"
    ],
    topics: [
      { timeRange: "10:45 – 11:00 AM", title: "StateGraph & Multi-Agent Architecture", description: "Reviewing agent communication protocols, shared memory dictionaries, and router nodes." },
      { timeRange: "11:00 – 11:35 AM", title: "Live Pair-Programming: Autonomous Swarm", description: "Hands-on implementation of researcher, coder, and critic agents working collaboratively." },
      { timeRange: "11:35 – 11:50 AM", title: "State Persistence & Resumption", description: "Demonstrating crash recovery and step-by-step state inspectability." },
      { timeRange: "11:50 – 12:00 PM", title: "Live Student Q&A & Code Feedback", description: "Live debugging student PR submissions and best practices." }
    ],
    teachingNotes: [
      "Ensure all students clone the starter repository before the coding portion starts.",
      "Highlight the difference between standard tool calling and stateful multi-agent graphs.",
      "Remind students that Capstone Project submissions are due in 2 days."
    ],
    resources: [
      { label: "LangGraph Multi-Agent Starter Repo", url: "https://github.com/example/langgraph-starter", type: "github" },
      { label: "Live Session Slides & Architecture Diagrams", url: "https://example.com/slides/agentic-qna", type: "slides" },
      { label: "Agent Tool Schemas Cheat Sheet", url: "https://example.com/docs/agent-tools", type: "doc" }
    ],
    students: [
      {
        id: "stu-101",
        name: "Alex Rivera",
        email: "alex.rivera@example.com",
        attendanceStatus: "Present",
        courseProgress: 88,
        assignmentSummary: "3/3 Submitted · 1 Pending Review",
        lastActive: "Today at 10:45 AM (In Live Room)",
        assignments: SAMPLE_ASSIGNMENTS_ALEX,
      },
      {
        id: "stu-102",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        attendanceStatus: "Present",
        courseProgress: 82,
        assignmentSummary: "3/3 Submitted · 1 Graded",
        lastActive: "Today at 10:46 AM (In Live Room)",
        assignments: SAMPLE_ASSIGNMENTS_RAHUL,
      },
      {
        id: "stu-103",
        name: "Ankit Kumar",
        email: "ankit.kumar@example.com",
        attendanceStatus: "Present",
        courseProgress: 61,
        assignmentSummary: "2/3 Submitted · 1 Pending Review",
        lastActive: "Today at 10:48 AM (In Live Room)",
        assignments: SAMPLE_ASSIGNMENTS_ANKIT,
      },
      {
        id: "stu-104",
        name: "Sneha Reddy",
        email: "sneha.reddy@example.com",
        attendanceStatus: "Present",
        courseProgress: 94,
        assignmentSummary: "3/3 Graded · Avg 96%",
        lastActive: "Today at 10:45 AM (In Live Room)",
        assignments: [
          { id: "asg-m8-1", title: "Module 8 Assessment — Agentic LangGraph Pipeline", module: "Module 8", dueDate: "Yesterday", status: "Graded", score: 98, totalMarks: 100, submittedText: "Flawless LangGraph implementation with streaming token output.", feedback: "Exceptional code quality!" },
          { id: "asg-m7-1", title: "ReAct Loop Implementation", module: "Module 7", dueDate: "03 Aug 2026", status: "Graded", score: 95, totalMarks: 100, submittedText: "Robust tool parsing and error recovery." }
        ],
      },
      {
        id: "stu-105",
        name: "Priya Patel",
        email: "priya.patel@example.com",
        attendanceStatus: "Present",
        courseProgress: 75,
        assignmentSummary: "2/3 Graded · 1 Submitted",
        lastActive: "Today at 10:50 AM",
        assignments: [
          { id: "asg-m8-1", title: "Module 8 Assessment — Agentic LangGraph Pipeline", module: "Module 8", dueDate: "Yesterday", status: "Submitted", score: null, totalMarks: 100, submittedText: "Agent workflow script." },
          { id: "asg-m7-1", title: "ReAct Loop Implementation", module: "Module 7", dueDate: "03 Aug 2026", status: "Graded", score: 82, totalMarks: 100 }
        ],
      }
    ]
  },
  {
    id: "class-today-2",
    title: "JavaScript Advanced Concepts & Async Patterns",
    courseName: "Full-Stack Web Development Bootcamp",
    moduleName: "Module 4 · Live Training",
    batch: "Batch FS-2026-02",
    status: "STARTS_SOON",
    statusLabel: "STARTS AT 7:00 PM",
    dateLabel: "Today",
    timeRange: "07:00 PM – 08:30 PM",
    durationMinutes: 90,
    studentCount: 18,
    adminAssignedBy: "Academic Operations Team",
    meetingUrl: "https://zoom.us/j/9948201923",
    compensationAmount: 4500,
    description: "Evening deep-dive into event loop mechanics, microtasks vs macrotasks, custom Promise implementations, AbortControllers, and async iterators.",
    learningObjectives: [
      "Understand the V8 Call Stack, Libuv event loop, and queue prioritization",
      "Implement a robust concurrency limiter and custom Promise.allSettled polyfill",
      "Master AbortController for cancelable fetch requests and stream pipelines"
    ],
    topics: [
      { timeRange: "07:00 – 07:25 PM", title: "Event Loop & Execution Context", description: "Call stack tracing, microtask queue scheduling, and rendering cycles." },
      { timeRange: "07:25 – 08:05 PM", title: "Live Polyfill Coding", description: "Writing Promise.all, retry wrappers, and async concurrency pool from scratch." },
      { timeRange: "08:05 – 08:30 PM", title: "Streams & Cancelable Pipelines", description: "ReadableStream, TransformStream, and student live problem walkthroughs." }
    ],
    teachingNotes: [
      "Show live Chrome DevTools Performance profiler traces during the event loop explanation.",
      "Challenge students to spot memory leak pitfalls with event listeners."
    ],
    resources: [
      { label: "Async JavaScript Polyfills Repo", url: "https://github.com/example/js-async-polyfills", type: "github" },
      { label: "Event Loop Visualization Slides", url: "https://example.com/slides/event-loop", type: "slides" }
    ],
    students: [
      {
        id: "stu-201",
        name: "Arun Sharma",
        email: "arun.sharma@example.com",
        attendanceStatus: "Expected",
        courseProgress: 84,
        assignmentSummary: "2/2 Submitted",
        lastActive: "Today at 02:15 PM",
        assignments: [
          { id: "asg-js-1", title: "Async Concurrency Limiter", module: "Module 4", dueDate: "Tomorrow", status: "Submitted", score: null, totalMarks: 100, submittedText: "Implemented p-limit algorithm with queue and semaphore." },
          { id: "asg-js-0", title: "Closures & Scope Chain Quiz", module: "Module 3", dueDate: "05 Aug 2026", status: "Graded", score: 92, totalMarks: 100 }
        ]
      }
    ]
  },

  /* ─────────────────────────────────────────────
     2. UPCOMING CLASSES
     ───────────────────────────────────────────── */
  {
    id: "class-up-1",
    title: "Fullstack Next.js 15 Deployment Masterclass",
    courseName: "Full-Stack Web Development Bootcamp",
    moduleName: "Module 6 · Live Workshop",
    batch: "Batch FS-2026-01",
    status: "UPCOMING",
    statusLabel: "UPCOMING",
    dateLabel: "Tomorrow",
    timeRange: "06:00 PM – 07:30 PM",
    durationMinutes: 90,
    studentCount: 42,
    adminAssignedBy: "Chief Academic Reviewer",
    meetingUrl: "https://zoom.us/j/9948201923",
    compensationAmount: 5000,
    description: "Scheduled live masterclass on deploying production Next.js 15 apps with Server Actions, Prisma ORM, SQLite/Postgres connection pooling, and Vercel edge runtime.",
    learningObjectives: [
      "Execute safe Prisma database schema migrations in CI/CD pipelines",
      "Configure secret isolation, CORS policies, and rate-limiting middleware",
      "Deploy full-stack Next.js 15 application with zero downtime"
    ],
    topics: [
      { timeRange: "06:00 – 06:20 PM", title: "Server Actions Security & Validation", description: "Zod input schemas and CSRF protections." },
      { timeRange: "06:20 – 07:00 PM", title: "Live Production Deployment", description: "Step-by-step Vercel + Neon Postgres setup." },
      { timeRange: "07:00 – 07:30 PM", title: "Edge Performance Benchmarking", description: "Analyzing TTFB, cold starts, and cache revalidation." }
    ],
    teachingNotes: [
      "Prepare a demo repo with failing builds to demonstrate troubleshooting real deployment logs."
    ],
    resources: [
      { label: "Deployment Checklist & Configs", url: "https://example.com/docs/next15-deploy", type: "doc" }
    ],
    students: []
  },
  {
    id: "class-up-2",
    title: "Autonomous Agent Memory & Tool Calling",
    courseName: "Mastering Agentic AI & Autonomous Workflows",
    moduleName: "Module 9 · Masterclass",
    batch: "Batch AI-2026-A",
    status: "UPCOMING",
    statusLabel: "UPCOMING",
    dateLabel: "18 Aug 2026",
    timeRange: "05:00 PM – 06:30 PM",
    durationMinutes: 90,
    studentCount: 28,
    adminAssignedBy: "Academic Operations Team",
    meetingUrl: "https://meet.google.com/glarus-ai-memory",
    compensationAmount: 6000,
    description: "Deep dive into persistent conversational memory, semantic summarization buffers, and real-time external API integrations.",
    learningObjectives: [
      "Integrate vector memory stores with short-term semantic scratchpads",
      "Construct multi-parameter function calling pipelines with schema validation"
    ],
    topics: [
      { timeRange: "05:00 – 05:30 PM", title: "Memory Architecture Comparison", description: "Buffer vs Vector vs Graph memory structures." },
      { timeRange: "05:30 – 06:30 PM", title: "Live Coding: Tool Execution Sandbox", description: "Executing dynamic Python code safely inside sandboxed runtimes." }
    ],
    teachingNotes: [
      "Review sandboxing security best practices."
    ],
    resources: [
      { label: "Memory Graph Starter Code", url: "https://github.com/example/memory-graph", type: "github" }
    ],
    students: []
  },
  {
    id: "class-up-3",
    title: "Machine Learning Workshop: Cloud Model Deployment",
    courseName: "Applied Machine Learning & MLOps",
    moduleName: "Module 5 · Live Workshop",
    batch: "Batch AI-2026-B",
    status: "UPCOMING",
    statusLabel: "UPCOMING",
    dateLabel: "24 Aug 2026",
    timeRange: "06:30 PM – 08:30 PM",
    durationMinutes: 120,
    studentCount: 52,
    adminAssignedBy: "Chief Academic Reviewer",
    meetingUrl: "https://zoom.us/j/9948201923",
    compensationAmount: 7500,
    description: "Hands-on workshop covering cloud deployment pipelines, Docker containerization, and vLLM GPU inference clusters.",
    learningObjectives: [
      "Containerize open-source LLMs using Docker and CUDA runtimes",
      "Deploy high-throughput inference endpoints with vLLM on cloud GPUs"
    ],
    topics: [
      { timeRange: "06:30 – 07:15 PM", title: "vLLM & PagedAttention Internals", description: "KV-cache optimization and batching efficiency." },
      { timeRange: "07:15 – 08:30 PM", title: "Live GPU Cloud Deployment", description: "Deploying and stress-testing inference latency." }
    ],
    teachingNotes: [
      "Ensure cloud GPU quota is confirmed before session start."
    ],
    resources: [
      { label: "vLLM Deployment Script", url: "https://github.com/example/vllm-deploy", type: "github" }
    ],
    students: []
  },

  /* ─────────────────────────────────────────────
     3. COMPLETED CLASSES
     ───────────────────────────────────────────── */
  {
    id: "class-comp-1",
    title: "Introduction to Agentic ReAct Loops & Tools",
    courseName: "Mastering Agentic AI & Autonomous Workflows",
    moduleName: "Module 7 · Curriculum Lecture",
    batch: "Batch AI-2026-A",
    status: "COMPLETED",
    statusLabel: "COMPLETED",
    dateLabel: "05 Aug 2026",
    timeRange: "10:00 AM – 12:00 PM",
    durationMinutes: 120,
    studentCount: 45,
    attendanceRate: 95,
    averageRating: 4.9,
    adminAssignedBy: "Academic Operations Team",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    compensationAmount: 5000,
    description: "Completed foundation session on reasoning and acting loops, thought/action/observation cycle, and custom Python tool definitions.",
    learningObjectives: [
      "Understand the theoretical ReAct pattern and loop mechanics",
      "Build custom Python tools with type hints and docstring schemas",
      "Evaluate failure modes and infinite execution loop preventions"
    ],
    topics: [
      { timeRange: "10:00 – 10:45 AM", title: "ReAct Foundations & Loop Mechanics", description: "Theory and prompt engineering for structured reasoning." },
      { timeRange: "10:45 – 11:45 AM", title: "Live Coding: Tool Registry", description: "Implementing dynamic function dispatching." },
      { timeRange: "11:45 – 12:00 PM", title: "Session Q&A & Wrap-up", description: "Student interaction and assessment review." }
    ],
    teachingNotes: [
      "Session completed successfully with 95% student attendance rate."
    ],
    resources: [
      { label: "ReAct Reference Guide PDF", url: "https://example.com/docs/react-guide.pdf", type: "doc" }
    ],
    students: [
      {
        id: "stu-101",
        name: "Alex Rivera",
        email: "alex.rivera@example.com",
        attendanceStatus: "Attended",
        courseProgress: 88,
        assignmentSummary: "Graded (94/100)",
        lastActive: "Today",
        assignments: SAMPLE_ASSIGNMENTS_ALEX
      },
      {
        id: "stu-102",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        attendanceStatus: "Attended",
        courseProgress: 82,
        assignmentSummary: "Graded (85/100)",
        lastActive: "Today",
        assignments: SAMPLE_ASSIGNMENTS_RAHUL
      }
    ]
  },
  {
    id: "class-comp-2",
    title: "Vector Embeddings & Semantic Search Masterclass",
    courseName: "Mastering Agentic AI & Autonomous Workflows",
    moduleName: "Module 6 · Live Workshop",
    batch: "Batch AI-2026-A",
    status: "COMPLETED",
    statusLabel: "COMPLETED",
    dateLabel: "02 Aug 2026",
    timeRange: "06:00 PM – 08:00 PM",
    durationMinutes: 120,
    studentCount: 44,
    attendanceRate: 92,
    averageRating: 4.8,
    adminAssignedBy: "Academic Operations Team",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    compensationAmount: 6000,
    description: "Deep dive into dense vector embeddings, cosine distance vs dot product, HNSW index parameters, and hybrid sparse/dense retrieval.",
    learningObjectives: [
      "Generate high-dimensional embeddings using HuggingFace and OpenAI models",
      "Benchmark vector index lookup performance and recall tradeoffs"
    ],
    topics: [
      { timeRange: "06:00 – 06:45 PM", title: "Vector Mathematics & Distance Metrics", description: "Cosine, Euclidean, and Inner Product comparisons." },
      { timeRange: "06:45 – 08:00 PM", title: "Hands-on Hybrid Search with Qdrant", description: "Building multi-stage retrieval pipelines." }
    ],
    teachingNotes: [
      "Excellent session engagement. ₹6,000 compensation paid via direct deposit."
    ],
    resources: [
      { label: "Vector Search Lab Notebook", url: "https://github.com/example/vector-search-lab", type: "github" }
    ],
    students: []
  }
];

/* ═══════════════════════════════════════════════
   PROPS INTERFACE
   ═══════════════════════════════════════════════ */

interface InstructorLiveDashboardProps {
  instructorName?: string;
  onNavigateTab?: (tabName: string, filterOptions?: any) => void;
  onOpenCalendar?: () => void;
}

export function InstructorLiveDashboard({
  instructorName = "abc",
  onNavigateTab,
  onOpenCalendar,
}: InstructorLiveDashboardProps) {
  /* ── State ── */
  const [classes, setClasses] = useState<LiveClassItem[]>(INITIAL_LIVE_CLASSES);
  const [selectedAgendaClass, setSelectedAgendaClass] = useState<LiveClassItem | null>(null);
  const [selectedStudentsClass, setSelectedStudentsClass] = useState<LiveClassItem | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  const handleViewClassStudents = (classItem: LiveClassItem) => {
    let courseId = "c1";
    if (classItem.courseName.includes("Generative AI") || classItem.courseName.includes("Agentic")) courseId = "c2";
    else if (classItem.courseName.includes("Machine Learning")) courseId = "c3";

    if (onNavigateTab) {
      onNavigateTab("Students", {
        courseId,
        courseTitle: classItem.courseName,
        classId: classItem.id,
        className: classItem.title,
        batch: classItem.batch,
        returnTab: "Dashboard",
      });
    } else {
      setSelectedStudentsClass(classItem);
    }
  };

  const [activeStudentAssignments, setActiveStudentAssignments] = useState<{
    classItem: LiveClassItem;
    student: LiveClassStudent;
  } | null>(null);
  const [evaluatingAssignment, setEvaluatingAssignment] = useState<StudentAssignmentItem | null>(null);
  const [evalScore, setEvalScore] = useState<string>("");
  const [evalFeedback, setEvalFeedback] = useState<string>("");
  const [evalStatus, setEvalStatus] = useState<"Graded" | "Pending Review">("Graded");
  const [selectedDetailsClass, setSelectedDetailsClass] = useState<LiveClassItem | null>(null);
  const [recordingModalUrl, setRecordingModalUrl] = useState<{ title: string; url: string } | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /* ── Derived Categories ── */
  const todayClasses = useMemo(() => {
    return classes.filter(c => c.dateLabel === "Today" || c.status === "LIVE_NOW" || c.status === "STARTS_SOON");
  }, [classes]);

  const upcomingClasses = useMemo(() => {
    return classes.filter(c => c.status === "UPCOMING" && c.dateLabel !== "Today");
  }, [classes]);

  const completedClasses = useMemo(() => {
    return classes.filter(c => c.status === "COMPLETED");
  }, [classes]);

  /* ── Dynamic Time Greeting ── */
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  /* ── Handle Save Assignment Evaluation ── */
  const handleSaveEvaluation = () => {
    if (!activeStudentAssignments || !evaluatingAssignment) return;

    const parsedScore = evalScore ? parseInt(evalScore, 10) : evaluatingAssignment.score;

    setClasses(prev => prev.map(c => {
      if (c.id !== activeStudentAssignments.classItem.id) return c;
      return {
        ...c,
        students: c.students.map(s => {
          if (s.id !== activeStudentAssignments.student.id) return s;
          return {
            ...s,
            assignments: s.assignments.map(a => {
              if (a.id !== evaluatingAssignment.id) return a;
              return {
                ...a,
                score: parsedScore,
                status: evalStatus,
                feedback: evalFeedback || a.feedback,
              };
            })
          };
        })
      };
    }));

    if (activeStudentAssignments) {
      setActiveStudentAssignments({
        ...activeStudentAssignments,
        student: {
          ...activeStudentAssignments.student,
          assignments: activeStudentAssignments.student.assignments.map(a => {
            if (a.id !== evaluatingAssignment.id) return a;
            return {
              ...a,
              score: parsedScore,
              status: evalStatus,
              feedback: evalFeedback || a.feedback,
            };
          })
        }
      });
    }

    setEvaluatingAssignment(null);
    showToast(`Grade updated for ${activeStudentAssignments.student.name}`);
  };

  const openEvaluationModal = (assignment: StudentAssignmentItem) => {
    setEvaluatingAssignment(assignment);
    setEvalScore(assignment.score !== null ? assignment.score.toString() : "");
    setEvalFeedback(assignment.feedback || "");
    setEvalStatus(assignment.status === "Graded" ? "Graded" : "Graded");
  };

  /* ── Filtered Students inside Modal ── */
  const filteredStudents = useMemo(() => {
    if (!selectedStudentsClass) return [];
    if (!studentSearchQuery.trim()) return selectedStudentsClass.students;
    const q = studentSearchQuery.toLowerCase();
    return selectedStudentsClass.students.filter(
      s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [selectedStudentsClass, studentSearchQuery]);

  return (
    <div className="space-y-10 sm:space-y-12 text-slate-200 font-sans pb-24 max-w-[1380px] mx-auto animate-in fade-in duration-200">

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 right-6 z-[110] bg-[#121827]/95 border border-purple-500/30 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
         1. PREMIUM PAGE HEADER & INLINE METRICS
         ═══════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════
         1. PREMIUM PAGE HEADER & INLINE METRICS
         ═══════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              <span>{greetingText},{" "}</span>
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent font-extrabold">
                {instructorName}
              </span>
            </h1>
            <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Live Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal">
            Here&apos;s your live teaching schedule and student activity for today.
          </p>

          {/* Clean Inline Statistics */}
          <div className="flex items-center gap-3 pt-1 text-[11px] font-medium text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {todayClasses.length} Live Today
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {upcomingClasses.length} Upcoming
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {completedClasses.length} Completed
            </span>
          </div>
        </div>

        {/* Right Single Action: View Calendar */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() => {
              if (onOpenCalendar) onOpenCalendar();
              else setShowCalendarModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] hover:border-purple-500/30 transition-all cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>View Calendar</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
         2. PRIMARY SECTION — TODAY'S ONLINE CLASSES
         ═══════════════════════════════════════════════ */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-[28px] font-black tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Today&apos;s Online Classes
              </span>
            </h2>
            <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md font-mono">
              {todayClasses.length} Scheduled
            </span>
          </div>
        </div>

        {/* Vertical Hierarchy: LIVE NOW as Distinct Active Broadcast Surface, Upcoming as Neutral Clean Surface */}
        <div className="space-y-4">
          {todayClasses.map((item) => {
            const isLiveNow = item.status === "LIVE_NOW";

            return isLiveNow ? (
              /* ── 2A. LIVE NOW ACTIVE SESSION SURFACE ── */
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-red-950/40 via-[#131722] to-[#121622] border-2 border-red-500/50 shadow-2xl shadow-red-950/40 relative overflow-hidden flex flex-col justify-between gap-4 transition-all ring-1 ring-red-500/20"
              >
                {/* Active Live Top Indicator Stripe */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-rose-400 to-amber-500" />

                <div className="space-y-2">
                  {/* Top Row */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-[11px] font-extrabold text-red-300 bg-red-500/20 border border-red-500/40 px-3 py-1 rounded-full flex items-center gap-2 uppercase tracking-wider shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      LIVE NOW
                    </span>

                    {/* High-Contrast Time Badge */}
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white bg-red-950/60 border border-red-500/40 px-3 py-1 rounded-xl shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>{item.timeRange}</span>
                    </div>
                  </div>

                  {/* Title & Course Info (Course Name BIG, Topic/Module SMALL) */}
                  <div className="space-y-0.5 pt-0.5">
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                      {item.courseName || item.title}
                    </h3>
                    <p className="text-xs text-rose-200/90 font-medium">
                      <span className="text-rose-100 font-semibold">{item.title}</span>
                      {item.moduleName && <span className="text-rose-300/70"> · {item.moduleName}</span>}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <p className="text-xs text-slate-300 pt-0.5">
                    Today · <strong className="text-white font-semibold">{item.studentCount} Students</strong> · <span className="text-slate-400">Assigned by Admin</span> · <span className="text-slate-300 font-medium">₹{item.compensationAmount.toLocaleString()} compensation</span>
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-red-500/20">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAgendaClass(item)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] hover:border-white/[0.2] transition-colors cursor-pointer"
                    >
                      Agenda
                    </button>
                    <button
                      onClick={() => handleViewClassStudents(item)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] hover:border-white/[0.2] transition-colors cursor-pointer"
                    >
                      Students ({item.studentCount})
                    </button>
                    <button
                      onClick={() => setSelectedDetailsClass(item)}
                      className="px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  </div>

                  <div>
                    {item.meetingUrl && (
                      <a
                        href={item.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/35 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>START SESSION →</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ── 2B. SECOND TODAY CLASS (QUIETER NEUTRAL SURFACE) ── */
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0E131F] border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      UPCOMING TODAY
                    </span>

                    {/* High-Contrast Time Badge */}
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-100 bg-white/[0.08] border border-white/[0.14] px-3 py-1 rounded-xl shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.timeRange}</span>
                    </div>
                  </div>

                  {/* Title & Course Info (Course Name BIG, Topic/Module SMALL) */}
                  <div className="space-y-0.5 pt-0.5">
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {item.courseName || item.title}
                    </h3>
                    <p className="text-xs text-slate-300">
                      <span className="text-slate-200 font-medium">{item.title}</span>
                      {item.moduleName && <span className="text-slate-400"> · {item.moduleName}</span>}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 pt-0.5">
                    Today · <strong className="text-slate-200 font-semibold">{item.studentCount} Students</strong> · Assigned by Admin · ₹{item.compensationAmount.toLocaleString()} compensation
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAgendaClass(item)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                    >
                      Agenda
                    </button>
                    <button
                      onClick={() => handleViewClassStudents(item)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                    >
                      Students ({item.studentCount})
                    </button>
                    <button
                      onClick={() => setSelectedDetailsClass(item)}
                      className="px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-200 bg-white/[0.06] border border-white/[0.1] px-3 py-1 rounded-xl">
                    <span>Starts at</span>
                    <strong className="text-white">{item.timeRange.split("–")[0].trim()}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         3. SECTION — UPCOMING ONLINE CLASSES
         ═══════════════════════════════════════════════ */}
      <section className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-[28px] font-black tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Upcoming Online Classes
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Future live sessions assigned by academic operations.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab?.("Live Sessions")}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Upcoming</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Columns Grid for Upcoming */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingClasses.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-[#0E131F] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between gap-4 group shadow-sm"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5 uppercase text-[10px] tracking-wider bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    UPCOMING
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-200 bg-white/[0.06] border border-white/[0.1] px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.dateLabel}
                  </span>
                </div>

                {/* Course Name BIG, Topic SMALL */}
                <div className="space-y-0.5">
                  <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-purple-200 transition-colors line-clamp-1">
                    {item.courseName || item.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1">
                    <span className="text-slate-200 font-medium">{item.title}</span>
                    {item.moduleName && <span className="text-slate-400"> · {item.moduleName}</span>}
                  </p>
                </div>

                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-white font-mono">{item.timeRange.split("–")[0].trim()}</span> · <span className="text-slate-400">{item.dateLabel}</span> · <strong className="text-slate-200 font-medium">{item.studentCount} Students</strong>
                </p>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedAgendaClass(item)}
                    className="px-2.5 py-1 text-slate-400 hover:text-white text-[11px] font-medium rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    Agenda
                  </button>
                  <button
                    onClick={() => handleViewClassStudents(item)}
                    className="px-2.5 py-1 text-slate-400 hover:text-white text-[11px] font-medium rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    Students
                  </button>
                </div>

                <button
                  onClick={() => setSelectedDetailsClass(item)}
                  className="font-bold text-purple-300 hover:text-purple-200 text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         4. SECTION — RECENTLY COMPLETED CLASSES
         ═══════════════════════════════════════════════ */}
      <section className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-[28px] font-black tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Recently Completed Classes
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Completed live classes, student attendance, and teaching recordings.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab?.("Live Sessions", { viewMode: "RECORDINGS" })}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Completed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clean Horizontal Rows */}
        <div className="bg-[#0E131F] border border-white/[0.07] rounded-2xl divide-y divide-white/[0.04] overflow-hidden">
          {completedClasses.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    <Check className="w-3 h-3" />
                    COMPLETED
                  </span>
                  <span className="text-slate-600">·</span>
                  <h3 className="font-bold text-sm sm:text-base text-white">{item.courseName || item.title}</h3>
                </div>

                <p className="text-xs text-slate-300">
                  <span className="text-slate-200 font-medium">{item.title}</span>
                  {item.moduleName && <span className="text-slate-400"> · {item.moduleName}</span>}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                  <span>{item.dateLabel} · {item.durationMinutes} min</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-medium">{item.attendanceRate}% Attendance</span>
                  <span className="text-slate-600">•</span>
                  <span>{item.studentCount} Students</span>
                  {item.recordingUrl && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300 font-medium">● Recording Ready</span>
                    </>
                  )}
                </div>
              </div>

              {/* Row Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleViewClassStudents(item)}
                  className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white font-medium rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  Students
                </button>

                <button
                  onClick={() => setSelectedAgendaClass(item)}
                  className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white font-medium rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  Agenda
                </button>

                {item.recordingUrl ? (
                  <button
                    onClick={() => setRecordingModalUrl({ title: item.title, url: item.recordingUrl! })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] hover:border-white/[0.16] transition-colors cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-slate-300" />
                    <span>View Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedDetailsClass(item)}
                    className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white font-medium cursor-pointer"
                  >
                    View Details →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         5. SECONDARY SUMMARY: TASKS NEEDING ATTENTION
         ═══════════════════════════════════════════════ */}
      <section className="pt-2">
        <div className="px-5 py-3.5 rounded-2xl bg-[#0E131F] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-white text-xs flex items-center gap-2">
              <span className="p-1 rounded-md bg-white/[0.06] text-amber-400 border border-white/[0.08]">
                ⚡
              </span>
              Tasks Needing Attention
            </span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-slate-400 font-medium text-[11px]">4 pending actions</span>
          </div>

          <button
            onClick={() => onNavigateTab?.("Tasks")}
            className="text-xs text-slate-300 hover:text-white font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         MODAL 1: CLASS AGENDA MODAL
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedAgendaClass && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setSelectedAgendaClass(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121827] border border-white/[0.1] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative text-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedAgendaClass(null)}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 pb-4 border-b border-white/[0.08]">
                <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                  Class Agenda & Lesson Plan
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {selectedAgendaClass.title}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedAgendaClass.moduleName} · {selectedAgendaClass.timeRange}
                </p>
              </div>

              <div className="space-y-5 pt-4 text-xs">
                {/* 1. Learning Objectives */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Learning Objectives
                  </h4>
                  <ul className="space-y-1.5 bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06]">
                    {selectedAgendaClass.learningObjectives?.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Topics Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Session Timeline & Topics
                  </h4>
                  <div className="space-y-2">
                    {selectedAgendaClass.topics?.map((topic, i) => (
                      <div key={i} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] flex items-start gap-3">
                        <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 shrink-0">
                          {topic.timeRange}
                        </span>
                        <div>
                          <p className="font-semibold text-white text-xs">{topic.title}</p>
                          {topic.description && (
                            <p className="text-slate-400 text-[11px] mt-0.5">{topic.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Teaching Notes & Key Instructions */}
                {selectedAgendaClass.teachingNotes && selectedAgendaClass.teachingNotes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Teaching Notes & Admin Instructions
                    </h4>
                    <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl space-y-1 text-amber-200/90 text-[11px]">
                      {selectedAgendaClass.teachingNotes.map((note, i) => (
                        <p key={i}>• {note}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Resources & Links */}
                {selectedAgendaClass.resources && selectedAgendaClass.resources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      Session Resources & Materials
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgendaClass.resources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] rounded-xl text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-purple-400" />
                          <span>{res.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const cl = selectedAgendaClass;
                    setSelectedAgendaClass(null);
                    handleViewClassStudents(cl);
                  }}
                  className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  View Enrolled Students ({selectedAgendaClass.studentCount}) →
                </button>

                {selectedAgendaClass.status === "LIVE_NOW" && selectedAgendaClass.meetingUrl ? (
                  <a
                    href={selectedAgendaClass.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Start Session</span>
                  </a>
                ) : (
                  <button
                    onClick={() => setSelectedAgendaClass(null)}
                    className="px-4 py-2 bg-white/[0.06] text-white rounded-xl text-xs font-semibold"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
         MODAL 2: CLASS-SPECIFIC STUDENTS MODAL
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedStudentsClass && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setSelectedStudentsClass(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121827] border border-white/[0.1] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative text-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedStudentsClass(null)}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 pb-4 border-b border-white/[0.08]">
                <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                  Class Students & Cohort
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedStudentsClass.title}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedStudentsClass.courseName} · {selectedStudentsClass.studentCount} Students Enrolled
                </p>
              </div>

              {/* Search */}
              <div className="py-3.5 flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search enrolled students..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-purple-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#161E2E]/60">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                        <th className="p-3.5">Student</th>
                        <th className="p-3.5">Attendance</th>
                        <th className="p-3.5">Progress</th>
                        <th className="p-3.5">Assignments</th>
                        <th className="p-3.5 text-right">Assignment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredStudents.map((stu) => (
                        <tr key={stu.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3.5">
                            <p className="font-semibold text-white text-xs">{stu.name}</p>
                            <p className="text-[11px] text-slate-400">{stu.email}</p>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                stu.attendanceStatus === "Present"
                                  ? "bg-red-500/10 text-red-300 border border-red-500/20 font-semibold"
                                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              }`}
                            >
                              {stu.attendanceStatus}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-slate-300">{stu.courseProgress}%</span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-slate-400">{stu.assignmentSummary}</span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setActiveStudentAssignments({
                                  classItem: selectedStudentsClass,
                                  student: stu,
                                });
                              }}
                              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Assignments ({stu.assignments?.length || 0})
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
         MODAL 3: IN-CONTEXT STUDENT ASSIGNMENTS DRAWER
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeStudentAssignments && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setActiveStudentAssignments(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121827] border border-white/[0.1] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative text-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveStudentAssignments(null)}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 pb-4 border-b border-white/[0.08]">
                <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                  Student Assignments Review
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {activeStudentAssignments.student.name}
                </h2>
                <p className="text-xs text-slate-400">
                  {activeStudentAssignments.student.email} · {activeStudentAssignments.classItem.courseName}
                </p>
              </div>

              <div className="space-y-3.5 py-4">
                {activeStudentAssignments.student.assignments?.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-4 bg-[#161E2E] border border-white/[0.08] rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase text-slate-300">
                        {asg.status}
                      </span>
                      {asg.score !== null ? (
                        <span className="font-bold text-emerald-400">{asg.score} / {asg.totalMarks}</span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-white text-sm">{asg.title}</h4>
                    {asg.submittedText && (
                      <p className="text-slate-400 text-[11px]">{asg.submittedText}</p>
                    )}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => openEvaluationModal(asg)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        {asg.status === "Graded" ? "Edit Grade" : "Evaluate →"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
         MODAL 4: EVALUATE / GRADE MODAL
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {evaluatingAssignment && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setEvaluatingAssignment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121827] border border-white/[0.1] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative text-slate-200 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-base font-bold text-white">Evaluate Submission</h3>
                <button onClick={() => setEvaluatingAssignment(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Score (out of {evaluatingAssignment.totalMarks})</label>
                  <input
                    type="number"
                    value={evalScore}
                    onChange={(e) => setEvalScore(e.target.value)}
                    className="w-full bg-[#161E2E] border border-white/[0.1] rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Instructor Feedback</label>
                  <textarea
                    rows={3}
                    value={evalFeedback}
                    onChange={(e) => setEvalFeedback(e.target.value)}
                    className="w-full bg-[#161E2E] border border-white/[0.1] rounded-xl p-2.5 text-white resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button onClick={() => setEvaluatingAssignment(null)} className="px-4 py-2 text-slate-400 hover:text-white">
                    Cancel
                  </button>
                  <button onClick={handleSaveEvaluation} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl">
                    Save Grade
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
         MODAL 5: SESSION DETAILS MODAL
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedDetailsClass && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setSelectedDetailsClass(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121827] border border-white/[0.1] w-full max-w-xl rounded-2xl shadow-2xl p-6 relative text-slate-200 text-xs space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase">Session Specifications</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedDetailsClass.title}</h3>
                </div>
                <button onClick={() => setSelectedDetailsClass(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#161E2E] p-4 rounded-xl space-y-2 border border-white/[0.06]">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Date & Slot</span>
                  <span className="text-white font-medium">{selectedDetailsClass.dateLabel} ({selectedDetailsClass.timeRange})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Enrolled Students</span>
                  <span className="text-white font-medium">{selectedDetailsClass.studentCount} Students</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Compensation</span>
                  <span className="font-semibold text-emerald-400">₹{selectedDetailsClass.compensationAmount.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed">{selectedDetailsClass.description}</p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    const cl = selectedDetailsClass;
                    setSelectedDetailsClass(null);
                    setSelectedAgendaClass(cl);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Open Agenda →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
         MODAL 6: RECORDING VIDEO PLAYER MODAL
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {recordingModalUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setRecordingModalUrl(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121827] border border-white/[0.1] w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative text-slate-200 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-base font-bold text-white">{recordingModalUrl.title}</h3>
                <button onClick={() => setRecordingModalUrl(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/[0.08]">
                <video src={recordingModalUrl.url} controls autoPlay className="w-full h-full object-contain" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
         MODAL 7: CALENDAR MODAL
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCalendarModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setShowCalendarModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              className="bg-[#121827] border border-white/[0.1] w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative text-slate-200 text-xs space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Live Teaching Schedule</h3>
                  <p className="text-slate-400">All assigned classes and workshops</p>
                </div>
                <button onClick={() => setShowCalendarModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {classes.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-[#161E2E] border border-white/[0.06] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-purple-400">{c.dateLabel} · {c.timeRange}</span>
                      <p className="font-semibold text-white text-xs mt-0.5">{c.title}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCalendarModal(false);
                        setSelectedAgendaClass(c);
                      }}
                      className="px-3 py-1.5 bg-white/[0.04] text-slate-300 rounded-lg text-xs font-semibold"
                    >
                      Agenda →
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
