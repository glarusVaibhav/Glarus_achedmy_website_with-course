"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Check,
  ChevronRight,
  ChevronDown,
  Layout,
  FileText,
  Video,
  PlayCircle,
  Loader2,
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Layers,
  Code,
  HelpCircle,
  Clock,
  Eye,
  Award,
  ShieldCheck,
  Zap,
  ArrowUp,
  ArrowDown,
  Info,
  X,
  Radio,
  UserCheck,
  AlertTriangle,
  Copy,
  ExternalLink,
  Briefcase,
  Building2,
  Lock,
  Send,
  UploadCloud,
  Paperclip,
  FileCheck
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { formatDate, formatTime } from "@/lib/dateTime";
import { useAuth } from "@/context/AuthContext";

export interface SessionAssignmentItem {
  id?: string;
  title: string;
  description: string;
  instructions: string[];
  totalMarks: number;
  dueDate?: string;
  daysAfterSession?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  autoAssignOnSessionEnd: boolean;
  externalStarterUrl?: string;
}

export interface AISessionItem {
  id?: string;
  sessionNumber: number;
  title: string;
  description: string;
  date?: string;
  startTime: string;
  endTime: string;
  duration: string;
  timezone?: string;
  status: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED";
  agenda: {
    title: string;
    description: string;
    startTime?: string;
    endTime?: string;
    duration: string;
  }[];
  topics: { title: string; description: string }[];
  learningOutcomes: string[];
  activities: { title: string; instructions: string; duration: string }[];
  resources: { title: string; type: string; url: string }[];
  assignment?: SessionAssignmentItem;
  homework?: { title: string; description: string; dueDate?: string };
}

export interface LearningOutcomeItem {
  title: string;
  description: string;
}

export interface ProjectShowcaseItem {
  number?: string;
  title: string;
  desc: string;
  tech: string[];
}

export interface BatchItem {
  id: string;
  name: string;
  startDate: string;
  schedule: string;
  time: string;
  duration: string;
  enrolled: number;
  total: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface LiveCourseFormData {
  title: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  price: string;
  originalPrice: string;
  previewVideoUrl: string;
  category: string;
  level: string;
  duration: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationStartTime: string;
  registrationEndDate: string;
  registrationEndTime: string;
  sessionFrequency: string;
  defaultDuration: string;
  preferredDays: string[];
  preferredStartTime: string;
  timezone: string;
  maxStudents: number;
  meetingPlatform: string;
  meetingUrl: string;
  prerequisites: string[];
  objectives: string[];
  tags: string[];
  targetAudience: string;
  thumbnailGradient: string;
  recordingAvailable: boolean;
  attendanceTracking?: boolean;
  visibility: string;
  learningOutcomes: LearningOutcomeItem[];
  projects: ProjectShowcaseItem[];
  batches: BatchItem[];
  features: string[];
  faqs: FaqItem[];
  learningJourney: { step: string; title: string; desc: string }[];
  cohortLeadBio: string;
  heroBadges: string[];
  hasInternship: boolean;
  internshipType: string;
  internshipDuration: string;
  internshipStipend: string;
  internshipCompanyPartner: string;
  internshipDescription: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const STARTER_PROMPTS = [
  {
    label: "🤖 Agentic AI Bootcamp",
    prompt: "Create a 6-week live Generative AI & Autonomous Multi-Agent Systems Bootcamp for intermediate developers covering Transformers, LangGraph, ReAct loops, Multi-Agent Collaboration, and Capstone Deployment.",
    sessions: 6
  },
  {
    label: "⚡ Full-Stack Next.js 15",
    prompt: "Create an 8-week production Next.js 15 App Router & Server Actions bootcamp covering PostgreSQL Prisma, Auth, Real-time WebSockets, and Cloud Deployments.",
    sessions: 8
  },
  {
    label: "🚀 LLM Fine-Tuning & RAG",
    prompt: "Create a 10-session deep dive into Advanced Retrieval-Augmented Generation (RAG), vector databases, LoRA/QLoRA fine-tuning, and production evaluation.",
    sessions: 10
  },
  {
    label: "🛡️ Cloud DevOps & Kubernetes",
    prompt: "Create a 6-session hands-on Cloud DevOps workshop covering Docker containerization, Kubernetes orchestration, CI/CD GitHub Actions, and Terraform IaC.",
    sessions: 6
  }
];

interface InstructorLiveCourseCreatorProps {
  onSuccess?: (createdCourse: any) => void;
  onCancel?: () => void;
}

export function InstructorLiveCourseCreator({ onSuccess, onCancel }: InstructorLiveCourseCreatorProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Wizard Step: 1 = Basic Info, 2 = Schedule & Frequency, 3 = AI Copilot / Session Builder, 4 = Review Sessions Timeline, 5 = Review & Submit for Approval
  const [currentStep, setCurrentStep] = useState(1);

  // Showcase Studio Sub-Tab in Step 1
  const [landingTab, setLandingTab] = useState<"outcomes" | "projects" | "batches" | "features" | "faqs">("outcomes");
  const [isGeneratingLanding, setIsGeneratingLanding] = useState(false);

  // Form Metadata
  const [formData, setFormData] = useState<LiveCourseFormData>({
    title: "",
    subtitle: "",
    shortDescription: "",
    description: "",
    price: "18999",
    originalPrice: "24999",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    category: "Generative AI",
    level: "Intermediate",
    duration: "6 Weeks · 12 Live Sessions",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    registrationStartDate: new Date().toISOString().split("T")[0],
    registrationStartTime: "09:00 AM",
    registrationEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    registrationEndTime: "11:59 PM",
    sessionFrequency: "2 sessions per week",
    defaultDuration: "120 min",
    preferredDays: ["Monday", "Wednesday"],
    preferredStartTime: "07:00 PM",
    timezone: "Asia/Kolkata (IST)",
    maxStudents: 50,
    meetingPlatform: "Zoom Enterprise",
    meetingUrl: "https://zoom.us/j/glarus-live-cohort",
    prerequisites: ["Python 3.10+", "Basic PyTorch / API fundamentals"],
    objectives: [
      "Architect autonomous multi-agent stateful systems",
      "Implement production-grade RAG with hybrid vector search",
      "Deploy self-correcting AI pipelines with low latency"
    ],
    tags: ["Generative AI", "LangGraph", "RAG", "Agentic Workflows"],
    targetAudience: "Senior Engineers, AI Developers & Technical Leads building production AI systems.",
    thumbnailGradient: "from-purple-900 via-indigo-950 to-slate-950",
    recordingAvailable: true,
    attendanceTracking: true,
    visibility: "PUBLIC",
    learningOutcomes: [
      {
        title: "Build Stateful Agent Graphs with LangGraph",
        description: "Construct cyclical state machine graphs with checkpointing, interrupt hooks, and persistent memory."
      },
      {
        title: "Supervisor Routing & Swarm Architectures",
        description: "Implement multi-agent team hierarchies with specialist workers, critique reviewers, and routing controllers."
      },
      {
        title: "Model Context Protocol (MCP) Integration",
        description: "Expose databases, developer tools, and live APIs to agents safely using the open MCP standard."
      },
      {
        title: "Production RAG & Hybrid Vector Search",
        description: "Implement semantic chunking, reciprocal rank fusion, and cross-encoder re-ranking pipelines."
      },
      {
        title: "Streaming Low-Latency Microservices",
        description: "Deploy token-streaming FastAPI endpoints on Ray Serve and Kubernetes with real-time SSE outputs."
      },
      {
        title: "LangSmith Telemetry & Cost Governance",
        description: "Set up distributed tracing, latency profiling, and automated cost optimization monitors."
      }
    ],
    projects: [
      {
        number: "01",
        title: "Autonomous Multi-Agent Research Swarm",
        desc: "Construct an end-to-end swarm that ingests real-time web articles, validates claims, and synthesizes structured reports.",
        tech: ["Python", "LangGraph", "FastAPI", "Docker"]
      },
      {
        number: "02",
        title: "Production Hybrid RAG Document Engine",
        desc: "Construct an enterprise search system indexing 100K+ technical documents with hybrid vector retrieval.",
        tech: ["Qdrant", "PostgreSQL", "Cohere", "Next.js"]
      },
      {
        number: "03",
        title: "Real-Time AI Code Reviewer & PR Bot",
        desc: "Deploy a webhook-triggered AI assistant that analyzes pull requests, enforces conventions, and runs unit tests.",
        tech: ["TypeScript", "GitHub API", "OpenAI", "Redis"]
      },
      {
        number: "04",
        title: "Enterprise Multi-Tenant SaaS Platform",
        desc: "Architect a scalable SaaS with team workspaces, usage metering, stripe billing, and automated CI/CD.",
        tech: ["Next.js 15", "Prisma", "PostgreSQL", "Tailwind CSS"]
      }
    ],
    batches: [
      {
        id: "batch-01",
        name: "Batch #01 (Weekend Cohort)",
        startDate: "24 Aug 2026",
        schedule: "Mon · Wed · Fri",
        time: "08:00 PM – 10:30 PM IST",
        duration: "6 Weeks",
        enrolled: 32,
        total: 50
      },
      {
        id: "batch-02",
        name: "Batch #02 (Weekday Evening)",
        startDate: "15 Sep 2026",
        schedule: "Tue · Thu",
        time: "08:00 PM – 10:30 PM IST",
        duration: "6 Weeks",
        enrolled: 18,
        total: 50
      }
    ],
    features: [
      "Live Interactive Workshops & Real-Time Code Debugging",
      "Direct 1-on-1 Mentor Office Hours & Code Reviews",
      "Production Repository Templates & Architecture Blueprints",
      "Private Discord Cohort & Dedicated Study Groups",
      "Smart Certificate of Live Completion with Verifiable ID"
    ],
    faqs: [
      {
        q: "What is the weekly time commitment for this live cohort?",
        a: "We recommend 6-8 hours per week: 4 hours of live lecture & pair coding labs, plus 2-4 hours of self-directed project development."
      },
      {
        q: "What happens if I miss a live session?",
        a: "All sessions are recorded in HD and available in your student portal within 2 hours of class conclusion, accessible for the duration of the cohort."
      },
      {
        q: "Is there prerequisite technical knowledge required?",
        a: "Learners should have basic working familiarity with programming in Python or JavaScript and REST APIs. Advanced concepts are covered progressively."
      }
    ],
    learningJourney: [
      { step: "01", title: "Core Foundations & Setup", desc: "Environment architecture and fundamental patterns" },
      { step: "02", title: "System Graph Construction", desc: "State machine mechanics and tool orchestration" },
      { step: "03", title: "Enterprise RAG & Vectors", desc: "Multi-modal retrieval and hybrid re-ranking" },
      { step: "04", title: "Production Scaling & Deploy", desc: "Ray Serve, Docker, Kubernetes & Observability" },
      { step: "05", title: "Capstone Showcase & Evaluation", desc: "Live portfolio demonstration and grading" }
    ],
    cohortLeadBio: "Senior AI Systems Architect with 10+ years deploying large-scale ML infrastructure.",
    heroBadges: ["4.9/5 Cohort Rating", "50 Seats Max", "Certificate Included"],
    hasInternship: false,
    internshipType: "Guaranteed Virtual Internship",
    internshipDuration: "3 Months",
    internshipStipend: "₹15,000 / Month",
    internshipCompanyPartner: "Glarus AI Labs & Enterprise Partners",
    internshipDescription: "Top performers who complete the capstone evaluation with distinction receive direct placement opportunities."
  });

  // AI Generator Prompt & Session State
  const [aiPrompt, setAiPrompt] = useState("");
  const [sessionCount, setSessionCount] = useState(6);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGeneratedSessions, setAiGeneratedSessions] = useState<AISessionItem[]>([]);
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [uploadingSessionAssignment, setUploadingSessionAssignment] = useState<number | null>(null);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Upload Assignment Attachment to MinIO (/api/upload?type=assignment)
  const handleAssignmentFileUpload = async (sessionIdx: number, file: File) => {
    if (!file) return;
    setUploadingSessionAssignment(sessionIdx);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", "assignment");
      fd.append("type", "assignment");
      fd.append("courseId", formData.title || "live-course");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const updated = [...aiGeneratedSessions];
        const curAss = updated[sessionIdx].assignment || {
          title: `Session ${updated[sessionIdx].sessionNumber} Assignment`,
          description: "",
          instructions: [],
          totalMarks: 100,
          autoAssignOnSessionEnd: true
        };

        updated[sessionIdx].assignment = {
          ...curAss,
          fileUrl: data.url,
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
          fileType: file.type || file.name.split(".").pop() || "document"
        };

        if (!updated[sessionIdx].resources) updated[sessionIdx].resources = [];
        updated[sessionIdx].resources.push({
          title: `Assignment Brief: ${file.name}`,
          type: "Assignment Brief",
          url: data.url
        });

        setAiGeneratedSessions(updated);
      } else {
        alert(data.error || "Failed to upload assignment file.");
      }
    } catch (err) {
      console.error("Assignment upload error:", err);
      alert("Error uploading assignment file.");
    } finally {
      setUploadingSessionAssignment(null);
    }
  };

  // Helper to calculate session dates based on preferredDays and startDate
  const generateScheduleDates = (count: number): AISessionItem[] => {
    const daysMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6
    };

    const targetDays =
      formData.preferredDays.length > 0
        ? formData.preferredDays.map((d) => daysMap[d]).filter((d) => d !== undefined)
        : [1, 3]; // Mon, Wed default

    const sessions: AISessionItem[] = [];
    let curDate = new Date(formData.startDate || Date.now());

    let created = 0;
    let safetyCounter = 0;

    while (created < count && safetyCounter < 150) {
      safetyCounter++;
      const curDayOfWeek = curDate.getDay();
      if (targetDays.includes(curDayOfWeek)) {
        const sessNum = created + 1;
        const dateStr = curDate.toISOString().split("T")[0];
        const defaultDueDate = new Date(curDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        sessions.push({
          sessionNumber: sessNum,
          title: `Session ${sessNum}: Core Interactive Workshop`,
          description: `Interactive live session covering milestone topics, hands-on architectural design, and live code review.`,
          date: dateStr,
          startTime: formData.preferredStartTime || "07:00 PM",
          endTime: "09:00 PM",
          duration: formData.defaultDuration || "120 min",
          timezone: formData.timezone || "Asia/Kolkata (IST)",
          status: "SCHEDULED",
          agenda: [
            {
              title: "Session Kickoff & Concept Architecture",
              description: "High-level review of foundational principles",
              startTime: formData.preferredStartTime,
              endTime: "07:30 PM",
              duration: "30 min"
            },
            {
              title: "Hands-on Code Implementation",
              description: "Live step-by-step code demonstration",
              startTime: "07:30 PM",
              endTime: "08:30 PM",
              duration: "60 min"
            },
            {
              title: "Student Pair-Coding & Live Q&A",
              description: "Open debugging and architectural review",
              startTime: "08:30 PM",
              endTime: "09:00 PM",
              duration: "30 min"
            }
          ],
          topics: [
            { title: "Core Architecture Patterns", description: "Design principles and trade-offs" },
            { title: "Production Implementation", description: "Writing robust modular code" }
          ],
          learningOutcomes: [
            `Understand the key architectural models for Session ${sessNum}`,
            `Implement real-time tests and validation scripts`
          ],
          activities: [
            {
              title: "Hands-on Lab Exercise",
              instructions: "Clone repository starter branch and complete the challenge.",
              duration: "30 min"
            }
          ],
          resources: [
            { title: "Session Slides & System Diagrams", type: "PDF", url: "https://example.com/slides" },
            { title: "GitHub Starter Repository", type: "GitHub", url: "https://github.com/example/repo" }
          ],
          assignment: {
            title: `Session ${sessNum} Practical Assignment: System Architecture Lab`,
            description: `Implement the milestone lab assignment for Session ${sessNum}. Follow the architectural specifications, run test suites, and submit your code repository or deliverables.`,
            instructions: [
              "Review the recorded session and attached diagrams.",
              "Clone the starter repository or use the template file.",
              "Complete all milestone tasks and passing unit tests.",
              "Submit repository PR or output bundle before the deadline."
            ],
            totalMarks: 100,
            dueDate: defaultDueDate,
            daysAfterSession: 7,
            autoAssignOnSessionEnd: true,
            externalStarterUrl: ""
          },
          homework: {
            title: `Session ${sessNum} Homework Challenge`,
            description: "Complete the practical implementation and submit your GitHub PR before the next session."
          }
        });
        created++;
      }
      curDate = new Date(curDate.getTime() + 24 * 60 * 60 * 1000);
    }

    return sessions;
  };

  // Trigger AI Auto-Draft Showcase Content
  const handleAutoDraftShowcase = async () => {
    if (!formData.title.trim()) {
      setErrorMessage("Please enter a Course Title in Step 1 first.");
      return;
    }
    setIsGeneratingLanding(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/ai/course-landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          level: formData.level
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setFormData((prev) => ({
          ...prev,
          subtitle: d.subtitle || prev.subtitle,
          duration: d.duration || prev.duration,
          originalPrice: d.originalPrice ? String(d.originalPrice) : prev.originalPrice,
          learningOutcomes:
            Array.isArray(d.learningOutcomes) && d.learningOutcomes.length > 0
              ? d.learningOutcomes.map((o: any) =>
                  typeof o === "string" ? { title: o, description: "Mastery of essential industry capabilities." } : o
                )
              : prev.learningOutcomes,
          projects: Array.isArray(d.projects) && d.projects.length > 0 ? d.projects : prev.projects,
          faqs: Array.isArray(d.faqs) && d.faqs.length > 0 ? d.faqs : prev.faqs,
          features: Array.isArray(d.features) && d.features.length > 0 ? d.features : prev.features
        }));
      }
    } catch {
      setErrorMessage("Failed to generate AI showcase data. You can fill it manually.");
    } finally {
      setIsGeneratingLanding(false);
    }
  };

  // AI Generation for Full Curriculum & Sessions
  const handleGenerateAiCurriculum = async () => {
    const promptToUse = aiPrompt.trim() || `Comprehensive ${sessionCount}-session live bootcamp on ${formData.title || "Generative AI"}`;
    setIsGeneratingAi(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: promptToUse,
          sessionCount: sessionCount
        })
      });

      const data = await res.json();
      const generatedModules = data?.modules || [];

      // Map AI modules to structured Live Sessions with dates
      const baseDates = generateScheduleDates(Math.max(sessionCount, generatedModules.length || 6));

      const mappedSessions: AISessionItem[] = baseDates.map((baseSess, idx) => {
        const mod = generatedModules[idx];
        const title = mod?.title ? mod.title.replace(/^Module \d+:\s*/i, "") : baseSess.title;
        const lessons = mod?.lessons || [];

        return {
          ...baseSess,
          sessionNumber: idx + 1,
          title: `Session ${idx + 1}: ${title}`,
          description: `Deep dive live workshop covering ${title}. Interactive code demonstrations and architecture review.`,
          topics: lessons.length
            ? lessons.map((l: string) => ({ title: l, description: "Hands-on implementation and test cases" }))
            : baseSess.topics,
          learningOutcomes: lessons.length
            ? lessons.slice(0, 3).map((l: string) => `Master ${l} in production environments`)
            : baseSess.learningOutcomes,
          agenda: [
            {
              title: "Conceptual Foundations & Diagramming",
              description: lessons[0] || "Architecture overview",
              startTime: formData.preferredStartTime,
              endTime: "07:30 PM",
              duration: "30 min"
            },
            {
              title: "Live Coding & System Implementation",
              description: lessons[1] || "Step-by-step code implementation",
              startTime: "07:30 PM",
              endTime: "08:30 PM",
              duration: "60 min"
            },
            {
              title: "Live Q&A, Code Review & Debugging",
              description: "Reviewing pull requests and homework instructions",
              startTime: "08:30 PM",
              endTime: "09:00 PM",
              duration: "30 min"
            }
          ]
        };
      });

      setAiGeneratedSessions(mappedSessions);
      setActiveSessionIndex(0);
    } catch {
      // Fallback to rule-based schedule
      const fallback = generateScheduleDates(sessionCount);
      setAiGeneratedSessions(fallback);
      setActiveSessionIndex(0);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddNewSession = () => {
    const nextNum = aiGeneratedSessions.length + 1;
    const newSess: AISessionItem = {
      sessionNumber: nextNum,
      title: `Session ${nextNum}: Hands-on Deep Dive`,
      description: "Comprehensive live cohort training and practical code lab.",
      date: formData.startDate,
      startTime: formData.preferredStartTime || "07:00 PM",
      endTime: "09:00 PM",
      duration: formData.defaultDuration || "120 min",
      timezone: formData.timezone || "Asia/Kolkata (IST)",
      status: "SCHEDULED",
      agenda: [
        { title: "Session Orientation", description: "Overview of workshop goals", startTime: formData.preferredStartTime, endTime: "07:15 PM", duration: "15 min" },
        { title: "Live Demonstration", description: "Step-by-step code walkthrough", startTime: "07:15 PM", endTime: "08:45 PM", duration: "90 min" },
        { title: "Q&A & Review", description: "Live student debugging", startTime: "08:45 PM", endTime: "09:00 PM", duration: "15 min" }
      ],
      topics: [{ title: "Deep Dive Topic", description: "Advanced concepts and edge cases" }],
      learningOutcomes: ["Build and test production architecture"],
      activities: [{ title: "Pair Coding Challenge", instructions: "Implement with cohort", duration: "30 min" }],
      resources: [],
      homework: { title: "Hands-on Project Challenge", description: "Submit your implementation repo." }
    };
    setAiGeneratedSessions([...aiGeneratedSessions, newSess]);
    setActiveSessionIndex(aiGeneratedSessions.length);
  };

  const handleDeleteSession = (idx: number) => {
    const updated = aiGeneratedSessions.filter((_, i) => i !== idx).map((s, i) => ({
      ...s,
      sessionNumber: i + 1
    }));
    setAiGeneratedSessions(updated);
    if (activeSessionIndex >= updated.length) {
      setActiveSessionIndex(Math.max(0, updated.length - 1));
    }
  };

  // Submit Handler: Saves live course and dispatches Admin review notification
  const handleSubmitLiveCourse = async (publishStatus: "DRAFT" | "READY_TO_PUBLISH" = "READY_TO_PUBLISH") => {
    if (!formData.title.trim()) {
      setErrorMessage("Please provide a course title in Step 1.");
      setCurrentStep(1);
      return;
    }

    const sessionsToSave =
      aiGeneratedSessions.length > 0 ? aiGeneratedSessions : generateScheduleDates(sessionCount);

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let regStartISO: string | null = null;
      let regEndISO: string | null = null;

      if (formData.registrationStartDate) {
        try {
          const timePart = formData.registrationStartTime || "09:00 AM";
          regStartISO = new Date(`${formData.registrationStartDate} ${timePart}`).toISOString();
        } catch {
          regStartISO = new Date(formData.registrationStartDate).toISOString();
        }
      }

      if (formData.registrationEndDate) {
        try {
          const timePart = formData.registrationEndTime || "11:59 PM";
          regEndISO = new Date(`${formData.registrationEndDate} ${timePart}`).toISOString();
        } catch {
          regEndISO = new Date(formData.registrationEndDate).toISOString();
        }
      }

      const res = await fetch("/api/instructor/live-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          registrationStartDate: regStartISO,
          registrationEndDate: regEndISO,
          targetAudience: Array.isArray(formData.targetAudience)
            ? (formData.targetAudience as any[]).join(", ")
            : formData.targetAudience || "",
          status: publishStatus,
          sessions: sessionsToSave
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create live class");
      }

      setSaveSuccessMsg(data.message || `Live Class "${formData.title}" submitted for Administrator approval!`);

      if (onSuccess) {
        onSuccess(data.course);
      }
    } catch (err: any) {
      console.error("Error submitting live course:", err);
      setErrorMessage(err.message || "Failed to save live course.");
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Basic Info & Showcase", icon: FileText },
    { num: 2, title: "Schedule & Batches", icon: Calendar },
    { num: 3, title: "AI Sessions Builder", icon: Sparkles },
    { num: 4, title: "Timeline Overview", icon: Clock },
    { num: 5, title: "Review & Submit", icon: Send }
  ];

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Banner Alert (Success or Error) */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg("")} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stepper Header */}
      <div className="bg-card border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                Live Cohort Studio
              </span>
              <span className="text-xs text-subtext">•</span>
              <span className="text-xs text-subtext font-semibold">Step {currentStep} of 5</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-text mt-0.5">
              Create Live Class & Cohort Program
            </h2>
          </div>
        </div>

        {/* Quick Stepper Pills */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {stepsList.map((step) => {
            const isActive = currentStep === step.num;
            const isDone = step.num < currentStep;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                    : isDone
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-white/[0.03] text-subtext border-white/5 hover:bg-white/[0.06]"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <step.icon className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{step.title}</span>
                <span className="md:hidden">{step.num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          STEP 1: COURSE BASIC DETAILS & SHOWCASE STUDIO
          ══════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                  Step 1 of 5
                </span>
                <h3 className="text-xl font-black text-text mt-0.5">Course Basic Details</h3>
                <p className="text-xs text-subtext">
                  Provide primary live course metadata, pricing, and category.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoDraftShowcase}
                disabled={isGeneratingLanding}
                className="px-4 py-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
              >
                {isGeneratingLanding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span>{isGeneratingLanding ? "Generating..." : "AI Auto-Draft Showcase"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-text">
                  Live Course Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (!aiPrompt) setAiPrompt(e.target.value);
                  }}
                  placeholder="e.g. Generative AI & Autonomous Multi-Agent Systems Bootcamp"
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-3 text-sm text-text font-bold focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-text">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Master LangGraph, ReAct Loops, Vector Databases & Production Deployment"
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="Generative AI">Generative AI & LLMs</option>
                  <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Data Science & ML">Data Science & ML</option>
                  <option value="Cyber Security">Cyber Security</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Skill Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="Intermediate">Intermediate (Recommended)</option>
                  <option value="Beginner">Beginner Friendly</option>
                  <option value="Advanced">Advanced Engineering</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Price (₹ INR)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Original Price (₹ INR)</label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Cohort Duration Badge</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 6 Weeks · 12 Live Sessions"
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">16:9 Preview Video URL</label>
                <input
                  type="text"
                  value={formData.previewVideoUrl}
                  onChange={(e) => setFormData({ ...formData, previewVideoUrl: e.target.value })}
                  placeholder="https://commondatastorage.googleapis.com/..."
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-text">Course Description & Overview</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain the cohort curriculum structure, industry relevance, and capstone takeaways..."
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-3 text-xs text-text focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Showcase Studio Tabs */}
          <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h4 className="text-sm font-black text-text uppercase tracking-wider">
                  Landing Page Showcase Studio
                </h4>
                <p className="text-xs text-subtext">
                  Customize the outcomes, projects, and FAQs displayed to students on the public course page.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-white/10 overflow-x-auto">
                {(["outcomes", "projects", "batches", "features", "faqs"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLandingTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      landingTab === t
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-subtext hover:text-text hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {landingTab === "outcomes" && (
              <div className="space-y-3">
                {formData.learningOutcomes.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-background/50 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-purple-400 uppercase">Outcome #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.learningOutcomes.filter((_, i) => i !== idx);
                          setFormData({ ...formData, learningOutcomes: updated });
                        }}
                        className="text-subtext hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...formData.learningOutcomes];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, learningOutcomes: updated });
                      }}
                      className="w-full bg-card/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text font-bold"
                    />
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...formData.learningOutcomes];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, learningOutcomes: updated });
                      }}
                      className="w-full bg-card/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-subtext"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      learningOutcomes: [
                        ...formData.learningOutcomes,
                        { title: "New Learning Outcome", description: "Practical capability acquired by learners." }
                      ]
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Outcome</span>
                </button>
              </div>
            )}

            {landingTab === "projects" && (
              <div className="space-y-3">
                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-background/50 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-purple-400 uppercase">Capstone Project #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.projects.filter((_, i) => i !== idx);
                          setFormData({ ...formData, projects: updated });
                        }}
                        className="text-subtext hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...formData.projects];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, projects: updated });
                      }}
                      className="w-full bg-card/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text font-bold"
                    />
                    <textarea
                      rows={2}
                      value={proj.desc}
                      onChange={(e) => {
                        const updated = [...formData.projects];
                        updated[idx].desc = e.target.value;
                        setFormData({ ...formData, projects: updated });
                      }}
                      className="w-full bg-card/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-subtext"
                    />
                  </div>
                ))}
              </div>
            )}

            {landingTab === "batches" && (
              <div className="space-y-3">
                {formData.batches.map((batch, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-background/50 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-subtext font-bold block mb-1">Batch Name</span>
                      <input
                        type="text"
                        value={batch.name}
                        onChange={(e) => {
                          const updated = [...formData.batches];
                          updated[idx].name = e.target.value;
                          setFormData({ ...formData, batches: updated });
                        }}
                        className="w-full bg-card/60 border border-white/10 rounded-xl px-3 py-1.5 font-bold text-text"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-subtext font-bold block mb-1">Schedule & Days</span>
                      <input
                        type="text"
                        value={batch.schedule}
                        onChange={(e) => {
                          const updated = [...formData.batches];
                          updated[idx].schedule = e.target.value;
                          setFormData({ ...formData, batches: updated });
                        }}
                        className="w-full bg-card/60 border border-white/10 rounded-xl px-3 py-1.5 text-text"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-subtext font-bold block mb-1">Timing & Zone</span>
                      <input
                        type="text"
                        value={batch.time}
                        onChange={(e) => {
                          const updated = [...formData.batches];
                          updated[idx].time = e.target.value;
                          setFormData({ ...formData, batches: updated });
                        }}
                        className="w-full bg-card/60 border border-white/10 rounded-xl px-3 py-1.5 text-text"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {landingTab === "features" && (
              <div className="space-y-2">
                {formData.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updated = [...formData.features];
                        updated[idx] = e.target.value;
                        setFormData({ ...formData, features: updated });
                      }}
                      className="flex-1 bg-background/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-text font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.features.filter((_, i) => i !== idx);
                        setFormData({ ...formData, features: updated });
                      }}
                      className="text-subtext hover:text-rose-400 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {landingTab === "faqs" && (
              <div className="space-y-3">
                {formData.faqs.map((faq, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-background/50 border border-white/5 space-y-1.5">
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => {
                        const updated = [...formData.faqs];
                        updated[idx].q = e.target.value;
                        setFormData({ ...formData, faqs: updated });
                      }}
                      placeholder="Question..."
                      className="w-full bg-card/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text font-bold"
                    />
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => {
                        const updated = [...formData.faqs];
                        updated[idx].a = e.target.value;
                        setFormData({ ...formData, faqs: updated });
                      }}
                      placeholder="Answer..."
                      className="w-full bg-card/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-subtext"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Schedule & Logistics</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 2: SCHEDULE, COHORT DATES & LOGISTICS
          ══════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                Step 2 of 5
              </span>
              <h3 className="text-xl font-black text-text mt-0.5">Cohort Schedule & Meeting Setup</h3>
              <p className="text-xs text-subtext">
                Configure live class meeting platforms, recurring days, time slots, and cohort capacity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Cohort Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Cohort End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Live Class Frequency</label>
                <select
                  value={formData.sessionFrequency}
                  onChange={(e) => setFormData({ ...formData, sessionFrequency: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="2 sessions per week">2 sessions per week (Mon / Wed)</option>
                  <option value="3 sessions per week">3 sessions per week (Mon / Wed / Fri)</option>
                  <option value="Weekend Intensive">Weekend Intensive (Sat / Sun)</option>
                  <option value="1 session per week">1 session per week (Saturdays)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Default Session Duration</label>
                <select
                  value={formData.defaultDuration}
                  onChange={(e) => setFormData({ ...formData, defaultDuration: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="120 min">120 min (2.0 Hours)</option>
                  <option value="90 min">90 min (1.5 Hours)</option>
                  <option value="150 min">150 min (2.5 Hours)</option>
                  <option value="60 min">60 min (1.0 Hour)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Default Start Time</label>
                <input
                  type="text"
                  value={formData.preferredStartTime}
                  onChange={(e) => setFormData({ ...formData, preferredStartTime: e.target.value })}
                  placeholder="07:00 PM"
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                  <option value="America/New_York (EST)">America/New_York (EST)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                  <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
                </select>
              </div>

              {/* Recurring Days Selection */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-text">Recurring Weekly Live Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = formData.preferredDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? formData.preferredDays.filter((d) => d !== day)
                            : [...formData.preferredDays, day];
                          setFormData({ ...formData, preferredDays: updated });
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                            : "bg-background/60 text-subtext border-white/10 hover:border-white/20"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Max Cohort Seats</label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) || 50 })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Meeting Platform</label>
                <select
                  value={formData.meetingPlatform}
                  onChange={(e) => setFormData({ ...formData, meetingPlatform: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="Zoom Enterprise">Zoom Enterprise</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-text">Default Meeting URL / Room Link</label>
                <input
                  type="text"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                  placeholder="https://zoom.us/j/glarus-live-cohort-room"
                  className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text border border-white/10 text-xs font-bold cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (aiGeneratedSessions.length === 0) {
                  const initial = generateScheduleDates(sessionCount);
                  setAiGeneratedSessions(initial);
                }
                setCurrentStep(3);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to AI Sessions Builder</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 3: AI COPILOT & SESSIONS / CURRICULUM BUILDER
          ══════════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in">
          {/* AI Generator Prompter */}
          <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-background border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text uppercase tracking-wider">
                    AI Curriculum Copilot
                  </h3>
                  <p className="text-xs text-subtext">
                    Generate structured sessions, topics, agendas, and hands-on coding labs in seconds.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-subtext font-bold">Sessions:</span>
                <select
                  value={sessionCount}
                  onChange={(e) => setSessionCount(Number(e.target.value))}
                  className="bg-card border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-text"
                >
                  <option value={4}>4 Sessions</option>
                  <option value={6}>6 Sessions</option>
                  <option value={8}>8 Sessions</option>
                  <option value={10}>10 Sessions</option>
                  <option value={12}>12 Sessions</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {STARTER_PROMPTS.map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => {
                    setAiPrompt(sp.prompt);
                    setSessionCount(sp.sessions);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-subtext hover:text-purple-300 border border-white/5 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {sp.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your live bootcamp syllabus..."
                className="flex-1 bg-background border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleGenerateAiCurriculum}
                disabled={isGeneratingAi}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isGeneratingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGeneratingAi ? "Generating..." : "Generate AI Syllabus"}</span>
              </button>
            </div>
          </div>

          {/* Sessions List & Active Session Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Session Selector */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-subtext">
                  Scheduled Sessions ({aiGeneratedSessions.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddNewSession}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Session</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {aiGeneratedSessions.map((sess, idx) => {
                  const isSelected = activeSessionIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSessionIndex(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                        isSelected
                          ? "bg-purple-600/15 border-purple-500/40 text-text shadow-md shadow-purple-600/10"
                          : "bg-card hover:bg-card-hover border-white/5 text-subtext hover:text-text"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-purple-300">
                            #{sess.sessionNumber}
                          </span>
                          <span className="text-xs font-bold truncate block">{sess.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-subtext">
                          <Clock className="w-3 h-3" />
                          <span>{sess.date ? formatDate(sess.date) : "TBD"}</span>
                          <span>•</span>
                          <span>{sess.startTime}</span>
                        </div>
                      </div>

                      {aiGeneratedSessions.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(idx);
                          }}
                          className="text-subtext hover:text-rose-400 p-1 shrink-0"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Active Session Detail Editor */}
            <div className="lg:col-span-8 bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              {aiGeneratedSessions[activeSessionIndex] ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase">
                        Editing Session #{aiGeneratedSessions[activeSessionIndex].sessionNumber}
                      </span>
                      <h4 className="text-sm font-black text-text">Session Agenda & Topics</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[11px] font-bold text-text">Session Title</label>
                      <input
                        type="text"
                        value={aiGeneratedSessions[activeSessionIndex].title}
                        onChange={(e) => {
                          const updated = [...aiGeneratedSessions];
                          updated[activeSessionIndex].title = e.target.value;
                          setAiGeneratedSessions(updated);
                        }}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-text"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[11px] font-bold text-text">Session Description</label>
                      <textarea
                        rows={2}
                        value={aiGeneratedSessions[activeSessionIndex].description}
                        onChange={(e) => {
                          const updated = [...aiGeneratedSessions];
                          updated[activeSessionIndex].description = e.target.value;
                          setAiGeneratedSessions(updated);
                        }}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-subtext"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-text">Scheduled Date</label>
                      <input
                        type="date"
                        value={aiGeneratedSessions[activeSessionIndex].date || ""}
                        onChange={(e) => {
                          const updated = [...aiGeneratedSessions];
                          updated[activeSessionIndex].date = e.target.value;
                          setAiGeneratedSessions(updated);
                        }}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-text">Start Time</label>
                      <input
                        type="text"
                        value={aiGeneratedSessions[activeSessionIndex].startTime}
                        onChange={(e) => {
                          const updated = [...aiGeneratedSessions];
                          updated[activeSessionIndex].startTime = e.target.value;
                          setAiGeneratedSessions(updated);
                        }}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text font-bold"
                      />
                    </div>
                  </div>

                  {/* Agenda Steps */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-black uppercase tracking-wider text-subtext block">
                      Agenda Steps ({aiGeneratedSessions[activeSessionIndex].agenda.length})
                    </span>
                    {aiGeneratedSessions[activeSessionIndex].agenda.map((ag, agIdx) => (
                      <div key={agIdx} className="p-3 rounded-xl bg-background/50 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={ag.title}
                            onChange={(e) => {
                              const updated = [...aiGeneratedSessions];
                              updated[activeSessionIndex].agenda[agIdx].title = e.target.value;
                              setAiGeneratedSessions(updated);
                            }}
                            className="flex-1 bg-card/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-text font-bold"
                          />
                          <input
                            type="text"
                            value={ag.duration}
                            onChange={(e) => {
                              const updated = [...aiGeneratedSessions];
                              updated[activeSessionIndex].agenda[agIdx].duration = e.target.value;
                              setAiGeneratedSessions(updated);
                            }}
                            placeholder="30 min"
                            className="w-20 bg-card/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-subtext font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ─── SESSION ASSIGNMENT & PRACTICE LAB (UPLOADER) ─── */}
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-text uppercase tracking-wider flex items-center gap-2">
                            <span>Session Assignment & Practice Deliverable</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" /> Auto-Assigned on Session Finish
                            </span>
                          </h5>
                          <p className="text-[11px] text-subtext">
                            Upload assignment briefs, code starters, and set deadlines. Unlocks for enrolled students immediately when this live session is finished.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Release Rule Banner */}
                    <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-2.5 text-[11px] text-indigo-200">
                      <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Auto-Release Rule:</strong> Once this session concludes or is marked <code className="text-amber-300 font-mono">COMPLETED</code>, this assignment will automatically be published and assigned to all enrolled students with automated deadline notifications.
                      </span>
                    </div>

                    {/* Assignment Metadata Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[11px] font-bold text-text">Assignment Title</label>
                        <input
                          type="text"
                          value={aiGeneratedSessions[activeSessionIndex].assignment?.title || ""}
                          onChange={(e) => {
                            const updated = [...aiGeneratedSessions];
                            if (!updated[activeSessionIndex].assignment) {
                              updated[activeSessionIndex].assignment = {
                                title: e.target.value,
                                description: "",
                                instructions: [],
                                totalMarks: 100,
                                autoAssignOnSessionEnd: true
                              };
                            } else {
                              updated[activeSessionIndex].assignment!.title = e.target.value;
                            }
                            setAiGeneratedSessions(updated);
                          }}
                          placeholder="e.g. Session 1: LangGraph Multi-Agent Architecture"
                          className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-text">Total Marks / Points</label>
                        <input
                          type="number"
                          value={aiGeneratedSessions[activeSessionIndex].assignment?.totalMarks || 100}
                          onChange={(e) => {
                            const updated = [...aiGeneratedSessions];
                            if (!updated[activeSessionIndex].assignment) {
                              updated[activeSessionIndex].assignment = {
                                title: `Session ${updated[activeSessionIndex].sessionNumber} Assignment`,
                                description: "",
                                instructions: [],
                                totalMarks: Number(e.target.value) || 100,
                                autoAssignOnSessionEnd: true
                              };
                            } else {
                              updated[activeSessionIndex].assignment!.totalMarks = Number(e.target.value) || 100;
                            }
                            setAiGeneratedSessions(updated);
                          }}
                          className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-text focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="block text-[11px] font-bold text-text">Assignment Instructions & Problem Statement</label>
                        <textarea
                          rows={3}
                          value={aiGeneratedSessions[activeSessionIndex].assignment?.description || ""}
                          onChange={(e) => {
                            const updated = [...aiGeneratedSessions];
                            if (!updated[activeSessionIndex].assignment) {
                              updated[activeSessionIndex].assignment = {
                                title: `Session ${updated[activeSessionIndex].sessionNumber} Assignment`,
                                description: e.target.value,
                                instructions: [],
                                totalMarks: 100,
                                autoAssignOnSessionEnd: true
                              };
                            } else {
                              updated[activeSessionIndex].assignment!.description = e.target.value;
                            }
                            setAiGeneratedSessions(updated);
                          }}
                          placeholder="Describe the tasks, specifications, edge cases, and deliverables required from students..."
                          className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-subtext focus:outline-none focus:border-purple-500 leading-relaxed"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[11px] font-bold text-text">External Starter Repo / Colab Link (Optional)</label>
                        <input
                          type="text"
                          value={aiGeneratedSessions[activeSessionIndex].assignment?.externalStarterUrl || ""}
                          onChange={(e) => {
                            const updated = [...aiGeneratedSessions];
                            if (!updated[activeSessionIndex].assignment) {
                              updated[activeSessionIndex].assignment = {
                                title: `Session ${updated[activeSessionIndex].sessionNumber} Assignment`,
                                description: "",
                                instructions: [],
                                totalMarks: 100,
                                autoAssignOnSessionEnd: true,
                                externalStarterUrl: e.target.value
                              };
                            } else {
                              updated[activeSessionIndex].assignment!.externalStarterUrl = e.target.value;
                            }
                            setAiGeneratedSessions(updated);
                          }}
                          placeholder="https://github.com/glarus-academy/agent-starter"
                          className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-text">Submission Due Date</label>
                        <input
                          type="date"
                          value={aiGeneratedSessions[activeSessionIndex].assignment?.dueDate || ""}
                          onChange={(e) => {
                            const updated = [...aiGeneratedSessions];
                            if (!updated[activeSessionIndex].assignment) {
                              updated[activeSessionIndex].assignment = {
                                title: `Session ${updated[activeSessionIndex].sessionNumber} Assignment`,
                                description: "",
                                instructions: [],
                                totalMarks: 100,
                                autoAssignOnSessionEnd: true,
                                dueDate: e.target.value
                              };
                            } else {
                              updated[activeSessionIndex].assignment!.dueDate = e.target.value;
                            }
                            setAiGeneratedSessions(updated);
                          }}
                          className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Assignment File Uploader Box */}
                    <div className="p-4 rounded-2xl bg-background/60 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-text flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                          <span>Attach Assignment Document or Starter Pack</span>
                        </span>
                        <span className="text-[10px] text-subtext">PDF, ZIP, IPYNB, DOCX (Max 100MB)</span>
                      </div>

                      {aiGeneratedSessions[activeSessionIndex].assignment?.fileUrl ? (
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <a
                                href={aiGeneratedSessions[activeSessionIndex].assignment!.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-purple-300 hover:underline truncate block"
                              >
                                {aiGeneratedSessions[activeSessionIndex].assignment!.fileName || "assignment-brief.pdf"}
                              </a>
                              <span className="text-[10px] text-subtext">
                                {aiGeneratedSessions[activeSessionIndex].assignment!.fileSize || "Uploaded Attachment"} • Stored in MinIO
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...aiGeneratedSessions];
                              if (updated[activeSessionIndex].assignment) {
                                updated[activeSessionIndex].assignment!.fileUrl = undefined;
                                updated[activeSessionIndex].assignment!.fileName = undefined;
                                updated[activeSessionIndex].assignment!.fileSize = undefined;
                              }
                              setAiGeneratedSessions(updated);
                            }}
                            className="p-1.5 text-subtext hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-white/15 hover:border-purple-500/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-purple-500/[0.03] group">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.zip,.tar,.gz,.py,.ipynb,.doc,.docx,.txt,.json,.csv"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAssignmentFileUpload(activeSessionIndex, file);
                            }}
                          />
                          {uploadingSessionAssignment === activeSessionIndex ? (
                            <div className="flex items-center gap-2 text-purple-400">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span className="text-xs font-bold">Uploading assignment to secure storage...</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-5 h-5" />
                              </div>
                              <p className="text-xs font-bold text-text">
                                Click to browse or drop assignment brief / starter archive
                              </p>
                              <p className="text-[10px] text-subtext">
                                Supports PDF problem sets, ZIP starter code repos, Jupyter Notebooks (.ipynb)
                              </p>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-subtext">Select a session on the left to edit its details.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text border border-white/10 text-xs font-bold cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Review Schedule Timeline</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 4: TIMELINE OVERVIEW
          ══════════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                Step 4 of 5
              </span>
              <h3 className="text-xl font-black text-text mt-0.5">Sessions Schedule Timeline</h3>
              <p className="text-xs text-subtext">
                Review the chronologically scheduled sessions and attached auto-released practical assignments.
              </p>
            </div>

            <div className="overflow-x-auto custom-scrollbar border border-white/10 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-background/80 border-b border-white/10 text-subtext font-black text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Session #</th>
                    <th className="py-3.5 px-4">Title & Topic</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Assignment & Deliverable</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {aiGeneratedSessions.map((s) => (
                    <tr key={s.sessionNumber} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                        #{s.sessionNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-text">
                        {s.title}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-text font-bold">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>{s.date ? formatDate(s.date) : "TBD"}</span>
                          <span className="text-subtext font-normal text-[11px]">({s.startTime})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {s.assignment ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-text font-bold">
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="truncate max-w-[200px]">{s.assignment.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="text-emerald-400 font-semibold">{s.assignment.totalMarks} Marks</span>
                              {s.assignment.fileName && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25">
                                  📎 {s.assignment.fileName}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-subtext">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-subtext font-semibold whitespace-nowrap">
                        {s.duration}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text border border-white/10 text-xs font-bold cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Review & Submit</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 5: REVIEW, DEFAULT INSTRUCTOR & ADMIN APPROVAL SUBMIT
          ══════════════════════════════════════════════════════════════ */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Default Assigned Lead Instructor Card */}
          <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                Step 5 of 5
              </span>
              <h3 className="text-xl font-black text-text mt-0.5">Assigned Lead Instructor</h3>
              <p className="text-xs text-subtext">
                You are automatically assigned as the verified Lead Instructor and primary host for this live cohort.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-background border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-purple-600/20 shrink-0">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "IN"}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-text">{user?.name || "Verified Instructor"}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" />
                      Lead Instructor
                    </span>
                  </div>
                  <p className="text-xs text-subtext font-medium">{user?.email || "instructor@glarus.edu"}</p>
                  <p className="text-[11px] text-purple-300 font-semibold">
                    Authorized Course Creator & Live Host
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-black self-start sm:self-auto uppercase tracking-wider">
                Default Assigned
              </span>
            </div>
          </div>

          {/* Admin Approval Governance Notice */}
          <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-text">Administrator Quality Review Workflow</h4>
                <p className="text-xs text-subtext leading-relaxed font-medium">
                  When you submit this Live Class, it will be registered in <span className="text-amber-400 font-bold">Pending Review</span> status and sent directly to the Glarus Academy Administrator team. Once approved, your live cohort will be published to the public catalog, timetable, and student enrollment portal.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-background/50 border border-white/5 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-subtext uppercase font-bold block mb-0.5">Cohort Title</span>
                <span className="font-bold text-text truncate block">{formData.title || "Untitled Live Class"}</span>
              </div>
              <div>
                <span className="text-[10px] text-subtext uppercase font-bold block mb-0.5">Total Sessions</span>
                <span className="font-bold text-purple-300">{aiGeneratedSessions.length} Live Sessions</span>
              </div>
              <div>
                <span className="text-[10px] text-subtext uppercase font-bold block mb-0.5">Assignments</span>
                <span className="font-bold text-indigo-300">
                  {aiGeneratedSessions.filter((s) => s.assignment?.title).length} Auto-Released Labs
                </span>
              </div>
              <div>
                <span className="text-[10px] text-subtext uppercase font-bold block mb-0.5">Price (INR)</span>
                <span className="font-bold text-emerald-400">₹{formData.price}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text border border-white/10 text-xs font-bold cursor-pointer"
            >
              Back to Timeline
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSubmitLiveCourse("DRAFT")}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-subtext hover:text-text border border-white/10 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSubmitLiveCourse("READY_TO_PUBLISH")}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-105"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isSubmitting ? "Submitting..." : "Submit Live Class for Admin Approval"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
