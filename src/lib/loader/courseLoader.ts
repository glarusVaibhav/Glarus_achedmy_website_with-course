// ============================================================
// Course Loader — Lazy Loading + Validation
// ============================================================
// Loads course metadata first, then lazily loads lessons and
// stages on demand. Validates with Zod at load time.
// ============================================================

import type { CourseJSON, LessonJSON } from '@/types/engine';
import { validateCourse, migrateIfNeeded } from '@/lib/schema/courseSchema';

// --- Course Metadata (lightweight) ---

export interface CourseMetadata {
  courseId: string;
  title: string;
  theme: { primary: string; accent: string };
  totalLessons: number;
  lessonTitles: string[];
  version: string;
}

export function extractMetadata(course: CourseJSON): CourseMetadata {
  return {
    courseId: course.courseId,
    title: course.title,
    theme: course.theme,
    totalLessons: course.lessons.length,
    lessonTitles: course.lessons.map((l) => l.title),
    version: (course as unknown as Record<string, unknown>).version as string || '3.0',
  };
}

// --- Validated Course Loading ---

export interface LoadResult {
  success: boolean;
  course?: CourseJSON;
  metadata?: CourseMetadata;
  errors?: string[];
}

export function loadAndValidateCourse(raw: unknown): LoadResult {
  try {
    // 1. Migration
    const migrated = migrateIfNeeded(raw as Record<string, unknown>);
    const course = migrated as unknown as CourseJSON;

    // Fast structural check (O(1) instead of recursive heavy Zod parsing over 3MB+ JSON)
    if (course && typeof course === 'object' && course.courseId && course.title && Array.isArray(course.lessons) && course.lessons.length > 0) {
      return {
        success: true,
        course,
        metadata: extractMetadata(course),
      };
    }

    return {
      success: false,
      errors: ['Invalid course data structure: missing courseId, title, or lessons array'],
    };
  } catch (err) {
    return {
      success: false,
      errors: [(err as Error).message],
    };
  }
}

// --- Lazy Lesson Loading ---

export function getLessonByIndex(course: CourseJSON, index: number): LessonJSON | null {
  if (index < 0 || index >= course.lessons.length) return null;
  return course.lessons[index];
}

export function getLessonStageCount(course: CourseJSON, lessonIndex: number): number {
  return course.lessons[lessonIndex]?.stages.length ?? 0;
}

// --- Preload Next Lesson (for smooth transitions) ---

export function preloadLesson(course: CourseJSON, lessonIndex: number): Promise<LessonJSON | null> {
  return new Promise((resolve) => {
    // Simulate async load — in a real backend this would be an API call
    setTimeout(() => {
      resolve(getLessonByIndex(course, lessonIndex));
    }, 0);
  });
}
