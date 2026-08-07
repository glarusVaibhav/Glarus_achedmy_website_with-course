"use client";

import { useState } from "react";
import { X, Check, FileText, History, Mail, Loader2, ExternalLink, AlertCircle, MessageSquare } from "lucide-react";

interface InstructorApprovalData {
  id: string;
  userId: string;
  experience: string | null;
  skills: string | null;
  bio: string | null;
  resumeUrl: string | null;
  version?: number;
  feedback?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
  reviewedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

interface InstructorReviewModalProps {
  approval: InstructorApprovalData;
  onClose: () => void;
  onDecision: (instructorId: string, decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED", feedback?: string) => Promise<void>;
}

export default function InstructorReviewModal({ approval, onClose, onDecision }: InstructorReviewModalProps) {
  const [processing, setProcessing] = useState(false);
  const [action, setAction] = useState<"APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | null>(null);
  const [feedbackInput, setFeedbackInput] = useState(approval.feedback || "");

  const handleDecision = async (decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED") => {
    setProcessing(true);
    setAction(decision);
    try {
      await onDecision(approval.userId, decision, feedbackInput.trim() || undefined);
    } finally {
      setProcessing(false);
      setAction(null);
    }
  };

  const parsedSkills = (() => {
    if (!approval.skills) return [];
    try {
      const parsed = JSON.parse(approval.skills);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Not JSON, split by comma
    }
    return approval.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
  })();

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex justify-end animate-in fade-in w-full h-full">
       <div className="w-full max-w-2xl bg-card border-l border-card/60 h-full p-8 overflow-y-auto custom-scrollbar shadow-2xl relative animate-in slide-in-from-right-8 duration-300">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-background hover:bg-card border border-card/60 text-subtext hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-text tracking-tight">Instructor Verification Review</h2>
              <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-xs font-mono font-bold">
                v{approval.version || 1}
              </span>
            </div>
            <p className="text-sm text-subtext mt-1">Review credentials and approve, request modifications, or reject platform access.</p>
          </div>

          {/* Status Banner */}
          {approval.status !== "PENDING" && (
            <div className={`mb-6 px-5 py-3 rounded-xl border text-sm font-bold flex items-center gap-2 ${
              approval.status === "APPROVED"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : approval.status === "CHANGES_REQUESTED"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {approval.status === "APPROVED" && <Check className="w-4 h-4" />}
              {approval.status === "CHANGES_REQUESTED" && <AlertCircle className="w-4 h-4" />}
              {approval.status === "REJECTED" && <X className="w-4 h-4" />}
              Status: {approval.status.replace("_", " ")}
              {approval.reviewedAt && ` on ${new Date(approval.reviewedAt).toLocaleDateString()}`}
            </div>
          )}

          <div className="space-y-6">
             {/* Identity */}
             <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-subtext uppercase tracking-widest mb-4">Identity</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-subtext/70 font-bold uppercase tracking-widest">Full Name</label>
                    <div className="mt-1 bg-card border border-card/60 rounded-xl px-4 py-2.5 text-sm font-semibold text-text">
                      {approval.user.name}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-subtext/70 font-bold uppercase tracking-widest">Contact Email</label>
                    <div className="flex items-center mt-1 bg-card border border-card/60 rounded-xl px-4 py-2.5">
                       <Mail className="w-4 h-4 text-subtext mr-3 shrink-0" />
                       <span className="text-sm font-semibold text-text">{approval.user.email}</span>
                    </div>
                  </div>
                  <div>
                     <label className="text-[10px] text-subtext/70 font-bold uppercase tracking-widest">Professional Bio</label>
                     <div className="mt-1 bg-card border border-card/60 rounded-xl px-4 py-3 text-sm text-text min-h-[80px]">
                       {approval.bio || "Not provided"}
                     </div>
                  </div>
                </div>
             </section>

             {/* Experience & Resume */}
             <section className="grid grid-cols-2 gap-4">
               <div className="bg-background border border-card/40 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                     <History className="w-4 h-4 text-primary" />
                     <h4 className="text-xs font-bold text-text uppercase tracking-widest">Experience</h4>
                  </div>
                  <p className="text-base font-bold text-text">{approval.experience || "Not specified"}</p>
               </div>
               <div className="bg-background border border-card/40 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                     <FileText className="w-4 h-4 text-primary" />
                     <h4 className="text-xs font-bold text-text uppercase tracking-widest">Resume / Portfolio</h4>
                  </div>
                  {approval.resumeUrl ? (
                    <a
                      href={approval.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-lg transition-colors border border-primary/20 inline-flex items-center gap-1"
                    >
                      View Link <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-sm text-subtext">Not provided</p>
                  )}
               </div>
             </section>

             {/* Skills Tags */}
             {parsedSkills.length > 0 && (
               <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xs font-bold text-subtext uppercase tracking-widest mb-3">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedSkills.map((s: string) => (
                       <span key={s} className="px-3 py-1 bg-card border border-card/60 rounded-lg text-xs font-semibold text-text">{s}</span>
                    ))}
                  </div>
               </section>
             )}

             {/* Admin Feedback Box */}
             <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm">
                <label className="flex items-center gap-2 text-xs font-black text-subtext uppercase tracking-widest mb-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" /> Admin Feedback / Instructions
                </label>
                <textarea
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Optional note for applicant (e.g. Please clarify teaching experience or update portfolio link...)"
                  className="w-full bg-card border border-card/60 rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-primary transition-colors min-h-[90px] resize-none placeholder:text-subtext/40 font-medium"
                />
             </section>

             {/* Application Meta */}
             <section className="bg-background border border-card/40 rounded-2xl p-4 shadow-sm">
               <div className="flex items-center justify-between text-xs text-subtext font-semibold">
                 <span>ID: <span className="text-text font-mono">{approval.id.slice(0, 10)}...</span></span>
                 <span>Version: <span className="text-text font-mono">v{approval.version || 1}</span></span>
                 <span>Submitted: {new Date(approval.createdAt).toLocaleDateString()}</span>
               </div>
             </section>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 mt-8 pt-6 pb-2 bg-gradient-to-t from-card via-card to-transparent border-t border-card/40 flex flex-col sm:flex-row items-center gap-2.5">
             <button onClick={onClose} className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-background border border-card/60 text-xs font-bold text-subtext hover:text-text transition-colors">
                Close
             </button>

             <button
               onClick={() => handleDecision("REJECTED")}
               disabled={processing}
               className="w-full sm:flex-1 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
             >
               {processing && action === "REJECTED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
               Reject
             </button>

             <button
               onClick={() => handleDecision("CHANGES_REQUESTED")}
               disabled={processing}
               className="w-full sm:flex-1 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500 hover:text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
             >
               {processing && action === "CHANGES_REQUESTED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
               Request Changes
             </button>

             <button
               onClick={() => handleDecision("APPROVED")}
               disabled={processing}
               className="w-full sm:flex-1 py-3.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
             >
               {processing && action === "APPROVED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
               Approve
             </button>
          </div>
       </div>
    </div>
  );
}
