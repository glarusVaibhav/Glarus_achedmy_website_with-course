"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, RotateCcw, RotateCw, Package, Play, Trash2, Plus } from 'lucide-react';

interface CommandPanelProps {
  availableCommands: string[];
  commandQueue: string[];
  onAddCommand: (cmd: string) => void;
  onRemoveCommand: (index: number) => void;
  onClear: () => void;
  onExecute: () => void;
  isRunning: boolean;
  currentExecutingIndex: number;
  disabled: boolean;
}

const COMMAND_ICONS: Record<string, React.ReactNode> = {
  forward: <ArrowUp className="w-4 h-4" />,
  left: <RotateCcw className="w-4 h-4" />,
  right: <RotateCw className="w-4 h-4" />,
  deliver: <Package className="w-4 h-4" />,
};

const COMMAND_COLORS: Record<string, string> = {
  forward: 'from-cyan-600 to-cyan-500 border-cyan-400/40 hover:border-cyan-400/80',
  left: 'from-violet-600 to-violet-500 border-violet-400/40 hover:border-violet-400/80',
  right: 'from-violet-600 to-violet-500 border-violet-400/40 hover:border-violet-400/80',
  deliver: 'from-emerald-600 to-emerald-500 border-emerald-400/40 hover:border-emerald-400/80',
};

export function CommandPanel({
  availableCommands,
  commandQueue,
  onAddCommand,
  onRemoveCommand,
  onClear,
  onExecute,
  isRunning,
  currentExecutingIndex,
  disabled,
}: CommandPanelProps) {
  return (
    <div className="space-y-6">
      {/* Available Commands */}
      <div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">Available Commands</div>
        <div className="flex flex-wrap gap-2">
          {availableCommands.map((cmd) => (
            <motion.button
              key={cmd}
              whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(6,182,212,0.3)' }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onAddCommand(cmd)}
              disabled={isRunning || disabled}
              className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${COMMAND_COLORS[cmd] ?? 'from-white/10 to-white/5 border-white/20'} border rounded-xl text-white text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm`}
            >
              {COMMAND_ICONS[cmd] ?? <Plus className="w-4 h-4" />}
              <span className="capitalize">{cmd}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Command Queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
            Command Queue ({commandQueue.length})
          </div>
          {commandQueue.length > 0 && !isRunning && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClear}
              className="text-xs text-red-400/70 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </motion.button>
          )}
        </div>

        <div className="min-h-[60px] bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-wrap gap-2 items-start">
          <AnimatePresence>
            {commandQueue.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white/20 text-sm italic w-full text-center py-3"
              >
                Click commands above to build your sequence...
              </motion.div>
            )}
            {commandQueue.map((cmd, i) => (
              <motion.div
                key={`${cmd}-${i}`}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{
                  opacity: 1,
                  scale: currentExecutingIndex === i ? 1.15 : 1,
                  y: 0,
                  boxShadow: currentExecutingIndex === i ? '0 0 20px rgba(6,182,212,0.6)' : '0 0 0px transparent',
                }}
                exit={{ opacity: 0, scale: 0.5, y: -10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  currentExecutingIndex === i
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                    : i < currentExecutingIndex && isRunning
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                {COMMAND_ICONS[cmd] ?? null}
                <span className="capitalize">{cmd}</span>
                {!isRunning && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveCommand(i); }}
                    className="ml-1 text-white/30 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Run Button */}
      {commandQueue.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(6,182,212,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onExecute}
          disabled={isRunning || disabled}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:opacity-40 text-white font-black text-base rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          {isRunning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              Running...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Execute Sequence
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
