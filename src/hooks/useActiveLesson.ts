// ============================================================
// Hook — useActiveLesson (Scroll Sync & Keyboard Accessibility)
// ============================================================

import { useEffect, useMemo } from 'react';
import type { SidebarModule, SidebarTopic } from '@/types/sidebar.types';
import { scrollActiveTopicIntoView } from '@/utils/sidebarHelpers';

interface UseActiveLessonProps {
  modules: SidebarModule[];
  activeTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  lessonsList: SidebarTopic[]; // flat list of valid lessons for easy index traversing
}

export function useActiveLesson({
  modules,
  activeTopicId,
  onSelectTopic,
  lessonsList,
}: UseActiveLessonProps) {
  
  // 1. Resolve active lesson object
  const activeLesson = useMemo(() => {
    if (!activeTopicId) return null;
    return lessonsList.find((l) => l.id === activeTopicId) || null;
  }, [lessonsList, activeTopicId]);

  // 2. Trigger auto-scroll on change
  useEffect(() => {
    if (activeLesson) {
      const elementId = `topic-item-${activeLesson.id}`;
      scrollActiveTopicIntoView(elementId);
    }
  }, [activeLesson]);

  // 3. Keyboard Arrow Key & Selection Event Listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      
      // Only trap keys if focus is within a sidebar node button
      if (!activeEl || !activeEl.id.startsWith('topic-item-')) return;

      const currentId = activeEl.id.replace('topic-item-', '');
      const currentIndex = lessonsList.findIndex((l) => l.id === currentId);
      
      if (currentIndex === -1) return;

      let nextIndex = -1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex + 1 < lessonsList.length) {
            nextIndex = currentIndex + 1;
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex - 1 >= 0) {
            nextIndex = currentIndex - 1;
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const targetLesson = lessonsList[currentIndex];
          if (targetLesson && !targetLesson.isLocked) {
            // Trigger selection of current focused lesson
            onSelectTopic(targetLesson.id);
          }
          break;
        default:
          return;
      }

      if (nextIndex !== -1) {
        const nextLesson = lessonsList[nextIndex];
        const nextEl = document.getElementById(`topic-item-${nextLesson.id}`);
        if (nextEl) {
          (nextEl as HTMLElement).focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lessonsList, onSelectTopic]);

  return {
    activeLesson,
  };
}
