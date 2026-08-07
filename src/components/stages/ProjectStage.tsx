"use client";

import { useState } from 'react';
import type { StageComponentProps, ProjectStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { ArrowRight, Hammer, CheckSquare, Square } from 'lucide-react';
import Editor from '@monaco-editor/react';

export function ProjectStage({ data, onComplete }: StageComponentProps<ProjectStageData>) {
  const { project } = data;
  const [code, setCode] = useState(project.starterCode ?? '# Start your project here\n');
  const [checklist, setChecklist] = useState<boolean[]>(project.requirements.map(() => false));

  const completedCount = checklist.filter(Boolean).length;
  const allComplete = completedCount === project.requirements.length;
  const progress = project.requirements.length > 0 ? (completedCount / project.requirements.length) * 100 : 0;

  const toggleCheck = (idx: number) => {
    const next = [...checklist];
    next[idx] = !next[idx];
    setChecklist(next);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
        {/* Project Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-24 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-500/30">
              <Hammer className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{project.title}</h2>
          </div>
          <p className="text-white/70 text-base leading-relaxed mb-4">{project.description}</p>

          {/* Progress */}
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-teal-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Requirements Checklist */}
          <div className="space-y-2">
            {project.requirements.map((req, idx) => (
              <button
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  checklist[idx] ? 'border-teal-500/30 bg-teal-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {checklist[idx] ? (
                  <CheckSquare className="w-5 h-5 text-teal-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-white/30 shrink-0" />
                )}
                <span className={`text-sm font-medium ${checklist[idx] ? 'text-teal-300 line-through' : 'text-white/80'}`}>
                  {req}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Code Editor */}
        <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden border border-white/10">
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(v) => setCode(v ?? '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-between">
        <span className="text-white/40 text-sm font-medium">
          {completedCount}/{project.requirements.length} requirements met
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete({ correct: allComplete, score: Math.round(progress) })}
          disabled={!allComplete}
          className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all"
        >
          Submit Project <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
