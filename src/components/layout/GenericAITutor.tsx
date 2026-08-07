"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useProgressStore } from '@/lib/store/progressStore';
import { usePerformanceStore } from '@/lib/store/performanceStore';
import { useSessionStore } from '@/lib/store/sessionStore';
import { useUIStore } from '@/lib/store/uiStore';
import { detectWeakTopics } from '@/lib/engine/DecisionEngine';
import { eventBus } from '@/lib/events/eventBus';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/**
 * GenericAITutor V4 — Context-Aware Adaptive Tutor
 *
 * Upgrades:
 * - Context memory (retains conversation across stages within a lesson)
 * - Weak topic awareness (proactively addresses struggling areas)
 * - Personalized tone based on performance
 * - Progressive hints (escalating detail)
 * - Event-driven auto-trigger
 */
export function GenericAITutor() {
  const course = useProgressStore((s) => s.course);
  const currentLessonIndex = useProgressStore((s) => s.currentLessonIndex);
  const currentStageIndex = useProgressStore((s) => s.currentStageIndex);

  const confusionScore = usePerformanceStore((s) => s.confusionScore);
  const mistakes = usePerformanceStore((s) => s.mistakes);
  const consecutiveErrors = usePerformanceStore((s) => s.consecutiveErrors);
  const lessonPerformances = usePerformanceStore((s) => s.lessonPerformances);

  const currentUserInput = useSessionStore((s) => s.currentUserInput);

  const isOpen = useUIStore((s) => s.isAIOpen);
  const aiMessages = useUIStore((s) => s.aiMessages);
  const autoTriggered = useUIStore((s) => s.autoTriggered);
  const addAIMessage = useUIStore((s) => s.addAIMessage);
  const toggleAI = useUIStore((s) => s.toggleAI);
  const setAIOpen = useUIStore((s) => s.setAIOpen);
  const setAutoTriggered = useUIStore((s) => s.setAutoTriggered);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasAutoTriggeredRef = useRef(false);
  const hintLevel = useRef(0); // Progressive hints: 0=gentle, 1=moderate, 2=direct

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isTyping]);

  // Auto-trigger when the learner is struggling
  useEffect(() => {
    if (hasAutoTriggeredRef.current) return;
    if (confusionScore >= 0.6 || consecutiveErrors >= 3) {
      hasAutoTriggeredRef.current = true;
      setAutoTriggered(true);
      setAIOpen(true);

      const lesson = course?.lessons[currentLessonIndex];
      const stage = lesson?.stages[currentStageIndex];
      const weakTopics = detectWeakTopics(lessonPerformances);

      let contextMsg = `⚠️ I noticed you're having difficulty with **${lesson?.title ?? 'this lesson'}** (confusion: ${Math.round(confusionScore * 100)}%, errors: ${mistakes}).`;

      if (weakTopics.length > 0) {
        contextMsg += `\n\n📊 Your weak areas: ${weakTopics.map((t) => `**${t.lessonId}** (${t.avgScore}%)`).join(', ')}`;
      }

      contextMsg += `\n\nThe current stage is a **${stage?.type ?? 'unknown'}** exercise. Let me help you work through it step by step.`;

      addAIMessage('system', contextMsg);

      eventBus.emit('AI_TUTOR_TRIGGERED', {
        reason: consecutiveErrors >= 3 ? 'auto_errors' : 'auto_confusion',
        confusionScore,
        timestamp: Date.now(),
      });
    }
  }, [confusionScore, consecutiveErrors, course, currentLessonIndex, currentStageIndex, mistakes, lessonPerformances, addAIMessage, setAutoTriggered, setAIOpen]);

  // Reset auto-trigger flag when lesson changes
  useEffect(() => {
    hasAutoTriggeredRef.current = false;
    setAutoTriggered(false);
    hintLevel.current = 0;
  }, [currentLessonIndex, setAutoTriggered]);

  // Determine tone based on performance
  const getTone = useCallback((): string => {
    if (confusionScore >= 0.7) return 'Be extra gentle and encouraging. Use simple language. Break concepts into very small steps.';
    if (confusionScore >= 0.4) return 'Be supportive and patient. Offer structured guidance.';
    if (confusionScore < 0.2 && mistakes === 0) return 'Be conversational and challenge the student with deeper questions.';
    return 'Be helpful and clear.';
  }, [confusionScore, mistakes]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    addAIMessage('user', userMessage);
    setInput('');
    setIsTyping(true);

    const lesson = course?.lessons[currentLessonIndex];
    const stage = lesson?.stages[currentStageIndex];
    const weakTopics = detectWeakTopics(lessonPerformances);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...aiMessages, { role: 'user', content: userMessage }],
          context: {
            courseTitle: course?.title,
            lessonTitle: lesson?.title,
            stageType: stage?.type,
            stageData: stage,
            confusionScore,
            mistakes,
            consecutiveErrors,
            currentUserInput,
            weakTopics: weakTopics.map((t) => t.lessonId),
            tone: getTone(),
            hintLevel: hintLevel.current,
          },
        }),
      });

      const data = await response.json();
      addAIMessage('assistant', data.reply || "I couldn't process that. Try rephrasing your question.");

      // Escalate hint level for next interaction
      hintLevel.current = Math.min(2, hintLevel.current + 1);
    } catch {
      const hint = generateLocalHint(stage?.type, lesson?.title, hintLevel.current);
      addAIMessage('assistant', hint);
      hintLevel.current = Math.min(2, hintLevel.current + 1);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 w-full max-w-md h-screen glass-panel border-l border-white/10 flex flex-col z-50 bg-black/80 backdrop-blur-2xl"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Bot className="text-blue-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Tutor</h3>
            <p className="text-xs text-blue-300 flex items-center gap-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {autoTriggered ? 'AUTO-TRIGGERED' : 'ACTIVE'}
            </p>
          </div>
        </div>
        <button onClick={toggleAI} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {aiMessages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={`max-w-[90%] rounded-2xl p-4 text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-white ml-auto rounded-tr-sm'
                : 'bg-white/5 border border-white/10 text-white/90 mr-auto rounded-tl-sm'
            }`}
          >
            {msg.role !== 'user' && (
              <div className="flex items-center gap-1 mb-1 text-blue-300 font-bold text-[10px] uppercase tracking-widest border-b border-white/10 pb-1.5">
                <Sparkles className="w-3 h-3" /> AI
              </div>
            )}
            <div className="leading-relaxed prose prose-invert prose-sm prose-p:my-1 max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="bg-white/5 border border-white/10 mr-auto rounded-2xl rounded-tl-sm p-3 w-20 flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/40 border-t border-white/10">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this lesson..."
            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 pr-14 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-all text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Progressive local fallback hint generator
function generateLocalHint(stageType?: string, lessonTitle?: string, level = 0): string {
  const hintsByLevel: Record<string, string[]> = {
    concept: [
      `Take your time reading through the concept for **${lessonTitle}**. Focus on the examples.`,
      `Look at the examples carefully — they show the exact pattern you need. Try to identify the key principle.`,
      `The core idea is in the example. Compare the "before" and "after" to see what changed.`,
    ],
    mcq: [
      `For MCQs, try to eliminate clearly wrong answers first.`,
      `Re-read each option carefully. One or two are usually obviously wrong. Focus on the remaining ones.`,
      `Look for keywords in the question that match one specific option. The answer often mirrors the concept's vocabulary.`,
    ],
    code: [
      `When writing code, start by reading the starter code carefully.`,
      `Identify what's missing in the starter code. What does the question ask you to produce?`,
      `Look at the function signature and return type. Write the simplest solution that satisfies the requirement.`,
    ],
    fill_blank: [
      `Think about the exact keyword or term that fits the context.`,
      `Re-read the concept section. The answer is almost always a term you just learned.`,
      `The blank should be a specific technical term. Think about definitions you've seen.`,
    ],
    flashcard: [
      `Flashcards test recall. Before flipping, try to answer in your head first.`,
      `Active recall strengthens memory. Don't flip too quickly — challenge yourself.`,
      `If you can't recall, think about related concepts and work backwards.`,
    ],
  };

  const hints = hintsByLevel[stageType ?? ''];
  if (hints) {
    return hints[Math.min(level, hints.length - 1)];
  }
  return `Let me help you with **${lessonTitle}**. What part is confusing?`;
}
