"use client";

import { useState } from "react";
import {
  ShieldCheck, Clock, CheckCircle2, RefreshCw, Edit3, Sparkles,
  AlertCircle, XCircle, ArrowRight, ShieldAlert, FileCheck, Check,
  CheckCircle, Calendar, Hash, Loader2
} from "lucide-react";

export interface InstructorApprovalData {
  id: string;
  experience?: string | null;
  skills?: string | null;
  bio?: string | null;
  resumeUrl?: string | null;
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
      <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-card border border-emerald-500/30 rounded-3xl p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              🟢 Verified Instructor
            </div>

            {/* Success Shield */}
            <div className="w-20 h-20 mx-auto bg-emerald-500/15 border-2 border-emerald-500/40 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <h2 className="text-3xl font-black text-text mb-3 tracking-tight">Congratulations!</h2>
            <p className="text-subtext font-medium max-w-md mx-auto leading-relaxed text-sm">
              Your instructor account has been successfully verified. You can now create and publish unlimited courses on the platform.
            </p>

            {/* Metadata Box */}
            <div className="mt-8 bg-background/60 border border-card/60 rounded-2xl p-5 text-left grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-black text-subtext uppercase tracking-widest block">Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Check className="w-3.5 h-3.5" /> Approved
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black text-subtext uppercase tracking-widest block">Approval Date</span>
                <span className="text-xs font-bold text-text mt-0.5 block">
                  {approvalData?.reviewedAt
                    ? new Date(approvalData.reviewedAt).toLocaleDateString()
                    : "Verified"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black text-subtext uppercase tracking-widest block">Instructor ID</span>
                <span className="text-xs font-mono font-bold text-subtext mt-0.5 block truncate">
                  {approvalData?.id ? `${approvalData.id.slice(0, 10)}...` : "VERIFIED"}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={onStartCreating}
              className="mt-8 w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mx-auto text-sm"
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
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-amber-500/30 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              🟠 Changes Requested
            </div>

            <div className="w-20 h-20 mx-auto bg-amber-500/15 border-2 border-amber-500/40 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
              <AlertCircle className="w-10 h-10 text-amber-400" />
            </div>

            <h2 className="text-2xl font-black text-text mb-3 tracking-tight">Updates Required</h2>
            <p className="text-subtext font-medium max-w-md mx-auto leading-relaxed text-sm">
              Your application requires some modifications before approval. Please review the admin feedback below and update your submission.
            </p>

            {/* Feedback Highlight Card */}
            {approvalData?.feedback && (
              <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-left">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Admin Feedback
                </span>
                <p className="text-sm font-medium text-text leading-relaxed whitespace-pre-wrap">
                  {approvalData.feedback}
                </p>
              </div>
            )}

            {/* Action */}
            <button
              onClick={onEdit}
              className="mt-8 w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Edit3 className="w-4 h-4" /> Update Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 3. REJECTED STATE ── */
  if (status === "REJECTED") {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-red-500/30 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              🔴 Verification Rejected
            </div>

            <div className="w-20 h-20 mx-auto bg-red-500/15 border-2 border-red-500/40 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>

            <h2 className="text-2xl font-black text-text mb-3 tracking-tight">Application Not Approved</h2>
            <p className="text-subtext font-medium max-w-md mx-auto leading-relaxed text-sm">
              Unfortunately, your instructor verification application was not approved. You can review the details, update your application, and resubmit.
            </p>

            {/* Feedback Highlight Card if available */}
            {approvalData?.feedback && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-left">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-2">
                  Admin Feedback
                </span>
                <p className="text-sm font-medium text-text leading-relaxed whitespace-pre-wrap">
                  {approvalData.feedback}
                </p>
              </div>
            )}

            {/* Action */}
            <button
              onClick={onEdit}
              className="mt-8 w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Edit & Resubmit Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 4. PENDING REVIEW STATE (DEFAULT) ── */
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Centered Success / Hero Banner */}
      <div className="bg-card border border-purple-500/25 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Animated Success Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            Submitted & In Review
          </div>

          {/* Large Shield Icon */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500/20 to-primary/20 border-2 border-purple-500/40 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20">
            <ShieldCheck className="w-10 h-10 text-purple-400 animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-text mb-3 tracking-tight">
            Verification Submitted Successfully
          </h2>
          <p className="text-subtext font-medium max-w-md mx-auto leading-relaxed text-sm">
            Your instructor verification has been submitted successfully and is currently being reviewed by our admin team.
          </p>
          <p className="text-xs text-subtext/70 mt-2 font-semibold">
            Once approved, you&apos;ll be able to create and publish unlimited courses.
          </p>
        </div>
      </div>

      {/* Premium Status Card */}
      <div className="bg-card border border-card rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-card/60 pb-4">
          <h3 className="text-sm font-black text-text uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-purple-400" /> Application Details
          </h3>
          <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-mono font-bold">
            {versionTag}
          </span>
        </div>

        {refreshing ? (
          /* Loading Skeleton for status refresh */
          <div className="grid grid-cols-2 gap-4 animate-pulse">
            <div className="h-16 bg-background rounded-2xl" />
            <div className="h-16 bg-background rounded-2xl" />
            <div className="h-16 bg-background rounded-2xl" />
            <div className="h-16 bg-background rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Status */}
            <div className="bg-background/80 border border-card/50 rounded-2xl p-4">
              <span className="text-[10px] font-black text-subtext uppercase tracking-widest block">
                Current Status
              </span>
              <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                🟡 Pending Review
              </div>
            </div>

            {/* Submitted On */}
            <div className="bg-background/80 border border-card/50 rounded-2xl p-4">
              <span className="text-[10px] font-black text-subtext uppercase tracking-widest block">
                Submitted On
              </span>
              <span className="text-xs font-bold text-text mt-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-subtext" />
                {formattedSubmittedOn}
              </span>
            </div>

            {/* Expected Review Time */}
            <div className="bg-background/80 border border-card/50 rounded-2xl p-4">
              <span className="text-[10px] font-black text-subtext uppercase tracking-widest block">
                Expected Review Time
              </span>
              <span className="text-xs font-bold text-text mt-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                24–48 Hours
              </span>
            </div>

            {/* Application Version & Updated */}
            <div className="bg-background/80 border border-card/50 rounded-2xl p-4">
              <span className="text-[10px] font-black text-subtext uppercase tracking-widest block">
                Version & Last Updated
              </span>
              <span className="text-xs font-bold text-text mt-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-subtext" />
                {versionTag} • {formattedLastUpdated}
              </span>
            </div>
          </div>
        )}

        {/* Submitted Information Summary Checklist */}
        <div className="border-t border-card/60 pt-5">
          <h4 className="text-xs font-black text-subtext uppercase tracking-widest mb-3">
            Submitted Information Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-text">
            <div className="flex items-center gap-2 p-2.5 bg-background/50 rounded-xl border border-card/40">
              <Check className="w-4 h-4 text-emerald-400" /> Professional Details
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-background/50 rounded-xl border border-card/40">
              <Check className="w-4 h-4 text-emerald-400" /> Teaching Experience
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-background/50 rounded-xl border border-card/40">
              <Check className="w-4 h-4 text-emerald-400" /> Technical Skills
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-background/50 rounded-xl border border-card/40">
              <Check className="w-4 h-4 text-emerald-400" /> Professional Bio
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-background/50 rounded-xl border border-card/40 sm:col-span-2">
              <Check className="w-4 h-4 text-emerald-400" /> Resume / Portfolio Link
              {approvalData?.resumeUrl ? (
                <span className="text-[10px] text-purple-400 font-mono ml-auto">Provided</span>
              ) : (
                <span className="text-[10px] text-subtext font-mono ml-auto">Optional</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-card/60 pt-5 flex flex-col sm:flex-row items-center gap-3">
          {/* Primary Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:flex-1 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {refreshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Checking Status...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Refresh Status
              </>
            )}
          </button>

          {/* Secondary Button */}
          <button
            onClick={onEdit}
            className="w-full sm:flex-1 py-3.5 bg-background hover:bg-card border border-card/60 text-text rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Edit3 className="w-4 h-4 text-purple-400" /> Edit Application
          </button>
        </div>
      </div>
    </div>
  );
}
