// ============================================================
// Performance Store — Adaptive Metrics & Learning Analytics
// ============================================================

import { create } from 'zustand';
import type { StageResult } from '@/types/engine';
import { updateConfusion, type TopicPerformance } from '@/lib/engine/DecisionEngine';

export interface PerformanceState {
  // --- Adaptive Metrics ---
  mistakes: number;
  correctAnswers: number;
  confusionScore: number;
  consecutiveErrors: number;
  lastResult: StageResult | null;

  // --- Topic Performance ---
  lessonPerformances: TopicPerformance[];

  // --- Actions ---
  recordResult: (result: StageResult, lessonId: string) => void;
  resetMetrics: () => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  mistakes: 0,
  correctAnswers: 0,
  confusionScore: 0,
  consecutiveErrors: 0,
  lastResult: null,
  lessonPerformances: [],

  recordResult: (result, lessonId) => set((state) => {
    const newConfusion = updateConfusion(state.confusionScore, result);
    const newConsecutiveErrors = result.correct ? 0 : state.consecutiveErrors + 1;

    const existing = state.lessonPerformances.find((p) => p.lessonId === lessonId);
    const perf: TopicPerformance = existing
      ? {
          ...existing,
          totalAttempts: existing.totalAttempts + 1,
          totalCorrect: existing.totalCorrect + (result.correct ? 1 : 0),
          avgScore: Math.round(((existing.avgScore * existing.totalAttempts) + result.score) / (existing.totalAttempts + 1)),
          lastAttemptTime: Date.now(),
        }
      : {
          lessonId,
          totalAttempts: 1,
          totalCorrect: result.correct ? 1 : 0,
          avgScore: result.score,
          lastAttemptTime: Date.now(),
        };

    const updatedPerformances = existing
      ? state.lessonPerformances.map((p) => (p.lessonId === lessonId ? perf : p))
      : [...state.lessonPerformances, perf];

    return {
      mistakes: state.mistakes + (result.correct ? 0 : 1),
      correctAnswers: state.correctAnswers + (result.correct ? 1 : 0),
      confusionScore: newConfusion,
      consecutiveErrors: newConsecutiveErrors,
      lastResult: result,
      lessonPerformances: updatedPerformances,
    };
  }),

  resetMetrics: () => set({
    mistakes: 0,
    correctAnswers: 0,
    confusionScore: 0,
    consecutiveErrors: 0,
    lastResult: null,
  }),
}));
