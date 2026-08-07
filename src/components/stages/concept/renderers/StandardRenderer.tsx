import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '../conceptAnalyzer';
import { BlockRenderer } from '../blocks/BlockRenderer';

export interface RendererProps {
  analysis: AnalysisResult;
}

export function StandardRenderer({ analysis }: RendererProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[1000px] mx-auto flex flex-col justify-start pb-12"
    >
      {/* Title */}
      {analysis.title && analysis.title !== "Let's Start" && (
        <header className="mb-2 pb-4 border-b border-white/[0.06]">
          <span className="text-primary/80 font-semibold uppercase tracking-[0.2em] text-[11px] mb-2 block">
            Deep Dive
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
            {analysis.title}
          </h2>
        </header>
      )}

      {/* Content blocks — no card, flows directly on page */}
      <div className="space-y-2">
        {analysis.blocks.map(block => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </motion.div>
  );
}
