"use client";

import { useState, useRef, useEffect } from 'react';
import type { StageComponentProps, RecallStageData } from '@/types/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Brain, Loader2, Sparkles, CheckCircle } from 'lucide-react';

export function RecallStage({ data, onComplete }: StageComponentProps<RecallStageData>) {
  const timeLimit = data.timeLimit ?? 60;
  const difficulty = data.difficulty ?? 3;

  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [submitted, setSubmitted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<{ 
    score: number; 
    feedback: string; 
    rightAnswer?: string;
    status: string;
    reasoning: string;
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'recall',
          question: data.prompt ?? 'Recall the concepts.',
          userInput: userInput,
          context: `Difficulty: ${difficulty}/5. Expected focus: ${data.expectedKeywords?.join(', ') ?? 'General recall'}`
        }),
      });

      const evalData = await response.json();
      setResult({
        score: evalData.score,
        feedback: evalData.feedback,
        rightAnswer: evalData.improvedAnswer,
        status: evalData.status,
        reasoning: evalData.reasoning
      });
    } catch (error) {
      console.error('Recall Evaluation Failed:', error);
      setResult({
        score: 0,
        feedback: "Evaluation failed. Please continue.",
        status: "incorrect",
        reasoning: "surface"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const timerPercent = (timeLeft / timeLimit) * 100;
  const timerColor = timeLeft > 15 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-40 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-600/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <Brain className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <span className="text-amber-400 font-bold uppercase tracking-widest text-xs block">Active Recall</span>
                <h2 className="text-2xl font-extrabold text-white">Memory Challenge</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-4 h-4" />
              <span className={`font-mono font-bold text-lg ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Timer Bar */}
          <div className="w-full h-2 bg-white/5 rounded-full mb-8 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${timerColor} transition-colors`}
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Prompt */}
          <p className="text-white/80 text-lg mb-6 font-medium">
            {data.prompt ?? 'Write everything you remember about this topic.'}
          </p>

          {/* Input Area */}
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={submitted}
            placeholder="Start typing everything you can recall..."
            rows={submitted ? 4 : 8}
            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 transition-all resize-none text-base disabled:opacity-60"
          />

          {/* Evaluating State */}
          <AnimatePresence>
            {isEvaluating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl border border-white/10"
              >
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-amber-200 font-medium animate-pulse">AI is analyzing your recall and reasoning...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          {result && !isEvaluating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              <div className={`p-6 rounded-2xl border ${
                result.score >= 50
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-white font-bold text-lg">AI Evaluation</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-white font-black text-2xl">{result.score}%</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Reasoning: {result.reasoning}</span>
                  </div>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4 italic">
                  &quot;{result.feedback}&quot;
                </p>
                
                {result.rightAnswer && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">The Right Answer</span>
                    </div>
                    <p className="text-white/70 text-sm font-mono whitespace-pre-wrap">
                      {result.rightAnswer}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-end">
        {!submitted ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all"
          >
            Submit Recall
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isEvaluating}
            onClick={() => onComplete({ correct: result?.score ? result.score >= 50 : false, score: result?.score ?? 0 })}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
