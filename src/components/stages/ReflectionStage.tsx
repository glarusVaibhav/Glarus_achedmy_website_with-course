"use client";

import { useState } from 'react';
import type { StageComponentProps, ReflectionStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { ArrowRight, Feather } from 'lucide-react';

export function ReflectionStage({ data, onComplete }: StageComponentProps<ReflectionStageData>) {
  const minWords = data.minWords ?? 20;
  const guidingPoints = data.guidingPoints ?? [];
  const [userInput, setUserInput] = useState('');

  const wordCount = userInput.trim().split(/\s+/).filter(Boolean).length;
  const isReady = wordCount >= minWords;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-40 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 flex items-center justify-center border border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
              <Feather className="w-7 h-7 text-rose-300" />
            </div>
            <div>
              <span className="text-rose-400 font-bold uppercase tracking-widest text-xs block">Self-Reflection</span>
              <h2 className="text-2xl font-extrabold text-white">Reflect & Internalize</h2>
            </div>
          </div>

          {/* Prompt */}
          <p className="text-white/80 text-lg mb-6 font-medium leading-relaxed">
            {data.prompt ?? 'Take a moment to reflect on what you\'ve learned. How does this connect to what you already know? What surprised you?'}
          </p>

          {/* Guiding Points */}
          {guidingPoints.length > 0 && (
            <div className="mb-6 space-y-2">
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Consider these points:</span>
              <ul className="space-y-1.5">
                {guidingPoints.map((point, i) => (
                  <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Input */}
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Share your thoughts..."
            rows={8}
            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-rose-500/50 transition-colors resize-none text-base"
          />

          {/* Word Count */}
          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs font-bold ${isReady ? 'text-emerald-400' : 'text-white/30'}`}>
              {wordCount}/{minWords} words {isReady ? '✓' : 'minimum'}
            </span>
            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isReady ? 'bg-emerald-500' : 'bg-rose-500/50'}`}
                animate={{ width: `${Math.min(100, (wordCount / minWords) * 100)}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete({ correct: true, score: Math.min(100, wordCount * 3) })}
          disabled={!isReady}
          className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all"
        >
          Complete Reflection <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
