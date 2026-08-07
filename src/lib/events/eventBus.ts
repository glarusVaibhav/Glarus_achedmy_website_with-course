// ============================================================
// Event Bus — Decoupled Pub/Sub for the Learning Engine
// ============================================================
// Stage components emit events. The DecisionEngine, Analytics,
// and AI Tutor subscribe. Zero direct coupling.
// ============================================================

export type EventType =
  | 'STAGE_STARTED'
  | 'STAGE_COMPLETED'
  | 'STAGE_FAILED'
  | 'STAGE_SKIPPED'
  | 'LESSON_COMPLETED'
  | 'LESSON_STARTED'
  | 'COURSE_LOADED'
  | 'AI_EVALUATED'
  | 'AI_TUTOR_TRIGGERED'
  | 'XP_GAINED'
  | 'NAVIGATION_BACK'
  | 'HINT_REQUESTED'
  | 'ERROR_BOUNDARY_HIT';

export interface EventPayload {
  STAGE_STARTED: { lessonIndex: number; stageIndex: number; stageType: string; timestamp: number };
  STAGE_COMPLETED: { lessonIndex: number; stageIndex: number; stageType: string; score: number; correct: boolean; timeTaken?: number; timestamp: number };
  STAGE_FAILED: { lessonIndex: number; stageIndex: number; stageType: string; score: number; timestamp: number };
  STAGE_SKIPPED: { lessonIndex: number; stageIndex: number; stageType: string; timestamp: number };
  LESSON_COMPLETED: { lessonIndex: number; lessonId: string; xpEarned: number; timestamp: number };
  LESSON_STARTED: { lessonIndex: number; lessonId: string; timestamp: number };
  COURSE_LOADED: { courseId: string; totalLessons: number; timestamp: number };
  AI_EVALUATED: { stageType: string; score: number; status: string; timestamp: number };
  AI_TUTOR_TRIGGERED: { reason: 'manual' | 'auto_confusion' | 'auto_errors'; confusionScore: number; timestamp: number };
  XP_GAINED: { amount: number; source: string; timestamp: number };
  NAVIGATION_BACK: { fromLesson: number; fromStage: number; timestamp: number };
  HINT_REQUESTED: { stageType: string; stageIndex: number; timestamp: number };
  ERROR_BOUNDARY_HIT: { stageType: string; error: string; timestamp: number };
}

type EventHandler<T extends EventType> = (payload: EventPayload[T]) => void;

class LearningEventBus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new Map<EventType, Set<EventHandler<any>>>();
  private history: Array<{ type: EventType; payload: unknown; timestamp: number }> = [];
  private maxHistory = 500;

  on<T extends EventType>(event: T, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  emit<T extends EventType>(event: T, payload: EventPayload[T]): void {
    // Record history
    this.history.push({ type: event, payload, timestamp: Date.now() });
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    // Notify listeners
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] Error in handler for ${event}:`, err);
        }
      });
    }
  }

  off<T extends EventType>(event: T, handler: EventHandler<T>): void {
    this.listeners.get(event)?.delete(handler);
  }

  getHistory(type?: EventType, limit = 50) {
    const filtered = type ? this.history.filter((e) => e.type === type) : this.history;
    return filtered.slice(-limit);
  }

  clearHistory(): void {
    this.history = [];
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

// Singleton
export const eventBus = new LearningEventBus();
