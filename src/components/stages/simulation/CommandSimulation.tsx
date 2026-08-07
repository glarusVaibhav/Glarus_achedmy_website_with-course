"use client";

import { useState, useCallback, useRef } from 'react';
import type { StageResult } from '@/types/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, CheckCircle, ArrowRight, AlertTriangle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

import { GridRenderer } from './GridRenderer';
import { CommandPanel } from './CommandPanel';

// ============================================================
// Types — JSON-driven config
// ============================================================

interface GridConfig {
  rows: number;
  cols: number;
  start: { x: number; y: number };
  goal: { x: number; y: number };
  obstacles?: { x: number; y: number }[];
}

interface AnimationConfig {
  movement?: 'spring' | 'tween';
  feedback?: 'float' | 'fade';
  error?: 'shake' | 'flash';
  success?: 'confetti' | 'glow';
}

interface UIConfig {
  showGrid?: boolean;
  showControls?: boolean;
  theme?: 'neon' | 'minimal' | 'retro';
}

export interface CommandSimulationData {
  title?: string;
  description?: string;
  goalDescription?: string;
  grid: GridConfig;
  commands?: string[];
  animations?: AnimationConfig;
  ui?: UIConfig;
  maxCommands?: number;
}

interface CommandSimulationProps {
  data: CommandSimulationData;
  onComplete: (result: StageResult) => void;
}

// ============================================================
// Direction helpers
// ============================================================

// 0=up, 1=right, 2=down, 3=left
const DIRECTION_DELTAS = [
  { dx: 0, dy: -1 }, // up
  { dx: 1, dy: 0 },  // right
  { dx: 0, dy: 1 },  // down
  { dx: -1, dy: 0 }, // left
];

// ============================================================
// Component
// ============================================================

export function CommandSimulation({ data, onComplete }: CommandSimulationProps) {
  const grid = data.grid;
  const availableCommands = data.commands ?? ['forward', 'left', 'right'];
  const animations: AnimationConfig = data.animations ?? {};
  const ui: UIConfig = data.ui ?? { showGrid: true, showControls: true };
  const maxCommands = data.maxCommands ?? 20;

  const [commandQueue, setCommandQueue] = useState<string[]>([]);
  const [position, setPosition] = useState({ x: grid.start.x, y: grid.start.y });
  const [direction, setDirection] = useState(1); // start facing right
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([{ x: grid.start.x, y: grid.start.y }]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecIndex, setCurrentExecIndex] = useState(-1);

  const [feedback, setFeedback] = useState<{ text: string; type: 'good' | 'warning' | 'bad'; id: number } | null>(null);
  const [shake, setShake] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const abortRef = useRef(false);

  // --- Command queue builders ---
  const addCommand = useCallback((cmd: string) => {
    if (commandQueue.length >= maxCommands) {
      showFeedback('Max commands reached!', 'warning');
      return;
    }
    setCommandQueue(prev => [...prev, cmd]);
  }, [commandQueue.length, maxCommands]);

  const removeCommand = useCallback((index: number) => {
    setCommandQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => setCommandQueue([]), []);

  // --- Feedback helper ---
  const showFeedback = useCallback((text: string, type: 'good' | 'warning' | 'bad') => {
    setFeedback({ text, type, id: Date.now() });
    setTimeout(() => setFeedback(null), 2500);
  }, []);

  // --- Execution engine ---
  const executeCommands = useCallback(async () => {
    if (commandQueue.length === 0) return;
    setIsRunning(true);
    setIsFailed(false);
    abortRef.current = false;

    // Reset to start
    let pos = { x: grid.start.x, y: grid.start.y };
    let dir = 1; // facing right
    const newTrail: { x: number; y: number }[] = [{ ...pos }];

    setPosition(pos);
    setDirection(dir);
    setTrail(newTrail);

    await delay(400);

    for (let i = 0; i < commandQueue.length; i++) {
      if (abortRef.current) break;
      setCurrentExecIndex(i);
      const cmd = commandQueue[i];

      if (cmd === 'forward') {
        const delta = DIRECTION_DELTAS[dir];
        const newX = pos.x + delta.dx;
        const newY = pos.y + delta.dy;

        // Bounds check
        if (newX < 0 || newX >= grid.cols || newY < 0 || newY >= grid.rows) {
          triggerError('Hit wall! Cannot move forward.');
          setIsFailed(true);
          setIsRunning(false);
          setCurrentExecIndex(-1);
          return;
        }

        // Obstacle check
        if (grid.obstacles?.some(o => o.x === newX && o.y === newY)) {
          triggerError('Blocked by obstacle!');
          setIsFailed(true);
          setIsRunning(false);
          setCurrentExecIndex(-1);
          return;
        }

        pos = { x: newX, y: newY };
        newTrail.push({ ...pos });
        setPosition({ ...pos });
        setTrail([...newTrail]);
      } else if (cmd === 'left') {
        dir = (dir + 3) % 4;
        setDirection(dir);
      } else if (cmd === 'right') {
        dir = (dir + 1) % 4;
        setDirection(dir);
      } else if (cmd === 'deliver') {
        showFeedback('📦 Package delivered!', 'good');
      }

      await delay(500);
    }

    setCurrentExecIndex(-1);

    // Check win condition
    if (pos.x === grid.goal.x && pos.y === grid.goal.y) {
      setIsComplete(true);
      if (animations.success === 'confetti' || !animations.success) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
      showFeedback('🎯 Goal reached!', 'good');
    } else {
      showFeedback('Did not reach the goal. Try again!', 'warning');
      setIsFailed(true);
    }

    setIsRunning(false);
    setAttempts(prev => prev + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandQueue, grid, animations.success]);

  const triggerError = useCallback((msg: string) => {
    showFeedback(msg, 'bad');
    if (animations.error === 'shake' || !animations.error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [showFeedback, animations.error]);

  const handleRetry = useCallback(() => {
    setPosition({ x: grid.start.x, y: grid.start.y });
    setDirection(1);
    setTrail([{ x: grid.start.x, y: grid.start.y }]);
    setCommandQueue([]);
    setCurrentExecIndex(-1);
    setIsComplete(false);
    setIsFailed(false);
    setFeedback(null);
    setShake(false);
  }, [grid.start]);

  const handleFinish = useCallback(() => {
    const score = Math.max(0, 100 - (attempts * 5));
    onComplete({ correct: true, score });
  }, [attempts, onComplete]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, x: shake ? [-8, 8, -8, 8, 0] : 0 }}
          transition={{ x: { duration: 0.4 } }}
          className="glass-panel p-8 md:p-10 rounded-3xl border-white/10 w-full max-w-4xl relative overflow-hidden shadow-2xl bg-black/40 backdrop-blur-3xl"
        >
          {/* Background blobs */}
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
            className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none"
          />

          {/* Header */}
          <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <Cpu className="w-7 h-7 text-cyan-300" />
            </div>
            <div>
              <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs block">Command Simulation</span>
              <h2 className="text-2xl font-extrabold text-white">{data.title ?? 'Grid Navigator'}</h2>
            </div>
          </div>

          {data.description && (
            <p className="text-white/60 text-sm mb-6 relative z-10">{data.description}</p>
          )}

          {/* Floating Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: -10, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                className={`absolute top-4 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-xl font-bold text-sm shadow-2xl backdrop-blur-md whitespace-nowrap ${
                  feedback.type === 'good' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50' :
                  feedback.type === 'bad' ? 'bg-red-950/80 text-red-300 border border-red-500/50' :
                  'bg-yellow-950/80 text-yellow-300 border border-yellow-500/50'
                }`}
              >
                {feedback.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {(ui.showGrid !== false) && (
            <div className="relative z-10">
              <GridRenderer
                grid={grid}
                position={position}
                direction={direction}
                trail={trail}
                obstacles={grid.obstacles}
                movementAnim={animations.movement ?? 'spring'}
              />
            </div>
          )}

          {/* Command Panel */}
          {(ui.showControls !== false) && !isComplete && (
            <div className="relative z-10 mt-4">
              <CommandPanel
                availableCommands={availableCommands}
                commandQueue={commandQueue}
                onAddCommand={addCommand}
                onRemoveCommand={removeCommand}
                onClear={clearQueue}
                onExecute={executeCommands}
                isRunning={isRunning}
                currentExecutingIndex={currentExecIndex}
                disabled={isComplete}
              />
            </div>
          )}

          {/* Goal */}
          {data.goalDescription && (
            <div className="mt-6 text-white/40 text-xs flex items-center gap-2 px-2 relative z-10">
              <ArrowRight className="w-3 h-3 text-cyan-500" />
              Objective: {data.goalDescription}
            </div>
          )}

          {/* Failure overlay (hit wall / wrong path) */}
          <AnimatePresence>
            {isFailed && !isRunning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md z-30 flex flex-col items-center justify-center rounded-3xl"
              >
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-5 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-2">Sequence Failed</h3>
                <p className="text-white/50 text-sm mb-6 max-w-sm text-center">
                  {feedback?.text ?? 'The agent could not reach the goal. Adjust your command sequence and try again.'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-8 py-3 bg-red-600/80 hover:bg-red-500 border border-red-400/40 text-white font-bold rounded-xl transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Retry
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Completion Bar */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-emerald-950/90 backdrop-blur-2xl border-t border-emerald-500/30 p-6 shadow-[0_-20px_50px_rgba(16,185,129,0.2)] z-50 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-emerald-400 font-bold text-lg">Navigation Complete!</div>
                <div className="text-emerald-200/60 text-sm">Goal reached in {commandQueue.length} commands ({attempts} attempt{attempts !== 1 ? 's' : ''}).</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(16,185,129,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFinish}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
            >
              Finish Stage <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Utility
// ============================================================

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
