// ============================================================
// Course Loader — Filesystem-driven course discovery
// ============================================================
// Server-only module. Uses Node.js fs/path to scan /course/.
// ============================================================

import fs from 'fs';
import path from 'path';
import type { CourseJSON } from '@/types/engine';
import { normalizeCourseData } from './course-normalizer';
import { extractCourseMetadata, type CourseMetadata } from './course-metadata';
import prisma from '@/lib/db';

const COURSE_DIR = path.join(process.cwd(), 'course');

// ---- Single Course Loading ----

/**
 * Loads a single course by its folder name or title (courseId).
 * Searches for:
 *   1. /course/<id>/lessons.json
 *   2. /course/<id>/<id>.json
 *   3. /course/<id>.json
 *   4. Fuzzy matching among /course/* directory names
 */
export function getCourseData(courseId: string): CourseJSON | null {
  if (!fs.existsSync(COURSE_DIR)) return null;

  // 1. Direct folder checks
  const lessonsPath = path.join(COURSE_DIR, courseId, 'lessons.json');
  if (fs.existsSync(lessonsPath)) {
    return safeLoadAndNormalize(lessonsPath, courseId);
  }

  const exactPath = path.join(COURSE_DIR, courseId, `${courseId}.json`);
  if (fs.existsSync(exactPath)) {
    return safeLoadAndNormalize(exactPath, courseId);
  }

  // 2. Flat file check: /course/<id>.json
  const flatPath = path.join(COURSE_DIR, `${courseId}.json`);
  if (fs.existsSync(flatPath)) {
    return safeLoadAndNormalize(flatPath, courseId);
  }

  // 3. Any JSON inside /course/<id>/
  const dirPath = path.join(COURSE_DIR, courseId);
  if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
    const jsonFile = findFirstJson(dirPath, courseId);
    if (jsonFile) {
      return safeLoadAndNormalize(path.join(dirPath, jsonFile), courseId);
    }
  }

  // 4. Fuzzy & snake_case matching among directories in COURSE_DIR
  try {
    const entries = fs.readdirSync(COURSE_DIR, { withFileTypes: true });
    const cleanTarget = courseId.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const cleanEntry = entry.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanEntry === cleanTarget) {
        const matchedDir = path.join(COURSE_DIR, entry.name);
        const jsonFile = findFirstJson(matchedDir, entry.name);
        if (jsonFile) {
          const loaded = safeLoadAndNormalize(path.join(matchedDir, jsonFile), entry.name);
          if (loaded && Array.isArray(loaded.lessons) && loaded.lessons.length > 0) {
            return loaded;
          }
        }
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Asynchronously loads a course by checking filesystem first,
 * and falling back to PostgreSQL database records for dynamically created courses.
 */
export async function getCourseDataAsync(courseId: string): Promise<CourseJSON | null> {
  // 1. Try local filesystem JSON
  const fsData = getCourseData(courseId);
  if (fsData && Array.isArray(fsData.lessons) && fsData.lessons.length > 0) {
    return fsData;
  }

  // 2. Try Database lookup
  try {
    const dbCourse = await prisma.course.findFirst({
      where: {
        OR: [
          { id: courseId },
          { title: courseId },
          { title: decodeURIComponent(courseId) },
        ],
      },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lectures: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (dbCourse) {
      // Check if DB course title matches a JSON course folder
      const dbFsData = getCourseData(dbCourse.title) || getCourseData(dbCourse.id);
      if (dbFsData && Array.isArray(dbFsData.lessons) && dbFsData.lessons.length > 0) {
        return dbFsData;
      }

      const lessons: any[] = [];

      dbCourse.modules.forEach((mod, mIdx) => {
        const cleanModTitle = mod.title.replace(/^module\s*\d+[:\-]?\s*/i, '').trim();
        const modPrefix = `Module ${mIdx + 1}: ${cleanModTitle || mod.title}`;

        if (mod.lectures.length > 0) {
          mod.lectures.forEach((lec, lIdx) => {
            lessons.push({
              id: lec.id || `lec-${mIdx}-${lIdx}`,
              title: `${modPrefix} - ${lec.title}`,
              stages: [
                {
                  type: 'concept',
                  content: {
                    title: lec.title,
                    explanation: (lec as any).description || `Comprehensive interactive guide and code walkthrough for ${lec.title}.`,
                    videoUrl: lec.videoUrl || undefined,
                  },
                },
                {
                  type: 'code',
                  content: {
                    language: 'python',
                    starterCode: `# Interactive Code Lab: ${lec.title}\ndef solve():\n    print("Ready to code!")\n\nsolve()\n`,
                    solution: `def solve():\n    print("Ready to code!")\n\nsolve()\n`,
                    hints: ['Review the concept notes before running code.'],
                  },
                },
              ],
            });
          });
        }
      });

      if (lessons.length > 0) {
        return {
          courseId: dbCourse.id,
          title: dbCourse.title,
          theme: { primary: '#6366f1', accent: '#8b5cf6' },
          lessons,
        };
      }
    }
  } catch (err) {
    console.warn(`[CourseLoader] DB lookup fallback failed for ${courseId}:`, (err as Error).message);
  }

  return null;
}

// ---- All Courses Discovery ----

/**
 * Scans the /course/ directory and returns metadata for all valid courses found.
 */
export function getAllCourses(): CourseMetadata[] {
  if (!fs.existsSync(COURSE_DIR)) return [];

  const entries = fs.readdirSync(COURSE_DIR, { withFileTypes: true });
  const results: CourseMetadata[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const courseId = entry.name;
    const courseData = getCourseData(courseId);

    if (courseData && Array.isArray(courseData.lessons) && courseData.lessons.length > 0) {
      results.push(extractCourseMetadata(courseData, courseId));
    }
  }

  return results;
}

// ---- Internal Helpers ----

function findFirstJson(dirPath: string, courseId?: string): string | null {
  try {
    const files = fs.readdirSync(dirPath);
    if (files.includes('lessons.json')) return 'lessons.json';
    if (courseId && files.includes(`${courseId}.json`)) return `${courseId}.json`;
    if (files.includes('course.json')) return 'course.json';
    return (
      files.find(
        (f) => f.endsWith('.json') && !f.includes('backup') && !f.includes('topics')
      ) ||
      files.find((f) => f.endsWith('.json')) ||
      null
    );
  } catch {
    return null;
  }
}

function safeLoadAndNormalize(filePath: string, courseId: string): CourseJSON | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return normalizeCourseData(parsed, courseId);
  } catch (err) {
    console.warn(`[CourseLoader] Failed to load ${filePath}:`, (err as Error).message);
    return null;
  }
}
