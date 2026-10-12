"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  Check,
  X,
  Sparkles,
  Loader2,
  Send,
  UserCheck,
  RotateCcw,
  SlidersHorizontal,
  Info,
  BookOpen,
  Lock,
  Unlock,
  KeyRound,
  Edit3,
  Video,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/dateTime";
import { CourseCreationPermissionStatus } from "@/lib/permissions/courseCreationPermission";

export interface InstructorPermissionItem {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  status: string;
  createdAt: string;
  instructorApproval?: {
    id: string;
    status: string;
    firstName?: string | null;
    lastName?: string | null;
    skills?: string | null;
    areasOfExpertise?: string | null;
  } | null;
  courseCreationPermission?: {
    id: string;
    status: CourseCreationPermissionStatus;
    canCreateCourse: boolean;
    canEditCourse?: boolean;
    canCreateLiveClass?: boolean;
    canEditLiveClass?: boolean;
    canRescheduleLiveClass?: boolean;
    requestedAt?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
    notes?: string | null;
    reviewedBy?: { id: string; name: string; email: string } | null;
  } | null;
  courses?: { id: string; title: string; status: string; isPublished: boolean }[];
}

export function AdminInstructorPermissionsTab() {
  const [instructors, setInstructors] = useState<InstructorPermissionItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    revoked: 0,
    notRequested: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Action Modals State
  const [activeModal, setActiveModal] = useState<{
    type: "APPROVE" | "REJECT" | "GRANT" | "REVOKE";
    instructor: InstructorPermissionItem;
  } | null>(null);
  const [actionFeedback, setActionFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/instructors/permissions");
      if (res.ok) {
        const data = await res.json();
        setInstructors(data.instructors || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePermission = async (
    instructorId: string,
    permissionKey: "COURSE_CREATE" | "COURSE_EDIT" | "LIVE_CLASS_CREATE" | "LIVE_CLASS_EDIT" | "LIVE_CLASS_RESCHEDULE",
    currentValue: boolean
  ) => {
    const targetValue = !currentValue;
    try {
      const res = await fetch("/api/admin/instructors/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId,
          action: "TOGGLE_PERMISSION",
          permissionKey,
          enabled: targetValue
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to update permission");
        return;
      }

      showToast(data.message || `Permission updated successfully.`);
      await loadData();
    } catch (err: any) {
      showToast("Network error updating permission");
    }
  };

  const handleExecuteAction = async () => {
    if (!activeModal) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/admin/instructors/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: activeModal.instructor.id,
          action: activeModal.type,
          feedback: actionFeedback.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Action failed.");
      }

      showToast(data.message || `Successfully executed ${activeModal.type}.`);
      setActiveModal(null);
      setActionFeedback("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to process permission update.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredInstructors = useMemo(() => {
    return instructors.filter((inst) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inst.name.toLowerCase().includes(q) ||
        inst.email.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const currentStatus = inst.courseCreationPermission?.status || "NOT_REQUESTED";
      if (statusFilter === "ALL") return true;
      if (statusFilter === "PENDING") return currentStatus === "PENDING";
      if (statusFilter === "APPROVED") return currentStatus === "APPROVED";
      if (statusFilter === "REJECTED") return currentStatus === "REJECTED";
      if (statusFilter === "REVOKED") return currentStatus === "REVOKED";
      if (statusFilter === "NOT_REQUESTED") return currentStatus === "NOT_REQUESTED";

      return true;
    });
  }, [instructors, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#111722] border border-purple-500/30 text-white rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. Top Stat Badges ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#0C1118] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Instructors</span>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl font-black text-white">{stats.total}</span>
        </div>

        <div className="bg-[#0C1118] border border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-medium">Approved Creators</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400">{stats.approved}</span>
        </div>

        <div className="bg-[#0C1118] border border-amber-500/20 bg-amber-500/[0.02] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-medium">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <span className="text-2xl font-black text-amber-400">{stats.pending}</span>
        </div>

        <div className="bg-[#0C1118] border border-rose-500/20 bg-rose-500/[0.02] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-medium">Rejected / Re-apply</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-rose-400">{stats.rejected}</span>
        </div>

        <div className="bg-[#0C1118] border border-purple-500/20 bg-purple-500/[0.02] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-medium">Revoked Access</span>
            <Ban className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-black text-purple-400">{stats.revoked}</span>
        </div>
      </div>

      {/* ── 2. Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0C1118] p-3 rounded-2xl border border-white/[0.06]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search instructor by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#06080D] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {[
            { id: "ALL", label: "All", count: stats.total },
            { id: "PENDING", label: "Pending", count: stats.pending },
            { id: "APPROVED", label: "Approved", count: stats.approved },
            { id: "NOT_REQUESTED", label: "Not Requested", count: stats.notRequested },
            { id: "REJECTED", label: "Rejected", count: stats.rejected },
            { id: "REVOKED", label: "Revoked", count: stats.revoked },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isActive
                    ? "bg-purple-600/20 border-purple-500/40 text-purple-300 font-bold"
                    : "text-slate-400 hover:text-white border-transparent hover:bg-white/[0.04]"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-purple-500/30 text-white" : "bg-white/[0.06] text-slate-500"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Instructor Permissions Table ── */}
      <div className="bg-[#0C1118] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-xs font-semibold">Loading Instructor Permissions...</p>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Shield className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Instructors Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No instructors match your current search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-slate-400 font-bold">
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Request Details</th>
                  <th className="py-3.5 px-4">Review Info</th>
                  <th className="py-3.5 px-4">Courses</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredInstructors.map((inst) => {
                  const perm = inst.courseCreationPermission;
                  const isPermApproved = perm?.status === "APPROVED" && Boolean(perm?.canCreateCourse);
                  const permStatus: CourseCreationPermissionStatus = isPermApproved
                    ? "APPROVED"
                    : perm?.status === "APPROVED" && !perm?.canCreateCourse
                    ? "REVOKED"
                    : (perm?.status || "NOT_REQUESTED");
                  const isSessionEditReq = perm?.notes?.toLowerCase().includes("session") || perm?.notes?.toLowerCase().includes("edit request");

                  return (
                    <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Instructor Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-xs shrink-0">
                            {inst.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">
                              {inst.name}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {inst.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Permission Status & Capabilities */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {permStatus === "APPROVED" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approved
                            </span>
                          )}
                          {permStatus === "PENDING" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              Pending Review
                            </span>
                          )}
                          {permStatus === "NOT_REQUESTED" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                              <Lock className="w-3.5 h-3.5" />
                              Not Requested
                            </span>
                          )}
                          {permStatus === "REJECTED" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                          )}
                          {permStatus === "REVOKED" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                              <Ban className="w-3.5 h-3.5" />
                              Revoked
                            </span>
                          )}

                          {/* Active Permission Badges */}
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {perm?.canEditLiveClass && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                <Edit3 className="w-2.5 h-2.5" />
                                Session Edit
                              </span>
                            )}
                            {perm?.canCreateCourse && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <BookOpen className="w-2.5 h-2.5" />
                                Create Course
                              </span>
                            )}
                            {perm?.canRescheduleLiveClass && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                Reschedule
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Request Details */}
                      <td className="py-4 px-4 max-w-xs">
                        {perm?.requestedAt ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-300 font-mono text-[11px]">
                                {formatDate(perm.requestedAt)}
                              </span>
                              {isSessionEditReq && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Session Edit
                                </span>
                              )}
                            </div>
                            {perm.notes && (
                              <p className="text-slate-300 text-[11px] leading-relaxed break-words bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]" title={perm.notes}>
                                {perm.notes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Review Info */}
                      <td className="py-4 px-4">
                        {perm?.reviewedAt ? (
                          <div className="space-y-0.5">
                            <span className="text-slate-300 font-mono text-[11px] block">
                              {formatDate(perm.reviewedAt)}
                            </span>
                            <span className="text-slate-500 text-[10px] block">
                              by {perm.reviewedBy?.name || "Admin"}
                            </span>
                            {perm.rejectionReason && (
                              <p className="text-rose-400 text-[10px] truncate" title={perm.rejectionReason}>
                                Feedback: {perm.rejectionReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Unreviewed</span>
                        )}
                      </td>

                      {/* Courses Count */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-slate-300">
                          {inst.courses?.length || 0} Courses
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* Quick Session Edit Toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(inst.id, "LIVE_CLASS_EDIT", Boolean(perm?.canEditLiveClass))}
                            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all border cursor-pointer ${
                              perm?.canEditLiveClass
                                ? "bg-purple-600/20 text-purple-300 border-purple-500/40 hover:bg-purple-600/30"
                                : "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white hover:bg-white/[0.08]"
                            }`}
                            title={perm?.canEditLiveClass ? "Revoke Session Edit Authority" : "Grant Session Edit Authority"}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{perm?.canEditLiveClass ? "Edit: Granted" : "Grant Edit"}</span>
                          </button>

                          {permStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() => setActiveModal({ type: "APPROVE", instructor: inst })}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => setActiveModal({ type: "REJECT", instructor: inst })}
                                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {permStatus === "APPROVED" && (
                            <button
                              onClick={() => setActiveModal({ type: "REVOKE", instructor: inst })}
                              className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Revoke</span>
                            </button>
                          )}

                          {(permStatus === "NOT_REQUESTED" || permStatus === "REJECTED" || permStatus === "REVOKED") && !perm?.canEditLiveClass && (
                            <button
                              onClick={() => setActiveModal({ type: "GRANT", instructor: inst })}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Grant Full Access</span>
                            </button>
                          )}

                          {/* Detail / Full Role Config Link */}
                          <Link
                            href={`/admin/instructors/${inst.id}?tab=role_permissions`}
                            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] transition-colors"
                            title="Manage granular role permissions"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </Link>
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

      {/* ── 4. Action Confirmation Modals ── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#0E131F] border border-purple-500/30 rounded-3xl p-6 sm:p-7 text-white shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    activeModal.type === "APPROVE" || activeModal.type === "GRANT"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : activeModal.type === "REJECT"
                      ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                      : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                  }`}>
                    {activeModal.type === "APPROVE" && <Check className="w-5 h-5" />}
                    {activeModal.type === "GRANT" && <Sparkles className="w-5 h-5" />}
                    {activeModal.type === "REJECT" && <X className="w-5 h-5" />}
                    {activeModal.type === "REVOKE" && <Ban className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {activeModal.type === "APPROVE" && "Approve Course Creation"}
                      {activeModal.type === "GRANT" && "Grant Course Creation Directly"}
                      {activeModal.type === "REJECT" && "Reject Permission Request"}
                      {activeModal.type === "REVOKE" && "Revoke Course Creation"}
                    </h3>
                    <p className="text-xs text-slate-400">{activeModal.instructor.name} ({activeModal.instructor.email})</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setActionFeedback("");
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Description */}
              <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                {activeModal.type === "APPROVE" && (
                  <p>
                    Approving will immediately unlock the course creation studio for <strong>{activeModal.instructor.name}</strong> and send an approval notification.
                  </p>
                )}
                {activeModal.type === "GRANT" && (
                  <p>
                    Directly granting access enables <strong>{activeModal.instructor.name}</strong> to create courses without requiring a formal request.
                  </p>
                )}
                {activeModal.type === "REJECT" && (
                  <p>
                    Please provide constructive feedback explaining why the permission request was rejected so the instructor can improve their proposal.
                  </p>
                )}
                {activeModal.type === "REVOKE" && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-amber-200">
                    <p className="font-bold">Revocation Notice:</p>
                    <p className="text-[11px] text-amber-300/80">
                      The instructor will no longer be able to create new courses. All their existing courses, modules, and learner enrollments will remain untouched.
                    </p>
                  </div>
                )}
              </div>

              {/* Feedback Input for REJECT / REVOKE / OPTIONAL NOTES */}
              {(activeModal.type === "REJECT" || activeModal.type === "REVOKE" || activeModal.type === "APPROVE") && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    {activeModal.type === "REJECT" ? "Rejection Reason & Feedback *" : "Optional Note / Feedback"}
                  </label>
                  <textarea
                    rows={3}
                    required={activeModal.type === "REJECT"}
                    value={actionFeedback}
                    onChange={(e) => setActionFeedback(e.target.value)}
                    placeholder={
                      activeModal.type === "REJECT"
                        ? "e.g. Please update your instructor verification profile and provide sample course curriculum..."
                        : "Optional feedback sent to instructor..."
                    }
                    className="w-full bg-[#080B11] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
                  />
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setActionFeedback("");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing || (activeModal.type === "REJECT" && !actionFeedback.trim())}
                  onClick={handleExecuteAction}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
                    activeModal.type === "APPROVE" || activeModal.type === "GRANT"
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
                      : activeModal.type === "REJECT"
                      ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25"
                      : "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25"
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Confirm {activeModal.type}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
