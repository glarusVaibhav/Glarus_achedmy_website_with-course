'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Info,
  MoreHorizontal,
  Check,
  X,
  ChevronsLeft,
  ChevronsRight,
  Coffee,
  Hand,
  Hourglass,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface ReactionEffect {
  id: string;
  emoji: string;
  name: string;
  bgClass: string;
  effectType: 'balloon' | 'rocket' | 'thumbs' | 'joy' | 'party' | 'heart';
}

export interface FloatingEmojiItem {
  id: string;
  emoji: string;
  x: number; // percentage across screen (0-100)
  size: number;
  rotation: number;
  duration: number;
  isEffect?: boolean;
}

// "Send with effect" reactions matching Zoom
export const EFFECT_REACTIONS: ReactionEffect[] = [
  { id: 'balloon', emoji: '🎈', name: 'Balloon', bgClass: 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-700/50', effectType: 'balloon' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', bgClass: 'bg-sky-950/80 hover:bg-sky-900 border-sky-700/50', effectType: 'rocket' },
  { id: 'thumbs_eff', emoji: '👍', name: 'Thumbs Up', bgClass: 'bg-amber-950/80 hover:bg-amber-900 border-amber-700/50', effectType: 'thumbs' },
  { id: 'joy_eff', emoji: '😂', name: 'Joy', bgClass: 'bg-yellow-950/80 hover:bg-yellow-900 border-yellow-700/50', effectType: 'joy' },
  { id: 'party_eff', emoji: '🎉', name: 'Party', bgClass: 'bg-purple-950/80 hover:bg-purple-900 border-purple-700/50', effectType: 'party' },
  { id: 'heart_eff', emoji: '❤️', name: 'Heart', bgClass: 'bg-rose-950/80 hover:bg-rose-900 border-rose-700/50', effectType: 'heart' },
];

// Standard Zoom Quick Reactions
export const STANDARD_REACTIONS = ['👏', '👍', '❤️', '😂', '😮', '🎉'];

// Extended Emoji Picker List
export const MORE_EMOJIS = [
  '🔥', '✨', '💯', '🙌', '😍', '🤔', '🥳', '🤩',
  '💡', '⭐', '🚀', '🎯', '💪', '🤝', '🎓', '📚',
  '👀', '🧠', '⚡', '🌟', '💖', '🌈', '🍕', '☕',
];

interface ZoomReactionsMenuProps {
  onSendReaction: (emoji: string, isEffect?: boolean) => void;
  isHandRaised: boolean;
  onToggleRaiseHand: () => void;
  isAway: boolean;
  onToggleAway: () => void;
  onSendFeedback?: (feedbackType: 'yes' | 'no' | 'slower' | 'faster' | 'coffee') => void;
  className?: string;
}

export default function ZoomReactionsMenu({
  onSendReaction,
  isHandRaised,
  onToggleRaiseHand,
  isAway,
  onToggleAway,
  onSendFeedback,
  className = '',
}: ZoomReactionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreEmojis, setShowMoreEmojis] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowMoreEmojis(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown);
    }
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  // Handle reaction trigger
  const handleTriggerReaction = (emoji: string, isEffect = false) => {
    onSendReaction(emoji, isEffect);

    // If it's a party or celebratory effect, fire confetti!
    if (emoji === '🎉' || emoji === '✨' || emoji === '🚀') {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.85 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        });
      } catch (e) {
        // ignore if canvas not ready
      }
    }

    setIsOpen(false);
    setShowMoreEmojis(false);
  };

  // Map non-verbal feedback types to reaction emojis
  const FEEDBACK_EMOJI_MAP: Record<string, string> = {
    yes: '✅',
    no: '❌',
    slower: '⏪',
    faster: '⏩',
    coffee: '☕',
  };

  // Handle non-verbal meeting feedback and trigger floating reaction
  const handleFeedbackClick = (type: 'yes' | 'no' | 'slower' | 'faster' | 'coffee') => {
    setActiveFeedback(type);

    const emoji = FEEDBACK_EMOJI_MAP[type] || '👍';
    onSendReaction(emoji, false);

    if (onSendFeedback) {
      onSendFeedback(type);
    }

    setTimeout(() => {
      setActiveFeedback(null);
    }, 4000);

    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      {/* Trigger Button on Zoom Control Bar */}
      <button
        ref={triggerRef}
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowMoreEmojis(false);
        }}
        title="React"
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${
          isOpen || isHandRaised || isAway
            ? 'bg-amber-500/25 border-amber-500/50 text-amber-300 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/20'
            : 'bg-[#181c2b] border-white/15 text-white hover:bg-white/20'
        }`}
      >
        <div className="relative">
          <Heart className="w-5 h-5 text-amber-300" />
          {isHandRaised && (
            <span className="absolute -top-1.5 -right-2 text-[10px] animate-bounce">✋</span>
          )}
          {isAway && !isHandRaised && (
            <span className="absolute -top-1.5 -right-2 text-[10px]">⌛</span>
          )}
        </div>
      </button>

      {/* Actual Zoom Reactions Popover Window */}
      {isOpen && (
        <div
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:-left-24 w-[310px] bg-[#1a1d26] border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 p-3.5 space-y-3.5 text-slate-200 animate-in fade-in zoom-in-95 duration-150"
          style={{
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          {/* SECTION 1: Send with effect Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-300">
                <span>Send with effect</span>
                <div
                  className="relative cursor-pointer"
                  onMouseEnter={() => setShowInfoTooltip(true)}
                  onMouseLeave={() => setShowInfoTooltip(false)}
                >
                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                  {showInfoTooltip && (
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 w-44 bg-black/90 text-[10px] text-slate-300 p-2 rounded-lg border border-white/10 shadow-xl z-50 pointer-events-none">
                      Reactions animate across the entire meeting screen for everyone to see.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Effect Buttons Row */}
            <div className="grid grid-cols-7 gap-1.5">
              {EFFECT_REACTIONS.map((eff) => (
                <button
                  key={eff.id}
                  onClick={() => handleTriggerReaction(eff.emoji, true)}
                  title={`Send ${eff.name} effect`}
                  className={`group relative h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 ${eff.bgClass}`}
                >
                  <span className="text-lg leading-none group-hover:scale-125 transition-transform">
                    {eff.emoji}
                  </span>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-black/60 shadow-sm" />
                </button>
              ))}

              {/* More Effects toggle */}
              <button
                onClick={() => setShowMoreEmojis((prev) => !prev)}
                title="More emojis"
                className="h-9 w-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SECTION 2: Reactions Header & Standard Emojis */}
          <div className="space-y-2 pt-1 border-t border-white/10">
            <div className="text-[12px] font-medium text-slate-300 px-1">
              Reactions
            </div>

            <div className="flex items-center justify-between px-0.5">
              {STANDARD_REACTIONS.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTriggerReaction(emoji, false)}
                  className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-xl transition-all hover:scale-125 active:scale-95 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}

              {/* More standard emojis button */}
              <button
                onClick={() => setShowMoreEmojis((prev) => !prev)}
                title="Choose custom reaction"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  showMoreEmojis ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Extended Emoji Grid Popup */}
            {showMoreEmojis && (
              <div className="p-2 bg-[#12151d] rounded-xl border border-white/10 grid grid-cols-6 gap-1 max-h-36 overflow-y-auto animate-in fade-in duration-100">
                {MORE_EMOJIS.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTriggerReaction(emoji, false)}
                    className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-lg hover:scale-125 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: Non-Verbal Meeting Feedback Buttons */}
          <div className="pt-1 border-t border-white/10">
            <div className="grid grid-cols-5 gap-1.5">
              {/* Yes (Green Check) */}
              <button
                onClick={() => handleFeedbackClick('yes')}
                title="Yes / Agree"
                className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  activeFeedback === 'yes'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#242938] hover:bg-emerald-600/20 text-emerald-400 hover:border-emerald-500/40 border border-white/5'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </button>

              {/* No (Red Cross) */}
              <button
                onClick={() => handleFeedbackClick('no')}
                title="No / Disagree"
                className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  activeFeedback === 'no'
                    ? 'bg-rose-500 text-white'
                    : 'bg-[#242938] hover:bg-rose-600/20 text-rose-400 hover:border-rose-500/40 border border-white/5'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                  <X className="w-3 h-3 stroke-[3]" />
                </div>
              </button>

              {/* Slower (<<) */}
              <button
                onClick={() => handleFeedbackClick('slower')}
                title="Slow down"
                className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  activeFeedback === 'slower'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#242938] hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Faster (>>) */}
              <button
                onClick={() => handleFeedbackClick('faster')}
                title="Speed up"
                className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  activeFeedback === 'faster'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#242938] hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>

              {/* Need a Break (Coffee) */}
              <button
                onClick={() => handleFeedbackClick('coffee')}
                title="Need a short break"
                className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  activeFeedback === 'coffee'
                    ? 'bg-amber-600 text-white'
                    : 'bg-[#242938] hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

          {/* SECTION 4: Action Buttons (Raise Hand & Be Right Back) */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            {/* Raise / Lower Hand Button */}
            <button
              onClick={() => {
                onToggleRaiseHand();
                setIsOpen(false);
              }}
              className={`w-full py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isHandRaised
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-400'
                  : 'bg-[#242938] hover:bg-[#2e3447] text-slate-200 border border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-base">✋</span>
              <span>{isHandRaised ? 'Lower Hand' : 'Raise Hand'}</span>
            </button>

            {/* Be Right Back Button */}
            <button
              onClick={() => {
                onToggleAway();
                setIsOpen(false);
              }}
              className={`w-full py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isAway
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-400'
                  : 'bg-[#242938] hover:bg-[#2e3447] text-slate-200 border border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-base">⌛</span>
              <span>{isAway ? "I'm Back (Clear Away)" : 'Be Right Back'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
