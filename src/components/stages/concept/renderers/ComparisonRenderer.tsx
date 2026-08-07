import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '../conceptAnalyzer';
import { BlockRenderer } from '../blocks/BlockRenderer';

export interface RendererProps {
  analysis: AnalysisResult;
}

export function ComparisonRenderer({ analysis }: RendererProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-[1000px] mx-auto flex flex-col justify-start pb-12"
    >
      {/* Header */}
      <header className="flex flex-col mb-2 pb-4 border-b border-white/[0.06]">
        <span className="text-white/40 font-semibold uppercase tracking-[0.2em] text-[11px] mb-2 block">
          Paradigm Shift
        </span>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
          {analysis.title ?? 'Core Concept'}
        </h2>
      </header>

      {/* Content blocks — no card, flows directly on page */}
      <div className="space-y-4">
        {analysis.blocks.map(block => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </motion.div>
  );
}
