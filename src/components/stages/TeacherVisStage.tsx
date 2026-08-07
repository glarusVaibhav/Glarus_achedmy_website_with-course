"use client";

import type { StageComponentProps, TeacherVisStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Terminal } from 'lucide-react';

export function TeacherVisStage({ data, onComplete }: StageComponentProps<TeacherVisStageData>) {
  const { content } = data;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-white/10">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center justify-start pb-8"
          >
            <div className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full relative overflow-hidden shadow-2xl mb-12">
              <div className="absolute top-0 left-0 p-40 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
  
              {/* Header */}
              <div className="flex items-center gap-5 mb-10 border-b border-white/10 pb-8">
                <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  <GraduationCap className="w-8 h-8 text-purple-300" />
                </div>
                <div>
                  <span className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-1 block">Teacher Visual</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {content.title}
                  </h2>
                </div>
              </div>
  
              <div className="space-y-6">
                {content.sections.map((sec, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl"
                  >
                    <h3 className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-3">
                      {sec.label}
                    </h3>
                    {sec.text && (
                      <p className="text-white/90 text-lg leading-relaxed">{sec.text}</p>
                    )}
                    {sec.code && (
                      <div className="mt-4 bg-black/50 border border-purple-500/20 p-4 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-purple-400/50 mb-2">
                           <Terminal className="w-4 h-4" />
                           <span className="text-xs uppercase font-bold tracking-wider">Example Code</span>
                        </div>
                        <pre className="font-mono text-purple-200 whitespace-pre-wrap">{sec.code}</pre>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-end gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ correct: true, score: 100 })}
            className="w-full md:w-auto flex justify-center items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all ml-auto"
          >
            Got it!
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
