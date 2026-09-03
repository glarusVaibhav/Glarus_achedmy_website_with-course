"use client";

import { useEffect, useState } from "react";
import {
  Users, FileText, CheckCircle, BarChart3, Plus, X, Loader2,
  Tv, Layers, ClipboardList, LineChart, Sparkles,
  Video, Code, HelpCircle, GripVertical, ChevronDown, ChevronRight,
  AlertTriangle, UserX, ArrowRight, BookOpen, Settings, PieChart,
  Activity, Bell, Edit3, RefreshCw, Check, Save, PlayCircle, Layout,
  CheckCircle2, IndianRupee, TrendingUp, Eye, Trash2, Clock, Calendar,
  Image as ImageIcon, UploadCloud, Paperclip, ShieldCheck, CheckSquare,
  ArrowUpRight, PlusCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InstructorVerificationForm from "@/components/instructor/InstructorVerificationForm";
import InstructorVerificationStatus from "@/components/instructor/InstructorVerificationStatus";
import { InstructorTasksView } from "@/components/instructor/InstructorTasksView";
import { InstructorAssignmentsView } from "@/components/instructor/InstructorAssignmentsView";
import { InstructorNotificationsView } from "@/components/instructor/InstructorNotificationsView";
import { InstructorAdminInboxView } from "@/components/instructor/InstructorAdminInboxView";
import { InstructorLiveSessionsView } from "@/components/instructor/InstructorLiveSessionsView";
import { InstructorStudentsView } from "@/components/instructor/InstructorStudentsView";
import { useAuth } from "@/context/AuthContext";
import { InstructorLiveDashboard } from "@/components/instructor/InstructorLiveDashboard";
import { InstructorSelfPacedCoursesView } from "@/components/instructor/InstructorSelfPacedCoursesView";

/* ═══════════════════════════════════════════════
   TYPE DEFINITIONS
   ═══════════════════════════════════════════════ */

interface AIModule {
  id: string;
  title: string;
  lessons: string[];
  status: "pending" | "accepted" | "editing" | "regenerating";
}

export interface LessonResourceItem {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface StudioLesson {
  id: string;
  title: string;
  type: "video" | "quiz" | "sandbox" | "resource" | "image" | "text" | "empty" | "multi";
  isExpanded?: boolean;
  videoUrl?: string;
  videoDuration?: string;
  sandboxLang?: string;
  sandboxCode?: string;
  quizQuestions?: any[];
  imageUrl1?: string;
  imageUrl2?: string;
  imageCaption?: string;
  resourceFileUrl?: string;
  fileType?: string;
  resources?: LessonResourceItem[];
  articleContent?: string;
  description?: string;
}

interface StudioModule {
  id: string;
  title: string;
  isExpanded: boolean;
  lessons: StudioLesson[];
}

/* ═══════════════════════════════════════════════
   TOAST COMPONENT
   ═══════════════════════════════════════════════ */

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [message, onClose]);
  return (
    <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5 ${type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function InstructorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const isDemoUser = user?.email === "abc@gmail.com";
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  /* ── Shared State ── */
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCourses: 0, approvedCourses: 0, pendingCourses: 0, totalStudents: 0, totalRevenue: 0 });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [studentsFilter, setStudentsFilter] = useState<{
    courseId?: string;
    courseTitle?: string;
    classId?: string;
    className?: string;
    batch?: string;
    searchQuery?: string;
    returnTab?: string;
  } | null>(null);

  const [assignmentsFilter, setAssignmentsFilter] = useState<{
    courseId?: string;
    courseTitle?: string;
    studentEmail?: string;
    studentName?: string;
    assignmentId?: string;
    assignmentTitle?: string;
    className?: string;
    batch?: string;
    returnTab?: string;
  } | null>(null);

  const [liveSessionsFilter, setLiveSessionsFilter] = useState<{
    viewMode?: "COMMAND_CENTER" | "CALENDAR" | "RECORDINGS";
    courseFilter?: string;
    courseTitle?: string;
    returnTab?: string;
  } | null>(null);

  const handleNavigateTab = (
    tabName: string,
    filterOptions?: any
  ) => {
    setPreviousTab(filterOptions?.returnTab || activeTab);
    if (tabName === "Students") {
      setStudentsFilter(filterOptions || null);
    } else if (tabName === "Assignments") {
      setAssignmentsFilter(filterOptions || null);
    } else if (tabName === "Live Sessions") {
      setLiveSessionsFilter(filterOptions || null);
    }
    setActiveTab(tabName);
  };

  /* ── Create Course Modal ── */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    price: "",
    category: "Artificial Intelligence",
    level: "All Levels"
  });

  /* ── AI Wizard State ── */
  const [wizardStep, setWizardStep] = useState(1);
  const [aiTopic, setAiTopic] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [aiModules, setAiModules] = useState<AIModule[]>([]);
  const [editBuffer, setEditBuffer] = useState<{ title: string; lessons: string }>({ title: "", lessons: "" });

  /* ── Course Builder State ── */
  const [builderModules, setBuilderModules] = useState<StudioModule[]>([]);

  /* ── Approve AI Syllabus → Populate Course Builder ── */
  const approveSyllabusAndContinue = () => {
    if (aiModules.length === 0) {
      setToast({ message: "Generate a syllabus first before approving.", type: "error" });
      return;
    }

    // Convert AI modules → Course Builder studio modules
    const converted: StudioModule[] = aiModules.map((m, mIdx) => ({
      id: `builder-${Date.now()}-${mIdx}`,
      title: m.title,
      isExpanded: mIdx === 0, // expand only the first module by default
      lessons: m.lessons.map((lessonTitle, lIdx) => ({
        id: `builder-l-${Date.now()}-${mIdx}-${lIdx}`,
        title: lessonTitle,
        type: "empty" as const
      }))
    }));

    setBuilderModules(converted);
    setWizardStep(3);
    setToast({ message: `Syllabus approved! ${converted.length} modules loaded into Step 3 (Content & Media).`, type: "success" });
  };

  /* ── Content Modal State ── */
  const [contentModal, setContentModal] = useState<"video" | "sandbox" | "quiz" | "resource" | "image" | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [sandboxLang, setSandboxLang] = useState("python");
  const [sandboxTitle, setSandboxTitle] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  /* ── Resource Modal State ── */
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState("PDF Document");
  const [resourceFileUrl, setResourceFileUrl] = useState("");

  /* ── Image / Diagram Modal State ── */
  const [imageTitle, setImageTitle] = useState("");
  const [imageUrl1, setImageUrl1] = useState("");
  const [imageUrl2, setImageUrl2] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  /* ── Direct Lesson Editor Modal State ── */
  const [editingLesson, setEditingLesson] = useState<{
    moduleId: string;
    lesson: StudioLesson;
    tab: "general" | "video" | "sandbox" | "quiz" | "resource" | "image" | "article";
  } | null>(null);

  const [newResourceItem, setNewResourceItem] = useState<{ title: string; url: string; type: string }>({
    title: "",
    url: "",
    type: "PDF Document"
  });

  const [articlePreviewMode, setArticlePreviewMode] = useState(false);
  const [articleAiGenerating, setArticleAiGenerating] = useState(false);
  const [articleImagePanelOpen, setArticleImagePanelOpen] = useState(false);
  const [articleImageUrl, setArticleImageUrl] = useState("");
  const [articleImageCaption, setArticleImageCaption] = useState("");
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  const handleFileUpload = async (
    file: File,
    category: "image" | "video" | "resource" | "article" | "photo"
  ): Promise<string | null> => {
    setUploadingTarget(category);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setToast({ message: `Uploaded ${file.name}!`, type: "success" });
      return data.url;
    } catch (err: any) {
      setToast({ message: err.message || "Failed to upload file", type: "error" });
      return null;
    } finally {
      setUploadingTarget(null);
    }
  };

  const generateAiArticleForLesson = async () => {
    if (!editingLesson) return;
    setArticleAiGenerating(true);
    try {
      const topic = editingLesson.lesson.title || "Lesson";
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `Comprehensive in-depth technical explanation, code examples, and study guide for: ${topic}` })
      });
      if (res.ok) {
        const articleDraft = `# ${topic}\n\n## 1. Introduction & Overview\nIn this lesson, we will cover the core principles of **${topic}**. Understanding these concepts provides the essential foundation needed for building robust real-world applications.\n\n## 2. Core Concepts & Architecture\n- **Fundamental Concept**: Detailed explanation of how this operates.\n- **Design Best Practices**: Why this pattern is preferred in modern systems.\n- **Performance Considerations**: Key metrics to watch when deploying.\n\n## 3. Practical Implementation & Code Example\n\`\`\`javascript\n// Practical example for ${topic}\nfunction runDemo() {\n    console.log("Executing ${topic} demonstration...");\n    return { success: true, timestamp: Date.now() };\n}\nrunDemo();\n\`\`\`\n\n## 4. Common Pitfalls & How to Avoid Them\n> **Tip**: Avoid common misconceptions and ensure proper error handling and edge-case validation.\n\n## 5. Key Summary Takeaways\n- Mastered the core definition of **${topic}**.\n- Learned the architectural tradeoffs and practical implementation details.\n- Ready to proceed to the next interactive exercise!`;

        setEditingLesson(prev => prev ? {
          ...prev,
          lesson: {
            ...prev.lesson,
            articleContent: articleDraft
          }
        } : null);
        setToast({ message: `AI generated complete study article for "${topic}"!`, type: "success" });
      } else {
        setToast({ message: "Failed to generate AI article", type: "error" });
      }
    } catch {
      setToast({ message: "Network error generating article", type: "error" });
    } finally {
      setArticleAiGenerating(false);
    }
  };

  const openLessonEditor = (
    moduleId: string,
    lesson: StudioLesson,
    tab: "general" | "video" | "sandbox" | "quiz" | "resource" | "image" | "article" = "general"
  ) => {
    const initialResources = [...(lesson.resources || [])];
    if (lesson.resourceFileUrl && !initialResources.some(r => r.url === lesson.resourceFileUrl)) {
      initialResources.unshift({
        id: `res-legacy-${Date.now()}`,
        title: lesson.fileType ? `${lesson.fileType} Resource` : "Attached Download",
        url: lesson.resourceFileUrl,
        type: lesson.fileType || "PDF Document"
      });
    }
    setEditingLesson({
      moduleId,
      lesson: {
        ...lesson,
        resources: initialResources
      },
      tab
    });
    setNewResourceItem({ title: "", url: "", type: "PDF Document" });
  };

  const saveLessonDetails = () => {
    if (!editingLesson) return;
    const { moduleId, lesson } = editingLesson;
    const updatedLesson = { ...lesson };

    // Compute attached items count & set type
    let count = 0;
    if (updatedLesson.videoUrl?.trim()) count++;
    if (updatedLesson.sandboxCode?.trim() || updatedLesson.sandboxLang) count++;
    if (updatedLesson.quizQuestions && updatedLesson.quizQuestions.length > 0) count++;
    if ((updatedLesson.resources && updatedLesson.resources.length > 0) || updatedLesson.resourceFileUrl) count++;
    if (updatedLesson.imageUrl1?.trim() || updatedLesson.imageUrl2?.trim()) count++;
    if (updatedLesson.articleContent?.trim()) count++;

    if (count > 1) {
      updatedLesson.type = "multi";
    } else if (count === 1) {
      if (updatedLesson.videoUrl?.trim()) updatedLesson.type = "video";
      else if (updatedLesson.sandboxCode?.trim()) updatedLesson.type = "sandbox";
      else if (updatedLesson.quizQuestions && updatedLesson.quizQuestions.length > 0) updatedLesson.type = "quiz";
      else if (updatedLesson.resources && updatedLesson.resources.length > 0) updatedLesson.type = "resource";
      else if (updatedLesson.imageUrl1?.trim()) updatedLesson.type = "image";
      else if (updatedLesson.articleContent?.trim()) updatedLesson.type = "text";
    } else {
      updatedLesson.type = "empty";
    }

    setBuilderModules(prev => prev.map(m => m.id === moduleId ? {
      ...m,
      lessons: m.lessons.map(l => l.id === lesson.id ? updatedLesson : l)
    } : m));
    setEditingLesson(null);
    setToast({ message: `Saved learning materials for "${lesson.title}" (${count} material${count !== 1 ? "s" : ""} attached)!`, type: "success" });
  };

  /* ── Quiz State ── */
  interface QuizQ {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    hint?: string;
    difficulty?: string;
    points?: number;
  }
  const [quizTopic, setQuizTopic] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQ[]>([]);
  const [quizGenerating, setQuizGenerating] = useState(false);
  const [quizPreview, setQuizPreview] = useState(false);
  const [quizCurrentQ, setQuizCurrentQ] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizApproved, setQuizApproved] = useState(false);

  const addVideoLesson = () => {
    if (!activeModuleId || !videoTitle.trim()) return;
    setBuilderModules(prev => prev.map(m => m.id === activeModuleId ? { ...m, lessons: [...m.lessons, { id: `vid-${Date.now()}`, title: videoTitle, type: "video" as const, videoUrl: videoUrl || "" }] } : m));
    setVideoUrl(""); setVideoTitle(""); setContentModal(null);
    setToast({ message: "Video lesson added!", type: "success" });
  };

  const addSandboxLesson = () => {
    if (!activeModuleId || !sandboxTitle.trim()) return;
    setBuilderModules(prev => prev.map(m => m.id === activeModuleId ? { ...m, lessons: [...m.lessons, { id: `sb-${Date.now()}`, title: sandboxTitle, type: "sandbox" as const, sandboxLang: sandboxLang, sandboxCode: `# Starter ${sandboxLang} code\ndef main():\n    print("Hello World")\n\nmain()` }] } : m));
    setSandboxTitle(""); setSandboxLang("python"); setContentModal(null);
    setToast({ message: "Code sandbox added!", type: "success" });
  };

  const addResourceLesson = () => {
    if (!activeModuleId || !resourceTitle.trim()) return;
    setBuilderModules(prev => prev.map(m => m.id === activeModuleId ? {
      ...m,
      lessons: [...m.lessons, {
        id: `res-${Date.now()}`,
        title: resourceTitle,
        type: "resource" as const,
        resourceFileUrl: resourceFileUrl || "https://example.com/download.pdf",
        fileType: resourceType
      }]
    } : m));
    setResourceTitle(""); setResourceFileUrl(""); setContentModal(null);
    setToast({ message: "Downloadable resource added!", type: "success" });
  };

  const addImageLesson = () => {
    if (!activeModuleId || !imageTitle.trim()) return;
    setBuilderModules(prev => prev.map(m => m.id === activeModuleId ? {
      ...m,
      lessons: [...m.lessons, {
        id: `img-${Date.now()}`,
        title: imageTitle,
        type: "image" as const,
        imageUrl1: imageUrl1 || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        imageUrl2: imageUrl2 || "",
        description: imageCaption
      }]
    } : m));
    setImageTitle(""); setImageUrl1(""); setImageUrl2(""); setImageCaption(""); setContentModal(null);
    setToast({ message: "Lesson image & diagram added!", type: "success" });
  };

  /* ── AI Quiz Generator Redesign Wizard State ── */
  const [quizWizardStep, setQuizWizardStep] = useState<1 | 2 | 3>(1);
  const [quizDifficulty, setQuizDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Mixed">("Medium");
  const [quizNumQuestions, setQuizNumQuestions] = useState<number>(10);
  const [quizQuestionTypes, setQuizQuestionTypes] = useState<string[]>(["Multiple Choice"]);
  const [quizBasedOn, setQuizBasedOn] = useState<"Lesson Title" | "Lesson Description" | "Uploaded Resources" | "Custom Prompt">("Lesson Title");
  const [quizCustomPrompt, setQuizCustomPrompt] = useState<string>("");
  const [isManualBuilder, setIsManualBuilder] = useState<boolean>(false);
  const [quizRegenModalOpen, setQuizRegenModalOpen] = useState<boolean>(false);
  const [quizRegenTweakOptions, setQuizRegenTweakOptions] = useState<string[]>([]);
  const [quizRegenInstructions, setQuizRegenInstructions] = useState<string>("");
  const [quizSaveConfirmModal, setQuizSaveConfirmModal] = useState<boolean>(false);
  const [expandedQuestionCards, setExpandedQuestionCards] = useState<Record<number, boolean>>({});

  /* Loading State Steps */
  const [quizLoadingPhase, setQuizLoadingPhase] = useState<number>(0);
  const quizLoadingSteps = [
    "Reading lesson...",
    "Understanding topic...",
    "Generating questions...",
    "Creating explanations...",
    "Done!"
  ];

  /* Helper to open Quiz Wizard Modal */
  const openQuizWizardModal = (moduleOrLessonTopic?: string) => {
    if (moduleOrLessonTopic) setQuizTopic(moduleOrLessonTopic);
    else if (editingLesson?.lesson?.title) setQuizTopic(editingLesson.lesson.title);

    if (editingLesson?.lesson?.quizQuestions && editingLesson.lesson.quizQuestions.length > 0) {
      setQuizQuestions(editingLesson.lesson.quizQuestions);
      setQuizWizardStep(2);
    } else if (quizQuestions.length > 0) {
      setQuizWizardStep(2);
    } else {
      setQuizWizardStep(1);
    }
    setIsManualBuilder(false);
    setContentModal("quiz");
  };

  /* Step 1: Run AI Quiz Generator */
  const runQuizWizardGenerator = async (customTopicOverride?: string) => {
    const topicToUse = customTopicOverride || quizTopic || editingLesson?.lesson?.title || "General Knowledge";
    setQuizGenerating(true);
    setQuizLoadingPhase(0);

    const t1 = setTimeout(() => setQuizLoadingPhase(1), 600);
    const t2 = setTimeout(() => setQuizLoadingPhase(2), 1200);
    const t3 = setTimeout(() => setQuizLoadingPhase(3), 1800);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicToUse,
          numQuestions: quizNumQuestions,
          difficulty: quizDifficulty,
          questionTypes: quizQuestionTypes,
          generateBasedOn: quizBasedOn,
          customPrompt: quizCustomPrompt,
          additionalInstructions: quizRegenTweakOptions.join(", ") + " " + quizRegenInstructions
        })
      });

      setQuizLoadingPhase(4);

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuizQuestions(data.questions);
          setQuizWizardStep(2); // Step 2: Review & Edit
          setQuizRegenModalOpen(false);
          setToast({ message: `${data.questions.length} quiz questions generated!`, type: "success" });
        } else {
          setToast({ message: "No questions generated", type: "error" });
        }
      } else {
        setToast({ message: "Failed to generate quiz", type: "error" });
      }
    } catch {
      setToast({ message: "Error generating quiz", type: "error" });
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setQuizGenerating(false);
      setQuizLoadingPhase(0);
    }
  };

  /* Single Question Regenerate */
  const regenerateSingleQuestion = async (index: number) => {
    try {
      const targetQ = quizQuestions[index];
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: quizTopic || editingLesson?.lesson?.title || "General Knowledge",
          difficulty: quizDifficulty,
          singleQuestionRegen: true,
          singleQuestionContext: targetQ?.question || ""
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions[0]) {
          setQuizQuestions(prev => prev.map((q, i) => i === index ? data.questions[0] : q));
          setToast({ message: `Regenerated Question ${index + 1}!`, type: "success" });
        }
      }
    } catch {
      setToast({ message: "Failed to regenerate question", type: "error" });
    }
  };

  /* Duplicate Question */
  const duplicateQuestion = (index: number) => {
    const q = quizQuestions[index];
    if (!q) return;
    const dup = { ...q, question: `${q.question} (Copy)` };
    setQuizQuestions(prev => [
      ...prev.slice(0, index + 1),
      dup,
      ...prev.slice(index + 1)
    ]);
    setToast({ message: `Duplicated Question ${index + 1}`, type: "success" });
  };

  /* Delete Question */
  const deleteQuizQuestion = (index: number) => {
    setQuizQuestions(prev => prev.filter((_, i) => i !== index));
    setToast({ message: "Question removed", type: "success" });
  };

  /* Add Question Manually */
  const addBlankQuestionToQuiz = () => {
    const newQ = {
      question: "Enter new question text...",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: "Add explanation text here...",
      hint: "Add hint text here...",
      difficulty: quizDifficulty,
      points: 10
    };
    setQuizQuestions(prev => [...prev, newQ]);
    setExpandedQuestionCards(prev => ({ ...prev, [quizQuestions.length]: true }));
    setToast({ message: "Added blank question for editing!", type: "success" });
  };

  /* Update Question Property */
  const updateQuestionProp = (index: number, prop: string, val: any) => {
    setQuizQuestions(prev => prev.map((q, i) => i === index ? { ...q, [prop]: val } : q));
  };

  /* Update Question Option */
  const updateQuestionOption = (qIdx: number, optIdx: number, val: string) => {
    setQuizQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...(q.options || ["", "", "", ""])];
      opts[optIdx] = val;
      return { ...q, options: opts };
    }));
  };

  /* Save Quiz to Current Context */
  const saveQuizToCurrentContext = () => {
    if (editingLesson) {
      setEditingLesson(prev => prev ? {
        ...prev,
        lesson: {
          ...prev.lesson,
          type: "quiz",
          quizQuestions: [...quizQuestions]
        }
      } : null);
      setToast({ message: `Attached ${quizQuestions.length} Quiz questions to "${editingLesson.lesson.title}"!`, type: "success" });
    } else if (activeModuleId) {
      setBuilderModules(prev => prev.map(m => m.id === activeModuleId ? {
        ...m,
        lessons: [...m.lessons, {
          id: `quiz-${Date.now()}`,
          title: `Quiz: ${quizTopic || "Interactive Quiz"} (${quizQuestions.length} Qs)`,
          type: "quiz" as const,
          quizQuestions: [...quizQuestions]
        }]
      } : m));
      setToast({ message: "Interactive quiz added to module!", type: "success" });
    }
    setQuizSaveConfirmModal(false);
    setContentModal(null);
  };

  /* ── Lesson Editor Quiz & Attachment Helpers ── */
  const [lessonQuizGenerating, setLessonQuizGenerating] = useState(false);
  const [lessonQuizPreview, setLessonQuizPreview] = useState(false);
  const [lessonQuizCurrentQ, setLessonQuizCurrentQ] = useState(0);
  const [lessonQuizSelected, setLessonQuizSelected] = useState<number | null>(null);
  const [lessonQuizAnswered, setLessonQuizAnswered] = useState(false);
  const [lessonQuizScore, setLessonQuizScore] = useState(0);
  const [manualQForm, setManualQForm] = useState({
    question: "", optA: "", optB: "", optC: "", optD: "", correctIndex: 0, explanation: ""
  });

  const generateQuizForLesson = async () => {
    if (!editingLesson) return;
    setLessonQuizGenerating(true);
    try {
      const topic = editingLesson.lesson.title || "Lesson Quiz";
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numQuestions: 5 })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions) {
          setEditingLesson(prev => prev ? {
            ...prev,
            lesson: {
              ...prev.lesson,
              type: "quiz",
              quizQuestions: data.questions
            }
          } : null);
          setToast({ message: `AI generated ${data.questions.length} quiz questions for this lesson!`, type: "success" });
        }
      } else {
        setToast({ message: "Failed to generate quiz", type: "error" });
      }
    } catch {
      setToast({ message: "Error generating quiz", type: "error" });
    } finally {
      setLessonQuizGenerating(false);
    }
  };

  const addManualQToLesson = () => {
    if (!editingLesson || !manualQForm.question.trim() || !manualQForm.optA.trim() || !manualQForm.optB.trim()) return;
    const newQ = {
      question: manualQForm.question,
      options: [manualQForm.optA, manualQForm.optB, manualQForm.optC || "Option C", manualQForm.optD || "Option D"],
      correctIndex: Number(manualQForm.correctIndex),
      explanation: manualQForm.explanation || "Correct answer."
    };
    const existing = editingLesson.lesson.quizQuestions || [];
    setEditingLesson(prev => prev ? {
      ...prev,
      lesson: {
        ...prev.lesson,
        type: "quiz",
        quizQuestions: [...existing, newQ]
      }
    } : null);
    setManualQForm({ question: "", optA: "", optB: "", optC: "", optD: "", correctIndex: 0, explanation: "" });
    setToast({ message: "Question added to lesson quiz!", type: "success" });
  };

  const deleteQFromLesson = (idx: number) => {
    if (!editingLesson) return;
    const existing = editingLesson.lesson.quizQuestions || [];
    const updated = existing.filter((_, i) => i !== idx);
    setEditingLesson(prev => prev ? {
      ...prev,
      lesson: { ...prev.lesson, quizQuestions: updated }
    } : null);
  };

  const deleteLessonFromModule = (moduleId: string, lessonId: string) => {
    setBuilderModules(prev => prev.map(m => m.id === moduleId ? {
      ...m,
      lessons: m.lessons.filter(l => l.id !== lessonId)
    } : m));
    setToast({ message: "Lesson removed", type: "success" });
  };

  const hasLessonContent = (lesson: StudioLesson) => {
    return Boolean(
      lesson.videoUrl ||
      lesson.sandboxLang ||
      (lesson.quizQuestions && lesson.quizQuestions.length > 0) ||
      lesson.resourceFileUrl ||
      lesson.imageUrl1 ||
      lesson.imageUrl2
    );
  };

  const clearContentFromLesson = (moduleId: string, lessonId: string, type: "video" | "sandbox" | "quiz" | "resource" | "image") => {
    setBuilderModules(prev => prev.map(m => m.id === moduleId ? {
      ...m,
      lessons: m.lessons.map(l => {
        if (l.id !== lessonId) return l;
        const updated = { ...l };
        if (type === "video") delete updated.videoUrl;
        if (type === "sandbox") { delete updated.sandboxLang; delete updated.sandboxCode; }
        if (type === "quiz") updated.quizQuestions = [];
        if (type === "resource") { delete updated.resourceFileUrl; delete updated.fileType; }
        if (type === "image") { delete updated.imageUrl1; delete updated.imageUrl2; }
        return updated;
      })
    } : m));
    setToast({ message: "Content item removed from lesson", type: "success" });
  };

  const toggleLessonExpand = (moduleId: string, lessonId: string) => {
    setBuilderModules(prev => prev.map(m => m.id === moduleId ? {
      ...m,
      lessons: m.lessons.map(l => l.id === lessonId ? { ...l, isExpanded: !l.isExpanded } : l)
    } : m));
  };

  const addLessonToModule = (moduleId: string) => {
    const newTitle = prompt("Enter new lesson title:");
    if (!newTitle || !newTitle.trim()) return;
    setBuilderModules(prev => prev.map(m => m.id === moduleId ? {
      ...m,
      lessons: [...m.lessons, {
        id: `builder-l-${Date.now()}`,
        title: newTitle.trim(),
        type: "empty",
        isExpanded: true
      }]
    } : m));
    setToast({ message: "Added new lesson to module", type: "success" });
  };

  const startQuizPreview = () => { setQuizPreview(true); setQuizCurrentQ(0); setQuizSelected(null); setQuizAnswered(false); setQuizScore(0); };

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswered) return;
    setQuizSelected(idx); setQuizAnswered(true);
    if (idx === quizQuestions[quizCurrentQ].correctIndex) setQuizScore(prev => prev + 1);
  };

  const nextQuizQ = () => {
    if (quizCurrentQ < quizQuestions.length - 1) { setQuizCurrentQ(prev => prev + 1); setQuizSelected(null); setQuizAnswered(false); }
    else { setQuizPreview(false); setQuizApproved(true); setQuizWizardStep(2); }
  };

  const handleSubmitCourse = async () => {
    if (builderModules.length === 0) { setToast({ message: "Add at least one module before submitting.", type: "error" }); return; }
    setSubmitLoading(true);
    try {
      const desc = builderModules.map(m => `${m.title}: ${m.lessons.map(l => l.title).join(", ")}`).join(" | ");
      const res = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: aiTopic || `Course - ${new Date().toLocaleDateString()}`, description: desc, price: "4999" }) });
      if (res.ok) { setToast({ message: "Course submitted for admin review! It will appear on the landing page once approved.", type: "success" }); fetchAll(); setActiveTab("Self-Paced Courses"); }
      else { setToast({ message: "Failed to submit course", type: "error" }); }
    } catch { setToast({ message: "Network error", type: "error" }); }
    finally { setSubmitLoading(false); }
  };

  /* ═══════════════════════════════════════════════
     DATA FETCHING
     ═══════════════════════════════════════════════ */

  /* ── Verification State ── */
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [approvalData, setApprovalData] = useState<any>(null);
  const [isEditingVerification, setIsEditingVerification] = useState(false);
  const [verifyingLoading, setVerifyingLoading] = useState(true);

  const fetchVerification = async () => {
    try {
      const res = await fetch("/api/instructor/verification");
      if (res.ok) {
        const data = await res.json();
        setVerificationStatus(data.status || "NOT_SUBMITTED");
        setApprovalData(data.approval || null);
      } else {
        setVerificationStatus("APPROVED");
      }
    } catch {
      setVerificationStatus("APPROVED");
    } finally {
      setVerifyingLoading(false);
    }
  };

  useEffect(() => {
    fetchVerification();
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [coursesRes, statsRes, studentsRes] = await Promise.all([
        fetch("/api/instructor/courses"),
        fetch("/api/instructor/stats"),
        fetch("/api/instructor/students")
      ]);

      if (coursesRes.status === 401 || coursesRes.status === 403) {
        router.push("/login");
        return;
      }

      const [coursesData, statsData, studentsData] = await Promise.all([
        coursesRes.json(),
        statsRes.json(),
        studentsRes.json()
      ]);

      if (coursesData.myCourses) setCourses(coursesData.myCourses);
      if (statsData.totalCourses !== undefined) setStats(statsData);
      if (studentsData.students) setStudents(studentsData.students);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  /* ═══════════════════════════════════════════════
     COURSE CREATION
     ═══════════════════════════════════════════════ */

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.course) {
        setCourses([data.course, ...courses]);
        setIsModalOpen(false);
        setFormData({ title: "", subtitle: "", description: "", price: "", category: "Artificial Intelligence", level: "All Levels" });
        setToast({ message: "Course created & submitted for approval!", type: "success" });
        fetchAll();
      } else {
        setToast({ message: "Failed to create course", type: "error" });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    } finally {
      setCreateLoading(false);
    }
  };

  /* ═══════════════════════════════════════════════
     AI SYLLABUS GENERATION
     ═══════════════════════════════════════════════ */

  const generateSyllabus = async () => {
    if (!aiTopic) return;
    setIsGeneratingAll(true);
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.modules) {
          setAiModules(data.modules.map((m: any, i: number) => ({
            id: `gen-${Date.now()}-${i}`,
            title: m.title,
            lessons: m.lessons || [],
            status: "pending"
          })));
          setToast({ message: "AI syllabus generated successfully!", type: "success" });
        }
      } else {
        setToast({ message: "AI generation failed. Check your GROQ API key.", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to connect to AI service", type: "error" });
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const regenerateModule = async (id: string, moduleTitle: string) => {
    setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "regenerating" } : m));
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `A single detailed module about: ${moduleTitle}` })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.modules?.[0]) {
          const rep = data.modules[0];
          setAiModules(prev => prev.map(m => m.id === id ? { ...m, title: rep.title, lessons: rep.lessons || [], status: "pending" } : m));
          return;
        }
      }
      setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "pending" } : m));
    } catch {
      setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "pending" } : m));
    }
  };

  const startEditing = (mod: AIModule) => {
    setEditBuffer({ title: mod.title, lessons: mod.lessons.join("\n") });
    setAiModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: "editing" } : m));
  };

  const saveEditing = (id: string) => {
    const newLessons = editBuffer.lessons.split("\n").filter(l => l.trim() !== "");
    setAiModules(prev => prev.map(m => m.id === id ? { ...m, title: editBuffer.title, lessons: newLessons, status: "accepted" } : m));
  };

  const addNewCustomModule = () => {
    const newMod: AIModule = {
      id: `custom-module-${Date.now()}`,
      title: `Module ${aiModules.length + 1}: Custom Module Title`,
      lessons: [
        "Overview & Learning Objectives",
        "Core Concepts & Architecture",
        "Hands-on Implementation"
      ],
      status: "editing",
    };
    setAiModules(prev => [...prev, newMod]);
    setEditBuffer({
      title: newMod.title,
      lessons: newMod.lessons.join("\n"),
    });
    setToast({ message: "New custom module added! Edit your title & lessons below.", type: "success" });
  };

  /* ── AI Assistance for Custom Modules ── */
  const [aiGeneratingLessons, setAiGeneratingLessons] = useState(false);
  const [isAiAddModalOpen, setIsAiAddModalOpen] = useState(false);
  const [aiCustomTopic, setAiCustomTopic] = useState("");
  const [aiAddLoading, setAiAddLoading] = useState(false);

  const aiGenerateLessonsForBuffer = async () => {
    if (!editBuffer.title.trim()) {
      setToast({ message: "Please enter a module title first.", type: "error" });
      return;
    }
    setAiGeneratingLessons(true);
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: editBuffer.title }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.modules?.[0]?.lessons) {
          const fetchedLessons = data.modules[0].lessons.join("\n");
          setEditBuffer(prev => ({ ...prev, lessons: fetchedLessons }));
          setToast({ message: `AI generated ${data.modules[0].lessons.length} lessons for "${editBuffer.title}"!`, type: "success" });
        }
      } else {
        setToast({ message: "Failed to generate AI lessons", type: "error" });
      }
    } catch {
      setToast({ message: "AI connection error", type: "error" });
    } finally {
      setAiGeneratingLessons(false);
    }
  };

  const handleAiCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCustomTopic.trim()) return;
    setAiAddLoading(true);
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiCustomTopic }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.modules?.[0]) {
          const m = data.modules[0];
          const newMod: AIModule = {
            id: `custom-ai-mod-${Date.now()}`,
            title: m.title || `Module ${aiModules.length + 1}: ${aiCustomTopic}`,
            lessons: m.lessons || ["Overview & Introduction", "Core Principles", "Hands-on Exercise"],
            status: "accepted",
          };
          setAiModules(prev => [...prev, newMod]);
          setIsAiAddModalOpen(false);
          setAiCustomTopic("");
          setToast({ message: `AI created module "${newMod.title}"!`, type: "success" });
        }
      } else {
        setToast({ message: "AI module creation failed", type: "error" });
      }
    } catch {
      setToast({ message: "AI connection error", type: "error" });
    } finally {
      setAiAddLoading(false);
    }
  };

  const deleteModule = (id: string) => {
    setAiModules(prev => prev.filter(m => m.id !== id));
    setToast({ message: "Module removed", type: "success" });
  };

  /* ═══════════════════════════════════════════════
     SIDEBAR NAV CONFIG
     ═══════════════════════════════════════════════ */

  const sidebarItems = [
    {
      id: "Dashboard",
      icon: Activity,
      badge: null,
      iconColor: "text-sky-400",
      iconBox: "bg-sky-500/10 border-sky-500/20 group-hover:border-sky-500/40 group-hover:bg-sky-500/15",
      activeBg: "bg-gradient-to-r from-sky-600/20 via-sky-500/15 to-blue-600/10 border-sky-500/40 text-white shadow-lg shadow-sky-600/15",
      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    },
    {
      id: "Self-Paced Courses",
      icon: FileText,
      badge: courses.length > 0 ? courses.length : null,
      iconColor: "text-purple-400",
      iconBox: "bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40 group-hover:bg-purple-500/15",
      activeBg: "bg-gradient-to-r from-purple-600/20 via-purple-500/15 to-indigo-600/10 border-purple-500/40 text-white shadow-lg shadow-purple-600/15",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "Live Sessions",
      icon: Tv,
      badge: isDemoUser ? 2 : null,
      iconColor: "text-rose-400",
      iconBox: "bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40 group-hover:bg-rose-500/15",
      activeBg: "bg-gradient-to-r from-rose-600/20 via-rose-500/15 to-pink-600/10 border-rose-500/40 text-white shadow-lg shadow-rose-600/15",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
    {
      id: "Class Recordings",
      icon: PlayCircle,
      badge: isDemoUser ? 9 : null,
      iconColor: "text-emerald-400",
      iconBox: "bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/15",
      activeBg: "bg-gradient-to-r from-emerald-600/20 via-emerald-500/15 to-teal-600/10 border-emerald-500/40 text-white shadow-lg shadow-emerald-600/15",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "Admin Inbox",
      icon: HelpCircle,
      badge: isDemoUser ? 2 : null,
      iconColor: "text-amber-400",
      iconBox: "bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40 group-hover:bg-amber-500/15",
      activeBg: "bg-gradient-to-r from-amber-600/20 via-amber-500/15 to-orange-600/10 border-amber-500/40 text-white shadow-lg shadow-amber-600/15",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
  ];

  const wizardSteps = [
    { num: 1, title: "Basic Info", icon: FileText },
    { num: 2, title: "AI Syllabus Generation", icon: Sparkles },
    { num: 3, title: "Content & Media", icon: Video },
    { num: 4, title: "Final Review", icon: CheckCircle2 }
  ];

  /* ── Verification Gate for New Instructors ── */
  if (verifyingLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (verificationStatus === "NOT_SUBMITTED" || isEditingVerification) {
    return (
      <div className="w-full min-h-screen bg-background text-text p-6 md:p-12 max-w-4xl mx-auto">
        <InstructorVerificationForm
          approvalData={approvalData}
          isEditing={isEditingVerification}
          onSubmitted={() => {
            setIsEditingVerification(false);
            fetchVerification();
          }}
          onCancelEdit={() => setIsEditingVerification(false)}
        />
      </div>
    );
  }

  if (verificationStatus === "PENDING" || verificationStatus === "REJECTED" || verificationStatus === "CHANGES_REQUESTED") {
    return (
      <div className="w-full min-h-screen bg-background text-text p-6 md:p-12 max-w-4xl mx-auto">
        <InstructorVerificationStatus
          status={verificationStatus as any}
          approvalData={approvalData}
          onRefresh={fetchVerification}
          onEdit={() => setIsEditingVerification(true)}
          onStartCreating={() => setVerificationStatus("APPROVED")}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex bg-background text-text font-sans">

      {/* ═══════ LEFT SIDEBAR ═══════ */}
      <aside className="w-72 border-r border-card bg-card/5 sticky top-0 h-screen hidden md:flex flex-col pt-8 pb-6 shrink-0 z-20">
        <div className="px-6 mb-8">
          <h2 className="text-2xl font-black">
            <span className="text-primary">Instructor</span> Studio
          </h2>
          <p className="text-xs text-subtext font-bold tracking-widest uppercase mt-1">Teaching Dashboard</p>
        </div>

        <nav className="flex-1 space-y-2 px-4 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "Live Sessions") {
                    setLiveSessionsFilter({ viewMode: "COMMAND_CENTER" });
                  } else if (item.id === "Class Recordings") {
                    setLiveSessionsFilter({ viewMode: "RECORDINGS" });
                  }
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all font-semibold text-sm group cursor-pointer border ${
                  isActive
                    ? item.activeBg
                    : "text-slate-300 hover:text-white hover:bg-white/[0.04] border-transparent"
                }`}
              >
                {/* Colorful Icon Box */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    item.iconBox
                  } ${isActive ? "scale-105 shadow-sm" : "opacity-90 group-hover:opacity-100 group-hover:scale-105"}`}
                >
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>

                <span className="flex-1 text-left font-medium text-xs sm:text-sm">
                  {item.id}
                </span>

                {/* Colorful Badge */}
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-xs ${
                      isActive
                        ? "bg-white/20 text-white border-white/30"
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ═══════ MAIN CONTENT AREA (Single Clean Scroll) ═══════ */}
      <main className="flex-1 min-w-0">
        <div className="p-4 md:p-6 lg:p-7 max-w-[1550px] mx-auto pb-8">

          {/* ─── Page Header for Core Course Tabs ─── */}
          {["Create Course", "Course Builder", "Analytics"].includes(activeTab) ? (
            <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-semibold text-white tracking-tight">
                  {activeTab === "Create Course" ? "Create Course with AI" : activeTab}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                  {activeTab === "Create Course" && "Generate a complete syllabus with AI in seconds"}
                  {activeTab === "Course Builder" && "Design, build, and organize your curriculum"}
                  {activeTab === "Analytics" && "Deep insights into your teaching performance"}
                </p>
              </div>

              {activeTab === "Create Course" && (
                <button
                  onClick={() => setActiveTab("Self-Paced Courses")}
                  className="flex items-center gap-1.5 bg-card hover:bg-card/80 border border-border text-subtext hover:text-text px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>Back to Self-Paced Courses</span>
                </button>
              )}
            </header>
          ) : null}

          {/* ══════════════════════════════════════
             TAB: DASHBOARD (Live Training Dashboard)
             ══════════════════════════════════════ */}
          {activeTab === "Dashboard" && (
            <InstructorLiveDashboard
              instructorId={user?.id}
              instructorName={user?.name || approvalData?.firstName || "Instructor"}
              isDemoUser={isDemoUser}
              onNavigateTab={handleNavigateTab}
              onOpenCalendar={() => setActiveTab("Live Sessions")}
            />
          )}

          {/* ══════════════════════════════════════
             TAB: TASKS (Admin Workflow Hub)
             ══════════════════════════════════════ */}
          {activeTab === "Tasks" && (
            <InstructorTasksView
              isDemoUser={isDemoUser}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {/* ══════════════════════════════════════
             TAB: ASSIGNMENTS
             ══════════════════════════════════════ */}
          {activeTab === "Assignments" && (
            <InstructorAssignmentsView
              isDemoUser={isDemoUser}
              initialFilter={assignmentsFilter}
              onClearFilter={() => setAssignmentsFilter(null)}
              onBack={() => {
                const targetTab = assignmentsFilter?.returnTab || (previousTab && previousTab !== "Assignments" ? previousTab : "Live Sessions");
                setActiveTab(targetTab);
                setAssignmentsFilter(null);
              }}
            />
          )}

          {/* ══════════════════════════════════════
             TAB: LIVE SESSIONS
             ══════════════════════════════════════ */}
          {activeTab === "Live Sessions" && (
            <InstructorLiveSessionsView
              key="live-sessions-tab-view"
              isDemoUser={isDemoUser}
              initialFilter={
                liveSessionsFilter?.viewMode === "RECORDINGS"
                  ? { viewMode: "COMMAND_CENTER" }
                  : liveSessionsFilter || { viewMode: "COMMAND_CENTER" }
              }
              onClearFilter={() => setLiveSessionsFilter(null)}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {/* ══════════════════════════════════════
             TAB: CLASS RECORDINGS (30-DAY VALIDITY)
             ══════════════════════════════════════ */}
          {activeTab === "Class Recordings" && (
            <InstructorLiveSessionsView
              key="class-recordings-tab-view"
              isDemoUser={isDemoUser}
              initialFilter={{ viewMode: "RECORDINGS" }}
              onClearFilter={() => setLiveSessionsFilter(null)}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {/* ══════════════════════════════════════
             TAB: NOTIFICATIONS
             ══════════════════════════════════════ */}
          {activeTab === "Notifications" && (
            <InstructorNotificationsView />
          )}

          {/* ══════════════════════════════════════
             TAB: ADMIN INBOX
             ══════════════════════════════════════ */}
          {activeTab === "Admin Inbox" && (
            <InstructorAdminInboxView isDemoUser={isDemoUser} />
          )}

          {/* ══════════════════════════════════════
             TAB: SELF-PACED COURSES
             ══════════════════════════════════════ */}
          {activeTab === "Self-Paced Courses" && (
            <InstructorSelfPacedCoursesView
              dbCourses={courses}
              isDemoUser={isDemoUser}
              onCreateCourse={() => {
                setWizardStep(1);
                setActiveTab("Create Course");
              }}
              onOpenCourseBuilder={(courseId) => {
                setActiveTab("Course Builder");
              }}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {/* ══════════════════════════════════════
             TAB: CREATE COURSE
             ══════════════════════════════════════ */}
          {activeTab === "Create Course" && (
            <div className="flex gap-8 animate-in fade-in duration-300">
              {/* Left Stepper */}
              <div className="w-64 shrink-0 hidden lg:block">
                <div className="sticky top-10 space-y-10 relative">
                  <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-card" />
                  {wizardSteps.map((step) => {
                    const isActive = wizardStep === step.num;
                    const isCompleted = step.num < wizardStep;
                    return (
                      <button key={step.num} onClick={() => setWizardStep(step.num)} className={`flex items-start gap-4 transition-all duration-300 w-full text-left ${isActive ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-40"}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 bg-background z-10 shadow-sm ${isActive ? "border-purple-500 text-purple-500 scale-110 shadow-purple-500/20" : isCompleted ? "border-emerald-500 text-emerald-500" : "border-card text-subtext"}`}>
                          {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />}
                        </div>
                        <div className="pt-2">
                          <p className={`text-[10px] font-black tracking-widest uppercase mb-0.5 ${isActive ? "text-purple-500" : "text-subtext"}`}>Step {step.num}</p>
                          <h3 className={`font-bold text-sm ${isActive ? "text-text" : "text-subtext"}`}>{step.title}</h3>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Content */}
              <div className="flex-1 space-y-8 min-w-0">

                {/* STEP 1: BASIC INFO */}
                {wizardStep === 1 && (
                  <div className="bg-card/40 backdrop-blur-xl border border-card/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl animate-in fade-in">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Step 1 of 4</span>
                      <h2 className="text-2xl font-black text-text mt-1">Course Basic Details</h2>
                      <p className="text-xs text-subtext font-medium">Provide essential course information before generating the syllabus outline.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-text">Course Title <span className="text-rose-400">*</span></label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={e => {
                            setFormData({ ...formData, title: e.target.value });
                            if (!aiTopic) setAiTopic(e.target.value);
                          }}
                          placeholder="e.g. Mastering Agentic AI & Autonomous Workflows"
                          className="w-full bg-background border border-card rounded-2xl px-4 py-3 text-sm text-text font-bold focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-text">Subtitle / Tagline</label>
                        <input
                          type="text"
                          value={formData.subtitle}
                          onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                          placeholder="e.g. Build multi-agent orchestration tools with LangGraph, Python & OpenAI"
                          className="w-full bg-background border border-card rounded-2xl px-4 py-2.5 text-xs text-text font-medium focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-text">Category</label>
                        <select
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-background border border-card rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-primary"
                        >
                          <option value="Artificial Intelligence">Artificial Intelligence & LLMs</option>
                          <option value="Full-Stack Development">Full-Stack Development</option>
                          <option value="Cloud & DevOps">Cloud & DevOps</option>
                          <option value="Data Science & ML">Data Science & ML</option>
                          <option value="Cyber Security">Cyber Security</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-text">Level</label>
                        <select
                          value={formData.level}
                          onChange={e => setFormData({ ...formData, level: e.target.value })}
                          className="w-full bg-background border border-card rounded-2xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-primary"
                        >
                          <option value="All Levels">All Levels</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-text">Course Description</label>
                        <textarea
                          rows={4}
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Explain what students will learn, prerequisites, and key takeaways..."
                          className="w-full bg-background border border-card rounded-2xl p-4 text-xs text-text font-medium focus:outline-none focus:border-primary leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-card">
                      <button
                        onClick={() => {
                          if (!formData.title.trim()) {
                            setToast({ message: "Please enter a course title first.", type: "error" });
                            return;
                          }
                          if (!aiTopic) setAiTopic(formData.title);
                          setWizardStep(2);
                        }}
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 flex items-center gap-2 transition-transform active:scale-95"
                      >
                        Continue to AI Syllabus Generator <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: AI SYLLABUS GENERATION */}
                {wizardStep === 2 && (
                  <div className="space-y-6 animate-in fade-in">
                    {/* AI Copilot Bar */}
                    <div className="bg-card/40 border-2 border-purple-500/30 rounded-2xl p-2 pl-5 flex items-center gap-3 focus-within:border-purple-500 focus-within:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] transition-all group">
                      <Sparkles className="w-5 h-5 text-purple-500 shrink-0 group-focus-within:animate-pulse" />
                      <input
                        value={aiTopic}
                        onChange={e => setAiTopic(e.target.value)}
                        placeholder="Describe your course topic... e.g. Building AI Agents with Python"
                        className="w-full bg-transparent outline-none text-text font-medium placeholder:text-subtext/50"
                        onKeyDown={e => e.key === "Enter" && generateSyllabus()}
                      />
                      <button
                        onClick={generateSyllabus}
                        disabled={isGeneratingAll || !aiTopic}
                        className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/40 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 whitespace-nowrap shrink-0 text-sm"
                      >
                        {isGeneratingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Outline"}
                      </button>
                    </div>

                    {/* Module Cards */}
                    {aiModules.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-card rounded-2xl space-y-4">
                        <Sparkles className="w-12 h-12 text-purple-500/20 mx-auto mb-2" />
                        <h3 className="font-bold text-lg text-text mb-1">No syllabus generated yet</h3>
                        <p className="text-sm text-subtext max-w-md mx-auto">Enter a course topic above and click "Generate Outline" to let AI create a complete module breakdown for you.</p>
                        <button
                          onClick={addNewCustomModule}
                          className="px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-extrabold text-xs inline-flex items-center gap-2 transition-all"
                        >
                          <Plus className="w-4 h-4" /> + Add Module
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Header bar with + Add Module */}
                        <div className="flex items-center justify-between pb-1 border-b border-card/60">
                          <span className="text-xs font-bold text-subtext">{aiModules.length} Modules in Syllabus</span>
                          <button
                            onClick={addNewCustomModule}
                            className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all hover:scale-105"
                          >
                            <Plus className="w-4 h-4" /> + Add Module
                          </button>
                        </div>

                        {aiModules.map((module) => (
                          <div key={module.id} className={`rounded-2xl border-2 transition-all p-5 relative overflow-hidden bg-background shadow-sm ${module.status === "accepted" ? "border-emerald-500/30 bg-emerald-500/5" : module.status === "editing" ? "border-primary ring-4 ring-primary/10" : module.status === "regenerating" ? "border-purple-500/50 opacity-70" : "border-card hover:border-purple-500/30"}`}>

                            {module.status === "regenerating" && (
                              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
                                <div className="flex flex-col items-center text-purple-500"><RefreshCw className="w-7 h-7 animate-spin mb-2" /><span className="font-bold text-sm">Regenerating...</span></div>
                              </div>
                            )}

                            {module.status === "editing" ? (
                              <div className="animate-in fade-in duration-200">
                                <div className="mb-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-black uppercase text-primary tracking-widest">Edit Mode</span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={aiGenerateLessonsForBuffer}
                                    disabled={aiGeneratingLessons}
                                    className="px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                                    title="Auto-generate lessons using AI for this module title"
                                  >
                                    {aiGeneratingLessons ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                                    <span>✨ AI Auto-Generate Lessons</span>
                                  </button>
                                </div>

                                <input value={editBuffer.title} onChange={e => setEditBuffer({ ...editBuffer, title: e.target.value })} className="w-full text-lg font-bold bg-card border border-card rounded-xl px-4 py-2.5 mb-3 text-text outline-none focus:border-primary" placeholder="Module Title..." />
                                <textarea value={editBuffer.lessons} onChange={e => setEditBuffer({ ...editBuffer, lessons: e.target.value })} rows={4} className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-text text-sm outline-none font-mono focus:border-primary leading-relaxed mb-3" placeholder="One lesson per line..." />
                                <div className="flex justify-end gap-2 pt-2 border-t border-card">
                                  <button onClick={() => setAiModules(prev => prev.map(m => m.id === module.id ? { ...m, status: "pending" } : m))} className="px-5 py-2 rounded-xl text-sm font-bold text-subtext hover:bg-card">Cancel</button>
                                  <button onClick={() => saveEditing(module.id)} className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20"><Save className="w-4 h-4" /> Save</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col md:flex-row gap-5">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {module.status === "accepted" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Layout className="w-5 h-5 text-purple-500/70" />}
                                    <h3 className="text-lg font-bold text-text">{module.title}</h3>
                                  </div>
                                  <div className="pl-7 space-y-1.5">
                                    {module.lessons.map((lesson, idx) => (
                                      <div key={idx} className="flex items-start gap-2 group/l">
                                        <PlayCircle className="w-3.5 h-3.5 text-subtext/40 mt-0.5 group-hover/l:text-purple-500 transition-colors" />
                                        <span className="text-sm font-medium text-text/85">{lesson}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="md:w-28 flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-card pt-3 md:pt-0 md:pl-5 justify-center">
                                  <button onClick={() => setAiModules(prev => prev.map(m => m.id === module.id ? { ...m, status: "accepted" } : m))} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${module.status === "accepted" ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : "bg-background hover:bg-emerald-500/10 text-subtext hover:text-emerald-500 border-card hover:border-emerald-500/30"}`}><Check className="w-3.5 h-3.5" /> Accept</button>
                                  <button onClick={() => startEditing(module)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-background border border-card hover:bg-primary/10 text-subtext hover:text-primary hover:border-primary/30 transition-all"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                                  <button onClick={() => regenerateModule(module.id, module.title)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-background border border-card hover:bg-amber-500/10 text-subtext hover:text-amber-500 hover:border-amber-500/30 transition-all"><RefreshCw className="w-3.5 h-3.5" /> Re-roll</button>
                                  <button onClick={() => deleteModule(module.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-background border border-card hover:bg-rose-500/10 text-subtext hover:text-rose-400 hover:border-rose-500/30 transition-all" title="Delete Module"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Bottom Add Module Button */}
                        <button
                          onClick={addNewCustomModule}
                          className="w-full py-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-sm group"
                        >
                          <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                          <span>+ Add Module</span>
                        </button>

                        {/* Approve & Continue */}
                        <div className="flex justify-between items-center pt-4">
                          <button
                            onClick={() => setWizardStep(1)}
                            className="px-5 py-3 rounded-2xl text-xs font-bold text-subtext hover:bg-card border border-card"
                          >
                            ← Back to Basic Info
                          </button>

                          <button
                            onClick={approveSyllabusAndContinue}
                            className="bg-text hover:opacity-90 text-background px-8 py-4 rounded-2xl font-black text-base shadow-2xl transition-transform active:scale-95 flex items-center gap-3"
                          >
                            Approve Syllabus & Continue <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: CONTENT & MEDIA */}
                {wizardStep === 3 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-gradient-to-r from-purple-500/10 via-primary/5 to-transparent border border-purple-500/20 rounded-2xl p-5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Step 3 of 4</span>
                        <h3 className="text-lg font-bold text-text mt-0.5">Content & Lesson Assets</h3>
                        <p className="text-xs text-subtext">Add videos, code sandboxes, quizzes, or downloadable files to your lessons.</p>
                      </div>
                      <button
                        onClick={() => setWizardStep(4)}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary/20 flex items-center gap-1.5"
                      >
                        Proceed to Final Review <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Render Builder Modules */}
                    <div className="space-y-4">
                      {builderModules.map((module) => (
                        <div key={module.id} className="bg-card/40 border border-card rounded-2xl overflow-hidden shadow-sm">
                          <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-card/80 transition-colors" onClick={() => setBuilderModules(prev => prev.map(m => m.id === module.id ? { ...m, isExpanded: !m.isExpanded } : m))}>
                            <GripVertical className="w-5 h-5 text-subtext/40 cursor-grab" />
                            <div className="flex-1">
                              <h4 className="font-extrabold text-text">{module.title}</h4>
                              <span className="text-[10px] font-bold text-subtext uppercase tracking-widest">{module.lessons.length} Lessons</span>
                            </div>
                            {module.isExpanded ? <ChevronDown className="w-5 h-5 text-subtext" /> : <ChevronRight className="w-5 h-5 text-subtext" />}
                          </div>

                          {module.isExpanded && (
                            <div className="p-5 border-t border-card/60 space-y-3 bg-background/50">
                              {module.lessons.map((lesson) => {
                                const attachedItems: { type: string; label: string; icon: any; color: string; tab: "general" | "video" | "sandbox" | "quiz" | "resource" | "image" | "article" }[] = [];
                                if (lesson.videoUrl?.trim()) {
                                  attachedItems.push({ type: "video", label: "Video", icon: Video, color: "text-blue-400 bg-blue-500/10 border-blue-500/25", tab: "video" });
                                }
                                if (lesson.sandboxLang || lesson.sandboxCode?.trim()) {
                                  attachedItems.push({ type: "sandbox", label: `Sandbox (${lesson.sandboxLang || "Code"})`, icon: Code, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", tab: "sandbox" });
                                }
                                if (lesson.quizQuestions && lesson.quizQuestions.length > 0) {
                                  attachedItems.push({ type: "quiz", label: `Quiz (${lesson.quizQuestions.length} Qs)`, icon: HelpCircle, color: "text-amber-400 bg-amber-500/10 border-amber-500/25", tab: "quiz" });
                                }
                                const totalRes = (lesson.resources?.length || 0) + (lesson.resourceFileUrl && !lesson.resources?.some(r => r.url === lesson.resourceFileUrl) ? 1 : 0);
                                if (totalRes > 0) {
                                  attachedItems.push({ type: "resource", label: `${totalRes} File${totalRes > 1 ? "s" : ""}`, icon: UploadCloud, color: "text-purple-400 bg-purple-500/10 border-purple-500/25", tab: "resource" });
                                }
                                if (lesson.imageUrl1?.trim() || lesson.imageUrl2?.trim()) {
                                  const imgCount = (lesson.imageUrl1 ? 1 : 0) + (lesson.imageUrl2 ? 1 : 0);
                                  attachedItems.push({ type: "image", label: `${imgCount} Diagram${imgCount > 1 ? "s" : ""}`, icon: ImageIcon, color: "text-rose-400 bg-rose-500/10 border-rose-500/25", tab: "image" });
                                }
                                if (lesson.articleContent?.trim()) {
                                  attachedItems.push({ type: "article", label: "Article / Notes", icon: FileText, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25", tab: "article" });
                                }

                                const hasContent = attachedItems.length > 0;

                                return (
                                  <div key={lesson.id} className="p-4 bg-card/60 hover:bg-card/80 border border-card rounded-2xl transition-all space-y-3 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="flex items-start sm:items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${hasContent ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-card text-subtext/60 border-card"}`}>
                                          {hasContent ? <CheckCircle2 className="w-5 h-5" /> : <PlayCircle className="w-5 h-5 text-purple-400" />}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-text">{lesson.title}</span>
                                            {hasContent ? (
                                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                                                {attachedItems.length} Material{attachedItems.length > 1 ? "s" : ""} Attached
                                              </span>
                                            ) : (
                                              <span className="text-[10px] text-subtext uppercase font-semibold">Empty</span>
                                            )}
                                          </div>
                                          <p className="text-[11px] text-subtext mt-0.5">
                                            {hasContent ? "Contains multiple learning materials. Click any badge or manage button to edit." : "Attach video, sandbox, quiz, downloadable files, or diagrams."}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <button
                                          onClick={() => openLessonEditor(module.id, lesson, "general")}
                                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                            hasContent
                                              ? "bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
                                              : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25"
                                          }`}
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                          <span>{hasContent ? "Manage / Add More" : "Add Content"}</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Attached Content Badges / Quick Add Shortcuts */}
                                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-card/40">
                                      {hasContent ? (
                                        <>
                                          <span className="text-[10px] font-extrabold text-subtext mr-1 uppercase tracking-wider">Materials in topic:</span>
                                          {attachedItems.map((item, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => openLessonEditor(module.id, lesson, item.tab)}
                                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer ${item.color}`}
                                              title={`Click to view & edit ${item.label}`}
                                            >
                                              <item.icon className="w-3 h-3" />
                                              <span>{item.label}</span>
                                              <span className="text-[9px] opacity-70">✎</span>
                                            </button>
                                          ))}
                                          <button
                                            onClick={() => openLessonEditor(module.id, lesson, "general")}
                                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-subtext hover:text-text bg-card hover:bg-card/80 border border-card transition-colors flex items-center gap-1 cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3 text-primary" /> + Add Other Types
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-[10px] font-bold text-subtext mr-1">Quick Attach:</span>
                                          <button onClick={() => openLessonEditor(module.id, lesson, "video")} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 flex items-center gap-1 cursor-pointer">
                                            <Video className="w-3 h-3" /> + Video
                                          </button>
                                          <button onClick={() => openLessonEditor(module.id, lesson, "sandbox")} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1 cursor-pointer">
                                            <Code className="w-3 h-3" /> + Sandbox
                                          </button>
                                          <button onClick={() => openLessonEditor(module.id, lesson, "quiz")} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center gap-1 cursor-pointer">
                                            <HelpCircle className="w-3 h-3" /> + Quiz
                                          </button>
                                          <button onClick={() => openLessonEditor(module.id, lesson, "resource")} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 flex items-center gap-1 cursor-pointer">
                                            <UploadCloud className="w-3 h-3" /> + PDF / Files
                                          </button>
                                          <button onClick={() => openLessonEditor(module.id, lesson, "image")} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1 cursor-pointer">
                                            <ImageIcon className="w-3 h-3" /> + Diagram
                                          </button>
                                          <button onClick={() => openLessonEditor(module.id, lesson, "article")} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 flex items-center gap-1 cursor-pointer">
                                            <FileText className="w-3 h-3" /> + Article / Guide
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}

                      {builderModules.length === 0 && (
                        <div className="p-12 text-center border-2 border-dashed border-card rounded-2xl text-subtext">
                          <p className="font-bold text-sm text-text">No modules loaded yet.</p>
                          <p className="text-xs mt-1">Go back to Step 2 to generate and approve your syllabus first.</p>
                          <button onClick={() => setWizardStep(2)} className="mt-3 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-xs font-bold">
                            ← Go to Step 2
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: FINAL REVIEW & SUBMIT */}
                {wizardStep === 4 && (
                  <div className="bg-card/40 backdrop-blur-xl border border-card/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl animate-in fade-in">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Step 4 of 4</span>
                      <h2 className="text-2xl font-black text-text mt-1">Final Course Review</h2>
                      <p className="text-xs text-subtext font-medium">Review your course details and syllabus breakdown before publishing.</p>
                    </div>

                    <div className="p-6 bg-card border border-card rounded-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-card">
                        <div>
                          <span className="text-[10px] font-black uppercase text-primary tracking-wider">{formData.category || "General"} • {formData.level || "All Levels"}</span>
                          <h3 className="text-xl font-extrabold text-text mt-0.5">{formData.title || aiTopic || "Untitled Course"}</h3>
                          {formData.subtitle && <p className="text-xs text-subtext mt-0.5">{formData.subtitle}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 bg-background/50 rounded-xl border border-card">
                          <span className="text-[10px] font-bold text-subtext uppercase block">Modules</span>
                          <span className="text-lg font-black text-text">{builderModules.length || aiModules.length}</span>
                        </div>
                        <div className="p-3 bg-background/50 rounded-xl border border-card">
                          <span className="text-[10px] font-bold text-subtext uppercase block">Total Lessons</span>
                          <span className="text-lg font-black text-text">
                            {builderModules.reduce((acc, m) => acc + m.lessons.length, 0) || aiModules.reduce((acc, m) => acc + m.lessons.length, 0)}
                          </span>
                        </div>
                        <div className="p-3 bg-background/50 rounded-xl border border-card">
                          <span className="text-[10px] font-bold text-subtext uppercase block">Status</span>
                          <span className="text-lg font-black text-amber-400">Pending Review</span>
                        </div>
                      </div>

                      {formData.description && (
                        <div>
                          <span className="text-[10px] font-bold text-subtext uppercase block mb-1">Description</span>
                          <p className="text-xs text-text/80 leading-relaxed font-medium">{formData.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-card">
                      <button onClick={() => setWizardStep(3)} className="px-5 py-3 rounded-2xl text-xs font-bold text-subtext hover:bg-card border border-card">
                        ← Back to Content & Media
                      </button>
                      <button
                        onClick={handleCreate}
                        disabled={createLoading}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                      >
                        {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "🚀 Submit Course for Approval"}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
             TAB: COURSE BUILDER
             ══════════════════════════════════════ */}
          {activeTab === "Course Builder" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* AI Quick Generate */}
              <div className="bg-gradient-to-r from-purple-500/10 via-primary/5 to-transparent border border-purple-500/20 rounded-2xl p-5 relative overflow-hidden group">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="font-bold text-text">Need a head start?</span>
                  <button onClick={() => setActiveTab("Create Course")} className="text-sm font-bold text-purple-500 hover:underline flex items-center gap-1">Open Create Course <ArrowRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Modules */}
              <div className="space-y-4">
                {builderModules.map((module) => (
                  <div key={module.id} className="bg-card/40 border border-card rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-card/80 transition-colors" onClick={() => setBuilderModules(prev => prev.map(m => m.id === module.id ? { ...m, isExpanded: !m.isExpanded } : m))}>
                      <GripVertical className="w-5 h-5 text-subtext/40 cursor-grab" />
                      <div className="flex-1">
                        <h4 className="font-extrabold text-text">{module.title}</h4>
                        <span className="text-[10px] font-bold text-subtext uppercase tracking-widest">{module.lessons.length} Contents</span>
                      </div>
                      {module.isExpanded ? <ChevronDown className="w-5 h-5 text-subtext" /> : <ChevronRight className="w-5 h-5 text-subtext" />}
                    </div>

                    {module.isExpanded && (
                      <div className="px-5 pb-5 pt-3 space-y-3 bg-card/20 border-t border-card/30">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="rounded-2xl border border-card/60 bg-background/60 overflow-hidden transition-all shadow-sm">
                            {/* COLLAPSED LESSON HEADER ROW (Requirements 1, 2, 7) */}
                            <div
                              className="px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-card/40 transition-colors select-none"
                              onClick={() => toggleLessonExpand(module.id, lesson.id)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <GripVertical className="w-4 h-4 text-subtext/30 cursor-grab shrink-0" onClick={e => e.stopPropagation()} />
                                <div className="p-1.5 rounded-lg shrink-0 bg-card text-subtext">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-text text-sm truncate">{lesson.title}</span>
                              </div>

                              {/* Collapsed actions: ONLY Edit, Delete, Expand Arrow (Requirement 1 & 7) */}
                              <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => openLessonEditor(module.id, lesson, "general")}
                                  className="px-3 py-1.5 bg-card hover:bg-card/80 text-text font-extrabold text-xs rounded-xl transition-all border border-card/80"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteLessonFromModule(module.id, lesson.id)}
                                  className="p-1.5 text-subtext hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleLessonExpand(module.id, lesson.id)}
                                  className="p-1 text-subtext hover:text-text rounded-xl transition-colors ml-1"
                                >
                                  {lesson.isExpanded ? <ChevronDown className="w-5 h-5 text-subtext" /> : <ChevronRight className="w-5 h-5 text-subtext" />}
                                </button>
                              </div>
                            </div>

                            {/* EXPANDED LESSON CONTENT PANEL (Requirements 3, 4, 5, 6, 8, 9) */}
                            {lesson.isExpanded && (
                              <div className="px-5 pb-5 pt-3 border-t border-card/40 bg-card/10 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                {/* 1. LESSON CONTENT UPLOAD CARDS (Requirement 3) */}
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black uppercase text-subtext tracking-widest ml-0.5">Lesson Content</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                    <button
                                      onClick={() => openLessonEditor(module.id, lesson, "video")}
                                      className="flex items-center gap-2 px-3 py-2.5 bg-background border border-card hover:border-blue-500/40 hover:bg-blue-500/10 text-text rounded-xl text-xs font-bold transition-all justify-center shadow-sm group"
                                    >
                                      <div className="p-1 rounded-md bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                                        <Video className="w-3.5 h-3.5" />
                                      </div>
                                      <span>Upload Video</span>
                                    </button>

                                    <button
                                      onClick={() => openLessonEditor(module.id, lesson, "sandbox")}
                                      className="flex items-center gap-2 px-3 py-2.5 bg-background border border-card hover:border-emerald-500/40 hover:bg-emerald-500/10 text-text rounded-xl text-xs font-bold transition-all justify-center shadow-sm group"
                                    >
                                      <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                        <Code className="w-3.5 h-3.5" />
                                      </div>
                                      <span>Code Sandbox</span>
                                    </button>

                                    <button
                                      onClick={() => openLessonEditor(module.id, lesson, "quiz")}
                                      className="flex items-center gap-2 px-3 py-2.5 bg-background border border-card hover:border-amber-500/40 hover:bg-amber-500/10 text-text rounded-xl text-xs font-bold transition-all justify-center shadow-sm group"
                                    >
                                      <div className="p-1 rounded-md bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                                        <HelpCircle className="w-3.5 h-3.5" />
                                      </div>
                                      <span>Interactive Quiz</span>
                                    </button>

                                    <button
                                      onClick={() => openLessonEditor(module.id, lesson, "resource")}
                                      className="flex items-center gap-2 px-3 py-2.5 bg-background border border-card hover:border-purple-500/40 hover:bg-purple-500/10 text-text rounded-xl text-xs font-bold transition-all justify-center shadow-sm group"
                                    >
                                      <div className="p-1 rounded-md bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-3.5 h-3.5" />
                                      </div>
                                      <span>Upload Resource</span>
                                    </button>

                                    <button
                                      onClick={() => openLessonEditor(module.id, lesson, "image")}
                                      className="flex items-center gap-2 px-3 py-2.5 bg-background border border-card hover:border-rose-500/40 hover:bg-rose-500/10 text-text rounded-xl text-xs font-bold transition-all justify-center shadow-sm group"
                                    >
                                      <div className="p-1 rounded-md bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-3.5 h-3.5" />
                                      </div>
                                      <span>Add Image/Diagram</span>
                                    </button>
                                  </div>
                                </div>

                                {/* 2. ATTACHED LESSON CONTENT CARDS OR EMPTY STATE (Requirement 4, 5, 6) */}
                                {hasLessonContent(lesson) ? (
                                  <div className="space-y-2 pt-2 border-t border-card/40">
                                    <p className="text-[10px] font-black uppercase text-subtext tracking-widest ml-0.5">Attached Content</p>

                                    {/* VIDEO CARD */}
                                    {lesson.videoUrl && (
                                      <div className="p-3 bg-background border border-card hover:border-blue-500/40 rounded-xl flex items-center justify-between gap-3 text-xs transition-all shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <GripVertical className="w-4 h-4 text-subtext/30 cursor-grab shrink-0" />
                                          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                                            <Video className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-text truncate">{lesson.videoUrl}</span>
                                              <span className="text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">Video</span>
                                            </div>
                                            <span className="text-[10px] text-subtext block">Duration: 12 min • Attached Stream</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button onClick={() => openLessonEditor(module.id, lesson, "video")} className="px-2.5 py-1 bg-card hover:bg-card/80 text-text rounded-lg font-bold text-xs">Edit</button>
                                          <button onClick={() => openLessonEditor(module.id, lesson, "video")} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg font-bold text-xs">Replace</button>
                                          <button onClick={() => clearContentFromLesson(module.id, lesson.id, "video")} className="p-1.5 text-subtext hover:text-rose-400 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      </div>
                                    )}

                                    {/* CODE SANDBOX CARD */}
                                    {lesson.sandboxLang && (
                                      <div className="p-3 bg-background border border-card hover:border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-xs transition-all shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <GripVertical className="w-4 h-4 text-subtext/30 cursor-grab shrink-0" />
                                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                                            <Code className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-text truncate">{lesson.title} Sandbox ({lesson.sandboxLang})</span>
                                              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Code</span>
                                            </div>
                                            <span className="text-[10px] text-emerald-400 font-mono block">Interactive {lesson.sandboxLang} environment</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button onClick={() => openLessonEditor(module.id, lesson, "sandbox")} className="px-2.5 py-1 bg-card hover:bg-card/80 text-text rounded-lg font-bold text-xs">Edit</button>
                                          <button onClick={() => clearContentFromLesson(module.id, lesson.id, "sandbox")} className="p-1.5 text-subtext hover:text-rose-400 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      </div>
                                    )}

                                    {/* INTERACTIVE QUIZ CARD */}
                                    {(lesson.quizQuestions?.length || 0) > 0 && (
                                      <div className="p-3 bg-background border border-card hover:border-amber-500/40 rounded-xl flex items-center justify-between gap-3 text-xs transition-all shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <GripVertical className="w-4 h-4 text-subtext/30 cursor-grab shrink-0" />
                                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                                            <HelpCircle className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-text truncate">Quiz ({lesson.quizQuestions!.length} Questions)</span>
                                              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">Quiz</span>
                                            </div>
                                            <span className="text-[10px] text-amber-400 font-bold block">Assessment for comprehension</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button onClick={() => openLessonEditor(module.id, lesson, "quiz")} className="px-2.5 py-1 bg-card hover:bg-card/80 text-text rounded-lg font-bold text-xs">Edit</button>
                                          <button onClick={() => openLessonEditor(module.id, lesson, "quiz")} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg font-bold text-xs">Preview</button>
                                          <button onClick={() => clearContentFromLesson(module.id, lesson.id, "quiz")} className="p-1.5 text-subtext hover:text-rose-400 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      </div>
                                    )}

                                    {/* RESOURCE CARD */}
                                    {lesson.resourceFileUrl && (
                                      <div className="p-3 bg-background border border-card hover:border-purple-500/40 rounded-xl flex items-center justify-between gap-3 text-xs transition-all shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <GripVertical className="w-4 h-4 text-subtext/30 cursor-grab shrink-0" />
                                          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                                            <UploadCloud className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-text truncate">{lesson.fileType || "Resource Document"}</span>
                                              <span className="text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">Resource</span>
                                            </div>
                                            <span className="text-[10px] text-purple-400 truncate block">{lesson.resourceFileUrl}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <a href={lesson.resourceFileUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg font-bold text-xs">Download</a>
                                          <button onClick={() => openLessonEditor(module.id, lesson, "resource")} className="px-2.5 py-1 bg-card hover:bg-card/80 text-text rounded-lg font-bold text-xs">Replace</button>
                                          <button onClick={() => clearContentFromLesson(module.id, lesson.id, "resource")} className="p-1.5 text-subtext hover:text-rose-400 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      </div>
                                    )}

                                    {/* IMAGE / DIAGRAM CARD */}
                                    {(lesson.imageUrl1 || lesson.imageUrl2) && (
                                      <div className="p-3 bg-background border border-card hover:border-rose-500/40 rounded-xl flex items-center justify-between gap-3 text-xs transition-all shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <GripVertical className="w-4 h-4 text-subtext/30 cursor-grab shrink-0" />
                                          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                                            <ImageIcon className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-text truncate">{lesson.description || "Architecture & Visual Diagram"}</span>
                                              <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded">Image</span>
                                            </div>
                                            <span className="text-[10px] text-rose-400 font-bold block">{lesson.imageUrl2 ? "Primary & 2nd Image Attached" : "Primary Diagram Attached"}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button onClick={() => openLessonEditor(module.id, lesson, "image")} className="px-2.5 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg font-bold text-xs">Preview</button>
                                          <button onClick={() => openLessonEditor(module.id, lesson, "image")} className="px-2.5 py-1 bg-card hover:bg-card/80 text-text rounded-lg font-bold text-xs">Replace</button>
                                          <button onClick={() => clearContentFromLesson(module.id, lesson.id, "image")} className="p-1.5 text-subtext hover:text-rose-400 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  /* EMPTY STATE (Requirement 6) */
                                  <div className="py-8 px-4 border-2 border-dashed border-card/80 rounded-2xl text-center bg-card/10 space-y-3">
                                    <div className="w-10 h-10 rounded-2xl bg-card/60 flex items-center justify-center text-subtext/40 mx-auto">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h5 className="font-extrabold text-sm text-text">No content added yet</h5>
                                      <p className="text-xs text-subtext mt-1 max-w-sm mx-auto">
                                        Start building this lesson by uploading videos, resources, quizzes, code examples or diagrams.
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => openLessonEditor(module.id, lesson, "video")}
                                      className="px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-extrabold transition-all shadow-sm"
                                    >
                                      Upload First Content
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add Lesson to Module Button */}
                        <button
                          onClick={() => addLessonToModule(module.id)}
                          className="w-full py-3 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 border border-dashed border-purple-500/20 hover:border-purple-500/40 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all mt-2"
                        >
                          <Plus className="w-4 h-4" /> + Add Lesson to {module.title}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => { const id = `mod-${Date.now()}`; setBuilderModules(prev => [...prev, { id, title: `Module ${prev.length + 1}: New Module`, isExpanded: true, lessons: [] }]); }} className="w-full flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-card hover:border-primary/50 hover:bg-primary/5 text-subtext hover:text-primary transition-colors font-bold group">
                  <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" /> Add New Module
                </button>
              </div>

              {/* Submit Course for Admin Review */}
              {builderModules.length > 0 && (
                <div className="flex justify-end pt-6 border-t border-card">
                  <button onClick={handleSubmitCourse} disabled={submitLoading} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-black text-base shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-60">
                    {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Submit Course for Admin Review
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
             TAB: STUDENTS
             ══════════════════════════════════════ */}
          {activeTab === "Students" && (
            <InstructorStudentsView
              isDemoUser={isDemoUser}
              onNavigateToAssignments={(params) => {
                setAssignmentsFilter({
                  ...params,
                  returnTab: "Students",
                });
                setActiveTab("Assignments");
              }}
              onNavigateToLiveSessions={() => {
                setActiveTab("Live Sessions");
              }}
              onBack={() => {
                const targetTab = studentsFilter?.returnTab || (previousTab && previousTab !== "Students" ? previousTab : "Live Sessions");
                setActiveTab(targetTab);
                setStudentsFilter(null);
              }}
              initialFilter={studentsFilter}
              onClearFilter={() => setStudentsFilter(null)}
            />
          )}

          {/* ══════════════════════════════════════
             TAB: ANALYTICS
             ══════════════════════════════════════ */}
          {activeTab === "Analytics" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-card rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm text-text">Video Retention Heatmap</span>
                    <PieChart className="w-4 h-4 text-subtext/50" />
                  </div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-subtext uppercase tracking-widest mb-1">Avg. Drop-off</p>
                      <p className="font-black text-2xl text-text">14:20</p>
                    </div>
                  </div>
                  <div className="w-full h-14 flex items-end gap-[2px]">
                    {[...Array(25)].map((_, i) => {
                      const hv = i < 5 ? 100 : i < 12 ? 100 - (i - 5) * 4 : 72 - (i - 12) * 5;
                      const h = Math.max(12, Math.floor(hv));
                      const c = h > 75 ? "bg-emerald-500" : h > 45 ? "bg-amber-500" : "bg-red-500";
                      return <div key={i} className={`w-full rounded-t-sm opacity-80 ${c}`} style={{ height: `${h}%` }} />;
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-subtext mt-1"><span>0:00</span><span>Mid</span><span>End</span></div>
                </div>

                <div className="bg-card border border-card rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm text-text flex items-center gap-2">Student Risk Alerts <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[10px] font-black">2 NEW</span></span>
                    <Bell className="w-4 h-4 text-red-500/50" />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex gap-3 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />
                      <div className="bg-red-500/20 p-2 rounded-xl shrink-0 h-fit"><UserX className="w-5 h-5 text-red-500" /></div>
                      <div>
                        <h5 className="font-bold text-sm text-text">Arjun K.</h5>
                        <p className="text-xs text-subtext mt-0.5">Missed 3 consecutive quizzes. Last active 5 days ago.</p>
                        <button className="text-xs font-bold text-red-500 mt-2 hover:underline flex items-center gap-1">Send Reminder <ArrowRight className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex gap-3 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-2xl" />
                      <div className="bg-amber-500/20 p-2 rounded-xl shrink-0 h-fit"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
                      <div>
                        <h5 className="font-bold text-sm text-text">Priya Patel</h5>
                        <p className="text-xs text-subtext mt-0.5">Low assessment score (34%). Needs intervention.</p>
                        <button className="text-xs font-bold text-amber-500 mt-2 hover:underline flex items-center gap-1">View Assessment <ArrowRight className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ═══════ CREATE COURSE MODAL ═══════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div className="bg-card border border-card w-full max-w-md p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-subtext hover:text-text transition-colors"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-2"><Plus className="w-6 h-6 text-primary" /> Create New Course</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text mb-2">Course Title</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Advanced AI Prompting" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text focus:ring-2 focus:ring-primary outline-none" placeholder="Enter course description" rows={3} />
              </div>
              <button disabled={createLoading} className="w-full py-4 mt-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Approval"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ VIDEO UPLOAD MODAL ═══════ */}
      {contentModal === "video" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setContentModal(null)}>
          <div className="bg-card border border-card w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setContentModal(null)} className="absolute top-6 right-6 text-subtext hover:text-text"><X className="w-6 h-6" /></button>
            <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2"><Video className="w-5 h-5 text-blue-500" /> Add Video Lesson</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text mb-2">Lesson Title</label>
                <input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Introduction to Neural Networks" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Video URL</label>
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <button onClick={addVideoLesson} disabled={!videoTitle.trim()} className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/40 text-white rounded-xl font-bold">Add Video</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ CODE SANDBOX MODAL ═══════ */}
      {contentModal === "sandbox" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setContentModal(null)}>
          <div className="bg-card border border-card w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2"><Code className="w-5 h-5 text-emerald-500" /> Add Code Sandbox</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text mb-2">Sandbox Title</label>
                <input value={sandboxTitle} onChange={e => setSandboxTitle(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Build a REST API" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Language</label>
                <select value={sandboxLang} onChange={e => setSandboxLang(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text outline-none">
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              <button onClick={addSandboxLesson} disabled={!sandboxTitle.trim()} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-white rounded-xl font-bold">Add Sandbox</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ UPLOAD RESOURCE MODAL ═══════ */}
      {contentModal === "resource" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setContentModal(null)}>
          <div className="bg-card border border-card w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setContentModal(null)} className="absolute top-6 right-6 text-subtext hover:text-text"><X className="w-6 h-6" /></button>
            <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2"><UploadCloud className="w-5 h-5 text-purple-400" /> Upload Lesson Resource</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Resource Title *</label>
                <input value={resourceTitle} onChange={e => setResourceTitle(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text text-xs outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Course Cheat Sheet & References PDF" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text mb-1">Resource Type</label>
                <select value={resourceType} onChange={e => setResourceType(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text text-xs outline-none">
                  <option value="PDF Document">PDF Document</option>
                  <option value="Source Code ZIP">Source Code ZIP</option>
                  <option value="Presentation Slides">Presentation Slides (PPT/PDF)</option>
                  <option value="Documentation">Documentation / Article</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-text mb-1">File / Resource Download URL</label>
                <input value={resourceFileUrl} onChange={e => setResourceFileUrl(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text text-xs outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://example.com/resources/cheatsheet.pdf" />
              </div>
              <button onClick={addResourceLesson} disabled={!resourceTitle.trim()} className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/40 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/20">Add Resource File</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ ADD IMAGE / DIAGRAM MODAL ═══════ */}
      {contentModal === "image" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in overflow-y-auto py-8" onClick={() => setContentModal(null)}>
          <div className="bg-card border border-card w-full max-w-lg p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 my-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setContentModal(null)} className="absolute top-6 right-6 text-subtext hover:text-text"><X className="w-6 h-6" /></button>
            <h2 className="text-xl font-bold text-text mb-1 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-rose-400" /> Add Image / Visual Diagram</h2>
            <p className="text-xs text-subtext mb-6">Attach visual graphics, architecture diagrams, or screenshots for this lesson.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Lesson / Diagram Title *</label>
                <input value={imageTitle} onChange={e => setImageTitle(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text text-xs outline-none focus:ring-2 focus:ring-rose-500" placeholder="e.g. System Architecture & Data Flow Diagram" />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Primary Image / Diagram URL *</label>
                <input value={imageUrl1} onChange={e => setImageUrl1(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text text-xs outline-none focus:ring-2 focus:ring-rose-500" placeholder="https://example.com/diagram1.png" />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-400 mb-1 flex items-center gap-1">
                  <span>📷 Second Image / Secondary Diagram URL (Optional)</span>
                </label>
                <input value={imageUrl2} onChange={e => setImageUrl2(e.target.value)} className="w-full bg-background border border-purple-500/30 rounded-xl px-4 py-3 text-text text-xs outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://example.com/secondary-diagram2.png (Optional)" />
                <p className="text-[11px] text-subtext mt-1">Allows displaying before/after comparisons or secondary flowcharts for this lesson.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Caption / Notes (Optional)</label>
                <textarea value={imageCaption} onChange={e => setImageCaption(e.target.value)} rows={2} className="w-full bg-background border border-card rounded-xl px-4 py-2.5 text-text text-xs outline-none focus:ring-2 focus:ring-rose-500" placeholder="Brief explanatory caption..." />
              </div>

              <button onClick={addImageLesson} disabled={!imageTitle.trim()} className="w-full py-3 bg-rose-500 hover:bg-rose-400 disabled:bg-rose-500/40 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/20">Add Image / Diagram Lesson</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ AI QUIZ GENERATOR WIZARD REDESIGN (3-STEP GUIDED WORKFLOW) ═══════ */}
      {contentModal === "quiz" && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto py-8" onClick={() => setContentModal(null)}>
          <div className="bg-background border border-card w-full max-w-3xl p-6 md:p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 my-auto space-y-6 text-text" onClick={e => e.stopPropagation()}>
            
            {/* WIZARD HEADER & STEPPER BAR */}
            <div className="space-y-4 border-b border-card pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Quiz Generator Wizard
                  </span>
                  <h3 className="text-xl font-bold text-text mt-0.5">
                    {quizWizardStep === 1 ? "Step 1 — Generate Quiz" : quizWizardStep === 2 ? "Step 2 — Review & Edit Generated Quiz" : "Step 3 — Student View Preview"}
                  </h3>
                </div>
                <button onClick={() => setContentModal(null)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3-Step Wizard Visual Progress Bar */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setQuizWizardStep(1)}
                  className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    quizWizardStep === 1
                      ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm"
                      : quizQuestions.length > 0
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : "bg-card border-card text-subtext"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px]">1</span>
                  <span>1. Generate</span>
                </button>

                <button
                  onClick={() => quizQuestions.length > 0 && setQuizWizardStep(2)}
                  disabled={quizQuestions.length === 0}
                  className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    quizWizardStep === 2
                      ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm"
                      : quizQuestions.length > 0
                      ? "bg-background border-card text-text hover:border-amber-500/40"
                      : "bg-card border-card text-subtext/40 cursor-not-allowed"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px]">2</span>
                  <span>2. Review & Edit</span>
                </button>

                <button
                  onClick={() => quizQuestions.length > 0 && setQuizWizardStep(3)}
                  disabled={quizQuestions.length === 0}
                  className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    quizWizardStep === 3
                      ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm"
                      : quizQuestions.length > 0
                      ? "bg-background border-card text-text hover:border-amber-500/40"
                      : "bg-card border-card text-subtext/40 cursor-not-allowed"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px]">3</span>
                  <span>3. Preview</span>
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════
               STEP 1: GENERATE QUIZ
               ══════════════════════════════════════ */}
            {quizWizardStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {!quizGenerating ? (
                  <>
                    {!isManualBuilder ? (
                      /* AI GENERATION PANEL CARD */
                      <div className="space-y-5">
                        {/* Quiz Topic */}
                        <div>
                          <label className="block text-xs font-extrabold text-text uppercase tracking-wider mb-1.5">Quiz Topic</label>
                          <input
                            value={quizTopic}
                            onChange={e => setQuizTopic(e.target.value)}
                            placeholder="What is this lesson about? e.g., JavaScript Variables, Machine Learning Basics"
                            className="w-full bg-card border border-card rounded-xl px-4 py-3 text-text text-sm outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                          />
                        </div>

                        {/* Difficulty (Single Select) */}
                        <div>
                          <label className="block text-xs font-extrabold text-text uppercase tracking-wider mb-2">Difficulty</label>
                          <div className="grid grid-cols-4 gap-2">
                            {(["Easy", "Medium", "Hard", "Mixed"] as const).map(diff => (
                              <button
                                key={diff}
                                type="button"
                                onClick={() => setQuizDifficulty(diff)}
                                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                  quizDifficulty === diff
                                    ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                                    : "bg-card border-card text-subtext hover:text-text hover:border-card/80"
                                }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Number of Questions */}
                        <div>
                          <label className="block text-xs font-extrabold text-text uppercase tracking-wider mb-2">Number of Questions</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[5, 10, 15, 20].map(num => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setQuizNumQuestions(num)}
                                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                  quizNumQuestions === num
                                    ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                                    : "bg-card border-card text-subtext hover:text-text hover:border-card/80"
                                }`}
                              >
                                {num} Questions
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Question Types (Multi Select) */}
                        <div>
                          <label className="block text-xs font-extrabold text-text uppercase tracking-wider mb-2">Question Types</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {["Multiple Choice", "True / False", "Multiple Select", "Fill in the Blank", "Short Answer"].map(qType => {
                              const isSelected = quizQuestionTypes.includes(qType);
                              return (
                                <button
                                  key={qType}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) setQuizQuestionTypes(prev => prev.filter(t => t !== qType));
                                    else setQuizQuestionTypes(prev => [...prev, qType]);
                                  }}
                                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                                    isSelected
                                      ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                      : "bg-card border-card text-subtext hover:text-text"
                                  }`}
                                >
                                  <span>{qType}</span>
                                  <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${isSelected ? "bg-amber-500 text-white border-amber-500" : "border-subtext/40"}`}>
                                    {isSelected && "✓"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Generate Based On */}
                        <div>
                          <label className="block text-xs font-extrabold text-text uppercase tracking-wider mb-2">Generate Based On</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(["Lesson Title", "Lesson Description", "Uploaded Resources", "Custom Prompt"] as const).map(basis => (
                              <button
                                key={basis}
                                type="button"
                                onClick={() => setQuizBasedOn(basis)}
                                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                                  quizBasedOn === basis
                                    ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                    : "bg-card border-card text-subtext hover:text-text"
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${quizBasedOn === basis ? "border-amber-500 bg-amber-500 text-white" : "border-subtext"}`}>
                                  {quizBasedOn === basis && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                <span className="truncate">{basis}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Prompt Input */}
                        {quizBasedOn === "Custom Prompt" && (
                          <div className="animate-in fade-in duration-200">
                            <label className="block text-xs font-extrabold text-text uppercase tracking-wider mb-1.5">Tell AI what you want...</label>
                            <textarea
                              value={quizCustomPrompt}
                              onChange={e => setQuizCustomPrompt(e.target.value)}
                              rows={3}
                              placeholder="Example: Generate beginner-friendly JavaScript questions focusing on variables and let vs const."
                              className="w-full bg-card border border-card rounded-xl p-3.5 text-xs text-text outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 border-t border-card flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={() => setIsManualBuilder(true)}
                            className="py-3.5 px-5 bg-card hover:bg-card/80 text-text rounded-xl font-bold text-xs transition-all border border-card"
                          >
                            ✍️ Create Manually
                          </button>
                          <button
                            type="button"
                            onClick={() => runQuizWizardGenerator()}
                            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95"
                          >
                            <Sparkles className="w-4 h-4" /> ✨ Generate Quiz
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* MANUAL QUIZ BUILDER PANEL */
                      <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-text">Manual Question Builder</h4>
                          <button onClick={() => setIsManualBuilder(false)} className="text-xs text-amber-500 font-bold hover:underline">
                            Switch to AI Generator
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-text mb-1">Question Text</label>
                          <input
                            value={manualQForm.question}
                            onChange={e => setManualQForm(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Enter question text..."
                            className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-xs text-text outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-text mb-1">Option A</label>
                            <input value={manualQForm.optA} onChange={e => setManualQForm(prev => ({ ...prev, optA: e.target.value }))} className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs text-text outline-none" placeholder="Option A..." />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-text mb-1">Option B</label>
                            <input value={manualQForm.optB} onChange={e => setManualQForm(prev => ({ ...prev, optB: e.target.value }))} className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs text-text outline-none" placeholder="Option B..." />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-text mb-1">Option C</label>
                            <input value={manualQForm.optC} onChange={e => setManualQForm(prev => ({ ...prev, optC: e.target.value }))} className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs text-text outline-none" placeholder="Option C..." />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-text mb-1">Option D</label>
                            <input value={manualQForm.optD} onChange={e => setManualQForm(prev => ({ ...prev, optD: e.target.value }))} className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs text-text outline-none" placeholder="Option D..." />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-text mb-1">Correct Answer Choice</label>
                            <select
                              value={manualQForm.correctIndex}
                              onChange={e => setManualQForm(prev => ({ ...prev, correctIndex: Number(e.target.value) }))}
                              className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs text-text outline-none"
                            >
                              <option value={0}>Option A</option>
                              <option value={1}>Option B</option>
                              <option value={2}>Option C</option>
                              <option value={3}>Option D</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-text mb-1">Explanation</label>
                            <input value={manualQForm.explanation} onChange={e => setManualQForm(prev => ({ ...prev, explanation: e.target.value }))} className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs text-text outline-none" placeholder="Explanation for students..." />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-card flex gap-3">
                          <button onClick={() => setIsManualBuilder(false)} className="py-2.5 px-4 bg-card text-subtext rounded-xl font-bold text-xs">Cancel</button>
                          <button
                            onClick={() => {
                              addManualQToLesson();
                              if (quizQuestions.length > 0) setQuizWizardStep(2);
                            }}
                            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-extrabold text-xs"
                          >
                            Add Manual Question & Proceed
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* LOADING PROGRESS ANIMATION STATE */
                  <div className="py-12 px-6 text-center space-y-6 border-2 border-dashed border-amber-500/30 rounded-3xl bg-amber-500/5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                      <Sparkles className="w-7 h-7 animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-text">AI is Generating Your Quiz</h4>
                      <p className="text-xs text-subtext mt-1">Creating classroom-quality questions tailored to your lesson topic.</p>
                    </div>

                    <div className="max-w-sm mx-auto space-y-2">
                      {quizLoadingSteps.map((stepMsg, idx) => (
                        <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          idx === quizLoadingPhase
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-500 scale-105 shadow-sm"
                            : idx < quizLoadingPhase
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : "bg-card/40 border-card/40 text-subtext/30"
                        }`}>
                          <div className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center shrink-0">
                            {idx < quizLoadingPhase ? "✓" : idx === quizLoadingPhase ? <Loader2 className="w-3 h-3 animate-spin" /> : idx + 1}
                          </div>
                          <span>{stepMsg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════
               STEP 2: REVIEW & EDIT GENERATED QUIZ
               ══════════════════════════════════════ */}
            {quizWizardStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Banner */}
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>✓ Quiz Generated Successfully. Review before adding it to your lesson.</span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">{quizQuestions.length} Questions</span>
                </div>

                {/* AI Suggestions Card */}
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI Suggestions
                    </span>
                    <span className="text-[10px] font-bold text-subtext">Estimated Completion: 85%</span>
                  </div>
                  <ul className="text-xs text-subtext space-y-1 pl-1">
                    <li>• Question 4 may be challenging for beginners.</li>
                    <li>• Estimated total reading time: {Math.max(3, quizQuestions.length * 0.8).toFixed(0)} minutes.</li>
                    <li>• Balanced mix of concepts and practical questions.</li>
                  </ul>
                </div>

                {/* Questions Collapsible List */}
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                  {quizQuestions.map((q, qIdx) => {
                    const isExpanded = Boolean(expandedQuestionCards[qIdx]);
                    return (
                      <div key={qIdx} className="bg-card border border-card rounded-2xl overflow-hidden transition-all shadow-sm">
                        {/* Collapsed Header */}
                        <div
                          className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-card/80 transition-colors select-none"
                          onClick={() => setExpandedQuestionCards(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center shrink-0">
                              {qIdx + 1}
                            </span>
                            <span className="font-bold text-text text-xs truncate">{q.question || `Question ${qIdx + 1}`}</span>
                          </div>

                          {/* Quick Top Right Actions */}
                          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => regenerateSingleQuestion(qIdx)}
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                              title="Regenerate this single question"
                            >
                              <RefreshCw className="w-3 h-3" /> Regenerate
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicateQuestion(qIdx)}
                              className="px-2 py-1 bg-card hover:bg-card/80 text-subtext hover:text-text rounded-lg text-[10px] font-bold border border-card/80"
                            >
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteQuizQuestion(qIdx)}
                              className="p-1 text-subtext hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedQuestionCards(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                              className="p-1 text-subtext hover:text-text ml-1"
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Editor Form */}
                        {isExpanded && (
                          <div className="p-4 border-t border-card/60 bg-background/50 space-y-3 animate-in fade-in duration-150">
                            <div>
                              <label className="block text-[10px] font-extrabold text-subtext uppercase tracking-wider mb-1">Question Text</label>
                              <input
                                value={q.question}
                                onChange={e => updateQuestionProp(qIdx, "question", e.target.value)}
                                className="w-full bg-card border border-card rounded-xl px-3 py-2 text-xs font-bold text-text outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-[10px] font-extrabold text-subtext uppercase tracking-wider">Answer Choices & Correct Answer</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(q.options || ["", "", "", ""]).map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-2 bg-card border border-card rounded-xl p-2">
                                    <input
                                      type="radio"
                                      name={`correct-${qIdx}`}
                                      checked={q.correctIndex === optIdx}
                                      onChange={() => updateQuestionProp(qIdx, "correctIndex", optIdx)}
                                      className="accent-amber-500 shrink-0"
                                      title="Mark as correct answer"
                                    />
                                    <span className="text-[10px] font-black text-subtext shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                                    <input
                                      value={opt}
                                      onChange={e => updateQuestionOption(qIdx, optIdx, e.target.value)}
                                      className="w-full bg-transparent text-xs text-text outline-none font-medium"
                                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-extrabold text-subtext uppercase tracking-wider mb-1">Explanation</label>
                                <textarea
                                  value={q.explanation || ""}
                                  onChange={e => updateQuestionProp(qIdx, "explanation", e.target.value)}
                                  rows={2}
                                  className="w-full bg-card border border-card rounded-xl p-2.5 text-xs text-text outline-none focus:ring-1 focus:ring-amber-500"
                                  placeholder="Explanation for students..."
                                />
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <label className="block text-[10px] font-extrabold text-subtext uppercase tracking-wider mb-1">Hint</label>
                                  <input
                                    value={q.hint || ""}
                                    onChange={e => updateQuestionProp(qIdx, "hint", e.target.value)}
                                    className="w-full bg-card border border-card rounded-xl px-3 py-1.5 text-xs text-text outline-none"
                                    placeholder="Subtle hint for students..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="block text-[9px] font-extrabold text-subtext uppercase tracking-wider mb-0.5">Difficulty</label>
                                    <select
                                      value={q.difficulty || "Medium"}
                                      onChange={e => updateQuestionProp(qIdx, "difficulty", e.target.value)}
                                      className="w-full bg-card border border-card rounded-lg px-2 py-1 text-[11px] text-text outline-none"
                                    >
                                      <option value="Easy">Easy</option>
                                      <option value="Medium">Medium</option>
                                      <option value="Hard">Hard</option>
                                    </select>
                                  </div>
                                  <div className="w-20">
                                    <label className="block text-[9px] font-extrabold text-subtext uppercase tracking-wider mb-0.5">Points</label>
                                    <input
                                      type="number"
                                      value={q.points || 10}
                                      onChange={e => updateQuestionProp(qIdx, "points", Number(e.target.value))}
                                      className="w-full bg-card border border-card rounded-lg px-2 py-1 text-[11px] text-text outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add New Question Button */}
                <button
                  type="button"
                  onClick={addBlankQuestionToQuiz}
                  className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-dashed border-amber-500/30 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> + Add New Question
                </button>

                {/* Bottom Bar Actions */}
                <div className="pt-4 border-t border-card flex flex-wrap items-center justify-between gap-2">
                  <button onClick={() => setContentModal(null)} className="py-2.5 px-4 bg-card text-subtext rounded-xl font-bold text-xs">
                    Cancel
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuizRegenModalOpen(true)}
                      className="py-2.5 px-4 bg-background border border-card hover:border-amber-500/40 text-text rounded-xl font-bold text-xs flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> Regenerate Quiz
                    </button>

                    <button
                      onClick={() => {
                        setQuizWizardStep(3);
                        startQuizPreview();
                      }}
                      className="py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl font-extrabold text-xs flex items-center gap-1.5 border border-amber-500/30"
                    >
                      <PlayCircle className="w-4 h-4" /> Preview Quiz
                    </button>

                    <button
                      onClick={() => setQuizSaveConfirmModal(true)}
                      className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Save Quiz
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
               STEP 3: PREVIEW (STUDENT VIEW)
               ══════════════════════════════════════ */}
            {quizWizardStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Top Banner */}
                <div className="flex items-center justify-between p-3.5 bg-card/60 border border-card rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase text-text tracking-wider">Preview Mode — Student View</span>
                  </div>
                  <button
                    onClick={() => setQuizWizardStep(2)}
                    className="px-3 py-1.5 bg-card hover:bg-card/80 text-subtext hover:text-text rounded-xl text-xs font-bold transition-all border border-card/80"
                  >
                    Exit Preview
                  </button>
                </div>

                {/* Student Simulation Interface */}
                <div className="space-y-5">
                  {/* Progress & Score & Timer */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${((quizCurrentQ + 1) / Math.max(1, quizQuestions.length)) * 100}%` }} />
                    </div>
                    <span className="font-black text-subtext">{quizCurrentQ + 1} / {quizQuestions.length}</span>
                    <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Score: {quizScore}</span>
                    <span className="font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> 08:00</span>
                  </div>

                  {/* Question Card */}
                  {quizQuestions[quizCurrentQ] && (
                    <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 space-y-5">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest block mb-1">Question {quizCurrentQ + 1}</span>
                        <p className="text-base font-bold text-text">{quizQuestions[quizCurrentQ].question}</p>
                      </div>

                      <div className="space-y-2.5">
                        {quizQuestions[quizCurrentQ].options?.map((opt, oi) => {
                          const isCorrect = oi === quizQuestions[quizCurrentQ].correctIndex;
                          const isSelected = quizSelected === oi;
                          let btnClass = "bg-background border-card text-text hover:border-amber-500/40 hover:bg-amber-500/5";
                          if (quizAnswered) {
                            if (isCorrect) btnClass = "bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20";
                            else if (isSelected) btnClass = "bg-rose-500/10 border-rose-500 text-rose-400 ring-2 ring-rose-500/20";
                            else btnClass = "bg-card border-card text-subtext opacity-50";
                          }
                          return (
                            <button
                              key={oi}
                              onClick={() => handleQuizAnswer(oi)}
                              disabled={quizAnswered}
                              className={`w-full text-left p-3.5 rounded-xl border-2 font-semibold text-xs transition-all flex items-center gap-3 ${btnClass}`}
                            >
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${quizAnswered && isCorrect ? "bg-emerald-500 text-white" : quizAnswered && isSelected ? "bg-rose-500 text-white" : "bg-card text-subtext"}`}>
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <span>{opt}</span>
                              {quizAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />}
                              {quizAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-500 ml-auto" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {quizAnswered && (
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-1 animate-in fade-in">
                          <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider block">Explanation</span>
                          <p className="text-xs text-text">{quizQuestions[quizCurrentQ].explanation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Next Question / Finish Button */}
                  {quizAnswered && (
                    <button
                      onClick={nextQuizQ}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
                    >
                      {quizCurrentQ < quizQuestions.length - 1 ? (
                        <>Next Question <ChevronRight className="w-4 h-4" /></>
                      ) : (
                        <>Finish Student Preview <CheckCircle className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </div>

                {/* Bottom Bar Actions */}
                <div className="pt-4 border-t border-card flex items-center justify-between">
                  <button onClick={() => setQuizWizardStep(2)} className="py-2.5 px-4 bg-card text-subtext rounded-xl font-bold text-xs">
                    ← Back to Review & Edit
                  </button>
                  <button
                    onClick={() => setQuizSaveConfirmModal(true)}
                    className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Save Quiz to Lesson
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ REGENERATE QUIZ POPUP MODAL ═══════ */}
      {quizRegenModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setQuizRegenModalOpen(false)}>
          <div className="bg-background border border-card rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-card pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-500" />
                <h4 className="font-extrabold text-text">What would you like to change?</h4>
              </div>
              <button onClick={() => setQuizRegenModalOpen(false)} className="p-1.5 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-subtext tracking-wider">Select Tweaks</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {["Easier", "Harder", "More Practical", "More Conceptual", "More Coding Questions", "Shorter Quiz", "Longer Quiz"].map(opt => {
                  const isChecked = quizRegenTweakOptions.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (isChecked) setQuizRegenTweakOptions(prev => prev.filter(o => o !== opt));
                        else setQuizRegenTweakOptions(prev => [...prev, opt]);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                        isChecked ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-card border-card text-subtext"
                      }`}
                    >
                      <span>{opt}</span>
                      <span className={`w-3.5 h-3.5 rounded border text-[9px] flex items-center justify-center ${isChecked ? "bg-amber-500 text-white border-amber-500" : "border-subtext/40"}`}>
                        {isChecked && "✓"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-subtext tracking-wider mb-1">Additional Instructions</label>
              <textarea
                value={quizRegenInstructions}
                onChange={e => setQuizRegenInstructions(e.target.value)}
                rows={2}
                placeholder="e.g. Focus more on ES6 arrow functions and object destructuring."
                className="w-full bg-card border border-card rounded-xl p-3 text-xs text-text outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-3 border-t border-card">
              <button onClick={() => setQuizRegenModalOpen(false)} className="py-2.5 px-4 bg-card text-subtext rounded-xl font-bold text-xs">
                Cancel
              </button>
              <button
                onClick={() => runQuizWizardGenerator()}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4" /> Generate Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ SAVE QUIZ CONFIRMATION MODAL ═══════ */}
      {quizSaveConfirmModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setQuizSaveConfirmModal(false)}>
          <div className="bg-background border border-card rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl animate-in zoom-in-95 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-text">Save Quiz?</h4>
              <p className="text-xs text-subtext mt-1">Your quiz will be attached to this lesson and ready for student enrollment.</p>
            </div>

            <div className="p-4 bg-card/60 border border-card rounded-2xl space-y-2 text-left text-xs">
              <p className="font-bold text-text">Quiz Details:</p>
              <div className="space-y-1 text-subtext font-medium">
                <p className="text-emerald-400 flex items-center gap-2">✓ {quizQuestions.length} Questions</p>
                <p className="text-emerald-400 flex items-center gap-2">✓ {quizDifficulty} Difficulty</p>
                <p className="text-emerald-400 flex items-center gap-2">✓ Estimated Time: {Math.max(3, quizQuestions.length * 0.8).toFixed(0)} Minutes</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setQuizSaveConfirmModal(false)} className="flex-1 py-3 bg-card hover:bg-card/80 text-text rounded-xl font-bold text-xs border border-card">
                Back
              </button>
              <button
                onClick={saveQuizToCurrentContext}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-500/20"
              >
                Save Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ AI MODULE ASSISTANT MODAL ═══════ */}
      {isAiAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsAiAddModalOpen(false)}>
          <div className="bg-background border border-card rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-card pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-extrabold text-text">AI Module Assistant</h3>
              </div>
              <button onClick={() => setIsAiAddModalOpen(false)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAiCreateModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Enter Module Topic / Subject *</label>
                <input
                  type="text"
                  required
                  value={aiCustomTopic}
                  onChange={(e) => setAiCustomTopic(e.target.value)}
                  placeholder="e.g. Multiplayer Physics & Network Synchronization"
                  className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-xs font-medium text-text outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-card">
                <button type="button" onClick={() => setIsAiAddModalOpen(false)} className="px-4 py-2 bg-card text-subtext rounded-xl font-bold text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiAddLoading || !aiCustomTopic.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-2"
                >
                  {aiAddLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate & Add Module</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ DIRECT MULTI-CONTENT LESSON EDITOR MODAL ═══════ */}
      {editingLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in" onClick={() => setEditingLesson(null)}>
          <div className="bg-background border border-card w-full max-w-3xl p-6 md:p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 my-auto space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-card pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Topic Content Studio • Multiple Materials Supported
                </span>
                <h3 className="text-xl font-bold text-text mt-0.5">{editingLesson.lesson.title}</h3>
                <p className="text-xs text-subtext mt-0.5">Attach videos, coding sandbox, quizzes, multiple PDFs/files, and diagrams to this single topic.</p>
              </div>
              <button onClick={() => setEditingLesson(null)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Materials in Topic Summary Bar */}
            <div className="p-3.5 bg-card/60 border border-card rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-bold text-subtext text-[11px] uppercase tracking-wider">Attached to this Topic:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {editingLesson.lesson.videoUrl?.trim() && (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[11px] flex items-center gap-1">
                    <Video className="w-3 h-3" /> Video Attached
                    <button
                      type="button"
                      onClick={() => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, videoUrl: "" } })}
                      className="text-subtext hover:text-rose-400 ml-1"
                      title="Remove Video"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {(editingLesson.lesson.sandboxLang || editingLesson.lesson.sandboxCode?.trim()) && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <Code className="w-3 h-3" /> Sandbox ({editingLesson.lesson.sandboxLang || "Python"})
                    <button
                      type="button"
                      onClick={() => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, sandboxCode: "", sandboxLang: "python" } })}
                      className="text-subtext hover:text-rose-400 ml-1"
                      title="Remove Sandbox"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {editingLesson.lesson.quizQuestions && editingLesson.lesson.quizQuestions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" /> Quiz ({editingLesson.lesson.quizQuestions.length} Qs)
                    <button
                      type="button"
                      onClick={() => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, quizQuestions: [] } })}
                      className="text-subtext hover:text-rose-400 ml-1"
                      title="Remove Quiz"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {editingLesson.lesson.resources && editingLesson.lesson.resources.length > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-[11px] flex items-center gap-1">
                    <UploadCloud className="w-3 h-3" /> {editingLesson.lesson.resources.length} File{editingLesson.lesson.resources.length > 1 ? "s" : ""}
                  </span>
                )}
                {(editingLesson.lesson.imageUrl1?.trim() || editingLesson.lesson.imageUrl2?.trim()) && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[11px] flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Diagram Attached
                    <button
                      type="button"
                      onClick={() => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, imageUrl1: "", imageUrl2: "" } })}
                      className="text-subtext hover:text-rose-400 ml-1"
                      title="Remove Diagram"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {editingLesson.lesson.articleContent?.trim() && (
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-[11px] flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Notes Attached
                  </span>
                )}
                {!editingLesson.lesson.videoUrl &&
                  !editingLesson.lesson.sandboxCode &&
                  (!editingLesson.lesson.quizQuestions || editingLesson.lesson.quizQuestions.length === 0) &&
                  (!editingLesson.lesson.resources || editingLesson.lesson.resources.length === 0) &&
                  !editingLesson.lesson.imageUrl1 &&
                  !editingLesson.lesson.articleContent && (
                    <span className="text-subtext/60 italic text-[11px]">No materials attached yet. Select tabs below to add multiple content.</span>
                  )}
              </div>
            </div>

            {/* Attachment Tabs with presence indicators */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-card">
              <button
                onClick={() => setEditingLesson({ ...editingLesson, tab: "general" })}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  editingLesson.tab === "general" ? "bg-primary text-white" : "bg-card text-subtext hover:text-text"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Title & Info</span>
              </button>

              <button
                onClick={() => setEditingLesson({ ...editingLesson, tab: "video" })}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  editingLesson.tab === "video" ? "bg-blue-500 text-white" : "bg-card text-subtext hover:text-blue-400"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>📹 Video</span>
                {editingLesson.lesson.videoUrl?.trim() && <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />}
              </button>

              <button
                onClick={() => setEditingLesson({ ...editingLesson, tab: "sandbox" })}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  editingLesson.tab === "sandbox" ? "bg-emerald-500 text-white" : "bg-card text-subtext hover:text-emerald-400"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>&lt;/&gt; Code Sandbox</span>
                {editingLesson.lesson.sandboxCode?.trim() && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />}
              </button>

              <button
                onClick={() => setEditingLesson({ ...editingLesson, tab: "quiz" })}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  editingLesson.tab === "quiz" ? "bg-amber-500 text-white" : "bg-card text-subtext hover:text-amber-400"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>❓ Quiz Game</span>
                {(editingLesson.lesson.quizQuestions?.length || 0) > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />}
              </button>

              <button
                onClick={() => setEditingLesson({ ...editingLesson, tab: "resource" })}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  editingLesson.tab === "resource" ? "bg-purple-600 text-white" : "bg-card text-subtext hover:text-purple-400"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>📁 Files & PDFs</span>
                {(editingLesson.lesson.resources?.length || 0) > 0 && <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />}
              </button>

              <button
                onClick={() => setEditingLesson({ ...editingLesson, tab: "image" })}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  editingLesson.tab === "image" ? "bg-rose-500 text-white" : "bg-card text-subtext hover:text-rose-400"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>🖼 Diagrams</span>
                {(editingLesson.lesson.imageUrl1?.trim() || editingLesson.lesson.imageUrl2?.trim()) && <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />}
              </button>

              <button
                onClick={() => setEditingLesson({ ...editingLesson, tab: "article" })}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  editingLesson.tab === "article" ? "bg-cyan-600 text-white" : "bg-card text-subtext hover:text-cyan-400"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📝 Notes & Guide</span>
                {editingLesson.lesson.articleContent?.trim() && <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />}
              </button>
            </div>

            {/* TAB 1: GENERAL INFO */}
            {editingLesson.tab === "general" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Topic Title *</label>
                  <input
                    type="text"
                    value={editingLesson.lesson.title}
                    onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, title: e.target.value } })}
                    className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-xs font-medium text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Short Lesson Objective / Summary</label>
                  <textarea
                    rows={3}
                    value={editingLesson.lesson.description || ""}
                    onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, description: e.target.value } })}
                    className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-xs font-medium text-text outline-none focus:border-primary"
                    placeholder="Brief notes or student learning objectives for this topic..."
                  />
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Multi-Content Lesson Architecture
                  </p>
                  <p className="text-[11px] text-subtext leading-relaxed">
                    You can attach multiple materials to this single topic! For example, students can watch a video, practice live code in a sandbox, take a quiz, and download reference PDFs in the same lesson step.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: VIDEO */}
            {editingLesson.tab === "video" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-500" />
                    <h4 className="font-bold text-sm text-text">Attach Video Lecture</h4>
                  </div>
                  {editingLesson.lesson.videoUrl?.trim() && (
                    <button
                      type="button"
                      onClick={() => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, videoUrl: "" } })}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove Video
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Video Stream or YouTube / Vimeo / MP4 URL *</label>
                  <input
                    type="text"
                    value={editingLesson.lesson.videoUrl || ""}
                    onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, videoUrl: e.target.value } })}
                    className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-xs font-medium text-text outline-none focus:border-blue-500"
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://cdn.example.com/video.mp4"
                  />
                </div>
                {editingLesson.lesson.videoUrl && (
                  <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5"><Video className="w-4 h-4" /> Video Attached</span>
                    <p className="text-[11px] text-subtext truncate font-mono">{editingLesson.lesson.videoUrl}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CODE SANDBOX */}
            {editingLesson.tab === "sandbox" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-emerald-500" />
                    <h4 className="font-bold text-sm text-text">Attach Interactive Code Sandbox</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const lang = editingLesson.lesson.sandboxLang || "python";
                        const defaultCode = lang === "python" ? `# Python Solution\ndef main():\n    print("Hello from ${editingLesson.lesson.title}")\n\nif __name__ == "__main__":\n    main()`
                          : lang === "javascript" ? `// JS Code\nfunction main() {\n    console.log("Hello from ${editingLesson.lesson.title}");\n}\nmain();`
                          : `// ${lang} Code\nconsole.log("Hello from ${editingLesson.lesson.title}");`;
                        setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, sandboxCode: defaultCode } });
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Fill Starter Code
                    </button>
                    {editingLesson.lesson.sandboxCode?.trim() && (
                      <button
                        type="button"
                        onClick={() => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, sandboxCode: "" } })}
                        className="text-xs text-rose-400 hover:underline ml-2"
                      >
                        Clear Sandbox
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">Programming Language</label>
                  <select
                    value={editingLesson.lesson.sandboxLang || "python"}
                    onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, sandboxLang: e.target.value } })}
                    className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-xs font-medium text-text outline-none focus:border-emerald-500"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java</option>
                    <option value="rust">Rust</option>
                    <option value="html">HTML/CSS</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">Starter Code Template</label>
                  <textarea
                    rows={6}
                    value={editingLesson.lesson.sandboxCode || ""}
                    onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, sandboxCode: e.target.value } })}
                    className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500 leading-relaxed"
                    placeholder="# Write or paste initial starter code for students here..."
                  />
                </div>
              </div>
            )}

            {/* TAB 4: QUIZ */}
            {editingLesson.tab === "quiz" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-sm text-text">Interactive Quiz Attachment</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openQuizWizardModal(editingLesson.lesson.title)}
                      className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ AI Quiz Generator</span>
                    </button>
                    {(editingLesson.lesson.quizQuestions?.length || 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setLessonQuizPreview(!lessonQuizPreview);
                          setLessonQuizCurrentQ(0);
                          setLessonQuizSelected(null);
                          setLessonQuizAnswered(false);
                          setLessonQuizScore(0);
                        }}
                        className="px-3 py-1.5 bg-card hover:bg-card/80 text-text border border-card rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>{lessonQuizPreview ? "Exit Preview" : "Test Quiz Game"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {lessonQuizPreview && (editingLesson.lesson.quizQuestions?.length || 0) > 0 ? (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-amber-500">Question {lessonQuizCurrentQ + 1} of {editingLesson.lesson.quizQuestions!.length}</span>
                      <span className="text-emerald-500">Score: {lessonQuizScore}</span>
                    </div>

                    {(() => {
                      const q = editingLesson.lesson.quizQuestions![lessonQuizCurrentQ];
                      if (!q) return null;
                      return (
                        <div className="space-y-3">
                          <p className="font-bold text-sm text-text">{q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt: string, oi: number) => {
                              const isCorrect = oi === q.correctIndex;
                              const isSelected = lessonQuizSelected === oi;
                              let style = "bg-background border-card text-text";
                              if (lessonQuizAnswered) {
                                if (isCorrect) style = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                                else if (isSelected) style = "bg-red-500/20 border-red-500 text-red-400";
                                else style = "bg-card border-card text-subtext opacity-40";
                              }
                              return (
                                <button
                                  key={oi}
                                  type="button"
                                  disabled={lessonQuizAnswered}
                                  onClick={() => {
                                    setLessonQuizSelected(oi);
                                    setLessonQuizAnswered(true);
                                    if (oi === q.correctIndex) setLessonQuizScore(s => s + 1);
                                  }}
                                  className={`p-3 rounded-xl border text-xs text-left font-medium transition-all flex items-center justify-between ${style}`}
                                >
                                  <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                                  {lessonQuizAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                          {lessonQuizAnswered && (
                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs space-y-1">
                              <p className="font-bold text-primary">Explanation:</p>
                              <p className="text-text">{q.explanation}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  if (lessonQuizCurrentQ < editingLesson.lesson.quizQuestions!.length - 1) {
                                    setLessonQuizCurrentQ(c => c + 1);
                                    setLessonQuizSelected(null);
                                    setLessonQuizAnswered(false);
                                  } else {
                                    setLessonQuizPreview(false);
                                  }
                                }}
                                className="mt-2 w-full py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1"
                              >
                                {lessonQuizCurrentQ < editingLesson.lesson.quizQuestions!.length - 1 ? "Next Question →" : "Finish Test Preview ✓"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <>
                    {(editingLesson.lesson.quizQuestions?.length || 0) > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-subtext">
                          <span>{editingLesson.lesson.quizQuestions!.length} Questions Attached</span>
                          <button
                            type="button"
                            onClick={() => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, quizQuestions: [] } })}
                            className="text-rose-400 hover:underline"
                          >
                            Clear All Questions
                          </button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {editingLesson.lesson.quizQuestions!.map((q: any, qi: number) => (
                            <div key={qi} className="p-3 bg-background border border-card rounded-xl text-xs flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="font-bold text-text"><span className="text-amber-500">Q{qi + 1}.</span> {q.question}</p>
                                <p className="text-[11px] text-subtext">Correct: {String.fromCharCode(65 + (q.correctIndex || 0))}. {q.options?.[q.correctIndex || 0]}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteQFromLesson(qi)}
                                className="p-1 text-subtext hover:text-rose-400 rounded-lg shrink-0"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border-2 border-dashed border-card rounded-2xl text-center space-y-2">
                        <HelpCircle className="w-8 h-8 text-amber-500/30 mx-auto" />
                        <p className="text-xs font-bold text-text">No quiz questions attached to this lesson yet</p>
                        <p className="text-[11px] text-subtext">Use "AI Quiz Generator" above or add questions manually below.</p>
                      </div>
                    )}

                    <div className="p-4 bg-card/40 border border-card rounded-2xl space-y-3">
                      <p className="text-xs font-extrabold text-text flex items-center gap-1.5"><Plus className="w-4 h-4 text-amber-500" /> Add Custom Question Manually</p>
                      <input
                        type="text"
                        value={manualQForm.question}
                        onChange={e => setManualQForm({ ...manualQForm, question: e.target.value })}
                        placeholder="Enter Question Text..."
                        className="w-full bg-background border border-card rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-amber-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={manualQForm.optA}
                          onChange={e => setManualQForm({ ...manualQForm, optA: e.target.value })}
                          placeholder="Option A"
                          className="bg-background border border-card rounded-xl px-3 py-2 text-xs text-text outline-none"
                        />
                        <input
                          type="text"
                          value={manualQForm.optB}
                          onChange={e => setManualQForm({ ...manualQForm, optB: e.target.value })}
                          placeholder="Option B"
                          className="bg-background border border-card rounded-xl px-3 py-2 text-xs text-text outline-none"
                        />
                        <input
                          type="text"
                          value={manualQForm.optC}
                          onChange={e => setManualQForm({ ...manualQForm, optC: e.target.value })}
                          placeholder="Option C"
                          className="bg-background border border-card rounded-xl px-3 py-2 text-xs text-text outline-none"
                        />
                        <input
                          type="text"
                          value={manualQForm.optD}
                          onChange={e => setManualQForm({ ...manualQForm, optD: e.target.value })}
                          placeholder="Option D"
                          className="bg-background border border-card rounded-xl px-3 py-2 text-xs text-text outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-subtext">Correct Choice:</label>
                        <select
                          value={manualQForm.correctIndex}
                          onChange={e => setManualQForm({ ...manualQForm, correctIndex: Number(e.target.value) })}
                          className="bg-background border border-card rounded-xl px-3 py-1.5 text-xs text-text outline-none"
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                        <button
                          type="button"
                          onClick={addManualQToLesson}
                          disabled={!manualQForm.question.trim() || !manualQForm.optA.trim()}
                          className="ml-auto px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                        >
                          + Add Question
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 5: MULTIPLE DOWNLOADABLE RESOURCES / PDFS */}
            {editingLesson.tab === "resource" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-purple-400" />
                    <h4 className="font-bold text-sm text-text">Downloadable Files & Resources (Add Multiple)</h4>
                  </div>
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    {editingLesson.lesson.resources?.length || 0} Attached File{(editingLesson.lesson.resources?.length || 0) !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Resource File Upload Dropzone */}
                <div className="p-4 bg-card/40 border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl text-center space-y-2 transition-all">
                  <input
                    type="file"
                    id="resource-upload-file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.md,.json,.jpg,.png"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await handleFileUpload(file, "resource");
                      if (url && editingLesson) {
                        const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
                        let detectedType = "PDF Document";
                        if (ext === "ZIP" || ext === "RAR") detectedType = "Source Code ZIP";
                        else if (ext === "PPT" || ext === "PPTX") detectedType = "Presentation Slides";
                        else if (ext === "MD" || ext === "TXT") detectedType = "Documentation";
                        else if (ext === "DOC" || ext === "DOCX") detectedType = "Document";
                        else if (ext === "PDF") detectedType = "PDF Document";

                        const newRes: LessonResourceItem = {
                          id: `res-${Date.now()}`,
                          title: file.name.replace(/\.[^/.]+$/, ""),
                          url: url,
                          type: detectedType
                        };
                        const currentRes = editingLesson.lesson.resources || [];
                        setEditingLesson({
                          ...editingLesson,
                          lesson: {
                            ...editingLesson.lesson,
                            resources: [...currentRes, newRes]
                          }
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="resource-upload-file"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    {uploadingTarget === "resource" ? (
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-xs py-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Uploading & Attaching File...
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shadow-sm">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-text">Click or Drag & Drop to Upload Resource File</p>
                        <p className="text-[10px] text-subtext">Auto-attaches PDF, ZIP code, PPT slides, or documentation</p>
                      </>
                    )}
                  </label>
                </div>

                {/* Attached Files List */}
                {(editingLesson.lesson.resources?.length || 0) > 0 ? (
                  <div className="space-y-2.5">
                    <label className="block text-[11px] font-extrabold text-subtext uppercase tracking-wider">Currently Attached Files for Students</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {editingLesson.lesson.resources!.map((r, ri) => (
                        <div key={r.id || ri} className="p-3 bg-card border border-card rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="p-2 rounded-lg bg-purple-500/15 text-purple-400 font-bold shrink-0">
                              <Paperclip className="w-3.5 h-3.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-text truncate">{r.title}</p>
                              <p className="text-[10px] text-subtext truncate">{r.type} • {r.url}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-subtext hover:text-purple-400 bg-background rounded-lg text-[11px]"
                              title="Test link"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingLesson.lesson.resources || []).filter((_, i) => i !== ri);
                                setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, resources: updated } });
                              }}
                              className="p-1.5 text-subtext hover:text-rose-400 bg-background rounded-lg"
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border-2 border-dashed border-card rounded-2xl text-center space-y-1">
                    <p className="text-xs font-bold text-text">No downloadable files attached yet</p>
                    <p className="text-[11px] text-subtext">Upload files above or paste links below.</p>
                  </div>
                )}

                {/* Add New Resource Form */}
                <div className="p-4 bg-card/40 border border-card rounded-2xl space-y-3">
                  <p className="text-xs font-extrabold text-text flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-purple-400" /> + Add Resource from Link / URL
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-text mb-1">Resource Title *</label>
                      <input
                        type="text"
                        value={newResourceItem.title}
                        onChange={e => setNewResourceItem({ ...newResourceItem, title: e.target.value })}
                        placeholder="e.g. Chapter 1 Cheatsheet & Summary"
                        className="w-full bg-background border border-card rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text mb-1">Resource Category</label>
                      <select
                        value={newResourceItem.type}
                        onChange={e => setNewResourceItem({ ...newResourceItem, type: e.target.value })}
                        className="w-full bg-background border border-card rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-purple-500"
                      >
                        <option value="PDF Document">PDF Document</option>
                        <option value="Source Code ZIP">Source Code ZIP</option>
                        <option value="Presentation Slides">Presentation Slides (PPT/PDF)</option>
                        <option value="Documentation">Documentation / Article</option>
                        <option value="Cheatsheet">Cheatsheet / Guide</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text mb-1">File / Download URL *</label>
                    <input
                      type="text"
                      value={newResourceItem.url}
                      onChange={e => setNewResourceItem({ ...newResourceItem, url: e.target.value })}
                      placeholder="https://example.com/downloads/cheatsheet.pdf or /uploads/..."
                      className="w-full bg-background border border-card rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!newResourceItem.title.trim() || !newResourceItem.url.trim()}
                    onClick={() => {
                      const newRes: LessonResourceItem = {
                        id: `res-${Date.now()}`,
                        title: newResourceItem.title.trim(),
                        url: newResourceItem.url.trim(),
                        type: newResourceItem.type
                      };
                      const currentRes = editingLesson.lesson.resources || [];
                      setEditingLesson({
                        ...editingLesson,
                        lesson: {
                          ...editingLesson.lesson,
                          resources: [...currentRes, newRes]
                        }
                      });
                      setNewResourceItem({ title: "", url: "", type: "PDF Document" });
                      setToast({ message: `Added "${newRes.title}" to lesson resources!`, type: "success" });
                    }}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add File to Lesson
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: DIAGRAMS & IMAGES */}
            {editingLesson.tab === "image" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-rose-400" />
                    <h4 className="font-bold text-sm text-text">Attach Images & Visual Diagrams (Primary & 2nd Image)</h4>
                  </div>
                  {(editingLesson.lesson.imageUrl1?.trim() || editingLesson.lesson.imageUrl2?.trim()) && (
                    <button
                      type="button"
                      onClick={() => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, imageUrl1: "", imageUrl2: "" } })}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove Diagrams
                    </button>
                  )}
                </div>

                {/* Primary Diagram */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-text">Primary Image / Diagram URL *</label>
                    <label htmlFor="primary-diagram-upload" className="text-[11px] text-rose-400 hover:underline cursor-pointer flex items-center gap-1 font-bold">
                      <UploadCloud className="w-3.5 h-3.5" /> Upload Image File
                    </label>
                    <input
                      type="file"
                      id="primary-diagram-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await handleFileUpload(file, "image");
                        if (url && editingLesson) {
                          setEditingLesson({
                            ...editingLesson,
                            lesson: { ...editingLesson.lesson, imageUrl1: url }
                          });
                        }
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={editingLesson.lesson.imageUrl1 || ""}
                    onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, imageUrl1: e.target.value } })}
                    className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-xs font-medium text-text outline-none focus:border-rose-500 font-mono"
                    placeholder="https://images.unsplash.com/... or click Upload Image File above"
                  />
                </div>

                {/* Secondary Diagram */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-purple-400">📷 Second Image / Secondary Diagram URL (Optional)</label>
                    <label htmlFor="secondary-diagram-upload" className="text-[11px] text-purple-400 hover:underline cursor-pointer flex items-center gap-1 font-bold">
                      <UploadCloud className="w-3.5 h-3.5" /> Upload 2nd Image
                    </label>
                    <input
                      type="file"
                      id="secondary-diagram-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await handleFileUpload(file, "image");
                        if (url && editingLesson) {
                          setEditingLesson({
                            ...editingLesson,
                            lesson: { ...editingLesson.lesson, imageUrl2: url }
                          });
                        }
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={editingLesson.lesson.imageUrl2 || ""}
                    onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, imageUrl2: e.target.value } })}
                    className="w-full bg-card border border-purple-500/30 rounded-xl px-4 py-2.5 text-xs font-medium text-text outline-none focus:border-purple-500 font-mono"
                    placeholder="https://images.unsplash.com/... or click Upload 2nd Image above"
                  />
                </div>

                {(editingLesson.lesson.imageUrl1 || editingLesson.lesson.imageUrl2) && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {editingLesson.lesson.imageUrl1 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-rose-400 uppercase">Primary Image</span>
                        <div className="h-28 rounded-xl overflow-hidden border border-rose-500/30 bg-black/40 relative">
                          {/* eslint-disable-next-html-element-suppression */}
                          <img src={editingLesson.lesson.imageUrl1} alt="Primary preview" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                    {editingLesson.lesson.imageUrl2 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-purple-400 uppercase">2nd Image</span>
                        <div className="h-28 rounded-xl overflow-hidden border border-purple-500/30 bg-black/40 relative">
                          {/* eslint-disable-next-html-element-suppression */}
                          <img src={editingLesson.lesson.imageUrl2} alt="2nd preview" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: ARTICLE / READING NOTES */}
            {editingLesson.tab === "article" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="font-bold text-sm text-text">Lesson Article, Theory & Study Explanation</h4>
                      <p className="text-[11px] text-subtext">Students will read this in-depth guide directly in their learning dashboard.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Upload Pre-written Article / Markdown file */}
                    <input
                      type="file"
                      id="article-file-upload"
                      accept=".md,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const content = evt.target?.result as string;
                          if (content && editingLesson) {
                            setEditingLesson({
                              ...editingLesson,
                              lesson: {
                                ...editingLesson.lesson,
                                articleContent: content
                              }
                            });
                            setToast({ message: `Imported ${file.name} into article!`, type: "success" });
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                    <label
                      htmlFor="article-file-upload"
                      className="px-3 py-1.5 bg-card hover:bg-card/80 text-subtext hover:text-text border border-card rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Upload .md or .txt notes from your computer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Upload Notes (.md/.txt)</span>
                    </label>

                    <button
                      type="button"
                      disabled={articleAiGenerating}
                      onClick={generateAiArticleForLesson}
                      className="px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {articleAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>✨ AI Write Study Guide</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticlePreviewMode(!articlePreviewMode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        articlePreviewMode
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-card hover:bg-card/80 text-subtext border-card"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{articlePreviewMode ? "Edit Markdown" : "Student Reading View"}</span>
                    </button>
                    {editingLesson.lesson.articleContent?.trim() && (
                      <button
                        type="button"
                        onClick={() => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, articleContent: "" } })}
                        className="text-xs text-rose-400 hover:underline ml-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Markdown Toolbar (when editing) */}
                {!articlePreviewMode && (
                  <div className="flex items-center gap-1.5 flex-wrap p-2 bg-card/60 border border-card rounded-xl text-[11px] text-subtext">
                    <span className="font-extrabold text-[10px] uppercase text-subtext/60 mr-1">Quick Format:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = editingLesson.lesson.articleContent || "";
                        setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, articleContent: `${cur}\n\n## New Section Heading\n` } });
                      }}
                      className="px-2 py-1 bg-background hover:bg-card border border-card rounded-lg text-text font-bold"
                    >
                      + ## Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleImagePanelOpen(!articleImagePanelOpen)}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        articleImagePanelOpen
                          ? "bg-rose-500 text-white shadow-sm"
                          : "bg-background hover:bg-card border border-card text-rose-400 hover:text-rose-300"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> + 🖼 Insert Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = editingLesson.lesson.articleContent || "";
                        setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, articleContent: `${cur}\n\`\`\`javascript\n// Code snippet\nconst result = true;\n\`\`\`\n` } });
                      }}
                      className="px-2 py-1 bg-background hover:bg-card border border-card rounded-lg text-emerald-400 font-mono font-bold"
                    >
                      + &lt;/&gt; Code Block
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = editingLesson.lesson.articleContent || "";
                        setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, articleContent: `${cur}\n> **Key Takeaway**: Highlighted note for learners.\n` } });
                      }}
                      className="px-2 py-1 bg-background hover:bg-card border border-card rounded-lg text-cyan-400 font-bold"
                    >
                      + 💡 Callout Tip
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = editingLesson.lesson.articleContent || "";
                        setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, articleContent: `${cur}\n- Key Point 1\n- Key Point 2\n- Key Point 3\n` } });
                      }}
                      className="px-2 py-1 bg-background hover:bg-card border border-card rounded-lg text-purple-400 font-bold"
                    >
                      + • Bullet List
                    </button>
                  </div>
                )}

                {/* Inline Image Inserter Tool */}
                {articleImagePanelOpen && !articlePreviewMode && (
                  <div className="p-4 bg-gradient-to-r from-rose-500/10 via-card to-card border border-rose-500/30 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-extrabold text-text">Insert Image / Diagram into Article</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setArticleImagePanelOpen(false)}
                        className="text-subtext hover:text-text text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Image Upload Input */}
                    <div className="p-3 bg-background/80 border border-dashed border-rose-500/30 rounded-xl text-center">
                      <input
                        type="file"
                        id="article-image-file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await handleFileUpload(file, "image");
                          if (url) {
                            setArticleImageUrl(url);
                            if (!articleImageCaption.trim()) {
                              setArticleImageCaption(file.name.replace(/\.[^/.]+$/, ""));
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor="article-image-file"
                        className="cursor-pointer flex items-center justify-center gap-2 text-xs text-rose-400 font-bold hover:underline"
                      >
                        {uploadingTarget === "image" ? (
                          <span className="flex items-center gap-1.5"><Loader2 className="w-4 h-4 animate-spin" /> Uploading Image...</span>
                        ) : (
                          <span className="flex items-center gap-1.5"><UploadCloud className="w-4 h-4" /> Click to Upload Image from Device</span>
                        )}
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-text mb-1">Image URL / Link *</label>
                        <input
                          type="text"
                          value={articleImageUrl}
                          onChange={e => setArticleImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/... or uploaded path"
                          className="w-full bg-background border border-card rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-rose-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text mb-1">Image Caption / Alt Text</label>
                        <input
                          type="text"
                          value={articleImageCaption}
                          onChange={e => setArticleImageCaption(e.target.value)}
                          placeholder="e.g. Architecture Flowchart & Data Pipeline"
                          className="w-full bg-background border border-card rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-2 flex-wrap text-[10px]">
                      <span className="text-subtext font-bold">Sample Presets:</span>
                      {[
                        { label: "Architecture Diagram", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60" },
                        { label: "Code Flowchart", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60" },
                        { label: "AI Neural Net", url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60" },
                        { label: "Tech Setup", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60" },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setArticleImageUrl(preset.url);
                            setArticleImageCaption(preset.label);
                          }}
                          className="px-2 py-0.5 rounded-md bg-background hover:bg-card border border-card text-subtext hover:text-text font-medium cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {articleImageUrl && (
                      <div className="flex items-center gap-3 p-2 bg-background rounded-xl border border-card">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-card bg-black/40 shrink-0">
                          {/* eslint-disable-next-html-element-suppression */}
                          <img src={articleImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-text truncate">{articleImageCaption || "Embedded Image"}</p>
                          <p className="text-[10px] text-subtext truncate font-mono">{articleImageUrl}</p>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={!articleImageUrl.trim()}
                      onClick={() => {
                        const caption = articleImageCaption.trim() || "Illustration Diagram";
                        const imgMd = `\n\n![${caption}](${articleImageUrl.trim()})\n*Figure: ${caption}*\n\n`;
                        const cur = editingLesson.lesson.articleContent || "";
                        setEditingLesson({
                          ...editingLesson,
                          lesson: {
                            ...editingLesson.lesson,
                            articleContent: `${cur}${imgMd}`
                          }
                        });
                        setArticleImageUrl("");
                        setArticleImageCaption("");
                        setArticleImagePanelOpen(false);
                        setToast({ message: `Inserted image "${caption}" into article!`, type: "success" });
                      }}
                      className="w-full py-2 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Insert Image at Bottom of Article
                    </button>
                  </div>
                )}

                {/* Editor or Preview Mode */}
                {articlePreviewMode ? (
                  <div className="p-5 bg-card/40 border border-card rounded-2xl max-h-80 overflow-y-auto space-y-3 text-xs leading-relaxed text-text">
                    <div className="flex items-center justify-between pb-2 border-b border-card text-[11px] text-subtext font-bold">
                      <span className="text-cyan-400 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Rendered Student Reading View</span>
                      <span>📖 ~{Math.max(1, Math.round(((editingLesson.lesson.articleContent || "").split(/\s+/).length || 1) / 200))} min read</span>
                    </div>
                    {editingLesson.lesson.articleContent ? (
                      <div className="space-y-3 font-sans">
                        {editingLesson.lesson.articleContent.split("\n\n").map((block, bIdx) => {
                          const imgMatch = block.match(/!\[(.*?)\]\((.*?)\)/);
                          if (imgMatch) {
                            const altText = imgMatch[1] || "Diagram";
                            const srcUrl = imgMatch[2];
                            const captionLine = block.split("\n").find(l => l.startsWith("*Figure:"));
                            return (
                              <div key={bIdx} className="my-4 p-2 bg-background border border-card rounded-2xl space-y-1.5 text-center shadow-sm">
                                <div className="rounded-xl overflow-hidden max-h-72 bg-black/40 border border-card">
                                  {/* eslint-disable-next-html-element-suppression */}
                                  <img src={srcUrl} alt={altText} className="w-full h-auto max-h-72 object-contain mx-auto" />
                                </div>
                                <p className="text-[11px] text-subtext font-medium italic">
                                  {captionLine ? captionLine.replace(/\*/g, "") : altText}
                                </p>
                              </div>
                            );
                          }
                          if (block.startsWith("# ")) {
                            return <h1 key={bIdx} className="text-xl font-extrabold text-text pt-2 pb-1 border-b border-card">{block.replace("# ", "")}</h1>;
                          }
                          if (block.startsWith("## ")) {
                            return <h2 key={bIdx} className="text-base font-bold text-text pt-2 text-cyan-400">{block.replace("## ", "")}</h2>;
                          }
                          if (block.startsWith("### ")) {
                            return <h3 key={bIdx} className="text-sm font-bold text-text pt-1 text-purple-400">{block.replace("### ", "")}</h3>;
                          }
                          if (block.startsWith("> ")) {
                            return (
                              <div key={bIdx} className="p-3 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-xl text-xs text-text italic">
                                {block.replace("> ", "")}
                              </div>
                            );
                          }
                          if (block.startsWith("```")) {
                            const codeLines = block.replace(/```[a-z]*/g, "").trim();
                            return (
                              <pre key={bIdx} className="p-3 bg-background border border-card rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto">
                                {codeLines}
                              </pre>
                            );
                          }
                          return <p key={bIdx} className="text-text/90 leading-relaxed whitespace-pre-line">{block}</p>;
                        })}
                      </div>
                    ) : (
                      <p className="text-subtext/60 italic">No article text written yet. Click "Edit Markdown" to write content.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-text mb-1 flex items-center justify-between">
                      <span>Article & Explanation Content (Markdown Supported)</span>
                      <span className="text-[11px] text-subtext font-medium">
                        {(editingLesson.lesson.articleContent || "").split(/\s+/).filter(Boolean).length} words
                      </span>
                    </label>
                    <textarea
                      rows={9}
                      value={editingLesson.lesson.articleContent || ""}
                      onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, articleContent: e.target.value } })}
                      className="w-full bg-card border border-card rounded-xl p-4 text-xs font-mono text-text outline-none focus:border-cyan-500 leading-relaxed"
                      placeholder={`# ${editingLesson.lesson.title}\n\n## 1. Overview\nExplain core theoretical concepts in depth for students to read along with video and coding exercises...\n\n## 2. Practical Explanation\nProvide step-by-step guidance, code samples, and architectural breakdowns...\n\n### Key Takeaways\n- Point 1\n- Point 2`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Modal Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-card">
              <span className="text-xs text-subtext">
                All attached materials will be saved to this topic.
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditingLesson(null)} className="px-5 py-2.5 bg-card text-subtext rounded-xl font-bold text-xs cursor-pointer">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveLessonDetails}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Save className="w-4 h-4" /> Save All Materials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
