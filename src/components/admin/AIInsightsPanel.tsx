"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Insight {
  id: string;
  type: "trend" | "alert" | "info";
  message: string;
}

const mockInsights: Insight[] = [
  { id: "1", type: "trend", message: "Course 'Advanced AI Agents' is trending right now. Sales up 24% this week." },
  { id: "2", type: "alert", message: "Revenue for 'React Masterclass' dropped by 18% over the last 3 days." },
  { id: "3", type: "info", message: "High drop-off rate detected at Lesson 3 of 'Cloud Computing'." },
  { id: "4", type: "alert", message: "Spike in refunds requested yesterday (8 requests)." },
  { id: "5", type: "trend", message: "Instructor 'Jessica Lin' received 20+ 5-star reviews this week." }
];

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInsights(mockInsights);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-card/90 to-background/50 border border-primary/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl h-full flex flex-col">
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shadow-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-text to-subtext bg-clip-text text-transparent">AI Executive Insights</h2>
          <p className="text-xs text-subtext">Real-time heuristics & smart recommendations</p>
        </div>
      </div>

      <div className="space-y-3 relative z-10 flex-1 overflow-y-auto pr-2 scrollbar-hide">
        <AnimatePresence>
          {insights.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center gap-3"
            >
              <Sparkles className="w-7 h-7 text-primary/40 animate-pulse" />
              <p className="text-sm font-bold text-subtext">AI is analyzing platform metrics...</p>
            </motion.div>
          ) : (
            insights.map((insight, idx) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-background/60 border border-card/40 hover:bg-background hover:border-card transition-all duration-300 group shadow-sm"
              >
                <div className={`mt-0.5 w-6 h-6 rounded-md flex flex-shrink-0 items-center justify-center shadow-inner ${
                  insight.type === "trend" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                  insight.type === "alert" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                  "bg-sky-500/10 text-sky-500 border border-sky-500/20"
                }`}>
                  {insight.type === "trend" ? <TrendingUp className="w-3.5 h-3.5" /> :
                   insight.type === "alert" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                   <Info className="w-3.5 h-3.5" />}
                </div>
                <p className="text-sm text-text/90 group-hover:text-text transition-colors leading-relaxed">{insight.message}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
