"use client";

import { useState } from 'react';
import type { StageComponentProps, FlashcardStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowRight, Layers } from 'lucide-react';

export function FlashcardStage({ data, onComplete }: StageComponentProps<FlashcardStageData>) {
  const rawCards = data.cards || ((data as any).content && (data as any).content.cards);
  const cards = Array.isArray(rawCards) && rawCards.length > 0
    ? rawCards
    : ((data as any).front || (data as any).content?.front
        ? [{
            front: (data as any).front || (data as any).content?.front || 'Flashcard',
            back: (data as any).back || (data as any).content?.back || 'Definition'
          }]
        : [{ front: 'Concept Review', back: 'Flashcard detail' }]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const safeIdx = Math.min(currentIdx, cards.length - 1);
  const card = cards[safeIdx] || cards[0];

  const handleFlip = () => setFlipped((f) => !f);

  if (!cards || cards.length === 0) {
    return <div className="p-8 text-white">Error: No flashcards found.</div>;
  }

  const handleNext = () => {
    if (currentIdx < cards.length - 1) {
      setCurrentIdx((i) => i + 1);
      setFlipped(false);
      setReviewed((r) => r + 1);
    } else {
      onComplete({ correct: true, score: 100 });
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 flex flex-col items-center justify-center">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <Layers className="w-5 h-5 text-fuchsia-400" />
          <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Card {currentIdx + 1} of {cards.length}
          </span>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-lg cursor-pointer perspective-1000"
          onClick={handleFlip}
          style={{ perspective: '1000px' }}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-full min-h-[200px] lg:min-h-[260px]"
          >
            {/* Front */}
            <div
              className="absolute inset-0 glass-panel rounded-2xl border border-fuchsia-500/30 p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-2xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="text-fuchsia-400 text-xs font-bold uppercase tracking-widest mb-4">Question</span>
              <p className="text-white text-xl md:text-2xl font-bold leading-snug">{card.front}</p>
              <span className="text-white/30 text-sm mt-4">Tap to reveal</span>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 glass-panel rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-2xl"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Answer</span>
              <p className="text-white text-xl md:text-2xl font-bold leading-snug">{card.back}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-3 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] z-50 flex items-center justify-end gap-3">
        <button
          onClick={() => { setFlipped(false); }}
          className="px-4 py-2 bg-white/5 text-white/60 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
        >
          {currentIdx < cards.length - 1 ? 'Next Card' : 'Complete'}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
