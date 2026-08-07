"use client";

import { useState } from 'react';
import type { StageComponentProps, AIEvaluatorStageData } from '@/types/engine';
import { evaluateSemanticQuality } from '@/lib/engine/DecisionEngine';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Send } from 'lucide-react';

export function AIEvaluatorStage({ data, onComplete }: StageComponentProps<AIEvaluatorStageData>) {
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [evalScore, setEvalScore] = useState(0);
  const [evalFeedback, setEvalFeedback] = useState('');

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    setSubmitted(true);
    const keywords = data.expectedAnswer?.split(/\s+/).filter((w) => w.length > 3) ?? [];
    const criteria = data.scoringCriteria ?? [];
    const allKeywords = [...keywords, ...criteria];
    const result = evaluateSemanticQuality(userInput, allKeywords);
    setEvalScore(result.score);
    setEvalFeedback(result.feedback);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-40 bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center border border-fuchsia-500/30 shadow-[0_0_25px_rgba(217,70,239,0.3)]">
              <Shield className="w-7 h-7 text-fuchsia-300" />
            </div>
            <div>
              <span className="text-fuchsia-400 font-bold uppercase tracking-widest text-xs block">AI Evaluator</span>
              <h2 className="text-2xl font-extrabold text-white">Precision Scoring</h2>
            </div>
          </div>
          <p className="text-white/80 text-lg mb-6">{data.prompt ?? 'Provide your best answer. The AI will score it precisely.'}</p>
          {data.scoringCriteria && data.scoringCriteria.length > 0 && (
            <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-2">Scoring Criteria</span>
              <ul className="space-y-1">{data.scoringCriteria.map((c, i) => (
                <li key={i} className="text-white/60 text-sm flex items-start gap-2"><span className="text-fuchsia-400">•</span>{c}</li>
              ))}</ul>
            </div>
          )}
          <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={submitted}
            placeholder="Your answer..." rows={5}
            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-fuchsia-500/50 resize-none disabled:opacity-60" />
          {submitted && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <div className="flex items-center justify-center mb-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                  className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${
                    evalScore >= 70 ? 'border-emerald-500 text-emerald-400' : evalScore >= 40 ? 'border-amber-500 text-amber-400' : 'border-red-500 text-red-400'
                  }`}>
                  <span className="text-3xl font-black">{evalScore}</span>
                </motion.div>
              </div>
              <p className={`text-center text-sm ${evalScore >= 50 ? 'text-emerald-300' : 'text-amber-300'}`}>{evalFeedback}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-end">
        {!submitted ? (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={!userInput.trim()}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all">
            <Send className="w-5 h-5" /> Evaluate
          </motion.button>
        ) : (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ correct: evalScore >= 50, score: evalScore })}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all">
            Continue <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
