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
  IndianRupee,
  Layers,
  Code,
  HelpCircle,
  Download,
  Eye,
  Award,
  ShieldCheck,
  Zap,
  ArrowUp,
  ArrowDown,
  Info,
  X,
  Radio,
  Briefcase,
  Building2
} from "lucide-react";

export interface AIModuleItem {
  id: string;
  title: string;
  lessons: string[];
  status: "pending" | "accepted" | "editing" | "regenerating";
}

export interface LessonContent {
  id: string;
  title: string;
  type: "video" | "article" | "quiz" | "sandbox" | "resource";
  duration?: string;
  videoUrl?: string;
  isPreview?: boolean;
  content?: string;
  quizQuestion?: string;
  quizOptions?: string[];
  quizCorrectIndex?: number;
  quizExplanation?: string;
  starterCode?: string;
  codeLanguage?: string;
  resourceFileName?: string;
  resourceUrl?: string;
}

export interface BuilderModule {
  id: string;
  title: string;
  isExpanded: boolean;
  lessons: LessonContent[];
}

export interface CourseFormData {
  title: string;
  subtitle: string;
  category: string;
  level: string;
  price: string;
  originalPrice: string;
  isFree: boolean;
  courseType: "SELF_PACED" | "INSTRUCTOR_LED" | "LIVE_BOOTCAMP";
  instructorId: string;
  instructorName: string;
  description: string;
  outcomes: string[];
  prerequisites: string;
  thumbnailGradient: string;
  featureOnHomepage: boolean;
  issueCertificate: boolean;
  drmProtection: boolean;
  hasInternship: boolean;
  internshipType: string;
  internshipDuration: string;
  internshipStipend: string;
  internshipCompanyPartner: string;
  internshipDescription: string;
}

const GRADIENT_OPTIONS = [
  { label: "Purple Indigo", value: "from-purple-900 via-indigo-950 to-slate-950", border: "border-purple-500/40" },
  { label: "Neon Emerald", value: "from-emerald-950 via-teal-950 to-slate-950", border: "border-emerald-500/40" },
  { label: "Cyan Sky", value: "from-cyan-950 via-blue-950 to-slate-950", border: "border-cyan-500/40" },
  { label: "Sunset Amber", value: "from-amber-950 via-orange-950 to-slate-950", border: "border-amber-500/40" },
  { label: "Rose Violet", value: "from-rose-950 via-purple-950 to-slate-950", border: "border-rose-500/40" }
];

const INSTRUCTOR_OPTIONS = [
  { id: "admin-official", name: "Glarus Academy (Admin Official)", title: "Lead AI Research & Instruction Team" },
  { id: "inst-101", name: "Dr. Sarah Chen", title: "Principal AI Scientist & Multi-Agent Specialist" },
  { id: "inst-102", name: "Alex Chen", title: "Senior Full-Stack & LangGraph Architect" },
  { id: "inst-103", name: "Jordan Walke", title: "Frontend Architecture & React Expert" },
  { id: "inst-104", name: "Jessica Lin", title: "MLOps & Cloud Infrastructure Lead" }
];

const PROMPT_SUGGESTIONS = [
  "Building Multi-Agent AI Systems with LangGraph & Python",
  "Full-Stack Next.js 15, Tailwind CSS 4 & Server Actions Masterclass",
  "Production RAG, Vector Search & Knowledge Graphs",
  "Enterprise DevOps with Kubernetes, Docker & CI/CD Pipelines"
];

export default function AdminCourseCreator() {
  const router = useRouter();

  // Active Wizard Step (1: Basic Info, 2: AI Syllabus, 3: Content Builder, 4: Final Review & Publish)
  const [currentStep, setCurrentStep] = useState(1);

  // Course Form Metadata
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    subtitle: "",
    category: "Artificial Intelligence",
    level: "All Levels",
    price: "2499",
    originalPrice: "4999",
    isFree: false,
    courseType: "SELF_PACED",
    instructorId: "admin-official",
    instructorName: "Glarus Academy (Admin Official)",
    description: "",
    outcomes: ["Architect autonomous agentic AI workflows", "Deploy full-stack web applications with cloud CI/CD", "Optimize performance with production caching & streaming"],
    prerequisites: "Basic proficiency in modern JavaScript or Python.",
    thumbnailGradient: GRADIENT_OPTIONS[0].value,
    featureOnHomepage: true,
    issueCertificate: true,
    drmProtection: true,
    hasInternship: false,
    internshipType: "Guaranteed Internship (Post-Completion)",
    internshipDuration: "2 Months",
    internshipStipend: "Paid (₹15,000 / month)",
    internshipCompanyPartner: "Partner AI Startups & Tech Incubators",
    internshipDescription: "Learners who complete all course milestones and achieve >= 75% on the capstone project receive direct onboarding into a 2-month mentored industry internship."
  });

  // New Outcome input
  const [newOutcome, setNewOutcome] = useState("");

  // AI Generation State
  const [aiTopic, setAiTopic] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [aiModules, setAiModules] = useState<AIModuleItem[]>([
    {
      id: "mod-1",
      title: "Module 1: Foundations of Agentic AI & Autonomous Architectures",
      lessons: [
        "From Single Prompts to Autonomous Multi-Agent Loops",
        "The ReAct Pattern: Reasoning, Action, and Observation",
        "Tool Calling, JSON Schema Outputs & Deterministic Guards"
      ],
      status: "accepted"
    },
    {
      id: "mod-2",
      title: "Module 2: State Management & Stateful Graph Orchestration",
      lessons: [
        "Introduction to LangGraph & Stateful Graphs",
        "Short-term vs Long-term Memory (Vector Store Persistence)",
        "Human-in-the-Loop Interventions & Guardrails"
      ],
      status: "pending"
    },
    {
      id: "mod-3",
      title: "Module 3: Production Deployment & Real-World Case Studies",
      lessons: [
        "Packaging Multi-Agent Systems with FastAPI & Docker",
        "Observability, Tracing & Cost Telemetry",
        "Capstone: Building an Autonomous Financial Research Analyst"
      ],
      status: "pending"
    }
  ]);

  // Inline Module Edit Buffer
  const [editBuffer, setEditBuffer] = useState<{ id: string; title: string; lessons: string }>({
    id: "",
    title: "",
    lessons: ""
  });
  const [aiGeneratingLessons, setAiGeneratingLessons] = useState(false);

  // Step 3 Content Builder State
  const [builderModules, setBuilderModules] = useState<BuilderModule[]>([]);
  const [activeLessonModal, setActiveLessonModal] = useState<{
    moduleId: string;
    lesson: LessonContent;
  } | null>(null);

  // AI Lesson Assistant State
  const [aiLessonPrompt, setAiLessonPrompt] = useState("");
  const [aiLessonDifficulty, setAiLessonDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [isGeneratingLessonAi, setIsGeneratingLessonAi] = useState(false);

  const handleGenerateLessonWithAi = async (customPromptOverride?: string) => {
    if (!activeLessonModal) return;
    const promptToUse = customPromptOverride !== undefined ? customPromptOverride : aiLessonPrompt;
    setIsGeneratingLessonAi(true);

    try {
      const moduleItem = builderModules.find(m => m.id === activeLessonModal.moduleId);
      const res = await fetch("/api/ai/lesson-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: activeLessonModal.lesson.title,
          contentType: activeLessonModal.lesson.type,
          courseTitle: formData.title,
          moduleTitle: moduleItem?.title || "",
          difficulty: aiLessonDifficulty,
          customPrompt: promptToUse,
          currentData: activeLessonModal.lesson
        })
      });

      const data = await res.json();
      if (data.success && data.generated) {
        const gen = data.generated;
        setActiveLessonModal(prev => {
          if (!prev) return null;
          const updatedLesson = { ...prev.lesson };

          if (prev.lesson.type === "quiz") {
            updatedLesson.quizQuestion = gen.quizQuestion || updatedLesson.quizQuestion;
            if (Array.isArray(gen.options) && gen.options.length > 0) {
              updatedLesson.quizOptions = gen.options;
            }
            if (typeof gen.correctIndex === "number") {
              updatedLesson.quizCorrectIndex = gen.correctIndex;
            }
            if (gen.explanation) {
              updatedLesson.quizExplanation = gen.explanation;
            }
          } else if (prev.lesson.type === "article") {
            updatedLesson.content = gen.content || updatedLesson.content;
          } else if (prev.lesson.type === "sandbox") {
            updatedLesson.starterCode = gen.starterCode || updatedLesson.starterCode;
          } else if (prev.lesson.type === "video") {
            if (gen.suggestedDuration) updatedLesson.duration = gen.suggestedDuration;
            if (gen.videoUrl) updatedLesson.videoUrl = gen.videoUrl;
          } else if (prev.lesson.type === "resource") {
            if (gen.resourceFileName) updatedLesson.resourceFileName = gen.resourceFileName;
          }

          return { ...prev, lesson: updatedLesson };
        });

        showToast(`✨ AI generated ${activeLessonModal.lesson.type} content applied!`, "success");
      } else {
        showToast("Could not generate content with AI", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to AI Assistant", "error");
    } finally {
      setIsGeneratingLessonAi(false);
    }
  };

  // Publishing / Submission State
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Sync AI modules into builder modules when entering step 3
  const syncToBuilderModules = () => {
    const initialized: BuilderModule[] = aiModules.map((m, mIdx) => {
      const existing = builderModules.find(b => b.title === m.title || b.id === m.id);
      return {
        id: m.id || `mod-${mIdx + 1}`,
        title: m.title,
        isExpanded: mIdx === 0,
        lessons: existing?.lessons?.length
          ? existing.lessons
          : m.lessons.map((lessonTitle, lIdx) => ({
              id: `les-${m.id}-${lIdx + 1}`,
              title: lessonTitle,
              type: lIdx === 0 ? "video" : lIdx === 1 ? "article" : "sandbox",
              duration: "15m 00s",
              isPreview: lIdx === 0,
              content: `### Overview of ${lessonTitle}\n\nIn this lesson, you will learn the key principles and hands-on techniques for mastering ${lessonTitle}.`
            }))
      };
    });
    setBuilderModules(initialized);
  };

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Outcome management
  const addOutcome = () => {
    if (!newOutcome.trim()) return;
    setFormData(prev => ({ ...prev, outcomes: [...prev.outcomes, newOutcome.trim()] }));
    setNewOutcome("");
  };

  const removeOutcome = (index: number) => {
    setFormData(prev => ({ ...prev, outcomes: prev.outcomes.filter((_, i) => i !== index) }));
  };

  // AI Syllabus Generation
  const generateSyllabus = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiTopic || formData.title;
    if (!promptToUse.trim()) {
      showToast("Please enter a course topic to generate the syllabus.", "info");
      return;
    }

    setIsGeneratingAll(true);
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: promptToUse })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.modules && Array.isArray(data.modules)) {
          const generated: AIModuleItem[] = data.modules.map((m: any, i: number) => ({
            id: `gen-${Date.now()}-${i}`,
            title: m.title || `Module ${i + 1}`,
            lessons: m.lessons && m.lessons.length > 0 ? m.lessons : ["Overview & Concepts", "Deep Dive Lecture", "Practical Lab"],
            status: "pending"
          }));
          setAiModules(generated);
          showToast(`Generated ${generated.length} modules outline using AI Copilot!`, "success");
          return;
        }
      }

      // Intelligent Fallback if API rate limited
      generateFallbackSyllabus(promptToUse);
    } catch (e) {
      console.error(e);
      generateFallbackSyllabus(promptToUse);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const generateFallbackSyllabus = (topic: string) => {
    const fallback: AIModuleItem[] = [
      {
        id: `fb-${Date.now()}-1`,
        title: `Module 1: Introduction to ${topic}`,
        lessons: [
          `Fundamental Principles of ${topic}`,
          "Architectural Design & Core Building Blocks",
          "Setting Up the Modern Development Environment"
        ],
        status: "accepted"
      },
      {
        id: `fb-${Date.now()}-2`,
        title: `Module 2: Advanced Techniques & Implementation`,
        lessons: [
          "Hands-on Deep Dive with Real-world Code",
          "State Orchestration, Error Handling & Edge Cases",
          "Performance Optimization & Benchmarking"
        ],
        status: "pending"
      },
      {
        id: `fb-${Date.now()}-3`,
        title: `Module 3: Production Deployment & Capstone Project`,
        lessons: [
          "Deploying Scalable Infrastructure on Cloud",
          "Security Best Practices & Monitoring",
          "Comprehensive End-to-End Capstone Project"
        ],
        status: "pending"
      }
    ];
    setAiModules(fallback);
    showToast("Generated syllabus draft tailored to your topic!", "success");
  };

  // Inline Editing Functions
  const startEditingModule = (mod: AIModuleItem) => {
    setEditBuffer({
      id: mod.id,
      title: mod.title,
      lessons: mod.lessons.join("\n")
    });
    setAiModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: "editing" } : m));
  };

  const saveEditingModule = (id: string) => {
    const lessonLines = editBuffer.lessons
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0);

    setAiModules(prev => prev.map(m => m.id === id ? {
      ...m,
      title: editBuffer.title.trim() || m.title,
      lessons: lessonLines.length > 0 ? lessonLines : m.lessons,
      status: "accepted"
    } : m));

    showToast("Module changes saved successfully!", "success");
  };

  const aiAutoGenerateLessons = async () => {
    if (!editBuffer.title.trim()) {
      showToast("Please enter a module title first.", "error");
      return;
    }

    setAiGeneratingLessons(true);
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `3 detailed, hands-on lesson topics for the module: ${editBuffer.title}` })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.modules?.[0]?.lessons) {
          const generatedLessons = data.modules[0].lessons.join("\n");
          setEditBuffer(prev => ({ ...prev, lessons: generatedLessons }));
          showToast("AI generated lessons for this module!", "success");
          return;
        }
      }

      // Local fallback generator for lessons
      const fallbackLessons = [
        `Core Fundamentals of ${editBuffer.title}`,
        `Step-by-Step Architecture & Best Practices`,
        `Hands-on Workshop: Building the Solution`
      ].join("\n");
      setEditBuffer(prev => ({ ...prev, lessons: fallbackLessons }));
      showToast("AI generated suggested lessons for this module.", "success");
    } catch {
      showToast("Could not contact AI model.", "error");
    } finally {
      setAiGeneratingLessons(false);
    }
  };

  const regenerateSingleModule = async (id: string, moduleTitle: string) => {
    setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "regenerating" } : m));

    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `A single comprehensive module on ${moduleTitle} for course ${formData.title || aiTopic}` })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.modules?.[0]) {
          const rep = data.modules[0];
          setAiModules(prev => prev.map(m => m.id === id ? {
            ...m,
            title: rep.title || moduleTitle,
            lessons: rep.lessons || ["Overview", "Deep Dive", "Exercise"],
            status: "pending"
          } : m));
          showToast(`Re-rolled module "${rep.title || moduleTitle}"!`, "success");
          return;
        }
      }

      setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "pending" } : m));
    } catch {
      setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "pending" } : m));
    }
  };

  const addCustomModule = () => {
    const newMod: AIModuleItem = {
      id: `custom-mod-${Date.now()}`,
      title: `Module ${aiModules.length + 1}: Custom Curriculum Unit`,
      lessons: [
        "Module Introduction & Learning Objectives",
        "Deep Dive Theory & Technical Architecture",
        "Interactive Lab & Code Sandbox Exercise"
      ],
      status: "editing"
    };

    setAiModules(prev => [...prev, newMod]);
    setEditBuffer({
      id: newMod.id,
      title: newMod.title,
      lessons: newMod.lessons.join("\n")
    });
    showToast("Added new custom module. You can edit its title and lessons below.", "info");
  };

  const deleteModule = (id: string) => {
    setAiModules(prev => prev.filter(m => m.id !== id));
    showToast("Module removed.", "info");
  };

  const moveModule = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === aiModules.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...aiModules];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setAiModules(updated);
  };

  // Submit / Publish Course Action
  const handlePublishCourse = async (statusDecision: "PUBLISHED" | "DRAFT" | "PENDING_APPROVAL") => {
    if (!formData.title.trim()) {
      showToast("Please enter a course title before publishing.", "error");
      setCurrentStep(1);
      return;
    }

    setIsPublishing(true);

    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description || "Comprehensive curriculum crafted with Glarus Academy AI Architect.",
        price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
        status: statusDecision === "PUBLISHED" ? "APPROVED" : statusDecision === "DRAFT" ? "PENDING" : "PENDING",
        instructorId: formData.instructorId,
        category: formData.category,
        level: formData.level,
        modules: builderModules.length > 0 ? builderModules.map((bm, idx) => ({
          title: bm.title,
          order: idx + 1,
          lessons: bm.lessons.map((l, lIdx) => ({
            title: l.title,
            type: l.type,
            videoUrl: l.videoUrl || null,
            duration: l.duration || "15m",
            order: lIdx + 1
          }))
        })) : aiModules.map((am, idx) => ({
          title: am.title,
          order: idx + 1,
          lessons: am.lessons.map((lt, lIdx) => ({
            title: lt,
            order: lIdx + 1
          }))
        }))
      };

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(
          statusDecision === "PUBLISHED"
            ? "🚀 Course created and published live on Glarus Academy!"
            : statusDecision === "DRAFT"
            ? "💾 Course saved to drafts successfully."
            : "Course submitted for approval.",
          "success"
        );

        setTimeout(() => {
          router.push("/admin/courses");
        }, 1200);
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to publish course", "error");
      }
    } catch (e: any) {
      console.error(e);
      showToast("Network error occurred while saving course.", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const steps = [
    { num: 1, title: "Course Details", desc: "Basic Info & Metadata", icon: FileText },
    { num: 2, title: "AI Syllabus Copilot", desc: "Modules & Curriculum", icon: Sparkles },
    { num: 3, title: "Content Builder", desc: "Lessons & Media Assets", icon: Video },
    { num: 4, title: "Publish & Governance", desc: "Admin Review & Live Push", icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-background text-text selection:bg-purple-500/30 pb-20">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 text-sm font-bold ${
            toastMessage.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10"
              : toastMessage.type === "error"
              ? "bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-rose-500/10"
              : "bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-purple-500/10"
          }`}>
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-purple-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER & BREADCRUMB */}
      <div className="border-b border-white/10 bg-card/60 backdrop-blur-xl sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/courses"
              className="p-2 rounded-xl bg-background/80 hover:bg-white/10 text-subtext hover:text-text border border-white/10 transition-colors"
              title="Back to Courses"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtext">
                <Link href="/admin" className="hover:text-purple-400">Admin</Link>
                <span>/</span>
                <Link href="/admin/courses" className="hover:text-purple-400">Courses</Link>
                <span>/</span>
                <span className="text-purple-400">Create Course</span>
              </div>
              <h1 className="text-xl font-extrabold text-text flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Admin Course Architect</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI-Powered
                </span>
              </h1>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handlePublishCourse("DRAFT")}
              disabled={isPublishing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-subtext hover:text-text bg-card hover:bg-white/5 border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handlePublishCourse("PUBLISHED")}
              disabled={isPublishing || !formData.title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>Publish Live</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT STEPPER COLUMN (4 cols) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-card/70 border border-white/10 rounded-3xl p-6 shadow-xl sticky top-24 backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-subtext mb-4">Workflow Steps</p>
              
              <div className="space-y-4 relative">
                {/* Connecting Line */}
                <div className="absolute left-[19px] top-4 bottom-8 w-0.5 bg-white/10" />

                {steps.map((step) => {
                  const isActive = currentStep === step.num;
                  const isCompleted = step.num < currentStep;

                  return (
                    <button
                      key={step.num}
                      onClick={() => {
                        if (step.num === 3 && builderModules.length === 0) {
                          syncToBuilderModules();
                        }
                        setCurrentStep(step.num);
                      }}
                      className={`flex items-start gap-3.5 w-full text-left transition-all relative z-10 group ${
                        isActive ? "opacity-100" : isCompleted ? "opacity-80" : "opacity-45"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all shadow-md ${
                        isActive
                          ? "border-purple-500 bg-purple-500/20 text-purple-300 scale-105 ring-4 ring-purple-500/20 shadow-purple-500/20"
                          : isCompleted
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                          : "border-white/10 bg-background text-subtext group-hover:border-white/20"
                      }`}>
                        {isCompleted ? (
                          <Check className="w-5 h-5 font-bold" />
                        ) : (
                          <step.icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                        )}
                      </div>

                      <div className="pt-1 min-w-0">
                        <span className={`text-[10px] font-black uppercase tracking-widest block ${
                          isActive ? "text-purple-400" : isCompleted ? "text-emerald-400" : "text-subtext"
                        }`}>
                          Step {step.num}
                        </span>
                        <h4 className={`text-xs font-bold truncate ${isActive ? "text-text" : "text-subtext group-hover:text-text"}`}>
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-subtext/70 truncate">{step.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Admin Pro-Tip Card */}
              <div className="mt-8 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-xs text-purple-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin Superpower</span>
                </div>
                <p className="text-[11px] text-purple-200/80 leading-relaxed">
                  As an Administrator, publishing a course instantly deploys it to student dashboards without review bottlenecks.
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT COLUMN (9 cols) */}
          <main className="lg:col-span-9 space-y-6">

            {/* ══════════════════════════════════════════
               STEP 1: COURSE DETAILS & ADMIN CONTROLS
               ══════════════════════════════════════════ */}
            {currentStep === 1 && (
              <div className="bg-card/70 border border-white/10 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Step 1 of 4</span>
                  <h2 className="text-2xl font-black text-text mt-1">Course Identity & Governance</h2>
                  <p className="text-xs text-subtext">Configure catalog metadata, pricing tier, instructor attribution, and delivery mode.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Course Title */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-text">
                      Course Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => {
                        setFormData({ ...formData, title: e.target.value });
                        if (!aiTopic) setAiTopic(e.target.value);
                      }}
                      placeholder="e.g. Master Autonomous Multi-Agent AI & LangGraph"
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-text placeholder:text-subtext/50 outline-none transition-all focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-text">Subtitle / Headline</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="e.g. Build production-ready multi-agent workflows, stateful graphs, and evaluation loops."
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs font-medium text-text placeholder:text-subtext/50 outline-none transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs font-bold text-text outline-none"
                    >
                      <option value="Artificial Intelligence">Artificial Intelligence & LLMs</option>
                      <option value="Web Development">Full-Stack Web Development</option>
                      <option value="Cloud & DevOps">Cloud Infrastructure & DevOps</option>
                      <option value="Data Science & ML">Data Science & Machine Learning</option>
                      <option value="Cyber Security">Cyber Security & Ethical Hacking</option>
                      <option value="Mobile Development">Mobile App Development</option>
                    </select>
                  </div>

                  {/* Skill Level */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text">Skill Level</label>
                    <select
                      value={formData.level}
                      onChange={e => setFormData({ ...formData, level: e.target.value })}
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs font-bold text-text outline-none"
                    >
                      <option value="All Levels">All Levels (Zero to Hero)</option>
                      <option value="Beginner">Beginner Friendly</option>
                      <option value="Intermediate">Intermediate Practitioner</option>
                      <option value="Advanced">Advanced / Enterprise</option>
                    </select>
                  </div>

                  {/* Pricing (INR ₹) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text">Price (₹ INR)</label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        disabled={formData.isFree}
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        placeholder="2499"
                        className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-text outline-none disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Instructor Assignment (Admin Feature) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text">Assigned Instructor Attribution</label>
                    <select
                      value={formData.instructorId}
                      onChange={e => {
                        const sel = INSTRUCTOR_OPTIONS.find(i => i.id === e.target.value);
                        setFormData({
                          ...formData,
                          instructorId: e.target.value,
                          instructorName: sel ? sel.name : "Glarus Academy Admin"
                        });
                      }}
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs font-bold text-text outline-none"
                    >
                      {INSTRUCTOR_OPTIONS.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name} ({inst.title})</option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery Format */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-text">Delivery Format</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Option 1: Self-Paced Course */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, courseType: "SELF_PACED" })}
                        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          formData.courseType === "SELF_PACED"
                            ? "bg-purple-500/15 border-purple-500 text-purple-300 ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/10"
                            : "bg-background/50 border-white/10 text-subtext hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-text">Self-Paced Course</span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Active
                          </span>
                        </div>
                        <span className="text-[11px] text-subtext block mt-1 leading-relaxed">
                          On-demand recorded video lessons, assignments, modular quizzes & sandbox coding.
                        </span>
                      </button>

                      {/* Option 2: Live Classes */}
                      <button
                        type="button"
                        onClick={() => router.push("/admin/live-training/create")}
                        className="p-4 rounded-2xl border border-white/10 bg-background/50 hover:bg-card hover:border-emerald-500/50 text-left transition-all group relative overflow-hidden shadow-sm hover:shadow-emerald-500/10 hover:scale-[1.01]"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                              <Radio className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-text group-hover:text-emerald-300 transition-colors">
                              Live Classes
                            </span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Creator ↗
                          </span>
                        </div>
                        <span className="text-[11px] text-subtext block mt-1 leading-relaxed group-hover:text-subtext/90">
                          Synchronous live cohort batches, scheduled live workshops, meeting rooms & AI agenda architect.
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Course Description */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-text">Course Description & Curriculum Vision</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detail what students will achieve, key takeaways, and project deliverables..."
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl p-4 text-xs text-text font-medium outline-none leading-relaxed"
                    />
                  </div>

                  {/* Learning Outcomes Manager */}
                  <div className="md:col-span-2 space-y-2.5">
                    <label className="block text-xs font-bold text-text">What Learners Will Build & Master</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOutcome}
                        onChange={e => setNewOutcome(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addOutcome()}
                        placeholder="e.g. Build end-to-end self-correcting RAG pipelines..."
                        className="flex-1 bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-2.5 text-xs text-text outline-none"
                      />
                      <button
                        type="button"
                        onClick={addOutcome}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.outcomes.map((out, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-background/80 border border-white/10 text-xs text-text/90 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{out}</span>
                          <button onClick={() => removeOutcome(idx)} className="text-subtext hover:text-rose-400">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 💼 Internship Availability & Career Placement Section */}
                  <div className="md:col-span-2 p-5 rounded-3xl bg-gradient-to-br from-card via-card/90 to-purple-950/20 border border-white/10 space-y-4 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-text">Industry Internship Program</h3>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                              Career Perk
                            </span>
                          </div>
                          <p className="text-[11px] text-subtext mt-0.5">
                            Offer direct industry project internship or research placement upon course completion.
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
                            className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-text outline-none"
                          >
                            <option value="Guaranteed Internship (Post-Completion)">Guaranteed Internship (Post-Completion)</option>
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
                            className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-text outline-none"
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
                            placeholder="e.g. Paid (₹15,000/mo) or Certificate + Verified LOR"
                            className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-3.5 py-2.5 text-xs text-text outline-none"
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
                            className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-3.5 py-2.5 text-xs text-text outline-none"
                          />
                        </div>

                        {/* Internship Scope & Eligibility */}
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-xs font-bold text-text">Internship Scope & Eligibility Criteria</label>
                          <textarea
                            rows={2}
                            value={formData.internshipDescription}
                            onChange={(e) => setFormData({ ...formData, internshipDescription: e.target.value })}
                            placeholder="Detail requirements for students to qualify (e.g. 75%+ project score, capstone review, etc.)..."
                            className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl p-3 text-xs text-text outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-end pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (!formData.title.trim()) {
                        showToast("Please enter a course title.", "error");
                        return;
                      }
                      if (!aiTopic) setAiTopic(formData.title);
                      setCurrentStep(2);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-purple-500/25 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span>Proceed to AI Syllabus Copilot</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
               STEP 2: AI SYLLABUS ARCHITECTURE COPILOT
               ══════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* AI Copilot Prompt Bar */}
                <div className="bg-card/80 border-2 border-purple-500/30 rounded-3xl p-3 pl-6 flex flex-col md:flex-row items-center gap-3 focus-within:border-purple-500 focus-within:shadow-[0_0_35px_-5px_rgba(168,85,247,0.3)] transition-all shadow-xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 w-full">
                    <Sparkles className="w-6 h-6 text-purple-400 shrink-0 animate-pulse" />
                    <input
                      value={aiTopic}
                      onChange={e => setAiTopic(e.target.value)}
                      placeholder="Describe what to architect... e.g. Advanced AI Agents, LangGraph & Autonomous Workflows"
                      className="w-full bg-transparent outline-none text-text text-sm md:text-base font-semibold placeholder:text-subtext/50"
                      onKeyDown={e => e.key === "Enter" && generateSyllabus()}
                    />
                  </div>
                  <button
                    onClick={() => generateSyllabus()}
                    disabled={isGeneratingAll || (!aiTopic && !formData.title)}
                    className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white px-7 py-3 rounded-2xl font-black text-xs md:text-sm transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    {isGeneratingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Generate AI Syllabus</span>
                  </button>
                </div>

                {/* Prompt Suggestion Chips */}
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                  <span className="text-[10px] font-black uppercase text-subtext/70 shrink-0">Quick Prompts:</span>
                  {PROMPT_SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiTopic(sug);
                        generateSyllabus(sug);
                      }}
                      className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/5 hover:bg-purple-500/20 text-subtext hover:text-purple-300 border border-white/10 hover:border-purple-500/30 whitespace-nowrap transition-all"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Modules Overview Bar */}
                <div className="flex items-center justify-between px-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-subtext">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>{aiModules.length} Modules in Syllabus Draft</span>
                    <span className="text-emerald-400">
                      ({aiModules.filter(m => m.status === "accepted").length} Accepted)
                    </span>
                  </div>

                  <button
                    onClick={addCustomModule}
                    className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Module</span>
                  </button>
                </div>

                {/* MODULE CARDS LIST */}
                <div className="space-y-4">
                  {aiModules.map((mod, modIdx) => (
                    <div
                      key={mod.id}
                      className={`rounded-3xl border-2 transition-all p-6 relative overflow-hidden bg-card/70 backdrop-blur-xl shadow-xl ${
                        mod.status === "accepted"
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : mod.status === "editing"
                          ? "border-purple-500 ring-4 ring-purple-500/15"
                          : mod.status === "regenerating"
                          ? "border-amber-500/50 opacity-70"
                          : "border-white/10 hover:border-purple-500/30"
                      }`}
                    >
                      {/* Regenerating Overlay */}
                      {mod.status === "regenerating" && (
                        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-20">
                          <div className="flex flex-col items-center text-amber-400">
                            <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                            <span className="font-bold text-xs">AI Architecting Module...</span>
                          </div>
                        </div>
                      )}

                      {/* EDIT MODE UI */}
                      {mod.status === "editing" ? (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <span className="text-xs font-black uppercase text-purple-400 tracking-widest flex items-center gap-2">
                              <Edit3 className="w-4 h-4" /> Edit Module #{modIdx + 1}
                            </span>

                            {/* ✨ AI Auto-Generate Lessons Button */}
                            <button
                              type="button"
                              onClick={aiAutoGenerateLessons}
                              disabled={aiGeneratingLessons}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                              title="Auto-generate detailed lessons with AI"
                            >
                              {aiGeneratingLessons ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                              )}
                              <span>✨ AI Auto-Draft Lessons</span>
                            </button>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-subtext mb-1">Module Title</label>
                            <input
                              value={editBuffer.title}
                              onChange={e => setEditBuffer({ ...editBuffer, title: e.target.value })}
                              className="w-full text-base font-bold bg-background border border-white/10 rounded-xl px-4 py-2.5 text-text outline-none focus:border-purple-500"
                              placeholder="Module Title..."
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-subtext mb-1">
                              Lessons Breakdown (One per line)
                            </label>
                            <textarea
                              value={editBuffer.lessons}
                              onChange={e => setEditBuffer({ ...editBuffer, lessons: e.target.value })}
                              rows={4}
                              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-text text-xs outline-none font-mono focus:border-purple-500 leading-relaxed"
                              placeholder="Introduction to Topic&#10;Architecture Deep Dive&#10;Hands-on Implementation"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                            <button
                              onClick={() => setAiModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: "pending" } : m))}
                              className="px-5 py-2 rounded-xl text-xs font-bold text-subtext hover:bg-white/5"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEditingModule(mod.id)}
                              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
                            >
                              <Save className="w-3.5 h-3.5" /> Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* DISPLAY MODE UI */
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {mod.status === "accepted" ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              ) : (
                                <Layout className="w-5 h-5 text-purple-400/80 shrink-0" />
                              )}
                              <h3 className="text-base md:text-lg font-bold text-text">{mod.title}</h3>
                            </div>

                            <div className="pl-8 space-y-2">
                              {mod.lessons.map((lesson, lIdx) => (
                                <div key={lIdx} className="flex items-start gap-2.5 group/lesson">
                                  <PlayCircle className="w-3.5 h-3.5 text-subtext/40 mt-0.5 group-hover/lesson:text-purple-400 transition-colors" />
                                  <span className="text-xs font-medium text-text/85 leading-snug">{lesson}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons Column */}
                          <div className="md:w-32 flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-5 justify-center">
                            <button
                              onClick={() => setAiModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: "accepted" } : m))}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                mod.status === "accepted"
                                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                                  : "bg-background hover:bg-emerald-500/10 text-subtext hover:text-emerald-400 border-white/10 hover:border-emerald-500/30"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" /> Accept
                            </button>

                            <button
                              onClick={() => startEditingModule(mod)}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-background border border-white/10 hover:bg-purple-500/10 text-subtext hover:text-purple-300 hover:border-purple-500/30 transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>

                            <button
                              onClick={() => regenerateSingleModule(mod.id, mod.title)}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-background border border-white/10 hover:bg-amber-500/10 text-subtext hover:text-amber-400 hover:border-amber-500/30 transition-all"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Re-roll
                            </button>

                            <div className="flex gap-1 pt-1">
                              <button
                                onClick={() => moveModule(modIdx, "up")}
                                disabled={modIdx === 0}
                                className="flex-1 py-1 bg-background border border-white/10 rounded-lg text-subtext hover:text-text disabled:opacity-30 flex items-center justify-center"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveModule(modIdx, "down")}
                                disabled={modIdx === aiModules.length - 1}
                                className="flex-1 py-1 bg-background border border-white/10 rounded-lg text-subtext hover:text-text disabled:opacity-30 flex items-center justify-center"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteModule(mod.id)}
                                className="flex-1 py-1 bg-background border border-white/10 hover:bg-rose-500/20 text-subtext hover:text-rose-400 rounded-lg flex items-center justify-center"
                                title="Delete Module"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Add Module Full-Width Bar */}
                <button
                  onClick={addCustomModule}
                  className="w-full py-4 bg-card/40 hover:bg-purple-500/10 text-purple-300 border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-3xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Additional Module to Syllabus</span>
                </button>

                {/* Bottom Approve & Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 rounded-2xl text-xs font-bold text-subtext hover:text-text bg-card border border-white/10"
                  >
                    ← Back to Basic Info
                  </button>

                  <button
                    onClick={() => {
                      syncToBuilderModules();
                      setCurrentStep(3);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-purple-500/25 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span>Approve Syllabus & Build Content</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
               STEP 3: CONTENT & LESSON ASSET BUILDER
               ══════════════════════════════════════════ */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-card/70 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Step 3 of 4</span>
                    <h2 className="text-xl font-black text-text mt-0.5">Lesson Assets & Rich Media</h2>
                    <p className="text-xs text-subtext">Attach video lectures, interactive coding sandboxes, quizzes, and downloadable files.</p>
                  </div>

                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
                  >
                    <span>Proceed to Final Review</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Modules Accordion List */}
                <div className="space-y-4">
                  {builderModules.map((bMod, mIdx) => (
                    <div key={bMod.id} className="bg-card/70 border border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
                      {/* Module Header Bar */}
                      <div
                        onClick={() => setBuilderModules(prev => prev.map(m => m.id === bMod.id ? { ...m, isExpanded: !m.isExpanded } : m))}
                        className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-xs">
                            {mIdx + 1}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-text">{bMod.title}</h4>
                            <span className="text-[10px] font-bold text-subtext uppercase tracking-wider">
                              {bMod.lessons.length} Lessons Configured
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newLesson: LessonContent = {
                                id: `les-${bMod.id}-${Date.now()}`,
                                title: `Lesson ${bMod.lessons.length + 1}: New Topic`,
                                type: "video",
                                duration: "12m 00s"
                              };
                              setBuilderModules(prev => prev.map(m => m.id === bMod.id ? { ...m, lessons: [...m.lessons, newLesson], isExpanded: true } : m));
                              setActiveLessonModal({ moduleId: bMod.id, lesson: newLesson });
                            }}
                            className="px-3 py-1.5 bg-white/5 hover:bg-purple-500/20 text-subtext hover:text-purple-300 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Lesson</span>
                          </button>
                          {bMod.isExpanded ? <ChevronDown className="w-5 h-5 text-subtext" /> : <ChevronRight className="w-5 h-5 text-subtext" />}
                        </div>
                      </div>

                      {/* Expanded Lessons Content */}
                      {bMod.isExpanded && (
                        <div className="p-5 border-t border-white/10 space-y-2.5 bg-background/40">
                          {bMod.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-3.5 bg-card/90 border border-white/5 rounded-2xl flex items-center justify-between gap-4 hover:border-purple-500/30 transition-all group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  lesson.type === "video"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : lesson.type === "article"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : lesson.type === "quiz"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : lesson.type === "sandbox"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/20 text-rose-400"
                                }`}>
                                  {lesson.type === "video" && <Video className="w-4 h-4" />}
                                  {lesson.type === "article" && <FileText className="w-4 h-4" />}
                                  {lesson.type === "quiz" && <HelpCircle className="w-4 h-4" />}
                                  {lesson.type === "sandbox" && <Code className="w-4 h-4" />}
                                  {lesson.type === "resource" && <Download className="w-4 h-4" />}
                                </div>

                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-text block truncate">{lesson.title}</span>
                                  <div className="flex items-center gap-2 text-[10px] text-subtext">
                                    <span className="uppercase font-semibold text-purple-400">{lesson.type}</span>
                                    <span>•</span>
                                    <span>{lesson.duration || "15m"}</span>
                                    {lesson.isPreview && (
                                      <>
                                        <span>•</span>
                                        <span className="text-emerald-400 font-bold">Free Preview</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setActiveLessonModal({ moduleId: bMod.id, lesson })}
                                  className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all"
                                >
                                  Edit Content
                                </button>
                                <button
                                  onClick={() => {
                                    setBuilderModules(prev => prev.map(m => m.id === bMod.id ? { ...m, lessons: m.lessons.filter(l => l.id !== lesson.id) } : m));
                                  }}
                                  className="p-1.5 text-subtext hover:text-rose-400 transition-colors"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 rounded-2xl text-xs font-bold text-subtext hover:text-text bg-card border border-white/10"
                  >
                    ← Back to Syllabus
                  </button>

                  <button
                    onClick={() => setCurrentStep(4)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-purple-500/25 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span>Proceed to Review & Publish</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
               STEP 4: FINAL REVIEW & PLATFORM PUBLISHING
               ══════════════════════════════════════════ */}
            {currentStep === 4 && (
              <div className="bg-card/70 border border-white/10 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Step 4 of 4</span>
                  <h2 className="text-2xl font-black text-text mt-1">Final Review & Platform Launch</h2>
                  <p className="text-xs text-subtext">Review the comprehensive course blueprint before releasing it to Glarus Academy learners.</p>
                </div>

                {/* Summary Card */}
                <div className={`p-6 rounded-3xl border bg-gradient-to-br ${formData.thumbnailGradient} border-purple-500/30 space-y-6 shadow-2xl`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                        {formData.category} • {formData.level}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-2">
                        {formData.title || aiTopic || "Untitled Course"}
                      </h3>
                      {formData.subtitle && (
                        <p className="text-xs text-slate-300 mt-1 font-medium">{formData.subtitle}</p>
                      )}
                      <p className="text-xs text-purple-300 mt-1 font-bold">
                        Instructor: {formData.instructorName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400">
                        {formData.isFree ? "FREE" : `₹${formData.price || "0"}`}
                      </span>
                      {formData.originalPrice && !formData.isFree && (
                        <span className="text-xs text-slate-400 line-through block">₹{formData.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Stat Blocks */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 bg-background/50 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-bold text-subtext uppercase block">Modules</span>
                      <span className="text-lg font-black text-text">
                        {builderModules.length || aiModules.length}
                      </span>
                    </div>

                    <div className="p-3.5 bg-background/50 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-bold text-subtext uppercase block">Total Lessons</span>
                      <span className="text-lg font-black text-text">
                        {builderModules.reduce((acc, m) => acc + m.lessons.length, 0) ||
                          aiModules.reduce((acc, m) => acc + m.lessons.length, 0)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-background/50 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-bold text-subtext uppercase block">Internship</span>
                      <span className={`text-sm font-black truncate ${formData.hasInternship ? "text-emerald-400" : "text-subtext"}`}>
                        {formData.hasInternship ? formData.internshipDuration : "Not Included"}
                      </span>
                    </div>

                    <div className="p-3.5 bg-background/50 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-bold text-subtext uppercase block">Admin Action</span>
                      <span className="text-sm font-black text-purple-400">Instant Deploy</span>
                    </div>
                  </div>

                  {/* Internship Highlight Card in Review */}
                  {formData.hasInternship && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-300 block">{formData.internshipType} ({formData.internshipDuration})</span>
                          <span className="text-[10px] text-emerald-400/80">{formData.internshipStipend} • {formData.internshipCompanyPartner}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        Internship Enabled
                      </span>
                    </div>
                  )}

                  {/* Outcomes checklist */}
                  {formData.outcomes.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-300 uppercase block">Curriculum Outcomes</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formData.outcomes.map((out, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{out}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Platform Toggles */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-text block">Platform Governance Flags</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="p-3.5 bg-background border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all">
                      <div>
                        <span className="text-xs font-bold text-text block">Feature on Homepage</span>
                        <span className="text-[10px] text-subtext">Display in banner carousel</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.featureOnHomepage}
                        onChange={e => setFormData({ ...formData, featureOnHomepage: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                    </label>

                    <label className="p-3.5 bg-background border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all">
                      <div>
                        <span className="text-xs font-bold text-text block">Issue Certificate</span>
                        <span className="text-[10px] text-subtext">Verify with smart badge</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.issueCertificate}
                        onChange={e => setFormData({ ...formData, issueCertificate: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                    </label>

                    <label className="p-3.5 bg-background border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all">
                      <div>
                        <span className="text-xs font-bold text-text block">DRM Video Protection</span>
                        <span className="text-[10px] text-subtext">Encrypted streaming</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.drmProtection}
                        onChange={e => setFormData({ ...formData, drmProtection: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* Bottom Publishing Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold text-subtext hover:text-text bg-card border border-white/10"
                  >
                    ← Back to Content Builder
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handlePublishCourse("DRAFT")}
                      disabled={isPublishing}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold bg-card hover:bg-white/10 text-subtext hover:text-text border border-white/10 transition-colors"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={() => handlePublishCourse("PUBLISHED")}
                      disabled={isPublishing || !formData.title.trim()}
                      className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      <span>Publish Course Live</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ═════════════════════════════════════════════
         LESSON CONTENT MODAL (STEP 3)
         ═════════════════════════════════════════════ */}
      {activeLessonModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-white/10 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Lesson Editor</span>
                <h3 className="text-lg font-black text-text mt-0.5">{activeLessonModal.lesson.title}</h3>
              </div>
              <button
                onClick={() => setActiveLessonModal(null)}
                className="p-2 rounded-xl text-subtext hover:text-text hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ═════════════════════════════════════════════
                AI LESSON ASSISTANT STUDIO BANNER
                ═════════════════════════════════════════════ */}
            <div className="rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-slate-950/60 border border-purple-500/30 p-4 space-y-3 shadow-lg shadow-purple-950/30 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-sm shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white tracking-wide uppercase">AI Lesson Assistant</h4>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {activeLessonModal.lesson.type.toUpperCase()} Copilot
                      </span>
                    </div>
                    <p className="text-[11px] text-subtext mt-0.5">
                      Auto-generate curriculum materials tailored for &quot;{activeLessonModal.lesson.title || "this lesson"}&quot;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateLessonWithAi()}
                  disabled={isGeneratingLessonAi}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  {isGeneratingLessonAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing Content...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Format-Aware Quick Prompt Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-subtext/70 uppercase mr-1">Quick Prompts:</span>

                {activeLessonModal.lesson.type === "quiz" && (
                  <>
                    {[
                      { label: "✨ Comprehensive Quiz Question", prompt: "Generate a concept mastery question testing key principles with 4 distinct choices." },
                      { label: "🎯 Tricky Edge-Case Question", prompt: "Create a challenging, high-order thinking question testing common pitfalls." },
                      { label: "🟢 Beginner Fundamentals", prompt: "Generate a clean, foundational concept question suitable for beginners." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isGeneratingLessonAi}
                        onClick={() => {
                          setAiLessonPrompt(chip.prompt);
                          handleGenerateLessonWithAi(chip.prompt);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-background/80 hover:bg-purple-600/20 text-subtext hover:text-purple-200 border border-white/10 hover:border-purple-500/30 transition-all font-medium"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </>
                )}

                {activeLessonModal.lesson.type === "article" && (
                  <>
                    {[
                      { label: "📝 In-Depth Markdown Article", prompt: "Write an exhaustive, structured markdown article with theory, code snippets, and key takeaways." },
                      { label: "⚡ Step-by-Step Tutorial", prompt: "Create an action-oriented step-by-step tutorial with practical code examples." },
                      { label: "💡 Conceptual Deep Dive", prompt: "Explain the underlying architecture and theoretical foundation clearly." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isGeneratingLessonAi}
                        onClick={() => {
                          setAiLessonPrompt(chip.prompt);
                          handleGenerateLessonWithAi(chip.prompt);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-background/80 hover:bg-purple-600/20 text-subtext hover:text-purple-200 border border-white/10 hover:border-purple-500/30 transition-all font-medium"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </>
                )}

                {activeLessonModal.lesson.type === "sandbox" && (
                  <>
                    {[
                      { label: "💻 Starter Code & TODOs", prompt: "Generate clean starter code with clear TODO tasks and function signature for students to complete." },
                      { label: "🧪 Code Lab with Assertions", prompt: "Generate exercise boilerplate along with sample unit test assertions." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isGeneratingLessonAi}
                        onClick={() => {
                          setAiLessonPrompt(chip.prompt);
                          handleGenerateLessonWithAi(chip.prompt);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-background/80 hover:bg-purple-600/20 text-subtext hover:text-purple-200 border border-white/10 hover:border-purple-500/30 transition-all font-medium"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </>
                )}

                {activeLessonModal.lesson.type === "video" && (
                  <>
                    {[
                      { label: "🎬 Lecture Script & Timeline", prompt: "Generate video talking points outline and estimated duration breakdown." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isGeneratingLessonAi}
                        onClick={() => {
                          setAiLessonPrompt(chip.prompt);
                          handleGenerateLessonWithAi(chip.prompt);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-background/80 hover:bg-purple-600/20 text-subtext hover:text-purple-200 border border-white/10 hover:border-purple-500/30 transition-all font-medium"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </>
                )}

                {activeLessonModal.lesson.type === "resource" && (
                  <>
                    {[
                      { label: "📄 Cheatsheet & Summary Pack", prompt: "Generate a downloadable PDF cheatsheet naming and key reference bullet points." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isGeneratingLessonAi}
                        onClick={() => {
                          setAiLessonPrompt(chip.prompt);
                          handleGenerateLessonWithAi(chip.prompt);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-background/80 hover:bg-purple-600/20 text-subtext hover:text-purple-200 border border-white/10 hover:border-purple-500/30 transition-all font-medium"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Optional Prompt & Difficulty Selector */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={aiLessonPrompt}
                  onChange={e => setAiLessonPrompt(e.target.value)}
                  placeholder={`Optional custom instructions (e.g. "Focus on phonetics", "Write in TypeScript")...`}
                  className="flex-1 bg-background/70 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text placeholder-subtext/60 outline-none focus:border-purple-500"
                />
                <select
                  value={aiLessonDifficulty}
                  onChange={e => setAiLessonDifficulty(e.target.value as any)}
                  className="bg-background/70 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-subtext hover:text-text outline-none focus:border-purple-500 shrink-0 cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Lesson Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text">Lesson Title</label>
              <input
                value={activeLessonModal.lesson.title}
                onChange={e => setActiveLessonModal({
                  ...activeLessonModal,
                  lesson: { ...activeLessonModal.lesson, title: e.target.value }
                })}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-text outline-none focus:border-purple-500"
              />
            </div>

            {/* Lesson Type Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text">Content Format</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: "video", label: "Video", icon: Video },
                  { id: "article", label: "Article", icon: FileText },
                  { id: "quiz", label: "Quiz", icon: HelpCircle },
                  { id: "sandbox", label: "Code Lab", icon: Code },
                  { id: "resource", label: "Resource", icon: Download }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveLessonModal({
                      ...activeLessonModal,
                      lesson: { ...activeLessonModal.lesson, type: tab.id as any }
                    })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      activeLessonModal.lesson.type === tab.id
                        ? "bg-purple-500/20 border-purple-500 text-purple-300"
                        : "bg-background border-white/10 text-subtext hover:text-text"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Specific Fields */}
            {activeLessonModal.lesson.type === "video" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text">Video Stream / Embed URL</label>
                  <input
                    value={activeLessonModal.lesson.videoUrl || ""}
                    onChange={e => setActiveLessonModal({
                      ...activeLessonModal,
                      lesson: { ...activeLessonModal.lesson, videoUrl: e.target.value }
                    })}
                    placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text outline-none font-mono focus:border-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text">Duration</label>
                    <input
                      value={activeLessonModal.lesson.duration || "15m 00s"}
                      onChange={e => setActiveLessonModal({
                        ...activeLessonModal,
                        lesson: { ...activeLessonModal.lesson, duration: e.target.value }
                      })}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-xs text-text outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text">Free Sample Preview?</label>
                    <label className="flex items-center gap-2 py-2 text-xs font-bold text-subtext cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeLessonModal.lesson.isPreview || false}
                        onChange={e => setActiveLessonModal({
                          ...activeLessonModal,
                          lesson: { ...activeLessonModal.lesson, isPreview: e.target.checked }
                        })}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span>Allow Preview without Enrollment</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeLessonModal.lesson.type === "article" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Markdown Article Body</label>
                <textarea
                  rows={8}
                  value={activeLessonModal.lesson.content || ""}
                  onChange={e => setActiveLessonModal({
                    ...activeLessonModal,
                    lesson: { ...activeLessonModal.lesson, content: e.target.value }
                  })}
                  placeholder="### Introduction..."
                  className="w-full bg-background border border-white/10 rounded-xl p-3 text-xs text-text outline-none font-mono leading-relaxed focus:border-purple-500"
                />
              </div>
            )}

            {activeLessonModal.lesson.type === "quiz" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text">Quiz Question</label>
                  <input
                    value={activeLessonModal.lesson.quizQuestion || ""}
                    onChange={e => setActiveLessonModal({
                      ...activeLessonModal,
                      lesson: { ...activeLessonModal.lesson, quizQuestion: e.target.value }
                    })}
                    placeholder="e.g. Which pattern enables multi-agent state persistence?"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text outline-none focus:border-purple-500"
                  />
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-text">Options & Correct Answer</label>
                    <span className="text-[10px] text-subtext font-normal">Click letter icon to mark correct</span>
                  </div>
                  <div className="space-y-2">
                    {(activeLessonModal.lesson.quizOptions && activeLessonModal.lesson.quizOptions.length > 0
                      ? activeLessonModal.lesson.quizOptions
                      : ["Option A", "Option B", "Option C", "Option D"]
                    ).map((opt, idx) => {
                      const isCorrect = (activeLessonModal.lesson.quizCorrectIndex ?? 0) === idx;
                      return (
                        <div key={idx} className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setActiveLessonModal({
                              ...activeLessonModal,
                              lesson: { ...activeLessonModal.lesson, quizCorrectIndex: idx }
                            })}
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-xs font-black transition-all ${
                              isCorrect
                                ? "bg-emerald-500 border-emerald-400 text-black shadow-md shadow-emerald-500/20"
                                : "border-white/20 text-subtext hover:border-purple-400 hover:text-white"
                            }`}
                            title={isCorrect ? "Correct Answer" : "Mark as Correct"}
                          >
                            {isCorrect ? "✓" : String.fromCharCode(65 + idx)}
                          </button>
                          <input
                            value={opt}
                            onChange={e => {
                              const currentOpts = [
                                ...(activeLessonModal.lesson.quizOptions || ["Option A", "Option B", "Option C", "Option D"])
                              ];
                              currentOpts[idx] = e.target.value;
                              setActiveLessonModal({
                                ...activeLessonModal,
                                lesson: { ...activeLessonModal.lesson, quizOptions: currentOpts }
                              });
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            className={`flex-1 bg-background border rounded-xl px-3.5 py-2 text-xs text-text outline-none transition-all ${
                              isCorrect ? "border-emerald-500/50 bg-emerald-950/10" : "border-white/10 focus:border-purple-500"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text">Explanation & Hint</label>
                  <textarea
                    rows={2}
                    value={activeLessonModal.lesson.quizExplanation || ""}
                    onChange={e => setActiveLessonModal({
                      ...activeLessonModal,
                      lesson: { ...activeLessonModal.lesson, quizExplanation: e.target.value }
                    })}
                    placeholder="Pedagogical explanation shown to students after answering..."
                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-xs text-text outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {activeLessonModal.lesson.type === "sandbox" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text">Starter Code</label>
                <textarea
                  rows={8}
                  value={activeLessonModal.lesson.starterCode || "def agent_orchestrator(task):\n    # TODO: Implement LangGraph loop\n    pass"}
                  onChange={e => setActiveLessonModal({
                    ...activeLessonModal,
                    lesson: { ...activeLessonModal.lesson, starterCode: e.target.value }
                  })}
                  className="w-full bg-background border border-white/10 rounded-xl p-3 text-xs text-text outline-none font-mono focus:border-purple-500"
                />
              </div>
            )}

            {activeLessonModal.lesson.type === "resource" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text">Resource Title & File Name</label>
                  <input
                    value={activeLessonModal.lesson.resourceFileName || ""}
                    onChange={e => setActiveLessonModal({
                      ...activeLessonModal,
                      lesson: { ...activeLessonModal.lesson, resourceFileName: e.target.value }
                    })}
                    placeholder="LangGraph-Production-CheatSheet.pdf"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveLessonModal(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-subtext hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setBuilderModules(prev => prev.map(m => {
                    if (m.id === activeLessonModal.moduleId) {
                      return {
                        ...m,
                        lessons: m.lessons.map(l => l.id === activeLessonModal.lesson.id ? activeLessonModal.lesson : l)
                      };
                    }
                    return m;
                  }));
                  setActiveLessonModal(null);
                  showToast("Lesson asset saved!", "success");
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Lesson Content</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
