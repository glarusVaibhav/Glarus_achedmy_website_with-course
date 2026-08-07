"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Book, ChevronDown, ChevronRight, FileText, CheckCircle, Sparkles, Layers, Circle, ListChecks } from 'lucide-react';
import { useProgressStore } from '@/lib/store/progressStore';
import { useSidebarData } from '@/hooks/useSidebarData';

export interface Slide {
  id: string;
  title: string;
  order: number;
  isCompleted?: boolean;
}

export interface Topic {
  id: string;
  title: string;
  order: number;
  slides: Slide[];
}

export interface Module {
  id: string;
  title: string;
  order: number;
  topics: Topic[];
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const normalizeTitle = (title: string) => {
  return slugify(
    title
      .replace(/💻/g, '')
      .replace(/\(Code Example\)/gi, '')
      .replace(/\(.*?\)/g, '')
      .trim()
  );
};

// ── Quiz Classification (navigation-only) ────────────────────────────────
// Standalone learning stages (concept, code, visual).
// ALL other stage types (mcq, scenario, fill_blank, drag_drop, flashcard, reorder, etc.)
// are collected under the collapsible "Quiz" section inside each phase.
const STANDALONE_STAGE_TYPES = new Set([
  'concept',
  'code',
  'visual',
  'teacher_vis',
  'board_video',
]);

const QUIZ_TITLE_PATTERN = /(scenario|mcq|flashcard|fill[_\s]*blank|drag[_\s]*drop|reorder|speed[_\s]*quiz|assessment|quiz|practice)/i;

function isQuizStage(stageType: string | undefined, title: string | undefined): boolean {
  if (stageType) {
    return !STANDALONE_STAGE_TYPES.has(stageType);
  }
  if (title) {
    return QUIZ_TITLE_PATTERN.test(title);
  }
  return false;
}

function getStandardizedQuizTitle(type: string | undefined, originalTitle: string | undefined): string {
  const t = type ? type.toLowerCase() : '';
  if (t === 'mcq') return 'MCQ Practice';
  if (t === 'scenario') return 'Scenario Practice';
  if (t === 'fill_blank' || t === 'fill-blank') return 'Fill in the Blank Practice';
  if (t === 'flashcard') return 'Flashcard Practice';
  if (t === 'drag_drop' || t === 'drag-drop') return 'Drag & Drop Practice';
  if (t === 'reorder') return 'Reorder Practice';
  if (t === 'speed_quiz' || t === 'speed-quiz') return 'Speed Quiz Practice';
  if (t === 'case_study' || t === 'case-study') return 'Case Study Practice';
  if (t === 'socratic') return 'Socratic Practice';
  if (t === 'ai_conversation' || t === 'ai-conversation') return 'AI Discussion Practice';

  if (originalTitle) {
    if (/mcq/i.test(originalTitle)) return 'MCQ Practice';
    if (/scenario/i.test(originalTitle)) return 'Scenario Practice';
    if (/fill/i.test(originalTitle)) return 'Fill in the Blank Practice';
    if (/flashcard/i.test(originalTitle)) return 'Flashcard Practice';
    if (/drag/i.test(originalTitle)) return 'Drag & Drop Practice';
    if (/reorder/i.test(originalTitle)) return 'Reorder Practice';
    if (/speed/i.test(originalTitle)) return 'Speed Quiz Practice';
    if (/case/i.test(originalTitle)) return 'Case Study Practice';
    if (/socratic/i.test(originalTitle)) return 'Socratic Practice';
  }

  if (t) {
    return t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Practice';
  }

  return originalTitle || 'Quiz Practice';
}

export function Sidebar() {
  const storeCourse = useProgressStore((s) => s.course);
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const currentStageIndex = useProgressStore((s) => s.currentStageIndex);
  const goToLesson = useProgressStore((s) => s.goToLesson);
  const goToStage = useProgressStore((s) => s.goToStage);
  const markTopicVisited = useProgressStore((s) => s.markTopicVisited);
  const setActiveTopicId = useProgressStore((s) => s.setActiveTopicId);
  const completedTopics = useProgressStore((s) => s.completedTopics || []);

  const courseId = storeCourse?.courseId || 'python-basics';
  
  const { modules: rawModules, loading } = useSidebarData(courseId);

  const [sidebarWidth, setSidebarWidth] = useState(340);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: MouseEvent) => {
    let newWidth = e.clientX;
    if (newWidth < 250) newWidth = 250;
    if (newWidth > 600) newWidth = 600;
    setSidebarWidth(newWidth);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const onMove = (e: MouseEvent) => handleDrag(e);
      const onUp = () => setIsDragging(false);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }
  }, [isDragging, handleDrag]);

  const hierarchicalModules = useMemo(() => {
    if (!rawModules) return [];
    return rawModules.map((mod, mIndex) => ({
      ...mod,
      id: mod.moduleId,
      title: mod.moduleTitle,
      order: mod.order || mIndex,
    }));
  }, [rawModules]);

  const topicPathMap = useMemo(() => {
    const map: Record<string, { lessonIndex: number; stageIndex: number }> = {};
    if (!storeCourse || !rawModules) return map;

    rawModules.forEach(mod => {
      // Helper function to process a single topic
      const processTopic = (topic: any) => {
         // 0. Use explicit stageIndex if available (Modules 10-21)
         if (topic.stageIndex !== undefined) {
           const modPrefix = topic.moduleId || mod.moduleId;
           const lIdx = storeCourse.lessons.findIndex(l => 
             l.id === modPrefix || l.id?.startsWith(modPrefix + '-')
           );
           if (lIdx !== -1) {
             map[topic.id] = { lessonIndex: lIdx, stageIndex: topic.stageIndex };
             return;
           }
         }

         const ntTopic = normalizeTitle(topic.title);
         
         // 1. Exact Lesson ID match
         let lIdx = storeCourse.lessons.findIndex(l => l.id === topic.id);
         if (lIdx !== -1) {
           map[topic.id] = { lessonIndex: lIdx, stageIndex: 0 };
           return;
         }
         // 2. Exact Lesson Title match
         lIdx = storeCourse.lessons.findIndex(l => normalizeTitle(l.title || '') === ntTopic);
         if (lIdx !== -1) {
           map[topic.id] = { lessonIndex: lIdx, stageIndex: 0 };
           return;
         }
         // 3. Stage Title match (Modules 10-21)
         for (let i = 0; i < storeCourse.lessons.length; i++) {
           const lesson = storeCourse.lessons[i];
           if (!lesson.stages) continue;
           const sIdx = lesson.stages.findIndex(s => {
             const stageTitle = (s as any).content?.title || (s as any).challenge?.title;
             if (stageTitle) {
               return normalizeTitle(stageTitle) === ntTopic;
             }
             return false;
           });
           if (sIdx !== -1) {
             map[topic.id] = { lessonIndex: i, stageIndex: sIdx };
             return;
           }
         }
         // 4. Fuzzy match fallback
         for (let i = 0; i < storeCourse.lessons.length; i++) {
           const lesson = storeCourse.lessons[i];
           if (!lesson.stages) continue;
            const sIdx = lesson.stages.findIndex(s => {
              const sAny = s as any;
              const stageTitle = sAny.content?.title || sAny.questions?.[0]?.question || sAny.challenge?.title || sAny.type;
              if (stageTitle) {
                const ntStage = normalizeTitle(stageTitle);
               return ntStage.includes(ntTopic) || ntTopic.includes(ntStage);
             }
             return false;
           });
           if (sIdx !== -1) {
             map[topic.id] = { lessonIndex: i, stageIndex: sIdx };
             return;
           }
         }
      };

      mod.topics.forEach(topic => {
        processTopic(topic);
        // Process children if it's a phase group
        if ((topic as any).children) {
          (topic as any).children.forEach((child: any) => processTopic(child));
        }
      });
    });
    return map;
  }, [storeCourse, rawModules]);

  const activeSlideId = useMemo(() => {
    if (!storeCourse || !storeCourse.lessons[currentLessonIndex]) return null;
    const lesson = storeCourse.lessons[currentLessonIndex];
    return `${lesson.id}-slide-${currentStageIndex}`;
  }, [storeCourse, currentLessonIndex, currentStageIndex]);

  const handleSlideSelect = (slideId: string) => {
    if (!storeCourse) return;
    const match = slideId.match(/(.+)-slide-(\d+)/);
    if (!match) return;

    const topicId = match[1];
    const stageIdx = parseInt(match[2], 10);

    const lessonIndex = storeCourse.lessons.findIndex(l => l.id === topicId);
    if (lessonIndex !== -1) {
      setActiveTopicId(topicId);
      markTopicVisited(topicId);
      goToLesson(lessonIndex);
      goToStage(stageIdx);
    }
  };

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeSlideId || hierarchicalModules.length === 0) return;

    let foundModuleId = '';
    let foundTopicId = '';

    for (const mod of hierarchicalModules) {
      for (const top of mod.topics) {
        if (top.slides?.some(s => s.id === activeSlideId)) {
          foundModuleId = mod.id;
          foundTopicId = top.id;
          break;
        }
      }
      if (foundModuleId) break;
    }

    if (foundModuleId && foundTopicId) {
      setExpandedModules(prev => ({ ...prev, [foundModuleId]: true }));
      setExpandedTopics(prev => ({ ...prev, [foundTopicId]: true }));
    }
  }, [activeSlideId, hierarchicalModules]);

  const toggleModule = (id: string) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleTopic = (id: string) => setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));

  const activeTopicId = useProgressStore((s) => s.activeTopicId);

  const currentModule = useMemo(() => {
    if (!storeCourse || !hierarchicalModules) return null;
    
    // First, try to use activeTopicId
    if (activeTopicId) {
      for (const mod of hierarchicalModules) {
        if (mod.topics.some(t => t.id === activeTopicId || ((t as any).children && (t as any).children.some((c: any) => c.id === activeTopicId)))) {
          return mod;
        }
      }
    }

    // Fallback: use currentLesson.id
    const currentLesson = storeCourse.lessons[currentLessonIndex];
    if (currentLesson) {
      for (const mod of hierarchicalModules) {
        if (mod.id === currentLesson.id || mod.topics.some(t => t.id === currentLesson.id)) {
          return mod;
        }
      }
    }
    
    return null;
  }, [storeCourse, currentLessonIndex, hierarchicalModules, activeTopicId]);

  if (loading || hierarchicalModules.length === 0) {
    return (
      <div style={{ width: `${sidebarWidth}px` }} className="h-screen bg-[#03040B] border-r border-white/5 flex flex-col pt-6 pb-2 px-5 shrink-0 gap-4 animate-pulse select-none relative">
        <div className="h-6 w-48 bg-white/5 rounded-md mt-2 ml-1" />
        <div className="h-px w-full bg-white/5 my-4" />
        <div className="h-16 w-full bg-white/5 rounded-xl" />
        <div className="h-16 w-full bg-white/5 rounded-xl" />
        <div className="h-16 w-full bg-white/5 rounded-xl" />
      </div>
    );
  }

  // Calculate overall progress for a sleek mini progress bar
  const totalSlidesCount = hierarchicalModules.reduce((acc, mod) => acc + mod.topics.reduce((tAcc, top) => tAcc + (top.slides?.length || 0), 0), 0);
  const completedSlidesCount = hierarchicalModules.reduce((acc, mod) => acc + mod.topics.reduce((tAcc, top) => tAcc + (top.slides?.filter(s => s.isCompleted).length || 0), 0), 0);
  const overallProgress = totalSlidesCount > 0 ? (completedSlidesCount / totalSlidesCount) * 100 : 0;

  return (
    <div style={{ width: `${sidebarWidth}px` }} className="h-screen bg-[#03040B]/95 backdrop-blur-xl border-r border-white/[0.08] flex flex-col pt-6 pb-4 shrink-0 z-10 relative overflow-hidden select-none">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full transform translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full transform -translate-x-1/2 translate-y-1/2" />
      
      {/* Header Section */}
      <div className="mb-4 px-6 relative z-10">
        <div className="flex items-start gap-3 mb-1">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.2)] mt-0.5 shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-xl font-extrabold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-wide leading-tight line-clamp-2">
              {storeCourse?.title || "Current Course"}
            </h2>
            {currentModule && (
              <p className="text-xs text-white/50 font-medium mt-1 truncate">
                {currentModule.title}
              </p>
            )}
          </div>
        </div>
        
        {/* Sleek overall progress bar */}
        <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-[10px] text-white/40 mt-1.5 font-medium tracking-wider uppercase">
          {Math.round(overallProgress)}% Completed
        </p>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2 shrink-0" />

      {/* Main Navigation Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-12 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 relative z-10">
        <div className="mb-3 mt-4 px-2">
          <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase">
            Learning Path
          </h3>
        </div>
        <div className="space-y-3">
          {hierarchicalModules.map((mod) => {
            const isModOpen = !!expandedModules[mod.id];
            
            // Clean up module title (e.g., remove "MODULE X:" if it exists to make it cleaner, or just format it)
            // If the title starts with "MODULE X: ", we can optionally style the prefix differently
            const modTitleMatch = mod.title.match(/^(MODULE\s*\d+:?\s*)(.*)$/i);
            const prefix = modTitleMatch ? modTitleMatch[1] : '';
            const mainTitle = modTitleMatch ? modTitleMatch[2] : mod.title;

            let moduleTotalMinutes = 0;
            mod.topics.forEach((topic) => {
              if ((topic as any).isPhase && (topic as any).children) {
                moduleTotalMinutes += ((topic as any).children.length * 2);
              } else {
                moduleTotalMinutes += (((topic as any).slides?.length ?? 0) * 2);
              }
            });

            return (
              <div key={mod.id} className="flex flex-col">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  title={mod.title}
                  className="flex items-center w-full text-left py-2.5 px-3 rounded-xl transition-all duration-200 group hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05]"
                >
                  <div className={`p-2 rounded-lg transition-colors duration-300 mr-3 shrink-0 ${isModOpen ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'bg-white/5 text-white/40 border border-white/5 group-hover:bg-white/10'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {prefix && (
                      <span className="text-[9px] font-bold tracking-widest text-indigo-400/70 uppercase mb-0.5">
                        {prefix.replace(':', '')}
                      </span>
                    )}
                    <span className={`font-semibold text-[13px] truncate transition-colors ${isModOpen ? 'text-white' : 'text-white/70 group-hover:text-white/90'}`}>
                      {mainTitle}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    {moduleTotalMinutes > 0 && (
                      <span className="text-[10px] font-mono text-white/40 group-hover:text-white/60 transition-colors">
                        {moduleTotalMinutes} min
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 text-white/30 shrink-0 transition-transform duration-300 ${isModOpen ? 'rotate-90 text-white/60' : 'group-hover:translate-x-0.5'}`} />
                  </div>
                </button>

                {/* Module Content (Topics) */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${isModOpen ? 'opacity-100' : 'opacity-0'}`}
                  style={{ gridTemplateRows: isModOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden flex flex-col relative">
                    {/* Module Vertical Line */}
                    <div className="absolute left-[23px] top-2 bottom-4 w-px bg-gradient-to-b from-white/10 to-transparent" />
                    
                    <div className="mt-2 space-y-1 mb-3 pl-11 pr-1">
                    {mod.topics.map((topic, tIndex) => {
                        const isTopOpen = !!expandedTopics[topic.id];

                        // ── PHASE GROUP (for M10-M20) ─────────────────────────────
                        if ((topic as any).isPhase && (topic as any).children) {
                          const children = (topic as any).children as typeof topic[];
                          const completedChildren = children.filter((c: any) => c.isCompleted).length;
                          const totalChildren = children.length;
                          const isPhaseFullyDone = completedChildren === totalChildren && totalChildren > 0;
                          const isPhaseActive = (topic as any).isActive;

                          // ── QUIZ GROUPING (navigation/UI only) ──────────
                          // Question/assessment stages are collected under a
                          // collapsible "Quiz" section at the end of the phase.
                          // Each child's navigation target, active state, and
                          // completion data are completely untouched.
                          const isChildActive = (child: any) =>
                            child.isActive ||
                            (topicPathMap[child.id]?.lessonIndex === currentLessonIndex &&
                             topicPathMap[child.id]?.stageIndex === currentStageIndex);
                          const getChildStageType = (child: any): string | undefined => {
                            const path = topicPathMap[child.id];
                            if (path && storeCourse) {
                              return (storeCourse.lessons[path.lessonIndex]?.stages?.[path.stageIndex] as any)?.type;
                            }
                            if (child.stageIndex !== undefined && storeCourse) {
                              const modPrefix = (topic as any).moduleId || mod.id;
                              const lIdx = storeCourse.lessons.findIndex(l => 
                                l.id === modPrefix || l.id?.startsWith(modPrefix + '-')
                              );
                              if (lIdx !== -1) {
                                return (storeCourse.lessons[lIdx]?.stages?.[child.stageIndex] as any)?.type;
                              }
                            }
                            return undefined;
                          };
                          const quizChildren = children.filter((c: any) => isQuizStage(getChildStageType(c), c.title));
                          const regularChildren = children.filter((c: any) => !isQuizStage(getChildStageType(c), c.title));
                          const quizGroupKey = `${topic.id}-quiz`;
                          const quizHasActive = quizChildren.some(isChildActive);
                          const isQuizOpen = expandedTopics[quizGroupKey] ?? quizHasActive;
                          const isQuizFullyDone = quizChildren.length > 0 && quizChildren.every((c: any) => c.isCompleted);

                          return (
                            <div key={`${topic.id}-${tIndex}`} className="flex flex-col relative">
                              {/* Phase Group Vertical Line */}
                              <div className={`absolute left-[9px] top-8 bottom-1 w-px transition-colors duration-300 ${isTopOpen ? 'bg-indigo-500/20' : 'bg-transparent'}`} />

                              {/* Phase Header Button */}
                              <button
                                title={topic.title}
                                onClick={() => toggleTopic(topic.id)}
                                className={`flex items-center justify-between w-full text-left py-2 px-2.5 rounded-lg transition-colors group hover:bg-white/[0.04] relative z-10 ${isPhaseActive ? 'bg-indigo-500/5' : ''}`}
                              >
                                <div className="flex items-center overflow-hidden min-w-0">
                                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 mr-2 ${isTopOpen ? 'rotate-90 text-indigo-400' : isPhaseActive ? 'text-indigo-400/60' : 'text-white/30 group-hover:translate-x-0.5'}`} />
                                  <span className={`font-semibold text-xs truncate transition-colors uppercase tracking-wider ${isPhaseActive ? 'text-indigo-300' : isTopOpen ? 'text-white/80' : 'text-white/50 group-hover:text-white/70'}`}>
                                    {topic.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 ml-3 shrink-0">
                                  {isPhaseFullyDone && <CheckCircle className="w-3 h-3 text-emerald-500/80" />}
                                  <span className="text-[10px] font-mono text-white/40 group-hover:text-white/60 transition-colors">
                                    {totalChildren * 2} min
                                  </span>
                                </div>
                              </button>

                              {/* Phase Children */}
                              <div
                                className={`grid transition-all duration-300 ease-in-out ${isTopOpen ? 'opacity-100' : 'opacity-0'}`}
                                style={{ gridTemplateRows: isTopOpen ? '1fr' : '0fr' }}
                              >
                                <div className="overflow-hidden flex flex-col">
                                  <div className="mt-1 space-y-0.5 mb-2 pl-6 pr-1">
                                    {regularChildren.map((child: any) => {
                                      const isActive = child.isActive || 
                                        (topicPathMap[child.id]?.lessonIndex === currentLessonIndex && 
                                         topicPathMap[child.id]?.stageIndex === currentStageIndex);
                                      return (
                                        <button
                                          key={child.id}
                                          title={child.title}
                                          onClick={() => {
                                            // Navigate using stageIndex if available, otherwise topicPathMap
                                            const path = topicPathMap[child.id];
                                            if (path) {
                                              setActiveTopicId(child.id);
                                              markTopicVisited(child.id);
                                              goToLesson(path.lessonIndex);
                                              goToStage(path.stageIndex);
                                            } else if (child.stageIndex !== undefined && storeCourse) {
                                              // Find the lesson for this module
                                              const modPrefix = (topic as any).moduleId || mod.id;
                                              const lIdx = storeCourse.lessons.findIndex(l => 
                                                l.id === modPrefix || l.id?.startsWith(modPrefix + '-')
                                              );
                                              if (lIdx !== -1) {
                                                setActiveTopicId(child.id);
                                                markTopicVisited(child.id);
                                                goToLesson(lIdx);
                                                goToStage(child.stageIndex);
                                              }
                                            }
                                          }}
                                          className={`flex items-center w-full text-left py-1.5 px-3 rounded-xl transition-all duration-200 text-[12px] group relative overflow-hidden ${
                                            isActive
                                              ? 'text-indigo-300 font-medium'
                                              : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03]'
                                          }`}
                                        >
                                          {isActive && (
                                            <>
                                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent" />
                                              <div className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                            </>
                                          )}
                                          <div className="relative z-10 shrink-0 mr-2.5">
                                            {child.isCompleted ? (
                                              <CheckCircle className={`w-3 h-3 ${isActive ? 'text-indigo-400' : 'text-emerald-500/70'}`} />
                                            ) : isActive ? (
                                              <Circle className="w-3 h-3 text-indigo-400 fill-indigo-400/20" />
                                            ) : (
                                              <FileText className="w-3 h-3 text-white/20 group-hover:text-white/40" />
                                            )}
                                          </div>
                                          <span className="truncate relative z-10 tracking-wide">{child.title}</span>
                                        </button>
                                      );
                                    })}

                                    {/* ── QUIZ ACCORDION: question/assessment stages ── */}
                                    {quizChildren.length > 0 && (
                                      <div className="flex flex-col relative mt-1">
                                        {/* Quiz Group Vertical Line */}
                                        <div className={`absolute left-[9px] top-8 bottom-1 w-px transition-colors duration-300 ${isQuizOpen ? 'bg-amber-500/20' : 'bg-transparent'}`} />

                                        {/* Quiz Header Button */}
                                        <button
                                          title={`Quiz — ${quizChildren.length} ${quizChildren.length === 1 ? 'activity' : 'activities'}`}
                                          onClick={() => toggleTopic(quizGroupKey)}
                                          className={`flex items-center justify-between w-full text-left py-2 px-2.5 rounded-lg transition-colors group hover:bg-white/[0.04] relative z-10 ${quizHasActive ? 'bg-amber-500/5' : ''}`}
                                        >
                                          <div className="flex items-center overflow-hidden min-w-0">
                                            <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 mr-2 ${isQuizOpen ? 'rotate-90 text-amber-400' : quizHasActive ? 'text-amber-400/60' : 'text-white/30 group-hover:translate-x-0.5'}`} />
                                            <ListChecks className={`w-3.5 h-3.5 shrink-0 mr-2 transition-colors ${quizHasActive ? 'text-amber-400' : 'text-white/40 group-hover:text-white/60'}`} />
                                            <span className={`font-semibold text-xs truncate transition-colors uppercase tracking-wider ${quizHasActive ? 'text-amber-300' : isQuizOpen ? 'text-white/80' : 'text-white/50 group-hover:text-white/70'}`}>
                                              Quiz
                                            </span>
                                            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/5 text-white/40 group-hover:text-white/60 transition-colors shrink-0">
                                              {quizChildren.length} {quizChildren.length === 1 ? 'activity' : 'activities'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5 ml-3 shrink-0">
                                            {isQuizFullyDone && <CheckCircle className="w-3 h-3 text-emerald-500/80" />}
                                            <span className="text-[10px] font-mono text-white/40 group-hover:text-white/60 transition-colors">
                                              {quizChildren.length * 2} min
                                            </span>
                                          </div>
                                        </button>

                                        {/* Quiz Activities */}
                                        <div
                                          className={`grid transition-all duration-300 ease-in-out ${isQuizOpen ? 'opacity-100' : 'opacity-0'}`}
                                          style={{ gridTemplateRows: isQuizOpen ? '1fr' : '0fr' }}
                                        >
                                          <div className="overflow-hidden flex flex-col">
                                            <div className="mt-1 space-y-0.5 mb-2 pl-6 pr-1">
                                              {quizChildren.map((child: any) => {
                                                const isActive = isChildActive(child);
                                                return (
                                                  <button
                                                    key={child.id}
                                                    title={child.title}
                                                    onClick={() => {
                                                      // Navigate using stageIndex if available, otherwise topicPathMap
                                                      const path = topicPathMap[child.id];
                                                      if (path) {
                                                        setActiveTopicId(child.id);
                                                        markTopicVisited(child.id);
                                                        goToLesson(path.lessonIndex);
                                                        goToStage(path.stageIndex);
                                                      } else if (child.stageIndex !== undefined && storeCourse) {
                                                        // Find the lesson for this module
                                                        const modPrefix = (topic as any).moduleId || mod.id;
                                                        const lIdx = storeCourse.lessons.findIndex(l =>
                                                          l.id === modPrefix || l.id?.startsWith(modPrefix + '-')
                                                        );
                                                        if (lIdx !== -1) {
                                                          setActiveTopicId(child.id);
                                                          markTopicVisited(child.id);
                                                          goToLesson(lIdx);
                                                          goToStage(child.stageIndex);
                                                        }
                                                      }
                                                    }}
                                                    className={`flex items-center w-full text-left py-1.5 px-3 rounded-xl transition-all duration-200 text-[12px] group relative overflow-hidden ${
                                                      isActive
                                                        ? 'text-indigo-300 font-medium'
                                                        : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03]'
                                                    }`}
                                                  >
                                                    {isActive && (
                                                      <>
                                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent" />
                                                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                                      </>
                                                    )}
                                                    <div className="relative z-10 shrink-0 mr-2.5">
                                                      {child.isCompleted ? (
                                                        <CheckCircle className={`w-3 h-3 ${isActive ? 'text-indigo-400' : 'text-emerald-500/70'}`} />
                                                      ) : isActive ? (
                                                        <Circle className="w-3 h-3 text-indigo-400 fill-indigo-400/20" />
                                                      ) : (
                                                        <FileText className="w-3 h-3 text-white/20 group-hover:text-white/40" />
                                                      )}
                                                    </div>
                                                     <span className="truncate relative z-10 tracking-wide">{getStandardizedQuizTitle(getChildStageType(child), child.title)}</span>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // ── REGULAR TOPIC (Modules 1-9 style) ────────────────────
                        const allSlides = (topic as any).slides || [];
                        const completedSlides = allSlides.filter((s: any) => s.isCompleted).length;
                        const totalSlides = allSlides.length;
                        const isTopicFullyCompleted = completedSlides === totalSlides && totalSlides > 0;

                        const getSlideStageType = (slide: any): string | undefined => {
                          if (slide.type) return slide.type;
                          const path = topicPathMap[topic.id];
                          if (path && storeCourse) {
                            return (storeCourse.lessons[path.lessonIndex]?.stages?.[slide.index] as any)?.type;
                          }
                          return undefined;
                        };

                        const quizSlides = allSlides.filter((s: any) => isQuizStage(getSlideStageType(s), s.title));
                        const regularSlides = allSlides.filter((s: any) => !isQuizStage(getSlideStageType(s), s.title));

                        const quizGroupKey = `${topic.id}-quiz`;
                        const quizHasActive = quizSlides.some((s: any) => s.id === activeSlideId);
                        const isQuizOpen = expandedTopics[quizGroupKey] ?? quizHasActive;
                        const isQuizFullyDone = quizSlides.length > 0 && quizSlides.every((s: any) => s.isCompleted);

                        return (
                          <div key={topic.id} className="flex flex-col relative">
                            {/* Topic Vertical Line */}
                            <div className={`absolute left-[9px] top-8 bottom-1 w-px transition-colors duration-300 ${isTopOpen ? 'bg-white/5' : 'bg-transparent'}`} />

                            {/* Topic Header */}
                            <button
                              title={topic.title}
                              onClick={() => {
                                if (totalSlides === 0) {
                                  const path = topicPathMap[topic.id];
                                  if (path) {
                                    setActiveTopicId(topic.id);
                                    markTopicVisited(topic.id);
                                    goToLesson(path.lessonIndex);
                                    goToStage(path.stageIndex);
                                  }
                                } else {
                                  toggleTopic(topic.id);
                                }
                              }}
                              className="flex items-center justify-between w-full text-left py-2 px-2.5 rounded-lg transition-colors group hover:bg-white/[0.04] relative z-10"
                            >
                              <div className="flex items-center overflow-hidden min-w-0">
                                {totalSlides > 0 ? (
                                  <ChevronRight className={`w-3.5 h-3.5 text-white/30 shrink-0 transition-transform duration-300 mr-2 ${isTopOpen ? 'rotate-90 text-white/60' : 'group-hover:translate-x-0.5'}`} />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-white/20 shrink-0 mr-2 group-hover:text-white/40 transition-colors" />
                                )}
                                <span className={`font-medium text-sm truncate transition-colors ${isTopOpen || (totalSlides === 0 && topicPathMap[topic.id]?.lessonIndex === currentLessonIndex && topicPathMap[topic.id]?.stageIndex === currentStageIndex) ? 'text-white/90' : 'text-white/60 group-hover:text-white/80'}`}>
                                  {topic.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 ml-3 shrink-0">
                                {isTopicFullyCompleted && (
                                  <CheckCircle className="w-3 h-3 text-emerald-500/80" />
                                )}
                                <span className="text-[10px] font-mono text-white/40 group-hover:text-white/60 transition-colors">
                                  {totalSlides * 2} min
                                </span>
                              </div>
                            </button>

                            {/* Topic Content (Slides) */}
                            <div
                              className={`grid transition-all duration-300 ease-in-out ${isTopOpen ? 'opacity-100' : 'opacity-0'}`}
                              style={{ gridTemplateRows: isTopOpen ? '1fr' : '0fr' }}
                            >
                              <div className="overflow-hidden flex flex-col">
                                <div className="mt-1.5 space-y-0.5 mb-2 pl-6 pr-1">
                                  {regularSlides.map((slide: any) => {
                                    const isActive = slide.id === activeSlideId;
                                    return (
                                      <button
                                        key={slide.id}
                                        title={slide.title}
                                        onClick={() => handleSlideSelect(slide.id)}
                                        className={`flex items-center w-full text-left py-2 px-3 rounded-xl transition-all duration-200 text-[13px] group relative overflow-hidden ${
                                          isActive
                                            ? 'text-indigo-300 font-medium'
                                            : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03]'
                                        }`}
                                      >
                                        {isActive && (
                                          <>
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent" />
                                            <div className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                          </>
                                        )}
                                        <div className="relative z-10 shrink-0 mr-3">
                                          {slide.isCompleted ? (
                                            <CheckCircle className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-emerald-500/70'}`} />
                                          ) : isActive ? (
                                            <Circle className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                                          ) : (
                                            <FileText className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />
                                          )}
                                        </div>
                                        <span className="truncate relative z-10 tracking-wide">{slide.title}</span>
                                      </button>
                                    );
                                  })}

                                  {/* ── QUIZ ACCORDION for Modules 1-9 slides ── */}
                                  {quizSlides.length > 0 && (
                                    <div className="flex flex-col relative mt-1">
                                      <div className={`absolute left-[9px] top-8 bottom-1 w-px transition-colors duration-300 ${isQuizOpen ? 'bg-amber-500/20' : 'bg-transparent'}`} />
                                      <button
                                        title={`Quiz — ${quizSlides.length} ${quizSlides.length === 1 ? 'activity' : 'activities'}`}
                                        onClick={() => toggleTopic(quizGroupKey)}
                                        className={`flex items-center justify-between w-full text-left py-2 px-2.5 rounded-lg transition-colors group hover:bg-white/[0.04] relative z-10 ${quizHasActive ? 'bg-amber-500/5' : ''}`}
                                      >
                                        <div className="flex items-center overflow-hidden min-w-0">
                                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 mr-2 ${isQuizOpen ? 'rotate-90 text-amber-400' : quizHasActive ? 'text-amber-400/60' : 'text-white/30 group-hover:translate-x-0.5'}`} />
                                          <ListChecks className={`w-3.5 h-3.5 shrink-0 mr-2 transition-colors ${quizHasActive ? 'text-amber-400' : 'text-white/40 group-hover:text-white/60'}`} />
                                          <span className={`font-semibold text-xs truncate transition-colors uppercase tracking-wider ${quizHasActive ? 'text-amber-300' : isQuizOpen ? 'text-white/80' : 'text-white/50 group-hover:text-white/70'}`}>
                                            Quiz
                                          </span>
                                          <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/5 text-white/40 group-hover:text-white/60 transition-colors shrink-0">
                                            {quizSlides.length} {quizSlides.length === 1 ? 'activity' : 'activities'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 ml-3 shrink-0">
                                          {isQuizFullyDone && <CheckCircle className="w-3 h-3 text-emerald-500/80" />}
                                          <span className="text-[10px] font-mono text-white/40 group-hover:text-white/60 transition-colors">
                                            {quizSlides.length * 2} min
                                          </span>
                                        </div>
                                      </button>

                                      <div
                                        className={`grid transition-all duration-300 ease-in-out ${isQuizOpen ? 'opacity-100' : 'opacity-0'}`}
                                        style={{ gridTemplateRows: isQuizOpen ? '1fr' : '0fr' }}
                                      >
                                        <div className="overflow-hidden flex flex-col">
                                          <div className="mt-1 space-y-0.5 mb-2 pl-6 pr-1">
                                            {quizSlides.map((slide: any) => {
                                              const isActive = slide.id === activeSlideId;
                                              return (
                                                <button
                                                  key={slide.id}
                                                  title={slide.title}
                                                  onClick={() => handleSlideSelect(slide.id)}
                                                  className={`flex items-center w-full text-left py-1.5 px-3 rounded-xl transition-all duration-200 text-[12px] group relative overflow-hidden ${
                                                    isActive
                                                      ? 'text-indigo-300 font-medium'
                                                      : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03]'
                                                  }`}
                                                >
                                                  {isActive && (
                                                    <>
                                                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent" />
                                                      <div className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                                    </>
                                                  )}
                                                  <div className="relative z-10 shrink-0 mr-2.5">
                                                    {slide.isCompleted ? (
                                                      <CheckCircle className={`w-3 h-3 ${isActive ? 'text-indigo-400' : 'text-emerald-500/70'}`} />
                                                    ) : isActive ? (
                                                      <Circle className="w-3 h-3 text-indigo-400 fill-indigo-400/20" />
                                                    ) : (
                                                      <FileText className="w-3 h-3 text-white/20 group-hover:text-white/40" />
                                                    )}
                                                  </div>
                                                  <span className="truncate relative z-10 tracking-wide">{getStandardizedQuizTitle(getSlideStageType(slide), slide.title)}</span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}


                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DRAG HANDLE */}
      <div 
        className="absolute top-0 right-0 bottom-0 w-1.5 bg-transparent hover:bg-indigo-500/50 cursor-col-resize z-50 transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
      />
    </div>
  );
}
