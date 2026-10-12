"use client";

import React, { useState } from "react";
import {
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  X,
  Shield,
  Loader2,
  FileText,
  RotateCcw,
  ArrowRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/dateTime";
import { CourseCreationPermissionStatus } from "@/lib/permissions/courseCreationPermission";

interface InstructorPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: CourseCreationPermissionStatus;
  canCreateCourse?: boolean;
  requestedAt?: string | Date | null;
  reviewedAt?: string | Date | null;
  rejectionReason?: string | null;
  notes?: string | null;
  onPermissionRequested: () => void;
  onStartCreating: () => void;
}

export function InstructorPermissionModal({
  isOpen,
  onClose,
  status,
  canCreateCourse,
  requestedAt,
  reviewedAt,
  rejectionReason,
  notes,
  onPermissionRequested,
  onStartCreating,
}: InstructorPermissionModalProps) {
  const [requestNotes, setRequestNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showReapplyForm, setShowReapplyForm] = useState(false);

  // If canCreateCourse is false, never show APPROVED state (map to REVOKED or current status)
  const effectiveStatus: CourseCreationPermissionStatus =
    canCreateCourse === false
      ? (status === "APPROVED" ? "REVOKED" : status)
      : canCreateCourse === true
      ? "APPROVED"
      : status;

  if (!isOpen) return null;

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/instructor/course-creation-permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: requestNotes.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to submit request.");
      }

      setShowReapplyForm(false);
      setRequestNotes("");
      onPermissionRequested();
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#0E131F] border border-purple-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-purple-950/40 my-8 overflow-hidden"
        >
          {/* Ambient Purple Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/[0.06] z-10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ═══════════════════════════════════════════════════════
              STATE 1: NOT_REQUESTED
              ═══════════════════════════════════════════════════════ */}
          {effectiveStatus === "NOT_REQUESTED" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/10">
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                    Access Restricted
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Course Creation Permission
                  </h2>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  To maintain curriculum quality standards, course creation is governed by Platform Administration.
                </p>
                <p className="text-slate-400">
                  Submit a quick permission request below. Once approved by an Admin, the AI Course Architect and Curriculum Studio will unlock automatically.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Proposal or Topic Notes <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="Briefly describe the course subject or domain you plan to teach (e.g. Agentic AI with LangGraph)..."
                    className="w-full bg-[#080B11] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/[0.06]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Permission</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              STATE 2: PENDING
              ═══════════════════════════════════════════════════════ */}
          {effectiveStatus === "PENDING" && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
                <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  Under Admin Review
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Permission Request Pending
                </h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your course creation permission request is currently awaiting review by Platform Administration.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-left space-y-2 text-xs">
                {requestedAt && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Submitted On:</span>
                    <span className="font-mono font-bold text-white">
                      {formatDate(requestedAt)}
                    </span>
                  </div>
                )}
                {notes && (
                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="text-slate-500 block mb-1">Your Submission Note:</span>
                    <p className="italic text-slate-300 bg-black/20 p-2.5 rounded-lg border border-white/[0.04]">
                      "{notes}"
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-white/[0.08]"
                >
                  Close & Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              STATE 3: APPROVED
              ═══════════════════════════════════════════════════════ */}
          {effectiveStatus === "APPROVED" && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Permission Active
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Course Creation Unlocked
                </h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You have full administrator approval to build, architect with AI, and publish new courses.
                </p>
              </div>

              {reviewedAt && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
                  Approved on {formatDate(reviewedAt)}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/[0.06]"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartCreating();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Creator</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              STATE 4: REJECTED
              ═══════════════════════════════════════════════════════ */}
          {effectiveStatus === "REJECTED" && !showReapplyForm && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/10">
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                    Application Update
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Request Not Approved
                  </h2>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2 text-xs">
                <p className="text-slate-300">
                  Your course creation request was reviewed by Platform Administration and is currently not approved.
                </p>
                {rejectionReason && (
                  <div className="pt-2 border-t border-rose-500/10">
                    <span className="text-rose-400 font-bold block mb-1">Admin Feedback:</span>
                    <p className="italic text-slate-200 bg-black/20 p-2.5 rounded-lg border border-rose-500/20">
                      "{rejectionReason}"
                    </p>
                  </div>
                )}
                {reviewedAt && (
                  <p className="text-[11px] text-slate-500 pt-1 font-mono">
                    Reviewed on {formatDate(reviewedAt)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/[0.06]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setShowReapplyForm(true)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Submit New Request</span>
                </button>
              </div>
            </div>
          )}

          {/* RE-APPLY / REINSTATEMENT FORM (FOR REJECTED OR REVOKED) */}
          {(effectiveStatus === "REJECTED" || effectiveStatus === "REVOKED") && showReapplyForm && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                    {effectiveStatus === "REVOKED" ? "Reinstatement Request" : "Re-Application"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {effectiveStatus === "REVOKED" ? "Request Reinstatement" : "Submit New Request"}
                  </h2>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    {effectiveStatus === "REVOKED"
                      ? "Reason for Reinstatement / Updated Plan"
                      : "Updated Proposal / Action Taken on Feedback"}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder={
                      effectiveStatus === "REVOKED"
                        ? "Briefly describe why your course creation privileges should be restored (e.g. Updated syllabus, refined curriculum, compliance with platform standards)..."
                        : "Describe how you have addressed the feedback (e.g. Added full curriculum outline and GitHub code samples)..."
                    }
                    className="w-full bg-[#080B11] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReapplyForm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/[0.06]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !requestNotes.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{effectiveStatus === "REVOKED" ? "Send Reinstatement Request" : "Send New Request"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              STATE 5: REVOKED / LOCKED
              ═══════════════════════════════════════════════════════ */}
          {effectiveStatus === "REVOKED" && !showReapplyForm && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Privilege Status
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Course Creation Locked
                  </h2>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  Course creation access is currently restricted or revoked by Platform Administration.
                </p>
                <div className="p-2.5 rounded-lg bg-black/20 border border-white/[0.04] text-[11px] text-slate-400">
                  💡 <b>Note:</b> Your existing published courses, modules, and enrolled learners remain active and untouched.
                </div>
                {reviewedAt && (
                  <p className="text-[11px] text-slate-500 pt-1 font-mono">
                    Status updated on {formatDate(reviewedAt)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/[0.06]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReapplyForm(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Reinstatement</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
