import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TemperatureGame() {
  const [temperature, setTemperature] = useState(0.5);

  const getTheme = () => {
    if (temperature < 0.3) return { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]', name: 'Robotic & Predictable', icon: '🤖' };
    if (temperature < 0.7) return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', name: 'Balanced', icon: '🧠' };
    if (temperature < 1.0) return { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]', name: 'Creative', icon: '🎨' };
    return { color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]', name: 'Chaotic & Hallucinating', icon: '🌀' };
  };

  const getExampleText = () => {
    if (temperature < 0.3) return "The quick brown fox jumps over the lazy dog. The weather is nice today.";
    if (temperature < 0.7) return "A nimble fox leaped swiftly over a sleepy hound. The afternoon sun shone brightly.";
    if (temperature < 1.0) return "A sunset-colored fox vaulted majestically across a dreaming dog, chasing stardust.";
    return "Fox quantum-leaps sleepy dogmatic paradigms! Flapjacks cascade through neon nebulas!";
  };

  const theme = getTheme();

  return (
    <div className={`w-full p-6 md:p-8 rounded-2xl border transition-all duration-500 ${theme.border} bg-slate-900/80 ${theme.glow} flex flex-col gap-8 my-8`}>
      <div className="flex flex-col items-center gap-4 w-full">
        <h3 className="text-white font-bold text-xl uppercase tracking-widest">Set AI Temperature</h3>
        
        <input 
          type="range" 
          min="0" 
          max="1.2" 
          step="0.1" 
          value={temperature} 
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full max-w-md h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
        />
        
        <div className="flex justify-between w-full max-w-md text-slate-400 text-sm font-medium">
          <span>0.0 (Robotic)</span>
          <span className="text-white font-bold text-lg">{temperature.toFixed(1)}</span>
          <span>1.2 (Chaotic)</span>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${theme.border} ${theme.bg} transition-colors duration-500 flex flex-col items-center text-center gap-4`}>
        <div className="text-4xl animate-bounce">{theme.icon}</div>
        <h4 className={`text-2xl font-black uppercase tracking-widest ${theme.color}`}>{theme.name}</h4>
        
        <div className="w-full h-px bg-white/10 my-2" />
        
        <p className="text-slate-400 text-sm uppercase tracking-widest mb-2">Prompt: "Write a sentence about a fox"</p>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={temperature}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.3 }}
            className={`text-lg md:text-xl italic font-serif leading-relaxed text-white/90 ${temperature >= 1.0 ? 'animate-pulse' : ''}`}
          >
            "{getExampleText()}"
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
