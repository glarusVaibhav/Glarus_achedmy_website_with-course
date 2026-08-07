"use client";

import { useEffect, useState } from 'react';
import { useProgressStore } from '@/lib/store/progressStore';
import { usePerformanceStore } from '@/lib/store/performanceStore';
import { useUIStore } from '@/lib/store/uiStore';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { PerformancePanel } from '@/components/layout/PerformancePanel';
import { GenericAITutor } from '@/components/layout/GenericAITutor';
import { StageRenderer } from '@/components/engine/StageRenderer';
import { AnimatePresence } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';
import type { CourseJSON } from '@/types/engine';
import { BackButton } from '@/components/layout/BackButton';
import { CourseSearch } from '@/components/layout/CourseSearch';
import { loadAndValidateCourse } from '@/lib/loader/courseLoader';
import { analytics } from '@/lib/analytics/engine';
import { eventBus } from '@/lib/events/eventBus';
import { useSidebarData } from '@/hooks/useSidebarData';

interface LearningLayoutProps {
  courseData: CourseJSON;
}

function getDisplayModuleTitle(rawTitle: string) {
  if (!rawTitle) return '';
  // Remove prefixes like "Module 10:", "MODULE 10 -", etc.
  return rawTitle.replace(/^module\s*\d+[:\-]?\s*/i, '').trim();
}

function HeaderTitles({ lesson, stage, courseId }: { lesson: any, stage: any, courseId: string }) {
  const { modules } = useSidebarData(courseId);
  const activeTopicId = useProgressStore((s) => s.activeTopicId);
  
  let topicTitle = '';

  // 1. FIRST: Try to get the specific topic or phase title from the sidebar hierarchy
  if (modules && activeTopicId) {
    for (const mod of modules) {
      if (!mod.topics) continue;
      
      const topic = mod.topics.find((t: any) => t.id === activeTopicId);
      if (topic) {
        topicTitle = topic.title;
        break;
      }

      for (const t of mod.topics) {
        if ((t as any).children) {
          const child = (t as any).children.find((c: any) => c.id === activeTopicId);
          if (child) {
            topicTitle = t.title;
            break;
          }
        }
      }
      if (topicTitle) break;
    }
  }

  // 2. FALLBACK: Use the lesson title
  if (!topicTitle) {
    topicTitle = lesson?.title || '';
  }

  const cleanTopicTitle = getDisplayModuleTitle(topicTitle);
  const stageTitle = stage?.content?.title || stage?.challenge?.title || stage?.title || '';

  // Temporary logging to identify which fields are being used
  console.log('[HeaderTitles] Rendering Context:');
  console.log(' - Source lesson.title:', lesson?.title);
  console.log(' - Found topicTitle:', topicTitle);
  console.log(' - Derived Category Title:', cleanTopicTitle);
  console.log(' - Slide Title:', stageTitle);

  return (
    <div className="flex flex-col min-w-0 justify-center gap-0.5">
      <h1 className="text-indigo-300 font-bold text-sm md:text-base truncate leading-tight">
        {cleanTopicTitle}
      </h1>
      <span className="text-white/60 text-xs md:text-sm font-medium truncate">
        {stageTitle || "Slide"}
      </span>
    </div>
  );
}

export function LearningLayout({ courseData }: LearningLayoutProps) {
  const course = useProgressStore((s) => s.course);
  const loadCourse = useProgressStore((s) => s.loadCourse);
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const currentStageIndex = useProgressStore((s) => s.currentStageIndex);
  const advanceStage = useProgressStore((s) => s.advanceStage);

  const resetMetrics = usePerformanceStore((s) => s.resetMetrics);

  const isAIOpen = useUIStore((s) => s.isAIOpen);
  const toggleAI = useUIStore((s) => s.toggleAI);
  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);

  const [mounted, setMounted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Synchronously initialize course store if course is null or courseId changed
  if (!course || course.courseId !== courseData.courseId) {
    loadCourse(courseData);
  }

  useEffect(() => {
    // Initialize analytics on mount
    analytics.init();
    return () => { analytics.destroy(); };
  }, []);

  useEffect(() => {
    const isStale = course && course.lessons.some((l, i) => l.stages?.length !== courseData.lessons[i]?.stages?.length);
    
    if (!course || course.courseId !== courseData.courseId || isStale) {
      const result = loadAndValidateCourse(courseData);
      if (result.success && result.course) {
        loadCourse(result.course);
        if (result.errors) {
          setValidationErrors(result.errors);
        }
      } else {
        loadCourse(courseData);
        setValidationErrors(result.errors ?? []);
      }
      resetMetrics();
    }
  }, [courseData, course, loadCourse, resetMetrics]);

  useEffect(() => { setMounted(true); }, []);

  const validLessonIndex = (course && currentLessonIndex >= 0 && currentLessonIndex < course.lessons.length) ? currentLessonIndex : 0;
  const lesson = course?.lessons[validLessonIndex];

  const validStageIndex = (lesson?.stages && currentStageIndex >= 0 && currentStageIndex < lesson.stages.length) ? currentStageIndex : 0;
  const stage = lesson?.stages[validStageIndex];
  const stageTypes = lesson?.stages.map((s) => s.type) ?? [];

  // Auto-collapse right panel (Smart Tracker) for Concept stage, open for other stages
  useEffect(() => {
    if (!stage) return;
    if (stage.type === 'concept') {
      setRightPanelOpen(false);
    } else {
      setRightPanelOpen(true);
    }
  }, [currentLessonIndex, currentStageIndex, stage?.type, setRightPanelOpen]);

  if (!mounted || !course || !lesson) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        Loading Learning Engine...
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-full bg-background text-foreground overflow-hidden"
      style={{
        '--color-primary': courseData.theme.primary,
        '--color-accent': courseData.theme.accent,
      } as React.CSSProperties}
    >
      {/* Left Sidebar — hidden below xl (1280px) */}
      <div className="hidden xl:flex shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_20%)] lg:bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_15%)] transition-all duration-500 h-screen overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none z-0" />

        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 border-b border-white/5 glass-panel border-x-0 border-t-0 z-20 shrink-0" style={{ height: 'var(--header-h)' }}>
          <div className="flex items-center gap-3 min-w-0 py-1">
            <BackButton />
            <HeaderTitles lesson={lesson} stage={stage as any} courseId={courseData.courseId} />
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Audio Controls Portal Target */}
            <div id="header-audio-controls" className="flex items-center" />

            {/* Skip Stage (Hidden on Concept stages since they have a Continue button) */}
            {!['concept', 'visual', 'teacher_vis', 'board_video'].includes(stage?.type ?? '') && (
              <button
                onClick={advanceStage}
                className="px-3 py-1 rounded-full text-xs font-bold text-white/50 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
              >
                Skip →
              </button>
            )}

            {/* Search */}
            <CourseSearch />

            {/* AI Tutor Toggle */}
            <button
              onClick={toggleAI}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                isAIOpen ? 'bg-primary text-white shadow-[0_0_15px_var(--color-primary)]' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Bot className="w-4 h-4" />
              {isAIOpen ? 'Close Tutor' : 'Ask AI'}
            </button>
          </div>
        </header>

        {/* Stage View */}
        <div className="flex-1 relative flex flex-col items-center z-10 overflow-hidden w-full">
          <div className="w-full h-full">
            <StageRenderer />
          </div>
        </div>
      </main>

      {/* Right Panel — hidden below 2xl (1536px) */}
      <div className="hidden 2xl:flex shrink-0">
        <PerformancePanel />
      </div>

      {/* AI Tutor Overlay */}
      <AnimatePresence>
        {isAIOpen && <GenericAITutor />}
      </AnimatePresence>
    </div>
  );
}
