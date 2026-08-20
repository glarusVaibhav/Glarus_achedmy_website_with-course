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
  Trash2
} from "lucide-react";

export default function AdminInstructorAssignmentsView() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("ALL");
  const [filterPermission, setFilterPermission] = useState("ALL");

  // Modals
  const [changeInstructorModalOpen, setChangeInstructorModalOpen] = useState(false);
  const [selectedAssignmentForChange, setSelectedAssignmentForChange] = useState<any>(null);
  const [newInstructorId, setNewInstructorId] = useState("");
  const [reassignReason, setReassignReason] = useState("");

  const [editPermissionsModalOpen, setEditPermissionsModalOpen] = useState(false);
  const [selectedAssignmentForPerms, setSelectedAssignmentForPerms] = useState<any>(null);
  const [tempPermissions, setTempPermissions] = useState<any>({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/live-training/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
        setInstructors(data.instructors || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
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

      const matchesCourse =
        filterCourse === "ALL" || item.liveCourseId === filterCourse;

      const matchesPerm =
        filterPermission === "ALL" ||
        (filterPermission === "EDIT" && item.canEdit) ||
        (filterPermission === "VIEW" && !item.canEdit);

      return matchesSearch && matchesCourse && matchesPerm;
    });
  }, [assignments, searchTerm, filterCourse, filterPermission]);

  // Unique courses for filter
  const uniqueCourses = useMemo(() => {
    const map = new Map();
    assignments.forEach((a) => {
      if (a.liveCourse && !map.has(a.liveCourse.id)) {
        map.set(a.liveCourse.id, a.liveCourse.title);
      }
    });
    return Array.from(map.entries());
  }, [assignments]);

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
        setSuccessMessage("Instructor reassigned successfully! Audit log and notifications dispatched.");
        fetchAssignments();
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
        fetchAssignments();
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
        setSuccessMessage("Assignment removed!");
        fetchAssignments();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Instructor Allocations
            </span>
            <span className="text-xs text-subtext">•</span>
            <span className="text-xs text-subtext">{assignments.length} Active Assignments</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight mt-1">
            Instructor Assignments & Permissions
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/live-training"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all"
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>Live Courses</span>
          </Link>
          <Link
            href="/admin/live-training/calendar"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>Live Calendar</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-subtext" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by instructor name, course, or session..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="h-9 px-3 rounded-xl bg-background border border-white/10 text-subtext hover:text-text text-xs focus:outline-none"
            >
              <option value="ALL">All Live Courses</option>
              {uniqueCourses.map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>

            <select
              value={filterPermission}
              onChange={(e) => setFilterPermission(e.target.value)}
              className="h-9 px-3 rounded-xl bg-background border border-white/10 text-subtext hover:text-text text-xs focus:outline-none"
            >
              <option value="ALL">All Permissions</option>
              <option value="EDIT">Can Edit Session</option>
              <option value="VIEW">View Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-card border border-white/10 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
          <p className="text-xs text-subtext font-semibold">Loading assignments...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-16 rounded-2xl bg-card border border-dashed border-white/15 text-center space-y-3">
          <UserCheck className="w-8 h-8 text-subtext mx-auto" />
          <h3 className="text-sm font-bold text-text">No instructor assignments match your criteria</h3>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
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
                {filteredAssignments.map((assign) => (
                  <tr key={assign.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Instructor */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {assign.instructor?.name?.slice(0, 2).toUpperCase() || "IN"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-text truncate">{assign.instructor?.name}</p>
                          <p className="text-[10px] text-subtext truncate">{assign.instructor?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Live Course */}
                    <td className="py-4 px-3 max-w-xs">
                      <Link
                        href={`/admin/live-training/courses/${assign.liveCourse?.id}`}
                        className="font-bold text-text hover:text-purple-300 transition-colors line-clamp-1"
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
                          <p className="font-semibold text-text">
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
                          className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-xs font-bold text-subtext hover:text-text transition-colors"
                        >
                          Edit Permissions
                        </button>

                        <button
                          onClick={() => handleRemoveAssignment(assign.id)}
                          className="p-1.5 rounded-lg text-subtext hover:text-red-400 transition-colors"
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
          CHANGE INSTRUCTOR MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {changeInstructorModalOpen && selectedAssignmentForChange && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleChangeInstructorSubmit}
            className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                Change Assigned Instructor
              </h3>
              <button
                type="button"
                onClick={() => setChangeInstructorModalOpen(false)}
                className="text-subtext hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current vs New Instructor Visual */}
            <div className="p-4 rounded-xl bg-background/60 border border-white/5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-subtext">Current Instructor:</span>
                <span className="font-bold text-text">
                  {selectedAssignmentForChange.instructor?.name}
                </span>
              </div>
              <div className="flex justify-center text-purple-400">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-text">Select New Instructor *</label>
                <select
                  value={newInstructorId}
                  onChange={(e) => setNewInstructorId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-card border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
                >
                  {instructors
                    .filter((inst) => inst.id !== selectedAssignmentForChange.instructorId)
                    .map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.email})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-text">Reason for Reassignment * (Audit Trail)</label>
              <textarea
                rows={2}
                required
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="e.g. Domain specialization, instructor scheduling request..."
                className="w-full p-2.5 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChangeInstructorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shadow-md shadow-amber-500/30"
              >
                {isProcessing ? "Reassigning..." : "Confirm Reassignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          EDIT PERMISSIONS MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {editPermissionsModalOpen && selectedAssignmentForPerms && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleEditPermissionsSubmit}
            className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Configure Instructor Permissions
              </h3>
              <button
                type="button"
                onClick={() => setEditPermissionsModalOpen(false)}
                className="text-subtext hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-background/60 border border-white/5 text-xs">
              <p className="font-bold text-text">{selectedAssignmentForPerms.instructor?.name}</p>
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
                { key: "canEditResources", label: "Edit Resources" },
                { key: "canAddHomework", label: "Add & Edit Homework" },
                { key: "canReschedule", label: "Reschedule Rights" },
                { key: "canCancel", label: "Cancel Rights" },
                { key: "canManageAttendance", label: "Manage Attendance" },
                { key: "canManageRecording", label: "Manage Recordings" }
              ].map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tempPermissions[perm.key]}
                    onChange={(e) =>
                      setTempPermissions({ ...tempPermissions, [perm.key]: e.target.checked })
                    }
                    className="accent-purple-500"
                  />
                  <span className="font-semibold text-text">{perm.label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditPermissionsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
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
