"use client";

import { useState, useCallback } from 'react';
import type { StageComponentProps, ScenarioStageData } from '@/types/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, GitBranch, CheckCircle, RotateCcw, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProgressStore } from '@/lib/store/progressStore';

export function ScenarioStage({ data, onComplete }: StageComponentProps<ScenarioStageData>) {
  const content = (data as any).content || data;

  const scenarioText = content.scenario || content.description || content.question || "You're faced with a critical decision. Analyze the situation and choose the best course of action.";

  let choices: Array<{ text: string; score: number; outcome: string }> = [];

  if (Array.isArray(content.choices) && content.choices.length > 0) {
    choices = content.choices;
  } else if (Array.isArray(content.options) && content.options.length > 0) {
    const correctIdx = typeof content.answer === 'number' ? content.answer : (typeof content.solution === 'number' ? content.solution : 0);
    const explanationText = content.explanation || 'Analyze the trade-offs carefully before proceeding.';

    choices = content.options.map((opt: string, i: number) => ({
      text: opt,
      score: i === correctIdx ? 100 : 0,
      outcome: i === correctIdx
        ? `✅ Correct Decision!\n\n${explanationText}`
        : `⚠️ Sub-optimal Choice.\n\n${explanationText}`
    }));
  }

  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const course = useProgressStore((s) => s.course);
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const currentStageIndex = useProgressStore((s) => s.currentStageIndex);
  const lesson = course?.lessons[currentLessonIndex];
  const totalStages = lesson?.stages?.length ?? 1;

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (choices[idx]?.score >= 80) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleRetry = useCallback(() => {
    setSelected(null);
    setRevealed(false);
  }, []);

  const selectedChoice = selected !== null ? choices[selected] : null;
  const isCorrectChoice = selectedChoice ? selectedChoice.score >= 60 : false;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 md:p-6 lg:p-8 rounded-2xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-40 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 lg:mb-6 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <GitBranch className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs block">Scenario</span>
              <h2 className="text-lg md:text-xl font-extrabold text-white">{content.title ?? 'Decision Point'}</h2>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/80 text-base mb-4 lg:mb-6 leading-relaxed whitespace-pre-line">
            {scenarioText}
          </p>

          {/* Choices */}
          <div className="space-y-3">
            {choices.map((choice: any, idx: number) => {
              const isSelected = idx === selected;
              const isGood = choice.score >= 80;
              let borderClass = 'border-white/10 hover:border-white/30 hover:bg-white/5';
              if (revealed && isSelected) {
                borderClass = isGood
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-amber-500/50 bg-amber-500/10';
              } else if (revealed) {
                borderClass = 'border-white/5 opacity-40';
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!revealed ? { scale: 1.01 } : {}}
                  whileTap={!revealed ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(idx)}
                  disabled={revealed}
                  className={`w-full text-left p-3 md:p-4 rounded-xl border transition-all flex items-center gap-3 ${borderClass}`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-sm font-bold ${
                    revealed && isSelected ? (isGood ? 'border-emerald-500 text-emerald-400' : 'border-amber-500 text-amber-400') : 'border-white/20 text-white/40'
                  }`}>
                    {revealed && isSelected ? (isGood ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />) : String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-white/90 font-medium">{choice.text}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Outcome */}
          <AnimatePresence>
            {revealed && selectedChoice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                <div className={`p-5 rounded-2xl border ${
                  selectedChoice.score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <span className={`text-xs font-bold uppercase tracking-widest block mb-2 ${
                    selectedChoice.score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>Outcome</span>
                  <p className="text-white/80 text-sm leading-relaxed">{selectedChoice.outcome}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Bar — always show when revealed */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-3 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] z-50 flex items-center justify-between"
        >
          {/* Left side: Retry button (only for wrong answers) */}
          <div>
            {!isCorrectChoice && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold text-sm rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </motion.button>
            )}
          </div>



          {/* Right side: Continue button (always works) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ correct: isCorrectChoice, score: selectedChoice?.score ?? 0 })}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
