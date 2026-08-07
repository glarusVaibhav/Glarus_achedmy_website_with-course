"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '../conceptAnalyzer';
import { Lightbulb, Info, AlertTriangle, Briefcase, Zap, ListChecks, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { BlockRenderer } from '../blocks/BlockRenderer';

interface Point {
  number: number;
  title: string;
  body: string;
}

const icons = [
  <Info className="w-5 h-5 text-blue-400" />,
  <BrainCircuit className="w-5 h-5 text-purple-400" />,
  <Zap className="w-5 h-5 text-yellow-400" />,
  <Briefcase className="w-5 h-5 text-green-400" />,
  <AlertTriangle className="w-5 h-5 text-red-400" />,
  <Lightbulb className="w-5 h-5 text-orange-400" />,
  <ListChecks className="w-5 h-5 text-teal-400" />
];

function MarkdownBody({ content, className }: { content: string; className?: string }) {
  let normalizedContent = content.replace(/•/g, '-');
  normalizedContent = normalizedContent.replace(/\[IMAGE:([^\]]+)\]/gi, (_, src: string) => `![image](${encodeURI(src.trim())})`);
  normalizedContent = normalizedContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/gi, (_, alt: string, src: string) => `![${alt}](${encodeURI(src.trim())})`);

  return (
    <div className={`prose prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed prose-ul:list-disc prose-ul:ml-6 prose-li:my-1 prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:p-4 prose-pre:rounded-xl prose-pre:my-3 prose-pre:overflow-x-auto prose-pre:text-left prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[0.9em] [&_pre_code]:bg-transparent [&_pre_code]:text-white/90 [&_pre_code]:px-0 [&_pre_code]:py-0 ${className || ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}

// --- Variation 1: Bento Grid / Accordion ---
function BentoGridVariation({ points }: { points: Point[] }) {
  const [expanded, setExpanded] = useState<number | null>(points[0]?.number || null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {points.map((pt, i) => {
        const isExpanded = expanded === pt.number;
        return (
          <div
            key={pt.number}
            onClick={() => setExpanded(isExpanded ? null : pt.number)}
            className={`group cursor-pointer border border-white/[0.06] bg-white/[0.02] rounded-xl p-5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 ${
              isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3 bg-white/[0.03]' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/[0.03] rounded-lg">{icons[i]}</div>
                <h3 className="text-lg font-bold text-white/90 group-hover:text-white transition-colors">{pt.title}</h3>
              </div>
              {!isExpanded && (
                <div className="opacity-60 group-hover:opacity-100 transition-opacity text-[11px] font-medium text-white/40 bg-white/[0.03] border border-white/[0.06] px-2 py-1 rounded-md shrink-0">
                  Click to read
                </div>
              )}
            </div>
            {isExpanded && (
                <div className="mt-4">
                  <MarkdownBody content={pt.body} className="text-white/70 text-base" />
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Variation 2: Tabs ---
function TabsVariation({ points }: { points: Point[] }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex md:flex-col gap-2 overflow-x-auto md:w-1/3 shrink-0 pb-2 md:pb-0">
        {points.map((pt, i) => (
          <button
            key={pt.number}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
              activeTab === i ? 'bg-primary/10 border border-primary/30 text-white' : 'bg-white/[0.02] border border-white/[0.06] text-white/50 hover:bg-white/[0.04]'
            }`}
          >
            {icons[i]}
            <span className="font-semibold text-sm whitespace-nowrap md:whitespace-normal">{pt.title}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 border-l border-white/[0.06] pl-6 md:pl-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              {icons[activeTab]}
              {points[activeTab].title}
            </h2>
            <MarkdownBody content={points[activeTab].body} className="text-lg text-white/80" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Variation 3: Timeline Stepper ---
function TimelineVariation({ points }: { points: Point[] }) {
  return (
    <div className="max-w-3xl mx-auto space-y-4 lg:space-y-6 relative">
      <div className="absolute left-8 top-8 bottom-8 w-px bg-white/[0.06]" />
      {points.map((pt, i) => (
        <div 
          key={pt.number} 
          className="relative flex gap-6"
        >
          <div className="w-16 shrink-0 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-background border border-white/10 flex items-center justify-center z-10">
              {icons[i]}
            </div>
          </div>
          <div className="flex-1 pb-6 border-b border-white/[0.04]">
            <h3 className="text-lg font-bold text-white mb-2">{pt.title}</h3>
            <MarkdownBody content={pt.body} className="text-white/70 text-base" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Variation 4: Carousel ---
function CarouselVariation({ points }: { points: Point[] }) {
  const [index, setIndex] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center w-full mt-2">
      <div className="w-full max-w-3xl relative">
        
        {/* Progress bar */}
        <div className="h-px bg-white/[0.06] w-full mb-8">
          <motion.div 
            className="h-px bg-primary shadow-[0_0_8px_var(--color-primary)]"
            animate={{ width: `${((index + 1) / points.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6">
              {React.cloneElement(icons[index] as React.ReactElement<{ className?: string }>, { className: "w-6 h-6 text-primary" })}
            </div>
            
            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6 tracking-tight">
              {points[index].title}
            </h2>
            
            <MarkdownBody content={points[index].body} className="text-base md:text-lg text-white/80 font-medium max-w-2xl mx-auto" />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/[0.06]">
          <button 
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            className="px-6 py-3 rounded-xl bg-white/[0.03] text-white disabled:opacity-20 hover:bg-white/[0.06] transition-colors font-semibold border border-white/[0.06] hover:border-white/10"
          >
            Previous
          </button>
          
          <div className="flex gap-3">
            {points.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setIndex(i)}
                className={`transition-all duration-300 rounded-full ${i === index ? 'w-8 h-2 bg-primary shadow-[0_0_10px_var(--color-primary)]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} 
              />
            ))}
          </div>
          
          <button 
            onClick={() => setIndex(Math.min(points.length - 1, index + 1))}
            disabled={index === points.length - 1}
            className="px-8 py-3 rounded-xl bg-primary text-white disabled:opacity-30 hover:bg-primary/80 transition-all font-bold"
          >
            {index === points.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}


// --- Main Renderer Orchestrator ---
export function SevenPointRenderer({ analysis }: { analysis: AnalysisResult }) {
  const [variation, setVariation] = useState<number>(0);

  useEffect(() => {
    // Deterministically pick a variation based on the title length so it stays the same on reload for the same lesson
    const seed = analysis.title ? analysis.title.length : Math.floor(Math.random() * 4);
    setVariation(seed % 4);
  }, [analysis.title]);

  const sevenPointBlock = analysis.blocks.find(b => b.type === 'sevenPoint');
  const points = (sevenPointBlock?.content as Point[]) || [];

  if (!points || points.length === 0) {
    return <div className="text-red-500">Error: Could not parse 7 points.</div>;
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col gap-6 pb-12">
      {analysis.title && (
        <header className="mb-2 pb-4 border-b border-white/[0.06]">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
            {analysis.title}
          </h1>
        </header>
      )}

      {/* Render the explanation blocks first */}
      {analysis.blocks.filter(b => b.type === 'explanation').map(block => (
        <BlockRenderer key={block.id} block={block} />
      ))}

      {/* Render the selected variation */}
      <div className="flex-1">
        {variation === 0 && <BentoGridVariation points={points} />}
        {variation === 1 && <TabsVariation points={points} />}
        {variation === 2 && <TimelineVariation points={points} />}
        {variation === 3 && <CarouselVariation points={points} />}
      </div>

      {/* Render any additional blocks like examples */}
      {analysis.blocks.filter(b => b.type !== 'sevenPoint' && b.type !== 'explanation').length > 0 && (
        <div className="mt-8 space-y-4">
          {analysis.blocks.filter(b => b.type !== 'sevenPoint' && b.type !== 'explanation').map(block => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      )}
    </div>
  );
}