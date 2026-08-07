"use client";

import { useState } from 'react';
import type { StageComponentProps, DebugAIStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { ArrowRight, Bug, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

export function DebugAIStage({ data, onComplete }: StageComponentProps<DebugAIStageData>) {
  const [userFix, setUserFix] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (!userFix.trim()) return;
    setSubmitted(true);
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    const correct = normalize(userFix) === normalize(data.correctOutput ?? '');
    setIsCorrect(correct);
    if (correct) confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-40 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
              <Bug className="w-7 h-7 text-red-300" />
            </div>
            <div>
              <span className="text-red-400 font-bold uppercase tracking-widest text-xs block">Debug AI</span>
              <h2 className="text-2xl font-extrabold text-white">Fix the AI Output</h2>
            </div>
          </div>
          {data.context && <p className="text-white/60 text-sm mb-4">{data.context}</p>}
          <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-5 mb-6">
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest block mb-2">❌ Broken Output</span>
            <pre className="text-red-200/80 text-sm font-mono whitespace-pre-wrap">{data.brokenOutput ?? 'The AI produced incorrect output.'}</pre>
          </div>
          <div className="mb-4">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-2">✏️ Your Corrected Version</span>
            <textarea value={userFix} onChange={(e) => setUserFix(e.target.value)} disabled={submitted}
              placeholder="Write the correct output..." rows={4}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-red-500/50 resize-none font-mono text-sm disabled:opacity-60" />
          </div>
          {submitted && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border flex items-center gap-3 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              {isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
              <div>
                <span className={`font-bold text-sm ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                  {isCorrect ? 'Perfect fix!' : 'Not quite right.'}
                </span>
                {!isCorrect && data.correctOutput && (
                  <p className="text-white/50 text-xs mt-1">Expected: <code className="text-emerald-300/70">{data.correctOutput}</code></p>
                )}
              </div>
            </motion.div>
          )}
          {data.hint && !showHint && !submitted && (
            <button onClick={() => setShowHint(true)}
              className="mt-4 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-bold hover:bg-amber-500/20 transition-colors">
              💡 Show Hint
            </button>
          )}
          {showHint && data.hint && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" /><p className="text-amber-200/80 text-sm">{data.hint}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-end">
        {!submitted ? (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={!userFix.trim()}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all">
            Submit Fix
          </motion.button>
        ) : (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ correct: isCorrect, score: isCorrect ? 100 : 20 })}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all">
            Continue <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
