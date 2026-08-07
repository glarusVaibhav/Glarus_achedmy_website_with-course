// ============================================================
// Store — Backward-Compatible Facade (V4 Migration Layer)
// ============================================================
// This file re-exports the split stores as a single unified
// hook so that existing stage components (23+) continue to
// work without modification. New code should import from
// the individual store files directly.
// ============================================================

import { useProgressStore } from '@/lib/store/progressStore';
import { usePerformanceStore } from '@/lib/store/performanceStore';
import { useSessionStore } from '@/lib/store/sessionStore';
import { useUIStore } from '@/lib/store/uiStore';
import type { CourseJSON, StageResult } from '@/types/engine';
import type { TopicPerformance } from '@/lib/engine/DecisionEngine';

// --- Unified Interface (backward compat) ---

export interface LearningState {
  course: CourseJSON | null;
  currentLessonIndex: number;
  currentStageIndex: number;
  currentUserInput: string;
  mistakes: number;
  correctAnswers: number;
  confusionScore: number;
  consecutiveErrors: number;
  lastResult: StageResult | null;
  xp: number;
  level: number;
  streak: number;
  completedLessons: string[];
  lessonPerformances: TopicPerformance[];
  loadCourse: (data: CourseJSON) => void;
  goToLesson: (index: number) => void;
  goToStage: (index: number) => void;
  advanceStage: () => void;
  recordResult: (result: StageResult) => void;
  completeLesson: () => void;
  addXp: (amount: number) => void;
  resetSession: () => void;
  setCurrentUserInput: (input: string) => void;
  goBack: () => void;
}

/**
 * useLearningStore — Backward-compatible composite hook.
 *
 * Merges all 4 split stores into a single object matching
 * the original LearningState interface. All existing stage
 * components can continue importing this hook unchanged.
 *
 * For new code, prefer importing from the individual stores
 * to avoid unnecessary re-renders.
 */
export function useLearningStore(): LearningState {
  const progress = useProgressStore();
  const performance = usePerformanceStore();
  const session = useSessionStore();

  // Wrap recordResult to automatically inject lessonId
  const recordResult = (result: StageResult) => {
    const lesson = progress.course?.lessons[progress.currentLessonIndex];
    const lessonId = lesson?.id ?? 'unknown';
    performance.recordResult(result, lessonId);
  };

  // Wrap resetSession to clear both performance metrics and session input
  const resetSession = () => {
    performance.resetMetrics();
    session.clearInput();
  };

  return {
    // Progress store
    course: progress.course,
    currentLessonIndex: progress.currentLessonIndex,
    currentStageIndex: progress.currentStageIndex,
    completedLessons: progress.completedLessons,
    xp: progress.xp,
    level: progress.level,
    streak: progress.streak,
    loadCourse: progress.loadCourse,
    goToLesson: progress.goToLesson,
    goToStage: progress.goToStage,
    advanceStage: progress.advanceStage,
    completeLesson: progress.completeLesson,
    addXp: progress.addXp,
    goBack: progress.goBack,

    // Performance store
    mistakes: performance.mistakes,
    correctAnswers: performance.correctAnswers,
    confusionScore: performance.confusionScore,
    consecutiveErrors: performance.consecutiveErrors,
    lastResult: performance.lastResult,
    lessonPerformances: performance.lessonPerformances,

    // Session store
    currentUserInput: session.currentUserInput,
    setCurrentUserInput: session.setCurrentUserInput,

    // Wrapped actions
    recordResult,
    resetSession,
  };
}

// --- AI Store (backward compat) ---

export interface AIState {
  isOpen: boolean;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  autoTriggered: boolean;
  toggleAI: () => void;
  setOpen: (open: boolean) => void;
  addMessage: (role: 'user' | 'assistant' | 'system', content: string) => void;
  clearMessages: () => void;
  setAutoTriggered: (triggered: boolean) => void;
}

export function useAIStore(): AIState {
  const ui = useUIStore();
  return {
    isOpen: ui.isAIOpen,
    messages: ui.aiMessages,
    autoTriggered: ui.autoTriggered,
    toggleAI: ui.toggleAI,
    setOpen: ui.setAIOpen,
    addMessage: ui.addAIMessage,
    clearMessages: ui.clearAIMessages,
    setAutoTriggered: ui.setAutoTriggered,
  };
}
