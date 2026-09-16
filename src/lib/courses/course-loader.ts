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

const COURSE_DIR = path.join(process.cwd(), 'course');

// ---- Single Course Loading ----

/**
 * Loads a single course by its folder name (courseId).
 * Searches for:
 *   1. /course/<id>/<id>.json  (exact match)
 *   2. /course/<id>.json       (flat file)
 *   3. /course/<id>/*.json     (any JSON in folder)
 * Normalizes raw arrays automatically.
 */
import prisma from '@/lib/db';

export function getCourseData(courseId: string): CourseJSON | null {
  // 1. Exact match: /course/<id>/<id>.json
  const exactPath = path.join(COURSE_DIR, courseId, `${courseId}.json`);
  if (fs.existsSync(exactPath)) {
    return safeLoadAndNormalize(exactPath, courseId);
  }

  // 2. Flat file: /course/<id>.json
  const flatPath = path.join(COURSE_DIR, `${courseId}.json`);
  if (fs.existsSync(flatPath)) {
    return safeLoadAndNormalize(flatPath, courseId);
  }

  // 3. Any JSON inside /course/<id>/
  const dirPath = path.join(COURSE_DIR, courseId);
  if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
    const jsonFile = findFirstJson(dirPath);
    if (jsonFile) {
      return safeLoadAndNormalize(path.join(dirPath, jsonFile), courseId);
    }
  }

  return null;
}

/**
 * Asynchronously loads a course by checking filesystem first,
 * and falling back to PostgreSQL database records for dynamically created courses.
 */
export async function getCourseDataAsync(courseId: string): Promise<CourseJSON | null> {
  // 1. Try local filesystem
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
                  challenge: {
                    question: `Implement the key logic demonstrated in ${lec.title}.`,
                    starterCode: `# Write your implementation for ${lec.title}\ndef solution():\n    # TODO: Implement solution\n    pass\n`,
                    solution: `def solution():\n    return True\n`,
                    explanation: `Mastering ${lec.title} requires applying theoretical principles to code.`,
                    language: 'python',
                  },
                },
              ],
            });
          });
        } else {
          lessons.push({
            id: mod.id || `mod-${mIdx}`,
            title: `${modPrefix} - Overview`,
            stages: [
              {
                type: 'concept',
                content: {
                  title: mod.title,
                  explanation: (mod as any).description || `${mod.title} curriculum module and foundational concepts.`,
                },
              },
            ],
          });
        }
      });

      if (lessons.length > 0) {
        return {
          courseId: dbCourse.id,
          title: dbCourse.title,
          theme: {
            primary: '#8B5CF6',
            accent: '#3B82F6',
          },
          lessons,
        };
      }
    }

    // 3. Fallback to flagship Generative AI course if needed
    const fallback = getCourseData('Generative_AI_Application_Engineer');
    if (fallback) {
      return {
        ...fallback,
        courseId,
        title: dbCourse?.title || fallback.title,
      };
    }
  } catch (err) {
    console.error('[CourseLoader DB Fallback Error]:', err);
  }

  return null;
}

// ---- Catalog Discovery (homepage) ----

/**
 * Scans the /course/ directory and returns lightweight metadata
 * for every valid course found. Does NOT load full lesson content
 * into memory — only enough to render cards.
 */
export function getAllCoursesMetadata(): CourseMetadata[] {
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

function findFirstJson(dirPath: string): string | null {
  try {
    const files = fs.readdirSync(dirPath);
    return files.find((f) => f.endsWith('.json')) || null;
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
