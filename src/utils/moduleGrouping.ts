// ============================================================
// Module Grouping & Transformation Pipeline
// ============================================================

import type {
  RawModule,
  RawTopic,
  RawTopicsSchema,
  RawLesson,
  NewRawModule,
  SidebarModule,
  SidebarTopic,
  ValidationError
} from '@/types/sidebar.types';
import { validateModule, validateTopic, validateLessonReference } from './topicValidation';

import { SidebarSlide } from '@/types/sidebar.types';

function extractSlides(
  lesson: RawLesson | undefined,
  topicId: string,
  isTopicCompleted: boolean,
  isTopicActive: boolean,
  currentStageIndex: number
): { slides: SidebarSlide[], completedCount: number, totalCount: number } {
  if (!lesson || !lesson.stages) return { slides: [], completedCount: 0, totalCount: 0 };
  
  const slides: SidebarSlide[] = [];
  let completedCount = 0;
  
  lesson.stages.forEach((stage, index) => {
    let isCompleted = false;
    let isActive = false;
    
    if (isTopicCompleted) {
      isCompleted = true;
    } else if (isTopicActive) {
      if (index < currentStageIndex) isCompleted = true;
      if (index === currentStageIndex) isActive = true;
    }
    
    if (isCompleted) completedCount++;
    
    let title = '';
    if (stage.content && stage.content.title) {
      title = stage.content.title;
    } else if (stage.challenge && stage.challenge.title) {
      title = stage.challenge.title;
    } else if (stage.topic) {
      title = stage.topic;
    } else if (stage.title) {
      title = stage.title;
    } else if (stage.cards && stage.cards[0] && stage.cards[0].front) {
      title = stage.cards[0].front.slice(0, 40);
    } else if (stage.type) {
      title = stage.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    } else {
      title = `Stage ${index + 1}`;
    }
    
    slides.push({
      id: `${topicId}-slide-${index}`,
      index,
      title,
      type: stage.type,
      isCompleted,
      isActive
    });
  });
  
  return { slides, completedCount, totalCount: slides.length };
}


export interface TransformationResult {
  modules: SidebarModule[];
  errors: ValidationError[];
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function normalizeIncomingTopicsData(rawTopicsData: any): any {
  if (Array.isArray(rawTopicsData)) return rawTopicsData;

  if (!rawTopicsData || typeof rawTopicsData !== 'object') return rawTopicsData;

  const modules = Array.isArray(rawTopicsData.modules) ? rawTopicsData.modules : [];
  const looksLikeNewSchema = modules.some((mod: any) => {
    if (!mod || typeof mod !== 'object') return false;
    return Array.isArray(mod.topics) || typeof mod.id === 'string' || typeof mod.title === 'string';
  });

  if (looksLikeNewSchema) {
    return modules.map((mod: any) => ({
      id: mod.id || mod.module_id || mod.moduleId || '',
      title: mod.title || mod.module_title || mod.moduleTitle || '',
      topics: Array.isArray(mod.topics) ? mod.topics : [],
    }));
  }

  return rawTopicsData;
}
export function groupLessonsByModule(
  rawTopicsData: any,
  rawLessons: RawLesson[],
  completedTopics: string[] = [],
  visitedTopics: string[] = [],
  activeTopicId: string | null = null,
  expandedModules: Record<string, boolean> = {},
  currentLessonIndex: number = 0,
  currentStageIndex: number = 0
): TransformationResult {
  const normalizedTopicsData = normalizeIncomingTopicsData(rawTopicsData);

  if (Array.isArray(normalizedTopicsData)) {
    return parseNewSchema(normalizedTopicsData, rawLessons, completedTopics, visitedTopics, activeTopicId, expandedModules, currentLessonIndex, currentStageIndex);
  }
  return parseOldSchema(normalizedTopicsData, rawLessons, completedTopics, visitedTopics, activeTopicId, expandedModules, currentLessonIndex, currentStageIndex);
}


function parseNewSchema(
  data: NewRawModule[],
  rawLessons: RawLesson[],
  completedTopics: string[],
  visitedTopics: string[],
  activeTopicId: string | null,
  expandedModules: Record<string, boolean>,
  currentLessonIndex: number,
  currentStageIndex: number
): TransformationResult {
  const errors: ValidationError[] = [];
  const modules: SidebarModule[] = [];
  const flatTopics: SidebarTopic[] = [];

  data.forEach((mod, index) => {
    const resolvedTopics: SidebarTopic[] = [];

    // Find the lesson for this module (M10-M20 have one big lesson per module)
    // Try to find by module prefix e.g. M010 -> lesson id starts with M010
    const moduleLessonId = mod.id; // e.g. "M010"
    const matchedLesson = rawLessons.find(l => {
      // exact match first
      if (l.id === moduleLessonId) return true;
      // prefix match: lesson id starts with M010
      if (l.id && l.id.startsWith(moduleLessonId + '-')) return true;
      return false;
    });

    // Build a stage-title -> stageIndex map for the matched lesson
    const stageTitleToIndex = new Map<string, number>();
    if (matchedLesson?.stages) {
      matchedLesson.stages.forEach((stage, idx) => {
        const t = stage.content?.title || stage.challenge?.title || '';
        if (t) stageTitleToIndex.set(t.toLowerCase().trim(), idx);
      });
    }

    mod.topics.forEach((topic) => {
      const topicId = topic.id || `${mod.id}-${slugify(topic.title)}`;
      const isCompleted = completedTopics.includes(topicId);
      const isVisited = visitedTopics.includes(topicId);

      if (topic.isPhase && topic.children && topic.children.length > 0) {
        // ── PHASE GROUP: a collapsible phase header with children ──────────
        // Find this phase's start stage index
        const phaseTitle = topic.title.toLowerCase().trim();
        const cleanPTitle = phaseTitle.replace(/^(module \d+:\s*)?phase \d+[:\s—-]*/i, '').trim();
        const phaseStageIdx = stageTitleToIndex.get(phaseTitle) ?? 
          stageTitleToIndex.get(cleanPTitle) ??
          (() => {
            // fuzzy: find first stage whose title matches or includes the phase title keyword
            if (!matchedLesson?.stages) return 0;
            const idx = matchedLesson.stages.findIndex(s => {
              const t = (s.content?.title || s.challenge?.title || '').toLowerCase().trim();
              const cleanT = t.replace(/^(module \d+:\s*)?phase \d+[:\s—-]*/i, '').trim();
              return cleanT === cleanPTitle || (cleanPTitle.length > 3 && (t.includes(cleanPTitle) || cleanT.includes(cleanPTitle)));
            });
            return idx !== -1 ? idx : 0;
          })();

        // Build child topics with their stageIndex
        const childTopics: SidebarTopic[] = topic.children.map(child => {
          const childId = child.id || `${topicId}-${slugify(child.title)}`;
          const childTitle = child.title;
          
          // Find child stage index (Prioritize explicit JSON index)
          let childStageIdx = (child as any).stageIndex ?? -1;
          if (childStageIdx === -1) {
            childStageIdx = stageTitleToIndex.get(childTitle.toLowerCase().trim()) ?? -1;
            if (childStageIdx === -1 && matchedLesson?.stages) {
              // fuzzy match
              const stripped = childTitle.replace(/💻/g, '').replace(/\(code\)/gi, '').trim();
              childStageIdx = matchedLesson.stages.findIndex(s => {
                const t = (s.content?.title || s.challenge?.title || '').toLowerCase().trim();
                if (!t) return false;
                return t === stripped || t.includes(stripped) || stripped.includes(t);
              });
            }
          }

          const matchedLessonIndex = matchedLesson ? rawLessons.findIndex(l => l.id === matchedLesson.id) : -1;
          
          let childIsCompleted = completedTopics.includes(childId);
          let isChildActive = activeTopicId === childId;

          if (matchedLessonIndex !== -1) {
            // If we've passed this lesson, all stages are completed
            if (matchedLessonIndex < currentLessonIndex) {
              childIsCompleted = true;
            } 
            // If this is the active lesson
            else if (matchedLessonIndex === currentLessonIndex) {
              if (childStageIdx !== -1 && childStageIdx < currentStageIndex) {
                childIsCompleted = true;
              }
              if (childStageIdx !== -1 && childStageIdx === currentStageIndex) {
                isChildActive = true;
              }
            }
          }

          const childTopic: SidebarTopic = {
            id: childId,
            title: child.title,
            moduleId: mod.id,
            isLocked: false,
            isCompleted: childIsCompleted,
            isActive: isChildActive,
            isVisited: visitedTopics.includes(childId),
            stageIndex: childStageIdx !== -1 ? childStageIdx : undefined,
            slides: [],
            completedSlidesCount: 0,
            totalSlidesCount: 0,
          };
          flatTopics.push(childTopic);
          return childTopic;
        });

        // Determine if phase itself is active (any child active)
        const phaseIsActive = childTopics.some(c => c.isActive) || activeTopicId === topicId;
        const phaseIsCompleted = childTopics.every(c => c.isCompleted) && childTopics.length > 0;

        const phaseTopic: SidebarTopic = {
          id: topicId,
          title: topic.title,
          moduleId: mod.id,
          isLocked: false,
          isCompleted: phaseIsCompleted,
          isActive: phaseIsActive,
          isVisited: isVisited,
          isPhase: true,
          children: childTopics,
          stageIndex: phaseStageIdx,
          slides: [],
          completedSlidesCount: childTopics.filter(c => c.isCompleted).length,
          totalSlidesCount: childTopics.length,
        };

        resolvedTopics.push(phaseTopic);
        flatTopics.push(phaseTopic);

      } else {
        // ── PLAIN TOPIC (non-phase, or phases in modules 1-9) ─────────────
        let matchedLessonForTopic = rawLessons.find(l => l.id === topic.id);
        if (!matchedLessonForTopic) {
          matchedLessonForTopic = rawLessons.find(l => slugify(l.title || '') === slugify(topic.title || ''));
        }

        const isActive = activeTopicId === topicId;
        const { slides, completedCount, totalCount } = extractSlides(
          matchedLessonForTopic, topicId, isCompleted, isActive, currentStageIndex
        );

        const sidebarTopic: SidebarTopic = {
          id: topicId,
          title: topic.title,
          moduleId: mod.id,
          isLocked: true,
          isCompleted,
          isActive,
          isVisited,
          slides,
          completedSlidesCount: completedCount,
          totalSlidesCount: totalCount,
        };

        resolvedTopics.push(sidebarTopic);
        flatTopics.push(sidebarTopic);
      }
    });

    modules.push({
      moduleId: mod.id,
      moduleTitle: mod.title,
      moduleDescription: '',
      order: index,
      topics: resolvedTopics,
      progress: 0,
      isLocked: true,
      isExpanded: !!expandedModules[mod.id],
    });
  });

  flatTopics.forEach((topic) => {
    topic.isLocked = false;
  });

  modules.forEach((mod) => {
    const total = mod.topics.length;
    const completedCount = mod.topics.filter((t) => t.isCompleted).length;
    mod.progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    mod.isLocked = mod.topics.length > 0 && mod.topics.every((t) => t.isLocked);

    const hasActiveTopic = mod.topics.some((t) => t.isActive || t.children?.some(c => c.isActive));
    if (hasActiveTopic && expandedModules[mod.moduleId] === undefined) {
      mod.isExpanded = true;
    }
  });

  return { modules, errors };
}


function parseOldSchema(
  rawTopicsData: any,
  rawLessons: RawLesson[],
  completedTopics: string[],
  visitedTopics: string[],
  activeTopicId: string | null,
  expandedModules: Record<string, boolean>,
  currentLessonIndex: number,
  currentStageIndex: number
): TransformationResult {
  const errors: ValidationError[] = [];
  const modules: SidebarModule[] = [];

  const modulesList: RawModule[] = Array.isArray(rawTopicsData?.modules) ? rawTopicsData.modules : [];
  const topicsList: RawTopic[] = Array.isArray(rawTopicsData?.topics) ? rawTopicsData.topics : [];

  const lessonsMap = new Map<string, RawLesson>();
  rawLessons.forEach((lesson) => {
    if (lesson && lesson.id) lessonsMap.set(lesson.id, lesson);
  });

  const topicsMap = new Map<string, RawTopic>();
  topicsList.forEach((topic) => {
    if (topic && topic.topic_id) topicsMap.set(topic.topic_id, topic);
  });

  modulesList.forEach((rawModule) => {
    if (!rawModule?.module_id || !rawModule?.module_title) return;

    const resolvedTopics: SidebarTopic[] = [];

    const topicIds = Array.isArray(rawModule.topic_ids) ? rawModule.topic_ids : [];
    topicIds.forEach((tId) => {
      const rawTopic = topicsMap.get(tId);
      if (!rawTopic || !rawTopic.topic_id) return;

      const lessonIds = Array.isArray(rawTopic.lesson_ids) ? rawTopic.lesson_ids : [];
      lessonIds.forEach((lessonId) => {
        const lessonData = lessonsMap.get(lessonId);
        if (!lessonData) return;

        const topicId = `${rawModule.module_id}-${slugify(lessonData.title)}`;

        
        const isCompleted = completedTopics.includes(topicId);
        const isActive = activeTopicId === topicId;
        const isVisited = visitedTopics.includes(topicId);
        
        const { slides, completedCount, totalCount } = extractSlides(lessonData, topicId, isCompleted, isActive, currentStageIndex);

        resolvedTopics.push({
          id: topicId,
          title: lessonData.title,
          moduleId: rawModule.module_id,
          order: typeof lessonData.order === 'number' ? lessonData.order : 999,
          isLocked: lessonData.isLocked ?? true,
          isCompleted,
          isActive,
          isVisited,
          slides,
          completedSlidesCount: completedCount,
          totalSlidesCount: totalCount
        });

      });
    });

    resolvedTopics.sort((a, b) => (a.order || 0) - (b.order || 0));

    if (resolvedTopics.length === 0) return;

    modules.push({
      moduleId: rawModule.module_id,
      moduleTitle: rawModule.module_title,
      moduleDescription: rawModule.description || '',
      order: typeof rawModule.order === 'number' ? rawModule.order : 999,
      topics: resolvedTopics,
      progress: 0,
      isLocked: true,
      isExpanded: !!expandedModules[rawModule.module_id],
    });
  });

  modules.sort((a, b) => a.order - b.order);

  const flatTopics: SidebarTopic[] = [];
  modules.forEach((mod) => flatTopics.push(...mod.topics));

  flatTopics.forEach((topic) => {
    topic.isLocked = false;
  });

  modules.forEach((mod) => {
    const total = mod.topics.length;
    const completedCount = mod.topics.filter((t) => t.isCompleted).length;
    mod.progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    mod.isLocked = mod.topics.every((t) => t.isLocked);
    const hasActiveTopic = mod.topics.some((t) => t.isActive);
    if (hasActiveTopic && expandedModules[mod.moduleId] === undefined) {
      mod.isExpanded = true;
    }
  });

  return { modules, errors };
}


