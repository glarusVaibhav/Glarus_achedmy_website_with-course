"use client";

import type { StageComponentProps, BoardVideoStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { Video, ArrowRight, PlayCircle } from 'lucide-react';

export function BoardVideoStage({ data, onComplete }: StageComponentProps<BoardVideoStageData>) {
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
              <div className="absolute top-0 right-0 p-40 bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
  
              {/* Header */}
              <div className="flex items-center gap-5 mb-10 border-b border-white/10 pb-8">
                <div className="w-16 h-16 rounded-2xl bg-green-600/20 flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <Video className="w-8 h-8 text-green-300" />
                </div>
                <div>
                  <span className="text-green-400 font-bold uppercase tracking-widest text-xs mb-1 block">Board Video</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {content.title}
                  </h2>
                </div>
                {content.voice && (
                  <div className="ml-auto px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-bold uppercase flex items-center gap-2 border border-green-500/30">
                    <PlayCircle className="w-4 h-4" /> Voice Enabled
                  </div>
                )}
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {content.sections.map((sec, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-green-950/20 border border-green-500/20 p-6 rounded-2xl"
                  >
                    <h3 className="text-green-400 font-bold uppercase tracking-widest text-sm mb-4 border-b border-green-500/20 pb-2">
                      {sec.label}
                    </h3>
                    <ul className="space-y-3">
                      {sec.lines.map((line, lidx) => (
                        <li key={lidx} className="text-green-100 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
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
            Finished Video
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
