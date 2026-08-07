"use client";

import { useState } from 'react';
import type { StageComponentProps, AIFeedbackStageData } from '@/types/engine';
import { evaluateSemanticQuality } from '@/lib/engine/DecisionEngine';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Send, BarChart3 } from 'lucide-react';

export function AIFeedbackStage({ data, onComplete }: StageComponentProps<AIFeedbackStageData>) {
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ clarity: number; correctness: number; improvement: string } | null>(null);

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    setSubmitted(true);
    const expectedWords = data.expectedAnswer?.split(/\s+/).filter((w) => w.length > 3) ?? [];
    const eval_ = evaluateSemanticQuality(userInput, expectedWords);
    setFeedback({
      clarity: Math.min(100, Math.round(userInput.split(/[.!?]/).length * 20)),
      correctness: eval_.score,
      improvement: eval_.feedback,
    });
  };

  const avgScore = feedback ? Math.round((feedback.clarity + feedback.correctness) / 2) : 0;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-40 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.3)]">
              <MessageSquare className="w-7 h-7 text-blue-300" />
            </div>
            <div>
              <span className="text-blue-400 font-bold uppercase tracking-widest text-xs block">AI Feedback</span>
              <h2 className="text-2xl font-extrabold text-white">Get Expert Analysis</h2>
            </div>
          </div>
          <p className="text-white/80 text-lg mb-6">{data.prompt ?? 'Write your answer and receive AI feedback.'}</p>
          <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={submitted}
            placeholder="Write your answer..." rows={6}
            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-blue-500/50 resize-none disabled:opacity-60" />
          {feedback && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-400" /><span className="text-blue-400 font-bold uppercase tracking-widest text-xs">Results</span></div>
              {[{ label: 'Clarity', value: feedback.clarity, color: 'bg-blue-500' }, { label: 'Correctness', value: feedback.correctness, color: 'bg-emerald-500' }].map((m) => (
                <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between mb-2"><span className="text-white/60 text-sm font-bold">{m.label}</span><span className="text-white font-bold">{m.value}%</span></div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden"><motion.div className={`h-full ${m.color} rounded-full`} animate={{ width: `${m.value}%` }} /></div>
                </div>
              ))}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-2">Suggestion</span>
                <p className="text-amber-200/80 text-sm">{feedback.improvement}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-end">
        {!submitted ? (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={!userInput.trim()}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all">
            <Send className="w-5 h-5" /> Get Feedback
          </motion.button>
        ) : (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ correct: avgScore >= 50, score: avgScore })}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all">
            Continue <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
