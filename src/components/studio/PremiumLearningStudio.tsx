"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";
import Hls from "hls.js";
import { Logo } from "@/components/Logo";
import "@/styles/learning-studio.css";
import { YouTubePlayer } from "@/components/video/YouTubePlayer";
import { parseYouTubeVideoId } from "@/lib/video/youtubeService";

// Dynamic import for Monaco Editor
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export interface StudioLecture {
  id: string;
  title: string;
  type: string; // "video" | "concept" | "quiz" | "code" | "article" | "resource"
  duration: string;
  videoUrl?: string | null;
  videoAsset?: {
    id: string;
    provider?: string | null;
    providerVideoId?: string | null;
    status: string;
    masterPlaylistKey?: string | null;
    thumbnailKey?: string | null;
    durationSeconds?: number | null;
    width?: number | null;
    height?: number | null;
    resolutions?: any;
  } | null;
  description?: string | null;
  notesContent?: string | null;
  articleContent?: string | null;
  imageUrl1?: string | null;
  imageUrl2?: string | null;
  imageCaption?: string | null;
  sandboxLang?: string | null;
  sandboxCode?: string | null;
  quizQuestions?: Array<{
    id?: number | string;
    question: string;
    options: Array<{ id: string; text: string }> | string[];
    correct: string | number;
    explanation?: string;
  }>;
  resources?: Array<{
    id?: string;
    title: string;
    url: string;
    type?: string;
    size?: string;
  }>;
  starterFileName?: string | null;
  starterFileUrl?: string | null;
  assignmentBrief?: string | null;
  order: number;
  isCompleted?: boolean;
  progressSeconds?: number;
}

export interface StudioModule {
  id: string;
  title: string;
  order: number;
  lectures: StudioLecture[];
}

export interface StudioCourse {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string;
  category?: string | null;
  level?: string | null;
  duration?: string | null;
  price?: number;
  instructor?: {
    id?: string;
    name: string;
    email?: string;
    avatar?: string | null;
  };
  learningOutcomes?: string[];
  projects?: any[];
  faqs?: any[];
  features?: string[];
  modules: StudioModule[];
}

export interface StudioStudentNote {
  id: string;
  lectureId: string;
  timestampSeconds: number;
  content: string;
  createdAt: string | Date;
}

interface PremiumLearningStudioProps {
  course: StudioCourse;
  user?: {
    id: string;
    name: string;
    email?: string;
    role?: string;
  };
  initialNotes?: StudioStudentNote[];
  lastLectureId?: string | null;
  lastTimestamp?: number;
}

export default function PremiumLearningStudio({
  course,
  user = { id: "student-1", name: "Akash Kumar", email: "student@glarus.ai" },
  initialNotes = [],
  lastLectureId,
  lastTimestamp = 0,
}: PremiumLearningStudioProps) {
  const router = useRouter();

  // ── Flatten all lectures ──
  const allLectures = useMemo(() => {
    return course.modules.flatMap((m) => m.lectures);
  }, [course]);

  // ── 1. ACTIVE LECTURE & STAGE STATE ──
  const [activeLectureId, setActiveLectureId] = useState<string>(() => {
    if (lastLectureId && allLectures.some((l) => l.id === lastLectureId)) {
      return lastLectureId;
    }
    return allLectures[0]?.id || "";
  });

  const activeLecture = useMemo(() => {
    return allLectures.find((l) => l.id === activeLectureId) || allLectures[0] || null;
  }, [allLectures, activeLectureId]);

  // Stage: "video" | "concept" | "code" | "quiz"
  const [activeStage, setActiveStage] = useState<"video" | "concept" | "code" | "quiz">(() => {
    if (activeLecture) {
      if (activeLecture.type === "quiz") return "quiz";
      if (activeLecture.type === "concept" || activeLecture.type === "article" || activeLecture.type === "resource") return "concept";
      if (activeLecture.type === "code" || activeLecture.type === "sandbox") return "code";
    }
    return "video";
  });

  // Completed lecture IDs
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    allLectures.forEach((l) => {
      if (l.isCompleted) set.add(l.id);
    });
    return set;
  });

  // Open modules state
  const [openModuleIds, setOpenModuleIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    // Default open the module that contains the active lecture
    const parentMod = course.modules.find((m) => m.lectures.some((l) => l.id === activeLectureId));
    if (parentMod) set.add(parentMod.id);
    else if (course.modules[0]) set.add(course.modules[0].id);
    return set;
  });

  // ── 2. UI LAYOUT & THEME STATE ──
  const [theme, setTheme] = useState<string>("theme-nebula");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Right Dock Tab: "syllabus" | "copilot" | "analytics"
  const [activeSideTab, setActiveSideTab] = useState<"syllabus" | "copilot" | "analytics">("syllabus");
  const [syllabusSearch, setSyllabusSearch] = useState<string>("");
  const [syllabusFilter, setSyllabusFilter] = useState<"all" | "completed" | "remaining">("all");

  // Bottom Drawer: "notes" | "transcript" | "qa" | "downloads"
  const [activeDrawerTab, setActiveDrawerTab] = useState<"notes" | "transcript" | "qa" | "downloads">("notes");

  // ── 3. VIDEO PLAYER STATE ──
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1458);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState<boolean>(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState<boolean>(false);
  const [isResourceFullscreen, setIsResourceFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setIsVideoFullscreen(Boolean(fsElement && fsElement.id === "videoWrapper"));
      setIsResourceFullscreen(Boolean(fsElement && fsElement.id === "stageViewConcept"));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleVideoFullscreen = () => {
    const wrapper = document.getElementById("videoWrapper");
    if (!wrapper) return;

    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    } else {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen().catch(() => {});
      } else if ((wrapper as any).webkitRequestFullscreen) {
        (wrapper as any).webkitRequestFullscreen();
      }
    }
  };

  const toggleResourceFullscreen = () => {
    const wrapper = document.getElementById("stageViewConcept");
    if (!wrapper) return;

    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    } else {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen().catch(() => {});
      } else if ((wrapper as any).webkitRequestFullscreen) {
        (wrapper as any).webkitRequestFullscreen();
      }
    }
  };

  // ── 4. STUDENT NOTES STATE ──
  const [notes, setNotes] = useState<StudioStudentNote[]>(initialNotes);
  const [noteInput, setNoteInput] = useState<string>("");
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);

  // ── 5. CODE SANDBOX STATE ──
  const [codeLanguage, setCodeLanguage] = useState<string>(activeLecture?.sandboxLang || "python");
  const [codeSnippet, setCodeSnippet] = useState<string>(
    activeLecture?.sandboxCode ||
      `# Production Multi-Agent Graph Runner\nfrom typing import TypedDict, Annotated, List\nimport operator\n\nclass AgentState(TypedDict):\n    query: str\n    plan: List[str]\n    messages: Annotated[List[str], operator.add]\n    is_completed: bool\n\ndef planner_node(state: AgentState):\n    print("🧠 [Planner] Generating step-by-step strategy for:", state['query'])\n    return {\n        "plan": ["1. Search Vector DB", "2. Synthesize Insights", "3. Validate"],\n        "messages": ["Planner formulated 3 execution steps."]\n    }\n\nprint("🚀 Agent state compiled successfully!")\n`
  );
  const [terminalOutput, setTerminalOutput] = useState<string>("Click 'Run Code' to execute the sandbox script in a sandboxed runtime.");
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);

  // ── 6. QUIZ ENGINE STATE ──
  const defaultQuiz = useMemo(() => {
    if (activeLecture?.quizQuestions && activeLecture.quizQuestions.length > 0) {
      return activeLecture.quizQuestions;
    }
    return [
      {
        id: 1,
        question: `In production AI architectures, what is the primary purpose of reducer functions (like operator.add) in graph state?`,
        options: [
          { id: "A", text: "They overwrite and erase previous state variables to save GPU memory." },
          { id: "B", text: "They combine or append state deltas without collision across parallel agent nodes." },
          { id: "C", text: "They translate Python source code to C++ at runtime." },
          { id: "D", text: "They require manual human approval for each graph traversal." },
        ],
        correct: "B",
        explanation: "Reducers specify how updates from multiple nodes merge into the persistent state, ensuring seamless message concatenation.",
      },
      {
        id: 2,
        question: `Why is adding a recursion_limit or max_iterations counter critical for autonomous agent loops?`,
        options: [
          { id: "A", text: "To prevent infinite reasoning loops and runaway API costs if convergence fails." },
          { id: "B", text: "Because Python only allows a maximum of 5 function invocations." },
          { id: "C", text: "To clear PyTorch CUDA buffers automatically." },
          { id: "D", text: "To enforce zero-shot prompt translations." },
        ],
        correct: "A",
        explanation: "Unconstrained reflection/critique loops can get trapped in endless debate; an iteration guardrail ensures bounded execution.",
      },
    ];
  }, [activeLecture]);

  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [isQuizPassed, setIsQuizPassed] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // ── 7. AI COPILOT CHAT STATE ──
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: "ai" | "user"; text: string; time?: string }>>([
    {
      role: "ai",
      text: `👋 Hey ${user.name.split(" ")[0] || "there"}! I'm synchronized with your lecture "${activeLecture?.title || "Video"}". Ask me to explain concepts simply, generate practice questions, or troubleshoot your code!`,
      time: "Just now",
    },
  ]);
  const [copilotInput, setCopilotInput] = useState<string>("");
  const [isCopilotThinking, setIsCopilotThinking] = useState<boolean>(false);

  // ── 8. TOAST NOTIFICATIONS ──
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // ── 9. CONFETTI ──
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#6366f1", "#10b981", "#f59e0b", "#38bdf8"],
      });
    } catch (e) {}
  };

  // ── RESOLVE ASSET / FILE URL (MinIO Storage Proxy) ──
  const resolveFileUrl = (raw?: string | null) => {
    if (!raw) return null;
    if (raw.startsWith("courses/") || raw.startsWith("temporary/")) {
      return `/api/storage/file?key=${encodeURIComponent(raw)}`;
    }
    return raw;
  };

  // ── 10. RESOLVE VIDEO URL (MinIO / YouTube / Bunny) ──
  const isYouTubeVideo = useMemo(() => {
    if (activeLecture?.videoAsset?.provider === "YOUTUBE") return true;
    const raw = activeLecture?.videoUrl || "";
    return parseYouTubeVideoId(raw) !== null;
  }, [activeLecture]);

  const resolvedVideoSrc = useMemo(() => {
    const raw = activeLecture?.videoUrl;
    if (!raw) {
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
    return resolveFileUrl(raw) || raw;
  }, [activeLecture]);

  // ── 10A. GOOGLE SHAKA PLAYER STREAMING & ADAPTIVE QUALITY RESOLUTION ──
  const [hlsLevels, setHlsLevels] = useState<Array<{ id: number; name: string; height: number }>>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1); // -1 = Auto
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState<boolean>(false);
  const shakaPlayerRef = useRef<any>(null);

  useEffect(() => {
    // If YouTube video, Shaka player is bypassed
    if (isYouTubeVideo) {
      if (shakaPlayerRef.current) {
        shakaPlayerRef.current.destroy().catch(() => {});
        shakaPlayerRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video || typeof window === "undefined") return;

    let isCancelled = false;

    async function setupPlayback() {
      // 1. Destroy existing Shaka player instance if any
      if (shakaPlayerRef.current) {
        await shakaPlayerRef.current.destroy().catch(() => {});
        shakaPlayerRef.current = null;
      }

      // 2. Resolve Stream URL (from Signed Playback Token API or local fallback)
      let streamUrl: string | null = null;
      const videoAssetId = activeLecture?.videoAsset?.id;

      if (videoAssetId) {
        try {
          const res = await fetch(`/api/videos/${videoAssetId}/playback-token`);
          if (res.ok) {
            const data = await res.json();
            if (data.playbackUrl) {
              streamUrl = data.playbackUrl;
            }
          }
        } catch {
          // Continue to fallback
        }
      }

      // Fallback to pre-computed HLS or direct MP4
      if (!streamUrl) {
        const videoAsset = activeLecture?.videoAsset;
        const isHlsReady = videoAsset?.status === "READY" && videoAsset.masterPlaylistKey;
        streamUrl = isHlsReady ? `/api/videos/hls/${videoAsset.masterPlaylistKey}` : resolvedVideoSrc;
      }

      if (isCancelled || !streamUrl) return;

      // 3. Initialize Google Shaka Player
      try {
        const shakaModule = (await import("shaka-player/dist/shaka-player.compiled.js")) as any;
        const shaka = shakaModule.default || shakaModule;

        shaka.polyfill?.installAll?.();

        if (shaka.Player?.isBrowserSupported?.()) {
          const player = new shaka.Player(video);
          shakaPlayerRef.current = player;

          player.configure({
            streaming: {
              bufferingGoal: 30,
              rebufferingGoal: 2,
              bufferBehind: 30,
              retryParameters: { maxAttempts: 4, baseDelay: 1000, backoffFactor: 2 },
            },
            abr: { enabled: true, defaultBandwidthEstimate: 2500000 },
          });

          player.addEventListener("adaptation", () => {
            if (!isCancelled && player) {
              const rawTracks = player.getVariantTracks();
              updateShakaQualityLevels(rawTracks);
            }
          });

          player.addEventListener("error", (event: any) => {
            console.warn("[Shaka Player Notice]:", event?.detail);
          });

          await player.load(streamUrl);

          if (!isCancelled) {
            const rawTracks = player.getVariantTracks();
            updateShakaQualityLevels(rawTracks);
            setSelectedQuality(-1);
          }
          return;
        }
      } catch (shakaErr: any) {
        console.warn("[Shaka Player Fallback]:", shakaErr?.message);
      }

      // 4. Native HTML5 Video Fallback (e.g. Safari native HLS or Direct MP4)
      if (!isCancelled && video) {
        video.src = streamUrl;
        setHlsLevels([]);
      }
    }

    function updateShakaQualityLevels(rawTracks: any[]) {
      if (!rawTracks || rawTracks.length === 0) return;
      const seen = new Set<number>();
      const levels: Array<{ id: number; name: string; height: number }> = [];
      const sorted = [...rawTracks].sort((a, b) => (b.height || 0) - (a.height || 0));

      for (const t of sorted) {
        const h = t.height || 0;
        if (h > 0 && !seen.has(h)) {
          seen.add(h);
          levels.push({
            id: t.id,
            name: `${h}p`,
            height: h,
          });
        }
      }
      setHlsLevels(levels);
    }

    setupPlayback();

    return () => {
      isCancelled = true;
      if (shakaPlayerRef.current) {
        shakaPlayerRef.current.destroy().catch(() => {});
        shakaPlayerRef.current = null;
      }
    };
  }, [activeLecture, resolvedVideoSrc]);

  const handleSelectQuality = (lvlIndex: number) => {
    setSelectedQuality(lvlIndex);
    const player = shakaPlayerRef.current;
    if (player) {
      if (lvlIndex === -1) {
        player.configure({ abr: { enabled: true } });
      } else {
        player.configure({ abr: { enabled: false } });
        const rawTracks = player.getVariantTracks();
        const targetTrack = rawTracks.find((t: any) => t.id === lvlIndex);
        if (targetTrack) {
          player.selectVariantTrack(targetTrack, true);
        }
      }
    }
    setIsQualityMenuOpen(false);
  };

  // ── 10B. DISCOVER ALL PDF DOCUMENTS & RESOURCES IN ACTIVE LECTURE ──
  const lecturePdfResources = useMemo(() => {
    const list: Array<{ title: string; url: string; size?: string; type?: string }> = [];
    if (activeLecture?.starterFileUrl) {
      const resolved = resolveFileUrl(activeLecture.starterFileUrl);
      if (resolved) {
        list.push({
          title: activeLecture.starterFileName || `${activeLecture.title} - Blueprint.pdf`,
          url: resolved,
          size: "3.2 MB",
          type: "PDF",
        });
      }
    }
    if (activeLecture?.resources && activeLecture.resources.length > 0) {
      activeLecture.resources.forEach((r) => {
        if (r.url) {
          const resolved = resolveFileUrl(r.url);
          if (resolved) {
            const isPdf = r.url.toLowerCase().endsWith(".pdf") || r.type?.toLowerCase() === "pdf" || r.url.includes("pdf");
            list.push({
              title: r.title || "Lecture Resource Document.pdf",
              url: resolved,
              size: r.size || "2.4 MB",
              type: isPdf ? "PDF" : r.type || "Document",
            });
          }
        }
      });
    }
    return list;
  }, [activeLecture]);

  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [resourceTab, setResourceTab] = useState<"blueprint" | "pdf">("blueprint");

  useEffect(() => {
    if (lecturePdfResources.length > 0) {
      setActivePdfUrl(lecturePdfResources[0].url);
      if (activeLecture?.type === "resource") {
        setResourceTab("pdf");
      }
    } else {
      setActivePdfUrl(null);
      setResourceTab("blueprint");
    }
  }, [activeLectureId, lecturePdfResources, activeLecture?.type]);

  // ── 11. SWITCH ACTIVE LECTURE ──
  const handleSelectLecture = (lec: StudioLecture, desiredStage?: "video" | "concept" | "code" | "quiz") => {
    setActiveLectureId(lec.id);

    // Determine appropriate stage
    if (desiredStage) {
      setActiveStage(desiredStage);
    } else if (lec.type === "quiz") {
      setActiveStage("quiz");
    } else if (lec.type === "concept" || lec.type === "article" || lec.type === "resource") {
      setActiveStage("concept");
    } else if (lec.type === "code" || lec.type === "sandbox") {
      setActiveStage("code");
    } else {
      setActiveStage("video");
    }

    // Reset quiz for new lecture
    setCurrentQuizIdx(0);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);

    // Update code sandbox if lecture provides snippet
    if (lec.sandboxCode) setCodeSnippet(lec.sandboxCode);
    if (lec.sandboxLang) setCodeLanguage(lec.sandboxLang);

    showToast(`Loaded: ${lec.title}`);

    // Persist user study activity for this lecture
    saveVideoProgress(lec.id, 0, completedIds.has(lec.id), lec.title);
  };

  // ── 12. VIDEO PROGRESS AUTOSAVE ──
  const saveVideoProgress = async (
    lectureId: string,
    progressSec: number,
    completed: boolean = false,
    overrideTitle?: string
  ) => {
    try {
      await fetch("/api/video-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId,
          progressSeconds: Math.floor(progressSec),
          isCompleted: completed,
          courseId: course.id,
          lectureTitle: overrideTitle || activeLecture?.title || "Current Lecture",
        }),
      });

      if (completed) {
        setCompletedIds((prev) => new Set([...prev, lectureId]));
      }
    } catch (err) {
      console.warn("Autosave progress notice:", err);
    }
  };

  // Ping active study progress on mount
  useEffect(() => {
    if (activeLecture) {
      saveVideoProgress(
        activeLecture.id,
        lastTimestamp || 0,
        completedIds.has(activeLecture.id),
        activeLecture.title
      );
    }
  }, []);

  // Video time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1458;
    setCurrentTime(cur);
    setDuration(dur);

    // If watched >= 90% and not yet completed
    if (cur / dur >= 0.9 && activeLecture && !completedIds.has(activeLecture.id)) {
      setCompletedIds((prev) => new Set([...prev, activeLecture.id]));
      saveVideoProgress(activeLecture.id, cur, true);
      triggerCelebration();
      showToast(`🎉 Lecture completed! +100 XP awarded!`);
    }
  };

  // Save progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying && activeLecture) {
        saveVideoProgress(activeLecture.id, videoRef.current.currentTime, completedIds.has(activeLecture.id));
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [isPlaying, activeLecture, completedIds]);

  // Video play/pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (sec: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + sec));
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ── 13. NOTES HANDLING ──
  const handleAddNote = async () => {
    if (!noteInput.trim() || !activeLecture) return;
    setIsSavingNote(true);

    const timestampSec = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;

    try {
      const res = await fetch("/api/student/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: activeLecture.id,
          timestampSeconds: timestampSec,
          content: noteInput.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.note) {
          setNotes((prev) => [data.note, ...prev]);
          setNoteInput("");
          showToast(`📝 Note saved at ${formatTime(timestampSec)}!`);
        }
      }
    } catch (err) {
      console.error("Save note error:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/student/notes?noteId=${noteId}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        showToast("Note deleted");
      }
    } catch (err) {}
  };

  // ── 14. CODE SANDBOX EXECUTION ──
  const handleRunCode = async () => {
    if (isRunningCode) return;
    setIsRunningCode(true);
    setTerminalOutput("🚀 Running script in live runtime environment...\n--------------------------------------------------");

    try {
      const res = await fetch("/api/sandbox/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeSnippet,
          language: codeLanguage || "python",
        }),
      });

      const data = await res.json();
      const execTime = data.executionTimeMs ? `${(data.executionTimeMs / 1000).toFixed(2)}s` : "0.08s";

      if (data.output) {
        setTerminalOutput(
          `[Runtime ${codeLanguage === "javascript" ? "Node.js" : "Python 3.12"} · Process finished in ${execTime}]\n` +
            `--------------------------------------------------\n` +
            data.output
        );
      } else {
        setTerminalOutput(`[Process finished with no output]`);
      }

      if (data.success) {
        triggerCelebration();
        showToast("✅ Code executed successfully!");
      } else {
        showToast("⚠️ Execution completed with errors");
      }
    } catch (err: any) {
      // Fallback client-side execution
      let fallbackOut = "";
      try {
        if (codeLanguage === "javascript" || codeLanguage === "js") {
          const logs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
            error: (...args: any[]) => logs.push(`Error: ` + args.join(" ")),
            warn: (...args: any[]) => logs.push(`Warn: ` + args.join(" ")),
          };
          const fn = new Function("console", codeSnippet);
          fn(customConsole);
          fallbackOut = logs.join("\n");
        } else {
          const printMatches = [...codeSnippet.matchAll(/print\s*\((.*?)\)/g)];
          if (printMatches.length > 0) {
            fallbackOut = printMatches
              .map((m) => {
                const inner = m[1].trim();
                if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
                  return inner.slice(1, -1);
                }
                return inner;
              })
              .join("\n");
          }
        }
      } catch (e: any) {
        fallbackOut = `Error: ${e.message}`;
      }

      setTerminalOutput(
        `[Local Execution]\n` +
          `--------------------------------------------------\n` +
          (fallbackOut || `Code executed with no output`)
      );
      showToast("Code executed");
    } finally {
      setIsRunningCode(false);
    }
  };

  // ── 15. QUIZ ENGINE HANDLERS ──
  const currentQuestion = defaultQuiz[currentQuizIdx] || defaultQuiz[0];

  const handleSelectQuizOption = (optId: string) => {
    if (quizSubmitted) return;
    setSelectedQuizOption(optId);
  };

  const handleSubmitQuizAnswer = () => {
    if (!selectedQuizOption || !currentQuestion) return;
    setQuizSubmitted(true);

    const isCorrect =
      String(selectedQuizOption).trim().toUpperCase() === String(currentQuestion.correct).trim().toUpperCase();

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      triggerCelebration();
      showToast("🎯 Correct! +150 XP earned!");
    } else {
      showToast("❌ Incorrect. Check the explanation below.");
    }

    // If last question
    if (currentQuizIdx === defaultQuiz.length - 1) {
      setIsQuizPassed(true);
      if (activeLecture) {
        setCompletedIds((prev) => new Set([...prev, activeLecture.id]));
        saveVideoProgress(activeLecture.id, 100, true);
      }
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx < defaultQuiz.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
    }
  };

  // ── 16. AI COPILOT CHAT HANDLER ──
  const handleSendCopilot = (customPrompt?: string) => {
    const text = customPrompt || copilotInput;
    if (!text || !text.trim()) return;

    const userMsg = { role: "user" as const, text: text.trim(), time: "Now" };
    setCopilotMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setCopilotInput("");
    setIsCopilotThinking(true);

    setTimeout(() => {
      setIsCopilotThinking(false);
      let reply = `In this lecture on **${activeLecture?.title || "Multi-Agent Workflows"}**, the key idea is stateful orchestration where nodes consume input state and return dictionary deltas merged via typed reducers (like \`operator.add\`).`;
      if (text.toLowerCase().includes("quiz") || text.toLowerCase().includes("question")) {
        reply = `Here is a practice quiz question:\n\n**Q: What prevents circular loops in multi-agent critique graphs?**\n*Answer:* Setting an iteration limit in the StateGraph schema (e.g. \`max_iterations = 10\`).`;
      } else if (text.toLowerCase().includes("code") || text.toLowerCase().includes("example")) {
        reply = `Here is a minimal state reducer example:\n\`\`\`python\nclass State(TypedDict):\n    messages: Annotated[List[str], operator.add]\n\`\`\``;
      }

      setCopilotMessages((prev) => [...prev, { role: "ai", text: reply, time: "Just now" }]);
    }, 1100);
  };

  // ── 16B. TOGGLE LECTURE COMPLETION CHECKLIST ──
  const handleToggleComplete = (lectureId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setCompletedIds((prev) => {
      const next = new Set(prev);
      const willBeCompleted = !next.has(lectureId);
      if (willBeCompleted) {
        next.add(lectureId);
        saveVideoProgress(lectureId, duration || 100, true);
        triggerCelebration();
        showToast("✅ Marked as completed!");
      } else {
        next.delete(lectureId);
        saveVideoProgress(lectureId, 0, false);
        showToast("Marked as incomplete");
      }
      return next;
    });
  };

  // ── 17. ADVANCE TO NEXT LESSON ──
  const handleAdvanceLesson = () => {
    if (activeLecture) {
      setCompletedIds((prev) => new Set([...prev, activeLecture.id]));
      saveVideoProgress(activeLecture.id, duration || 100, true);
      triggerCelebration();
      showToast(`✅ "${activeLecture.title}" completed!`);
    }

    const curIdx = allLectures.findIndex((l) => l.id === activeLectureId);
    if (curIdx >= 0 && curIdx < allLectures.length - 1) {
      const nextLec = allLectures[curIdx + 1];
      handleSelectLecture(nextLec);
    } else {
      triggerCelebration();
      showToast("🏆 Congratulations! You have completed all course modules!");
    }
  };

  const handlePrevLesson = () => {
    const curIdx = allLectures.findIndex((l) => l.id === activeLectureId);
    if (curIdx > 0) {
      const prevLec = allLectures[curIdx - 1];
      handleSelectLecture(prevLec);
    }
  };

  // Overall stats
  const totalCompleted = completedIds.size;
  const progressPercent = allLectures.length > 0 ? Math.round((totalCompleted / allLectures.length) * 100) : 0;

  // Filtered modules for syllabus
  const filteredModules = useMemo(() => {
    return course.modules
      .map((mod) => {
        const filteredLectures = mod.lectures.filter((lec) => {
          const isDone = completedIds.has(lec.id);
          if (syllabusFilter === "completed" && !isDone) return false;
          if (syllabusFilter === "remaining" && isDone) return false;
          if (syllabusSearch.trim()) {
            const q = syllabusSearch.toLowerCase();
            return lec.title.toLowerCase().includes(q) || mod.title.toLowerCase().includes(q);
          }
          return true;
        });
        return {
          ...mod,
          lectures: filteredLectures,
        };
      })
      .filter((mod) => mod.lectures.length > 0 || !syllabusSearch.trim());
  }, [course.modules, completedIds, syllabusFilter, syllabusSearch]);

  return (
    <div className={`learning-studio-root ${theme} ${isFocusMode ? "focus-mode" : ""}`}>
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="custom-studio-toast animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP STUDIO HEADER ── */}
      <header className="studio-header">
        <div className="header-left">
          <Link
            href="/student/courses"
            className="studio-brand-container group"
            title="Back to My Enrolled Courses"
          >
            <Logo className="h-7 sm:h-8 w-auto" />
            <div className="studio-brand-pill">
              <span className="pro-tag">PRO</span>
              <span>STUDIO</span>
            </div>
          </Link>

          <div className="header-divider-v" />

          <div className="course-title-chip">
            <span className="course-badge-pill">{course.category || "AI & CLOUD"}</span>
            <h2 className="course-name-h2" title={course.title}>
              {course.title}
            </h2>
          </div>
        </div>

        <div className="header-right">
          {/* Progress Pill */}
          <div className="progress-pill-compact" title={`${totalCompleted} of ${allLectures.length} lessons completed`}>
            <div className="progress-radial-mini">
              <div className="radial-bar" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="pct-label">{progressPercent}% Completed</span>
          </div>

          {/* XP Badge */}
          <div className="stat-badge xp-badge">
            <i className="fa-solid fa-bolt text-amber"></i>
            <span>{4850 + totalCompleted * 100} XP</span>
          </div>

          {/* Theme Switcher Button */}
          <div className="relative">
            <button
              className="icon-btn"
              title="Theme Picker"
              onClick={() => setIsThemeMenuOpen((prev) => !prev)}
            >
              <i className="fa-solid fa-palette"></i>
            </button>

            {isThemeMenuOpen && (
              <div className="theme-menu open animate-slide-down">
                <div
                  className={`theme-option ${theme === "theme-nebula" ? "active" : ""}`}
                  onClick={() => {
                    setTheme("theme-nebula");
                    setIsThemeMenuOpen(false);
                    showToast("Switched to Midnight Nebula (Dark)");
                  }}
                >
                  <span className="dot dot-nebula" /> Midnight Nebula
                </div>
                <div
                  className={`theme-option ${theme === "theme-light-luxe" ? "active" : ""}`}
                  onClick={() => {
                    setTheme("theme-light-luxe");
                    setIsThemeMenuOpen(false);
                    showToast("Switched to Alpine Crystal (Light Luxe)");
                  }}
                >
                  <span className="dot dot-light" /> Alpine Crystal Luxe
                </div>
                <div
                  className={`theme-option ${theme === "theme-obsidian" ? "active" : ""}`}
                  onClick={() => {
                    setTheme("theme-obsidian");
                    setIsThemeMenuOpen(false);
                    showToast("Switched to Obsidian Gold");
                  }}
                >
                  <span className="dot dot-obsidian" /> Obsidian Gold
                </div>
                <div
                  className={`theme-option ${theme === "theme-cyber" ? "active" : ""}`}
                  onClick={() => {
                    setTheme("theme-cyber");
                    setIsThemeMenuOpen(false);
                    showToast("Switched to Cyberpunk Emerald");
                  }}
                >
                  <span className="dot dot-cyber" /> Cyber Emerald
                </div>
              </div>
            )}
          </div>

          {/* Zen Focus Mode Button */}
          <button
            className={`icon-btn ${isFocusMode ? "active" : ""}`}
            title={isFocusMode ? "Exit Focus Mode" : "Zen Focus Mode"}
            onClick={() => {
              setIsFocusMode((prev) => !prev);
              showToast(isFocusMode ? "Standard view restored" : "Zen Focus Mode enabled");
            }}
          >
            <i className={`fa-solid ${isFocusMode ? "fa-compress" : "fa-expand"}`}></i>
          </button>

          {/* AI Copilot Toggle */}
          <button
            className={`icon-btn btn-ai-sparkle ${activeSideTab === "copilot" ? "active" : ""}`}
            title="Open AI Copilot Tutor"
            onClick={() => setActiveSideTab("copilot")}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </button>

          {/* Exit Studio Button */}
          <Link
            href="/student/courses"
            className="icon-btn"
            title="Exit Studio / Back to Dashboard"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </Link>

          {/* Student Profile Avatar */}
          <div className="student-profile-chip" title={`${user.name} · Enrolled Scholar`}>
            <div className="avatar-ring">
              <span className="avatar-text">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "ST"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN LEARNING WORKSPACE ── */}
      <div className="studio-body" id="studioBody">
        {/* ── PRIMARY STAGE (LEFT / CENTER) ── */}
        <main className={`stage-viewport ${isTheaterMode ? "theater-mode" : ""}`} id="stageViewport">
          {/* STAGE MODE SWITCHER TABS */}
          <div className="stage-navigation-tabs">
            <div className="tabs-group">
              <button
                className={`stage-tab ${activeStage === "video" ? "active" : ""}`}
                onClick={() => setActiveStage("video")}
              >
                <i className="fa-solid fa-circle-play"></i>
                <span>1. Video Lecture</span>
                <span className="time-tag">{activeLecture?.duration || "24 min"}</span>
              </button>

              <button
                className={`stage-tab ${activeStage === "code" ? "active" : ""}`}
                onClick={() => setActiveStage("code")}
              >
                <i className="fa-solid fa-code"></i>
                <span>2. Live Code Sandbox</span>
                <span className="pill-badge-interactive">Interactive</span>
              </button>
            </div>

            <div className="stage-actions-quick">
              <button
                className="btn-pill-subtle"
                onClick={() => {
                  setActiveDrawerTab("notes");
                  const timeSec = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;
                  setNoteInput(`Note at ${formatTime(timeSec)}: `);
                }}
              >
                <i className="fa-solid fa-pencil"></i>
                <span>Add Timestamped Note</span>
              </button>
            </div>
          </div>

          {/* ── DYNAMIC STAGE CONTAINER CARD ── */}
          <div className="stage-card" id="stageCard">
            {/* 1. VIDEO LECTURE STAGE */}
            {activeStage === "video" && (
              <div className="stage-view active" id="stageViewVideo">
                {isYouTubeVideo ? (
                  <div className={`video-container youtube-player-mode ${isVideoFullscreen ? "fullscreen-active" : ""}`} id="videoWrapper">
                    <YouTubePlayer
                      videoIdOrUrl={activeLecture?.videoAsset?.providerVideoId || activeLecture?.videoUrl || ""}
                      initialTime={lastTimestamp || 0}
                      watermarkText={`GA · ${user.name?.split(" ")[0] || "Student"}`}
                      onTimeUpdate={(cur, dur) => {
                        setCurrentTime(cur);
                        setDuration(dur);
                        if (dur > 0 && cur / dur >= 0.9 && activeLecture && !completedIds.has(activeLecture.id)) {
                          setCompletedIds((prev) => new Set([...prev, activeLecture.id]));
                          saveVideoProgress(activeLecture.id, cur, true);
                          triggerCelebration();
                          showToast(`🎉 Lecture completed! +100 XP awarded!`);
                        }
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => {
                        setIsPlaying(false);
                        if (activeLecture && !completedIds.has(activeLecture.id)) {
                          setCompletedIds((prev) => new Set([...prev, activeLecture.id]));
                          saveVideoProgress(activeLecture.id, duration || 100, true);
                          triggerCelebration();
                          showToast(`🎉 Lecture completed! +100 XP awarded!`);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className={`video-container ${isVideoFullscreen ? "fullscreen-active" : ""}`} id="videoWrapper">
                    <video
                      ref={videoRef}
                      playsInline
                      preload="metadata"
                      poster={
                        activeLecture?.videoAsset?.thumbnailKey
                          ? `/api/storage/file?key=${encodeURIComponent(activeLecture.videoAsset.thumbnailKey)}`
                          : undefined
                      }
                      onTimeUpdate={handleTimeUpdate}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onClick={togglePlay}
                      onDoubleClick={toggleVideoFullscreen}
                    />

                  {/* Big Center Play Button Overlay */}
                  {!isPlaying && (
                    <div className="video-big-play-btn" onClick={togglePlay}>
                      <div className="big-play-icon-ring">
                        <i className="fa-solid fa-play"></i>
                      </div>
                      <span className="big-play-label">Resume Lecture (Space)</span>
                    </div>
                  )}

                  {/* Small Sleek Video Watermark */}
                  <div className="video-watermark-overlay">
                    <span className="watermark-dot"></span>
                    <span>GA · {user.name?.split(" ")[0] || "Student"}</span>
                  </div>

                  {/* Video Control Bar */}
                  <div className="video-controls-overlay">
                    {/* Scrubber Timeline */}
                    <div
                      className="video-timeline-wrapper"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const pct = Math.max(0, Math.min(1, clickX / rect.width));
                        if (videoRef.current) {
                          videoRef.current.currentTime = pct * duration;
                        }
                      }}
                    >
                      <div
                        className="video-played-progress"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                      <div
                        className="video-handle-dot"
                        style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>

                    {/* Bottom Controls Row */}
                    <div className="controls-row">
                      <div className="controls-left">
                        <button className="ctrl-btn" onClick={togglePlay}>
                          <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
                        </button>
                        <button className="ctrl-btn" onClick={() => seekRelative(-10)} title="Rewind 10s">
                          <i className="fa-solid fa-rotate-left"></i>
                        </button>
                        <button className="ctrl-btn" onClick={() => seekRelative(10)} title="Forward 10s">
                          <i className="fa-solid fa-rotate-right"></i>
                        </button>

                        <div className="volume-control-group">
                          <button
                            className="ctrl-btn"
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.muted = !isMuted;
                                setIsMuted(!isMuted);
                              }
                            }}
                          >
                            <i
                              className={`fa-solid ${
                                isMuted || volume === 0 ? "fa-volume-xmark" : volume < 0.5 ? "fa-volume-low" : "fa-volume-high"
                              }`}
                            ></i>
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setVolume(val);
                              setIsMuted(val === 0);
                              if (videoRef.current) {
                                videoRef.current.volume = val;
                                videoRef.current.muted = val === 0;
                              }
                            }}
                            className="volume-slider-bar"
                          />
                        </div>

                        <span className="timestamp-badge">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="controls-right">
                        {/* HLS Adaptive Quality Selector */}
                        {hlsLevels.length > 0 && (
                          <div className="relative">
                            <button
                              className="speed-pill-btn"
                              onClick={() => setIsQualityMenuOpen((prev) => !prev)}
                              title="Streaming Quality"
                            >
                              <span>
                                <i className="fa-solid fa-sliders text-[10px] mr-1"></i>
                                {selectedQuality === -1 ? "Auto" : hlsLevels[selectedQuality]?.name || "HD"}
                              </span>
                            </button>
                            {isQualityMenuOpen && (
                              <div className="speed-dropdown-menu open animate-slide-down">
                                <div
                                  className={`speed-option-item ${selectedQuality === -1 ? "active" : ""}`}
                                  onClick={() => handleSelectQuality(-1)}
                                >
                                  Auto (Adaptive)
                                </div>
                                {hlsLevels.map((lvl) => (
                                  <div
                                    key={lvl.id}
                                    className={`speed-option-item ${selectedQuality === lvl.id ? "active" : ""}`}
                                    onClick={() => handleSelectQuality(lvl.id)}
                                  >
                                    {lvl.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Playback Speed */}
                        <div className="relative">
                          <button
                            className="speed-pill-btn"
                            onClick={() => setIsSpeedMenuOpen((prev) => !prev)}
                          >
                            <span>{playbackSpeed}x</span>
                          </button>
                          {isSpeedMenuOpen && (
                            <div className="speed-dropdown-menu open animate-slide-down">
                              {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                                <div
                                  key={spd}
                                  className={`speed-option-item ${playbackSpeed === spd ? "active" : ""}`}
                                  onClick={() => {
                                    setPlaybackSpeed(spd);
                                    if (videoRef.current) videoRef.current.playbackRate = spd;
                                    setIsSpeedMenuOpen(false);
                                  }}
                                >
                                  {spd}x
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Theater Mode */}
                        <button
                          className="ctrl-btn"
                          title="Toggle Theater Mode"
                          onClick={() => setIsTheaterMode((prev) => !prev)}
                        >
                          <i className="fa-solid fa-film"></i>
                        </button>

                        {/* Fullscreen for video part only */}
                        <button
                          className="ctrl-btn"
                          title={isVideoFullscreen ? "Exit Fullscreen" : "Video Fullscreen"}
                          onClick={toggleVideoFullscreen}
                        >
                          <i className={`fa-solid ${isVideoFullscreen ? "fa-compress" : "fa-expand"}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}

            {/* 2. ARCHITECTURE DEEP DIVE / CONCEPT / PDF STAGE */}
            {activeStage === "concept" && (
              <div
                className={`stage-view active p-6 overflow-y-auto max-h-[580px] ${
                  isResourceFullscreen ? "resource-fullscreen-mode" : ""
                }`}
                id="stageViewConcept"
              >
                {/* Floating Exit Fullscreen Button when in Fullscreen */}
                {isResourceFullscreen && (
                  <button className="exit-fullscreen-floating-btn" onClick={toggleResourceFullscreen}>
                    <i className="fa-solid fa-compress"></i>
                    <span>Exit Fullscreen</span>
                  </button>
                )}

                <div className="architecture-concept-container space-y-6">
                  {/* Stage Header & Actions */}
                  <div className="concept-hero-header flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card/60 pb-4">
                    <div>
                      <span className="badge-cyan uppercase font-bold text-xs tracking-wider">
                        {lecturePdfResources.length > 0
                          ? "Interactive Technical Resources & PDF Document Reader"
                          : "Architecture Deep Dive & System Blueprint"}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black mt-1.5">{activeLecture?.title}</h2>
                      <p className="text-subtext text-xs sm:text-sm mt-1">
                        {activeLecture?.description ||
                          "In-depth architectural breakdown, state schema reducers, and technical document reference."}
                      </p>
                    </div>

                    {/* Action Buttons & Tabs */}
                    <div className="flex items-center flex-wrap gap-2 shrink-0">
                      {lecturePdfResources.length > 0 && (
                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                          <button
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              resourceTab === "blueprint"
                                ? "bg-primary text-white shadow"
                                : "text-subtext hover:text-white"
                            }`}
                            onClick={() => setResourceTab("blueprint")}
                          >
                            <i className="fa-solid fa-diagram-project mr-1.5"></i> Blueprint Notes
                          </button>
                          <button
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              resourceTab === "pdf"
                                ? "bg-primary text-white shadow"
                                : "text-subtext hover:text-white"
                            }`}
                            onClick={() => setResourceTab("pdf")}
                          >
                            <i className="fa-solid fa-file-pdf mr-1.5 text-rose-400"></i> PDF Reader ({lecturePdfResources.length})
                          </button>
                        </div>
                      )}

                      {/* Fullscreen Button for Resources */}
                      <button
                        className="btn-pill-subtle"
                        title={isResourceFullscreen ? "Exit Fullscreen" : "Fullscreen Document View"}
                        onClick={toggleResourceFullscreen}
                      >
                        <i className={`fa-solid ${isResourceFullscreen ? "fa-compress" : "fa-expand"}`}></i>
                        <span>{isResourceFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                      </button>

                      {/* Download / Open in Tab if PDF */}
                      {activePdfUrl && (
                        <a
                          href={activePdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-pill-subtle"
                          title="Open document in new browser tab"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                          <span>Open Tab</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 1. EMBEDDED PDF VIEWER (When in PDF mode or PDF active) */}
                  {resourceTab === "pdf" && activePdfUrl && (
                    <div className="pdf-viewer-wrapper space-y-3">
                      {/* Document Selector Bar if multiple PDFs */}
                      {lecturePdfResources.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          <span className="text-xs font-bold text-subtext shrink-0">Available Documents:</span>
                          {lecturePdfResources.map((doc, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActivePdfUrl(doc.url)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                                activePdfUrl === doc.url
                                  ? "bg-primary/20 border border-primary text-white"
                                  : "bg-card hover:bg-card/80 border border-card text-subtext hover:text-white"
                              }`}
                            >
                              <i className="fa-solid fa-file-pdf text-rose-400"></i>
                              <span>{doc.title}</span>
                              <span className="text-[10px] opacity-70">({doc.size || "PDF"})</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Embedded Interactive Frame Container */}
                      <div className="pdf-viewer-frame-container">
                        <iframe
                          src={`${activePdfUrl}#toolbar=1&navpanes=1`}
                          className="pdf-embedded-frame"
                          title="PDF Viewer"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. BLUEPRINT & ARCHITECTURE NOTES VIEW */}
                  {(resourceTab === "blueprint" || !activePdfUrl) && (
                    <>
                      {/* Architecture Diagram Cards */}
                      <div className="architecture-diagram-card p-5 rounded-2xl bg-card border border-card shadow-lg">
                        <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                          <i className="fa-solid fa-diagram-project"></i> Core System Workflow Diagram
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="graph-node active p-3 rounded-xl border border-primary/40 bg-primary/10">
                            <span className="font-bold text-primary">1. Input Ingestion</span>
                            <p className="text-subtext mt-1">Parses user prompt, verifies authentication token, injects session metadata into graph state.</p>
                          </div>
                          <div className="graph-node p-3 rounded-xl border border-card bg-card/60">
                            <span className="font-bold text-emerald-400">2. Planner & Execution</span>
                            <p className="text-subtext mt-1">Decomposes multi-step tasks into tool actions, executes vector searches, and calls tool runners.</p>
                          </div>
                          <div className="graph-node p-3 rounded-xl border border-card bg-card/60">
                            <span className="font-bold text-amber-400">3. Reflection & Critique</span>
                            <p className="text-subtext mt-1">Evaluates faithfulness against grounding chunks. Loops back if score &lt; 0.85 threshold.</p>
                          </div>
                        </div>
                      </div>

                      {/* Markdown / Technical Content */}
                      <div className="theory-grid-card p-5 rounded-2xl bg-card/50 border border-card text-xs sm:text-sm space-y-3 leading-relaxed">
                        <h4 className="font-bold text-text">Key Takeaways & Production Implementation</h4>
                        <div className="text-subtext whitespace-pre-wrap">
                          {activeLecture?.notesContent ||
                            activeLecture?.articleContent ||
                            "Stateful multi-agent systems rely on deterministic contracts. By utilizing TypedDict schemas with custom operator reducers, nodes collaborate cleanly without erasing past dialogue histories."}
                        </div>
                        <div className="takeaway-callout p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs">
                          💡 <strong>Pro Tip:</strong> Always define an explicit <code>max_iterations</code> counter to guard against infinite reflection loops in production environments.
                        </div>
                      </div>

                      {/* Attached Downloadable Resources List */}
                      {lecturePdfResources.length > 0 && (
                        <div className="attached-resources-card p-5 rounded-2xl bg-card/40 border border-card">
                          <h4 className="text-xs font-bold text-subtext uppercase tracking-wider mb-3">
                            <i className="fa-solid fa-folder-open text-primary mr-2"></i> Attached Documents & Resources ({lecturePdfResources.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {lecturePdfResources.map((res, i) => (
                              <div
                                key={i}
                                className="p-3.5 rounded-xl bg-background/60 border border-card hover:border-primary/40 flex items-center justify-between group transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <i className="fa-solid fa-file-pdf text-rose-400 text-lg"></i>
                                  <div>
                                    <span className="font-bold text-text text-xs group-hover:text-primary block">{res.title}</span>
                                    <span className="text-[10px] text-subtext">{res.type || "PDF"} · {res.size || "1.5 MB"}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setActivePdfUrl(res.url);
                                      setResourceTab("pdf");
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all"
                                    title="View in interactive reader"
                                  >
                                    View
                                  </button>
                                  <a
                                    href={res.url}
                                    download
                                    className="p-1.5 rounded-lg bg-card hover:bg-card/80 text-subtext hover:text-white transition-all"
                                    title="Download file"
                                  >
                                    <i className="fa-solid fa-download text-xs"></i>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 3. LIVE CODE SANDBOX STAGE */}
            {activeStage === "code" && (
              <div className="stage-view active flex flex-col h-[580px]" id="stageViewCode">
                <div className="sandbox-header-bar flex items-center justify-between p-3 border-b border-card bg-card/80">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      {codeLanguage.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-subtext">main_workflow.py</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg bg-card hover:bg-card/80 border border-card text-xs font-bold text-subtext hover:text-text transition-all"
                      onClick={() => {
                        setCodeSnippet(activeLecture?.sandboxCode || `# Code reset\nprint("Ready")`);
                        showToast("Code reset to starter template");
                      }}
                    >
                      <i className="fa-solid fa-rotate-left mr-1"></i> Reset
                    </button>
                    <button
                      className="btn-gradient px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-primary/30"
                      onClick={handleRunCode}
                      disabled={isRunningCode}
                    >
                      <i className={`fa-solid ${isRunningCode ? "fa-spinner fa-spin" : "fa-play"}`}></i>
                      <span>{isRunningCode ? "Executing..." : "Run Code"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                  <div className="h-full border-r border-card">
                    <Editor
                      height="100%"
                      theme="vs-dark"
                      language={codeLanguage === "javascript" ? "javascript" : "python"}
                      value={codeSnippet}
                      onChange={(val) => setCodeSnippet(val || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                  <div className="p-4 bg-black/80 font-mono text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap">
                    <div className="text-[11px] text-subtext font-sans font-bold border-b border-white/10 pb-2 mb-2 flex justify-between">
                      <span>TERMINAL CONSOLE</span>
                      <span className="text-emerald-400">● LIVE RUNTIME</span>
                    </div>
                    {terminalOutput}
                  </div>
                </div>
              </div>
            )}

            {/* 4. KNOWLEDGE CHECK (QUIZ) STAGE */}
            {activeStage === "quiz" && (
              <div className="stage-view active p-6 overflow-y-auto max-h-[580px]" id="stageViewQuiz">
                <div className="quiz-container max-w-3xl mx-auto space-y-6">
                  <div className="quiz-header-row flex items-center justify-between border-b border-card pb-4">
                    <div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Checkpoint {currentQuizIdx + 1} of {defaultQuiz.length}
                      </span>
                      <h3 className="text-lg font-black text-text mt-1">Knowledge Check Checkpoint</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
                      +150 XP Reward
                    </span>
                  </div>

                  {/* Question Box */}
                  <div className="quiz-question-box p-4 rounded-2xl bg-card border border-card">
                    <h4 className="font-bold text-sm sm:text-base text-text leading-relaxed">
                      {currentQuestion.question}
                    </h4>
                  </div>

                  {/* Options List */}
                  <div className="quiz-options-list space-y-3">
                    {currentQuestion.options.map((opt: any) => {
                      const optId = typeof opt === "string" ? opt.slice(0, 1) : opt.id;
                      const optText = typeof opt === "string" ? opt : opt.text;
                      const isSelected = selectedQuizOption === optId;
                      const isCorrect = String(optId).trim().toUpperCase() === String(currentQuestion.correct).trim().toUpperCase();

                      let optClass = "quiz-option p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 text-xs sm:text-sm";
                      if (quizSubmitted) {
                        if (isCorrect) optClass += " bg-emerald-500/15 border-emerald-500 text-emerald-200 font-bold";
                        else if (isSelected) optClass += " bg-rose-500/15 border-rose-500 text-rose-200";
                        else optClass += " opacity-50 bg-card border-card";
                      } else {
                        optClass += isSelected
                          ? " bg-primary/20 border-primary text-text font-bold shadow-md shadow-primary/10"
                          : " bg-card hover:bg-card/80 border-card text-subtext hover:text-text";
                      }

                      return (
                        <div key={optId} className={optClass} onClick={() => handleSelectQuizOption(optId)}>
                          <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                            {optId}
                          </span>
                          <span className="flex-1">{optText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Banner (when submitted) */}
                  {quizSubmitted && (
                    <div className="p-4 rounded-xl bg-card border border-primary/30 text-xs text-subtext leading-relaxed animate-fade-in">
                      <strong className="text-text block mb-1">💡 Explanation:</strong>
                      {currentQuestion.explanation || "Reducers ensure state immutability while combining state deltas smoothly."}
                    </div>
                  )}

                  {/* Quiz Action Buttons */}
                  <div className="quiz-actions flex items-center justify-between pt-2">
                    <button
                      className="px-4 py-2 rounded-xl bg-card hover:bg-card/80 border border-card text-xs font-bold text-subtext hover:text-text"
                      onClick={() => showToast("💡 Hint: Look for how reducers combine message deltas.")}
                    >
                      <i className="fa-solid fa-lightbulb text-amber-400 mr-1.5"></i> Hint
                    </button>

                    {!quizSubmitted ? (
                      <button
                        className="btn-gradient px-6 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-primary/30"
                        onClick={handleSubmitQuizAnswer}
                        disabled={!selectedQuizOption}
                      >
                        Submit Answer
                      </button>
                    ) : currentQuizIdx < defaultQuiz.length - 1 ? (
                      <button
                        className="btn-gradient px-6 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-primary/30"
                        onClick={handleNextQuizQuestion}
                      >
                        Next Question <i className="fa-solid fa-arrow-right ml-1.5"></i>
                      </button>
                    ) : (
                      <button
                        className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                        onClick={handleAdvanceLesson}
                      >
                        Checkpoint Passed · Continue <i className="fa-solid fa-check ml-1.5"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── STAGE BOTTOM NAVIGATION & AUTOSAVE FOOTER ── */}
          <div className="stage-footer-bar flex items-center justify-between p-3 rounded-2xl bg-card border border-card">
            <button
              className="btn-nav px-4 py-2 rounded-xl bg-card/60 hover:bg-card border border-card text-xs font-bold text-subtext hover:text-text flex items-center gap-2"
              onClick={handlePrevLesson}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Previous</span>
            </button>

            <div className="footer-center-status flex items-center gap-2 text-xs text-subtext font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Autosaved progress</span>
            </div>

            <button
              className="btn-complete-next px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-primary/30"
              onClick={handleAdvanceLesson}
            >
              <i className="fa-solid fa-check"></i>
              <span>Complete & Proceed</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* ── TABBED DRAWER UNDER PLAYER ── */}
          <div className="studio-drawer mt-4 rounded-3xl bg-card border border-card overflow-hidden">
            <div className="drawer-header-tabs flex border-b border-card bg-card/40">
              <button
                className={`drawer-tab px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeDrawerTab === "notes" ? "border-primary text-text bg-primary/5" : "border-transparent text-subtext hover:text-text"
                }`}
                onClick={() => setActiveDrawerTab("notes")}
              >
                <i className="fa-solid fa-pencil"></i>
                <span>My Smart Notes ({notes.length})</span>
              </button>

              <button
                className={`drawer-tab px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeDrawerTab === "transcript" ? "border-primary text-text bg-primary/5" : "border-transparent text-subtext hover:text-text"
                }`}
                onClick={() => setActiveDrawerTab("transcript")}
              >
                <i className="fa-solid fa-file-lines"></i>
                <span>Interactive Transcript</span>
              </button>

              <button
                className={`drawer-tab px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeDrawerTab === "downloads" ? "border-primary text-text bg-primary/5" : "border-transparent text-subtext hover:text-text"
                }`}
                onClick={() => setActiveDrawerTab("downloads")}
              >
                <i className="fa-solid fa-folder-open"></i>
                <span>Downloads & Resources ({activeLecture?.resources?.length || 2})</span>
              </button>

              <button
                className={`drawer-tab px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeDrawerTab === "qa" ? "border-primary text-text bg-primary/5" : "border-transparent text-subtext hover:text-text"
                }`}
                onClick={() => setActiveDrawerTab("qa")}
              >
                <i className="fa-solid fa-comments"></i>
                <span>Class Discussion</span>
              </button>
            </div>

            {/* ── DRAWER CONTENT PANELS ── */}
            <div className="drawer-body p-5">
              {/* Tab 1: Smart Notes */}
              {activeDrawerTab === "notes" && (
                <div className="notes-panel space-y-4">
                  <div className="notes-composer flex flex-col sm:flex-row items-stretch gap-2">
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                      placeholder="Add timestamped note at current video position..."
                      className="flex-1 bg-background/80 border border-card rounded-xl px-4 py-2.5 text-xs text-text placeholder:text-subtext focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={isSavingNote || !noteInput.trim()}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 shrink-0 shadow-md shadow-primary/20"
                    >
                      <i className="fa-solid fa-floppy-disk"></i>
                      <span>{isSavingNote ? "Saving..." : "Save Note"}</span>
                    </button>
                  </div>

                  <div className="notes-list space-y-2 max-h-56 overflow-y-auto pr-1">
                    {notes.length === 0 ? (
                      <p className="text-xs text-subtext py-4 text-center">No notes saved for this lecture yet. Add your first note above!</p>
                    ) : (
                      notes.map((n) => (
                        <div key={n.id} className="note-item p-3 rounded-xl bg-background/60 border border-card flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span
                              className="px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30 font-mono font-bold cursor-pointer hover:bg-primary hover:text-white transition-all"
                              onClick={() => {
                                if (videoRef.current) {
                                  videoRef.current.currentTime = n.timestampSeconds;
                                  videoRef.current.play().catch(() => {});
                                  setActiveStage("video");
                                }
                              }}
                              title="Click to jump in video"
                            >
                              {formatTime(n.timestampSeconds)}
                            </span>
                            <span className="text-text">{n.content}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(n.id)}
                            className="text-subtext hover:text-rose-400 p-1"
                            title="Delete note"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Interactive Transcript */}
              {activeDrawerTab === "transcript" && (
                <div className="transcript-panel space-y-3">
                  <div className="transcript-list space-y-2 max-h-56 overflow-y-auto text-xs leading-relaxed">
                    <div
                      className="transcript-row p-2 rounded-lg hover:bg-primary/10 cursor-pointer flex gap-3 transition-colors"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          videoRef.current.play().catch(() => {});
                          setActiveStage("video");
                        }
                      }}
                    >
                      <span className="font-mono text-primary font-bold">00:00</span>
                      <span className="text-text">Welcome everyone. In this session we dive deep into stateful multi-agent architectures.</span>
                    </div>
                    <div
                      className="transcript-row p-2 rounded-lg hover:bg-primary/10 cursor-pointer flex gap-3 transition-colors"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 184;
                          videoRef.current.play().catch(() => {});
                          setActiveStage("video");
                        }
                      }}
                    >
                      <span className="font-mono text-primary font-bold">03:04</span>
                      <span className="text-text">Notice how the TypedDict schema ensures strong typing and deterministic state transitions.</span>
                    </div>
                    <div
                      className="transcript-row p-2 rounded-lg hover:bg-primary/10 cursor-pointer flex gap-3 transition-colors"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 462;
                          videoRef.current.play().catch(() => {});
                          setActiveStage("video");
                        }
                      }}
                    >
                      <span className="font-mono text-primary font-bold">07:42</span>
                      <span className="text-text">Conditional edges inspect output payloads to dynamically route between executor and reflection nodes.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Downloads & Resources */}
              {activeDrawerTab === "downloads" && (
                <div className="downloads-panel grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {activeLecture?.resources && activeLecture.resources.length > 0 ? (
                    activeLecture.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-background/60 border border-card hover:border-primary/40 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <i className="fa-solid fa-file-pdf text-rose-400 text-base"></i>
                          <div>
                            <span className="font-bold text-text group-hover:text-primary block">{res.title}</span>
                            <span className="text-[10px] text-subtext">{res.type || "Document"} · {res.size || "1.2 MB"}</span>
                          </div>
                        </div>
                        <i className="fa-solid fa-download text-subtext group-hover:text-primary"></i>
                      </a>
                    ))
                  ) : (
                    <>
                      <a
                        href="/api/storage/file?key=temporary/starter_repo.zip"
                        className="p-3 rounded-xl bg-background/60 border border-card hover:border-primary/40 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <i className="fa-brands fa-github text-primary text-base"></i>
                          <div>
                            <span className="font-bold text-text group-hover:text-primary block">GitHub Starter Repository</span>
                            <span className="text-[10px] text-subtext">Source Code · 2.4 MB · .zip</span>
                          </div>
                        </div>
                        <i className="fa-solid fa-download text-subtext group-hover:text-primary"></i>
                      </a>
                      <a
                        href="/api/storage/file?key=temporary/cheatsheet.pdf"
                        className="p-3 rounded-xl bg-background/60 border border-card hover:border-primary/40 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <i className="fa-solid fa-file-lines text-cyan-400 text-base"></i>
                          <div>
                            <span className="font-bold text-text group-hover:text-primary block">Multi-Agent System Cheat Sheet</span>
                            <span className="text-[10px] text-subtext">PDF Blueprint · 6 Pages</span>
                          </div>
                        </div>
                        <i className="fa-solid fa-download text-subtext group-hover:text-primary"></i>
                      </a>
                    </>
                  )}
                </div>
              )}

              {/* Tab 4: Q&A */}
              {activeDrawerTab === "qa" && (
                <div className="qa-panel space-y-3 text-xs">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask instructor or classmates a question about this lecture..."
                      className="flex-1 bg-background/80 border border-card rounded-xl px-4 py-2 text-xs text-text placeholder:text-subtext focus:outline-none focus:border-primary"
                    />
                    <button className="px-4 py-2 rounded-xl bg-primary text-white font-bold">Post Question</button>
                  </div>
                  <div className="p-3 rounded-xl bg-background/60 border border-card space-y-1">
                    <div className="flex justify-between font-bold text-text">
                      <span>Rohan Sharma</span>
                      <span className="text-subtext text-[10px]">2 hours ago</span>
                    </div>
                    <p className="text-subtext">Can we use Pydantic models with StateGraph instead of TypedDict?</p>
                    <p className="text-primary text-[11px] font-bold mt-1">Instructor Alex Chen: Yes! In modern LangGraph versions, Pydantic BaseModels are fully supported.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── RIGHT DOCK SIDEBAR (SYLLABUS + COPILOT + METRICS) ── */}
        <aside className="studio-sidebar" id="studioSidebar">
          {/* Sidebar Nav Tabs */}
          <div className="sidebar-nav-tabs flex border-b border-card">
            <button
              className={`sidebar-tab flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeSideTab === "syllabus" ? "border-primary text-primary bg-primary/5" : "border-transparent text-subtext hover:text-text"
              }`}
              onClick={() => setActiveSideTab("syllabus")}
            >
              <i className="fa-solid fa-list-check"></i>
              <span>Curriculum</span>
            </button>

            <button
              className={`sidebar-tab flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeSideTab === "copilot" ? "border-primary text-primary bg-primary/5" : "border-transparent text-subtext hover:text-text"
              }`}
              onClick={() => setActiveSideTab("copilot")}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span>AI Copilot</span>
            </button>

            <button
              className={`sidebar-tab flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeSideTab === "analytics" ? "border-primary text-primary bg-primary/5" : "border-transparent text-subtext hover:text-text"
              }`}
              onClick={() => setActiveSideTab("analytics")}
            >
              <i className="fa-solid fa-chart-pie"></i>
              <span>Metrics</span>
            </button>
          </div>

          {/* TAB 1: CURRICULUM SYLLABUS */}
          {activeSideTab === "syllabus" && (
            <div className="sidebar-view active flex flex-col h-full overflow-hidden" id="sideViewSyllabus">
              <div className="syllabus-header-panel p-4 border-b border-card space-y-3">
                <div className="search-syllabus-box flex items-center gap-2 bg-background/80 border border-card rounded-xl px-3 py-2">
                  <i className="fa-solid fa-search text-subtext text-xs"></i>
                  <input
                    type="text"
                    value={syllabusSearch}
                    onChange={(e) => setSyllabusSearch(e.target.value)}
                    placeholder="Filter lessons, quizzes, resources..."
                    className="bg-transparent border-none outline-none text-xs text-text placeholder:text-subtext flex-1"
                  />
                </div>

                <div className="syllabus-stats-row flex justify-between text-xs font-bold">
                  <span>{course.modules.length} Modules · {allLectures.length} Items</span>
                  <span className="text-emerald-400">{totalCompleted} / {allLectures.length} Completed</span>
                </div>

                {/* Filter Pills */}
                <div className="syllabus-filter-chips flex gap-1.5">
                  <button
                    className={`filter-chip ${syllabusFilter === "all" ? "active" : ""}`}
                    onClick={() => setSyllabusFilter("all")}
                  >
                    All ({allLectures.length})
                  </button>
                  <button
                    className={`filter-chip ${syllabusFilter === "completed" ? "active" : ""}`}
                    onClick={() => setSyllabusFilter("completed")}
                  >
                    Completed ({totalCompleted})
                  </button>
                  <button
                    className={`filter-chip ${syllabusFilter === "remaining" ? "active" : ""}`}
                    onClick={() => setSyllabusFilter("remaining")}
                  >
                    Remaining ({allLectures.length - totalCompleted})
                  </button>
                </div>
              </div>

              {/* Modules Accordion */}
              <div className="syllabus-accordion-container flex-1 overflow-y-auto" id="syllabusAccordion">
                {filteredModules.map((mod, mIdx) => {
                  const isModOpen = openModuleIds.has(mod.id);
                  const isModCompleted = mod.lectures.length > 0 && mod.lectures.every((l) => completedIds.has(l.id));

                  return (
                    <div key={mod.id} className={`module-group ${isModCompleted ? "completed-module" : ""} ${isModOpen ? "open" : ""}`}>
                      <div
                        className="module-header p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors border-b border-card/40"
                        onClick={() => {
                          setOpenModuleIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(mod.id)) next.delete(mod.id);
                            else next.add(mod.id);
                            return next;
                          });
                        }}
                      >
                        <div className="mod-title-left flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="mod-status-icon text-xs flex items-center justify-center">
                            {isModCompleted ? (
                              <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
                            ) : (
                              <span className="mod-checkbox-icon blank" title="Module in progress"></span>
                            )}
                          </span>
                          <div className="truncate">
                            <span className="mod-num text-[10px] font-extrabold uppercase text-subtext tracking-wider block">
                              MODULE {String(mIdx + 1).padStart(2, "0")}
                            </span>
                            <h4 className="mod-name font-bold text-xs text-text truncate">{mod.title}</h4>
                          </div>
                        </div>
                        <div className="mod-meta-right flex items-center gap-2 text-subtext text-[11px] font-semibold shrink-0">
                          <span>{mod.lectures.length} Items</span>
                          <i className={`fa-solid ${isModOpen ? "fa-chevron-up" : "fa-chevron-down"} text-[10px]`}></i>
                        </div>
                      </div>

                      {/* Lectures List with Checklist Checkboxes */}
                      {isModOpen && (
                        <div className="module-lessons-list bg-black/20 flex flex-col">
                          {mod.lectures.length === 0 ? (
                            <div className="p-3 text-xs text-subtext/70 italic text-center">
                              No lessons or resources in this module yet.
                            </div>
                          ) : (
                            mod.lectures.map((lec) => {
                              const isLecActive = activeLectureId === lec.id;
                              const isDone = completedIds.has(lec.id);

                              // Determine type badge for right meta info
                              let badge = <span className="lesson-type-badge type-video"><i className="fa-solid fa-video"></i> Video</span>;

                              if (lec.type === "concept" || lec.type === "article" || lec.type === "resource") {
                                badge = <span className="lesson-type-badge type-resource"><i className="fa-solid fa-file-lines"></i> Resource</span>;
                              } else if (lec.type === "quiz") {
                                badge = <span className="lesson-type-badge type-quiz"><i className="fa-solid fa-award"></i> Quiz</span>;
                              } else if (lec.type === "code" || lec.type === "sandbox") {
                                badge = <span className="lesson-type-badge type-code"><i className="fa-solid fa-laptop-code"></i> Interactive</span>;
                              }

                              return (
                                <div
                                  key={lec.id}
                                  className={`lesson-item ${isDone ? "completed" : ""} ${isLecActive ? "active-lesson" : ""}`}
                                  onClick={() => handleSelectLecture(lec)}
                                >
                                  {/* Checklist / Blank Option with Tick Mark on Completion */}
                                  <button
                                    type="button"
                                    className={`lesson-checkbox-btn ${isDone ? "completed" : "blank"}`}
                                    onClick={(e) => handleToggleComplete(lec.id, e)}
                                    title={isDone ? "Completed! Click to mark as incomplete" : "Click to mark as complete"}
                                  >
                                    {isDone && <i className="fa-solid fa-check text-[11px]"></i>}
                                  </button>

                                  <div className="lesson-details">
                                    <span className="lesson-name" title={lec.title}>
                                      {lec.title}
                                    </span>
                                  </div>
                                  <div className="lesson-meta-badges">
                                    {isLecActive && <span className="lesson-badge-live">Now Playing</span>}
                                    {badge}
                                    <span className="lesson-duration">{lec.duration || "15 min"}</span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AI COPILOT TUTOR */}
          {activeSideTab === "copilot" && (
            <div className="sidebar-view active flex flex-col h-full" id="sideViewCopilot">
              <div className="copilot-header p-4 border-b border-card flex items-center gap-3">
                <div className="copilot-avatar w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-base">
                  <i className="fa-solid fa-robot"></i>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-text">Jarvis AI Copilot</h4>
                  <p className="text-[10px] text-subtext">Real-time contextual tutor for this lecture</p>
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="copilot-quick-prompts p-3 border-b border-card flex flex-wrap gap-1.5 bg-white/2">
                <button className="quick-chip" onClick={() => handleSendCopilot("Explain this concept in simple terms for a junior developer.")}>
                  💡 Explain simply
                </button>
                <button className="quick-chip" onClick={() => handleSendCopilot("Why is operator.add needed in LangGraph TypedDict?")}>
                  🔍 Reducers
                </button>
                <button className="quick-chip" onClick={() => handleSendCopilot("Generate a practice quiz question on this topic.")}>
                  📝 Quiz me
                </button>
                <button className="quick-chip" onClick={() => handleSendCopilot("Show a minimal Python code example of conditional edges.")}>
                  💻 Code example
                </button>
              </div>

              {/* Chat Stream */}
              <div className="copilot-chat-history flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {copilotMessages.map((msg, i) => (
                  <div key={i} className={`chat-msg ${msg.role === "ai" ? "ai-msg" : "user-msg"}`}>
                    <div className="msg-bubble p-3 rounded-2xl bg-card border border-card space-y-1">
                      <p className="text-text leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      {msg.time && <span className="text-[9px] text-subtext block text-right">{msg.time}</span>}
                    </div>
                  </div>
                ))}
                {isCopilotThinking && (
                  <div className="chat-msg ai-msg">
                    <div className="msg-bubble p-3 rounded-2xl bg-card border border-card flex items-center gap-2 text-subtext">
                      <i className="fa-solid fa-spinner fa-spin text-primary"></i>
                      <span>Jarvis is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Box */}
              <div className="copilot-input-area p-3 border-t border-card flex gap-2">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCopilot()}
                  placeholder="Ask anything about this lecture..."
                  className="flex-1 bg-background border border-card rounded-xl px-3 py-2 text-xs text-text placeholder:text-subtext focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => handleSendCopilot()}
                  className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/20"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS & METRICS */}
          {activeSideTab === "analytics" && (
            <div className="sidebar-view active p-4 overflow-y-auto space-y-4" id="sideViewAnalytics">
              <div className="p-4 rounded-2xl bg-card border border-card space-y-2 text-xs">
                <span className="font-extrabold text-subtext uppercase tracking-wider text-[10px]">Cohort Ranking</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-text">94.8%</span>
                  <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 font-bold text-[10px]">Top 5%</span>
                </div>
                <p className="text-subtext">You are among the top 5% most consistent scholars in this course cohort.</p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-card space-y-2 text-xs">
                <span className="font-extrabold text-subtext uppercase tracking-wider text-[10px]">Weekly Study Hours</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-text">12h 40m</span>
                  <span className="text-emerald-400 font-bold text-[10px]">126% of Target</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-card space-y-3 text-xs">
                <h4 className="font-bold text-text flex items-center gap-2">
                  <i className="fa-solid fa-award text-amber-400"></i> Verified Certificate Readiness
                </h4>
                <p className="text-subtext">Complete all module checkpoints and interactive code sandboxes to earn your credential.</p>
                <div className="flex justify-between font-bold text-[11px]">
                  <span>Progress: {progressPercent}%</span>
                  <span className={progressPercent === 100 ? "text-emerald-400" : "text-amber-400"}>
                    {progressPercent === 100 ? "Ready to Claim" : "In Progress"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
