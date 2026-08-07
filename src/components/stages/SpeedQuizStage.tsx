"use client";

import { useState, useRef, useEffect } from 'react';
import type { StageComponentProps, SpeedQuizStageData } from '@/types/engine';
import { evaluateSpeedQuiz } from '@/lib/engine/DecisionEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Clock, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export function SpeedQuizStage({ data, onComplete }: StageComponentProps<SpeedQuizStageData>) {
  const rawQuestions = Array.isArray((data as any)?.questions)
    ? (data as any).questions
    : ((data as any)?.question || (data as any)?.content?.question
        ? [{
            question: (data as any)?.question || (data as any)?.content?.question || 'Speed Quiz Question',
            options: (data as any)?.options || (data as any)?.content?.options || ['Option A', 'Option B'],
            answer: typeof (data as any)?.answer === 'number' 
              ? (data as any).answer 
              : (typeof (data as any)?.solution === 'number' ? (data as any).solution : 0),
            explanation: (data as any)?.explanation || (data as any)?.content?.explanation || ''
          }]
        : []);

  const questions = rawQuestions.length > 0 ? rawQuestions : [{
    question: 'Speed Quiz Question',
    options: ['Option A', 'Option B'],
    answer: 0,
    explanation: ''
  }];
  const timePerQuestion = (data.timePerQuestion ?? 15) * 1000; // ms

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(data.timePerQuestion ?? 15);
  const [times, setTimes] = useState<number[]>([]);
  const questionStartRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const safeCurrentQ = Math.min(currentQ, questions.length - 1);
  const question = questions[safeCurrentQ] || questions[0];

  useEffect(() => {
    questionStartRef.current = Date.now();
    setTimeLeft(data.timePerQuestion ?? 15);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (!revealed) autoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ]);

  const autoSubmit = () => {
    if (revealed) return;
    setRevealed(true);
    setTimes((t) => [...t, Date.now() - questionStartRef.current]);
  };

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Date.now() - questionStartRef.current;
    setTimes((t) => [...t, elapsed]);
    
    const isCorrect = typeof question.answer === 'number' 
      ? idx === question.answer 
      : String(question.options![idx]).toLowerCase() === String(question.answer).toLowerCase();
      
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      const allTimes = [...times];
      const avgTime = allTimes.length > 0 ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length : 0;
      let finalCorrect = correctCount;
      if (question.options) {
        const isCorrect = typeof question.answer === 'number' 
          ? selected === question.answer 
          : String(question.options[selected as number]).toLowerCase() === String(question.answer).toLowerCase();
        if (isCorrect) finalCorrect += 1;
      } else {
        if (String(selected).toLowerCase() === String(question.answer).toLowerCase()) finalCorrect += 1;
      }
      const result = evaluateSpeedQuiz(finalCorrect, questions.length, avgTime, timePerQuestion);
      onComplete(result);
    }
  };

  const timerPercent = (timeLeft / (data.timePerQuestion ?? 15)) * 100;

  if (questions.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/40">
        No questions configured for this speed quiz.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-panel p-4 md:p-6 lg:p-8 rounded-2xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-32 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                  Question {currentQ + 1} / {questions.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-white/40'}`} />
                <span className={`font-mono font-bold ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-white/60'}`}>{timeLeft}s</span>
              </div>
            </div>

            {/* Timer Bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full mb-4 lg:mb-6 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                animate={{ width: `${timerPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Question */}
            <h2 className="text-lg md:text-xl font-extrabold text-white mb-4 lg:mb-6 leading-snug">
              {question.question}
            </h2>

            {/* Options or Text Input */}
            {question.options ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options.map((opt: any, idx: number) => {
                  const isCorrectOpt = typeof question.answer === 'number' 
                    ? idx === question.answer 
                    : String(opt).toLowerCase() === String(question.answer).toLowerCase();
                  const isSelected = idx === selected;
                  let className = 'border-white/10 hover:border-yellow-500/30 hover:bg-white/5';
                  if (revealed) {
                    if (isCorrectOpt) className = 'border-emerald-500/50 bg-emerald-500/10';
                    else if (isSelected) className = 'border-red-500/50 bg-red-500/10';
                    else className = 'border-white/5 opacity-40';
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!revealed ? { scale: 1.02 } : {}}
                      whileTap={!revealed ? { scale: 0.98 } : {}}
                      onClick={() => handleSelect(idx)}
                      disabled={revealed}
                      className={`p-4 rounded-2xl border transition-all text-left flex items-center gap-3 ${className}`}
                    >
                      {revealed && isCorrectOpt ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> :
                       revealed && isSelected ? <XCircle className="w-5 h-5 text-red-400 shrink-0" /> :
                       <span className="w-5 h-5 text-white/30 text-sm font-bold shrink-0">{String.fromCharCode(65 + idx)}</span>}
                      <span className="text-white/90 font-medium text-sm">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  autoFocus
                  disabled={revealed}
                  className={`w-full p-4 rounded-2xl border bg-white/5 text-white placeholder-white/30 outline-none transition-all ${
                    revealed
                      ? String(selected).toLowerCase() === String(question.answer).toLowerCase()
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-red-500/50 bg-red-500/10'
                      : 'border-white/10 focus:border-yellow-500/50'
                  }`}
                  placeholder="Type your answer and press Enter..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !revealed && e.currentTarget.value.trim()) {
                      const val = e.currentTarget.value.trim();
                      setSelected(val);
                      setRevealed(true);
                      if (timerRef.current) clearInterval(timerRef.current);
                      const elapsed = Date.now() - questionStartRef.current;
                      setTimes((t) => [...t, elapsed]);
                      if (val.toLowerCase() === String(question.answer).toLowerCase()) {
                        setCorrectCount((c) => c + 1);
                        confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
                      }
                    }
                  }}
                />
                {revealed && String(selected).toLowerCase() !== String(question.answer).toLowerCase() && (
                  <div className="text-emerald-400 text-sm font-medium mt-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Correct Answer: {String(question.answer)}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-3 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] z-50 flex items-center justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
          >
            {currentQ < questions.length - 1 ? 'Next' : 'Finish'} <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
