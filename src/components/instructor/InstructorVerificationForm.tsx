"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck, Loader2, Send, Briefcase, Code2, FileText, Link2,
  AlertTriangle, Sparkles, ShieldAlert, ArrowLeft
} from "lucide-react";

export interface ApprovalData {
  id?: string;
  experience?: string | null;
  skills?: string | null;
  bio?: string | null;
  resumeUrl?: string | null;
  feedback?: string | null;
  version?: number;
}

interface VerificationFormProps {
  approvalData?: ApprovalData | null;
  isEditing?: boolean;
  onSubmitted: () => void;
  onCancelEdit?: () => void;
}

export default function InstructorVerificationForm({
  approvalData,
  isEditing = false,
  onSubmitted,
  onCancelEdit,
}: VerificationFormProps) {
  const [experience, setExperience] = useState(approvalData?.experience || "");
  const [skills, setSkills] = useState(approvalData?.skills || "");
  const [bio, setBio] = useState(approvalData?.bio || "");
  const [resumeUrl, setResumeUrl] = useState(approvalData?.resumeUrl || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sync state if approvalData changes
  useEffect(() => {
    if (approvalData) {
      setExperience(approvalData.experience || "");
      setSkills(approvalData.skills || "");
      setBio(approvalData.bio || "");
      setResumeUrl(approvalData.resumeUrl || "");
    }
  }, [approvalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experience.trim() || !skills.trim() || !bio.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/instructor/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience,
          skills,
          bio,
          resumeUrl: resumeUrl || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onSubmitted();
      } else {
        setError(data.error || "Failed to submit application");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top bar for Editing mode */}
      {isEditing && onCancelEdit && (
        <button
          onClick={onCancelEdit}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-background hover:bg-card border border-card/60 text-subtext hover:text-text rounded-xl font-bold text-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Verification Status
        </button>
      )}

      {/* Admin Feedback Warning Banner (if editing after changes requested or rejection) */}
      {approvalData?.feedback && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-left animate-in fade-in">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Admin Feedback to Address
          </span>
          <p className="text-sm font-medium text-text leading-relaxed whitespace-pre-wrap">
            {approvalData.feedback}
          </p>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-primary/15 border-2 border-primary/30 rounded-2xl flex items-center justify-center mb-5">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-text mb-2">
            {isEditing ? "Update Instructor Verification" : "Instructor Verification"}
          </h2>
          <p className="text-sm text-subtext font-medium max-w-md mx-auto">
            {isEditing
              ? "Modify your submitted details below. Re-submitting will update your application version."
              : "Complete your profile verification to unlock course creation tools. This is a one-time process reviewed by our admin team."}
          </p>
          <div className="flex items-center justify-center gap-6 mt-5 text-[10px] font-black uppercase tracking-widest text-subtext">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-black">1</span>
              Submit Details
            </span>
            <span className="w-8 h-px bg-card" />
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-card text-subtext flex items-center justify-center text-[10px] font-black">2</span>
              Admin Review
            </span>
            <span className="w-8 h-px bg-card" />
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-card text-subtext flex items-center justify-center text-[10px] font-black">3</span>
              Start Teaching
            </span>
          </div>
        </div>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Experience */}
        <div className="bg-card border border-card rounded-2xl p-6 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-subtext uppercase tracking-widest mb-3">
            <Briefcase className="w-4 h-4 text-primary" /> Teaching Experience *
          </label>
          <input
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g. 5 years in software development, 2 years teaching online courses"
            className="w-full bg-background border border-card/60 rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Skills */}
        <div className="bg-card border border-card rounded-2xl p-6 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-subtext uppercase tracking-widest mb-3">
            <Code2 className="w-4 h-4 text-primary" /> Technical Skills *
          </label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Python, React, Machine Learning, Cloud Architecture"
            className="w-full bg-background border border-card/60 rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none focus:border-primary transition-colors"
          />
          <p className="text-[10px] text-subtext mt-2 font-medium">Comma separated list of your core skills</p>
        </div>

        {/* Bio */}
        <div className="bg-card border border-card rounded-2xl p-6 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-subtext uppercase tracking-widest mb-3">
            <FileText className="w-4 h-4 text-primary" /> Professional Bio *
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about your professional background, teaching philosophy, and what courses you'd like to create..."
            className="w-full bg-background border border-card/60 rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none focus:border-primary transition-colors min-h-[140px] resize-none"
          />
        </div>

        {/* Resume URL (optional) */}
        <div className="bg-card border border-card rounded-2xl p-6 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-subtext uppercase tracking-widest mb-3">
            <Link2 className="w-4 h-4 text-primary" /> Resume / Portfolio Link
            <span className="text-subtext/50 normal-case tracking-normal font-medium">(optional)</span>
          </label>
          <input
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            placeholder="https://your-portfolio.com or LinkedIn profile URL"
            className="w-full bg-background border border-card/60 rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2.5 text-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> Submit for Admin Verification
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-subtext font-medium">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Your application will be reviewed within 24–48 hours. Once approved, you can create unlimited courses.
        </p>
      </form>
    </div>
  );
}
