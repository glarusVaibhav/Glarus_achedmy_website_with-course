// ============================================================
// Component — ProgressIndicator (Premium Glow Progress Bar)
// ============================================================

"use client";

import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  progress: number; // 0 to 100
  totalLessons: number;
  completedLessons: number;
}

export function ProgressIndicator({
  progress,
  totalLessons,
  completedLessons,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors select-none">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white/60 font-semibold text-xs tracking-wide">Course Progress</span>
        <span className="text-violet-400 font-mono font-bold text-xs tracking-wider">
          {completedLessons}/{totalLessons} Lessons ({progress}%)
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden relative border border-white/5">
        {/* Glowing Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-400 rounded-full relative"
          style={{
            boxShadow: progress > 0 ? '0 0 10px rgba(139, 92, 246, 0.6)' : 'none',
          }}
        >
          {/* Subtle moving light effect inside the progress bar */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_100%)] bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
        </motion.div>
      </div>
    </div>
  );
}
