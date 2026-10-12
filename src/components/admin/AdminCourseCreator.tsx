"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Check,
  ChevronRight,
  ChevronDown,
  Layout,
  FileText,
  Video,
  PlayCircle,
  Loader2,
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  BookOpen,
  Users,
  IndianRupee,
  Layers,
  Code,
  HelpCircle,
  Download,
  Eye,
  Award,
  ShieldCheck,
  Zap,
  ArrowUp,
  ArrowDown,
  Info,
  X,
  Radio,
  Briefcase,
  Building2,
  UploadCloud,
  ArrowRight,
  ExternalLink,
  FileCode,
  FolderArchive,
  Image as ImageIcon
} from "lucide-react";
import { createTusUpload } from "@/lib/video/tusUploader";
import { parseYouTubeVideoId } from "@/lib/video/youtubeService";

export interface AIModuleItem {
  id: string;
  title: string;
  lessons: string[];
  status: "pending" | "accepted" | "editing" | "regenerating";
}

export interface LessonContent {
  id: string;
  title: string;
  type: "video" | "article" | "quiz" | "sandbox" | "resource";
  duration?: string;
  videoUrl?: string;
  videoAssetId?: string;
  videoStatus?: "UPLOADING" | "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
  thumbnailUrl?: string;
  resolutions?: string[];
  isPreview?: boolean;
  content?: string;
  articleContent?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageCaption?: string;
  quizQuestion?: string;
  quizOptions?: string[];
  quizCorrectIndex?: number;
  quizExplanation?: string;
  starterCode?: string;
  codeLanguage?: string;
  starterFileName?: string;
  starterFileUrl?: string;
  solutionCode?: string;
  resourceFileName?: string;
  resourceUrl?: string;
  resourceFileType?: string;
  resourceFileSize?: string;
  resourceDescription?: string;
}

export interface BuilderModule {
  id: string;
  title: string;
  isExpanded: boolean;
  lessons: LessonContent[];
}

export interface LearningOutcomeItem {
  title: string;
  description: string;
}

export interface ProjectShowcaseItem {
  number?: string;
  title: string;
  desc: string;
  tech: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface CourseFormData {
  title: string;
  subtitle: string;
  category: string;
  level: string;
  price: string;
  originalPrice: string;
  duration: string;
  previewVideoUrl: string;
  isFree: boolean;
  courseType: "SELF_PACED" | "INSTRUCTOR_LED" | "LIVE_BOOTCAMP";
  instructorId: string;
  instructorName: string;
  description: string;
  outcomes: string[];
  learningOutcomes: LearningOutcomeItem[];
  projects: ProjectShowcaseItem[];
  faqs: FaqItem[];
  features: string[];
  learningJourney: string[];
  prerequisites: string;
  thumbnailGradient: string;
  featureOnHomepage: boolean;
  issueCertificate: boolean;
  drmProtection: boolean;
  hasInternship: boolean;
  internshipType: string;
  internshipDuration: string;
  internshipStipend: string;
  internshipCompanyPartner: string;
  internshipDescription: string;
}

const GRADIENT_OPTIONS = [
  { label: "Purple Indigo", value: "from-purple-900 via-indigo-950 to-slate-950", border: "border-purple-500/40" },
  { label: "Neon Emerald", value: "from-emerald-950 via-teal-950 to-slate-950", border: "border-emerald-500/40" },
  { label: "Cyan Sky", value: "from-cyan-950 via-blue-950 to-slate-950", border: "border-cyan-500/40" },
  { label: "Sunset Amber", value: "from-amber-950 via-orange-950 to-slate-950", border: "border-amber-500/40" },
  { label: "Rose Violet", value: "from-rose-950 via-purple-950 to-slate-950", border: "border-rose-500/40" }
];

const INSTRUCTOR_OPTIONS = [
  { id: "admin-official", name: "Glarus Academy (Admin Official)", title: "Lead AI Research & Instruction Team" },
  { id: "inst-101", name: "Dr. Sarah Chen", title: "Principal AI Scientist & Multi-Agent Specialist" },
  { id: "inst-102", name: "Alex Chen", title: "Senior Full-Stack & LangGraph Architect" },
  { id: "inst-103", name: "Jordan Walke", title: "Frontend Architecture & React Expert" },
  { id: "inst-104", name: "Jessica Lin", title: "MLOps & Cloud Infrastructure Lead" }
];

const PROMPT_SUGGESTIONS = [
  "Building Multi-Agent AI Systems with LangGraph & Python",
  "Full-Stack Next.js 15, Tailwind CSS 4 & Server Actions Masterclass",
  "Production RAG, Vector Search & Knowledge Graphs",
  "Enterprise DevOps with Kubernetes, Docker & CI/CD Pipelines"
];

export default function AdminCourseCreator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formatParam = searchParams?.get("format");

  // Format selection state: true if format was specified in URL, otherwise ask first
  const [formatSelected, setFormatSelected] = useState<boolean>(formatParam === "self-paced");

  useEffect(() => {
    if (formatParam === "self-paced") {
      setFormatSelected(true);
    } else if (!formatParam) {
      setFormatSelected(false);
    }
  }, [formatParam]);

  // Active Wizard Step (1: Basic Info, 2: AI Syllabus, 3: Content Builder, 4: Final Review & Publish)
  const [currentStep, setCurrentStep] = useState(1);

  // Landing Page Showcase Tab in Step 1
  const [landingTab, setLandingTab] = useState<"outcomes" | "projects" | "faqs" | "features">("outcomes");
  const [isGeneratingLanding, setIsGeneratingLanding] = useState(false);

  // Course Form Metadata
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    subtitle: "",
    category: "Artificial Intelligence",
    level: "All Levels",
    price: "2499",
    originalPrice: "4999",
    duration: "36 Hours",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isFree: false,
    courseType: "SELF_PACED",
    instructorId: "admin-official",
    instructorName: "Glarus Academy (Admin Official)",
    description: "",
    outcomes: ["Architect autonomous agentic AI workflows", "Deploy full-stack web applications with cloud CI/CD", "Optimize performance with production caching & streaming"],
    learningOutcomes: [
      {
        title: "Autonomous Agentic AI & Orchestration",
        description: "Architect multi-agent systems with LangGraph, deterministic guardrails, and persistent vector memory."
      },
      {
        title: "Production RAG & Hybrid Vector Search",
        description: "Implement semantic chunking, reciprocal rank fusion, and cross-encoder re-ranking pipelines."
      },
      {
        title: "Full-Stack Web App Deployment",
        description: "Deploy Next.js 15 server action applications with Prisma ORM, PostgreSQL, and cloud CI/CD."
      },
      {
        title: "Low-Latency Streaming AI Endpoints",
        description: "Build reactive user experiences with token counting, tool calling validation, and edge streaming."
      },
      {
        title: "Observability, Telemetry & Cost Control",
        description: "Set up distributed OpenTelemetry tracing, latency profiling, and automated cost optimization monitors."
      },
      {
        title: "Enterprise Security & RBAC Governance",
        description: "Implement role-based permissions, rate limiting, and encrypted token storage for production SaaS."
      }
    ],
    projects: [
      {
        number: "01",
        title: "Autonomous Multi-Agent Financial Analyst",
        desc: "Build an end-to-end swarm that ingests financial filings, runs quantitative metrics, and drafts investment memos.",
        tech: ["Python", "LangGraph", "FastAPI", "Docker"]
      },
      {
        number: "02",
        title: "Production Hybrid RAG Document Engine",
        desc: "Construct an enterprise search system indexing 100K+ technical documents with hybrid vector retrieval.",
        tech: ["Qdrant", "PostgreSQL", "Cohere", "Next.js"]
      },
      {
        number: "03",
        title: "Real-Time AI Code Reviewer & PR Bot",
        desc: "Deploy a webhook-triggered AI assistant that analyzes pull requests, enforces conventions, and runs unit tests.",
        tech: ["TypeScript", "GitHub API", "OpenAI", "Redis"]
      },
      {
        number: "04",
        title: "Enterprise Multi-Tenant SaaS Platform",
        desc: "Architect a scalable SaaS with team workspaces, usage metering, stripe billing, and automated CI/CD.",
        tech: ["Next.js 15", "Prisma", "PostgreSQL", "Tailwind CSS"]
      }
    ],
    faqs: [
      {
        q: "What prerequisites are required for this course?",
        a: "Basic familiarity with modern JavaScript/TypeScript or Python is recommended. We start with foundational principles and progressively build to enterprise architecture."
      },
      {
        q: "Are all projects and code repositories included?",
        a: "Yes! You receive full access to production-ready GitHub repositories, starter code, solution branches, and Docker configurations."
      },
      {
        q: "Will I receive a verified certificate upon completion?",
        a: "Yes, learners who complete all curriculum milestones and pass the capstone evaluation receive an official Glarus Academy smart certificate with a verifiable public link."
      },
      {
        q: "How long do I retain access to course materials?",
        a: "Enrollment provides lifetime access, including all future module updates, supplementary resources, and developer community forums."
      }
    ],
    features: [
      "36 Hours of on-demand HD video lectures",
      "4 Production-grade real-world capstone projects",
      "Interactive code sandboxes & modular quizzes",
      "Verified Certificate of Completion",
      "Full lifetime access with continuous updates",
      "24/7 AI Tutor support & Discord developer network"
    ],
    learningJourney: [
      "Core Foundations & Architecture",
      "State Management & Graphs",
      "Tool Calling & Reasoning Loops",
      "Production CI/CD & Deploy",
      "Capstone Evaluation"
    ],
    prerequisites: "Basic proficiency in modern JavaScript or Python.",
    thumbnailGradient: GRADIENT_OPTIONS[0].value,
    featureOnHomepage: true,
    issueCertificate: true,
    drmProtection: true,
    hasInternship: false,
    internshipType: "Guaranteed Internship (Post-Completion)",
    internshipDuration: "2 Months",
    internshipStipend: "Paid (₹15,000 / month)",
    internshipCompanyPartner: "Partner AI Startups & Tech Incubators",
    internshipDescription: "Learners who complete all course milestones and achieve >= 75% on the capstone project receive direct onboarding into a 2-month mentored industry internship."
  });

  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoEncodeProgress, setVideoEncodeProgress] = useState<number>(0);
  const [activeUploadProvider, setActiveUploadProvider] = useState<"BUNNY_STREAM" | "MINIO">("BUNNY_STREAM");
  const [videoProcessingStatus, setVideoProcessingStatus] = useState<string>("");
  const [videoProviderTab, setVideoProviderTab] = useState<"UPLOAD" | "YOUTUBE">("UPLOAD");
  const [youtubeLinkInput, setYoutubeLinkInput] = useState("");
  const [youtubeValidating, setYoutubeValidating] = useState(false);
  const [youtubeMetadata, setYoutubeMetadata] = useState<{
    videoId: string;
    title: string;
    authorName: string;
    thumbnailUrl: string;
    embedUrl: string;
  } | null>(null);

  const handleValidateYouTube = async () => {
    const raw = youtubeLinkInput.trim();
    if (!raw) {
      showToast("Please enter a YouTube video link", "error");
      return;
    }

    const vidId = parseYouTubeVideoId(raw);
    if (!vidId) {
      showToast("Invalid YouTube URL. Please check the link and try again.", "error");
      setYoutubeMetadata(null);
      return;
    }

    // Set immediate preview with local details for zero-latency feedback
    setYoutubeMetadata({
      videoId: vidId,
      title: `YouTube Video (${vidId})`,
      authorName: "Fetching channel details...",
      thumbnailUrl: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${vidId}?rel=0&modestbranding=1`,
    });

    setYoutubeValidating(true);
    try {
      const res = await fetch(`/api/videos/youtube/validate?url=${encodeURIComponent(raw)}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        const meta = data.metadata || data;
        setYoutubeMetadata({
          videoId: meta.videoId || vidId,
          title: meta.title || `YouTube Video (${vidId})`,
          authorName: meta.authorName || "YouTube Creator",
          thumbnailUrl: meta.thumbnailUrl || `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
          embedUrl: meta.embedUrl || `https://www.youtube-nocookie.com/embed/${vidId}?rel=0&modestbranding=1`,
        });
        showToast("✨ YouTube video verified! Click 'Attach to Lesson' below.", "success");
      }
    } catch {
      // Keep local preview intact
    } finally {
      setYoutubeValidating(false);
    }
  };

  const handleAttachYouTubeVideo = async () => {
    if (!youtubeMetadata) return;
    try {
      const targetVideoUrl = `https://www.youtube.com/watch?v=${youtubeMetadata.videoId}`;
      const attachRes = await fetch("/api/videos/youtube/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urlOrId: youtubeMetadata.videoId,
          title: youtubeMetadata.title || activeLessonModal?.lesson.title,
        }),
      });
      const attachData = await attachRes.json();
      const finalAssetId = (attachRes.ok && attachData.asset?.id) ? attachData.asset.id : undefined;
      const finalThumb = (attachRes.ok && attachData.asset?.thumbnailUrl) ? attachData.asset.thumbnailUrl : youtubeMetadata.thumbnailUrl;

      setActiveLessonModal((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lesson: {
            ...prev.lesson,
            videoUrl: targetVideoUrl,
            videoAssetId: finalAssetId,
            videoStatus: "READY",
            thumbnailUrl: finalThumb,
            resolutions: ["1080p (YouTube)"],
          },
        };
      });

      // Synchronize builderModules so Step 3 curriculum list reflects this instantly
      setBuilderModules((prev) =>
        prev.map((m) => {
          if (activeLessonModal && m.id === activeLessonModal.moduleId) {
            return {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === activeLessonModal.lesson.id
                  ? {
                      ...l,
                      videoUrl: targetVideoUrl,
                      videoAssetId: finalAssetId,
                      videoStatus: "READY",
                      thumbnailUrl: finalThumb,
                      resolutions: ["1080p (YouTube)"],
                    }
                  : l
              ),
            };
          }
          return m;
        })
      );

      showToast("✅ YouTube video attached to lesson!", "success");
    } catch {
      showToast("Failed to attach YouTube video", "error");
    }
  };

  const checkVideoStatusNow = async (videoAssetId: string) => {
    try {
      const res = await fetch(`/api/videos/${videoAssetId}/status`);
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.asset) return false;

      if (typeof data.asset.encodeProgress === "number") {
        setVideoEncodeProgress(data.asset.encodeProgress);
      }

      const durationFormatted = data.asset.durationSeconds
        ? `${Math.floor(data.asset.durationSeconds / 60)}m ${String(data.asset.durationSeconds % 60).padStart(2, "0")}s`
        : undefined;

      if (data.asset.status === "READY") {
        setVideoProcessingStatus("READY");
        setActiveLessonModal((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            lesson: {
              ...prev.lesson,
              videoAssetId: data.asset.id,
              videoUrl: data.asset.hlsStreamUrl || `bunny://${data.asset.providerVideoId || data.asset.id}`,
              videoStatus: "READY",
              thumbnailUrl: data.asset.thumbnailUrl || prev.lesson.thumbnailUrl,
              resolutions: data.asset.resolutions || prev.lesson.resolutions || ["360p", "720p", "1080p"],
              duration: durationFormatted || prev.lesson.duration || "15m 00s",
            },
          };
        });

        // Also sync background builderModules state
        setBuilderModules((prevModules) =>
          prevModules.map((mod) => ({
            ...mod,
            lessons: mod.lessons.map((les) => {
              if (les.videoAssetId === videoAssetId || (activeLessonModal && les.id === activeLessonModal.lesson.id)) {
                return {
                  ...les,
                  videoAssetId: data.asset.id,
                  videoUrl: data.asset.hlsStreamUrl || les.videoUrl || `bunny://${data.asset.providerVideoId || data.asset.id}`,
                  videoStatus: "READY",
                  thumbnailUrl: data.asset.thumbnailUrl || les.thumbnailUrl,
                  resolutions: data.asset.resolutions || les.resolutions || ["360p", "720p", "1080p"],
                  duration: durationFormatted || les.duration || "15m 00s",
                };
              }
              return les;
            }),
          }))
        );

        showToast("✨ Video transcoding complete! Bunny Stream HLS adaptive streaming ready.", "success");
        return true;
      } else if (data.asset.status === "FAILED") {
        setVideoProcessingStatus("FAILED");
        setActiveLessonModal((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            lesson: {
              ...prev.lesson,
              videoStatus: "FAILED",
            },
          };
        });
        showToast(`Transcoding notice: ${data.asset.errorMessage || "Processing failed"}`, "error");
        return true;
      } else if (data.asset.status === "PROCESSING") {
        setVideoProcessingStatus("PROCESSING");
      }
      return false;
    } catch {
      return false;
    }
  };

  const pollVideoStatus = (videoAssetId: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      // Allow up to 200 attempts (8+ minutes) for large multi-gigabyte videos
      if (attempts > 200) {
        clearInterval(interval);
        return;
      }
      const isDone = await checkVideoStatusNow(videoAssetId);
      if (isDone) {
        clearInterval(interval);
      }
    }, 2500);
  };

  const handleRetryVideoTranscode = async (videoAssetId: string) => {
    try {
      showToast("Retrying video transcoding...", "info");
      setVideoProcessingStatus("PROCESSING");
      const res = await fetch(`/api/videos/${videoAssetId}/retry`, { method: "POST" });
      if (res.ok) {
        setActiveLessonModal((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            lesson: { ...prev.lesson, videoStatus: "PROCESSING" },
          };
        });
        pollVideoStatus(videoAssetId);
      }
    } catch {
      showToast("Failed to retry video processing", "error");
    }
  };

  const handleAdminVideoUpload = async (file: File) => {
    setVideoUploading(true);
    setVideoUploadProgress(0);
    setVideoProcessingStatus("UPLOADING");

    try {
      // Step 1: Request Direct Upload Session (Bunny TUS or MinIO Presigned)
      const sessionRes = await fetch("/api/videos/upload-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "video/mp4",
          size: file.size,
          title: activeLessonModal?.lesson?.title || file.name,
        }),
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        throw new Error(sessionData.error || "Failed to obtain upload authorization");
      }

      const { videoAssetId, provider } = sessionData;
      setActiveUploadProvider(provider === "BUNNY_STREAM" ? "BUNNY_STREAM" : "MINIO");

      if (provider === "BUNNY_STREAM" && (sessionData.uploadEndpoint || sessionData.tusEndpoint)) {
        // Bunny Stream TUS Direct Resumable Upload
        await new Promise<void>((resolve, reject) => {
          const tusUpload = createTusUpload(file, {
            endpoint: sessionData.uploadEndpoint || sessionData.tusEndpoint,
            headers: sessionData.tusHeaders || {},
            metadata: {
              filetype: file.type || "video/mp4",
              title: activeLessonModal?.lesson?.title || file.name,
            },
            onProgress: (percent) => {
              setVideoUploadProgress(percent);
            },
            onSuccess: () => {
              resolve();
            },
            onError: (err) => {
              reject(err);
            },
          });

          tusUpload.start();
        });

        setVideoProcessingStatus("PROCESSING");
        if (activeLessonModal) {
          setActiveLessonModal({
            ...activeLessonModal,
            lesson: {
              ...activeLessonModal.lesson,
              videoAssetId,
              videoStatus: "PROCESSING",
              videoUrl: `bunny://${sessionData.providerVideoId || videoAssetId}`,
            },
          });
        }

        // Also update builderModules so the module state remembers this upload
        setBuilderModules((prevModules) =>
          prevModules.map((mod) => ({
            ...mod,
            lessons: mod.lessons.map((les) => {
              if (activeLessonModal && les.id === activeLessonModal.lesson.id) {
                return {
                  ...les,
                  videoAssetId,
                  videoStatus: "PROCESSING",
                  videoUrl: `bunny://${sessionData.providerVideoId || videoAssetId}`,
                };
              }
              return les;
            }),
          }))
        );

        showToast(`Uploaded ${file.name}! Bunny Stream is encoding multi-resolution HLS...`, "success");
        pollVideoStatus(videoAssetId);
      } else {
        // MinIO Legacy Direct Presigned PUT Upload
        const uploadUrl = sessionData.uploadUrl;
        const objectKey = sessionData.objectKey;

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl, true);
          xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const percent = Math.round((evt.loaded / evt.total) * 100);
              setVideoUploadProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Storage server upload failed (Status: ${xhr.status})`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during direct MinIO upload"));
          xhr.ontimeout = () => reject(new Error("Upload timed out"));
          xhr.send(file);
        });

        // Trigger Background HLS Transcoding for MinIO
        setVideoProcessingStatus("PROCESSING");
        await fetch("/api/videos/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoAssetId }),
        });

        const fallbackProxyUrl = `/api/storage/file?key=${encodeURIComponent(objectKey || "")}`;

        if (activeLessonModal) {
          setActiveLessonModal({
            ...activeLessonModal,
            lesson: {
              ...activeLessonModal.lesson,
              videoUrl: fallbackProxyUrl,
              videoAssetId,
              videoStatus: "PROCESSING",
            },
          });
        }

        showToast(`Uploaded ${file.name}! Transcoding HLS streaming variants...`, "success");
        pollVideoStatus(videoAssetId);
      }
    } catch (err: any) {
      console.warn("Direct upload error, falling back to standard upload:", err?.message);
      // Graceful fallback to legacy /api/upload
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("category", "video");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        if (activeLessonModal) {
          setActiveLessonModal({
            ...activeLessonModal,
            lesson: {
              ...activeLessonModal.lesson,
              videoUrl: data.url,
              videoStatus: "READY",
            },
          });
        }
        showToast(`Uploaded ${file.name}!`, "success");
      } catch (fallbackErr: any) {
        showToast(fallbackErr.message || "Failed to upload video", "error");
      }
    } finally {
      setVideoUploading(false);
    }
  };

  // Material (Resource, Article, Code, Image) File Upload Handler
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [materialUploadProgress, setMaterialUploadProgress] = useState<string>("");

  const handleMaterialFileUpload = async (file: File, category: "resource" | "article" | "code" | "image") => {
    setIsUploadingMaterial(true);
    setMaterialUploadProgress(`Uploading ${file.name}...`);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const fileUrl = data.url;
      const originalFileName = file.name;
      const fileExt = originalFileName.split(".").pop()?.toUpperCase() || "FILE";
      const sizeFormatted = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;

      if (category === "resource") {
        setActiveLessonModal(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lesson: {
              ...prev.lesson,
              resourceFileName: originalFileName,
              resourceUrl: fileUrl,
              resourceFileType: fileExt,
              resourceFileSize: sizeFormatted,
            }
          };
        });
        showToast(`✅ Resource "${originalFileName}" uploaded successfully!`, "success");
      } else if (category === "article") {
        // If it's a markdown or text file, import its text content directly into the editor
        if (file.name.endsWith(".md") || file.name.endsWith(".txt") || file.name.endsWith(".markdown")) {
          const text = await file.text();
          setActiveLessonModal(prev => {
            if (!prev) return null;
            return {
              ...prev,
              lesson: {
                ...prev.lesson,
                content: text,
                articleContent: text,
              }
            };
          });
          showToast(`📄 Imported article content from "${originalFileName}"!`, "success");
        } else {
          showToast(`✅ Article document "${originalFileName}" attached!`, "success");
        }
      } else if (category === "code") {
        // If it's a code file, read its text into starterCode and detect language
        const isTextCode = /\.(py|js|ts|tsx|jsx|cpp|c|h|java|rs|go|html|css|sql|json|yaml|yml|sh|txt|md)$/i.test(file.name);
        if (isTextCode) {
          const codeText = await file.text();
          const ext = file.name.split(".").pop()?.toLowerCase() || "python";
          const langMap: Record<string, string> = {
            py: "python", js: "javascript", ts: "typescript", tsx: "typescript",
            jsx: "javascript", cpp: "cpp", c: "c", java: "java", rs: "rust",
            go: "go", html: "html", css: "css", sql: "sql", json: "json"
          };
          setActiveLessonModal(prev => {
            if (!prev) return null;
            return {
              ...prev,
              lesson: {
                ...prev.lesson,
                starterCode: codeText,
                starterFileName: originalFileName,
                starterFileUrl: fileUrl,
                codeLanguage: langMap[ext] || prev.lesson.codeLanguage || "python"
              }
            };
          });
          showToast(`💻 Loaded starter code from "${originalFileName}"!`, "success");
        } else {
          setActiveLessonModal(prev => {
            if (!prev) return null;
            return {
              ...prev,
              lesson: {
                ...prev.lesson,
                starterFileName: originalFileName,
                starterFileUrl: fileUrl
              }
            };
          });
          showToast(`📦 Starter project archive "${originalFileName}" attached!`, "success");
        }
      } else if (category === "image") {
        setActiveLessonModal(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lesson: {
              ...prev.lesson,
              imageUrl1: fileUrl
            }
          };
        });
        showToast(`🖼️ Article banner image uploaded!`, "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to upload file", "error");
    } finally {
      setIsUploadingMaterial(false);
      setMaterialUploadProgress("");
    }
  };

  // AI Auto-Generate Landing Page Assets Handler
  const handleAutoGenerateLanding = async () => {
    const topicToUse = formData.title || aiTopic;
    if (!topicToUse.trim()) {
      showToast("Please enter a course title first.", "info");
      return;
    }
    setIsGeneratingLanding(true);
    try {
      const res = await fetch("/api/ai/course-landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: topicToUse,
          category: formData.category,
          level: formData.level
        })
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        setFormData(prev => ({
          ...prev,
          subtitle: d.subtitle || prev.subtitle,
          duration: d.duration || prev.duration,
          originalPrice: d.originalPrice ? String(d.originalPrice) : prev.originalPrice,
          learningOutcomes: Array.isArray(d.learningOutcomes) && d.learningOutcomes.length > 0 ? d.learningOutcomes : prev.learningOutcomes,
          projects: Array.isArray(d.projects) && d.projects.length > 0 ? d.projects : prev.projects,
          faqs: Array.isArray(d.faqs) && d.faqs.length > 0 ? d.faqs : prev.faqs,
          features: Array.isArray(d.features) && d.features.length > 0 ? d.features : prev.features
        }));
        showToast("✨ AI generated rich landing page showcase assets!", "success");
      } else {
        showToast("Could not generate landing page data", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to AI service", "error");
    } finally {
      setIsGeneratingLanding(false);
    }
  };

  // New Outcome input
  const [newOutcome, setNewOutcome] = useState("");

  // Dynamic Instructor List
  const [instructorList, setInstructorList] = useState<Array<{ id: string; name: string; title: string }>>([
    { id: "admin-official", name: "Glarus Academy (Admin Official)", title: "Lead AI Research & Instruction Team" }
  ]);

  useEffect(() => {
    async function loadInstructors() {
      try {
        const res = await fetch("/api/admin/live-training/assignments");
        if (res.ok) {
          const data = await res.json();
          const loaded: Array<{ id: string; name: string; title: string }> = [
            { id: "admin-official", name: "Glarus Academy (Admin Official)", title: "Lead AI Research & Instruction Team" }
          ];
          if (Array.isArray(data.instructors)) {
            data.instructors.forEach((inst: any) => {
              loaded.push({
                id: inst.id,
                name: inst.name,
                title: inst.instructorApproval?.areasOfExpertise || inst.email || "Platform Instructor"
              });
            });
          }
          setInstructorList(loaded);
        }
      } catch (err) {
        console.error("Failed to load instructors", err);
      }
    }
    loadInstructors();
  }, []);

  // AI Generation State
  const [aiTopic, setAiTopic] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [aiModules, setAiModules] = useState<AIModuleItem[]>([
    {
      id: "mod-1",
      title: "Module 1: Foundations of Agentic AI & Autonomous Architectures",
      lessons: [
        "From Single Prompts to Autonomous Multi-Agent Loops",
        "The ReAct Pattern: Reasoning, Action, and Observation",
        "Tool Calling, JSON Schema Outputs & Deterministic Guards"
      ],
      status: "accepted"
    },
    {
      id: "mod-2",
      title: "Module 2: State Management & Stateful Graph Orchestration",
      lessons: [
        "Introduction to LangGraph & Stateful Graphs",
        "Short-term vs Long-term Memory (Vector Store Persistence)",
        "Human-in-the-Loop Interventions & Guardrails"
      ],
      status: "pending"
    },
    {
      id: "mod-3",
      title: "Module 3: Production Deployment & Real-World Case Studies",
      lessons: [
        "Packaging Multi-Agent Systems with FastAPI & Docker",
        "Observability, Tracing & Cost Telemetry",
        "Capstone: Building an Autonomous Financial Research Analyst"
      ],
      status: "pending"
    }
  ]);

  // Inline Module Edit Buffer
  const [editBuffer, setEditBuffer] = useState<{ id: string; title: string; lessons: string }>({
    id: "",
    title: "",
    lessons: ""
  });
  const [aiGeneratingLessons, setAiGeneratingLessons] = useState(false);

  // Step 3 Content Builder State
  const [builderModules, setBuilderModules] = useState<BuilderModule[]>([]);
  const [activeLessonModal, setActiveLessonModal] = useState<{
    moduleId: string;
    lesson: LessonContent;
  } | null>(null);

  // Synchronize and isolate YouTube video state per lesson/module
  useEffect(() => {
    if (!activeLessonModal) {
      setYoutubeLinkInput("");
      setYoutubeMetadata(null);
      setVideoProviderTab("UPLOAD");
      return;
    }

    // If lesson has an attached video asset currently processing, auto-check its status
    if (
      activeLessonModal.lesson.videoAssetId &&
      (activeLessonModal.lesson.videoStatus === "PROCESSING" || !activeLessonModal.lesson.videoStatus)
    ) {
      checkVideoStatusNow(activeLessonModal.lesson.videoAssetId);
      pollVideoStatus(activeLessonModal.lesson.videoAssetId);
    }

    const currentUrl = activeLessonModal.lesson.videoUrl;
    if (currentUrl) {
      const vidId = parseYouTubeVideoId(currentUrl);
      if (vidId) {
        setVideoProviderTab("YOUTUBE");
        setYoutubeLinkInput(currentUrl);
        setYoutubeMetadata({
          videoId: vidId,
          title: activeLessonModal.lesson.title || `YouTube Video (${vidId})`,
          authorName: "YouTube Channel",
          thumbnailUrl: activeLessonModal.lesson.thumbnailUrl || `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
          embedUrl: `https://www.youtube-nocookie.com/embed/${vidId}?rel=0&modestbranding=1`,
        });
        return;
      }
    }

    // Reset YouTube form state for lessons without a YouTube video
    setYoutubeLinkInput("");
    setYoutubeMetadata(null);
    setVideoProviderTab("UPLOAD");
  }, [activeLessonModal?.moduleId, activeLessonModal?.lesson?.id]);

  // AI Lesson Assistant State
  const [aiLessonPrompt, setAiLessonPrompt] = useState("");
  const [aiLessonDifficulty, setAiLessonDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [isGeneratingLessonAi, setIsGeneratingLessonAi] = useState(false);

  const handleGenerateLessonWithAi = async (customPromptOverride?: string) => {
    if (!activeLessonModal) return;
    const promptToUse = customPromptOverride !== undefined ? customPromptOverride : aiLessonPrompt;
    setIsGeneratingLessonAi(true);

    try {
      const moduleItem = builderModules.find(m => m.id === activeLessonModal.moduleId);
      const res = await fetch("/api/ai/lesson-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: activeLessonModal.lesson.title,
          contentType: activeLessonModal.lesson.type,
          courseTitle: formData.title,
          moduleTitle: moduleItem?.title || "",
          difficulty: aiLessonDifficulty,
          customPrompt: promptToUse,
          currentData: activeLessonModal.lesson
        })
      });

      const data = await res.json();
      if (data.success && data.generated) {
        const gen = data.generated;
        setActiveLessonModal(prev => {
          if (!prev) return null;
          const updatedLesson = { ...prev.lesson };

          if (prev.lesson.type === "quiz") {
            updatedLesson.quizQuestion = gen.quizQuestion || updatedLesson.quizQuestion;
            if (Array.isArray(gen.options) && gen.options.length > 0) {
              updatedLesson.quizOptions = gen.options;
            }
            if (typeof gen.correctIndex === "number") {
              updatedLesson.quizCorrectIndex = gen.correctIndex;
            }
            if (gen.explanation) {
              updatedLesson.quizExplanation = gen.explanation;
            }
          } else if (prev.lesson.type === "article") {
            updatedLesson.content = gen.content || updatedLesson.content;
          } else if (prev.lesson.type === "sandbox") {
            updatedLesson.starterCode = gen.starterCode || updatedLesson.starterCode;
          } else if (prev.lesson.type === "video") {
            if (gen.suggestedDuration) updatedLesson.duration = gen.suggestedDuration;
            if (gen.videoUrl) updatedLesson.videoUrl = gen.videoUrl;
          } else if (prev.lesson.type === "resource") {
            if (gen.resourceFileName) updatedLesson.resourceFileName = gen.resourceFileName;
          }

          return { ...prev, lesson: updatedLesson };
        });

        showToast(`✨ AI generated ${activeLessonModal.lesson.type} content applied!`, "success");
      } else {
        showToast("Could not generate content with AI", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to AI Assistant", "error");
    } finally {
      setIsGeneratingLessonAi(false);
    }
  };

  // Publishing / Submission State
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Sync AI modules into builder modules when entering step 3
  const syncToBuilderModules = () => {
    const initialized: BuilderModule[] = aiModules.map((m, mIdx) => {
      const existing = builderModules.find(b => b.title === m.title || b.id === m.id);
      return {
        id: m.id || `mod-${mIdx + 1}`,
        title: m.title,
        isExpanded: mIdx === 0,
        lessons: existing?.lessons?.length
          ? existing.lessons
          : m.lessons.map((lessonTitle, lIdx) => ({
              id: `les-${m.id}-${lIdx + 1}`,
              title: lessonTitle,
              type: lIdx === 0 ? "video" : lIdx === 1 ? "article" : "sandbox",
              duration: "15m 00s",
              isPreview: lIdx === 0,
              content: `### Overview of ${lessonTitle}\n\nIn this lesson, you will learn the key principles and hands-on techniques for mastering ${lessonTitle}.`
            }))
      };
    });
    setBuilderModules(initialized);
  };

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Outcome management
  const addOutcome = () => {
    if (!newOutcome.trim()) return;
    setFormData(prev => ({ ...prev, outcomes: [...prev.outcomes, newOutcome.trim()] }));
    setNewOutcome("");
  };

  const removeOutcome = (index: number) => {
    setFormData(prev => ({ ...prev, outcomes: prev.outcomes.filter((_, i) => i !== index) }));
  };

  // AI Syllabus Generation
  const generateSyllabus = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiTopic || formData.title;
    if (!promptToUse.trim()) {
      showToast("Please enter a course topic to generate the syllabus.", "info");
      return;
    }

    setIsGeneratingAll(true);
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: promptToUse })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.modules && Array.isArray(data.modules)) {
          const generated: AIModuleItem[] = data.modules.map((m: any, i: number) => ({
            id: `gen-${Date.now()}-${i}`,
            title: m.title || `Module ${i + 1}`,
            lessons: m.lessons && m.lessons.length > 0 ? m.lessons : ["Overview & Concepts", "Deep Dive Lecture", "Practical Lab"],
            status: "pending"
          }));
          setAiModules(generated);
          showToast(`Generated ${generated.length} modules outline using AI Copilot!`, "success");
          return;
        }
      }

      // Intelligent Fallback if API rate limited
      generateFallbackSyllabus(promptToUse);
    } catch (e) {
      console.error(e);
      generateFallbackSyllabus(promptToUse);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const generateFallbackSyllabus = (topic: string) => {
    const fallback: AIModuleItem[] = [
      {
        id: `fb-${Date.now()}-1`,
        title: `Module 1: Introduction to ${topic}`,
        lessons: [
          `Fundamental Principles of ${topic}`,
          "Architectural Design & Core Building Blocks",
          "Setting Up the Modern Development Environment"
        ],
        status: "accepted"
      },
      {
        id: `fb-${Date.now()}-2`,
        title: `Module 2: Advanced Techniques & Implementation`,
        lessons: [
          "Hands-on Deep Dive with Real-world Code",
          "State Orchestration, Error Handling & Edge Cases",
          "Performance Optimization & Benchmarking"
        ],
        status: "pending"
      },
      {
        id: `fb-${Date.now()}-3`,
        title: `Module 3: Production Deployment & Capstone Project`,
        lessons: [
          "Deploying Scalable Infrastructure on Cloud",
          "Security Best Practices & Monitoring",
          "Comprehensive End-to-End Capstone Project"
        ],
        status: "pending"
      }
    ];
    setAiModules(fallback);
    showToast("Generated syllabus draft tailored to your topic!", "success");
  };

  // Inline Editing Functions
  const startEditingModule = (mod: AIModuleItem) => {
    setEditBuffer({
      id: mod.id,
      title: mod.title,
      lessons: mod.lessons.join("\n")
    });
    setAiModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: "editing" } : m));
  };

  const saveEditingModule = (id: string) => {
    const lessonLines = editBuffer.lessons
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0);

    setAiModules(prev => prev.map(m => m.id === id ? {
      ...m,
      title: editBuffer.title.trim() || m.title,
      lessons: lessonLines.length > 0 ? lessonLines : m.lessons,
      status: "accepted"
    } : m));

    showToast("Module changes saved successfully!", "success");
  };

  const aiAutoGenerateLessons = async () => {
    if (!editBuffer.title.trim()) {
      showToast("Please enter a module title first.", "error");
      return;
    }

    setAiGeneratingLessons(true);
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `3 detailed, hands-on lesson topics for the module: ${editBuffer.title}` })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.modules?.[0]?.lessons) {
          const generatedLessons = data.modules[0].lessons.join("\n");
          setEditBuffer(prev => ({ ...prev, lessons: generatedLessons }));
          showToast("AI generated lessons for this module!", "success");
          return;
        }
      }

      // Local fallback generator for lessons
      const fallbackLessons = [
        `Core Fundamentals of ${editBuffer.title}`,
        `Step-by-Step Architecture & Best Practices`,
        `Hands-on Workshop: Building the Solution`
      ].join("\n");
      setEditBuffer(prev => ({ ...prev, lessons: fallbackLessons }));
      showToast("AI generated suggested lessons for this module.", "success");
    } catch {
      showToast("Could not contact AI model.", "error");
    } finally {
      setAiGeneratingLessons(false);
    }
  };

  const regenerateSingleModule = async (id: string, moduleTitle: string) => {
    setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "regenerating" } : m));

    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `A single comprehensive module on ${moduleTitle} for course ${formData.title || aiTopic}` })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.modules?.[0]) {
          const rep = data.modules[0];
          setAiModules(prev => prev.map(m => m.id === id ? {
            ...m,
            title: rep.title || moduleTitle,
            lessons: rep.lessons || ["Overview", "Deep Dive", "Exercise"],
            status: "pending"
          } : m));
          showToast(`Re-rolled module "${rep.title || moduleTitle}"!`, "success");
          return;
        }
      }

      setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "pending" } : m));
    } catch {
      setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "pending" } : m));
    }
  };

  const addCustomModule = () => {
    const newMod: AIModuleItem = {
      id: `custom-mod-${Date.now()}`,
      title: `Module ${aiModules.length + 1}: Custom Curriculum Unit`,
      lessons: [
        "Module Introduction & Learning Objectives",
        "Deep Dive Theory & Technical Architecture",
        "Interactive Lab & Code Sandbox Exercise"
      ],
      status: "editing"
    };

    setAiModules(prev => [...prev, newMod]);
    setEditBuffer({
      id: newMod.id,
      title: newMod.title,
      lessons: newMod.lessons.join("\n")
    });
    showToast("Added new custom module. You can edit its title and lessons below.", "info");
  };

  const deleteModule = (id: string) => {
    setAiModules(prev => prev.filter(m => m.id !== id));
    showToast("Module removed.", "info");
  };

  const moveModule = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === aiModules.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...aiModules];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setAiModules(updated);
  };

  // Submit / Publish Course Action
  // Save / Create Course Action (Always saves as unpublished; published via Course Management)
  const handlePublishCourse = async (statusDecision: "DRAFT" | "PENDING_APPROVAL" | "CREATE_COURSE" | "PUBLISHED" = "CREATE_COURSE") => {
    if (!formData.title.trim()) {
      showToast("Please enter a course title before saving.", "error");
      setCurrentStep(1);
      return;
    }

    setIsPublishing(true);

    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description || "Comprehensive curriculum crafted with Glarus Academy AI Architect.",
        price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : 0,
        duration: formData.duration || "36 Hours",
        previewVideoUrl: formData.previewVideoUrl || null,
        category: formData.category,
        level: formData.level,
        learningOutcomes: formData.learningOutcomes,
        projects: formData.projects,
        faqs: formData.faqs,
        features: formData.features,
        learningJourney: formData.learningJourney,
        status: statusDecision === "DRAFT" ? "DRAFT" : "APPROVED",
        isPublished: false,
        instructorId: formData.instructorId,
        modules: builderModules.length > 0 ? builderModules.map((bm, idx) => ({
          title: bm.title,
          order: idx + 1,
          lessons: bm.lessons.map((l: any, lIdx: number) => ({
            title: l.title,
            type: l.type || "video",
            videoUrl: l.videoUrl || null,
            videoAssetId: l.videoAssetId || null,
            videoStatus: l.videoStatus || null,
            duration: l.duration || "15m 00s",
            description: l.description || null,
            notes: l.notes || l.description || null,
            notesContent: l.notesContent || l.notes || l.description || null,
            articleContent: l.articleContent || (l.type === "article" ? l.content : null) || null,
            imageUrl1: l.imageUrl1 || null,
            imageUrl2: l.imageUrl2 || null,
            imageCaption: l.imageCaption || null,
            sandboxLang: l.codeLanguage || l.sandboxLang || null,
            sandboxCode: l.starterCode || l.sandboxCode || null,
            starterFileName: l.starterFileName || null,
            starterFileUrl: l.starterFileUrl || null,
            quizQuestions: l.quizQuestions || (l.type === "quiz" && l.quizQuestion ? [{ question: l.quizQuestion, options: l.quizOptions, correctIndex: l.quizCorrectIndex, explanation: l.quizExplanation }] : undefined),
            resources: l.resources || (l.resourceUrl || l.resourceFileUrl ? [{
              id: `res-${lIdx}`,
              title: l.resourceFileName || l.title,
              url: l.resourceUrl || l.resourceFileUrl,
              type: l.resourceFileType || l.fileType || "PDF",
              size: l.resourceFileSize,
              description: l.resourceDescription
            }] : undefined),
            resourceFileUrl: l.resourceUrl || l.resourceFileUrl || null,
            fileType: l.resourceFileType || l.fileType || null,
            order: lIdx + 1
          }))
        })) : aiModules.map((am, idx) => ({
          title: am.title,
          order: idx + 1,
          lessons: am.lessons.map((lt, lIdx) => ({
            title: lt,
            order: lIdx + 1
          }))
        }))
      };

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(
          statusDecision === "DRAFT"
            ? "💾 Course saved to drafts successfully."
            : "✅ Course created! Go to Course Management to publish and position it on the landing page.",
          "success"
        );

        setTimeout(() => {
          router.push("/admin/courses");
        }, 1200);
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save course", "error");
      }
    } catch (e: any) {
      console.error(e);
      showToast("Network error occurred while saving course.", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const steps = [
    { num: 1, title: "Course Details", desc: "Basic Info & Metadata", icon: FileText },
    { num: 2, title: "AI Syllabus Copilot", desc: "Modules & Curriculum", icon: Sparkles },
    { num: 3, title: "Content Builder", desc: "Lessons & Media Assets", icon: Video },
    { num: 4, title: "Publish & Governance", desc: "Admin Review & Live Push", icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-background text-text selection:bg-purple-500/30 pb-20">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 text-sm font-bold ${
            toastMessage.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10"
              : toastMessage.type === "error"
              ? "bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-rose-500/10"
              : "bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-purple-500/10"
          }`}>
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-purple-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER & BREADCRUMB */}
      <div className="border-b border-white/10 bg-card/60 backdrop-blur-xl sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/courses"
              className="p-2 rounded-xl bg-background/80 hover:bg-white/10 text-subtext hover:text-text border border-white/10 transition-colors"
              title="Back to Courses"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtext">
                <Link href="/admin" className="hover:text-purple-400">Admin</Link>
                <span>/</span>
                <Link href="/admin/courses" className="hover:text-purple-400">Courses</Link>
                <span>/</span>
                <span className="text-purple-400">Create Course</span>
              </div>
              <h1 className="text-xl font-extrabold text-text flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Create Course</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI-Powered
                </span>
              </h1>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handlePublishCourse("DRAFT")}
              disabled={isPublishing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-subtext hover:text-text bg-card hover:bg-white/5 border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handlePublishCourse("CREATE_COURSE")}
              disabled={isPublishing || !formData.title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Course</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {!formatSelected ? (
          <div className="max-w-4xl mx-auto py-6 space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Course Creation Studio</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-text tracking-tight">
                What type of course do you want to create?
              </h1>
              <p className="text-xs sm:text-sm text-subtext max-w-xl mx-auto">
                Select your delivery model below to configure your syllabus, pricing, and learning studio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Option 1: Self-Paced Video Course */}
              <div
                onClick={() => {
                  setFormData({ ...formData, courseType: "SELF_PACED" });
                  setFormatSelected(true);
                  setCurrentStep(1);
                }}
                className="group relative p-6 sm:p-8 rounded-3xl bg-card/80 hover:bg-card border-2 border-white/10 hover:border-purple-500/60 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 shadow-xl backdrop-blur-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">
                      On-Demand Video
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-md">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-text group-hover:text-purple-400 transition-colors">
                      Self-Paced Course
                    </h3>
                    <p className="text-xs text-subtext mt-2 leading-relaxed">
                      Upload video masterclasses, create interactive Python code sandboxes, attach technical PDF blueprints, and build modular quizzes.
                    </p>
                  </div>

                  <ul className="space-y-2.5 pt-3 border-t border-white/10 text-xs text-subtext">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>AI Copilot Syllabus & Module Generator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Video Lectures with Cloud Video Player</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Live Python Code Sandbox & Diagnostics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Technical Blueprint PDFs & Quizzes</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <div className="w-full py-3.5 px-4 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all">
                    <span>Build Self-Paced Course</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Option 2: Live Bootcamp / Cohort */}
              <div
                onClick={() => router.push("/admin/live-training/create")}
                className="group relative p-6 sm:p-8 rounded-3xl bg-card/80 hover:bg-card border-2 border-white/10 hover:border-emerald-500/60 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 shadow-xl backdrop-blur-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Cohort
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-md">
                      <Radio className="w-6 h-6" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-text group-hover:text-emerald-400 transition-colors">
                      Live Bootcamp
                    </h3>
                    <p className="text-xs text-subtext mt-2 leading-relaxed">
                      Launch interactive live programs with scheduled Zoom classrooms, batch rosters, attendance tracking, and live assignments.
                    </p>
                  </div>

                  <ul className="space-y-2.5 pt-3 border-t border-white/10 text-xs text-subtext">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Live Zoom & WebRTC Classrooms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Cohort Schedules & Multi-Batch Rosters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Automated Attendance & Recording Progress</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Live Mentored Homework & Defenses</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <div className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all">
                    <span>Launch Live Bootcamp</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">

            {/* LEFT STEPPER COLUMN (4 cols) */}
            <aside className="lg:col-span-3 space-y-6">
              <div className="bg-card/70 border border-white/10 rounded-3xl p-6 shadow-xl sticky top-24 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-subtext">Workflow Steps</p>
                  <button
                    type="button"
                    onClick={() => setFormatSelected(false)}
                    className="text-[10px] font-bold text-purple-400 hover:underline cursor-pointer"
                  >
                    Change Format
                  </button>
                </div>
                
                <div className="space-y-4 relative">
                  {/* Connecting Line */}
                  <div className="absolute left-[19px] top-4 bottom-8 w-0.5 bg-white/10" />

                  {steps.map((step) => {
                    const isActive = currentStep === step.num;
                    const isCompleted = step.num < currentStep;

                    return (
                      <button
                        key={step.num}
                        onClick={() => {
                          if (step.num === 3 && builderModules.length === 0) {
                            syncToBuilderModules();
                          }
                          setCurrentStep(step.num);
                        }}
                        className={`flex items-start gap-3.5 w-full text-left transition-all relative z-10 group ${
                          isActive ? "opacity-100" : isCompleted ? "opacity-80" : "opacity-45"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all shadow-md ${
                          isActive
                            ? "border-purple-500 bg-purple-500/20 text-purple-300 scale-105 ring-4 ring-purple-500/20 shadow-purple-500/20"
                            : isCompleted
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                            : "border-white/10 bg-background text-subtext group-hover:border-white/20"
                        }`}>
                          {isCompleted ? (
                            <Check className="w-5 h-5 font-bold" />
                          ) : (
                            <step.icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                          )}
                        </div>

                        <div className="pt-1 min-w-0">
                          <span className={`text-[10px] font-black uppercase tracking-widest block ${
                            isActive ? "text-purple-400" : isCompleted ? "text-emerald-400" : "text-subtext"
                          }`}>
                            Step {step.num}
                          </span>
                          <h4 className={`text-xs font-bold truncate ${isActive ? "text-text" : "text-subtext group-hover:text-text"}`}>
                            {step.title}
                          </h4>
                          <p className="text-[10px] text-subtext/70 truncate">{step.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Course Governance Workflow Card */}
                <div className="mt-8 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-xs text-purple-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Course Governance</span>
                  </div>
                  <p className="text-[11px] text-purple-200/80 leading-relaxed">
                    Created courses are saved safely as unpublished in Course Management. You can review and click Publish in Course Management to make it live and assign its landing page position.
                  </p>
                </div>
              </div>
            </aside>

            {/* RIGHT CONTENT COLUMN (9 cols) */}
            <main className="lg:col-span-9 space-y-6">

              {/* ══════════════════════════════════════════
                 STEP 1: COURSE DETAILS & ADMIN CONTROLS
                 ══════════════════════════════════════════ */}
              {currentStep === 1 && (
                <div className="bg-card/70 border border-white/10 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Step 1 of 4</span>
                      <h2 className="text-2xl font-black text-text mt-1">Course Details</h2>
                      <p className="text-xs text-subtext">Basic Info & Metadata — Configure catalog metadata, pricing tier, instructor attribution, and delivery mode.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormatSelected(false)}
                      className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-subtext hover:text-text transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Change Format</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Delivery Format (First Option) */}
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-text">Delivery Format</label>
                        <button
                          type="button"
                          onClick={() => setFormatSelected(false)}
                          className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Switch Format
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, courseType: "SELF_PACED" })}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            formData.courseType === "SELF_PACED"
                              ? "bg-purple-500/15 border-purple-500 text-purple-300 ring-2 ring-purple-500/20 shadow-md shadow-purple-500/10"
                              : "bg-background/50 border-white/10 text-subtext hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                            <span className="text-white">Self-Paced</span>
                          </div>
                          <span className="text-[11px] text-subtext block mt-1">On-demand video & labs</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => router.push("/admin/live-training/create")}
                          className="p-3.5 rounded-2xl border border-white/10 bg-background/50 hover:bg-card hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 font-bold text-xs text-text group-hover:text-emerald-300">
                            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                            <span className="text-white group-hover:text-emerald-300">Live Bootcamp ↗</span>
                          </div>
                          <span className="text-[11px] text-subtext block mt-1">Cohort live classes</span>
                        </button>
                      </div>
                    </div>

                  {/* Course Title */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-text">
                      Course Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => {
                        setFormData({ ...formData, title: e.target.value });
                        if (!aiTopic) setAiTopic(e.target.value);
                      }}
                      placeholder="e.g. Master Autonomous Multi-Agent AI & LangGraph"
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-text placeholder:text-subtext/50 outline-none transition-all focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-text">Subtitle / Headline</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="e.g. Build production-ready multi-agent workflows, stateful graphs, and evaluation loops."
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs font-medium text-text placeholder:text-subtext/50 outline-none transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs font-bold text-text outline-none"
                    >
                      <option value="Artificial Intelligence">Artificial Intelligence & LLMs</option>
                      <option value="Web Development">Full-Stack Web Development</option>
                      <option value="Cloud & DevOps">Cloud Infrastructure & DevOps</option>
                      <option value="Data Science & ML">Data Science & Machine Learning</option>
                      <option value="Cyber Security">Cyber Security & Ethical Hacking</option>
                      <option value="Mobile Development">Mobile App Development</option>
                    </select>
                  </div>

                  {/* Skill Level */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text">Skill Level</label>
                    <select
                      value={formData.level}
                      onChange={e => setFormData({ ...formData, level: e.target.value })}
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs font-bold text-text outline-none"
                    >
                      <option value="All Levels">All Levels (Zero to Hero)</option>
                      <option value="Beginner">Beginner Friendly</option>
                      <option value="Intermediate">Intermediate Practitioner</option>
                      <option value="Advanced">Advanced / Enterprise</option>
                    </select>
                  </div>

                  {/* Pricing (INR ₹) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text">Price (₹ INR) <span className="text-rose-400">*</span></label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        disabled={formData.isFree}
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        placeholder="2499"
                        className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-text outline-none disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Original / Strikethrough Price */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-text">Original Price (₹ INR)</label>
                      {formData.originalPrice && formData.price && !formData.isFree && (
                        <span className="text-[10px] font-black uppercase text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                          {Math.max(0, Math.round((1 - (parseFloat(formData.price) || 0) / (parseFloat(formData.originalPrice) || 1)) * 100))}% OFF
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="4999"
                        className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-text outline-none"
                      />
                    </div>
                  </div>

                  {/* Structured Duration Builder (Strictly Validated for Hours, Minutes, Days, Weeks, Months) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-text">Course Duration</label>
                      <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                        {formData.duration || "0 Hours"}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      {/* Numeric Value Input */}
                      <div className="col-span-5">
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={
                            formData.duration
                              ? (formData.duration.match(/\d+(\.\d+)?/)?.[0] || "")
                              : ""
                          }
                          onChange={(e) => {
                            const num = e.target.value;
                            const currentUnit = formData.duration
                              ? formData.duration.replace(/^\d+(\.\d+)?\s*/, "").trim() || "Hours"
                              : "Hours";
                            setFormData({
                              ...formData,
                              duration: num ? `${num} ${currentUnit}` : ""
                            });
                          }}
                          placeholder="e.g. 36"
                          className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs font-bold text-text outline-none"
                        />
                      </div>

                      {/* Time Unit Dropdown */}
                      <div className="col-span-7">
                        <select
                          value={(() => {
                            if (!formData.duration) return "Hours";
                            const unitPart = formData.duration.replace(/^\d+(\.\d+)?\s*/, "").trim();
                            return unitPart || "Hours";
                          })()}
                          onChange={(e) => {
                            const newUnit = e.target.value;
                            const currentNum = formData.duration
                              ? (formData.duration.match(/\d+(\.\d+)?/)?.[0] || "36")
                              : "36";
                            setFormData({
                              ...formData,
                              duration: `${currentNum} ${newUnit}`
                            });
                          }}
                          className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-3 py-3 text-xs font-bold text-purple-300 outline-none cursor-pointer"
                        >
                          <option value="Hours">Hours (e.g. 36 Hours)</option>
                          <option value="Minutes">Minutes (e.g. 45 Minutes)</option>
                          <option value="Days">Days (e.g. 15 Days)</option>
                          <option value="Weeks">Weeks (e.g. 6 Weeks)</option>
                          <option value="Months">Months (e.g. 3 Months)</option>
                          <option value="Live Sessions">Live Sessions (e.g. 12 Live Sessions)</option>
                          <option value="Modules">Modules (e.g. 8 Modules)</option>
                        </select>
                      </div>
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-subtext font-bold uppercase tracking-wider">Presets:</span>
                      {[
                        "10 Hours",
                        "36 Hours",
                        "60 Hours",
                        "4 Weeks",
                        "6 Weeks",
                        "30 Days",
                        "3 Months"
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormData({ ...formData, duration: preset })}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold transition-all ${
                            formData.duration === preset
                              ? "bg-purple-600/30 border-purple-500 text-purple-200 font-bold"
                              : "bg-white/5 hover:bg-white/10 border-white/5 text-subtext hover:text-text"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview Video URL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text">Preview Video URL</label>
                    <input
                      type="text"
                      value={formData.previewVideoUrl}
                      onChange={e => setFormData({ ...formData, previewVideoUrl: e.target.value })}
                      placeholder="https://...mp4 or embed video URL"
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs font-mono text-text outline-none"
                    />
                  </div>

                  {/* Instructor Assignment (Admin Feature) */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-text">Assigned Instructor Attribution</label>
                    <select
                      value={formData.instructorId}
                      onChange={e => {
                        const sel = instructorList.find(i => i.id === e.target.value);
                        setFormData({
                          ...formData,
                          instructorId: e.target.value,
                          instructorName: sel ? sel.name : "Glarus Academy Admin"
                        });
                      }}
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs font-bold text-text outline-none"
                    >
                      {instructorList.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name} ({inst.title})</option>
                      ))}
                    </select>
                  </div>

                  {/* Course Description */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-text">Course Description & Curriculum Vision</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detail what students will achieve, key takeaways, and project deliverables..."
                      className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl p-4 text-xs text-text font-medium outline-none leading-relaxed"
                    />
                  </div>

                  {/* ══════════════════════════════════════════════════════════════
                      🌟 LANDING PAGE SHOWCASE STUDIO (WHAT YOU'LL LEARN, PROJECTS, FAQS)
                      ══════════════════════════════════════════════════════════════ */}
                  <div className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-purple-950/20 border border-purple-500/30 space-y-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
                          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-text">Landing Page Showcase Studio</h3>
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase tracking-wider">
                              Public /course/[id]
                            </span>
                          </div>
                          <p className="text-[11px] text-subtext mt-0.5">
                            Manage rich competency cards, real-world projects, FAQs, and feature bullets shown on the course landing page.
                          </p>
                        </div>
                      </div>

                      {/* ✨ Auto-Generate All Landing Content with AI */}
                      <button
                        type="button"
                        onClick={handleAutoGenerateLanding}
                        disabled={isGeneratingLanding || (!formData.title && !aiTopic)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all hover:scale-105 active:scale-95 shrink-0"
                      >
                        {isGeneratingLanding ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Generating Showcase...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>✨ AI Auto-Generate Showcase</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Showcase Sub-Tabs */}
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
                      {[
                        { id: "outcomes", label: `What You'll Learn (${formData.learningOutcomes.length})`, icon: Award },
                        { id: "projects", label: `Real-World Projects (${formData.projects.length})`, icon: Code },
                        { id: "faqs", label: `FAQs (${formData.faqs.length})`, icon: HelpCircle },
                        { id: "features", label: `Course Features (${formData.features.length})`, icon: CheckCircle2 }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setLandingTab(tab.id as any)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
                            landingTab === tab.id
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                              : "text-subtext hover:text-text hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          <tab.icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* TAB 1: WHAT YOU'LL LEARN (6 Competency Cards) */}
                    {landingTab === "outcomes" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-subtext">
                            These 6 cards render on the public landing page under <strong>&quot;What You&apos;ll Learn&quot;</strong>.
                          </p>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              learningOutcomes: [...prev.learningOutcomes, { title: "New Core Competency", description: "Detailed description of technical mastery." }]
                            }))}
                            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Competency Card
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {formData.learningOutcomes.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-background/80 border border-white/10 hover:border-purple-500/30 transition-all space-y-2 relative group">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
                                  Card #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== idx)
                                  }))}
                                  className="text-subtext hover:text-rose-400 transition-colors p-1"
                                  title="Delete Card"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={item.title}
                                onChange={e => {
                                  const updated = [...formData.learningOutcomes];
                                  updated[idx].title = e.target.value;
                                  setFormData({ ...formData, learningOutcomes: updated });
                                }}
                                placeholder="Competency Title..."
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-purple-500"
                              />
                              <textarea
                                rows={2}
                                value={item.description}
                                onChange={e => {
                                  const updated = [...formData.learningOutcomes];
                                  updated[idx].description = e.target.value;
                                  setFormData({ ...formData, learningOutcomes: updated });
                                }}
                                placeholder="Competency description..."
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs text-subtext outline-none focus:border-purple-500 leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 2: REAL-WORLD PROJECTS (4 Portfolio Deliverables) */}
                    {landingTab === "projects" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-subtext">
                            These project cards render under <strong>&quot;Real-World Projects Included&quot;</strong>.
                          </p>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              projects: [...prev.projects, {
                                number: String(prev.projects.length + 1).padStart(2, "0"),
                                title: "New Capstone Project",
                                desc: "Comprehensive full-stack architecture project.",
                                tech: ["Python", "FastAPI", "Docker"]
                              }]
                            }))}
                            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Project Card
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {formData.projects.map((proj, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-background/80 border border-white/10 hover:border-purple-500/30 transition-all space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-mono font-black text-purple-400">
                                  Project {proj.number || String(idx + 1).padStart(2, "0")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    projects: prev.projects.filter((_, i) => i !== idx)
                                  }))}
                                  className="text-subtext hover:text-rose-400 transition-colors p-1"
                                  title="Delete Project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={proj.title}
                                onChange={e => {
                                  const updated = [...formData.projects];
                                  updated[idx].title = e.target.value;
                                  setFormData({ ...formData, projects: updated });
                                }}
                                placeholder="Project Title..."
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-purple-500"
                              />
                              <textarea
                                rows={2}
                                value={proj.desc}
                                onChange={e => {
                                  const updated = [...formData.projects];
                                  updated[idx].desc = e.target.value;
                                  setFormData({ ...formData, projects: updated });
                                }}
                                placeholder="Project description and deliverables..."
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs text-subtext outline-none focus:border-purple-500 leading-relaxed"
                              />
                              <div>
                                <label className="block text-[10px] font-bold text-subtext uppercase mb-1">Tech Stack (comma separated)</label>
                                <input
                                  type="text"
                                  value={Array.isArray(proj.tech) ? proj.tech.join(", ") : ""}
                                  onChange={e => {
                                    const updated = [...formData.projects];
                                    updated[idx].tech = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                                    setFormData({ ...formData, projects: updated });
                                  }}
                                  placeholder="e.g. Python, LangGraph, FastAPI, Docker"
                                  className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-text outline-none focus:border-purple-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: FREQUENTLY ASKED QUESTIONS */}
                    {landingTab === "faqs" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-subtext">
                            These Q&A accordions render under <strong>&quot;Frequently Asked Questions&quot;</strong>.
                          </p>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              faqs: [...prev.faqs, { q: "New Question?", a: "Detailed answer explaining policies or prerequisites." }]
                            }))}
                            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                          </button>
                        </div>

                        <div className="space-y-3">
                          {formData.faqs.map((faq, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-background/80 border border-white/10 hover:border-purple-500/30 transition-all space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black uppercase text-purple-400">FAQ #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    faqs: prev.faqs.filter((_, i) => i !== idx)
                                  }))}
                                  className="text-subtext hover:text-rose-400 transition-colors p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={faq.q}
                                onChange={e => {
                                  const updated = [...formData.faqs];
                                  updated[idx].q = e.target.value;
                                  setFormData({ ...formData, faqs: updated });
                                }}
                                placeholder="Question..."
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-purple-500"
                              />
                              <textarea
                                rows={2}
                                value={faq.a}
                                onChange={e => {
                                  const updated = [...formData.faqs];
                                  updated[idx].a = e.target.value;
                                  setFormData({ ...formData, faqs: updated });
                                }}
                                placeholder="Answer..."
                                className="w-full bg-card border border-white/10 rounded-xl px-3 py-1.5 text-xs text-subtext outline-none focus:border-purple-500 leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 4: THIS COURSE INCLUDES CHECKLIST */}
                    {landingTab === "features" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <p className="text-xs text-subtext">
                          These features render in the sticky purchase box under <strong>&quot;This Course Includes&quot;</strong>.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {formData.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2.5 bg-background/80 border border-white/10 rounded-xl">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <input
                                type="text"
                                value={feat}
                                onChange={e => {
                                  const updated = [...formData.features];
                                  updated[idx] = e.target.value;
                                  setFormData({ ...formData, features: updated });
                                }}
                                className="flex-1 bg-transparent text-xs text-text font-medium outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  features: prev.features.filter((_, i) => i !== idx)
                                }))}
                                className="text-subtext hover:text-rose-400 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            features: [...prev.features, "Lifetime access to course materials"]
                          }))}
                          className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 pt-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Feature Bullet
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 💼 Internship Availability & Career Placement Section */}
                  <div className="md:col-span-2 p-5 rounded-3xl bg-gradient-to-br from-card via-card/90 to-purple-950/20 border border-white/10 space-y-4 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-text">Industry Internship Program</h3>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                              Career Perk
                            </span>
                          </div>
                          <p className="text-[11px] text-subtext mt-0.5">
                            Offer direct industry project internship or research placement upon course completion.
                          </p>
                        </div>
                      </div>

                      {/* Internship Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer select-none self-start sm:self-auto">
                        <input
                          type="checkbox"
                          checked={formData.hasInternship}
                          onChange={(e) => setFormData({ ...formData, hasInternship: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 border border-white/10" />
                        <span className="ml-2.5 text-xs font-bold text-text">
                          {formData.hasInternship ? "Internship Included" : "No Internship"}
                        </span>
                      </label>
                    </div>

                    {/* Expandable Internship Configuration */}
                    {formData.hasInternship && (
                      <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Internship Track / Model */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text">Internship Opportunity Model *</label>
                          <select
                            value={formData.internshipType}
                            onChange={(e) => setFormData({ ...formData, internshipType: e.target.value })}
                            className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-text outline-none"
                          >
                            <option value="Guaranteed Internship (Post-Completion)">Guaranteed Internship (Post-Completion)</option>
                            <option value="Performance-Based Internship (Top 20% Performers)">Performance-Based Internship (Top 20% Performers)</option>
                            <option value="Direct Project Internship with Partner Startups">Direct Project Internship with Partner Startups</option>
                            <option value="Virtual AI Research & Engineering Lab">Virtual AI Research & Engineering Lab</option>
                            <option value="Paid Industry Fellowship">Paid Industry Fellowship</option>
                          </select>
                        </div>

                        {/* Internship Duration */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text">Internship Duration</label>
                          <select
                            value={formData.internshipDuration}
                            onChange={(e) => setFormData({ ...formData, internshipDuration: e.target.value })}
                            className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-text outline-none"
                          >
                            <option value="1 Month (Sprint)">1 Month (Sprint)</option>
                            <option value="2 Months (Standard)">2 Months (Standard)</option>
                            <option value="3 Months (Comprehensive)">3 Months (Comprehensive)</option>
                            <option value="6 Months (Co-Op Fellowship)">6 Months (Co-Op Fellowship)</option>
                          </select>
                        </div>

                        {/* Internship Stipend / Compensation */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text">Stipend / Perks Offered</label>
                          <input
                            type="text"
                            value={formData.internshipStipend}
                            onChange={(e) => setFormData({ ...formData, internshipStipend: e.target.value })}
                            placeholder="e.g. Paid (₹15,000/mo) or Certificate + Verified LOR"
                            className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-3.5 py-2.5 text-xs text-text outline-none"
                          />
                        </div>

                        {/* Partner Companies / Hiring Network */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text">Partner Companies / Hiring Network</label>
                          <input
                            type="text"
                            value={formData.internshipCompanyPartner}
                            onChange={(e) => setFormData({ ...formData, internshipCompanyPartner: e.target.value })}
                            placeholder="e.g. Partner AI Startups & Tech Incubators"
                            className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl px-3.5 py-2.5 text-xs text-text outline-none"
                          />
                        </div>

                        {/* Internship Scope & Eligibility */}
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-xs font-bold text-text">Internship Scope & Eligibility Criteria</label>
                          <textarea
                            rows={2}
                            value={formData.internshipDescription}
                            onChange={(e) => setFormData({ ...formData, internshipDescription: e.target.value })}
                            placeholder="Detail requirements for students to qualify (e.g. 75%+ project score, capstone review, etc.)..."
                            className="w-full bg-background border border-white/10 focus:border-purple-500 rounded-2xl p-3 text-xs text-text outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-end pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (!formData.title.trim()) {
                        showToast("Please enter a course title.", "error");
                        return;
                      }
                      if (!aiTopic) setAiTopic(formData.title);
                      setCurrentStep(2);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-purple-500/25 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span>Proceed to AI Syllabus Copilot</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
               STEP 2: AI SYLLABUS ARCHITECTURE COPILOT
               ══════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* AI Copilot Prompt Bar */}
                <div className="bg-card/80 border-2 border-purple-500/30 rounded-3xl p-3 pl-6 flex flex-col md:flex-row items-center gap-3 focus-within:border-purple-500 focus-within:shadow-[0_0_35px_-5px_rgba(168,85,247,0.3)] transition-all shadow-xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 w-full">
                    <Sparkles className="w-6 h-6 text-purple-400 shrink-0 animate-pulse" />
                    <input
                      value={aiTopic}
                      onChange={e => setAiTopic(e.target.value)}
                      placeholder="Describe what to architect... e.g. Advanced AI Agents, LangGraph & Autonomous Workflows"
                      className="w-full bg-transparent outline-none text-text text-sm md:text-base font-semibold placeholder:text-subtext/50"
                      onKeyDown={e => e.key === "Enter" && generateSyllabus()}
                    />
                  </div>
                  <button
                    onClick={() => generateSyllabus()}
                    disabled={isGeneratingAll || (!aiTopic && !formData.title)}
                    className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white px-7 py-3 rounded-2xl font-black text-xs md:text-sm transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    {isGeneratingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Generate AI Syllabus</span>
                  </button>
                </div>

                {/* Prompt Suggestion Chips */}
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                  <span className="text-[10px] font-black uppercase text-subtext/70 shrink-0">Quick Prompts:</span>
                  {PROMPT_SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiTopic(sug);
                        generateSyllabus(sug);
                      }}
                      className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/5 hover:bg-purple-500/20 text-subtext hover:text-purple-300 border border-white/10 hover:border-purple-500/30 whitespace-nowrap transition-all"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Modules Overview Bar */}
                <div className="flex items-center justify-between px-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-subtext">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>{aiModules.length} Modules in Syllabus Draft</span>
                    <span className="text-emerald-400">
                      ({aiModules.filter(m => m.status === "accepted").length} Accepted)
                    </span>
                  </div>

                  <button
                    onClick={addCustomModule}
                    className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Module</span>
                  </button>
                </div>

                {/* MODULE CARDS LIST */}
                <div className="space-y-4">
                  {aiModules.map((mod, modIdx) => (
                    <div
                      key={mod.id}
                      className={`rounded-3xl border-2 transition-all p-6 relative overflow-hidden bg-card/70 backdrop-blur-xl shadow-xl ${
                        mod.status === "accepted"
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : mod.status === "editing"
                          ? "border-purple-500 ring-4 ring-purple-500/15"
                          : mod.status === "regenerating"
                          ? "border-amber-500/50 opacity-70"
                          : "border-white/10 hover:border-purple-500/30"
                      }`}
                    >
                      {/* Regenerating Overlay */}
                      {mod.status === "regenerating" && (
                        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-20">
                          <div className="flex flex-col items-center text-amber-400">
                            <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                            <span className="font-bold text-xs">AI Architecting Module...</span>
                          </div>
                        </div>
                      )}

                      {/* EDIT MODE UI */}
                      {mod.status === "editing" ? (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <span className="text-xs font-black uppercase text-purple-400 tracking-widest flex items-center gap-2">
                              <Edit3 className="w-4 h-4" /> Edit Module #{modIdx + 1}
                            </span>

                            {/* ✨ AI Auto-Generate Lessons Button */}
                            <button
                              type="button"
                              onClick={aiAutoGenerateLessons}
                              disabled={aiGeneratingLessons}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                              title="Auto-generate detailed lessons with AI"
                            >
                              {aiGeneratingLessons ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                              )}
                              <span>✨ AI Auto-Draft Lessons</span>
                            </button>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-subtext mb-1">Module Title</label>
                            <input
                              value={editBuffer.title}
                              onChange={e => setEditBuffer({ ...editBuffer, title: e.target.value })}
                              className="w-full text-base font-bold bg-background border border-white/10 rounded-xl px-4 py-2.5 text-text outline-none focus:border-purple-500"
                              placeholder="Module Title..."
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-subtext mb-1">
                              Lessons Breakdown (One per line)
                            </label>
                            <textarea
                              value={editBuffer.lessons}
                              onChange={e => setEditBuffer({ ...editBuffer, lessons: e.target.value })}
                              rows={4}
                              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-text text-xs outline-none font-mono focus:border-purple-500 leading-relaxed"
                              placeholder="Introduction to Topic&#10;Architecture Deep Dive&#10;Hands-on Implementation"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                            <button
                              onClick={() => setAiModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: "pending" } : m))}
                              className="px-5 py-2 rounded-xl text-xs font-bold text-subtext hover:bg-white/5"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEditingModule(mod.id)}
                              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
                            >
                              <Save className="w-3.5 h-3.5" /> Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* DISPLAY MODE UI */
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {mod.status === "accepted" ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              ) : (
                                <Layout className="w-5 h-5 text-purple-400/80 shrink-0" />
                              )}
                              <h3 className="text-base md:text-lg font-bold text-text">{mod.title}</h3>
                            </div>

                            <div className="pl-8 space-y-2">
                              {mod.lessons.map((lesson, lIdx) => (
                                <div key={lIdx} className="flex items-start gap-2.5 group/lesson">
                                  <PlayCircle className="w-3.5 h-3.5 text-subtext/40 mt-0.5 group-hover/lesson:text-purple-400 transition-colors" />
                                  <span className="text-xs font-medium text-text/85 leading-snug">{lesson}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons Column */}
                          <div className="md:w-32 flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-5 justify-center">
                            <button
                              onClick={() => setAiModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: "accepted" } : m))}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                mod.status === "accepted"
                                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                                  : "bg-background hover:bg-emerald-500/10 text-subtext hover:text-emerald-400 border-white/10 hover:border-emerald-500/30"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" /> Accept
                            </button>

                            <button
                              onClick={() => startEditingModule(mod)}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-background border border-white/10 hover:bg-purple-500/10 text-subtext hover:text-purple-300 hover:border-purple-500/30 transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>

                            <button
                              onClick={() => regenerateSingleModule(mod.id, mod.title)}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-background border border-white/10 hover:bg-amber-500/10 text-subtext hover:text-amber-400 hover:border-amber-500/30 transition-all"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Re-roll
                            </button>

                            <div className="flex gap-1 pt-1">
                              <button
                                onClick={() => moveModule(modIdx, "up")}
                                disabled={modIdx === 0}
                                className="flex-1 py-1 bg-background border border-white/10 rounded-lg text-subtext hover:text-text disabled:opacity-30 flex items-center justify-center"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveModule(modIdx, "down")}
                                disabled={modIdx === aiModules.length - 1}
                                className="flex-1 py-1 bg-background border border-white/10 rounded-lg text-subtext hover:text-text disabled:opacity-30 flex items-center justify-center"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteModule(mod.id)}
                                className="flex-1 py-1 bg-background border border-white/10 hover:bg-rose-500/20 text-subtext hover:text-rose-400 rounded-lg flex items-center justify-center"
                                title="Delete Module"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Add Module Full-Width Bar */}
                <button
                  onClick={addCustomModule}
                  className="w-full py-4 bg-card/40 hover:bg-purple-500/10 text-purple-300 border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-3xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Additional Module to Syllabus</span>
                </button>

                {/* Bottom Approve & Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 rounded-2xl text-xs font-bold text-subtext hover:text-text bg-card border border-white/10"
                  >
                    ← Back to Basic Info
                  </button>

                  <button
                    onClick={() => {
                      syncToBuilderModules();
                      setCurrentStep(3);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-purple-500/25 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span>Approve Syllabus & Build Content</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
               STEP 3: CONTENT & LESSON ASSET BUILDER
               ══════════════════════════════════════════ */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-card/70 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Step 3 of 4</span>
                    <h2 className="text-xl font-black text-text mt-0.5">Lesson Assets & Rich Media</h2>
                    <p className="text-xs text-subtext">Attach video lectures, interactive coding sandboxes, quizzes, and downloadable files.</p>
                  </div>

                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
                  >
                    <span>Proceed to Final Review</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Modules Accordion List */}
                <div className="space-y-4">
                  {builderModules.map((bMod, mIdx) => (
                    <div key={bMod.id} className="bg-card/70 border border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
                      {/* Module Header Bar */}
                      <div
                        onClick={() => setBuilderModules(prev => prev.map(m => m.id === bMod.id ? { ...m, isExpanded: !m.isExpanded } : m))}
                        className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-xs">
                            {mIdx + 1}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-text">{bMod.title}</h4>
                            <span className="text-[10px] font-bold text-subtext uppercase tracking-wider">
                              {bMod.lessons.length} Lessons Configured
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newLesson: LessonContent = {
                                id: `les-${bMod.id}-${Date.now()}`,
                                title: `Lesson ${bMod.lessons.length + 1}: New Topic`,
                                type: "video",
                                duration: "12m 00s"
                              };
                              setBuilderModules(prev => prev.map(m => m.id === bMod.id ? { ...m, lessons: [...m.lessons, newLesson], isExpanded: true } : m));
                              setActiveLessonModal({ moduleId: bMod.id, lesson: newLesson });
                            }}
                            className="px-3 py-1.5 bg-white/5 hover:bg-purple-500/20 text-subtext hover:text-purple-300 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Lesson</span>
                          </button>
                          {bMod.isExpanded ? <ChevronDown className="w-5 h-5 text-subtext" /> : <ChevronRight className="w-5 h-5 text-subtext" />}
                        </div>
                      </div>

                      {/* Expanded Lessons Content */}
                      {bMod.isExpanded && (
                        <div className="p-5 border-t border-white/10 space-y-2.5 bg-background/40">
                          {bMod.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-3.5 bg-card/90 border border-white/5 rounded-2xl flex items-center justify-between gap-4 hover:border-purple-500/30 transition-all group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  lesson.type === "video"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : lesson.type === "article"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : lesson.type === "quiz"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : lesson.type === "sandbox"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/20 text-rose-400"
                                }`}>
                                  {lesson.type === "video" && <Video className="w-4 h-4" />}
                                  {lesson.type === "article" && <FileText className="w-4 h-4" />}
                                  {lesson.type === "quiz" && <HelpCircle className="w-4 h-4" />}
                                  {lesson.type === "sandbox" && <Code className="w-4 h-4" />}
                                  {lesson.type === "resource" && <Download className="w-4 h-4" />}
                                </div>

                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-text block truncate">{lesson.title}</span>
                                  <div className="flex items-center flex-wrap gap-2 text-[10px] text-subtext">
                                    <span className="uppercase font-semibold text-purple-400">{lesson.type}</span>
                                    <span>•</span>
                                    <span>{lesson.duration || "15m"}</span>
                                    {lesson.type === "video" && (
                                      <>
                                        <span>•</span>
                                        {lesson.videoStatus === "READY" || (lesson.videoUrl && lesson.videoStatus !== "PROCESSING") ? (
                                          <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                            {lesson.videoUrl?.includes("youtube") || lesson.videoUrl?.includes("youtu.be") ? "YouTube 1080p ✓" : "Bunny HLS ✓"}
                                          </span>
                                        ) : lesson.videoStatus === "PROCESSING" ? (
                                          <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30 animate-pulse">
                                            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Transcoding
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 font-medium">No video attached</span>
                                        )}
                                      </>
                                    )}
                                    {lesson.type === "article" && (
                                      <>
                                        <span>•</span>
                                        {(lesson.content || lesson.articleContent) ? (
                                          <span className="text-blue-300 font-bold flex items-center gap-1 bg-blue-500/15 px-1.5 py-0.5 rounded border border-blue-500/30">
                                            <CheckCircle2 className="w-2.5 h-2.5" /> Markdown Content Ready
                                            {lesson.imageUrl1 && <span className="text-purple-300 ml-0.5">+ Diagram</span>}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 font-medium">Empty article</span>
                                        )}
                                      </>
                                    )}
                                    {lesson.type === "sandbox" && (
                                      <>
                                        <span>•</span>
                                        {(lesson.starterCode || lesson.starterFileName) ? (
                                          <span className="text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                            <CheckCircle2 className="w-2.5 h-2.5" /> {lesson.codeLanguage || "Code Lab"} Ready
                                            {lesson.starterFileName && <span className="text-emerald-400 ml-0.5">📦 Zip</span>}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 font-medium">No code template</span>
                                        )}
                                      </>
                                    )}
                                    {lesson.type === "resource" && (
                                      <>
                                        <span>•</span>
                                        {(lesson.resourceUrl || lesson.resourceFileName) ? (
                                          <span className="text-purple-300 font-bold flex items-center gap-1 bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30">
                                            <CheckCircle2 className="w-2.5 h-2.5" /> {lesson.resourceFileType || "File"} Attached
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 font-medium">No file attached</span>
                                        )}
                                      </>
                                    )}
                                    {lesson.isPreview && (
                                      <>
                                        <span>•</span>
                                        <span className="text-emerald-400 font-bold">Free Preview</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setActiveLessonModal({ moduleId: bMod.id, lesson })}
                                  className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all"
                                >
                                  Edit Content
                                </button>
                                <button
                                  onClick={() => {
                                    setBuilderModules(prev => prev.map(m => m.id === bMod.id ? { ...m, lessons: m.lessons.filter(l => l.id !== lesson.id) } : m));
                                  }}
                                  className="p-1.5 text-subtext hover:text-rose-400 transition-colors"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 rounded-2xl text-xs font-bold text-subtext hover:text-text bg-card border border-white/10"
                  >
                    ← Back to Syllabus
                  </button>

                  <button
                    onClick={() => setCurrentStep(4)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-purple-500/25 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span>Proceed to Review & Publish</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
               STEP 4: FINAL REVIEW & PLATFORM PUBLISHING
               ══════════════════════════════════════════ */}
            {currentStep === 4 && (
              <div className="bg-card/70 border border-white/10 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Step 4 of 4</span>
                  <h2 className="text-2xl font-black text-text mt-1">Final Review & Platform Launch</h2>
                  <p className="text-xs text-subtext">Review the comprehensive course blueprint before releasing it to Glarus Academy learners.</p>
                </div>

                {/* Summary Card */}
                <div className={`p-6 rounded-3xl border bg-gradient-to-br ${formData.thumbnailGradient} border-purple-500/30 space-y-6 shadow-2xl`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                        {formData.category} • {formData.level}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-2">
                        {formData.title || aiTopic || "Untitled Course"}
                      </h3>
                      {formData.subtitle && (
                        <p className="text-xs text-slate-300 mt-1 font-medium">{formData.subtitle}</p>
                      )}
                      <p className="text-xs text-purple-300 mt-1 font-bold">
                        Instructor: {formData.instructorName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400">
                        {formData.isFree ? "FREE" : `₹${formData.price || "0"}`}
                      </span>
                      {formData.originalPrice && !formData.isFree && (
                        <span className="text-xs text-slate-400 line-through block">₹{formData.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Stat Blocks */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 bg-background/50 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-bold text-subtext uppercase block">Modules</span>
                      <span className="text-lg font-black text-text">
                        {builderModules.length || aiModules.length}
                      </span>
                    </div>

                    <div className="p-3.5 bg-background/50 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-bold text-subtext uppercase block">Total Lessons</span>
                      <span className="text-lg font-black text-text">
                        {builderModules.reduce((acc, m) => acc + m.lessons.length, 0) ||
                          aiModules.reduce((acc, m) => acc + m.lessons.length, 0)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-background/50 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-bold text-subtext uppercase block">Internship</span>
                      <span className={`text-sm font-black truncate ${formData.hasInternship ? "text-emerald-400" : "text-subtext"}`}>
                        {formData.hasInternship ? formData.internshipDuration : "Not Included"}
                      </span>
                    </div>

                    <div className="p-3.5 bg-background/50 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-bold text-subtext uppercase block">Course Status</span>
                      <span className="text-sm font-black text-amber-400">Unpublished (Ready)</span>
                    </div>
                  </div>

                  {/* 🌟 What You'll Learn Preview (6 Cards) */}
                  {formData.learningOutcomes.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-black text-white uppercase tracking-wider">What Learners Will Master ({formData.learningOutcomes.length} Cards)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.learningOutcomes.map((item, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-background/50 border border-white/10 space-y-1">
                            <span className="text-[10px] font-black uppercase text-purple-400">0{idx + 1}</span>
                            <h4 className="font-bold text-xs text-white line-clamp-1">{item.title}</h4>
                            <p className="text-[11px] text-slate-300 line-clamp-2">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 🚀 Real-World Projects Preview */}
                  {formData.projects.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-black text-white uppercase tracking-wider">Real-World Projects ({formData.projects.length} Included)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.projects.map((proj, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-background/50 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-black text-emerald-400">{proj.number || `0${idx + 1}`}</span>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">Capstone</span>
                            </div>
                            <h4 className="font-bold text-xs text-white">{proj.title}</h4>
                            <p className="text-[11px] text-slate-300 line-clamp-2">{proj.desc}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {proj.tech.map((t, tIdx) => (
                                <span key={tIdx} className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">{t}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ❓ FAQs Preview */}
                  {formData.faqs.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-black text-white uppercase tracking-wider">FAQs ({formData.faqs.length} Questions)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {formData.faqs.map((faq, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-background/50 border border-white/10 space-y-1">
                            <p className="font-bold text-white text-xs">{faq.q}</p>
                            <p className="text-[11px] text-slate-300 line-clamp-2">{faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 💼 Internship Highlight Card in Review */}
                  {formData.hasInternship && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-300 block">{formData.internshipType} ({formData.internshipDuration})</span>
                          <span className="text-[10px] text-emerald-400/80">{formData.internshipStipend} • {formData.internshipCompanyPartner}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        Internship Enabled
                      </span>
                    </div>
                  )}

                  {/* Outcomes checklist */}
                  {formData.outcomes.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-300 uppercase block">Curriculum Outcomes</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formData.outcomes.map((out, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{out}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Platform Toggles */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-text block">Platform Governance Flags</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="p-3.5 bg-background border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all">
                      <div>
                        <span className="text-xs font-bold text-text block">Feature on Homepage</span>
                        <span className="text-[10px] text-subtext">Display in banner carousel</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.featureOnHomepage}
                        onChange={e => setFormData({ ...formData, featureOnHomepage: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                    </label>

                    <label className="p-3.5 bg-background border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all">
                      <div>
                        <span className="text-xs font-bold text-text block">Issue Certificate</span>
                        <span className="text-[10px] text-subtext">Verify with smart badge</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.issueCertificate}
                        onChange={e => setFormData({ ...formData, issueCertificate: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                    </label>

                    <label className="p-3.5 bg-background border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all">
                      <div>
                        <span className="text-xs font-bold text-text block">DRM Video Protection</span>
                        <span className="text-[10px] text-subtext">Encrypted streaming</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.drmProtection}
                        onChange={e => setFormData({ ...formData, drmProtection: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* Bottom Publishing Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold text-subtext hover:text-text bg-card border border-white/10"
                  >
                    ← Back to Content Builder
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handlePublishCourse("DRAFT")}
                      disabled={isPublishing}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold bg-card hover:bg-white/10 text-subtext hover:text-text border border-white/10 transition-colors"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={() => handlePublishCourse("CREATE_COURSE")}
                      disabled={isPublishing || !formData.title.trim()}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      <span>Save & Create Course</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-subtext text-right pt-2">
                  💡 Course will be saved safely as unpublished. You can review and click <strong>Publish</strong> in Course Management when ready to go live and assign its landing page position.
                </p>
              </div>
            )}

          </main>
        </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════
         LESSON CONTENT MODAL (STEP 3)
         ═════════════════════════════════════════════ */}
      {activeLessonModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-white/10 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Lesson Editor</span>
                <h3 className="text-lg font-black text-text mt-0.5">{activeLessonModal.lesson.title}</h3>
              </div>
              <button
                onClick={() => setActiveLessonModal(null)}
                className="p-2 rounded-xl text-subtext hover:text-text hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ═════════════════════════════════════════════
                AI LESSON ASSISTANT STUDIO BANNER
                ═════════════════════════════════════════════ */}
            <div className="rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-slate-950/60 border border-purple-500/30 p-4 space-y-3 shadow-lg shadow-purple-950/30 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-sm shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white tracking-wide uppercase">AI Lesson Assistant</h4>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {activeLessonModal.lesson.type.toUpperCase()} Copilot
                      </span>
                    </div>
                    <p className="text-[11px] text-subtext mt-0.5">
                      Auto-generate curriculum materials tailored for &quot;{activeLessonModal.lesson.title || "this lesson"}&quot;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateLessonWithAi()}
                  disabled={isGeneratingLessonAi}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  {isGeneratingLessonAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing Content...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Format-Aware Quick Prompt Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-subtext/70 uppercase mr-1">Quick Prompts:</span>

                {activeLessonModal.lesson.type === "quiz" && (
                  <>
                    {[
                      { label: "✨ Comprehensive Quiz Question", prompt: "Generate a concept mastery question testing key principles with 4 distinct choices." },
                      { label: "🎯 Tricky Edge-Case Question", prompt: "Create a challenging, high-order thinking question testing common pitfalls." },
                      { label: "🟢 Beginner Fundamentals", prompt: "Generate a clean, foundational concept question suitable for beginners." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isGeneratingLessonAi}
                        onClick={() => {
                          setAiLessonPrompt(chip.prompt);
                          handleGenerateLessonWithAi(chip.prompt);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-background/80 hover:bg-purple-600/20 text-subtext hover:text-purple-200 border border-white/10 hover:border-purple-500/30 transition-all font-medium"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </>
                )}

                {activeLessonModal.lesson.type === "article" && (
                  <>
                    {[
                      { label: "📝 In-Depth Markdown Article", prompt: "Write an exhaustive, structured markdown article with theory, code snippets, and key takeaways." },
                      { label: "⚡ Step-by-Step Tutorial", prompt: "Create an action-oriented step-by-step tutorial with practical code examples." },
                      { label: "💡 Conceptual Deep Dive", prompt: "Explain the underlying architecture and theoretical foundation clearly." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isGeneratingLessonAi}
                        onClick={() => {
                          setAiLessonPrompt(chip.prompt);
                          handleGenerateLessonWithAi(chip.prompt);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-background/80 hover:bg-purple-600/20 text-subtext hover:text-purple-200 border border-white/10 hover:border-purple-500/30 transition-all font-medium"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </>
                )}

                {activeLessonModal.lesson.type === "sandbox" && (
                  <>
                    {[
                      { label: "💻 Starter Code & TODOs", prompt: "Generate clean starter code with clear TODO tasks and function signature for students to complete." },
                      { label: "🧪 Code Lab with Assertions", prompt: "Generate exercise boilerplate along with sample unit test assertions." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isGeneratingLessonAi}
                        onClick={() => {
                          setAiLessonPrompt(chip.prompt);
                          handleGenerateLessonWithAi(chip.prompt);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-background/80 hover:bg-purple-600/20 text-subtext hover:text-purple-200 border border-white/10 hover:border-purple-500/30 transition-all font-medium"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </>
                )}

                {activeLessonModal.lesson.type === "video" && (
                  <>
                    {[
                      { label: "🎬 Lecture Script & Timeline", prompt: "Generate video talking points outline and estimated duration breakdown." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isGeneratingLessonAi}
                        onClick={() => {
                          setAiLessonPrompt(chip.prompt);
                          handleGenerateLessonWithAi(chip.prompt);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-background/80 hover:bg-purple-600/20 text-subtext hover:text-purple-200 border border-white/10 hover:border-purple-500/30 transition-all font-medium"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </>
                )}

                {activeLessonModal.lesson.type === "resource" && (
                  <>
                    {[
                      { label: "📄 Cheatsheet & Summary Pack", prompt: "Generate a downloadable PDF cheatsheet naming and key reference bullet points." }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isGeneratingLessonAi}
                        onClick={() => {
                          setAiLessonPrompt(chip.prompt);
                          handleGenerateLessonWithAi(chip.prompt);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-background/80 hover:bg-purple-600/20 text-subtext hover:text-purple-200 border border-white/10 hover:border-purple-500/30 transition-all font-medium"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Optional Prompt & Difficulty Selector */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={aiLessonPrompt}
                  onChange={e => setAiLessonPrompt(e.target.value)}
                  placeholder={`Optional custom instructions (e.g. "Focus on phonetics", "Write in TypeScript")...`}
                  className="flex-1 bg-background/70 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text placeholder-subtext/60 outline-none focus:border-purple-500"
                />
                <select
                  value={aiLessonDifficulty}
                  onChange={e => setAiLessonDifficulty(e.target.value as any)}
                  className="bg-background/70 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-subtext hover:text-text outline-none focus:border-purple-500 shrink-0 cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Lesson Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text">Lesson Title</label>
              <input
                value={activeLessonModal.lesson.title}
                onChange={e => setActiveLessonModal({
                  ...activeLessonModal,
                  lesson: { ...activeLessonModal.lesson, title: e.target.value }
                })}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-text outline-none focus:border-purple-500"
              />
            </div>

            {/* Lesson Type Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text">Content Format</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: "video", label: "Video", icon: Video },
                  { id: "article", label: "Article", icon: FileText },
                  { id: "quiz", label: "Quiz", icon: HelpCircle },
                  { id: "sandbox", label: "Code Lab", icon: Code },
                  { id: "resource", label: "Resource", icon: Download }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveLessonModal({
                      ...activeLessonModal,
                      lesson: { ...activeLessonModal.lesson, type: tab.id as any }
                    })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      activeLessonModal.lesson.type === tab.id
                        ? "bg-purple-500/20 border-purple-500 text-purple-300"
                        : "bg-background border-white/10 text-subtext hover:text-text"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Specific Fields */}
            {activeLessonModal.lesson.type === "video" && (
              <div className="space-y-4">
                {/* Video Provider Selector */}
                <div className="flex items-center gap-2 p-1 bg-background rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setVideoProviderTab("UPLOAD")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      videoProviderTab === "UPLOAD"
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-subtext hover:text-text"
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Direct Video Upload (Bunny Stream HLS)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoProviderTab("YOUTUBE")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      videoProviderTab === "YOUTUBE"
                        ? "bg-red-600 text-white shadow-md"
                        : "text-subtext hover:text-text"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>YouTube Video (Unlisted Link)</span>
                  </button>
                </div>

                {/* TAB A: DIRECT VIDEO UPLOAD */}
                {videoProviderTab === "UPLOAD" && (
                  <div className="space-y-3">
                    {/* Hidden file input for upload / replace actions */}
                    <input
                      type="file"
                      id="admin-lesson-video-upload"
                      accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/mkv,.mp4,.mov,.webm,.m4v,.mkv"
                      className="hidden"
                      disabled={videoUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await handleAdminVideoUpload(file);
                      }}
                    />

                    {/* STATE 1: ACTIVE UPLOAD IN PROGRESS */}
                    {videoUploading && (
                      <div className="p-5 bg-gradient-to-br from-purple-950/40 via-card/90 to-indigo-950/40 border border-purple-500/40 rounded-2xl space-y-3 shadow-xl animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">
                                {videoUploadProgress < 100
                                  ? "Uploading directly to Bunny Stream CDN Edge..."
                                  : "Finalizing Ingest & Validating Stream..."}
                              </p>
                              <p className="text-[10px] text-purple-300/80">
                                High-Speed Resumable TUS Protocol · Direct to Bunny CDN Global Ingest
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-purple-300 font-mono bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30">
                            {videoUploadProgress}%
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-background/90 rounded-full overflow-hidden border border-white/10 p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
                            style={{ width: `${Math.max(videoUploadProgress, 5)}%` }}
                          />
                        </div>

                        <p className="text-[10px] text-subtext flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-purple-400 shrink-0" />
                          Streaming directly from your browser to global edge. Adaptive HLS auto-encodes immediately upon upload.
                        </p>
                      </div>
                    )}

                    {/* STATE 2: CLOUD TRANSCODING IN PROGRESS */}
                    {!videoUploading && (activeLessonModal.lesson.videoStatus === "PROCESSING" || videoProcessingStatus === "PROCESSING") && (
                      <div className="p-5 bg-gradient-to-br from-purple-950/35 via-card/90 to-amber-950/20 border border-purple-500/40 rounded-2xl space-y-3.5 shadow-xl animate-in fade-in duration-200">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                              <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-white">Bunny Stream Cloud Transcoding</p>
                                <span className="flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                  In Progress
                                </span>
                              </div>
                              <p className="text-[10px] text-purple-200/70 mt-0.5">
                                Generating multi-bitrate HLS streams (1080p, 720p, 480p, 360p)
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                if (activeLessonModal?.lesson?.videoAssetId) {
                                  showToast("Checking latest status from Bunny Stream...", "info");
                                  const isDone = await checkVideoStatusNow(activeLessonModal.lesson.videoAssetId);
                                  if (!isDone) showToast(`Transcoding in progress (${videoEncodeProgress}%)...`, "info");
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text border border-white/10 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Check status immediately"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Refresh Status</span>
                            </button>
                            <label
                              htmlFor="admin-lesson-video-upload"
                              className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <span>Replace</span>
                            </label>
                          </div>
                        </div>

                        {/* Encoding Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-purple-200">
                            <span>Cloud Transcoding Progress</span>
                            <span className="font-mono font-bold text-purple-300">
                              {videoEncodeProgress > 0 ? `${videoEncodeProgress}%` : "Auto-encoding..."}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-background/80 rounded-full overflow-hidden border border-white/10">
                            {videoEncodeProgress > 0 ? (
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                                style={{ width: `${videoEncodeProgress}%` }}
                              />
                            ) : (
                              <div className="h-full w-2/3 bg-gradient-to-r from-transparent via-purple-500/60 to-transparent rounded-full animate-pulse" />
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 bg-background/60 rounded-xl border border-white/5 flex items-start gap-2 text-[10px] text-subtext leading-relaxed">
                          <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Original file is saved and ready.</strong> You can save the lesson or continue editing. Bunny Stream automatically handles the adaptive bitrate processing in the cloud.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STATE 3: VIDEO READY / ATTACHED */}
                    {!videoUploading && (activeLessonModal.lesson.videoStatus === "READY" || (activeLessonModal.lesson.videoUrl && activeLessonModal.lesson.videoStatus !== "PROCESSING" && activeLessonModal.lesson.videoStatus !== "FAILED")) && (
                      <div className="p-4 bg-gradient-to-br from-emerald-950/20 via-card/90 to-purple-950/20 border border-emerald-500/30 rounded-2xl space-y-3.5 shadow-xl animate-in fade-in duration-200">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Video Uploaded & Ready</span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm">
                              Bunny Stream HLS ✓
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="admin-lesson-video-upload"
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-subtext hover:text-text border border-white/10 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              title="Upload a different video file"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Replace</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setYoutubeLinkInput("");
                                setYoutubeMetadata(null);
                                setVideoProcessingStatus("");
                                setActiveLessonModal({
                                  ...activeLessonModal,
                                  lesson: {
                                    ...activeLessonModal.lesson,
                                    videoUrl: "",
                                    videoAssetId: undefined,
                                    videoStatus: undefined,
                                    thumbnailUrl: undefined,
                                    resolutions: undefined,
                                  },
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              title="Remove attached video"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Video Preview & Specs Details */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3 bg-background/70 border border-white/5 rounded-xl">
                          {/* Poster Thumbnail */}
                          <div className="relative w-full sm:w-32 aspect-video rounded-lg overflow-hidden bg-black/60 border border-white/10 shrink-0 shadow-md group">
                            {activeLessonModal.lesson.thumbnailUrl ? (
                              <img
                                src={activeLessonModal.lesson.thumbnailUrl}
                                alt="Video Poster Preview"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/60 to-slate-900 text-purple-400">
                                <PlayCircle className="w-6 h-6" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlayCircle className="w-7 h-7 text-white drop-shadow-md" />
                            </div>
                            {activeLessonModal.lesson.duration && (
                              <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white">
                                {activeLessonModal.lesson.duration}
                              </span>
                            )}
                          </div>

                          {/* Video Metadata & Available Resolutions */}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <p className="text-xs font-bold text-white truncate">
                              {activeLessonModal.lesson.title || "Lesson Video"}
                            </p>

                            {/* Available Resolutions Badges */}
                            <div className="flex items-center flex-wrap gap-1.5">
                              <span className="text-[10px] text-subtext font-semibold mr-1">Quality:</span>
                              {(activeLessonModal.lesson.resolutions && activeLessonModal.lesson.resolutions.length > 0
                                ? activeLessonModal.lesson.resolutions
                                : ["360p", "720p", "1080p"]
                              ).map((res) => (
                                <span
                                  key={res}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                >
                                  {res}
                                </span>
                              ))}
                            </div>

                            <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Encrypted adaptive HLS streaming via Bunny Stream CDN
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STATE 4: TRANSCODING FAILED / RETRY */}
                    {!videoUploading && activeLessonModal.lesson.videoStatus === "FAILED" && (
                      <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                            <Info className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>Transcoding notice encountered. Original video is preserved.</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {activeLessonModal.lesson.videoAssetId && (
                              <button
                                type="button"
                                onClick={() => handleRetryVideoTranscode(activeLessonModal.lesson.videoAssetId!)}
                                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                <RefreshCw className="w-3 h-3" /> Retry
                              </button>
                            )}
                            <label
                              htmlFor="admin-lesson-video-upload"
                              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold cursor-pointer transition-all border border-white/10"
                            >
                              Upload New File
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STATE 5: EMPTY DROPZONE (NO VIDEO ATTACHED YET) */}
                    {!videoUploading &&
                      !activeLessonModal.lesson.videoUrl &&
                      !activeLessonModal.lesson.videoAssetId &&
                      activeLessonModal.lesson.videoStatus !== "PROCESSING" &&
                      activeLessonModal.lesson.videoStatus !== "FAILED" && (
                        <div className="p-5 bg-card/40 border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl text-center space-y-2 transition-all">
                          <label
                            htmlFor="admin-lesson-video-upload"
                            className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center shadow-md">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text">Click or Drag & Drop to Upload Video File</p>
                              <p className="text-[10px] text-subtext mt-0.5">
                                High-Speed Bunny Stream TUS Upload · Auto-encodes HLS (360p, 720p, 1080p) + Global CDN
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                  </div>
                )}

                {/* TAB B: YOUTUBE LINK */}
                {videoProviderTab === "YOUTUBE" && (() => {
                  const isAttachedToCurrent = !!(
                    activeLessonModal.lesson.videoUrl &&
                    (activeLessonModal.lesson.videoUrl.includes("youtube.com") || activeLessonModal.lesson.videoUrl.includes("youtu.be"))
                  );
                  const attachedVidId = isAttachedToCurrent ? parseYouTubeVideoId(activeLessonModal.lesson.videoUrl!) : null;

                  return (
                    <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-red-400" />
                          Link Unlisted YouTube Video
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          HD 1080p Stream
                        </span>
                      </div>

                      {/* STATE: CURRENTLY ATTACHED YOUTUBE VIDEO CARD */}
                      {isAttachedToCurrent && attachedVidId && (
                        <div className="p-4 bg-emerald-950/30 border-2 border-emerald-500/60 rounded-2xl space-y-3.5 shadow-lg shadow-emerald-950/50 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-emerald-300">YouTube Video Attached to Lesson</span>
                                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    Active Stream ✓
                                  </span>
                                </div>
                                <p className="text-[10px] text-emerald-200/70">
                                  Ready for student playback in 1080p · URL: <span className="font-mono text-emerald-300">{activeLessonModal.lesson.videoUrl}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveLessonModal({
                                    ...activeLessonModal,
                                    lesson: {
                                      ...activeLessonModal.lesson,
                                      videoUrl: "",
                                      videoAssetId: undefined,
                                      videoStatus: undefined,
                                      thumbnailUrl: undefined,
                                      resolutions: undefined,
                                    },
                                  });
                                  setYoutubeMetadata(null);
                                  setYoutubeLinkInput("");
                                  showToast("YouTube video detached from lesson.", "info");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                title="Remove video attachment"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Detach</span>
                              </button>
                            </div>
                          </div>

                          {/* Playable Embed Preview */}
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-emerald-500/30 shadow-xl">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${attachedVidId}?rel=0&modestbranding=1`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              title="Attached YouTube Video"
                            />
                          </div>
                        </div>
                      )}

                      {/* URL INPUT FOR LINKING OR REPLACING */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-300">
                          {isAttachedToCurrent ? "Replace Video with a Different YouTube Link:" : "Enter YouTube Video URL:"}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={youtubeLinkInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setYoutubeLinkInput(val);
                              const vid = parseYouTubeVideoId(val.trim());
                              if (vid && (!youtubeMetadata || youtubeMetadata.videoId !== vid)) {
                                setYoutubeMetadata({
                                  videoId: vid,
                                  title: `YouTube Video (${vid})`,
                                  authorName: "YouTube Channel",
                                  thumbnailUrl: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
                                  embedUrl: `https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1`,
                                });
                              }
                            }}
                            placeholder="Paste YouTube Link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
                            className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text outline-none focus:border-red-500 font-mono"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleValidateYouTube();
                              }
                            }}
                          />
                          <button
                            type="button"
                            disabled={youtubeValidating || !youtubeLinkInput.trim()}
                            onClick={handleValidateYouTube}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
                          >
                            {youtubeValidating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>Validate</span>
                          </button>
                        </div>
                      </div>

                      {/* PREVIEW OF VALIDATED NEW YOUTUBE VIDEO */}
                      {youtubeMetadata && (!isAttachedToCurrent || attachedVidId !== youtubeMetadata.videoId) && (
                        <div className="p-4 bg-black/70 border border-red-500/40 rounded-2xl space-y-3 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Valid YouTube Video Detected
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              ID: {youtubeMetadata.videoId}
                            </span>
                          </div>

                          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-xl">
                            <iframe
                              src={youtubeMetadata.embedUrl || `https://www.youtube-nocookie.com/embed/${youtubeMetadata.videoId}?rel=0&modestbranding=1`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              title="YouTube Video Preview"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-white/10">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">{youtubeMetadata.title}</p>
                              <p className="text-[11px] text-slate-400">
                                Channel: <strong className="text-slate-200">{youtubeMetadata.authorName}</strong>
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleAttachYouTubeVideo}
                              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Attach YouTube Video to Lesson
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        💡 <strong>Tip:</strong> In YouTube Studio, set video visibility to <strong>Unlisted</strong> and enable embedding. The video will be streamed crystal clear in 1080p inside the student classroom.
                      </p>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text">Duration</label>
                    <input
                      value={activeLessonModal.lesson.duration || "15m 00s"}
                      onChange={e => setActiveLessonModal({
                        ...activeLessonModal,
                        lesson: { ...activeLessonModal.lesson, duration: e.target.value }
                      })}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-xs text-text outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text">Free Sample Preview?</label>
                    <label className="flex items-center gap-2 py-2 text-xs font-bold text-subtext cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeLessonModal.lesson.isPreview || false}
                        onChange={e => setActiveLessonModal({
                          ...activeLessonModal,
                          lesson: { ...activeLessonModal.lesson, isPreview: e.target.checked }
                        })}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span>Allow Preview without Enrollment</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden Material Upload Inputs */}
            <input
              type="file"
              id="admin-lesson-article-md-upload"
              accept=".md,.txt,.markdown"
              className="hidden"
              disabled={isUploadingMaterial}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await handleMaterialFileUpload(file, "article");
              }}
            />
            <input
              type="file"
              id="admin-lesson-article-image-upload"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              disabled={isUploadingMaterial}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await handleMaterialFileUpload(file, "image");
              }}
            />
            <input
              type="file"
              id="admin-lesson-code-upload"
              accept=".py,.js,.ts,.tsx,.cpp,.c,.h,.java,.rs,.go,.html,.css,.sql,.json,.zip,.ipynb"
              className="hidden"
              disabled={isUploadingMaterial}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await handleMaterialFileUpload(file, "code");
              }}
            />
            <input
              type="file"
              id="admin-lesson-resource-upload"
              accept=".pdf,.zip,.rar,.tar,.gz,.docx,.xlsx,.pptx,.csv,.json,.txt"
              className="hidden"
              disabled={isUploadingMaterial}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await handleMaterialFileUpload(file, "resource");
              }}
            />

            {/* Material Upload Status Notification */}
            {isUploadingMaterial && (
              <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl flex items-center gap-2 text-xs font-bold text-purple-300 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>{materialUploadProgress || "Uploading file..."}</span>
              </div>
            )}

            {/* ARTICLE TAB */}
            {activeLessonModal.lesson.type === "article" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="block text-xs font-bold text-text">Markdown Article Body</label>
                    <span className="text-[10px] text-subtext">Write rich markdown, include code blocks, bullet points, and math formulas</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="admin-lesson-article-md-upload"
                      className="px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Import from .md or .txt file"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Import .md / .txt File</span>
                    </label>
                    <label
                      htmlFor="admin-lesson-article-image-upload"
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Attach Diagram or Banner Image"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{activeLessonModal.lesson.imageUrl1 ? "Change Diagram" : "Add Diagram Image"}</span>
                    </label>
                  </div>
                </div>

                {/* Diagram / Banner Image Attached Card */}
                {activeLessonModal.lesson.imageUrl1 && (
                  <div className="p-3.5 bg-card/80 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0">
                      <img
                        src={activeLessonModal.lesson.imageUrl1}
                        alt="Article diagram"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                          Attached Diagram / Visual Asset
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveLessonModal({
                            ...activeLessonModal,
                            lesson: { ...activeLessonModal.lesson, imageUrl1: undefined, imageCaption: undefined }
                          })}
                          className="text-rose-400 hover:text-rose-300 text-[10px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                      <input
                        value={activeLessonModal.lesson.imageCaption || ""}
                        onChange={e => setActiveLessonModal({
                          ...activeLessonModal,
                          lesson: { ...activeLessonModal.lesson, imageCaption: e.target.value }
                        })}
                        placeholder="Figure 1: Architectural diagram caption..."
                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Markdown Editor Area */}
                <textarea
                  rows={10}
                  value={activeLessonModal.lesson.content || activeLessonModal.lesson.articleContent || ""}
                  onChange={e => {
                    const val = e.target.value;
                    setActiveLessonModal({
                      ...activeLessonModal,
                      lesson: { ...activeLessonModal.lesson, content: val, articleContent: val }
                    });
                  }}
                  placeholder="### Introduction & Key Principles&#10;&#10;Here is the step-by-step conceptual walkthrough...&#10;&#10;```python&#10;def run():&#10;    pass&#10;```"
                  className="w-full bg-background border border-white/10 rounded-2xl p-4 text-xs text-text outline-none font-mono leading-relaxed focus:border-purple-500 min-h-[200px]"
                />
              </div>
            )}

            {activeLessonModal.lesson.type === "quiz" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text">Quiz Question</label>
                  <input
                    value={activeLessonModal.lesson.quizQuestion || ""}
                    onChange={e => setActiveLessonModal({
                      ...activeLessonModal,
                      lesson: { ...activeLessonModal.lesson, quizQuestion: e.target.value }
                    })}
                    placeholder="e.g. Which pattern enables multi-agent state persistence?"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text outline-none focus:border-purple-500"
                  />
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-text">Options & Correct Answer</label>
                    <span className="text-[10px] text-subtext font-normal">Click letter icon to mark correct</span>
                  </div>
                  <div className="space-y-2">
                    {(activeLessonModal.lesson.quizOptions && activeLessonModal.lesson.quizOptions.length > 0
                      ? activeLessonModal.lesson.quizOptions
                      : ["Option A", "Option B", "Option C", "Option D"]
                    ).map((opt, idx) => {
                      const isCorrect = (activeLessonModal.lesson.quizCorrectIndex ?? 0) === idx;
                      return (
                        <div key={idx} className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setActiveLessonModal({
                              ...activeLessonModal,
                              lesson: { ...activeLessonModal.lesson, quizCorrectIndex: idx }
                            })}
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-xs font-black transition-all ${
                              isCorrect
                                ? "bg-emerald-500 border-emerald-400 text-black shadow-md shadow-emerald-500/20"
                                : "border-white/20 text-subtext hover:border-purple-400 hover:text-white"
                            }`}
                            title={isCorrect ? "Correct Answer" : "Mark as Correct"}
                          >
                            {isCorrect ? "✓" : String.fromCharCode(65 + idx)}
                          </button>
                          <input
                            value={opt}
                            onChange={e => {
                              const currentOpts = [
                                ...(activeLessonModal.lesson.quizOptions || ["Option A", "Option B", "Option C", "Option D"])
                              ];
                              currentOpts[idx] = e.target.value;
                              setActiveLessonModal({
                                ...activeLessonModal,
                                lesson: { ...activeLessonModal.lesson, quizOptions: currentOpts }
                              });
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            className={`flex-1 bg-background border rounded-xl px-3.5 py-2 text-xs text-text outline-none transition-all ${
                              isCorrect ? "border-emerald-500/50 bg-emerald-950/10" : "border-white/10 focus:border-purple-500"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text">Explanation & Hint</label>
                  <textarea
                    rows={2}
                    value={activeLessonModal.lesson.quizExplanation || ""}
                    onChange={e => setActiveLessonModal({
                      ...activeLessonModal,
                      lesson: { ...activeLessonModal.lesson, quizExplanation: e.target.value }
                    })}
                    placeholder="Pedagogical explanation shown to students after answering..."
                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-xs text-text outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* CODE LAB / SANDBOX TAB */}
            {activeLessonModal.lesson.type === "sandbox" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Programming Language Selector */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-text">Target Programming Language</label>
                    <select
                      value={activeLessonModal.lesson.codeLanguage || "python"}
                      onChange={e => setActiveLessonModal({
                        ...activeLessonModal,
                        lesson: { ...activeLessonModal.lesson, codeLanguage: e.target.value }
                      })}
                      className="bg-background border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="python">Python 3 (LangGraph, PyTorch, FastAPI)</option>
                      <option value="typescript">TypeScript / Next.js (Strict Types)</option>
                      <option value="javascript">JavaScript / Node.js</option>
                      <option value="cpp">C++ (High Performance / CUDA)</option>
                      <option value="c">C</option>
                      <option value="java">Java 21</option>
                      <option value="rust">Rust (Memory Safe / WASM)</option>
                      <option value="go">Go (Concurrency & Microservices)</option>
                      <option value="sql">PostgreSQL / SQL Analytics</option>
                      <option value="html">HTML5 / CSS3 / Web UI</option>
                      <option value="json">JSON / Config Schema</option>
                    </select>
                  </div>

                  {/* Upload Starter Code / Project Zip Action */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <label
                      htmlFor="admin-lesson-code-upload"
                      className="px-3.5 py-2 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="Upload starter code (.py, .ts, .cpp) or workspace zip (.zip, .ipynb)"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
                      <span>Upload Code / Project (.zip, .py, .ts)</span>
                    </label>
                  </div>
                </div>

                {/* Attached Starter File / Workspace Zip Badge */}
                {activeLessonModal.lesson.starterFileName && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderArchive className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-300 truncate">
                          Attached Project File: {activeLessonModal.lesson.starterFileName}
                        </p>
                        <p className="text-[10px] text-emerald-200/70">
                          Students will be able to download or clone this workspace
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {activeLessonModal.lesson.starterFileUrl && (
                        <a
                          href={activeLessonModal.lesson.starterFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Download
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveLessonModal({
                          ...activeLessonModal,
                          lesson: { ...activeLessonModal.lesson, starterFileName: undefined, starterFileUrl: undefined }
                        })}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Remove attached archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Code Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-text">Starter Code Template</label>
                    <span className="text-[10px] font-mono text-subtext">Language: {activeLessonModal.lesson.codeLanguage || "python"}</span>
                  </div>
                  <textarea
                    rows={9}
                    value={activeLessonModal.lesson.starterCode || ""}
                    onChange={e => setActiveLessonModal({
                      ...activeLessonModal,
                      lesson: { ...activeLessonModal.lesson, starterCode: e.target.value }
                    })}
                    placeholder="# Write starter code template for student sandbox..."
                    className="w-full bg-background border border-white/10 rounded-2xl p-4 text-xs text-text outline-none font-mono focus:border-purple-500 leading-relaxed min-h-[180px]"
                  />
                </div>
              </div>
            )}

            {/* RESOURCE TAB */}
            {activeLessonModal.lesson.type === "resource" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="block text-xs font-bold text-text">Downloadable Resource / Cheatsheet</label>
                    <p className="text-[10px] text-subtext">Attach PDFs, ZIP archives, templates, datasets, or external documentation links</p>
                  </div>

                  <label
                    htmlFor="admin-lesson-resource-upload"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Resource File</span>
                  </label>
                </div>

                {/* ATTACHED RESOURCE FILE CARD */}
                {activeLessonModal.lesson.resourceUrl ? (
                  <div className="p-4 bg-emerald-950/20 border-2 border-emerald-500/40 rounded-2xl space-y-3 shadow-lg shadow-emerald-950/20">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black text-xs shrink-0">
                          {activeLessonModal.lesson.resourceFileType || "FILE"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {activeLessonModal.lesson.resourceFileName || "Attached Document"}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-emerald-200/70 mt-0.5">
                            <span>{activeLessonModal.lesson.resourceFileSize || "Uploaded File"}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">Attached & Saved ✓</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={activeLessonModal.lesson.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View / Test
                        </a>
                        <label
                          htmlFor="admin-lesson-resource-upload"
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-white/10"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Replace
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveLessonModal({
                            ...activeLessonModal,
                            lesson: {
                              ...activeLessonModal.lesson,
                              resourceUrl: undefined,
                              resourceFileName: undefined,
                              resourceFileType: undefined,
                              resourceFileSize: undefined
                            }
                          })}
                          className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10"
                          title="Remove resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* EMPTY RESOURCE DROPZONE */
                  <label
                    htmlFor="admin-lesson-resource-upload"
                    className="p-6 bg-card/40 border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/15 group-hover:bg-purple-500/25 text-purple-400 flex items-center justify-center transition-all shadow-md">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text">Click or Drag & Drop to Upload Resource File</p>
                      <p className="text-[10px] text-subtext mt-0.5">
                        Supports .pdf, .zip, .docx, .xlsx, .pptx, .csv, .json up to 250MB
                      </p>
                    </div>
                  </label>
                )}

                {/* External Link Fallback / Additional Reference URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text">Resource Title / Label</label>
                    <input
                      value={activeLessonModal.lesson.resourceFileName || ""}
                      onChange={e => setActiveLessonModal({
                        ...activeLessonModal,
                        lesson: { ...activeLessonModal.lesson, resourceFileName: e.target.value }
                      })}
                      placeholder="e.g. LangGraph Architecture Whitepaper.pdf"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text">External URL (GitHub / Docs / Drive)</label>
                    <input
                      value={activeLessonModal.lesson.resourceUrl || ""}
                      onChange={e => setActiveLessonModal({
                        ...activeLessonModal,
                        lesson: { ...activeLessonModal.lesson, resourceUrl: e.target.value }
                      })}
                      placeholder="https://github.com/... or https://drive.google.com/..."
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text outline-none font-mono focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveLessonModal(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-subtext hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setBuilderModules(prev => prev.map(m => {
                    if (m.id === activeLessonModal.moduleId) {
                      return {
                        ...m,
                        lessons: m.lessons.map(l => l.id === activeLessonModal.lesson.id ? activeLessonModal.lesson : l)
                      };
                    }
                    return m;
                  }));
                  setActiveLessonModal(null);
                  showToast("Lesson asset saved!", "success");
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Lesson Content</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
