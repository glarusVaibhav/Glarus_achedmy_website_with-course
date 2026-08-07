"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Network, Code2, ArrowRight } from "lucide-react";
import DemoChatMockup from "./DemoChatMockup";

const FEATURES = [
  {
    id: "tutor",
    title: "AI Interactive Tutor",
    icon: <Bot className="w-6 h-6" />,
    description: "Our contextual AI tutor sits alongside your curriculum. It reads the same code you do, understands the exact lecture you are watching, and answers highly technical queries instantly.",
    bg: "from-primary/20",
    color: "text-primary"
  },
  {
    id: "adaptive",
    title: "Adaptive Learn Graph",
    icon: <Network className="w-6 h-6" />,
    description: "The platform builds a personalized mathematical knowledge graph of your skills. If you fail a quiz on Backpropagation, the engine automatically injects remedial math modules into your path.",
    bg: "from-amber-500/20",
    color: "text-amber-500"
  },
  {
    id: "projects",
    title: "Real-World Sandboxes",
    icon: <Code2 className="w-6 h-6" />,
    description: "Don't just watch videos. We provision secure, persistent docker containers for you to write, execute, and test neural networks or full-stack Next.js apps directly in the browser.",
    bg: "from-emerald-500/20",
    color: "text-emerald-500"
  }
];

export default function AIFeaturesDeepDive() {
  const [activeTab, setActiveTab] = useState(FEATURES[0].id);

  return (
    <section className="w-full py-6 md:py-8 bg-background text-text relative overflow-hidden">
       <div className="max-w-[1650px] mx-auto px-6 sm:px-10 relative z-10">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="text-center max-w-3xl mx-auto mb-6"
          >
             <h2 className="text-4xl md:text-5xl font-black text-text tracking-tight mb-6">Built using the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Technologies</span> we Teach</h2>
             <p className="text-lg md:text-xl font-medium text-subtext">The GlarusAcademy engine is fundamentally different. It adapts, it tutors, and it provides a 1-to-1 mentorship experience at massive scale.</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 h-auto lg:h-[600px] items-center">
             
             {/* Left side tabs */}
             <div className="w-full lg:w-[45%] flex flex-col gap-4">
                {FEATURES.map((feature, i) => {
                   const isActive = activeTab === feature.id;
                   return (
                     <motion.div 
                        key={feature.id}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        onClick={() => setActiveTab(feature.id)}
                        className={`p-6 rounded-3xl cursor-pointer border transition-all duration-500 ${
                           isActive 
                              ? `bg-background border-card shadow-2xl scale-105` 
                              : `bg-transparent border-transparent hover:bg-card/40 hover:border-card/20`
                        }`}
                     >
                        <div className="flex gap-5 items-start">
                           <div className={`p-4 rounded-2xl flex items-center justify-center ${isActive ? `bg-gradient-to-br ${feature.bg} to-transparent border border-card shadow-inner` : 'bg-card'}`}>
                              <span className={isActive ? feature.color : 'text-subtext'}>{feature.icon}</span>
                           </div>
                           <div className="flex-1 pt-1">
                              <h3 className={`text-xl font-black transition-colors ${isActive ? 'text-text' : 'text-subtext'}`}>{feature.title}</h3>
                              <AnimatePresence>
                                {isActive && (
                                   <motion.p 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto', marginTop: '12px' }}
                                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                      className="text-subtext font-medium leading-relaxed text-sm"
                                   >
                                      {feature.description}
                                   </motion.p>
                                )}
                              </AnimatePresence>
                           </div>
                        </div>
                     </motion.div>
                   )
                })}
             </div>

             {/* Right side visualizer */}
             <div className="w-full lg:w-[55%] h-[500px] lg:h-full relative flex items-center justify-center perspective-1000">
                <AnimatePresence mode="wait">
                   {activeTab === 'tutor' && (
                      <motion.div 
                        key="tutor"
                        initial={{ opacity: 0, rotateY: 15, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, rotateY: -5, scale: 1, x: 0 }}
                        exit={{ opacity: 0, rotateY: -15, scale: 0.9, x: -20 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="w-full h-full p-2"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                         <DemoChatMockup />
                      </motion.div>
                   )}

                   {activeTab === 'adaptive' && (
                      <motion.div 
                        key="adaptive"
                        initial={{ opacity: 0, rotateY: 15, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, rotateY: -5, scale: 1, x: 0 }}
                        exit={{ opacity: 0, rotateY: -15, scale: 0.9, x: -20 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="w-full h-full bg-background/50 rounded-2xl border border-card flex flex-col items-center justify-center shadow-2xl backdrop-blur-md relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                         <motion.div 
                           animate={{ rotate: 360 }} 
                           transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                           className="w-64 h-64 border border-amber-500/20 rounded-full flex items-center justify-center relative"
                         >
                            <div className="w-48 h-48 border border-amber-500/40 rounded-full absolute" />
                            <div className="w-32 h-32 border border-amber-500/60 rounded-full absolute bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.2)] flex items-center justify-center">
                               <Network className="w-8 h-8 text-amber-500" />
                            </div>
                            
                            {/* Orbital nodes */}
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -top-4 left-1/2 w-8 h-8 bg-card border border-amber-500/50 rounded-full flex items-center justify-center text-[10px] text-text font-bold">ML</motion.div>
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -bottom-4 right-1/4 w-8 h-8 bg-card border border-amber-500/50 rounded-full flex items-center justify-center text-[10px] text-text font-bold">DL</motion.div>
                         </motion.div>
                      </motion.div>
                   )}

                   {activeTab === 'projects' && (
                      <motion.div 
                        key="projects"
                        initial={{ opacity: 0, rotateY: 15, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, rotateY: -5, scale: 1, x: 0 }}
                        exit={{ opacity: 0, rotateY: -15, scale: 0.9, x: -20 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="w-full h-full bg-[#0d1117] rounded-2xl border border-card flex flex-col shadow-2xl overflow-hidden"
                      >
                         <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center px-4 gap-2">
                            <span className="text-xs text-[#8b949e] font-mono border-r border-[#30363d] pr-4">sandbox_env_01</span>
                            <span className="text-xs text-[#58a6ff] font-mono px-2">app.py</span>
                         </div>
                         <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden relative">
                           <span className="text-[#8b949e]">1</span> <span className="text-[#ff7b72]">from</span> fastapi <span className="text-[#ff7b72]">import</span> FastAPI<br/>
                           <span className="text-[#8b949e]">2</span> <span className="text-[#ff7b72]">import</span> torch<br/>
                           <span className="text-[#8b949e]">3</span> <br/>
                           <span className="text-[#8b949e]">4</span> app = FastAPI()<br/>
                           <span className="text-[#8b949e]">5</span> model = torch.load(<span className="text-[#a5d6ff]">'model.pt'</span>)<br/>
                           <span className="text-[#8b949e]">6</span> <br/>
                           <span className="text-[#8b949e]">7</span> <span className="text-[#d2a8ff]">@app.post</span>(<span className="text-[#a5d6ff]">"/predict"</span>)<br/>
                           <span className="text-[#8b949e]">8</span> <span className="text-[#ff7b72]">def</span> <span className="text-[#d2a8ff]">predict</span>(x: <span className="text-[#a5d6ff]">list</span>):<br/>
                           <span className="text-[#8b949e]">9</span> &nbsp;&nbsp;&nbsp;&nbsp;tensor = torch.tensor(x)<br/>
                           <span className="text-[#8b949e]">10</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#ff7b72]">return</span> &#123;<span className="text-[#a5d6ff]">"out"</span>: model(tensor).tolist()&#125;
                           
                           <motion.div 
                              initial={{ bottom: '-100%' }}
                              animate={{ bottom: 0 }}
                              transition={{ duration: 0.5, delay: 1 }}
                              className="absolute bottom-0 left-0 right-0 h-32 bg-[#000000] border-t border-[#30363d] p-4 text-[#3fb950] font-mono text-xs"
                           >
                              $ uvicorn app:app --reload<br/>
                              INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)<br/>
                              INFO:     Started server process [29451]
                           </motion.div>
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>

          </div>
       </div>
    </section>
  )
}
