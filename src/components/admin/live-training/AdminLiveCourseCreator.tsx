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
  UploadCloud,
  Paperclip,
  FileCheck,
  Download,
  Bell,
  Send,
  FolderArchive,
  Globe,
  FileCode
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { formatDate, formatTime } from "@/lib/dateTime";
import { createTusUpload } from "@/lib/video/tusUploader";

export interface SessionAssignmentItem {
  id?: string;
  title: string;
  description: string;
  instructions: string[];
  totalMarks: number;
  dueDate?: string;
  dueTime?: string;
  daysAfterSession?: number;
  submissionType?: string; // "file_upload" | "github_url" | "live_url" | "text_code" | "any"
  publishTrigger?: string; // "after_class_end" | "immediate" | "during_class" | "scheduled_date" | "manual_unlock"
  publishDate?: string;
  publishTime?: string;
  availabilityDuration?: string; // "24_hours" | "3_days" | "7_days" | "14_days" | "until_next_session" | "custom_deadline"
  allowLateSubmissions?: boolean;
  latePenaltyPercent?: number;
  notifyStudents?: boolean;
  notificationMessage?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  autoAssignOnSessionEnd: boolean;
  externalStarterUrl?: string;
}

export interface SessionResourceItem {
  id?: string;
  title: string;
  type: string; // "PDF" | "GITHUB" | "SLIDES" | "DOC" | "CODE" | "DATASET" | "ZIP" | "URL"
  url: string;
  fileSize?: string;
  publishTrigger?: string; // "after_class_end" | "before_class" | "during_class" | "immediate" | "scheduled_date"
  publishDate?: string;
  publishTime?: string;
  availabilityDuration?: string; // "always" | "until_next_session" | "7_days" | "30_days" | "custom_expiry"
  expiryDate?: string;
  expiryTime?: string;
  notifyStudents?: boolean;
}

export interface SessionQuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points?: number;
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
  videoUrl?: string;
  recordingUrl?: string;
  recordingStatus?: string;
  recordingReleaseTime?: string; // "after_class_end" | "immediate" | "2_hours" | "4_hours" | "12_hours" | "24_hours" | "48_hours" | "scheduled_date" | "custom"
  recordingReleaseDate?: string;
  recordingReleaseTimeOfDay?: string;
  recordingCustomHours?: string;
  recordingValidity?: string; // "lifetime" | "1_year" | "90_days" | "30_days" | "cohort_duration" | "custom_expiry"
  recordingExpiryDate?: string;
  missedClassPolicy?: string; // "doubt_session" | "next_batch" | "mentor_call" | "self_paced"
  autoNotifyStudents?: boolean;
  videoNotificationMessage?: string;
  allowOfflineDownload?: boolean;
  isBackupSession?: boolean;
  parentSessionNumber?: number;
  isPreview?: boolean;
  // Quiz timing and settings
  quizPublishTrigger?: string; // "after_class_end" | "during_class" | "immediate" | "scheduled_date" | "manual_unlock"
  quizPublishDate?: string;
  quizPublishTime?: string;
  quizDueDate?: string;
  quizDueTime?: string;
  quizDurationWindow?: string; // "24_hours" | "48_hours" | "until_next_session" | "custom_deadline" | "unlimited"
  quizTimeLimitMinutes?: number;
  quizNotifyStudents?: boolean;
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
  resources: SessionResourceItem[];
  quizzes?: SessionQuizQuestion[];
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
  const [activeSessionTab, setActiveSessionTab] = useState<"agenda" | "video" | "resources" | "quiz" | "assignment">("agenda");
  const [uploadingSessionVideo, setUploadingSessionVideo] = useState(false);
  const [sessionVideoUploadProgress, setSessionVideoUploadProgress] = useState(0);
  const [uploadingResourceIndex, setUploadingResourceIndex] = useState<number | null>(null);
  const [uploadingAssignmentFile, setUploadingAssignmentFile] = useState(false);
  const [isGeneratingSessionQuiz, setIsGeneratingSessionQuiz] = useState(false);
  const [isGeneratingAssignment, setIsGeneratingAssignment] = useState(false);
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
    const descStr = Array.isArray(aiOverviewPreview.description)
      ? aiOverviewPreview.description.join("\n\n")
      : typeof aiOverviewPreview.description === "object" && aiOverviewPreview.description !== null
      ? JSON.stringify(aiOverviewPreview.description)
      : String(aiOverviewPreview.description || "");

    setFormData((prev) => ({
      ...prev,
      description: descStr
    }));
    setAiOverviewModalOpen(false);
    setAiOverviewPreview(null);
  };

  const handleApplyAllOverviewFields = () => {
    if (!aiOverviewPreview) return;
    const descStr = Array.isArray(aiOverviewPreview.description)
      ? aiOverviewPreview.description.join("\n\n")
      : typeof aiOverviewPreview.description === "object" && aiOverviewPreview.description !== null
      ? JSON.stringify(aiOverviewPreview.description)
      : String(aiOverviewPreview.description || "");

    const shortDescStr = Array.isArray(aiOverviewPreview.shortDescription)
      ? aiOverviewPreview.shortDescription.join(" ")
      : typeof aiOverviewPreview.shortDescription === "object" && aiOverviewPreview.shortDescription !== null
      ? JSON.stringify(aiOverviewPreview.shortDescription)
      : (aiOverviewPreview.shortDescription || prevTargetAudience(formData.shortDescription));

    const targetAudienceStr = Array.isArray(aiOverviewPreview.targetAudience)
      ? (aiOverviewPreview.targetAudience as any[]).join(", ")
      : (aiOverviewPreview.targetAudience || prevTargetAudience(formData.targetAudience));

    setFormData((prev) => ({
      ...prev,
      description: descStr,
      shortDescription: shortDescStr || prev.shortDescription,
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
      const descStr = Array.isArray(pendingAiCourseInfo.description)
        ? pendingAiCourseInfo.description.join("\n\n")
        : typeof pendingAiCourseInfo.description === "object" && pendingAiCourseInfo.description !== null
        ? JSON.stringify(pendingAiCourseInfo.description)
        : (pendingAiCourseInfo.description || formData.description || "");

      const shortDescStr = Array.isArray(pendingAiCourseInfo.shortDescription)
        ? pendingAiCourseInfo.shortDescription.join(" ")
        : typeof pendingAiCourseInfo.shortDescription === "object" && pendingAiCourseInfo.shortDescription !== null
        ? JSON.stringify(pendingAiCourseInfo.shortDescription)
        : (pendingAiCourseInfo.shortDescription || formData.shortDescription || "");

      const targetAudienceStr = Array.isArray(pendingAiCourseInfo.targetAudience)
        ? (pendingAiCourseInfo.targetAudience as any[]).join(", ")
        : (pendingAiCourseInfo.targetAudience || formData.targetAudience || "");

      setFormData((prev) => ({
        ...prev,
        title: pendingAiCourseInfo.title || prev.title,
        shortDescription: shortDescStr || prev.shortDescription,
        description: descStr || prev.description,
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

  // Live Registration Window Preview Helper
  const getRegistrationPreviewInfo = useMemo(() => {
    if (!formData.registrationStartDate && !formData.registrationEndDate) {
      return { status: "UNSET", label: "Registration Window Not Set", badge: "UNSET", color: "text-subtext bg-white/5 border-white/10" };
    }

    try {
      const now = new Date();
      const startDateTime = formData.registrationStartDate
        ? new Date(`${formData.registrationStartDate} ${formData.registrationStartTime || "00:00"}`)
        : null;
      const endDateTime = formData.registrationEndDate
        ? new Date(`${formData.registrationEndDate} ${formData.registrationEndTime || "23:59"}`)
        : null;

      if (startDateTime && !isNaN(startDateTime.getTime()) && now < startDateTime) {
        const diffMs = startDateTime.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return {
          status: "UPCOMING",
          label: `Registration Opens in ${diffDays} day${diffDays > 1 ? "s" : ""} (${formatDate(formData.registrationStartDate)} at ${formData.registrationStartTime})`,
          badge: "OPENS SOON",
          color: "text-amber-300 bg-amber-500/15 border-amber-500/30"
        };
      }

      if (endDateTime && !isNaN(endDateTime.getTime()) && now > endDateTime) {
        return {
          status: "CLOSED",
          label: `Registration Closed on ${formatDate(formData.registrationEndDate)} at ${formData.registrationEndTime}`,
          badge: "CLOSED",
          color: "text-rose-400 bg-rose-500/15 border-rose-500/30"
        };
      }

      if (endDateTime && !isNaN(endDateTime.getTime())) {
        const diffMs = endDateTime.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return {
          status: "OPEN",
          label: `Registration is Live & Open! Closes in ${diffDays} day${diffDays > 1 ? "s" : ""} (${formatDate(formData.registrationEndDate)} at ${formData.registrationEndTime})`,
          badge: "ACTIVE & OPEN",
          color: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30"
        };
      }

      return {
        status: "OPEN",
        label: "Registration is Active and Open!",
        badge: "ACTIVE",
        color: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30"
      };
    } catch {
      return { status: "OPEN", label: "Registration Window Configured", badge: "CONFIGURED", color: "text-purple-300 bg-purple-500/15 border-purple-500/30" };
    }
  }, [formData.registrationStartDate, formData.registrationStartTime, formData.registrationEndDate, formData.registrationEndTime]);

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

  // ══════════════════════════════════════════════════════════
  // SESSION VIDEO / REPLAY HANDLERS
  // ══════════════════════════════════════════════════════════
  const handleUploadSessionVideo = async (file: File) => {
    if (!file) return;
    setUploadingSessionVideo(true);
    setSessionVideoUploadProgress(0);
    setErrorMessage("");
    try {
      // 1. Try Direct Bunny Stream TUS Resumable Upload
      try {
        const sessionRes = await fetch("/api/videos/upload-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "video/mp4",
            size: file.size,
            title: aiGeneratedSessions[activeSessionIndex]?.title || file.name,
          }),
        });

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.provider === "BUNNY_STREAM" && (sessionData.uploadEndpoint || sessionData.tusEndpoint)) {
            await new Promise<void>((resolve, reject) => {
              const tusUpload = createTusUpload(file, {
                endpoint: sessionData.uploadEndpoint || sessionData.tusEndpoint,
                headers: sessionData.tusHeaders || {},
                metadata: {
                  filetype: file.type || "video/mp4",
                  title: aiGeneratedSessions[activeSessionIndex]?.title || file.name,
                },
                onProgress: (percent) => {
                  setSessionVideoUploadProgress(percent);
                },
                onSuccess: () => resolve(),
                onError: (err) => reject(err),
              });
              tusUpload.start();
            });

            const streamUrl = `/api/videos/${sessionData.videoAssetId}/status`;
            handleUpdateActiveSession("videoUrl", streamUrl);
            handleUpdateActiveSession("recordingUrl", streamUrl);
            handleUpdateActiveSession("recordingStatus", "available");
            setSaveSuccessMsg("📹 Video uploaded to Bunny Stream! Adaptive HLS encoding initiated.");
            setTimeout(() => setSaveSuccessMsg(""), 3500);
            return;
          }
        }
      } catch (bunnyErr: any) {
        console.warn("Bunny Stream session upload fallback:", bunnyErr?.message);
      }

      // 2. Standard Fallback to /api/upload
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "video");
      fd.append("courseId", formData.title || "live-course");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.url) {
        handleUpdateActiveSession("videoUrl", data.url);
        handleUpdateActiveSession("recordingUrl", data.url);
        handleUpdateActiveSession("recordingStatus", "available");
        setSaveSuccessMsg("📹 Session video uploaded & linked successfully!");
        setTimeout(() => setSaveSuccessMsg(""), 3500);
      } else {
        setErrorMessage(data.error || "Failed to upload video file.");
      }
    } catch (err: any) {
      console.error("Video upload error:", err);
      setErrorMessage("Network error occurred during video upload.");
    } finally {
      setUploadingSessionVideo(false);
      setSessionVideoUploadProgress(0);
    }
  };

  const handleClearSessionVideo = () => {
    handleUpdateActiveSession("videoUrl", "");
    handleUpdateActiveSession("recordingUrl", "");
    handleUpdateActiveSession("recordingStatus", "unavailable");
  };

  // Add dedicated Make-Up / Doubt Clearance Session for current session
  const handleAddBackupSession = (parentIdx: number) => {
    const parent = aiGeneratedSessions[parentIdx];
    if (!parent) return;
    const newNum = aiGeneratedSessions.length + 1;
    let nextDateStr = formData.startDate;
    try {
      const baseDate = parent.date ? new Date(parent.date) : new Date();
      baseDate.setDate(baseDate.getDate() + 2); // 2 days after main session
      nextDateStr = baseDate.toISOString().split("T")[0];
    } catch {
      nextDateStr = parent.date || formData.startDate;
    }

    const backupSession: AISessionItem = {
      sessionNumber: newNum,
      title: `${parent.title} – Make-Up & Doubt Clearing Session`,
      description: `Live doubt resolution, milestone review, and hands-on pair debugging for learners who missed Session ${parent.sessionNumber} or need extra guidance.`,
      date: nextDateStr,
      startTime: parent.startTime || "07:00 PM",
      endTime: parent.endTime || "08:00 PM",
      duration: "60 min",
      timezone: parent.timezone || formData.timezone,
      status: "SCHEDULED",
      isBackupSession: true,
      parentSessionNumber: parent.sessionNumber,
      recordingStatus: "available",
      recordingReleaseTime: "immediate",
      agenda: [
        { title: "Review Core Concepts & Blockers", description: `Recap of key architecture and patterns from Session ${parent.sessionNumber}.`, duration: "15 min" },
        { title: "Live Pair Debugging & Sandbox Help", description: "1-on-1 live error resolution and code lab debugging with instructor.", duration: "35 min" },
        { title: "Next Milestones & Take-Home Brief", description: "Assignment checkpoint review and preview of the next module.", duration: "10 min" }
      ],
      topics: [{ title: `Doubt Resolution & Code Review`, description: `Interactive review of student blockers for Session ${parent.sessionNumber}` }],
      learningOutcomes: [
        `Clarify architectural misunderstandings from Session ${parent.sessionNumber}`,
        "Complete and submit hands-on project milestones without errors"
      ],
      activities: [{ title: "Live Screen Share & Debugging", instructions: "Students ask live questions and share development workspaces.", duration: "30 min" }],
      resources: parent.resources ? JSON.parse(JSON.stringify(parent.resources)) : [],
      homework: undefined
    };

    const updated = [...aiGeneratedSessions, backupSession];
    setAiGeneratedSessions(updated);
    setActiveSessionIndex(updated.length - 1);
    setSaveSuccessMsg(`➕ Created Make-Up / Doubt Clearance Session for Session #${parent.sessionNumber}!`);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  // ══════════════════════════════════════════════════════════
  // SESSION RESOURCES & ATTACHMENTS HANDLERS
  // ══════════════════════════════════════════════════════════
  const handleAddResource = (template?: Partial<SessionResourceItem>) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const newResList: SessionResourceItem[] = [
      ...(current.resources || []),
      {
        title: "New Session Resource",
        type: "PDF",
        url: "",
        ...template
      }
    ];
    handleUpdateActiveSession("resources", newResList);
  };

  const handleUpdateResource = (resIdx: number, field: keyof SessionResourceItem, value: any) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const updated = [...(current.resources || [])];
    updated[resIdx] = {
      ...updated[resIdx],
      [field]: value
    };
    handleUpdateActiveSession("resources", updated);
  };

  const handleRemoveResource = (resIdx: number) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const updated = (current.resources || []).filter((_, i) => i !== resIdx);
    handleUpdateActiveSession("resources", updated);
  };

  const handleUploadResourceFile = async (resIdx: number, file: File) => {
    if (!file) return;
    setUploadingResourceIndex(resIdx);
    setErrorMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "resource");
      fd.append("courseId", formData.title || "live-course");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const current = aiGeneratedSessions[activeSessionIndex];
        if (!current) return;
        const updated = [...(current.resources || [])];
        const curItem = updated[resIdx] || { title: file.name, type: "PDF", url: "" };

        let inferredType = "PDF";
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") inferredType = "PDF";
        else if (["zip", "tar", "gz", "rar", "7z"].includes(ext || "")) inferredType = "ZIP";
        else if (["py", "ts", "js", "ipynb", "cpp", "java", "rs"].includes(ext || "")) inferredType = "CODE";
        else if (["csv", "json", "parquet", "xlsx", "sql"].includes(ext || "")) inferredType = "DATASET";
        else if (["ppt", "pptx", "key"].includes(ext || "")) inferredType = "SLIDES";
        else if (["doc", "docx", "txt", "md"].includes(ext || "")) inferredType = "DOC";

        updated[resIdx] = {
          ...curItem,
          title: curItem.title && curItem.title !== "New Session Resource" ? curItem.title : file.name.replace(/\.[^/.]+$/, ""),
          url: data.url,
          type: inferredType,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB"
        };
        handleUpdateActiveSession("resources", updated);
        setSaveSuccessMsg("📁 Resource file attached successfully!");
        setTimeout(() => setSaveSuccessMsg(""), 3500);
      } else {
        setErrorMessage(data.error || "Failed to upload resource file.");
      }
    } catch (err: any) {
      console.error("Resource upload error:", err);
      setErrorMessage("Network error occurred during resource upload.");
    } finally {
      setUploadingResourceIndex(null);
    }
  };

  // ══════════════════════════════════════════════════════════
  // SESSION QUIZ & KNOWLEDGE CHECK HANDLERS
  // ══════════════════════════════════════════════════════════
  const handleAddQuizQuestion = (initial?: SessionQuizQuestion) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const newQuizzes: SessionQuizQuestion[] = [
      ...(current.quizzes || []),
      initial || {
        question: "",
        options: [
          "Primary architectural mechanism and production implementation",
          "Alternative design with specific latency tradeoffs",
          "Deprecated pattern causing runtime exceptions",
          "Non-standard configuration not recommended for production"
        ],
        correctAnswer: 0,
        explanation: "This option is correct because it follows standard enterprise best practices taught in this session."
      }
    ];
    handleUpdateActiveSession("quizzes", newQuizzes);
  };

  const handleUpdateQuizQuestion = (qIdx: number, field: keyof SessionQuizQuestion, value: any) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const updated = [...(current.quizzes || [])];
    updated[qIdx] = {
      ...updated[qIdx],
      [field]: value
    };
    handleUpdateActiveSession("quizzes", updated);
  };

  const handleUpdateQuizOption = (qIdx: number, optIdx: number, value: string) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const updated = [...(current.quizzes || [])];
    const curQ = updated[qIdx];
    if (!curQ) return;
    const currentOpts = [...(curQ.options || ["Option A", "Option B", "Option C", "Option D"])];
    currentOpts[optIdx] = value;
    updated[qIdx] = {
      ...curQ,
      options: currentOpts
    };
    handleUpdateActiveSession("quizzes", updated);
  };

  const handleSetCorrectQuizOption = (qIdx: number, correctIdx: number) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const updated = [...(current.quizzes || [])];
    if (!updated[qIdx]) return;
    updated[qIdx] = {
      ...updated[qIdx],
      correctAnswer: correctIdx
    };
    handleUpdateActiveSession("quizzes", updated);
  };

  const handleRemoveQuizQuestion = (qIdx: number) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    const updated = (current.quizzes || []).filter((_, i) => i !== qIdx);
    handleUpdateActiveSession("quizzes", updated);
  };

  const handleGenerateSessionQuizAI = async () => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    setIsGeneratingSessionQuiz(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/ai/lesson-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: current.title,
          contentType: "quiz",
          courseTitle: formData.title,
          moduleTitle: `Session ${current.sessionNumber}: ${current.title}`,
          difficulty: formData.level,
          customPrompt: `Generate an insightful multiple-choice quiz question for a live masterclass session on "${current.title}". Description: ${current.description}. Agenda: ${current.agenda?.map((a: any) => a.title).join(", ")}.`
        })
      });
      const data = await res.json();
      if (data.success && data.generated) {
        const gen = data.generated;
        const newQ: SessionQuizQuestion = {
          question: gen.quizQuestion || `What is the core principle taught in ${current.title}?`,
          options: Array.isArray(gen.options) && gen.options.length >= 2 ? gen.options : [
            `Key concept and production implementation for ${current.title}`,
            `Alternative implementation with high latency overhead`,
            `Deprecated syntax not suitable for enterprise systems`,
            `Unrelated mechanism from legacy architectures`
          ],
          correctAnswer: typeof gen.correctIndex === "number" ? gen.correctIndex : 0,
          explanation: gen.explanation || `Understanding this principle is vital for mastering ${current.title}.`
        };
        handleAddQuizQuestion(newQ);
        setSaveSuccessMsg("✨ AI generated Quiz question added to this session!");
        setTimeout(() => setSaveSuccessMsg(""), 3500);
      } else {
        // Fallback generation
        handleAddQuizQuestion({
          question: `What is the primary architectural concept covered in "${current.title}"?`,
          options: [
            `The standard production workflow and best practices for ${current.title}`,
            `A legacy method with sub-optimal execution guarantees`,
            `An unverified experimental feature with no production support`,
            `A purely cosmetic configuration without performance benefits`
          ],
          correctAnswer: 0,
          explanation: `In "${current.title}", mastering this foundational concept ensures correct and efficient deployment.`
        });
        setSaveSuccessMsg("✨ Quiz question generated and added!");
        setTimeout(() => setSaveSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error("Quiz AI gen error:", err);
      handleAddQuizQuestion();
    } finally {
      setIsGeneratingSessionQuiz(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  // SESSION ASSIGNMENT HANDLERS
  // ══════════════════════════════════════════════════════════
  const handleUpdateAssignment = (
    fieldOrObj: keyof SessionAssignmentItem | Partial<SessionAssignmentItem>,
    value?: any
  ) => {
    setAiGeneratedSessions((prev) => {
      const copy = [...prev];
      const current = copy[activeSessionIndex];
      if (!current) return prev;

      const defaultAssignment: SessionAssignmentItem = {
        title: `${current.title} – Hands-On Assignment`,
        description: `Implement and submit the core architectural deliverables for Session ${current.sessionNumber}.`,
        instructions: [
          "Clone the starter repository or initialize your project workspace",
          "Implement the required components discussed during the live session",
          "Write unit tests to validate edge cases and performance",
          "Submit your GitHub repository URL or ZIP package before the deadline"
        ],
        totalMarks: 100,
        submissionType: "github_url",
        publishTrigger: "after_class_end",
        availabilityDuration: "7_days",
        allowLateSubmissions: true,
        latePenaltyPercent: 10,
        notifyStudents: true,
        notificationMessage: `📢 New Assignment: ${current.title} Capstone has been assigned. Due in 7 days.`,
        autoAssignOnSessionEnd: true
      };

      const existingAssignment = current.assignment || defaultAssignment;
      const updates = typeof fieldOrObj === "object" && fieldOrObj !== null ? fieldOrObj : { [fieldOrObj]: value };

      copy[activeSessionIndex] = {
        ...current,
        assignment: {
          ...existingAssignment,
          ...updates
        }
      };
      return copy;
    });
  };

  const handleInitAssignment = () => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    let defaultDueDate = "";
    try {
      const baseDate = current.date ? new Date(current.date) : new Date();
      baseDate.setDate(baseDate.getDate() + 7);
      defaultDueDate = baseDate.toISOString().split("T")[0];
    } catch {
      defaultDueDate = current.date || "";
    }

    const newAssignment: SessionAssignmentItem = {
      title: `${current.title} – Practical Project Challenge`,
      description: `Apply the core patterns learned in Session #${current.sessionNumber} (${current.title}) to engineer a working production solution.`,
      instructions: [
        `Review the session slides and architecture blueprints from Session ${current.sessionNumber}.`,
        "Implement the primary logic, state persistence, and error handling.",
        "Add inline code documentation and verify all tests pass locally.",
        "Submit your work with proof of execution or GitHub repository URL."
      ],
      totalMarks: 100,
      submissionType: "github_url",
      publishTrigger: "after_class_end",
      dueDate: defaultDueDate,
      dueTime: "11:59 PM",
      availabilityDuration: "7_days",
      allowLateSubmissions: true,
      latePenaltyPercent: 10,
      notifyStudents: true,
      notificationMessage: `📢 Assignment Assigned: Session ${current.sessionNumber} (${current.title}) is now live. Due on ${defaultDueDate || "7 days"}.`,
      autoAssignOnSessionEnd: true,
      externalStarterUrl: "https://github.com/glarus-academy"
    };

    handleUpdateActiveSession("assignment", newAssignment);
    setSaveSuccessMsg(`📝 Created Assignment for Session ${current.sessionNumber}!`);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  const handleClearAssignment = () => {
    handleUpdateActiveSession("assignment", undefined);
    setSaveSuccessMsg("Assignment removed from this session.");
    setTimeout(() => setSaveSuccessMsg(""), 2500);
  };

  const handleAddAssignmentInstruction = () => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current?.assignment) return;
    const curInstructions = current.assignment.instructions || [];
    handleUpdateAssignment("instructions", [...curInstructions, "New step-by-step deliverable instruction..."]);
  };

  const handleUpdateAssignmentInstruction = (index: number, text: string) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current?.assignment) return;
    const curInstructions = [...(current.assignment.instructions || [])];
    curInstructions[index] = text;
    handleUpdateAssignment("instructions", curInstructions);
  };

  const handleRemoveAssignmentInstruction = (index: number) => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current?.assignment) return;
    const curInstructions = (current.assignment.instructions || []).filter((_, i) => i !== index);
    handleUpdateAssignment("instructions", curInstructions);
  };

  const handleUploadAssignmentFile = async (file: File) => {
    if (!file) return;
    setUploadingAssignmentFile(true);
    setErrorMessage("");
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
        handleUpdateAssignment({
          fileUrl: data.url,
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
          fileType: file.name.split(".").pop()?.toLowerCase() || "pdf"
        });
        setSaveSuccessMsg(`📎 Attached "${file.name}" to assignment successfully!`);
        setTimeout(() => setSaveSuccessMsg(""), 3500);
      } else {
        setErrorMessage(data.error || "Failed to upload assignment attachment.");
      }
    } catch (err: any) {
      console.error("Assignment upload error:", err);
      setErrorMessage("Network error occurred during assignment upload.");
    } finally {
      setUploadingAssignmentFile(false);
    }
  };

  const handleGenerateAssignmentAI = async () => {
    const current = aiGeneratedSessions[activeSessionIndex];
    if (!current) return;
    setIsGeneratingAssignment(true);
    setErrorMessage("");
    try {
      let defaultDueDate = "";
      try {
        const baseDate = current.date ? new Date(current.date) : new Date();
        baseDate.setDate(baseDate.getDate() + 7);
        defaultDueDate = baseDate.toISOString().split("T")[0];
      } catch {
        defaultDueDate = current.date || "";
      }

      const generatedAssignment: SessionAssignmentItem = {
        title: `Hands-On Project: Production ${current.title}`,
        description: `In this take-home challenge, you will implement an end-to-end production solution reinforcing the core concepts of Session ${current.sessionNumber}: "${current.title}". You are expected to design modular components, handle edge cases, and ensure clean architecture.`,
        instructions: [
          `Architecture Setup: Scaffold the repository using standard conventions discussed in Session ${current.sessionNumber}.`,
          "Core Implementation: Build the stateful pipeline with error boundaries and validation checks.",
          "Testing & Benchmarking: Write integration tests covering nominal and edge-case execution paths.",
          "Documentation & Delivery: Provide a comprehensive README.md with setup instructions and architecture diagram."
        ],
        totalMarks: 100,
        submissionType: "github_url",
        publishTrigger: "after_class_end",
        dueDate: defaultDueDate,
        dueTime: "11:59 PM",
        availabilityDuration: "7_days",
        allowLateSubmissions: true,
        latePenaltyPercent: 10,
        notifyStudents: true,
        notificationMessage: `📢 Assignment Released: Session ${current.sessionNumber} (${current.title}) challenge is now active. Due date: ${defaultDueDate || "7 days"}.`,
        autoAssignOnSessionEnd: true,
        externalStarterUrl: "https://github.com/glarus-academy"
      };

      handleUpdateActiveSession("assignment", generatedAssignment);
      setSaveSuccessMsg(`✨ AI generated tailored Assignment for Session ${current.sessionNumber}!`);
      setTimeout(() => setSaveSuccessMsg(""), 3500);
    } catch (err: any) {
      console.error("AI Assignment error:", err);
      setErrorMessage("Could not generate AI assignment.");
    } finally {
      setIsGeneratingAssignment(false);
    }
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

    const rawSessions = aiGeneratedSessions.length > 0 ? aiGeneratedSessions : generateScheduleDates(sessionCount);

    const sessionsToSave = rawSessions.map((s, idx) => ({
      ...s,
      title: typeof s.title === "string" ? s.title : `Session ${idx + 1}`,
      description: Array.isArray(s.description)
        ? s.description.join("\n\n")
        : typeof s.description === "object" && s.description !== null
        ? JSON.stringify(s.description)
        : String(s.description || "")
    }));

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

      const normalizedDesc = Array.isArray(formData.description)
        ? formData.description.join("\n\n")
        : typeof formData.description === "object" && formData.description !== null
        ? JSON.stringify(formData.description)
        : String(formData.description || "");

      const normalizedShortDesc = Array.isArray(formData.shortDescription)
        ? formData.shortDescription.join(" ")
        : typeof formData.shortDescription === "object" && formData.shortDescription !== null
        ? JSON.stringify(formData.shortDescription)
        : (formData.shortDescription || "");

      const normalizedAudience = Array.isArray(formData.targetAudience)
        ? (formData.targetAudience as any[]).join(", ")
        : (formData.targetAudience || "");

      const res = await fetch("/api/admin/live-training/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          description: normalizedDesc,
          shortDescription: normalizedShortDesc,
          registrationStartDate: regStartISO,
          registrationEndDate: regEndISO,
          targetAudience: normalizedAudience,
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
              {/* Delivery Format (Top Selector) */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-text">Delivery Format</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/create")}
                    className="p-3.5 rounded-2xl border border-white/10 bg-background/50 hover:bg-card hover:border-purple-500/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-text group-hover:text-purple-300">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span className="text-white group-hover:text-purple-300">Self-Paced ↗</span>
                    </div>
                    <span className="text-[11px] text-subtext block mt-1">On-demand video & labs</span>
                  </button>

                  <button
                    type="button"
                    className="p-3.5 rounded-2xl border bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-white">Live Bootcamp</span>
                    </div>
                    <span className="text-[11px] text-subtext block mt-1">Cohort live classes</span>
                  </button>
                </div>
              </div>

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

                {/* Structured Program Duration Builder */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text">Live Program Duration</label>
                    <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      {formData.duration || "6 Weeks"}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={
                          formData.duration
                            ? (formData.duration.match(/\d+(\.\d+)?/)?.[0] || "")
                            : ""
                        }
                        onChange={(e) => {
                          const num = e.target.value;
                          const currentUnit = formData.duration
                            ? formData.duration.replace(/^\d+(\.\d+)?\s*/, "").trim() || "Weeks"
                            : "Weeks";
                          setFormData({
                            ...formData,
                            duration: num ? `${num} ${currentUnit}` : ""
                          });
                        }}
                        placeholder="e.g. 6"
                        className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs font-bold focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div className="col-span-7">
                      <select
                        value={(() => {
                          if (!formData.duration) return "Weeks";
                          const unitPart = formData.duration.replace(/^\d+(\.\d+)?\s*/, "").trim();
                          return unitPart || "Weeks";
                        })()}
                        onChange={(e) => {
                          const newUnit = e.target.value;
                          const currentNum = formData.duration
                            ? (formData.duration.match(/\d+(\.\d+)?/)?.[0] || "6")
                            : "6";
                          setFormData({
                            ...formData,
                            duration: `${currentNum} ${newUnit}`
                          });
                        }}
                        className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-purple-300 text-xs font-bold focus:outline-none focus:border-purple-500/50 cursor-pointer"
                      >
                        <option value="Weeks">Weeks (e.g. 6 Weeks)</option>
                        <option value="Live Sessions">Live Sessions (e.g. 12 Live Sessions)</option>
                        <option value="Months">Months (e.g. 2 Months)</option>
                        <option value="Days">Days (e.g. 30 Days)</option>
                        <option value="Hours">Hours (e.g. 24 Hours)</option>
                        <option value="Hours Live">Hours Live (e.g. 24 Hours Live)</option>
                      </select>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-subtext font-bold uppercase tracking-wider">Presets:</span>
                    {[
                      "4 Weeks",
                      "6 Weeks",
                      "8 Weeks",
                      "12 Live Sessions",
                      "2 Months",
                      "30 Days",
                      "24 Hours Live"
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData({ ...formData, duration: preset })}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold transition-all ${
                          formData.duration === preset
                            ? "bg-purple-600/30 border-purple-500 text-purple-200 font-bold"
                            : "bg-white/5 hover:bg-white/10 border-white/5 text-subtext hover:text-text"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Video URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text">Preview Video URL</label>
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

            {/* ── Cohort Registration Window (Open to End Time) ── */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-card to-background border border-purple-500/30 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text flex items-center gap-2">
                      <span>Cohort Registration Window</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Landing Page Displayed
                      </span>
                    </h3>
                    <p className="text-xs text-subtext mt-0.5">
                      Set exact registration opening & deadline cutoff times. Prospective students see these live countdowns on the landing page.
                    </p>
                  </div>
                </div>

                {/* Live Status Badge Preview */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${getRegistrationPreviewInfo.color}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {getRegistrationPreviewInfo.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Registration Start Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text flex items-center gap-1">
                    <span>Registration Opens (Date) *</span>
                  </label>
                  <DatePicker
                    value={formData.registrationStartDate}
                    onChange={(val) => setFormData({ ...formData, registrationStartDate: val })}
                    required
                  />
                </div>

                {/* Registration Start Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text">Opens (Time)</label>
                  <TimePicker
                    value={formData.registrationStartTime}
                    onChange={(val) => setFormData({ ...formData, registrationStartTime: val })}
                  />
                </div>

                {/* Registration End Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text flex items-center gap-1">
                    <span>Registration Deadline (Date) *</span>
                  </label>
                  <DatePicker
                    value={formData.registrationEndDate}
                    onChange={(val) => setFormData({ ...formData, registrationEndDate: val })}
                    required
                  />
                </div>

                {/* Registration End Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text">Deadline (Time)</label>
                  <TimePicker
                    value={formData.registrationEndTime}
                    onChange={(val) => setFormData({ ...formData, registrationEndTime: val })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Cohort Start Date *</label>
                <DatePicker
                  value={formData.startDate}
                  onChange={(val) => setFormData({ ...formData, startDate: val })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Cohort End Date</label>
                <DatePicker
                  value={formData.endDate}
                  onChange={(val) => setFormData({ ...formData, endDate: val })}
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
                <TimePicker
                  value={formData.preferredStartTime}
                  onChange={(val) => setFormData({ ...formData, preferredStartTime: val })}
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
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-white/5 text-[10px] text-subtext">
                            <span>{sess.date ? formatDate(sess.date) : "Date TBA"}</span>
                            <span>•</span>
                            <span>{sess.startTime ? formatTime(sess.startTime) : "07:00 PM"}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">{sess.agenda?.length || 0} agenda</span>
                            {sess.videoUrl && <span className="text-purple-400 font-bold">• 📹 Video</span>}
                            {(sess.resources?.length || 0) > 0 && <span className="text-blue-400 font-bold">• 📁 {sess.resources.length} res</span>}
                            {(sess.quizzes?.length || 0) > 0 && <span className="text-amber-400 font-bold">• ❓ {sess.quizzes?.length || 0} quiz</span>}
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
                        <DatePicker
                          value={aiGeneratedSessions[activeSessionIndex].date || ""}
                          onChange={(val) => handleUpdateActiveSession("date", val)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text">Start Time – End Time</label>
                        <div className="flex gap-2">
                          <div className="w-1/2">
                            <TimePicker
                              value={aiGeneratedSessions[activeSessionIndex].startTime}
                              onChange={(val) => handleUpdateActiveSession("startTime", val)}
                            />
                          </div>
                          <div className="w-1/2">
                            <TimePicker
                              value={aiGeneratedSessions[activeSessionIndex].endTime}
                              onChange={(val) => handleUpdateActiveSession("endTime", val)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Session Sub-Navigation Tabs (5 Tabs) */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-background/80 rounded-2xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => setActiveSessionTab("agenda")}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            activeSessionTab === "agenda"
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                              : "text-subtext hover:text-text hover:bg-white/5"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Agenda ({aiGeneratedSessions[activeSessionIndex].agenda?.length || 0})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveSessionTab("video")}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            activeSessionTab === "video"
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                              : "text-subtext hover:text-text hover:bg-white/5"
                          }`}
                        >
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span>Video & Replay {aiGeneratedSessions[activeSessionIndex].videoUrl ? "✓" : ""}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveSessionTab("resources")}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            activeSessionTab === "resources"
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                              : "text-subtext hover:text-text hover:bg-white/5"
                          }`}
                        >
                          <Paperclip className="w-3.5 h-3.5 shrink-0" />
                          <span>Resources ({aiGeneratedSessions[activeSessionIndex].resources?.length || 0})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveSessionTab("quiz")}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            activeSessionTab === "quiz"
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                              : "text-subtext hover:text-text hover:bg-white/5"
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Quiz ({(aiGeneratedSessions[activeSessionIndex].quizzes?.length || 0)})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveSessionTab("assignment")}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all col-span-2 sm:col-span-1 ${
                            activeSessionTab === "assignment"
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30"
                              : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20"
                          }`}
                        >
                          <FileCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Assignment {aiGeneratedSessions[activeSessionIndex].assignment ? "✓" : "(0)"}</span>
                        </button>
                      </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════
                        TAB 1: LIVE AGENDA TIMELINE
                        ══════════════════════════════════════════════════════════ */}
                    {activeSessionTab === "agenda" && (
                      <div className="space-y-3 animate-in fade-in duration-150">
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
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 2: VIDEO & REPLAY (WITH SCHEDULING & NOTIFICATION)
                        ══════════════════════════════════════════════════════════ */}
                    {activeSessionTab === "video" && (
                      <div className="space-y-5 animate-in fade-in duration-150">
                        <div>
                          <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-purple-400" />
                            Session Video Recording & Replay Stream
                          </h4>
                          <p className="text-[11px] text-subtext">
                            Upload high-definition session recording file or paste direct cloud stream / Zoom replay URL.
                          </p>
                        </div>

                        {/* Drag & Drop File Upload Dropzone */}
                        <div className="p-5 bg-background/50 border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl text-center space-y-2 transition-all">
                          <input
                            type="file"
                            id={`session-video-upload-${activeSessionIndex}`}
                            accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/mkv,.mp4,.mov,.webm,.m4v,.mkv"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              await handleUploadSessionVideo(file);
                            }}
                          />
                          <label
                            htmlFor={`session-video-upload-${activeSessionIndex}`}
                            className="cursor-pointer flex flex-col items-center justify-center gap-2"
                          >
                            {uploadingSessionVideo ? (
                              <div className="w-full py-2 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                                  <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                    Uploading to Bunny Stream CDN...
                                  </span>
                                  <span>{sessionVideoUploadProgress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-white/10">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                                    style={{ width: `${sessionVideoUploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center shadow-md">
                                  <UploadCloud className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-text">Click or Drag & Drop to Upload Session Video</p>
                                  <p className="text-[10px] text-subtext mt-0.5">High-Speed Bunny Stream TUS Upload · Auto-encodes HLS + Global CDN</p>
                                </div>
                              </>
                            )}
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-[1px] bg-white/10 flex-1" />
                          <span className="text-[10px] uppercase font-bold text-subtext tracking-wider">Or Provide Video URL / Stream</span>
                          <div className="h-[1px] bg-white/10 flex-1" />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-text">Session Video / Replay URL</label>
                          <input
                            type="text"
                            value={aiGeneratedSessions[activeSessionIndex].videoUrl || ""}
                            onChange={(e) => {
                              handleUpdateActiveSession("videoUrl", e.target.value);
                              handleUpdateActiveSession("recordingUrl", e.target.value);
                              handleUpdateActiveSession("recordingStatus", e.target.value ? "available" : "unavailable");
                            }}
                            placeholder="https://zoom.us/rec/play/xyz or https://commondatastorage.googleapis.com/.../session.mp4"
                            className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-xs text-text outline-none font-mono focus:border-purple-500"
                          />
                        </div>

                        {aiGeneratedSessions[activeSessionIndex].videoUrl && (
                          <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Video Attached & Verified
                              </span>
                              <div className="flex items-center gap-2">
                                <a
                                  href={aiGeneratedSessions[activeSessionIndex].videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 font-bold"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Test Play</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={handleClearSessionVideo}
                                  className="text-[11px] text-rose-400 hover:underline cursor-pointer font-bold ml-2"
                                >
                                  Clear Video
                                </button>
                              </div>
                            </div>
                            <p className="text-[11px] text-subtext truncate font-mono bg-background/60 p-2 rounded-lg border border-white/5">
                              {aiGeneratedSessions[activeSessionIndex].videoUrl}
                            </p>
                          </div>
                        )}

                        {/* 🌟 VIDEO PUBLISH TIMING, DURATION & NOTIFICATION PANEL */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-card via-card to-purple-950/20 border border-purple-500/30 space-y-4 shadow-sm">
                          <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <h5 className="text-xs font-bold text-white">Video Replay Publishing & Access Window</h5>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* When to Publish / Release Trigger */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-text flex items-center gap-1.5">
                                <span>⚡ When to Publish / Release Video</span>
                              </label>
                              <select
                                value={aiGeneratedSessions[activeSessionIndex].recordingReleaseTime || "after_class_end"}
                                onChange={(e) => handleUpdateActiveSession("recordingReleaseTime", e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-purple-500 cursor-pointer font-medium"
                              >
                                <option value="after_class_end">🏁 Immediately After Live Class Ends (Standard)</option>
                                <option value="2_hours">⏱ Within 2 Hours after live class (SLA Processing)</option>
                                <option value="4_hours">⏱ Within 4 Hours after live class</option>
                                <option value="24_hours">⏱ Within 24 Hours after live class (Next Day)</option>
                                <option value="immediate">🟢 Immediate (Instant Replay Available Now)</option>
                                <option value="scheduled_date">📅 Specific Scheduled Date & Time</option>
                                <option value="manual_unlock">🔒 Manual Unlock by Instructor</option>
                              </select>
                            </div>

                            {/* Replay Access Duration / Validity */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-text">⏳ Access Duration & Validity</label>
                              <select
                                value={aiGeneratedSessions[activeSessionIndex].recordingValidity || "lifetime"}
                                onChange={(e) => handleUpdateActiveSession("recordingValidity", e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-purple-500 cursor-pointer font-medium"
                              >
                                <option value="lifetime">♾️ Lifetime Access (Always Available)</option>
                                <option value="1_year">📅 1 Year after Cohort Completion</option>
                                <option value="90_days">📅 90 Days after Session</option>
                                <option value="30_days">📅 30 Days after Session</option>
                                <option value="cohort_duration">⏳ Cohort Duration Only (Expires on Batch End)</option>
                                <option value="custom_expiry">📅 Specific Expiration Date...</option>
                              </select>
                            </div>

                            {/* Scheduled Release Date & Time if selected */}
                            {aiGeneratedSessions[activeSessionIndex].recordingReleaseTime === "scheduled_date" && (
                              <div className="sm:col-span-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-purple-300">Scheduled Release Date</label>
                                  <DatePicker
                                    value={aiGeneratedSessions[activeSessionIndex].recordingReleaseDate || ""}
                                    onChange={(val) => handleUpdateActiveSession("recordingReleaseDate", val)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-purple-300">Scheduled Release Time</label>
                                  <TimePicker
                                    value={aiGeneratedSessions[activeSessionIndex].recordingReleaseTimeOfDay || "10:00 PM"}
                                    onChange={(val) => handleUpdateActiveSession("recordingReleaseTimeOfDay", val)}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Custom Expiry Date if selected */}
                            {aiGeneratedSessions[activeSessionIndex].recordingValidity === "custom_expiry" && (
                              <div className="sm:col-span-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1 animate-in fade-in">
                                <label className="text-[11px] font-bold text-purple-300">Video Access Expiration Date</label>
                                <DatePicker
                                  value={aiGeneratedSessions[activeSessionIndex].recordingExpiryDate || ""}
                                  onChange={(val) => handleUpdateActiveSession("recordingExpiryDate", val)}
                                />
                              </div>
                            )}
                          </div>

                          {/* 🔔 AUTOMATED NOTIFICATION BOX */}
                          <div className="p-3.5 rounded-xl bg-background/80 border border-white/10 space-y-2">
                            <label className="flex items-center gap-2.5 text-xs font-bold text-text cursor-pointer">
                              <input
                                type="checkbox"
                                checked={aiGeneratedSessions[activeSessionIndex].autoNotifyStudents !== false}
                                onChange={(e) => handleUpdateActiveSession("autoNotifyStudents", e.target.checked)}
                                className="w-4 h-4 accent-purple-600 rounded"
                              />
                              <div className="flex items-center gap-1.5">
                                <Bell className="w-3.5 h-3.5 text-purple-400" />
                                <span>🔔 Send instant push & dashboard notification to enrolled students when recording is published</span>
                              </div>
                            </label>

                            {aiGeneratedSessions[activeSessionIndex].autoNotifyStudents !== false && (
                              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 flex items-start gap-2">
                                <Send className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-bold text-purple-300">Notification Preview: </span>
                                  <span>&quot;🎥 Session {aiGeneratedSessions[activeSessionIndex].sessionNumber} HD Recording for &apos;{aiGeneratedSessions[activeSessionIndex].title}&apos; is now ready to watch!&quot;</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-white/10 text-xs font-semibold text-text cursor-pointer hover:border-purple-500/30 transition-all">
                              <input
                                type="checkbox"
                                checked={aiGeneratedSessions[activeSessionIndex].allowOfflineDownload !== false}
                                onChange={(e) => handleUpdateActiveSession("allowOfflineDownload", e.target.checked)}
                                className="w-4 h-4 accent-purple-600 rounded"
                              />
                              <span className="text-[11px]">Allow offline HD MP4 download</span>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-white/10 text-xs font-semibold text-text cursor-pointer hover:border-purple-500/30 transition-all">
                              <input
                                type="checkbox"
                                checked={aiGeneratedSessions[activeSessionIndex].isPreview || false}
                                onChange={(e) => handleUpdateActiveSession("isPreview", e.target.checked)}
                                className="w-4 h-4 accent-purple-600 rounded"
                              />
                              <span className="text-[11px]">Free sample preview (public access)</span>
                            </label>
                          </div>
                        </div>

                        {/* Make-Up / Doubt Clearance Session Quick Action Banner */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-background border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                              Missed Live Class / Extra Doubt Support
                            </span>
                            <h5 className="text-xs font-bold text-text">
                              Need a Make-Up or Live Doubt Clearing Session for this topic?
                            </h5>
                            <p className="text-[11px] text-subtext">
                              If learners miss the live broadcast or recordings are unavailable, you can automatically append a scheduled backup doubt-resolution session.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddBackupSession(activeSessionIndex)}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>➕ Add Make-Up / Doubt Session</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 3: RESOURCES & LEARNING MATERIALS (WITH SCHEDULING)
                        ══════════════════════════════════════════════════════════ */}
                    {activeSessionTab === "resources" && (
                      <div className="space-y-4 animate-in fade-in duration-150">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                              <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                              Session Resources & Learning Materials ({aiGeneratedSessions[activeSessionIndex].resources?.length || 0})
                            </h4>
                            <p className="text-[11px] text-subtext">
                              Attach starter repositories, lecture slides (PDF), datasets, and configure when students can access them.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddResource()}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Resource</span>
                          </button>
                        </div>

                        {/* Quick Add Presets */}
                        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-white/5">
                          <span className="text-[10px] font-bold text-subtext uppercase tracking-wider">Quick Presets:</span>
                          <button
                            type="button"
                            onClick={() => handleAddResource({
                              title: `Session ${aiGeneratedSessions[activeSessionIndex].sessionNumber} GitHub Starter Repo`,
                              type: "GITHUB",
                              url: "https://github.com/glarus-academy",
                              publishTrigger: "after_class_end",
                              availabilityDuration: "always",
                              notifyStudents: true
                            })}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-subtext hover:text-purple-200 border border-white/10 transition-all font-semibold"
                          >
                            🚀 + GitHub Starter Repo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddResource({
                              title: `${aiGeneratedSessions[activeSessionIndex].title} - Masterclass Slides.pdf`,
                              type: "SLIDES",
                              url: "",
                              publishTrigger: "after_class_end",
                              availabilityDuration: "always",
                              notifyStudents: true
                            })}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-subtext hover:text-purple-200 border border-white/10 transition-all font-semibold"
                          >
                            📑 + Slides (PDF)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddResource({
                              title: `${aiGeneratedSessions[activeSessionIndex].title} Cheatsheet & Summary`,
                              type: "DOC",
                              url: "",
                              publishTrigger: "after_class_end",
                              availabilityDuration: "always",
                              notifyStudents: true
                            })}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-subtext hover:text-purple-200 border border-white/10 transition-all font-semibold"
                          >
                            📝 + Cheat Sheet
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddResource({
                              title: `Session ${aiGeneratedSessions[activeSessionIndex].sessionNumber} Training Dataset`,
                              type: "DATASET",
                              url: "",
                              publishTrigger: "during_class",
                              availabilityDuration: "always",
                              notifyStudents: true
                            })}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-subtext hover:text-purple-200 border border-white/10 transition-all font-semibold"
                          >
                            📊 + Dataset
                          </button>
                        </div>

                        {/* Resources List */}
                        {(!aiGeneratedSessions[activeSessionIndex].resources || aiGeneratedSessions[activeSessionIndex].resources.length === 0) ? (
                          <div className="p-8 text-center rounded-2xl bg-background/40 border border-white/5 space-y-2">
                            <Paperclip className="w-8 h-8 text-subtext/40 mx-auto" />
                            <p className="text-xs font-bold text-text">No resources attached to this session yet</p>
                            <p className="text-[11px] text-subtext">Click &quot;Add Resource&quot; or select one of the Quick Presets above to attach materials.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {aiGeneratedSessions[activeSessionIndex].resources.map((resItem, resIdx) => (
                              <div
                                key={resIdx}
                                className="p-4 rounded-2xl bg-background/70 border border-white/10 space-y-3 shadow-sm hover:border-purple-500/30 transition-all"
                              >
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  {/* Resource Type Dropdown */}
                                  <select
                                    value={resItem.type}
                                    onChange={(e) => handleUpdateResource(resIdx, "type", e.target.value)}
                                    className="h-8 px-2 rounded-lg bg-card border border-white/10 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500 cursor-pointer shrink-0"
                                  >
                                    <option value="PDF">📄 PDF Document</option>
                                    <option value="SLIDES">📑 Slides Deck</option>
                                    <option value="GITHUB">🚀 GitHub Repo</option>
                                    <option value="CODE">💻 Code Lab</option>
                                    <option value="DATASET">📊 Dataset</option>
                                    <option value="DOC">📝 Document / Notes</option>
                                    <option value="ZIP">📦 ZIP Archive</option>
                                    <option value="URL">🔗 External Link</option>
                                  </select>

                                  {/* Resource Title Input */}
                                  <input
                                    type="text"
                                    value={resItem.title}
                                    onChange={(e) => handleUpdateResource(resIdx, "title", e.target.value)}
                                    placeholder="Resource Title (e.g. Transformer Architecture Slides)"
                                    className="flex-1 h-8 px-2.5 rounded-lg bg-card border border-white/10 text-xs font-bold text-text focus:outline-none focus:border-purple-500/50"
                                  />

                                  {/* Delete Resource Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveResource(resIdx)}
                                    className="p-1.5 rounded-lg text-subtext hover:text-red-400 transition-colors self-end sm:self-auto"
                                    title="Delete Resource"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* URL or Uploaded Link */}
                                  <input
                                    type="text"
                                    value={resItem.url}
                                    onChange={(e) => handleUpdateResource(resIdx, "url", e.target.value)}
                                    placeholder="https://... or click Upload File"
                                    className="flex-1 h-8 px-2.5 rounded-lg bg-card/60 border border-white/5 text-[11px] text-text font-mono focus:outline-none focus:border-purple-500/50"
                                  />

                                  {/* Direct File Upload Trigger */}
                                  <input
                                    type="file"
                                    id={`resource-upload-${activeSessionIndex}-${resIdx}`}
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      await handleUploadResourceFile(resIdx, file);
                                    }}
                                  />
                                  <label
                                    htmlFor={`resource-upload-${activeSessionIndex}-${resIdx}`}
                                    className="h-8 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                                  >
                                    {uploadingResourceIndex === resIdx ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <UploadCloud className="w-3.5 h-3.5" />
                                    )}
                                    <span>Upload File</span>
                                  </label>

                                  {resItem.url && (
                                    <a
                                      href={resItem.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="h-8 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-subtext hover:text-text border border-white/10 flex items-center justify-center shrink-0"
                                      title="Open Resource Link"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>

                                {/* 🌟 Per-Resource Publishing & Expiry Controls */}
                                <div className="p-2.5 rounded-xl bg-card/60 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <label className="text-[10px] font-bold text-subtext block mb-1">⚡ Release When?</label>
                                    <select
                                      value={resItem.publishTrigger || "after_class_end"}
                                      onChange={(e) => handleUpdateResource(resIdx, "publishTrigger", e.target.value)}
                                      className="w-full bg-background border border-white/10 rounded-lg px-2 py-1 text-[11px] text-text outline-none cursor-pointer"
                                    >
                                      <option value="after_class_end">🏁 After Live Class Ends</option>
                                      <option value="before_class">📖 Before Class (Pre-Read)</option>
                                      <option value="during_class">💬 During Live Class</option>
                                      <option value="immediate">🟢 Available Immediately</option>
                                      <option value="scheduled_date">📅 Scheduled Date/Time</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-subtext block mb-1">⏳ Access Validity</label>
                                    <select
                                      value={resItem.availabilityDuration || "always"}
                                      onChange={(e) => handleUpdateResource(resIdx, "availabilityDuration", e.target.value)}
                                      className="w-full bg-background border border-white/10 rounded-lg px-2 py-1 text-[11px] text-text outline-none cursor-pointer"
                                    >
                                      <option value="always">♾️ Always Available (Lifetime)</option>
                                      <option value="until_next_session">⏳ Until Next Live Session</option>
                                      <option value="7_days">📅 7 Days after Class</option>
                                      <option value="30_days">📅 30 Days after Class</option>
                                      <option value="custom_expiry">📅 Custom Expiry Date</option>
                                    </select>
                                  </div>

                                  <div className="flex items-center justify-start sm:justify-center pt-3 sm:pt-0">
                                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-purple-300 font-semibold">
                                      <input
                                        type="checkbox"
                                        checked={resItem.notifyStudents !== false}
                                        onChange={(e) => handleUpdateResource(resIdx, "notifyStudents", e.target.checked)}
                                        className="w-3.5 h-3.5 accent-purple-600 rounded"
                                      />
                                      <span>🔔 Notify students</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 4: SESSION QUIZ (WITH TIMING & NOTIFICATIONS)
                        ══════════════════════════════════════════════════════════ */}
                    {activeSessionTab === "quiz" && (
                      <div className="space-y-4 animate-in fade-in duration-150">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                              Session Knowledge Check & Quizzes ({aiGeneratedSessions[activeSessionIndex].quizzes?.length || 0} Questions)
                            </h4>
                            <p className="text-[11px] text-subtext">
                              Multiple-choice questions to evaluate student comprehension after the live masterclass.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isGeneratingSessionQuiz}
                              onClick={handleGenerateSessionQuizAI}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 border border-purple-500/40 text-xs font-bold shadow-sm transition-all"
                            >
                              {isGeneratingSessionQuiz ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Generating Quiz...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                  <span>✨ AI Generate Quiz</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddQuizQuestion()}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Question</span>
                            </button>
                          </div>
                        </div>

                        {/* 🌟 QUIZ RELEASE TIMING, DUE DATE & NOTIFICATION SETTINGS */}
                        <div className="p-4 rounded-2xl bg-card border border-purple-500/20 space-y-3 shadow-sm">
                          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <h5 className="text-xs font-bold text-white">Quiz Release Schedule & Due Date</h5>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-subtext">⚡ When to Publish Quiz?</label>
                              <select
                                value={aiGeneratedSessions[activeSessionIndex].quizPublishTrigger || "after_class_end"}
                                onChange={(e) => handleUpdateActiveSession("quizPublishTrigger", e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-text outline-none cursor-pointer"
                              >
                                <option value="after_class_end">🏁 Immediately After Live Class Ends</option>
                                <option value="during_class">💬 During Live Class (In-Session)</option>
                                <option value="immediate">🟢 Available Immediately</option>
                                <option value="scheduled_date">📅 Specific Scheduled Date/Time</option>
                                <option value="manual_unlock">🔒 Manual Instructor Unlock</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-subtext">⏳ Due Date / Window</label>
                              <select
                                value={aiGeneratedSessions[activeSessionIndex].quizDurationWindow || "24_hours"}
                                onChange={(e) => handleUpdateActiveSession("quizDurationWindow", e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-text outline-none cursor-pointer"
                              >
                                <option value="24_hours">⏱ Due 24 Hours after Live Class</option>
                                <option value="48_hours">⏱ Due 48 Hours after Live Class</option>
                                <option value="until_next_session">📅 Due Before Next Live Session</option>
                                <option value="custom_deadline">📅 Custom Due Date & Time</option>
                                <option value="unlimited">♾️ Unlimited / Practice Mode</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-subtext">⏱ Time Limit per Attempt</label>
                              <select
                                value={aiGeneratedSessions[activeSessionIndex].quizTimeLimitMinutes || 20}
                                onChange={(e) => handleUpdateActiveSession("quizTimeLimitMinutes", parseInt(e.target.value))}
                                className="w-full bg-background border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-text outline-none cursor-pointer"
                              >
                                <option value={10}>10 Minutes</option>
                                <option value={15}>15 Minutes</option>
                                <option value={20}>20 Minutes (Standard)</option>
                                <option value={30}>30 Minutes</option>
                                <option value={0}>No Time Limit</option>
                              </select>
                            </div>
                          </div>

                          {/* Quiz Custom Due Date if selected */}
                          {aiGeneratedSessions[activeSessionIndex].quizDurationWindow === "custom_deadline" && (
                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-purple-300">Quiz Due Date</label>
                                <DatePicker
                                  value={aiGeneratedSessions[activeSessionIndex].quizDueDate || ""}
                                  onChange={(val) => handleUpdateActiveSession("quizDueDate", val)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-purple-300">Quiz Due Time</label>
                                <TimePicker
                                  value={aiGeneratedSessions[activeSessionIndex].quizDueTime || "11:59 PM"}
                                  onChange={(val) => handleUpdateActiveSession("quizDueTime", val)}
                                />
                              </div>
                            </div>
                          )}

                          {/* Notification Toggle */}
                          <div className="p-2.5 rounded-xl bg-background/60 border border-white/5 flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text">
                              <input
                                type="checkbox"
                                checked={aiGeneratedSessions[activeSessionIndex].quizNotifyStudents !== false}
                                onChange={(e) => handleUpdateActiveSession("quizNotifyStudents", e.target.checked)}
                                className="w-4 h-4 accent-purple-600 rounded"
                              />
                              <span className="flex items-center gap-1.5 text-purple-300">
                                <Bell className="w-3.5 h-3.5" />
                                <span>🔔 Auto-notify students when Quiz is published & send reminder 6 hours before deadline</span>
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Quiz Questions List */}
                        {(!aiGeneratedSessions[activeSessionIndex].quizzes || aiGeneratedSessions[activeSessionIndex].quizzes.length === 0) ? (
                          <div className="p-8 text-center rounded-2xl bg-background/40 border border-white/5 space-y-3">
                            <HelpCircle className="w-8 h-8 text-subtext/40 mx-auto" />
                            <div>
                              <p className="text-xs font-bold text-text">No quiz questions configured for this session</p>
                              <p className="text-[11px] text-subtext mt-0.5">
                                Add multiple-choice questions manually or click &quot;✨ AI Generate Quiz&quot; to auto-generate questions for this topic.
                              </p>
                            </div>
                            <div className="flex justify-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={handleGenerateSessionQuizAI}
                                className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>AI Generate Quiz for this Session</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {aiGeneratedSessions[activeSessionIndex].quizzes.map((q, qIdx) => (
                              <div
                                key={qIdx}
                                className="p-4 rounded-2xl bg-background/70 border border-white/10 space-y-3 shadow-sm"
                              >
                                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                                  <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center text-[10px]">
                                      {qIdx + 1}
                                    </span>
                                    Question {qIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveQuizQuestion(qIdx)}
                                    className="p-1 rounded text-subtext hover:text-red-400 transition-colors"
                                    title="Delete Question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Question Prompt */}
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-subtext">Question Prompt</label>
                                  <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => handleUpdateQuizQuestion(qIdx, "question", e.target.value)}
                                    placeholder="e.g. Which architectural component ensures state persistence in cyclical graph workflows?"
                                    className="w-full h-9 px-3 rounded-xl bg-card border border-white/10 text-xs font-bold text-text focus:outline-none focus:border-purple-500/50"
                                  />
                                </div>

                                {/* 4 Multiple Choice Options */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-subtext">
                                      Options & Correct Answer
                                    </label>
                                    <span className="text-[10px] text-emerald-400/80 font-medium">
                                      Click letter circle to mark correct answer
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    {(q.options && q.options.length > 0 ? q.options : ["Option A", "Option B", "Option C", "Option D"]).map((opt, optIdx) => {
                                      const isCorrect = (q.correctAnswer ?? 0) === optIdx;
                                      return (
                                        <div key={optIdx} className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleSetCorrectQuizOption(qIdx, optIdx)}
                                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-xs font-black transition-all ${
                                              isCorrect
                                                ? "bg-emerald-500 border-emerald-400 text-black shadow-md shadow-emerald-500/20"
                                                : "border-white/20 text-subtext hover:border-purple-400 hover:text-white"
                                            }`}
                                            title={isCorrect ? "Correct Answer" : "Click to mark as Correct"}
                                          >
                                            {isCorrect ? "✓" : String.fromCharCode(65 + optIdx)}
                                          </button>
                                          <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleUpdateQuizOption(qIdx, optIdx, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                            className={`flex-1 h-8 px-3 rounded-xl bg-card border text-xs text-text outline-none transition-all ${
                                              isCorrect
                                                ? "border-emerald-500/50 bg-emerald-950/15"
                                                : "border-white/10 focus:border-purple-500/50"
                                            }`}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Pedagogical Explanation / Hint */}
                                <div className="space-y-1 pt-1">
                                  <label className="text-[11px] font-bold text-subtext">Explanation & Feedback (Shown after answer)</label>
                                  <input
                                    type="text"
                                    value={q.explanation || ""}
                                    onChange={(e) => handleUpdateQuizQuestion(qIdx, "explanation", e.target.value)}
                                    placeholder="Explain why this answer is correct and provide key insights..."
                                    className="w-full h-8 px-3 rounded-xl bg-card/60 border border-white/5 text-[11px] text-subtext focus:outline-none focus:border-purple-500/50"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 5: SESSION ASSIGNMENT & CAPSTONE CHALLENGE (BRAND NEW!)
                        ══════════════════════════════════════════════════════════ */}
                    {activeSessionTab === "assignment" && (
                      <div className="space-y-5 animate-in fade-in duration-150">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-text flex items-center gap-1.5">
                                <FileCheck className="w-4 h-4 text-emerald-400" />
                                <span>Session Assignment & Take-Home Milestone</span>
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                                {aiGeneratedSessions[activeSessionIndex].assignment ? "Configured" : "Not Set"}
                              </span>
                            </div>
                            <p className="text-[11px] text-subtext mt-0.5">
                              Assign practical coding challenges, specify when students unlock it (e.g. after live class ends), set due dates, and broadcast student notifications.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isGeneratingAssignment}
                              onClick={handleGenerateAssignmentAI}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              {isGeneratingAssignment ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                                  <span>✨ AI Auto-Generate</span>
                                </>
                              )}
                            </button>

                            {!aiGeneratedSessions[activeSessionIndex].assignment ? (
                              <button
                                type="button"
                                onClick={handleInitAssignment}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Assignment</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={handleClearAssignment}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {!aiGeneratedSessions[activeSessionIndex].assignment ? (
                          <div className="p-10 text-center rounded-3xl bg-gradient-to-br from-card/80 via-card to-emerald-950/20 border border-emerald-500/20 space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
                              <FileCheck className="w-7 h-7" />
                            </div>
                            <div className="space-y-1 max-w-md mx-auto">
                              <h4 className="text-sm font-bold text-text">No Assignment Assigned Yet for Session #{aiGeneratedSessions[activeSessionIndex].sessionNumber}</h4>
                              <p className="text-xs text-subtext leading-relaxed">
                                Give students a take-home milestone to practice what was taught during this live masterclass. You can set the assignment to automatically unlock when the live class ends!
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-3 pt-2">
                              <button
                                type="button"
                                onClick={handleGenerateAssignmentAI}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-600/25"
                              >
                                <Sparkles className="w-4 h-4" />
                                <span>✨ AI Generate Assignment from Session</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleInitAssignment}
                                className="px-5 py-2.5 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-text text-xs font-bold flex items-center gap-1.5"
                              >
                                <Plus className="w-4 h-4 text-emerald-400" />
                                <span>Create Custom Assignment</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Section 1: Basic Info */}
                            <div className="p-5 rounded-2xl bg-background/70 border border-white/10 space-y-4 shadow-sm">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2 space-y-1.5">
                                  <label className="text-xs font-bold text-text flex items-center gap-1">
                                    <span>Assignment Title</span>
                                    <span className="text-rose-400">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={aiGeneratedSessions[activeSessionIndex].assignment?.title || ""}
                                    onChange={(e) => handleUpdateAssignment("title", e.target.value)}
                                    placeholder="e.g. Build an Autonomous Multi-Agent Swarm with Memory"
                                    className="w-full h-10 px-3.5 rounded-xl bg-card border border-white/10 text-xs font-bold text-text focus:outline-none focus:border-purple-500/50"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-text">Total Marks / Points</label>
                                  <input
                                    type="number"
                                    min="10"
                                    max="500"
                                    value={aiGeneratedSessions[activeSessionIndex].assignment?.totalMarks || 100}
                                    onChange={(e) => handleUpdateAssignment("totalMarks", parseInt(e.target.value) || 100)}
                                    className="w-full h-10 px-3.5 rounded-xl bg-card border border-white/10 text-xs font-bold text-emerald-300 focus:outline-none focus:border-purple-500/50"
                                  />
                                </div>

                                <div className="sm:col-span-2 space-y-1.5">
                                  <label className="text-xs font-bold text-text">Problem Statement & Requirements</label>
                                  <textarea
                                    rows={3}
                                    value={aiGeneratedSessions[activeSessionIndex].assignment?.description || ""}
                                    onChange={(e) => handleUpdateAssignment("description", e.target.value)}
                                    placeholder="Describe the real-world scenario, deliverables, constraints, and evaluation criteria..."
                                    className="w-full p-3.5 rounded-xl bg-card border border-white/10 text-xs text-text font-medium leading-relaxed focus:outline-none focus:border-purple-500/50"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-text">Submission Format</label>
                                  <select
                                    value={aiGeneratedSessions[activeSessionIndex].assignment?.submissionType || "github_url"}
                                    onChange={(e) => handleUpdateAssignment("submissionType", e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl bg-card border border-white/10 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
                                  >
                                    <option value="github_url">🚀 GitHub Repository URL</option>
                                    <option value="file_upload">📦 ZIP / Project Archive Upload</option>
                                    <option value="live_url">🌐 Live Hosted Demo URL (Vercel/Cloud)</option>
                                    <option value="text_code">💻 Text / Code Snippet</option>
                                    <option value="any">📁 Any of the Above (Flexible)</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Section 2: ⚡ RELEASE SCHEDULE & ⏳ DUE DATE DURATION BUILDER */}
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-card via-card to-purple-950/20 border border-purple-500/30 space-y-4 shadow-sm">
                              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                                <Clock className="w-4 h-4 text-purple-400" />
                                <div>
                                  <h5 className="text-xs font-bold text-white">Assignment Release Timing & Due Date Window</h5>
                                  <p className="text-[10px] text-subtext">Control exactly when students see this assignment and till when submissions are accepted.</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Release Trigger */}
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-text flex items-center gap-1.5">
                                    <span>⚡ When to Publish / Release to Student</span>
                                  </label>
                                  <select
                                    value={aiGeneratedSessions[activeSessionIndex].assignment?.publishTrigger || "after_class_end"}
                                    onChange={(e) => handleUpdateAssignment("publishTrigger", e.target.value)}
                                    className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                                  >
                                    <option value="after_class_end">🏁 Immediately After Live Class Ends (Recommended)</option>
                                    <option value="immediate">🟢 Available Immediately (Pre-released)</option>
                                    <option value="during_class">💬 Unlock During Live Class</option>
                                    <option value="scheduled_date">📅 Specific Scheduled Date & Time</option>
                                    <option value="manual_unlock">🔒 Manual Release by Instructor</option>
                                  </select>
                                  <span className="text-[10px] text-subtext block">
                                    {aiGeneratedSessions[activeSessionIndex].assignment?.publishTrigger === "after_class_end"
                                      ? "✅ Automatically visible in student dashboard the moment the live class concludes."
                                      : "Configured custom trigger."}
                                  </span>
                                </div>

                                {/* Due Date Availability Duration */}
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-text">⏳ Due Date Duration</label>
                                  <div className="flex items-center gap-2">
                                    {[
                                      { label: "+24 Hours", days: 1 },
                                      { label: "+3 Days", days: 3 },
                                      { label: "+7 Days", days: 7 },
                                      { label: "+14 Days", days: 14 }
                                    ].map((preset) => (
                                      <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => {
                                          const base = aiGeneratedSessions[activeSessionIndex].date
                                            ? new Date(aiGeneratedSessions[activeSessionIndex].date!)
                                            : new Date();
                                          base.setDate(base.getDate() + preset.days);
                                          handleUpdateAssignment("dueDate", base.toISOString().split("T")[0]);
                                        }}
                                        className="flex-1 py-1 px-2 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 text-[10px] font-bold text-subtext hover:text-white transition-all text-center"
                                      >
                                        {preset.label}
                                      </button>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 pt-1">
                                    <div>
                                      <DatePicker
                                        value={aiGeneratedSessions[activeSessionIndex].assignment?.dueDate || ""}
                                        onChange={(val) => handleUpdateAssignment("dueDate", val)}
                                      />
                                    </div>
                                    <div>
                                      <TimePicker
                                        value={aiGeneratedSessions[activeSessionIndex].assignment?.dueTime || "11:59 PM"}
                                        onChange={(val) => handleUpdateAssignment("dueTime", val)}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Specific Scheduled Release Date/Time if chosen */}
                                {aiGeneratedSessions[activeSessionIndex].assignment?.publishTrigger === "scheduled_date" && (
                                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-bold text-purple-300">Custom Release Date</label>
                                      <DatePicker
                                        value={aiGeneratedSessions[activeSessionIndex].assignment?.publishDate || ""}
                                        onChange={(val) => handleUpdateAssignment("publishDate", val)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-bold text-purple-300">Custom Release Time</label>
                                      <TimePicker
                                        value={aiGeneratedSessions[activeSessionIndex].assignment?.publishTime || "09:00 PM"}
                                        onChange={(val) => handleUpdateAssignment("publishTime", val)}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Late Submission & Grace Period Policy */}
                              <div className="p-3.5 rounded-xl bg-background/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-text">
                                  <input
                                    type="checkbox"
                                    checked={aiGeneratedSessions[activeSessionIndex].assignment?.allowLateSubmissions !== false}
                                    onChange={(e) => handleUpdateAssignment("allowLateSubmissions", e.target.checked)}
                                    className="w-4 h-4 accent-purple-600 rounded"
                                  />
                                  <span>Allow late submissions with penalty (Grace Period)</span>
                                </label>

                                {aiGeneratedSessions[activeSessionIndex].assignment?.allowLateSubmissions !== false && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-subtext">Penalty per day late:</span>
                                    <select
                                      value={aiGeneratedSessions[activeSessionIndex].assignment?.latePenaltyPercent ?? 10}
                                      onChange={(e) => handleUpdateAssignment("latePenaltyPercent", parseInt(e.target.value))}
                                      className="bg-card border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-text outline-none"
                                    >
                                      <option value={5}>5% deduction</option>
                                      <option value={10}>10% deduction (Standard)</option>
                                      <option value={20}>20% deduction</option>
                                      <option value={0}>0% (No penalty)</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Section 3: 🔔 AUTOMATED STUDENT NOTIFICATION ENGINE */}
                            <div className="p-5 rounded-2xl bg-card border border-purple-500/30 space-y-3.5 shadow-sm">
                              <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
                                <Bell className="w-4 h-4 text-purple-400 animate-pulse" />
                                <h5 className="text-xs font-bold text-white">Student Notification & Automated Broadcast</h5>
                              </div>

                              <div className="space-y-2.5">
                                <label className="flex items-center gap-2.5 text-xs font-bold text-text cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={aiGeneratedSessions[activeSessionIndex].assignment?.notifyStudents !== false}
                                    onChange={(e) => handleUpdateAssignment("notifyStudents", e.target.checked)}
                                    className="w-4 h-4 accent-purple-600 rounded"
                                  />
                                  <span className="text-purple-300">
                                    🔔 Send instant in-app & push notification to enrolled students when assigned
                                  </span>
                                </label>

                                <label className="flex items-center gap-2.5 text-xs font-semibold text-subtext cursor-pointer">
                                  <input
                                    type="checkbox"
                                    defaultChecked={true}
                                    className="w-4 h-4 accent-purple-600 rounded"
                                  />
                                  <span>⏰ Send automatic reminder notification to students 24 hours before due date</span>
                                </label>

                                {/* Notification Live Preview Card */}
                                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-background border border-purple-500/30 space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-purple-400 tracking-wider">
                                    <span className="flex items-center gap-1">
                                      <Send className="w-3 h-3" />
                                      Live Student Notification Preview
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[9px]">
                                      Push & Email
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-white">
                                    📢 New Assignment: &quot;{aiGeneratedSessions[activeSessionIndex].assignment?.title || `${aiGeneratedSessions[activeSessionIndex].title} Project`}&quot;
                                  </p>
                                  <p className="text-[11px] text-purple-200/80 leading-relaxed">
                                    Assigned for Session #{aiGeneratedSessions[activeSessionIndex].sessionNumber}.
                                    Due on <strong>{aiGeneratedSessions[activeSessionIndex].assignment?.dueDate ? formatDate(aiGeneratedSessions[activeSessionIndex].assignment!.dueDate!) : "TBA"}</strong> at <strong>{aiGeneratedSessions[activeSessionIndex].assignment?.dueTime || "11:59 PM"}</strong> (Total: {aiGeneratedSessions[activeSessionIndex].assignment?.totalMarks || 100} Marks).
                                    Click here to view requirements and submit your code.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Section 4: Step-by-Step Instructions Checklist */}
                            <div className="p-5 rounded-2xl bg-background/70 border border-white/10 space-y-3 shadow-sm">
                              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <label className="text-xs font-bold text-text flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Deliverables & Step-by-Step Instructions ({aiGeneratedSessions[activeSessionIndex].assignment?.instructions?.length || 0})</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={handleAddAssignmentInstruction}
                                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add Step
                                </button>
                              </div>

                              <div className="space-y-2">
                                {(aiGeneratedSessions[activeSessionIndex].assignment?.instructions || [
                                  "Clone the starter repository or initialize your project workspace",
                                  "Implement the required components discussed during the live session",
                                  "Write unit tests to validate edge cases and performance",
                                  "Submit your GitHub repository URL or ZIP package before the deadline"
                                ]).map((inst, instIdx) => (
                                  <div key={instIdx} className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-emerald-500/30">
                                      {instIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={inst}
                                      onChange={(e) => handleUpdateAssignmentInstruction(instIdx, e.target.value)}
                                      placeholder="Instruction or deliverable requirement..."
                                      className="flex-1 h-8 px-3 rounded-xl bg-card border border-white/10 text-xs text-text focus:outline-none focus:border-purple-500/50"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAssignmentInstruction(instIdx)}
                                      className="p-1.5 rounded-lg text-subtext hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Section 5: Attached Starter Files & External Repo */}
                            <div className="p-5 rounded-2xl bg-background/70 border border-white/10 space-y-3 shadow-sm">
                              <label className="text-xs font-bold text-text flex items-center gap-1.5">
                                <FolderArchive className="w-3.5 h-3.5 text-purple-400" />
                                <span>Attached Starter Repository & Evaluation Rubric</span>
                              </label>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-subtext">Starter GitHub Repository URL</label>
                                  <input
                                    type="text"
                                    value={aiGeneratedSessions[activeSessionIndex].assignment?.externalStarterUrl || ""}
                                    onChange={(e) => handleUpdateAssignment("externalStarterUrl", e.target.value)}
                                    placeholder="https://github.com/glarus-academy/assignment-starter"
                                    className="w-full h-9 px-3 rounded-xl bg-card border border-white/10 text-xs text-text font-mono focus:outline-none focus:border-purple-500/50"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-subtext">Upload Technical Rubric (PDF / ZIP)</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      id={`assignment-file-upload-${activeSessionIndex}`}
                                      accept=".pdf,.zip,.tar,.gz,.doc,.docx,.txt,.md,.json,.csv,.py,.ipynb,application/pdf"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        await handleUploadAssignmentFile(file);
                                        e.target.value = "";
                                      }}
                                    />
                                    <label
                                      htmlFor={`assignment-file-upload-${activeSessionIndex}`}
                                      className="h-9 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                                    >
                                      {uploadingAssignmentFile ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
                                      )}
                                      <span>Upload Rubric / File</span>
                                    </label>

                                    {aiGeneratedSessions[activeSessionIndex].assignment?.fileUrl && (
                                      <div className="flex-1 flex items-center justify-between p-2 rounded-xl bg-card border border-purple-500/30 min-w-0">
                                        <span className="text-[11px] text-emerald-400 font-bold truncate flex items-center gap-1.5">
                                          <Paperclip className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                          <span className="truncate">{aiGeneratedSessions[activeSessionIndex].assignment?.fileName || "Attached Document"}</span>
                                          {aiGeneratedSessions[activeSessionIndex].assignment?.fileSize && (
                                            <span className="text-[10px] text-subtext shrink-0">({aiGeneratedSessions[activeSessionIndex].assignment?.fileSize})</span>
                                          )}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateAssignment({
                                              fileUrl: undefined,
                                              fileName: undefined,
                                              fileSize: undefined,
                                              fileType: undefined
                                            });
                                          }}
                                          className="text-subtext hover:text-red-400 ml-2 p-1"
                                          title="Remove Attachment"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Agenda</th>
                    <th className="py-3 px-3">Media & Materials</th>
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
                        <div>{sess.date || "TBA"}</div>
                        <div className="text-[10px] text-subtext/70">{sess.startTime} – {sess.endTime}</div>
                      </td>
                      <td className="py-3.5 px-3 text-subtext whitespace-nowrap">{sess.duration}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                          {sess.agenda?.length || 0} steps
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {sess.videoUrl ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9px] font-bold flex items-center gap-1">
                              <Video className="w-2.5 h-2.5" /> Video
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-subtext/50 text-[9px]">No video</span>
                          )}
                          {(sess.resources?.length || 0) > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[9px] font-bold flex items-center gap-1">
                              <Paperclip className="w-2.5 h-2.5" /> {sess.resources.length} res
                            </span>
                          ) : null}
                          {(sess.quizzes?.length || 0) > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9px] font-bold flex items-center gap-1">
                              <HelpCircle className="w-2.5 h-2.5" /> {sess.quizzes?.length || 0} quiz
                            </span>
                          ) : null}
                        </div>
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
                <span className="text-subtext">Registration Window:</span>
                <span className="font-bold text-purple-300 text-right">
                  {formData.registrationStartDate ? formatDate(formData.registrationStartDate) : "Now"} – {formData.registrationEndDate ? formatDate(formData.registrationEndDate) : "Open"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext">Start Date:</span>
                <span className="font-bold text-text">{formData.startDate ? formatDate(formData.startDate) : "Immediate"}</span>
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

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-semibold animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

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
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:scale-105 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Assigning to Instructor...</span>
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
