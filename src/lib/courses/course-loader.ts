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
