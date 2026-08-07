"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { StageComponentProps, TypingPracticeStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { Keyboard, ArrowRight, CheckCircle2, Terminal } from 'lucide-react';

export function TypingPracticeStage({ data, onComplete }: StageComponentProps<TypingPracticeStageData>) {
  const content = data.content || (data as any) || {};
  const expectedText = ((content as any).code_to_type || (content as any).codeToType || (data as any).code_to_type || (data as any).codeToType || '').trim();
  const [typed, setTyped] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Check completion
    if (typed === expectedText && !isCompleted) {
      setIsCompleted(true);
    }
  }, [typed, expectedText, isCompleted]);

  // Focus the hidden textarea when clicking the code block
  const focusInput = () => {
    if (!isCompleted && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isCompleted) return;
    const val = e.target.value;
    
    // Optional strict mode: only allow typing if the previous characters are correct, 
    // or allow mistakes. Let's allow mistakes up to the length of expected text.
    if (val.length <= expectedText.length + 5) {
      setTyped(val);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-white/10" onClick={focusInput}>
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center justify-start pb-8"
          >
            <div className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full relative overflow-hidden shadow-2xl mb-12">
              <div className="absolute top-0 left-0 p-40 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
  
              {/* Header */}
              <div className="flex items-center gap-5 mb-10 border-b border-white/10 pb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <Keyboard className="w-8 h-8 text-blue-300" />
                </div>
                <div>
                  <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-1 block">Typing Practice</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {content.title || 'Build Muscle Memory'}
                  </h2>
                </div>
              </div>
  
              <div className="space-y-6 text-white/90 text-lg leading-relaxed mb-8">
                {content.explanation && <p>{content.explanation}</p>}
              </div>

              {/* Typing Area */}
              <div className="relative group cursor-text" onClick={focusInput}>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-[#0d1117] border border-white/10 p-6 rounded-2xl font-mono text-lg md:text-xl leading-relaxed overflow-hidden shadow-inner">
                  
                  {/* Language Badge */}
                  <div className="absolute top-3 right-4 flex items-center gap-2 text-white/20">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{content.language}</span>
                  </div>

                  {/* Hidden Textarea for mobile/desktop native input handling */}
                  <textarea
                    ref={inputRef}
                    value={typed}
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 resize-none z-10 cursor-text"
                    spellCheck="false"
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    disabled={isCompleted}
                    autoFocus
                  />

                  {/* Rendered Code */}
                  <div className="pointer-events-none whitespace-pre-wrap break-all select-none pt-4">
                    {expectedText.split('').map((char: string, i: number) => {
                      let colorClass = 'text-white/20'; // Not typed yet
                      
                      if (i < typed.length) {
                        if (typed[i] === char) {
                          colorClass = 'text-green-400';
                        } else {
                          // Display red background for spaces/newlines that are wrong
                          colorClass = char === ' ' || char === '\n' ? 'bg-red-500/40 text-red-200' : 'text-red-400';
                        }
                      }

                      const isCurrent = i === typed.length && !isCompleted;

                      return (
                        <span key={i} className={`relative ${colorClass}`}>
                          {char}
                          {isCurrent && (
                            <motion.span 
                              animate={{ opacity: [1, 0] }} 
                              transition={{ repeat: Infinity, duration: 0.8 }}
                              className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-400"
                            />
                          )}
                        </span>
                      );
                    })}
                    
                    {/* Cursor at the very end if fully typed but maybe some mistakes */}
                    {typed.length >= expectedText.length && !isCompleted && (
                       <motion.span 
                        animate={{ opacity: [1, 0] }} 
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-[8px] h-[20px] bg-red-400 align-middle ml-1"
                      />
                    )}
                  </div>
                </div>
              </div>
              
              {isCompleted && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 flex items-center gap-2 text-green-400 font-bold bg-green-400/10 p-4 rounded-xl border border-green-400/20"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Muscle memory secured!
                </motion.div>
              )}

            </div>
          </motion.div>
        </div>
      </div>

      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="text-white/50 text-sm font-mono">
            Progress: {Math.min(typed.length, expectedText.length)} / {expectedText.length}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isCompleted) {
                onComplete({ correct: true, score: 100 });
              } else {
                // Auto-complete if they click skip or next
                onComplete({ correct: false, score: 0 });
              }
            }}
            className={`w-full md:w-auto flex justify-center items-center gap-3 px-8 py-4 font-bold text-lg rounded-xl transition-all ${
              isCompleted 
                ? 'bg-primary hover:bg-primary/80 text-white shadow-[0_0_20px_var(--color-primary)]' 
                : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
            }`}
          >
            {isCompleted ? 'Continue' : 'Skip Practice'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
