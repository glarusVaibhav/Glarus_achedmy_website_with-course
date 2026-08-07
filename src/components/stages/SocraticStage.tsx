"use client";

import { useState } from 'react';
import type { StageComponentProps, SocraticStageData } from '@/types/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Brain, Send, Sparkles, Loader2, CheckCircle } from 'lucide-react';

interface EvaluatedAnswer {
  userAnswer: string;
  question: string;
  feedback: string;
  improvedAnswer?: string;
  score: number;
}

export function SocraticStage({ data, onComplete }: StageComponentProps<SocraticStageData>) {
  const guidingQuestions = data.guidingQuestions ?? [
    'What do you think is the core idea here?',
    'Can you think of a real-world example?',
    'What would happen if the opposite were true?',
  ];
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<EvaluatedAnswer[]>([]);
  const [userInput, setUserInput] = useState('');
  const [showInsight, setShowInsight] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleSubmit = async () => {
    if (!userInput.trim() || isEvaluating) return;
    
    const questionText = guidingQuestions[currentQ];
    const userText = userInput.trim();
    
    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'socratic',
          question: questionText,
          userInput: userText,
          context: `Topic: ${data.topic ?? 'Deep Thinking'}. Lesson context: ${data.seedQuestion ?? ''}`
        }),
      });

      const evalData = await response.json();
      
      const newEvaluatedAnswer: EvaluatedAnswer = {
        userAnswer: userText,
        question: questionText,
        feedback: evalData.feedback,
        improvedAnswer: evalData.improvedAnswer,
        score: evalData.score
      };

      setAnswers((prev) => [...prev, newEvaluatedAnswer]);
      setUserInput('');

      if (currentQ < guidingQuestions.length - 1) {
        setCurrentQ((q) => q + 1);
      } else {
        setShowInsight(true);
      }
    } catch (error) {
      console.error('Socratic Evaluation Failed:', error);
      // Fallback
      setAnswers((prev) => [...prev, {
        userAnswer: userText,
        question: questionText,
        feedback: "Interesting perspective. Let's continue.",
        score: 50
      }]);
      setUserInput('');
      if (currentQ < guidingQuestions.length - 1) {
        setCurrentQ((q) => q + 1);
      } else {
        setShowInsight(true);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-40 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
              <Brain className="w-7 h-7 text-purple-300" />
            </div>
            <div>
              <span className="text-purple-400 font-bold uppercase tracking-widest text-xs block">Socratic Method</span>
              <h2 className="text-2xl font-extrabold text-white">{data.topic ?? 'Deep Thinking'}</h2>
            </div>
          </div>

          {data.seedQuestion && (
            <p className="text-white/70 text-lg mb-6 italic border-l-2 border-purple-500/50 pl-4">
              &quot;{data.seedQuestion}&quot;
            </p>
          )}

          {/* Conversation Thread */}
          <div className="space-y-6 mb-8">
            {answers.map((ans, i) => (
              <div key={i} className="space-y-3">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                  <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Question {i + 1}</span>
                  <p className="text-white/80 text-sm">{ans.question}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 ml-8">
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block mb-1">Your Thinking</span>
                  <p className="text-white/90 text-sm">{ans.userAnswer}</p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 ml-12"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">AI Feedback</span>
                  </div>
                  <p className="text-emerald-200/90 text-xs italic mb-3 leading-relaxed">&quot;{ans.feedback}&quot;</p>
                  {ans.improvedAnswer && (
                    <div className="mt-2 pt-2 border-t border-emerald-500/10">
                       <span className="text-white/30 text-[9px] font-bold uppercase block mb-1">The Deep Insight</span>
                       <p className="text-white/70 text-[11px] font-mono leading-normal">{ans.improvedAnswer}</p>
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </div>

          {/* Current Question or Evaluation */}
          {!showInsight && (
            <AnimatePresence mode="wait">
              {isEvaluating ? (
                <motion.div
                  key="eval"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 p-8 bg-purple-500/5 rounded-2xl border border-purple-500/10"
                >
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-purple-200 text-sm font-medium animate-pulse">AI is contemplating your response...</p>
                </motion.div>
              ) : (
                <motion.div
                  key={currentQ}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 mb-4">
                    <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Question {currentQ + 1}</span>
                    <p className="text-white/90 text-base font-medium">{guidingQuestions[currentQ]}</p>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Think deeply and respond..."
                      className="flex-1 px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      disabled={!userInput.trim() || isEvaluating}
                      className="px-5 py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Final Summary Insight */}
          {showInsight && !isEvaluating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-20 bg-white/5 rounded-full blur-3xl" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-300" />
                </div>
                <span className="text-purple-300 font-black uppercase tracking-[0.2em] text-xs">Conceptual Synthesis</span>
              </div>
              <p className="text-white/90 text-lg leading-relaxed font-medium">
                {data.expectedInsight ?? 'You have successfully navigated the core complexities of this topic through critical inquiry.'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom Bar */}
      {showInsight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ 
              correct: true, 
              score: Math.round(answers.reduce((acc, curr) => acc + curr.score, 0) / answers.length) 
            })}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all"
          >
            Finish Inquiry <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
