import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck, Loader2, Send, Briefcase, Code2, FileText, Link2,
  AlertTriangle, Sparkles, ShieldAlert, ArrowLeft, User, Mail,
  Phone, Camera, UploadCloud, Video, Globe, Check, X,
  Trash2, ExternalLink, HelpCircle, CheckCircle2, FileCheck, Layers, Lock
} from "lucide-react";

export interface ApprovalData {
  id?: string;
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
  feedback?: string | null;
  version?: number;
  status?: string | null;
}

interface VerificationFormProps {
  approvalData?: ApprovalData | null;
  isEditing?: boolean;
  onSubmitted: () => void;
  onCancelEdit?: () => void;
}

const EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1–2 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Other",
];

const OPPORTUNITY_SOURCES = [
  "LinkedIn",
  "Twitter / X",
  "YouTube",
  "Friend / Colleague",
  "Job Portal / Job Board",
  "Online Search / Google",
  "Other",
];

export default function InstructorVerificationForm({
  approvalData,
  isEditing = false,
  onSubmitted,
  onCancelEdit,
}: VerificationFormProps) {
  const { user } = useAuth();

  // Helper to extract first and last name from full name
  const parseUserName = (fullName?: string | null) => {
    if (!fullName) return { first: "", last: "" };
    const parts = fullName.trim().split(/\s+/);
    return {
      first: parts[0] || "",
      last: parts.slice(1).join(" ") || "",
    };
  };

  const initialParsed = parseUserName(user?.name);

  // ── 1. Personal Information State (Auto-prefilled from signup / profile) ──
  const [firstName, setFirstName] = useState(
    approvalData?.firstName || initialParsed.first || ""
  );
  const [lastName, setLastName] = useState(
    approvalData?.lastName || initialParsed.last || ""
  );
  const [email, setEmail] = useState(
    approvalData?.email || user?.email || ""
  );
  const [phone, setPhone] = useState(approvalData?.phone || "");
  const [photoUrl, setPhotoUrl] = useState(approvalData?.photoUrl || "");
  const [photoUploading, setPhotoUploading] = useState(false);

  // ── 2. Professional Profile State ──
  const [experience, setExperience] = useState(approvalData?.experience || "");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    if (!approvalData?.teachingLanguages) return ["English"];
    if (Array.isArray(approvalData.teachingLanguages)) return approvalData.teachingLanguages;
    try {
      const parsed = JSON.parse(approvalData.teachingLanguages);
      return Array.isArray(parsed) ? parsed : [approvalData.teachingLanguages];
    } catch {
      return approvalData.teachingLanguages.split(",").map(s => s.trim()).filter(Boolean);
    }
  });

  const [skillsList, setSkillsList] = useState<string[]>(() => {
    if (!approvalData?.skills) return [];
    if (Array.isArray(approvalData.skills)) return approvalData.skills;
    try {
      const parsed = JSON.parse(approvalData.skills);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON
    }
    return approvalData.skills.split(",").map(s => s.trim()).filter(Boolean);
  });
  const [skillInput, setSkillInput] = useState("");

  const [opportunitySource, setOpportunitySource] = useState(approvalData?.opportunitySource || "");

  // Resume State
  const [resumeUrl, setResumeUrl] = useState(approvalData?.resumeUrl || "");
  const [resumeFileName, setResumeFileName] = useState(approvalData?.resumeFileName || (approvalData?.resumeUrl ? "Existing_Resume.pdf" : ""));
  const [resumeUploading, setResumeUploading] = useState(false);

  // ── 3. Teaching Demonstration State ──
  const [videoType, setVideoType] = useState<"LINK" | "UPLOAD">(
    (approvalData?.teachingVideoType as "LINK" | "UPLOAD") || "LINK"
  );
  const [videoProtocol, setVideoProtocol] = useState("https://");
  const [videoUrlInput, setVideoUrlInput] = useState(() => {
    if (approvalData?.teachingVideoUrl && approvalData.teachingVideoType !== "UPLOAD") {
      const clean = approvalData.teachingVideoUrl.replace(/^https?:\/\//i, "");
      return clean;
    }
    return "";
  });
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(() => {
    if (approvalData?.teachingVideoType === "UPLOAD") {
      return approvalData.teachingVideoUrl || "";
    }
    return "";
  });
  const [uploadedVideoFileName, setUploadedVideoFileName] = useState(() => {
    return approvalData?.teachingVideoFileName || (approvalData?.teachingVideoUrl ? "Uploaded_Sample_Video.mp4" : "");
  });
  const [videoUploading, setVideoUploading] = useState(false);

  const [areasOfExpertise, setAreasOfExpertise] = useState(approvalData?.areasOfExpertise || "");

  // ── 4. About Your Teaching State ──
  const [aboutInstructor, setAboutInstructor] = useState(
    approvalData?.aboutInstructor || approvalData?.bio || ""
  );
  const [courseTeachingPlan, setCourseTeachingPlan] = useState(
    approvalData?.courseTeachingPlan || ""
  );
  const [whyGlarusAcademy, setWhyGlarusAcademy] = useState(
    approvalData?.whyGlarusAcademy || ""
  );

  // ── 5. Other Platforms State ──
  const [teachesOnOtherPlatforms, setTeachesOnOtherPlatforms] = useState<boolean>(
    approvalData?.teachesOnOtherPlatforms ?? false
  );
  const [otherPlatformDetails, setOtherPlatformDetails] = useState(
    approvalData?.otherPlatformDetails || ""
  );

  // ── Form Status & Validation State ──
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // File input refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Sync State on approvalData / user changes ──
  useEffect(() => {
    if (approvalData) {
      if (approvalData.firstName) {
        setFirstName(approvalData.firstName);
      } else if (user?.name) {
        const parts = user.name.trim().split(/\s+/);
        setFirstName(parts[0] || "");
      }

      if (approvalData.lastName) {
        setLastName(approvalData.lastName);
      } else if (user?.name) {
        const parts = user.name.trim().split(/\s+/);
        setLastName(parts.slice(1).join(" ") || "");
      }

      if (approvalData.email) {
        setEmail(approvalData.email);
      } else if (user?.email) {
        setEmail(user.email);
      }

      if (approvalData.phone) setPhone(approvalData.phone);
      if (approvalData.photoUrl) setPhotoUrl(approvalData.photoUrl);
      if (approvalData.experience) setExperience(approvalData.experience);

      if (approvalData.teachingLanguages) {
        if (Array.isArray(approvalData.teachingLanguages)) {
          setSelectedLanguages(approvalData.teachingLanguages);
        } else {
          try {
            const p = JSON.parse(approvalData.teachingLanguages);
            setSelectedLanguages(Array.isArray(p) ? p : [approvalData.teachingLanguages]);
          } catch {
            setSelectedLanguages(approvalData.teachingLanguages.split(",").map(s => s.trim()).filter(Boolean));
          }
        }
      }

      if (approvalData.skills) {
        if (Array.isArray(approvalData.skills)) {
          setSkillsList(approvalData.skills);
        } else {
          try {
            const p = JSON.parse(approvalData.skills);
            setSkillsList(Array.isArray(p) ? p : approvalData.skills.split(",").map(s => s.trim()).filter(Boolean));
          } catch {
            setSkillsList(approvalData.skills.split(",").map(s => s.trim()).filter(Boolean));
          }
        }
      }

      if (approvalData.opportunitySource) setOpportunitySource(approvalData.opportunitySource);
      if (approvalData.resumeUrl) {
        setResumeUrl(approvalData.resumeUrl);
        setResumeFileName(approvalData.resumeFileName || "Existing_Resume.pdf");
      }

      if (approvalData.teachingVideoType === "UPLOAD") {
        setVideoType("UPLOAD");
        setUploadedVideoUrl(approvalData.teachingVideoUrl || "");
        setUploadedVideoFileName(approvalData.teachingVideoFileName || "Uploaded_Sample_Video.mp4");
      } else if (approvalData.teachingVideoUrl) {
        setVideoType("LINK");
        if (approvalData.teachingVideoUrl.startsWith("http://")) {
          setVideoProtocol("http://");
          setVideoUrlInput(approvalData.teachingVideoUrl.replace("http://", ""));
        } else {
          setVideoProtocol("https://");
          setVideoUrlInput(approvalData.teachingVideoUrl.replace("https://", ""));
        }
      }

      if (approvalData.areasOfExpertise) setAreasOfExpertise(approvalData.areasOfExpertise);
      if (approvalData.aboutInstructor || approvalData.bio) {
        setAboutInstructor(approvalData.aboutInstructor || approvalData.bio || "");
      }
      if (approvalData.courseTeachingPlan) setCourseTeachingPlan(approvalData.courseTeachingPlan);
      if (approvalData.whyGlarusAcademy) setWhyGlarusAcademy(approvalData.whyGlarusAcademy);
      if (approvalData.teachesOnOtherPlatforms !== undefined && approvalData.teachesOnOtherPlatforms !== null) {
        setTeachesOnOtherPlatforms(Boolean(approvalData.teachesOnOtherPlatforms));
      }
      if (approvalData.otherPlatformDetails) setOtherPlatformDetails(approvalData.otherPlatformDetails);
    } else if (user) {
      if (user.name) {
        const parts = user.name.trim().split(/\s+/);
        setFirstName((prev) => prev || parts[0] || "");
        setLastName((prev) => prev || parts.slice(1).join(" ") || "");
      }
      if (user.email) {
        setEmail((prev) => prev || user.email);
      }
    }
  }, [approvalData, user]);

  // ── Language Toggle Helper ──
  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(lang)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter(l => l !== lang);
      } else {
        return [...prev, lang];
      }
    });
  };

  // ── Skills Chip Helpers ──
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    const newItems = trimmed.split(",").map(s => s.trim()).filter(Boolean);
    const updated = [...skillsList];
    newItems.forEach(item => {
      if (!updated.includes(item)) updated.push(item);
    });
    setSkillsList(updated);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // ── File Upload Helper ──
  const uploadFile = async (file: File, category: "photo" | "resume" | "video") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "File upload failed");
    }
    return data;
  };

  // ── Photo Upload Handler ──
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, photo: "Please select an image file (JPG, PNG, WEBP)." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: "Image size must be less than 5MB." }));
      return;
    }

    setPhotoUploading(true);
    setErrors(prev => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });

    try {
      const uploaded = await uploadFile(file, "photo");
      setPhotoUrl(uploaded.url);
    } catch (err: any) {
      setErrors(prev => ({ ...prev, photo: err.message || "Failed to upload photo" }));
    } finally {
      setPhotoUploading(false);
    }
  };

  // ── Resume Upload Handler ──
  const handleResumeSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExts = [".pdf", ".doc", ".docx"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      setErrors(prev => ({ ...prev, resume: "Please upload a PDF, DOC, or DOCX document." }));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: "Resume file size must be less than 15MB." }));
      return;
    }

    setResumeUploading(true);
    setErrors(prev => {
      const next = { ...prev };
      delete next.resume;
      return next;
    });

    try {
      const uploaded = await uploadFile(file, "resume");
      setResumeUrl(uploaded.url);
      setResumeFileName(uploaded.fileName || file.name);
    } catch (err: any) {
      setErrors(prev => ({ ...prev, resume: err.message || "Failed to upload resume" }));
    } finally {
      setResumeUploading(false);
    }
  };

  // ── Video Upload Handler ──
  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExts = [".mp4", ".mov", ".webm", ".m4v"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext) && !file.type.startsWith("video/")) {
      setErrors(prev => ({ ...prev, video: "Please upload a valid video file (MP4, MOV, WEBM)." }));
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, video: "Video file size must be less than 100MB." }));
      return;
    }

    setVideoUploading(true);
    setErrors(prev => {
      const next = { ...prev };
      delete next.video;
      return next;
    });

    try {
      const uploaded = await uploadFile(file, "video");
      setUploadedVideoUrl(uploaded.url);
      setUploadedVideoFileName(uploaded.fileName || file.name);
    } catch (err: any) {
      setErrors(prev => ({ ...prev, video: err.message || "Failed to upload video" }));
    } finally {
      setVideoUploading(false);
    }
  };

  // ── Form Validation ──
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Section 1
    if (!firstName.trim()) newErrors.firstName = "First Name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last Name is required.";
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (phone.trim().length < 7) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    // Section 2
    if (!resumeUrl.trim()) {
      newErrors.resume = "Resume is required. Please upload your latest resume.";
    }

    // Section 3
    if (videoType === "LINK") {
      const fullUrl = videoUrlInput.trim() ? `${videoProtocol}${videoUrlInput.trim()}` : "";
      if (!videoUrlInput.trim()) {
        newErrors.video = "Teaching video sample URL is required.";
      } else {
        try {
          new URL(fullUrl);
        } catch {
          newErrors.video = "Please enter a valid video URL (e.g. youtube.com/watch?v=...).";
        }
      }
    } else {
      if (!uploadedVideoUrl.trim()) {
        newErrors.video = "Please choose and upload a video file sample.";
      }
    }

    if (!areasOfExpertise.trim()) {
      newErrors.areasOfExpertise = "Areas of Expertise is required.";
    } else if (areasOfExpertise.trim().length > 100) {
      newErrors.areasOfExpertise = "Areas of Expertise cannot exceed 100 characters.";
    }

    // Section 4
    if (!courseTeachingPlan.trim()) {
      newErrors.courseTeachingPlan = "Courses You'd Like to Teach is required.";
    } else if (courseTeachingPlan.trim().length > 2000) {
      newErrors.courseTeachingPlan = "Course Teaching Plan cannot exceed 2,000 characters.";
    }

    // Section 5
    if (teachesOnOtherPlatforms && !otherPlatformDetails.trim()) {
      newErrors.otherPlatformDetails = "Please specify the other platforms you teach on.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Form Submission ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) {
      setFormError("Please fill out all required fields correctly before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    const finalVideoUrl = videoType === "LINK"
      ? `${videoProtocol}${videoUrlInput.trim()}`
      : uploadedVideoUrl.trim();

    const finalVideoFileName = videoType === "UPLOAD" ? uploadedVideoFileName : null;

    try {
      const res = await fetch("/api/instructor/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          photoUrl: photoUrl || null,
          experience: experience || null,
          teachingLanguages: selectedLanguages,
          skills: skillsList.length > 0 ? skillsList.join(", ") : "",
          opportunitySource: opportunitySource || null,
          resumeUrl: resumeUrl.trim(),
          resumeFileName: resumeFileName || null,
          teachingVideoType: videoType,
          teachingVideoUrl: finalVideoUrl,
          teachingVideoFileName: finalVideoFileName,
          areasOfExpertise: areasOfExpertise.trim(),
          aboutInstructor: aboutInstructor.trim() || null,
          courseTeachingPlan: courseTeachingPlan.trim(),
          whyGlarusAcademy: whyGlarusAcademy.trim() || null,
          teachesOnOtherPlatforms: Boolean(teachesOnOtherPlatforms),
          otherPlatformDetails: teachesOnOtherPlatforms ? otherPlatformDetails.trim() : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSubmitted();
      } else {
        setFormError(data.error || "Failed to submit application. Please try again.");
      }
    } catch {
      setFormError("Network error occurred. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* Top Navigation Bar for Editing Mode */}
      {isEditing && onCancelEdit && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="mb-4 inline-flex items-center gap-2 px-3.5 py-2 bg-card hover:bg-card/80 border border-card/60 text-text rounded-xl font-bold text-xs shadow-sm transition-all hover:-translate-x-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-primary" /> Back to Status Overview
        </button>
      )}

      {/* Admin Feedback Warning Banner */}
      {approvalData?.feedback && (
        <div className="mb-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-left shadow-md animate-in fade-in">
          <span className="text-xs font-black text-amber-500 uppercase tracking-widest block mb-1 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Admin Feedback to Address
          </span>
          <p className="text-xs sm:text-sm font-medium text-text leading-relaxed whitespace-pre-wrap">
            {approvalData.feedback}
          </p>
        </div>
      )}

      {/* Compact Hero Header Section */}
      <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border border-primary/20 rounded-3xl p-5 sm:p-6 mb-6 text-center relative overflow-hidden shadow-lg">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-primary/15 border-2 border-primary/30 rounded-2xl flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight">
                {isEditing ? "Update Instructor Application" : "Instructor Verification & Profile"}
              </h1>
              <p className="text-xs text-subtext font-medium mt-0.5 max-w-lg leading-relaxed">
                {isEditing
                  ? "Modify your credentials below. Re-submitting updates your application for administrative review."
                  : "Complete your profile below to unlock course creation tools once reviewed by our admin team."}
              </p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-subtext shrink-0 bg-background/60 border border-card/60 px-3.5 py-1.5 rounded-full">
            <span className="flex items-center gap-1.5 text-primary font-bold">
              <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-black">1</span>
              Details
            </span>
            <span className="w-3 h-px bg-card" />
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-card text-subtext flex items-center justify-center text-[9px] font-black">2</span>
              Review
            </span>
            <span className="w-3 h-px bg-card" />
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-card text-subtext flex items-center justify-center text-[9px] font-black">3</span>
              Teach
            </span>
          </div>
        </div>
      </div>

      {/* Global Form Alert */}
      {formError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-md animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* ═══════════════ MAIN FORM ═══════════════ */}
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ────────────────── SECTION 1: PERSONAL INFORMATION ────────────────── */}
        <section className="bg-card border border-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-card/60 pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text tracking-tight">1. Personal Information</h3>
              <p className="text-xs text-subtext font-medium">Your primary identity and direct contact details.</p>
            </div>
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Alex"
                className={`w-full bg-background border ${errors.firstName ? "border-red-500 focus:border-red-500" : "border-card/60 focus:border-primary"} rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none transition-colors`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Morgan"
                className={`w-full bg-background border ${errors.lastName ? "border-red-500 focus:border-red-500" : "border-card/60 focus:border-primary"} rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none transition-colors`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-subtext uppercase tracking-widest">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-subtext/60 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  placeholder="your.email@example.com"
                  className="w-full bg-background/50 border border-card/60 rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-subtext cursor-not-allowed select-none opacity-80 focus:outline-none"
                  title="This email is linked to your verified account and cannot be changed."
                />
                <Lock className="w-4 h-4 text-subtext/40 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-subtext/60 mt-1.5">
                Automatically locked to your verified account email.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-subtext absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000 or +91 98765 43210"
                  className={`w-full bg-background border ${errors.phone ? "border-red-500 focus:border-red-500" : "border-card/60 focus:border-primary"} rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none transition-colors`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.phone}</p>
              )}
            </div>
          </div>
        </section>

        {/* ────────────────── SECTION 2: PROFESSIONAL PROFILE ────────────────── */}
        <section className="bg-card border border-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-card/60 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text tracking-tight">2. Professional Profile</h3>
              <p className="text-xs text-subtext font-medium">Your teaching background, qualifications, and core competencies.</p>
            </div>
          </div>

          {/* Teaching Experience & Opportunity Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-2">
                Teaching Experience
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-background border border-card/60 rounded-xl px-4 py-3 text-sm font-medium text-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-2">
                Where did you hear about this opportunity?
              </label>
              <select
                value={opportunitySource}
                onChange={(e) => setOpportunitySource(e.target.value)}
                className="w-full bg-background border border-card/60 rounded-xl px-4 py-3 text-sm font-medium text-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">Select an option</option>
                {OPPORTUNITY_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Teaching Languages (Multi-select) */}
          <div>
            <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-1.5">
              Teaching Language
            </label>
            <p className="text-xs text-subtext mb-3">Select the languages in which you are comfortable delivering lectures.</p>
            <div className="flex flex-wrap gap-2.5">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-white shadow-md shadow-primary/25 border border-primary"
                        : "bg-background text-subtext hover:text-text border border-card/60 hover:border-primary/40"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills (Removable Chips) */}
          <div>
            <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-1.5">
              Skills
            </label>
            <p className="text-xs text-subtext mb-3">Add skills that define your technical and instructional expertise (press Enter or Comma to add).</p>

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Code2 className="w-4 h-4 text-subtext absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="e.g. Java, React, Python, Machine Learning..."
                  className="w-full bg-background border border-card/60 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-5 py-3 bg-card hover:bg-card/80 border border-card/60 text-text rounded-xl font-bold text-xs transition-colors shrink-0"
              >
                Add Skill
              </button>
            </div>

            {/* Chips List */}
            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-background/50 border border-card/40 rounded-2xl">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold animate-in fade-in"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-0.5 hover:bg-primary/20 rounded-md transition-colors"
                      title={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-subtext/60 italic">No skills added yet. Type a skill above and click Add.</p>
            )}
          </div>

          {/* Upload Resume (Required) */}
          <div className="pt-2">
            <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-1">
              Upload Resume <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-subtext mb-3">
              Upload your latest resume highlighting your teaching experience and expertise (PDF, DOC, DOCX up to 15MB).
            </p>

            <input
              type="file"
              ref={resumeInputRef}
              onChange={handleResumeSelect}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />

            <div className={`p-4 bg-background border ${errors.resume ? "border-red-500" : "border-card/60"} rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4`}>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${resumeUrl ? "bg-emerald-500/10 text-emerald-400" : "bg-card text-subtext"}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="truncate">
                  {resumeUrl ? (
                    <div>
                      <p className="text-xs font-bold text-text truncate max-w-[280px] sm:max-w-md">
                        {resumeFileName || "Uploaded_Resume.pdf"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-400">Ready to Submit</span>
                        {resumeUrl.startsWith("/") && (
                          <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                          >
                            View / Download <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-text">No resume uploaded</p>
                      <p className="text-[11px] text-subtext">PDF, DOC, or DOCX formats accepted.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeUploading}
                  className="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 w-full sm:w-auto justify-center"
                >
                  {resumeUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" /> {resumeUrl ? "Replace Resume" : "Choose File"}
                    </>
                  )}
                </button>

                {resumeUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setResumeUrl("");
                      setResumeFileName("");
                    }}
                    className="p-2.5 bg-background hover:bg-red-500/10 text-subtext hover:text-red-500 border border-card/60 rounded-xl transition-colors"
                    title="Remove Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {errors.resume && (
              <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.resume}</p>
            )}
          </div>
        </section>

        {/* ────────────────── SECTION 3: TEACHING DEMONSTRATION ────────────────── */}
        <section className="bg-card border border-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-card/60 pb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text tracking-tight">3. Teaching Demonstration</h3>
              <p className="text-xs text-subtext font-medium">Showcase your presentation, topic clarity, and teaching pedagogy.</p>
            </div>
          </div>

          {/* Teaching Video Sample */}
          <div className="bg-background/50 border border-card/50 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-1">
                Teaching Video Sample <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-subtext leading-relaxed">
                Please share a link to a 1–2 minute video sample of your teaching on a topic of your expertise. This gives us a better understanding of your teaching style, content, and delivery of your learning objectives.
              </p>
            </div>

            {/* Mutually Exclusive Radio Toggle */}
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text">
                <input
                  type="radio"
                  name="videoOption"
                  checked={videoType === "LINK"}
                  onChange={() => setVideoType("LINK")}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                Video Link
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text">
                <input
                  type="radio"
                  name="videoOption"
                  checked={videoType === "UPLOAD"}
                  onChange={() => setVideoType("UPLOAD")}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                Upload Video
              </label>
            </div>

            {/* Sub-Panel: Video Link */}
            {videoType === "LINK" && (
              <div className="pt-2 animate-in fade-in">
                <div className="flex gap-2">
                  <select
                    value={videoProtocol}
                    onChange={(e) => setVideoProtocol(e.target.value)}
                    className="bg-background border border-card/60 rounded-xl px-3 py-3 text-xs font-bold text-subtext focus:outline-none focus:border-primary transition-colors shrink-0"
                  >
                    <option value="https://">https://</option>
                    <option value="http://">http://</option>
                  </select>

                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 text-subtext absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="youtube.com/watch?v=... or loom.com/share/..."
                      className={`w-full bg-background border ${errors.video ? "border-red-500" : "border-card/60"} rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none focus:border-primary transition-colors`}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-subtext mt-1.5">
                  Paste a link to YouTube, Loom, Vimeo, Google Drive, or your personal website.
                </p>
              </div>
            )}

            {/* Sub-Panel: Upload Video */}
            {videoType === "UPLOAD" && (
              <div className="pt-2 animate-in fade-in">
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoSelect}
                  accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                  className="hidden"
                />

                <div className={`p-4 bg-background border ${errors.video ? "border-red-500" : "border-card/60"} rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${uploadedVideoUrl ? "bg-sky-500/10 text-sky-400" : "bg-card text-subtext"}`}>
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="truncate">
                      {uploadedVideoUrl ? (
                        <div>
                          <p className="text-xs font-bold text-text truncate max-w-[280px] sm:max-w-md">
                            {uploadedVideoFileName || "Sample_Video.mp4"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-emerald-400">Video File Attached</span>
                            {uploadedVideoUrl.startsWith("/") && (
                              <a
                                href={uploadedVideoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                              >
                                Preview Video <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-text">No video file selected</p>
                          <p className="text-[11px] text-subtext">MP4, MOV, or WEBM format (max 100MB).</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={videoUploading}
                      className="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 w-full sm:w-auto justify-center"
                    >
                      {videoUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading Video...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" /> {uploadedVideoUrl ? "Replace Video" : "Choose Video File"}
                        </>
                      )}
                    </button>

                    {uploadedVideoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedVideoUrl("");
                          setUploadedVideoFileName("");
                        }}
                        className="p-2.5 bg-background hover:bg-red-500/10 text-subtext hover:text-red-500 border border-card/60 rounded-xl transition-colors"
                        title="Remove Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {errors.video && (
              <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.video}</p>
            )}
          </div>

          {/* Areas of Expertise (Max 100 chars) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-subtext uppercase tracking-widest">
                Areas of Expertise <span className="text-red-500">*</span>
              </label>
              <span className={`text-[11px] font-mono font-bold ${areasOfExpertise.length > 100 ? "text-red-500" : "text-subtext"}`}>
                {areasOfExpertise.length}/100
              </span>
            </div>
            <p className="text-xs text-subtext mb-2.5">
              In what topics are you considered to be an expert? (100 character limit)
            </p>
            <input
              type="text"
              maxLength={100}
              value={areasOfExpertise}
              onChange={(e) => setAreasOfExpertise(e.target.value)}
              placeholder="e.g. Machine Learning, Generative AI, Python, Distributed Systems"
              className={`w-full bg-background border ${errors.areasOfExpertise ? "border-red-500" : "border-card/60"} rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none focus:border-primary transition-colors`}
            />
            {errors.areasOfExpertise && (
              <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.areasOfExpertise}</p>
            )}
          </div>
        </section>

        {/* ────────────────── SECTION 4: ABOUT YOUR TEACHING ────────────────── */}
        <section className="bg-card border border-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-card/60 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text tracking-tight">4. About Your Teaching</h3>
              <p className="text-xs text-subtext font-medium">Your course vision, curriculum outlines, and instructor bio.</p>
            </div>
          </div>

          {/* About You */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-subtext uppercase tracking-widest">
                About You
              </label>
              <span className="text-[11px] font-mono font-bold text-subtext">
                {aboutInstructor.length}/1,000
              </span>
            </div>
            <p className="text-xs text-subtext mb-2.5">
              Write a short paragraph about yourself. This will be displayed under your courses and mentor profile.
            </p>
            <textarea
              maxLength={1000}
              value={aboutInstructor}
              onChange={(e) => setAboutInstructor(e.target.value)}
              placeholder="Tell students about your professional background, industry experience, and what drives your passion for teaching..."
              className="w-full bg-background border border-card/60 rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none focus:border-primary transition-all min-h-[110px] resize-y scrollbar-thin custom-scrollbar leading-relaxed"
            />
          </div>

          {/* Courses You'd Like to Teach (Max 2,000 characters) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <label className="text-xs font-black text-subtext uppercase tracking-widest">
                  Courses You&apos;d Like to Teach <span className="text-red-500">*</span>
                </label>
                {!courseTeachingPlan && (
                  <button
                    type="button"
                    onClick={() => {
                      setCourseTeachingPlan(
                        `Course Title: \n\nKey Learning Objectives:\n1. \n2. \n3. \n4. \n5. `
                      );
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Insert Outline Template
                  </button>
                )}
              </div>
              <span className={`text-[11px] font-mono font-bold ${courseTeachingPlan.length > 2000 ? "text-red-500" : "text-subtext"}`}>
                {courseTeachingPlan.length}/2,000
              </span>
            </div>
            <p className="text-xs text-subtext mb-2.5">
              Describe the courses you&apos;d like to teach, including the course title and 5 key learning objectives.
            </p>
            <textarea
              maxLength={2000}
              value={courseTeachingPlan}
              onChange={(e) => setCourseTeachingPlan(e.target.value)}
              placeholder={`Course Title: e.g., Production Agentic AI with Next.js & LangGraph\n\nKey Learning Objectives:\n1. Master ReAct & StateGraph architectures\n2. Implement robust tool calling with schema validation\n3. Build low-latency RAG vector retrieval pipelines\n4. Deploy production stateful streaming agents\n5. Implement human-in-the-loop safety & evals`}
              className={`w-full bg-background border ${
                errors.courseTeachingPlan ? "border-red-500 ring-1 ring-red-500/30" : "border-card/60"
              } rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/35 focus:outline-none focus:border-primary transition-all min-h-[170px] resize-y scrollbar-thin custom-scrollbar leading-relaxed`}
            />
            {errors.courseTeachingPlan && (
              <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.courseTeachingPlan}</p>
            )}
          </div>

          {/* Why Glarus Academy? */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-subtext uppercase tracking-widest">
                Why do you want to author a course on Glarus Academy?
              </label>
              <span className="text-[11px] font-mono font-bold text-subtext">
                {whyGlarusAcademy.length}/800
              </span>
            </div>
            <p className="text-xs text-subtext mb-2.5">
              Tell us what motivates you to share your knowledge with our global community.
            </p>
            <textarea
              maxLength={800}
              value={whyGlarusAcademy}
              onChange={(e) => setWhyGlarusAcademy(e.target.value)}
              placeholder="Tell us what excites you about teaching at Glarus Academy and how you want to impact students' careers..."
              className="w-full bg-background border border-card/60 rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none focus:border-primary transition-all min-h-[100px] resize-y scrollbar-thin custom-scrollbar leading-relaxed"
            />
          </div>
        </section>

        {/* ────────────────── SECTION 5: OTHER PLATFORMS ────────────────── */}
        <section className="bg-card border border-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-card/60 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text tracking-tight">5. Teaching Experience on Other Platforms</h3>
              <p className="text-xs text-subtext font-medium">Prior instructional presence across online platforms.</p>
            </div>
          </div>

          {/* Yes / No Radio Buttons */}
          <div>
            <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-3">
              Do you teach on any other platforms?
            </label>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-text">
                <input
                  type="radio"
                  name="otherPlatforms"
                  checked={teachesOnOtherPlatforms === true}
                  onChange={() => setTeachesOnOtherPlatforms(true)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                Yes
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-text">
                <input
                  type="radio"
                  name="otherPlatforms"
                  checked={teachesOnOtherPlatforms === false}
                  onChange={() => {
                    setTeachesOnOtherPlatforms(false);
                    setOtherPlatformDetails("");
                  }}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                No
              </label>
            </div>
          </div>

          {/* Conditional Platform Details Field */}
          {teachesOnOtherPlatforms && (
            <div className="pt-2 animate-in fade-in">
              <label className="block text-xs font-black text-subtext uppercase tracking-widest mb-1.5">
                Please enter your details below <span className="text-red-500">*</span>
              </label>
              <textarea
                value={otherPlatformDetails}
                onChange={(e) => setOtherPlatformDetails(e.target.value)}
                placeholder={"Udemy – Python & Machine Learning\nCoursera – Data Science"}
                className={`w-full bg-background border ${errors.otherPlatformDetails ? "border-red-500" : "border-card/60"} rounded-xl px-4 py-3 text-sm font-medium text-text placeholder:text-subtext/40 focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-none font-mono text-xs sm:text-sm`}
              />
              {errors.otherPlatformDetails && (
                <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.otherPlatformDetails}</p>
              )}
            </div>
          )}
        </section>

        {/* ────────────────── SECTION 6: PROFILE PHOTO (OPTIONAL) ────────────────── */}
        <section className="bg-card border border-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-card/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text tracking-tight">6. Profile Photo</h3>
                <p className="text-xs text-subtext font-medium">Headshot photo displayed on your instructor profile and courses.</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-subtext/70 bg-card/60 border border-card px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Optional
            </span>
          </div>

          <div>
            <p className="text-xs text-subtext mb-3">Upload a clean, professional headshot photo (JPG, PNG, WEBP, max 5MB). You can also add or update this later.</p>

            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-background border border-card/60 rounded-2xl">
              {photoUrl ? (
                <div className="relative group shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt="Instructor Profile"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/40 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-card border-2 border-dashed border-card/80 flex items-center justify-center text-subtext shrink-0">
                  <Camera className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 text-center sm:text-left">
                {photoUrl ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-center sm:justify-start">
                      <Check className="w-3.5 h-3.5" /> Photo Attached
                    </p>
                    <p className="text-[11px] text-subtext mt-0.5">Click replace to choose another image.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-text">No photo uploaded (Optional)</p>
                    <p className="text-[11px] text-subtext mt-0.5">Helps students recognize and trust your courses.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={photoUploading}
                  className="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {photoUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" /> {photoUrl ? "Replace Photo" : "Upload Photo"}
                    </>
                  )}
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="p-2.5 bg-background hover:bg-red-500/10 text-subtext hover:text-red-500 border border-card/60 rounded-xl transition-colors cursor-pointer"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {errors.photo && (
              <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.photo}</p>
            )}
          </div>
        </section>

        {/* ────────────────── SUBMIT BUTTON & FOOTER ────────────────── */}
        <div className="pt-4 space-y-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 sm:py-5 bg-gradient-to-r from-primary via-purple-600 to-primary hover:opacity-95 disabled:opacity-50 text-white rounded-2xl font-black text-base shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {isEditing ? "Update & Submit Application" : "Submit for Admin Verification"}
              </>
            )}
          </button>

          <p className="text-center text-xs text-subtext font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            Your application will be reviewed within 24–48 hours. Once approved, you can create and publish courses.
          </p>
        </div>
      </form>
    </div>
  );
}
