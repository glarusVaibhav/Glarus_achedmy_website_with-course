"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useProgressStore } from "@/lib/store/progressStore";
import { AnimatePresence, motion } from "framer-motion";

export function CourseSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  const course = useProgressStore((s) => s.course);
  const goToLesson = useProgressStore((s) => s.goToLesson);
  const goToStage = useProgressStore((s) => s.goToStage);

  // Close on escape, open on CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim() || !course) return [];
    const searchLower = query.toLowerCase();
    const hits: { lessonTitle: string, stageTitle: string, lessonIndex: number, stageIndex: number, score: number }[] = [];

    course.lessons.forEach((lesson, lIdx) => {
      lesson.stages.forEach((stage, sIdx) => {
        let title = '';
        let content = '';

        const sAny = stage as any;
        const sType = stage.type as string;
        if (sType === 'concept') {
          title = sAny.content?.title || sAny.title || '';
          content = sAny.content?.explanation || sAny.explanation || '';
        } else if (sType === 'mcq' || sType === 'quiz' || sType === 'speed_quiz') {
          title = sAny.title || sAny.content?.title || 'Quiz';
          const qList = Array.isArray(sAny.questions)
            ? sAny.questions
            : (sAny.question ? [{ question: sAny.question, options: sAny.options || [] }] : []);
          content = qList.map((q: any) => (q?.question || '') + ' ' + (Array.isArray(q?.options) ? q.options.join(' ') : '')).join(' ');
        } else if (sType === 'code') {
          title = sAny.challenge?.title || sAny.title || 'Coding Challenge';
          content = sAny.challenge?.question || sAny.explanation || '';
        } else if (sType === 'scenario') {
          title = sAny.title || 'Scenario';
          content = sAny.description || sAny.content?.explanation || '';
        } else if (sType === 'fill_blank') {
          title = sAny.challenge?.title || sAny.title || 'Fill in the blanks';
          content = sAny.challenge?.question || sAny.explanation || '';
        } else if (sType === 'visual') {
            title = sAny.content?.title || sAny.title || 'Visual Diagram';
            content = sAny.content?.explanation || sAny.explanation || '';
        }

        const searchText = `${lesson.title} ${title} ${content}`.toLowerCase();
        const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
        
        const isMatch = searchTerms.every(term => searchText.includes(term));

        if (isMatch) {
          let score = 0;
          const lowerTitle = title.toLowerCase();
          const lowerLessonTitle = lesson.title.toLowerCase();
          const lowerContent = content.toLowerCase();

          searchTerms.forEach(term => {
            if (lowerTitle.includes(term)) score += 50;
            if (lowerLessonTitle.includes(term)) score += 20;
            const contentMatches = (lowerContent.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            score += contentMatches;
          });

          hits.push({
            lessonTitle: lesson.title,
            stageTitle: title || `Stage ${sIdx + 1}`,
            lessonIndex: lIdx,
            stageIndex: sIdx,
            score
          });
        }
      });
    });
    
    // Sort hits by score descending
    return hits.sort((a, b) => b.score - a.score);
  }, [query, course]);

  const handleSelect = (lessonIndex: number, stageIndex: number) => {
    goToLesson(lessonIndex);
    setTimeout(() => goToStage(stageIndex), 0);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
        title="Search (Cmd+K)"
      >
        <Search className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0f111a] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center px-4 py-3 border-b border-white/10">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search topics, concepts, quizzes..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-2">
                {query.trim() && results.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((hit, idx) => (
                      <button
                        key={`${hit.lessonIndex}-${hit.stageIndex}-${idx}`}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors flex flex-col gap-1"
                        onClick={() => handleSelect(hit.lessonIndex, hit.stageIndex)}
                      >
                        <span className="text-white font-medium">{hit.stageTitle}</span>
                        <span className="text-xs text-primary">{hit.lessonTitle}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {!query.trim() && (
                  <div className="p-8 text-center text-gray-500">
                    Type to search through the course
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
