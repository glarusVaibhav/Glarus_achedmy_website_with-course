"use client";

// ============================================================
// Stage Renderer V4 — Event-Driven + Error-Resilient
// ============================================================
// Reads the current stage from the split stores, looks up the
// lazy-loaded component from the plugin registry, wraps it in
// an error boundary + Suspense, and emits events on completion.
// ============================================================

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useProgressStore } from '@/lib/store/progressStore';
import { usePerformanceStore } from '@/lib/store/performanceStore';
import { useSessionStore } from '@/lib/store/sessionStore';
import { getStageComponent } from './StageRegistry';
import { StageErrorBoundary } from './StageErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { getNextStage, type NavigationContext } from '@/lib/engine/DecisionEngine';
import { eventBus } from '@/lib/events/eventBus';
import type { StageResult } from '@/types/engine';
import { Target, Loader2 } from 'lucide-react';

// --- Stage Loading Fallback ---

function StageLoadingFallback() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-white/40 text-sm font-medium">Loading stage...</p>
      </div>
    </div>
  );
}

// --- Main Renderer ---

export function StageRenderer() {
  const [retryCounter, setRetryCounter] = useState(0);
  // Use individual stores with selectors for minimal re-renders
  const course = useProgressStore((s) => s.course);
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const currentStageIndex = useProgressStore((s) => s.currentStageIndex);
  const goToStage = useProgressStore((s) => s.goToStage);
  const goToLesson = useProgressStore((s) => s.goToLesson);
  const advanceStage = useProgressStore((s) => s.advanceStage);
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const completeTopic = useProgressStore((s) => s.completeTopic);
  const activeTopicId = useProgressStore((s) => s.activeTopicId);
  const addXp = useProgressStore((s) => s.addXp);

  const mistakes = usePerformanceStore((s) => s.mistakes);
  const confusionScore = usePerformanceStore((s) => s.confusionScore);
  const consecutiveErrors = usePerformanceStore((s) => s.consecutiveErrors);
  const recordResult = usePerformanceStore((s) => s.recordResult);

  const clearInput = useSessionStore((s) => s.clearInput);

  const lesson = useMemo(
    () => course?.lessons[currentLessonIndex] ?? null,
    [course, currentLessonIndex]
  );

  const stage = useMemo(
    () => lesson?.stages[currentStageIndex] ?? null,
    [lesson, currentStageIndex]
  );

  const isLastStage = currentStageIndex >= (lesson?.stages.length ?? 0);

  const handleComplete = useCallback((result: StageResult) => {
    if (!lesson) return;

    const lessonId = lesson.id ?? 'unknown';
    const stageType = stage?.type ?? 'unknown';

    // Record result in performance store
    recordResult(result, lessonId);
    clearInput();

    // Emit events
    if (result.correct) {
      if (activeTopicId) {
        completeTopic(activeTopicId);
      }
      
      eventBus.emit('STAGE_COMPLETED', {
        lessonIndex: currentLessonIndex,
        stageIndex: currentStageIndex,
        stageType,
        score: result.score,
        correct: true,
        timeTaken: result.timeTaken,
        timestamp: Date.now(),
      });
    } else {
      eventBus.emit('STAGE_FAILED', {
        lessonIndex: currentLessonIndex,
        stageIndex: currentStageIndex,
        stageType,
        score: result.score,
        timestamp: Date.now(),
      });
    }

    // Decision engine
    const navCtx: NavigationContext = {
      currentStageIndex,
      totalStages: lesson.stages.length,
      mistakes: mistakes + (result.correct ? 0 : 1),
      confusionScore,
      consecutiveErrors: result.correct ? 0 : consecutiveErrors + 1,
      lastResult: result,
    };

    const decision = getNextStage(navCtx);

    if (result.correct) {
      addXp(result.score >= 80 ? 25 : 10);
    }

    switch (decision.action) {
      case 'complete':
        goToStage(lesson.stages.length);
        break;
      case 'repeat':
        // Increment retry counter so the component key changes and forces a re-mount
        setRetryCounter((c) => c + 1);
        break;
      case 'skip':
        goToStage(decision.targetIndex);
        break;
      case 'next':
      default:
        advanceStage();
        break;
    }
  }, [lesson, stage, currentLessonIndex, currentStageIndex, mistakes, confusionScore, consecutiveErrors, recordResult, clearInput, addXp, goToStage, advanceStage, activeTopicId, completeTopic]);

  const handleSkip = useCallback(() => {
    if (!lesson || !stage) return;
    eventBus.emit('STAGE_SKIPPED', {
      lessonIndex: currentLessonIndex,
      stageIndex: currentStageIndex,
      stageType: stage.type,
      timestamp: Date.now(),
    });
    advanceStage();
  }, [lesson, stage, currentLessonIndex, currentStageIndex, advanceStage]);

  if (!course || !lesson) return null;

  // Lesson Complete Screen
  if (!stage || isLastStage) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="glass-panel p-6 md:p-8 lg:p-10 rounded-3xl border-white/10 text-center max-w-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 blur-[100px]" />
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Target className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4 lg:mb-6 tracking-tight">
            Lesson <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Complete!</span>
          </h2>
          <p className="text-white/70 text-base lg:text-lg leading-relaxed mb-8 font-medium">
            You&apos;ve mastered <strong>{lesson.title}</strong>. +50 XP earned.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              completeLesson();
              addXp(50);
              const nextLessonIndex = currentLessonIndex + 1;
              if (course && nextLessonIndex < course.lessons.length) {
                goToLesson(nextLessonIndex);
              }
            }}
            className="px-8 py-3 bg-white text-black hover:bg-emerald-50 font-black text-base lg:text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] w-full sm:w-auto"
          >
            Continue
          </motion.button>
        </div>
      </div>
    );
  }

  const Component = getStageComponent(stage.type);

  if (!Component) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="glass-panel p-8 rounded-2xl border-white/10 text-center">
          <p className="text-white/60 text-lg">Unknown stage type: <code className="text-red-400 font-mono">{stage.type}</code></p>
          <button
            onClick={handleSkip}
            className="mt-4 px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            Skip →
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${currentLessonIndex}-${currentStageIndex}-${retryCounter}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full"
      >
        <StageErrorBoundary stageType={stage.type} onSkip={handleSkip}>
          <Suspense fallback={<StageLoadingFallback />}>
            <Component data={stage} onComplete={handleComplete} />
          </Suspense>
        </StageErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
}
