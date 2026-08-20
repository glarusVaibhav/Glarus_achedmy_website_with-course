"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Search,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  FileCheck,
  Eye,
  X,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Check,
  FileDown,
  Activity,
  Layers,
  Bot,
  Sparkles,
  Cpu,
  Brain,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════
   TYPE DEFINITIONS
   ═══════════════════════════════════════════════ */

export interface StudentAssignment {
  id: string;
  title: string;
  dueDate: string;
  status: "Submitted" | "Pending Review" | "Graded" | "Missing" | "Late";
  score: number | null;
  totalMarks: number;
  submittedAt?: string;
  submittedText?: string;
  submittedFileName?: string;
  feedback?: string;
}

export interface LiveSessionAttendance {
  id: string;
  title: string;
  date: string;
  time: string;
  status: "Attended" | "Missed" | "Upcoming";
  durationMinutes: number;
}

export interface StudentActivityItem {
  id: string;
  title: string;
  timestamp: string;
  type: "lesson" | "assignment" | "live_session" | "quiz";
}

export interface CourseStudentPerformance {
  courseId: string;
  courseTitle: string;
  progress: number; // 0 - 100
  modulesCompleted: number;
  totalModules: number;
  lessonsCompleted: number;
  totalLessons: number;
  attendanceRate: number; // 0 - 100
  attendedClasses: number;
  totalClasses: number;
  liveSessions: LiveSessionAttendance[];
  assignments: StudentAssignment[];
  recentActivities: StudentActivityItem[];
}

export interface InstructorStudentItem {
  id: string;
  name: string;
  email: string;
  lastActive: string; // "Today", "Yesterday", "3 days ago", "5 days ago", "12 days ago", "Never"
  lastActiveDaysAgo: number;
  status: "Excellent" | "On Track" | "Needs Attention" | "Inactive";
  attentionPriority?: "Critical" | "Warning" | "Normal";
  attentionReason?: string;
  courses: Record<string, CourseStudentPerformance>;
}

export interface CourseMetadata {
  id: string;
  title: string;
  shortCode: string;
  totalStudents: number;
  avgProgress: number;
  avgAttendance: number;
  pendingReviews: number;
}

/* ═══════════════════════════════════════════════
   DATASET
   ═══════════════════════════════════════════════ */

const INITIAL_COURSES: CourseMetadata[] = [
  {
    id: "c1",
    title: "AI Automation Engineer",
    shortCode: "AI-AUTO",
    totalStudents: 13,
    avgProgress: 82,
    avgAttendance: 91,
    pendingReviews: 3,
  },
  {
    id: "c2",
    title: "Generative AI",
    shortCode: "GEN-AI",
    totalStudents: 18,
    avgProgress: 76,
    avgAttendance: 87,
    pendingReviews: 1,
  },
  {
    id: "c3",
    title: "Machine Learning",
    shortCode: "ML-ENG",
    totalStudents: 21,
    avgProgress: 84,
    avgAttendance: 94,
    pendingReviews: 0,
  },
  {
    id: "c4",
    title: "Agentic AI & Autonomous Workflows",
    shortCode: "AGENTIC-AI",
    totalStudents: 24,
    avgProgress: 88,
    avgAttendance: 96,
    pendingReviews: 2,
  },
];

const INITIAL_STUDENTS: InstructorStudentItem[] = [
  {
    id: "stu-1",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    lastActive: "Today",
    lastActiveDaysAgo: 0,
    status: "Needs Attention",
    attentionPriority: "Critical",
    attentionReason: "Attendance dropped below 70%",
    courses: {
      c1: {
        courseId: "c1",
        courseTitle: "AI Automation Engineer",
        progress: 82,
        modulesCompleted: 8,
        totalModules: 10,
        lessonsCompleted: 42,
        totalLessons: 50,
        attendanceRate: 68,
        attendedClasses: 11,
        totalClasses: 16,
        liveSessions: [
          { id: "ls-1", title: "LangGraph Multi-Agent Architecture", date: "2026-08-08", time: "18:00", status: "Missed", durationMinutes: 90 },
          { id: "ls-2", title: "RAG Evaluation & Vector Indexing", date: "2026-08-05", time: "18:00", status: "Missed", durationMinutes: 90 },
          { id: "ls-3", title: "Autonomous Agent Tool Calling", date: "2026-08-02", time: "18:00", status: "Attended", durationMinutes: 90 },
          { id: "ls-4", title: "Intro to ReAct Decision Loops", date: "2026-07-29", time: "18:00", status: "Attended", durationMinutes: 90 },
        ],
        assignments: [
          {
            id: "asg-101",
            title: "RAG Implementation",
            dueDate: "2026-08-01",
            status: "Graded",
            score: 87,
            totalMarks: 100,
            submittedAt: "2026-07-31",
            submittedText: "Implemented hybrid semantic search with FAISS index and reranking.",
            submittedFileName: "rahul_rag_final.zip",
            feedback: "Solid retrieval architecture. Could improve query chunk caching.",
          },
          {
            id: "asg-102",
            title: "Agent Workflow Project",
            dueDate: "2026-08-07",
            status: "Graded",
            score: 92,
            totalMarks: 100,
            submittedAt: "2026-08-06",
            submittedText: "Hierarchical supervisor multi-agent workflow with state persistence.",
            submittedFileName: "rahul_agent_graph.py",
            feedback: "Great tool schema definitions and exception handlers.",
          },
          {
            id: "asg-103",
            title: "Vector DB Benchmarking",
            dueDate: "2026-08-12",
            status: "Graded",
            score: 85,
            totalMarks: 100,
            submittedAt: "2026-08-09",
            submittedText: "Compared Qdrant, Pinecone and ChromaDB on 100k embedding vectors.",
            submittedFileName: "vector_benchmark_report.pdf",
            feedback: "Comprehensive latency vs recall analysis.",
          },
          {
            id: "asg-104",
            title: "Production Tool Calling API",
            dueDate: "2026-08-18",
            status: "Graded",
            score: 88,
            totalMarks: 100,
            submittedAt: "2026-08-10",
            submittedText: "Built FastAPI microservice with automated function calling validation.",
            submittedFileName: "api_service_rahul.zip",
            feedback: "Well modularized code.",
          }
        ],
        recentActivities: [
          { id: "act-1", title: 'Completed lesson "RAG Fundamentals"', timestamp: "2 hours ago", type: "lesson" },
          { id: "act-2", title: 'Submitted "Production Tool Calling API"', timestamp: "Yesterday", type: "assignment" },
          { id: "act-3", title: 'Missed Live Class "LangGraph Architecture"', timestamp: "2 days ago", type: "live_session" },
        ],
      },
      c2: {
        courseId: "c2",
        courseTitle: "Generative AI",
        progress: 81,
        modulesCompleted: 6,
        totalModules: 8,
        lessonsCompleted: 30,
        totalLessons: 38,
        attendanceRate: 81,
        attendedClasses: 13,
        totalClasses: 16,
        liveSessions: [],
        assignments: [
          { id: "asg-201", title: "Prompt Optimization Suite", dueDate: "2026-08-02", status: "Graded", score: 90, totalMarks: 100 }
        ],
        recentActivities: [],
      }
    },
  },
  {
    id: "stu-2",
    name: "Ankit Kumar",
    email: "ankit.kumar@example.com",
    lastActive: "3 days ago",
    lastActiveDaysAgo: 3,
    status: "Needs Attention",
    attentionPriority: "Warning",
    attentionReason: "2 assignments pending review",
    courses: {
      c1: {
        courseId: "c1",
        courseTitle: "AI Automation Engineer",
        progress: 61,
        modulesCompleted: 5,
        totalModules: 10,
        lessonsCompleted: 26,
        totalLessons: 50,
        attendanceRate: 72,
        attendedClasses: 12,
        totalClasses: 16,
        liveSessions: [
          { id: "ls-1", title: "LangGraph Multi-Agent Architecture", date: "2026-08-08", time: "18:00", status: "Attended", durationMinutes: 90 },
          { id: "ls-2", title: "RAG Evaluation & Vector Indexing", date: "2026-08-05", time: "18:00", status: "Missed", durationMinutes: 90 },
          { id: "ls-3", title: "Autonomous Agent Tool Calling", date: "2026-08-02", time: "18:00", status: "Attended", durationMinutes: 90 },
        ],
        assignments: [
          {
            id: "asg-101",
            title: "RAG Implementation",
            dueDate: "2026-08-01",
            status: "Graded",
            score: 78,
            totalMarks: 100,
            submittedAt: "2026-08-02",
            submittedText: "Implemented naive RAG with LangChain and OpenAI embeddings.",
            submittedFileName: "ankit_rag_submission.zip",
            feedback: "Works well. Make sure to implement semantic chunking in next assignment.",
          },
          {
            id: "asg-102",
            title: "Agent Workflow Project",
            dueDate: "2026-08-07",
            status: "Pending Review",
            score: null,
            totalMarks: 100,
            submittedAt: "2026-08-07",
            submittedText: "Built 3-agent pipeline with research, drafting, and proofreading agent nodes using state graphs.",
            submittedFileName: "agent_workflow_ankit_v2.py",
          },
          {
            id: "asg-103",
            title: "Vector DB Benchmarking",
            dueDate: "2026-08-12",
            status: "Pending Review",
            score: null,
            totalMarks: 100,
            submittedAt: "2026-08-10",
            submittedText: "Benchmarked HNSW indexing vs Flat indexing for high throughput embeddings.",
            submittedFileName: "benchmark_ankit.pdf",
          },
          {
            id: "asg-104",
            title: "Production Tool Calling API",
            dueDate: "2026-08-18",
            status: "Missing",
            score: null,
            totalMarks: 100,
          }
        ],
        recentActivities: [
          { id: "act-1", title: 'Submitted "Vector DB Benchmarking"', timestamp: "3 days ago", type: "assignment" },
          { id: "act-2", title: 'Attended Live Session', timestamp: "4 days ago", type: "live_session" },
        ],
      }
    }
  },
  {
    id: "stu-3",
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    lastActive: "5 days ago",
    lastActiveDaysAgo: 5,
    status: "Needs Attention",
    attentionPriority: "Warning",
    attentionReason: "2 assignments pending",
    courses: {
      c1: {
        courseId: "c1",
        courseTitle: "AI Automation Engineer",
        progress: 45,
        modulesCompleted: 4,
        totalModules: 10,
        lessonsCompleted: 20,
        totalLessons: 50,
        attendanceRate: 64,
        attendedClasses: 10,
        totalClasses: 16,
        liveSessions: [],
        assignments: [
          { id: "asg-101", title: "RAG Implementation", dueDate: "2026-08-01", status: "Graded", score: 65, totalMarks: 100 },
          { id: "asg-102", title: "Agent Workflow Project", dueDate: "2026-08-07", status: "Pending Review", score: null, totalMarks: 100, submittedText: "Agent workflow draft scripts.", submittedFileName: "vikram_agent.py" },
          { id: "asg-103", title: "Vector DB Benchmarking", dueDate: "2026-08-12", status: "Missing", score: null, totalMarks: 100 },
          { id: "asg-104", title: "Production Tool Calling API", dueDate: "2026-08-18", status: "Missing", score: null, totalMarks: 100 },
        ],
        recentActivities: [
          { id: "act-1", title: 'Watched "Introduction to LangChain"', timestamp: "5 days ago", type: "lesson" }
        ],
      }
    }
  },
  {
    id: "stu-4",
    name: "Rohit Joshi",
    email: "rohit.joshi@example.com",
    lastActive: "5 days ago",
    lastActiveDaysAgo: 5,
    status: "Inactive",
    attentionPriority: "Normal",
    attentionReason: "No learning activity for 5 days",
    courses: {
      c1: {
        courseId: "c1",
        courseTitle: "AI Automation Engineer",
        progress: 32,
        modulesCompleted: 3,
        totalModules: 10,
        lessonsCompleted: 14,
        totalLessons: 50,
        attendanceRate: 55,
        attendedClasses: 8,
        totalClasses: 16,
        liveSessions: [],
        assignments: [
          { id: "asg-101", title: "RAG Implementation", dueDate: "2026-08-01", status: "Missing", score: null, totalMarks: 100 },
          { id: "asg-102", title: "Agent Workflow Project", dueDate: "2026-08-07", status: "Missing", score: null, totalMarks: 100 },
        ],
        recentActivities: [],
      }
    }
  },
  {
    id: "stu-5",
    name: "Priya Singh",
    email: "priya.singh@example.com",
    lastActive: "Today",
    lastActiveDaysAgo: 0,
    status: "Excellent",
    courses: {
      c1: {
        courseId: "c1",
        courseTitle: "AI Automation Engineer",
        progress: 91,
        modulesCompleted: 9,
        totalModules: 10,
        lessonsCompleted: 46,
        totalLessons: 50,
        attendanceRate: 97,
        attendedClasses: 15,
        totalClasses: 16,
        liveSessions: [
          { id: "ls-1", title: "LangGraph Multi-Agent Architecture", date: "2026-08-08", time: "18:00", status: "Attended", durationMinutes: 90 },
        ],
        assignments: [
          { id: "asg-101", title: "RAG Implementation", dueDate: "2026-08-01", status: "Graded", score: 96, totalMarks: 100 },
          { id: "asg-102", title: "Agent Workflow Project", dueDate: "2026-08-07", status: "Graded", score: 95, totalMarks: 100 },
          { id: "asg-103", title: "Vector DB Benchmarking", dueDate: "2026-08-12", status: "Graded", score: 94, totalMarks: 100 },
          { id: "asg-104", title: "Production Tool Calling API", dueDate: "2026-08-18", status: "Graded", score: 98, totalMarks: 100 },
        ],
        recentActivities: [
          { id: "act-1", title: 'Completed Module 9 "Agent Memory"', timestamp: "4 hours ago", type: "lesson" },
        ],
      }
    }
  },
  {
    id: "stu-6",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    lastActive: "Today",
    lastActiveDaysAgo: 0,
    status: "Excellent",
    courses: {
      c1: {
        courseId: "c1",
        courseTitle: "AI Automation Engineer",
        progress: 88,
        modulesCompleted: 8,
        totalModules: 10,
        lessonsCompleted: 44,
        totalLessons: 50,
        attendanceRate: 94,
        attendedClasses: 15,
        totalClasses: 16,
        liveSessions: [],
        assignments: [
          { id: "asg-101", title: "RAG Implementation", dueDate: "2026-08-01", status: "Graded", score: 91, totalMarks: 100 },
          { id: "asg-102", title: "Agent Workflow Project", dueDate: "2026-08-07", status: "Graded", score: 89, totalMarks: 100 },
        ],
        recentActivities: [
          { id: "act-1", title: 'Completed "Human-in-the-loop Approval"', timestamp: "3 hours ago", type: "lesson" },
        ],
      }
    }
  },
  {
    id: "stu-7",
    name: "Sneha Gupta",
    email: "sneha.gupta@example.com",
    lastActive: "Yesterday",
    lastActiveDaysAgo: 1,
    status: "On Track",
    courses: {
      c1: {
        courseId: "c1",
        courseTitle: "AI Automation Engineer",
        progress: 78,
        modulesCompleted: 7,
        totalModules: 10,
        lessonsCompleted: 39,
        totalLessons: 50,
        attendanceRate: 91,
        attendedClasses: 14,
        totalClasses: 16,
        liveSessions: [],
        assignments: [
          { id: "asg-101", title: "RAG Implementation", dueDate: "2026-08-01", status: "Graded", score: 88, totalMarks: 100 },
          { id: "asg-102", title: "Agent Workflow Project", dueDate: "2026-08-07", status: "Graded", score: 86, totalMarks: 100 },
        ],
        recentActivities: [],
      }
    }
  },
  {
    id: "stu-8",
    name: "Riya Sen",
    email: "riya.sen@example.com",
    lastActive: "Today",
    lastActiveDaysAgo: 0,
    status: "Excellent",
    courses: {
      c1: {
        courseId: "c1",
        courseTitle: "AI Automation Engineer",
        progress: 95,
        modulesCompleted: 10,
        totalModules: 10,
        lessonsCompleted: 49,
        totalLessons: 50,
        attendanceRate: 100,
        attendedClasses: 16,
        totalClasses: 16,
        liveSessions: [],
        assignments: [
          { id: "asg-101", title: "RAG Implementation", dueDate: "2026-08-01", status: "Graded", score: 98, totalMarks: 100 },
        ],
        recentActivities: [],
      }
    }
  },
  {
    id: "stu-9",
    name: "Aman Verma",
    email: "aman.verma@example.com",
    lastActive: "Yesterday",
    lastActiveDaysAgo: 1,
    status: "On Track",
    courses: {
      c2: {
        courseId: "c2",
        courseTitle: "Generative AI",
        progress: 76,
        modulesCompleted: 6,
        totalModules: 8,
        lessonsCompleted: 28,
        totalLessons: 38,
        attendanceRate: 88,
        attendedClasses: 14,
        totalClasses: 16,
        liveSessions: [],
        assignments: [
          { id: "asg-201", title: "Prompt Engineering Evaluation", dueDate: "2026-08-04", status: "Graded", score: 85, totalMarks: 100 },
          { id: "asg-202", title: "Fine-Tuning Llama 3 with LoRA", dueDate: "2026-08-11", status: "Pending Review", score: null, totalMarks: 100, submittedText: "Applied QLoRA on custom domain dataset.", submittedFileName: "aman_lora.py" },
        ],
        recentActivities: [],
      }
    }
  },
  {
    id: "stu-10",
    name: "Neha Kapur",
    email: "neha.kapur@example.com",
    lastActive: "Today",
    lastActiveDaysAgo: 0,
    status: "Excellent",
    courses: {
      c2: {
        courseId: "c2",
        courseTitle: "Generative AI",
        progress: 89,
        modulesCompleted: 7,
        totalModules: 8,
        lessonsCompleted: 34,
        totalLessons: 38,
        attendanceRate: 95,
        attendedClasses: 15,
        totalClasses: 16,
        liveSessions: [],
        assignments: [
          { id: "asg-201", title: "Prompt Engineering Evaluation", dueDate: "2026-08-04", status: "Graded", score: 94, totalMarks: 100 },
        ],
        recentActivities: [],
      }
    }
  },
  {
    id: "stu-11",
    name: "Deepa Nair",
    email: "deepa.nair@example.com",
    lastActive: "Today",
    lastActiveDaysAgo: 0,
    status: "Excellent",
    courses: {
      c3: {
        courseId: "c3",
        courseTitle: "Machine Learning",
        progress: 92,
        modulesCompleted: 9,
        totalModules: 10,
        lessonsCompleted: 45,
        totalLessons: 48,
        attendanceRate: 96,
        attendedClasses: 15,
        totalClasses: 16,
        liveSessions: [],
        assignments: [
          { id: "asg-301", title: "Gradient Descent Optimization", dueDate: "2026-07-28", status: "Graded", score: 98, totalMarks: 100 },
        ],
        recentActivities: [],
      }
    }
  },
  {
    id: "stu-12",
    name: "Harsh Vardhan",
    email: "harsh.vardhan@example.com",
    lastActive: "Yesterday",
    lastActiveDaysAgo: 1,
    status: "On Track",
    courses: {
      c3: {
        courseId: "c3",
        courseTitle: "Machine Learning",
        progress: 85,
        modulesCompleted: 8,
        totalModules: 10,
        lessonsCompleted: 40,
        totalLessons: 48,
        attendanceRate: 94,
        attendedClasses: 15,
        totalClasses: 16,
        liveSessions: [],
        assignments: [
          { id: "asg-301", title: "Gradient Descent Optimization", dueDate: "2026-07-28", status: "Graded", score: 90, totalMarks: 100 },
        ],
        recentActivities: [],
      }
    }
  },
  {
    id: "stu-13",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    lastActive: "Today",
    lastActiveDaysAgo: 0,
    status: "Needs Attention",
    attentionPriority: "Warning",
    attentionReason: "1 capstone project pending review",
    courses: {
      c4: {
        courseId: "c4",
        courseTitle: "Agentic AI & Autonomous Workflows",
        progress: 88,
        modulesCompleted: 8,
        totalModules: 10,
        lessonsCompleted: 44,
        totalLessons: 50,
        attendanceRate: 95,
        attendedClasses: 15,
        totalClasses: 16,
        liveSessions: [
          { id: "live-1", title: "Q&A Masterclass: Agentic Workflows & Multi-Agent Swarms", date: "Today", time: "10:45 AM", status: "Attended", durationMinutes: 75 },
          { id: "live-2", title: "LangGraph Multi-Agent Architecture", date: "2026-08-08", time: "18:00", status: "Attended", durationMinutes: 90 },
        ],
        assignments: [
          { id: "asg-m8-1", title: "Module 8 Assessment — Agentic LangGraph Pipeline", dueDate: "Yesterday", status: "Submitted", score: null, totalMarks: 100, submittedText: "Implemented multi-agent supervisor graph with SQLite state checkpointing.", feedback: "" },
          { id: "asg-m8-2", title: "Agentic AI Capstone Project", dueDate: "In 2 days", status: "Pending Review", score: null, totalMarks: 100, submittedText: "Created full autonomous code reviewer agent with GitHub webhook integration.", feedback: "Awaiting final evaluation." },
          { id: "asg-m7-1", title: "ReAct Loop Implementation", dueDate: "03 Aug 2026", status: "Graded", score: 94, totalMarks: 100, submittedText: "Built deterministic reasoning steps with retry loops." },
        ],
        recentActivities: [
          { id: "act-1", title: 'Submitted "Agentic AI Capstone Project"', timestamp: "Today at 08:30 AM", type: "assignment" },
          { id: "act-2", title: 'Attended Live Class "Agentic Workflows"', timestamp: "Today at 10:45 AM", type: "live_session" }
        ],
      }
    }
  },
  {
    id: "stu-14",
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    lastActive: "Today",
    lastActiveDaysAgo: 0,
    status: "Excellent",
    courses: {
      c4: {
        courseId: "c4",
        courseTitle: "Agentic AI & Autonomous Workflows",
        progress: 94,
        modulesCompleted: 9,
        totalModules: 10,
        lessonsCompleted: 48,
        totalLessons: 50,
        attendanceRate: 98,
        attendedClasses: 16,
        totalClasses: 16,
        liveSessions: [
          { id: "live-1", title: "Q&A Masterclass: Agentic Workflows & Multi-Agent Swarms", date: "Today", time: "10:45 AM", status: "Attended", durationMinutes: 75 }
        ],
        assignments: [
          { id: "asg-m8-1", title: "Module 8 Assessment — Agentic LangGraph Pipeline", dueDate: "Yesterday", status: "Graded", score: 98, totalMarks: 100, submittedText: "Flawless LangGraph implementation with streaming token output.", feedback: "Exceptional code quality!" },
        ],
        recentActivities: [],
      }
    }
  },
  {
    id: "stu-15",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    lastActive: "Today",
    lastActiveDaysAgo: 0,
    status: "On Track",
    courses: {
      c4: {
        courseId: "c4",
        courseTitle: "Agentic AI & Autonomous Workflows",
        progress: 79,
        modulesCompleted: 7,
        totalModules: 10,
        lessonsCompleted: 39,
        totalLessons: 50,
        attendanceRate: 90,
        attendedClasses: 14,
        totalClasses: 16,
        liveSessions: [
          { id: "live-1", title: "Q&A Masterclass: Agentic Workflows & Multi-Agent Swarms", date: "Today", time: "10:45 AM", status: "Attended", durationMinutes: 75 }
        ],
        assignments: [
          { id: "asg-m8-1", title: "Module 8 Assessment — Agentic LangGraph Pipeline", dueDate: "Yesterday", status: "Graded", score: 92, totalMarks: 100 }
        ],
        recentActivities: [],
      }
    }
  }
];

/* ═══════════════════════════════════════════════
   COMPONENT PROPS
   ═══════════════════════════════════════════════ */

export interface InstructorStudentsFilter {
  courseId?: string;
  courseTitle?: string;
  classId?: string;
  className?: string;
  batch?: string;
  searchQuery?: string;
  returnTab?: string;
}

interface InstructorStudentsViewProps {
  onNavigateToAssignments?: (params?: {
    courseId?: string;
    courseTitle?: string;
    studentEmail?: string;
    studentName?: string;
    assignmentId?: string;
    assignmentTitle?: string;
    returnTab?: string;
  }) => void;
  onNavigateToLiveSessions?: () => void;
  onBack?: () => void;
  initialFilter?: InstructorStudentsFilter | null;
  onClearFilter?: () => void;
}

export function InstructorStudentsView({
  onNavigateToAssignments,
  onNavigateToLiveSessions,
  onBack,
  initialFilter,
  onClearFilter,
}: InstructorStudentsViewProps) {
  /* ── Course Scoping State ── */
  const [selectedCourseId, setSelectedCourseId] = useState<string>("ALL");
  const [courses] = useState<CourseMetadata[]>(INITIAL_COURSES);
  const [students, setStudents] = useState<InstructorStudentItem[]>(INITIAL_STUDENTS);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  /* ── Class Scoping / Deep Filtering State ── */
  const [activeClassFilter, setActiveClassFilter] = useState<{
    classId?: string;
    className?: string;
    courseTitle?: string;
    batch?: string;
  } | null>(null);

  /* ── Sync Filter from props ── */
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.courseId) {
        setSelectedCourseId(initialFilter.courseId);
      } else if (initialFilter.courseTitle) {
        const matched = courses.find(c =>
          c.title.toLowerCase().includes(initialFilter.courseTitle!.toLowerCase()) ||
          initialFilter.courseTitle!.toLowerCase().includes(c.title.toLowerCase())
        );
        if (matched) setSelectedCourseId(matched.id);
      }

      if (initialFilter.className || initialFilter.classId) {
        setActiveClassFilter({
          classId: initialFilter.classId,
          className: initialFilter.className,
          courseTitle: initialFilter.courseTitle,
          batch: initialFilter.batch
        });
      }
      if (initialFilter.searchQuery) {
        setSearchQuery(initialFilter.searchQuery);
      }
    }
  }, [initialFilter, courses]);

  const handleClearClassFilter = () => {
    setActiveClassFilter(null);
    setSelectedCourseId("ALL");
    setSearchQuery("");
    if (onClearFilter) onClearFilter();
  };

  /* ── Filters State ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("ALL");
  const [assignmentFilter, setAssignmentFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"NEEDS_ATTENTION" | "PROGRESS_DESC" | "PROGRESS_ASC" | "ATTENDANCE_DESC" | "LAST_ACTIVE" | "NAME">("NEEDS_ATTENTION");

  /* ── UI Drawer & Modals State ── */
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<InstructorStudentItem | null>(null);
  const [activeDrawerCourseId, setActiveDrawerCourseId] = useState<string>("c1");
  const [showAllAttention, setShowAllAttention] = useState(false);
  const [attendanceModalStudent, setAttendanceModalStudent] = useState<{ student: InstructorStudentItem; courseId: string } | null>(null);

  /* ── Direct Assignment Review Modal ── */
  const [reviewModalData, setReviewModalData] = useState<{
    student: InstructorStudentItem;
    assignment: StudentAssignment;
    courseId: string;
    courseTitle: string;
  } | null>(null);
  const [reviewScoreInput, setReviewScoreInput] = useState<number>(88);
  const [reviewFeedbackInput, setReviewFeedbackInput] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  /* ── API Integration & Sync ── */
  useEffect(() => {
    async function loadApiData() {
      try {
        const res = await fetch("/api/instructor/students");
        if (res.ok) {
          const sData = await res.json();
          if (sData.students && Array.isArray(sData.students) && sData.students.length > 0) {
            setStudents(prev => {
              const existingEmails = new Set(prev.map(p => p.email.toLowerCase()));
              const newItems: InstructorStudentItem[] = [];
              sData.students.forEach((enrollment: any, idx: number) => {
                const email = enrollment.user?.email || `user${idx}@example.com`;
                if (!existingEmails.has(email.toLowerCase())) {
                  const courseTitle = enrollment.course?.title || "AI Automation Engineer";
                  const cId = enrollment.course?.id || "c1";
                  newItems.push({
                    id: enrollment.user?.id || `db-stu-${idx}`,
                    name: enrollment.user?.name || "Enrolled Student",
                    email: email,
                    lastActive: "Today",
                    lastActiveDaysAgo: 0,
                    status: (enrollment.progress || 0) >= 80 ? "Excellent" : (enrollment.progress || 0) >= 50 ? "On Track" : "Needs Attention",
                    courses: {
                      [cId]: {
                        courseId: cId,
                        courseTitle: courseTitle,
                        progress: enrollment.progress || 25,
                        modulesCompleted: 2,
                        totalModules: 8,
                        lessonsCompleted: 8,
                        totalLessons: 32,
                        attendanceRate: 85,
                        attendedClasses: 6,
                        totalClasses: 8,
                        liveSessions: [],
                        assignments: [
                          { id: `db-asg-${idx}`, title: "Module 1 Submission", dueDate: "2026-08-15", status: "Submitted", score: 85, totalMarks: 100 }
                        ],
                        recentActivities: [
                          { id: `db-act-${idx}`, title: `Enrolled in ${courseTitle}`, timestamp: "Recently", type: "lesson" }
                        ]
                      }
                    }
                  });
                }
              });
              return newItems.length > 0 ? [...newItems, ...prev] : prev;
            });
          }
        }
      } catch {
        /* fallback to rich mock data */
      }
    }
    loadApiData();
  }, []);

  const showToast = (text: string) => {
    setToastMessage({ text, type: "success" });
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* ── Current Selected Course Object ── */
  const currentCourse = useMemo(() => {
    if (selectedCourseId === "ALL") return null;
    return courses.find((c) => c.id === selectedCourseId) || null;
  }, [selectedCourseId, courses]);

  /* ── Active Scoped Students (Before Filter/Search) ── */
  const courseScopedStudents = useMemo(() => {
    let list = students;
    if (selectedCourseId !== "ALL") {
      list = list.filter((s) => s.courses[selectedCourseId] !== undefined);
    }
    if (activeClassFilter?.className) {
      const cls = activeClassFilter.className.toLowerCase();
      const byClass = list.filter((s) => {
        return Object.values(s.courses).some(c =>
          c.liveSessions.some(ls => ls.title.toLowerCase().includes(cls) || cls.includes(ls.title.toLowerCase()))
        );
      });
      if (byClass.length > 0) return byClass;
    }
    return list;
  }, [selectedCourseId, activeClassFilter, students]);

  /* ── Key Metrics Calculation ── */
  const stats = useMemo(() => {
    if (selectedCourseId === "ALL") {
      const totalStudentsCount = courseScopedStudents.length;
      let totalProgressSum = 0;
      let progressCount = 0;
      let totalAttendanceSum = 0;
      let attendanceCount = 0;
      let pendingReviewsCount = 0;

      courseScopedStudents.forEach((student) => {
        Object.values(student.courses).forEach((perf) => {
          totalProgressSum += perf.progress;
          progressCount++;
          totalAttendanceSum += perf.attendanceRate;
          attendanceCount++;
          const pending = perf.assignments.filter((a) => a.status === "Pending Review").length;
          pendingReviewsCount += pending;
        });
      });

      const avgProgress = progressCount > 0 ? Math.round(totalProgressSum / progressCount) : 75;
      const avgAttendance = attendanceCount > 0 ? Math.round(totalAttendanceSum / attendanceCount) : 83;

      return {
        totalStudents: totalStudentsCount || 13,
        avgProgress: avgProgress || 75,
        avgAttendance: avgAttendance || 83,
        pendingReviews: pendingReviewsCount || 4,
      };
    } else {
      const studentsInCourse = students.filter((s) => s.courses[selectedCourseId]);
      const totalCount = studentsInCourse.length;

      let progSum = 0;
      let attSum = 0;
      let pendingCount = 0;

      studentsInCourse.forEach((s) => {
        const perf = s.courses[selectedCourseId];
        if (perf) {
          progSum += perf.progress;
          attSum += perf.attendanceRate;
          pendingCount += perf.assignments.filter((a) => a.status === "Pending Review").length;
        }
      });

      const avgProg = totalCount > 0 ? Math.round(progSum / totalCount) : currentCourse?.avgProgress || 0;
      const avgAtt = totalCount > 0 ? Math.round(attSum / totalCount) : currentCourse?.avgAttendance || 0;

      return {
        totalStudents: totalCount,
        avgProgress: avgProg,
        avgAttendance: avgAtt,
        pendingReviews: pendingCount,
      };
    }
  }, [selectedCourseId, courseScopedStudents, students, currentCourse]);

  /* ── "Needs Your Attention" List ── */
  const attentionItems = useMemo(() => {
    const list: Array<{
      student: InstructorStudentItem;
      courseId: string;
      courseTitle: string;
      reason: string;
      priority: "Critical" | "Warning" | "Normal";
      actionType: "REVIEW" | "VIEW";
      pendingAssignment?: StudentAssignment;
    }> = [];

    courseScopedStudents.forEach((student) => {
      const courseKeys = selectedCourseId === "ALL" ? Object.keys(student.courses) : [selectedCourseId];

      courseKeys.forEach((cId) => {
        const perf = student.courses[cId];
        if (!perf) return;

        const pendingAssignments = perf.assignments.filter((a) => a.status === "Pending Review");

        // Priority 1: Pending review
        if (pendingAssignments.length > 0) {
          list.push({
            student,
            courseId: cId,
            courseTitle: perf.courseTitle,
            reason: `${pendingAssignments.length} assignment${pendingAssignments.length > 1 ? "s" : ""} pending`,
            priority: "Warning",
            actionType: "REVIEW",
            pendingAssignment: pendingAssignments[0],
          });
        }
        // Priority 2: Attendance dropped below 70%
        else if (perf.attendanceRate < 70) {
          list.push({
            student,
            courseId: cId,
            courseTitle: perf.courseTitle,
            reason: `Attendance dropped below 70% (${perf.attendanceRate}%)`,
            priority: "Critical",
            actionType: "REVIEW",
          });
        }
        // Priority 3: Inactive for 5+ days
        else if (student.lastActiveDaysAgo >= 5) {
          list.push({
            student,
            courseId: cId,
            courseTitle: perf.courseTitle,
            reason: `No learning activity for ${student.lastActiveDaysAgo} days`,
            priority: "Normal",
            actionType: "VIEW",
          });
        }
      });
    });

    const priorityWeight = { Critical: 3, Warning: 2, Normal: 1 };
    return list.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }, [courseScopedStudents, selectedCourseId]);

  /* ── Filtered & Sorted Students for Main Table ── */
  const filteredStudents = useMemo(() => {
    let result = courseScopedStudents.filter((student) => {
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesEmail = student.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }

      const activePerf = selectedCourseId === "ALL"
        ? Object.values(student.courses)[0]
        : student.courses[selectedCourseId];

      if (!activePerf) return false;

      if (statusFilter !== "ALL" && student.status !== statusFilter) return false;

      if (attendanceFilter !== "ALL") {
        const att = activePerf.attendanceRate;
        if (attendanceFilter === "90_PLUS" && att < 90) return false;
        if (attendanceFilter === "75_89" && (att < 75 || att >= 90)) return false;
        if (attendanceFilter === "BELOW_75" && att >= 75) return false;
      }

      if (assignmentFilter !== "ALL") {
        const hasPending = activePerf.assignments.some((a) => a.status === "Pending Review");
        const hasMissing = activePerf.assignments.some((a) => a.status === "Missing");
        const allCompleted = activePerf.assignments.length > 0 && activePerf.assignments.every((a) => a.status === "Graded");

        if (assignmentFilter === "PENDING_REVIEW" && !hasPending) return false;
        if (assignmentFilter === "MISSING" && !hasMissing) return false;
        if (assignmentFilter === "COMPLETED" && !allCompleted) return false;
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      const perfA = selectedCourseId === "ALL" ? Object.values(a.courses)[0] : a.courses[selectedCourseId];
      const perfB = selectedCourseId === "ALL" ? Object.values(b.courses)[0] : b.courses[selectedCourseId];
      if (!perfA || !perfB) return 0;

      if (sortBy === "NEEDS_ATTENTION") {
        const getScore = (s: InstructorStudentItem, p: CourseStudentPerformance) => {
          let score = 0;
          if (p.attendanceRate < 70) score += 100;
          else if (p.attendanceRate < 75) score += 50;

          const pending = p.assignments.filter((asg) => asg.status === "Pending Review").length;
          score += pending * 40;

          if (s.lastActiveDaysAgo >= 10) score += 80;
          else if (s.lastActiveDaysAgo >= 5) score += 30;

          if (s.status === "Needs Attention") score += 20;
          return score;
        };

        return getScore(b, perfB) - getScore(a, perfA);
      }

      if (sortBy === "PROGRESS_DESC") return perfB.progress - perfA.progress;
      if (sortBy === "PROGRESS_ASC") return perfA.progress - perfB.progress;
      if (sortBy === "ATTENDANCE_DESC") return perfB.attendanceRate - perfA.attendanceRate;
      if (sortBy === "LAST_ACTIVE") return a.lastActiveDaysAgo - b.lastActiveDaysAgo;
      if (sortBy === "NAME") return a.name.localeCompare(b.name);

      return 0;
    });

    return result;
  }, [courseScopedStudents, searchQuery, selectedCourseId, statusFilter, attendanceFilter, assignmentFilter, sortBy]);

  /* ── Drawer Open Helper ── */
  const handleOpenStudentDrawer = (student: InstructorStudentItem, targetCourseId?: string) => {
    setSelectedStudentForDrawer(student);
    const availableCourseIds = Object.keys(student.courses);
    if (targetCourseId && student.courses[targetCourseId]) {
      setActiveDrawerCourseId(targetCourseId);
    } else if (selectedCourseId !== "ALL" && student.courses[selectedCourseId]) {
      setActiveDrawerCourseId(selectedCourseId);
    } else if (availableCourseIds.length > 0) {
      setActiveDrawerCourseId(availableCourseIds[0]);
    }
  };

  /* ── Review Modal Open Helper ── */
  const handleOpenReviewModal = (
    student: InstructorStudentItem,
    assignment: StudentAssignment,
    courseId: string,
    courseTitle: string
  ) => {
    if (onNavigateToAssignments) {
      onNavigateToAssignments({
        courseId,
        courseTitle,
        studentEmail: student.email,
        studentName: student.name,
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
      });
      return;
    }

    setReviewModalData({
      student,
      assignment,
      courseId,
      courseTitle,
    });
    setReviewScoreInput(assignment.score || 88);
    setReviewFeedbackInput(assignment.feedback || "");
  };

  /* ── Save Assignment Grade ── */
  const handleSaveGrade = () => {
    if (!reviewModalData) return;
    const { student, assignment, courseId } = reviewModalData;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== student.id) return s;
        const currentPerf = s.courses[courseId];
        if (!currentPerf) return s;

        const updatedAssignments = currentPerf.assignments.map((a) => {
          if (a.id === assignment.id) {
            return {
              ...a,
              status: "Graded" as const,
              score: reviewScoreInput,
              feedback: reviewFeedbackInput,
            };
          }
          return a;
        });

        const remainingPending = updatedAssignments.filter((a) => a.status === "Pending Review").length;
        const newStatus =
          currentPerf.attendanceRate < 75 || remainingPending > 0
            ? "Needs Attention"
            : currentPerf.progress >= 85
            ? "Excellent"
            : "On Track";

        return {
          ...s,
          status: newStatus,
          courses: {
            ...s.courses,
            [courseId]: {
              ...currentPerf,
              assignments: updatedAssignments,
            },
          },
        };
      })
    );

    if (selectedStudentForDrawer && selectedStudentForDrawer.id === student.id) {
      setSelectedStudentForDrawer((prev) => {
        if (!prev) return null;
        const perf = prev.courses[courseId];
        if (!perf) return prev;
        return {
          ...prev,
          courses: {
            ...prev.courses,
            [courseId]: {
              ...perf,
              assignments: perf.assignments.map((a) =>
                a.id === assignment.id
                  ? { ...a, status: "Graded", score: reviewScoreInput, feedback: reviewFeedbackInput }
                  : a
              ),
            },
          },
        };
      });
    }

    showToast(`Graded "${assignment.title}" for ${student.name} (${reviewScoreInput}/100)`);
    setReviewModalData(null);
  };

  const drawerPerformance = useMemo(() => {
    if (!selectedStudentForDrawer) return null;
    return selectedStudentForDrawer.courses[activeDrawerCourseId] || Object.values(selectedStudentForDrawer.courses)[0] || null;
  }, [selectedStudentForDrawer, activeDrawerCourseId]);

  return (
    <div className="max-w-[1180px] mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-3 px-4 py-3 bg-card border border-border text-text rounded-xl shadow-lg animate-in slide-in-from-bottom-5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-subtext hover:text-text ml-2 p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Top Back Navigation Option ── */}
      {(onBack || onNavigateToLiveSessions || initialFilter?.returnTab || activeClassFilter) && (
        <div className="pt-1">
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else if (onNavigateToLiveSessions) {
                onNavigateToLiveSessions();
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
                : activeClassFilter
                ? "Back to Live Sessions"
                : "Back to Previous Page"}
            </span>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          1. PAGE HEADER (Editorial Style + Clean Dropdown)
          ═══════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Students
          </h1>
          <p className="text-sm text-subtext mt-1">
            Monitor progress, attendance, and learning activity across your courses.
          </p>
        </div>

        {/* ── Course Selector ── */}
        <div className="relative self-start sm:self-auto shrink-0">
          <button
            onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
            className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-card/70 hover:bg-card border border-border hover:border-primary/40 rounded-xl text-xs font-semibold text-text transition-colors"
          >
            <span className="text-subtext font-normal">Course:</span>
            <span className="font-semibold text-text">
              {selectedCourseId === "ALL" ? "All Courses" : currentCourse?.title || "Select Course"}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-subtext transition-transform duration-200 ${isCourseDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isCourseDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsCourseDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-64 bg-card border border-border rounded-xl shadow-xl p-1.5 z-40 space-y-0.5 animate-in fade-in-50 zoom-in-95 text-xs">
                <button
                  onClick={() => {
                    setSelectedCourseId("ALL");
                    setIsCourseDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    selectedCourseId === "ALL"
                      ? "bg-primary text-white font-semibold"
                      : "text-text hover:bg-white/[0.04]"
                  }`}
                >
                  <span>All Courses</span>
                  {selectedCourseId === "ALL" && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="h-[1px] bg-border my-1" />

                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setIsCourseDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                      selectedCourseId === course.id
                        ? "bg-primary text-white font-semibold"
                        : "text-text hover:bg-white/[0.04]"
                    }`}
                  >
                    <div>
                      <div className="truncate">{course.title}</div>
                      <div className={`text-[10px] ${selectedCourseId === course.id ? "text-white/80" : "text-subtext"}`}>
                        {course.totalStudents} students · {course.avgProgress}% avg
                      </div>
                    </div>
                    {selectedCourseId === course.id && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Active Live Class Filter Banner ── */}
      {activeClassFilter && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0 mt-0.5 sm:mt-0 border border-indigo-500/30">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white text-sm">Filtered by Live Class:</span>
                <span className="font-bold text-indigo-300 text-sm">{activeClassFilter.className}</span>
                {activeClassFilter.batch && (
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-200 font-mono text-[10px]">
                    {activeClassFilter.batch}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Showing all enrolled students, live session attendance, and assignments for this specific class ({activeClassFilter.courseTitle || currentCourse?.title || "Assigned Course"}).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
            <button
              onClick={() => {
                if (onBack) onBack();
                else if (onNavigateToLiveSessions) onNavigateToLiveSessions();
                else if (typeof window !== "undefined") window.history.back();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {initialFilter?.returnTab || "Live Sessions"}</span>
            </button>
            <button
              onClick={handleClearClassFilter}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.1] transition-colors cursor-pointer font-semibold text-xs shrink-0 shadow-xs"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear Filter (Show All)</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          2. KEY METRICS (Single Clean Statistics Container)
          ═══════════════════════════════════════════════ */}
      <div className="bg-card/40 border border-border/70 rounded-2xl p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {/* Metric 1: Total Students */}
        <div className="flex flex-col justify-between pt-0 md:px-6 first:md:pl-0">
          <span className="text-xs font-medium text-subtext">Total Students</span>
          <div className="text-2xl md:text-3xl font-bold text-text tracking-tight mt-2">
            {stats.totalStudents}
          </div>
          <span className="text-[11px] text-subtext/70 mt-1">
            {selectedCourseId === "ALL" ? "Across all courses" : "In this course"}
          </span>
        </div>

        {/* Metric 2: Average Progress */}
        <div className="flex flex-col justify-between pt-4 md:pt-0 md:px-6">
          <span className="text-xs font-medium text-subtext">Average Progress</span>
          <div className="text-2xl md:text-3xl font-bold text-text tracking-tight mt-2">
            {stats.avgProgress}%
          </div>
          <span className="text-[11px] text-subtext/70 mt-1">
            Class completion rate
          </span>
        </div>

        {/* Metric 3: Average Attendance */}
        <div className="flex flex-col justify-between pt-4 md:pt-0 md:px-6">
          <span className="text-xs font-medium text-subtext">Average Attendance</span>
          <div className="text-2xl md:text-3xl font-bold text-text tracking-tight mt-2">
            {stats.avgAttendance}%
          </div>
          <span className="text-[11px] text-subtext/70 mt-1">
            Live classes & workshops
          </span>
        </div>

        {/* Metric 4: Pending Reviews */}
        <div className="flex flex-col justify-between pt-4 md:pt-0 md:px-6 last:md:pr-0">
          <span className="text-xs font-medium text-subtext flex items-center gap-1.5">
            Pending Reviews
            {stats.pendingReviews > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            )}
          </span>
          <div className={`text-2xl md:text-3xl font-bold tracking-tight mt-2 ${
            stats.pendingReviews > 0 ? "text-amber-400" : "text-text"
          }`}>
            {stats.pendingReviews}
          </div>
          <span className="text-[11px] text-subtext/70 mt-1">
            {stats.pendingReviews > 0 ? "Requires instructor grading" : "All submissions graded"}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          3. NEEDS YOUR ATTENTION (Clean Compact List)
          ═══════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            Needs Your Attention
            {attentionItems.length > 0 && (
              <span className="text-[11px] font-normal text-subtext">
                ({attentionItems.length})
              </span>
            )}
          </h2>

          {attentionItems.length > 3 && (
            <button
              onClick={() => setShowAllAttention(!showAllAttention)}
              className="text-xs font-medium text-subtext hover:text-primary transition-colors flex items-center gap-1"
            >
              <span>{showAllAttention ? "Show top items" : "View all"}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {attentionItems.length === 0 ? (
          <div className="p-4 bg-card/20 border border-border/60 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-text">All students are on track</span>
              <span className="text-subtext ml-2">No immediate action required.</span>
            </div>
          </div>
        ) : (
          <div className="bg-card/30 border border-border/70 rounded-xl divide-y divide-border/60 overflow-hidden">
            {(showAllAttention ? attentionItems : attentionItems.slice(0, 3)).map((item, idx) => {
              const indicatorColor = {
                Critical: "bg-rose-500",
                Warning: "bg-amber-500",
                Normal: "bg-purple-400",
              }[item.priority];

              return (
                <div
                  key={`${item.student.id}-${item.courseId}-${idx}`}
                  className="px-4 py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${indicatorColor} shrink-0`} />
                    <span className="font-semibold text-xs text-text truncate">
                      {item.student.name}
                    </span>
                    <span className="text-xs text-subtext truncate hidden sm:inline">
                      {item.reason}
                    </span>
                    {selectedCourseId === "ALL" && (
                      <span className="text-[11px] text-subtext/60 font-normal truncate hidden md:inline">
                        · {item.courseTitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-subtext sm:hidden truncate max-w-[140px]">
                      {item.reason}
                    </span>

                    {item.actionType === "REVIEW" && item.pendingAssignment ? (
                      <button
                        onClick={() => handleOpenReviewModal(item.student, item.pendingAssignment!, item.courseId, item.courseTitle)}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenStudentDrawer(item.student, item.courseId)}
                        className="text-xs font-semibold text-subtext hover:text-text transition-colors flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          4. COURSE-FIRST SELECTION HUB OR ACTIVE COURSE HEADER
          ═══════════════════════════════════════════════ */}
      {selectedCourseId === "ALL" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Select a Course to View Enrolled Students</span>
              </h2>
              <p className="text-xs text-subtext mt-0.5">
                Click any course below to manage enrolled students, track attendance, and grade submissions.
              </p>
            </div>
          </div>

          {/* Interactive Course Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => {
              const studentsInCourse = students.filter((s) => s.courses[course.id]);
              const pendingCount = studentsInCourse.reduce((acc, s) => {
                const perf = s.courses[course.id];
                return acc + (perf ? perf.assignments.filter(a => a.status === "Pending Review").length : 0);
              }, 0);

              const iconMeta = course.title.toLowerCase().includes("agentic")
                ? { icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" }
                : course.title.toLowerCase().includes("generative")
                ? { icon: Sparkles, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" }
                : course.title.toLowerCase().includes("machine")
                ? { icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" }
                : { icon: Bot, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };

              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className="bg-card/40 hover:bg-card/70 border border-border/70 hover:border-primary/50 rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 group cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Top Tag & Pending Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`p-2.5 rounded-xl ${iconMeta.bg} ${iconMeta.color} border ${iconMeta.border} shrink-0`}>
                        <iconMeta.icon className="w-5 h-5" />
                      </div>
                      
                      {pendingCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {pendingCount} Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium text-subtext bg-white/[0.04]">
                          All Graded
                        </span>
                      )}
                    </div>

                    {/* Title & Enrolled Count */}
                    <div>
                      <h3 className="font-bold text-text text-base group-hover:text-primary transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-subtext font-medium mt-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-subtext/70" />
                        <span><strong className="text-text font-semibold">{course.totalStudents} Students</strong> enrolled in this course</span>
                      </p>
                    </div>

                    {/* Progress Bar & Attendance */}
                    <div className="space-y-2 pt-1 border-t border-border/40">
                      <div className="flex items-center justify-between text-xs text-subtext">
                        <span>Average Progress</span>
                        <span className="font-semibold text-text">{course.avgProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${course.avgProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-subtext pt-0.5">
                        <span>Attendance Rate: <strong className="text-text font-medium">{course.avgAttendance}%</strong></span>
                        <span className="text-primary font-medium group-hover:underline flex items-center gap-1">
                          View Roster <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active Course Header Bar when viewing a specific course */
        <div className="bg-card/40 border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={() => setSelectedCourseId("ALL")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-text border border-border text-xs font-semibold cursor-pointer transition-colors shrink-0 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-subtext" />
              <span>All Courses</span>
            </button>
            
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/15 text-primary uppercase">
                  Course Students
                </span>
                <h2 className="text-base sm:text-lg font-bold text-text truncate">{currentCourse?.title}</h2>
              </div>
              <p className="text-xs text-subtext mt-0.5">
                Showing all <strong className="text-text">{currentCourse?.totalStudents} students</strong> enrolled in this course · {currentCourse?.avgProgress}% avg progress · {currentCourse?.avgAttendance}% attendance
              </p>
            </div>
          </div>

          {/* Quick Switch to Other Courses */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 self-start sm:self-center">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourseId(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCourseId === c.id
                    ? "bg-primary text-white font-semibold shadow-xs"
                    : "bg-card/60 hover:bg-card border border-border text-subtext hover:text-text"
                }`}
              >
                {c.title.split(" ")[0]} ({c.totalStudents})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          5. MAIN STUDENT SECTION & TABLE (Visual Anchor)
          ═══════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Section Header & Inline Search/Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-text">
              Students
            </h2>
            <p className="text-xs text-subtext">
              Track individual student performance and activity.
            </p>
          </div>

          {/* Search & Compact Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-subtext absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 sm:w-56 bg-card/50 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-subtext focus:outline-none focus:border-primary font-normal"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtext hover:text-text"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 1. COURSE FILTER (FIRST FILTER AS REQUESTED) */}
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-card/60 border border-primary/30 text-primary font-semibold rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary cursor-pointer max-w-[200px] truncate"
            >
              <option value="ALL">Course: All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  Course: {course.title} ({course.totalStudents})
                </option>
              ))}
            </select>

            {/* 2. Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card/50 border border-border rounded-xl px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-medium cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="On Track">On Track</option>
              <option value="Needs Attention">Needs Attention</option>
              <option value="Excellent">Excellent</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* 3. Attendance Filter */}
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="bg-card/50 border border-border rounded-xl px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-medium cursor-pointer hidden sm:block"
            >
              <option value="ALL">Attendance: All</option>
              <option value="90_PLUS">90%+</option>
              <option value="75_89">75% – 89%</option>
              <option value="BELOW_75">Below 75%</option>
            </select>

            {/* 4. Assignment Status Filter */}
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="bg-card/50 border border-border rounded-xl px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-medium cursor-pointer hidden lg:block"
            >
              <option value="ALL">Assignments: All</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="MISSING">Missing Work</option>
            </select>

            {/* 5. Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-card/50 border border-border rounded-xl px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-medium cursor-pointer"
            >
              <option value="NEEDS_ATTENTION">Sort: Attention</option>
              <option value="PROGRESS_DESC">Progress (High → Low)</option>
              <option value="ATTENDANCE_DESC">Attendance</option>
              <option value="LAST_ACTIVE">Last Active</option>
              <option value="NAME">Name</option>
            </select>

            {/* Clear / Reset Filters */}
            {(selectedCourseId !== "ALL" || statusFilter !== "ALL" || attendanceFilter !== "ALL" || assignmentFilter !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCourseId("ALL");
                  setStatusFilter("ALL");
                  setAttendanceFilter("ALL");
                  setAssignmentFilter("ALL");
                  setSearchQuery("");
                }}
                className="text-xs text-subtext hover:text-text p-1.5 cursor-pointer rounded-lg hover:bg-white/[0.04] transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Student Table (Spacious & Clean SaaS Table) ── */}
        <div className="bg-card/30 border border-border/70 rounded-2xl overflow-hidden shadow-2xs">
          {filteredStudents.length === 0 ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-2 text-subtext">
              <Users className="w-8 h-8 opacity-30" />
              <p className="font-semibold text-sm text-text">
                {students.length === 0 ? "No students enrolled yet" : "No students match your criteria"}
              </p>
              <p className="text-xs text-subtext">
                {students.length === 0
                  ? "Enrolled students will appear here."
                  : "Try clearing filters or searching for another student."}
              </p>
              {(statusFilter !== "ALL" || attendanceFilter !== "ALL" || assignmentFilter !== "ALL" || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setAttendanceFilter("ALL");
                    setAssignmentFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="mt-2 text-xs font-semibold text-primary hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-[11px] font-medium text-subtext">
                      <th className="py-3.5 px-4 font-normal">Student</th>
                      <th className="py-3.5 px-4 font-normal">Progress</th>
                      <th className="py-3.5 px-4 font-normal">Attendance</th>
                      <th className="py-3.5 px-4 font-normal">Assignments</th>
                      <th className="py-3.5 px-4 font-normal">Last Active</th>
                      <th className="py-3.5 px-4 font-normal">Status</th>
                      <th className="py-3.5 px-4 font-normal text-right">Assignment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredStudents.map((student) => {
                      const perf = selectedCourseId === "ALL"
                        ? Object.values(student.courses)[0]
                        : student.courses[selectedCourseId];

                      if (!perf) return null;

                      const pendingCount = perf.assignments.filter((a) => a.status === "Pending Review").length;
                      const submittedCount = perf.assignments.filter((a) => a.status === "Submitted" || a.status === "Graded" || a.status === "Pending Review").length;
                      const totalAsg = perf.assignments.length || 4;

                      // Status Styling (Subtle & clean)
                      const statusColor = {
                        Excellent: "text-emerald-400 bg-emerald-500/10",
                        "On Track": "text-subtext bg-white/[0.04]",
                        "Needs Attention": "text-amber-400 bg-amber-500/10",
                        Inactive: "text-subtext/60 bg-white/[0.02]",
                      }[student.status];

                      return (
                        <tr
                          key={student.id}
                          onClick={() => handleOpenStudentDrawer(student, perf.courseId)}
                          className="hover:bg-white/[0.02] cursor-pointer transition-colors group h-16"
                        >
                          {/* Student */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-border/80 text-text font-semibold text-xs flex items-center justify-center shrink-0">
                                {student.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-text group-hover:text-primary transition-colors truncate">
                                  {student.name}
                                </div>
                                <div className="text-[11px] text-subtext truncate">{student.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Progress */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="space-y-1.5 w-24">
                              <div className="font-medium text-text text-xs">{perf.progress}%</div>
                              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${perf.progress}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Attendance */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`font-medium ${perf.attendanceRate < 75 ? "text-rose-400" : "text-text"}`}>
                              {perf.attendanceRate}%
                            </span>
                          </td>

                          {/* Assignments */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {pendingCount > 0 ? (
                              <span className="font-medium text-amber-400">
                                {pendingCount} Pending
                              </span>
                            ) : (
                              <span className="text-subtext font-normal">
                                {submittedCount} / {totalAsg}
                              </span>
                            )}
                          </td>

                          {/* Last Active */}
                          <td className="py-3 px-4 text-subtext whitespace-nowrap">
                            {student.lastActive}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${statusColor}`}>
                              {student.status}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              {pendingCount > 0 ? (
                                <button
                                  onClick={() => {
                                    const pendingAsg = perf.assignments.find((a) => a.status === "Pending Review") || perf.assignments[0];
                                    handleOpenReviewModal(student, pendingAsg, perf.courseId, perf.courseTitle);
                                  }}
                                  className="px-3 py-1 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                                >
                                  Review
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenStudentDrawer(student, perf.courseId)}
                                  className="px-2.5 py-1 text-subtext hover:text-text hover:bg-white/[0.04] rounded-lg text-xs font-medium transition-colors"
                                >
                                  View
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="block sm:hidden divide-y divide-border/40">
                {filteredStudents.map((student) => {
                  const perf = selectedCourseId === "ALL"
                    ? Object.values(student.courses)[0]
                    : student.courses[selectedCourseId];

                  if (!perf) return null;
                  const pendingCount = perf.assignments.filter((a) => a.status === "Pending Review").length;

                  return (
                    <div
                      key={student.id}
                      onClick={() => handleOpenStudentDrawer(student, perf.courseId)}
                      className="p-4 space-y-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-border text-text font-semibold text-xs flex items-center justify-center shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-text">{student.name}</div>
                            <div className="text-[10px] text-subtext">{student.email}</div>
                          </div>
                        </div>

                        <span className="text-[10px] font-medium text-subtext px-2 py-0.5 rounded bg-white/[0.04]">
                          {student.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-subtext pt-1">
                        <div>Progress: <strong className="text-text font-medium">{perf.progress}%</strong></div>
                        <div>Attendance: <strong className="text-text font-medium">{perf.attendanceRate}%</strong></div>
                        <div>Active: <span className="text-text">{student.lastActive}</span></div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-subtext">
                          Assignments: {perf.assignments.filter(a => a.status === "Graded" || a.status === "Submitted").length}/{perf.assignments.length}
                        </span>

                        {pendingCount > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const pendingAsg = perf.assignments.find((a) => a.status === "Pending Review") || perf.assignments[0];
                              handleOpenReviewModal(student, pendingAsg, perf.courseId, perf.courseTitle);
                            }}
                            className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-semibold"
                          >
                            Review ({pendingCount})
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenStudentDrawer(student, perf.courseId);
                            }}
                            className="px-2.5 py-1 text-subtext hover:text-text rounded-lg text-xs font-medium"
                          >
                            View →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          6. STUDENT DETAIL DRAWER (Clean SaaS Slide-In)
          ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedStudentForDrawer && drawerPerformance && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentForDrawer(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-2xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg h-full bg-card border-l border-border shadow-2xl z-10 flex flex-col overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border p-5 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-border text-text font-bold text-sm flex items-center justify-center shrink-0">
                    {selectedStudentForDrawer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text">{selectedStudentForDrawer.name}</h3>
                    <p className="text-xs text-subtext">{selectedStudentForDrawer.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudentForDrawer(null)}
                  className="p-1.5 text-subtext hover:text-text rounded-lg hover:bg-white/[0.04]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6 flex-1 text-xs">
                {/* Course Switcher */}
                <div className="p-3 bg-white/[0.02] border border-border rounded-xl flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-subtext font-medium block">COURSE</span>
                    <span className="font-semibold text-text">{drawerPerformance.courseTitle}</span>
                  </div>

                  {Object.keys(selectedStudentForDrawer.courses).length > 1 && (
                    <select
                      value={activeDrawerCourseId}
                      onChange={(e) => setActiveDrawerCourseId(e.target.value)}
                      className="bg-card border border-border text-xs font-medium text-text rounded-lg px-2.5 py-1 focus:outline-none"
                    >
                      {Object.entries(selectedStudentForDrawer.courses).map(([cId, perf]) => (
                        <option key={cId} value={cId}>
                          {perf.courseTitle}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* ── 1. LEARNING PROGRESS ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text">LEARNING PROGRESS</span>
                    <span className="text-sm font-bold text-primary">{drawerPerformance.progress}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${drawerPerformance.progress}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-border text-center">
                      <span className="text-[11px] text-subtext block">Modules Completed</span>
                      <span className="text-sm font-bold text-text mt-0.5">
                        {drawerPerformance.modulesCompleted} / {drawerPerformance.totalModules}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-border text-center">
                      <span className="text-[11px] text-subtext block">Lessons Completed</span>
                      <span className="text-sm font-bold text-text mt-0.5">
                        {drawerPerformance.lessonsCompleted} / {drawerPerformance.totalLessons}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── 2. ATTENDANCE ── */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text">ATTENDANCE</span>
                    <span className={`text-sm font-bold ${
                      drawerPerformance.attendanceRate >= 85 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {drawerPerformance.attendanceRate}%
                    </span>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-border rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-text">
                        {drawerPerformance.attendedClasses} of {drawerPerformance.totalClasses} classes attended
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-subtext">
                        <span>Attended: {drawerPerformance.attendedClasses}</span>
                        <span>·</span>
                        <span>Missed: {drawerPerformance.totalClasses - drawerPerformance.attendedClasses}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setAttendanceModalStudent({ student: selectedStudentForDrawer, courseId: activeDrawerCourseId })}
                      className="px-2.5 py-1 text-xs font-medium text-subtext hover:text-text border border-border rounded-lg hover:bg-white/[0.04]"
                    >
                      View Attendance
                    </button>
                  </div>
                </div>

                {/* ── 3. ASSIGNMENTS ── */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text">ASSIGNMENTS</span>
                    <span className="text-[11px] text-subtext">
                      {drawerPerformance.assignments.filter(a => a.status === "Graded" || a.status === "Submitted").length} Submitted · {drawerPerformance.assignments.filter(a => a.status === "Pending Review").length} Pending
                    </span>
                  </div>

                  <div className="space-y-2">
                    {drawerPerformance.assignments.map((asg) => (
                      <div
                        key={asg.id}
                        className="p-3 bg-white/[0.02] border border-border rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-text truncate">{asg.title}</h4>
                          <span className="text-[11px] text-subtext block">
                            {asg.status === "Graded" && asg.score !== null ? `Score: ${asg.score}/${asg.totalMarks}` : asg.status}
                          </span>
                        </div>

                        <div>
                          {asg.status === "Pending Review" ? (
                            <button
                              onClick={() => handleOpenReviewModal(selectedStudentForDrawer, asg, drawerPerformance.courseId, drawerPerformance.courseTitle)}
                              className="px-2.5 py-1 bg-primary text-white rounded-lg text-xs font-semibold"
                            >
                              Review
                            </button>
                          ) : asg.status === "Graded" ? (
                            <button
                              onClick={() => handleOpenReviewModal(selectedStudentForDrawer, asg, drawerPerformance.courseId, drawerPerformance.courseTitle)}
                              className="px-2 py-1 text-subtext hover:text-text text-xs"
                            >
                              View
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── 4. RECENT ACTIVITY ── */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-text block">RECENT ACTIVITY</span>

                  {drawerPerformance.recentActivities.length === 0 ? (
                    <p className="text-subtext italic">No recent activity recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {drawerPerformance.recentActivities.map((act) => (
                        <div key={act.id} className="p-2.5 bg-white/[0.02] border border-border/80 rounded-xl flex items-center justify-between">
                          <span className="text-text font-normal truncate max-w-[260px]">{act.title}</span>
                          <span className="text-[10px] text-subtext shrink-0">{act.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
          7. ASSIGNMENT REVIEW MODAL
          ═══════════════════════════════════════════════ */}
      {reviewModalData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                  Review Submission · {reviewModalData.courseTitle}
                </span>
                <h3 className="text-base font-bold text-text">{reviewModalData.assignment.title}</h3>
                <p className="text-xs text-subtext font-medium">
                  {reviewModalData.student.name} ({reviewModalData.student.email})
                </p>
              </div>
              <button
                onClick={() => setReviewModalData(null)}
                className="p-1.5 text-subtext hover:text-text rounded-lg hover:bg-white/[0.04]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Submission Content */}
            <div className="p-3.5 bg-white/[0.02] border border-border rounded-xl space-y-2 text-xs">
              <span className="text-[10px] font-semibold text-subtext uppercase">Submitted Response</span>
              <p className="text-text font-normal leading-relaxed">
                {reviewModalData.assignment.submittedText || "Student submitted project archive and repository links."}
              </p>

              {reviewModalData.assignment.submittedFileName && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-border rounded-lg text-xs font-medium text-primary mt-1">
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{reviewModalData.assignment.submittedFileName}</span>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-text">Score (Out of {reviewModalData.assignment.totalMarks})</label>
                  <span className="font-bold text-primary">{reviewScoreInput} / 100</span>
                </div>
                <input
                  type="number"
                  max={100}
                  min={0}
                  value={reviewScoreInput}
                  onChange={(e) => setReviewScoreInput(Number(e.target.value))}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Feedback Comments</label>
                <textarea
                  rows={3}
                  value={reviewFeedbackInput}
                  onChange={(e) => setReviewFeedbackInput(e.target.value)}
                  placeholder="Provide constructive feedback..."
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary placeholder:text-subtext"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              {onNavigateToAssignments && (
                <button
                  onClick={() => {
                    setReviewModalData(null);
                    onNavigateToAssignments({
                      courseId: reviewModalData.courseId,
                      courseTitle: reviewModalData.courseTitle,
                      studentEmail: reviewModalData.student.email,
                      assignmentId: reviewModalData.assignment.id,
                    });
                  }}
                  className="text-xs text-subtext hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span>Open in Assignments</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setReviewModalData(null)}
                  className="px-3 py-1.5 text-subtext hover:text-text text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGrade}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-xs transition-colors"
                >
                  Save Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          8. ATTENDANCE BREAKDOWN MODAL
          ═══════════════════════════════════════════════ */}
      {attendanceModalStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Attendance Details</span>
                <h3 className="text-base font-bold text-text">{attendanceModalStudent.student.name}</h3>
                <p className="text-xs text-subtext">
                  {attendanceModalStudent.student.courses[attendanceModalStudent.courseId]?.courseTitle}
                </p>
              </div>
              <button
                onClick={() => setAttendanceModalStudent(null)}
                className="p-1.5 text-subtext hover:text-text rounded-lg hover:bg-white/[0.04]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto divide-y divide-border/40">
              {attendanceModalStudent.student.courses[attendanceModalStudent.courseId]?.liveSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-text">{sess.title}</div>
                    <div className="text-[10px] text-subtext">{sess.date} at {sess.time}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    sess.status === "Attended"
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-rose-400 bg-rose-500/10"
                  }`}>
                    {sess.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              {onNavigateToLiveSessions && (
                <button
                  onClick={() => {
                    setAttendanceModalStudent(null);
                    onNavigateToLiveSessions();
                  }}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Manage Live Sessions <ArrowRight className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => setAttendanceModalStudent(null)}
                className="px-3 py-1.5 text-subtext hover:text-text text-xs ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
