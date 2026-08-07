"use client";

import { useProgressStore } from '@/lib/store/progressStore';
import { usePerformanceStore } from '@/lib/store/performanceStore';
import { useUIStore } from '@/lib/store/uiStore';
import { Activity, Lightbulb, Bug, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectWeakTopics } from '@/lib/engine/DecisionEngine';
import { useAudioStore } from '@/lib/store/audioStore';

export function PerformancePanel() {
  const course = useProgressStore((s) => s.course);
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const currentStageIndex = useProgressStore((s) => s.currentStageIndex);

  const mistakes = usePerformanceStore((s) => s.mistakes);
  const correctAnswers = usePerformanceStore((s) => s.correctAnswers);
  const confusionScore = usePerformanceStore((s) => s.confusionScore);
  const lessonPerformances = usePerformanceStore((s) => s.lessonPerformances);

  const isRightPanelOpen = useUIStore((s) => s.isRightPanelOpen);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);

  const lesson = course?.lessons[currentLessonIndex];
  const stage = lesson?.stages[currentStageIndex];
  const weakTopics = detectWeakTopics(lessonPerformances);

  const isAudioMode = useAudioStore((s) => s.isAudioMode);
  const showTranscript = useAudioStore((s) => s.showTranscript);

  if (!isRightPanelOpen) {
    return (
      <div className="w-12 h-screen glass-panel border-l border-white/10 border-y-0 border-r-0 flex flex-col pt-4 pb-2 items-center z-10 shrink-0 bg-black/40 transition-all duration-300">
        <button
          onClick={toggleRightPanel}
          className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
          title="Expand Panel"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="mt-8 flex-1 flex flex-col items-center gap-6">
          <div className="p-2 bg-violet-500/20 rounded-lg" title="Smart Tracker">
            <Activity className="w-4 h-4 text-violet-400" />
          </div>
          {confusionScore > 0.5 && (
            <div className="p-2 bg-red-500/20 rounded-lg" title="High Confusion">
              <Activity className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-screen glass-panel border-l border-white/10 border-y-0 border-r-0 flex flex-col pt-4 pb-2 px-3 z-10 shrink-0 bg-black/40 transition-all duration-300">
      
      <div className="mb-6 flex items-center justify-between px-2">
        <h2 className="text-white/80 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          Smart Tracker
        </h2>
        <button
          onClick={toggleRightPanel}
          className="p-1 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pb-8 pr-1">
        
        {/* Confusion Score */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
          <h3 className="text-sm font-semibold text-white mb-4">Adaptive State</h3>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-white/60">Confusion Level</span>
                <span className={confusionScore > 0.5 ? "text-red-400 font-bold" : "text-emerald-400"}>
                  {Math.round(confusionScore * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 shadow-[0_0_10px_currentColor] ${confusionScore > 0.5 ? 'bg-red-500 text-red-500' : 'bg-emerald-500 text-emerald-500'}`} 
                  style={{ width: `${confusionScore * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 text-center flex flex-col items-center justify-center h-16">
                 <span className="block text-xl font-bold text-emerald-400 leading-none mb-1">{correctAnswers}</span>
                 <span className="text-[9px] text-emerald-400/60 uppercase font-bold tracking-widest">Correct</span>
               </div>
               <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 text-center flex flex-col items-center justify-center h-16">
                 <span className="block text-xl font-bold text-red-400 leading-none mb-1">{mistakes}</span>
                 <span className="text-[9px] text-red-400/60 uppercase font-bold tracking-widest">Errors</span>
               </div>
            </div>
          </div>
        </div>

        {/* Stage Hint */}
        {stage ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-4 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />
            <h3 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Stage Hint
            </h3>
            <p className="text-white/80 text-sm leading-relaxed relative z-10">
              {stage.type === 'concept' ? "Read the content carefully. The system will quiz you on it soon." :
               stage.type === 'mcq' ? "Take your time. Wrong answers increase your confusion score." :
               stage.type === 'code' ? "Write clean code. Use the hint if you're stuck." :
               stage.type === 'fill_blank' ? "Type the exact missing word to fill the blank." :
               stage.type === 'flashcard' ? "Flip the card to test your recall." :
               "Complete this stage to progress."}
            </p>
          </motion.div>
        ) : null}

        {/* Weak Topics */}
        {weakTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 shadow-xl"
          >
            <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Weak Topics
            </h3>
            <div className="space-y-2">
              {weakTopics.slice(0, 3).map((topic) => (
                <div key={topic.lessonId} className="flex items-center justify-between text-sm">
                  <span className="text-red-200/80 font-medium truncate">{topic.lessonId}</span>
                  <span className="text-red-400 font-bold">{topic.avgScore}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex-1" />
      </div>
    </div>
  );
}
