"use client";

import React, { useState } from "react";
import {
  Brain,
  Cpu,
  Workflow,
  Layers,
  MoreVertical,
  Edit3,
  BookOpen,
  AlertCircle,
  Clock,
  CheckCircle2,
  Check,
  Send,
  Users
} from "lucide-react";
import { CourseLifecycleStatus, getGovernanceDisplay } from "@/lib/coursePermissions";
import { CourseActionMenu } from "./CourseActionMenu";
import { DataGridCourseItem } from "./CourseDataGrid";

interface CourseCardViewProps {
  courses: DataGridCourseItem[];
  onOpenCurriculum: (course: DataGridCourseItem) => void;
  onEditCourse: (course: DataGridCourseItem) => void;
  onOpenReviewDrawer: (course: DataGridCourseItem) => void;
  onSubmitForReview: (course: DataGridCourseItem) => void;
  onDuplicate?: (course: DataGridCourseItem) => void;
  onArchive?: (course: DataGridCourseItem) => void;
}

export function CourseCardView({
  courses,
  onOpenCurriculum,
  onEditCourse,
  onOpenReviewDrawer,
  onSubmitForReview,
  onDuplicate,
  onArchive,
}: CourseCardViewProps) {
  const [activeMenuCourseId, setActiveMenuCourseId] = useState<string | null>(null);

  const renderIcon = (type?: string) => {
    switch (type) {
      case "cpu":
        return <Cpu className="w-4 h-4 text-sky-400" />;
      case "layers":
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case "workflow":
        return <Workflow className="w-4 h-4 text-amber-400" />;
      default:
        return <Brain className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {courses.map((course) => {
        const gov = getGovernanceDisplay(course.status, course.submissionDate, course.adminFeedback);
        const isMenuOpen = activeMenuCourseId === course.id;

        return (
          <div
            key={course.id}
            onClick={() => onOpenCurriculum(course)}
            className="group rounded-2xl bg-[#0C1118] hover:bg-[#111722] border border-white/[0.06] hover:border-purple-500/30 transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-purple-950/20 relative"
          >
            {/* Card Header: Icon + Status + Menu */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-colors">
                  {renderIcon(course.iconType)}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-medium text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06] inline-block">
                    {course.trackBadge}
                  </span>
                </div>
              </div>

              {/* Action Menu */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveMenuCourseId(isMenuOpen ? null : course.id)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isMenuOpen
                      ? "bg-purple-600/20 border-purple-500/40 text-white"
                      : "bg-white/[0.02] hover:bg-white/[0.08] border-white/[0.06] text-slate-400 hover:text-white"
                  }`}
                  title="Course options"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                <CourseActionMenu
                  course={{
                    id: course.id,
                    title: course.title,
                    status: course.status,
                    adminFeedback: course.adminFeedback,
                  }}
                  isOpen={isMenuOpen}
                  onClose={() => setActiveMenuCourseId(null)}
                  onOpenCurriculum={() => onOpenCurriculum(course)}
                  onEditDetails={() => onEditCourse(course)}
                  onOpenReviewDrawer={() => onOpenReviewDrawer(course)}
                  onSubmitForReview={() => onSubmitForReview(course)}
                  onDuplicate={() => onDuplicate?.(course)}
                  onArchive={() => onArchive?.(course)}
                />
              </div>
            </div>

            {/* Course Title & Subtitle */}
            <div className="space-y-1.5 mb-5">
              <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors line-clamp-1">
                {course.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {course.subtitle || course.category}
              </p>
            </div>

            {/* Status & Metrics Strip */}
            <div className="space-y-4 pt-4 border-t border-white/[0.04]">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <div>
                  <span className="font-mono text-sm font-bold text-white block">
                    {course.totalModules}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Modules
                  </span>
                </div>
                <div className="border-x border-white/[0.06]">
                  <span className="font-mono text-sm font-bold text-white block">
                    {course.totalLessons}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Lessons
                  </span>
                </div>
                <div>
                  <span className="font-mono text-sm font-bold text-slate-200 block">
                    {course.totalStudents}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Learners
                  </span>
                </div>
              </div>

              {/* Status & Governance Description */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${gov.dotColorClass}`} />
                  <span className={`font-semibold ${gov.colorClass}`}>
                    {gov.label}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 text-right truncate max-w-[150px]">
                  {course.status === "UNDER_REVIEW" ? (
                    <span className="text-rose-400/90 font-medium">In Admin Queue</span>
                  ) : course.status === "CHANGES_REQUESTED" ? (
                    <span className="text-orange-400 font-medium">Revisions Needed</span>
                  ) : course.status === "APPROVED" ? (
                    <span className="text-violet-400 font-medium">Awaiting Publish</span>
                  ) : course.status === "PUBLISHED" ? (
                    <span className="text-emerald-400 font-medium">Catalog Live</span>
                  ) : (
                    <span>Draft saved</span>
                  )}
                </div>
              </div>

              {/* Context-aware Button */}
              <div onClick={(e) => e.stopPropagation()}>
                {course.status === "CHANGES_REQUESTED" && (
                  <button
                    onClick={() => onOpenReviewDrawer(course)}
                    className="w-full py-2 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                    <span>View Admin Changes</span>
                  </button>
                )}

                {course.status === "UNDER_REVIEW" && (
                  <button
                    onClick={() => onOpenReviewDrawer(course)}
                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>View Review Status</span>
                  </button>
                )}

                {course.status === "DRAFT" && (
                  <button
                    onClick={() => onEditCourse(course)}
                    className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Continue Editing</span>
                  </button>
                )}

                {(course.status === "APPROVED" || course.status === "PUBLISHED") && (
                  <button
                    onClick={() => onOpenCurriculum(course)}
                    className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    <span>Open Curriculum</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
