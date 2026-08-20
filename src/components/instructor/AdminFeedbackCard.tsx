"use client";

import React, { useState } from "react";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, FileText, Download,
  ExternalLink, ChevronDown, ChevronUp, AlertCircle, ArrowRight,
  Sparkles, Check, X, ShieldAlert, FileUp, Eye, MessageSquare,
  RotateCcw, Award, Layers
} from "lucide-react";

/* ═══════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════ */

export type ReviewStatus = "APPROVED" | "NEEDS_CHANGES" | "REJECTED" | "UNDER_REVIEW" | "NO_FEEDBACK";
export type PriorityLevel = "HIGH" | "MEDIUM" | "LOW";

export interface FeedbackItem {
  id: string;
  title: string;
  explanation: string;
  priority: PriorityLevel;
  howToFix: string;
  sectionTarget?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  isPassed: boolean;
}

export interface AdminAttachment {
  id: string;
  name: string;
  size: string;
  url: string;
}

export interface AdminFeedbackData {
  courseId: string;
  courseTitle: string;
  status: ReviewStatus;
  reviewerName: string;
  lastReviewedDate: string;
  adminNotes: string;
  feedbackList: FeedbackItem[];
  checklist: ChecklistItem[];
  attachments: AdminAttachment[];
}

interface AdminFeedbackCardProps {
  data?: AdminFeedbackData;
  onFixAndResubmit?: () => void;
  onViewSubmission?: () => void;
  onPublishCourse?: () => void;
  onViewLiveCourse?: () => void;
}

/* ═══════════════════════════════════════════════
   DEFAULT CLEAN MOCK DATA
   ═══════════════════════════════════════════════ */

const defaultMockData: AdminFeedbackData = {
  courseId: "crs_agentic_ai_101",
  courseTitle: "Agentic AI & Autonomous Agents Masterclass",
  status: "NEEDS_CHANGES",
  reviewerName: "Dr. Elena Rostova (Admin Team)",
  lastReviewedDate: "5 Aug 2026",
  adminNotes: "Overall course quality is strong! Please fix the duplicate lesson in Module 3 and update the thumbnail resolution to high quality before resubmitting.",
  feedbackList: [
    {
      id: "fb-1",
      priority: "HIGH",
      title: "Module 3 contains duplicate lesson content",
      explanation: "Lesson 3.2 'Prompting Frameworks' is identical to Lesson 3.4.",
      howToFix: "Remove Lesson 3.4 or replace it with a practical multi-agent exercise.",
      sectionTarget: "Module 3 -> Lesson 3.4"
    },
    {
      id: "fb-2",
      priority: "MEDIUM",
      title: "Replace low-resolution course cover thumbnail",
      explanation: "Uploaded thumbnail resolution is 480x270 (minimum required is 1280x720).",
      howToFix: "Upload a crisp 16:9 ratio image (1280x720 or higher).",
      sectionTarget: "Basic Info -> Cover Media"
    },
    {
      id: "fb-3",
      priority: "MEDIUM",
      title: "Add quiz after Module 5",
      explanation: "Module 5 currently lacks a practice quiz for student assessment.",
      howToFix: "Create a 3 to 5 question quiz at the end of Module 5.",
      sectionTarget: "Module 5 -> Add Quiz"
    },
    {
      id: "fb-4",
      priority: "LOW",
      title: "Expand prerequisites in course overview",
      explanation: "Specify OpenAI API key requirement in course requirements.",
      howToFix: "Update course overview to list OpenAI API key requirements.",
      sectionTarget: "Basic Info -> Description"
    }
  ],
  checklist: [
    { id: "c1", label: "Course Thumbnail", isPassed: true },
    { id: "c2", label: "Course Description", isPassed: true },
    { id: "c3", label: "Curriculum Structure", isPassed: true },
    { id: "c4", label: "Instructor Verification", isPassed: true },
    { id: "c5", label: "Module 3 Unique Lessons", isPassed: false },
    { id: "c6", label: "Module 5 Quiz", isPassed: false }
  ],
  attachments: [
    { id: "att-1", name: "Review_Feedback_Summary.pdf", size: "1.4 MB", url: "#" },
    { id: "att-2", name: "Thumbnail_Guidelines.png", size: "850 KB", url: "#" }
  ]
};

/* ═══════════════════════════════════════════════
   MAIN ADMIN FEEDBACK COMPONENT
   ═══════════════════════════════════════════════ */

export default function AdminFeedbackCard({
  data = defaultMockData,
  onFixAndResubmit,
  onViewSubmission,
  onPublishCourse,
  onViewLiveCourse
}: AdminFeedbackCardProps) {
  const [currentStatus, setCurrentStatus] = useState<ReviewStatus>(data.status);
  const [activeTab, setActiveTab] = useState<"feedback" | "checklist" | "attachments">("feedback");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeData = { ...data, status: currentStatus };

  // Status configuration mapping
  const statusConfig = {
    APPROVED: {
      label: "Approved",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: CheckCircle2
    },
    NEEDS_CHANGES: {
      label: "Needs Changes",
      color: "text-orange-400 bg-orange-500/10 border-orange-500/30 animate-pulse",
      icon: AlertTriangle
    },
    REJECTED: {
      label: "Rejected",
      color: "text-red-400 bg-red-500/10 border-red-500/30",
      icon: XCircle
    },
    UNDER_REVIEW: {
      label: "Under Review",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      icon: Clock
    },
    NO_FEEDBACK: {
      label: "Not Reviewed Yet",
      color: "text-subtext bg-card border-card",
      icon: ShieldAlert
    }
  }[activeData.status];

  const StatusIcon = statusConfig.icon;

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "HIGH":
        return <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">High Priority</span>;
      case "MEDIUM":
        return <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">Medium</span>;
      case "LOW":
        return <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Low</span>;
    }
  };

  return (
    <div className="w-full space-y-4 text-text overflow-hidden">
      
      {/* ─── PROMINENT & READABLE TEST STATE SWITCHER AT TOP ─── */}
      <div className="bg-background/80 border border-card/80 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs shadow-inner">
        <span className="text-subtext font-extrabold uppercase tracking-wider text-xs flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Test State:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["NEEDS_CHANGES", "APPROVED", "REJECTED", "UNDER_REVIEW"] as ReviewStatus[]).map(st => (
            <button
              key={st}
              onClick={() => setCurrentStatus(st)}
              className={`px-3 py-1 rounded-xl font-bold transition-all text-xs border ${
                currentStatus === st
                  ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/25"
                  : "bg-card text-subtext hover:text-text border-card hover:bg-card/80"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 1. TOP HEADER & STATUS BAR ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-card/80">
        <div>
          <h3 className="text-2xl font-black text-text tracking-tight">
            {activeData.courseTitle}
          </h3>
          <p className="text-sm text-subtext mt-1 font-medium">
            Reviewed on <span className="text-text font-bold">{activeData.lastReviewedDate}</span> by <span className="text-purple-300 font-bold">{activeData.reviewerName}</span>
          </p>
        </div>

        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-sm font-black uppercase tracking-wide ${statusConfig.color}`}>
          <StatusIcon className="w-5 h-5" />
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* ─── 2. REVIEWER SUMMARY NOTE ─── */}
      {activeData.adminNotes && (
        <div className="bg-background/80 border border-purple-500/30 rounded-2xl p-5 flex items-start gap-3.5 text-sm leading-relaxed">
          <MessageSquare className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-purple-300 block mb-1 text-xs uppercase tracking-wider">Reviewer Note:</span>
            <p className="text-text/90 font-medium leading-relaxed">{activeData.adminNotes}</p>
          </div>
        </div>
      )}

      {/* ─── 3. APPROVED / REJECTED BANNER STATES ─── */}
      {activeData.status === "APPROVED" && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-7 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-xl font-black text-text">Your Course is Approved! 🎉</h4>
            <p className="text-sm text-subtext mt-1 max-w-lg mx-auto">
              Your curriculum meets all quality standards. You can now publish it to the student marketplace.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={onPublishCourse} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              Publish Course Now
            </button>
            <button onClick={onViewLiveCourse} className="px-6 py-3 bg-card border border-card text-text font-bold text-sm rounded-xl hover:bg-card/80 transition-all">
              View Preview
            </button>
          </div>
        </div>
      )}

      {activeData.status === "REJECTED" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 space-y-3 text-sm">
          <div className="flex items-center gap-2 text-red-400 font-extrabold text-base">
            <XCircle className="w-5 h-5" /> Course Submission Rejected
          </div>
          <p className="text-subtext leading-relaxed">
            This submission did not meet safety or copyright standards. Please review the notes above and edit your course before appealing for a re-review.
          </p>
        </div>
      )}

      {/* ─── 4. NEEDS CHANGES (CLEAN SIMPLE TABS & FEEDBACK LIST) ─── */}
      {activeData.status === "NEEDS_CHANGES" && (
        <div className="space-y-6">

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-card pb-4 text-sm font-bold">
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === "feedback"
                  ? "bg-purple-600 text-white font-black shadow-lg shadow-purple-500/25"
                  : "text-subtext hover:text-text hover:bg-background"
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Action Items ({activeData.feedbackList.length})
            </button>

            <button
              onClick={() => setActiveTab("checklist")}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === "checklist"
                  ? "bg-purple-600 text-white font-black shadow-lg shadow-purple-500/25"
                  : "text-subtext hover:text-text hover:bg-background"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> Checklist ({activeData.checklist.filter(c => c.isPassed).length}/{activeData.checklist.length})
            </button>

            {activeData.attachments.length > 0 && (
              <button
                onClick={() => setActiveTab("attachments")}
                className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === "attachments"
                    ? "bg-purple-600 text-white font-black shadow-lg shadow-purple-500/25"
                    : "text-subtext hover:text-text hover:bg-background"
                }`}
              >
                <FileText className="w-4 h-4" /> Files ({activeData.attachments.length})
              </button>
            )}
          </div>

          {/* TAB 1: FEEDBACK ITEMS LIST */}
          {activeTab === "feedback" && (
            <div className="space-y-4">
              {activeData.feedbackList.map((item) => {
                const isOpen = expandedId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-background/90 border rounded-2xl transition-all overflow-hidden ${
                      isOpen ? "border-amber-500/40 ring-1 ring-amber-500/20 shadow-lg" : "border-card hover:border-purple-500/30"
                    }`}
                  >
                    {/* Item Header */}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : item.id)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {getPriorityBadge(item.priority)}
                        <span className="font-extrabold text-text text-base truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-sm text-purple-400 font-bold">
                        <span>{isOpen ? "Hide" : "Fix"}</span>
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {/* Expandable Fix Info */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-2 border-t border-card/60 bg-card/10 space-y-4 text-sm">
                        <p className="text-subtext font-medium leading-relaxed">{item.explanation}</p>
                        
                        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex items-start gap-3 text-emerald-300">
                          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                          <div>
                            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-400 mb-0.5">How to Fix:</span>
                            <p className="font-medium text-sm leading-relaxed">{item.howToFix}</p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={onFixAndResubmit}
                            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md shadow-purple-500/20"
                          >
                            Open {item.sectionTarget || "Course Builder"} <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CHECKLIST */}
          {activeTab === "checklist" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {activeData.checklist.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border flex items-center gap-3 font-bold ${
                    c.isPassed
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                      : "bg-red-500/5 border-red-500/20 text-red-400"
                  }`}
                >
                  {c.isPassed ? <Check className="w-5 h-5 text-emerald-400 shrink-0" /> : <X className="w-5 h-5 text-red-400 shrink-0" />}
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ATTACHMENTS */}
          {activeTab === "attachments" && (
            <div className="space-y-3 text-sm">
              {activeData.attachments.map((att) => (
                <div key={att.id} className="p-4 bg-background border border-card rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-purple-400 shrink-0" />
                    <span className="font-bold text-text truncate">{att.name}</span>
                    <span className="text-xs text-subtext font-semibold">({att.size})</span>
                  </div>
                  <a href={att.url} download className="px-3.5 py-2 text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors font-bold flex items-center gap-1.5 text-xs">
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* ─── 5. BOTTOM ACTION BAR ─── */}
          <div className="pt-4 border-t border-card flex flex-col sm:flex-row items-center justify-between gap-3 overflow-hidden">
            <p className="text-xs sm:text-sm text-subtext font-medium text-center sm:text-left">
              Expected review turnaround: <span className="text-text font-extrabold">24–48 Hours</span> after resubmission.
            </p>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
              <button
                onClick={onViewSubmission}
                className="flex-1 sm:flex-none px-4 py-3 bg-background hover:bg-card border border-card text-text font-bold text-xs sm:text-sm rounded-xl transition-all"
              >
                View Submission
              </button>
              <button
                onClick={onFixAndResubmit}
                className="flex-1 sm:flex-none px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
              >
                <FileUp className="w-4 h-4 sm:w-5 sm:h-5" /> Fix & Resubmit
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
