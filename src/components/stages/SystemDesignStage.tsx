"use client";

import { useState } from 'react';
import type { StageComponentProps, SystemDesignStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { ArrowRight, Network, Lightbulb, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export function SystemDesignStage({ data, onComplete }: StageComponentProps<SystemDesignStageData>) {
  const components = data.components ?? ['Client', 'API Gateway', 'Service', 'Database'];
  const expectedConnections = data.expectedConnections ?? [];

  const [connections, setConnections] = useState<{ from: string; to: string }[]>([]);
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleNodeClick = (name: string) => {
    if (checked) return;
    if (!selectedFrom) {
      setSelectedFrom(name);
    } else {
      if (selectedFrom !== name) {
        const exists = connections.some((c) => c.from === selectedFrom && c.to === name);
        if (!exists) {
          setConnections([...connections, { from: selectedFrom, to: name }]);
        }
      }
      setSelectedFrom(null);
    }
  };

  const removeConnection = (idx: number) => {
    if (checked) return;
    setConnections(connections.filter((_, i) => i !== idx));
  };

  const handleCheck = () => {
    setChecked(true);
    let matched = 0;
    expectedConnections.forEach((expected) => {
      const found = connections.some(
        (c) => c.from === expected.from && c.to === expected.to
      );
      if (found) matched++;
    });
    const calcScore = expectedConnections.length > 0
      ? Math.round((matched / expectedConnections.length) * 100)
      : connections.length > 0 ? 70 : 0;
    setScore(calcScore);
    if (calcScore >= 80) confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full max-w-4xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 left-0 p-40 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.3)]">
              <Network className="w-7 h-7 text-indigo-300" />
            </div>
            <div>
              <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs block">System Design</span>
              <h2 className="text-2xl font-extrabold text-white">{data.title ?? 'Architecture Challenge'}</h2>
            </div>
          </div>

          {data.scenario && (
            <p className="text-white/60 text-sm mb-6 leading-relaxed">{data.scenario}</p>
          )}

          {/* Component Nodes */}
          <div className="mb-6">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-3">
              Components {selectedFrom ? `— connecting from: ${selectedFrom}` : '— click two nodes to connect'}
            </span>
            <div className="flex flex-wrap gap-3">
              {components.map((comp) => (
                <motion.button
                  key={comp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNodeClick(comp)}
                  className={`px-5 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                    selectedFrom === comp
                      ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'
                  }`}
                >
                  {comp}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Connections */}
          <div className="mb-6">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-3">
              Connections ({connections.length})
            </span>
            {connections.length === 0 ? (
              <p className="text-white/20 text-sm">No connections yet. Click two components to link them.</p>
            ) : (
              <div className="space-y-2">
                {connections.map((conn, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <span className="text-indigo-300 font-bold text-sm">{conn.from}</span>
                    <span className="text-white/30">→</span>
                    <span className="text-indigo-300 font-bold text-sm">{conn.to}</span>
                    {!checked && (
                      <button onClick={() => removeConnection(idx)} className="ml-auto text-white/30 hover:text-red-400 text-xs">✕</button>
                    )}
                    {checked && (
                      expectedConnections.some((e) => e.from === conn.from && e.to === conn.to)
                        ? <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                        : <span className="text-red-400 text-xs ml-auto">✕</span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Result */}
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border ${score >= 60 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}
            >
              <span className="text-white font-bold">Design Score: {score}%</span>
              <p className={`text-sm mt-1 ${score >= 60 ? 'text-emerald-300' : 'text-amber-300'}`}>
                {score >= 80 ? 'Excellent architecture!' : score >= 60 ? 'Good design, some connections could be improved.' : 'Review the expected architecture and try again.'}
              </p>
            </motion.div>
          )}

          {/* Hint */}
          {data.hint && !showHint && !checked && (
            <button
              onClick={() => setShowHint(true)}
              className="mt-4 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-bold hover:bg-amber-500/20 transition-colors"
            >
              💡 Show Hint
            </button>
          )}
          {showHint && data.hint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3"
            >
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-amber-200/80 text-sm">{data.hint}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-end gap-3">
        {!checked ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheck}
            disabled={connections.length === 0}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all"
          >
            Check Design
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ correct: score >= 60, score })}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
