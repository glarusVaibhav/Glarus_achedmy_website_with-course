"use client";

import React, { useEffect } from "react";
import {
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  Edit3,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CourseLifecycleStatus, getGovernanceDisplay } from "@/lib/coursePermissions";

export interface DrawerCourseData {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  trackBadge?: string;
  status: CourseLifecycleStatus;
  totalModules: number;
  totalLessons: number;
  totalStudents: number;
  submissionDate?: string;
  adminFeedback?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface CourseReviewDrawerProps {
  course: DrawerCourseData | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitForReview?: (course: DrawerCourseData) => void;
  onOpenCurriculum?: (course: DrawerCourseData) => void;
  onEditCourse?: (course: DrawerCourseData) => void;
}

export function CourseReviewDrawer({
  course,
  isOpen,
  onClose,
  onSubmitForReview,
  onOpenCurriculum,
  onEditCourse,
}: CourseReviewDrawerProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !course) return null;

  const gov = getGovernanceDisplay(course.status, course.submissionDate, course.adminFeedback);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Slide-over Drawer */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="w-screen max-w-md bg-[#0C1118] border-l border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.06] bg-[#070A0F]/60 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Governance & Review
                  </span>
                  <span className="text-xs text-slate-500">ID: {course.id.slice(0, 8)}</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                  {course.title}
                </h2>
                {course.trackBadge && (
                  <p className="text-xs text-slate-400 mt-0.5">{course.trackBadge}</p>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors cursor-pointer"
                title="Close drawer (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Current Status Pill */}
              <div className="p-4 rounded-xl bg-[#111722] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Current Review State
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${gov.dotColorClass}`} />
                    <span className={`text-sm font-bold ${gov.colorClass}`}>{gov.label}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Curriculum
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300 mt-1 block">
                    {course.totalModules} Mods · {course.totalLessons} Lessons
                  </span>
                </div>
              </div>

              {/* Admin Feedback Box (Highlight when Changes Requested or Under Review) */}
              {course.status === "CHANGES_REQUESTED" && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/25 space-y-2.5">
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Admin Feedback & Action Required</span>
                  </div>
                  <p className="text-xs text-orange-200 leading-relaxed bg-black/30 p-3 rounded-lg border border-orange-500/20 font-mono">
                    {course.adminFeedback || "Please review curriculum structure, add practical code assessments to Module 3, and ensure lesson descriptions are complete before resubmitting."}
                  </p>
                  <p className="text-[11px] text-orange-300/80">
                    Make the requested adjustments in the Course Builder and resubmit for Admin review.
                  </p>
                </div>
              )}

              {course.status === "UNDER_REVIEW" && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>In Admin Review Queue</span>
                  </div>
                  <p className="text-xs text-rose-200 leading-relaxed">
                    This course was submitted on <span className="font-semibold text-white">{course.submissionDate || "Aug 18, 2026"}</span>. Platform administrators are verifying content compliance, video quality, and syllabus structure.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Direct curriculum editing is temporarily locked while under review.
                  </p>
                </div>
              )}

              {course.status === "APPROVED" && (
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/25 space-y-2">
                  <div className="flex items-center gap-2 text-violet-300 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-violet-400" />
                    <span>Approved by Admin</span>
                  </div>
                  <p className="text-xs text-violet-200 leading-relaxed">
                    Curriculum validation passed successfully. Course is currently awaiting catalog scheduling and release by Platform Administrators.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Publication to the live public catalog is handled exclusively via the central Admin console.
                  </p>
                </div>
              )}

              {course.status === "PUBLISHED" && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Live on Platform Catalog</span>
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed">
                    This course is fully published and accessible to enrolled students ({course.totalStudents} active learners).
                  </p>
                </div>
              )}

              {/* Review Timeline History */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Governance Audit Trail</span>
                </h3>

                <div className="relative pl-6 space-y-6 border-l border-white/[0.08] ml-2">
                  {/* Step 1: Draft */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-[#0C1118] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">Course Draft Created</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {course.createdAt || "Initial Curriculum Creation"}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Submission */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0C1118] flex items-center justify-center ${
                      course.status !== "DRAFT" ? "bg-purple-600" : "bg-slate-700"
                    }`}>
                      {course.status !== "DRAFT" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <div>
                      <p className={`text-xs font-bold ${course.status !== "DRAFT" ? "text-white" : "text-slate-500"}`}>
                        Submitted for Admin Review
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {course.submissionDate || (course.status !== "DRAFT" ? "Aug 18, 2026" : "Pending submission")}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Admin Review Decision */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0C1118] flex items-center justify-center ${
                      course.status === "APPROVED" || course.status === "PUBLISHED"
                        ? "bg-emerald-500"
                        : course.status === "CHANGES_REQUESTED"
                        ? "bg-orange-500"
                        : course.status === "UNDER_REVIEW"
                        ? "bg-rose-500 animate-pulse"
                        : "bg-slate-700"
                    }`}>
                      {(course.status === "APPROVED" || course.status === "PUBLISHED") && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <div>
                      <p className={`text-xs font-bold ${
                        course.status === "APPROVED" || course.status === "PUBLISHED"
                          ? "text-emerald-400"
                          : course.status === "CHANGES_REQUESTED"
                          ? "text-orange-400"
                          : course.status === "UNDER_REVIEW"
                          ? "text-rose-400"
                          : "text-slate-500"
                      }`}>
                        {course.status === "APPROVED" || course.status === "PUBLISHED"
                          ? "Admin Approved"
                          : course.status === "CHANGES_REQUESTED"
                          ? "Changes Requested by Admin"
                          : course.status === "UNDER_REVIEW"
                          ? "Awaiting Admin Decision"
                          : "Admin Review"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {course.status === "APPROVED" || course.status === "PUBLISHED"
                          ? "Approved by Quality Reviewer"
                          : course.status === "CHANGES_REQUESTED"
                          ? "Revisions required by Admin"
                          : course.status === "UNDER_REVIEW"
                          ? "Review in progress"
                          : "Awaiting submission"}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Catalog Release */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0C1118] flex items-center justify-center ${
                      course.status === "PUBLISHED" ? "bg-emerald-500" : "bg-slate-700"
                    }`}>
                      {course.status === "PUBLISHED" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <div>
                      <p className={`text-xs font-bold ${course.status === "PUBLISHED" ? "text-emerald-400" : "text-slate-500"}`}>
                        Catalog Publication (Admin Only)
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {course.status === "PUBLISHED"
                          ? "Live on public catalog"
                          : course.status === "APPROVED"
                          ? "Awaiting Admin release"
                          : "Scheduled upon approval"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-5 border-t border-white/[0.06] bg-[#070A0F]/80 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {/* Changes Requested -> Resubmit or Edit */}
                {course.status === "CHANGES_REQUESTED" && (
                  <>
                    <button
                      onClick={() => {
                        onClose();
                        onEditCourse?.(course);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Course</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onSubmitForReview?.(course);
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Resubmit for Review</span>
                    </button>
                  </>
                )}

                {/* Draft -> Submit for Review */}
                {course.status === "DRAFT" && (
                  <>
                    <button
                      onClick={() => {
                        onClose();
                        onEditCourse?.(course);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onSubmitForReview?.(course);
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Review</span>
                    </button>
                  </>
                )}

                {/* Under Review or Approved or Published -> Open Curriculum */}
                {(course.status === "UNDER_REVIEW" || course.status === "APPROVED" || course.status === "PUBLISHED") && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCurriculum?.(course);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Curriculum</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
