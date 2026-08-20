"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  BarChart2,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Code,
  Upload,
  Link2,
  HelpCircle,
  Folder,
  Calendar,
  Layers,
  Award,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  Send,
  FileDown,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  LayoutGrid,
  List,
  Percent,
  CheckSquare,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

export interface InstructorAssignmentsFilter {
  courseId?: string;
  courseTitle?: string;
  studentEmail?: string;
  studentName?: string;
  assignmentId?: string;
  assignmentTitle?: string;
  className?: string;
  batch?: string;
  returnTab?: string;
}

interface InstructorAssignmentsViewProps {
  initialFilter?: InstructorAssignmentsFilter | null;
  onClearFilter?: () => void;
  onBack?: () => void;
}

export interface AssignmentItem {
  id: string;
  title: string;
  course: string;
  module: string;
  dueDate: string;
  submissionsCount: number;
  totalStudents: number;
  pendingReviewCount: number;
  averageScore: number;
  status: "Draft" | "Published" | "Closed" | "Archived";
  type: "File Upload" | "Text Answer" | "Coding Assignment" | "Project Submission" | "MCQ Quiz" | "External Link";
  totalMarks: number;
}

export interface StudentSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  submissionTime: string;
  score: number | null;
  status: "Submitted" | "Pending Review" | "Graded" | "Late";
  submittedText?: string;
  submittedFileName?: string;
  rubricScores?: Record<string, number>;
  feedback?: string;
}

/* ═══════════════════════════════════════════════
   INITIAL DATASET
   ═══════════════════════════════════════════════ */

const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: "asg-genai-1",
    title: "Session 01: PyTorch Attention & Transformer Math Implementation",
    course: "Generative AI & LLM Systems",
    module: "Module 1: Transformer Foundations",
    dueDate: "2026-08-07 23:59",
    submissionsCount: 40,
    totalStudents: 42,
    pendingReviewCount: 2,
    averageScore: 91.5,
    status: "Published",
    type: "Coding Assignment",
    totalMarks: 100,
  },
  {
    id: "asg-genai-2",
    title: "Session 02: Byte-Pair Encoding (BPE) & Autoregressive Sampling",
    course: "Generative AI & LLM Systems",
    module: "Module 2: Tokenization & Sampling",
    dueDate: "2026-08-11 23:59",
    submissionsCount: 39,
    totalStudents: 42,
    pendingReviewCount: 1,
    averageScore: 89.0,
    status: "Published",
    type: "Coding Assignment",
    totalMarks: 100,
  },
  {
    id: "asg-genai-3",
    title: "Session 03: Prompt Engineering, Structured JSON & DSPy Optimizer",
    course: "Generative AI & LLM Systems",
    module: "Module 3: Advanced Prompting",
    dueDate: "2026-08-16 23:59",
    submissionsCount: 38,
    totalStudents: 42,
    pendingReviewCount: 3,
    averageScore: 86.4,
    status: "Published",
    type: "Coding Assignment",
    totalMarks: 100,
  },
  {
    id: "asg-genai-4",
    title: "Session 04: Production RAG & Vector Database Hybrid Retrieval",
    course: "Generative AI & LLM Systems",
    module: "Module 4: RAG & Vector DBs",
    dueDate: "2026-08-22 23:59",
    submissionsCount: 35,
    totalStudents: 42,
    pendingReviewCount: 5,
    averageScore: 88.0,
    status: "Published",
    type: "Coding Assignment",
    totalMarks: 100,
  },
  {
    id: "asg-genai-5",
    title: "Session 05: Autonomous AI Agent Architecture & CrewAI Tool Execution",
    course: "Generative AI & LLM Systems",
    module: "Module 5: Autonomous Agents",
    dueDate: "2026-08-27 23:59",
    submissionsCount: 28,
    totalStudents: 42,
    pendingReviewCount: 4,
    averageScore: 85.0,
    status: "Published",
    type: "Coding Assignment",
    totalMarks: 100,
  },
  {
    id: "asg-1",
    title: "Assignment 2: Multi-Agent Orchestration with LangGraph",
    course: "Mastering Agentic AI & Autonomous Workflows",
    module: "Module 3: Complex Multi-Agent Frameworks",
    dueDate: "2026-08-15 23:59",
    submissionsCount: 38,
    totalStudents: 45,
    pendingReviewCount: 4,
    averageScore: 84.5,
    status: "Published",
    type: "Coding Assignment",
    totalMarks: 100,
  },
  {
    id: "asg-2",
    title: "Assignment 1: ReAct Agent Loop Implementation",
    course: "Mastering Agentic AI & Autonomous Workflows",
    module: "Module 2: Reasoning Loops",
    dueDate: "2026-08-01 23:59",
    submissionsCount: 44,
    totalStudents: 45,
    pendingReviewCount: 0,
    averageScore: 88.2,
    status: "Published",
    type: "Coding Assignment",
    totalMarks: 100,
  },
  {
    id: "asg-3",
    title: "Full-Stack E-Commerce API Architecture",
    course: "Full-Stack Web Development Bootcamp",
    module: "Module 4: Next.js Server Actions & Prisma",
    dueDate: "2026-08-20 23:59",
    submissionsCount: 12,
    totalStudents: 50,
    pendingReviewCount: 8,
    averageScore: 79.0,
    status: "Published",
    type: "Project Submission",
    totalMarks: 100,
  },
  {
    id: "asg-aiauto-1",
    title: "Session 01: Autonomous Webhooks & Python Tool Calling",
    course: "AI Automation Engineer",
    module: "Module 1: Webhook Infrastructure",
    dueDate: "2026-08-10 23:59",
    submissionsCount: 34,
    totalStudents: 35,
    pendingReviewCount: 2,
    averageScore: 92.0,
    status: "Published",
    type: "Coding Assignment",
    totalMarks: 100,
  },
  {
    id: "asg-mlops-1",
    title: "Session 03: PyTorch FastAPI Dockerization & Cloud Deployment",
    course: "Applied Machine Learning & MLOps",
    module: "Module 3: Containerization & Cloud",
    dueDate: "2026-08-24 23:59",
    submissionsCount: 20,
    totalStudents: 28,
    pendingReviewCount: 6,
    averageScore: 87.5,
    status: "Published",
    type: "Project Submission",
    totalMarks: 100,
  },
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: "sub-alex",
    studentName: "Alex Rivera",
    studentEmail: "alex.rivera@example.com",
    submissionTime: "Today at 08:30 AM",
    score: null,
    status: "Pending Review",
    submittedText: "Created full autonomous code reviewer agent with GitHub webhook integration and LangGraph state persistence. Built 3 agent nodes: Code Analyzer, Vulnerability Scanner, and Markdown Report Synthesizer.",
    submittedFileName: "alex_rivera_capstone_agent.zip",
  },
  {
    id: "sub-1",
    studentName: "Rahul Sharma",
    studentEmail: "rahul.sharma@example.com",
    submissionTime: "2026-08-06 09:30",
    score: null,
    status: "Pending Review",
    submittedText: "Implemented multi-agent delegation using LangChain and FastAPI backend. Implemented tool use and persistent state.",
    submittedFileName: "langgraph_agent_rahul.zip",
  },
  {
    id: "sub-2",
    studentName: "Priya Patel",
    studentEmail: "priya.patel@example.com",
    submissionTime: "2026-08-05 18:45",
    score: 95,
    status: "Graded",
    submittedText: "All multi-agent routing tests passed with 100% coverage. Attached Python repository.",
    submittedFileName: "agent_orchestration_priya.zip",
    feedback: "Outstanding implementation of memory loops and error recovery!",
  },
  {
    id: "sub-3",
    studentName: "Aman Verma",
    studentEmail: "aman.v@example.com",
    submissionTime: "2026-08-06 10:15",
    score: null,
    status: "Pending Review",
    submittedText: "Built 3 autonomous agents with tool calling and custom JSON parsers.",
    submittedFileName: "agent_submission_aman.py",
  },
  {
    id: "sub-4",
    studentName: "Sneha Gupta",
    studentEmail: "sneha.g@example.com",
    submissionTime: "2026-08-04 14:20",
    score: 88,
    status: "Graded",
    submittedText: "Completed LangGraph multi-agent assignment with SQLite state checkpointing.",
    submittedFileName: "sneha_langgraph.zip",
    feedback: "Great structure. Try adding fallback retries for API rate limits.",
  },
  {
    id: "sub-5",
    studentName: "Vikram Malhotra",
    studentEmail: "vikram.m@example.com",
    submissionTime: "2026-08-06 11:50",
    score: null,
    status: "Pending Review",
    submittedText: "Created full agentic pipeline with Redis cache and tool calling validation.",
    submittedFileName: "vikram_agent_pipeline.zip",
  },
  {
    id: "sub-6",
    studentName: "Ananya Deshmukh",
    studentEmail: "ananya.d@example.com",
    submissionTime: "2026-08-05 20:10",
    score: 96,
    status: "Graded",
    submittedText: "Implemented hybrid vector search with ChromaDB and BM25 re-ranking.",
    submittedFileName: "ananya_rag_hybrid.zip",
    feedback: "Exceptional speed optimizations on the cosine similarity calculation!",
  },
  {
    id: "sub-7",
    studentName: "Carlos Mendez",
    studentEmail: "carlos.m@example.com",
    submissionTime: "2026-08-05 22:30",
    score: 92,
    status: "Graded",
    submittedText: "Full Docker Compose setup with Redis memory store and OpenAI agent executor.",
    submittedFileName: "carlos_agent_swarm.zip",
    feedback: "Clean Dockerfile configuration and documentation.",
  },
  {
    id: "sub-8",
    studentName: "Divya Nair",
    studentEmail: "divya.nair@example.com",
    submissionTime: "2026-08-06 08:45",
    score: 89,
    status: "Graded",
    submittedText: "Built multi-turn conversational loop with memory compression buffer.",
    submittedFileName: "divya_memory_agent.zip",
  },
  {
    id: "sub-9",
    studentName: "Ethan Wright",
    studentEmail: "ethan.w@example.com",
    submissionTime: "2026-08-05 16:20",
    score: 94,
    status: "Graded",
    submittedText: "PyTorch custom self-attention layer benchmarked on synthetic sequence dataset.",
    submittedFileName: "ethan_attention_layer.py",
  },
  {
    id: "sub-10",
    studentName: "Fatima Zahra",
    studentEmail: "fatima.z@example.com",
    submissionTime: "2026-08-06 09:10",
    score: 91,
    status: "Graded",
    submittedText: "Deployed FastAPI endpoint with streaming SSE response and token usage telemetry.",
    submittedFileName: "fatima_sse_api.zip",
  },
  {
    id: "sub-11",
    studentName: "Gaurav Joshi",
    studentEmail: "gaurav.j@example.com",
    submissionTime: "2026-08-04 19:40",
    score: 85,
    status: "Graded",
    submittedText: "Structured JSON output extraction using Pydantic schemas and schema repair.",
    submittedFileName: "gaurav_json_extractor.zip",
  },
  {
    id: "sub-12",
    studentName: "Hannah Abbott",
    studentEmail: "hannah.a@example.com",
    submissionTime: "2026-08-05 17:15",
    score: 97,
    status: "Graded",
    submittedText: "End-to-end evaluation suite using Ragas metrics and semantic similarity scoring.",
    submittedFileName: "hannah_ragas_eval.zip",
    feedback: "Thorough testing suite with comprehensive edge cases.",
  },
  {
    id: "sub-13",
    studentName: "Ishaan Kapoor",
    studentEmail: "ishaan.k@example.com",
    submissionTime: "2026-08-04 21:05",
    score: 84,
    status: "Graded",
    submittedText: "CrewAI 4-agent delegation pipeline with role definitions and hierarchical task manager.",
    submittedFileName: "ishaan_crewai_pipeline.zip",
  },
  {
    id: "sub-14",
    studentName: "Jessica Chen",
    studentEmail: "jessica.c@example.com",
    submissionTime: "2026-08-05 14:00",
    score: 98,
    status: "Graded",
    submittedText: "LoRA fine-tuning script on 8k context window with flash attention 2 integration.",
    submittedFileName: "jessica_lora_train.py",
    feedback: "Flawless code architecture and GPU memory management!",
  },
  {
    id: "sub-15",
    studentName: "Kabir Mehta",
    studentEmail: "kabir.m@example.com",
    submissionTime: "2026-08-04 15:30",
    score: 82,
    status: "Graded",
    submittedText: "Semantic cache layer using Redis vector similarity and TTL expiration.",
    submittedFileName: "kabir_semantic_cache.zip",
  },
  {
    id: "sub-16",
    studentName: "Layla Hassan",
    studentEmail: "layla.h@example.com",
    submissionTime: "2026-08-05 11:20",
    score: 93,
    status: "Graded",
    submittedText: "Document chunking comparison (RecursiveCharacter vs Semantic Chunking) with Pinecone.",
    submittedFileName: "layla_chunking_bench.ipynb",
  },
  {
    id: "sub-17",
    studentName: "Marcus Aurelius Kim",
    studentEmail: "marcus.k@example.com",
    submissionTime: "2026-08-05 09:40",
    score: 90,
    status: "Graded",
    submittedText: "LangGraph cyclical graphs with human-in-the-loop breakpoint interrupt.",
    submittedFileName: "marcus_hitl_agent.zip",
  },
  {
    id: "sub-18",
    studentName: "Neha Reddy",
    studentEmail: "neha.r@example.com",
    submissionTime: "2026-08-05 19:55",
    score: 95,
    status: "Graded",
    submittedText: "DSPy Bayesian Signature Optimizer pipeline on sentiment classification benchmark.",
    submittedFileName: "neha_dspy_pipeline.py",
  },
  {
    id: "sub-19",
    studentName: "Oliver Smith",
    studentEmail: "oliver.s@example.com",
    submissionTime: "2026-08-04 18:10",
    score: 87,
    status: "Graded",
    submittedText: "Automated GitHub PR reviewer agent with comment posting webhook.",
    submittedFileName: "oliver_pr_reviewer.zip",
  },
  {
    id: "sub-20",
    studentName: "Pooja Hegde",
    studentEmail: "pooja.h@example.com",
    submissionTime: "2026-08-05 13:25",
    score: 91,
    status: "Graded",
    submittedText: "Multi-tenant vector search with namespace isolation in Qdrant.",
    submittedFileName: "pooja_qdrant_multitenant.zip",
  },
  {
    id: "sub-21",
    studentName: "Quentin Tarantino Jr",
    studentEmail: "quentin.t@example.com",
    submissionTime: "2026-08-04 22:40",
    score: 89,
    status: "Graded",
    submittedText: "Agent script generation system with automated storyboard parser.",
    submittedFileName: "quentin_story_agent.zip",
  },
  {
    id: "sub-22",
    studentName: "Rohan Mukherjee",
    studentEmail: "rohan.m@example.com",
    submissionTime: "2026-08-05 10:15",
    score: 93,
    status: "Graded",
    submittedText: "Custom tool binding with dynamic OpenAPI 3.0 schema inspection.",
    submittedFileName: "rohan_openapi_tools.py",
  },
  {
    id: "sub-23",
    studentName: "Sara Al-Mansoor",
    studentEmail: "sara.m@example.com",
    submissionTime: "2026-08-05 15:45",
    score: 96,
    status: "Graded",
    submittedText: "Self-correcting SQL generation agent with validation loop against PostgreSQL.",
    submittedFileName: "sara_sql_agent.zip",
  },
  {
    id: "sub-24",
    studentName: "Tanvi Agarwal",
    studentEmail: "tanvi.a@example.com",
    submissionTime: "2026-08-04 17:30",
    score: 88,
    status: "Graded",
    submittedText: "Evaluation leaderboard for embedding models on Hindi-English code-mixed dataset.",
    submittedFileName: "tanvi_embedding_eval.zip",
  },
  {
    id: "sub-25",
    studentName: "Umar Farooq",
    studentEmail: "umar.f@example.com",
    submissionTime: "2026-08-04 12:15",
    score: 83,
    status: "Graded",
    submittedText: "Asynchronous task queue with Celery and Redis for long-running LLM batch generation.",
    submittedFileName: "umar_celery_llm.zip",
  },
  {
    id: "sub-26",
    studentName: "Varun Dhawan",
    studentEmail: "varun.d@example.com",
    submissionTime: "2026-08-05 08:50",
    score: 90,
    status: "Graded",
    submittedText: "Vision-Language agent with multimodal OCR and bounding box grounding.",
    submittedFileName: "varun_vlm_agent.zip",
  },
  {
    id: "sub-27",
    studentName: "Wendy Wu",
    studentEmail: "wendy.w@example.com",
    submissionTime: "2026-08-05 16:40",
    score: 97,
    status: "Graded",
    submittedText: "Knowledge Graph RAG with Neo4j entity extraction and Cypher queries.",
    submittedFileName: "wendy_graphrag.zip",
  },
  {
    id: "sub-28",
    studentName: "Xavier Dupont",
    studentEmail: "xavier.d@example.com",
    submissionTime: "2026-08-04 16:10",
    score: 86,
    status: "Graded",
    submittedText: "Quantized GGUF model loader using llama.cpp with Python bindings.",
    submittedFileName: "xavier_llamacpp_eval.zip",
  },
  {
    id: "sub-29",
    studentName: "Yash Singhania",
    studentEmail: "yash.s@example.com",
    submissionTime: "2026-08-05 12:00",
    score: 92,
    status: "Graded",
    submittedText: "ReAct reasoning loop with step-by-step scratchpad visualization UI.",
    submittedFileName: "yash_react_scratchpad.zip",
  },
  {
    id: "sub-30",
    studentName: "Zara Larsson",
    studentEmail: "zara.l@example.com",
    submissionTime: "2026-08-05 17:50",
    score: 94,
    status: "Graded",
    submittedText: "Agent safety guardrails using LlamaGuard and regex pattern redacting.",
    submittedFileName: "zara_guardrails.zip",
  },
  {
    id: "sub-31",
    studentName: "Aarav Pillai",
    studentEmail: "aarav.p@example.com",
    submissionTime: "2026-08-04 14:00",
    score: 90,
    status: "Graded",
    submittedText: "Multi-agent debate consensus protocol for mathematical reasoning verification.",
    submittedFileName: "aarav_agent_debate.zip",
  },
  {
    id: "sub-32",
    studentName: "Bhavna Chawla",
    studentEmail: "bhavna.c@example.com",
    submissionTime: "2026-08-05 11:00",
    score: 88,
    status: "Graded",
    submittedText: "Audio transcription pipeline with Whisper and summarized key-point extractor.",
    submittedFileName: "bhavna_whisper_agent.zip",
  },
  {
    id: "sub-33",
    studentName: "Chirag Paswan",
    studentEmail: "chirag.p@example.com",
    submissionTime: "2026-08-04 11:30",
    score: 85,
    status: "Graded",
    submittedText: "Function calling agent connecting Google Calendar API and Notion databases.",
    submittedFileName: "chirag_calendar_agent.zip",
  },
  {
    id: "sub-34",
    studentName: "David Miller",
    studentEmail: "david.m@example.com",
    submissionTime: "2026-08-05 14:45",
    score: 91,
    status: "Graded",
    submittedText: "Production load testing with Locust on streaming LLM completion endpoints.",
    submittedFileName: "david_locust_benchmarks.zip",
  },
];

const PRESET_FEEDBACKS = [
  "Outstanding code quality and clear architecture! Clean modular boundaries.",
  "Well implemented logic! Handled edge cases and error recovery gracefully.",
  "Good progress. Recommend adding input validation and unit tests for tool calls.",
  "Solid attempt. Please review the rubric guidelines on state persistence.",
  "Late submission received. Overall good solution with comprehensive documentation."
];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export function InstructorAssignmentsView({
  initialFilter,
  onClearFilter,
  onBack,
}: InstructorAssignmentsViewProps = {}) {
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "due_date" | "pending" | "score">("pending");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  /* Modal States */
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedAssignmentDetails, setSelectedAssignmentDetails] = useState<AssignmentItem | null>(null);
  const [submissionsList, setSubmissionsList] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState<"ALL" | "PENDING" | "GRADED">("ALL");

  const [selectedSubmissionToReview, setSelectedSubmissionToReview] = useState<StudentSubmission | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(88);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleViewAllCourseAssignments = (courseName: string) => {
    setSelectedAssignmentDetails(null);
    setSelectedSubmissionToReview(null);
    setSearchQuery("");
    setSelectedStatusFilter("All");

    // Match exact or substring course from dataset
    const matchCourse = assignments.find(
      (a) =>
        a.course.toLowerCase() === courseName.toLowerCase() ||
        a.course.toLowerCase().includes(courseName.toLowerCase()) ||
        courseName.toLowerCase().includes(a.course.toLowerCase())
    );

    const targetCourse = matchCourse ? matchCourse.course : courseName;
    setSelectedCourseFilter(targetCourse);
    showToast(`Showing all assessments for "${targetCourse}"`);
  };

  const courseSiblingAssignments = useMemo(() => {
    if (!selectedAssignmentDetails) return [];
    return assignments.filter((a) => a.course === selectedAssignmentDetails.course);
  }, [selectedAssignmentDetails, assignments]);

  /* ── Deep Filter from Navigation (e.g. from Students Page "Review" or Session Timeline "Assignments") ── */
  useEffect(() => {
    if (!initialFilter) return;

    // 1. Sync Course filter if provided
    let matchedCourse = "";
    if (initialFilter.courseTitle) {
      const match = assignments.find(
        (a) =>
          a.course.toLowerCase() === initialFilter.courseTitle!.toLowerCase() ||
          a.course.toLowerCase().includes(initialFilter.courseTitle!.toLowerCase()) ||
          initialFilter.courseTitle!.toLowerCase().includes(a.course.toLowerCase())
      );
      if (match) {
        matchedCourse = match.course;
        setSelectedCourseFilter(match.course);
      } else {
        matchedCourse = initialFilter.courseTitle;
        setSelectedCourseFilter(initialFilter.courseTitle);
      }
    }

    // 2. If student review requested, locate their assignment and auto-open evaluation dialog!
    if (initialFilter.studentName || initialFilter.studentEmail) {
      const studentName = initialFilter.studentName || "Alex Rivera";
      const studentEmail = initialFilter.studentEmail || "alex.rivera@example.com";

      let targetSub = submissionsList.find(
        (s) =>
          s.studentName.toLowerCase().includes(studentName.toLowerCase()) ||
          (initialFilter.studentEmail && s.studentEmail.toLowerCase() === initialFilter.studentEmail.toLowerCase())
      );

      if (!targetSub) {
        targetSub = {
          id: `sub-${Date.now()}`,
          studentName: studentName,
          studentEmail: studentEmail,
          submissionTime: "Today at 08:30 AM",
          score: null,
          status: "Pending Review",
          submittedText: "Created full autonomous code reviewer agent with GitHub webhook integration and LangGraph state persistence.",
          submittedFileName: `${studentName.toLowerCase().replace(/\s+/g, "_")}_submission.zip`,
        };
        setSubmissionsList((prev) => {
          if (prev.some((s) => s.studentEmail.toLowerCase() === studentEmail.toLowerCase())) {
            return prev;
          }
          return [targetSub!, ...prev];
        });
      }

      // Find matching assignment
      let targetAsg = assignments.find((a) => {
        if (initialFilter.assignmentTitle && a.title.toLowerCase().includes(initialFilter.assignmentTitle.toLowerCase())) return true;
        if (initialFilter.courseTitle && a.course.toLowerCase().includes(initialFilter.courseTitle.toLowerCase())) return true;
        return false;
      }) || assignments[0];

      setSelectedAssignmentDetails(targetAsg);
      setSelectedSubmissionToReview(targetSub);
      setReviewScore(targetSub.score || 88);
      setReviewFeedback(targetSub.feedback || "");
      showToast(`Opened assignment submission for ${studentName}`);
    } else if (initialFilter.assignmentTitle || initialFilter.className) {
      // 3. Opened from Live Session Timeline: open assignment & student submissions for that specific class!
      const targetQuery = (initialFilter.assignmentTitle || initialFilter.className || "").toLowerCase();
      let targetAsg = assignments.find((a) => {
        const titleMatch = a.title.toLowerCase().includes(targetQuery) || targetQuery.includes(a.title.toLowerCase());
        const courseMatch = !matchedCourse || a.course.toLowerCase() === matchedCourse.toLowerCase();
        return titleMatch && courseMatch;
      });

      if (!targetAsg) {
        targetAsg = assignments.find((a) => a.course.toLowerCase() === (matchedCourse || "").toLowerCase()) || assignments[0];
      }

      if (targetAsg) {
        setSelectedAssignmentDetails(targetAsg);
        showToast(`Viewing student submissions for "${targetAsg.title}"`);
      }
    }
  }, [initialFilter, assignments]);

  /* Wizard State */
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    title: "",
    description: "",
    course: "Mastering Agentic AI & Autonomous Workflows",
    module: "Module 3: Complex Multi-Agent Frameworks",
    difficulty: "Medium",
    totalMarks: 100,
    passingMarks: 40,
    estimatedDuration: 120,
    type: "Coding Assignment" as AssignmentItem["type"],
    dueDate: "2026-08-25T23:59",
    allowLate: true,
    latePenalty: 10,
    maxAttempts: 3,
    allowResubmission: true,
    assignmentScope: "Individual",
    evaluationMode: "Manual Review",
    resources: [
      { name: "Starter_Code_Template.zip", type: "zip" },
      { name: "Assignment_Guidelines.pdf", type: "pdf" }
    ],
    rubric: [
      { id: "r1", title: "Code Quality & Clean Architecture", marks: 25, weight: 25, description: "Clean code structure, modular design, and proper naming conventions." },
      { id: "r2", title: "Documentation & Comments", marks: 15, weight: 15, description: "Detailed README documentation and inline code comments." },
      { id: "r3", title: "Logic & Execution Correctness", marks: 40, weight: 40, description: "All test cases pass successfully without runtime errors." },
      { id: "r4", title: "Creativity & Advanced Features", marks: 20, weight: 20, description: "Bonus features, error handling, or performance optimizations." }
    ]
  });

  /* Calculate Stats */
  const totalAssignments = assignments.length;
  const publishedCount = assignments.filter(a => a.status === "Published").length;
  const draftCount = assignments.filter(a => a.status === "Draft").length;
  const pendingReviewCount = assignments.reduce((sum, a) => sum + a.pendingReviewCount, 0);
  const closedCount = assignments.filter(a => a.status === "Closed").length;
  
  const totalSubmissionsSum = assignments.reduce((sum, a) => sum + a.submissionsCount, 0);
  const totalStudentsSum = assignments.reduce((sum, a) => sum + a.totalStudents, 0);
  const globalSubmissionRate = totalStudentsSum > 0 ? Math.round((totalSubmissionsSum / totalStudentsSum) * 100) : 0;

  const avgScoreAll = assignments.filter(a => a.averageScore > 0);
  const overallAvgScore = avgScoreAll.length > 0
    ? (avgScoreAll.reduce((sum, a) => sum + a.averageScore, 0) / avgScoreAll.length).toFixed(1)
    : "0.0";

  /* Distinct Courses */
  const availableCourses = useMemo(() => {
    const set = new Set(assignments.map(a => a.course));
    return Array.from(set);
  }, [assignments]);

  /* Filtered & Sorted Assignments */
  const filteredAssignments = useMemo(() => {
    let list = assignments.filter((a) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.course.toLowerCase().includes(q) ||
        a.module.toLowerCase().includes(q);

      const matchesCourse =
        selectedCourseFilter === "All" ||
        a.course.toLowerCase() === selectedCourseFilter.toLowerCase() ||
        a.course.toLowerCase().includes(selectedCourseFilter.toLowerCase()) ||
        selectedCourseFilter.toLowerCase().includes(a.course.toLowerCase());

      const matchesStatus = selectedStatusFilter === "All" || a.status === selectedStatusFilter;
      return matchesSearch && matchesCourse && matchesStatus;
    });

    return list.sort((a, b) => {
      if (sortBy === "pending") return b.pendingReviewCount - a.pendingReviewCount;
      if (sortBy === "score") return b.averageScore - a.averageScore;
      if (sortBy === "due_date") return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return b.id.localeCompare(a.id); // newest
    });
  }, [assignments, searchQuery, selectedCourseFilter, selectedStatusFilter, sortBy]);

  /* Filtered Submissions in Drawer */
  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((s) => {
      const matchText = s.studentName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
        s.studentEmail.toLowerCase().includes(submissionSearch.toLowerCase());
      if (!matchText) return false;
      if (submissionFilter === "PENDING" && s.status !== "Pending Review" && s.status !== "Submitted") return false;
      if (submissionFilter === "GRADED" && s.status !== "Graded") return false;
      return true;
    });
  }, [submissionsList, submissionSearch, submissionFilter]);

  const [subPage, setSubPage] = useState(1);
  const [subPerPage, setSubPerPage] = useState(8);

  const totalSubmissionsPages = Math.max(1, Math.ceil(filteredSubmissions.length / subPerPage));
  const paginatedSubmissions = useMemo(() => {
    if (subPerPage >= filteredSubmissions.length) return filteredSubmissions;
    const start = (subPage - 1) * subPerPage;
    return filteredSubmissions.slice(start, start + subPerPage);
  }, [filteredSubmissions, subPage, subPerPage]);

  const pendingSubmissionsCount = useMemo(() => {
    return submissionsList.filter(s => s.status === "Pending Review" || s.status === "Submitted").length;
  }, [submissionsList]);

  const gradedSubmissionsCount = useMemo(() => {
    return submissionsList.filter(s => s.status === "Graded").length;
  }, [submissionsList]);

  const handleCreateAssignment = (status: "Draft" | "Published") => {
    if (!wizardData.title.trim()) return;
    const newAsg: AssignmentItem = {
      id: `asg-${Date.now()}`,
      title: wizardData.title.trim(),
      course: wizardData.course,
      module: wizardData.module,
      dueDate: wizardData.dueDate.replace("T", " "),
      submissionsCount: 0,
      totalStudents: 45,
      pendingReviewCount: 0,
      averageScore: 0,
      status: status,
      type: wizardData.type,
      totalMarks: Number(wizardData.totalMarks) || 100
    };

    setAssignments([newAsg, ...assignments]);
    setIsWizardOpen(false);
    setWizardStep(1);
    showToast(`Assignment "${newAsg.title}" created successfully as ${status}!`);
    setWizardData({
      title: "",
      description: "",
      course: "Mastering Agentic AI & Autonomous Workflows",
      module: "Module 3: Complex Multi-Agent Frameworks",
      difficulty: "Medium",
      totalMarks: 100,
      passingMarks: 40,
      estimatedDuration: 120,
      type: "Coding Assignment",
      dueDate: "2026-08-25T23:59",
      allowLate: true,
      latePenalty: 10,
      maxAttempts: 3,
      allowResubmission: true,
      assignmentScope: "Individual",
      evaluationMode: "Manual Review",
      resources: [],
      rubric: [
        { id: "r1", title: "Code Quality", marks: 25, weight: 25, description: "Clean code structure" },
        { id: "r2", title: "Documentation", marks: 15, weight: 15, description: "Detailed README" },
        { id: "r3", title: "Logic & Accuracy", marks: 40, weight: 40, description: "Passes all tests" },
        { id: "r4", title: "Creativity", marks: 20, weight: 20, description: "Extra features" }
      ]
    });
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    showToast("Assignment removed.");
  };

  const toggleStatus = (id: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === "Published" ? "Closed" : "Published";
        showToast(`Assignment marked as ${nextStatus}.`);
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const handleSaveGrade = () => {
    if (!selectedSubmissionToReview) return;
    
    setSubmissionsList(prev => prev.map(s => {
      if (s.id === selectedSubmissionToReview.id) {
        return {
          ...s,
          score: reviewScore,
          status: "Graded",
          feedback: reviewFeedback
        };
      }
      return s;
    }));

    if (selectedAssignmentDetails) {
      setAssignments(prev => prev.map(a => {
        if (a.id === selectedAssignmentDetails.id) {
          const newPending = Math.max(0, a.pendingReviewCount - 1);
          return { ...a, pendingReviewCount: newPending };
        }
        return a;
      }));
    }

    showToast(`Graded submission for ${selectedSubmissionToReview.studentName} (${reviewScore}/100)`);
    setSelectedSubmissionToReview(null);
  };

  /* Helper: Format Due Date */
  const formatDueDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr.replace(" ", "T"));
      if (isNaN(d.getTime())) return { date: dateStr, time: "", badge: null };
      
      const now = new Date();
      const isPast = d.getTime() < now.getTime();
      const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const timeFormatted = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      
      let badge = null;
      if (isPast) {
        badge = { label: "Ended", color: "text-slate-400 bg-white/[0.04] border-white/[0.08]" };
      } else if (diffDays <= 1) {
        badge = { label: "Due Today", color: "text-rose-300 bg-rose-500/15 border-rose-500/30 font-semibold" };
      } else if (diffDays <= 3) {
        badge = { label: `Due in ${diffDays}d`, color: "text-rose-300 bg-rose-500/10 border-rose-500/20" };
      } else if (diffDays <= 7) {
        badge = { label: `In ${diffDays}d`, color: "text-amber-300 bg-amber-500/10 border-amber-500/20" };
      } else {
        badge = { label: `In ${diffDays}d`, color: "text-slate-400 bg-white/[0.03] border-white/[0.06]" };
      }
      
      return { date: dateFormatted, time: timeFormatted, badge };
    } catch {
      return { date: dateStr, time: "", badge: null };
    }
  };

  /* Helper: Type Icon & Colors */
  const getTypeMeta = (type: AssignmentItem["type"]) => {
    switch (type) {
      case "Coding Assignment":
        return { icon: Code, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", label: "Coding" };
      case "MCQ Quiz":
        return { icon: HelpCircle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Quiz" };
      case "Project Submission":
        return { icon: Layers, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", label: "Project" };
      case "File Upload":
        return { icon: Upload, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "File" };
      default:
        return { icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Text" };
    }
  };

  return (
    <div className="w-full max-w-full mx-auto space-y-4 font-sans text-slate-200 animate-in fade-in duration-200">
      
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-8 right-8 z-[120] flex items-center gap-3 px-4 py-3 bg-[#121826] border border-indigo-500/40 text-white rounded-xl shadow-2xl text-xs font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Back Navigation Option ── */}
      {(onBack || initialFilter?.returnTab || initialFilter?.courseTitle) && (
        <div className="pt-1">
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] hover:border-purple-500/30 text-xs font-semibold transition-all cursor-pointer group shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-purple-400" />
            <span>
              {initialFilter?.returnTab
                ? `Back to ${initialFilter.returnTab}`
                : "Back to Previous Page"}
            </span>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          1. EXECUTIVE PAGE HEADER
          ═══════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-[28px] font-semibold text-white tracking-tight">
              Assignments & Grading
            </h1>
            <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              Assessment Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Create course assessments, track submission velocity, and grade student submissions.
          </p>

          {/* Header Summary Pills */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08] font-medium">
              <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
              <span>{totalAssignments} Total Assessments</span>
            </div>

            {pendingReviewCount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>{pendingReviewCount} Awaiting Review</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{publishedCount} Published</span>
            </div>
          </div>
        </div>

        {/* Top Right Action Button */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <button
            onClick={() => { setWizardStep(1); setIsWizardOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* ── Active Student Review Focus Banner ── */}
      {initialFilter?.studentName && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white text-sm">Evaluating Student Submission:</span>
                <span className="font-bold text-indigo-300 text-sm">{initialFilter.studentName}</span>
                {initialFilter.studentEmail && (
                  <span className="text-[11px] text-slate-400 font-mono">({initialFilter.studentEmail})</span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Directly reviewing assessment in {initialFilter.courseTitle || "Assigned Course"}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-xs font-semibold cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to {initialFilter?.returnTab || "Previous"}</span>
              </button>
            )}
            {onClearFilter && (
              <button
                onClick={onClearFilter}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.1] text-xs font-semibold cursor-pointer shrink-0 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          2. KEY METRICS CONTAINER (Apple / Linear Aesthetic)
          ═══════════════════════════════════════════════ */}
      <div className="bg-[#121824]/90 border border-white/[0.08] rounded-2xl p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] shadow-sm">
        {/* Metric 1: Total Assessments */}
        <div className="flex flex-col justify-between pt-0 md:px-6 first:md:pl-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Assessments</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
            {totalAssignments}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {publishedCount} live · {draftCount} drafts
          </span>
        </div>

        {/* Metric 2: Pending Reviews */}
        <div className="flex flex-col justify-between pt-4 md:pt-0 md:px-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Requires Grading</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-300 tracking-tight">{pendingReviewCount}</span>
            {pendingReviewCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/20">
                Action needed
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            Student submissions to grade
          </span>
        </div>

        {/* Metric 3: Overall Submission Rate */}
        <div className="flex flex-col justify-between pt-4 md:pt-0 md:px-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Submission Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
            {globalSubmissionRate}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {totalSubmissionsSum} of {totalStudentsSum} students submitted
          </span>
        </div>

        {/* Metric 4: Average Score */}
        <div className="flex flex-col justify-between pt-4 md:pt-0 md:px-6 last:md:pr-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Average Grade</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
            {overallAvgScore}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            Across evaluated submissions
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          3. TOOLBAR (SEARCH, STATUS TABS, COURSE FILTER, VIEW TOGGLE)
          ═══════════════════════════════════════════════ */}
      <div className="bg-[#121824]/90 border border-white/[0.08] rounded-2xl p-3.5 flex flex-col lg:flex-row items-center gap-3 justify-between shadow-xs">
        
        {/* Left: Search Bar */}
        <div className="relative w-full lg:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assessments, modules or course..."
            className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-indigo-500/50 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 font-medium outline-none transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center: Segmented Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#0E131F] p-1 rounded-xl border border-white/[0.06] shrink-0 scrollbar-none overflow-hidden">
          {[
            { id: "All", label: "All", count: totalAssignments },
            { id: "Published", label: "Published", count: publishedCount },
            { id: "Draft", label: "Drafts", count: draftCount },
            { id: "Closed", label: "Closed", count: closedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === tab.id
                  ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                selectedStatusFilter === tab.id ? "bg-white/20 text-white font-bold" : "bg-white/[0.05] text-slate-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Course Selector & View Mode */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          
          {/* Custom Course Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#161E2E] hover:bg-[#1C2538] border border-white/[0.08] hover:border-white/[0.16] rounded-xl text-xs text-slate-200 font-medium transition-colors cursor-pointer max-w-[200px]"
            >
              <Filter className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">
                {selectedCourseFilter === "All" ? "All Courses" : selectedCourseFilter}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isCourseDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isCourseDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsCourseDropdownOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-64 bg-[#121826] border border-white/[0.12] rounded-xl shadow-2xl p-1.5 z-40 space-y-0.5 animate-in fade-in-50 zoom-in-95 text-xs text-slate-200">
                  <button
                    onClick={() => {
                      setSelectedCourseFilter("All");
                      setIsCourseDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedCourseFilter === "All" ? "bg-indigo-600 text-white font-semibold" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>All Courses ({totalAssignments})</span>
                    {selectedCourseFilter === "All" && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="h-[1px] bg-white/[0.06] my-1" />

                  {availableCourses.map((cName) => {
                    const count = assignments.filter(a => a.course === cName).length;
                    return (
                      <button
                        key={cName}
                        onClick={() => {
                          setSelectedCourseFilter(cName);
                          setIsCourseDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-left cursor-pointer ${
                          selectedCourseFilter === cName ? "bg-indigo-600 text-white font-semibold" : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="truncate">{cName}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Sort By Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#161E2E] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-medium outline-none cursor-pointer"
          >
            <option value="pending">Sort: Needs Review</option>
            <option value="due_date">Sort: Due Date</option>
            <option value="score">Sort: Avg Score</option>
            <option value="newest">Sort: Newest</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0E131F] p-0.5 rounded-xl border border-white/[0.06] shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "table" ? "bg-white/[0.12] text-white" : "text-slate-400 hover:text-white"}`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white/[0.12] text-white" : "text-slate-400 hover:text-white"}`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* ── Active Course Filter Banner ── */}
      {selectedCourseFilter !== "All" && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-300 truncate">
              Showing assignments for course: <strong className="text-white font-semibold">{selectedCourseFilter}</strong>
              <span className="text-indigo-300 font-mono ml-2">({filteredAssignments.length} found)</span>
            </span>
          </div>
          <button
            onClick={() => setSelectedCourseFilter("All")}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/[0.1] text-xs font-semibold cursor-pointer shrink-0 transition-colors"
          >
            Show All Courses
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          4. MAIN VIEW (TABLE OR GRID) — NO HORIZONTAL SCROLLBAR
          ═══════════════════════════════════════════════ */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-[#121824]/90 border border-white/[0.08] rounded-2xl overflow-hidden shadow-xs w-full">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-[#161E2E]/80 border-b border-white/[0.06] text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3.5">Assignment & Course</th>
                <th className="py-2.5 px-3 text-center">Due Date</th>
                <th className="py-2.5 px-3">Submissions</th>
                <th className="py-2.5 px-3 text-center">Grading Queue</th>
                <th className="py-2.5 px-3 text-center">Avg Score</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredAssignments.map((assignment) => {
                const typeMeta = getTypeMeta(assignment.type);
                const dueMeta = formatDueDate(assignment.dueDate);
                const submissionPercent = assignment.totalStudents > 0
                  ? Math.round((assignment.submissionsCount / assignment.totalStudents) * 100)
                  : 0;

                return (
                  <tr
                    key={assignment.id}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => setSelectedAssignmentDetails(assignment)}
                  >
                    {/* ASSIGNMENT TITLE & COURSE COMBINED */}
                    <td className="py-3 px-3.5 font-medium text-slate-200 max-w-[280px]">
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-xl ${typeMeta.bg} ${typeMeta.color} border ${typeMeta.border} shrink-0 mt-0.5`}>
                          <typeMeta.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors truncate block"
                              title={assignment.title}
                            >
                              {assignment.title}
                            </span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${typeMeta.bg} ${typeMeta.color} border ${typeMeta.border} shrink-0`}>
                              {typeMeta.label}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono px-1 rounded bg-white/[0.03] border border-white/[0.06] shrink-0">
                              {assignment.totalMarks}p
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate" title={`${assignment.course} • ${assignment.module}`}>
                            <span className="text-indigo-300/80 font-medium">{assignment.course}</span> · {assignment.module}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DUE DATE */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <div className="inline-flex flex-col items-center gap-0.5">
                        <span className="text-xs text-slate-200 font-medium">{dueMeta.date}</span>
                        {dueMeta.badge && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border ${dueMeta.badge.color}`}>
                            {dueMeta.badge.label}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* SUBMISSIONS PROGRESS */}
                    <td className="py-3 px-3 min-w-[110px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">
                            {assignment.submissionsCount} <span className="text-slate-500 font-normal text-[10px]">/{assignment.totalStudents}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{submissionPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              submissionPercent >= 75 ? "bg-emerald-500" : submissionPercent >= 40 ? "bg-indigo-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${submissionPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* PENDING REVIEW / GRADING QUEUE */}
                    <td className="py-3 px-3 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      {assignment.pendingReviewCount > 0 ? (
                        <button
                          onClick={() => setSelectedAssignmentDetails(assignment)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>{assignment.pendingReviewCount} to Review</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Graded</span>
                        </span>
                      )}
                    </td>

                    {/* AVERAGE SCORE */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      {assignment.averageScore > 0 ? (
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border font-mono ${
                          assignment.averageScore >= 80
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : assignment.averageScore >= 60
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                        }`}>
                          {assignment.averageScore}%
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide uppercase border ${
                          assignment.status === "Published"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : assignment.status === "Draft"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-white/[0.04] text-slate-400 border-white/[0.08]"
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${
                          assignment.status === "Published" ? "bg-emerald-400" : assignment.status === "Draft" ? "bg-amber-400" : "bg-slate-400"
                        }`} />
                        {assignment.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedAssignmentDetails(assignment)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                          title="View Submissions"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleStatus(assignment.id)}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            assignment.status === "Published"
                              ? "text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
                              : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          }`}
                          title={assignment.status === "Published" ? "Close Assessment" : "Publish Assessment"}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAssignment(assignment.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-1">
                    <ClipboardList className="w-8 h-8 mx-auto text-slate-600 mb-1.5" />
                    <p className="font-semibold text-xs text-white">No assignments found</p>
                    <p className="text-[11px] text-slate-500">Try adjusting your search keywords or clear your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer Info */}
          {filteredAssignments.length > 0 && (
            <div className="px-4 py-2.5 bg-[#161E2E]/40 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-normal">
              <span>
                Showing <strong className="text-white">{filteredAssignments.length}</strong> of <strong className="text-white">{totalAssignments}</strong> assessments
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Click any assignment row to evaluate submissions
              </span>
            </div>
          )}
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assignment) => {
            const typeMeta = getTypeMeta(assignment.type);
            const dueMeta = formatDueDate(assignment.dueDate);
            const submissionPercent = assignment.totalStudents > 0
              ? Math.round((assignment.submissionsCount / assignment.totalStudents) * 100)
              : 0;

            return (
              <div
                key={assignment.id}
                onClick={() => setSelectedAssignmentDetails(assignment)}
                className="bg-[#121824]/90 border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 group cursor-pointer shadow-xs"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${typeMeta.bg} ${typeMeta.color} border ${typeMeta.border}`}>
                      {typeMeta.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase border ${
                        assignment.status === "Published"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>

                  {/* Title & Course */}
                  <div>
                    <h3 className="font-semibold text-white text-base leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-indigo-300/80 font-medium mt-1 line-clamp-1">
                      {assignment.course}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {assignment.module}
                    </p>
                  </div>

                  {/* Due Date & Marks */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/[0.04]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dueMeta.date}
                    </span>
                    <span className="font-mono text-slate-300">{assignment.totalMarks} Marks</span>
                  </div>

                  {/* Submissions Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Submissions</span>
                      <span className="font-semibold text-white">{assignment.submissionsCount} / {assignment.totalStudents} ({submissionPercent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          submissionPercent >= 75 ? "bg-emerald-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${submissionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                  {assignment.pendingReviewCount > 0 ? (
                    <button
                      onClick={() => setSelectedAssignmentDetails(assignment)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                    >
                      {assignment.pendingReviewCount} to Review →
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium">✓ All Graded</span>
                  )}

                  <button
                    onClick={() => setSelectedAssignmentDetails(assignment)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
         SUBMISSIONS OVERVIEW & GRADING DRAWER / MODAL
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedAssignmentDetails && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setSelectedAssignmentDetails(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121826] border border-white/[0.1] w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden text-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-6 bg-[#161E2E] border-b border-white/[0.08] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
                      SUBMISSIONS & EVALUATION
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 font-medium">{selectedAssignmentDetails.submissionsCount} Total Submissions</span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                    {selectedAssignmentDetails.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedAssignmentDetails.course} · {selectedAssignmentDetails.module}
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedAssignmentDetails(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats Metric Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-[#161E2E]/60 border border-white/[0.06] rounded-xl text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Submitted</span>
                    <p className="text-xl font-bold text-white mt-0.5">{selectedAssignmentDetails.submissionsCount} / {selectedAssignmentDetails.totalStudents}</p>
                  </div>
                  <div className="p-3.5 bg-[#161E2E]/60 border border-white/[0.06] rounded-xl text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Needs Grading</span>
                    <p className="text-xl font-bold text-amber-300 mt-0.5">{selectedAssignmentDetails.pendingReviewCount}</p>
                  </div>
                  <div className="p-3.5 bg-[#161E2E]/60 border border-white/[0.06] rounded-xl text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Class Average</span>
                    <p className="text-xl font-bold text-emerald-400 mt-0.5">{selectedAssignmentDetails.averageScore > 0 ? `${selectedAssignmentDetails.averageScore}%` : "—"}</p>
                  </div>
                  <div className="p-3.5 bg-[#161E2E]/60 border border-white/[0.06] rounded-xl text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Marks</span>
                    <p className="text-xl font-bold text-indigo-300 mt-0.5">{selectedAssignmentDetails.totalMarks} pts</p>
                  </div>
                </div>

                {/* Submissions Filter Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search student name or email..."
                      value={submissionSearch}
                      onChange={(e) => {
                        setSubmissionSearch(e.target.value);
                        setSubPage(1);
                      }}
                      className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-indigo-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#0E131F] p-1 rounded-xl border border-white/[0.06]">
                    {[
                      { id: "ALL", label: `All (${submissionsList.length})` },
                      { id: "PENDING", label: `Needs Review (${pendingSubmissionsCount})` },
                      { id: "GRADED", label: `Graded (${gradedSubmissionsCount})` },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => {
                          setSubmissionFilter(btn.id as any);
                          setSubPage(1);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          submissionFilter === btn.id ? "bg-white/[0.12] text-white font-semibold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submissions Table */}
                <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#161E2E]/40 max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#161E2E] z-10 shadow-xs">
                      <tr className="border-b border-white/[0.06] text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Submitted At</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Evaluation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {paginatedSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                                {sub.studentName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-semibold text-white block">{sub.studentName}</span>
                                <span className="text-[11px] text-slate-400">{sub.studentEmail}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                            <span className="flex items-center gap-1.5 font-mono text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              {sub.submissionTime}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold whitespace-nowrap">
                            {sub.score !== null ? (
                              <span className="text-emerald-300 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 font-mono">
                                {sub.score} / {selectedAssignmentDetails.totalMarks}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-mono">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              sub.status === "Graded"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sub.status === "Graded" ? "bg-emerald-400" : "bg-amber-400"}`} />
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedSubmissionToReview(sub);
                                setReviewScore(sub.score || 88);
                                setReviewFeedback(sub.feedback || "");
                              }}
                              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                            >
                              {sub.status === "Graded" ? "Re-evaluate" : "Grade & Review →"}
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredSubmissions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No student submissions found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Submissions Pagination Bar */}
                {filteredSubmissions.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>
                        Showing <strong className="text-white">{Math.min((subPage - 1) * subPerPage + 1, filteredSubmissions.length)}</strong> to <strong className="text-white">{Math.min(subPage * subPerPage, filteredSubmissions.length)}</strong> of <strong className="text-white">{filteredSubmissions.length}</strong> students
                      </span>
                      <span className="text-slate-600">•</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-500">Rows:</span>
                        <select
                          value={subPerPage}
                          onChange={(e) => {
                            setSubPerPage(Number(e.target.value));
                            setSubPage(1);
                          }}
                          className="bg-[#161E2E] border border-white/[0.08] text-slate-200 rounded-lg px-2 py-0.5 text-xs outline-none cursor-pointer"
                        >
                          <option value={8}>8</option>
                          <option value={15}>15</option>
                          <option value={25}>25</option>
                          <option value={filteredSubmissions.length}>All ({filteredSubmissions.length})</option>
                        </select>
                      </div>
                    </div>

                    {totalSubmissionsPages > 1 && (
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                          disabled={subPage === 1}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 disabled:hover:bg-white/[0.04] text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                        >
                          Prev
                        </button>

                        {Array.from({ length: totalSubmissionsPages }, (_, i) => i + 1).map((pNum) => (
                          <button
                            key={pNum}
                            onClick={() => setSubPage(pNum)}
                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              subPage === pNum
                                ? "bg-indigo-600 text-white"
                                : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white"
                            }`}
                          >
                            {pNum}
                          </button>
                        ))}

                        <button
                          onClick={() => setSubPage((p) => Math.min(totalSubmissionsPages, p + 1))}
                          disabled={subPage === totalSubmissionsPages}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 disabled:hover:bg-white/[0.04] text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── LOWER PORTION: ALL ASSIGNMENTS FOOTER BAR ── */}
              <div className="p-4 sm:px-6 bg-[#161E2E] border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400 text-xs block truncate">
                      Course: <strong className="text-white font-semibold">{selectedAssignmentDetails.course}</strong>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {courseSiblingAssignments.length} total assignments in this course
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewAllCourseAssignments(selectedAssignmentDetails.course)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View All Assignments for this Course →</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
         DIRECT GRADING & RUBRIC EVALUATION MODAL
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedSubmissionToReview && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setSelectedSubmissionToReview(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121826] border border-white/[0.12] w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl text-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">Evaluate Submission</span>
                  <h3 className="text-xl font-bold text-white">{selectedSubmissionToReview.studentName}</h3>
                  <p className="text-xs text-slate-400">{selectedSubmissionToReview.studentEmail}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmissionToReview(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student Submission Answer / File */}
              <div className="p-4 bg-[#161E2E] border border-white/[0.06] rounded-xl space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Submitted Work</span>
                <p className="text-xs text-slate-200 leading-relaxed">{selectedSubmissionToReview.submittedText || "No text description attached."}</p>
                {selectedSubmissionToReview.submittedFileName && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0E131F] border border-white/[0.08] rounded-lg text-xs font-medium text-indigo-300 mt-2">
                    <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{selectedSubmissionToReview.submittedFileName}</span>
                  </div>
                )}
              </div>

              {/* Score Input */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-200">Score Assigned</label>
                    <span className="text-xs text-slate-400 font-mono">Out of {selectedAssignmentDetails?.totalMarks || 100}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      max={selectedAssignmentDetails?.totalMarks || 100}
                      min={0}
                      value={reviewScore}
                      onChange={(e) => setReviewScore(Number(e.target.value))}
                      className="w-28 bg-[#161E2E] border border-white/[0.1] focus:border-indigo-500 rounded-xl px-4 py-2 text-sm font-bold text-white text-center outline-none"
                    />
                    <div className="flex-1">
                      <input
                        type="range"
                        min={0}
                        max={selectedAssignmentDetails?.totalMarks || 100}
                        value={reviewScore}
                        onChange={(e) => setReviewScore(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Feedback Suggestions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">Quick Feedback Templates</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_FEEDBACKS.map((fb, idx) => (
                      <button
                        key={idx}
                        onClick={() => setReviewFeedback(fb)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] transition-colors cursor-pointer text-left"
                      >
                        {fb.substring(0, 36)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">Detailed Instructor Comments</label>
                  <textarea
                    rows={3}
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Provide constructive feedback and recommendations for the student..."
                    className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => setSelectedSubmissionToReview(null)}
                  className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGrade}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Save Grade & Publish Result
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
         CREATE ASSIGNMENT MULTI-STEP WIZARD MODAL
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isWizardOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsWizardOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121826] border border-white/[0.12] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 bg-[#161E2E] border-b border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                    CREATE NEW ASSESSMENT WIZARD
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                    Step {wizardStep} of 6: {
                      wizardStep === 1 ? "Basic Assessment Details" :
                      wizardStep === 2 ? "Submission Type & Scoring" :
                      wizardStep === 3 ? "Deadlines & Policies" :
                      wizardStep === 4 ? "Resource Attachments" :
                      wizardStep === 5 ? "Grading Rubric Breakdown" :
                      "Review & Publish"
                    }
                  </h2>
                </div>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="w-full h-1 bg-white/[0.06]">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(wizardStep / 6) * 100}%` }}
                />
              </div>

              {/* Wizard Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* STEP 1 */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">Assignment Title *</label>
                      <input
                        type="text"
                        value={wizardData.title}
                        onChange={(e) => setWizardData({ ...wizardData, title: e.target.value })}
                        placeholder="e.g. Multi-Agent Swarm Orchestration with LangGraph"
                        className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">Course Selection</label>
                      <select
                        value={wizardData.course}
                        onChange={(e) => setWizardData({ ...wizardData, course: e.target.value })}
                        className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                      >
                        <option value="Mastering Agentic AI & Autonomous Workflows">Mastering Agentic AI & Autonomous Workflows</option>
                        <option value="Full-Stack Web Development Bootcamp">Full-Stack Web Development Bootcamp</option>
                        <option value="Machine Learning Engineering">Machine Learning Engineering</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">Module Scope</label>
                      <input
                        type="text"
                        value={wizardData.module}
                        onChange={(e) => setWizardData({ ...wizardData, module: e.target.value })}
                        placeholder="e.g. Module 3: Multi-Agent Architectures"
                        className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">Instructions & Description</label>
                      <textarea
                        rows={4}
                        value={wizardData.description}
                        onChange={(e) => setWizardData({ ...wizardData, description: e.target.value })}
                        placeholder="Detailed instructions for students, goals, deliverables, and requirements..."
                        className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-2">Submission Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {(["Coding Assignment", "Project Submission", "MCQ Quiz", "File Upload", "Text Answer"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setWizardData({ ...wizardData, type: t })}
                            className={`p-3 rounded-xl border text-xs font-semibold text-left transition-colors cursor-pointer ${
                              wizardData.type === t
                                ? "bg-indigo-600/20 text-indigo-200 border-indigo-500"
                                : "bg-[#161E2E] text-slate-400 border-white/[0.06] hover:text-white"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1.5">Total Marks</label>
                        <input
                          type="number"
                          value={wizardData.totalMarks}
                          onChange={(e) => setWizardData({ ...wizardData, totalMarks: Number(e.target.value) })}
                          className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1.5">Passing Marks</label>
                        <input
                          type="number"
                          value={wizardData.passingMarks}
                          onChange={(e) => setWizardData({ ...wizardData, passingMarks: Number(e.target.value) })}
                          className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">Due Date & Submission Deadline</label>
                      <input
                        type="datetime-local"
                        value={wizardData.dueDate}
                        onChange={(e) => setWizardData({ ...wizardData, dueDate: e.target.value })}
                        className="w-full bg-[#161E2E] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-[#161E2E] border border-white/[0.06] rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-white block">Allow Late Submissions</span>
                        <span className="text-[11px] text-slate-400">Accept submissions after the deadline with penalty</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={wizardData.allowLate}
                        onChange={(e) => setWizardData({ ...wizardData, allowLate: e.target.checked })}
                        className="accent-indigo-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {wizardStep === 4 && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-200 block">Starter Files & References</span>
                    <div className="p-6 border-2 border-dashed border-white/[0.1] rounded-2xl text-center bg-[#161E2E]/40 space-y-2">
                      <Upload className="w-6 h-6 mx-auto text-indigo-400" />
                      <p className="text-xs text-slate-300 font-medium">Drag & drop guidelines, code templates or PDFs</p>
                      <p className="text-[10px] text-slate-500">ZIP, PDF, PY, IPYNB supported (Max 50MB)</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Attached Resources ({wizardData.resources.length})</span>
                      {wizardData.resources.map((res, idx) => (
                        <div key={idx} className="p-3 bg-[#161E2E] border border-white/[0.06] rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <span className="text-slate-200 font-medium">{res.name}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">Ready</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 5 */}
                {wizardStep === 5 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white block">Grading Rubric Breakdown</span>
                        <span className="text-[11px] text-slate-400">Define weightage for objective evaluation</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newId = `r-${Date.now()}`;
                          setWizardData({
                            ...wizardData,
                            rubric: [...wizardData.rubric, { id: newId, title: "New Criterion", marks: 10, weight: 10, description: "Criterion details" }]
                          });
                        }}
                        className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Criterion
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {wizardData.rubric.map((item, idx) => (
                        <div key={item.id} className="p-3.5 bg-[#161E2E] border border-white/[0.06] rounded-xl space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...wizardData.rubric];
                                updated[idx].title = e.target.value;
                                setWizardData({ ...wizardData, rubric: updated });
                              }}
                              className="flex-1 bg-[#0E131F] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400 font-mono">Marks:</span>
                              <input
                                type="number"
                                value={item.marks}
                                onChange={(e) => {
                                  const updated = [...wizardData.rubric];
                                  updated[idx].marks = Number(e.target.value);
                                  setWizardData({ ...wizardData, rubric: updated });
                                }}
                                className="w-16 bg-[#0E131F] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 6 */}
                {wizardStep === 6 && (
                  <div className="space-y-4">
                    <div className="p-5 bg-[#161E2E] border border-white/[0.08] rounded-2xl space-y-3 text-xs">
                      <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                        <Sparkles className="w-4 h-4" />
                        <span>Ready to Publish</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div><span className="text-slate-400 block text-[11px]">Title:</span> <span className="font-semibold text-white">{wizardData.title || "Untitled Assessment"}</span></div>
                        <div><span className="text-slate-400 block text-[11px]">Course:</span> <span className="font-semibold text-white">{wizardData.course}</span></div>
                        <div><span className="text-slate-400 block text-[11px]">Type:</span> <span className="font-semibold text-indigo-300">{wizardData.type}</span></div>
                        <div><span className="text-slate-400 block text-[11px]">Total Marks:</span> <span className="font-semibold text-white">{wizardData.totalMarks} pts</span></div>
                        <div><span className="text-slate-400 block text-[11px]">Due Date:</span> <span className="font-semibold text-amber-300">{wizardData.dueDate.replace("T", " ")}</span></div>
                        <div><span className="text-slate-400 block text-[11px]">Evaluation Mode:</span> <span className="font-semibold text-emerald-400">{wizardData.evaluationMode}</span></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleCreateAssignment("Draft")}
                        className="px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Save as Draft
                      </button>
                      <button
                        onClick={() => handleCreateAssignment("Published")}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                      >
                        Publish Assessment
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer Navigation */}
              <div className="p-4 bg-[#161E2E] border-t border-white/[0.08] flex items-center justify-between">
                <button
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 text-xs font-medium text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {wizardStep < 6 && (
                  <button
                    onClick={() => setWizardStep(prev => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
