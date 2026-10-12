"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { parseYouTubeVideoId } from "@/lib/video/youtubeService";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Sparkles
} from "lucide-react";

export interface YouTubePlayerProps {
  videoIdOrUrl: string;
  initialTime?: number;
  autoPlay?: boolean;
  watermarkText?: string;
  className?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(sec: number): string {
  if (!sec || isNaN(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/**
 * YouTubePlayer — 100% Distraction-Free Custom LMS Player
 * 
 * Key Features:
 * - Uses `controls=0` to completely eliminate YouTube's native bottom bar, YouTube logo,
 *   red progress line, and "More videos" shelf.
 * - Replaces native controls with custom Glarus Academy luxury glassmorphic controls:
 *   gradient timeline scrubber, +/-10s jumps, volume slider, speed picker, fullscreen,
 *   and keyboard shortcuts (Space, Arrow keys, M, F).
 * - Direct iframe postMessage telemetry for instant progress tracking and completion rewards.
 */
export function YouTubePlayer({
  videoIdOrUrl,
  initialTime = 0,
  autoPlay = false,
  watermarkText,
  className = "",
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onError,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const videoId = parseYouTubeVideoId(videoIdOrUrl);
  const initialTimeRef = useRef<number>(initialTime);

  // Store latest callbacks in ref to prevent parent re-renders from breaking telemetry
  const callbacksRef = useRef({
    onTimeUpdate,
    onPlay,
    onPause,
    onEnded,
    onError,
  });

  useEffect(() => {
    callbacksRef.current = {
      onTimeUpdate,
      onPlay,
      onPause,
      onEnded,
      onError,
    };
  });

  // PostMessage Command Helper
  const sendCommand = useCallback((func: string, args: any[] = []) => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    } catch {}
  }, []);

  // Controls auto-hide timer (fades out during playback after 2.5s of no mouse movement)
  const triggerControlsActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 2200);
    }
  }, [isPlaying]);

  // Auto-hide controls when playback starts
  useEffect(() => {
    if (isPlaying) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 2200);
    } else {
      setShowControls(true);
    }
  }, [isPlaying]);

  // Toggle Play / Pause
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    triggerControlsActivity();
    if (isPlaying) {
      sendCommand("pauseVideo");
      setIsPlaying(false);
    } else {
      if (isEnded) {
        setIsEnded(false);
        sendCommand("seekTo", [0, true]);
      }
      sendCommand("playVideo");
      setIsPlaying(true);
      setHasStarted(true);
    }
  }, [isPlaying, isEnded, sendCommand, triggerControlsActivity]);

  // Seek to specific timestamp
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = pct * duration;
    setCurrentTime(targetSeconds);
    sendCommand("seekTo", [targetSeconds, true]);
    triggerControlsActivity();
  };

  // Jump relative (+/- 10s)
  const seekRelative = (deltaSeconds: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = Math.max(0, Math.min(duration, currentTime + deltaSeconds));
    setCurrentTime(target);
    sendCommand("seekTo", [target, true]);
    triggerControlsActivity();
  };

  // Volume & Mute Toggle
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isMuted) {
      sendCommand("unMute");
      sendCommand("setVolume", [volume || 80]);
      setIsMuted(false);
    } else {
      sendCommand("mute");
      setIsMuted(true);
    }
    triggerControlsActivity();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      sendCommand("mute");
      setIsMuted(true);
    } else {
      if (isMuted) {
        sendCommand("unMute");
        setIsMuted(false);
      }
      sendCommand("setVolume", [val]);
    }
    triggerControlsActivity();
  };

  // Playback Speed
  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    sendCommand("setPlaybackRate", [speed]);
    setShowSpeedMenu(false);
    triggerControlsActivity();
  };

  // Toggle Fullscreen
  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Replay handler
  const handleReplay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEnded(false);
    setIsPlaying(true);
    setCurrentTime(0);
    sendCommand("seekTo", [0, true]);
    sendCommand("playVideo");
  };

  // Keyboard Shortcuts (Space, Left/Right Arrows, M, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input / textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.code === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.key === "ArrowRight" || e.key === "l" || e.key === "L") {
        e.preventDefault();
        seekRelative(10);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, seekRelative, toggleMute, toggleFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // PostMessage Bridge & Progress Polling
  useEffect(() => {
    if (!videoId) {
      setLoadError("Invalid or missing YouTube Video URL");
      return;
    }

    setLoadError(null);
    let isSubscribed = true;

    const handleMessage = (event: MessageEvent) => {
      if (!isSubscribed) return;

      if (
        typeof event.origin === "string" &&
        !event.origin.includes("youtube.com") &&
        !event.origin.includes("youtube-nocookie.com")
      ) {
        return;
      }

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // YouTube infoDelivery event contains currentTime & duration
        if (data.event === "infoDelivery" && data.info) {
          const cur = typeof data.info.currentTime === "number" ? data.info.currentTime : 0;
          const dur = typeof data.info.duration === "number" ? data.info.duration : 0;
          if (cur > 0 || dur > 0) {
            setCurrentTime(cur);
            if (dur > 0) setDuration(dur);
            callbacksRef.current.onTimeUpdate?.(cur, dur);

            // Auto trigger completion screen when near the end
            if (dur > 0 && cur >= dur - 0.75) {
              setIsEnded(true);
              setIsPlaying(false);
            }
          }

          if (typeof data.info.playerState === "number") {
            const state = data.info.playerState;
            if (state === 1) {
              setIsPlaying(true);
              setHasStarted(true);
              setIsEnded(false);
              callbacksRef.current.onPlay?.();
            } else if (state === 2) {
              setIsPlaying(false);
              callbacksRef.current.onPause?.();
            } else if (state === 0) {
              setIsPlaying(false);
              setIsEnded(true);
              callbacksRef.current.onEnded?.();
            }
          }
        }

        // Standard onStateChange event
        if (data.event === "onStateChange") {
          const state = data.info;
          if (state === 1) {
            setIsPlaying(true);
            setHasStarted(true);
            setIsEnded(false);
            callbacksRef.current.onPlay?.();
          } else if (state === 2) {
            setIsPlaying(false);
            callbacksRef.current.onPause?.();
          } else if (state === 0) {
            setIsPlaying(false);
            setIsEnded(true);
            callbacksRef.current.onEnded?.();
          }
        }

        if (data.event === "onReady" || data.event === "initialDelivery") {
          setIsReady(true);
          try {
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: "command", func: "unloadModule", args: ["captions"] }),
              "*"
            );
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: "command", func: "setOption", args: ["captions", "track", {}] }),
              "*"
            );
          } catch {}
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);

    const handshakeInterval = setInterval(() => {
      if (!isSubscribed) return;
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "listening" }),
            "*"
          );
        } catch {}
      }
    }, 1000);

    const readyTimer = setTimeout(() => {
      if (isSubscribed) setIsReady(true);
    }, 1200);

    return () => {
      isSubscribed = false;
      window.removeEventListener("message", handleMessage);
      clearInterval(handshakeInterval);
      clearTimeout(readyTimer);
    };
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 rounded-xl border border-slate-800">
        <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
        <p className="text-sm font-semibold text-slate-200">Invalid YouTube Video Link</p>
        <p className="text-xs text-slate-500 mt-1 max-w-md text-center">
          Please provide a valid YouTube URL (e.g., https://youtu.be/... or https://youtube.com/watch?v=...)
        </p>
      </div>
    );
  }

  // 100% Distraction-free Embed URL (controls=0 completely removes YouTube's bottom bar and logo, cc_load_policy=0 disables auto CC)
  const startParam = initialTimeRef.current > 0 ? `&start=${Math.floor(initialTimeRef.current)}` : "";
  const autoPlayParam = autoPlay ? "&autoplay=1" : "&autoplay=0";
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&controls=0&disablekb=1&fs=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&cc_load_policy=0&cc_lang_pref=en${autoPlayParam}${startParam}`;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isControlsVisible = !isPlaying || (showControls && isHovered);

  return (
    <div
      ref={containerRef}
      onMouseMove={() => {
        setIsHovered(true);
        triggerControlsActivity();
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerControlsActivity();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isPlaying) {
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
          setShowControls(false);
          setShowSpeedMenu(false);
        }
      }}
      className={`group relative w-full h-full overflow-hidden bg-black flex items-center justify-center select-none ${className}`}
      style={{ minHeight: "360px" }}
    >
      {/* 16:9 Video Canvas Wrapper */}
      <div className="w-full h-full relative" style={{ aspectRatio: "16/9" }}>
        <iframe
          ref={iframeRef}
          key={videoId}
          src={embedUrl}
          title="YouTube Video Lecture"
          className="w-full h-full absolute inset-0 border-0 pointer-events-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsReady(true)}
        />

        {/* Interactive Click-to-Play Video Area Shield */}
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 cursor-pointer"
          title="Click to Play / Pause (Space)"
        />
      </div>

      {/* ── BIG CENTER PLAY BUTTON (When Paused) ── */}
      {!isPlaying && hasStarted && !isEnded && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-all animate-in fade-in duration-200"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center text-white shadow-2xl shadow-purple-600/50 hover:scale-110 active:scale-95 transition-all">
            <Play className="w-7 h-7 fill-current ml-1 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-200 mt-3 bg-slate-950/80 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            Resume Lecture (Space)
          </span>
        </div>
      )}

      {/* ── GLARUS ACADEMY CUSTOM LUXURY CONTROLS BAR (Zero YouTube Branding) ── */}
      {!isEnded && isReady && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 px-4 pb-3 pt-8 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${
            isControlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Timeline Scrubber */}
          <div
            onClick={handleSeek}
            className="group/timeline relative w-full h-1.5 hover:h-3 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer transition-all mb-3"
          >
            {/* Played Progress Gradient */}
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 rounded-full relative shadow-sm"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Scrubber Handle Dot */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-purple-500 shadow-md scale-0 group-hover/timeline:scale-100 transition-transform" />
            </div>
          </div>

          {/* Controls Button Row */}
          <div className="flex items-center justify-between gap-2 text-white">
            {/* Left Controls: Play/Pause, Skips, Volume, Time */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0 hover:scale-105 active:scale-95 border border-white/10"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {/* Rewind 10s */}
              <button
                type="button"
                onClick={(e) => seekRelative(-10, e)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all shrink-0"
                title="Rewind 10s (Left Arrow)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Forward 10s */}
              <button
                type="button"
                onClick={(e) => seekRelative(10, e)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all shrink-0"
                title="Forward 10s (Right Arrow)"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume Slider & Mute Toggle */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all shrink-0"
                  title={isMuted ? "Unmute (M)" : "Mute (M)"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-14 sm:w-20 h-1 bg-white/20 accent-purple-500 rounded-lg cursor-pointer"
                  title="Volume"
                />
              </div>

              {/* Time Display */}
              <div className="text-[11px] font-mono text-slate-300 font-semibold px-2 py-0.5 bg-white/5 rounded-lg border border-white/5 whitespace-nowrap">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Speed Picker, Watermark, Fullscreen */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Playback Speed Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpeedMenu(!showSpeedMenu);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono font-bold flex items-center gap-1 transition-all border border-white/10"
                  title="Playback Speed"
                >
                  <Gauge className="w-3.5 h-3.5 text-purple-400" />
                  <span>{playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 p-1.5 bg-slate-900/95 border border-white/15 rounded-xl shadow-2xl backdrop-blur-xl flex flex-col gap-1 z-40 animate-in fade-in duration-150">
                    <span className="text-[9px] font-black uppercase text-slate-400 px-2 py-1">Speed</span>
                    {SPEED_OPTIONS.map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSetSpeed(spd)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold text-left transition-all ${
                          playbackSpeed === spd
                            ? "bg-purple-600 text-white shadow-sm"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CC Subtitles Toggle Button (Default OFF to avoid double subtitles) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextState = !isCaptionsOn;
                  setIsCaptionsOn(nextState);
                  if (nextState) {
                    sendCommand("loadModule", ["captions"]);
                    sendCommand("setOption", ["captions", "track", { languageCode: "en" }]);
                  } else {
                    sendCommand("unloadModule", ["captions"]);
                    sendCommand("setOption", ["captions", "track", {}]);
                  }
                  triggerControlsActivity();
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-extrabold flex items-center gap-1 transition-all border ${
                  isCaptionsOn
                    ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30"
                    : "bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white border-white/10"
                }`}
                title={isCaptionsOn ? "Disable Closed Captions" : "Enable Closed Captions"}
              >
                <span>CC</span>
                <span className="text-[9px] opacity-80">{isCaptionsOn ? "ON" : "OFF"}</span>
              </button>

              {/* Custom Watermark Badge */}
              {watermarkText && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] font-bold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{watermarkText}</span>
                </div>
              )}

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM LECTURE COMPLETED END-SCREEN ── */}
      {isEnded && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl mb-4 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Lecture Completed!</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            Great work! You have completed this video session. Replay anytime or continue to the next lesson.
          </p>
          <button
            onClick={handleReplay}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 border border-purple-500/30 transition-all cursor-pointer shadow-lg shadow-purple-600/25 hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Lecture</span>
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {!isReady && !loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 pointer-events-none transition-opacity duration-300">
          <div className="w-9 h-9 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-2" />
          <span className="text-[11px] text-purple-300 font-medium tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Loading High-Definition Stream...
          </span>
        </div>
      )}

      {/* Load Error Fallback */}
      {loadError && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-sm font-semibold">{loadError}</p>
          <p className="text-xs text-slate-500 mt-1">
            If the video is unlisted, ensure embedding is permitted in YouTube Studio settings.
          </p>
        </div>
      )}
    </div>
  );
}

export default YouTubePlayer;
