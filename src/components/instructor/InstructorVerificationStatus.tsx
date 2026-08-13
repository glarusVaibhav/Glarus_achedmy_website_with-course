"use client";

import { useState } from "react";
import {
  ShieldCheck, Clock, CheckCircle2, RefreshCw, Edit3, Sparkles,
  AlertCircle, XCircle, ArrowRight, ShieldAlert, FileCheck, Check,
  Calendar, Hash, Loader2, User, FileText, Video, ExternalLink
} from "lucide-react";

export interface InstructorApprovalData {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  experience?: string | null;
  teachingLanguages?: string[] | string | null;
  skills?: string[] | string | null;
  opportunitySource?: string | null;
  resumeUrl?: string | null;
  resumeFileName?: string | null;
  teachingVideoType?: "LINK" | "UPLOAD" | string | null;
  teachingVideoUrl?: string | null;
  teachingVideoFileName?: string | null;
  areasOfExpertise?: string | null;
  aboutInstructor?: string | null;
  bio?: string | null;
  courseTeachingPlan?: string | null;
  whyGlarusAcademy?: string | null;
  teachesOnOtherPlatforms?: boolean | null;
  otherPlatformDetails?: string | null;
  version?: number;
  feedback?: string | null;
  reviewedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface StatusPageProps {
  status: "PENDING" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED";
  approvalData?: InstructorApprovalData | null;
  onRefresh: () => Promise<void>;
  onEdit: () => void;
  onStartCreating: () => void;
}

export default function InstructorVerificationStatus({
  status,
  approvalData,
  onRefresh,
  onEdit,
  onStartCreating,
}: StatusPageProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const formattedSubmittedOn = approvalData?.createdAt
    ? new Date(approvalData.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Recently";

  const formattedLastUpdated = approvalData?.updatedAt
    ? new Date(approvalData.updatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : formattedSubmittedOn;

  const versionTag = `v${approvalData?.version || 1}`;

  /* ── 1. APPROVED STATE ── */
  if (status === "APPROVED") {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500 font-sans">
        <div className="bg-card border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Verified Instructor
            </div>

            <div className="w-14 h-14 mx-auto bg-emerald-500/15 border-2 border-emerald-500/40 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>

            <h2 className="text-2xl font-black text-text mb-2 tracking-tight">Congratulations!</h2>
            <p className="text-subtext font-medium max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              Your instructor account has been verified. You can now create and publish unlimited courses.
            </p>

            {/* Quick Summary Grid */}
            <div className="mt-5 bg-background/60 border border-card/60 rounded-2xl p-4 text-left grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-black text-subtext uppercase tracking-widest block">Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Check className="w-3.5 h-3.5" /> Approved
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black text-subtext uppercase tracking-widest block">Approval Date</span>
                <span className="font-bold text-text mt-0.5 block">
                  {approvalData?.reviewedAt ? new Date(approvalData.reviewedAt).toLocaleDateString() : "Verified"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-black text-subtext uppercase tracking-widest block">Instructor ID</span>
                <span className="font-mono font-bold text-subtext mt-0.5 block truncate">
                  {approvalData?.id ? `${approvalData.id.slice(0, 8)}...` : "VERIFIED"}
                </span>
              </div>
            </div>

            <button
              onClick={onStartCreating}
              className="mt-6 w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mx-auto text-xs sm:text-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Start Creating Courses <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 2. CHANGES REQUESTED STATE ── */
  if (status === "CHANGES_REQUESTED") {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
        <div className="bg-card border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Changes Requested
            </div>

            <div className="w-14 h-14 mx-auto bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
              <AlertCircle className="w-7 h-7 text-amber-400" />
            </div>

            <h2 className="text-2xl font-black text-text mb-2 tracking-tight">Updates Required</h2>
            <p className="text-subtext font-medium max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              Your application requires minor modifications before approval. Please review admin feedback below.
            </p>

            {approvalData?.feedback && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Admin Feedback
                </span>
                <p className="text-xs sm:text-sm font-medium text-text leading-relaxed whitespace-pre-wrap">
                  {approvalData.feedback}
                </p>
              </div>
            )}

            <button
              onClick={onEdit}
              className="mt-6 w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <Edit3 className="w-4 h-4" /> Update & Edit Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 3. REJECTED STATE ── */
  if (status === "REJECTED") {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
        <div className="bg-card border border-red-500/30 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Verification Rejected
            </div>

            <div className="w-14 h-14 mx-auto bg-red-500/15 border-2 border-red-500/40 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-red-500/20">
              <XCircle className="w-7 h-7 text-red-400" />
            </div>

            <h2 className="text-2xl font-black text-text mb-2 tracking-tight">Application Not Approved</h2>
            <p className="text-subtext font-medium max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              Your instructor application was not approved. You can update your details and resubmit for review.
            </p>

            {approvalData?.feedback && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-left">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">
                  Admin Feedback
                </span>
                <p className="text-xs sm:text-sm font-medium text-text leading-relaxed whitespace-pre-wrap">
                  {approvalData.feedback}
                </p>
              </div>
            )}

            <button
              onClick={onEdit}
              className="mt-6 w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Edit & Resubmit Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 4. PENDING REVIEW STATE (COMPACT & SLEEK) ── */
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans space-y-4">
      {/* Compact Main Status Card */}
      <div className="bg-card border border-purple-500/25 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-md shadow-purple-500/20">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-text tracking-tight">
                  Verification In Review
                </h2>
                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-[10px] font-mono font-bold">
                  {versionTag}
                </span>
              </div>
              <p className="text-xs text-subtext mt-0.5 font-medium">
                Submitted application is currently being reviewed by our admin team.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-bold shrink-0 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Pending Review
          </div>
        </div>

        {/* Primary Action Buttons Bar — Right at Top View */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={onEdit}
            className="w-full sm:flex-1 py-3 bg-gradient-to-r from-primary via-purple-600 to-primary hover:opacity-95 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" /> Edit / Update Form
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto px-4 py-3 bg-background hover:bg-card border border-card/60 text-text rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {refreshing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Refresh Status
              </>
            )}
          </button>
        </div>

        {/* Key Application Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-background/80 border border-card/50 rounded-xl p-3">
            <span className="text-[9px] font-black text-subtext uppercase tracking-widest block">
              Applicant
            </span>
            <span className="text-xs font-bold text-text mt-1 block truncate">
              {approvalData?.firstName ? `${approvalData.firstName} ${approvalData.lastName || ''}` : "Instructor"}
            </span>
          </div>

          <div className="bg-background/80 border border-card/50 rounded-xl p-3">
            <span className="text-[9px] font-black text-subtext uppercase tracking-widest block">
              Submitted On
            </span>
            <span className="text-xs font-bold text-text mt-1 block truncate">
              {formattedSubmittedOn}
            </span>
          </div>

          <div className="bg-background/80 border border-card/50 rounded-xl p-3">
            <span className="text-[9px] font-black text-subtext uppercase tracking-widest block">
              Est. Review Time
            </span>
            <span className="text-xs font-bold text-purple-400 mt-1 block truncate">
              24–48 Hours
            </span>
          </div>

          <div className="bg-background/80 border border-card/50 rounded-xl p-3">
            <span className="text-[9px] font-black text-subtext uppercase tracking-widest block">
              Version
            </span>
            <span className="text-xs font-mono font-bold text-text mt-1 block">
              {versionTag}
            </span>
          </div>
        </div>

        {/* Compact Summary of Submitted Info */}
        <div className="border-t border-card/60 pt-4">
          <h4 className="text-[10px] font-black text-subtext uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-purple-400" /> Submitted Details Overview
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-text">
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-card/40">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Personal & Contact Details
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-card/40">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Teaching Experience:</span>
              <span className="font-bold text-purple-400 ml-auto truncate">{approvalData?.experience || "Specified"}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-card/40">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Resume Attached
              {approvalData?.resumeUrl && (
                <span className="text-[10px] text-emerald-400 font-mono ml-auto">Uploaded</span>
              )}
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-card/40">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Teaching Video:</span>
              <span className="text-[10px] text-sky-400 font-mono ml-auto">
                {approvalData?.teachingVideoType === "UPLOAD" ? "Video File" : "URL Link"}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-card/40 sm:col-span-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Course Teaching Plan & Expertise
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
