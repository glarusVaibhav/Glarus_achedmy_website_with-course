"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ArrowRight, ChevronLeft, ChevronDown, Lock, Unlock,AudioLines } from 'lucide-react';
import { StageComponentProps, ConceptStageData } from '@/types/engine';
import { useProgressStore } from '@/lib/store/progressStore';
import { analyzeConcept } from './conceptAnalyzer';
import { selectRenderer } from './rendererSelector';
import { RendererRegistry } from './RendererRegistry';
import { AudioControls } from './AudioControls';
import { useAudioStore } from '@/lib/store/audioStore';
import { useAudioHighlighter } from './useAudioHighlighter';

function cleanTextForAudio(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[#*_~`]/g, '')    // Remove markdown symbols
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
    .trim();
}

function extractStageText(stage: any): string {
  if (!stage) return '';

  if (stage?.content) {
    const content = stage.content;
    if (typeof content?.audio === 'string' && content.audio.trim()) {
      return cleanTextForAudio(content.audio);
    }
    if (typeof content?.explanation === 'string' && content.explanation.trim()) {
      return cleanTextForAudio(content.explanation);
    }
    if (typeof content?.title === 'string' && content.title.trim()) {
      return cleanTextForAudio(content.title);
    }
  }

  if (typeof stage?.title === 'string' && stage.title.trim()) {
    return cleanTextForAudio(stage.title);
  }
  if (typeof stage?.question === 'string' && stage.question.trim()) {
    return cleanTextForAudio(stage.question);
  }
  if (typeof stage?.prompt === 'string' && stage.prompt.trim()) {
    return cleanTextForAudio(stage.prompt);
  }
  if (typeof stage?.description === 'string' && stage.description.trim()) {
    return cleanTextForAudio(stage.description);
  }

  return '';
}

function normalizeSubtitleData(value: unknown): Array<{ text: string; start: number; end: number }> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item: any) => ({
      text: typeof item?.text === 'string' ? item.text : '',
      start: Number(item?.start ?? 0),
      end: Number(item?.end ?? item?.start ?? 0),
    }))
    .filter((item) => item.text || item.start !== 0 || item.end !== 0);
}

function findModuleForLesson(topicsPayload: unknown, lessonId: string | undefined) {
  if (!lessonId) return null;

  const modules = Array.isArray(topicsPayload)
    ? topicsPayload
    : Array.isArray((topicsPayload as any)?.modules)
      ? (topicsPayload as any).modules
      : [];

  for (const module of modules) {
    if (!module || typeof module !== 'object') continue;

    const topics = Array.isArray((module as any).topics) ? (module as any).topics : [];
    const matchesTopic = topics.some((topic: any) => String(topic?.id || '') === String(lessonId));
    if (matchesTopic) {
      return module;
    }
  }

  return null;
}

function getModuleNumber(moduleId: string | undefined): number {
  if (!moduleId) return 1;
  const match = String(moduleId).match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

export function AdaptiveConceptStage({ data, onComplete }: StageComponentProps<ConceptStageData>) {
  // Memoize analysis to avoid re-running heuristics on every render
  const analysis = useMemo(() => analyzeConcept(data.content), [data.content]);
  
  // Select the appropriate renderer based on the UI strategy
  const rendererKey = selectRenderer(analysis.uiStrategy);
  const RendererComponent = RendererRegistry[rendererKey];
  const MemoizedRenderer = useMemo(() => React.memo(RendererRegistry[rendererKey]), [rendererKey]);

  const goBack = useProgressStore((s) => s.goBack);
  const course = useProgressStore((s) => s.course);
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const currentStageIndex = useProgressStore((s) => s.currentStageIndex);
  const lesson = course?.lessons[currentLessonIndex];
  const lessonId = lesson?.id;
  const totalStages = lesson?.stages?.length ?? 1;

  // --- Audio Mode State (Global) ---
  const isAudioMode = useAudioStore((s) => s.isAudioMode);
  const setIsAudioMode = useAudioStore((s) => s.setIsAudioMode);
  const showTranscript = useAudioStore((s) => s.showTranscript);
  const setShowTranscript = useAudioStore((s) => s.setShowTranscript);
  const setTranscriptText = useAudioStore((s) => s.setTranscriptText);
  const setProgress = useAudioStore((s) => s.setProgress);
  const subtitleData = useAudioStore((s) => s.subtitleData);
  const setSubtitleData = useAudioStore((s) => s.setSubtitleData);
  const setGlobalCurrentTime = useAudioStore((s) => s.setCurrentTime);
  const isAutoContinue = useAudioStore((s) => s.isAutoContinue);
  const setIsAutoContinue = useAudioStore((s) => s.setIsAutoContinue);

  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // --- Scroll-Gating State ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useAudioHighlighter(scrollContainerRef, (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  });
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);


  // Check if content overflows (needs scrolling)
  const checkScrollNeeded = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // If content fits without scrolling, auto-unlock
    if (el.scrollHeight <= el.clientHeight + 10) {
      setHasScrolledToBottom(true);
      setShowScrollHint(false);
    } else {
      setShowScrollHint(true);
    }
  }, []);

  // Check on mount and when content changes
  useEffect(() => {
    checkScrollNeeded();
    // Also check after images load (they can change content height)
    const timer = setTimeout(checkScrollNeeded, 500);
    return () => clearTimeout(timer);
  }, [data.content, checkScrollNeeded]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || hasScrolledToBottom) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 50) {
      setHasScrolledToBottom(true);
      setShowScrollHint(false);
    }
  }, [hasScrolledToBottom]);
  
  // --- Playback State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
    // for voice samples
  const [selectedVoice, setSelectedVoice] = useState("Aura");
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  // Initialize transcript text
  useEffect(() => {
    const textToUse = data.content.audio || data.content.explanation;
    if (textToUse) {
      setTranscriptText(cleanTextForAudio(textToUse));
    }
  }, [data.content.audio, data.content.explanation, setTranscriptText]);
  
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  useEffect(() => {
    setPortalTarget(document.getElementById('header-audio-controls'));
  }, []);

  // Sync progress
  useEffect(() => {
    setProgress(duration > 0 ? currentTime / duration : 0);
  }, [currentTime, duration, setProgress]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSlideText = cleanTextForAudio(data.content.audio || data.content.explanation || '');
  const currentSlideTitle = data.content.title || lesson?.title || 'Concept';

  // Fetch Audio
  const fetchAudio = useCallback(async () => {
    if (!currentSlideText || !lessonId) return;
    setIsLoadingAudio(true);
    try {
      const sidebarResponse = await fetch(`/api/course/${encodeURIComponent(course?.courseId || '')}/sidebar`);
      const sidebarData = await sidebarResponse.json();
      const topicCourse = sidebarData?.courseMeta || null;
      const currentLessonFromCatalog = Array.isArray(sidebarData?.lessons)
        ? sidebarData.lessons.find((entry: any) => entry?.id === lessonId || entry?.id === lesson?.id) || lesson
        : lesson;

      const activeModule = findModuleForLesson(sidebarData?.topics, lessonId);
      const payload = {
        course_id: topicCourse?.id || course?.courseId || (course as any)?.id || '',
        course_code: topicCourse?.course_code || topicCourse?.courseCode || '',
        course_name: topicCourse?.course_name || topicCourse?.courseName || course?.title || 'Course',
        description: topicCourse?.description || '',
        module_id: activeModule?.id || (course as any)?.moduleId || lesson?.id || lessonId || '',
        module_number: getModuleNumber(activeModule?.id || (course as any)?.moduleId),
        module_title: activeModule?.title || (course as any)?.moduleTitle || lesson?.title || 'Module',
        lesson_id: currentLessonFromCatalog?.id || lesson?.id || lessonId || '',
        lesson_name: currentLessonFromCatalog?.title || (lesson as any)?.lessonName || (lesson as any)?.name || lesson?.title || '',
        lesson_title: currentLessonFromCatalog?.title || lesson?.title || '',
        voice: selectedVoice,
        slides: [{
          id: (data as any).id,
          type: data.type || 'concept',
          text: currentSlideText,
          title: currentSlideTitle,
        }],
      };

      const response = await fetch('http://192.168.1.17:8000/convert-lesson-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();

      const subtitles = normalizeSubtitleData(resData.subtitle_data);
      if (subtitles.length === 0 && typeof resData.subtitle_url === 'string' && resData.subtitle_url) {
        try {
          const subtitleResponse = await fetch(resData.subtitle_url);
          const subtitleJson = await subtitleResponse.json();
          const fetchedSubtitles = normalizeSubtitleData(subtitleJson?.subtitle_data ?? subtitleJson);
          if (fetchedSubtitles.length > 0) {
            setSubtitleData(fetchedSubtitles);
          } else {
            setSubtitleData([]);
          }
        } catch (subtitleError) {
          console.error('Failed to fetch subtitle data:', subtitleError);
          setSubtitleData([]);
        }
      } else {
        setSubtitleData(subtitles);
      }

      if (resData.audio_url) {
        setAudioUrl(resData.audio_url);
      } else if (resData.audioUrl) {
        setAudioUrl(resData.audioUrl);
      } else if (resData.path) {
        setAudioUrl(`http://192.168.1.17:8000${resData.path}`);
      } else if (Array.isArray(resData) && resData[0]?.path) {
        setAudioUrl(`http://192.168.1.17:8000${resData[0].path}`);
      }
    } catch (error) {
      console.error('Failed to fetch audio:', error);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [course?.courseId, currentSlideText, currentSlideTitle, currentStageIndex, data.type, lesson, lessonId, selectedVoice, setSubtitleData]);

  // Keep the latest fetchAudio in a ref so the effect below never needs
  // fetchAudio itself in its dependency array. fetchAudio's own identity is
  // unstable (it closes over `lesson`, which can get a new object reference
  // from the store on unrelated re-renders) — depending on it directly meant
  // the effect could refire and call the API a second time for the same
  // stage with none of the "real" triggers having changed.
  const fetchAudioRef = useRef(fetchAudio);
  useEffect(() => {
    fetchAudioRef.current = fetchAudio;
  }, [fetchAudio]);

  // Guard against duplicate in-flight calls for the exact same stage/voice
  // (e.g. React StrictMode's dev-only double-invoke, or rapid re-renders).
  const lastFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAudioMode || !currentSlideText || !lessonId) {
      lastFetchKeyRef.current = null;
      setAudioUrl(null);
      setSubtitleData([]);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setProgress(0);
      return;
    }

    const fetchKey = `${lessonId}::${currentStageIndex}::${selectedVoice}::${currentSlideText}`;
    if (lastFetchKeyRef.current === fetchKey) {
      // Same stage/voice/text combo already fetched (or in-flight) — skip.
      return;
    }
    lastFetchKeyRef.current = fetchKey;

    setAudioUrl(null);
    setSubtitleData([]);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setProgress(0);
    fetchAudioRef.current();
  }, [isAudioMode, lessonId, currentStageIndex, currentSlideText, selectedVoice, setProgress, setSubtitleData]);

  // When voice changes, clear audioUrl so it re-fetches
  const prevVoiceRef = useRef(selectedVoice);
  useEffect(() => {
    if (prevVoiceRef.current !== selectedVoice) {
      prevVoiceRef.current = selectedVoice;
      setAudioUrl(null);
      setSubtitleData([]);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setProgress(0);
    }
  }, [selectedVoice, setProgress, setSubtitleData]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Handle Play/Pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    if (subtitleData && subtitleData.length > 0) {
      const nextSub = subtitleData.find(s => s.start > current + 0.1);
      if (nextSub) {
        audioRef.current.currentTime = nextSub.start;
      }
    } else {
      audioRef.current.currentTime += 5;
    }
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    if (subtitleData && subtitleData.length > 0) {
      let activeIdx = subtitleData.findIndex(s => current >= s.start && current <= s.end);
      
      if (activeIdx === -1) {
        const nextIdx = subtitleData.findIndex(s => s.start > current);
        activeIdx = nextIdx !== -1 ? nextIdx - 1 : subtitleData.length - 1;
      }

      if (activeIdx > 0) {
        if (current - subtitleData[activeIdx].start > 2.0) {
          audioRef.current.currentTime = subtitleData[activeIdx].start;
        } else {
          audioRef.current.currentTime = subtitleData[activeIdx - 1].start;
        }
      } else {
        audioRef.current.currentTime = 0;
      }
    } else {
      audioRef.current.currentTime -= 5;
    }
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative bg-background">
      
      {/* Dynamic Main Content Area with Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Renderer */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-10 py-4 md:py-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 flex flex-col relative"
        >
          <div className="max-w-[1600px] mx-auto w-full flex flex-col items-start gap-4">
            
            {/* Overlay Audio Controls moved to Header */}
            {portalTarget && createPortal(
              <div className="flex items-center">
                {isAudioMode ? (
                  <AudioControls
                    isAudioMode={isAudioMode}
                    setIsAudioMode={setIsAudioMode}
                    isPlaying={isPlaying}
                    togglePlayPause={togglePlayPause}
                    playbackRate={playbackRate}
                    setPlaybackRate={setPlaybackRate}
                    showTranscript={showTranscript}
                    setShowTranscript={setShowTranscript}
                    isLoading={isLoadingAudio}
                    selectedVoice={selectedVoice}
                    setSelectedVoice={setSelectedVoice}
                    skipForward={skipForward}
                    skipBackward={skipBackward}
                    isAutoContinue={isAutoContinue}
                    setIsAutoContinue={setIsAutoContinue}
                  />
                ) : (
                  <button
                    onClick={() => setIsAudioMode(true)}
                    className="p-1.5 sm:px-3 sm:py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors duration-200 text-white/50 hover:text-purple-400 flex items-center justify-center mr-2"
                  >
                    <AudioLines className="w-4 h-4" />
                  </button>
                )}
              </div>,
              portalTarget
            )}

            <MemoizedRenderer analysis={analysis} />
          </div>
        </div>

      </div>

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) {
              const current = audioRef.current.currentTime;
              const dur = audioRef.current.duration;
              setGlobalCurrentTime(current);
              if (dur > 0) {
                setProgress(current / dur);
              }
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              const dur = audioRef.current.duration;
              if (dur > 0) {
                setProgress(audioRef.current.currentTime / dur);
              }
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setHasScrolledToBottom(true);
            if (isAutoContinue) {
              onComplete({ correct: true, score: 100 });
            }
          }}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      )}

      {/* Scroll-to-Continue Hint */}
      <AnimatePresence>
        {showScrollHint && !hasScrolledToBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-40"
          >
            <div
              onClick={() => {
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTo({
                    top: scrollContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                  });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-lg border border-primary/30 rounded-full cursor-pointer hover:bg-primary/30 transition-colors"
            >
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-xs font-semibold text-primary">Scroll down to continue</span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-4 h-4 text-primary" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared Bottom Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-3 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] z-50">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-end gap-3 px-1 md:px-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goBack}
              className="flex justify-center items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 font-bold text-sm rounded-xl border border-white/10 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </motion.button>


            {/* Continue Button — gated behind scroll completion */}
            <motion.button
              whileHover={hasScrolledToBottom ? { scale: 1.05 } : {}}
              whileTap={hasScrolledToBottom ? { scale: 0.95 } : {}}
              onClick={() => {
                if (!hasScrolledToBottom) return;
                if (audioRef.current) audioRef.current.pause();
                onComplete({ correct: true, score: 100 });
              }}
              disabled={!hasScrolledToBottom}
              className={`flex justify-center items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition-all duration-300 ${
                hasScrolledToBottom
                  ? 'bg-primary hover:bg-primary/80 text-white shadow-[0_0_15px_var(--color-primary)] cursor-pointer'
                  : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
              }`}
            >
              {hasScrolledToBottom ? (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Read to Continue
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

    </div>
  );
}