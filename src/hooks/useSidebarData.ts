import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProgressStore } from '@/lib/store/progressStore';
import type {
  RawTopicsSchema,
  RawLesson,
  SidebarModule,
  ValidationError
} from '@/types/sidebar.types';
import { groupLessonsByModule } from '@/utils/moduleGrouping';
import { getSavedExpandedModules, saveExpandedModules } from '@/utils/sidebarHelpers';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function useSidebarData(courseId: string) {
  // 1. Core State
  const [rawTopics, setRawTopics] = useState<RawTopicsSchema | null>(null);
  const [rawLessons, setRawLessons] = useState<RawLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 2. Zustand Store Integrations
  const completedTopics = useProgressStore((s) => s.completedTopics || []);
  const visitedTopics = useProgressStore((s) => s.visitedTopics || []);
  const storeCourse = useProgressStore((s) => s.course);
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const currentStageIndex = useProgressStore((s) => s.currentStageIndex);
  const setActiveTopicId = useProgressStore((s) => s.setActiveTopicId);

  // Derive active topic ID from the active index of the course
  const computedActiveTopicId = useMemo(() => {
    if (!storeCourse || !storeCourse.lessons || !rawTopics) return null;
    
    const lesson = storeCourse.lessons[currentLessonIndex];
    if (!lesson) return null;

    const currentStage = lesson.stages?.[currentStageIndex];
    
    const isNewSchema = Array.isArray(rawTopics);
    const topicsModules = isNewSchema ? rawTopics : (rawTopics as any).modules || [];
    
    // Helper: normalize title for comparison (strip emojis, tags, extra whitespace)
    const normalizeTitle = (title: string) => {
      return slugify(
        title
          .replace(/💻/g, '')
          .replace(/\(Code Example\)/gi, '')
          .replace(/\(.*?\)/g, '')
          .trim()
      );
    };

    const normalizedLessonTitle = normalizeTitle(lesson.title || '');
    let normalizedStageTitle = '';
    const cType = (currentStage as any)?.type as string;
    if (cType === 'concept' && (currentStage as any)?.content?.title) {
      normalizedStageTitle = normalizeTitle((currentStage as any).content.title);
    } else if (cType === 'seven-point' && (currentStage as any)?.content?.title) {
      normalizedStageTitle = normalizeTitle((currentStage as any).content.title);
    } else if (cType === 'interactive-code') {
      normalizedStageTitle = normalizeTitle('interactive code');
    }

    // Iterate through all modules to find the best match
    for (const mod of topicsModules) {
      if (!mod.topics) continue;

      // Strategy 1: Exact ID match (Best for Modules 1-9)
      if (lesson.id) {
        const exactIdMatch = mod.topics.find((t: any) => t.id === lesson.id);
        if (exactIdMatch) return exactIdMatch.id;
      }
      
      // Strategy 2: Exact Lesson Title match (Fallback for Modules 1-9)
      const exactLessonTitleMatch = mod.topics.find((t: any) => {
        return normalizeTitle(t.title || '') === normalizedLessonTitle;
      });
      if (exactLessonTitleMatch) return exactLessonTitleMatch.id;

      // Strategy 3: Exact Stage Title match (Best for Modules 10-21)
      if (normalizedStageTitle) {
        const exactStageTitleMatch = mod.topics.find((t: any) => {
          return normalizeTitle(t.title || '') === normalizedStageTitle;
        });
        if (exactStageTitleMatch) return exactStageTitleMatch.id;
        
        for (const t of mod.topics) {
          if (t.children) {
             const exactChildMatch = t.children.find((c: any) => normalizeTitle(c.title || '') === normalizedStageTitle);
             if (exactChildMatch) return exactChildMatch.id;
          }
        }
      }
    }

    // If no exact match is found, try fuzzy match (stage title > lesson title)
    for (const mod of topicsModules) {
      if (!mod.topics) continue;

      if (normalizedStageTitle) {
        const fuzzyStageMatch = mod.topics.find((t: any) => {
          const nt = normalizeTitle(t.title || '');
          return nt.includes(normalizedStageTitle) || normalizedStageTitle.includes(nt);
        });
        if (fuzzyStageMatch) return fuzzyStageMatch.id;
        
        for (const t of mod.topics) {
          if (t.children) {
             const fuzzyChildMatch = t.children.find((c: any) => {
               const nt = normalizeTitle(c.title || '');
               return nt.includes(normalizedStageTitle) || normalizedStageTitle.includes(nt);
             });
             if (fuzzyChildMatch) return fuzzyChildMatch.id;
          }
        }
      }

      const fuzzyLessonMatch = mod.topics.find((t: any) => {
        const nt = normalizeTitle(t.title || '');
        return nt.includes(normalizedLessonTitle) || normalizedLessonTitle.includes(nt);
      });
      if (fuzzyLessonMatch) return fuzzyLessonMatch.id;
    }

    // Last Resort: Fallback by Module Prefix heuristic
    const lessonModId = lesson.id?.split('-')[0] || lesson.id?.split('_')[0]; 
    const currentModule = topicsModules.find((m: any) => 
      (m.id || m.module_id) === lessonModId || 
      (m.id || m.module_id)?.includes(lessonModId?.replace('genai_', 'M0') || '')
    );
    
    if (currentModule && currentModule.topics && currentModule.topics.length > 0) {
      if (lesson.stages) {
        const totalStages = lesson.stages.length;
        const totalTopics = currentModule.topics.length;
        if (totalStages > 0) {
          const tIdx = Math.min(
            Math.floor((currentStageIndex / totalStages) * totalTopics),
            totalTopics - 1
          );
          return currentModule.topics[tIdx]?.id;
        }
      }
      return currentModule.topics[0]?.id;
    }

    return null;
  }, [storeCourse, currentLessonIndex, currentStageIndex, rawTopics]);

  useEffect(() => {
    if (computedActiveTopicId) {
      setActiveTopicId(computedActiveTopicId);
    }
  }, [computedActiveTopicId, setActiveTopicId]);

  // 3. Local Accordion Expand/Collapse State
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Initialize expanded modules from localStorage on mount/courseId change
  useEffect(() => {
    if (!courseId) return;
    const saved = getSavedExpandedModules(courseId);
    setExpandedModules(saved);
  }, [courseId]);

  // 4. Data Loading
  const loadSidebarData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setFetchError(null);

    try {
      const res = await fetch(`/api/course/${encodeURIComponent(courseId)}/sidebar`);
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        setRawTopics(data.topics || null);
        setRawLessons(data.lessons || []);
      } else {
        setFetchError(data.error || 'Failed to load course files.');
        setRawTopics(data.topics || null);
        setRawLessons(data.lessons || []);
      }
    } catch (err: any) {
      setFetchError(err.message || 'An error occurred while fetching sidebar data.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Load data on mount/courseId change
  useEffect(() => {
    loadSidebarData();
  }, [loadSidebarData]);

  // 5. Accordion Toggle Action
  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const updated = { ...prev, [moduleId]: !prev[moduleId] };
      saveExpandedModules(courseId, updated);
      return updated;
    });
  }, [courseId]);

  // 6. Data Transformation Pipeline & Memoization
  const pipelineResult = useMemo(() => {
    let effectiveTopics = rawTopics;
    let effectiveLessons = rawLessons;

    const hasModules =
      effectiveTopics &&
      (Array.isArray(effectiveTopics)
        ? effectiveTopics.length > 0
        : Array.isArray((effectiveTopics as any).modules) &&
          (effectiveTopics as any).modules.length > 0);

    // Fallback: Derive module tree from storeCourse if API fetch returned empty or failed
    if (!hasModules && storeCourse && storeCourse.lessons) {
      effectiveTopics = {
        modules: [
          {
            module_id: "m-all",
            module_title: storeCourse.title || "Course Modules",
            order: 1,
            topic_ids: storeCourse.lessons.map((_, i) => `t-${i}`),
          },
        ],
        topics: storeCourse.lessons.map((l, i) => ({
          topic_id: `t-${i}`,
          topic_title: l.title || `Module ${i + 1}`,
          module_id: "m-all",
          lesson_ids: [l.id || `l-${i}`],
        })),
      } as any;
      effectiveLessons = storeCourse.lessons as any;
    }

    if (!effectiveTopics) {
      return { modules: [], errors: [] };
    }

    const result = groupLessonsByModule(
      effectiveTopics,
      effectiveLessons,
      completedTopics,
      visitedTopics,
      computedActiveTopicId,
      expandedModules,
      currentLessonIndex,
      currentStageIndex
    );

    // Auto-open active module on load if not already interacted with
    if (computedActiveTopicId) {
      const activeModule = result.modules.find((mod) =>
        mod.topics.some((top) => top.id === computedActiveTopicId)
      );
      if (activeModule && !expandedModules[activeModule.moduleId]) {
        setExpandedModules((prev) => {
          if (prev[activeModule.moduleId]) return prev;
          const updated = { ...prev, [activeModule.moduleId]: true };
          saveExpandedModules(courseId, updated);
          return updated;
        });
      }
    }

    return result;
  }, [rawTopics, rawLessons, completedTopics, visitedTopics, computedActiveTopicId, expandedModules, fetchError, courseId, currentLessonIndex, currentStageIndex]);

  // Merge pipeline-level errors and fetching warnings
  const validationErrors = useMemo(() => {
    const errorsList = [...pipelineResult.errors];
    if (fetchError) {
      errorsList.unshift({
        type: 'module',
        entityId: 'network',
        message: `Sync Warning: ${fetchError}`,
      });
    }
    return errorsList;
  }, [pipelineResult.errors, fetchError]);

  return {
    modules: pipelineResult.modules,
    loading,
    validationErrors,
    expandedModules,
    toggleModule,
    refreshData: loadSidebarData,
  };
}

