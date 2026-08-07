import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAudioStore } from '@/lib/store/audioStore';

export function LiveTranscriptPanel() {
  const text = useAudioStore((s) => s.transcriptText);
  const subtitleData = useAudioStore((s) => s.subtitleData);
  const currentTime = useAudioStore((s) => s.currentTime);
  const progress = useAudioStore((s) => s.progress);

  // If we have subtitleData, use it directly for chunks and highlighting
  const hasSubtitles = subtitleData && subtitleData.length > 0;

  const chunks = useMemo(() => {
    if (hasSubtitles) {
      return subtitleData.map(s => s.text);
    }
    
    if (!text) return [];
    const matches = text.match(/[^.,?:!]+[.,?:!]+|[^.,?:!]+/g);
    return matches ? matches.map(m => m.trim()).filter(Boolean) : [];
  }, [text, subtitleData, hasSubtitles]);

  const activeChunkIndex = useMemo(() => {
    if (chunks.length === 0) return 0;

    if (hasSubtitles) {
      // Find the currently active subtitle based on time
      let idx = subtitleData.findIndex(s => currentTime >= s.start && currentTime <= s.end);
      if (idx === -1) {
        // If between subtitles, highlight the most recent one we passed
        const nextIdx = subtitleData.findIndex(s => s.start > currentTime);
        idx = nextIdx !== -1 ? nextIdx - 1 : subtitleData.length - 1;
      }
      return Math.max(0, idx);
    }

    // Fallback approximation if no subtitleData
    if (progress <= 0) return 0;
    if (progress >= 1) return chunks.length - 1;

    const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
    const targetLength = totalLength * progress;

    let currentLength = 0;
    for (let i = 0; i < chunks.length; i++) {
      currentLength += chunks[i].length;
      if (currentLength >= targetLength) {
        return i;
      }
    }
    return chunks.length - 1;
  }, [chunks, progress, currentTime, subtitleData, hasSubtitles]);

  if (!text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4 shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
          <span className="w-3 h-4 bg-blue-400/50 rounded-[2px]" />
          Live Transcript
        </h3>
        <div className="bg-red-500/20 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-red-500/20">
          Live
        </div>
      </div>
      
      <div className="text-xs leading-relaxed text-white/40 space-x-1">
        {chunks.map((chunk, i) => {
          const isActive = i === activeChunkIndex;
          
          return (
            <span
              key={i}
              className={`transition-colors duration-300 ${
                isActive ? 'bg-blue-600/80 text-white rounded-[3px] px-[2px] shadow-[0_0_10px_rgba(37,99,235,0.5)]' : ''
              }`}
            >
              {chunk}{' '}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
