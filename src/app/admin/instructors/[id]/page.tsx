"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  Ban,
  Check,
  X,
  RotateCcw,
  Video,
  FileText,
  ExternalLink,
  Star,
  Sparkles,
  Layers,
  Radio,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Globe,
  Briefcase,
  Code2,
  PlayCircle,
  Users,
  ChevronRight,
  ShieldCheck,
  Eye,
  Play,
  Download,
  Maximize2
} from "lucide-react";
import {
  MOCK_INSTRUCTORS_DETAILED,
  DetailedInstructorItem,
  getDetailedInstructorById
} from "@/lib/mockInstructors";

function getEmbeddableVideoUrl(url?: string): { isDirectVideo: boolean; embedUrl: string } {
  if (!url) return { isDirectVideo: false, embedUrl: "" };

  const trimmed = url.trim();

  // YouTube watch URL or youtu.be
  if (trimmed.includes("youtube.com/watch") || trimmed.includes("youtu.be/")) {
    let videoId = "";
    if (trimmed.includes("youtube.com/watch")) {
      const match = trimmed.match(/[?&]v=([^&]+)/);
      videoId = match ? match[1] : "";
    } else if (trimmed.includes("youtu.be/")) {
      videoId = trimmed.split("youtu.be/")[1]?.split("?")[0] || "";
    }
    if (videoId) {
      return { isDirectVideo: false, embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` };
    }
  }

  // YouTube Shorts
  if (trimmed.includes("youtube.com/shorts/")) {
    const videoId = trimmed.split("youtube.com/shorts/")[1]?.split("?")[0] || "";
    if (videoId) {
      return { isDirectVideo: false, embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` };
    }
  }

  // Vimeo
  if (trimmed.includes("vimeo.com/")) {
    const vimeoId = trimmed.split("vimeo.com/")[1]?.split("?")[0] || "";
    if (vimeoId) {
      return { isDirectVideo: false, embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1` };
    }
  }

  // Direct video file or uploaded file
  const isDirect =
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("http://localhost:3000/uploads/") ||
    trimmed.endsWith(".mp4") ||
    trimmed.endsWith(".webm") ||
    trimmed.endsWith(".mov") ||
    trimmed.includes("commondatastorage.googleapis.com");

  return { isDirectVideo: isDirect, embedUrl: trimmed };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InstructorDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const instructorId = resolvedParams.id;

  const [instructor, setInstructor] = useState<DetailedInstructorItem | null>(null);
  const [activeTab, setActiveTab] = useState<"application" | "created_courses" | "assigned_cohorts" | "audit">("application");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [processingDecision, setProcessingDecision] = useState(false);
  const [decisionBanner, setDecisionBanner] = useState<{ text: string; type: "success" | "warning" | "error" } | null>(null);
  const [previewResumeModal, setPreviewResumeModal] = useState(false);
  const [previewVideoModal, setPreviewVideoModal] = useState(false);

  useEffect(() => {
    async function loadInstructorData() {
      // 1. First check mock list
      const mockFound = getDetailedInstructorById(instructorId);

      // 2. Fetch real DB info from API
      try {
        const res = await fetch(`/api/admin/instructors/${encodeURIComponent(instructorId)}`);
        if (res.ok) {
          const data = await res.json();
          const user = data.user;
          const approval = data.approval || user?.instructorApproval;

          if (approval || user) {
            const fullName =
              approval?.firstName && approval?.lastName
                ? `${approval.firstName} ${approval.lastName}`.trim()
                : user?.name || mockFound?.name || "Instructor";

            const initials = fullName
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "IN";

            // Parse skills
            let parsedSkills: string[] = [];
            if (approval?.skills) {
              try {
                const p = JSON.parse(approval.skills);
                if (Array.isArray(p)) parsedSkills = p;
              } catch {
                parsedSkills = approval.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
              }
            } else if (mockFound?.skills) {
              parsedSkills = mockFound.skills;
            }

            // Parse teaching languages
            let parsedLanguages: string[] = [];
            if (approval?.teachingLanguages) {
              try {
                const p = JSON.parse(approval.teachingLanguages);
                if (Array.isArray(p)) parsedLanguages = p;
              } catch {
                parsedLanguages = approval.teachingLanguages.split(",").map((s: string) => s.trim()).filter(Boolean);
              }
            } else if (mockFound?.teachingLanguages) {
              parsedLanguages = mockFound.teachingLanguages;
            }

            const verifStatus =
              approval?.status === "APPROVED"
                ? "VERIFIED"
                : (approval?.status as any) || mockFound?.verificationStatus || "PENDING";

            const isBlocked = user?.status === "BLOCKED";
            const accountStatus = isBlocked
              ? "Suspended"
              : verifStatus === "VERIFIED"
              ? "Active"
              : "Inactive";

            // Map created courses from DB user.courses
            const createdCourses = user?.courses?.map((c: any) => ({
              id: c.id,
              title: c.title,
              description: c.description || "Comprehensive curriculum",
              price: c.price || 4999,
              type: c.type || "SELF_PACED",
              status: c.status || "APPROVED",
              modulesCount: c.modules?.length || 8,
              rating: c.rating || 4.9,
              reviewsCount: c.reviewsCount || 24,
              createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recent"
            })) || mockFound?.createdCourses || [];

            // Map assigned live cohorts from sessionAssignments / leadLiveCourses
            const assignedLiveCohorts = user?.sessionAssignments?.map((sa: any) => ({
              id: sa.id,
              courseTitle: sa.liveCourse?.title || "Live AI Cohort",
              cohortName: sa.liveCourse?.category || "Live Batch Alpha",
              sessionTitle: sa.session?.title || "Live Interactive Session",
              sessionNumber: sa.session?.sessionNumber || 1,
              date: sa.session?.date ? new Date(sa.session.date).toLocaleDateString() : "Upcoming",
              time: sa.session?.startTime ? `${sa.session.startTime} - ${sa.session.endTime || "End"}` : "07:00 PM IST",
              meetingPlatform: sa.liveCourse?.meetingPlatform || "Zoom",
              meetingUrl: sa.session?.meetingUrl || sa.liveCourse?.meetingUrl || undefined,
              status: (sa.session?.status as any) || "SCHEDULED",
              permissions: {
                canEditAgenda: Boolean(sa.canEditAgenda),
                canManageAttendance: Boolean(sa.canManageAttendance),
                canManageRecording: Boolean(sa.canManageRecording),
                canAddHomework: Boolean(sa.canAddHomework)
              }
            })) || mockFound?.assignedLiveCohorts || [];

            setInstructor({
              id: user?.id || approval?.userId || instructorId,
              name: fullName,
              firstName: approval?.firstName || mockFound?.firstName,
              lastName: approval?.lastName || mockFound?.lastName,
              email: approval?.email || user?.email || mockFound?.email || "instructor@glarus.edu",
              phone: approval?.phone || mockFound?.phone,
              avatar: initials,
              photoUrl: approval?.photoUrl || mockFound?.photoUrl,
              location: mockFound?.location || "India",
              rating: mockFound?.rating || 4.9,
              verificationStatus: verifStatus,
              accountStatus: accountStatus,
              joinedDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : mockFound?.joinedDate || "Recent",
              version: approval?.version || mockFound?.version || 1,
              feedback: approval?.feedback || mockFound?.feedback || "",

              experience: approval?.experience || mockFound?.experience || "5+ years enterprise software and AI development.",
              teachingLanguages: parsedLanguages.length > 0 ? parsedLanguages : ["English"],
              skills: parsedSkills.length > 0 ? parsedSkills : ["Generative AI", "Software Architecture"],
              areasOfExpertise: approval?.areasOfExpertise || mockFound?.areasOfExpertise || "AI Engineering & Modern Full-Stack",
              opportunitySource: approval?.opportunitySource || mockFound?.opportunitySource || "Direct Application",
              resumeUrl: approval?.resumeUrl || mockFound?.resumeUrl,
              resumeFileName: approval?.resumeFileName || mockFound?.resumeFileName || "Resume_Document.pdf",
              teachingVideoType: (approval?.teachingVideoType as any) || mockFound?.teachingVideoType || "LINK",
              teachingVideoUrl: approval?.teachingVideoUrl || mockFound?.teachingVideoUrl,
              teachingVideoFileName: approval?.teachingVideoFileName || mockFound?.teachingVideoFileName,
              aboutInstructor: approval?.aboutInstructor || approval?.bio || mockFound?.aboutInstructor || "Senior instructor and industry mentor.",
              bio: approval?.bio || mockFound?.bio,
              courseTeachingPlan: approval?.courseTeachingPlan || mockFound?.courseTeachingPlan || "Comprehensive industry-focused curriculum proposal.",
              whyGlarusAcademy: approval?.whyGlarusAcademy || mockFound?.whyGlarusAcademy || "To teach high-impact, hands-on software engineering.",
              teachesOnOtherPlatforms: Boolean(approval?.teachesOnOtherPlatforms ?? mockFound?.teachesOnOtherPlatforms),
              otherPlatformDetails: approval?.otherPlatformDetails || mockFound?.otherPlatformDetails,

              createdCourses: createdCourses,
              assignedLiveCohorts: assignedLiveCohorts,
              assignedTasksCount: mockFound?.assignedTasksCount || assignedLiveCohorts.length,
              liveSessionsCount: mockFound?.liveSessionsCount || assignedLiveCohorts.length
            });
            return;
          }
        }
      } catch {
        /* ignore */
      }

      // If API failed or mock only
      if (mockFound) {
        setInstructor(mockFound);
      } else {
        // Fallback default
        setInstructor(MOCK_INSTRUCTORS_DETAILED[0]);
      }
    }

    loadInstructorData();
  }, [instructorId]);

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 animate-pulse">
          <GraduationCap className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-text">Loading Instructor Profile & Credentials...</p>
      </div>
    );
  }

  // Handle Admin Approvals Decision
  const handleDecision = async (decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED") => {
    setProcessingDecision(true);
    try {
      await fetch("/api/admin/approvals/instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: instructor.id,
          decision,
          feedback: feedbackNote.trim() || undefined
        })
      });

      const newVerif: DetailedInstructorItem["verificationStatus"] =
        decision === "APPROVED"
          ? "VERIFIED"
          : decision === "REJECTED"
          ? "REJECTED"
          : "CHANGES_REQUESTED";

      const newAccountStatus: DetailedInstructorItem["accountStatus"] =
        decision === "APPROVED" ? "Active" : "Inactive";

      setInstructor((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: newVerif,
              accountStatus: newAccountStatus,
              feedback: feedbackNote.trim() || prev.feedback
            }
          : null
      );

      setDecisionBanner({
        text:
          decision === "APPROVED"
            ? "Instructor application approved and verified successfully!"
            : decision === "REJECTED"
            ? "Instructor application has been rejected."
            : "Change request and feedback note sent to instructor.",
        type: decision === "APPROVED" ? "success" : decision === "REJECTED" ? "error" : "warning"
      });

      setFeedbackNote("");
    } catch {
      alert("Failed to process approval decision. Please check your connection.");
    } finally {
      setProcessingDecision(false);
    }
  };

  const handleToggleSuspend = () => {
    setInstructor((prev) => {
      if (!prev) return null;
      const nextStatus: DetailedInstructorItem["accountStatus"] =
        prev.accountStatus === "Suspended"
          ? prev.verificationStatus === "VERIFIED"
            ? "Active"
            : "Inactive"
          : "Suspended";

      return {
        ...prev,
        accountStatus: nextStatus
      };
    });
  };

  return (
    <div className="space-y-6 pb-16 font-sans animate-in fade-in duration-300">
      {/* ── TOP NAVIGATION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/admin/instructors"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card/80 border border-white/10 text-xs font-bold text-subtext hover:text-text transition-all shadow-sm hover:-translate-x-0.5 group w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Instructor Management</span>
        </Link>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleToggleSuspend}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              instructor.accountStatus === "Suspended"
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{instructor.accountStatus === "Suspended" ? "Activate Account" : "Suspend Account"}</span>
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
            {decisionBanner.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{decisionBanner.text}</span>
          </div>
          <button onClick={() => setDecisionBanner(null)} className="text-subtext hover:text-text p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── INSTRUCTOR PROFILE HERO CARD ── */}
      <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {instructor.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={instructor.photoUrl}
                alt={instructor.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/40 shadow-lg shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-900 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/15 shrink-0">
                {instructor.avatar}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
                  {instructor.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black border uppercase tracking-wider ${
                    instructor.verificationStatus === "VERIFIED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : instructor.verificationStatus === "PENDING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : instructor.verificationStatus === "CHANGES_REQUESTED"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {instructor.verificationStatus}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    instructor.accountStatus === "Active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : instructor.accountStatus === "Inactive"
                      ? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  {instructor.accountStatus}
                </span>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-subtext">
                  v{instructor.version}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-subtext font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  {instructor.email}
                </span>
                {instructor.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                    {instructor.phone}
                  </span>
                )}
                {instructor.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    {instructor.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Applied / Joined {instructor.joinedDate}
                </span>
              </div>

              {instructor.areasOfExpertise && (
                <p className="text-xs text-purple-300 font-semibold pt-1">
                  🎯 Focus: {instructor.areasOfExpertise}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-background/50 border border-white/5 p-3 rounded-2xl shrink-0">
            <div className="px-3 text-center sm:text-right border-b sm:border-b-0 sm:border-r border-white/5 pb-2 sm:pb-0">
              <span className="text-[10px] uppercase font-bold text-subtext block">Rating</span>
              <span className="text-sm font-black text-amber-400 flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {instructor.rating}
              </span>
            </div>

            <div className="px-3 text-center sm:text-right">
              <span className="text-[10px] uppercase font-bold text-subtext block">Live Sessions</span>
              <span className="text-sm font-black text-purple-300 mt-0.5 block">
                {instructor.assignedLiveCohorts.length} Assigned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 SUMMARY STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-subtext uppercase tracking-wider">Technical Skills</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-text mt-2">{instructor.skills.length}</h3>
          <p className="text-[11px] text-purple-300 font-semibold mt-1">Submitted in application form</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-subtext uppercase tracking-wider">Created Courses</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-text mt-2">{instructor.createdCourses.length}</h3>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">Self-Paced & Live Curriculums</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-subtext uppercase tracking-wider">Assigned Live Cohorts</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-text mt-2">{instructor.assignedLiveCohorts.length}</h3>
          <p className="text-[11px] text-sky-400 font-semibold mt-1">Active Batch Teaching Assignments</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-subtext uppercase tracking-wider">Teaching Rating</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-400 mt-2">{instructor.rating} ★</h3>
          <p className="text-[11px] text-subtext font-semibold mt-1">Student Feedback Average</p>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex bg-card p-1 rounded-2xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar w-fit">
        <button
          onClick={() => setActiveTab("application")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "application"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Submitted Form & Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab("created_courses")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "created_courses"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Created Courses ({instructor.createdCourses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("assigned_cohorts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "assigned_cohorts"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Assigned Live Cohorts ({instructor.assignedLiveCohorts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Review & Decision</span>
        </button>
      </div>

      {/* ── TAB 1: SUBMITTED FORM & CREDENTIALS ── */}
      {activeTab === "application" && (
        <div className="space-y-6">
          {/* Section 1: Skills & Professional Profile */}
          <div className="bg-card border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
            <h3 className="text-sm font-black text-text uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>1. Professional Profile & Submitted Competencies</span>
            </h3>

            {/* Submitted Skills */}
            <div>
              <span className="text-[11px] text-subtext font-black uppercase tracking-widest block mb-2">
                Technical Skills (Extracted from Application Form)
              </span>
              <div className="flex flex-wrap gap-2">
                {instructor.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Areas of Expertise & Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/50 border border-white/5 space-y-1">
                <span className="text-[10px] text-subtext font-black uppercase tracking-widest block">
                  Areas of Expertise
                </span>
                <p className="font-bold text-text text-xs leading-relaxed">{instructor.areasOfExpertise}</p>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-white/5 space-y-1">
                <span className="text-[10px] text-subtext font-black uppercase tracking-widest block">
                  Teaching Languages
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {instructor.teachingLanguages.map((lang) => (
                    <span key={lang} className="px-2.5 py-0.5 bg-card border border-white/10 text-text rounded-md text-xs font-semibold">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Professional Experience */}
            <div>
              <span className="text-[11px] text-subtext font-black uppercase tracking-widest block mb-1.5">
                Professional & Industry Experience
              </span>
              <div className="p-4 rounded-xl bg-background/50 border border-white/5 text-xs text-text leading-relaxed font-medium">
                {instructor.experience}
              </div>
            </div>

            {/* Bio */}
            <div>
              <span className="text-[11px] text-subtext font-black uppercase tracking-widest block mb-1.5">
                About the Instructor (Bio)
              </span>
              <div className="p-4 rounded-xl bg-background/50 border border-white/5 text-xs text-text leading-relaxed font-medium whitespace-pre-wrap">
                {instructor.aboutInstructor || instructor.bio}
              </div>
            </div>
          </div>

          {/* Section 2: Teaching Demonstration & Resume */}
          <div className="bg-card border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
            <h3 className="text-sm font-black text-text uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <Video className="w-4 h-4 text-sky-400" />
              <span>2. Teaching Video Demo & Resume Verification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resume */}
              <div className="p-5 rounded-2xl bg-background/50 border border-white/10 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-purple-400">
                      <FileText className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-wider text-text">Resume Document</span>
                    </div>
                    {instructor.resumeUrl && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        PDF Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-text truncate">
                    {instructor.resumeFileName || "Instructor_Resume.pdf"}
                  </p>
                  <p className="text-[11px] text-subtext mt-1">Verified PDF document uploaded by applicant.</p>
                </div>

                {instructor.resumeUrl ? (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewResumeModal(true)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Resume in Platform</span>
                    </button>

                    <a
                      href={instructor.resumeUrl}
                      download={instructor.resumeFileName || "Instructor_Resume.pdf"}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all inline-flex items-center justify-center cursor-pointer"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-subtext italic">No resume document uploaded.</p>
                )}
              </div>

              {/* Teaching Video Demo */}
              <div className="p-5 rounded-2xl bg-background/50 border border-white/10 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-sky-400">
                      <Video className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-wider text-text">Teaching Video Demo</span>
                    </div>
                    {instructor.teachingVideoUrl && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        Demo Ready
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-text truncate">
                    {instructor.teachingVideoFileName || (instructor.teachingVideoUrl ? "Submitted Sample Video Link" : "No video submitted")}
                  </p>
                  <p className="text-[11px] text-subtext mt-1 font-mono break-all line-clamp-1">
                    {instructor.teachingVideoUrl || "N/A"}
                  </p>
                </div>

                {instructor.teachingVideoUrl ? (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewVideoModal(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Watch Teaching Video Demo</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-subtext italic">No teaching video sample submitted.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Course Teaching Plan & Other Platforms */}
          <div className="bg-card border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
            <h3 className="text-sm font-black text-text uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>3. Course Teaching Plan & Platform Motivation</span>
            </h3>

            {/* Proposed Curriculum Plan */}
            <div>
              <span className="text-[11px] text-subtext font-black uppercase tracking-widest block mb-1.5">
                Proposed Curriculum & Course Outline
              </span>
              <div className="p-4 rounded-xl bg-background/50 border border-white/5 text-xs font-mono text-text leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                {instructor.courseTeachingPlan}
              </div>
            </div>

            {/* Why Glarus Academy */}
            {instructor.whyGlarusAcademy && (
              <div>
                <span className="text-[11px] text-subtext font-black uppercase tracking-widest block mb-1.5">
                  Why Glarus Academy?
                </span>
                <div className="p-4 rounded-xl bg-background/50 border border-white/5 text-xs text-text leading-relaxed">
                  {instructor.whyGlarusAcademy}
                </div>
              </div>
            )}

            {/* Other Platforms */}
            <div>
              <span className="text-[11px] text-subtext font-black uppercase tracking-widest block mb-1.5">
                Experience on Other Platforms
              </span>
              <div className="p-4 rounded-xl bg-background/50 border border-white/5 text-xs text-text">
                <p className="font-bold mb-1">
                  Teaches on other platforms:{" "}
                  <span className={instructor.teachesOnOtherPlatforms ? "text-emerald-400" : "text-subtext"}>
                    {instructor.teachesOnOtherPlatforms ? "Yes" : "No"}
                  </span>
                </p>
                {instructor.teachesOnOtherPlatforms && instructor.otherPlatformDetails && (
                  <p className="text-subtext text-xs mt-1 pt-1 border-t border-white/5">
                    {instructor.otherPlatformDetails}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CREATED COURSES ── */}
      {activeTab === "created_courses" && (
        <div className="space-y-4">
          <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-black text-text">Courses Created by {instructor.name}</h3>
                <p className="text-xs text-subtext mt-0.5">
                  Curriculums authored and managed by this instructor.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-300">
                {instructor.createdCourses.length} Total Published
              </span>
            </div>

            {instructor.createdCourses.length === 0 ? (
              <div className="py-12 text-center text-subtext space-y-2">
                <BookOpen className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
                <p className="font-bold text-text text-sm">No courses authored yet</p>
                <p className="text-xs">This instructor has not published self-paced courses yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instructor.createdCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/admin/courses/${encodeURIComponent(course.id)}`}
                    className="p-5 rounded-2xl bg-background/50 border border-white/10 space-y-3 shadow-sm hover:border-purple-500/50 hover:bg-purple-950/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer block group relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              course.type === "INSTRUCTOR_LED"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            }`}
                          >
                            {course.type === "INSTRUCTOR_LED" ? "Live Cohort" : "Self-Paced"}
                          </span>
                          <span className="text-[10px] font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            <span>Open Studio</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                        <h4 className="font-bold text-text text-sm group-hover:text-purple-300 transition-colors truncate">
                          {course.title}
                        </h4>
                      </div>
                      <span className="text-sm font-black text-emerald-400 shrink-0">
                        ₹{course.price.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-subtext line-clamp-2">{course.description}</p>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-subtext">{course.modulesCount} Modules</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> {course.rating} ({course.reviewsCount})
                      </span>
                      <span className="text-subtext">Published: {course.createdAt}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: ASSIGNED LIVE COHORTS & SESSIONS ── */}
      {activeTab === "assigned_cohorts" && (
        <div className="space-y-4">
          <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-black text-text">Live Cohorts & Teaching Assignments</h3>
                <p className="text-xs text-subtext mt-0.5">
                  Scheduled live classes, cohorts, and teaching privileges assigned to {instructor.name}.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                {instructor.assignedLiveCohorts.length} Active Sessions
              </span>
            </div>

            {instructor.assignedLiveCohorts.length === 0 ? (
              <div className="py-12 text-center text-subtext space-y-2">
                <Video className="w-10 h-10 mx-auto opacity-30 text-emerald-400" />
                <p className="font-bold text-text text-sm">No live cohorts assigned</p>
                <p className="text-xs">Assign this instructor to live cohorts from Live Training Management.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {instructor.assignedLiveCohorts.map((cohort) => (
                  <div
                    key={cohort.id}
                    className="p-4 sm:p-5 rounded-2xl bg-background/50 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {cohort.cohortName}
                        </span>
                        <span className="font-bold text-text text-sm">{cohort.courseTitle}</span>
                      </div>

                      <h5 className="font-semibold text-purple-300 text-xs">{cohort.sessionTitle}</h5>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-subtext">
                        <span className="flex items-center gap-1 text-text font-medium">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          {cohort.date} • {cohort.time}
                        </span>
                        <span>Platform: {cohort.meetingPlatform}</span>
                      </div>

                      {/* Permissions */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-subtext font-bold uppercase mr-1">Privileges:</span>
                        {cohort.permissions.canEditAgenda && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-white/5 text-subtext border border-white/10">
                            Edit Agenda
                          </span>
                        )}
                        {cohort.permissions.canManageAttendance && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-white/5 text-subtext border border-white/10">
                            Manage Attendance
                          </span>
                        )}
                        {cohort.permissions.canManageRecording && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-white/5 text-subtext border border-white/10">
                            Manage Recordings
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {cohort.meetingUrl && (
                        <a
                          href={cohort.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Session</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: ADMIN REVIEW & DECISION ── */}
      {activeTab === "audit" && (
        <div className="bg-card border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-text uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Administrative Review & Verification Actions</span>
              </h3>
              <p className="text-xs text-subtext mt-1">
                Approve applicant credentials to grant instructor privileges or request updates.
              </p>
            </div>

            {/* Live Verification State Pill */}
            <div className="shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border uppercase tracking-wider ${
                  instructor.verificationStatus === "VERIFIED"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10"
                    : instructor.verificationStatus === "PENDING"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : instructor.verificationStatus === "CHANGES_REQUESTED"
                    ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                {instructor.verificationStatus === "VERIFIED" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>VERIFIED & APPROVED</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>{instructor.verificationStatus}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Prominent Verification State Hero Callout */}
          {instructor.verificationStatus === "VERIFIED" ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-start gap-3.5 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                    Instructor Verified & Approved
                  </h4>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Active Teaching Privileges
                  </span>
                </div>
                <p className="text-xs text-text leading-relaxed font-medium">
                  This instructor has been vetted and granted full teaching privileges. They can now publish self-paced courses and receive live cohort assignments.
                </p>
              </div>
            </div>
          ) : instructor.verificationStatus === "CHANGES_REQUESTED" ? (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                  Changes Requested
                </h4>
                <p className="text-xs text-text leading-relaxed font-medium">
                  Feedback was sent to the applicant. The account is awaiting updated credentials submission.
                </p>
              </div>
            </div>
          ) : instructor.verificationStatus === "REJECTED" ? (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-red-400 uppercase tracking-widest">
                  Application Rejected
                </h4>
                <p className="text-xs text-text leading-relaxed font-medium">
                  This application was rejected. Teaching privileges are currently disabled.
                </p>
              </div>
            </div>
          ) : null}

          {/* Current Status Overview Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-background/60 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] text-subtext uppercase font-black tracking-wider block mb-1">
                Verification Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border uppercase tracking-wider ${
                  instructor.verificationStatus === "VERIFIED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : instructor.verificationStatus === "PENDING"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                {instructor.verificationStatus === "VERIFIED" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                {instructor.verificationStatus}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-subtext uppercase font-black tracking-wider block mb-1">
                Account Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-purple-500/10 text-purple-300 border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                {instructor.accountStatus}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-subtext uppercase font-black tracking-wider block mb-1">
                Application Version
              </span>
              <span className="text-xs font-mono font-bold text-text mt-1 block">
                Version {instructor.version} (Latest)
              </span>
            </div>
          </div>

          {/* Existing Feedback */}
          {instructor.feedback && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest block">
                Previous Administrative Review Note
              </span>
              <p className="text-xs text-text leading-relaxed font-medium">{instructor.feedback}</p>
            </div>
          )}

          {/* Feedback Note Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-subtext uppercase tracking-wider block">
              Add New Administrative Review Note / Applicant Feedback
            </label>
            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="e.g. Approved teaching video and Stanford credentials. Verified for Live AI Cohorts..."
              rows={4}
              className="w-full bg-background border border-white/10 rounded-xl p-3.5 text-xs text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50 resize-none font-medium"
            />
          </div>

          {/* Action Decision Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => handleDecision("CHANGES_REQUESTED")}
              disabled={processingDecision}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-card hover:bg-white/5 border border-white/10 text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Changes</span>
            </button>

            <button
              onClick={() => handleDecision("REJECTED")}
              disabled={processingDecision}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject Application</span>
            </button>

            <button
              onClick={() => handleDecision("APPROVED")}
              disabled={processingDecision}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                instructor.verificationStatus === "VERIFIED"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 ring-2 ring-emerald-500/30"
                  : "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20"
              }`}
            >
              {instructor.verificationStatus === "VERIFIED" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{processingDecision ? "Saving..." : "✓ Approved & Verified (Re-confirm)"}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{processingDecision ? "Saving..." : "Approve & Verify Instructor"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── IN-PLATFORM RESUME PREVIEW MODAL ── */}
      {previewResumeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-card border border-white/15 rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-background/80 border-b border-white/10 flex items-center justify-between shrink-0 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-text truncate">
                      {instructor.resumeFileName || "Instructor_Resume.pdf"}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                      In-Platform Document Viewer
                    </span>
                  </div>
                  <p className="text-xs text-subtext truncate">
                    Candidate: {instructor.name} ({instructor.email})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {instructor.resumeUrl && (
                  <a
                    href={instructor.resumeUrl}
                    download={instructor.resumeFileName || "Instructor_Resume.pdf"}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-text transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewResumeModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-subtext hover:text-text transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF viewer */}
            <div className="flex-1 bg-black/40 p-2 sm:p-4 overflow-hidden relative">
              {instructor.resumeUrl ? (
                <iframe
                  src={instructor.resumeUrl}
                  className="w-full h-full rounded-2xl bg-zinc-950 border border-white/10"
                  title="Candidate Resume Document"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-subtext space-y-3">
                  <FileText className="w-12 h-12 opacity-30 text-purple-400" />
                  <p className="font-bold text-text">No resume URL available for preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── IN-PLATFORM TEACHING VIDEO DEMO MODAL ── */}
      {previewVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-card border border-white/15 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-background/80 border-b border-white/10 flex items-center justify-between shrink-0 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-text truncate">
                      Teaching Demonstration: {instructor.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
                      In-Platform Video Player
                    </span>
                  </div>
                  <p className="text-xs text-subtext truncate">
                    Focus: {instructor.areasOfExpertise || "Instructor Verification Sample"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewVideoModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-subtext hover:text-text transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Embedded Video Player */}
            <div className="p-4 sm:p-6 bg-black flex items-center justify-center">
              {(() => {
                const videoData = getEmbeddableVideoUrl(instructor.teachingVideoUrl);
                if (videoData.isDirectVideo) {
                  return (
                    <video
                      src={videoData.embedUrl}
                      controls
                      autoPlay
                      className="w-full max-h-[65vh] rounded-2xl bg-black object-contain shadow-2xl"
                    />
                  );
                } else if (videoData.embedUrl) {
                  return (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                      <iframe
                        src={videoData.embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Teaching Demo Video"
                      />
                    </div>
                  );
                }
                return (
                  <div className="py-16 text-center text-subtext space-y-2">
                    <Video className="w-12 h-12 mx-auto opacity-30 text-sky-400" />
                    <p className="text-sm font-bold text-text">No playable video URL available</p>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer: Video details */}
            <div className="p-4 bg-background/50 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-subtext">
              <span className="truncate">
                Source: <span className="font-mono text-text">{instructor.teachingVideoUrl || "Uploaded sample"}</span>
              </span>
              <span className="text-purple-300 font-bold">
                Languages: {instructor.teachingLanguages.join(", ")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
