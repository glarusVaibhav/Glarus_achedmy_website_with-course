"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Edit3,
  Eye,
  Send,
  MessageSquare,
  Copy,
  Archive,
  Clock,
  ShieldCheck,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { CourseLifecycleStatus } from "@/lib/coursePermissions";

export interface CourseActionItemData {
  id: string;
  title: string;
  status: CourseLifecycleStatus;
  adminFeedback?: string;
}

interface CourseActionMenuProps {
  course: CourseActionItemData;
  isOpen: boolean;
  onClose: () => void;
  onOpenCurriculum: () => void;
  onEditDetails: () => void;
  onOpenReviewDrawer: () => void;
  onSubmitForReview: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
}

export function CourseActionMenu({
  course,
  isOpen,
  onClose,
  onOpenCurriculum,
  onEditDetails,
  onOpenReviewDrawer,
  onSubmitForReview,
  onDuplicate,
  onArchive,
}: CourseActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-9 w-56 rounded-xl bg-[#111722]/95 backdrop-blur-md border border-white/[0.1] shadow-2xl p-1.5 z-40 space-y-0.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
    >
      {/* 1. Primary Action */}
      <button
        onClick={() => {
          onClose();
          onOpenCurriculum();
        }}
        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] hover:text-white flex items-center gap-2 font-medium cursor-pointer transition-colors"
      >
        <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span>Open Curriculum</span>
      </button>

      {/* 2. Governance / Review Drawer */}
      <button
        onClick={() => {
          onClose();
          onOpenReviewDrawer();
        }}
        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] hover:text-white flex items-center gap-2 font-medium cursor-pointer transition-colors"
      >
        {course.status === "CHANGES_REQUESTED" ? (
          <>
            <MessageSquare className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-orange-300 font-semibold">View Admin Feedback</span>
          </>
        ) : course.status === "UNDER_REVIEW" ? (
          <>
            <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>View Review Status</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Governance Details</span>
          </>
        )}
      </button>

      {/* 3. Edit (Available when DRAFT or CHANGES_REQUESTED) */}
      {(course.status === "DRAFT" || course.status === "CHANGES_REQUESTED") && (
        <button
          onClick={() => {
            onClose();
            onEditDetails();
          }}
          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] hover:text-white flex items-center gap-2 font-medium cursor-pointer transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Edit Details</span>
        </button>
      )}

      {/* 4. Submit for Review (Available when DRAFT or CHANGES_REQUESTED) */}
      {(course.status === "DRAFT" || course.status === "CHANGES_REQUESTED") && (
        <button
          onClick={() => {
            onClose();
            onSubmitForReview();
          }}
          className="w-full text-left px-2.5 py-2 rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 flex items-center gap-2 font-semibold cursor-pointer transition-colors"
        >
          <Send className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{course.status === "CHANGES_REQUESTED" ? "Resubmit for Review" : "Submit for Review"}</span>
        </button>
      )}

      {/* 5. Student Preview Link */}
      <Link
        href={`/learn/${encodeURIComponent(course.title.replace(/\s+/g, "_"))}`}
        onClick={() => onClose()}
        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] hover:text-white flex items-center gap-2 font-medium transition-colors"
      >
        <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Student Preview</span>
      </Link>

      <div className="my-1 border-t border-white/[0.06]" />

      {/* 6. Utility Actions */}
      <button
        onClick={() => {
          onClose();
          onDuplicate?.();
        }}
        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 flex items-center gap-2 text-[11px] cursor-pointer transition-colors"
      >
        <Copy className="w-3 h-3 text-slate-500 shrink-0" />
        <span>Duplicate Course</span>
      </button>

      <button
        onClick={() => {
          onClose();
          onArchive?.();
        }}
        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 flex items-center gap-2 text-[11px] cursor-pointer transition-colors"
      >
        <Archive className="w-3 h-3 text-slate-500 shrink-0" />
        <span>Archive Course</span>
      </button>
    </div>
  );
}
