"use client";

import { useState, useRef, useEffect } from 'react';
import type { StageComponentProps, AIConversationStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Send, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function getMockResponse(userMessage: string, context?: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('what') || lower.includes('explain')) {
    return `Great question! ${context ? `Based on the context of "${context}", ` : ''}This is an important concept. The key idea is to break it down into smaller parts and understand each one individually. Can you think of a specific example where this applies?`;
  }
  if (lower.includes('why')) {
    return `That's a deep question! The reason lies in the fundamental principles. When we think about it from first principles, we can see that the underlying mechanism works because of how the components interact. What do you think the most critical component is?`;
  }
  if (lower.includes('how')) {
    return `Good thinking! The process involves several steps. First, you need to understand the input. Then, you process it through the core logic. Finally, you produce an output. Would you like to explore any of these steps in detail?`;
  }
  return `Interesting perspective! Let me build on that. ${context ? `In the context of ${context}, ` : ''}your observation highlights an important aspect. Consider how this connects to the broader picture. What other connections do you see?`;
}

export function AIConversationStage({ data, onComplete }: StageComponentProps<AIConversationStageData>) {
  const minTurns = data.minTurns ?? 3;
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: data.systemPrompt ?? `Let's explore the topic of "${data.topic ?? 'this concept'}". What's your initial understanding?` }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userTurns = messages.filter(m => m.role === 'user').length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim() || isTyping) return;
    const userMsg: Message = { role: 'user', content: userInput.trim() };
    setMessages((m) => [...m, userMsg]);
    setUserInput('');
    setIsTyping(true);

    // Try API, fallback to mock
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setMessages((m) => [...m, { role: 'assistant', content: json.reply ?? json.message ?? getMockResponse(userInput, data.context) }]);
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Fallback to mock
      await new Promise((r) => setTimeout(r, 800));
      setMessages((m) => [...m, { role: 'assistant', content: getMockResponse(userInput, data.context) }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 p-4 md:px-8 md:py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
              <Bot className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{data.topic ?? 'AI Conversation'}</h3>
              <span className="text-white/40 text-xs">{userTurns}/{minTurns} exchanges completed</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0 border border-violet-500/30">
                  <Bot className="w-4 h-4 text-violet-300" />
                </div>
              )}
              <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary/20 border border-primary/30 text-white/90'
                  : 'bg-white/5 border border-white/10 text-white/80'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0 border border-violet-500/30">
                <Bot className="w-4 h-4 text-violet-300" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex gap-1">
                <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-center gap-3">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your response..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-violet-500/50 transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!userInput.trim() || isTyping}
          className="px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl transition-all"
        >
          <Send className="w-5 h-5" />
        </motion.button>
        {userTurns >= minTurns && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ correct: true, score: Math.min(100, userTurns * 25) })}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl shadow-[0_0_20px_var(--color-primary)] transition-all"
          >
            Done <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
