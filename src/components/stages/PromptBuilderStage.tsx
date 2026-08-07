"use client";

import { useState } from 'react';
import type { StageComponentProps, PromptBuilderStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { ArrowRight, Wand2, Plus, X, Copy, CheckCircle } from 'lucide-react';

export function PromptBuilderStage({ data, onComplete }: StageComponentProps<PromptBuilderStageData>) {
  const suggestedComponents = data.components ?? ['Role', 'Task', 'Context', 'Format', 'Constraints'];
  const [parts, setParts] = useState<{ label: string; value: string }[]>([]);
  const [activeLabel, setActiveLabel] = useState('');
  const [activeValue, setActiveValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const addPart = () => {
    if (!activeLabel.trim() || !activeValue.trim()) return;
    setParts([...parts, { label: activeLabel.trim(), value: activeValue.trim() }]);
    setActiveLabel('');
    setActiveValue('');
  };

  const removePart = (idx: number) => setParts(parts.filter((_, i) => i !== idx));

  const fullPrompt = parts.map((p) => `[${p.label}]: ${p.value}`).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const score = Math.min(100, parts.length * 20);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full max-w-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-40 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_25px_rgba(139,92,246,0.3)]">
              <Wand2 className="w-7 h-7 text-violet-300" />
            </div>
            <div>
              <span className="text-violet-400 font-bold uppercase tracking-widest text-xs block">Prompt Builder</span>
              <h2 className="text-2xl font-extrabold text-white">Craft Your Prompt</h2>
            </div>
          </div>
          <p className="text-white/60 text-sm mb-4">{data.objective ?? 'Build a well-structured prompt by adding components step by step.'}</p>

          {/* Suggested Components */}
          <div className="flex flex-wrap gap-2 mb-6">
            {suggestedComponents.map((comp) => (
              <button key={comp} onClick={() => setActiveLabel(comp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  activeLabel === comp ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                }`}>{comp}</button>
            ))}
          </div>

          {/* Add Component Form */}
          {!submitted && (
            <div className="flex gap-2 mb-6">
              <input value={activeLabel} onChange={(e) => setActiveLabel(e.target.value)} placeholder="Component..."
                className="w-32 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:border-violet-500/50" />
              <input value={activeValue} onChange={(e) => setActiveValue(e.target.value)} placeholder="Content..."
                onKeyDown={(e) => e.key === 'Enter' && addPart()}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:border-violet-500/50" />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addPart}
                disabled={!activeLabel.trim() || !activeValue.trim()}
                className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl transition-all">
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
          )}

          {/* Built Parts */}
          <div className="space-y-2 mb-6">
            {parts.map((part, idx) => (
              <motion.div key={idx} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-violet-400 font-bold text-xs uppercase tracking-wider shrink-0">[{part.label}]</span>
                <span className="text-white/80 text-sm flex-1">{part.value}</span>
                {!submitted && (
                  <button onClick={() => removePart(idx)} className="text-white/30 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Preview */}
          {parts.length > 0 && (
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Compiled Prompt</span>
                <button onClick={handleCopy} className="text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 text-xs">
                  {copied ? <><CheckCircle className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <pre className="text-white/70 text-sm font-mono whitespace-pre-wrap">{fullPrompt}</pre>
            </div>
          )}

          {data.exampleOutput && submitted && (
            <div className="mt-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-2">Example Output</span>
              <p className="text-emerald-200/70 text-sm whitespace-pre-wrap">{data.exampleOutput}</p>
            </div>
          )}
        </motion.div>
      </div>
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-end">
        {!submitted ? (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit}
            disabled={parts.length === 0}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all">
            Build Prompt
          </motion.button>
        ) : (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ correct: parts.length >= 3, score })}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all">
            Complete <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
