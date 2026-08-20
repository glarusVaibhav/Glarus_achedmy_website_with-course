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
  Check
} from "lucide-react";
import { CourseLifecycleStatus, getGovernanceDisplay } from "@/lib/coursePermissions";
import { CourseActionMenu } from "./CourseActionMenu";

export interface DataGridCourseItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  trackBadge: string;
  status: CourseLifecycleStatus;
  totalModules: number;
  totalLessons: number;
  totalStudents: number;
  submissionDate?: string;
  adminFeedback?: string;
  lastActivityText?: string;
  iconType?: "brain" | "cpu" | "workflow" | "layers";
  createdAt: string;
  updatedAt: string;
}

interface CourseDataGridProps {
  courses: DataGridCourseItem[];
  startIndex: number;
  onOpenCurriculum: (course: DataGridCourseItem) => void;
  onEditCourse: (course: DataGridCourseItem) => void;
  onOpenReviewDrawer: (course: DataGridCourseItem) => void;
  onSubmitForReview: (course: DataGridCourseItem) => void;
  onDuplicate?: (course: DataGridCourseItem) => void;
  onArchive?: (course: DataGridCourseItem) => void;
}

export function CourseDataGrid({
  courses,
  startIndex,
  onOpenCurriculum,
  onEditCourse,
  onOpenReviewDrawer,
  onSubmitForReview,
  onDuplicate,
  onArchive,
}: CourseDataGridProps) {
  const [activeMenuCourseId, setActiveMenuCourseId] = useState<string | null>(null);

  const renderIcon = (type?: string) => {
    switch (type) {
      case "cpu":
        return <Cpu className="w-3.5 h-3.5 text-sky-400" />;
      case "layers":
        return <Layers className="w-3.5 h-3.5 text-emerald-400" />;
      case "workflow":
        return <Workflow className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Brain className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#0C1118] border border-white/[0.06] shadow-xl overflow-hidden">
      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed text-left border-collapse">
          {/* Table Header */}
          <thead className="bg-[#070A0F]/90 border-b border-white/[0.06]">
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none">
              <th className="py-2.5 pl-4 pr-1 w-10 text-slate-500 font-mono text-center">#</th>
              <th className="py-2.5 px-3 w-[27%]">Course</th>
              <th className="py-2.5 px-3 w-[15%]">Track & Type</th>
              <th className="py-2.5 px-3 w-[13%]">Status</th>
              <th className="py-2.5 px-1.5 text-center w-[6%]">Modules</th>
              <th className="py-2.5 px-1.5 text-center w-[6%]">Lessons</th>
              <th className="py-2.5 px-1.5 text-center w-[6%]">Learners</th>
              <th className="py-2.5 px-3 w-[17%]">Admin Governance</th>
              <th className="py-2.5 pr-4 pl-2 text-right w-[10%]">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/[0.04] text-xs">
            {courses.map((course, idx) => {
              const displayIndex = String(startIndex + idx + 1).padStart(2, "0");
              const gov = getGovernanceDisplay(course.status, course.submissionDate, course.adminFeedback);
              const isMenuOpen = activeMenuCourseId === course.id;

              return (
                <tr
                  key={course.id}
                  onClick={() => onOpenCurriculum(course)}
                  className="group hover:bg-[#111722]/90 transition-colors duration-100 cursor-pointer relative"
                  style={{ height: "60px" }}
                >
                  {/* 1. Index */}
                  <td className="py-2 pl-4 pr-1 font-mono text-[11px] font-bold text-slate-500 text-center group-hover:text-purple-400 transition-colors">
                    {displayIndex}
                  </td>

                  {/* 2. Course Name & Identity */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition-colors">
                        {renderIcon(course.iconType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-[13px] font-bold text-white group-hover:text-purple-200 transition-colors truncate">
                          {course.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate max-w-full">
                          {course.subtitle || course.category}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 3. Track & Type */}
                  <td className="py-2 px-3">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-200 block truncate">
                        {course.trackBadge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 inline-block">
                        Self-Paced
                      </span>
                    </div>
                  </td>

                  {/* 4. Status Indicator */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${gov.dotColorClass}`} />
                      <span className={`text-xs font-semibold truncate ${gov.colorClass}`}>
                        {gov.label}
                      </span>
                    </div>
                  </td>

                  {/* 5. Modules */}
                  <td className="py-2 px-1.5 text-center">
                    <span className="font-mono text-xs font-bold text-white block">
                      {course.totalModules}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      Mods
                    </span>
                  </td>

                  {/* 6. Lessons */}
                  <td className="py-2 px-1.5 text-center">
                    <span className="font-mono text-xs font-bold text-white block">
                      {course.totalLessons}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      Les
                    </span>
                  </td>

                  {/* 7. Learners */}
                  <td className="py-2 px-1.5 text-center">
                    <span className="font-mono text-xs font-bold text-slate-200 block">
                      {course.totalStudents}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      Active
                    </span>
                  </td>

                  {/* 8. Admin Governance Column */}
                  <td className="py-2 px-3">
                    <div className="min-w-0">
                      {course.status === "UNDER_REVIEW" && (
                        <div className="truncate">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400 truncate">
                            <Clock className="w-3 h-3 animate-pulse shrink-0" />
                            <span className="truncate">Submitted {course.submissionDate || "Aug 18"}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            Waiting for Admin approval
                          </p>
                        </div>
                      )}

                      {course.status === "CHANGES_REQUESTED" && (
                        <div className="truncate">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-orange-400 truncate">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span className="truncate">Admin requested changes</span>
                          </div>
                          <p className="text-[10px] text-orange-300/90 truncate font-mono">
                            {course.adminFeedback || "Revisions required"}
                          </p>
                        </div>
                      )}

                      {course.status === "APPROVED" && (
                        <div className="truncate">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-violet-400 truncate">
                            <Check className="w-3 h-3 stroke-[3] shrink-0" />
                            <span className="truncate">Approved by Admin</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            Awaiting Publication
                          </p>
                        </div>
                      )}

                      {course.status === "PUBLISHED" && (
                        <div className="truncate">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 truncate">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">Approved by Admin</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            Live on Catalog
                          </p>
                        </div>
                      )}

                      {course.status === "DRAFT" && (
                        <div className="truncate">
                          <p className="text-[11px] font-medium text-slate-300 truncate">
                            {course.lastActivityText || "Draft in progress"}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">
                            Updated {course.updatedAt || "recently"}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 9. Context-Aware Actions */}
                  <td
                    className="py-2 pr-4 pl-2 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1 relative">
                      {/* Contextual Primary Action Button */}
                      {course.status === "DRAFT" && (
                        <button
                          onClick={() => onEditCourse(course)}
                          className="px-2 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                          title="Continue editing draft"
                        >
                          <Edit3 className="w-2.5 h-2.5 text-slate-400" />
                          <span>Edit</span>
                        </button>
                      )}

                      {course.status === "UNDER_REVIEW" && (
                        <button
                          onClick={() => onOpenReviewDrawer(course)}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                          title="View Admin review status"
                        >
                          <Clock className="w-2.5 h-2.5 text-rose-400" />
                          <span>Review</span>
                        </button>
                      )}

                      {course.status === "CHANGES_REQUESTED" && (
                        <button
                          onClick={() => onOpenReviewDrawer(course)}
                          className="px-2 py-1 bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                          title="View required changes"
                        >
                          <AlertCircle className="w-2.5 h-2.5 text-orange-400" />
                          <span>Changes</span>
                        </button>
                      )}

                      {(course.status === "APPROVED" || course.status === "PUBLISHED") && (
                        <button
                          onClick={() => onOpenCurriculum(course)}
                          className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                          title="Open course curriculum"
                        >
                          <BookOpen className="w-2.5 h-2.5 text-purple-400" />
                          <span>Open</span>
                        </button>
                      )}

                      {/* Three-dot menu button */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuCourseId(isMenuOpen ? null : course.id)}
                          className={`p-1 rounded-md border transition-colors cursor-pointer ${
                            isMenuOpen
                              ? "bg-purple-600/20 border-purple-500/40 text-white"
                              : "bg-white/[0.02] hover:bg-white/[0.08] border-white/[0.06] text-slate-400 hover:text-white"
                          }`}
                          title="More options"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>

                        {/* Floating Action Menu */}
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
