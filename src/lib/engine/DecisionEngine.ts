// ============================================================
// Decision Engine V4 — Adaptive Learning Brain
// ============================================================
// Pure functions. No side effects. No store imports.
// Now with: user profiles, dynamic difficulty, full SM-2,
// personalized pathing, and weak-topic reinforcement.
// ============================================================

import type { StageResult } from '@/types/engine';

// ============================================================
// 1. Confusion Scoring
// ============================================================

export function updateConfusion(
  currentScore: number,
  result: StageResult
): number {
  if (result.correct) {
    const decay = result.score >= 80 ? 0.25 : 0.15;
    return Math.max(0, currentScore - decay);
  }
  const spike = result.score <= 20 ? 0.35 : 0.2;
  return Math.min(1, currentScore + spike);
}

// ============================================================
// 2. User Profile (Adaptive Personalization)
// ============================================================

export interface UserProfile {
  userId: string;
  learningSpeed: 'slow' | 'normal' | 'fast';
  weakTopics: string[];              // lessonIds
  accuracyTrend: number[];           // last N scores (0-100)
  preferredDifficulty: Difficulty;
  totalSessionTime: number;          // ms
  totalStagesCompleted: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export function createDefaultProfile(userId = 'anonymous'): UserProfile {
  return {
    userId,
    learningSpeed: 'normal',
    weakTopics: [],
    accuracyTrend: [],
    preferredDifficulty: 'medium',
    totalSessionTime: 0,
    totalStagesCompleted: 0,
  };
}

export function updateProfile(
  profile: UserProfile,
  result: StageResult,
  lessonId: string
): UserProfile {
  const newTrend = [...profile.accuracyTrend, result.score].slice(-20);

  // Calculate learning speed from recent trend
  const recentAvg = newTrend.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, newTrend.length);
  const recentTime = result.timeTaken ?? 30000;

  let learningSpeed: UserProfile['learningSpeed'] = 'normal';
  if (recentAvg >= 85 && recentTime < 15000) learningSpeed = 'fast';
  else if (recentAvg < 50 || recentTime > 60000) learningSpeed = 'slow';

  // Update weak topics
  let weakTopics = [...profile.weakTopics];
  if (!result.correct && result.score < 50) {
    if (!weakTopics.includes(lessonId)) {
      weakTopics.push(lessonId);
    }
  } else if (result.correct && result.score >= 80) {
    weakTopics = weakTopics.filter((t) => t !== lessonId);
  }

  // Dynamic difficulty adjustment
  const trendAvg = newTrend.reduce((a, b) => a + b, 0) / newTrend.length;
  let preferredDifficulty: Difficulty = 'medium';
  if (trendAvg >= 80 && learningSpeed === 'fast') preferredDifficulty = 'hard';
  else if (trendAvg < 45) preferredDifficulty = 'easy';

  return {
    ...profile,
    learningSpeed,
    weakTopics,
    accuracyTrend: newTrend,
    preferredDifficulty,
    totalStagesCompleted: profile.totalStagesCompleted + 1,
    totalSessionTime: profile.totalSessionTime + (result.timeTaken ?? 0),
  };
}

// ============================================================
// 3. Stage Repetition Logic
// ============================================================

export function shouldRepeatStage(
  mistakes: number,
  confusionScore: number,
  consecutiveErrors: number
): boolean {
  if (consecutiveErrors >= 2) return true;
  if (confusionScore >= 0.7 && mistakes >= 2) return true;
  return false;
}

// ============================================================
// 4. Adaptive Next-Stage Resolution
// ============================================================

export interface NavigationContext {
  currentStageIndex: number;
  totalStages: number;
  mistakes: number;
  confusionScore: number;
  consecutiveErrors: number;
  lastResult: StageResult | null;
  userProfile?: UserProfile;
}

export interface NavigationDecision {
  action: 'next' | 'repeat' | 'skip' | 'complete' | 'reinforce';
  targetIndex: number;
  reason: string;
  difficulty?: Difficulty;
}

export function getNextStage(ctx: NavigationContext): NavigationDecision {
  const { currentStageIndex, totalStages, confusionScore, consecutiveErrors, lastResult, userProfile } = ctx;

  // If we've passed the last stage, the lesson is done
  if (currentStageIndex >= totalStages - 1) {
    return { action: 'complete', targetIndex: currentStageIndex, reason: 'All stages completed' };
  }

  // If the user is struggling, repeat the current stage
  if (shouldRepeatStage(ctx.mistakes, confusionScore, consecutiveErrors)) {
    return {
      action: 'repeat',
      targetIndex: currentStageIndex,
      reason: 'High confusion or repeated errors',
      difficulty: 'easy',
    };
  }

  // Fast learner skip: if profile indicates fast + aced quickly
  if (
    userProfile?.learningSpeed === 'fast' &&
    lastResult && lastResult.correct &&
    lastResult.score >= 95 &&
    (lastResult.timeTaken ?? 99999) < 10000
  ) {
    const skipTarget = Math.min(currentStageIndex + 2, totalStages - 1);
    if (skipTarget > currentStageIndex + 1) {
      return {
        action: 'skip',
        targetIndex: skipTarget,
        reason: 'Fast learner — skipping ahead',
        difficulty: userProfile.preferredDifficulty,
      };
    }
  }

  // Standard skip for exceptional performance (no profile required)
  if (lastResult && lastResult.correct && lastResult.score >= 95 && (lastResult.timeTaken ?? 99999) < 10000) {
    const skipTarget = Math.min(currentStageIndex + 2, totalStages - 1);
    if (skipTarget > currentStageIndex + 1) {
      return { action: 'skip', targetIndex: skipTarget, reason: 'Exceptional performance — skipping ahead' };
    }
  }

  // Default: advance
  return {
    action: 'next',
    targetIndex: currentStageIndex + 1,
    reason: 'Normal progression',
    difficulty: userProfile?.preferredDifficulty,
  };
}

// ============================================================
// 5. Answer Evaluation (Local)
// ============================================================

export function evaluateAnswer(
  userAnswer: string | number,
  correctAnswer: string | number,
  options?: { caseSensitive?: boolean }
): StageResult {
  const startTime = Date.now();
  let correct = false;

  if (typeof userAnswer === 'number' && typeof correctAnswer === 'number') {
    correct = userAnswer === correctAnswer;
  } else {
    const ua = options?.caseSensitive ? String(userAnswer) : String(userAnswer).trim().toLowerCase();
    const ca = options?.caseSensitive ? String(correctAnswer) : String(correctAnswer).trim().toLowerCase();
    correct = ua === ca;
  }

  return {
    correct,
    score: correct ? 100 : 0,
    timeTaken: Date.now() - startTime,
  };
}

// ============================================================
// 6. Spaced Repetition — Full SM-2 Implementation
// ============================================================

export interface ReviewItem {
  lessonId: string;
  stageIndex: number;
  lastReviewed: number;
  nextReviewDate: number;
  interval: number;       // days
  easeFactor: number;     // SM-2 ease factor (default 2.5)
  repetitions: number;
  quality: number;        // last quality rating (0-5)
}

export function createReviewItem(lessonId: string, stageIndex: number): ReviewItem {
  return {
    lessonId,
    stageIndex,
    lastReviewed: Date.now(),
    nextReviewDate: Date.now() + 86400000, // +1 day
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    quality: 0,
  };
}

export function scheduleReview(
  item: ReviewItem,
  quality: number // 0-5 (0=total failure, 5=perfect)
): ReviewItem {
  let { easeFactor, interval, repetitions } = item;

  if (quality < 3) {
    // Failed — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Passed — apply SM-2
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const now = Date.now();
  return {
    ...item,
    lastReviewed: now,
    nextReviewDate: now + interval * 86400000,
    interval,
    easeFactor,
    repetitions,
    quality,
  };
}

export function getDueReviews(items: ReviewItem[]): ReviewItem[] {
  const now = Date.now();
  return items
    .filter((item) => item.nextReviewDate <= now)
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate);
}

export function scoreToQuality(score: number): number {
  if (score >= 95) return 5;
  if (score >= 80) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  if (score >= 20) return 1;
  return 0;
}

// ============================================================
// 7. Weak Topic Detection
// ============================================================

export interface TopicPerformance {
  lessonId: string;
  totalAttempts: number;
  totalCorrect: number;
  avgScore: number;
  lastAttemptTime: number;
}

export function detectWeakTopics(
  performances: TopicPerformance[],
  threshold: number = 60
): TopicPerformance[] {
  return performances
    .filter((p) => p.avgScore < threshold && p.totalAttempts >= 2)
    .sort((a, b) => a.avgScore - b.avgScore);
}

// ============================================================
// 8. Advanced Stage Evaluation Functions
// ============================================================

export function evaluateSemanticQuality(
  answer: string,
  expectedKeywords: string[],
  _context?: string
): { score: number; matchedKeywords: string[]; feedback: string } {
  const normalizedAnswer = answer.toLowerCase().trim();
  const matched = expectedKeywords.filter((kw) =>
    normalizedAnswer.includes(kw.toLowerCase())
  );
  const ratio = expectedKeywords.length > 0 ? matched.length / expectedKeywords.length : 0;
  const score = Math.round(ratio * 100);

  let feedback = 'Great analysis!';
  if (score < 40) feedback = 'Try to include more relevant concepts in your answer.';
  else if (score < 70) feedback = 'Good start, but you missed some key points.';

  return { score, matchedKeywords: matched, feedback };
}

export function evaluateSimulation(
  completedSteps: number,
  totalSteps: number
): StageResult {
  const ratio = totalSteps > 0 ? completedSteps / totalSteps : 0;
  const score = Math.round(ratio * 100);
  return {
    correct: ratio >= 0.8,
    score,
    feedback: ratio >= 1 ? 'Simulation complete!' : `${completedSteps}/${totalSteps} steps completed.`,
  };
}

export function evaluateSpeedQuiz(
  correctCount: number,
  totalQuestions: number,
  avgTimeMs: number,
  maxTimeMs: number
): StageResult {
  const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;
  const timeFactor = avgTimeMs < maxTimeMs ? 1 + (1 - avgTimeMs / maxTimeMs) * 0.2 : 0.8;
  const rawScore = Math.round(accuracy * timeFactor * 100);
  const score = Math.min(100, Math.max(0, rawScore));

  return {
    correct: accuracy >= 0.6,
    score,
    feedback: accuracy >= 0.8 ? 'Lightning fast!' : accuracy >= 0.6 ? 'Good speed.' : 'Practice more to improve speed.',
    timeTaken: avgTimeMs * totalQuestions,
  };
}

export function evaluateRecall(
  answer: string,
  expectedKeywords: string[],
  difficulty: number = 3
): StageResult {
  const { score, matchedKeywords } = evaluateSemanticQuality(answer, expectedKeywords);
  const difficultyMultiplier = 1 - (difficulty - 3) * 0.1;
  const adjustedScore = Math.min(100, Math.max(0, Math.round(score * difficultyMultiplier)));

  return {
    correct: adjustedScore >= 50,
    score: adjustedScore,
    feedback: `Recalled ${matchedKeywords.length}/${expectedKeywords.length} key concepts.`,
  };
}
