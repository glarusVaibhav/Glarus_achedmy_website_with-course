"use client";

import { useState } from 'react';
import type { StageComponentProps, MCQStageData } from '@/types/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, HelpCircle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProgressStore } from '@/lib/store/progressStore';

export function MCQStage({ data, onComplete }: StageComponentProps<MCQStageData>) {
  // Normalize question data across multiple schema shapes
  const rawQuestions = Array.isArray((data as any)?.questions)
    ? (data as any).questions
    : ((data as any)?.question || (data as any)?.content?.question
        ? [{
            question: (data as any)?.question || (data as any)?.content?.question || 'Question',
            options: (data as any)?.options || (data as any)?.content?.options || ['Option A', 'Option B'],
            answer: typeof (data as any)?.answer === 'number' 
              ? (data as any).answer 
              : (typeof (data as any)?.solution === 'number' 
                  ? (data as any).solution 
                  : (typeof (data as any)?.content?.solution === 'number' ? (data as any).content.solution : 0)),
            explanation: (data as any)?.explanation || (data as any)?.content?.explanation || ''
          }]
        : []);

  const questions = rawQuestions.length > 0 ? rawQuestions : [{
    question: 'Select the correct answer:',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    answer: 0,
    explanation: ''
  }];

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const course = useProgressStore((s) => s.course);
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const currentStageIndex = useProgressStore((s) => s.currentStageIndex);
  const mcqLesson = course?.lessons[currentLessonIndex];

  const safeCurrentQ = Math.min(currentQ, questions.length - 1);
  const question = questions[safeCurrentQ] || questions[0];
  const correctAnswer = typeof question.answer === 'number' 
    ? question.answer 
    : (typeof (question as any).solution === 'number' ? (question as any).solution : 0);
  const options = Array.isArray(question.options) ? question.options : [];

  const handleSelect = (optionIndex: number) => {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);

    const isCorrect = optionIndex === correctAnswer;
    if (isCorrect) {
      setTotalCorrect((c) => c + 1);
      setScore((s) => s + Math.round(100 / questions.length));
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setRevealed(false);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      const finalScore = Math.round((totalCorrect + (selected === correctAnswer ? 1 : 0)) / questions.length * 100);
      onComplete({
        correct: finalScore >= 60,
        score: Math.min(100, score + (selected === correctAnswer ? Math.round(100 / questions.length) : 0)),
      });
    }
  };

  const isCurrentCorrect = selected === correctAnswer;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="glass-panel p-4 md:p-6 lg:p-8 rounded-2xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Progress */}
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-violet-400" />
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                  MCQ Practice • Q{safeCurrentQ + 1} of {questions.length}
                </span>
              </div>
              <div className="flex gap-1.5">
                {questions.map((_: any, i: number) => (
                  <div
                    key={i}
                    className={`w-8 h-1.5 rounded-full transition-all ${
                      i < safeCurrentQ ? 'bg-emerald-500' : i === safeCurrentQ ? 'bg-primary w-12 shadow-[0_0_10px_var(--color-primary)]' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question */}
            <h2 className="text-lg md:text-xl font-extrabold text-white mb-4 lg:mb-6 leading-snug">
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {options.map((opt: string, idx: number) => {
                const isCorrectOption = idx === correctAnswer;
                const isSelected = idx === selected;

                let borderClass = 'border-white/10 hover:border-white/30 hover:bg-white/5';
                if (revealed) {
                  if (isCorrectOption) borderClass = 'border-emerald-500/50 bg-emerald-500/10';
                  else if (isSelected) borderClass = 'border-red-500/50 bg-red-500/10';
                  else borderClass = 'border-white/5 opacity-50';
                } else if (isSelected) {
                  borderClass = 'border-primary/50 bg-primary/10';
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
                      revealed && isCorrectOption ? 'border-emerald-500 text-emerald-400' :
                      revealed && isSelected ? 'border-red-500 text-red-400' :
                      'border-white/20 text-white/40'
                    }`}>
                      {revealed && isCorrectOption ? <CheckCircle className="w-5 h-5" /> :
                       revealed && isSelected ? <XCircle className="w-5 h-5" /> :
                       String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`font-medium ${revealed && !isCorrectOption && isSelected ? 'text-red-300 line-through' : 'text-white/90'}`}>
                      {opt}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {revealed && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  <p className="text-white/70 text-sm leading-relaxed italic">
                    💡 {question.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {/* Bottom Bar */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-3 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] z-50"
        >
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between px-1 md:px-4">
            {/* Left side: Retry button (only for wrong answers) */}
            <div>
              {!isCurrentCorrect && (
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

            {/* Right side: Next / Complete button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
            >
              {currentQ < questions.length - 1 ? 'Next Question' : 'Complete'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
