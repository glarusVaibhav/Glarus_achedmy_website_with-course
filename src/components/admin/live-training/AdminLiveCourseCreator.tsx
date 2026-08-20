"use client";

import React, { useState, useEffect } from "react";
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
  ExternalLink
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

export interface LiveCourseFormData {
  title: string;
  shortDescription: string;
  description: string;
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
  attendanceTracking: boolean;
  visibility: string;
  leadInstructorId: string;
}

const GRADIENT_OPTIONS = [
  { label: "Purple Indigo", value: "from-purple-900 via-indigo-950 to-slate-950", border: "border-purple-500/40" },
  { label: "Neon Emerald", value: "from-emerald-950 via-teal-950 to-slate-950", border: "border-emerald-500/40" },
  { label: "Cyan Sky", value: "from-cyan-950 via-blue-950 to-slate-950", border: "border-cyan-500/40" },
  { label: "Sunset Amber", value: "from-amber-950 via-orange-950 to-slate-950", border: "border-amber-500/40" },
  { label: "Rose Violet", value: "from-rose-950 via-purple-950 to-slate-950", border: "border-rose-500/40" }
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AdminLiveCourseCreator() {
  const router = useRouter();

  // Wizard Step: 1 = Basic Info, 2 = Schedule & Frequency, 3 = AI Copilot / Session Builder, 4 = Review Sessions Timeline, 5 = Assignment & Publish
  const [currentStep, setCurrentStep] = useState(1);

  // Form Metadata
  const [formData, setFormData] = useState<LiveCourseFormData>({
    title: "",
    shortDescription: "",
    description: "",
    category: "Generative AI",
    level: "Intermediate",
    duration: "6 Weeks",
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
    leadInstructorId: ""
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
    setFormData((prev) => ({
      ...prev,
      description: aiOverviewPreview.description,
      shortDescription: aiOverviewPreview.shortDescription || prev.shortDescription,
      targetAudience: aiOverviewPreview.targetAudience || prev.targetAudience,
      prerequisites: aiOverviewPreview.prerequisites?.length ? aiOverviewPreview.prerequisites : prev.prerequisites,
      objectives: aiOverviewPreview.objectives?.length ? aiOverviewPreview.objectives : prev.objectives,
      tags: aiOverviewPreview.tags?.length ? aiOverviewPreview.tags : prev.tags
    }));
    setAiOverviewModalOpen(false);
    setAiOverviewPreview(null);
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

  // Handle Day Toggle
  const togglePreferredDay = (day: string) => {
    setFormData((prev) => {
      const exists = prev.preferredDays.includes(day);
      if (exists) {
        return { ...prev, preferredDays: prev.preferredDays.filter((d) => d !== day) };
      } else {
        return { ...prev, preferredDays: [...prev.preferredDays, day] };
      }
    });
  };

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

      // Update Form Data with AI Course Data
      if (data.course) {
        setFormData((prev) => ({
          ...prev,
          title: data.course.title || prev.title,
          shortDescription: data.course.shortDescription || prev.shortDescription,
          description: data.course.description || prev.description,
          targetAudience: data.course.targetAudience || prev.targetAudience,
          prerequisites: data.course.prerequisites?.length ? data.course.prerequisites : prev.prerequisites,
          objectives: data.course.objectives?.length ? data.course.objectives : prev.objectives,
          tags: data.course.tags?.length ? data.course.tags : prev.tags
        }));
      }

      setAiGeneratedSessions(mergedSessions);
      setAiOriginalBackup(JSON.parse(JSON.stringify(mergedSessions)));
      setHasUnsavedAIChanges(true);
      setActiveSessionIndex(0);
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

  // Submit Handler (Save as Draft or Publish)
  const handleSubmitLiveCourse = async (publishStatus: "DRAFT" | "PUBLISHED") => {
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
      setSaveSuccessMsg(`Live Course "${formData.title}" saved successfully as ${publishStatus}!`);

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
            <Radio className="w-3.5 h-3.5" />
            <span>Publish Live Course</span>
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
          { step: 3, label: "AI Architect", icon: Sparkles },
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

              {/* Thumbnail Gradient Selector */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-text">Course Banner Theme / Gradient</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {GRADIENT_OPTIONS.map((grad) => (
                    <button
                      key={grad.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, thumbnailGradient: grad.value })}
                      className={`h-14 rounded-xl bg-gradient-to-br ${grad.value} border-2 flex items-center justify-center p-2 text-left transition-all ${
                        formData.thumbnailGradient === grad.value
                          ? "border-purple-400 ring-2 ring-purple-500/30 scale-105"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-white shadow-sm truncate">{grad.label}</span>
                    </button>
                  ))}
                </div>
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
                <label className="text-xs font-bold text-text">Session Frequency</label>
                <select
                  value={formData.sessionFrequency}
                  onChange={(e) => setFormData({ ...formData, sessionFrequency: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                >
                  <option value="1 session per week">1 session per week</option>
                  <option value="2 sessions per week">2 sessions per week</option>
                  <option value="3 sessions per week">3 sessions per week</option>
                  <option value="Weekend Fast Track (Sat + Sun)">Weekend Fast Track (Sat + Sun)</option>
                  <option value="Daily Bootcamp (Mon-Fri)">Daily Bootcamp (Mon-Fri)</option>
                </select>
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
              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-bold text-text">Preferred Workshop Days</label>
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
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
            >
              <span>Next: AI Curriculum Architect</span>
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
          {/* AI Generator Control Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-card to-card border border-purple-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text">Groq AI Live Course Copilot</h2>
                  <p className="text-xs text-subtext">
                    Auto-generate deep technical sessions, timeline agendas, topics, outcomes, and take-home exercises.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-background border border-white/10 text-xs">
                  <span className="text-subtext">Sessions:</span>
                  <input
                    type="number"
                    min={2}
                    max={24}
                    value={sessionCount}
                    onChange={(e) => setSessionCount(Number(e.target.value))}
                    className="w-10 bg-transparent text-center font-bold text-text focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Architecting Cohort...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter prompt (e.g. 'Create a 6-week live Generative AI course for intermediate developers with 12 sessions covering transformers, RAG, and LangGraph')"
                className="w-full p-3.5 pr-20 rounded-xl bg-background/80 border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50 leading-relaxed"
              />
              <span className="absolute right-3 bottom-3 text-[10px] text-subtext/60 font-semibold">
                Powered by Groq
              </span>
            </div>

            {hasUnsavedAIChanges && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  AI generated {aiGeneratedSessions.length} sessions. Every session and agenda item is fully editable below!
                </span>
                <div className="flex items-center gap-2">
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
          </div>

          {/* Session Explorer & Interactive Agenda Editor */}
          {aiGeneratedSessions.length > 0 ? (
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
          ) : (
            <div className="p-12 text-center rounded-2xl bg-card border border-dashed border-white/15 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">No live sessions generated yet</h3>
                <p className="text-xs text-subtext mt-1 max-w-md mx-auto">
                  Click <strong>&quot;Generate with AI&quot;</strong> above to have the Groq AI architect generate a full curriculum, or create sessions manually.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate with Groq Copilot</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddNewSession}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card hover:bg-card-hover text-text border border-white/10 text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Session Manually</span>
                </button>
              </div>
            </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
              <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                <p className="text-[10px] text-subtext font-semibold uppercase">Total Sessions</p>
                <p className="text-base font-black text-text">{aiGeneratedSessions.length || sessionCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                <p className="text-[10px] text-subtext font-semibold uppercase">Est. Total Duration</p>
                <p className="text-base font-black text-text">
                  {(aiGeneratedSessions.length || sessionCount) * 2} Hours
                </p>
              </div>
              <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                <p className="text-[10px] text-subtext font-semibold uppercase">Start Date</p>
                <p className="text-base font-black text-text">{formData.startDate || "TBA"}</p>
              </div>
              <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                <p className="text-[10px] text-subtext font-semibold uppercase">Max Capacity</p>
                <p className="text-base font-black text-text">{formData.maxStudents} Students</p>
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

            {/* Granular Permissions Config */}
            <div className="p-5 rounded-xl bg-background/50 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Instructor Access & Edit Permissions
                  </h4>
                  <p className="text-[11px] text-subtext">
                    Control what the assigned instructor is permitted to modify on their dashboard.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: "canView", label: "View Sessions & Roster", desc: "Allow instructor to view session details" },
                  { key: "canEdit", label: "Can Edit Session (Master)", desc: "Primary edit permission toggle" },
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
                <Radio className="w-3.5 h-3.5" />
                <span>Publish Live Course</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CONFIRMATION PUBLISH MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">Publish Live Course</h3>
                  <p className="text-xs text-subtext">Confirm details before opening cohort to students</p>
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
              <div className="flex justify-between">
                <span className="text-subtext">Capacity:</span>
                <span className="font-bold text-text">{formData.maxStudents} Students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext">Lead Instructor:</span>
                <span className="font-bold text-purple-300">
                  {instructors.find((i) => i.id === formData.leadInstructorId)?.name || "Assigned by Admin"}
                </span>
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
                onClick={() => handleSubmitLiveCourse("PUBLISHED")}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Publish</span>
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
    </div>
  );
}
