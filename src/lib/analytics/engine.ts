// ============================================================
// Analytics Engine — Observability for the Learning OS
// ============================================================
// Subscribes to the EventBus and tracks user engagement metrics.
// ============================================================

import { eventBus, type EventType, type EventPayload } from '@/lib/events/eventBus';

// --- Metric Types ---

export interface StageMetric {
  stageType: string;
  lessonIndex: number;
  stageIndex: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  score?: number;
  correct?: boolean;
  retryCount: number;
}

export interface LessonMetric {
  lessonId: string;
  lessonIndex: number;
  startTime: number;
  endTime?: number;
  totalStages: number;
  completedStages: number;
  avgScore: number;
  dropOff: boolean;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  totalTimeMs: number;
  stagesAttempted: number;
  stagesCompleted: number;
  stagesFailed: number;
  stagesSkipped: number;
  avgScore: number;
  hintsUsed: number;
  errorsHit: number;
  weakStageTypes: string[];
  retryMap: Record<string, number>; // stageType -> retryCount
}

// --- Analytics Engine ---

class AnalyticsEngine {
  private stageMetrics: StageMetric[] = [];
  private lessonMetrics: LessonMetric[] = [];
  private currentStage: StageMetric | null = null;
  private currentLesson: LessonMetric | null = null;
  private sessionStart = Date.now();
  private hintsUsed = 0;
  private errorsHit = 0;
  private stagesFailed = 0;
  private stagesSkipped = 0;
  private unsubscribers: Array<() => void> = [];

  init(): void {
    this.sessionStart = Date.now();

    this.unsubscribers.push(
      eventBus.on('STAGE_STARTED', (p) => this.onStageStarted(p)),
      eventBus.on('STAGE_COMPLETED', (p) => this.onStageCompleted(p)),
      eventBus.on('STAGE_FAILED', (p) => this.onStageFailed(p)),
      eventBus.on('STAGE_SKIPPED', (p) => this.onStageSkipped(p)),
      eventBus.on('LESSON_STARTED', (p) => this.onLessonStarted(p)),
      eventBus.on('LESSON_COMPLETED', (p) => this.onLessonCompleted(p)),
      eventBus.on('HINT_REQUESTED', () => { this.hintsUsed++; }),
      eventBus.on('ERROR_BOUNDARY_HIT', () => { this.errorsHit++; }),
    );
  }

  destroy(): void {
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
  }

  private onStageStarted(p: EventPayload['STAGE_STARTED']): void {
    this.currentStage = {
      stageType: p.stageType,
      lessonIndex: p.lessonIndex,
      stageIndex: p.stageIndex,
      startTime: p.timestamp,
      retryCount: 0,
    };
  }

  private onStageCompleted(p: EventPayload['STAGE_COMPLETED']): void {
    if (this.currentStage) {
      this.currentStage.endTime = p.timestamp;
      this.currentStage.duration = p.timestamp - this.currentStage.startTime;
      this.currentStage.score = p.score;
      this.currentStage.correct = p.correct;
      this.stageMetrics.push({ ...this.currentStage });
    }

    if (this.currentLesson) {
      this.currentLesson.completedStages++;
      const scores = this.stageMetrics
        .filter((m) => m.lessonIndex === this.currentLesson!.lessonIndex && m.score != null)
        .map((m) => m.score!);
      this.currentLesson.avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    }

    this.currentStage = null;
  }

  private onStageFailed(p: EventPayload['STAGE_FAILED']): void {
    this.stagesFailed++;
    if (this.currentStage) {
      this.currentStage.retryCount++;
    }
  }

  private onStageSkipped(_p: EventPayload['STAGE_SKIPPED']): void {
    this.stagesSkipped++;
    this.currentStage = null;
  }

  private onLessonStarted(p: EventPayload['LESSON_STARTED']): void {
    this.currentLesson = {
      lessonId: p.lessonId,
      lessonIndex: p.lessonIndex,
      startTime: p.timestamp,
      totalStages: 0,
      completedStages: 0,
      avgScore: 0,
      dropOff: false,
    };
  }

  private onLessonCompleted(p: EventPayload['LESSON_COMPLETED']): void {
    if (this.currentLesson) {
      this.currentLesson.endTime = p.timestamp;
      this.lessonMetrics.push({ ...this.currentLesson });
    }
    this.currentLesson = null;
  }

  // --- Public Accessors ---

  getSessionMetrics(): SessionMetrics {
    const completed = this.stageMetrics.filter((m) => m.correct === true);
    const allScores = this.stageMetrics.filter((m) => m.score != null).map((m) => m.score!);

    // Find weak stage types (avgScore < 60 with 2+ attempts)
    const typeScores = new Map<string, number[]>();
    this.stageMetrics.forEach((m) => {
      if (m.score != null) {
        if (!typeScores.has(m.stageType)) typeScores.set(m.stageType, []);
        typeScores.get(m.stageType)!.push(m.score);
      }
    });
    const weakStageTypes: string[] = [];
    typeScores.forEach((scores, type) => {
      if (scores.length >= 2) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg < 60) weakStageTypes.push(type);
      }
    });

    // Build retry map
    const retryMap: Record<string, number> = {};
    this.stageMetrics.forEach((m) => {
      if (m.retryCount > 0) {
        retryMap[m.stageType] = (retryMap[m.stageType] || 0) + m.retryCount;
      }
    });

    return {
      sessionId: `session_${this.sessionStart}`,
      startTime: this.sessionStart,
      totalTimeMs: Date.now() - this.sessionStart,
      stagesAttempted: this.stageMetrics.length,
      stagesCompleted: completed.length,
      stagesFailed: this.stagesFailed,
      stagesSkipped: this.stagesSkipped,
      avgScore: allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0,
      hintsUsed: this.hintsUsed,
      errorsHit: this.errorsHit,
      weakStageTypes,
      retryMap,
    };
  }

  getStageMetrics(): StageMetric[] {
    return [...this.stageMetrics];
  }

  getLessonMetrics(): LessonMetric[] {
    return [...this.lessonMetrics];
  }

  getTimePerStageType(): Record<string, number> {
    const result: Record<string, { total: number; count: number }> = {};
    this.stageMetrics.forEach((m) => {
      if (m.duration) {
        if (!result[m.stageType]) result[m.stageType] = { total: 0, count: 0 };
        result[m.stageType].total += m.duration;
        result[m.stageType].count++;
      }
    });
    const out: Record<string, number> = {};
    Object.entries(result).forEach(([type, { total, count }]) => {
      out[type] = Math.round(total / count);
    });
    return out;
  }

  getDropOffStages(): StageMetric[] {
    // Stages where user started but never completed
    return this.stageMetrics.filter((m) => m.startTime && !m.endTime);
  }

  reset(): void {
    this.stageMetrics = [];
    this.lessonMetrics = [];
    this.currentStage = null;
    this.currentLesson = null;
    this.sessionStart = Date.now();
    this.hintsUsed = 0;
    this.errorsHit = 0;
    this.stagesFailed = 0;
    this.stagesSkipped = 0;
  }
}

// Singleton
export const analytics = new AnalyticsEngine();
