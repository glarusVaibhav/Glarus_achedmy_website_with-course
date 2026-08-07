"use client";

import { useState } from 'react';
import type { StageComponentProps, CaseStudyStageData } from '@/types/engine';
import { evaluateSemanticQuality } from '@/lib/engine/DecisionEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookText, Send, CheckCircle } from 'lucide-react';

export function CaseStudyStage({ data, onComplete }: StageComponentProps<CaseStudyStageData>) {
  const questions = data.questions ?? [];
  const [currentQ, setCurrentQ] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [answers, setAnswers] = useState<{ answer: string; score: number; feedback: string }[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{ score: number; feedback: string } | null>(null);

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    const question = questions[currentQ];
    const expectedWords = question.expectedAnswer?.split(/\s+/).filter((w) => w.length > 3) ?? [];
    const eval_ = evaluateSemanticQuality(userInput, expectedWords);
    setCurrentFeedback({ score: eval_.score, feedback: eval_.feedback });
    setRevealed(true);
  };

  const handleNext = () => {
    setAnswers([...answers, { answer: userInput, score: currentFeedback?.score ?? 0, feedback: currentFeedback?.feedback ?? '' }]);
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setUserInput('');
      setRevealed(false);
      setCurrentFeedback(null);
    } else {
      const allScores = [...answers.map(a => a.score), currentFeedback?.score ?? 0];
      const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      onComplete({ correct: avgScore >= 50, score: avgScore });
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-40 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-sky-600/20 flex items-center justify-center border border-sky-500/30 shadow-[0_0_25px_rgba(14,165,233,0.3)]">
              <BookText className="w-7 h-7 text-sky-300" />
            </div>
            <div>
              <span className="text-sky-400 font-bold uppercase tracking-widest text-xs block">Case Study</span>
              <h2 className="text-2xl font-extrabold text-white">{data.title ?? 'Real-World Analysis'}</h2>
            </div>
          </div>

          {/* Context */}
          {data.context && (
            <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-5 mb-6">
              <span className="text-sky-400 text-xs font-bold uppercase tracking-widest block mb-2">Background</span>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{data.context}</p>
            </div>
          )}

          {/* Progress */}
          {questions.length > 1 && (
            <div className="flex gap-1.5 mb-6">
              {questions.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${
                  i < currentQ ? 'bg-emerald-500' : i === currentQ ? 'bg-sky-500' : 'bg-white/10'
                }`} />
              ))}
            </div>
          )}

          {/* Current Question */}
          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-white text-lg font-bold mb-4">{questions[currentQ]?.question ?? 'Analyze the scenario above.'}</h3>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={revealed}
                placeholder="Write your analysis..."
                rows={5}
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-sky-500/50 transition-colors resize-none text-base disabled:opacity-60"
              />

              {/* Feedback */}
              {currentFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 ${
                    currentFeedback.score >= 50 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${currentFeedback.score >= 50 ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <div>
                    <span className="text-white font-bold text-sm">Score: {currentFeedback.score}%</span>
                    <p className={`text-sm mt-1 ${currentFeedback.score >= 50 ? 'text-emerald-300' : 'text-amber-300'}`}>{currentFeedback.feedback}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-end">
        {!revealed ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all"
          >
            <Send className="w-5 h-5" /> Submit
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all"
          >
            {currentQ < questions.length - 1 ? 'Next Question' : 'Complete'} <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
