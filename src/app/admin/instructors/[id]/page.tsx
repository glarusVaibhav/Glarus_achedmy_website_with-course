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
  Maximize2,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  Plus,
  Edit3,
  Settings,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/dateTime";
import {
  MOCK_INSTRUCTORS_DETAILED,
  DetailedInstructorItem,
  getDetailedInstructorById
} from "@/lib/mockInstructors";

interface CoursePermissionState {
  status: "NOT_REQUESTED" | "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
  canCreateCourse: boolean;
  canEditCourse: boolean;
  canCreateLiveClass: boolean;
  canEditLiveClass: boolean;
  canRescheduleLiveClass: boolean;
  requestedAt?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  reviewedBy?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export interface InstructorLiveSessionItem {
  id: string;
  sessionNumber: number;
  title: string;
  description: string;
  date: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  duration: string;
  status: string;
  meetingId?: string | null;
  meetingPasscode?: string | null;
  meetingUrl?: string | null;
  courseId: string;
  courseTitle: string;
  cohortName: string;
  instructorName: string;
}

export interface AvailableLiveCourse {
  id: string;
  title: string;
  category?: string;
  status?: string;
  meetingUrl?: string;
}

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
  const [activeTab, setActiveTab] = useState<"application" | "created_courses" | "assigned_cohorts" | "audit" | "role_permissions">("application");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [processingDecision, setProcessingDecision] = useState(false);
  const [decisionBanner, setDecisionBanner] = useState<{ text: string; type: "success" | "warning" | "error" } | null>(null);
  const [previewResumeModal, setPreviewResumeModal] = useState(false);
  const [previewVideoModal, setPreviewVideoModal] = useState(false);

  // Course Creation Permission State
  const [coursePermission, setCoursePermission] = useState<CoursePermissionState>({
    status: "NOT_REQUESTED",
    canCreateCourse: false,
    canEditCourse: false,
    canCreateLiveClass: false,
    canEditLiveClass: false,
    canRescheduleLiveClass: false
  });
  const [permissionProcessing, setPermissionProcessing] = useState(false);
  const [togglingPermissionKey, setTogglingPermissionKey] = useState<string | null>(null);
  const [showPermissionRejectModal, setShowPermissionRejectModal] = useState(false);
  const [permissionFeedback, setPermissionFeedback] = useState("");

  // Live Class Management State
  const [instructorLiveSessions, setInstructorLiveSessions] = useState<InstructorLiveSessionItem[]>([]);
  const [availableLiveCourses, setAvailableLiveCourses] = useState<AvailableLiveCourse[]>([]);

  // Modals for Live Class Management
  const [isCreateLiveModalOpen, setIsCreateLiveModalOpen] = useState(false);
  const [createFormState, setCreateFormState] = useState({
    liveCourseId: "",
    title: "",
    description: "",
    date: "",
    startTime: "07:00 PM",
    endTime: "09:00 PM",
    timezone: "Asia/Kolkata (IST)",
    duration: "120 min",
    meetingUrl: "",
    passcode: "",
    status: "SCHEDULED"
  });

  const [editingSession, setEditingSession] = useState<InstructorLiveSessionItem | null>(null);
  const [editFormState, setEditFormState] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "07:00 PM",
    endTime: "09:00 PM",
    timezone: "Asia/Kolkata (IST)",
    duration: "120 min",
    status: "SCHEDULED",
    meetingUrl: "",
    meetingPasscode: ""
  });

  const [reschedulingSession, setReschedulingSession] = useState<InstructorLiveSessionItem | null>(null);
  const [rescheduleFormState, setRescheduleFormState] = useState({
    newDate: "",
    newStartTime: "07:00 PM",
    newEndTime: "09:00 PM",
    reason: ""
  });

  const [isSavingLiveAction, setIsSavingLiveAction] = useState(false);
  const [liveActionFeedback, setLiveActionFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
          const perm = data.courseCreationPermission || user?.courseCreationPermission;

          if (perm) {
            setCoursePermission({
              status: perm.status,
              canCreateCourse: Boolean(perm.canCreateCourse),
              canEditCourse: Boolean(perm.canEditCourse),
              canCreateLiveClass: Boolean(perm.canCreateLiveClass),
              canEditLiveClass: Boolean(perm.canEditLiveClass),
              canRescheduleLiveClass: Boolean(perm.canRescheduleLiveClass),
              requestedAt: perm.requestedAt,
              reviewedAt: perm.reviewedAt,
              rejectionReason: perm.rejectionReason,
              notes: perm.notes,
              reviewedBy: perm.reviewedBy
            });
          } else {
            setCoursePermission({
              status: "NOT_REQUESTED",
              canCreateCourse: false,
              canEditCourse: false,
              canCreateLiveClass: false,
              canEditLiveClass: false,
              canRescheduleLiveClass: false
            });
          }

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
              createdAt: c.createdAt ? formatDate(c.createdAt) : "Recent"
            })) || mockFound?.createdCourses || [];

            // Map assigned live cohorts from sessionAssignments / leadLiveCourses
            const assignedLiveCohorts = user?.sessionAssignments?.map((sa: any) => ({
              id: sa.id,
              courseTitle: sa.liveCourse?.title || "Live AI Cohort",
              cohortName: sa.liveCourse?.category || "Live Batch Alpha",
              sessionTitle: sa.session?.title || "Live Interactive Session",
              sessionNumber: sa.session?.sessionNumber || 1,
              date: sa.session?.date ? formatDate(sa.session.date) : "Upcoming",
              time: sa.session?.startTime ? `${formatTime(sa.session.startTime)} - ${formatTime(sa.session.endTime || "09:00 PM")}` : "07:00 PM",
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

            // Map live sessions from leadLiveCourses and sessionAssignments
            const liveSessionsMap = new Map<string, InstructorLiveSessionItem>();

            user?.leadLiveCourses?.forEach((lc: any) => {
              lc.sessions?.forEach((s: any) => {
                liveSessionsMap.set(s.id, {
                  id: s.id,
                  sessionNumber: s.sessionNumber || 1,
                  title: s.title,
                  description: s.description || "",
                  date: s.date ? (typeof s.date === "string" ? s.date : new Date(s.date).toISOString()) : null,
                  startTime: s.startTime || "07:00 PM",
                  endTime: s.endTime || "09:00 PM",
                  timezone: s.timezone || "Asia/Kolkata (IST)",
                  duration: s.duration || "120 min",
                  status: s.status || "SCHEDULED",
                  meetingId: s.meetingId,
                  meetingPasscode: s.meetingPasscode,
                  meetingUrl: s.meetingUrl || lc.meetingUrl,
                  courseId: lc.id,
                  courseTitle: lc.title || "Live Cohort",
                  cohortName: lc.category || "Live Batch",
                  instructorName: fullName
                });
              });
            });

            user?.sessionAssignments?.forEach((sa: any) => {
              if (sa.session && !liveSessionsMap.has(sa.session.id)) {
                const s = sa.session;
                liveSessionsMap.set(s.id, {
                  id: s.id,
                  sessionNumber: s.sessionNumber || 1,
                  title: s.title,
                  description: s.description || "",
                  date: s.date ? (typeof s.date === "string" ? s.date : new Date(s.date).toISOString()) : null,
                  startTime: s.startTime || "07:00 PM",
                  endTime: s.endTime || "09:00 PM",
                  timezone: s.timezone || "Asia/Kolkata (IST)",
                  duration: s.duration || "120 min",
                  status: s.status || "SCHEDULED",
                  meetingId: s.meetingId,
                  meetingPasscode: s.meetingPasscode,
                  meetingUrl: s.meetingUrl || sa.liveCourse?.meetingUrl,
                  courseId: sa.liveCourse?.id || s.liveCourseId,
                  courseTitle: sa.liveCourse?.title || "Live Cohort",
                  cohortName: sa.liveCourse?.category || "Live Batch",
                  instructorName: fullName
                });
              }
            });

            const parsedLiveSessions = Array.from(liveSessionsMap.values());
            setInstructorLiveSessions(parsedLiveSessions);

            if (data.allLiveCourses && Array.isArray(data.allLiveCourses)) {
              setAvailableLiveCourses(data.allLiveCourses);
              if (data.allLiveCourses.length > 0) {
                setCreateFormState((prev) => ({
                  ...prev,
                  liveCourseId: prev.liveCourseId || data.allLiveCourses[0].id
                }));
              }
            } else if (user?.leadLiveCourses) {
              const liveList = user.leadLiveCourses.map((lc: any) => ({
                id: lc.id,
                title: lc.title,
                category: lc.category,
                status: lc.status,
                meetingUrl: lc.meetingUrl
              }));
              setAvailableLiveCourses(liveList);
              if (liveList.length > 0) {
                setCreateFormState((prev) => ({
                  ...prev,
                  liveCourseId: prev.liveCourseId || liveList[0].id
                }));
              }
            }

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
              joinedDate: user?.createdAt ? formatDate(user.createdAt) : mockFound?.joinedDate || "Recent",
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
              liveSessionsCount: mockFound?.liveSessionsCount || parsedLiveSessions.length || assignedLiveCohorts.length
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

  // Handle Course Creation Permission Actions
  const handlePermissionAction = async (
    action: "APPROVE" | "REJECT" | "GRANT" | "REVOKE",
    feedback?: string
  ) => {
    if (!instructor) return;
    setPermissionProcessing(true);
    try {
      const res = await fetch("/api/admin/instructors/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: instructor.id,
          action,
          feedback: feedback?.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update course creation permission.");
        return;
      }

      setCoursePermission({
        status: data.status,
        canCreateCourse: Boolean(data.permission?.canCreateCourse ?? (data.status === "APPROVED")),
        canEditCourse: Boolean(data.permission?.canEditCourse ?? (data.status === "APPROVED")),
        canCreateLiveClass: Boolean(data.permission?.canCreateLiveClass ?? false),
        canEditLiveClass: Boolean(data.permission?.canEditLiveClass ?? false),
        canRescheduleLiveClass: Boolean(data.permission?.canRescheduleLiveClass ?? false),
        requestedAt: data.permission?.requestedAt,
        reviewedAt: data.permission?.reviewedAt,
        rejectionReason: data.permission?.rejectionReason,
        notes: data.permission?.notes,
        reviewedBy: data.permission?.reviewedBy
      });

      setDecisionBanner({
        text: data.message || `Course creation permission updated to ${data.status}.`,
        type: data.status === "APPROVED" ? "success" : data.status === "REJECTED" ? "error" : "warning"
      });

      setShowPermissionRejectModal(false);
      setPermissionFeedback("");
    } catch (err) {
      console.error("Error updating course permission:", err);
      alert("Network error updating course creation permission.");
    } finally {
      setPermissionProcessing(false);
    }
  };

  // Handle Toggle Individual System Privileges
  const handleToggleIndividualPermission = async (
    key: "COURSE_CREATE" | "COURSE_EDIT" | "LIVE_CLASS_CREATE" | "LIVE_CLASS_EDIT" | "LIVE_CLASS_RESCHEDULE",
    currentVal: boolean
  ) => {
    if (!instructor) return;
    const targetVal = !currentVal;
    setTogglingPermissionKey(key);

    const stateKey =
      key === "COURSE_CREATE"
        ? "canCreateCourse"
        : key === "COURSE_EDIT"
        ? "canEditCourse"
        : key === "LIVE_CLASS_CREATE"
        ? "canCreateLiveClass"
        : key === "LIVE_CLASS_EDIT"
        ? "canEditLiveClass"
        : "canRescheduleLiveClass";

    // Optimistic UI state update
    setCoursePermission((prev) => ({
      ...prev,
      [stateKey]: targetVal
    }));

    try {
      const res = await fetch("/api/admin/instructors/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: instructor.id,
          action: "TOGGLE_PERMISSION",
          permissionKey: key,
          enabled: targetVal
        })
      });

      const data = await res.json();
      if (!res.ok) {
        // Rollback
        setCoursePermission((prev) => ({
          ...prev,
          [stateKey]: currentVal
        }));
        setDecisionBanner({
          text: data.error || `Failed to update ${key} permission.`,
          type: "error"
        });
        return;
      }

      if (data.permission) {
        setCoursePermission({
          status: data.permission.status || data.status,
          canCreateCourse: Boolean(data.permission.canCreateCourse),
          canEditCourse: Boolean(data.permission.canEditCourse),
          canCreateLiveClass: Boolean(data.permission.canCreateLiveClass),
          canEditLiveClass: Boolean(data.permission.canEditLiveClass),
          canRescheduleLiveClass: Boolean(data.permission.canRescheduleLiveClass),
          requestedAt: data.permission.requestedAt,
          reviewedAt: data.permission.reviewedAt,
          rejectionReason: data.permission.rejectionReason,
          notes: data.permission.notes,
          reviewedBy: data.permission.reviewedBy
        });
      }

      setDecisionBanner({
        text: data.message || `Permission updated successfully.`,
        type: "success"
      });
    } catch (err) {
      // Rollback on network error
      setCoursePermission((prev) => ({
        ...prev,
        [stateKey]: currentVal
      }));
      setDecisionBanner({
        text: "Network error updating permission. Reverted to previous state.",
        type: "error"
      });
    } finally {
      setTogglingPermissionKey(null);
    }
  };

  // Open Edit Session Modal
  const openEditModal = (session: InstructorLiveSessionItem) => {
    setEditingSession(session);
    setEditFormState({
      title: session.title,
      description: session.description || "",
      date: session.date ? session.date.split("T")[0] : "",
      startTime: session.startTime || "07:00 PM",
      endTime: session.endTime || "09:00 PM",
      timezone: session.timezone || "Asia/Kolkata (IST)",
      duration: session.duration || "120 min",
      status: session.status || "SCHEDULED",
      meetingUrl: session.meetingUrl || "",
      meetingPasscode: session.meetingPasscode || ""
    });
  };

  // Open Reschedule Session Modal
  const openRescheduleModal = (session: InstructorLiveSessionItem) => {
    setReschedulingSession(session);
    setRescheduleFormState({
      newDate: session.date ? session.date.split("T")[0] : "",
      newStartTime: session.startTime || "07:00 PM",
      newEndTime: session.endTime || "09:00 PM",
      reason: ""
    });
  };

  // Handle Create Live Class Submission
  const handleCreateLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormState.liveCourseId) {
      alert("Please select a Live Course cohort.");
      return;
    }
    if (!createFormState.title.trim()) {
      alert("Please provide a session title.");
      return;
    }

    setIsSavingLiveAction(true);
    try {
      const res = await fetch("/api/admin/live-training/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liveCourseId: createFormState.liveCourseId,
          title: createFormState.title.trim(),
          description: createFormState.description.trim(),
          date: createFormState.date ? new Date(createFormState.date).toISOString() : null,
          startTime: createFormState.startTime,
          endTime: createFormState.endTime,
          timezone: createFormState.timezone,
          duration: createFormState.duration,
          status: createFormState.status,
          meetingUrl: createFormState.meetingUrl.trim() || undefined,
          meetingPasscode: createFormState.passcode.trim() || undefined,
          instructorId: instructor.id,
          instructorPermissions: {
            canView: true,
            canEdit: true,
            canEditAgenda: true,
            canEditSchedule: true,
            canEditResources: true,
            canAddHomework: true,
            canReschedule: true,
            canCancel: false,
            canManageAttendance: true,
            canManageRecording: true
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create live class session.");
        return;
      }

      const created = data.session || data;
      const matchedCourse = availableLiveCourses.find((c) => c.id === createFormState.liveCourseId);
      const newSessionItem: InstructorLiveSessionItem = {
        id: created.id || `sess_${Date.now()}`,
        sessionNumber: created.sessionNumber || instructorLiveSessions.length + 1,
        title: created.title || createFormState.title.trim(),
        description: created.description || createFormState.description.trim(),
        date: created.date ? (typeof created.date === "string" ? created.date : new Date(created.date).toISOString()) : createFormState.date || null,
        startTime: created.startTime || createFormState.startTime,
        endTime: created.endTime || createFormState.endTime,
        timezone: created.timezone || createFormState.timezone,
        duration: created.duration || createFormState.duration,
        status: created.status || createFormState.status,
        meetingId: created.meetingId,
        meetingPasscode: created.meetingPasscode || createFormState.passcode.trim(),
        meetingUrl: created.meetingUrl || createFormState.meetingUrl.trim() || matchedCourse?.meetingUrl,
        courseId: createFormState.liveCourseId,
        courseTitle: matchedCourse?.title || "Live Cohort",
        cohortName: matchedCourse?.category || "Live Batch",
        instructorName: instructor.name
      };

      setInstructorLiveSessions((prev) => [newSessionItem, ...prev]);
      setIsCreateLiveModalOpen(false);
      setCreateFormState({
        liveCourseId: availableLiveCourses[0]?.id || "",
        title: "",
        description: "",
        date: "",
        startTime: "07:00 PM",
        endTime: "09:00 PM",
        timezone: "Asia/Kolkata (IST)",
        duration: "120 min",
        meetingUrl: "",
        passcode: "",
        status: "SCHEDULED"
      });
      setLiveActionFeedback({
        text: `Live class "${newSessionItem.title}" created successfully!`,
        type: "success"
      });
    } catch (err) {
      console.error("Error creating live session:", err);
      alert("Network error creating live class session.");
    } finally {
      setIsSavingLiveAction(false);
    }
  };

  // Handle Edit Live Class Submission
  const handleEditLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    if (!editFormState.title.trim()) {
      alert("Please provide a session title.");
      return;
    }

    setIsSavingLiveAction(true);
    try {
      const res = await fetch(`/api/admin/live-training/sessions/${editingSession.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editFormState.title.trim(),
          description: editFormState.description.trim(),
          date: editFormState.date ? new Date(editFormState.date).toISOString() : null,
          startTime: editFormState.startTime,
          endTime: editFormState.endTime,
          timezone: editFormState.timezone,
          duration: editFormState.duration,
          status: editFormState.status,
          meetingUrl: editFormState.meetingUrl.trim() || undefined,
          meetingPasscode: editFormState.meetingPasscode.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update live class session.");
        return;
      }

      setInstructorLiveSessions((prev) =>
        prev.map((s) =>
          s.id === editingSession.id
            ? {
                ...s,
                title: editFormState.title.trim(),
                description: editFormState.description.trim(),
                date: editFormState.date ? editFormState.date : null,
                startTime: editFormState.startTime,
                endTime: editFormState.endTime,
                timezone: editFormState.timezone,
                duration: editFormState.duration,
                status: editFormState.status,
                meetingUrl: editFormState.meetingUrl.trim() || s.meetingUrl,
                meetingPasscode: editFormState.meetingPasscode.trim() || s.meetingPasscode
              }
            : s
        )
      );

      setEditingSession(null);
      setLiveActionFeedback({
        text: `Live class session "${editFormState.title}" updated successfully!`,
        type: "success"
      });
    } catch (err) {
      console.error("Error updating live session:", err);
      alert("Network error updating live class session.");
    } finally {
      setIsSavingLiveAction(false);
    }
  };

  // Handle Reschedule Live Class Submission
  const handleRescheduleLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingSession) return;
    if (!rescheduleFormState.newDate) {
      alert("Please select a new date.");
      return;
    }
    if (!rescheduleFormState.reason.trim()) {
      alert("Please provide a reason for rescheduling.");
      return;
    }

    setIsSavingLiveAction(true);
    try {
      const res = await fetch(`/api/admin/live-training/sessions/${reschedulingSession.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newDate: rescheduleFormState.newDate,
          newStartTime: rescheduleFormState.newStartTime,
          newEndTime: rescheduleFormState.newEndTime,
          reason: rescheduleFormState.reason.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to reschedule live class session.");
        return;
      }

      setInstructorLiveSessions((prev) =>
        prev.map((s) =>
          s.id === reschedulingSession.id
            ? {
                ...s,
                date: rescheduleFormState.newDate,
                startTime: rescheduleFormState.newStartTime,
                endTime: rescheduleFormState.newEndTime,
                status: "RESCHEDULED"
              }
            : s
        )
      );

      setReschedulingSession(null);
      setRescheduleFormState({
        newDate: "",
        newStartTime: "07:00 PM",
        newEndTime: "09:00 PM",
        reason: ""
      });
      setLiveActionFeedback({
        text: data.message || `Session rescheduled successfully to ${rescheduleFormState.newDate}!`,
        type: "success"
      });
    } catch (err) {
      console.error("Error rescheduling live session:", err);
      alert("Network error rescheduling live session.");
    } finally {
      setIsSavingLiveAction(false);
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

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black border flex items-center gap-1 uppercase tracking-wider ${
                    coursePermission.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : coursePermission.status === "PENDING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : coursePermission.status === "REVOKED"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : coursePermission.status === "REJECTED"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                  }`}
                >
                  {coursePermission.status === "APPROVED" ? (
                    <Unlock className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  <span>Course Creation: {coursePermission.status.replace("_", " ")}</span>
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

        <button
          onClick={() => setActiveTab("role_permissions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "role_permissions"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Role & Permissions</span>
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

          {/* ── COURSE CREATION PERMISSION WORKFLOW CARD ── */}
          <div className="bg-card border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 mt-8">
            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-text uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span>Course Creation Permission Workflow</span>
                </h3>
                <p className="text-xs text-subtext mt-1">
                  Govern whether this instructor is authorized to author, build, and publish new courses.
                </p>
              </div>

              {/* Permission Status Pill */}
              <div className="shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border uppercase tracking-wider ${
                    coursePermission.status === "APPROVED"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10"
                      : coursePermission.status === "PENDING"
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      : coursePermission.status === "REVOKED"
                      ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                      : coursePermission.status === "REJECTED"
                      ? "bg-red-500/15 text-red-400 border-red-500/30"
                      : "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                  }`}
                >
                  {coursePermission.status === "APPROVED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : coursePermission.status === "PENDING" ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{coursePermission.status.replace("_", " ")}</span>
                </span>
              </div>
            </div>

            {/* Status Hero Callout */}
            {coursePermission.status === "APPROVED" ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-start gap-3.5 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Unlock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                    Course Creation Access Granted
                  </h4>
                  <p className="text-xs text-text leading-relaxed font-medium">
                    This instructor has active permission to author and publish self-paced and cohort courses.
                  </p>
                </div>
              </div>
            ) : coursePermission.status === "PENDING" ? (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                    Permission Request Pending Review
                  </h4>
                  <p className="text-xs text-text leading-relaxed font-medium">
                    The instructor requested course creation privileges. Please review their proposal below and approve or reject.
                  </p>
                </div>
              </div>
            ) : coursePermission.status === "REVOKED" ? (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest">
                    Course Creation Access Revoked
                  </h4>
                  <p className="text-xs text-text leading-relaxed font-medium">
                    Course creation permission has been revoked. The instructor cannot create new courses, but all existing courses remain active and intact.
                  </p>
                </div>
              </div>
            ) : coursePermission.status === "REJECTED" ? (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-red-400 uppercase tracking-widest">
                    Permission Request Rejected
                  </h4>
                  <p className="text-xs text-text leading-relaxed font-medium">
                    The previous request was rejected. You can grant access directly if requirements have been met.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-subtext flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-subtext uppercase tracking-widest">
                    Locked By Default (Not Requested)
                  </h4>
                  <p className="text-xs text-subtext leading-relaxed font-medium">
                    The instructor has not submitted a request yet. You can proactively grant course creation privileges below.
                  </p>
                </div>
              </div>
            )}

            {/* Request & Review Details */}
            <div className="p-4 sm:p-5 rounded-2xl bg-background/60 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-subtext uppercase font-black tracking-wider block mb-1">
                  Requested On
                </span>
                <span className="font-bold text-text">
                  {coursePermission.requestedAt ? formatDate(coursePermission.requestedAt) : "Not submitted"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-subtext uppercase font-black tracking-wider block mb-1">
                  Last Reviewed
                </span>
                <span className="font-bold text-text">
                  {coursePermission.reviewedAt ? formatDate(coursePermission.reviewedAt) : "Never"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-subtext uppercase font-black tracking-wider block mb-1">
                  Reviewed By
                </span>
                <span className="font-bold text-purple-300">
                  {coursePermission.reviewedBy?.name || coursePermission.reviewedBy?.email || "Platform Admin"}
                </span>
              </div>
            </div>

            {/* Request Notes */}
            {coursePermission.notes && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <span className="text-[11px] font-black text-purple-300 uppercase tracking-widest block">
                  Instructor Request Note / Topic Proposal
                </span>
                <p className="text-xs text-text leading-relaxed font-medium">{coursePermission.notes}</p>
              </div>
            )}

            {/* Rejection / Revocation Reason */}
            {coursePermission.rejectionReason && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1">
                <span className="text-[11px] font-black text-red-400 uppercase tracking-widest block">
                  Previous Admin Rejection Feedback
                </span>
                <p className="text-xs text-text leading-relaxed font-medium">{coursePermission.rejectionReason}</p>
              </div>
            )}

            {/* Course Creation Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              {coursePermission.status === "PENDING" && (
                <>
                  <button
                    onClick={() => setShowPermissionRejectModal(true)}
                    disabled={permissionProcessing}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject Permission Request</span>
                  </button>

                  <button
                    onClick={() => handlePermissionAction("APPROVE")}
                    disabled={permissionProcessing}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{permissionProcessing ? "Saving..." : "Approve Course Creation"}</span>
                  </button>
                </>
              )}

              {coursePermission.status === "APPROVED" && (
                <button
                  onClick={() => {
                    const reason = prompt("Enter optional reason for revoking course creation privileges:");
                    if (reason !== null) {
                      handlePermissionAction("REVOKE", reason);
                    }
                  }}
                  disabled={permissionProcessing}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{permissionProcessing ? "Saving..." : "Revoke Course Creation Access"}</span>
                </button>
              )}

              {(coursePermission.status === "NOT_REQUESTED" ||
                coursePermission.status === "REJECTED" ||
                coursePermission.status === "REVOKED") && (
                <button
                  onClick={() => handlePermissionAction("GRANT")}
                  disabled={permissionProcessing}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{permissionProcessing ? "Saving..." : "Grant Course Creation Access Directly"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: ROLE & PERMISSIONS ── */}
      {activeTab === "role_permissions" && (
        <div className="space-y-6">
          {/* If Course Creation is NOT approved, display locked state */}
          {coursePermission.status !== "APPROVED" ? (
            <div className="bg-card border border-white/10 rounded-3xl p-8 shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-black text-text">Course Creation Capability Locked</h3>
                <p className="text-xs text-subtext leading-relaxed font-medium">
                  This instructor has permission status:{" "}
                  <span className="font-bold text-amber-400">{coursePermission.status.replace("_", " ")}</span>.
                  Administrative privileges for course authoring, live class creation, and session management are only active for approved course creators.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab("audit")}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Review & Approve in Admin Decision Tab</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── SECTION 1: ROLE & SYSTEM PRIVILEGES ── */}
              <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner shrink-0">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-text uppercase tracking-wider">
                        Instructor Role & Authority
                      </h3>
                      <p className="text-xs text-subtext mt-0.5">
                        System permissions and authorized operational capabilities
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase tracking-wider">
                      Role: Course Creator / Senior Instructor
                    </span>
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved
                    </span>
                  </div>
                </div>

                {/* Granted Capabilities Checklist / Interactive Toggles */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                    <span className="text-[11px] text-subtext font-black uppercase tracking-widest block">
                      Active System Privileges
                    </span>
                    <span className="text-[10px] text-subtext/70 font-medium">
                      Toggle specific operational capabilities on/off for this instructor
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      {
                        key: "COURSE_CREATE" as const,
                        title: "Course Creation",
                        desc: "Author self-paced & live curriculums",
                        icon: BookOpen,
                        enabled: Boolean(coursePermission.canCreateCourse)
                      },
                      {
                        key: "COURSE_EDIT" as const,
                        title: "Course Editing",
                        desc: "Update lessons, syllabus, and video assets",
                        icon: Edit3,
                        enabled: Boolean(coursePermission.canEditCourse)
                      },
                      {
                        key: "LIVE_CLASS_CREATE" as const,
                        title: "Live Class Creation",
                        desc: "Schedule interactive batch live sessions",
                        icon: Video,
                        enabled: Boolean(coursePermission.canCreateLiveClass)
                      },
                      {
                        key: "LIVE_CLASS_EDIT" as const,
                        title: "Live Class Editing",
                        desc: "Modify agenda, topics, timing, and Zoom credentials",
                        icon: Settings,
                        enabled: Boolean(coursePermission.canEditLiveClass)
                      },
                      {
                        key: "LIVE_CLASS_RESCHEDULE" as const,
                        title: "Live Class Rescheduling",
                        desc: "Adjust cohort dates and session time slots",
                        icon: Clock,
                        enabled: Boolean(coursePermission.canRescheduleLiveClass)
                      }
                    ].map((item) => {
                      const isToggling = togglingPermissionKey === item.key;
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.key}
                          id={`privilege-card-${item.key.toLowerCase()}`}
                          className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 shadow-sm ${
                            item.enabled
                              ? "bg-emerald-500/[0.04] border-emerald-500/25 shadow-emerald-500/5 hover:border-emerald-500/40"
                              : "bg-white/[0.02] border-white/10 opacity-75 hover:opacity-100 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                                  item.enabled
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                    : "bg-white/5 text-subtext/70 border-white/10"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <h4 className="text-xs font-black text-text flex items-center gap-1.5">
                                  <span>{item.title}</span>
                                </h4>
                                <p className="text-[11px] text-subtext leading-relaxed font-medium">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 transition-colors ${
                                item.enabled
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-white/5 text-subtext/60 border-white/10"
                              }`}
                            >
                              {item.enabled ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Active</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>Disabled</span>
                                </>
                              )}
                            </span>

                            <button
                              id={`toggle-${item.key.toLowerCase()}`}
                              type="button"
                              onClick={() => handleToggleIndividualPermission(item.key, item.enabled)}
                              disabled={isToggling || permissionProcessing}
                              aria-label={`Toggle ${item.title}`}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                item.enabled ? "bg-emerald-500" : "bg-white/15"
                              }`}
                            >
                              <span className="sr-only">Toggle {item.title}</span>
                              <span
                                className={`pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out transform ${
                                  item.enabled ? "translate-x-5" : "translate-x-0"
                                }`}
                              >
                                {isToggling ? (
                                  <Loader2 className="w-3 h-3 text-purple-600 animate-spin shrink-0" />
                                ) : item.enabled ? (
                                  <Check className="w-3 h-3 text-emerald-600 stroke-[3] shrink-0" />
                                ) : (
                                  <Lock className="w-2.5 h-2.5 text-zinc-600 shrink-0" />
                                )}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: COURSE CREATION AUTHORITY ── */}
              <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
                      <Unlock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-text uppercase tracking-wider flex items-center gap-2">
                        <span>Course Creation:</span>
                        <span className="text-emerald-400 font-extrabold">APPROVED</span>
                      </h3>
                      <p className="text-xs text-subtext mt-0.5">
                        Authorizing full curriculum development, module construction, and cohort assignment
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 uppercase tracking-wider self-start sm:self-auto shadow-sm shadow-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4" />
                    Granted & Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-background/50 border border-white/5 space-y-1">
                    <span className="text-[10px] text-subtext font-black uppercase tracking-wider block">
                      Permission Scope
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {coursePermission.canCreateCourse && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
                          Create Course
                        </span>
                      )}
                      {coursePermission.canEditCourse && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
                          Edit Own Courses
                        </span>
                      )}
                      {coursePermission.canCreateLiveClass && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
                          Create Live Classes
                        </span>
                      )}
                      {coursePermission.canEditLiveClass && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
                          Edit Live Sessions
                        </span>
                      )}
                      {coursePermission.canRescheduleLiveClass && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
                          Reschedule Sessions
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-background/50 border border-white/5 space-y-1">
                    <span className="text-[10px] text-subtext font-black uppercase tracking-wider block">
                      Approved Date
                    </span>
                    <p className="text-xs font-bold text-text pt-0.5">
                      {coursePermission.reviewedAt ? formatDate(coursePermission.reviewedAt) : "Active Record"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-background/50 border border-white/5 space-y-1">
                    <span className="text-[10px] text-subtext font-black uppercase tracking-wider block">
                      Authorized By
                    </span>
                    <p className="text-xs font-bold text-purple-300 pt-0.5 truncate">
                      {coursePermission.reviewedBy?.name || coursePermission.reviewedBy?.email || "Platform Super Administrator"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: LIVE CLASS MANAGEMENT AREA ── */}
              <div className="bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner shrink-0">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-text uppercase tracking-wider">
                          Live Class Management & Scheduling
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          {instructorLiveSessions.length} Sessions
                        </span>
                      </div>
                      <p className="text-xs text-subtext mt-0.5">
                        Schedule new interactive batch sessions, update Zoom links, edit topics, or reschedule class timings.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (availableLiveCourses.length > 0 && !createFormState.liveCourseId) {
                        setCreateFormState((prev) => ({ ...prev, liveCourseId: availableLiveCourses[0].id }));
                      }
                      setIsCreateLiveModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 group hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                    <span>Create Live Class</span>
                  </button>
                </div>

                {/* Live Action Feedback Toast */}
                {liveActionFeedback && (
                  <div
                    className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in ${
                      liveActionFeedback.type === "success"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/10 text-red-400 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {liveActionFeedback.type === "success" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span>{liveActionFeedback.text}</span>
                    </div>
                    <button
                      onClick={() => setLiveActionFeedback(null)}
                      className="text-subtext hover:text-text p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Live Class Sessions List / Table */}
                {instructorLiveSessions.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl space-y-4 bg-background/30">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="max-w-xs mx-auto space-y-1">
                      <p className="font-bold text-text text-sm">No Live Classes Scheduled</p>
                      <p className="text-xs text-subtext">
                        Create the first live class session for this instructor using the button above.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (availableLiveCourses.length > 0 && !createFormState.liveCourseId) {
                          setCreateFormState((prev) => ({ ...prev, liveCourseId: availableLiveCourses[0].id }));
                        }
                        setIsCreateLiveModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Live Class</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar border border-white/10 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-background/80 border-b border-white/10 text-subtext font-black text-[10px] uppercase tracking-wider">
                          <th className="py-3.5 px-4">Session & Topic</th>
                          <th className="py-3.5 px-4">Course / Cohort</th>
                          <th className="py-3.5 px-4">Date & Time</th>
                          <th className="py-3.5 px-4">Duration</th>
                          <th className="py-3.5 px-4">Instructor</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {instructorLiveSessions.map((s) => (
                          <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300">
                                    #{s.sessionNumber}
                                  </span>
                                  <span className="font-bold text-text group-hover:text-purple-300 transition-colors">
                                    {s.title}
                                  </span>
                                </div>
                                {s.description && (
                                  <p className="text-[11px] text-subtext truncate max-w-xs">{s.description}</p>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-text block truncate max-w-[180px]">
                                  {s.courseTitle}
                                </span>
                                <span className="text-[10px] text-sky-400 font-semibold block">
                                  {s.cohortName}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-text font-bold">
                                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                  <span>{s.date ? formatDate(s.date) : "Unscheduled"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-subtext font-medium">
                                  <Clock className="w-3 h-3 text-subtext" />
                                  <span>{s.startTime} - {s.endTime}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="text-subtext font-semibold">{s.duration}</span>
                              <span className="block text-[10px] text-subtext/70">{s.timezone}</span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-bold text-text">{s.instructorName || instructor.name}</span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                                  s.status === "SCHEDULED"
                                    ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                    : s.status === "LIVE"
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse"
                                    : s.status === "COMPLETED"
                                    ? "bg-zinc-500/15 text-zinc-400 border-zinc-500/20"
                                    : s.status === "RESCHEDULED"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                {s.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {s.meetingUrl && (
                                  <a
                                    href={s.meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open Meeting Link"
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-subtext hover:text-text border border-white/5 transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                                  </a>
                                )}

                                <button
                                  onClick={() => openEditModal(s)}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-purple-500/15 text-text hover:text-purple-300 border border-white/10 hover:border-purple-500/30 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3 text-purple-400" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  onClick={() => openRescheduleModal(s)}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/15 text-text hover:text-amber-300 border border-white/10 hover:border-amber-500/30 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>Reschedule</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── REJECT PERMISSION REASON MODAL ── */}
      {showPermissionRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Reject Course Creation Request
              </h3>
              <button
                onClick={() => setShowPermissionRejectModal(false)}
                className="text-subtext hover:text-text p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-subtext">
              Provide helpful feedback explaining why this request was not approved so the instructor can improve their proposal:
            </p>
            <textarea
              value={permissionFeedback}
              onChange={(e) => setPermissionFeedback(e.target.value)}
              placeholder="e.g. Please provide a more detailed syllabus outline or complete instructor onboarding..."
              rows={4}
              className="w-full bg-background border border-white/10 rounded-xl p-3 text-xs text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50 resize-none font-medium"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPermissionRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-subtext hover:text-text text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePermissionAction("REJECT", permissionFeedback)}
                disabled={permissionProcessing}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {permissionProcessing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE LIVE CLASS MODAL ── */}
      {isCreateLiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-text text-sm">Create Live Class Session</h3>
                  <p className="text-[11px] text-subtext">Assigning to Instructor: {instructor.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateLiveModalOpen(false)}
                className="text-subtext hover:text-text p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLiveClass} className="space-y-4 text-xs">
              {/* Live Course Cohort Select */}
              <div className="space-y-1">
                <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                  Select Live Course Cohort *
                </label>
                <select
                  value={createFormState.liveCourseId}
                  onChange={(e) => setCreateFormState({ ...createFormState, liveCourseId: e.target.value })}
                  required
                  className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
                >
                  <option value="" disabled>-- Select Live Cohort --</option>
                  {availableLiveCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} {c.category ? `(${c.category})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Title */}
              <div className="space-y-1">
                <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={createFormState.title}
                  onChange={(e) => setCreateFormState({ ...createFormState, title: e.target.value })}
                  placeholder="e.g. Masterclass: Fine-Tuning LLMs with LoRA"
                  required
                  className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-purple-500 font-medium placeholder:text-subtext/50"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                  Session Description / Agenda
                </label>
                <textarea
                  value={createFormState.description}
                  onChange={(e) => setCreateFormState({ ...createFormState, description: e.target.value })}
                  placeholder="Brief overview of what will be taught in this session..."
                  rows={3}
                  className="w-full bg-background border border-white/10 rounded-xl p-3 text-text focus:outline-none focus:border-purple-500 font-medium placeholder:text-subtext/50 resize-none"
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Date
                  </label>
                  <input
                    type="date"
                    value={createFormState.date}
                    onChange={(e) => setCreateFormState({ ...createFormState, date: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={createFormState.startTime}
                    onChange={(e) => setCreateFormState({ ...createFormState, startTime: e.target.value })}
                    placeholder="07:00 PM"
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={createFormState.endTime}
                    onChange={(e) => setCreateFormState({ ...createFormState, endTime: e.target.value })}
                    placeholder="09:00 PM"
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* Duration & Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={createFormState.duration}
                    onChange={(e) => setCreateFormState({ ...createFormState, duration: e.target.value })}
                    placeholder="120 min"
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={createFormState.timezone}
                    onChange={(e) => setCreateFormState({ ...createFormState, timezone: e.target.value })}
                    placeholder="Asia/Kolkata (IST)"
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* Meeting URL & Passcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Meeting URL (Zoom / Google Meet)
                  </label>
                  <input
                    type="url"
                    value={createFormState.meetingUrl}
                    onChange={(e) => setCreateFormState({ ...createFormState, meetingUrl: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Meeting Passcode
                  </label>
                  <input
                    type="text"
                    value={createFormState.passcode}
                    onChange={(e) => setCreateFormState({ ...createFormState, passcode: e.target.value })}
                    placeholder="GLARUS2026"
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                  Session Status
                </label>
                <select
                  value={createFormState.status}
                  onChange={(e) => setCreateFormState({ ...createFormState, status: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-text focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
                >
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="LIVE">LIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateLiveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-subtext hover:text-text font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLiveAction}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSavingLiveAction ? "Creating Session..." : "Create Live Session"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT LIVE CLASS MODAL ── */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-text text-sm">
                    Edit Live Session #{editingSession.sessionNumber}
                  </h3>
                  <p className="text-[11px] text-subtext">{editingSession.courseTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSession(null)}
                className="text-subtext hover:text-text p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditLiveClass} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={editFormState.title}
                  onChange={(e) => setEditFormState({ ...editFormState, title: e.target.value })}
                  required
                  className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                  Session Description
                </label>
                <textarea
                  value={editFormState.description}
                  onChange={(e) => setEditFormState({ ...editFormState, description: e.target.value })}
                  rows={3}
                  className="w-full bg-background border border-white/10 rounded-xl p-3 text-text focus:outline-none focus:border-purple-500 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editFormState.date}
                    onChange={(e) => setEditFormState({ ...editFormState, date: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={editFormState.startTime}
                    onChange={(e) => setEditFormState({ ...editFormState, startTime: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={editFormState.endTime}
                    onChange={(e) => setEditFormState({ ...editFormState, endTime: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editFormState.duration}
                    onChange={(e) => setEditFormState({ ...editFormState, duration: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Status
                  </label>
                  <select
                    value={editFormState.status}
                    onChange={(e) => setEditFormState({ ...editFormState, status: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-text focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="LIVE">LIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="RESCHEDULED">RESCHEDULED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Meeting URL
                  </label>
                  <input
                    type="url"
                    value={editFormState.meetingUrl}
                    onChange={(e) => setEditFormState({ ...editFormState, meetingUrl: e.target.value })}
                    placeholder="https://zoom.us/..."
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    Meeting Passcode
                  </label>
                  <input
                    type="text"
                    value={editFormState.meetingPasscode}
                    onChange={(e) => setEditFormState({ ...editFormState, meetingPasscode: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-subtext hover:text-text font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLiveAction}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingLiveAction ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESCHEDULE LIVE CLASS MODAL ── */}
      {reschedulingSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-text text-sm">Reschedule Live Session</h3>
                  <p className="text-[11px] text-subtext">Session #{reschedulingSession.sessionNumber}: {reschedulingSession.title}</p>
                </div>
              </div>
              <button
                onClick={() => setReschedulingSession(null)}
                className="text-subtext hover:text-text p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Schedule Summary Box */}
            <div className="p-4 rounded-2xl bg-background/70 border border-white/5 space-y-2">
              <span className="text-[10px] text-subtext font-black uppercase tracking-widest block">
                Current Schedule
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-subtext text-[11px] block">Course Cohort:</span>
                  <span className="font-bold text-text truncate block">{reschedulingSession.courseTitle}</span>
                </div>
                <div>
                  <span className="text-subtext text-[11px] block">Current Slot:</span>
                  <span className="font-bold text-amber-300">
                    {reschedulingSession.date ? formatDate(reschedulingSession.date) : "Unscheduled"} ({reschedulingSession.startTime})
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleRescheduleLiveClass} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                  New Session Date *
                </label>
                <input
                  type="date"
                  value={rescheduleFormState.newDate}
                  onChange={(e) => setRescheduleFormState({ ...rescheduleFormState, newDate: e.target.value })}
                  required
                  className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    New Start Time
                  </label>
                  <input
                    type="text"
                    value={rescheduleFormState.newStartTime}
                    onChange={(e) => setRescheduleFormState({ ...rescheduleFormState, newStartTime: e.target.value })}
                    placeholder="07:00 PM"
                    required
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                    New End Time
                  </label>
                  <input
                    type="text"
                    value={rescheduleFormState.newEndTime}
                    onChange={(e) => setRescheduleFormState({ ...rescheduleFormState, newEndTime: e.target.value })}
                    placeholder="09:00 PM"
                    required
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-text focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-subtext uppercase tracking-wider block text-[10px]">
                  Reason for Rescheduling *
                </label>
                <textarea
                  value={rescheduleFormState.reason}
                  onChange={(e) => setRescheduleFormState({ ...rescheduleFormState, reason: e.target.value })}
                  placeholder="e.g. Instructor travel schedule conflict, moved by admin request..."
                  required
                  rows={3}
                  className="w-full bg-background border border-white/10 rounded-xl p-3 text-text focus:outline-none focus:border-amber-500 font-medium resize-none placeholder:text-subtext/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setReschedulingSession(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-subtext hover:text-text font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLiveAction}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md shadow-amber-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isSavingLiveAction ? "Rescheduling..." : "Confirm Reschedule"}</span>
                </button>
              </div>
            </form>
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
