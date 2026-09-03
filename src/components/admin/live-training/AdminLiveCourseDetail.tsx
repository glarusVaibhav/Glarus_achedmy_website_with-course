"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Radio,
  Calendar,
  Clock,
  Users,
  Video,
  Edit3,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  MoreVertical,
  ExternalLink,
  RefreshCw,
  Copy,
  BookOpen,
  Award,
  ShieldCheck,
  X,
  Check,
  Archive,
  Save
} from "lucide-react";

export default function AdminLiveCourseDetail() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"TIMELINE" | "OVERVIEW" | "INSTRUCTORS" | "SETTINGS">("TIMELINE");

  // Modals
  const [addSessionModalOpen, setAddSessionModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] = useState<any>(null);
  const [assignInstructorModalOpen, setAssignInstructorModalOpen] = useState(false);
  const [selectedSessionForAssign, setSelectedSessionForAssign] = useState<any>(null);

  // New Session Form State
  const [newSessionData, setNewSessionData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "07:00 PM",
    endTime: "09:00 PM",
    duration: "120 min"
  });

  // Reschedule Form State
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    newStartTime: "07:00 PM",
    newEndTime: "09:00 PM",
    reason: ""
  });

  // Assign Instructor Form State
  const [instructorsList, setInstructorsList] = useState<any[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [assignPermissions, setAssignPermissions] = useState({
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

  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Edit Overview & AI Copilot State
  const [editOverviewModalOpen, setEditOverviewModalOpen] = useState(false);
  const [isGeneratingOverviewAI, setIsGeneratingOverviewAI] = useState(false);
  const [customOverviewPrompt, setCustomOverviewPrompt] = useState("");
  const [overviewForm, setOverviewForm] = useState({
    description: "",
    shortDescription: "",
    targetAudience: "",
    objectives: [] as string[],
    prerequisites: [] as string[]
  });

  const handleOpenEditOverview = () => {
    if (!course) return;
    setOverviewForm({
      description: course.description || "",
      shortDescription: course.shortDescription || "",
      targetAudience: course.targetAudience || "",
      objectives: course.objectives ? [...course.objectives] : [],
      prerequisites: course.prerequisites ? [...course.prerequisites] : []
    });
    setEditOverviewModalOpen(true);
  };

  const handleGenerateOverviewAI = async () => {
    if (!course) return;
    setIsGeneratingOverviewAI(true);
    try {
      const res = await fetch("/api/ai/live-course/overview-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: course.title,
          category: course.category,
          level: course.level,
          currentDescription: overviewForm.description,
          targetAudience: overviewForm.targetAudience,
          customInstructions: customOverviewPrompt,
          sessionCount: course.sessions?.length || 6
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOverviewForm((prev) => ({
          ...prev,
          description: data.description || prev.description,
          shortDescription: data.shortDescription || prev.shortDescription,
          targetAudience: data.targetAudience || prev.targetAudience,
          objectives: data.objectives?.length ? data.objectives : prev.objectives,
          prerequisites: data.prerequisites?.length ? data.prerequisites : prev.prerequisites
        }));
        setActionSuccessMsg("AI generated enhanced course overview!");
        setTimeout(() => setActionSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingOverviewAI(false);
    }
  };

  const handleSaveOverview = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/live-training/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overviewForm)
      });

      if (res.ok) {
        setEditOverviewModalOpen(false);
        setActionSuccessMsg("Course overview updated successfully!");
        fetchCourseData();
        setTimeout(() => setActionSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/live-training/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
      } else {
        setErrorMessage("Live course not found");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load course details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await fetch("/api/admin/live-training/assignments");
      if (res.ok) {
        const data = await res.json();
        setInstructorsList(data.instructors || []);
        if (data.instructors?.length > 0) {
          setSelectedInstructorId(data.instructors[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchInstructors();
    }
  }, [courseId]);

  // Handle Add Session Submit
  const handleAddSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionData.title.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/live-training/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liveCourseId: courseId,
          ...newSessionData
        })
      });

      if (res.ok) {
        setAddSessionModalOpen(false);
        setNewSessionData({
          title: "",
          description: "",
          date: "",
          startTime: "07:00 PM",
          endTime: "09:00 PM",
          duration: "120 min"
        });
        setActionSuccessMsg("Session added successfully!");
        fetchCourseData();
        setTimeout(() => setActionSuccessMsg(""), 3000);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to add session");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to add session");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reschedule Submit
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleForm.newDate || !rescheduleForm.reason.trim() || !selectedSessionForReschedule) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(
        `/api/admin/live-training/sessions/${selectedSessionForReschedule.id}/reschedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rescheduleForm)
        }
      );

      if (res.ok) {
        setRescheduleModalOpen(false);
        setSelectedSessionForReschedule(null);
        setRescheduleForm({ newDate: "", newStartTime: "07:00 PM", newEndTime: "09:00 PM", reason: "" });
        setActionSuccessMsg("Session rescheduled successfully! History and audit logs recorded.");
        fetchCourseData();
        setTimeout(() => setActionSuccessMsg(""), 3000);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to reschedule session");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reschedule session");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Assign Instructor Submit
  const handleAssignInstructorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructorId) return;

    setIsProcessing(true);
    try {
      const payload: any = {
        type: selectedSessionForAssign ? "SESSION" : "COURSE",
        liveCourseId: courseId,
        instructorId: selectedInstructorId,
        permissions: assignPermissions
      };
      if (selectedSessionForAssign) {
        payload.sessionId = selectedSessionForAssign.id;
      }

      const res = await fetch("/api/admin/live-training/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setAssignInstructorModalOpen(false);
        setSelectedSessionForAssign(null);
        setActionSuccessMsg("Instructor assigned successfully! Notification sent.");
        fetchCourseData();
        setTimeout(() => setActionSuccessMsg(""), 3000);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to assign instructor");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to assign instructor");
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Publish / Unpublish Status
  const handleTogglePublish = async () => {
    const nextStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/live-training/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setActionSuccessMsg(`Course status updated to ${nextStatus}!`);
        fetchCourseData();
        setTimeout(() => setActionSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      const res = await fetch(`/api/admin/live-training/sessions/${sessionId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchCourseData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-16 rounded-2xl bg-card border border-white/10 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
        <p className="text-xs text-subtext font-semibold">Loading Live Course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full max-w-7xl mx-auto p-12 text-center rounded-2xl bg-card border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-text">Live Course Not Found</h3>
        <Link
          href="/admin/live-training"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Training</span>
        </Link>
      </div>
    );
  }

  const isDraft = course.status === "DRAFT";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/live-training"
            className="p-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Live Cohort Track
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  course.status === "DRAFT"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : course.status === "ASSIGNED"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : course.status === "READY_TO_PUBLISH"
                    ? "bg-teal-500/20 text-teal-300 border-teal-500/30 font-bold"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {course.status === "READY_TO_PUBLISH" ? "READY TO PUBLISH (REVIEWED)" : course.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight mt-1">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setSelectedSessionForAssign(null);
              setAssignInstructorModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Assign Lead Instructor</span>
          </button>
          <button
            onClick={() => setAddSessionModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Add Session</span>
          </button>
          <button
            onClick={handleTogglePublish}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg hover:scale-105 ${
              isDraft
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/20"
                : "bg-card hover:bg-card-hover text-subtext hover:text-text border border-white/10"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isDraft ? "Publish Live Course" : "Unpublish to Draft"}</span>
          </button>
        </div>
      </div>

      {/* Ready to Publish Instructor Reviewed Banner */}
      {course.status === "READY_TO_PUBLISH" && (
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-teal-300 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Instructor Reviewed: Ready to Publish</p>
              <p className="text-teal-300/80 text-[11px] mt-0.5">
                The lead instructor has reviewed the syllabus and marked this cohort ready for public enrollment.
              </p>
            </div>
          </div>
          <button
            onClick={handleTogglePublish}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-teal-600/25 hover:scale-105 transition-all shrink-0"
          >
            Publish to Students Now
          </button>
        </div>
      )}

      {/* Notifications / Alerts */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-1">
          <p className="text-[10px] text-subtext font-bold uppercase tracking-wider">Lead Instructor</p>
          <p className="text-sm font-bold text-text truncate">
            {course.leadInstructor?.name || "Unassigned"}
          </p>
          <p className="text-[10px] text-subtext truncate">{course.leadInstructor?.email || "Click Assign Lead"}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-1">
          <p className="text-[10px] text-subtext font-bold uppercase tracking-wider">Total Live Sessions</p>
          <p className="text-xl font-black text-text">{course.sessions?.length || 0} Sessions</p>
          <p className="text-[10px] text-purple-300 font-semibold">{course.duration || "6 Weeks"}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-1">
          <p className="text-[10px] text-subtext font-bold uppercase tracking-wider">Schedule Cadence</p>
          <p className="text-sm font-bold text-text truncate">
            {course.startDate ? new Date(course.startDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "TBA"}
          </p>
          <p className="text-[10px] text-subtext truncate">{course.timezone}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-1">
          <p className="text-[10px] text-subtext font-bold uppercase tracking-wider">Student Capacity</p>
          <p className="text-xl font-black text-emerald-400">
            {course.enrolledCount || 0} / {course.maxStudents}
          </p>
          <p className="text-[10px] text-subtext">Active enrollments</p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card border border-white/10 w-fit">
        {[
          { id: "TIMELINE", label: "Sessions Timeline", icon: Layers },
          { id: "OVERVIEW", label: "Course Curriculum & Overview", icon: BookOpen },
          { id: "INSTRUCTORS", label: "Instructor Roster & Permissions", icon: UserCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-sm"
                  : "text-subtext hover:text-text hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB 1: SESSIONS TIMELINE
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "TIMELINE" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">
              Chronological Session Timeline ({course.sessions?.length || 0} Workshops)
            </h3>
            <button
              onClick={() => setAddSessionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Session</span>
            </button>
          </div>

          <div className="space-y-3">
            {course.sessions?.map((sess: any) => {
              const assigned = sess.assignments?.[0]?.instructor || course.leadInstructor || null;
              const permissions = sess.assignments?.[0] || null;

              return (
                <div
                  key={sess.id}
                  className="p-5 rounded-2xl bg-card border border-white/10 hover:border-purple-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black text-xs shrink-0 mt-0.5">
                      {sess.sessionNumber < 10 ? `0${sess.sessionNumber}` : sess.sessionNumber}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-text group-hover:text-purple-300 transition-colors">
                          {sess.title}
                        </h4>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                            sess.status === "COMPLETED"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                              : sess.status === "LIVE"
                              ? "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse"
                              : sess.status === "RESCHEDULED"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-purple-500/15 text-purple-300 border-purple-500/20"
                          }`}
                        >
                          {sess.status}
                        </span>
                      </div>

                      <p className="text-xs text-subtext line-clamp-1">{sess.description}</p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-subtext flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          {sess.date ? new Date(sess.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Unscheduled"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          {sess.startTime} – {sess.endTime} ({sess.duration})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-text">
                          <UserCheck className="w-3 h-3 text-amber-400" />
                          {assigned?.name || "Unassigned"}
                        </span>
                        {permissions && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            ({permissions.canEdit ? "Can Edit" : "View Only"})
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {sess.agenda?.length || 0} agenda steps
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    <button
                      onClick={() => {
                        setSelectedSessionForReschedule(sess);
                        setRescheduleForm({
                          newDate: sess.date ? new Date(sess.date).toISOString().split("T")[0] : "",
                          newStartTime: sess.startTime || "07:00 PM",
                          newEndTime: sess.endTime || "09:00 PM",
                          reason: ""
                        });
                        setRescheduleModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-amber-300 text-xs font-bold transition-all"
                      title="Reschedule Session"
                    >
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSessionForAssign(sess);
                        setAssignInstructorModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all"
                      title="Assign / Reassign Instructor"
                    >
                      <UserCheck className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
                      <span>Assign</span>
                    </button>

                    <Link
                      href={`/admin/live-training/courses/${course.id}/sessions/${sess.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => handleDeleteSession(sess.id)}
                      className="p-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-red-400 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 2: OVERVIEW & PREREQUISITES
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Detailed Description & Objectives
              </h3>
              <button
                type="button"
                onClick={handleOpenEditOverview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Assist & Edit Overview</span>
              </button>
            </div>
            <p className="text-xs text-subtext leading-relaxed whitespace-pre-line">
              {course.description}
            </p>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="text-xs font-bold text-text">Learning Objectives</h4>
              <ul className="space-y-1.5">
                {course.objectives?.map((obj: string, i: number) => (
                  <li key={i} className="text-xs text-subtext flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Prerequisites & Audience
              </h3>
              <p className="text-xs text-subtext leading-relaxed">
                <strong>Target Audience:</strong> {course.targetAudience || "Engineers & Researchers"}
              </p>
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-text">Prerequisites:</h4>
                <ul className="space-y-1">
                  {course.prerequisites?.map((pr: string, i: number) => (
                    <li key={i} className="text-xs text-subtext flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{pr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" />
                Meeting & Platform Settings
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-subtext">Platform:</span>
                  <p className="font-bold text-text mt-0.5">{course.meetingPlatform}</p>
                </div>
                <div>
                  <span className="text-subtext">Timezone:</span>
                  <p className="font-bold text-text mt-0.5">{course.timezone}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-subtext">Default Room URL:</span>
                  <p className="font-bold text-purple-300 truncate mt-0.5">
                    {course.meetingUrl || "Configured per session"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 3: INSTRUCTORS & PERMISSIONS ROSTER
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "INSTRUCTORS" && (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Assigned Instructors & Permissions</h3>
              <p className="text-xs text-subtext">
                Granular permission controls applied per instructor across this live course.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedSessionForAssign(null);
                setAssignInstructorModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Instructor</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-subtext text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Instructor</th>
                  <th className="py-3 px-3">Assignment Scope</th>
                  <th className="py-3 px-3">Master Edit</th>
                  <th className="py-3 px-3">Agenda Edit</th>
                  <th className="py-3 px-3">Schedule Edit</th>
                  <th className="py-3 px-3">Reschedule Rights</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {course.assignments?.map((assign: any) => (
                  <tr key={assign.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs">
                          {assign.instructor?.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-text">{assign.instructor?.name}</p>
                          <p className="text-[10px] text-subtext">{assign.instructor?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-semibold text-[10px]">
                        Entire Course (Lead)
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {assign.canEdit ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Granted
                        </span>
                      ) : (
                        <span className="text-subtext font-semibold">View Only</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">{assign.canEditAgenda ? "Allowed" : "Locked"}</td>
                    <td className="py-3.5 px-3">{assign.canEditSchedule ? "Allowed" : "Locked"}</td>
                    <td className="py-3.5 px-3">{assign.canReschedule ? "Allowed" : "Locked"}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedSessionForAssign(null);
                          setSelectedInstructorId(assign.instructorId);
                          setAssignPermissions({
                            canView: assign.canView,
                            canEdit: assign.canEdit,
                            canEditAgenda: assign.canEditAgenda,
                            canEditSchedule: assign.canEditSchedule,
                            canEditResources: assign.canEditResources,
                            canAddHomework: assign.canAddHomework,
                            canReschedule: assign.canReschedule,
                            canCancel: assign.canCancel,
                            canManageAttendance: assign.canManageAttendance,
                            canManageRecording: assign.canManageRecording
                          });
                          setAssignInstructorModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
                      >
                        Edit Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 1: ADD SESSION MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {addSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSessionSubmit}
            className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                Add Live Session
              </h3>
              <button
                type="button"
                onClick={() => setAddSessionModalOpen(false)}
                className="text-subtext hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text">Session Title *</label>
                <input
                  type="text"
                  required
                  value={newSessionData.title}
                  onChange={(e) => setNewSessionData({ ...newSessionData, title: e.target.value })}
                  placeholder="e.g. Stateful Multi-Agent Graph Architectures"
                  className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text">Summary / Scope</label>
                <textarea
                  rows={2}
                  value={newSessionData.description}
                  onChange={(e) => setNewSessionData({ ...newSessionData, description: e.target.value })}
                  placeholder="Live coding goals, tools used, breakout expectations..."
                  className="w-full p-2.5 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-text">Date</label>
                  <input
                    type="date"
                    value={newSessionData.date}
                    onChange={(e) => setNewSessionData({ ...newSessionData, date: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text">Duration</label>
                  <input
                    type="text"
                    value={newSessionData.duration}
                    onChange={(e) => setNewSessionData({ ...newSessionData, duration: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-text">Start Time</label>
                  <input
                    type="text"
                    value={newSessionData.startTime}
                    onChange={(e) => setNewSessionData({ ...newSessionData, startTime: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text">End Time</label>
                  <input
                    type="text"
                    value={newSessionData.endTime}
                    onChange={(e) => setNewSessionData({ ...newSessionData, endTime: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddSessionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                {isProcessing ? "Adding..." : "Add Session"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 2: RESCHEDULE SESSION MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {rescheduleModalOpen && selectedSessionForReschedule && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleRescheduleSubmit}
            className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Reschedule Session {selectedSessionForReschedule.sessionNumber}
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="text-subtext hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-background/60 border border-white/5 space-y-1 text-xs">
              <p className="font-bold text-text">{selectedSessionForReschedule.title}</p>
              <p className="text-subtext">
                Current:{" "}
                <span className="text-amber-300 font-semibold">
                  {selectedSessionForReschedule.date ? new Date(selectedSessionForReschedule.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Unscheduled"}{" "}
                  ({selectedSessionForReschedule.startTime} - {selectedSessionForReschedule.endTime})
                </span>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text">New Date *</label>
                <input
                  type="date"
                  required
                  value={rescheduleForm.newDate}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-text">New Start Time</label>
                  <input
                    type="text"
                    value={rescheduleForm.newStartTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, newStartTime: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text">New End Time</label>
                  <input
                    type="text"
                    value={rescheduleForm.newEndTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, newEndTime: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text">Reason for Rescheduling * (Recorded in Audit Logs)</label>
                <textarea
                  rows={2}
                  required
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  placeholder="e.g. Instructor travel conflict, guest speaker availability..."
                  className="w-full p-2.5 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shadow-md shadow-amber-500/30"
              >
                {isProcessing ? "Updating Schedule..." : "Confirm Reschedule"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 3: ASSIGN INSTRUCTOR & PERMISSIONS MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {assignInstructorModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAssignInstructorSubmit}
            className="w-full max-w-xl rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                {selectedSessionForAssign
                  ? `Assign Instructor to Session ${selectedSessionForAssign.sessionNumber}`
                  : "Assign Lead Instructor (Entire Course)"}
              </h3>
              <button
                type="button"
                onClick={() => setAssignInstructorModalOpen(false)}
                className="text-subtext hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text">Select Instructor *</label>
                <select
                  value={selectedInstructorId}
                  onChange={(e) => setSelectedInstructorId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                >
                  {instructorsList.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Granular Permissions */}
              <div className="p-4 rounded-xl bg-background/50 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-text">Session Permissions Configuration</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "canView", label: "View Session" },
                    { key: "canEdit", label: "Can Edit Session" },
                    { key: "canEditAgenda", label: "Edit Agenda Timeline" },
                    { key: "canEditSchedule", label: "Edit Schedule Directly" },
                    { key: "canEditResources", label: "Edit Resources" },
                    { key: "canAddHomework", label: "Add / Edit Homework" },
                    { key: "canReschedule", label: "Reschedule Rights" },
                    { key: "canCancel", label: "Cancel Rights" },
                    { key: "canManageAttendance", label: "Manage Attendance" },
                    { key: "canManageRecording", label: "Manage Recordings" }
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-2 rounded-lg bg-card/60 border border-white/5 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={(assignPermissions as any)[perm.key]}
                        onChange={(e) =>
                          setAssignPermissions({
                            ...assignPermissions,
                            [perm.key]: e.target.checked
                          })
                        }
                        className="accent-purple-500"
                      />
                      <span className="text-text font-semibold truncate">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssignInstructorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                {isProcessing ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 4: EDIT COURSE OVERVIEW & AI ASSISTANT
          ═══════════════════════════════════════════════════════════════ */}
      {editOverviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-purple-500/30 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">Course Overview & AI Copilot</h3>
                  <p className="text-xs text-subtext">Refine detailed description, objectives, and audience</p>
                </div>
              </div>
              <button
                onClick={() => setEditOverviewModalOpen(false)}
                className="text-subtext hover:text-text p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Refinement Header */}
            <div className="p-3.5 rounded-xl bg-background/60 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Enhancement Generator
                </span>
                <span className="text-[10px] text-subtext">Powered by Groq</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customOverviewPrompt}
                  onChange={(e) => setCustomOverviewPrompt(e.target.value)}
                  placeholder="e.g. Focus on production deployment benchmarks and real-time streaming..."
                  className="flex-1 h-9 px-3 rounded-xl bg-card border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="button"
                  onClick={handleGenerateOverviewAI}
                  disabled={isGeneratingOverviewAI}
                  className="px-3.5 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingOverviewAI ? "animate-spin" : ""}`} />
                  <span>{isGeneratingOverviewAI ? "Generating..." : "Generate with AI"}</span>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text">Detailed Course Overview *</label>
                <textarea
                  rows={6}
                  value={overviewForm.description}
                  onChange={(e) => setOverviewForm({ ...overviewForm, description: e.target.value })}
                  placeholder="Comprehensive learning trajectory, capstone live project, pair-programming expectations..."
                  className="w-full p-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text">Short Summary (1-2 sentences)</label>
                <input
                  type="text"
                  value={overviewForm.shortDescription}
                  onChange={(e) => setOverviewForm({ ...overviewForm, shortDescription: e.target.value })}
                  className="w-full h-9 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text">Target Audience</label>
                <input
                  type="text"
                  value={overviewForm.targetAudience}
                  onChange={(e) => setOverviewForm({ ...overviewForm, targetAudience: e.target.value })}
                  className="w-full h-9 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text">Learning Objectives (comma-separated or itemized)</label>
                <textarea
                  rows={3}
                  value={overviewForm.objectives.join("\n")}
                  onChange={(e) =>
                    setOverviewForm({
                      ...overviewForm,
                      objectives: e.target.value.split("\n").filter((s) => s.trim().length > 0)
                    })
                  }
                  placeholder="One objective per line..."
                  className="w-full p-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditOverviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOverview}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 disabled:opacity-50"
              >
                {isProcessing ? "Saving..." : "Save Overview Updates"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
