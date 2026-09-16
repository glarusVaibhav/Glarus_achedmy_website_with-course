'use client';

import React from 'react';

export interface FloatingReaction {
  id: string;
  emoji: string;
  senderName?: string;
  x: number; // 10 to 90 %
  isEffect?: boolean;
}

interface ZoomFloatingReactionsProps {
  reactions: FloatingReaction[];
}

export default function ZoomFloatingReactions({ reactions }: ZoomFloatingReactionsProps) {
  if (reactions.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-20 flex flex-col items-center animate-zoom-reaction"
          style={{
            left: `${r.x}%`,
          }}
        >
          <div
            className={`text-4xl sm:text-5xl drop-shadow-2xl transition-transform ${
              r.isEffect ? 'scale-125 animate-pulse' : ''
            }`}
          >
            {r.emoji}
          </div>
          {r.senderName && (
            <span className="mt-1 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold text-white backdrop-blur-sm border border-white/10 shadow-md">
              {r.senderName}
            </span>
          )}
        </div>
      ))}
      <style jsx global>{`
        @keyframes zoomReactionRise {
          0% {
            transform: translateY(0) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          15% {
            transform: translateY(-80px) scale(1.15) rotate(-6deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-240px) scale(1.05) rotate(6deg);
            opacity: 0.9;
          }
          80% {
            transform: translateY(-420px) scale(0.95) rotate(-4deg);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-560px) scale(0.8) rotate(4deg);
            opacity: 0;
          }
        }
        .animate-zoom-reaction {
          animation: zoomReactionRise 3.5s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
