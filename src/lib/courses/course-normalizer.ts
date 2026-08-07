// ============================================================
// Course Normalizer — Handles raw AI-generated arrays & partial schemas
// ============================================================

import type { CourseJSON } from '@/types/engine';

const DEFAULT_THEME = { primary: '#8b5cf6', accent: '#c084fc' };

/**
 * Normalizes any parsed JSON into a valid CourseJSON structure.
 * Handles:
 * - Raw lesson arrays (AI engine output)
 * - Partial CourseJSON (missing courseId/title/theme)
 * - Already valid CourseJSON (passthrough)
 */
export function normalizeCourseData(raw: unknown, courseId: string): CourseJSON | null {
  if (!raw) return null;

  // Case 1: Raw array of lessons — wrap it
  if (Array.isArray(raw)) {
    if (raw.length === 0) return null;
    return {
      courseId,
      title: formatCourseTitle(courseId),
      theme: DEFAULT_THEME,
      lessons: raw,
    };
  }

  // Case 2: Object — patch missing fields
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;

    // Ensure lessons array exists
    const lessons = Array.isArray(obj.lessons) ? obj.lessons : [];
    if (lessons.length === 0 && !Array.isArray(obj.modules)) return null;

    // Support legacy "modules" key
    const finalLessons = lessons.length > 0 ? lessons : (obj.modules as unknown[]) || [];

    return {
      courseId: (obj.courseId as string) || courseId,
      title: (obj.title as string) || formatCourseTitle(courseId),
      theme: isValidTheme(obj.theme) ? obj.theme as CourseJSON['theme'] : DEFAULT_THEME,
      lessons: finalLessons as CourseJSON['lessons'],
    };
  }

  return null;
}

function formatCourseTitle(id: string): string {
  return id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isValidTheme(theme: unknown): boolean {
  if (!theme || typeof theme !== 'object') return false;
  const t = theme as Record<string, unknown>;
  return typeof t.primary === 'string' && typeof t.accent === 'string';
}
