"use client";

import { useProgressStore } from '@/lib/store/progressStore';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, BookOpen, CheckCircle, Lock } from 'lucide-react';
import clsx from 'clsx';

export function LessonSidebar() {
  const course = useProgressStore((s) => s.course);
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const xp = useProgressStore((s) => s.xp);
  const level = useProgressStore((s) => s.level);
  const streak = useProgressStore((s) => s.streak);
  const goToLesson = useProgressStore((s) => s.goToLesson);

  if (!course) return null;

  return (
    <div className="w-72 h-screen glass-panel border-r border-white/10 border-y-0 border-l-0 rounded-none flex flex-col pt-6 pb-2 px-4 z-10 shrink-0">
      
      {/* User Stats Card */}
      <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center neon-glow-primary">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Level {level}</h3>
            <p className="text-white/60 text-sm font-medium">Learner</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/20 rounded-xl p-2 flex items-center gap-2 border border-white/5">
            <Star className="text-amber-400 w-4 h-4" />
            <span className="text-white font-mono text-sm">{xp} XP</span>
          </div>
          <div className="bg-black/20 rounded-xl p-2 flex items-center gap-2 border border-white/5">
            <Flame className="text-orange-500 w-4 h-4" />
            <span className="text-white font-mono text-sm">{streak} Day</span>
          </div>
        </div>
      </div>

      {/* Lesson Roadmap */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
        <h2 className="text-white/40 text-[10px] font-bold tracking-widest uppercase ml-2 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          {course.title}
        </h2>

        <div className="space-y-2 relative before:content-[''] before:absolute before:left-5 before:top-4 before:bottom-4 before:w-px before:bg-white/10">
          {course.lessons.map((lesson, idx) => {
            const isActive = idx === currentLessonIndex;
            const isCompleted = completedLessons.includes(lesson.id);
            const isUnlocked = idx === 0 || completedLessons.includes(course.lessons[idx - 1]?.id);

            return (
              <motion.button
                key={lesson.id}
                onClick={() => isUnlocked && goToLesson(idx)}
                whileHover={isUnlocked ? { scale: 1.02, x: 4 } : {}}
                whileTap={isUnlocked ? { scale: 0.98 } : {}}
                className={clsx(
                  "w-full text-left p-2.5 rounded-xl flex items-center gap-3 relative z-10 transition-colors select-none",
                  isActive ? "bg-primary/20 border border-primary/50" : "hover:bg-white/5 border border-transparent",
                  !isUnlocked && "cursor-not-allowed opacity-50"
                )}
              >
                <div className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 bg-background z-10",
                  isActive ? "border-primary bg-primary/20 shadow-[0_0_15px_var(--color-primary)]" :
                  isCompleted ? "border-emerald-400 bg-emerald-500/10" :
                  "border-white/20"
                )}>
                  {isCompleted && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                  {!isUnlocked && <Lock className="w-3 h-3 text-white/30" />}
                  {isActive && !isCompleted && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                
                <span className={clsx(
                  "font-medium text-xs leading-tight line-clamp-2",
                  isActive ? "text-primary font-bold" : "text-white/70"
                )} title={lesson.title}>
                  {lesson.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
