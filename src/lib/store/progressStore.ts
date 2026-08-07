// ============================================================
// Progress Store — Navigation & Completion State
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CourseJSON } from '@/types/engine';
import { eventBus } from '@/lib/events/eventBus';

export interface ProgressState {
  // --- Course Data ---
  course: CourseJSON | null;
  currentLessonIndex: number;
  currentStageIndex: number;

  // --- Completion ---
  completedLessons: string[];
  completedTopics: string[];
  visitedTopics: string[];
  activeTopicId: string | null;

  // --- Gamification ---
  xp: number;
  level: number;
  streak: number;

  // --- Actions ---
  loadCourse: (data: CourseJSON) => void;
  goToLesson: (index: number) => void;
  goToStage: (index: number) => void;
  advanceStage: () => void;
  completeLesson: () => void;
  completeTopic: (topicId: string) => void;
  markTopicVisited: (topicId: string) => void;
  setActiveTopicId: (topicId: string | null) => void;
  addXp: (amount: number) => void;
  goBack: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      course: null,
      currentLessonIndex: 0,
      currentStageIndex: 0,
      completedLessons: [],
      completedTopics: [],
      visitedTopics: [],
      activeTopicId: null,
      xp: 0,
      level: 1,
      streak: 0,

      loadCourse: (data) => {
        set({
          course: data,
          currentLessonIndex: 0,
          currentStageIndex: 0,
          activeTopicId: null,
        });
        eventBus.emit('COURSE_LOADED', {
          courseId: data.courseId,
          totalLessons: data.lessons.length,
          timestamp: Date.now(),
        });
      },

      goToLesson: (index) => {
        const state = get();
        const lesson = state.course?.lessons[index];
        set({
          currentLessonIndex: index,
          currentStageIndex: 0,
        });
        if (lesson) {
          eventBus.emit('LESSON_STARTED', {
            lessonIndex: index,
            lessonId: lesson.id,
            timestamp: Date.now(),
          });
        }
      },

      goToStage: (index) => {
        const state = get();
        const lesson = state.course?.lessons[state.currentLessonIndex];
        const stage = lesson?.stages[index];
        set({ currentStageIndex: index });
        if (stage) {
          eventBus.emit('STAGE_STARTED', {
            lessonIndex: state.currentLessonIndex,
            stageIndex: index,
            stageType: stage.type,
            timestamp: Date.now(),
          });
        }
      },

      advanceStage: () => {
        const state = get();
        if (!state.course) return;
        const lesson = state.course.lessons[state.currentLessonIndex];
        if (!lesson) return;

        const nextIndex = state.currentStageIndex + 1;
        if (nextIndex < lesson.stages.length) {
          set({ currentStageIndex: nextIndex });
          eventBus.emit('STAGE_STARTED', {
            lessonIndex: state.currentLessonIndex,
            stageIndex: nextIndex,
            stageType: lesson.stages[nextIndex].type,
            timestamp: Date.now(),
          });
        }
      },

      goBack: () => {
        const state = get();
        if (!state.course) return;

        eventBus.emit('NAVIGATION_BACK', {
          fromLesson: state.currentLessonIndex,
          fromStage: state.currentStageIndex,
          timestamp: Date.now(),
        });

        if (state.currentStageIndex > 0) {
          set({ currentStageIndex: state.currentStageIndex - 1 });
        } else if (state.currentStageIndex === 0 && state.currentLessonIndex > 0) {
          const prevLessonIndex = state.currentLessonIndex - 1;
          const prevLesson = state.course.lessons[prevLessonIndex];
          if (prevLesson && prevLesson.stages) {
            set({
              currentLessonIndex: prevLessonIndex,
              currentStageIndex: prevLesson.stages.length - 1,
            });
          }
        }
      },

      completeLesson: () => set((state) => {
        const lesson = state.course?.lessons[state.currentLessonIndex];
        if (!lesson) return state;
        const newCompleted = state.completedLessons.includes(lesson.id)
          ? state.completedLessons
          : [...state.completedLessons, lesson.id];
        const newXp = state.xp + 50;

        eventBus.emit('LESSON_COMPLETED', {
          lessonIndex: state.currentLessonIndex,
          lessonId: lesson.id,
          xpEarned: 50,
          timestamp: Date.now(),
        });

        return {
          completedLessons: newCompleted,
          xp: newXp,
          level: Math.floor(newXp / 500) + 1,
        };
      }),

      completeTopic: (topicId) => set((state) => {
        const newCompleted = state.completedTopics.includes(topicId)
          ? state.completedTopics
          : [...state.completedTopics, topicId];
        
        return {
          completedTopics: newCompleted,
        };
      }),

      markTopicVisited: (topicId) => set((state) => {
        const newVisited = state.visitedTopics.includes(topicId)
          ? state.visitedTopics
          : [...state.visitedTopics, topicId];
        
        return {
          visitedTopics: newVisited,
        };
      }),

      setActiveTopicId: (topicId) => set({ activeTopicId: topicId }),

      addXp: (amount) => set((state) => {
        const newXp = state.xp + amount;
        eventBus.emit('XP_GAINED', {
          amount,
          source: 'stage_completion',
          timestamp: Date.now(),
        });
        return { xp: newXp, level: Math.floor(newXp / 500) + 1 };
      }),
    }),
    {
      name: 'glarus-progress-storage',
      partialize: (state) => ({
        completedLessons: state.completedLessons,
        completedTopics: state.completedTopics,
        visitedTopics: state.visitedTopics,
        activeTopicId: state.activeTopicId,
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        currentLessonIndex: state.currentLessonIndex,
        currentStageIndex: state.currentStageIndex,
      }),
    }
  )
);
