// ============================================================
// Component — ModuleSection (Clean, Minimalist Accordion)
// ============================================================

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { SidebarModule } from '@/types/sidebar.types';
import { TopicItem } from './TopicItem';

interface ModuleSectionProps {
  module: SidebarModule;
  index: number;
  onToggle: () => void;
  onSelectTopic: (topicId: string) => void;
  completedLessonsList: string[];
  activeLessonId: string | null;
  flatLessonsList: any[];
}

export function ModuleSection({
  module,
  index,
  onToggle,
  onSelectTopic,
  activeLessonId,
  flatLessonsList,
}: ModuleSectionProps) {
  const { moduleId, moduleTitle, topics, isExpanded } = module;

  // Resolve if this module contains the currently active lesson
  const hasActiveLesson = topics.some((t) => t.id === activeLessonId);

  return (
    <div 
      className={clsx(
        "rounded-xl border transition-all duration-300 overflow-hidden select-none relative",
        hasActiveLesson 
          ? "bg-white/[0.03] border-white/10 shadow-sm" 
          : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
      )}
    >
      {/* Module Header Accordion Trigger */}
      <div className="w-full text-left py-2.5 px-3 flex items-center gap-2 transition-colors relative z-10 group">
        <button
          onClick={onToggle}
          className="text-white/40 group-hover:text-white/70 transition-colors shrink-0 p-1 -m-1"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.div>
        </button>
        
        <button 
          onClick={() => {
            onToggle();
          }}
          className={clsx(
            "font-medium text-[13px] leading-snug truncate transition-colors text-left flex-1", 
            hasActiveLesson ? "text-white" : "text-white/70 group-hover:text-white"
          )} 
          title={moduleTitle}
        >
          {moduleTitle}
        </button>
      </div>

      {/* Collapsible Child Accordion Panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-2 px-2 space-y-[2px]">
              {topics.map((topic, idx) => {
                return (
                  <TopicItem
                    key={topic.id}
                    topic={topic}
                    index={idx}
                    onSelect={() => onSelectTopic(topic.id)}
                    isLast={false}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

