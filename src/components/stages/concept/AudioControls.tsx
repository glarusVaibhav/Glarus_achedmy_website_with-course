import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, AlignLeft, Mic, ChevronDown, Headphones, SkipBack, SkipForward, AudioLines,Bot,StepForward } from "lucide-react";


interface AudioControlsProps {
  isAudioMode: boolean;
  setIsAudioMode: (val: boolean) => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  showTranscript: boolean;
  setShowTranscript: (val: boolean) => void;
  isLoading: boolean;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  skipForward: () => void;
  skipBackward: () => void;
  isAutoContinue: boolean;
  setIsAutoContinue: (val: boolean) => void;
}

export function AudioControls({
  isAudioMode,
  setIsAudioMode,
  isPlaying,
  togglePlayPause,
  playbackRate,
  setPlaybackRate,
  showTranscript,
  setShowTranscript,
  isLoading,
  skipForward,
  skipBackward,
  selectedVoice,
  setSelectedVoice,
  isAutoContinue,
  setIsAutoContinue
}: AudioControlsProps) {
  const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  return (
    <div className="flex items-center gap-2 sm:gap-4 bg-background/80 backdrop-blur border border-white/10 rounded-full py-1.5 px-3 sm:px-4 shadow-xl">
      {/* Audio Mode Toggle */}
      <div className="flex items-center gap-1.5 rounded-full text-xs font-bold transition-all borde">
        <button
          onClick={() => setIsAudioMode(!isAudioMode)}
          className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors duration-200 flex items-center justify-center mr-2 ${isAudioMode
              ? "bg-[#7B61FF]/15 border-[#7B61FF]/50 text-[#7B61FF] shadow-[0_0_18px_rgba(123,97,255,0.35)]"
              : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-[#7B61FF]"
            }`}
          title="Audio Mode"
        >
          <AudioLines className="w-4 h-4" />
        </button>
        {/* <Headphones className="w-5 h-5 text-white/70" /> */}
        {/* <button
          onClick={() => setIsAudioMode(!isAudioMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isAudioMode ? 'bg-primary' : 'bg-white/10'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isAudioMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button> */}
      </div>

      {isAudioMode && (
        <>
          {/* Speed Control */}
          <div className="relative group">
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold transition-all bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
            >
              {rates.map((rate) => (
                <option key={rate} value={rate} className="bg-background text-white">
                  {rate}x
                </option>
              ))}
            </select>
          </div>
          {/* Skip Controls and Play/Pause */}
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={skipBackward}
              disabled={isLoading}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed text-white/30' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlayPause}
              disabled={isLoading}
              className={`flex items-center justify-center px-3 py-1 rounded-full ${isPlaying
                  ? 'bg-primary/20 text-primary'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
                } transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white/90 rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={skipForward}
              disabled={isLoading}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed text-white/30' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </motion.button>
          </div>

          {/* Auto Continue Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAutoContinue(!isAutoContinue)}
            className={`flex items-center gap-2 px-1 py-1 rounded-full transition-all border ${
              isAutoContinue
                ? "bg-[#7B61FF]/15 border-[#7B61FF]/50 shadow-[0_0_18px_rgba(123,97,255,0.35)]"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
            title={isAutoContinue ? "Auto Continue: ON" : "Auto Continue: OFF"}
          >
            {/* Icon */}
            <Bot 
              className={`w-4 h-4 ${
                isAutoContinue ? "text-[#7B61FF]" : "text-white/50"
              }`}
            />

            {/* Toggle */}
            <div
              className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${
                isAutoContinue ? "bg-[#7B61FF]" : "bg-white/20"
              }`}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-md"
                animate={{
                  x: isAutoContinue ? 16 : 0,
                }}
              />
            </div>
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowVoiceMenu(!showVoiceMenu)}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              title="Select Voice"
            >
              <Mic className="w-4 h-4" />

              <span className="text-sm font-medium">
                {selectedVoice}
              </span>

              <ChevronDown
                className={`w-3 h-3 transition-transform ${showVoiceMenu ? "rotate-180" : ""
                  }`}
              />
            </motion.button>

            {showVoiceMenu && (
              <div className="absolute left-full top-0 ml-2 bg-background border border-white/10 rounded-xl shadow-xl p-2 z-50 flex flex-col gap-2">
                {["Aura", "Alex"].map((voice) => (
                  <button
                    key={voice}
                    onClick={() => {
                      setSelectedVoice(voice);
                      setShowVoiceMenu(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                      selectedVoice === voice
                        ? "bg-[#7B61FF]/15 text-[#7B61FF] border-[#7B61FF]/40"
                        : "bg-white/5 text-white/70 hover:bg-white/10 border-white/10"
                    }`}
                  >
                    {voice}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>

  );
}
