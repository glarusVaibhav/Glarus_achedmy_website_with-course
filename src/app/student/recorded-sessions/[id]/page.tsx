"use client";

import React, { useState, useEffect, useRef, use, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  CheckCircle2,
  ListChecks,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Sparkles,
  Users,
  Calendar,
  Layers,
  MessageSquare,
  BookmarkPlus,
  Tv,
  Check,
  Share2,
  Trash2,
  Lock,
  AlertTriangle,
  CalendarDays,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RecordingItem } from "@/app/api/student/recordings/route";
import { calculateRecordingAvailability, RecordingAvailability } from "@/lib/recordingAvailability";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";

interface StudentNote {
  id: string;
  recordingId: string;
  userId: string;
  timestampSeconds: number;
  timestampFormatted: string;
  content: string;
  createdAt: string;
}

export default function RecordedSessionPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [recording, setRecording] = useState<RecordingItem | null>(null);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"AGENDA" | "OVERVIEW" | "RESOURCES" | "NOTES" | "QNA">("AGENDA");

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [resumeBannerVisible, setResumeBannerVisible] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute Availability
  const availability: RecordingAvailability | null = useMemo(() => {
    if (!recording) return null;
    return calculateRecordingAvailability(recording.completedAt);
  }, [recording]);

  // Initial Fetch
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/student/recordings/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRecording(data.recording);
          setNotes(data.notes || []);

          // Check if resume banner should show (only for unexpired recordings)
          const avail = calculateRecordingAvailability(data.recording?.completedAt);
          if (
            !avail.isExpired &&
            data.recording?.watchProgress?.status === "IN_PROGRESS" &&
            data.recording?.watchProgress?.secondsWatched > 30
          ) {
            setResumeBannerVisible(true);
          }
        }
      } catch (err) {
        console.error("Failed to load recording detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Handle URL Seek Timestamp (e.g. ?t=1800)
  useEffect(() => {
    const t = searchParams?.get("t");
    if (t && videoRef.current && !isNaN(Number(t)) && !availability?.isExpired) {
      const seekSec = Number(t);
      videoRef.current.currentTime = seekSec;
      setCurrentTime(seekSec);
      setResumeBannerVisible(false);
      videoRef.current.play().catch(() => {});
    }
  }, [searchParams, loading, availability]);

  // Sync Progress to API (throttled)
  const lastSyncRef = useRef<number>(0);
  const syncProgressToBackend = async (seconds: number) => {
    if (!recording || availability?.isExpired) return;
    try {
      await fetch(`/api/student/recordings/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PROGRESS",
          secondsWatched: seconds,
          totalDurationSeconds: recording.durationSeconds || duration || 6000,
        }),
      });
    } catch (e) {
      /* silent */
    }
  };

  // Video Event Handlers
  const handleTimeUpdate = () => {
    if (videoRef.current && !availability?.isExpired) {
      const now = videoRef.current.currentTime;
      setCurrentTime(now);

      // Sync every 10 seconds
      if (Math.abs(now - lastSyncRef.current) >= 10) {
        lastSyncRef.current = now;
        syncProgressToBackend(now);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || recording?.durationSeconds || 6120);
    }
  };

  const togglePlay = () => {
    if (availability?.isExpired) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        syncProgressToBackend(videoRef.current.currentTime);
      } else {
        videoRef.current.play().catch(() => {});
        setResumeBannerVisible(false);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (seekTime: number) => {
    if (availability?.isExpired) return;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      syncProgressToBackend(seekTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (availability?.isExpired) return;
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
      handleSeek(newTime);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format Seconds to MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const totalSecs = Math.floor(secs);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    try {
      const res = await fetch(`/api/student/recordings/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_NOTE",
          timestampSeconds: currentTime,
          content: newNoteText.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
        setNewNoteText("");
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/student/recordings/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_NOTE",
          noteId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  // Active Agenda Item
  const currentAgendaItem = recording?.agenda?.find((ag, idx, arr) => {
    const nextAg = arr[idx + 1];
    if (nextAg) {
      return currentTime >= ag.timestampSeconds && currentTime < nextAg.timestampSeconds;
    }
    return currentTime >= ag.timestampSeconds;
  });

  if (loading) {
    return (
      <StudentPortalLayout>
        <div className="w-full min-h-screen py-24 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-sm">Loading recording environment...</p>
        </div>
      </StudentPortalLayout>
    );
  }

  if (!recording || !availability) {
    return (
      <StudentPortalLayout>
        <div className="w-full min-h-screen py-24 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-white font-bold text-lg">Recording not found</p>
          <Link
            href="/student/recorded-sessions"
            className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            ← Back to Recorded Sessions
          </Link>
        </div>
      </StudentPortalLayout>
    );
  }

  const effectiveDuration = duration || recording.durationSeconds || 6120;
  const progressPercent = Math.min(100, Math.round((currentTime / effectiveDuration) * 100));

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-6 px-4 sm:px-8 max-w-[1600px] mx-auto space-y-6 text-slate-100">

        {/* ───────── Top Navigation Header ───────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/student/recorded-sessions"
              className="p-2.5 rounded-xl bg-[#0e1424]/80 hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Recorded Sessions</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span>/</span>
              <span className="text-purple-300 font-semibold">{recording.courseName}</span>
              <span>/</span>
              <span className="text-white font-bold truncate max-w-xs">{recording.sessionNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Availability Status Pill */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                availability.isExpired
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  : availability.isExpiringSoon
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse"
                  : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
              }`}
            >
              {availability.isExpired ? (
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              ) : availability.isExpiringSoon ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <CalendarDays className="w-3.5 h-3.5 text-purple-400" />
              )}
              <span>{availability.statusMessage}</span>
            </span>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-[#0e1424]/80 hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copySuccess ? "Link Copied!" : "Share Link"}</span>
            </button>
          </div>
        </div>

        {/* ───────── Main Player & Workspace Grid ───────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* LEFT 8 COLS: Big Video Player & Session Details */}
          <div className="xl:col-span-8 space-y-6">

            {/* ───────── Large Video Player Container or Lockout Box ───────── */}
            {availability.isExpired ? (
              <div className="relative w-full rounded-3xl overflow-hidden bg-[#090d18] border border-rose-500/30 shadow-2xl flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 aspect-video">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/40">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-lg">
                  <h2 className="text-xl sm:text-2xl font-black text-white">This Recording Has Expired</h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Live class recordings are accessible for exactly <strong>30 days</strong> following the original live class date ({availability.formattedClassDate}). Access to this recording expired on <strong>{availability.formattedExpiresAt}</strong>.
                  </p>
                </div>
                <Link
                  href="/student/recorded-sessions"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Recorded Sessions Library</span>
                </Link>
              </div>
            ) : (
              <div
                ref={playerContainerRef}
                className="relative w-full rounded-3xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl group select-none aspect-video"
                onMouseEnter={() => setShowControls(true)}
                onMouseMove={() => {
                  setShowControls(true);
                  if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
                  controlsTimeoutRef.current = setTimeout(() => {
                    if (isPlaying) setShowControls(false);
                  }, 3500);
                }}
              >
                {/* HTML5 Video Element */}
                <video
                  ref={videoRef}
                  src={recording.recordingUrl}
                  poster={recording.thumbnail}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => {
                    setIsPlaying(false);
                    syncProgressToBackend(effectiveDuration);
                  }}
                  onClick={togglePlay}
                  className="w-full h-full object-contain cursor-pointer"
                  playsInline
                />

                {/* Resume Banner Overlay */}
                <AnimatePresence>
                  {resumeBannerVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-4 left-4 right-4 z-30 p-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-purple-500/40 shadow-xl flex flex-wrap items-center justify-between gap-3 text-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">
                            Resume from previous position: <strong className="text-purple-300">{recording.watchProgress.lastWatchedFormatted || "42:18"}</strong>
                          </div>
                          <div className="text-[11px] text-slate-400">You've completed {recording.watchProgress.percent}% of this recording</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const resumeSec = recording.watchProgress.resumeTimestampSeconds || 2538;
                            handleSeek(resumeSec);
                            setResumeBannerVisible(false);
                            if (videoRef.current) videoRef.current.play().catch(() => {});
                            setIsPlaying(true);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/40 cursor-pointer"
                        >
                          Resume Watching
                        </button>
                        <button
                          onClick={() => setResumeBannerVisible(false)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
                        >
                          Start Over
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Big Centered Play Trigger when Paused */}
                {!isPlaying && !resumeBannerVisible && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl border border-purple-300/40 transform hover:scale-110 transition-all duration-300">
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Custom Video Controls Bar */}
                <div
                  className={`absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${
                    showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {/* Interactive Progress Scrubber */}
                  <div
                    className="relative w-full h-1.5 hover:h-3 bg-white/20 rounded-full cursor-pointer transition-all mb-3 group/scrubber"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickPos = (e.clientX - rect.left) / rect.width;
                      handleSeek(clickPos * effectiveDuration);
                    }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full relative"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/scrubber:scale-100 transition-transform" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-white">
                    {/* Left Controls: Play, Skip, Volume, Time */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </button>

                      <button
                        onClick={() => handleSkip(-10)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Rewind 10 seconds"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleSkip(10)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Skip forward 10 seconds"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      {/* Volume Control */}
                      <div className="flex items-center gap-1.5 group/vol">
                        <button onClick={toggleMute} className="p-1.5 text-slate-400 hover:text-white cursor-pointer">
                          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(Number(e.target.value))}
                          className="w-16 h-1 bg-white/30 rounded-full appearance-none accent-purple-400 cursor-pointer"
                        />
                      </div>

                      {/* Time Counter */}
                      <div className="text-xs font-mono font-semibold text-purple-200">
                        <span>{formatTime(currentTime)}</span>
                        <span className="text-white/40 mx-1">/</span>
                        <span className="text-white/70">{formatTime(effectiveDuration)}</span>
                      </div>
                    </div>

                    {/* Right Controls: Active Agenda Pill, Speed, Fullscreen */}
                    <div className="flex items-center gap-2.5">
                      {currentAgendaItem && (
                        <span className="hidden md:flex items-center gap-1.5 text-[11px] text-purple-300 font-semibold bg-purple-950/60 border border-purple-500/30 px-2.5 py-1 rounded-lg truncate max-w-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                          <span className="truncate">{currentAgendaItem.title}</span>
                        </span>
                      )}

                      {/* Speed Selector */}
                      <div className="relative">
                        <select
                          value={playbackSpeed}
                          onChange={(e) => handleSpeedChange(Number(e.target.value))}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg px-2 py-1 text-xs font-bold cursor-pointer focus:outline-none"
                        >
                          <option value={0.75} className="bg-slate-900 text-white">0.75x</option>
                          <option value={1} className="bg-slate-900 text-white">1.0x</option>
                          <option value={1.25} className="bg-slate-900 text-white">1.25x</option>
                          <option value={1.5} className="bg-slate-900 text-white">1.5x</option>
                          <option value={1.75} className="bg-slate-900 text-white">1.75x</option>
                          <option value={2} className="bg-slate-900 text-white">2.0x</option>
                        </select>
                      </div>

                      {/* Fullscreen Toggle */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───────── Session Details & Instructor Row ───────── */}
            <div className="bg-[#0c111e]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">
                    {recording.courseName}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {recording.sessionTitle}
                  </h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed Class
                  </span>
                </div>
              </div>

              {/* Instructor & Expiration Details Strip */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-white/[0.06] text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                    {recording.instructorAvatar || "IN"}
                  </div>
                  <span>Instructor: <strong className="text-white font-semibold">{recording.instructor}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Class Date: {availability.formattedClassDate}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-amber-400" />
                  <span>Access Window: {availability.statusMessage}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span>Total Duration: {recording.duration}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>{recording.module}</span>
                </div>
              </div>

              {/* Topics Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {recording.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLS: Workspace & Interactive Tabs */}
          <div className="xl:col-span-4 space-y-4">

            {/* Tab Buttons */}
            <div className="bg-[#0c111e]/90 border border-white/[0.08] p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none">
              {[
                { id: "AGENDA" as const, label: "Agenda", icon: ListChecks, count: undefined },
                { id: "OVERVIEW" as const, label: "Overview", icon: BookOpen, count: undefined },
                { id: "RESOURCES" as const, label: "Resources", icon: Download, count: recording.resources.length },
                { id: "NOTES" as const, label: "Notes", icon: BookmarkPlus, count: notes.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? "bg-white/20" : "bg-black/40 text-slate-400"}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="bg-[#0c111e]/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl min-h-[480px] max-h-[700px] overflow-y-auto scrollbar-thin">

              {/* ───────── TAB 1: CLASS AGENDA ───────── */}
              {activeTab === "AGENDA" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-purple-400" />
                      <span>Class Agenda & Timestamps</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-purple-300">
                      {recording.agenda.length} Segments
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Click any agenda item to instantly jump the video player to that exact lecture timestamp.
                  </p>

                  <div className="space-y-2.5">
                    {recording.agenda.map((item, idx) => {
                      const isCurrent = currentAgendaItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSeek(item.timestampSeconds)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group ${
                            isCurrent
                              ? "bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-950/30"
                              : "bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.05] hover:border-purple-500/30"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                              isCurrent
                                ? "bg-purple-600 text-white border-purple-400"
                                : "bg-purple-500/10 text-purple-300 border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white"
                            }`}
                          >
                            {idx + 1}
                          </span>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h5
                                className={`text-xs font-bold transition-colors truncate ${
                                  isCurrent ? "text-purple-300 font-extrabold" : "text-white group-hover:text-purple-300"
                                }`}
                              >
                                {item.title}
                              </h5>
                              <span className="font-mono text-[11px] font-bold text-purple-400 shrink-0 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                                {item.timestampFormatted}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ───────── TAB 2: OVERVIEW & KEY TAKEAWAYS ───────── */}
              {activeTab === "OVERVIEW" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Key Takeaways & Core Concepts</span>
                    </h4>
                    <div className="space-y-2 pt-1">
                      {recording.takeaways.map((point, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-purple-400" />
                      <span>Session Lifecycle & Access Window</span>
                    </h4>
                    <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/25 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Live Class Date:</span>
                        <span className="font-bold text-white">{availability.formattedClassDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Recording Expiration:</span>
                        <span className="font-bold text-amber-300">{availability.formattedExpiresAt}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Days Remaining:</span>
                        <span className="font-mono font-black text-purple-300">{availability.daysRemaining} Days</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────── TAB 3: RESOURCES & DOWNLOADS ───────── */}
              {activeTab === "RESOURCES" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Download className="w-4 h-4 text-purple-400" />
                      <span>Companion Materials & Source Code</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-purple-300">
                      {recording.resources.length} Files
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {recording.resources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-purple-500/40 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                              {res.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                              {res.type} {res.size ? `• ${res.size}` : ""}
                            </span>
                          </div>
                        </div>

                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-purple-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ───────── TAB 4: TIME-STAMPED STUDENT NOTES ───────── */}
              {activeTab === "NOTES" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <BookmarkPlus className="w-4 h-4 text-purple-400" />
                      <span>Personal Lecture Notes</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-purple-300">
                      {notes.length} Notes
                    </span>
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <div className="relative">
                      <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder={`Take a note at current time (${formatTime(currentTime)})...`}
                        rows={2}
                        className="w-full p-3 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-purple-400 font-bold">
                        ⏱ Timestamp: {formatTime(currentTime)}
                      </span>
                      <button
                        type="submit"
                        disabled={!newNoteText.trim()}
                        className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-2.5 pt-2">
                    {notes.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No notes added yet for this recording.</p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleSeek(note.timestampSeconds)}
                              className="font-mono text-[11px] font-bold text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-purple-400" />
                              <span>{note.timestampFormatted}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </StudentPortalLayout>
  );
}
