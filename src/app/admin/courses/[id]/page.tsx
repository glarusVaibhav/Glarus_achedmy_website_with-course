"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Play,
  PlayCircle,
  Video,
  FileText,
  HelpCircle,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  IndianRupee,
  Star,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  Award,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Volume2,
  FileCode,
  FolderArchive,
  Info,
  Edit3,
  Image as ImageIcon,
  UploadCloud,
  Plus,
  Trash2,
  Eye,
  Copy,
  CheckCheck,
  Maximize2,
  Code2,
  FileUp,
  Save,
  Loader2,
  ArrowUpRight,
  GripVertical,
  Settings,
  RefreshCw
} from "lucide-react";
import { formatDate } from "@/lib/dateTime";
import {
  MOCK_DETAILED_COURSES,
  DetailedCoursePreview,
  LessonItem,
  SectionItem,
  getDetailedCourseById
} from "@/lib/mockCoursesDetailed";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const courseId = resolvedParams.id;

  // Course and UI state
  const [course, setCourse] = useState<DetailedCoursePreview | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "quality" | "pricing">("overview");
  
  // Media Viewer Sub-Tab state (when a lesson has multiple materials)
  const [activeMediaTab, setActiveMediaTab] = useState<"video" | "image" | "quiz" | "sandbox" | "resource" | "notes">("video");
  
  // Lightbox for photos
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);
  
  // Interactive Quiz test mode state
  const [quizTestMode, setQuizTestMode] = useState<boolean>(false);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  
  // Copy code feedback state
  const [copiedCode, setCopiedCode] = useState(false);

  // Admin decision & feedback modal state
  const [feedbackNote, setFeedbackNote] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [processingDecision, setProcessingDecision] = useState(false);
  const [decisionBanner, setDecisionBanner] = useState<{ text: string; type: "success" | "warning" | "error" } | null>(null);

  // ── ADMIN EDIT STUDIO MODE STATE ──
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStudioTab, setEditStudioTab] = useState<"general" | "curriculum" | "outcomes">("curriculum");
  const [savingChanges, setSavingChanges] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Editable Form & Curriculum Buffers
  const [editForm, setEditForm] = useState({
    title: "",
    subtitle: "",
    category: "AI & Technology",
    level: "Intermediate",
    duration: "4 Modules",
    price: 4999,
    originalPrice: 9999,
    description: "",
    previewVideoUrl: "",
    outcomes: [] as string[],
    prerequisites: [] as string[],
    targetAudience: ""
  });

  const [editSections, setEditSections] = useState<SectionItem[]>([]);
  const [editingLessonModal, setEditingLessonModal] = useState<{
    sectionIdx: number;
    lessonIdx: number;
    lesson: LessonItem;
  } | null>(null);

  // Load Course Data from API / Mock
  const loadCourse = async () => {
    const mockFound = getDetailedCourseById(courseId);

    try {
      const res = await fetch(`/api/admin/courses/${encodeURIComponent(courseId)}`);
      if (res.ok) {
        const data = await res.json();
        const dbCourse = data.course;

        if (dbCourse) {
          // Parse JSON fields safely
          const parseSafe = (val: any, fallback: any = []) => {
            if (!val) return fallback;
            if (typeof val === "object") return val;
            try { return JSON.parse(val); } catch { return fallback; }
          };

          const rawOutcomes = parseSafe(dbCourse.learningOutcomes, [
            "Master core concepts and architectural building blocks",
            "Implement end-to-end practical projects and real-world workflows",
            "Deploy production-ready solutions with best practices"
          ]);
          const outcomes = Array.isArray(rawOutcomes)
            ? rawOutcomes.map((o: any) => typeof o === "object" ? (o.title || o.description || JSON.stringify(o)) : String(o))
            : [];

          // Map DB modules and lectures to our rich sections format
          const sections: SectionItem[] = dbCourse.modules?.map((m: any, mIdx: number) => ({
            id: m.id || `m-${mIdx}`,
            title: m.title || `Section ${mIdx + 1}: Module`,
            description: "Structured curriculum lectures and materials.",
            items:
              m.lectures?.map((l: any, lIdx: number) => {
                const quizQuestions = parseSafe(l.quizQuestions, []);
                const resources = parseSafe(l.resources, []);
                const deliverables = parseSafe(l.deliverables, []);

                // Determine effective lesson type
                let effectiveType: LessonItem["type"] = (l.type as any) || "video";
                if ((effectiveType as string) === "empty" || !effectiveType) {
                  if (quizQuestions.length > 0) effectiveType = "quiz";
                  else if (l.imageUrl1 || l.imageUrl2) effectiveType = "image";
                  else if (l.sandboxCode) effectiveType = "sandbox";
                  else if (resources.length > 0) effectiveType = "resource";
                  else effectiveType = "video";
                }

                return {
                  id: l.id || `l-${lIdx}`,
                  title: l.title || `Lecture ${lIdx + 1}`,
                  type: effectiveType,
                  duration: l.duration || "15m 00s",
                  videoUrl: l.videoUrl || "",
                  description: l.description || "Full lesson content and practical instruction.",
                  notes: l.notesContent || l.notes || "",
                  notesContent: l.notesContent || "",
                  articleContent: l.articleContent || "",
                  imageUrl1: l.imageUrl1 || "",
                  imageUrl2: l.imageUrl2 || "",
                  imageCaption: l.imageCaption || "",
                  sandboxLang: l.sandboxLang || "python",
                  sandboxCode: l.sandboxCode || "",
                  quizQuestions: quizQuestions.length > 0 ? quizQuestions : undefined,
                  resources: resources.length > 0 ? resources : undefined,
                  deliverables: deliverables.length > 0 ? deliverables : undefined,
                  starterFileName: l.starterFileName || undefined,
                  starterFileUrl: l.starterFileUrl || undefined,
                  assignmentBrief: l.assignmentBrief || undefined,
                  resourceUrl: resources?.[0]?.url || l.starterFileUrl || undefined,
                  resourceFileName: resources?.[0]?.title || l.starterFileName || undefined
                };
              }) || []
          })) || [];

          // Add default fallback quiz & asset if empty
          if (sections.length > 0 && sections[0].items.length > 0) {
            const hasQuiz = sections.some(s => s.items.some(i => i.type === "quiz" || (i.quizQuestions && i.quizQuestions.length > 0)));
            if (!hasQuiz) {
              sections[0].items.push({
                id: `quiz-db-${dbCourse.id}`,
                title: "Module Knowledge Check & Quiz",
                type: "quiz",
                duration: "10 mins",
                description: "Comprehensive assessment covering module fundamentals.",
                quizQuestions: [
                  {
                    question: `What is the core concept taught in ${dbCourse.title}?`,
                    options: [
                      "Architectural design and best practices",
                      "Random guess testing",
                      "Legacy code maintenance",
                      "Manual deployments"
                    ],
                    correctAnswerIndex: 0,
                    correctIndex: 0,
                    explanation: "This course emphasizes high-scale modern architectural design and production practices."
                  }
                ]
              });
            }
          }

          const statusMap: Record<string, DetailedCoursePreview["status"]> = {
            APPROVED: "PUBLISHED",
            PUBLISHED: "PUBLISHED",
            PENDING: "PENDING_APPROVAL",
            REJECTED: "REJECTED",
            DRAFT: "DRAFT"
          };

          const mappedCourse: DetailedCoursePreview = {
            id: dbCourse.id,
            title: dbCourse.title,
            instructorId: dbCourse.instructor?.id || "inst-1",
            instructor: dbCourse.instructor?.name || "Expert Faculty",
            instructorEmail: dbCourse.instructor?.email || "instructor@glarus.edu",
            instructorAvatar: dbCourse.instructor?.name
              ?.split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "IN",
            category: dbCourse.category || "AI & Technology",
            price: dbCourse.price || 4999,
            level: (dbCourse.level as any) || "Intermediate",
            duration: dbCourse.duration || `${dbCourse.modules?.length || 4} Modules`,
            enrolledStudents: dbCourse.enrollments?.length || 0,
            revenue: (dbCourse.purchases?.length || 0) * (dbCourse.price || 4999),
            status: statusMap[dbCourse.status] || "PENDING_APPROVAL",
            rating: dbCourse.rating || 5.0,
            reviewsCount: dbCourse.reviewsCount || 12,
            updatedAt: dbCourse.updatedAt ? formatDate(dbCourse.updatedAt) : "Recent",
            previewVideoUrl: dbCourse.previewVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            thumbnailGradient: "from-purple-900 to-indigo-950",
            description:
              dbCourse.description ||
              "A comprehensive curriculum built to guide students through production-grade engineering concepts, real-world patterns, and hands-on projects.",
            prerequisites: [
              "Basic programming knowledge in Python / TypeScript",
              "Understanding of modern web application concepts"
            ],
            outcomes: outcomes.length > 0 ? outcomes : [
              "Master core concepts and architectural building blocks",
              "Implement end-to-end practical projects and real-world workflows",
              "Deploy production-ready solutions with best practices"
            ],
            targetAudience: "Engineers and developers looking to elevate their practical engineering skillset.",
            aiQualityReport: {
              status: "OPTIMAL",
              flags: [],
              audioScore: 96,
              videoClarityScore: 98,
              completenessScore: 95
            },
            sections: sections.length > 0 ? sections : (mockFound?.sections || MOCK_DETAILED_COURSES[0].sections)
          };

          setCourse(mappedCourse);
          setEditForm({
            title: mappedCourse.title,
            subtitle: dbCourse.subtitle || "",
            category: mappedCourse.category,
            level: mappedCourse.level,
            duration: mappedCourse.duration,
            price: mappedCourse.price,
            originalPrice: dbCourse.originalPrice || mappedCourse.price * 2,
            description: mappedCourse.description,
            previewVideoUrl: mappedCourse.previewVideoUrl,
            outcomes: mappedCourse.outcomes,
            prerequisites: mappedCourse.prerequisites,
            targetAudience: mappedCourse.targetAudience
          });
          setEditSections(mappedCourse.sections);

          if (mappedCourse.sections[0]?.items[0]) {
            const first = mappedCourse.sections[0].items[0];
            setActiveLesson(first);
            setDefaultMediaTab(first);
          }
          return;
        }
      }
    } catch {
      /* ignore */
    }

    // If mock fallback
    if (mockFound) {
      setCourse(mockFound);
      setEditForm({
        title: mockFound.title,
        subtitle: "",
        category: mockFound.category,
        level: mockFound.level,
        duration: mockFound.duration,
        price: mockFound.price,
        originalPrice: mockFound.price * 2,
        description: mockFound.description,
        previewVideoUrl: mockFound.previewVideoUrl,
        outcomes: mockFound.outcomes,
        prerequisites: mockFound.prerequisites,
        targetAudience: mockFound.targetAudience
      });
      setEditSections(mockFound.sections);
      if (mockFound.sections[0]?.items[0]) {
        setActiveLesson(mockFound.sections[0].items[0]);
        setDefaultMediaTab(mockFound.sections[0].items[0]);
      }
    } else {
      const fallback = MOCK_DETAILED_COURSES[0];
      setCourse(fallback);
      setEditSections(fallback.sections);
      if (fallback.sections[0]?.items[0]) {
        setActiveLesson(fallback.sections[0].items[0]);
        setDefaultMediaTab(fallback.sections[0].items[0]);
      }
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  // Set default media tab based on lesson content
  const setDefaultMediaTab = (item: LessonItem) => {
    if (item.videoUrl && item.videoUrl.trim()) {
      setActiveMediaTab("video");
    } else if (item.imageUrl1 || item.imageUrl2) {
      setActiveMediaTab("image");
    } else if (item.quizQuestions && item.quizQuestions.length > 0) {
      setActiveMediaTab("quiz");
    } else if (item.sandboxCode) {
      setActiveMediaTab("sandbox");
    } else if ((item.resources && item.resources.length > 0) || item.resourceUrl) {
      setActiveMediaTab("resource");
    } else if (item.articleContent || item.notesContent) {
      setActiveMediaTab("notes");
    } else {
      setActiveMediaTab("video");
    }
    // Reset test mode
    setQuizTestMode(false);
    setUserQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleSelectLesson = (lesson: LessonItem) => {
    setActiveLesson(lesson);
    setDefaultMediaTab(lesson);
  };

  // Handle Publish / Unpublish Toggle
  const handleTogglePublish = async (nextPublish: boolean) => {
    if (!course) return;
    setProcessingDecision(true);
    try {
      const res = await fetch(`/api/admin/courses/${encodeURIComponent(course.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: nextPublish,
          status: nextPublish ? "PUBLISHED" : "DRAFT"
        })
      });

      if (!res.ok) throw new Error("Failed to update status");

      const newStatus: DetailedCoursePreview["status"] = nextPublish ? "PUBLISHED" : "DRAFT";
      setCourse((prev) => (prev ? { ...prev, status: newStatus } : null));

      setDecisionBanner({
        text: nextPublish
          ? "Course published live on catalog and student portal!"
          : "Course unpublished and hidden from platform catalog.",
        type: nextPublish ? "success" : "warning"
      });
    } catch {
      alert("Failed to update publish status. Please check your connection.");
    } finally {
      setProcessingDecision(false);
    }
  };

  // Handle Admin Decision (Approval / Rejection)
  const handleDecision = async (decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED") => {
    if (!course) return;
    setProcessingDecision(true);
    try {
      await fetch("/api/admin/approvals/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          decision: decision === "CHANGES_REQUESTED" ? "REJECTED" : decision,
          feedback: feedbackNote.trim() || undefined
        })
      });

      const newStatus: DetailedCoursePreview["status"] =
        decision === "APPROVED" ? "PUBLISHED" : decision === "REJECTED" ? "REJECTED" : "PENDING_APPROVAL";

      setCourse((prev) => (prev ? { ...prev, status: newStatus } : null));

      setDecisionBanner({
        text:
          decision === "APPROVED"
            ? "Course approved and published to platform successfully!"
            : decision === "REJECTED"
            ? "Course curriculum has been rejected."
            : "Feedback and change request sent to instructor.",
        type: decision === "APPROVED" ? "success" : decision === "REJECTED" ? "error" : "warning"
      });

      setShowFeedbackModal(false);
      setFeedbackNote("");
    } catch {
      alert("Failed to submit approval decision. Please check your connection.");
    } finally {
      setProcessingDecision(false);
    }
  };

  // File Upload Helper for Admin Editor
  const handleAdminFileUpload = async (file: File, category: "video" | "image" | "resource") => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      if (course?.id) {
        formData.append("courseId", course.id);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        return data.url;
      } else {
        const err = await res.json();
        alert(err.error || "File upload failed");
        return null;
      }
    } catch (e: any) {
      alert("Upload failed: " + e.message);
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  // ── SAVE ALL ADMIN EDITS TO DATABASE ──
  const handleSaveAllChanges = async () => {
    if (!course) return;
    setSavingChanges(true);
    try {
      const payload = {
        title: editForm.title.trim() || course.title,
        subtitle: editForm.subtitle.trim() || null,
        category: editForm.category,
        level: editForm.level,
        duration: editForm.duration,
        price: parseFloat(String(editForm.price)) || 0,
        originalPrice: parseFloat(String(editForm.originalPrice)) || 0,
        description: editForm.description,
        previewVideoUrl: editForm.previewVideoUrl || null,
        learningOutcomes: editForm.outcomes,
        prerequisites: editForm.prerequisites,
        targetAudience: editForm.targetAudience,
        modules: editSections.map((sec, sIdx) => ({
          title: sec.title,
          order: sIdx + 1,
          lessons: sec.items.map((item, lIdx) => ({
            title: item.title,
            type: item.type,
            duration: item.duration || "15m 00s",
            videoUrl: item.videoUrl || null,
            description: item.description || null,
            notesContent: item.notesContent || item.notes || null,
            articleContent: item.articleContent || null,
            imageUrl1: item.imageUrl1 || null,
            imageUrl2: item.imageUrl2 || null,
            imageCaption: item.imageCaption || null,
            sandboxLang: item.sandboxLang || null,
            sandboxCode: item.sandboxCode || null,
            quizQuestions: item.quizQuestions || undefined,
            resources: item.resources || (item.resourceUrl ? [{ id: `res-${lIdx}`, title: item.resourceFileName || item.title, url: item.resourceUrl, type: "PDF" }] : undefined),
            starterFileName: item.starterFileName || null,
            starterFileUrl: item.starterFileUrl || null,
            assignmentBrief: item.assignmentBrief || null,
            deliverables: item.deliverables || undefined,
            order: lIdx + 1
          }))
        }))
      };

      const res = await fetch(`/api/admin/courses/${encodeURIComponent(course.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save course changes");
      }

      setDecisionBanner({
        text: "Course content, media, quizzes, and curriculum successfully updated in database!",
        type: "success"
      });

      setIsEditMode(false);
      await loadCourse();
    } catch (e: any) {
      alert("Error saving course: " + e.message);
    } finally {
      setSavingChanges(false);
    }
  };

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 animate-pulse">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-text">Loading Course Preview & Curriculum...</p>
      </div>
    );
  }

  const isCoursePublished = course.status === "PUBLISHED";

  // Check which media tabs are available for active lesson
  const hasVideo = Boolean(activeLesson?.videoUrl && activeLesson.videoUrl.trim());
  const hasImages = Boolean(activeLesson?.imageUrl1?.trim() || activeLesson?.imageUrl2?.trim());
  const hasQuiz = Boolean(activeLesson?.quizQuestions && activeLesson.quizQuestions.length > 0);
  const hasSandbox = Boolean(activeLesson?.sandboxCode && activeLesson.sandboxCode.trim());
  const hasResources = Boolean((activeLesson?.resources && activeLesson.resources.length > 0) || activeLesson?.resourceUrl?.trim() || activeLesson?.starterFileUrl?.trim());
  const hasNotes = Boolean(activeLesson?.articleContent?.trim() || activeLesson?.notesContent?.trim() || activeLesson?.notes?.trim() || activeLesson?.description?.trim());

  return (
    <div className="space-y-6 pb-20 font-sans animate-in fade-in duration-300">
      {/* ── TOP ACTION & STATUS BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card/80 border border-white/10 text-xs font-bold text-subtext hover:text-text transition-all shadow-sm hover:-translate-x-0.5 group w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Course Management</span>
        </Link>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
          {/* TOGGLE EDIT STUDIO BUTTON */}
          <button
            onClick={() => {
              if (isEditMode) {
                setIsEditMode(false);
              } else {
                setEditSections(course.sections);
                setIsEditMode(true);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer ${
              isEditMode
                ? "bg-amber-500 hover:bg-amber-400 text-black font-black ring-2 ring-amber-400/50"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditMode ? "Exit Studio Editor" : "✏️ Edit Course in Studio"}</span>
          </button>

          {isCoursePublished ? (
            <button
              onClick={() => handleTogglePublish(false)}
              disabled={processingDecision}
              className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Unpublish Course</span>
            </button>
          ) : (
            <button
              onClick={() => handleTogglePublish(true)}
              disabled={processingDecision}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Publish Course Live</span>
            </button>
          )}

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-3.5 py-2 rounded-xl bg-card hover:bg-white/5 border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Review & Notes</span>
          </button>
        </div>
      </div>

      {/* Decision Status Banner */}
      {decisionBanner && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in ${
            decisionBanner.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : decisionBanner.type === "warning"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-red-500/10 text-red-400 border-red-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {decisionBanner.type === "success" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{decisionBanner.text}</span>
          </div>
          <button onClick={() => setDecisionBanner(null)} className="text-subtext hover:text-text p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── COURSE HEADER HERO CARD ── */}
      <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Self-Paced Course
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 text-subtext border border-white/10">
                {course.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 text-subtext border border-white/10">
                Level: {course.level}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                  course.status === "PUBLISHED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : course.status === "PENDING_APPROVAL"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : course.status === "DRAFT"
                    ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                {course.status.replace("_", " ")}
              </span>
              {isEditMode && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  STUDIO EDIT MODE ACTIVE
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-subtext font-medium pt-0.5">
              <span className="flex items-center gap-1.5 text-text font-bold">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Instructor: {course.instructor} ({course.instructorEmail})
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                {course.sections.length} Sections •{" "}
                {course.sections.reduce((acc, s) => acc + s.items.length, 0)} Lessons
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {course.rating > 0 ? `${course.rating} (${course.reviewsCount} reviews)` : "New Course"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-background/50 border border-white/5 p-4 rounded-2xl shrink-0">
            <div className="text-left md:text-right">
              <span className="text-[10px] uppercase font-bold text-subtext block">Enrollment Fee</span>
              <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
                ₹{course.price.toLocaleString()}
              </span>
              <span className="text-[10px] text-subtext/70 block">
                {course.enrolledStudents} students enrolled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODE 1: ADMIN STUDIO EDITOR MODE (FULL EDIT & REVIEW CAPABILITIES)
          ═══════════════════════════════════════════════════════════════════ */}
      {isEditMode ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Studio Navigation Bar */}
          <div className="bg-card border border-purple-500/30 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-background/60 p-1.5 rounded-2xl border border-white/5">
              <button
                onClick={() => setEditStudioTab("curriculum")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editStudioTab === "curriculum" ? "bg-purple-600 text-white shadow-md" : "text-subtext hover:text-text"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Curriculum & Media Studio</span>
              </button>
              <button
                onClick={() => setEditStudioTab("general")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editStudioTab === "general" ? "bg-purple-600 text-white shadow-md" : "text-subtext hover:text-text"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>General & Pricing</span>
              </button>
              <button
                onClick={() => setEditStudioTab("outcomes")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editStudioTab === "outcomes" ? "bg-purple-600 text-white shadow-md" : "text-subtext hover:text-text"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Outcomes & FAQs</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 rounded-xl bg-background hover:bg-white/5 border border-white/10 text-xs font-bold text-subtext hover:text-text transition-all cursor-pointer"
              >
                Cancel / Discard
              </button>

              <button
                onClick={handleSaveAllChanges}
                disabled={savingChanges}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                {savingChanges ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Course Changes</span>
              </button>
            </div>
          </div>

          {/* TAB 1: CURRICULUM & MEDIA STUDIO */}
          {editStudioTab === "curriculum" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-text">Course Curriculum & Learning Materials</h3>
                  <p className="text-xs text-subtext">Add, reorder, and configure lectures, videos, photos, quizzes, and code sandboxes.</p>
                </div>

                <button
                  onClick={() => {
                    const newSecId = `sec-${Date.now()}`;
                    setEditSections(prev => [
                      ...prev,
                      {
                        id: newSecId,
                        title: `Section ${prev.length + 1}: New Curriculum Module`,
                        items: []
                      }
                    ]);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Module</span>
                </button>
              </div>

              <div className="space-y-4">
                {editSections.map((sec, sIdx) => (
                  <div key={sec.id} className="bg-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditSections(prev => prev.map((s, idx) => idx === sIdx ? { ...s, title: val } : s));
                          }}
                          className="bg-background/60 border border-white/10 rounded-xl px-3.5 py-1.5 text-sm font-bold text-text w-full max-w-lg focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newLesson: LessonItem = {
                              id: `l-${Date.now()}`,
                              title: `New Lesson ${sec.items.length + 1}`,
                              type: "video",
                              duration: "15m 00s",
                              videoUrl: "",
                              description: "",
                              imageUrl1: "",
                              imageUrl2: "",
                              quizQuestions: [],
                              sandboxCode: "",
                              resources: []
                            };
                            setEditSections(prev => prev.map((s, idx) => idx === sIdx ? { ...s, items: [...s.items, newLesson] } : s));
                            setEditingLessonModal({ sectionIdx: sIdx, lessonIdx: sec.items.length, lesson: newLesson });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Lesson</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete module "${sec.title}" and its lessons?`)) {
                              setEditSections(prev => prev.filter((_, idx) => idx !== sIdx));
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons list inside section */}
                    <div className="space-y-2.5">
                      {sec.items.map((item, lIdx) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-background/50 border border-white/5 flex items-center justify-between gap-4 hover:border-purple-500/30 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono text-subtext">{lIdx + 1}.</span>
                            {item.type === "video" && <Video className="w-4 h-4 text-purple-400 shrink-0" />}
                            {item.type === "image" && <ImageIcon className="w-4 h-4 text-rose-400 shrink-0" />}
                            {item.type === "quiz" && <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                            {item.type === "sandbox" && <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {item.type === "resource" && <FileText className="w-4 h-4 text-sky-400 shrink-0" />}

                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-text truncate">{item.title}</h5>
                              <div className="flex items-center gap-2 text-[10px] text-subtext mt-0.5">
                                <span>{item.duration || "15m 00s"}</span>
                                {item.videoUrl && <span className="text-purple-400 font-bold">• 📹 Video</span>}
                                {(item.imageUrl1 || item.imageUrl2) && <span className="text-rose-400 font-bold">• 🖼️ Photo/Diagram</span>}
                                {item.quizQuestions && item.quizQuestions.length > 0 && (
                                  <span className="text-amber-400 font-bold">• ❓ Quiz ({item.quizQuestions.length} Qs)</span>
                                )}
                                {item.sandboxCode && <span className="text-emerald-400 font-bold">• 💻 Sandbox</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setEditingLessonModal({ sectionIdx: sIdx, lessonIdx: lIdx, lesson: { ...item } })}
                              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Materials</span>
                            </button>

                            <button
                              onClick={() => {
                                setEditSections(prev =>
                                  prev.map((s, idx) =>
                                    idx === sIdx ? { ...s, items: s.items.filter((_, li) => li !== lIdx) } : s
                                  )
                                );
                              }}
                              className="p-1.5 rounded-xl bg-card hover:bg-red-500/20 border border-white/5 text-subtext hover:text-red-400 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {sec.items.length === 0 && (
                        <div className="py-6 text-center text-xs text-subtext/70 border border-dashed border-white/10 rounded-2xl">
                          No lessons added yet in this module. Click "+ Add Lesson" above.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: GENERAL & PRICING */}
          {editStudioTab === "general" && (
            <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <h3 className="text-base font-black text-text">Course Details & Pricing</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-subtext uppercase">Course Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-subtext uppercase">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-subtext uppercase">Difficulty Level</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value as any })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-subtext uppercase">Listing Price (₹ INR)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-subtext uppercase">Original / Strike Price (₹ INR)</label>
                  <input
                    type="number"
                    value={editForm.originalPrice}
                    onChange={(e) => setEditForm({ ...editForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-subtext uppercase">Preview Video URL</label>
                  <input
                    type="text"
                    value={editForm.previewVideoUrl}
                    onChange={(e) => setEditForm({ ...editForm, previewVideoUrl: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-subtext uppercase">Full Course Description</label>
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl p-4 text-xs text-text font-medium focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OUTCOMES & FAQS */}
          {editStudioTab === "outcomes" && (
            <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-text">Learning Outcomes</h3>
                <button
                  onClick={() => setEditForm(prev => ({ ...prev, outcomes: [...prev.outcomes, "New learning milestone"] }))}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Outcome</span>
                </button>
              </div>

              <div className="space-y-2">
                {editForm.outcomes.map((out, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={out}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditForm(prev => ({
                          ...prev,
                          outcomes: prev.outcomes.map((item, idx) => idx === oIdx ? val : item)
                        }));
                      }}
                      className="flex-1 bg-background border border-white/10 rounded-xl px-3.5 py-2 text-xs text-text font-medium focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => setEditForm(prev => ({ ...prev, outcomes: prev.outcomes.filter((_, idx) => idx !== oIdx) }))}
                      className="p-2 rounded-xl bg-card hover:bg-red-500/20 text-subtext hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════
            MODE 2: INTERACTIVE PREVIEW & MULTI-MATERIAL VIEWER
            ═══════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── LEFT / CENTER COLUMN: INTERACTIVE PREVIEW VIEWER (8 COLS) ── */}
          <div className="lg:col-span-8 space-y-6">
            {/* WORKSPACE CARD */}
            <div className="bg-card border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              {/* ── MULTI-MATERIAL CONTENT SWITCHER BAR ── */}
              <div className="p-3.5 bg-background/80 border-b border-white/10 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
                <div className="flex items-center gap-1.5 shrink-0">
                  {hasVideo && (
                    <button
                      onClick={() => setActiveMediaTab("video")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeMediaTab === "video"
                          ? "bg-purple-600 text-white shadow-sm font-black"
                          : "bg-card/60 text-subtext hover:text-text border border-white/5"
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-purple-300" />
                      <span>Video Lecture</span>
                    </button>
                  )}

                  {hasImages && (
                    <button
                      onClick={() => setActiveMediaTab("image")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeMediaTab === "image"
                          ? "bg-rose-600 text-white shadow-sm font-black"
                          : "bg-card/60 text-subtext hover:text-text border border-white/5"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-rose-300" />
                      <span>Photos & Diagrams ({(activeLesson?.imageUrl1 ? 1 : 0) + (activeLesson?.imageUrl2 ? 1 : 0)})</span>
                    </button>
                  )}

                  {hasQuiz && (
                    <button
                      onClick={() => setActiveMediaTab("quiz")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeMediaTab === "quiz"
                          ? "bg-amber-500 text-black shadow-sm font-black"
                          : "bg-card/60 text-subtext hover:text-text border border-white/5"
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Quiz & MCQs ({activeLesson?.quizQuestions?.length || 0})</span>
                    </button>
                  )}

                  {hasSandbox && (
                    <button
                      onClick={() => setActiveMediaTab("sandbox")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeMediaTab === "sandbox"
                          ? "bg-emerald-600 text-white shadow-sm font-black"
                          : "bg-card/60 text-subtext hover:text-text border border-white/5"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Code Sandbox</span>
                    </button>
                  )}

                  {hasResources && (
                    <button
                      onClick={() => setActiveMediaTab("resource")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeMediaTab === "resource"
                          ? "bg-sky-600 text-white shadow-sm font-black"
                          : "bg-card/60 text-subtext hover:text-text border border-white/5"
                      }`}
                    >
                      <FolderArchive className="w-3.5 h-3.5 text-sky-300" />
                      <span>Files & Assets</span>
                    </button>
                  )}

                  {hasNotes && (
                    <button
                      onClick={() => setActiveMediaTab("notes")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeMediaTab === "notes"
                          ? "bg-indigo-600 text-white shadow-sm font-black"
                          : "bg-card/60 text-subtext hover:text-text border border-white/5"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Study Notes</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    const foundSecIdx = editSections.findIndex(s => s.items.some(i => i.id === activeLesson?.id));
                    const foundLessIdx = foundSecIdx >= 0 ? editSections[foundSecIdx].items.findIndex(i => i.id === activeLesson?.id) : -1;
                    if (foundSecIdx >= 0 && foundLessIdx >= 0 && activeLesson) {
                      setEditingLessonModal({
                        sectionIdx: foundSecIdx,
                        lessonIdx: foundLessIdx,
                        lesson: { ...activeLesson }
                      });
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-card hover:bg-white/10 border border-white/10 text-[11px] font-bold text-purple-300 hover:text-white transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit This Topic</span>
                </button>
              </div>

              {/* ── VIEW 1: VIDEO LESSON PLAYER ── */}
              {activeMediaTab === "video" && (
                <div>
                  <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
                    {activeLesson?.videoUrl ? (
                      <video
                        key={activeLesson.videoUrl}
                        src={activeLesson.videoUrl}
                        controls
                        autoPlay={false}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-8 space-y-3">
                        <Video className="w-12 h-12 text-subtext/40 mx-auto" />
                        <p className="text-xs font-bold text-subtext">No video lecture attached to this topic.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3 bg-card border-t border-white/5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video Lesson
                        </span>
                        <span className="text-xs font-mono text-subtext">
                          Duration: {activeLesson?.duration || "15m 00s"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-text">
                      {activeLesson?.title || "Lesson Content"}
                    </h3>

                    <p className="text-xs text-subtext leading-relaxed">
                      {activeLesson?.description || course.description}
                    </p>

                    {activeLesson?.notes && (
                      <div className="p-3.5 rounded-xl bg-background/50 border border-white/5 text-xs text-purple-300 font-medium">
                        💡 <strong>Instructor Lesson Notes:</strong> {activeLesson.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── VIEW 2: PHOTOS & DIAGRAMS GALLERY VIEWER ── */}
              {activeMediaTab === "image" && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit mb-2">
                        <ImageIcon className="w-3 h-3" />
                        Attached Photos & Architecture Diagrams
                      </span>
                      <h3 className="text-xl font-black text-text">{activeLesson?.title}</h3>
                      <p className="text-xs text-subtext mt-1">{activeLesson?.imageCaption || activeLesson?.description || "High-resolution architectural diagrams and visual course materials."}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeLesson?.imageUrl1 && (
                      <div className="p-4 rounded-2xl bg-background/60 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Primary Image / Diagram
                          </span>
                          <button
                            onClick={() => setLightboxImg({ url: activeLesson.imageUrl1!, title: "Primary Diagram" })}
                            className="p-1 rounded-lg bg-card hover:bg-white/10 text-subtext hover:text-white cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div
                          onClick={() => setLightboxImg({ url: activeLesson.imageUrl1!, title: "Primary Diagram" })}
                          className="relative aspect-video rounded-xl bg-black/40 overflow-hidden border border-white/5 cursor-pointer group flex items-center justify-center"
                        >
                          <img
                            src={activeLesson.imageUrl1}
                            alt="Primary Diagram"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                            <Eye className="w-4 h-4" /> Click to Zoom
                          </div>
                        </div>

                        <a
                          href={activeLesson.imageUrl1}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 justify-end pt-1"
                        >
                          <span>Open High-Res Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {activeLesson?.imageUrl2 && (
                      <div className="p-4 rounded-2xl bg-background/60 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Secondary Diagram / Illustration
                          </span>
                          <button
                            onClick={() => setLightboxImg({ url: activeLesson.imageUrl2!, title: "Secondary Diagram" })}
                            className="p-1 rounded-lg bg-card hover:bg-white/10 text-subtext hover:text-white cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div
                          onClick={() => setLightboxImg({ url: activeLesson.imageUrl2!, title: "Secondary Diagram" })}
                          className="relative aspect-video rounded-xl bg-black/40 overflow-hidden border border-white/5 cursor-pointer group flex items-center justify-center"
                        >
                          <img
                            src={activeLesson.imageUrl2}
                            alt="Secondary Diagram"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                            <Eye className="w-4 h-4" /> Click to Zoom
                          </div>
                        </div>

                        <a
                          href={activeLesson.imageUrl2}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 justify-end pt-1"
                        >
                          <span>Open High-Res Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── VIEW 3: INTERACTIVE QUIZ & MCQ REVIEWER / TEST RUNNER ── */}
              {activeMediaTab === "quiz" && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit mb-2">
                        <HelpCircle className="w-3 h-3" />
                        Interactive Quiz & MCQ Assessment
                      </span>
                      <h3 className="text-xl font-black text-text">{activeLesson?.title}</h3>
                      <p className="text-xs text-subtext mt-1">{activeLesson?.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setQuizTestMode(!quizTestMode);
                          setUserQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          quizTestMode
                            ? "bg-amber-500 text-black font-black ring-2 ring-amber-400"
                            : "bg-card hover:bg-white/10 text-subtext hover:text-text border border-white/10"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{quizTestMode ? "Exit Test Mode (Show Answers)" : "🧪 Practice Test Mode"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Test Mode Score Header */}
                  {quizTestMode && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300">Practice Evaluation:</span>
                        <span className="text-subtext">Select answers to test quiz responsiveness.</span>
                      </div>
                      {quizSubmitted && (
                        <span className="font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/30">
                          Score: {Object.entries(userQuizAnswers).filter(([qIdx, ansIdx]) => {
                            const q = activeLesson?.quizQuestions?.[Number(qIdx)];
                            return ansIdx === (q?.correctAnswerIndex ?? q?.correctIndex);
                          }).length} / {activeLesson?.quizQuestions?.length}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Question Cards List */}
                  <div className="space-y-6">
                    {activeLesson?.quizQuestions && activeLesson.quizQuestions.length > 0 ? (
                      activeLesson.quizQuestions.map((q, qIdx) => {
                        const correctAnsIdx = q.correctAnswerIndex ?? q.correctIndex ?? 0;
                        const selectedAns = userQuizAnswers[qIdx];

                        return (
                          <div
                            key={qIdx}
                            className="p-5 rounded-2xl bg-background/60 border border-white/10 space-y-4 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                                Q{qIdx + 1}
                              </span>
                              <h4 className="font-bold text-text text-sm leading-snug">{q.question}</h4>
                            </div>

                            <div className="space-y-2 pl-9">
                              {q.options.map((opt, optIdx) => {
                                const isKeyCorrect = optIdx === correctAnsIdx;
                                const isUserSelected = selectedAns === optIdx;

                                let optionStyle = "bg-card/40 border-white/5 text-subtext hover:border-white/20";
                                if (!quizTestMode) {
                                  // Teacher Key mode: highlight correct answer
                                  if (isKeyCorrect) optionStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold";
                                } else {
                                  // Test mode
                                  if (quizSubmitted) {
                                    if (isKeyCorrect) optionStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                                    else if (isUserSelected && !isKeyCorrect) optionStyle = "bg-red-500/20 border-red-500 text-red-300";
                                  } else if (isUserSelected) {
                                    optionStyle = "bg-purple-600/20 border-purple-500 text-purple-200 font-bold";
                                  }
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => {
                                      if (quizTestMode && !quizSubmitted) {
                                        setUserQuizAnswers({ ...userQuizAnswers, [qIdx]: optIdx });
                                      }
                                    }}
                                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${optionStyle} ${
                                      quizTestMode && !quizSubmitted ? "cursor-pointer" : ""
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>

                                    {!quizTestMode && isKeyCorrect && (
                                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Correct Key
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {(!quizTestMode || quizSubmitted) && q.explanation && (
                              <div className="pl-9 text-xs text-subtext pt-1 bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="font-bold text-amber-400">💡 Instructor Explanation: </span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-subtext">No quiz questions configured.</div>
                    )}
                  </div>

                  {quizTestMode && !quizSubmitted && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-lg cursor-pointer"
                      >
                        Submit Test & Review Explanations
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── VIEW 4: INTERACTIVE CODE SANDBOX VIEWER ── */}
              {activeMediaTab === "sandbox" && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit mb-2">
                        <Code2 className="w-3 h-3" />
                        Interactive Code Sandbox
                      </span>
                      <h3 className="text-xl font-black text-text">{activeLesson?.title}</h3>
                      <p className="text-xs text-subtext mt-1">{activeLesson?.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-background border border-white/10 font-mono text-xs font-bold text-emerald-400 uppercase">
                        {activeLesson?.sandboxLang || "python"}
                      </span>
                      <button
                        onClick={() => {
                          if (activeLesson?.sandboxCode) {
                            navigator.clipboard.writeText(activeLesson.sandboxCode);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-card hover:bg-white/10 border border-white/10 text-xs font-bold text-subtext hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedCode ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#0b0f19] border border-white/10 overflow-hidden font-mono text-xs shadow-2xl">
                    <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between text-subtext text-[11px]">
                      <span>Source Code Snippet ({activeLesson?.sandboxLang || "python"})</span>
                      <span>Read-only Preview</span>
                    </div>
                    <pre className="p-5 text-emerald-300/90 overflow-x-auto leading-relaxed">
                      <code>{activeLesson?.sandboxCode || `# Starter ${activeLesson?.sandboxLang || "python"} code\nprint("Hello Glarus Academy")`}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* ── VIEW 5: DOWNLOADABLE RESOURCES & ASSETS ── */}
              {activeMediaTab === "resource" && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1 w-fit mb-2">
                        <FolderArchive className="w-3 h-3" />
                        Downloadable Learning Resources & Assets
                      </span>
                      <h3 className="text-xl font-black text-text">{activeLesson?.title}</h3>
                      <p className="text-xs text-subtext mt-1">{activeLesson?.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeLesson?.resources && activeLesson.resources.length > 0 ? (
                      activeLesson.resources.map((resItem, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-5 rounded-2xl bg-background/60 border border-white/10 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-text text-sm truncate">{resItem.title}</h4>
                              <span className="text-xs text-subtext">{resItem.type || "PDF Document"}</span>
                            </div>
                          </div>

                          <a
                            href={resItem.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Asset</span>
                          </a>
                        </div>
                      ))
                    ) : activeLesson?.resourceUrl ? (
                      <div className="p-5 rounded-2xl bg-background/60 border border-white/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-text text-sm truncate">
                              {activeLesson.resourceFileName || "Course_Learning_Material.pdf"}
                            </h4>
                            <span className="text-xs text-subtext">Downloadable supplementary file</span>
                          </div>
                        </div>

                        <a
                          href={activeLesson.resourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Asset</span>
                        </a>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-subtext">No downloadable files attached to this lesson.</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── VIEW 6: STUDY NOTES & ARTICLE ── */}
              {activeMediaTab === "notes" && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 w-fit mb-2">
                        <FileText className="w-3 h-3" />
                        Study Guide & Lecture Notes
                      </span>
                      <h3 className="text-xl font-black text-text">{activeLesson?.title}</h3>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-background/60 border border-white/10 text-xs text-text leading-relaxed whitespace-pre-wrap font-medium space-y-4">
                    {activeLesson?.articleContent || activeLesson?.notesContent || activeLesson?.notes || activeLesson?.description || "No specific study text recorded."}
                  </div>
                </div>
              )}
            </div>

            {/* ── SUB-TABS: OVERVIEW, AI QUALITY CHECK, PRICING ── */}
            <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              {/* Tabs Selector */}
              <div className="flex bg-background/60 p-1 rounded-2xl border border-white/5 w-fit overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-subtext hover:text-text"
                  }`}
                >
                  Course Overview & Description
                </button>

                <button
                  onClick={() => setActiveTab("quality")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "quality"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-subtext hover:text-text"
                  }`}
                >
                  <span>AI Quality Analysis</span>
                  {course.aiQualityReport?.status === "FLAGGED" && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("pricing")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "pricing"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-subtext hover:text-text"
                  }`}
                >
                  Pricing & Analytics
                </button>
              </div>

              {/* TAB 1: OVERVIEW & DESCRIPTION */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-subtext uppercase tracking-wider mb-2">
                      Detailed Course Description
                    </h4>
                    <p className="text-xs text-text leading-relaxed font-medium bg-background/50 p-4 rounded-2xl border border-white/5 whitespace-pre-wrap">
                      {course.description}
                    </p>
                  </div>

                  {/* Learning Outcomes */}
                  <div>
                    <h4 className="text-xs font-black text-subtext uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-purple-400" />
                      <span>Key Learning Outcomes</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {course.outcomes.map((outcome, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-background/50 border border-white/5 text-xs text-text flex items-start gap-2.5 font-medium"
                        >
                          <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisites & Target Audience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-background/50 border border-white/5 space-y-2">
                      <h5 className="text-[10px] uppercase font-black tracking-wider text-subtext">
                        Prerequisites
                      </h5>
                      <ul className="space-y-1.5 text-xs text-text">
                        {course.prerequisites.map((p, pIdx) => (
                          <li key={pIdx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-background/50 border border-white/5 space-y-2">
                      <h5 className="text-[10px] uppercase font-black tracking-wider text-subtext">
                        Target Audience
                      </h5>
                      <p className="text-xs text-text leading-relaxed">{course.targetAudience}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI QUALITY ANALYSIS */}
              {activeTab === "quality" && (
                <div className="space-y-6">
                  <div
                    className={`p-5 rounded-2xl border ${
                      course.aiQualityReport?.status === "FLAGGED"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {course.aiQualityReport?.status === "FLAGGED" ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-bold text-sm">
                          {course.aiQualityReport?.status === "FLAGGED"
                            ? "AI Quality Alert: Issues Detected"
                            : "AI Quality Check: All Checks Passed (Optimal)"}
                        </h4>
                        <p className="text-xs mt-1 leading-relaxed opacity-90">
                          {course.aiQualityReport?.status === "FLAGGED"
                            ? "The automated multimedia validator identified audio or video thresholds that may require instructor revision."
                            : "Video bitrates, audio LUFS loudness levels, and curriculum structure meet platform standard specifications."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-4 rounded-xl bg-background/50 border border-white/5 text-center">
                      <span className="text-[10px] uppercase font-bold text-subtext block">Audio Clarity</span>
                      <span className="text-xl font-black text-purple-300 mt-1 block">
                        {course.aiQualityReport?.audioScore || 95}%
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 border border-white/5 text-center">
                      <span className="text-[10px] uppercase font-bold text-subtext block">Video Resolution</span>
                      <span className="text-xl font-black text-emerald-400 mt-1 block">
                        {course.aiQualityReport?.videoClarityScore || 98}%
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 border border-white/5 text-center">
                      <span className="text-[10px] uppercase font-bold text-subtext block">Curriculum Depth</span>
                      <span className="text-xl font-black text-sky-400 mt-1 block">
                        {course.aiQualityReport?.completenessScore || 96}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & ANALYTICS */}
              {activeTab === "pricing" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-background/50 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-subtext block">
                      Listing Price
                    </span>
                    <h4 className="text-2xl font-black text-text">₹{course.price.toLocaleString()}</h4>
                    <span className="text-[11px] text-subtext">Single payment access</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-background/50 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-subtext block">
                      Enrolled Students
                    </span>
                    <h4 className="text-2xl font-black text-purple-300">
                      {course.enrolledStudents.toLocaleString()}
                    </h4>
                    <span className="text-[11px] text-subtext">Total active learners</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-background/50 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-subtext block">
                      Gross Revenue
                    </span>
                    <h4 className="text-2xl font-black text-emerald-400">
                      ₹{course.revenue.toLocaleString()}
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-semibold">100% recorded transactions</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: FULL CURRICULUM TREE & INSTRUCTOR INFO (4 COLS) ── */}
          <div className="lg:col-span-4 space-y-6">
            {/* INSTRUCTOR CARD */}
            <div className="p-5 rounded-3xl bg-card border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-subtext">
                  Course Author
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified Faculty
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-white font-black text-base shadow-md border border-white/10 shrink-0">
                  {course.instructorAvatar || "IN"}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-text text-sm truncate">{course.instructor}</h4>
                  <p className="text-xs text-subtext truncate">{course.instructorEmail}</p>
                </div>
              </div>

              <Link
                href={`/admin/instructors/${course.instructorId || "inst-1"}`}
                className="py-2 px-3 rounded-xl bg-background hover:bg-white/5 border border-white/10 text-xs font-bold text-purple-300 hover:text-white transition-all flex items-center justify-center gap-1.5 w-full cursor-pointer"
              >
                <span>View Instructor Credentials</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* CURRICULUM ACCORDION */}
            <div className="p-5 rounded-3xl bg-card border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-xs font-black text-text uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Curriculum Structure</span>
                  </h3>
                  <p className="text-[10px] text-subtext mt-0.5">
                    Click any lesson to preview in player
                  </p>
                </div>

                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                  {course.sections.length} Sections
                </span>
              </div>

              <div className="space-y-3 max-h-[750px] overflow-y-auto custom-scrollbar pr-1">
                {course.sections.map((section, sIdx) => (
                  <div
                    key={section.id}
                    className="rounded-2xl bg-background/50 border border-white/5 overflow-hidden"
                  >
                    <div className="p-3.5 bg-card/60 border-b border-white/5 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-text truncate">{section.title}</h4>
                      <span className="text-[10px] font-mono text-subtext shrink-0 ml-2">
                        {section.items.length} items
                      </span>
                    </div>

                    <div className="divide-y divide-white/5">
                      {section.items.map((item) => {
                        const isSelected = activeLesson?.id === item.id;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectLesson(item)}
                            className={`p-3 flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? "bg-purple-600/15 border-l-2 border-purple-500 text-purple-200"
                                : "hover:bg-white/5 text-subtext hover:text-text"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {item.type === "video" && (
                                <Video
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSelected ? "text-purple-400" : "text-purple-400/70"
                                  }`}
                                />
                              )}
                              {item.type === "image" && (
                                <ImageIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              )}
                              {item.type === "quiz" && (
                                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              {item.type === "sandbox" && (
                                <Code2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                              {item.type === "resource" && (
                                <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              )}
                              {item.type === "assignment" && (
                                <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              )}

                              <div className="min-w-0">
                                <span
                                  className={`text-xs font-medium truncate block ${
                                    isSelected ? "text-white font-bold" : ""
                                  }`}
                                >
                                  {item.title}
                                </span>
                                {(item.imageUrl1 || item.imageUrl2 || (item.quizQuestions && item.quizQuestions.length > 0)) && (
                                  <div className="flex items-center gap-1.5 text-[9px] text-subtext mt-0.5">
                                    {item.imageUrl1 && <span className="text-rose-400">🖼️ Photo</span>}
                                    {item.quizQuestions && item.quizQuestions.length > 0 && (
                                      <span className="text-amber-400">❓ Quiz ({item.quizQuestions.length}Q)</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <span className="text-[10px] font-mono shrink-0 px-2 py-0.5 rounded bg-background/50 border border-white/5 text-subtext">
                              {item.duration || (item.type === "quiz" ? "Quiz" : item.type === "image" ? "Photo" : "File")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT SPECIFIC LESSON & MULTIMEDIA MATERIALS ── */}
      {editingLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                  Admin Topic Content Studio
                </span>
                <h3 className="text-lg font-black text-text mt-0.5">
                  Edit Materials for: {editingLessonModal.lesson.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingLessonModal(null)}
                className="p-1.5 rounded-xl text-subtext hover:text-text hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
              {/* Basic Lesson Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-subtext uppercase">Topic Title</label>
                  <input
                    type="text"
                    value={editingLessonModal.lesson.title}
                    onChange={(e) =>
                      setEditingLessonModal({
                        ...editingLessonModal,
                        lesson: { ...editingLessonModal.lesson, title: e.target.value }
                      })
                    }
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-subtext uppercase">Primary Material Type</label>
                  <select
                    value={editingLessonModal.lesson.type}
                    onChange={(e) =>
                      setEditingLessonModal({
                        ...editingLessonModal,
                        lesson: { ...editingLessonModal.lesson, type: e.target.value as any }
                      })
                    }
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="video">📹 Video Lecture</option>
                    <option value="image">🖼️ Photo & Diagram</option>
                    <option value="quiz">❓ Interactive Quiz & MCQ</option>
                    <option value="sandbox">💻 Code Sandbox</option>
                    <option value="resource">📁 Downloadable Resource</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-subtext uppercase">Estimated Duration</label>
                  <input
                    type="text"
                    value={editingLessonModal.lesson.duration || "15m 00s"}
                    onChange={(e) =>
                      setEditingLessonModal({
                        ...editingLessonModal,
                        lesson: { ...editingLessonModal.lesson, duration: e.target.value }
                      })
                    }
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* 1. VIDEO CONFIGURATION */}
              <div className="p-4 rounded-2xl bg-background/60 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-purple-300 uppercase flex items-center gap-1.5">
                    <Video className="w-4 h-4" />
                    Video Content URL / Upload
                  </label>
                  <label className="px-3 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload MP4 Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleAdminFileUpload(file, "video");
                          if (url) {
                            setEditingLessonModal({
                              ...editingLessonModal,
                              lesson: { ...editingLessonModal.lesson, videoUrl: url }
                            });
                          }
                        }
                      }}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="https://example.com/lecture.mp4"
                  value={editingLessonModal.lesson.videoUrl || ""}
                  onChange={(e) =>
                    setEditingLessonModal({
                      ...editingLessonModal,
                      lesson: { ...editingLessonModal.lesson, videoUrl: e.target.value }
                    })
                  }
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* 2. PHOTOS & DIAGRAMS CONFIGURATION */}
              <div className="p-4 rounded-2xl bg-background/60 border border-rose-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-rose-300 uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    Photos & Diagrams Attached to Lesson
                  </label>
                  <label className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleAdminFileUpload(file, "image");
                          if (url) {
                            if (!editingLessonModal.lesson.imageUrl1) {
                              setEditingLessonModal({
                                ...editingLessonModal,
                                lesson: { ...editingLessonModal.lesson, imageUrl1: url }
                              });
                            } else {
                              setEditingLessonModal({
                                ...editingLessonModal,
                                lesson: { ...editingLessonModal.lesson, imageUrl2: url }
                              });
                            }
                          }
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-subtext uppercase">Primary Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/diagram1.png"
                    value={editingLessonModal.lesson.imageUrl1 || ""}
                    onChange={(e) =>
                      setEditingLessonModal({
                        ...editingLessonModal,
                        lesson: { ...editingLessonModal.lesson, imageUrl1: e.target.value }
                      })
                    }
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-xs text-text font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-subtext uppercase">Secondary Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/diagram2.png"
                    value={editingLessonModal.lesson.imageUrl2 || ""}
                    onChange={(e) =>
                      setEditingLessonModal({
                        ...editingLessonModal,
                        lesson: { ...editingLessonModal.lesson, imageUrl2: e.target.value }
                      })
                    }
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-xs text-text font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-subtext uppercase">Image Caption / Context</label>
                  <input
                    type="text"
                    placeholder="e.g. Figure 1: System Architecture Diagram"
                    value={editingLessonModal.lesson.imageCaption || ""}
                    onChange={(e) =>
                      setEditingLessonModal({
                        ...editingLessonModal,
                        lesson: { ...editingLessonModal.lesson, imageCaption: e.target.value }
                      })
                    }
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-xs text-text font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Previews if URLs exist */}
                {(editingLessonModal.lesson.imageUrl1 || editingLessonModal.lesson.imageUrl2) && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {editingLessonModal.lesson.imageUrl1 && (
                      <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-white/10">
                        <img src={editingLessonModal.lesson.imageUrl1} alt="Preview 1" className="w-full h-full object-contain" />
                        <button
                          onClick={() =>
                            setEditingLessonModal({
                              ...editingLessonModal,
                              lesson: { ...editingLessonModal.lesson, imageUrl1: "" }
                            })
                          }
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {editingLessonModal.lesson.imageUrl2 && (
                      <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-white/10">
                        <img src={editingLessonModal.lesson.imageUrl2} alt="Preview 2" className="w-full h-full object-contain" />
                        <button
                          onClick={() =>
                            setEditingLessonModal({
                              ...editingLessonModal,
                              lesson: { ...editingLessonModal.lesson, imageUrl2: "" }
                            })
                          }
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. QUIZ & MCQ QUESTIONS CONFIGURATION */}
              <div className="p-4 rounded-2xl bg-background/60 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-300 uppercase flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    Quiz & MCQ Questions ({editingLessonModal.lesson.quizQuestions?.length || 0})
                  </label>
                  <button
                    onClick={() => {
                      const newQ = {
                        question: "What is the key advantage of this concept?",
                        options: ["High reliability & fault tolerance", "Manual execution", "Slow processing", "Hardcoded values"],
                        correctAnswerIndex: 0,
                        explanation: "This enables resilient and scalable cloud-native operations."
                      };
                      setEditingLessonModal({
                        ...editingLessonModal,
                        lesson: {
                          ...editingLessonModal.lesson,
                          quizQuestions: [...(editingLessonModal.lesson.quizQuestions || []), newQ]
                        }
                      });
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {editingLessonModal.lesson.quizQuestions?.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-xl bg-card border border-white/10 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-amber-300">Question {qIdx + 1}</span>
                        <button
                          onClick={() => {
                            setEditingLessonModal({
                              ...editingLessonModal,
                              lesson: {
                                ...editingLessonModal.lesson,
                                quizQuestions: editingLessonModal.lesson.quizQuestions?.filter((_, idx) => idx !== qIdx)
                              }
                            });
                          }}
                          className="text-subtext hover:text-red-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...(editingLessonModal.lesson.quizQuestions || [])];
                          updated[qIdx] = { ...updated[qIdx], question: val };
                          setEditingLessonModal({
                            ...editingLessonModal,
                            lesson: { ...editingLessonModal.lesson, quizQuestions: updated }
                          });
                        }}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text font-bold focus:outline-none focus:border-amber-500"
                        placeholder="Question prompt..."
                      />

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-subtext uppercase">Choice Options (Click radio for correct answer):</span>
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = (q.correctAnswerIndex ?? q.correctIndex) === optIdx;
                          return (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={isCorrect}
                                onChange={() => {
                                  const updated = [...(editingLessonModal.lesson.quizQuestions || [])];
                                  updated[qIdx] = { ...updated[qIdx], correctAnswerIndex: optIdx, correctIndex: optIdx };
                                  setEditingLessonModal({
                                    ...editingLessonModal,
                                    lesson: { ...editingLessonModal.lesson, quizQuestions: updated }
                                  });
                                }}
                                className="accent-emerald-500 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...(editingLessonModal.lesson.quizQuestions || [])];
                                  const newOpts = [...updated[qIdx].options];
                                  newOpts[optIdx] = val;
                                  updated[qIdx] = { ...updated[qIdx], options: newOpts };
                                  setEditingLessonModal({
                                    ...editingLessonModal,
                                    lesson: { ...editingLessonModal.lesson, quizQuestions: updated }
                                  });
                                }}
                                className={`flex-1 bg-background border rounded-xl px-3 py-1.5 text-xs text-text font-medium ${
                                  isCorrect ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-subtext uppercase">Explanation:</span>
                        <input
                          type="text"
                          value={q.explanation || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...(editingLessonModal.lesson.quizQuestions || [])];
                            updated[qIdx] = { ...updated[qIdx], explanation: val };
                            setEditingLessonModal({
                              ...editingLessonModal,
                              lesson: { ...editingLessonModal.lesson, quizQuestions: updated }
                            });
                          }}
                          placeholder="Why this answer is correct..."
                          className="w-full bg-background border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. CODE SANDBOX CONFIGURATION */}
              <div className="p-4 rounded-2xl bg-background/60 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-emerald-300 uppercase flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" />
                    Code Sandbox Snippet
                  </label>
                  <select
                    value={editingLessonModal.lesson.sandboxLang || "python"}
                    onChange={(e) =>
                      setEditingLessonModal({
                        ...editingLessonModal,
                        lesson: { ...editingLessonModal.lesson, sandboxLang: e.target.value }
                      })
                    }
                    className="bg-card border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-400"
                  >
                    <option value="python">Python</option>
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="sql">SQL</option>
                    <option value="html">HTML/CSS</option>
                  </select>
                </div>

                <textarea
                  rows={5}
                  value={editingLessonModal.lesson.sandboxCode || ""}
                  onChange={(e) =>
                    setEditingLessonModal({
                      ...editingLessonModal,
                      lesson: { ...editingLessonModal.lesson, sandboxCode: e.target.value }
                    })
                  }
                  placeholder={`# Write ${editingLessonModal.lesson.sandboxLang || "python"} code snippet here...`}
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-300/90 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              {/* 5. NOTES & DESCRIPTION */}
              <div className="p-4 rounded-2xl bg-background/60 border border-white/10 space-y-2">
                <label className="text-xs font-black text-subtext uppercase">Lesson Description & Study Notes</label>
                <textarea
                  rows={3}
                  value={editingLessonModal.lesson.notes || editingLessonModal.lesson.description || ""}
                  onChange={(e) =>
                    setEditingLessonModal({
                      ...editingLessonModal,
                      lesson: {
                        ...editingLessonModal.lesson,
                        notes: e.target.value,
                        description: e.target.value,
                        notesContent: e.target.value
                      }
                    })
                  }
                  placeholder="Key summary notes, takeaways, or instructions for this topic..."
                  className="w-full bg-background border border-white/10 rounded-xl p-3.5 text-xs text-text font-medium focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingLessonModal(null)}
                className="px-4 py-2.5 rounded-xl bg-background hover:bg-white/5 border border-white/10 text-xs font-bold text-subtext hover:text-text cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const { sectionIdx, lessonIdx, lesson } = editingLessonModal;
                  setEditSections(prev =>
                    prev.map((sec, sI) =>
                      sI === sectionIdx
                        ? {
                            ...sec,
                            items: sec.items.map((it, lI) => (lI === lessonIdx ? lesson : it))
                          }
                        : sec
                    )
                  );
                  if (activeLesson?.id === lesson.id) {
                    setActiveLesson(lesson);
                    setDefaultMediaTab(lesson);
                  }
                  setEditingLessonModal(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                Save Topic Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ZOOM FOR DIAGRAMS ── */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-card hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImg.url}
              alt={lightboxImg.title}
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* ── REQUEST CHANGES / FEEDBACK MODAL ── */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-text flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Request Curriculum Changes</span>
              </h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="p-1 rounded-lg text-subtext hover:text-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-subtext leading-relaxed">
              Enter specific notes or revision items for <strong>{course.instructor}</strong> regarding this curriculum.
            </p>

            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="e.g. Please re-record Section 2 Video 1 with higher audio volume and add 2 additional questions to the Section 1 Quiz..."
              rows={5}
              className="w-full bg-background border border-white/10 rounded-2xl p-4 text-xs text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50 resize-none font-medium"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2.5 rounded-xl bg-background hover:bg-white/5 border border-white/10 text-xs font-bold text-subtext hover:text-text cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision("CHANGES_REQUESTED")}
                disabled={processingDecision || !feedbackNote.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                Send Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
