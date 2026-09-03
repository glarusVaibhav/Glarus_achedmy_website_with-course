"use client";

import { useState } from "react";
import {
  X, Check, FileText, History, Mail, Loader2, ExternalLink, AlertCircle,
  MessageSquare, User, Phone, Video, Globe, BookOpen, Sparkles, Award,
  CheckCircle2, Compass, Layers, Eye, Play, Download
} from "lucide-react";

interface InstructorApprovalData {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  experience?: string | null;
  teachingLanguages?: string | string[] | null;
  skills?: string | null;
  opportunitySource?: string | null;
  resumeUrl?: string | null;
  resumeFileName?: string | null;
  teachingVideoType?: string | null;
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
  const [previewResume, setPreviewResume] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(false);

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

  const parsedLanguages = (() => {
    if (!approval.teachingLanguages) return [];
    if (Array.isArray(approval.teachingLanguages)) return approval.teachingLanguages;
    try {
      const parsed = JSON.parse(approval.teachingLanguages);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Not JSON
    }
    return approval.teachingLanguages.split(",").map((s: string) => s.trim()).filter(Boolean);
  })();

  const fullName = approval.firstName && approval.lastName
    ? `${approval.firstName} ${approval.lastName}`
    : approval.user.name;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex justify-end animate-in fade-in w-full h-full font-sans">
      <div className="w-full max-w-2xl bg-card border-l border-card/60 h-full p-6 sm:p-8 overflow-y-auto custom-scrollbar shadow-2xl relative animate-in slide-in-from-right-8 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-background hover:bg-card border border-card/60 text-subtext hover:text-text transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-text tracking-tight">Instructor Verification Review</h2>
            <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-xs font-mono font-bold">
              v{approval.version || 1}
            </span>
          </div>
          <p className="text-xs text-subtext mt-1 font-medium">
            Review submitted teaching credentials, sample video, curriculum proposals, and approve or request changes.
          </p>
        </div>

        {/* Status Banner */}
        {approval.status !== "PENDING" && (
          <div className={`mb-6 px-5 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
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
            {approval.reviewedAt && ` • Reviewed on ${new Date(approval.reviewedAt).toLocaleDateString()}`}
          </div>
        )}

        <div className="space-y-6">
          {/* SECTION 1: Personal & Contact */}
          <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-black text-subtext uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Personal & Contact Information
            </h4>
            <div className="flex items-center gap-4 mb-4">
              {approval.photoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={approval.photoUrl}
                  alt={fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/30 shadow-md shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-card border border-card flex items-center justify-center font-black text-xl text-primary shrink-0">
                  {fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-black text-base text-text">{fullName}</h3>
                <div className="flex flex-wrap gap-y-1 gap-x-4 mt-1 text-xs text-subtext font-medium">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    {approval.email || approval.user.email}
                  </span>
                  {approval.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      {approval.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Professional Profile & Qualifications */}
          <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-subtext uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" /> Professional Profile & Credentials
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-card border border-card/60 rounded-xl p-3.5">
                <span className="text-[10px] text-subtext font-black uppercase tracking-widest block mb-1">
                  Teaching Experience
                </span>
                <p className="font-bold text-text">{approval.experience || "Not specified"}</p>
              </div>

              <div className="bg-card border border-card/60 rounded-xl p-3.5">
                <span className="text-[10px] text-subtext font-black uppercase tracking-widest block mb-1">
                  Opportunity Source
                </span>
                <p className="font-bold text-text">{approval.opportunitySource || "Direct Application"}</p>
              </div>
            </div>

            {/* Languages */}
            {parsedLanguages.length > 0 && (
              <div>
                <span className="text-[10px] text-subtext font-black uppercase tracking-widest block mb-2">
                  Teaching Languages
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedLanguages.map((lang: string) => (
                    <span key={lang} className="px-2.5 py-1 bg-card border border-card/60 text-text rounded-lg text-xs font-semibold">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {parsedSkills.length > 0 && (
              <div>
                <span className="text-[10px] text-subtext font-black uppercase tracking-widest block mb-2">
                  Technical Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedSkills.map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume / Portfolio */}
            <div className="bg-card border border-card/60 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-subtext font-black uppercase tracking-widest block">
                    Resume Document
                  </span>
                  <p className="text-xs font-bold text-text truncate">
                    {approval.resumeFileName || (approval.resumeUrl ? "Attached Resume" : "No Resume Provided")}
                  </p>
                </div>
              </div>

              {approval.resumeUrl && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewResume(true)}
                    className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View in Platform</span>
                  </button>
                  <a
                    href={approval.resumeUrl}
                    download={approval.resumeFileName || "Candidate_Resume.pdf"}
                    className="p-2 bg-card hover:bg-card/80 text-subtext hover:text-text border border-card/60 rounded-xl transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 3: Teaching Demonstration Video */}
          <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-subtext uppercase tracking-widest flex items-center gap-2">
              <Video className="w-4 h-4 text-sky-400" /> Teaching Demonstration Video
            </h4>

            {approval.teachingVideoUrl ? (
              <div className="bg-card border border-card/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {approval.teachingVideoType === "UPLOAD" ? "Uploaded Video File" : "Submitted Video Demo"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewVideo(true)}
                    className="px-3.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-sky-400" />
                    <span>Watch in Platform</span>
                  </button>
                </div>

                <p className="text-xs font-mono text-text break-all bg-background p-2.5 rounded-lg border border-card/40">
                  {approval.teachingVideoUrl}
                </p>

                {/* Inline preview for direct uploads */}
                {approval.teachingVideoUrl.startsWith("/uploads/") && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-card/60 bg-black">
                    <video
                      controls
                      src={approval.teachingVideoUrl}
                      className="w-full max-h-[240px] object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-subtext italic">No teaching video sample provided.</p>
            )}

            {/* Areas of Expertise */}
            <div>
              <span className="text-[10px] text-subtext font-black uppercase tracking-widest block mb-1">
                Areas of Expertise (100 char limit)
              </span>
              <div className="bg-card border border-card/60 rounded-xl px-4 py-2.5 text-xs font-bold text-text">
                {approval.areasOfExpertise || "Not provided"}
              </div>
            </div>
          </section>

          {/* SECTION 4: About Instructor & Course Teaching Plan */}
          <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-subtext uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" /> Course Teaching Plan & Vision
            </h4>

            {/* About You */}
            <div>
              <span className="text-[10px] text-subtext font-black uppercase tracking-widest block mb-1.5">
                About the Instructor (Bio)
              </span>
              <div className="bg-card border border-card/60 rounded-xl p-3.5 text-xs text-text leading-relaxed whitespace-pre-wrap">
                {approval.aboutInstructor || approval.bio || "No professional bio provided."}
              </div>
            </div>

            {/* Proposed Courses Plan */}
            <div>
              <span className="text-[10px] text-subtext font-black uppercase tracking-widest block mb-1.5">
                Courses You&apos;d Like to Teach (Curriculum & Learning Objectives)
              </span>
              <div className="bg-card border border-card/60 rounded-xl p-3.5 text-xs font-mono text-text leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {approval.courseTeachingPlan || "No course teaching plan provided."}
              </div>
            </div>

            {/* Why Glarus Academy? */}
            {approval.whyGlarusAcademy && (
              <div>
                <span className="text-[10px] text-subtext font-black uppercase tracking-widest block mb-1.5">
                  Why Glarus Academy?
                </span>
                <div className="bg-card border border-card/60 rounded-xl p-3.5 text-xs text-text leading-relaxed whitespace-pre-wrap">
                  {approval.whyGlarusAcademy}
                </div>
              </div>
            )}
          </section>

          {/* SECTION 5: Teaching on Other Platforms */}
          <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-black text-subtext uppercase tracking-widest mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" /> Teaching Experience on Other Platforms
            </h4>
            <div className="bg-card border border-card/60 rounded-xl p-3.5 text-xs">
              <p className="font-bold text-text mb-1">
                Teaches on other platforms:{" "}
                <span className={approval.teachesOnOtherPlatforms ? "text-emerald-400" : "text-subtext"}>
                  {approval.teachesOnOtherPlatforms ? "Yes" : "No"}
                </span>
              </p>
              {approval.teachesOnOtherPlatforms && approval.otherPlatformDetails && (
                <div className="mt-2 pt-2 border-t border-card/60 text-xs font-mono text-text whitespace-pre-wrap">
                  {approval.otherPlatformDetails}
                </div>
              )}
            </div>
          </section>

          {/* Admin Feedback Box */}
          <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm">
            <label className="flex items-center gap-2 text-xs font-black text-subtext uppercase tracking-widest mb-2">
              <MessageSquare className="w-4 h-4 text-purple-400" /> Admin Feedback / Instructions
            </label>
            <textarea
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Optional note for applicant (e.g. Please clarify teaching experience or update video sample...)"
              className="w-full bg-card border border-card/60 rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-primary transition-colors min-h-[90px] resize-none placeholder:text-subtext/40 font-medium"
            />
          </section>

          {/* Application Meta */}
          <section className="bg-background border border-card/40 rounded-2xl p-4 shadow-sm text-xs text-subtext font-semibold flex items-center justify-between">
            <span>ID: <span className="text-text font-mono">{approval.id.slice(0, 10)}...</span></span>
            <span>Version: <span className="text-purple-400 font-mono font-bold">v{approval.version || 1}</span></span>
            <span>Submitted: {new Date(approval.createdAt).toLocaleDateString()}</span>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 mt-8 pt-6 pb-2 bg-gradient-to-t from-card via-card to-transparent border-t border-card/40 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-background border border-card/60 text-xs font-bold text-subtext hover:text-text transition-colors"
          >
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

      {/* In-Platform Resume Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-white/15 rounded-3xl max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-background border-b border-card/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-black text-text">{approval.resumeFileName || "Resume Document"}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewResume(false)}
                className="p-1.5 rounded-lg bg-card text-subtext hover:text-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-black/50 p-2">
              <iframe
                src={approval.resumeUrl || ""}
                className="w-full h-full rounded-2xl bg-zinc-950"
                title="Resume Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* In-Platform Video Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-white/15 rounded-3xl max-w-3xl w-full shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-background border-b border-card/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-sky-400" />
                <span className="text-sm font-black text-text">Teaching Video Demonstration</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(false)}
                className="p-1.5 rounded-lg bg-card text-subtext hover:text-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center">
              {approval.teachingVideoUrl?.startsWith("/uploads/") || approval.teachingVideoUrl?.endsWith(".mp4") ? (
                <video
                  src={approval.teachingVideoUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh] rounded-xl object-contain bg-black"
                />
              ) : approval.teachingVideoUrl?.includes("youtube") || approval.teachingVideoUrl?.includes("youtu.be") ? (
                <iframe
                  src={approval.teachingVideoUrl.replace("watch?v=", "embed/")}
                  className="w-full aspect-video rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Teaching Video"
                />
              ) : (
                <iframe
                  src={approval.teachingVideoUrl || ""}
                  className="w-full aspect-video rounded-xl bg-zinc-950"
                  title="Teaching Video"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
