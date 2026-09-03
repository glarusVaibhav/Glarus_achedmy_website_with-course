"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  UserCheck,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  Edit3,
  MoreVertical,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  ExternalLink,
  ArrowRight,
  Radio,
  BookOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Eye,
  Grid3X3,
  List,
  Copy,
  Lock,
  Unlock,
  Settings,
  Shield,
  Video,
  ChevronRight
} from "lucide-react";

type ViewMode = "BY_COURSE" | "FLAT_LIST";

export default function AdminInstructorAssignmentsView() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("BY_COURSE");
  const [expandedCourseIds, setExpandedCourseIds] = useState<Record<string, boolean>>({});

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("ALL");
  const [filterInstructor, setFilterInstructor] = useState("ALL");
  const [filterPermission, setFilterPermission] = useState("ALL");
  const [filterAssignmentStatus, setFilterAssignmentStatus] = useState<"ALL" | "COMPLETE" | "NEEDS_INSTRUCTOR">("ALL");

  // Modals
  const [changeInstructorModalOpen, setChangeInstructorModalOpen] = useState(false);
  const [selectedAssignmentForChange, setSelectedAssignmentForChange] = useState<any>(null);
  const [newInstructorId, setNewInstructorId] = useState("");
  const [reassignReason, setReassignReason] = useState("");

  const [assignBatchModalOpen, setAssignBatchModalOpen] = useState(false);
  const [selectedCourseForBatch, setSelectedCourseForBatch] = useState<any>(null);
  const [batchInstructorId, setBatchInstructorId] = useState("");
  const [batchAssignAllSessions, setBatchAssignAllSessions] = useState(true);
  const [batchOverwriteExisting, setBatchOverwriteExisting] = useState(true);
  const [batchPermissions, setBatchPermissions] = useState<any>({
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
  });
  const [batchReassignReason, setBatchReassignReason] = useState("");

  // Course Bulk Permissions Modal (Set to all sessions of this class)
  const [courseBulkPermissionsModalOpen, setCourseBulkPermissionsModalOpen] = useState(false);
  const [selectedCourseForBulkPerms, setSelectedCourseForBulkPerms] = useState<any>(null);
  const [bulkTargetInstructorId, setBulkTargetInstructorId] = useState("ALL");
  const [bulkPermissions, setBulkPermissions] = useState<any>({
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

  const [editPermissionsModalOpen, setEditPermissionsModalOpen] = useState(false);
  const [selectedAssignmentForPerms, setSelectedAssignmentForPerms] = useState<any>(null);
  const [tempPermissions, setTempPermissions] = useState<any>({});

  const [courseSessionsModal, setCourseSessionsModal] = useState<any>(null);
  const [sessionDetailModal, setSessionDetailModal] = useState<any>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Helper to apply preset permissions
  const applyPresetPermissions = (
    preset: "FULL" | "TEACHING" | "READONLY",
    target: "BATCH" | "BULK"
  ) => {
    let perms: any = {};
    if (preset === "FULL") {
      perms = {
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
      };
    } else if (preset === "TEACHING") {
      perms = {
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
      };
    } else if (preset === "READONLY") {
      perms = {
        canView: true,
        canEdit: false,
        canEditAgenda: false,
        canEditSchedule: false,
        canEditResources: false,
        canAddHomework: false,
        canReschedule: false,
        canCancel: false,
        canManageAttendance: true,
        canManageRecording: true
      };
    }

    if (target === "BATCH") {
      setBatchPermissions(perms);
    } else {
      setBulkPermissions(perms);
    }
  };

  // Fetch all assignments, courses, and instructors
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assignRes, coursesRes, sessRes] = await Promise.allSettled([
        fetch("/api/admin/live-training/assignments"),
        fetch("/api/admin/live-training/courses"),
        fetch("/api/admin/live-training/sessions")
      ]);

      let fetchedAssignments: any[] = [];
      let fetchedCourses: any[] = [];
      let fetchedSessions: any[] = [];

      if (assignRes.status === "fulfilled" && assignRes.value.ok) {
        const data = await assignRes.value.json();
        fetchedAssignments = data.assignments || [];
        setAssignments(fetchedAssignments);
        setInstructors(data.instructors || []);
      }
      if (coursesRes.status === "fulfilled" && coursesRes.value.ok) {
        const data = await coursesRes.value.json();
        fetchedCourses = data.courses || [];
        setCourses(fetchedCourses);
      }
      if (sessRes.status === "fulfilled" && sessRes.value.ok) {
        const data = await sessRes.value.json();
        fetchedSessions = data.sessions || [];
        setAllSessions(fetchedSessions);
      }

      // If courses list is empty or some courses only exist in assignments, synthesize them
      const courseMap = new Map();
      fetchedCourses.forEach((c) => courseMap.set(c.id, c));
      fetchedAssignments.forEach((a) => {
        if (a.liveCourse && !courseMap.has(a.liveCourse.id)) {
          courseMap.set(a.liveCourse.id, {
            ...a.liveCourse,
            sessions: []
          });
        }
      });
      const combinedCourses = Array.from(courseMap.values());
      if (combinedCourses.length > fetchedCourses.length) {
        setCourses(combinedCourses);
      }

      // Start with all sessions collapsed/hidden by default on page load
      setExpandedCourseIds({});
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load live training assignments and courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourseIds((prev) => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleExpandAll = () => {
    const allExp: Record<string, boolean> = {};
    courses.forEach((c) => {
      allExp[c.id] = true;
    });
    setExpandedCourseIds(allExp);
  };

  const handleCollapseAll = () => {
    setExpandedCourseIds({});
  };

  // Group assignments and sessions by Course
  const courseAllocationData = useMemo(() => {
    return courses.map((course) => {
      // 1. Get all assignments for this course
      const courseAssignments = assignments.filter(
        (a) => a.liveCourseId === course.id || a.liveCourse?.id === course.id
      );
      
      // 2. Gather sessions from course object, allSessions endpoint, and assignment records
      const sessionMap = new Map();

      // From course.sessions
      if (Array.isArray(course.sessions)) {
        course.sessions.forEach((s: any) => {
          if (s && s.id) sessionMap.set(s.id, s);
        });
      }

      // From allSessions matching this course
      allSessions
        .filter((s) => s.courseId === course.id || s.liveCourseId === course.id)
        .forEach((s) => {
          if (s && s.id) {
            const existing = sessionMap.get(s.id);
            sessionMap.set(s.id, { ...existing, ...s });
          }
        });

      // From assignments that have a session attached
      courseAssignments
        .filter((a) => a.session && a.session.id)
        .forEach((a) => {
          const s = a.session;
          const existing = sessionMap.get(s.id);
          sessionMap.set(s.id, {
            ...existing,
            ...s,
            assignments: existing?.assignments || [a]
          });
        });

      // Sort sessions numerically
      const rawSessions = Array.from(sessionMap.values()).sort(
        (a: any, b: any) => (a.sessionNumber || 0) - (b.sessionNumber || 0)
      );

      // Map sessions with their assignment info & assigned instructor
      const sessionsWithAssignments = rawSessions.map((sess: any) => {
        const sessAssignment = courseAssignments.find(
          (a) => a.sessionId === sess.id || a.session?.id === sess.id
        );
        const assignedInstructor =
          sessAssignment?.instructor ||
          sess.assignedInstructor ||
          sess.assignments?.[0]?.instructor ||
          course.leadInstructor ||
          null;
        const permissions = sessAssignment || sess.permissions || sess.assignments?.[0] || null;

        return {
          ...sess,
          assignment: sessAssignment,
          assignedInstructor,
          permissions,
          isAssigned: !!assignedInstructor
        };
      });

      const totalSessionsCount = sessionsWithAssignments.length;
      const assignedSessionsCount = sessionsWithAssignments.filter((s: any) => s.isAssigned).length;
      const isFullyAssigned = totalSessionsCount > 0 && assignedSessionsCount === totalSessionsCount;
      const needsInstructor = totalSessionsCount === 0 || assignedSessionsCount < totalSessionsCount;

      // Unique assigned instructors in this course with sessions count
      const instructorMap = new Map();
      if (course.leadInstructor) {
        instructorMap.set(course.leadInstructor.id, {
          ...course.leadInstructor,
          isLead: true,
          sessionsCount: 0
        });
      }
      sessionsWithAssignments.forEach((s: any) => {
        if (s.assignedInstructor) {
          const existing = instructorMap.get(s.assignedInstructor.id) || {
            ...s.assignedInstructor,
            isLead: course.leadInstructor?.id === s.assignedInstructor.id,
            sessionsCount: 0
          };
          existing.sessionsCount = (existing.sessionsCount || 0) + 1;
          instructorMap.set(s.assignedInstructor.id, existing);
        }
      });
      const uniqueInstructors = Array.from(instructorMap.values());

      return {
        ...course,
        sessionsWithAssignments,
        totalSessionsCount,
        assignedSessionsCount,
        isFullyAssigned,
        needsInstructor,
        uniqueInstructors
      };
    });
  }, [courses, assignments, allSessions]);

  // Filtered Courses (for Grouped view)
  const filteredCourses = useMemo(() => {
    return courseAllocationData.filter((course) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        course.title?.toLowerCase().includes(q) ||
        course.category?.toLowerCase().includes(q) ||
        course.leadInstructor?.name?.toLowerCase().includes(q) ||
        course.uniqueInstructors.some((inst: any) => inst.name?.toLowerCase().includes(q)) ||
        course.sessionsWithAssignments.some((s: any) => s.title?.toLowerCase().includes(q));

      const matchCourse = filterCourse === "ALL" || course.id === filterCourse;

      const matchInstructor =
        filterInstructor === "ALL" ||
        (filterInstructor === "UNASSIGNED"
          ? (!course.leadInstructor && course.uniqueInstructors.length === 0)
          : (course.leadInstructor?.id === filterInstructor || course.uniqueInstructors.some((inst: any) => inst.id === filterInstructor)));

      const matchStatus =
        filterAssignmentStatus === "ALL" ||
        (filterAssignmentStatus === "COMPLETE" && course.isFullyAssigned) ||
        (filterAssignmentStatus === "NEEDS_INSTRUCTOR" && course.needsInstructor);

      return matchSearch && matchCourse && matchInstructor && matchStatus;
    });
  }, [courseAllocationData, searchTerm, filterCourse, filterInstructor, filterAssignmentStatus]);

  // Filtered Flat Assignments (for Flat List view)
  const filteredFlatAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const instructorName = item.instructor?.name?.toLowerCase() || "";
      const courseTitle = item.liveCourse?.title?.toLowerCase() || "";
      const sessionTitle = item.session?.title?.toLowerCase() || "";
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        instructorName.includes(q) ||
        courseTitle.includes(q) ||
        sessionTitle.includes(q);

      const matchesCourse = filterCourse === "ALL" || item.liveCourseId === filterCourse;

      const matchesInstructor =
        filterInstructor === "ALL" ||
        (filterInstructor === "UNASSIGNED"
          ? !item.instructorId
          : item.instructorId === filterInstructor || item.instructor?.id === filterInstructor);

      const matchesPerm =
        filterPermission === "ALL" ||
        (filterPermission === "EDIT" && item.canEdit) ||
        (filterPermission === "VIEW" && !item.canEdit);

      return matchesSearch && matchesCourse && matchesInstructor && matchesPerm;
    });
  }, [assignments, searchTerm, filterCourse, filterInstructor, filterPermission]);

  // Telemetry Metrics
  const telemetry = useMemo(() => {
    const totalCourses = courses.length;
    const totalAllocations = assignments.length;
    const activeInstructorsCount = instructors.length;
    const coursesNeedingInstructors = courseAllocationData.filter((c) => c.needsInstructor).length;

    return { totalCourses, totalAllocations, activeInstructorsCount, coursesNeedingInstructors };
  }, [courses, assignments, instructors, courseAllocationData]);

  // Handle Change Instructor Submit
  const handleChangeInstructorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForChange || !newInstructorId) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/live-training/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignmentForChange.id,
          newInstructorId,
          reassignReason
        })
      });

      if (res.ok) {
        setChangeInstructorModalOpen(false);
        setSelectedAssignmentForChange(null);
        setReassignReason("");
        setSuccessMessage("Instructor reassigned successfully! Audit trail and notifications logged.");
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3500);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to reassign instructor");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reassign instructor");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Batch Assign Course / Change Lead Submit
  const handleBatchAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForBatch || !batchInstructorId) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/live-training/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CHANGE_LEAD",
          liveCourseId: selectedCourseForBatch.id,
          instructorId: batchInstructorId,
          assignToAllSessions: batchAssignAllSessions,
          overwriteExisting: batchOverwriteExisting,
          reassignReason: batchReassignReason,
          permissions: batchPermissions
        })
      });

      if (res.ok) {
        setAssignBatchModalOpen(false);
        setSelectedCourseForBatch(null);
        setSuccessMessage(`Lead instructor and session permissions updated for "${selectedCourseForBatch.title}"!`);
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3500);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to batch assign instructor");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to batch assign instructor");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Bulk Course Permissions Submit (Set to all sessions of this class)
  const handleBulkCoursePermissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForBulkPerms) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/live-training/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BULK_COURSE_PERMISSIONS",
          liveCourseId: selectedCourseForBulkPerms.id,
          targetInstructorId: bulkTargetInstructorId,
          permissions: bulkPermissions
        })
      });

      if (res.ok) {
        setCourseBulkPermissionsModalOpen(false);
        setSelectedCourseForBulkPerms(null);
        setSuccessMessage(`Permissions successfully updated for all sessions of "${selectedCourseForBulkPerms.title}"!`);
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3500);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to update bulk permissions");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update bulk permissions");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Edit Permissions Submit
  const handleEditPermissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForPerms) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/live-training/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignmentForPerms.id,
          permissions: tempPermissions
        })
      });

      if (res.ok) {
        setEditPermissionsModalOpen(false);
        setSelectedAssignmentForPerms(null);
        setSuccessMessage("Permissions updated successfully!");
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to update permissions");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update permissions");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Remove Assignment
  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this instructor assignment?")) return;
    try {
      const res = await fetch(`/api/admin/live-training/assignments?id=${assignmentId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSuccessMessage("Assignment removed successfully!");
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-28 text-text select-none">
      {/* ═══════════════════════════════════════════════════════════════
          HEADER & TELEMETRY BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/90 to-amber-950/20 border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Instructor Allocations Studio
              </span>
              <span className="text-xs text-subtext/60">•</span>
              <span className="text-xs text-subtext font-semibold">
                {courses.length} Live Tracks & Cohorts
              </span>
              <span className="text-xs text-subtext/60">•</span>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {assignments.length} Total Session Assignments
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Instructor Assignments & Permissions
            </h1>
            <p className="text-xs sm:text-sm text-subtext max-w-2xl font-normal">
              Organize teaching faculties by course, assign lead mentors, manage granular session rights, and inspect workshop schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin/live-training"
              className="px-4 py-2.5 rounded-2xl bg-card hover:bg-card-hover border border-white/15 text-text hover:text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-purple-400" />
              <span>Live Training Studio</span>
            </Link>

            <Link
              href="/admin/live-training/calendar"
              className="px-4 py-2.5 rounded-2xl bg-card hover:bg-card-hover border border-white/15 text-text hover:text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Master Calendar</span>
            </Link>

            <button
              onClick={fetchData}
              title="Refresh Allocations"
              className="p-2.5 rounded-2xl bg-card hover:bg-card-hover border border-white/15 text-subtext hover:text-text transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-purple-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Telemetry KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-background/50 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-subtext">
              <span className="text-[10px] font-bold uppercase tracking-wider">Live Courses</span>
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white">{telemetry.totalCourses}</p>
            <p className="text-[10px] text-purple-300/80 font-semibold">Active cohorts</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-background/50 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-subtext">
              <span className="text-[10px] font-bold uppercase tracking-wider">Assigned Sessions</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">{telemetry.totalAllocations}</p>
            <p className="text-[10px] text-emerald-300/80 font-semibold">Allocated workshops</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-background/50 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-subtext">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Faculty</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-300">{telemetry.activeInstructorsCount}</p>
            <p className="text-[10px] text-amber-400/80 font-semibold">Instructors available</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-background/50 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-subtext">
              <span className="text-[10px] font-bold uppercase tracking-wider">Needs Allocation</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-400">{telemetry.coursesNeedingInstructors}</p>
            <p className="text-[10px] text-rose-400/80 font-semibold">Courses needing mentors</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          NAVBAR & FILTER CONTROLS + VIEW SWITCHER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="p-4 rounded-3xl bg-card/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-subtext" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course, instructor name, or session title..."
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-background/70 border border-white/10 text-xs text-white placeholder-subtext/60 focus:outline-none focus:border-purple-500/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle & Expand/Collapse Controls */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            {viewMode === "BY_COURSE" && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleExpandAll}
                  className="px-3 py-1.5 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-white text-[11px] font-bold transition-all shadow-sm"
                  title="Expand all courses"
                >
                  Expand All
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="px-3 py-1.5 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-white text-[11px] font-bold transition-all shadow-sm"
                  title="Collapse all courses"
                >
                  Collapse All
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-background/80 border border-white/10 text-xs font-bold">
              <button
                onClick={() => setViewMode("BY_COURSE")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  viewMode === "BY_COURSE"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/30"
                    : "text-subtext hover:text-white hover:bg-white/5"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Group by Course</span>
              </button>
              <button
                onClick={() => setViewMode("FLAT_LIST")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  viewMode === "FLAT_LIST"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/30"
                    : "text-subtext hover:text-white hover:bg-white/5"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>All Assignments List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="relative">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-background/70 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 appearance-none font-semibold cursor-pointer"
            >
              <option value="ALL">All Live Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-card text-white">
                  {c.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-subtext absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterInstructor}
              onChange={(e) => setFilterInstructor(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-background/70 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 appearance-none font-semibold cursor-pointer"
            >
              <option value="ALL">All Instructors ({instructors.length})</option>
              <option value="UNASSIGNED" className="bg-card text-amber-300">⚠️ Unassigned Sessions / Courses</option>
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-card text-white">
                  {inst.name} ({inst.specialization || "Faculty"})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-subtext absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterAssignmentStatus}
              onChange={(e) => setFilterAssignmentStatus(e.target.value as any)}
              className="w-full h-10 px-3.5 rounded-xl bg-background/70 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 appearance-none font-semibold cursor-pointer"
            >
              <option value="ALL">All Allocation Statuses</option>
              <option value="COMPLETE" className="bg-card text-white">✅ Fully Assigned Courses</option>
              <option value="NEEDS_INSTRUCTOR" className="bg-card text-white">⚠️ Needs Instructor Allocation</option>
            </select>
            <ChevronDown className="w-4 h-4 text-subtext absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterPermission}
              onChange={(e) => setFilterPermission(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-background/70 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 appearance-none font-semibold cursor-pointer"
            >
              <option value="ALL">All Permission Levels</option>
              <option value="EDIT" className="bg-card text-white">Can Edit Curriculum / Reschedule</option>
              <option value="VIEW" className="bg-card text-white">View Only Permissions</option>
            </select>
            <ChevronDown className="w-4 h-4 text-subtext absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODE 1: GROUP ACCORDING TO COURSE (USER REQUESTED DEFAULT)
          ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "BY_COURSE" && (
        <div className="space-y-5">
          {isLoading ? (
            <div className="p-16 rounded-3xl bg-card border border-white/10 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-400" />
              <p className="text-xs text-subtext font-semibold">Loading courses and instructor allocations...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-16 rounded-3xl bg-card border border-dashed border-white/15 text-center space-y-3">
              <UserCheck className="w-10 h-10 text-subtext mx-auto opacity-40" />
              <h3 className="text-sm font-bold text-white">No courses match your filter criteria</h3>
              <p className="text-xs text-subtext">Try clearing your search or selecting all courses.</p>
            </div>
          ) : (
            filteredCourses.map((course) => {
              const isExpanded = !!expandedCourseIds[course.id];
              const allocationPercent = course.totalSessionsCount > 0
                ? Math.round((course.assignedSessionsCount / course.totalSessionsCount) * 100)
                : 0;

              return (
                <div
                  key={course.id}
                  className="rounded-3xl bg-card/90 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-purple-500/30"
                >
                  {/* Course Summary Card Header */}
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-background/80 via-card to-background/40 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/5">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.thumbnailGradient || "from-purple-900 to-indigo-950"} border border-white/15 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg`}>
                        <Radio className="w-5 h-5 text-purple-300" />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {course.category || "Live Training"}
                          </span>
                          <span className="text-xs text-subtext">•</span>
                          <span className="text-xs text-subtext font-semibold">
                            {course.totalSessionsCount} {course.totalSessionsCount === 1 ? "Session" : "Sessions"}
                          </span>
                          {course.totalSessionsCount === 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-subtext border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                              Draft · No Sessions Yet
                            </span>
                          ) : course.isFullyAssigned ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              Fully Assigned
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              {course.totalSessionsCount - course.assignedSessionsCount} Sessions Need Instructor
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-black text-white tracking-tight">
                          {course.title}
                        </h3>

                        {/* Lead Mentor & Detailed Assigned Faculty Breakdown */}
                        <div className="flex items-center gap-3 text-xs text-subtext flex-wrap pt-1.5">
                          {/* Lead Mentor Pill */}
                          <div className="flex items-center gap-1.5 bg-background/60 px-2.5 py-1 rounded-xl border border-white/10 shadow-sm shrink-0">
                            <span className="text-[11px] text-subtext font-semibold">Lead Mentor:</span>
                            {course.leadInstructor ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCourseForBatch(course);
                                  setBatchInstructorId(course.leadInstructor.id);
                                  setBatchAssignAllSessions(true);
                                  setBatchOverwriteExisting(true);
                                  setBatchPermissions({
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
                                  });
                                  setBatchReassignReason("");
                                  setAssignBatchModalOpen(true);
                                }}
                                className="font-bold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer group/lead"
                                title="Click to Change Lead Mentor & Session Allocation"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                                <span>{course.leadInstructor.name}</span>
                                <Edit3 className="w-3 h-3 text-amber-400/60 group-hover/lead:text-amber-300 ml-0.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCourseForBatch(course);
                                  setBatchInstructorId(instructors[0]?.id || "");
                                  setBatchAssignAllSessions(true);
                                  setBatchOverwriteExisting(true);
                                  setBatchPermissions({
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
                                  });
                                  setBatchReassignReason("");
                                  setAssignBatchModalOpen(true);
                                }}
                                className="font-semibold text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                                title="Click to assign a Lead Mentor"
                              >
                                <span>Unassigned Lead</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                                  + Assign
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Explicit Assigned Faculty List ("Who I have assigned it to") */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-subtext font-semibold">Assigned To:</span>
                            {course.uniqueInstructors.length === 0 ? (
                              <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                                ⚠️ No Instructors Assigned
                              </span>
                            ) : (
                              course.uniqueInstructors.map((inst: any) => (
                                <div
                                  key={inst.id}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-200 text-[11px] shadow-sm"
                                  title={`${inst.name} (${inst.email}) - Assigned to ${inst.sessionsCount} session(s)`}
                                >
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[9px] font-black text-white shrink-0">
                                    {inst.name?.slice(0, 2).toUpperCase() || "IN"}
                                  </div>
                                  <span className="font-bold text-white whitespace-nowrap">{inst.name}</span>
                                  <span className="text-[10px] text-purple-300 font-bold bg-purple-500/20 px-1.5 py-0.5 rounded-md border border-purple-500/30 whitespace-nowrap">
                                    {course.totalSessionsCount === 0
                                      ? "Lead Mentor"
                                      : inst.sessionsCount === course.totalSessionsCount
                                      ? `All ${course.totalSessionsCount} Sessions`
                                      : `${inst.sessionsCount} / ${course.totalSessionsCount} Sessions`}
                                  </span>
                                </div>
                              ))
                            )}

                            {/* Show unassigned sessions badge if any */}
                            {course.uniqueInstructors.length > 0 &&
                              course.totalSessionsCount > course.assignedSessionsCount && (
                                <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold whitespace-nowrap">
                                  ⚠️ {course.totalSessionsCount - course.assignedSessionsCount} Sessions Unassigned
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Allocation Progress + Primary Action Buttons */}
                    <div className="flex flex-row items-center gap-4 shrink-0 self-start lg:self-center">
                      {/* Allocation Progress Meter */}
                      <div className="w-32 sm:w-36 space-y-1 text-right shrink-0">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-subtext font-semibold">Allocated:</span>
                          <span className="font-bold text-white">
                            {course.totalSessionsCount === 0
                              ? "0 Sessions"
                              : `${course.assignedSessionsCount} / ${course.totalSessionsCount}`}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-background border border-white/10 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              allocationPercent === 100
                                ? "bg-emerald-500"
                                : allocationPercent >= 50
                                ? "bg-purple-500"
                                : course.totalSessionsCount === 0
                                ? "bg-white/10"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${allocationPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Course Action Buttons */}
                      <div className="flex items-center gap-2 flex-nowrap shrink-0">
                        {/* 1. Bulk Edit Course Permissions for All Sessions */}
                        <button
                          onClick={() => {
                            setSelectedCourseForBulkPerms(course);
                            setBulkTargetInstructorId("ALL");
                            setBulkPermissions({
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
                            setCourseBulkPermissionsModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-300 hover:text-purple-200 transition-all flex items-center gap-1.5 shadow-sm shrink-0 whitespace-nowrap"
                          title="Set edit and management permissions for all sessions of this class"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>Edit Course Permissions</span>
                        </button>

                        {/* 2. View / Hide Sessions */}
                        <button
                          onClick={() => toggleCourseExpand(course.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 whitespace-nowrap ${
                            isExpanded
                              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                              : "bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30"
                          }`}
                        >
                          <span>{isExpanded ? "Hide Sessions" : "View Sessions"}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── EXPANDABLE SESSIONS LIST (UNDER COURSE) ── */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 space-y-4 animate-in fade-in duration-200 bg-background/40">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            Live Sessions Breakdown ({course.sessionsWithAssignments.length})
                          </h4>
                          <span className="text-[10px] text-subtext">· Individual instructor allocation & permission matrix</span>
                        </div>

                        <button
                          onClick={() => setCourseSessionsModal(course)}
                          className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Inspect Full Modal</span>
                        </button>
                      </div>

                      {course.sessionsWithAssignments.length === 0 ? (
                        <div className="p-8 text-center text-xs text-subtext">
                          No sessions have been configured for this course yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                            <thead>
                              <tr className="border-b border-white/10 text-subtext text-[10px] font-black uppercase tracking-wider">
                                <th className="py-3 px-3 w-[10%]">Session</th>
                                <th className="py-3 px-3 w-[26%]">Workshop Topic</th>
                                <th className="py-3 px-3 w-[22%]">Assigned Instructor</th>
                                <th className="py-3 px-3 w-[16%]">Date & Time</th>
                                <th className="py-3 px-3 w-[12%]">Permissions</th>
                                <th className="py-3 px-3 text-right w-[14%]">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {course.sessionsWithAssignments.map((sess: any) => {
                                const isAssigned = !!sess.assignedInstructor;
                                const assignObj = sess.assignment || {
                                  id: `temp-${sess.id}`,
                                  sessionId: sess.id,
                                  liveCourseId: course.id,
                                  instructorId: sess.assignedInstructor?.id,
                                  instructor: sess.assignedInstructor,
                                  liveCourse: course,
                                  session: sess,
                                  canEdit: sess.permissions?.canEdit ?? true,
                                  canReschedule: sess.permissions?.canReschedule ?? true,
                                  canView: true
                                };

                                return (
                                  <tr key={sess.id} className="hover:bg-white/[0.02] transition-colors group">
                                    {/* Session Number */}
                                    <td className="py-3.5 px-3">
                                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-black text-[10px] border border-purple-500/30">
                                        Session {sess.sessionNumber}
                                      </span>
                                    </td>

                                    {/* Title */}
                                    <td className="py-3.5 px-3">
                                      <p className="font-bold text-white truncate max-w-[220px]">
                                        {sess.title}
                                      </p>
                                      <p className="text-[10px] text-subtext truncate max-w-[200px]">
                                        {sess.description || "Live Interactive Coding Lab"}
                                      </p>
                                    </td>

                                    {/* Instructor */}
                                    <td className="py-3.5 px-3">
                                      {isAssigned ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-sm">
                                            {sess.assignedInstructor?.name?.slice(0, 2).toUpperCase() || "IN"}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="font-bold text-text truncate max-w-[140px]">
                                              {sess.assignedInstructor.name}
                                            </p>
                                            <p className="text-[9px] text-subtext truncate max-w-[140px]">
                                              {sess.assignedInstructor.email}
                                            </p>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                          ⚠️ Unassigned
                                        </span>
                                      )}
                                    </td>

                                    {/* Date & Time */}
                                    <td className="py-3.5 px-3 text-subtext whitespace-nowrap">
                                      {sess.date ? (
                                        <>
                                          <p className="font-bold text-white">
                                            {new Date(sess.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                                          </p>
                                          <p className="text-[10px] text-subtext">{sess.startTime} – {sess.endTime}</p>
                                        </>
                                      ) : (
                                        <span className="text-[10px] text-subtext/60">Schedule TBA</span>
                                      )}
                                    </td>

                                    {/* Permissions */}
                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                      {isAssigned ? (
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                            sess.permissions?.canEdit
                                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                              : "bg-white/5 text-subtext border-white/10"
                                          }`}
                                        >
                                          {sess.permissions?.canEdit ? "Can Edit" : "View Only"}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-subtext/40">—</span>
                                      )}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => {
                                            setSelectedAssignmentForChange({
                                              ...assignObj,
                                              sessionId: sess.id,
                                              session: sess,
                                              liveCourseId: course.id,
                                              liveCourse: course
                                            });
                                            setNewInstructorId(sess.assignedInstructor?.id || instructors[0]?.id || "");
                                            setReassignReason("");
                                            setChangeInstructorModalOpen(true);
                                          }}
                                          className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-colors"
                                        >
                                          {isAssigned ? "Change" : "Assign"}
                                        </button>

                                        {isAssigned && (
                                          <button
                                            onClick={() => {
                                              setSelectedAssignmentForPerms({
                                                ...assignObj,
                                                session: sess
                                              });
                                              setTempPermissions({
                                                canView: sess.permissions?.canView ?? true,
                                                canEdit: sess.permissions?.canEdit ?? true,
                                                canEditAgenda: sess.permissions?.canEditAgenda ?? true,
                                                canEditSchedule: sess.permissions?.canEditSchedule ?? false,
                                                canEditResources: sess.permissions?.canEditResources ?? true,
                                                canAddHomework: sess.permissions?.canAddHomework ?? true,
                                                canReschedule: sess.permissions?.canReschedule ?? false,
                                                canCancel: sess.permissions?.canCancel ?? false,
                                                canManageAttendance: sess.permissions?.canManageAttendance ?? true,
                                                canManageRecording: sess.permissions?.canManageRecording ?? true
                                              });
                                              setEditPermissionsModalOpen(true);
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-[11px] font-bold text-subtext hover:text-white transition-colors"
                                          >
                                            Permissions
                                          </button>
                                        )}

                                        {sess.assignment && (
                                          <button
                                            onClick={() => handleRemoveAssignment(sess.assignment.id)}
                                            className="p-1.5 rounded-lg text-subtext hover:text-rose-400 transition-colors"
                                            title="Unassign"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODE 2: FLAT ASSIGNMENT LIST
          ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "FLAT_LIST" && (
        <div className="p-6 rounded-3xl bg-card/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-subtext text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-3">Instructor</th>
                  <th className="py-3.5 px-3">Live Course</th>
                  <th className="py-3.5 px-3">Session Scope</th>
                  <th className="py-3.5 px-3">Date & Time</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Permissions</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFlatAssignments.map((assign) => (
                  <tr key={assign.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Instructor */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {assign.instructor?.name?.slice(0, 2).toUpperCase() || "IN"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{assign.instructor?.name}</p>
                          <p className="text-[10px] text-subtext truncate">{assign.instructor?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Live Course */}
                    <td className="py-4 px-3 max-w-xs">
                      <Link
                        href={`/admin/live-training/courses/${assign.liveCourse?.id}`}
                        className="font-bold text-white hover:text-purple-300 transition-colors line-clamp-1"
                      >
                        {assign.liveCourse?.title}
                      </Link>
                      <span className="text-[10px] text-subtext">{assign.liveCourse?.category}</span>
                    </td>

                    {/* Session Scope */}
                    <td className="py-4 px-3">
                      {assign.session ? (
                        <div>
                          <p className="font-bold text-purple-300">
                            Session {assign.session.sessionNumber}
                          </p>
                          <p className="text-[10px] text-subtext truncate max-w-[180px]">
                            {assign.session.title}
                          </p>
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                          Entire Course Lead
                        </span>
                      )}
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-3 text-subtext whitespace-nowrap">
                      {assign.session?.date ? (
                        <>
                          <p className="font-semibold text-white">
                            {new Date(assign.session.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </p>
                          <p className="text-[10px]">{assign.session.startTime} – {assign.session.endTime}</p>
                        </>
                      ) : (
                        <span className="text-[10px]">Lead Schedule</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold">
                        Assigned
                      </span>
                    </td>

                    {/* Permission Badge */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      {assign.canEdit ? (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                          Can Edit
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-white/5 text-subtext border border-white/10 text-[10px] font-bold">
                          View Only
                        </span>
                      )}
                      {assign.canReschedule && (
                        <span className="ml-1 text-[9px] text-amber-300 font-bold">
                          +Reschedule
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAssignmentForChange(assign);
                            setNewInstructorId(assign.instructorId);
                            setReassignReason("");
                            setChangeInstructorModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
                        >
                          Change Instructor
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAssignmentForPerms(assign);
                            setTempPermissions({
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
                            setEditPermissionsModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-xs font-bold text-subtext hover:text-white transition-colors"
                        >
                          Edit Permissions
                        </button>

                        <button
                          onClick={() => handleRemoveAssignment(assign.id)}
                          className="p-1.5 rounded-lg text-subtext hover:text-rose-400 transition-colors"
                          title="Remove Assignment"
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
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: VIEW ALL SESSIONS INSPECTOR (PER COURSE)
          ═══════════════════════════════════════════════════════════════ */}
      {courseSessionsModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl bg-card border border-white/15 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {courseSessionsModal.category}
                  </span>
                  <span className="text-xs text-subtext">· Complete Sessions Directory</span>
                </div>
                <h3 className="text-lg font-black text-white">{courseSessionsModal.title}</h3>
              </div>

              <button onClick={() => setCourseSessionsModal(null)} className="text-subtext hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sessions Table in Modal */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {courseSessionsModal.sessionsWithAssignments.map((sess: any) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-2xl bg-background/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-xs shrink-0">
                      S{sess.sessionNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{sess.title}</h4>
                      <p className="text-[11px] text-subtext">
                        {sess.date ? `${new Date(sess.date).toLocaleDateString([], { month: "short", day: "numeric" })} · ${sess.startTime} - ${sess.endTime}` : "Schedule TBA"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      {sess.assignedInstructor ? (
                        <div className="text-right">
                          <p className="font-bold text-amber-300">{sess.assignedInstructor.name}</p>
                          <p className="text-[10px] text-subtext">{sess.assignedInstructor.email}</p>
                        </div>
                      ) : (
                        <span className="text-rose-400 font-bold">Unassigned</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAssignmentForChange({
                          id: sess.assignment?.id || `temp-${sess.id}`,
                          sessionId: sess.id,
                          session: sess,
                          liveCourseId: courseSessionsModal.id,
                          liveCourse: courseSessionsModal,
                          instructorId: sess.assignedInstructor?.id
                        });
                        setNewInstructorId(sess.assignedInstructor?.id || instructors[0]?.id || "");
                        setReassignReason("");
                        setChangeInstructorModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-xs font-bold text-amber-300"
                    >
                      {sess.assignedInstructor ? "Change" : "Assign"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                onClick={() => setCourseSessionsModal(null)}
                className="px-5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: BATCH ASSIGN / CHANGE LEAD INSTRUCTOR FOR COURSE & SESSIONS
          ═══════════════════════════════════════════════════════════════ */}
      {assignBatchModalOpen && selectedCourseForBatch && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleBatchAssignSubmit}
            className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-card border border-white/15 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Assign Lead Mentor & Allocate All Sessions
              </h3>
              <button
                type="button"
                onClick={() => setAssignBatchModalOpen(false)}
                className="text-subtext hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
              {/* Course Info Banner */}
              <div className="p-4 rounded-2xl bg-background/60 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {selectedCourseForBatch.category || "Live Cohort"}
                  </span>
                  <span className="text-amber-300 font-bold">
                    {selectedCourseForBatch.totalSessionsCount} Total Workshop Sessions
                  </span>
                </div>
                <p className="text-sm font-black text-white">{selectedCourseForBatch.title}</p>
                <p className="text-[11px] text-subtext">
                  Current Lead: <span className="text-white font-bold">{selectedCourseForBatch.leadInstructor?.name || "Unassigned"}</span>
                </p>
              </div>

              {/* Select Lead Mentor */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-white flex items-center justify-between">
                  <span>Select Lead Instructor *</span>
                  <span className="text-[10px] text-subtext">Will be set as Primary Lead Mentor</span>
                </label>
                <select
                  required
                  value={batchInstructorId}
                  onChange={(e) => setBatchInstructorId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50"
                >
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-card text-white">
                      {inst.name} ({inst.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Scope Options */}
              <div className="p-3.5 rounded-2xl bg-background/40 border border-white/5 space-y-2.5 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={batchAssignAllSessions}
                    onChange={(e) => setBatchAssignAllSessions(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Assign this Lead Mentor to all {selectedCourseForBatch.totalSessionsCount} sessions in this class</span>
                </label>

                {batchAssignAllSessions && (
                  <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-subtext ml-6">
                    <input
                      type="checkbox"
                      checked={batchOverwriteExisting}
                      onChange={(e) => setBatchOverwriteExisting(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span>Overwrite any existing individual session instructor assignments</span>
                  </label>
                )}
              </div>

              {/* Permissions Configuration for this Lead across all sessions */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Permissions Granted across All Sessions:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => applyPresetPermissions("FULL", "BATCH")}
                      className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold hover:bg-purple-500/30"
                    >
                      Full Control
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetPermissions("TEACHING", "BATCH")}
                      className="px-2 py-0.5 rounded bg-white/5 text-subtext text-[10px] font-bold hover:bg-white/10 hover:text-white"
                    >
                      Teaching Only
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: "canView", label: "View Sessions" },
                    { key: "canEdit", label: "Can Edit Sessions" },
                    { key: "canEditAgenda", label: "Edit Agenda Timeline" },
                    { key: "canEditSchedule", label: "Edit Schedule Directly" },
                    { key: "canEditResources", label: "Edit Resources & Slides" },
                    { key: "canAddHomework", label: "Add & Edit Homework" },
                    { key: "canReschedule", label: "Reschedule Rights" },
                    { key: "canCancel", label: "Cancel Rights" },
                    { key: "canManageAttendance", label: "Manage Attendance" },
                    { key: "canManageRecording", label: "Manage Recordings" }
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-2 rounded-xl bg-background/50 border border-white/5 cursor-pointer hover:border-amber-500/30 transition-all text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={batchPermissions[perm.key]}
                        onChange={(e) =>
                          setBatchPermissions({ ...batchPermissions, [perm.key]: e.target.checked })
                        }
                        className="w-3.5 h-3.5 accent-amber-500 rounded"
                      />
                      <span className="font-semibold text-white truncate">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional Reason / Notes */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-subtext">Reason for Assignment (Optional audit note)</label>
                <input
                  type="text"
                  value={batchReassignReason}
                  onChange={(e) => setBatchReassignReason(e.target.value)}
                  placeholder="e.g. Assigned as primary cohort director & lead lecturer..."
                  className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setAssignBatchModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black shadow-lg shadow-amber-500/30"
              >
                {isProcessing ? "Assigning..." : "Confirm & Apply to Course"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: BULK EDIT PERMISSIONS FOR ALL SESSIONS OF THIS CLASS
          ═══════════════════════════════════════════════════════════════ */}
      {courseBulkPermissionsModalOpen && selectedCourseForBulkPerms && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleBulkCoursePermissionsSubmit}
            className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-card border border-white/15 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Set Course Permissions for All Sessions</h3>
                  <p className="text-[10px] text-subtext">Apply uniform edit & management permissions across this entire class</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCourseBulkPermissionsModalOpen(false)}
                className="text-subtext hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
              {/* Course Info Banner */}
              <div className="p-4 rounded-2xl bg-background/60 border border-white/5 space-y-1.5 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                  {selectedCourseForBulkPerms.category || "Live Cohort"} · {selectedCourseForBulkPerms.totalSessionsCount} Scheduled Sessions
                </span>
                <p className="text-sm font-black text-white">{selectedCourseForBulkPerms.title}</p>
              </div>

              {/* Target Instructor Filter */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-white">Apply Permissions To:</label>
                <select
                  value={bulkTargetInstructorId}
                  onChange={(e) => setBulkTargetInstructorId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50"
                >
                  <option value="ALL" className="bg-card text-white">
                    🌐 All Instructors assigned to any session of this class
                  </option>
                  {selectedCourseForBulkPerms.uniqueInstructors?.map((inst: any) => (
                    <option key={inst.id} value={inst.id} className="bg-card text-white">
                      👤 {inst.name} ({inst.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Quick Permission Presets:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPresetPermissions("FULL", "BULK")}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/30 text-purple-300 hover:bg-purple-600/40 text-[10px] font-bold border border-purple-500/30 transition-colors"
                    >
                      Full Control
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetPermissions("TEACHING", "BULK")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 text-subtext hover:bg-white/10 hover:text-white text-[10px] font-bold border border-white/10 transition-colors"
                    >
                      Standard Teaching
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetPermissions("READONLY", "BULK")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 text-subtext hover:bg-white/10 hover:text-white text-[10px] font-bold border border-white/10 transition-colors"
                    >
                      Read Only
                    </button>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: "canView", label: "View Sessions" },
                    { key: "canEdit", label: "Can Edit Session Metadata" },
                    { key: "canEditAgenda", label: "Edit Agenda & Timelines" },
                    { key: "canEditSchedule", label: "Edit Schedule Directly" },
                    { key: "canEditResources", label: "Edit Resources & Slides" },
                    { key: "canAddHomework", label: "Add & Edit Homework" },
                    { key: "canReschedule", label: "Reschedule Workshop" },
                    { key: "canCancel", label: "Cancel Session Rights" },
                    { key: "canManageAttendance", label: "Manage Attendance" },
                    { key: "canManageRecording", label: "Manage Recordings" }
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/50 border border-white/5 cursor-pointer hover:border-purple-500/30 transition-all text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={bulkPermissions[perm.key]}
                        onChange={(e) =>
                          setBulkPermissions({ ...bulkPermissions, [perm.key]: e.target.checked })
                        }
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                      <span className="font-semibold text-white">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setCourseBulkPermissionsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/30"
              >
                {isProcessing ? "Applying..." : "Apply Permissions to All Sessions"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: CHANGE INSTRUCTOR (SINGLE ASSIGNMENT)
          ═══════════════════════════════════════════════════════════════ */}
      {changeInstructorModalOpen && selectedAssignmentForChange && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleChangeInstructorSubmit}
            className="w-full max-w-lg rounded-3xl bg-card border border-white/15 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                Reassign Session Instructor
              </h3>
              <button
                type="button"
                onClick={() => setChangeInstructorModalOpen(false)}
                className="text-subtext hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-background/60 border border-white/5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-subtext">Target Scope:</span>
                <span className="font-bold text-purple-300">
                  {selectedAssignmentForChange.session
                    ? `Session ${selectedAssignmentForChange.session.sessionNumber}: ${selectedAssignmentForChange.session.title}`
                    : "Course Lead Allocation"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-subtext">Current Assigned:</span>
                <span className="font-bold text-white">
                  {selectedAssignmentForChange.instructor?.name || "Unassigned"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-white">Select New Instructor *</label>
              <select
                required
                value={newInstructorId}
                onChange={(e) => setNewInstructorId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-background border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50"
              >
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id} className="bg-card text-white">
                    {inst.name} ({inst.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-white">Reason for Reassignment * (Logged to Audit Trail)</label>
              <textarea
                rows={2}
                required
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="e.g. Topic specialization, instructor schedule adjustment..."
                className="w-full p-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setChangeInstructorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/30"
              >
                {isProcessing ? "Reassigning..." : "Confirm Reassignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: EDIT PERMISSIONS
          ═══════════════════════════════════════════════════════════════ */}
      {editPermissionsModalOpen && selectedAssignmentForPerms && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleEditPermissionsSubmit}
            className="w-full max-w-lg rounded-3xl bg-card border border-white/15 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Configure Instructor Permissions
              </h3>
              <button
                type="button"
                onClick={() => setEditPermissionsModalOpen(false)}
                className="text-subtext hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-background/60 border border-white/5 text-xs">
              <p className="font-bold text-white">{selectedAssignmentForPerms.instructor?.name}</p>
              <p className="text-subtext">
                Target: {selectedAssignmentForPerms.session ? `Session ${selectedAssignmentForPerms.session.sessionNumber}` : "Entire Live Course"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { key: "canView", label: "View Session" },
                { key: "canEdit", label: "Can Edit Session" },
                { key: "canEditAgenda", label: "Edit Agenda Timeline" },
                { key: "canEditSchedule", label: "Edit Schedule Directly" },
                { key: "canEditResources", label: "Edit Resources & Slides" },
                { key: "canAddHomework", label: "Add & Edit Homework" },
                { key: "canReschedule", label: "Reschedule Rights" },
                { key: "canCancel", label: "Cancel Rights" },
                { key: "canManageAttendance", label: "Manage Attendance" },
                { key: "canManageRecording", label: "Manage Recordings" }
              ].map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/50 border border-white/5 cursor-pointer hover:border-purple-500/30 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={tempPermissions[perm.key]}
                    onChange={(e) =>
                      setTempPermissions({ ...tempPermissions, [perm.key]: e.target.checked })
                    }
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  <span className="font-semibold text-white">{perm.label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditPermissionsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-600/30"
              >
                {isProcessing ? "Saving..." : "Save Permissions"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
