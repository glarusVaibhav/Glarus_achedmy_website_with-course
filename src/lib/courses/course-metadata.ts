import type { CourseJSON, LessonJSON } from '@/types/engine';

export interface CourseMetadata {
  courseId: string;
  title: string;
  description: string;
  theme: {
    primary: string;
    accent: string;
  };
  totalLessons: number;
  estimatedDuration?: string;
  difficulty?: string;
  thumbnail?: string;
}

const DEFAULT_THEMES = [
  { primary: '#8b5cf6', accent: '#c084fc' }, // Violet
  { primary: '#0ea5e9', accent: '#38bdf8' }, // Sky
  { primary: '#f59e0b', accent: '#fbbf24' }, // Amber
  { primary: '#10b981', accent: '#34d399' }, // Emerald
  { primary: '#ec4899', accent: '#f472b6' }, // Pink
];

function getThemeForId(id: string) {
  // Deterministic theme selection based on courseId length/chars
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % DEFAULT_THEMES.length;
  return DEFAULT_THEMES[index];
}

export function extractCourseMetadata(courseData: Partial<CourseJSON>, folderName: string): CourseMetadata {
  // Safe extraction with fallbacks
  const title = courseData.title || folderName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  // IMPORTANT: Always use folderName for routing — it's the URL slug.
  // The JSON's internal courseId is just a display label.
  const courseId = folderName;
  const theme = courseData.theme || getThemeForId(courseId);
  const lessons = Array.isArray(courseData.lessons) ? courseData.lessons : [];
  
  // Try to estimate duration based on stages
  let stageCount = 0;
  lessons.forEach(l => {
    if (l && Array.isArray(l.stages)) {
      stageCount += l.stages.length;
    }
  });
  
  const estimatedMins = Math.max(10, stageCount * 3); // Rough estimate: 3 mins per stage

  return {
    courseId,
    title,
    // Provide a generic description if not found
    description: (courseData as any).description || `Master the concepts of ${title} through interactive AI-guided lessons.`,
    theme,
    totalLessons: lessons.length,
    estimatedDuration: `${Math.floor(estimatedMins / 60)}h ${estimatedMins % 60}m`.replace(/^0h /, ''),
    difficulty: (courseData as any).difficulty || 'Intermediate',
    thumbnail: (courseData as any).thumbnail,
  };
}
