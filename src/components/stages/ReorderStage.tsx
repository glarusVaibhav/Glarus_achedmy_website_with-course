"use client";

import { useState, useEffect } from 'react';
import type { StageComponentProps, ReorderStageData } from '@/types/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUp, ArrowDown, ListOrdered, CheckCircle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export function ReorderStage({ data, onComplete }: StageComponentProps<ReorderStageData>) {
  const [items, setItems] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    // Randomize initially
    if (data.challenge?.correctOrder) {
      setItems([...data.challenge.correctOrder].sort(() => Math.random() - 0.5));
    }
  }, [data]);

  const moveUp = (index: number) => {
    if (index === 0 || checked) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1 || checked) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
  };

  const handleCheck = () => {
    if (!data.challenge) return;
    
    // Check if current order matches correct order exactly
    const correct = items.every((item, idx) => item === data.challenge.correctOrder[idx]);
    
    setIsCorrect(correct);
    setChecked(true);
    
    if (correct) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRetry = () => {
    setChecked(false);
    setIsCorrect(false);
  };

  if (!data.challenge) return null;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 md:p-6 lg:p-8 rounded-2xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-40 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 lg:mb-6 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <ListOrdered className="w-7 h-7 text-blue-300" />
            </div>
            <div>
              <span className="text-blue-400 font-bold uppercase tracking-widest text-xs block">Reorder Sequence</span>
              <h2 className="text-lg md:text-xl font-extrabold text-white">
                {data.challenge.instruction}
              </h2>
            </div>
          </div>

          {/* Reorder List */}
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {items.map((item, index) => {
                const isItemCorrect = checked && item === data.challenge.correctOrder[index];
                const isItemWrong = checked && !isItemCorrect;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1, x: isItemWrong ? [-5, 5, -5, 5, 0] : 0 }}
                    key={item}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all shadow-md ${
                      isItemCorrect ? 'bg-emerald-500/20 border-emerald-500/40' :
                      isItemWrong ? 'bg-red-500/20 border-red-500/40' :
                      'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col gap-1 shrink-0">
                      <button 
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || checked}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-white/50 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => moveDown(index)}
                        disabled={index === items.length - 1 || checked}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-white/50 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-black/30 border border-white/10 flex items-center justify-center shrink-0 font-bold text-white/70">
                      {index + 1}
                    </div>

                    <div className="flex-1 text-white font-medium text-base leading-snug">
                      {item}
                    </div>

                    {isItemCorrect && (
                      <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-3 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] z-50 flex items-center justify-end gap-3">
        {checked && !isCorrect && (
          <button onClick={handleRetry} className="px-4 py-2 bg-white/5 text-white/60 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        )}
        {!checked ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheck}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
          >
            Check Order
          </motion.button>
        ) : isCorrect ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ correct: true, score: 100 })}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
          >
            Complete <ArrowRight className="w-5 h-5" />
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}
