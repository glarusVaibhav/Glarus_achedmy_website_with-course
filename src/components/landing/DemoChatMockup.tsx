"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Bot, User, Code2 } from "lucide-react";

export default function DemoChatMockup() {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, typing?: boolean}[]>([
    { role: 'user', content: "I'm struggling to understand how RAG vector embeddings work in Python." }
  ]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
       setMessages(prev => [...prev, { role: 'ai', content: "I can help with that! RAG (Retrieval-Augmented Generation) uses vectors to find semantically similar text.", typing: true }]);
    }, 1500);

    const timer2 = setTimeout(() => {
       setMessages(prev => {
          const newMsg = [...prev];
          newMsg[1].typing = false;
          newMsg[1].content = "I can help with that! RAG (Retrieval-Augmented Generation) uses vectors to find semantically similar text. Here is a quick conceptual example using a mock embedding matrix:";
          return newMsg;
       });
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="w-full h-full bg-background/50 rounded-2xl border border-card flex flex-col overflow-hidden relative shadow-2xl backdrop-blur-md">
      {/* Chrome header */}
      <div className="h-12 bg-card/60 border-b border-card/60 flex items-center px-4 gap-2">
         <div className="flex gap-1.5">
           <div className="w-3 h-3 rounded-full bg-red-500/50" />
           <div className="w-3 h-3 rounded-full bg-amber-500/50" />
           <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
         </div>
         <span className="text-[10px] font-bold text-subtext uppercase tracking-widest ml-4">EduAI Tutor Session</span>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative">
         {messages.map((msg, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 10, scale: 0.98 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               transition={{ duration: 0.4 }}
               className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                 {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
               </div>
               
               <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'bg-primary/10 text-text rounded-tr-sm border border-primary/20' : 'bg-card border border-card/60 text-text rounded-tl-sm'}`}>
                 {msg.content}
                 {msg.typing && (
                    <span className="inline-flex gap-1 ml-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                 )}
                 {!msg.typing && msg.role === 'ai' && messages.length > 1 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="mt-4 p-4 rounded-xl bg-[#0d1117] border border-white/10 font-mono text-xs text-green-400/90 overflow-x-auto"
                    >
                      <span className="text-purple-400">import</span> numpy <span className="text-purple-400">as</span> np<br/>
                      <br/>
                      # Mock vectors <br/>
                      query = np.array([0.1, 0.3, 0.5])<br/>
                      doc = np.array([0.2, 0.2, 0.6])<br/>
                      <br/>
                      <span className="text-blue-400">def</span> <span className="text-yellow-200">cosine_sim</span>(a, b):<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
                    </motion.div>
                 )}
               </div>
            </motion.div>
         ))}
      </div>
      
      <div className="p-4 border-t border-card/60 bg-card/30">
        <div className="w-full bg-background border border-card rounded-xl h-12 flex items-center px-4 opacity-50">
           <span className="text-sm font-medium text-subtext">Type a technical question...</span>
        </div>
      </div>
    </div>
  )
}
