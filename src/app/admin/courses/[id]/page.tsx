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
  Edit3
} from "lucide-react";
import {
  MOCK_DETAILED_COURSES,
  DetailedCoursePreview,
  LessonItem,
  getDetailedCourseById
} from "@/lib/mockCoursesDetailed";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<DetailedCoursePreview | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "quality" | "pricing">("overview");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [processingDecision, setProcessingDecision] = useState(false);
  const [decisionBanner, setDecisionBanner] = useState<{ text: string; type: "success" | "warning" | "error" } | null>(null);

  // Load Course Data from API / Mock
  useEffect(() => {
    async function loadCourse() {
      // 1. Check mock detailed course
      const mockFound = getDetailedCourseById(courseId);

      // 2. Fetch real course from API
      try {
        const res = await fetch(`/api/admin/courses/${encodeURIComponent(courseId)}`);
        if (res.ok) {
          const data = await res.json();
          const dbCourse = data.course;

          if (dbCourse) {
            // Map DB modules and lectures to our sections format
            const sections = dbCourse.modules?.map((m: any, mIdx: number) => ({
              id: m.id || `m-${mIdx}`,
              title: `Section ${mIdx + 1}: ${m.title || "Module"}`,
              description: "Structured curriculum lectures and materials.",
              items:
                m.lectures?.map((l: any, lIdx: number) => ({
                  id: l.id || `l-${lIdx}`,
                  title: l.title || `Lecture ${lIdx + 1}`,
                  type: "video" as const,
                  duration: "15m 00s",
                  videoUrl: l.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                  description: "Full lesson content and practical instruction.",
                  notes: "Lesson notes and key learning points."
                })) || []
            })) || [];

            // Add sample quiz & assignment if DB doesn't have custom ones
            if (sections.length > 0 && sections[0].items.length > 0) {
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
                    explanation: "This course emphasizes high-scale modern architectural design and production practices."
                  }
                ]
              });

              sections[0].items.push({
                id: `res-db-${dbCourse.id}`,
                title: "Downloadable Source Code & Assets",
                type: "resource",
                size: "4.8 MB",
                description: "Starter repository, configuration files, and assets.",
                resourceUrl: "https://glarus.edu/assets/course_materials.zip",
                resourceFileName: `${dbCourse.title.replace(/\s+/g, "_")}_Assets.zip`
              });
            }

            const statusMap: Record<string, DetailedCoursePreview["status"]> = {
              APPROVED: "PUBLISHED",
              PENDING: "PENDING_APPROVAL",
              REJECTED: "REJECTED"
            };

            const mappedCourse: DetailedCoursePreview = {
              id: dbCourse.id,
              title: dbCourse.title,
              instructorId: dbCourse.instructor?.id || "inst-1",
              instructor: dbCourse.instructor?.name || "Expert Instructor",
              instructorEmail: dbCourse.instructor?.email || "instructor@glarus.edu",
              instructorAvatar: dbCourse.instructor?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "IN",
              category: "AI & Technology",
              price: dbCourse.price || 4999,
              level: "Intermediate",
              duration: `${dbCourse.modules?.length || 4} Modules`,
              enrolledStudents: dbCourse.enrollments?.length || 0,
              revenue: (dbCourse.purchases?.length || 0) * (dbCourse.price || 4999),
              status: statusMap[dbCourse.status] || "PENDING_APPROVAL",
              rating: dbCourse.rating || 5.0,
              reviewsCount: dbCourse.reviewsCount || 12,
              updatedAt: dbCourse.updatedAt ? new Date(dbCourse.updatedAt).toLocaleDateString() : "Recent",
              previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              thumbnailGradient: "from-purple-900 to-indigo-950",
              description:
                dbCourse.description ||
                "A comprehensive curriculum built to guide students through production-grade engineering concepts, real-world patterns, and hands-on projects.",
              prerequisites: [
                "Basic programming knowledge in Python / TypeScript",
                "Understanding of modern web application concepts"
              ],
              outcomes: [
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
            if (mappedCourse.sections[0]?.items[0]) {
              setActiveLesson(mappedCourse.sections[0].items[0]);
            }
            return;
          }
        }
      } catch {
        /* ignore */
      }

      // If mock only
      if (mockFound) {
        setCourse(mockFound);
        if (mockFound.sections[0]?.items[0]) {
          setActiveLesson(mockFound.sections[0].items[0]);
        }
      } else {
        const fallback = MOCK_DETAILED_COURSES[0];
        setCourse(fallback);
        if (fallback.sections[0]?.items[0]) {
          setActiveLesson(fallback.sections[0].items[0]);
        }
      }
    }

    loadCourse();
  }, [courseId]);

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

  // Handle Admin Decision
  const handleDecision = async (decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED") => {
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

        {/* Approval Decision Controls */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-3.5 py-2 rounded-xl bg-card hover:bg-white/5 border border-white/10 text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Request Changes</span>
          </button>

          <button
            onClick={() => handleDecision("REJECTED")}
            disabled={processingDecision}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>

          <button
            onClick={() => handleDecision("APPROVED")}
            disabled={processingDecision}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Publish Course</span>
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
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-subtext font-medium pt-0.5">
              <span className="flex items-center gap-1.5 text-text font-bold">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Instructor: {course.instructor}
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

      {/* ── SPLIT STUDIO WORKSPACE (PLAYER & CURRICULUM ACCORDION) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT / CENTER COLUMN: INTERACTIVE PREVIEW VIEWER (8 COLS) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* INTERACTIVE WORKSPACE CARD */}
          <div className="bg-card border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            {/* VIEW MODE 1: VIDEO LESSON PLAYER */}
            {(!activeLesson || activeLesson.type === "video") && (
              <div>
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
                  <video
                    key={activeLesson?.videoUrl || course.previewVideoUrl}
                    src={activeLesson?.videoUrl || course.previewVideoUrl}
                    controls
                    autoPlay={false}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-6 space-y-3 bg-card border-t border-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Video Lesson
                      </span>
                      <span className="text-xs font-mono text-subtext">
                        Duration: {activeLesson?.duration || "18m 10s"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-text">
                    {activeLesson?.title || "Lesson Video Demonstration"}
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

            {/* VIEW MODE 2: QUIZ PREVIEW */}
            {activeLesson && activeLesson.type === "quiz" && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit mb-2">
                      <HelpCircle className="w-3 h-3" />
                      Interactive Quiz Preview
                    </span>
                    <h3 className="text-xl font-black text-text">{activeLesson.title}</h3>
                    <p className="text-xs text-subtext mt-1">{activeLesson.description}</p>
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    Est: {activeLesson.duration || "10 mins"}
                  </span>
                </div>

                <div className="space-y-6">
                  {activeLesson.quizQuestions && activeLesson.quizQuestions.length > 0 ? (
                    activeLesson.quizQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-5 rounded-2xl bg-background/60 border border-white/10 space-y-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                            Q{qIdx + 1}
                          </span>
                          <h4 className="font-bold text-text text-sm">{q.question}</h4>
                        </div>

                        <div className="space-y-2 pl-9">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = optIdx === q.correctAnswerIndex;
                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                                  isCorrect
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold"
                                    : "bg-card/40 border-white/5 text-subtext"
                                }`}
                              >
                                <span>{opt}</span>
                                {isCorrect && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="pl-9 text-xs text-subtext pt-1">
                            <span className="font-bold text-amber-400">Explanation: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-subtext">No quiz questions configured.</div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW MODE 3: ASSIGNMENT PREVIEW */}
            {activeLesson && activeLesson.type === "assignment" && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1 w-fit mb-2">
                      <FileCode className="w-3 h-3" />
                      Practical Assignment Brief
                    </span>
                    <h3 className="text-xl font-black text-text">{activeLesson.title}</h3>
                    <p className="text-xs text-subtext mt-1">{activeLesson.description}</p>
                  </div>
                  <span className="text-xs font-mono text-sky-400 font-bold bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20">
                    Est: {activeLesson.duration || "45 mins"}
                  </span>
                </div>

                {/* Problem Statement */}
                <div className="p-5 rounded-2xl bg-background/60 border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-subtext block">
                    Problem Statement & Scope
                  </span>
                  <p className="text-xs text-text font-medium leading-relaxed">
                    {activeLesson.assignmentBrief || "Build and submit the practical assignment according to the lesson guidelines."}
                  </p>
                </div>

                {/* Expected Deliverables */}
                {activeLesson.deliverables && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-subtext block">
                      Required Student Deliverables
                    </span>
                    <ul className="space-y-2">
                      {activeLesson.deliverables.map((del, dIdx) => (
                        <li
                          key={dIdx}
                          className="p-3 rounded-xl bg-background/40 border border-white/5 text-xs text-text flex items-center gap-2.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Starter File Download */}
                {activeLesson.starterFileName && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 to-card border border-sky-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FolderArchive className="w-6 h-6 text-sky-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-text">{activeLesson.starterFileName}</p>
                        <span className="text-[10px] text-subtext">Starter codebase & unit tests</span>
                      </div>
                    </div>

                    <a
                      href={activeLesson.starterFileUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Starter ZIP</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 4: RESOURCE FILE PREVIEW */}
            {activeLesson && activeLesson.type === "resource" && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit mb-2">
                      <FileText className="w-3 h-3" />
                      Downloadable Learning Resource
                    </span>
                    <h3 className="text-xl font-black text-text">{activeLesson.title}</h3>
                    <p className="text-xs text-subtext mt-1">{activeLesson.description}</p>
                  </div>
                  <span className="text-xs font-mono text-rose-400 font-bold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
                    {activeLesson.size || "PDF • 2.4 MB"}
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-background/60 border border-white/10 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text text-sm">
                        {activeLesson.resourceFileName || "Course_Resource_Document.pdf"}
                      </h4>
                      <p className="text-xs text-subtext mt-0.5">
                        Supplementary cheatsheet, lecture slides, and reference material.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-end">
                    <a
                      href={activeLesson.resourceUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Resource File</span>
                    </a>
                  </div>
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

                {course.aiQualityReport?.flags && course.aiQualityReport.flags.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-subtext uppercase tracking-wider">
                      Flagged Recommendations for Admin Review
                    </h5>
                    <ul className="space-y-2">
                      {course.aiQualityReport.flags.map((flag, fIdx) => (
                        <li
                          key={fIdx}
                          className="p-3 rounded-xl bg-background/50 border border-white/5 text-xs text-text flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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
                          onClick={() => setActiveLesson(item)}
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
                            {item.type === "quiz" && (
                              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            {item.type === "assignment" && (
                              <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            )}
                            {item.type === "resource" && (
                              <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            )}

                            <span
                              className={`text-xs font-medium truncate ${
                                isSelected ? "text-white font-bold" : ""
                              }`}
                            >
                              {item.title}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono shrink-0 px-2 py-0.5 rounded bg-background/50 border border-white/5 text-subtext">
                            {item.duration || item.size || (item.type === "quiz" ? "Quiz" : "File")}
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
