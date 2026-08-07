// ============================================================
// Hook — useModuleProgress (Course-wide Aggregation & Progress)
// ============================================================

import { useMemo, useCallback } from 'react';
import type { SidebarModule } from '@/types/sidebar.types';

export function useModuleProgress(modules: SidebarModule[]) {
  // 1. Calculate aggregated course completion metrics
  const stats = useMemo(() => {
    let totalLessonsCount = 0;
    let completedLessonsCount = 0;

    modules.forEach((mod) => {
      mod.topics.forEach((t) => {
        totalLessonsCount++;
        if (t.isCompleted) {
          completedLessonsCount++;
        }
      });
    });

    const overallProgress = totalLessonsCount > 0
      ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
      : 0;

    return {
      totalLessonsCount,
      completedLessonsCount,
      overallProgress,
    };
  }, [modules]);

  // 2. Helper to check if a module has all lessons completed
  const isModuleCompleted = useCallback((moduleId: string): boolean => {
    const mod = modules.find((m) => m.moduleId === moduleId);
    if (!mod) return false;
    const lessons = mod.topics;
    return lessons.length > 0 && lessons.every((l) => l.isCompleted);
  }, [modules]);

  return {
    totalLessons: stats.totalLessonsCount,
    completedLessons: stats.completedLessonsCount,
    overallProgress: stats.overallProgress,
    isModuleCompleted,
  };
}
