"use client";

import { motion } from 'framer-motion';
import { Target, Flag } from 'lucide-react';

interface GridConfig {
  rows: number;
  cols: number;
  start: { x: number; y: number };
  goal: { x: number; y: number };
}

interface GridRendererProps {
  grid: GridConfig;
  position: { x: number; y: number };
  direction: number; // 0=up, 1=right, 2=down, 3=left
  trail: { x: number; y: number }[];
  obstacles?: { x: number; y: number }[];
  movementAnim: 'spring' | 'tween';
}

const DIRECTION_ROTATION = [0, 90, 180, 270];

export function GridRenderer({ grid, position, direction, trail, obstacles = [], movementAnim }: GridRendererProps) {
  const cellSize = Math.min(56, Math.floor(400 / Math.max(grid.rows, grid.cols)));

  return (
    <div className="flex items-center justify-center my-6">
      <div
        className="relative border border-white/10 rounded-2xl overflow-hidden bg-black/30 backdrop-blur-sm shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]"
        style={{ width: cellSize * grid.cols, height: cellSize * grid.rows }}
      >
        {/* Grid lines */}
        {Array.from({ length: grid.rows }).map((_, r) =>
          Array.from({ length: grid.cols }).map((_, c) => {
            const isStart = r === grid.start.y && c === grid.start.x;
            const isGoal = r === grid.goal.y && c === grid.goal.x;
            const isObstacle = obstacles.some(o => o.x === c && o.y === r);
            const isTrail = trail.some(t => t.x === c && t.y === r);

            return (
              <div
                key={`${r}-${c}`}
                className={`absolute border border-white/[0.04] transition-colors duration-300 ${
                  isObstacle ? 'bg-red-900/40' : isTrail ? 'bg-cyan-500/10' : ''
                }`}
                style={{
                  left: c * cellSize,
                  top: r * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              >
                {isStart && !isGoal && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-cyan-500/30 border border-cyan-500/50" />
                  </div>
                )}
                {isGoal && (
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Flag className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    </motion.div>
                  </div>
                )}
                {isObstacle && (
                  <div className="w-full h-full flex items-center justify-center text-red-500/60 text-xs font-bold">✕</div>
                )}
              </div>
            );
          })
        )}

        {/* Agent */}
        <motion.div
          className="absolute z-20 flex items-center justify-center"
          style={{ width: cellSize, height: cellSize }}
          animate={{
            left: position.x * cellSize,
            top: position.y * cellSize,
          }}
          transition={
            movementAnim === 'spring'
              ? { type: 'spring', stiffness: 300, damping: 25 }
              : { type: 'tween', duration: 0.3, ease: 'easeInOut' }
          }
        >
          <motion.div
            animate={{ rotate: DIRECTION_ROTATION[direction] }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="relative"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.7)] flex items-center justify-center border-2 border-cyan-300">
              <Target className="w-4 h-4 text-white" />
            </div>
            {/* Direction indicator */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-cyan-300" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
