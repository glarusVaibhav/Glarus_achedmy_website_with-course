// ============================================================
// Component — SidebarHeader (Stats & User Identity)
// ============================================================

"use client";

import { useProgressStore } from '@/lib/store/progressStore';
import { Trophy, Star, Flame, BookOpen } from 'lucide-react';

interface SidebarHeaderProps {
  courseTitle: string;
}

export function SidebarHeader({ courseTitle }: SidebarHeaderProps) {
  const xp = useProgressStore((s) => s.xp);
  const level = useProgressStore((s) => s.level);
  const streak = useProgressStore((s) => s.streak);

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      
      {/* Platform Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
          <BookOpen className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-white font-extrabold text-sm tracking-wider uppercase">Learning OS</h1>
          <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase truncate max-w-[180px]" title={courseTitle}>
            {courseTitle}
          </p>
        </div>
      </div>

      {/* Premium Gamification Card */}
      <div className="bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-4 border border-white/5 backdrop-blur-md transition-all duration-300 relative group overflow-hidden">
        {/* Soft backlighting */}
        <div className="absolute -inset-10 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.15)] relative">
            <Trophy className="text-violet-400 w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-wide">Level {level}</h3>
            <p className="text-white/40 text-[10px] font-semibold tracking-wider uppercase">Elite Learner</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 relative z-10">
          <div className="bg-black/40 rounded-xl p-2 flex items-center gap-2 border border-white/5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Star className="text-amber-400 w-4 h-4 fill-amber-400/20" />
            </div>
            <span className="text-white font-mono font-bold text-xs tracking-wider">{xp} XP</span>
          </div>

          <div className="bg-black/40 rounded-xl p-2 flex items-center gap-2 border border-white/5">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="text-orange-500 w-4 h-4 fill-orange-500/20" />
            </div>
            <span className="text-white font-mono font-bold text-xs tracking-wider">{streak} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
