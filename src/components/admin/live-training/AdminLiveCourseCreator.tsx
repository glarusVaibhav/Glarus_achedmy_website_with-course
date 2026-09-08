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
  Building2
} from "lucide-react";

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
  leadInstructorId: string;
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

export default function AdminLiveCourseCreator() {
  const router = useRouter();

  // Wizard Step: 1 = Basic Info, 2 = Schedule & Frequency, 3 = AI Copilot / Session Builder, 4 = Review Sessions Timeline, 5 = Assignment & Publish
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
    leadInstructorId: "",
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
      "12 Interactive Live Masterclasses (24 Hours Total)",
      "1-on-1 Code Defenses & Mentor Code Reviews",
      "Full GitHub Code Repositories & Jupyter Notebooks",
      "4 Production-Grade Capstone Projects",
      "Dedicated Private Discord Cohort Channel",
      "Cryptographically Verified Certificate of Completion",
      "Lifetime Access to HD Session Recordings"
    ],
    faqs: [
      {
        q: "How long is this live cohort program?",
        a: "The cohort spans 6 weeks with 2 live masterclasses per week (total 12 sessions of 2 hours each)."
      },
      {
        q: "What happens if I miss a live masterclass?",
        a: "Every session is recorded in 1080p Full HD and published to your student dashboard within 2 hours with timestamped agendas, transcripts, and slides."
      },
      {
        q: "Are hands-on capstone projects and mentor defenses included?",
        a: "Yes! You will build 4 production projects and defend them in live 1-on-1 code reviews with senior instructors."
      },
      {
        q: "Will I receive a verified certificate upon completion?",
        a: "Yes. Learners who complete the curriculum milestones and capstone defenses receive an official Glarus Academy Smart Credential."
      }
    ],
    learningJourney: [
      { step: "01", title: "Learn", desc: "Attend interactive live masterclasses with lead AI scientists." },
      { step: "02", title: "Practice", desc: "Hands-on coding labs & notebook exercises in Colab." },
      { step: "03", title: "Build", desc: "Engineer 4 production systems with LangGraph & vector databases." },
      { step: "04", title: "Defend", desc: "Present deliverables and receive 1-on-1 mentor code reviews." },
      { step: "05", title: "Get Certified", desc: "Earn your cryptographically verified Glarus Academy certificate." }
    ],
    cohortLeadBio: "Senior AI Researcher & Architect with deep expertise in neural systems and production ML.",
    heroBadges: ["GENERATIVE AI", "LIVE COHORT", "CERTIFICATION INCLUDED"],
    hasInternship: false,
    internshipType: "Guaranteed Live Project Internship (Upon Completion)",
    internshipDuration: "2 Months",
    internshipStipend: "Paid (₹20,000 / month)",
    internshipCompanyPartner: "Partner AI Startups & Tech Incubators",
    internshipDescription: "Live cohort participants who complete all session assignments and capstone defense receive direct onboarding into a 2-month mentored industry internship."
  });

  // Prerequisites / Objectives / Tags inputs
  const [newPrereq, setNewPrereq] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newTag, setNewTag] = useState("");

  // AI Architect State
  const [aiPrompt, setAiPrompt] = useState("");
  const [sessionCount, setSessionCount] = useState(6);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedSessions, setAiGeneratedSessions] = useState<AISessionItem[]>([]);
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [hasUnsavedAIChanges, setHasUnsavedAIChanges] = useState(false);
  const [aiOriginalBackup, setAiOriginalBackup] = useState<AISessionItem[]>([]);

  // Instructors list from DB
  const [instructors, setInstructors] = useState<any[]>([]);
  const [leadInstructorPermissions, setLeadInstructorPermissions] = useState({
    canView: true,
    canEdit: true,
    canEditAgenda: true,
    canEditSchedule: false,
    canEditResources: true,
    canAddHomework: true,
    canReschedule: false,
    canCancel: false,
    canManageAttendance: true,
    canManageRecording: true
  });
  const [showAdvancedPermissions, setShowAdvancedPermissions] = useState(false);

  // Publishing & Saving state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // AI Overview Assistant State
  const [aiOverviewModalOpen, setAiOverviewModalOpen] = useState(false);
  const [isGeneratingOverview, setIsGeneratingOverview] = useState(false);
  const [aiOverviewCustomPrompt, setAiOverviewCustomPrompt] = useState("");
  const [aiOverviewPreview, setAiOverviewPreview] = useState<{
    description: string;
    shortDescription?: string;
    targetAudience?: string;
    prerequisites?: string[];
    objectives?: string[];
    tags?: string[];
  } | null>(null);

  // Post AI Generation Decision State (Sessions Only vs Sessions + Basic Info)
  const [aiPostGenModalOpen, setAiPostGenModalOpen] = useState(false);
  const [pendingAiCourseInfo, setPendingAiCourseInfo] = useState<{
    title?: string;
    shortDescription?: string;
    description?: string;
    targetAudience?: string;
    prerequisites?: string[];
    objectives?: string[];
    tags?: string[];
  } | null>(null);
  const [pendingAiSessionsCount, setPendingAiSessionsCount] = useState(0);

  // Auto-Generate Landing Page Showcase Assets with AI
  const handleAutoGenerateLanding = async () => {
    const topicToUse = formData.title || aiPrompt;
    if (!topicToUse.trim()) {
      setErrorMessage("Please enter a Course Title in Step 1 first.");
      return;
    }
    setIsGeneratingLanding(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/ai/live-course-landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: topicToUse,
          category: formData.category,
          level: formData.level
        })
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        setFormData((prev) => ({
          ...prev,
          subtitle: d.subtitle || prev.subtitle,
          duration: d.duration || prev.duration,
          price: d.price ? String(d.price) : prev.price,
          originalPrice: d.originalPrice ? String(d.originalPrice) : prev.originalPrice,
          learningOutcomes: Array.isArray(d.learningOutcomes) && d.learningOutcomes.length > 0 ? d.learningOutcomes : prev.learningOutcomes,
          projects: Array.isArray(d.projects) && d.projects.length > 0 ? d.projects : prev.projects,
          batches: Array.isArray(d.batches) && d.batches.length > 0 ? d.batches : prev.batches,
          features: Array.isArray(d.features) && d.features.length > 0 ? d.features : prev.features,
          faqs: Array.isArray(d.faqs) && d.faqs.length > 0 ? d.faqs : prev.faqs,
          learningJourney: Array.isArray(d.learningJourney) && d.learningJourney.length > 0 ? d.learningJourney : prev.learningJourney
        }));
        setSaveSuccessMsg("✨ AI generated rich live cohort landing page showcase assets!");
        setTimeout(() => setSaveSuccessMsg(""), 4500);
      } else {
        setErrorMessage("Could not generate live course showcase data.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Error connecting to AI service.");
    } finally {
      setIsGeneratingLanding(false);
    }
  };

  const handleGenerateOverviewAI = async () => {
    if (!formData.title.trim()) {
      setErrorMessage("Please enter a Course Title first so the AI can craft a tailored overview.");
      return;
    }
    setIsGeneratingOverview(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/ai/live-course/overview-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          level: formData.level,
          currentDescription: formData.description,
          targetAudience: formData.targetAudience,
          customInstructions: aiOverviewCustomPrompt,
          sessionCount: sessionCount
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate AI course overview");
      }

      const data = await res.json();
      setAiOverviewPreview(data);
      setAiOverviewModalOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate course overview");
    } finally {
      setIsGeneratingOverview(false);
    }
  };

  const handleApplyOverviewOnly = () => {
    if (!aiOverviewPreview) return;
    setFormData((prev) => ({
      ...prev,
      description: aiOverviewPreview.description
    }));
    setAiOverviewModalOpen(false);
    setAiOverviewPreview(null);
  };

  const handleApplyAllOverviewFields = () => {
    if (!aiOverviewPreview) return;
    const targetAudienceStr = Array.isArray(aiOverviewPreview.targetAudience)
      ? (aiOverviewPreview.targetAudience as any[]).join(", ")
      : (aiOverviewPreview.targetAudience || prevTargetAudience(formData.targetAudience));

    setFormData((prev) => ({
      ...prev,
      description: aiOverviewPreview.description,
      shortDescription: aiOverviewPreview.shortDescription || prev.shortDescription,
      targetAudience: targetAudienceStr,
      prerequisites: aiOverviewPreview.prerequisites?.length ? aiOverviewPreview.prerequisites : prev.prerequisites,
      objectives: aiOverviewPreview.objectives?.length ? aiOverviewPreview.objectives : prev.objectives,
      tags: aiOverviewPreview.tags?.length ? aiOverviewPreview.tags : prev.tags
    }));
    setAiOverviewModalOpen(false);
    setAiOverviewPreview(null);
  };

  function prevTargetAudience(val: any): string {
    if (Array.isArray(val)) return val.join(", ");
    return val || "";
  }

  // Post AI Generation Decision Handlers
  const handleKeepBasicInfoSessionsOnly = () => {
    setAiPostGenModalOpen(false);
    setSaveSuccessMsg(`Imported ${aiGeneratedSessions.length} live sessions. Your Course Basic Info was kept intact.`);
    setTimeout(() => setSaveSuccessMsg(""), 4500);
  };

  const handleApplyAllAiCourseInfo = () => {
    if (pendingAiCourseInfo) {
      const targetAudienceStr = Array.isArray(pendingAiCourseInfo.targetAudience)
        ? (pendingAiCourseInfo.targetAudience as any[]).join(", ")
        : (pendingAiCourseInfo.targetAudience || formData.targetAudience || "");

      setFormData((prev) => ({
        ...prev,
        title: pendingAiCourseInfo.title || prev.title,
        shortDescription: pendingAiCourseInfo.shortDescription || prev.shortDescription,
        description: pendingAiCourseInfo.description || prev.description,
        targetAudience: targetAudienceStr,
        prerequisites: pendingAiCourseInfo.prerequisites?.length ? pendingAiCourseInfo.prerequisites : prev.prerequisites,
        objectives: pendingAiCourseInfo.objectives?.length ? pendingAiCourseInfo.objectives : prev.objectives,
        tags: pendingAiCourseInfo.tags?.length ? pendingAiCourseInfo.tags : prev.tags
      }));
    }
    setAiPostGenModalOpen(false);
    setSaveSuccessMsg(`Imported ${aiGeneratedSessions.length} live sessions & updated Course Basic Info with AI suggestions!`);
    setTimeout(() => setSaveSuccessMsg(""), 4500);
  };

  // Fetch instructors on load
  useEffect(() => {
    async function loadInstructors() {
      try {
        const res = await fetch("/api/admin/live-training/assignments");
        if (res.ok) {
          const data = await res.json();
          if (data.instructors) {
            setInstructors(data.instructors);
            if (data.instructors.length > 0 && !formData.leadInstructorId) {
              setFormData((prev) => ({ ...prev, leadInstructorId: data.instructors[0].id }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load instructors", err);
      }
    }
    loadInstructors();
  }, []);

  // Handle Day Toggle (Automatically calculates session frequency from selected workshop days)
  const togglePreferredDay = (day: string) => {
    setFormData((prev) => {
      const exists = prev.preferredDays.includes(day);
      const updatedDays = exists
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day];
      const sessionFrequency = updatedDays.length > 0
        ? `${updatedDays.length} session${updatedDays.length > 1 ? "s" : ""} per week (${updatedDays.join(", ")})`
        : "Flexible Schedule";
      return { ...prev, preferredDays: updatedDays, sessionFrequency };
    });
  };

  // Calculate suggested sessions and calendar distribution based on startDate, endDate, and preferredDays
  const calculatedScheduleMetrics = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return { totalSessions: 6, weeks: 6, sessionDates: [], targetDays: formData.preferredDays || ["Monday", "Wednesday"] };
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return { totalSessions: 6, weeks: 6, sessionDates: [], targetDays: formData.preferredDays || ["Monday", "Wednesday"] };
    }

    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6
    };

    const targetDays = formData.preferredDays && formData.preferredDays.length > 0 ? formData.preferredDays : ["Monday", "Wednesday"];
    const targetDayIndices = targetDays.map((d) => dayMap[d]);

    const sessionDates: string[] = [];
    const current = new Date(start);

    // Count matching days across the date range
    let safety = 0;
    while (current <= end && safety < 365) {
      safety++;
      if (targetDayIndices.includes(current.getDay())) {
        sessionDates.push(current.toISOString().split("T")[0]);
      }
      current.setDate(current.getDate() + 1);
    }

    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const weeks = Math.max(1, Math.round(diffDays / 7));
    const totalSessions = sessionDates.length > 0 ? sessionDates.length : Math.max(2, weeks * targetDays.length);

    return {
      totalSessions,
      weeks,
      sessionDates,
      targetDays
    };
  }, [formData.startDate, formData.endDate, formData.preferredDays]);

  // Add Item Helpers
  const addPrerequisite = () => {
    if (!newPrereq.trim()) return;
    setFormData((prev) => ({ ...prev, prerequisites: [...prev.prerequisites, newPrereq.trim()] }));
    setNewPrereq("");
  };
  const removePrerequisite = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addObjective = () => {
    if (!newObjective.trim()) return;
    setFormData((prev) => ({ ...prev, objectives: [...prev.objectives, newObjective.trim()] }));
    setNewObjective("");
  };
  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
    setNewTag("");
  };
  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Auto-generate draft session schedule based on Preferred Days and Start Date
  const generateScheduleDates = (count: number) => {
    const sessions: AISessionItem[] = [];
    const startDateObj = new Date(formData.startDate || Date.now());
    let currentDate = new Date(startDateObj);
    let sessionNum = 1;

    // Day index map: Sunday=0, Monday=1, ..., Saturday=6
    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6
    };

    const targetDayIndices = (formData.preferredDays.length > 0 ? formData.preferredDays : ["Monday", "Wednesday"]).map(
      (d) => dayMap[d]
    );

    let safetyCount = 0;
    while (sessions.length < count && safetyCount < 365) {
      safetyCount++;
      if (targetDayIndices.includes(currentDate.getDay())) {
        const dateStr = currentDate.toISOString().split("T")[0];
        sessions.push({
          sessionNumber: sessionNum,
          title: `Live Session ${sessionNum}: Workshop Topic`,
          description: `Interactive live workshop session covering core concepts, pair coding, and milestone exercises.`,
          date: dateStr,
          startTime: formData.preferredStartTime,
          endTime: "09:00 PM",
          duration: formData.defaultDuration,
          timezone: formData.timezone,
          status: "SCHEDULED",
          agenda: [
            { title: "Welcome & Milestones", description: "Cohort sync and environment setup check.", startTime: formData.preferredStartTime, endTime: "07:15 PM", duration: "15 min" },
            { title: "Core Concept Deep Dive", description: "Theoretical breakdown and architecture walkthrough.", startTime: "07:15 PM", endTime: "07:55 PM", duration: "40 min" },
            { title: "Break & Sandbox Refresh", description: "Short breather and workspace sync.", startTime: "07:55 PM", endTime: "08:05 PM", duration: "10 min" },
            { title: "Live Implementation & Pair Coding", description: "Hands-on coding with live pair-programming.", startTime: "08:05 PM", endTime: "08:45 PM", duration: "40 min" },
            { title: "Interactive Q&A & Homework Briefing", description: "Open questions and take-home project assignment.", startTime: "08:45 PM", endTime: "09:00 PM", duration: "15 min" }
          ],
          topics: [
            { title: `Module ${sessionNum} Foundations`, description: "Essential theoretical principles" },
            { title: `Production Implementation`, description: "Enterprise architecture and code" }
          ],
          learningOutcomes: [
            `Understand core principles of Session ${sessionNum}`,
            "Implement production code without boilerplate",
            "Debug complex edge cases in real-time"
          ],
          activities: [
            { title: "Hands-On Live Coding Workshop", instructions: "Build and test the module in real-time with instructor.", duration: "30 min" }
          ],
          resources: [
            { title: "Session GitHub Starter Repo", type: "GITHUB", url: "https://github.com/glarus-academy" }
          ],
          homework: {
            title: `Session ${sessionNum} Deliverable Challenge`,
            description: "Implement and submit the hands-on project assignment.",
            dueDate: "3 days after session"
          }
        });
        sessionNum++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  };

  // Trigger GROQ AI Course & Sessions Generation
  const handleGenerateWithAI = async () => {
    const promptToUse = aiPrompt.trim() || formData.title.trim() || "Advanced Generative AI & Autonomous Multi-Agent Systems Bootcamp";
    setIsGeneratingAI(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/ai/live-course/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToUse,
          sessionCount,
          startDate: formData.startDate,
          frequency: formData.sessionFrequency,
          defaultDuration: formData.defaultDuration,
          preferredTime: formData.preferredStartTime,
          timezone: formData.timezone,
          level: formData.level,
          category: formData.category
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate AI course content");
      }

      const data = await res.json();

      // Pre-populate scheduled dates for each session
      const dateSchedules = generateScheduleDates(data.sessions?.length || sessionCount);

      const mergedSessions: AISessionItem[] = (data.sessions || []).map((s: any, idx: number) => {
        const scheduleRef = dateSchedules[idx] || {};
        return {
          sessionNumber: s.sessionNumber || idx + 1,
          title: s.title || `Session ${idx + 1}`,
          description: s.description || "",
          date: s.date || scheduleRef.date || formData.startDate,
          startTime: s.startTime || formData.preferredStartTime,
          endTime: s.endTime || "09:00 PM",
          duration: s.duration || formData.defaultDuration,
          timezone: formData.timezone,
          status: "SCHEDULED",
          agenda: s.agenda || scheduleRef.agenda || [],
          topics: s.topics || [],
          learningOutcomes: s.learningOutcomes || [],
          activities: s.activities || [],
          resources: s.resources || [],
          homework: s.homework || undefined
        };
      });

      // Store generated sessions
      setAiGeneratedSessions(mergedSessions);
      setAiOriginalBackup(JSON.parse(JSON.stringify(mergedSessions)));
      setHasUnsavedAIChanges(true);
      setActiveSessionIndex(0);

      // Check if AI generated course basic info (Ask user if they want sessions only or basic info too)
      if (data.course && (data.course.title || data.course.description || data.course.objectives?.length)) {
        setPendingAiCourseInfo(data.course);
        setPendingAiSessionsCount(mergedSessions.length);
        setAiPostGenModalOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to generate with AI copilot.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Discard AI Changes
  const handleDiscardAIChanges = () => {
    if (aiOriginalBackup.length > 0) {
      setAiGeneratedSessions(JSON.parse(JSON.stringify(aiOriginalBackup)));
    } else {
      setAiGeneratedSessions([]);
    }
    setHasUnsavedAIChanges(false);
  };

  // Manual Session Modification Helpers
  const handleUpdateActiveSession = (field: keyof AISessionItem, value: any) => {
    setAiGeneratedSessions((prev) => {
      const updated = [...prev];
      updated[activeSessionIndex] = {
        ...updated[activeSessionIndex],
        [field]: value
      };
      return updated;
    });
  };

  const handleAddAgendaItem = () => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const newAgenda = [
      ...current.agenda,
      {
        title: "New Agenda Step",
        description: "Interactive session step description",
        startTime: "08:00 PM",
        endTime: "08:20 PM",
        duration: "20 min"
      }
    ];
    handleUpdateActiveSession("agenda", newAgenda);
  };

  const handleRemoveAgendaItem = (agendaIdx: number) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const newAgenda = current.agenda.filter((_, i) => i !== agendaIdx);
    handleUpdateActiveSession("agenda", newAgenda);
  };

  const handleUpdateAgendaItem = (agendaIdx: number, field: string, value: string) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const updatedAgenda = [...current.agenda];
    updatedAgenda[agendaIdx] = {
      ...updatedAgenda[agendaIdx],
      [field]: value
    };
    handleUpdateActiveSession("agenda", updatedAgenda);
  };

  const handleAddNewSession = () => {
    const newNum = aiGeneratedSessions.length + 1;
    const newSess: AISessionItem = {
      sessionNumber: newNum,
      title: `Live Session ${newNum}: Additional Deep Dive`,
      description: "Custom hands-on workshop session added by administrator.",
      date: formData.startDate,
      startTime: formData.preferredStartTime,
      endTime: "09:00 PM",
      duration: formData.defaultDuration,
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

  // Submit Handler (Save as Draft or Assign/Publish)
  const handleSubmitLiveCourse = async (publishStatus: "DRAFT" | "ASSIGNED" | "PUBLISHED") => {
    if (!formData.title.trim()) {
      setErrorMessage("Please provide a course title in Step 1.");
      setCurrentStep(1);
      return;
    }

    if (aiGeneratedSessions.length === 0) {
      // Auto-generate fallback sessions if none created
      const fallbackSessions = generateScheduleDates(sessionCount);
      setAiGeneratedSessions(fallbackSessions);
    }

    const sessionsToSave = aiGeneratedSessions.length > 0 ? aiGeneratedSessions : generateScheduleDates(sessionCount);

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/live-training/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetAudience: Array.isArray(formData.targetAudience)
            ? (formData.targetAudience as any[]).join(", ")
            : (formData.targetAudience || ""),
          status: publishStatus,
          sessions: sessionsToSave,
          leadInstructorPermissions
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save live course");
      }

      const result = await res.json();
      setPublishModalOpen(false);
      setSaveSuccessMsg(
        publishStatus === "ASSIGNED"
          ? `Live Course "${formData.title}" assigned to instructor successfully!`
          : `Live Course "${formData.title}" saved successfully as ${publishStatus}!`
      );

      setTimeout(() => {
        router.push(`/admin/live-training/courses/${result.course.id}`);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to save live course.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/live-training"
            className="p-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text transition-colors"
            title="Back to Live Training"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">
                Live Cohort Studio
              </span>
              <span className="text-xs text-subtext">•</span>
              <span className="text-xs text-subtext">Step {currentStep} of 5</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight mt-0.5">
              Create Live Course & Cohort
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleSubmitLiveCourse("DRAFT")}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card hover:bg-card-hover text-text border border-white/10 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-subtext" />
            <span>Save as Draft</span>
          </button>
          <button
            onClick={() => setPublishModalOpen(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 hover:scale-105 disabled:opacity-50"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assign to Instructor</span>
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 text-red-300 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-5 gap-2 p-1.5 rounded-2xl bg-card border border-white/10">
        {[
          { step: 1, label: "Basic Info", icon: FileText },
          { step: 2, label: "Schedule", icon: Calendar },
          { step: 3, label: "Sessions", icon: Sparkles },
          { step: 4, label: "Review Timeline", icon: Layers },
          { step: 5, label: "Instructor & Publish", icon: UserCheck }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isCompleted = currentStep > item.step;
          return (
            <button
              key={item.step}
              onClick={() => setCurrentStep(item.step)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all text-xs font-bold ${
                isActive
                  ? "bg-purple-600/25 border border-purple-500/40 text-purple-300 shadow-sm"
                  : isCompleted
                  ? "bg-white/5 text-emerald-400 border border-emerald-500/20"
                  : "text-subtext hover:text-text hover:bg-white/[0.03]"
              }`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-purple-400" : "text-subtext"}`} />
              )}
              <span className="hidden md:inline truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STEP 1: BASIC INFORMATION
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-6">
            <div>
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Live Course Core Information
              </h2>
              <p className="text-xs text-subtext mt-0.5">
                Define the high-level positioning, category, and target audience for this live cohort.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-text">Course Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Advanced Generative AI & Autonomous Agents Bootcamp"
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-white/10 text-text text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-text">Short Tagline / Subtitle</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="e.g. Master LangGraph, RAG pipelines, and Tool-calling LLMs in 6 intense live weeks."
                  className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Generative AI">Generative AI & LLMs</option>
                  <option value="AI Engineering">AI Engineering & Agents</option>
                  <option value="Web Development">Full-Stack Web Development</option>
                  <option value="Data Science & ML">Data Science & Machine Learning</option>
                  <option value="Cloud & DevOps">Cloud & MLOps</option>
                  <option value="Cybersecurity">Cybersecurity & Governance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Target Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-text">Detailed Course Overview</label>
                    <span className="text-[10px] text-subtext hidden sm:inline">• Learning trajectory, capstone & deliverables</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateOverviewAI}
                    disabled={isGeneratingOverview}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/25 to-indigo-600/25 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all shadow-sm hover:scale-[1.02] disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingOverview ? "animate-spin text-purple-300" : "text-purple-400"}`} />
                    <span>{isGeneratingOverview ? "Crafting with AI..." : "AI Write Overview"}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the learning trajectory, capstone live project, pair-programming expectations, and deliverables..."
                  className="w-full p-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50 leading-relaxed"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-text">Target Audience</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g. Senior Software Engineers, Data Scientists, and Solutions Architects."
                  className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {/* ── Pricing, Duration & Video Preview Logistics ── */}
              <div className="md:col-span-2 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Live Cohort Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text flex items-center justify-between">
                    <span>Live Cohort Price (₹) *</span>
                    <span className="text-[10px] text-purple-400 font-bold">Enrollment Fee</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-subtext font-bold">₹</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="18999"
                      className="w-full h-10 pl-7 pr-3 rounded-xl bg-background border border-white/10 text-text text-xs font-bold focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                {/* Original Price & Discount Badge */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text flex items-center justify-between">
                    <span>Original Price (₹)</span>
                    {Number(formData.originalPrice) > Number(formData.price) && (
                      <span className="text-[10px] text-emerald-400 font-black bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% OFF
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-subtext font-bold">₹</span>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="24999"
                      className="w-full h-10 pl-7 pr-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                {/* Program Duration Badge */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text">Live Program Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 6 Weeks · 12 Live Sessions"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {/* Preview Video URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text">16:9 Preview Video URL</label>
                  <input
                    type="text"
                    value={formData.previewVideoUrl}
                    onChange={(e) => setFormData({ ...formData, previewVideoUrl: e.target.value })}
                    placeholder="https://...mp4 or embed URL"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs font-mono focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════════════
                  🌟 LANDING PAGE SHOWCASE STUDIO (WHAT YOU'LL LEARN, PROJECTS, BATCHES, FAQS)
                  ══════════════════════════════════════════════════════════════ */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-purple-950/20 border border-purple-500/30 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
                      <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-text">Live Cohort Showcase Studio</h3>
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase tracking-wider">
                          Public /student/live-courses/[id]
                        </span>
                      </div>
                      <p className="text-[11px] text-subtext mt-0.5">
                        Manage rich 6 competency cards, real-world capstone projects, cohort batches, FAQs, and enrollment benefits shown on the live landing page.
                      </p>
                    </div>
                  </div>

                  {/* ✨ Auto-Generate All Landing Content with AI */}
                  <button
                    type="button"
                    onClick={handleAutoGenerateLanding}
                    disabled={isGeneratingLanding || !formData.title.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    {isGeneratingLanding ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Showcase...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>✨ AI Auto-Generate Showcase</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Showcase Sub-Tabs */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
                  {[
                    { id: "outcomes", label: `What You'll Learn (${formData.learningOutcomes.length})`, icon: Award },
                    { id: "projects", label: `Real-World Projects (${formData.projects.length})`, icon: Code },
                    { id: "batches", label: `Cohort Batches (${formData.batches.length})`, icon: Calendar },
                    { id: "features", label: `What's Included (${formData.features.length})`, icon: CheckCircle2 },
                    { id: "faqs", label: `FAQs (${formData.faqs.length})`, icon: HelpCircle }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLandingTab(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
                        landingTab === tab.id
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                          : "text-subtext hover:text-text hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* TAB 1: WHAT YOU'LL LEARN (6 Competency Cards) */}
                {landingTab === "outcomes" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-subtext">
                        These 6 competency cards render on the public landing page under <strong>&quot;What You&apos;ll Learn & Build&quot;</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            learningOutcomes: [
                              ...prev.learningOutcomes,
                              { title: "New Core Competency", description: "Detailed description of technical mastery." }
                            ]
                          }))
                        }
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Competency Card
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {formData.learningOutcomes.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-background/80 border border-white/10 hover:border-purple-500/30 transition-all space-y-2 relative group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
                              Card #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== idx)
                                }))
                              }
                              className="text-subtext hover:text-rose-400 transition-colors p-1"
                              title="Delete Card"
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
                            placeholder="Competency Title..."
                            className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-purple-500"
                          />
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...formData.learningOutcomes];
                              updated[idx].description = e.target.value;
                              setFormData({ ...formData, learningOutcomes: updated });
                            }}
                            placeholder="Competency technical depth & takeaways..."
                            className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs text-subtext outline-none focus:border-purple-500 leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: REAL-WORLD PROJECTS (4 Portfolio Deliverables) */}
                {landingTab === "projects" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-subtext">
                        These project cards render under <strong>&quot;Real-World Capstone Projects Included&quot;</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            projects: [
                              ...prev.projects,
                              {
                                number: String(prev.projects.length + 1).padStart(2, "0"),
                                title: "New Capstone Project",
                                desc: "Production-grade multi-agent architecture project.",
                                tech: ["Python", "FastAPI", "Docker"]
                              }
                            ]
                          }))
                        }
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Project Card
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {formData.projects.map((proj, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-background/80 border border-white/10 hover:border-purple-500/30 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-black text-purple-400">
                              Project {proj.number || String(idx + 1).padStart(2, "0")}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  projects: prev.projects.filter((_, i) => i !== idx)
                                }))
                              }
                              className="text-subtext hover:text-rose-400 transition-colors p-1"
                              title="Delete Project"
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
                            placeholder="Project Title..."
                            className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-purple-500"
                          />
                          <textarea
                            rows={2}
                            value={proj.desc}
                            onChange={(e) => {
                              const updated = [...formData.projects];
                              updated[idx].desc = e.target.value;
                              setFormData({ ...formData, projects: updated });
                            }}
                            placeholder="Project architecture and deliverable..."
                            className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs text-subtext outline-none focus:border-purple-500 leading-relaxed"
                          />
                          <div>
                            <label className="block text-[10px] font-bold text-subtext uppercase mb-1">
                              Tech Stack (comma separated)
                            </label>
                            <input
                              type="text"
                              value={Array.isArray(proj.tech) ? proj.tech.join(", ") : ""}
                              onChange={(e) => {
                                const updated = [...formData.projects];
                                updated[idx].tech = e.target.value
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean);
                                setFormData({ ...formData, projects: updated });
                              }}
                              placeholder="e.g. Python, LangGraph, FastAPI, Docker"
                              className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-text outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: COHORT BATCHES */}
                {landingTab === "batches" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-subtext">
                        These batch options render under <strong>&quot;Select Your Preferred Batch&quot;</strong> and allow students to pick dates & schedules.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            batches: [
                              ...prev.batches,
                              {
                                id: `batch-0${prev.batches.length + 1}`,
                                name: `Batch #0${prev.batches.length + 1} (Upcoming)`,
                                startDate: "01 Oct 2026",
                                schedule: "Mon · Wed · Fri",
                                time: "08:00 PM – 10:00 PM IST",
                                duration: "6 Weeks",
                                enrolled: 5,
                                total: 50
                              }
                            ]
                          }))
                        }
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Cohort Batch
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {formData.batches.map((batch, idx) => (
                        <div
                          key={batch.id || idx}
                          className="p-4 rounded-2xl bg-background/80 border border-white/10 hover:border-purple-500/30 transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-purple-400">Batch #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  batches: prev.batches.filter((_, i) => i !== idx)
                                }))
                              }
                              className="text-subtext hover:text-rose-400 transition-colors p-1"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-subtext uppercase">Batch Name</label>
                              <input
                                type="text"
                                value={batch.name}
                                onChange={(e) => {
                                  const updated = [...formData.batches];
                                  updated[idx].name = e.target.value;
                                  setFormData({ ...formData, batches: updated });
                                }}
                                placeholder="e.g. Batch #01 (Weekend)"
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-purple-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-subtext uppercase">Start Date</label>
                              <input
                                type="text"
                                value={batch.startDate}
                                onChange={(e) => {
                                  const updated = [...formData.batches];
                                  updated[idx].startDate = e.target.value;
                                  setFormData({ ...formData, batches: updated });
                                }}
                                placeholder="e.g. 24 Aug 2026"
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-medium text-text outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-subtext uppercase">Weekly Days</label>
                              <input
                                type="text"
                                value={batch.schedule}
                                onChange={(e) => {
                                  const updated = [...formData.batches];
                                  updated[idx].schedule = e.target.value;
                                  setFormData({ ...formData, batches: updated });
                                }}
                                placeholder="e.g. Mon · Wed · Fri"
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-medium text-text outline-none focus:border-purple-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-subtext uppercase">Class Timing</label>
                              <input
                                type="text"
                                value={batch.time}
                                onChange={(e) => {
                                  const updated = [...formData.batches];
                                  updated[idx].time = e.target.value;
                                  setFormData({ ...formData, batches: updated });
                                }}
                                placeholder="e.g. 08:00 PM – 10:30 PM IST"
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-medium text-text outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-subtext uppercase">Enrolled Seats</label>
                              <input
                                type="number"
                                value={batch.enrolled}
                                onChange={(e) => {
                                  const updated = [...formData.batches];
                                  updated[idx].enrolled = Number(e.target.value);
                                  setFormData({ ...formData, batches: updated });
                                }}
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-purple-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-subtext uppercase">Total Capacity</label>
                              <input
                                type="number"
                                value={batch.total}
                                onChange={(e) => {
                                  const updated = [...formData.batches];
                                  updated[idx].total = Number(e.target.value);
                                  setFormData({ ...formData, batches: updated });
                                }}
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: THIS COURSE INCLUDES CHECKLIST */}
                {landingTab === "features" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <p className="text-xs text-subtext">
                      These feature checklist items render under <strong>&quot;What&apos;s Included in Your Enrollment&quot;</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {formData.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 bg-background/80 border border-white/10 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const updated = [...formData.features];
                              updated[idx] = e.target.value;
                              setFormData({ ...formData, features: updated });
                            }}
                            className="flex-1 bg-transparent text-xs text-text font-medium outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                features: prev.features.filter((_, i) => i !== idx)
                              }))
                            }
                            className="text-subtext hover:text-rose-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          features: [...prev.features, "Lifetime access to HD masterclass recordings"]
                        }))
                      }
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Benefit Item
                    </button>
                  </div>
                )}

                {/* TAB 5: FREQUENTLY ASKED QUESTIONS */}
                {landingTab === "faqs" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-subtext">
                        These Q&A accordions render under <strong>&quot;Frequently Asked Questions&quot;</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            faqs: [
                              ...prev.faqs,
                              { q: "New Question?", a: "Detailed answer explaining cohort policies, prerequisites, or recordings." }
                            ]
                          }))
                        }
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.faqs.map((faq, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-background/80 border border-white/10 hover:border-purple-500/30 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase text-purple-400">FAQ #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  faqs: prev.faqs.filter((_, i) => i !== idx)
                                }))
                              }
                              className="text-subtext hover:text-rose-400 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={faq.q}
                            onChange={(e) => {
                              const updated = [...formData.faqs];
                              updated[idx].q = e.target.value;
                              setFormData({ ...formData, faqs: updated });
                            }}
                            placeholder="Question..."
                            className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-purple-500"
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
                            className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs text-subtext outline-none focus:border-purple-500 leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prerequisites, Objectives, Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Learning Objectives */}
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Learning Objectives ({formData.objectives.length})
                </h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addObjective()}
                  placeholder="Add learning objective..."
                  className="flex-1 h-9 px-3 rounded-xl bg-background border border-white/10 text-xs text-text focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="button"
                  onClick={addObjective}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {formData.objectives.map((obj, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-background/50 border border-white/5 text-xs text-text"
                  >
                    <span className="truncate">{obj}</span>
                    <button
                      type="button"
                      onClick={() => removeObjective(i)}
                      className="text-subtext hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Prerequisites ({formData.prerequisites.length})
                </h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrereq}
                  onChange={(e) => setNewPrereq(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPrerequisite()}
                  placeholder="Add prerequisite..."
                  className="flex-1 h-9 px-3 rounded-xl bg-background border border-white/10 text-xs text-text focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="button"
                  onClick={addPrerequisite}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {formData.prerequisites.map((req, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-background/50 border border-white/5 text-xs text-text"
                  >
                    <span className="truncate">{req}</span>
                    <button
                      type="button"
                      onClick={() => removePrerequisite(i)}
                      className="text-subtext hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 💼 Live Cohort Internship & Hiring Partner Program */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-card via-card/90 to-purple-950/20 border border-white/10 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-text">Live Cohort Internship Program</h3>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                        Placement Perk
                      </span>
                    </div>
                    <p className="text-[11px] text-subtext mt-0.5">
                      Pair this live training cohort with a guaranteed or performance-based industry project internship.
                    </p>
                  </div>
                </div>

                {/* Internship Toggle */}
                <label className="relative inline-flex items-center cursor-pointer select-none self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={formData.hasInternship}
                    onChange={(e) => setFormData({ ...formData, hasInternship: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 border border-white/10" />
                  <span className="ml-2.5 text-xs font-bold text-text">
                    {formData.hasInternship ? "Internship Included" : "No Internship"}
                  </span>
                </label>
              </div>

              {/* Expandable Internship Configuration */}
              {formData.hasInternship && (
                <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Internship Track / Model */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text">Internship Opportunity Model *</label>
                    <select
                      value={formData.internshipType}
                      onChange={(e) => setFormData({ ...formData, internshipType: e.target.value })}
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-text outline-none"
                    >
                      <option value="Guaranteed Live Project Internship (Upon Completion)">Guaranteed Live Project Internship (Upon Completion)</option>
                      <option value="Performance-Based Internship (Top 20% Performers)">Performance-Based Internship (Top 20% Performers)</option>
                      <option value="Direct Project Internship with Partner Startups">Direct Project Internship with Partner Startups</option>
                      <option value="Virtual AI Research & Engineering Lab">Virtual AI Research & Engineering Lab</option>
                      <option value="Paid Industry Fellowship">Paid Industry Fellowship</option>
                    </select>
                  </div>

                  {/* Internship Duration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text">Internship Duration</label>
                    <select
                      value={formData.internshipDuration}
                      onChange={(e) => setFormData({ ...formData, internshipDuration: e.target.value })}
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-text outline-none"
                    >
                      <option value="1 Month (Sprint)">1 Month (Sprint)</option>
                      <option value="2 Months (Standard)">2 Months (Standard)</option>
                      <option value="3 Months (Comprehensive)">3 Months (Comprehensive)</option>
                      <option value="6 Months (Co-Op Fellowship)">6 Months (Co-Op Fellowship)</option>
                    </select>
                  </div>

                  {/* Internship Stipend / Compensation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text">Stipend / Perks Offered</label>
                    <input
                      type="text"
                      value={formData.internshipStipend}
                      onChange={(e) => setFormData({ ...formData, internshipStipend: e.target.value })}
                      placeholder="e.g. Paid (₹20,000/mo) or Certificate + Verified LOR"
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-text outline-none"
                    />
                  </div>

                  {/* Partner Companies / Hiring Network */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text">Partner Companies / Hiring Network</label>
                    <input
                      type="text"
                      value={formData.internshipCompanyPartner}
                      onChange={(e) => setFormData({ ...formData, internshipCompanyPartner: e.target.value })}
                      placeholder="e.g. Partner AI Startups & Tech Incubators"
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-text outline-none"
                    />
                  </div>

                  {/* Internship Scope & Eligibility */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-text">Internship Scope & Eligibility Criteria</label>
                    <textarea
                      rows={2}
                      value={formData.internshipDescription}
                      onChange={(e) => setFormData({ ...formData, internshipDescription: e.target.value })}
                      placeholder="Detail requirements for students to qualify (e.g. 80%+ attendance, capstone review, etc.)..."
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-xl p-3 text-xs text-text outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
            >
              <span>Next: Cohort Schedule</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 2: SCHEDULE & COHORT CADENCE
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-6">
            <div>
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Live Cohort Schedule & Frequency
              </h2>
              <p className="text-xs text-subtext mt-0.5">
                Define the recurring schedule, session duration, preferred workshop days, and video conference settings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Cohort Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Cohort End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Default Session Duration</label>
                <select
                  value={formData.defaultDuration}
                  onChange={(e) => setFormData({ ...formData, defaultDuration: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                >
                  <option value="60 min">60 min (1 Hour)</option>
                  <option value="90 min">90 min (1.5 Hours)</option>
                  <option value="120 min">120 min (2 Hours)</option>
                  <option value="150 min">150 min (2.5 Hours)</option>
                  <option value="180 min">180 min (3 Hours)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Preferred Start Time</label>
                <input
                  type="text"
                  value={formData.preferredStartTime}
                  onChange={(e) => setFormData({ ...formData, preferredStartTime: e.target.value })}
                  placeholder="e.g. 07:00 PM"
                  className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Time Zone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST, UTC+5:30)</option>
                  <option value="America/New_York (EST)">America/New_York (EST, UTC-5)</option>
                  <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST, UTC-8)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT, UTC+0)</option>
                  <option value="Europe/Berlin (CET)">Europe/Berlin (CET, UTC+1)</option>
                  <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT, UTC+8)</option>
                </select>
              </div>

              {/* Preferred Days Checkboxes */}
              <div className="md:col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text">Preferred Workshop Days</label>
                  <span className="text-[11px] text-purple-300 font-bold bg-purple-500/15 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
                    {calculatedScheduleMetrics.targetDays.length} Days / Week
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = formData.preferredDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => togglePreferredDay(day)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? "bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm scale-105"
                            : "bg-background text-subtext border-white/10 hover:text-text hover:bg-white/5"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Live Calculated Schedule Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-card to-background border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <span>Calculated Cohort Schedule:</span>
                        <span className="text-emerald-400 font-black">
                          {calculatedScheduleMetrics.totalSessions} Live Sessions
                        </span>
                      </h4>
                      <p className="text-[11px] text-subtext mt-0.5">
                        Based on {calculatedScheduleMetrics.targetDays.join(", ")} across {calculatedScheduleMetrics.weeks} weeks ({formData.startDate} to {formData.endDate})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                      Auto-Calculated
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Max Student Capacity</label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                  className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Meeting Platform</label>
                <select
                  value={formData.meetingPlatform}
                  onChange={(e) => setFormData({ ...formData, meetingPlatform: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Zoom Enterprise">Zoom Enterprise</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Custom Stream / WebRTC">Custom Stream / WebRTC</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Default Meeting Link</label>
                <input
                  type="url"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                  placeholder="https://zoom.us/j/123456789"
                  className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card hover:bg-card-hover text-subtext hover:text-text border border-white/10 text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (calculatedScheduleMetrics.totalSessions > 0) {
                  setSessionCount(calculatedScheduleMetrics.totalSessions);
                }
                setCurrentStep(3);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
            >
              <span>Next: Sessions ({calculatedScheduleMetrics.totalSessions} Sessions)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 3: AI-ASSISTED GENERATION & EDITABLE CURRICULUM
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {aiGeneratedSessions.length === 0 ? (
            /* ── UNIFIED CURRICULUM ARCHITECT STUDIO (INITIAL STATE) ── */
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card via-card to-purple-950/20 border border-purple-500/30 shadow-2xl backdrop-blur-xl space-y-6">
              {/* Studio Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-300 shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Curriculum Architect Studio
                </h2>
                <p className="text-xs sm:text-sm text-subtext leading-relaxed">
                  Auto-generate complete interactive sessions with timed agendas, coding exercises, and take-home assignments using AI — or start building your syllabus manually.
                </p>
              </div>

              {/* Quick Starter Templates */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-subtext flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>One-Click Quick Starter Templates:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {STARTER_PROMPTS.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAiPrompt(t.prompt);
                        setSessionCount(t.sessions);
                      }}
                      className="p-3 rounded-xl bg-background/80 hover:bg-purple-600/15 border border-white/10 hover:border-purple-500/40 text-left transition-all group shadow-sm"
                    >
                      <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        {t.label}
                      </p>
                      <p className="text-[10px] text-subtext mt-0.5 font-medium">
                        {t.sessions} Sessions · Click to load
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input Box */}
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={`Enter prompt or topic vision (e.g. 'Create a ${sessionCount}-session live bootcamp on ${formData.title || "Generative AI"} covering foundations, real-time architectures, and hands-on capstone')`}
                    className="w-full p-4 rounded-2xl bg-background/90 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/60 leading-relaxed placeholder:text-subtext/50 shadow-inner"
                  />
                  <span className="absolute right-3.5 bottom-3 text-[10px] text-subtext/60 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Powered by Groq Llama-3
                  </span>
                </div>

                {/* Primary Controls & Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-background/50 border border-white/10">
                  {/* Sessions Count Stepper & Suggested Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Sessions:</span>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border border-white/15">
                        <button
                          type="button"
                          onClick={() => setSessionCount(Math.max(2, sessionCount - 1))}
                          className="w-6 h-6 rounded-lg bg-background hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-black text-sm text-purple-300">
                          {sessionCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSessionCount(Math.min(36, sessionCount + 1))}
                          className="w-6 h-6 rounded-lg bg-background hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Suggested Sessions Button / Badge */}
                    <button
                      type="button"
                      onClick={() => setSessionCount(calculatedScheduleMetrics.totalSessions)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
                        sessionCount === calculatedScheduleMetrics.totalSessions
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30"
                          : "bg-purple-600/20 text-purple-200 border-purple-500/40 hover:bg-purple-600/30 hover:border-purple-400"
                      }`}
                      title={`Schedule Calculation: ${calculatedScheduleMetrics.totalSessions} sessions across ${calculatedScheduleMetrics.weeks} weeks on ${calculatedScheduleMetrics.targetDays.join(", ")}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Suggested: <strong className="text-white">{calculatedScheduleMetrics.totalSessions} Sessions</strong>
                      </span>
                      {sessionCount === calculatedScheduleMetrics.totalSessions ? (
                        <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded font-black">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] bg-purple-500/30 text-white px-1.5 py-0.2 rounded font-black hover:bg-purple-500/50">
                          Apply
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {/* Manual Builder Button */}
                    <button
                      type="button"
                      onClick={handleAddNewSession}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-card hover:bg-card-hover border border-white/15 text-white font-bold text-xs transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4 text-purple-400" />
                      <span>Create Session Manually</span>
                    </button>

                    {/* AI Generate Button */}
                    <button
                      type="button"
                      onClick={handleGenerateWithAI}
                      disabled={isGeneratingAI}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Architecting Curriculum...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate with Groq Copilot</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature Preview Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-background/40 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Timed Agendas</h4>
                    <p className="text-[10px] text-subtext mt-0.5">Minute-by-minute breakdown for instructor and students.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-background/40 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Hands-On Labs</h4>
                    <p className="text-[10px] text-subtext mt-0.5">Live pair-coding activities, learning goals, and checkpoints.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-background/40 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Homework & Exercises</h4>
                    <p className="text-[10px] text-subtext mt-0.5">Structured take-home challenges with rubrics & starter repos.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── ACTIVE CURRICULUM WORKSPACE (SESSIONS LOADED) ── */
            <>
              {/* Compact AI Re-generation & Add Toolbar */}
              <div className="p-4 rounded-2xl bg-card border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Curriculum Workspace</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black">
                        {aiGeneratedSessions.length} Sessions Active
                      </span>
                    </h3>
                    <p className="text-[11px] text-subtext">
                      Select any session on the left to edit topics, timed agenda steps, and assignments.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddNewSession}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                    <span>Add Session</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateWithAI}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span>Re-Generate with AI</span>
                  </button>
                </div>
              </div>

              {hasUnsavedAIChanges && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs gap-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      AI generated {aiGeneratedSessions.length} sessions. Every session and agenda item is fully editable below!
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {pendingAiCourseInfo && (
                      <button
                        type="button"
                        onClick={() => setAiPostGenModalOpen(true)}
                        className="px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 text-xs font-bold text-purple-200 border border-purple-500/40 flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Update Course Basic Info?</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDiscardAIChanges}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-subtext hover:text-text"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasUnsavedAIChanges(false)}
                      className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-200 border border-amber-500/30"
                    >
                      Accept Draft
                    </button>
                  </div>
                </div>
              )}

              {/* Session Explorer & Interactive Agenda Editor */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Sessions List Sidebar */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                      Cohort Sessions ({aiGeneratedSessions.length})
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddNewSession}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Session</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                    {aiGeneratedSessions.map((sess, idx) => {
                      const isSelected = activeSessionIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveSessionIndex(idx)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-purple-600/20 border-purple-500/50 shadow-md ring-1 ring-purple-500/30"
                              : "bg-card hover:bg-card-hover border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-purple-300 border border-white/10">
                              Session {sess.sessionNumber}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-subtext font-semibold flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {sess.duration}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSession(idx);
                                }}
                                className="p-1 rounded text-subtext/60 hover:text-red-400 transition-colors"
                                title="Delete Session"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-text line-clamp-1">{sess.title}</h4>
                          <p className="text-[11px] text-subtext line-clamp-1 mt-0.5">{sess.description}</p>
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-[10px] text-subtext">
                            <span>{sess.date || "Date TBA"}</span>
                            <span>•</span>
                            <span>{sess.startTime || "07:00 PM"}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">{sess.agenda?.length || 0} agenda items</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Active Session Editor */}
                {aiGeneratedSessions[activeSessionIndex] && (
                  <div className="lg:col-span-8 p-6 rounded-2xl bg-card border border-white/10 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                          Editing Session {aiGeneratedSessions[activeSessionIndex].sessionNumber}
                        </span>
                        <h3 className="text-base font-bold text-text mt-0.5">
                          {aiGeneratedSessions[activeSessionIndex].title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          100% Fully Editable
                        </span>
                      </div>
                    </div>

                    {/* Basic Session Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-text">Session Title</label>
                        <input
                          type="text"
                          value={aiGeneratedSessions[activeSessionIndex].title}
                          onChange={(e) => handleUpdateActiveSession("title", e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-text">Session Summary / Scope</label>
                        <textarea
                          rows={2}
                          value={aiGeneratedSessions[activeSessionIndex].description}
                          onChange={(e) => handleUpdateActiveSession("description", e.target.value)}
                          className="w-full p-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text">Session Date</label>
                        <input
                          type="date"
                          value={aiGeneratedSessions[activeSessionIndex].date || ""}
                          onChange={(e) => handleUpdateActiveSession("date", e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text">Start Time – End Time</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={aiGeneratedSessions[activeSessionIndex].startTime}
                            onChange={(e) => handleUpdateActiveSession("startTime", e.target.value)}
                            placeholder="07:00 PM"
                            className="w-1/2 h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                          />
                          <input
                            type="text"
                            value={aiGeneratedSessions[activeSessionIndex].endTime}
                            onChange={(e) => handleUpdateActiveSession("endTime", e.target.value)}
                            placeholder="09:00 PM"
                            className="w-1/2 h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Agenda Timeline Builder */}
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            Live Session Agenda Timeline ({aiGeneratedSessions[activeSessionIndex].agenda?.length || 0} Steps)
                          </h4>
                          <p className="text-[11px] text-subtext">
                            Step-by-step minute breakdown for instructor and learners.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAgendaItem}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Step</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {aiGeneratedSessions[activeSessionIndex].agenda?.map((ag, agIdx) => (
                          <div
                            key={agIdx}
                            className="p-3 rounded-xl bg-background/60 border border-white/5 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-black shrink-0">
                                  {agIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={ag.title}
                                  onChange={(e) => handleUpdateAgendaItem(agIdx, "title", e.target.value)}
                                  placeholder="Step Title"
                                  className="flex-1 h-8 px-2.5 rounded-lg bg-card border border-white/10 text-xs font-bold text-text focus:outline-none focus:border-purple-500/50"
                                />
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <input
                                  type="text"
                                  value={ag.duration}
                                  onChange={(e) => handleUpdateAgendaItem(agIdx, "duration", e.target.value)}
                                  placeholder="15 min"
                                  className="w-20 h-8 px-2 rounded-lg bg-card border border-white/10 text-xs font-bold text-center text-subtext focus:outline-none focus:border-purple-500/50"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAgendaItem(agIdx)}
                                  className="p-1.5 rounded text-subtext hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={ag.description}
                              onChange={(e) => handleUpdateAgendaItem(agIdx, "description", e.target.value)}
                              placeholder="Detailed teaching instructions, live code focus, or interactive checkpoints..."
                              className="w-full h-7 px-2.5 rounded-lg bg-card/60 border border-white/5 text-[11px] text-subtext focus:outline-none focus:border-purple-500/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card hover:bg-card-hover text-subtext hover:text-text border border-white/10 text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
            >
              <span>Next: Review Sessions Timeline</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 4: REVIEW LIVE COURSE SESSIONS TIMELINE
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Summary Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-card via-card to-background border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                  Pre-Publish Master Review
                </span>
                <h2 className="text-lg font-black text-text mt-0.5">
                  {formData.title || "Live Cohort Overview"}
                </h2>
                <p className="text-xs text-subtext line-clamp-1 mt-0.5">
                  {formData.shortDescription || formData.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                  {formData.category}
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/5 text-subtext border border-white/10 text-xs font-bold">
                  {formData.level}
                </span>
              </div>
            </div>

            {/* Quick Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-white/10">
              <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                <p className="text-[10px] text-subtext font-semibold uppercase">Enrollment Price</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-black text-emerald-400">₹{Number(formData.price).toLocaleString("en-IN")}</span>
                  {Number(formData.originalPrice) > Number(formData.price) && (
                    <span className="text-[10px] text-subtext line-through">₹{Number(formData.originalPrice).toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                <p className="text-[10px] text-subtext font-semibold uppercase">Live Sessions</p>
                <p className="text-base font-black text-text">{aiGeneratedSessions.length || sessionCount} Classes</p>
              </div>
              <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                <p className="text-[10px] text-subtext font-semibold uppercase">Capstone Projects</p>
                <p className="text-base font-black text-purple-400">{formData.projects.length} Portfolio Projects</p>
              </div>
              <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                <p className="text-[10px] text-subtext font-semibold uppercase">Cohort Batches</p>
                <p className="text-base font-black text-indigo-400">{formData.batches.length} Batches</p>
              </div>
              <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                <p className="text-[10px] text-subtext font-semibold uppercase">Max Capacity</p>
                <p className="text-base font-black text-text">{formData.maxStudents} Students / Batch</p>
              </div>
            </div>
          </div>

          {/* Chronological Session Timeline Table */}
          <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Live Sessions Schedule ({aiGeneratedSessions.length})
              </h3>
              <button
                type="button"
                onClick={handleAddNewSession}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Session</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-subtext text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Session Title & Topic</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Agenda</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {aiGeneratedSessions.map((sess, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3.5 px-3 font-bold text-purple-400">{sess.sessionNumber}</td>
                      <td className="py-3.5 px-3 font-bold text-text max-w-xs">
                        <p className="truncate">{sess.title}</p>
                        <p className="text-[10px] text-subtext font-normal truncate mt-0.5">
                          {sess.description}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 text-subtext font-medium whitespace-nowrap">
                        {sess.date || "TBA"}
                      </td>
                      <td className="py-3.5 px-3 text-subtext font-medium whitespace-nowrap">
                        {sess.startTime} – {sess.endTime}
                      </td>
                      <td className="py-3.5 px-3 text-subtext whitespace-nowrap">{sess.duration}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                          {sess.agenda?.length || 0} steps
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSessionIndex(idx);
                              setCurrentStep(3);
                            }}
                            className="p-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text transition-colors"
                            title="Edit Session"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSession(idx)}
                            className="p-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-red-400 transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card hover:bg-card-hover text-subtext hover:text-text border border-white/10 text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
            >
              <span>Next: Instructor Assignment & Publish</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 5: INSTRUCTOR ASSIGNMENT & PERMISSIONS
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-6">
            <div>
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                Assign Lead Instructor & Granular Permissions
              </h2>
              <p className="text-xs text-subtext mt-0.5">
                Assign an expert instructor to lead this live cohort. You can adjust individual session instructors later anytime.
              </p>
            </div>

            {/* Instructor Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text">Select Lead Instructor</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {instructors.map((inst) => {
                  const isSelected = formData.leadInstructorId === inst.id;
                  return (
                    <div
                      key={inst.id}
                      onClick={() => setFormData({ ...formData, leadInstructorId: inst.id })}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? "bg-purple-600/20 border-purple-500/50 shadow-sm ring-1 ring-purple-500/30"
                          : "bg-background/60 hover:bg-background border-white/10"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs shrink-0">
                        {inst.name?.slice(0, 2).toUpperCase() || "IN"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-text truncate">{inst.name}</h4>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-black uppercase">
                              Selected Lead
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-subtext truncate">{inst.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructor Access & Permissions */}
            <div className="p-6 rounded-2xl bg-background/50 border border-white/10 space-y-5">
              <div>
                <h4 className="text-sm font-bold text-text flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Instructor Permissions & Super Instructor Privileges
                </h4>
                <p className="text-xs text-subtext mt-0.5">
                  Control whether the instructor can edit sessions or hold elevated Super Instructor privileges to reschedule and create classes.
                </p>
              </div>

              {/* 2 Primary Modern Cards: Master Edit & Super Instructor Slider */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Master Edit Permission Card */}
                <div
                  onClick={() => {
                    const newEdit = !leadInstructorPermissions.canEdit;
                    setLeadInstructorPermissions((prev) => ({
                      ...prev,
                      canEdit: newEdit,
                      canEditAgenda: newEdit,
                      canEditResources: newEdit,
                      canAddHomework: newEdit,
                      canManageAttendance: newEdit,
                      canManageRecording: newEdit
                    }));
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    leadInstructorPermissions.canEdit
                      ? "bg-purple-600/15 border-purple-500/40 ring-1 ring-purple-500/20 shadow-md"
                      : "bg-card/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          leadInstructorPermissions.canEdit
                            ? "bg-purple-500/25 text-purple-300 border border-purple-500/40"
                            : "bg-white/5 text-subtext border border-white/10"
                        }`}
                      >
                        <Edit3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <span>Edit Permission</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              leadInstructorPermissions.canEdit
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-white/10 text-subtext"
                            }`}
                          >
                            {leadInstructorPermissions.canEdit ? "Can Edit" : "Read Only"}
                          </span>
                        </h5>
                        <p className="text-[11px] text-subtext mt-1 leading-relaxed">
                          Allow instructor to edit session topics, update timed agendas, upload resources, and assign homework.
                        </p>
                      </div>
                    </div>

                    {/* Clean Switch Slider */}
                    <div
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        leadInstructorPermissions.canEdit ? "bg-purple-600" : "bg-white/15"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          leadInstructorPermissions.canEdit ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/5 text-[11px] text-subtext">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${leadInstructorPermissions.canEdit ? "text-emerald-400" : "text-subtext"}`} />
                    <span>
                      {leadInstructorPermissions.canEdit
                        ? "Full editing access enabled for all session contents & materials."
                        : "Instructor has view-only access to curriculum and student roster."}
                    </span>
                  </div>
                </div>

                {/* 2. Super Instructor Slider Switch Card */}
                <div
                  onClick={() => {
                    const isSuper = !(leadInstructorPermissions.canReschedule && leadInstructorPermissions.canEditSchedule);
                    setLeadInstructorPermissions((prev) => ({
                      ...prev,
                      canReschedule: isSuper,
                      canEditSchedule: isSuper,
                      canCancel: isSuper,
                      // If super instructor is enabled, also ensure canEdit is true
                      ...(isSuper ? { canEdit: true, canEditAgenda: true, canEditResources: true } : {})
                    }));
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    leadInstructorPermissions.canReschedule && leadInstructorPermissions.canEditSchedule
                      ? "bg-gradient-to-br from-amber-500/15 via-purple-600/15 to-card border-amber-500/40 ring-1 ring-amber-500/30 shadow-md"
                      : "bg-card/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          leadInstructorPermissions.canReschedule && leadInstructorPermissions.canEditSchedule
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                            : "bg-white/5 text-subtext border border-white/10"
                        }`}
                      >
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <span>Super Instructor Privileges</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              leadInstructorPermissions.canReschedule && leadInstructorPermissions.canEditSchedule
                                ? "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                                : "bg-white/10 text-subtext"
                            }`}
                          >
                            {leadInstructorPermissions.canReschedule && leadInstructorPermissions.canEditSchedule ? "⚡ Super Active" : "Standard"}
                          </span>
                        </h5>
                        <p className="text-[11px] text-subtext mt-1 leading-relaxed">
                          Elevate instructor to reschedule class dates/times, add & create new sessions, and manage cohort schedules.
                        </p>
                      </div>
                    </div>

                    {/* Clean Slider Switch */}
                    <div
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        leadInstructorPermissions.canReschedule && leadInstructorPermissions.canEditSchedule ? "bg-amber-500" : "bg-white/15"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          leadInstructorPermissions.canReschedule && leadInstructorPermissions.canEditSchedule ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/5 text-[11px] text-subtext">
                    <Sparkles className={`w-3.5 h-3.5 ${leadInstructorPermissions.canReschedule && leadInstructorPermissions.canEditSchedule ? "text-amber-400" : "text-subtext"}`} />
                    <span>
                      {leadInstructorPermissions.canReschedule && leadInstructorPermissions.canEditSchedule
                        ? "Can reschedule sessions, modify dates, and create new sessions directly."
                        : "Cannot reschedule or add classes without admin approval."}
                    </span>
                  </div>
                </div>

              </div>

              {/* Collapsible Advanced Granular Controls */}
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAdvancedPermissions(!showAdvancedPermissions)}
                  className="flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-white transition-colors"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedPermissions ? "rotate-180" : ""}`} />
                  <span>{showAdvancedPermissions ? "Hide Advanced Permission Matrix" : "Fine-Tune Individual Permissions (Advanced)"}</span>
                </button>

                {showAdvancedPermissions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3 animate-in fade-in">
                    {[
                      { key: "canView", label: "View Sessions & Roster", desc: "Allow instructor to view session details" },
                      { key: "canEdit", label: "Can Edit Session", desc: "Primary edit permission toggle" },
                      { key: "canEditAgenda", label: "Edit Session Agenda", desc: "Modify step-by-step agenda timeline" },
                      { key: "canEditSchedule", label: "Edit Schedule Directly", desc: "Modify session dates and times" },
                      { key: "canEditResources", label: "Edit Session Resources", desc: "Upload and attach resource links" },
                      { key: "canAddHomework", label: "Add & Edit Homework", desc: "Create take-home coding challenges" },
                      { key: "canReschedule", label: "Request / Reschedule", desc: "Initiate session rescheduling" },
                      { key: "canCancel", label: "Cancel Live Session", desc: "Emergency cancellation rights" },
                      { key: "canManageAttendance", label: "Manage Attendance", desc: "Mark student present/absent" },
                      { key: "canManageRecording", label: "Manage Recordings", desc: "Upload session video replay" }
                    ].map((perm) => {
                      const isChecked = (leadInstructorPermissions as any)[perm.key];
                      return (
                        <label
                          key={perm.key}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? "bg-purple-600/10 border-purple-500/30 text-text"
                              : "bg-card/40 border-white/5 text-subtext"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setLeadInstructorPermissions({
                                ...leadInstructorPermissions,
                                [perm.key]: e.target.checked
                              })
                            }
                            className="mt-0.5 accent-purple-500 rounded"
                          />
                          <div className="text-left leading-tight min-w-0">
                            <p className="text-xs font-bold text-text truncate">{perm.label}</p>
                            <p className="text-[10px] text-subtext/70 mt-0.5 line-clamp-1">{perm.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card hover:bg-card-hover text-subtext hover:text-text border border-white/10 text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmitLiveCourse("DRAFT")}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card hover:bg-card-hover text-text border border-white/10 text-xs font-bold shadow-sm"
              >
                <Save className="w-3.5 h-3.5 text-subtext" />
                <span>Save as Draft</span>
              </button>
              <button
                type="button"
                onClick={() => setPublishModalOpen(true)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign to Instructor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CONFIRMATION ASSIGN & PUBLISH MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">Assign to Instructor & Publish</h3>
                  <p className="text-xs text-subtext">Select lead instructor and verify cohort details before launch</p>
                </div>
              </div>
              <button
                onClick={() => setPublishModalOpen(false)}
                className="text-subtext hover:text-text p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-background/60 border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-subtext">Course Title:</span>
                <span className="font-bold text-text max-w-xs truncate text-right">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext">Total Live Sessions:</span>
                <span className="font-bold text-text">{aiGeneratedSessions.length || sessionCount} Sessions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext">Start Date:</span>
                <span className="font-bold text-text">{formData.startDate || "Immediate"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext">Meeting Platform:</span>
                <span className="font-bold text-text">{formData.meetingPlatform}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-subtext">Capacity:</span>
                <span className="font-bold text-text">{formData.maxStudents} Students</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5 gap-3">
                <span className="text-subtext flex items-center gap-1.5 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  Assign to Instructor:
                </span>
                {instructors.length > 0 ? (
                  <select
                    value={formData.leadInstructorId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, leadInstructorId: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg bg-[#0E131F] border border-purple-500/40 text-purple-300 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer max-w-[240px]"
                  >
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id} className="bg-[#0E131F] text-white">
                        {inst.name} ({inst.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-bold text-purple-300">
                    {instructors.find((i) => i.id === formData.leadInstructorId)?.name || "Assigned by Admin"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmitLiveCourse("ASSIGNED")}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Assign</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: AI COURSE OVERVIEW ASSISTANT
          ═══════════════════════════════════════════════════════════════ */}
      {aiOverviewModalOpen && aiOverviewPreview && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-purple-500/30 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">AI Course Overview Copilot</h3>
                  <p className="text-xs text-subtext">Review, tweak, and apply AI-crafted course overview</p>
                </div>
              </div>
              <button
                onClick={() => setAiOverviewModalOpen(false)}
                className="text-subtext hover:text-text p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt Refinement Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiOverviewCustomPrompt}
                onChange={(e) => setAiOverviewCustomPrompt(e.target.value)}
                placeholder="Optional: e.g. Emphasize multi-modal RAG benchmarks and weekend live labs..."
                className="flex-1 h-9 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
              />
              <button
                type="button"
                onClick={handleGenerateOverviewAI}
                disabled={isGeneratingOverview}
                className="px-3.5 h-9 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold shrink-0 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingOverview ? "Regenerating..." : "Regenerate"}</span>
              </button>
            </div>

            {/* Generated Overview Preview */}
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-background/70 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Detailed Course Overview
                  </span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(aiOverviewPreview.description)}
                    className="p-1 text-subtext hover:text-text text-[10px] flex items-center gap-1"
                    title="Copy Overview"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-subtext leading-relaxed whitespace-pre-line text-xs">
                  {aiOverviewPreview.description}
                </p>
              </div>

              {aiOverviewPreview.shortDescription && (
                <div className="p-3 rounded-xl bg-background/50 border border-white/5 space-y-1">
                  <span className="font-bold text-text text-[11px]">Short Summary</span>
                  <p className="text-subtext text-xs">{aiOverviewPreview.shortDescription}</p>
                </div>
              )}

              {aiOverviewPreview.targetAudience && (
                <div className="p-3 rounded-xl bg-background/50 border border-white/5 space-y-1">
                  <span className="font-bold text-text text-[11px]">Recommended Target Audience</span>
                  <p className="text-subtext text-xs">{aiOverviewPreview.targetAudience}</p>
                </div>
              )}

              {aiOverviewPreview.objectives && aiOverviewPreview.objectives.length > 0 && (
                <div className="p-3.5 rounded-xl bg-background/50 border border-white/5 space-y-1.5">
                  <span className="font-bold text-text text-[11px]">Suggested Learning Objectives</span>
                  <ul className="space-y-1">
                    {aiOverviewPreview.objectives.map((obj, i) => (
                      <li key={i} className="flex items-center gap-2 text-subtext text-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setAiOverviewModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
              >
                Reject & Close
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleApplyOverviewOnly}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/35 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all shadow-sm"
                >
                  Apply Overview Text
                </button>
                <button
                  type="button"
                  onClick={handleApplyAllOverviewFields}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                >
                  Apply All Fields
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: AI GENERATION DECISION (SESSIONS ONLY VS BASIC INFO TOO)
          ═══════════════════════════════════════════════════════════════ */}
      {aiPostGenModalOpen && pendingAiCourseInfo && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-card border border-purple-500/40 shadow-2xl p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    AI Curriculum Generated!
                  </h3>
                  <p className="text-xs text-subtext">
                    {pendingAiSessionsCount} interactive sessions are ready. How should we apply the course details?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiPostGenModalOpen(false)}
                className="text-subtext hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated Course Details Comparison Preview */}
            <div className="p-4 rounded-2xl bg-background/70 border border-white/10 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                AI Generated Course Overview:
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-subtext shrink-0">Title:</span>
                  <span className="font-bold text-white text-right">{pendingAiCourseInfo.title || formData.title}</span>
                </div>
                {pendingAiCourseInfo.shortDescription && (
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-white/5">
                    <span className="text-subtext shrink-0">Summary:</span>
                    <span className="text-subtext text-right line-clamp-2">{pendingAiCourseInfo.shortDescription}</span>
                  </div>
                )}
                {pendingAiCourseInfo.objectives && pendingAiCourseInfo.objectives.length > 0 && (
                  <div className="pt-1.5 border-t border-white/5">
                    <span className="text-[11px] font-bold text-subtext">Objectives ({pendingAiCourseInfo.objectives.length}):</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {pendingAiCourseInfo.objectives.slice(0, 3).map((obj, i) => (
                        <span key={i} className="text-[10px] bg-purple-500/15 text-purple-200 px-2 py-0.5 rounded-md border border-purple-500/25">
                          ✓ {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Decision Cards: Option 1 vs Option 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option A: Sessions Only */}
              <button
                type="button"
                onClick={handleKeepBasicInfoSessionsOnly}
                className="p-4 rounded-2xl bg-card hover:bg-card-hover border border-white/15 hover:border-purple-500/40 text-left transition-all group flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/10">
                      Option 1
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    🎯 Only Go with Sessions
                  </h4>
                  <p className="text-[11px] text-subtext leading-relaxed">
                    Keep your original Course Title & Basic Info. Only import the {pendingAiSessionsCount} generated sessions.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-purple-300 mt-3 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Keep My Basic Info →
                </span>
              </button>

              {/* Option B: Sessions + Basic Info */}
              <button
                type="button"
                onClick={handleApplyAllAiCourseInfo}
                className="p-4 rounded-2xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/40 hover:border-purple-400 text-left transition-all group flex flex-col justify-between shadow-md ring-1 ring-purple-500/20"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 border border-purple-500/40">
                      Option 2
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                    ✨ Change Basic Info Too
                  </h4>
                  <p className="text-[11px] text-subtext leading-relaxed">
                    Import all {pendingAiSessionsCount} sessions AND update Course Title, Description, and Objectives with AI suggestions.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 mt-3 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Update Everything →
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
