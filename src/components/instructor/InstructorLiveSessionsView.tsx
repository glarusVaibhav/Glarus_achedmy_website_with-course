"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  X,
  PlayCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Share2,
  Copy,
  SlidersHorizontal,
  Filter,
  Sparkles,
  Check,
  CalendarDays,
  Radio,
  Search,
  Layers,
  ArrowRight,
  CheckSquare,
  Users,
  AlertCircle,
  RefreshCw,
  Info,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  ExternalLink,
  BookOpen,
  Lock,
  Unlock,
  Edit3,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   TYPES & DATA MODELS
   ═══════════════════════════════════════════════════════════════ */

export type AssignmentStatus =
  | "ACTION_REQUIRED" // Admin assigned, needs instructor acceptance
  | "ACCEPTED"        // Accepted by instructor
  | "RESCHEDULE_PENDING"; // Reschedule requested to Admin

export type LiveExecutionStatus =
  | "LIVE_NOW"
  | "UPCOMING"
  | "COMPLETED"
  | "CANCELLED";

export interface StudentAttendee {
  id: string;
  name: string;
  email: string;
  status: "Present" | "Late" | "Absent" | "Enrolled";
  totalAttended: number;
}

export interface ClassAgendaStep {
  stepNumber: string;
  timeRange: string;
  title: string;
  description: string;
}

export interface AdminAssignedSession {
  id: string;
  sessionCode: string; // e.g. "Session 04"
  sessionNumber: number;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  cohortBadge: string;
  batchName: string;
  date: string; // YYYY-MM-DD
  displayDate: string;
  isToday?: boolean;
  startTime: string;
  endTime: string;
  duration: string;
  meetingUrl: string;
  
  // Admin Assignment Workflow
  assignedBy: string;
  assignedAt: string;
  assignmentStatus: AssignmentStatus;
  executionStatus: LiveExecutionStatus;
  
  // Admin Lock & Edit Permissions
  editPermissionStatus?: "LOCKED" | "REQUEST_PENDING" | "UNLOCKED";
  editPermissionGrantedBy?: string;
  editPermissionGrantedAt?: string;
  editLockReason?: string;
  
  // Reschedule Info
  rescheduleReason?: string;
  requestedNewDate?: string;
  requestedNewTime?: string;
  
  // Enrolled Students
  enrolledStudentsCount: number;
  students: StudentAttendee[];
  
  // Agenda
  agenda: ClassAgendaStep[];
  topics: string[];
  
  // Post-Class Stats
  attendance?: {
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
  recordingUrl?: string;
  recordingStatus?: "available" | "processing" | "unavailable";
  
  // Compensation & Details
  compensationAmount: number;
  paymentStatus: "Pending" | "Processing" | "Paid";
  requirements: string[];
}

export interface InstructorCourseCohort {
  id: string;
  courseName: string;
  cohortBadge: string;
  tagline: string;
  category: string;
  totalSessions: number;
  totalStudents: number;
  averageAttendanceRate: number;
  sessions: AdminAssignedSession[];
}

/* ═══════════════════════════════════════════════════════════════
   SAMPLE DATA: 3 ADMIN-ASSIGNED LIVE COURSES (10 TOTAL SESSIONS)
   ═══════════════════════════════════════════════════════════════ */

const INITIAL_COHORTS: InstructorCourseCohort[] = [
  {
    id: "cohort-genai",
    courseName: "Generative AI & LLM Systems",
    cohortBadge: "Weekend Cohort #4",
    tagline: "Advanced LLM Architectures, RAG & Autonomous Agents",
    category: "Generative AI",
    totalSessions: 7,
    totalStudents: 42,
    averageAttendanceRate: 88,
    sessions: [
      {
        id: "genai-s1",
        sessionCode: "Session 01",
        sessionNumber: 1,
        title: "Introduction to Transformer Attention Architectures",
        description: "Mathematical foundations of self-attention, scaled dot-product attention, and PyTorch tensors.",
        courseId: "cohort-genai",
        courseName: "Generative AI & LLM Systems",
        cohortBadge: "Weekend Cohort #4",
        batchName: "Weekend AI Class #4",
        date: "2026-08-01",
        displayDate: "01 Aug",
        isToday: false,
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/sample-genai-s1",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-07-20",
        assignmentStatus: "ACCEPTED",
        executionStatus: "COMPLETED",
        enrolledStudentsCount: 42,
        compensationAmount: 5000,
        paymentStatus: "Paid",
        recordingUrl: "https://example.com/recordings/genai-s1",
        recordingStatus: "available",
        attendance: { present: 40, absent: 2, late: 0, rate: 95.2 },
        topics: ["Self-Attention", "Transformer Math", "PyTorch"],
        requirements: ["Prepare GPU environment for live pair-programming", "Record session in 1080p"],
        agenda: [
          { stepNumber: "01", timeRange: "10:00 – 10:15", title: "Welcome & Milestones", description: "Cohort introduction and setup checks." },
          { stepNumber: "02", timeRange: "10:15 – 10:45", title: "Transformer Math Breakdown", description: "Scaled dot-product attention step-by-step." },
          { stepNumber: "03", timeRange: "10:45 – 11:15", title: "PyTorch Live Implementation", description: "Building multi-head attention module." },
          { stepNumber: "04", timeRange: "11:15 – 11:30", title: "Q&A & Student Code Review", description: "Live debugging with learners." }
        ],
        students: [
          { id: "st-1", name: "Rahul Sharma", email: "rahul.s@example.com", status: "Present", totalAttended: 4 },
          { id: "st-2", name: "Priya Patel", email: "priya.p@example.com", status: "Present", totalAttended: 4 },
          { id: "st-3", name: "Aman Verma", email: "aman.v@example.com", status: "Absent", totalAttended: 3 }
        ]
      },
      {
        id: "genai-s2",
        sessionCode: "Session 02",
        sessionNumber: 2,
        title: "LLM Fundamentals & Pre-training",
        description: "BPE tokenizers, vocabulary matrices, autoregressive sampling, and training loss landscapes.",
        courseId: "cohort-genai",
        courseName: "Generative AI & LLM Systems",
        cohortBadge: "Weekend Cohort #4",
        batchName: "Weekend AI Class #4",
        date: "2026-08-04",
        displayDate: "04 Aug",
        isToday: false,
        startTime: "10:00 AM",
        endTime: "11:45 AM",
        duration: "105 min",
        meetingUrl: "https://zoom.us/j/sample-genai-s2",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-07-22",
        assignmentStatus: "ACCEPTED",
        executionStatus: "COMPLETED",
        enrolledStudentsCount: 42,
        compensationAmount: 5000,
        paymentStatus: "Paid",
        recordingUrl: "https://example.com/recordings/genai-s2",
        recordingStatus: "available",
        attendance: { present: 39, absent: 2, late: 1, rate: 92.8 },
        topics: ["Tokenizers", "BPE", "Sampling Parameters"],
        requirements: ["Demonstrate multilingual token splits", "Run tokenizer playground"],
        agenda: [
          { stepNumber: "01", timeRange: "10:00 – 10:25", title: "Byte-Pair Encoding", description: "Vocab matrix and special tokens." },
          { stepNumber: "02", timeRange: "10:25 – 11:10", title: "Pre-training at Scale", description: "Compute clusters and scaling laws." },
          { stepNumber: "03", timeRange: "11:10 – 11:45", title: "Sampling Control", description: "Hands-on generation experiments." }
        ],
        students: [
          { id: "st-1", name: "Rahul Sharma", email: "rahul.s@example.com", status: "Present", totalAttended: 4 },
          { id: "st-2", name: "Priya Patel", email: "priya.p@example.com", status: "Present", totalAttended: 4 }
        ]
      },
      {
        id: "genai-s3",
        sessionCode: "Session 03",
        sessionNumber: 3,
        title: "Prompt Engineering & Few-Shot Reasoning",
        description: "Chain-of-thought, structured JSON parsing, and DSPy automated prompt compiling.",
        courseId: "cohort-genai",
        courseName: "Generative AI & LLM Systems",
        cohortBadge: "Weekend Cohort #4",
        batchName: "Weekend AI Class #4",
        date: "2026-08-10",
        displayDate: "10 Aug",
        isToday: false,
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/sample-genai-s3",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-07-28",
        assignmentStatus: "ACCEPTED",
        executionStatus: "COMPLETED",
        enrolledStudentsCount: 42,
        compensationAmount: 5000,
        paymentStatus: "Processing",
        recordingUrl: "https://example.com/recordings/genai-s3",
        recordingStatus: "available",
        attendance: { present: 38, absent: 3, late: 1, rate: 90.5 },
        topics: ["Chain-of-Thought", "DSPy", "Pydantic Schemas"],
        requirements: ["Share DSPy demo repo", "Test structured output validators"],
        agenda: [
          { stepNumber: "01", timeRange: "10:00 – 10:30", title: "Reasoning Elicitation", description: "Chain-of-thought vs reflection loops." },
          { stepNumber: "02", timeRange: "10:30 – 11:00", title: "Structured JSON Output Parsing", description: "Enforcing Pydantic schemas." },
          { stepNumber: "03", timeRange: "11:00 – 11:30", title: "DSPy Optimization", description: "Compiling prompts using teleprompter." }
        ],
        students: [
          { id: "st-1", name: "Rahul Sharma", email: "rahul.s@example.com", status: "Present", totalAttended: 4 }
        ]
      },
      {
        id: "genai-s4",
        sessionCode: "Session 04",
        sessionNumber: 4,
        title: "RAG & Vector Databases",
        description: "Implementing hierarchical chunking, dense vs sparse hybrid search, and production reranking.",
        courseId: "cohort-genai",
        courseName: "Generative AI & LLM Systems",
        cohortBadge: "Weekend Cohort #4",
        batchName: "Weekend AI Class #4",
        date: "2026-08-17",
        displayDate: "Today (17 Aug)",
        isToday: true,
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/live-rag-vector-db-teaching-room",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-08-01",
        assignmentStatus: "ACCEPTED",
        executionStatus: "LIVE_NOW",
        enrolledStudentsCount: 42,
        compensationAmount: 5000,
        paymentStatus: "Pending",
        topics: ["RAG Architecture", "Vector Embeddings", "Hybrid Search", "Cohere Rerank"],
        requirements: ["Host live meeting on Zoom", "Ensure breakout rooms for paired exercise are active"],
        agenda: [
          { stepNumber: "01", timeRange: "10:00 – 10:15", title: "Introduction to RAG", description: "Why naive RAG fails in production." },
          { stepNumber: "02", timeRange: "10:15 – 10:35", title: "Embeddings & Semantic Search", description: "Comparing Voyage, OpenAI, and BGE models." },
          { stepNumber: "03", timeRange: "10:35 – 10:55", title: "Vector Databases & Indexing", description: "Pinecone dense + BM25 sparse hybrid retrieval." },
          { stepNumber: "04", timeRange: "10:55 – 11:15", title: "Building a Retrieval Pipeline", description: "Live code walkthrough with LangChain." },
          { stepNumber: "05", timeRange: "11:15 – 11:30", title: "Live Q&A & Debugging", description: "Answering student questions and code errors." }
        ],
        students: [
          { id: "st-1", name: "Rahul Sharma", email: "rahul.s@example.com", status: "Present", totalAttended: 4 },
          { id: "st-2", name: "Priya Patel", email: "priya.p@example.com", status: "Present", totalAttended: 4 },
          { id: "st-3", name: "Aman Verma", email: "aman.v@example.com", status: "Present", totalAttended: 3 }
        ]
      },
      {
        id: "genai-s5",
        sessionCode: "Session 05",
        sessionNumber: 5,
        title: "AI Agents & Autonomous Multi-Agent Tool Calling",
        description: "Designing stateful multi-agent workflows with memory, tool selection, and error recovery.",
        courseId: "cohort-genai",
        courseName: "Generative AI & LLM Systems",
        cohortBadge: "Weekend Cohort #4",
        batchName: "Weekend AI Class #4",
        date: "2026-08-20",
        displayDate: "20 Aug",
        isToday: false,
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/sample-genai-s5",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-08-14",
        assignmentStatus: "ACTION_REQUIRED", // Action required by instructor
        executionStatus: "UPCOMING",
        enrolledStudentsCount: 42,
        compensationAmount: 5000,
        paymentStatus: "Pending",
        topics: ["CrewAI", "Function Calling", "Agent Memory", "Tool Orchestration"],
        requirements: ["Review and accept assignment before start", "Verify CrewAI environment"],
        agenda: [
          { stepNumber: "01", timeRange: "10:00 – 10:20", title: "ReAct Agent Framework", description: "Reasoning and acting loop internals." },
          { stepNumber: "02", timeRange: "10:20 – 11:00", title: "Multi-Agent Coordination", description: "Hierarchical vs sequential crew topologies." },
          { stepNumber: "03", timeRange: "11:00 – 11:30", title: "Human-in-the-Loop Safeguards", description: "Approval gates and budget limits." }
        ],
        students: [
          { id: "st-1", name: "Rahul Sharma", email: "rahul.s@example.com", status: "Enrolled", totalAttended: 4 }
        ]
      },
      {
        id: "genai-s6",
        sessionCode: "Session 06",
        sessionNumber: 6,
        title: "Advanced Agent Architecture & LoRA Tuning",
        description: "Parameter-efficient fine-tuning on custom enterprise datasets using Hugging Face TRL.",
        courseId: "cohort-genai",
        courseName: "Generative AI & LLM Systems",
        cohortBadge: "Weekend Cohort #4",
        batchName: "Weekend AI Class #4",
        date: "2026-08-24",
        displayDate: "24 Aug",
        isToday: false,
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/sample-genai-s6",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-08-10",
        assignmentStatus: "ACCEPTED",
        executionStatus: "UPCOMING",
        enrolledStudentsCount: 42,
        compensationAmount: 5000,
        paymentStatus: "Pending",
        topics: ["PEFT", "LoRA", "QLoRA 4-bit"],
        requirements: ["Prepare GPU notebook demo"],
        agenda: [
          { stepNumber: "01", timeRange: "10:00 – 10:25", title: "When to Fine-Tune vs RAG", description: "Decision matrix." },
          { stepNumber: "02", timeRange: "10:25 – 11:30", title: "4-bit Quantization", description: "Attention projection tuning." }
        ],
        students: [{ id: "st-1", name: "Rahul Sharma", email: "rahul.s@example.com", status: "Enrolled", totalAttended: 4 }]
      },
      {
        id: "genai-s7",
        sessionCode: "Session 07",
        sessionNumber: 7,
        title: "Final Project Workshop & Graduation Showcase",
        description: "Deploying vLLM inference servers, automated evaluation with Ragas, and final showcase.",
        courseId: "cohort-genai",
        courseName: "Generative AI & LLM Systems",
        cohortBadge: "Weekend Cohort #4",
        batchName: "Weekend AI Class #4",
        date: "2026-08-27",
        displayDate: "27 Aug",
        isToday: false,
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/sample-genai-s7",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-08-10",
        assignmentStatus: "ACCEPTED",
        executionStatus: "UPCOMING",
        enrolledStudentsCount: 42,
        compensationAmount: 5000,
        paymentStatus: "Pending",
        topics: ["vLLM Server", "Ragas Evaluation", "Capstone"],
        requirements: ["Conduct final project evaluations"],
        agenda: [
          { stepNumber: "01", timeRange: "10:00 – 10:30", title: "LLM Evaluation", description: "Measuring faithfulness and hallucination." },
          { stepNumber: "02", timeRange: "10:30 – 11:30", title: "Graduation Showcase", description: "Capstone review and feedback." }
        ],
        students: [{ id: "st-1", name: "Rahul Sharma", email: "rahul.s@example.com", status: "Enrolled", totalAttended: 4 }]
      },
      {
        id: "genai-s-jul",
        sessionCode: "Kickoff Session",
        sessionNumber: 0,
        title: "Orientation & CUDA Environment Setup",
        description: "CUDA verification, Hugging Face auth tokens, and syllabus walkthrough.",
        courseId: "cohort-genai",
        courseName: "Generative AI & LLM Systems",
        cohortBadge: "Weekend Cohort #4",
        batchName: "Weekend AI Class #4",
        date: "2026-07-25",
        displayDate: "25 Jul",
        isToday: false,
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/sample-genai-jul",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-07-10",
        assignmentStatus: "ACCEPTED",
        executionStatus: "COMPLETED",
        enrolledStudentsCount: 42,
        compensationAmount: 5000,
        paymentStatus: "Paid",
        topics: ["Environment Setup", "CUDA", "Hugging Face"],
        requirements: ["Confirm Python 3.11 virtualenv"],
        agenda: [{ stepNumber: "01", timeRange: "10:00 – 11:30", title: "Cohort Kickoff", description: "Onboarding and tools installation." }],
        students: [{ id: "st-1", name: "Rahul Sharma", email: "rahul.s@example.com", status: "Present", totalAttended: 1 }]
      },
      {
        id: "genai-s-sep1",
        sessionCode: "Session 08",
        sessionNumber: 8,
        title: "Autonomous Multi-Agent Enterprise Production System",
        description: "Building production LangGraph architectures with human-in-the-loop review.",
        courseId: "cohort-genai",
        courseName: "Generative AI & LLM Systems",
        cohortBadge: "Weekend Cohort #4",
        batchName: "Weekend AI Class #4",
        date: "2026-09-05",
        displayDate: "05 Sep",
        isToday: false,
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/sample-genai-sep1",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-08-15",
        assignmentStatus: "ACCEPTED",
        executionStatus: "UPCOMING",
        enrolledStudentsCount: 42,
        compensationAmount: 5000,
        paymentStatus: "Pending",
        topics: ["LangGraph", "Multi-Agent", "Production Deployment"],
        requirements: ["Live demo on AWS ECS"],
        agenda: [{ stepNumber: "01", timeRange: "10:00 – 11:30", title: "LangGraph Deep Dive", description: "State charts and distributed graphs." }],
        students: [{ id: "st-1", name: "Rahul Sharma", email: "rahul.s@example.com", status: "Enrolled", totalAttended: 4 }]
      },
      {
        id: "genai-s-sep2",
        sessionCode: "Session 09",
        sessionNumber: 9,
        title: "Advanced Model Distillation & Edge Deployment",
        description: "Quantization-Aware Training (QAT) and ONNX export for mobile and edge devices.",
        courseId: "cohort-genai",
        courseName: "Generative AI & LLM Systems",
        cohortBadge: "Weekend Cohort #4",
        batchName: "Weekend AI Class #4",
        date: "2026-09-12",
        displayDate: "12 Sep",
        isToday: false,
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/sample-genai-sep2",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-08-15",
        assignmentStatus: "ACCEPTED",
        executionStatus: "UPCOMING",
        enrolledStudentsCount: 42,
        compensationAmount: 5000,
        paymentStatus: "Pending",
        topics: ["Distillation", "ONNX", "Edge Inference"],
        requirements: ["Prepare ONNX runtime notebook"],
        agenda: [{ stepNumber: "01", timeRange: "10:00 – 11:30", title: "Knowledge Distillation", description: "Teacher-student training loop." }],
        students: [{ id: "st-1", name: "Rahul Sharma", email: "rahul.s@example.com", status: "Enrolled", totalAttended: 4 }]
      }
    ]
  },
  {
    id: "cohort-aiauto",
    courseName: "AI Automation Engineer",
    cohortBadge: "Evening Batch #2",
    tagline: "Enterprise Workflow Automation with LangGraph & n8n",
    category: "Workflow Automation",
    totalSessions: 10,
    totalStudents: 35,
    averageAttendanceRate: 94,
    sessions: [
      {
        id: "aiauto-s1",
        sessionCode: "Session 01",
        sessionNumber: 1,
        title: "Autonomous Agent Architectures & Tool Use",
        description: "Foundations of building AI automations with Python and webhook event triggers.",
        courseId: "cohort-aiauto",
        courseName: "Mastering Agentic AI & Autonomous Workflows",
        cohortBadge: "Evening Batch #2",
        batchName: "Evening Automation Cohort #2",
        date: "2026-07-28",
        displayDate: "28 Jul",
        isToday: false,
        startTime: "02:00 PM",
        endTime: "03:30 PM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/sample-aiauto-s1",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-07-20",
        assignmentStatus: "ACCEPTED",
        executionStatus: "COMPLETED",
        enrolledStudentsCount: 45,
        compensationAmount: 4500,
        paymentStatus: "Paid",
        recordingUrl: "https://example.com/recordings/aiauto-s1",
        recordingStatus: "available",
        attendance: { present: 43, absent: 2, late: 0, rate: 95.5 },
        topics: ["Webhooks", "JSON Schema", "Tools"],
        requirements: ["Demonstrate live webhook listener"],
        agenda: [
          { stepNumber: "01", timeRange: "02:00 – 02:30", title: "Webhook Trigger Setup", description: "Configuring real-time ingestion pipelines." },
          { stepNumber: "02", timeRange: "02:30 – 03:30", title: "Tool Calling in Python", description: "Structured function calling." }
        ],
        students: [{ id: "st-10", name: "Siddharth Roy", email: "sid.r@example.com", status: "Present", totalAttended: 5 }]
      },
      {
        id: "aiauto-s6-comp",
        sessionCode: "Session 06",
        sessionNumber: 6,
        title: "Vector Embeddings & Semantic Search Masterclass",
        description: "Hierarchical vector retrieval, embedding dimensionality, and cosine similarity rankings in production.",
        courseId: "cohort-aiauto",
        courseName: "Mastering Agentic AI & Autonomous Workflows",
        cohortBadge: "Evening Batch #2",
        batchName: "Evening Automation Cohort #2",
        date: "2026-08-02",
        displayDate: "02 Aug",
        isToday: false,
        startTime: "02:00 PM",
        endTime: "04:00 PM",
        duration: "120 min",
        meetingUrl: "https://zoom.us/j/sample-aiauto-s6-comp",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-07-25",
        assignmentStatus: "ACCEPTED",
        executionStatus: "COMPLETED",
        enrolledStudentsCount: 44,
        compensationAmount: 5000,
        paymentStatus: "Paid",
        recordingUrl: "https://example.com/recordings/aiauto-s6",
        recordingStatus: "available",
        attendance: { present: 41, absent: 3, late: 0, rate: 92.0 },
        topics: ["Vector Embeddings", "Semantic Search", "Qdrant", "HNSW Indexing"],
        requirements: ["Provide vector embedding sample notebook"],
        agenda: [
          { stepNumber: "01", timeRange: "02:00 – 02:45", title: "Dense Vectors & Embeddings", description: "Cosine math and metric spaces." },
          { stepNumber: "02", timeRange: "02:45 – 03:30", title: "Vector DB Configuration", description: "Indexing with HNSW in Qdrant." },
          { stepNumber: "03", timeRange: "03:30 – 04:00", title: "Semantic Retrieval Evaluation", description: "MRR & Hit-Rate benchmarks." }
        ],
        students: [{ id: "st-10", name: "Siddharth Roy", email: "sid.r@example.com", status: "Present", totalAttended: 5 }]
      },
      {
        id: "aiauto-s7-comp",
        sessionCode: "Session 07",
        sessionNumber: 7,
        title: "Introduction to Agentic ReAct Loops & Tools",
        description: "Autonomous reasoning and action cycles, structured tool handshakes, and hallucination safeguards.",
        courseId: "cohort-aiauto",
        courseName: "Mastering Agentic AI & Autonomous Workflows",
        cohortBadge: "Evening Batch #2",
        batchName: "Evening Automation Cohort #2",
        date: "2026-08-05",
        displayDate: "05 Aug",
        isToday: false,
        startTime: "02:00 PM",
        endTime: "04:00 PM",
        duration: "120 min",
        meetingUrl: "https://zoom.us/j/sample-aiauto-s7-comp",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-07-28",
        assignmentStatus: "ACCEPTED",
        executionStatus: "COMPLETED",
        enrolledStudentsCount: 45,
        compensationAmount: 5000,
        paymentStatus: "Paid",
        recordingUrl: "https://example.com/recordings/aiauto-s7",
        recordingStatus: "available",
        attendance: { present: 43, absent: 2, late: 0, rate: 95.0 },
        topics: ["ReAct Patterns", "Dynamic Tool Registries", "Planning Loops", "Memory"],
        requirements: ["Test multi-step agent demo"],
        agenda: [
          { stepNumber: "01", timeRange: "02:00 – 02:40", title: "ReAct Architecture Principles", description: "Thought-Action-Observation loops." },
          { stepNumber: "02", timeRange: "02:40 – 03:20", title: "Tool Execution Sandboxing", description: "Safe execution of code & API tools." },
          { stepNumber: "03", timeRange: "03:20 – 04:00", title: "Multi-turn Memory Buffers", description: "Preserving state across conversations." }
        ],
        students: [{ id: "st-10", name: "Siddharth Roy", email: "sid.r@example.com", status: "Present", totalAttended: 5 }]
      },
      {
        id: "aiauto-s6",
        sessionCode: "Session 08",
        sessionNumber: 8,
        title: "Multi-Agent Systems & Swarm Architecture",
        description: "Coordinating multi-agent teams with shared memory checkpoints and dynamic task handoffs.",
        courseId: "cohort-aiauto",
        courseName: "Mastering Agentic AI & Autonomous Workflows",
        cohortBadge: "Evening Batch #2",
        batchName: "Evening Automation Cohort #2",
        date: "2026-08-17",
        displayDate: "Today (17 Aug)",
        isToday: true,
        startTime: "02:00 PM",
        endTime: "03:30 PM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/live-aiauto-s6",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-08-05",
        assignmentStatus: "ACCEPTED",
        executionStatus: "UPCOMING",
        enrolledStudentsCount: 45,
        compensationAmount: 4500,
        paymentStatus: "Pending",
        topics: ["LangGraph", "Swarm State", "Handoffs"],
        requirements: ["Prepare LangGraph visualizer"],
        agenda: [
          { stepNumber: "01", timeRange: "02:00 – 02:40", title: "State Graph Concepts", description: "Nodes and edges." },
          { stepNumber: "02", timeRange: "02:40 – 03:30", title: "Research Swarm", description: "Writer and critic agents." }
        ],
        students: [{ id: "st-10", name: "Siddharth Roy", email: "sid.r@example.com", status: "Enrolled", totalAttended: 5 }]
      }
    ]
  },
  {
    id: "cohort-mlops",
    courseName: "Applied Machine Learning & MLOps",
    cohortBadge: "Track #1",
    tagline: "Production ML Pipelines, Docker & Cloud Inference",
    category: "Machine Learning",
    totalSessions: 6,
    totalStudents: 28,
    averageAttendanceRate: 91,
    sessions: [
      {
        id: "mlops-s1",
        sessionCode: "Session 01",
        sessionNumber: 1,
        title: "Feature Stores & High-Throughput Ingestion",
        description: "Building production feature stores using Feast and DuckDB with low-latency key-value lookups.",
        courseId: "cohort-mlops",
        courseName: "Applied Machine Learning & MLOps",
        cohortBadge: "Track #1",
        batchName: "MLOps Track #1",
        date: "2026-08-03",
        displayDate: "03 Aug",
        isToday: false,
        startTime: "06:00 PM",
        endTime: "07:30 PM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/sample-mlops-s1",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-07-24",
        assignmentStatus: "ACCEPTED",
        executionStatus: "COMPLETED",
        enrolledStudentsCount: 28,
        compensationAmount: 5500,
        paymentStatus: "Paid",
        recordingUrl: "https://example.com/recordings/mlops-s1",
        recordingStatus: "available",
        attendance: { present: 27, absent: 1, late: 0, rate: 96.4 },
        topics: ["Feast Feature Store", "DuckDB", "Offline-Online Sync"],
        requirements: ["Deploy local Feast repository"],
        agenda: [
          { stepNumber: "01", timeRange: "06:00 – 06:40", title: "Feature Engineering at Scale", description: "Batch vs streaming features." },
          { stepNumber: "02", timeRange: "06:40 – 07:30", title: "Feast Entity & View Definitions", description: "Online Redis sync." }
        ],
        students: [{ id: "st-20", name: "Ananya Iyer", email: "ananya.i@example.com", status: "Present", totalAttended: 2 }]
      },
      {
        id: "mlops-s2",
        sessionCode: "Session 02",
        sessionNumber: 2,
        title: "PyTorch Model Training & Distributed GPU Sync",
        description: "Multi-GPU distributed training with DDP, mixed precision FP16/BF16, and gradient accumulation.",
        courseId: "cohort-mlops",
        courseName: "Applied Machine Learning & MLOps",
        cohortBadge: "Track #1",
        batchName: "MLOps Track #1",
        date: "2026-08-08",
        displayDate: "08 Aug",
        isToday: false,
        startTime: "06:00 PM",
        endTime: "07:45 PM",
        duration: "105 min",
        meetingUrl: "https://zoom.us/j/sample-mlops-s2",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-07-28",
        assignmentStatus: "ACCEPTED",
        executionStatus: "COMPLETED",
        enrolledStudentsCount: 28,
        compensationAmount: 5500,
        paymentStatus: "Paid",
        recordingUrl: "https://example.com/recordings/mlops-s2",
        recordingStatus: "available",
        attendance: { present: 25, absent: 3, late: 0, rate: 89.3 },
        topics: ["DistributedDataParallel", "Mixed Precision", "NCCL Backend"],
        requirements: ["Provide multi-GPU benchmark script"],
        agenda: [
          { stepNumber: "01", timeRange: "06:00 – 06:45", title: "DDP Internals", description: "AllReduce gradient synchronization." },
          { stepNumber: "02", timeRange: "06:45 – 07:45", title: "Torch Distributed Training Script", description: "Spawning multi-process workers." }
        ],
        students: [{ id: "st-20", name: "Ananya Iyer", email: "ananya.i@example.com", status: "Present", totalAttended: 2 }]
      },
      {
        id: "mlops-s3",
        sessionCode: "Session 03",
        sessionNumber: 3,
        title: "Model Containerization & Cloud Deployment",
        description: "Packaging PyTorch models with FastAPI, Docker containers, and GPU inference endpoints.",
        courseId: "cohort-mlops",
        courseName: "Applied Machine Learning & MLOps",
        cohortBadge: "Track #1",
        batchName: "MLOps Track #1",
        date: "2026-08-17",
        displayDate: "Today (17 Aug)",
        isToday: true,
        startTime: "06:00 PM",
        endTime: "07:30 PM",
        duration: "90 min",
        meetingUrl: "https://zoom.us/j/live-mlops-s3",
        assignedBy: "Academic Operations Team",
        assignedAt: "2026-08-06",
        assignmentStatus: "ACCEPTED",
        executionStatus: "UPCOMING",
        enrolledStudentsCount: 28,
        compensationAmount: 5500,
        paymentStatus: "Pending",
        topics: ["Docker", "FastAPI", "GPU Inference"],
        requirements: ["Verify AWS test credentials"],
        agenda: [
          { stepNumber: "01", timeRange: "06:00 – 06:40", title: "FastAPI Model Wrapper", description: "Inference endpoints." },
          { stepNumber: "02", timeRange: "06:40 – 07:30", title: "Multi-Stage Docker Builds", description: "Container optimization." }
        ],
        students: [{ id: "st-20", name: "Ananya Iyer", email: "ananya.i@example.com", status: "Enrolled", totalAttended: 2 }]
      }
    ]
  }
];

interface InstructorLiveSessionsViewProps {
  initialFilter?: {
    viewMode?: "COMMAND_CENTER" | "CALENDAR" | "RECORDINGS";
    courseFilter?: string;
    courseTitle?: string;
    returnTab?: string;
  } | null;
  onClearFilter?: () => void;
  onNavigateTab?: (tabName: string, filterOptions?: any) => void;
}

export function InstructorLiveSessionsView({
  initialFilter,
  onClearFilter,
  onNavigateTab
}: InstructorLiveSessionsViewProps) {
  const router = useRouter();

  const [cohorts, setCohorts] = useState<InstructorCourseCohort[]>(INITIAL_COHORTS);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"COMMAND_CENTER" | "CALENDAR" | "RECORDINGS">(
    initialFilter?.viewMode || "COMMAND_CENTER"
  );

  // Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>(initialFilter?.courseFilter || "ALL");
  const [recordingsSortBy, setRecordingsSortBy] = useState<"LATEST" | "ATTENDANCE" | "DURATION">("LATEST");
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState<string>("2026-08-17");

  // Video Cinema Player Modal State
  const [selectedSessionForVideoPlayer, setSelectedSessionForVideoPlayer] = useState<AdminAssignedSession | null>(null);
  const [videoPlayerTab, setVideoPlayerTab] = useState<"AGENDA" | "TOPICS" | "STUDENTS">("AGENDA");
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [videoPlaybackSpeed, setVideoPlaybackSpeed] = useState<number>(1);
  const [videoProgress, setVideoProgress] = useState<number>(35);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Synchronize initialFilter when navigated from other tabs
  React.useEffect(() => {
    if (initialFilter?.viewMode) {
      setViewMode(initialFilter.viewMode);
    } else {
      setViewMode("COMMAND_CENTER");
    }
    if (initialFilter?.courseFilter) {
      setCourseFilter(initialFilter.courseFilter);
    }
  }, [initialFilter]);

  // Load real assigned live courses from backend API
  React.useEffect(() => {
    async function loadInstructorData() {
      try {
        const res = await fetch("/api/instructor/live-sessions");
        if (res.ok) {
          const data = await res.json();
          if (data.courses && data.courses.length > 0) {
            const mappedCohorts: InstructorCourseCohort[] = data.courses.map((c: any) => ({
              id: c.id,
              courseName: c.title,
              cohortBadge: c.duration || "Live Cohort",
              tagline: c.description || c.title,
              category: c.category || "Live Training",
              totalSessions: c.totalSessions || c.sessions?.length || 0,
              totalStudents: 42,
              averageAttendanceRate: 92,
              sessions: (c.sessions || []).map((s: any) => ({
                id: s.id,
                sessionCode: `Session ${s.sessionNumber < 10 ? `0${s.sessionNumber}` : s.sessionNumber}`,
                sessionNumber: s.sessionNumber,
                title: s.title,
                description: s.description || "",
                courseId: c.id,
                courseName: c.title,
                cohortBadge: c.duration || "Live Cohort",
                batchName: "Live Fast-Track Cohort",
                date: s.date ? new Date(s.date).toISOString().split("T")[0] : "2026-09-01",
                displayDate: s.date ? new Date(s.date).toLocaleDateString([], { month: "short", day: "numeric" }) : "TBA",
                startTime: s.startTime || "07:00 PM",
                endTime: s.endTime || "09:00 PM",
                duration: s.duration || "120 min",
                meetingUrl: s.meetingUrl || "https://zoom.us",
                assignedBy: "Academic Operations Team",
                assignedAt: "2026-08-01",
                assignmentStatus: "ACCEPTED" as const,
                executionStatus: (s.status === "COMPLETED" ? "COMPLETED" : s.status === "LIVE" ? "LIVE_NOW" : "UPCOMING") as any,
                editPermissionStatus: s.permissions?.canEdit ? "UNLOCKED" : "LOCKED",
                editPermissionGrantedBy: s.permissions?.canEdit ? "Academic Administration" : undefined,
                enrolledStudentsCount: 42,
                compensationAmount: 6500,
                paymentStatus: "Paid" as const,
                agenda: (s.agenda || []).map((ag: any, i: number) => ({
                  stepNumber: String(i + 1).padStart(2, "0"),
                  timeRange: `${ag.startTime || "07:00 PM"} – ${ag.endTime || "07:30 PM"}`,
                  title: ag.title,
                  description: ag.description || ""
                })),
                topics: (s.topics || []).map((tp: any) => typeof tp === "string" ? tp : tp.title),
                requirements: ["Prepare environment for live pair-programming", "Record session in 1080p"],
                students: []
              }))
            }));
            setCohorts(mappedCohorts);
          }
        }
      } catch (err) {
        console.error("Failed to load real instructor live sessions", err);
      }
    }
    loadInstructorData();
  }, []);

  // Dynamic Calendar Navigation State
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 7 is August (0-indexed)

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  };

  const handleGoToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(7);
    setSelectedCalendarDateStr("2026-08-17");
  };

  const currentMonthLabel = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
  }, [currentYear, currentMonth]);

  const selectedDateObj = useMemo(() => {
    const parts = selectedCalendarDateStr.split("-").map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  }, [selectedCalendarDateStr]);

  // Modals & Panels
  const [selectedSessionForAgenda, setSelectedSessionForAgenda] = useState<AdminAssignedSession | null>(null);
  const [selectedSessionForStudents, setSelectedSessionForStudents] = useState<AdminAssignedSession | null>(null);
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<AdminAssignedSession | null>(null);
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<AdminAssignedSession | null>(null);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] = useState<AdminAssignedSession | null>(null);

  // Session Edit & Admin Lock Modals
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState<AdminAssignedSession | null>(null);
  const [selectedSessionForLockedNotice, setSelectedSessionForLockedNotice] = useState<AdminAssignedSession | null>(null);
  const [editReasonInput, setEditReasonInput] = useState("");
  const [editFormTitle, setEditFormTitle] = useState("");
  const [editFormDate, setEditFormDate] = useState("");
  const [editFormStartTime, setEditFormStartTime] = useState("");
  const [editFormEndTime, setEditFormEndTime] = useState("");
  const [editFormMeetingUrl, setEditFormMeetingUrl] = useState("");
  const [editFormTopics, setEditFormTopics] = useState("");
  const [editFormAgenda, setEditFormAgenda] = useState<ClassAgendaStep[]>([]);
  const [newAgendaTitle, setNewAgendaTitle] = useState("");
  const [newAgendaTime, setNewAgendaTime] = useState("");
  const [newAgendaDesc, setNewAgendaDesc] = useState("");

  // Reschedule Form
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("10:00");
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Flattened sessions across all cohorts
  const allSessions: AdminAssignedSession[] = useMemo(() => {
    return cohorts.flatMap((c) => c.sessions);
  }, [cohorts]);

  // Group Sessions by Date String (YYYY-MM-DD)
  const sessionsByDate = useMemo(() => {
    const map: Record<string, AdminAssignedSession[]> = {};
    allSessions.forEach((s) => {
      if (!map[s.date]) {
        map[s.date] = [];
      }
      map[s.date].push(s);
    });
    return map;
  }, [allSessions]);

  // Selected Date Sessions for Calendar Side Panel
  const selectedDateSessions = useMemo(() => {
    return sessionsByDate[selectedCalendarDateStr] || [];
  }, [sessionsByDate, selectedCalendarDateStr]);

  // Dynamic Month Grid Days (Starts on Sun, includes padding from prev/next months)
  const calendarDays = useMemo(() => {
    const days: { dayNum: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    // Total days in current month
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Total days in previous month
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // 1. Padding days from previous month
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthNumStr = String(prevMonthIndex + 1).padStart(2, "0");

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dayStr = String(day).padStart(2, "0");
      days.push({
        dayNum: day,
        dateStr: `${prevMonthYear}-${prevMonthNumStr}-${dayStr}`,
        isCurrentMonth: false,
      });
    }

    // 2. Days in current month
    const currentMonthNumStr = String(currentMonth + 1).padStart(2, "0");
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dayStr = String(day).padStart(2, "0");
      days.push({
        dayNum: day,
        dateStr: `${currentYear}-${currentMonthNumStr}-${dayStr}`,
        isCurrentMonth: true,
      });
    }

    // 3. Trailing days from next month to complete standard grid (35 or 42 cells)
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthNumStr = String(nextMonthIndex + 1).padStart(2, "0");

    const totalCells = days.length > 35 ? 42 : 35;
    const trailingDaysNeeded = totalCells - days.length;
    for (let day = 1; day <= trailingDaysNeeded; day++) {
      const dayStr = String(day).padStart(2, "0");
      days.push({
        dayNum: day,
        dateStr: `${nextMonthYear}-${nextMonthNumStr}-${dayStr}`,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Total sessions in the currently selected viewing month
  const currentMonthSessionsCount = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    return allSessions.filter((s) => s.date.startsWith(prefix)).length;
  }, [allSessions, currentYear, currentMonth]);

  // Overall Instructor Metrics
  const metrics = useMemo(() => {
    const assigned = allSessions.length;
    const liveNow = allSessions.filter((s) => s.executionStatus === "LIVE_NOW").length;
    const upcoming = allSessions.filter((s) => s.executionStatus === "UPCOMING" && s.assignmentStatus !== "ACTION_REQUIRED").length;
    const actionRequired = allSessions.filter((s) => s.assignmentStatus === "ACTION_REQUIRED").length;

    return { assigned, liveNow, upcoming, actionRequired };
  }, [allSessions]);

  // Currently Live Session (if any)
  const currentLiveSession = useMemo(() => {
    return allSessions.find((s) => s.executionStatus === "LIVE_NOW") || null;
  }, [allSessions]);

  // Next Upcoming Session
  const nextUpcomingSession = useMemo(() => {
    return allSessions.find((s) => s.executionStatus === "UPCOMING" && s.id !== "genai-s4") || allSessions[4];
  }, [allSessions]);

  // Today's Scheduled Sessions (Timeline)
  const todaySessions = useMemo(() => {
    return allSessions.filter((s) => s.isToday || s.date === "2026-08-17");
  }, [allSessions]);

  // Pending Actions Session
  const pendingActionSessions = useMemo(() => {
    return allSessions.filter((s) => s.assignmentStatus === "ACTION_REQUIRED");
  }, [allSessions]);

  // Completed Recorded Sessions across all cohorts
  const allCompletedRecordings = useMemo(() => {
    return allSessions.filter((s) => s.executionStatus === "COMPLETED" || Boolean(s.recordingUrl));
  }, [allSessions]);

  const totalRecordedHours = useMemo(() => {
    const totalMins = allCompletedRecordings.reduce((acc, s) => {
      const match = s.duration.match(/\d+/);
      const mins = match ? parseInt(match[0], 10) : 90;
      return acc + mins;
    }, 0);
    return (totalMins / 60).toFixed(1);
  }, [allCompletedRecordings]);

  const avgRecordedAttendance = useMemo(() => {
    const rates = allCompletedRecordings
      .map((s) => s.attendance?.rate)
      .filter((r): r is number => typeof r === "number");
    if (rates.length === 0) return "93.8";
    return (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1);
  }, [allCompletedRecordings]);

  const totalEnrolledLearners = useMemo(() => {
    return cohorts.reduce((acc, c) => acc + c.totalStudents, 0);
  }, [cohorts]);

  // Filtered Cohorts & Sessions for Recordings View
  const recordingsByCohort = useMemo(() => {
    return cohorts
      .map((cohort) => {
        let cohortRecordings = cohort.sessions.filter(
          (s) => s.executionStatus === "COMPLETED" || Boolean(s.recordingUrl)
        );

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          cohortRecordings = cohortRecordings.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.sessionCode.toLowerCase().includes(q) ||
              s.courseName.toLowerCase().includes(q) ||
              s.topics.some((t) => t.toLowerCase().includes(q))
          );
        }

        if (recordingsSortBy === "ATTENDANCE") {
          cohortRecordings.sort((a, b) => (b.attendance?.rate || 0) - (a.attendance?.rate || 0));
        } else if (recordingsSortBy === "DURATION") {
          cohortRecordings.sort((a, b) => (parseInt(b.duration) || 0) - (parseInt(a.duration) || 0));
        } else {
          cohortRecordings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        return {
          ...cohort,
          recordings: cohortRecordings
        };
      })
      .filter((c) => {
        if (courseFilter !== "ALL" && c.id !== courseFilter && c.courseName !== courseFilter) {
          return false;
        }
        return c.recordings.length > 0;
      });
  }, [cohorts, courseFilter, searchQuery, recordingsSortBy]);

  // Handle Accept Assignment
  const handleAcceptAssignment = (sessionId: string) => {
    setCohorts((prevCohorts) =>
      prevCohorts.map((cohort) => ({
        ...cohort,
        sessions: cohort.sessions.map((s) =>
          s.id === sessionId ? { ...s, assignmentStatus: "ACCEPTED" } : s
        )
      }))
    );
    showToast("Assignment Accepted! Session schedule confirmed for delivery.");
  };

  // Handle Reschedule Submit
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForReschedule || !rescheduleDate || !rescheduleReason.trim()) return;

    setCohorts((prevCohorts) =>
      prevCohorts.map((cohort) => ({
        ...cohort,
        sessions: cohort.sessions.map((s) =>
          s.id === selectedSessionForReschedule.id
            ? {
                ...s,
                assignmentStatus: "RESCHEDULE_PENDING",
                requestedNewDate: rescheduleDate,
                requestedNewTime: rescheduleTime,
                rescheduleReason: rescheduleReason.trim()
              }
            : s
        )
      }))
    );

    setSelectedSessionForReschedule(null);
    setRescheduleReason("");
    setRescheduleDate("");
    showToast("Reschedule request submitted to Academic Operations for review.");
  };

  // ── Session Edit Handlers (with Admin Lock Protection) ──
  const handleInitiateEdit = (session: AdminAssignedSession) => {
    const perm = session.editPermissionStatus || "LOCKED";
    if (perm === "UNLOCKED") {
      setSelectedSessionForEdit(session);
      setEditFormTitle(session.title);
      setEditFormDate(session.date);
      setEditFormStartTime(session.startTime);
      setEditFormEndTime(session.endTime);
      setEditFormMeetingUrl(session.meetingUrl || "");
      setEditFormTopics(session.topics ? session.topics.join(", ") : "");
      setEditFormAgenda(session.agenda ? [...session.agenda] : []);
    } else {
      setSelectedSessionForLockedNotice(session);
      setEditReasonInput("");
    }
  };

  const handleRequestEditPermission = (sessionId: string) => {
    setCohorts((prevCohorts) =>
      prevCohorts.map((cohort) => ({
        ...cohort,
        sessions: cohort.sessions.map((s) =>
          s.id === sessionId
            ? { ...s, editPermissionStatus: "REQUEST_PENDING", editLockReason: editReasonInput || "Curriculum / Schedule refinement" }
            : s
        )
      }))
    );
    setSelectedSessionForLockedNotice(null);
    showToast("Edit permission request sent to Academic Administration for review.");
  };

  const handleAdminGrantPermission = (sessionId: string) => {
    const targetSession = allSessions.find((s) => s.id === sessionId);
    setCohorts((prevCohorts) =>
      prevCohorts.map((cohort) => ({
        ...cohort,
        sessions: cohort.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                editPermissionStatus: "UNLOCKED",
                editPermissionGrantedBy: "Academic Operations Admin",
                editPermissionGrantedAt: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
            : s
        )
      }))
    );

    setSelectedSessionForLockedNotice(null);
    if (targetSession) {
      const unlockedSession: AdminAssignedSession = {
        ...targetSession,
        editPermissionStatus: "UNLOCKED",
        editPermissionGrantedBy: "Academic Operations Admin"
      };
      setSelectedSessionForEdit(unlockedSession);
      setEditFormTitle(unlockedSession.title);
      setEditFormDate(unlockedSession.date);
      setEditFormStartTime(unlockedSession.startTime);
      setEditFormEndTime(unlockedSession.endTime);
      setEditFormMeetingUrl(unlockedSession.meetingUrl || "");
      setEditFormTopics(unlockedSession.topics ? unlockedSession.topics.join(", ") : "");
      setEditFormAgenda(unlockedSession.agenda ? [...unlockedSession.agenda] : []);
    }
    showToast("Admin Permission Granted! You can now edit session details.");
  };

  const handleSaveSessionEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForEdit) return;

    const parsedTopics = editFormTopics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setCohorts((prevCohorts) =>
      prevCohorts.map((cohort) => ({
        ...cohort,
        sessions: cohort.sessions.map((s) =>
          s.id === selectedSessionForEdit.id
            ? {
                ...s,
                title: editFormTitle,
                date: editFormDate,
                startTime: editFormStartTime,
                endTime: editFormEndTime,
                meetingUrl: editFormMeetingUrl,
                topics: parsedTopics.length > 0 ? parsedTopics : s.topics,
                agenda: editFormAgenda
              }
            : s
        )
      }))
    );

    // Persist to backend API with RBAC enforcement
    fetch(`/api/instructor/live-sessions/${selectedSessionForEdit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editFormTitle,
        date: editFormDate,
        startTime: editFormStartTime,
        endTime: editFormEndTime,
        meetingUrl: editFormMeetingUrl,
        topics: parsedTopics.length > 0 ? parsedTopics : selectedSessionForEdit.topics,
        agenda: editFormAgenda.map((ag) => ({
          title: ag.title,
          description: ag.description,
          duration: "20 min"
        }))
      })
    }).catch((err) => console.error("Error saving session to backend:", err));

    showToast(`Session "${selectedSessionForEdit.sessionCode}" updated successfully!`);
    setSelectedSessionForEdit(null);
  };

  const handleReLockSession = (sessionId: string) => {
    setCohorts((prevCohorts) =>
      prevCohorts.map((cohort) => ({
        ...cohort,
        sessions: cohort.sessions.map((s) =>
          s.id === sessionId ? { ...s, editPermissionStatus: "LOCKED" } : s
        )
      }))
    );
    showToast("Session locked for batch cohort consistency.");
    setSelectedSessionForEdit(null);
  };

  const handleAddAgendaStep = () => {
    if (!newAgendaTitle.trim()) return;
    const stepNum = String(editFormAgenda.length + 1).padStart(2, "0");
    const newStep: ClassAgendaStep = {
      stepNumber: stepNum,
      timeRange: newAgendaTime || "15 min",
      title: newAgendaTitle.trim(),
      description: newAgendaDesc.trim() || "Cover core concepts and practical exercise."
    };
    setEditFormAgenda([...editFormAgenda, newStep]);
    setNewAgendaTitle("");
    setNewAgendaTime("");
    setNewAgendaDesc("");
  };

  const handleRemoveAgendaStep = (index: number) => {
    setEditFormAgenda(editFormAgenda.filter((_, idx) => idx !== index));
  };

  // Navigate to student hub for that specific course
  const handleNavigateToStudents = (session: AdminAssignedSession) => {
    if (onNavigateTab) {
      onNavigateTab("Students", {
        courseTitle: session.courseName,
        courseId: session.courseId,
        batch: session.cohortBadge || session.batchName,
        className: session.title,
        classId: session.id,
        returnTab: "Live Sessions",
      });
    } else {
      router.push(
        `/instructor/students?courseTitle=${encodeURIComponent(session.courseName)}&batch=${encodeURIComponent(session.cohortBadge || session.batchName)}&course=${encodeURIComponent(session.courseId)}&returnTab=Live%20Sessions`
      );
    }
  };

  // Navigate to assignments for that specific course and class
  const handleNavigateToAssignments = (session: AdminAssignedSession) => {
    if (onNavigateTab) {
      onNavigateTab("Assignments", {
        courseTitle: session.courseName,
        courseId: session.courseId,
        batch: session.cohortBadge || session.batchName,
        className: session.title,
        classId: session.id,
        assignmentTitle: session.title,
        returnTab: "Live Sessions",
      });
    } else {
      router.push(
        `/instructor/assignments?courseTitle=${encodeURIComponent(session.courseName)}&classId=${encodeURIComponent(session.id)}&assignmentTitle=${encodeURIComponent(session.title)}&returnTab=Live%20Sessions`
      );
    }
  };

  // Active Selected Course for Expanded Timeline View
  const selectedCourseCohort = useMemo(() => {
    return cohorts.find((c) => c.id === activeCourseId) || null;
  }, [cohorts, activeCourseId]);

  // Filtered Cohorts for Main List
  const filteredCohorts = useMemo(() => {
    return cohorts.filter((c) => {
      if (courseFilter === "ACTIVE" && !c.sessions.some(s => s.executionStatus === "LIVE_NOW" || s.executionStatus === "UPCOMING")) return false;
      if (courseFilter === "COMPLETED" && !c.sessions.every(s => s.executionStatus === "COMPLETED")) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.courseName.toLowerCase().includes(q);
        const matchBadge = c.cohortBadge.toLowerCase().includes(q);
        const matchTopic = c.sessions.some(s => s.title.toLowerCase().includes(q) || s.topics.some(t => t.toLowerCase().includes(q)));
        if (!matchName && !matchBadge && !matchTopic) return false;
      }
      return true;
    });
  }, [cohorts, courseFilter, searchQuery]);

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-7 font-sans text-slate-200">

      {/* ── TOAST ALERT ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-[#121824]/95 text-emerald-300 shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          1. CLEAN PAGE HEADER (Shown for Live Sessions Workspace)
          ═══════════════════════════════════════════════════════════ */}
      {viewMode !== "RECORDINGS" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
                Live Sessions
              </h1>
              <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md tracking-wide uppercase">
                Instructor Workspace
              </span>
              <span className="text-xs text-slate-500 font-normal">
                · {metrics.assigned} assigned sessions
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
              Your assigned teaching schedule and live classroom.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("Tasks")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 border border-white/[0.08] transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Tasks</span>
              </button>
            )}

            <button
              onClick={() => setViewMode("COMMAND_CENTER")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                viewMode === "COMMAND_CENTER"
                  ? "bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm"
                  : "bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 border-white/[0.08]"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-purple-400" />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => setViewMode("CALENDAR")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                viewMode === "CALENDAR"
                  ? "bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm"
                  : "bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 border-white/[0.08]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Calendar</span>
            </button>
          </div>
        </div>
      )}

      {viewMode === "RECORDINGS" ? (
        /* ═══════════════════════════════════════════════════════════
           AUTHENTIC COURSE-WISE CLASS RECORDINGS & COMPLETED ARCHIVE
           ═══════════════════════════════════════════════════════════ */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Filter & Search Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121824]/90 border border-white/[0.08] shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <PlayCircle className="w-4 h-4" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Class Recordings & Completed Sessions
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Browse, stream, and analyze recordings of all completed live classes organized by course.
              </p>
            </div>

            {/* Live Search & Sort */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topic, lesson, or keyword..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
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

              {/* Sort By */}
              <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1.5 rounded-xl text-xs text-slate-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={recordingsSortBy}
                  onChange={(e) => setRecordingsSortBy(e.target.value as any)}
                  className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="LATEST" className="bg-[#121824] text-white">Latest First</option>
                  <option value="ATTENDANCE" className="bg-[#121824] text-white">Highest Attendance</option>
                  <option value="DURATION" className="bg-[#121824] text-white">Longest Duration</option>
                </select>
              </div>
            </div>
          </div>

          {/* 30-Day Validity Notice Banner inside the Page */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#121824] to-emerald-950/20 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">Class Recording Access Policy</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    30-Day Validity
                  </span>
                </div>
                <p className="text-xs text-emerald-300/90 font-medium">
                  Class recordings remain available for exactly 30 days after the live session ends for review and student catch-up.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-semibold">
                • 30-Day Validity after session ends
              </span>
            </div>
          </div>

          {/* Segmented Course Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setCourseFilter("ALL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                courseFilter === "ALL"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400"
                  : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
              }`}
            >
              <span>All Courses</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                courseFilter === "ALL" ? "bg-white/20 text-white" : "bg-white/[0.06] text-slate-400"
              }`}>
                {allCompletedRecordings.length}
              </span>
            </button>

            {cohorts.map((cohort) => {
              const count = cohort.sessions.filter(
                (s) => s.executionStatus === "COMPLETED" || Boolean(s.recordingUrl)
              ).length;
              const isSelected = courseFilter === cohort.id || courseFilter === cohort.courseName;

              return (
                <button
                  key={cohort.id}
                  onClick={() => setCourseFilter(cohort.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400"
                      : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                  }`}
                >
                  <span className="truncate max-w-[200px]">{cohort.courseName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-white/[0.06] text-slate-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#121824]/90 border border-white/[0.08] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Recordings
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                {allCompletedRecordings.length}
                <span className="text-xs text-emerald-400 font-sans font-medium">Ready in HD</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121824]/90 border border-white/[0.08] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Recorded Classroom Time
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                {totalRecordedHours}
                <span className="text-xs text-purple-300 font-sans font-medium">Hours</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121824]/90 border border-white/[0.08] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Avg Attendance Rate
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono flex items-baseline gap-1.5">
                {avgRecordedAttendance}%
                <span className="text-xs text-slate-400 font-sans font-medium">Active presence</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121824]/90 border border-white/[0.08] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Enrolled Learners
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                {totalEnrolledLearners}
                <span className="text-xs text-blue-400 font-sans font-medium">Students</span>
              </div>
            </div>
          </div>

          {/* Grouped Recordings By Course */}
          {recordingsByCohort.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#121824]/60 border border-dashed border-white/[0.1] space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.04] text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No recordings found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No completed session recordings match your current search query or course filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCourseFilter("ALL");
                }}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Search & Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {recordingsByCohort.map((cohort) => (
                <div
                  key={cohort.id}
                  className="p-5 sm:p-6 rounded-3xl bg-[#121824]/90 border border-white/[0.08] shadow-xl space-y-5"
                >
                  {/* Course Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/25 uppercase tracking-wider">
                          {cohort.category}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs font-semibold text-slate-300">
                          {cohort.cohortBadge}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-slate-400">
                          {cohort.totalStudents} Students Enrolled
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {cohort.courseName}
                      </h3>
                      <p className="text-xs text-slate-400">{cohort.tagline}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5">
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{cohort.recordings.length} {cohort.recordings.length === 1 ? "Recording" : "Recordings"} Available</span>
                      </span>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {cohort.recordings.map((session) => (
                      <div
                        key={session.id}
                        className="bg-[#0B0F19] border border-white/[0.07] hover:border-purple-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 group hover:shadow-xl hover:shadow-purple-500/5"
                      >
                        {/* Video Thumbnail Box */}
                        <div
                          onClick={() => setSelectedSessionForVideoPlayer(session)}
                          className="relative aspect-video bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 p-3.5 flex flex-col justify-between cursor-pointer overflow-hidden border-b border-white/[0.05]"
                        >
                          {/* Background Grid Accent */}
                          <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                          
                          {/* Top Badges */}
                          <div className="relative z-10 flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Recording Ready
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-slate-300 text-[10px] font-mono font-semibold backdrop-blur-sm">
                              1080p HD
                            </span>
                          </div>

                          {/* Center Play Button Overlay */}
                          <div className="relative z-10 flex items-center justify-center my-auto">
                            <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 group-hover:scale-110 group-hover:bg-purple-500 transition-all duration-200">
                              <Play className="w-5 h-5 fill-white ml-0.5" />
                            </div>
                          </div>

                          {/* Bottom Meta Overlay */}
                          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {session.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {session.displayDate}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-purple-400">
                                {session.sessionCode}
                              </span>
                              <span className="text-slate-600">·</span>
                              <span className="text-[11px] text-slate-400">
                                {session.date}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white leading-snug group-hover:text-purple-300 transition-colors line-clamp-2">
                              {session.title}
                            </h4>

                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {session.description}
                            </p>
                          </div>

                          {/* Attendance & Topics */}
                          <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-medium">Student Attendance</span>
                              <span className="font-bold text-emerald-400 font-mono">
                                {session.attendance?.rate || 95}% ({session.attendance?.present || session.enrolledStudentsCount}/{session.enrolledStudentsCount})
                              </span>
                            </div>

                            {session.topics && session.topics.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {session.topics.slice(0, 3).map((topic, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Row Actions */}
                          <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
                            <button
                              onClick={() => setSelectedSessionForVideoPlayer(session)}
                              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Play Recording</span>
                            </button>

                            <button
                              onClick={() => setSelectedSessionForStudents(session)}
                              title="View Student Attendance"
                              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                            >
                              <Users className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setSelectedSessionForAgenda(session)}
                              title="View Class Agenda"
                              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(session.recordingUrl || `https://example.com/recordings/${session.id}`);
                                showToast(`Copied recording share link for ${session.sessionCode}!`);
                              }}
                              title="Copy Share Link"
                              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : viewMode === "CALENDAR" ? (
        /* ═══════════════════════════════════════════════════════════
           AUTHENTIC MONTHLY TEACHING CALENDAR VIEW
           ═══════════════════════════════════════════════════════════ */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Calendar Top Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-white px-3 min-w-[130px] text-center select-none">
                  {currentMonthLabel}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleGoToToday}
                className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Today
              </button>

              <span className="text-xs text-slate-500 hidden md:inline">
                {currentMonthSessionsCount} {currentMonthSessionsCount === 1 ? "session" : "sessions"} this month
              </span>
            </div>

            <button
              onClick={() => setViewMode("COMMAND_CENTER")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] px-3.5 py-1.5 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Command Center</span>
            </button>
          </div>

          {/* Two-Column Layout: Month Grid (8 Cols) + Selected Day Agenda (4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: 8 Cols - Monthly Calendar Grid */}
            <div className="lg:col-span-8 bg-[#121824]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Date Cells */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((cell) => {
                  const isSelected = cell.dateStr === selectedCalendarDateStr;
                  const isToday = cell.dateStr === "2026-08-17";
                  const daySessions = sessionsByDate[cell.dateStr] || [];
                  const hasLive = daySessions.some((s) => s.executionStatus === "LIVE_NOW");

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => {
                        setSelectedCalendarDateStr(cell.dateStr);
                        if (!cell.isCurrentMonth) {
                          const parts = cell.dateStr.split("-").map(Number);
                          if (parts.length === 3) {
                            setCurrentYear(parts[0]);
                            setCurrentMonth(parts[1] - 1);
                          }
                        }
                      }}
                      className={`min-h-[85px] sm:min-h-[100px] p-2 rounded-2xl border transition-all flex flex-col justify-between select-none cursor-pointer ${
                        !cell.isCurrentMonth
                          ? "opacity-35 border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] text-slate-500"
                          : isSelected
                          ? "bg-purple-600/30 text-white font-bold border-purple-500 ring-2 ring-purple-500/40 shadow-lg cursor-pointer"
                          : isToday
                          ? "border-purple-500/80 ring-1 ring-purple-500/30 bg-purple-500/10 hover:bg-purple-500/15 cursor-pointer text-white"
                          : daySessions.length > 0
                          ? "bg-white/[0.03] border-white/[0.08] hover:border-purple-500/40 hover:bg-white/[0.06] cursor-pointer text-slate-200"
                          : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03] cursor-pointer text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs sm:text-sm font-bold ${
                          isSelected ? "text-purple-300 font-black" : isToday ? "text-purple-400 font-black" : cell.isCurrentMonth ? "text-slate-300" : "text-slate-500"
                        }`}>
                          {cell.dayNum}
                        </span>
                        {hasLive && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        )}
                      </div>

                      {/* Sessions chips in this cell */}
                      <div className="space-y-1 overflow-hidden">
                        {daySessions.slice(0, 2).map((s) => (
                          <div
                            key={s.id}
                            className={`text-[9px] font-bold truncate px-1.5 py-0.5 rounded-md ${
                              s.executionStatus === "LIVE_NOW"
                                ? "bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse"
                                : s.executionStatus === "COMPLETED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : s.assignmentStatus === "ACTION_REQUIRED"
                                ? "bg-purple-500/25 text-purple-200 border border-purple-500/40"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {s.startTime.split(" ")[0]} · {s.courseName.split(" ")[0]}
                          </div>
                        ))}
                        {daySessions.length > 2 && (
                          <span className="text-[8px] text-slate-400 font-semibold pl-1 block">
                            +{daySessions.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: 4 Cols - Selected Day Teaching Agenda */}
            <div className="lg:col-span-4 bg-[#121824]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="border-b border-white/[0.06] pb-3">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide block">
                  Teaching Schedule For
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedDateSessions.length} {selectedDateSessions.length === 1 ? "Session" : "Sessions"} Scheduled
                </p>
              </div>

              {selectedDateSessions.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-white/[0.08] rounded-2xl bg-white/[0.01]">
                  <CalendarDays className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">No sessions scheduled</p>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                    You have no live classes assigned for this date.
                  </p>
                  <button
                    onClick={handleGoToToday}
                    className="mt-2 text-xs font-bold text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    View Today's Classes (Aug 17) →
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {selectedDateSessions.map((session) => {
                    const isLive = session.executionStatus === "LIVE_NOW";
                    const isCompleted = session.executionStatus === "COMPLETED";
                    const isActionReq = session.assignmentStatus === "ACTION_REQUIRED";

                    return (
                      <div
                        key={session.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          isLive
                            ? "bg-gradient-to-br from-red-950/40 via-[#121824] to-[#121824] border-red-500/40 shadow-lg ring-1 ring-red-500/20"
                            : isActionReq
                            ? "bg-purple-950/20 border-purple-500/30"
                            : isCompleted
                            ? "bg-white/[0.02] border-white/[0.06]"
                            : "bg-white/[0.03] border-white/[0.08]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-purple-400">{session.sessionCode}</span>
                          {isLive ? (
                            <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-bold animate-pulse">
                              🔴 LIVE NOW
                            </span>
                          ) : isCompleted ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                              COMPLETED
                            </span>
                          ) : isActionReq ? (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold">
                              ACTION REQUIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold">
                              UPCOMING
                            </span>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-white leading-snug">{session.courseName}</h4>
                          <p className="text-xs font-semibold text-purple-300">{session.sessionCode} — {session.title}</p>
                          <p className="text-[11px] text-slate-400 pt-0.5">
                            {session.startTime} – {session.endTime} · {session.enrolledStudentsCount} Students
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                          {isLive ? (
                            <a
                              href={session.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl text-center shadow-md shadow-red-600/30"
                            >
                              Start Session →
                            </a>
                          ) : isActionReq ? (
                            <button
                              onClick={() => handleAcceptAssignment(session.id)}
                              className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-sm"
                            >
                              Accept
                            </button>
                          ) : null}

                          <button
                            onClick={() => setSelectedSessionForAgenda(session)}
                            className="flex-1 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-white/[0.06]"
                          >
                            Agenda
                          </button>

                          <button
                            onClick={() => handleNavigateToStudents(session)}
                            className="flex-1 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-white/[0.06]"
                          >
                            Students
                          </button>

                          <button
                            onClick={() => handleNavigateToAssignments(session)}
                            className="flex-1 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 hover:text-white text-xs font-semibold rounded-xl border border-purple-500/20"
                          >
                            Assignments
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeCourseId && selectedCourseCohort ? (
        /* ═══════════════════════════════════════════════════════════
           EXPANDED COURSE VIEW & COMPACT VERTICAL TIMELINE
           ═══════════════════════════════════════════════════════════ */
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveCourseId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Courses</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">{selectedCourseCohort.cohortBadge}</span>
          </div>

          {/* Course Summary Banner */}
          <div className="p-5 rounded-2xl bg-[#121824]/90 border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {selectedCourseCohort.courseName}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedCourseCohort.totalSessions} Live Sessions · {selectedCourseCohort.totalStudents} Students · {selectedCourseCohort.averageAttendanceRate}% Attendance
              </p>
            </div>

            <div className="min-w-[200px] space-y-1.5 text-right">
              <span className="text-xs font-medium text-slate-300">
                {selectedCourseCohort.sessions.filter(s => s.executionStatus === "COMPLETED").length} / {selectedCourseCohort.totalSessions} Delivered
              </span>
              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${Math.round(
                      (selectedCourseCohort.sessions.filter(s => s.executionStatus === "COMPLETED").length /
                        selectedCourseCohort.totalSessions) *
                        100
                    )}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Compact Vertical Timeline */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121824]/70 border border-white/[0.06] space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Session Timeline
            </h3>

            <div className="divide-y divide-white/[0.04] space-y-1">
              {selectedCourseCohort.sessions.map((session) => {
                const isLive = session.executionStatus === "LIVE_NOW";
                const isCompleted = session.executionStatus === "COMPLETED";
                const isActionRequired = session.assignmentStatus === "ACTION_REQUIRED";

                return (
                  <div
                    key={session.id}
                    className="p-3.5 sm:px-4 sm:py-3 rounded-xl bg-white/[0.015] hover:bg-white/[0.04] border border-white/[0.05] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Status Icon */}
                      <span className="mt-0.5 sm:mt-0 shrink-0">
                        {isCompleted ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center">
                            ✓
                          </span>
                        ) : isLive ? (
                          <span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse shadow-md shadow-red-500/40" />
                        ) : isActionRequired ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                        )}
                      </span>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-semibold text-slate-400">
                            {session.sessionCode}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-white">
                            {session.title}
                          </span>
                          {isLive && (
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide bg-red-500/15 px-2 py-0.5 rounded-md border border-red-500/25">
                              🔴 LIVE NOW
                            </span>
                          )}
                          {isActionRequired && (
                            <span className="text-[10px] font-bold text-purple-300 uppercase bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/25">
                              ⚡ ACTION REQUIRED
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400">
                          {session.displayDate} · {session.startTime} · {session.enrolledStudentsCount} Students
                          {session.attendance && ` · Attendance ${session.attendance.present}/${session.enrolledStudentsCount}`}
                        </p>
                      </div>
                    </div>

                    {/* Equal, Harmonious Compact Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                      <button
                        onClick={() => setSelectedSessionForAgenda(session)}
                        className="px-3 py-1.5 text-slate-300 hover:text-white text-xs font-semibold rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer shadow-xs"
                      >
                        Agenda
                      </button>

                      <button
                        onClick={() => handleNavigateToStudents(session)}
                        className="px-3 py-1.5 text-slate-300 hover:text-white text-xs font-semibold rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer shadow-xs"
                      >
                        Students
                      </button>

                      <button
                        onClick={() => handleNavigateToAssignments(session)}
                        className="px-3 py-1.5 text-purple-300 hover:text-purple-200 text-xs font-semibold rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 transition-all cursor-pointer shadow-xs"
                      >
                        Assignments
                      </button>

                      {/* Reschedule Button for Incomplete Sessions */}
                      {!isCompleted ? (
                        <button
                          onClick={() => {
                            setSelectedSessionForReschedule(session);
                            setRescheduleDate(session.date);
                          }}
                          className="px-3 py-1.5 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="Request session reschedule"
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>Reschedule</span>
                        </button>
                      ) : (
                        /* Class Recording Action for Completed Sessions */
                        <button
                          onClick={() => setSelectedSessionForVideoPlayer(session)}
                          className="px-3 py-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="Class Recording · Active for 30 days after session ends"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Class Recording</span>
                          <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-1 py-0.2 rounded border border-emerald-500/30">
                            30d
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════
           MAIN COMMAND CENTER DASHBOARD
           ═══════════════════════════════════════════════════════════ */
        <div className="space-y-7 animate-in fade-in duration-150">

          {/* ── 2. COMPACT SUMMARY METRIC BAR ── */}
          <div className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-400 overflow-x-auto scrollbar-none gap-4">
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-white font-semibold">{metrics.assigned} Assigned</span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {metrics.liveNow} Live Now
              </span>
              <span className="text-slate-600">·</span>
              <span>{metrics.upcoming} Upcoming</span>
              <span className="text-slate-600">·</span>
              <span className={metrics.actionRequired > 0 ? "text-purple-300 font-semibold" : ""}>
                {metrics.actionRequired} Action Required
              </span>
            </div>

            <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
              Academic Operations Sync: Active
            </span>
          </div>

          {/* ── 3. TODAY'S TEACHING SCHEDULE (VERTICAL TIMELINE) ── */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121824]/80 border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Today's Schedule</h3>
                <p className="text-xs text-slate-500">17 August 2026</p>
              </div>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {todaySessions.map((ts) => {
                const isLive = ts.executionStatus === "LIVE_NOW";
                return (
                  <div key={ts.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-mono text-xs text-slate-400 font-semibold w-16 shrink-0">
                        {ts.startTime}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLive ? "bg-red-500 animate-pulse" : "bg-slate-600"}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {ts.courseName} <span className="font-normal text-slate-400">· {ts.sessionCode} — {ts.title}</span>
                        </p>
                        <p className="text-[11px] text-slate-500">{ts.enrolledStudentsCount} students</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isLive ? (
                        <a
                          href={ts.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg"
                        >
                          Start
                        </a>
                      ) : (
                        <button
                          onClick={() => setSelectedSessionForAgenda(ts)}
                          className="px-3 py-1 text-slate-400 hover:text-white text-xs font-medium rounded-lg hover:bg-white/[0.04]"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 5. ACTION REQUIRED STRIP (COMPACT NOTIFICATION) ── */}
          {pendingActionSessions.length > 0 && (
            <div className="px-5 py-3.5 rounded-xl bg-purple-950/20 border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-purple-400 font-bold">⚡ ACTION REQUIRED</span>
                <span className="text-slate-400 hidden sm:inline">·</span>
                <span className="text-slate-300">
                  New live session assigned by Academic Operations: <strong className="text-white font-medium">{pendingActionSessions[0].courseName} ({pendingActionSessions[0].sessionCode})</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedSessionForAgenda(pendingActionSessions[0])}
                  className="px-3 py-1 text-slate-300 hover:text-white font-medium"
                >
                  Review
                </button>
                <button
                  onClick={() => handleAcceptAssignment(pendingActionSessions[0].id)}
                  className="px-3.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Accept Assignment
                </button>
              </div>
            </div>
          )}

          {/* ── 6. MY LIVE COURSES (MAIN WORKSPACE GRID) ── */}
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  My Live Courses
                </h3>
                <p className="text-xs text-slate-400">
                  Courses you're assigned to teach.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white/[0.02] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.08] p-0.5 rounded-xl text-xs font-medium">
                  {["ALL", "ACTIVE", "COMPLETED"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setCourseFilter(f)}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        courseFilter === f ? "bg-purple-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {f === "ALL" ? "All" : f === "ACTIVE" ? "Active" : "Completed"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clean Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCohorts.map((cohort) => {
                const completedSessions = cohort.sessions.filter(s => s.executionStatus === "COMPLETED").length;
                const liveCount = cohort.sessions.filter(s => s.executionStatus === "LIVE_NOW").length;
                const upcomingCount = cohort.sessions.filter(s => s.executionStatus === "UPCOMING").length;
                const nextSession = cohort.sessions.find(s => s.executionStatus === "UPCOMING" || s.executionStatus === "LIVE_NOW") || cohort.sessions[0];
                const progressPercent = Math.round((completedSessions / cohort.totalSessions) * 100);

                return (
                  <div
                    key={cohort.id}
                    className="p-5 rounded-2xl bg-[#121824]/90 border border-white/[0.06] hover:border-white/[0.15] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4 group"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white tracking-tight">{cohort.courseName}</span>
                        <span className="text-[11px] text-slate-500">{cohort.cohortBadge}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{cohort.totalSessions} Live Sessions</span>
                        <span>{cohort.totalStudents} Students</span>
                      </div>

                      {/* Teaching Progress */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Teaching Progress</span>
                          <span className="text-slate-200 font-medium">{completedSessions} / {cohort.totalSessions} delivered</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>{cohort.averageAttendanceRate}% Avg Attendance</span>
                          <div className="flex items-center gap-2">
                            {liveCount > 0 && <span className="text-red-400 font-semibold">● 1 Live</span>}
                            <span>● {upcomingCount} Upcoming</span>
                          </div>
                        </div>
                      </div>

                      {/* Next Session Preview */}
                      {nextSession && (
                        <div className="pt-2 border-t border-white/[0.04] text-xs text-slate-400">
                          <span className="text-[10px] uppercase text-slate-500 font-semibold block">Next Session</span>
                          <p className="font-medium text-white truncate mt-0.5">{nextSession.sessionCode} · {nextSession.title}</p>
                          <p className="text-[11px] text-slate-500">{nextSession.displayDate} · {nextSession.startTime}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveCourseId(cohort.id)}
                        className="flex-1 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>View Sessions</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                      <button
                        onClick={() => {
                          const target = cohort.sessions.find(s => s.executionStatus === "UPCOMING" || s.executionStatus === "LIVE_NOW") || cohort.sessions[0];
                          if (target) handleInitiateEdit(target);
                        }}
                        className="px-3 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-slate-400 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Edit Sessions (Admin Lock Active)"
                      >
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 1: CLASS AGENDA MODAL (CLEAN SIDE PANEL/MODAL)
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedSessionForAgenda && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121824] border border-white/[0.1] rounded-2xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl relative"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3.5">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">
                    {selectedSessionForAgenda.sessionCode} · {selectedSessionForAgenda.duration}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedSessionForAgenda.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSessionForAgenda(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Agenda Steps */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Class Agenda</span>
                <div className="divide-y divide-white/[0.04]">
                  {selectedSessionForAgenda.agenda.map((ag) => (
                    <div key={ag.stepNumber} className="py-2.5 flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-purple-400 w-6 shrink-0">{ag.stepNumber}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-white">{ag.title}</p>
                          <span className="font-mono text-slate-400 text-[11px]">{ag.timeRange}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{ag.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] gap-3">
                <button
                  onClick={() => {
                    const s = selectedSessionForAgenda;
                    setSelectedSessionForAgenda(null);
                    handleInitiateEdit(s);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedSessionForAgenda.editPermissionStatus === "UNLOCKED"
                      ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08]"
                  }`}
                >
                  {selectedSessionForAgenda.editPermissionStatus === "UNLOCKED" ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Session Details</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Details (Admin Lock)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedSessionForAgenda(null)}
                  className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          MODAL 2: ATTENDANCE & RECORDING MODAL
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedSessionForAttendance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121824] border border-white/[0.1] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative text-xs"
            >
              <div className="flex items-start justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Verified Attendance</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedSessionForAttendance.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedSessionForAttendance(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedSessionForAttendance.attendance && (
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Present</span>
                    <p className="font-bold text-sm text-emerald-400">{selectedSessionForAttendance.attendance.present}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Absent</span>
                    <p className="font-bold text-sm text-rose-400">{selectedSessionForAttendance.attendance.absent}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Attendance Rate</span>
                    <p className="font-bold text-sm text-white">{selectedSessionForAttendance.attendance.rate}%</p>
                  </div>
                </div>
              )}

              {selectedSessionForAttendance.recordingUrl && (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">● 1080p Recording Available</span>
                  <a
                    href={selectedSessionForAttendance.recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold"
                  >
                    Watch Recording
                  </a>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedSessionForAttendance(null)}
                  className="px-4 py-2 bg-white/[0.06] text-white font-semibold rounded-xl"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          MODAL 3: REQUEST RESCHEDULE MODAL
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedSessionForReschedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121824] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-xs"
            >
              <div className="flex items-start justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Request Reschedule</h3>
                  <p className="text-slate-400 mt-0.5">Submitted to Academic Operations for approval</p>
                </div>
                <button
                  onClick={() => setSelectedSessionForReschedule(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRescheduleSubmit} className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Requested Date *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Requested Time *</label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Reason *</label>
                  <textarea
                    required
                    rows={2}
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="Reason for schedule adjustment..."
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSessionForReschedule(null)}
                    className="px-3.5 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          MODAL 4: SESSION EDIT LOCKED / ADMIN PERMISSION REQUEST
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedSessionForLockedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121824] border border-white/[0.12] rounded-2xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl relative text-xs text-slate-200"
            >
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Protected Curriculum
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      Session Editing is Locked
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSessionForLockedNotice(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target Session Info */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-400 font-bold">{selectedSessionForLockedNotice.sessionCode}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{selectedSessionForLockedNotice.displayDate} · {selectedSessionForLockedNotice.startTime}</span>
                </div>
                <p className="font-semibold text-white text-sm">{selectedSessionForLockedNotice.title}</p>
                <p className="text-[11px] text-slate-400">{selectedSessionForLockedNotice.courseName} · {selectedSessionForLockedNotice.enrolledStudentsCount} Enrolled Students</p>
              </div>

              {/* Policy Explanation */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Admin Permission Required</span>
                </div>
                <p className="text-[11px]">
                  Live session details (topic, timings, and classroom URL) are locked to maintain batch consistency and avoid student schedule conflicts. Instructors can request edit access or ask Academic Administration to unlock.
                </p>
              </div>

              {/* Status or Request Input */}
              {selectedSessionForLockedNotice.editPermissionStatus === "REQUEST_PENDING" ? (
                <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-200 flex items-center gap-2.5 font-medium">
                  <Clock className="w-4 h-4 text-sky-400 shrink-0 animate-pulse" />
                  <span>Your request to edit this session is currently pending review with Academic Administration.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Reason for requested changes (Optional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Updating syllabus topics for new library release, adjusting demo repo link..."
                    value={editReasonInput}
                    onChange={(e) => setEditReasonInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Admin Quick Override for Testing */}
                <button
                  type="button"
                  onClick={() => handleAdminGrantPermission(selectedSessionForLockedNotice.id)}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Simulate Admin unlocking this session immediately"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>[Admin] Grant Edit Permission</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedSessionForLockedNotice(null)}
                    className="px-3.5 py-2 text-slate-400 hover:text-white font-medium cursor-pointer"
                  >
                    Cancel
                  </button>

                  {selectedSessionForLockedNotice.editPermissionStatus !== "REQUEST_PENDING" && (
                    <button
                      type="button"
                      onClick={() => handleRequestEditPermission(selectedSessionForLockedNotice.id)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Request Edit Access</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          MODAL 5: FULL LIVE SESSION EDITOR (WHEN UNLOCKED)
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedSessionForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121824] border border-amber-500/40 rounded-2xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative text-xs text-slate-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Unlock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        UNLOCKED FOR EDITING
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {selectedSessionForEdit.sessionCode}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                      Edit Live Session Details
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSessionForEdit(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Admin Grant Banner */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Permission active: <strong>{selectedSessionForEdit.editPermissionGrantedBy || "Academic Administration"}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleReLockSession(selectedSessionForEdit.id)}
                  className="text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Re-Lock</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveSessionEdits} className="space-y-4">
                {/* Session Title / Topic */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">
                    Session Topic & Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormTitle}
                    onChange={(e) => setEditFormTitle(e.target.value)}
                    placeholder="e.g. Session 04: Production RAG & Vector Databases"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white font-medium focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-semibold">Date *</label>
                    <input
                      type="date"
                      required
                      value={editFormDate}
                      onChange={(e) => setEditFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-semibold">Start Time *</label>
                    <input
                      type="text"
                      required
                      value={editFormStartTime}
                      onChange={(e) => setEditFormStartTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-semibold">End Time *</label>
                    <input
                      type="text"
                      required
                      value={editFormEndTime}
                      onChange={(e) => setEditFormEndTime(e.target.value)}
                      placeholder="11:30 AM"
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>
                </div>

                {/* Meeting / Classroom URL */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-red-400" />
                    Live Classroom Meeting URL (Zoom / LiveKit / Meet) *
                  </label>
                  <input
                    type="url"
                    required
                    value={editFormMeetingUrl}
                    onChange={(e) => setEditFormMeetingUrl(e.target.value)}
                    placeholder="https://zoom.us/j/your-meeting-id"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Core Topics (Comma-separated) */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">
                    Core Topics (Comma-separated tags)
                  </label>
                  <input
                    type="text"
                    value={editFormTopics}
                    onChange={(e) => setEditFormTopics(e.target.value)}
                    placeholder="RAG Architecture, Vector DBs, Hybrid Search, Cohere Rerank"
                    className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Interactive Agenda Steps */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                      Session Agenda Breakdown ({editFormAgenda.length} steps)
                    </span>
                  </div>

                  {/* Agenda List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {editFormAgenda.map((ag, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5">
                        <span className="font-mono font-bold text-amber-400 w-6 pt-0.5">{ag.stepNumber}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white truncate">{ag.title}</span>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0">{ag.timeRange}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{ag.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAgendaStep(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove step"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Step Inline */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.1] space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400">Add Agenda Step:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Step Title (e.g. Vector Indexing)"
                        value={newAgendaTitle}
                        onChange={(e) => setNewAgendaTitle(e.target.value)}
                        className="sm:col-span-2 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Time (e.g. 10:15 – 10:35)"
                        value={newAgendaTime}
                        onChange={(e) => setNewAgendaTime(e.target.value)}
                        className="px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Brief summary of topic covered..."
                        value={newAgendaDesc}
                        onChange={(e) => setNewAgendaDesc(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddAgendaStep}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleReLockSession(selectedSessionForEdit.id)}
                    className="px-3.5 py-2 text-slate-400 hover:text-white font-medium flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Session</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSessionForEdit(null)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save & Update Session</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
           7. CINEMA VIDEO PLAYER & RECORDING PREVIEW MODAL
           ═══════════════════════════════════════════════════════════ */}
        {selectedSessionForVideoPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-[#0D121F] border border-white/[0.12] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative text-slate-200"
            >
              {/* Modal Top Header */}
              <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-white/[0.02]">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      HD Video Recording
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      {selectedSessionForVideoPlayer.sessionCode}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 truncate">
                      {selectedSessionForVideoPlayer.courseName} ({selectedSessionForVideoPlayer.cohortBadge})
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {selectedSessionForVideoPlayer.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(selectedSessionForVideoPlayer.recordingUrl || `https://example.com/recordings/${selectedSessionForVideoPlayer.id}`);
                      showToast(`Copied recording share link!`);
                    }}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 border border-white/[0.08] transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Link</span>
                  </button>

                  <button
                    onClick={() => setSelectedSessionForVideoPlayer(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 30-Day Validity Notice Banner */}
              <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Class Recording Validity: Available for exactly 30 days after the live session ends</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    ⚡ 30 Days Policy Active
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    1080p HD Recording
                  </span>
                </div>
              </div>

              {/* Modal Body: Cinema Video Player & Side Tabbed Insights */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
                {/* Left 8 Cols: Video Viewport & Controls */}
                <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between space-y-4 bg-black/40">
                  {/* Video Screen Simulation */}
                  <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-950 to-slate-900 border border-white/[0.1] flex flex-col justify-between p-4 overflow-hidden group shadow-2xl">
                    {/* Visualizer / Subtle Glow Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
                    
                    {/* Simulated Waveform Visualizer in Center */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                      <div className="flex items-center gap-1.5 h-20">
                        {[40, 65, 30, 85, 95, 45, 70, 90, 60, 80, 50, 75, 90, 40, 60, 85, 30].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: isVideoPlaying ? `${h}%` : "15%" }}
                            className={`w-1.5 rounded-full transition-all duration-300 ${
                              i % 2 === 0 ? "bg-purple-400/60" : "bg-emerald-400/60"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Top Screen Watermark */}
                    <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10 text-white font-semibold">
                        <Video className="w-3.5 h-3.5 text-purple-400" />
                        Glarus Live Class Player
                      </span>
                      <span className="bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10 text-emerald-400 font-semibold">
                        {selectedSessionForVideoPlayer.displayDate} · {selectedSessionForVideoPlayer.duration}
                      </span>
                    </div>

                    {/* Center Play Button Overlay */}
                    <div className="relative z-10 flex items-center justify-center my-auto">
                      <button
                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                        className="w-16 h-16 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 hover:scale-105 transition-all cursor-pointer"
                      >
                        {isVideoPlaying ? (
                          <Pause className="w-6 h-6 fill-white" />
                        ) : (
                          <Play className="w-6 h-6 fill-white ml-1" />
                        )}
                      </button>
                    </div>

                    {/* Bottom Progress Bar & Time */}
                    <div className="relative z-10 space-y-2 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-xl backdrop-blur-sm">
                      {/* Interactive Scrubber */}
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pos = (e.clientX - rect.left) / rect.width;
                          setVideoProgress(Math.round(pos * 100));
                        }}
                        className="w-full h-2 bg-white/20 hover:h-2.5 rounded-full overflow-hidden cursor-pointer relative transition-all"
                      >
                        <div
                          style={{ width: `${videoProgress}%` }}
                          className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full relative"
                        />
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                            className="hover:text-white transition-colors cursor-pointer"
                          >
                            {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                          </button>

                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="hover:text-white transition-colors cursor-pointer"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                          </button>

                          <span className="font-mono text-[11px] text-slate-300">
                            {Math.floor((videoProgress / 100) * 90)}:24 / {selectedSessionForVideoPlayer.duration}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {/* Speed Selector */}
                          <div className="flex items-center gap-1 bg-white/[0.08] px-2 py-0.5 rounded-md text-[11px] font-mono font-bold">
                            {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                              <button
                                key={spd}
                                onClick={() => setVideoPlaybackSpeed(spd)}
                                className={`px-1 rounded ${
                                  videoPlaybackSpeed === spd ? "bg-purple-600 text-white font-black" : "text-slate-400 hover:text-white"
                                }`}
                              >
                                {spd}x
                              </button>
                            ))}
                          </div>

                          <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
                            1080p
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Notes below video */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Session Highlights
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedSessionForVideoPlayer.description}
                    </p>
                  </div>
                </div>

                {/* Right 4 Cols: Side Tabbed Insights */}
                <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-white/[0.01]">
                  <div className="space-y-3">
                    {/* Tabs Switcher */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <button
                        onClick={() => setVideoPlayerTab("AGENDA")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          videoPlayerTab === "AGENDA" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Agenda
                      </button>
                      <button
                        onClick={() => setVideoPlayerTab("TOPICS")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          videoPlayerTab === "TOPICS" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Topics
                      </button>
                      <button
                        onClick={() => setVideoPlayerTab("STUDENTS")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          videoPlayerTab === "STUDENTS" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Students ({selectedSessionForVideoPlayer.attendance?.present || selectedSessionForVideoPlayer.enrolledStudentsCount})
                      </button>
                    </div>

                    {/* Tab 1: Agenda Steps with Timestamps */}
                    {videoPlayerTab === "AGENDA" && (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {selectedSessionForVideoPlayer.agenda?.map((step, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setVideoProgress((idx + 1) * 25);
                              showToast(`Jumped playback to ${step.timeRange}: ${step.title}`);
                            }}
                            className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/40 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-purple-400 group-hover:text-purple-300">
                                {step.timeRange}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">Step {step.stepNumber}</span>
                            </div>
                            <h5 className="font-semibold text-xs text-white mt-1 group-hover:text-purple-200">
                              {step.title}
                            </h5>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                              {step.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 2: Topics Covered */}
                    {videoPlayerTab === "TOPICS" && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Covered Concepts
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedSessionForVideoPlayer.topics?.map((topic, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-medium"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>

                        {selectedSessionForVideoPlayer.requirements && (
                          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Classroom Requirements Met
                            </span>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {selectedSessionForVideoPlayer.requirements.map((req, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 3: Student Attendees */}
                    {videoPlayerTab === "STUDENTS" && (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center justify-between text-xs font-semibold">
                          <span>Attendance Rate</span>
                          <span className="font-mono font-black">{selectedSessionForVideoPlayer.attendance?.rate || 95}%</span>
                        </div>

                        {selectedSessionForVideoPlayer.students?.map((student) => (
                          <div
                            key={student.id}
                            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-white">{student.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{student.email}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              {student.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Modal Bottom Share / Actions */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-2">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(selectedSessionForVideoPlayer.recordingUrl || `https://example.com/recordings/${selectedSessionForVideoPlayer.id}`);
                        showToast(`Copied direct video link to clipboard!`);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Shareable Recording URL</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
