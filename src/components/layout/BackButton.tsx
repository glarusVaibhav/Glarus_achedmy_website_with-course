"use client";

import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useProgressStore } from '@/lib/store/progressStore';

export function BackButton() {
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const currentStageIndex = useProgressStore((s) => s.currentStageIndex);
  const goBack = useProgressStore((s) => s.goBack);

  const isFirstStage = currentLessonIndex === 0 && currentStageIndex === 0;

  if (isFirstStage) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={goBack}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold text-white/70 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:text-white transition-all shadow-[0_0_10px_rgba(255,255,255,0.05)]"
    >
      <ChevronLeft className="w-4 h-4" /> Back
    </motion.button>
  );
}
