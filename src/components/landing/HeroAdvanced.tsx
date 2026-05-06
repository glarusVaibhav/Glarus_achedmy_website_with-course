"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

const roles = ["AI Engineer", "ML Expert", "Data Scientist", "GenAI Architect"];

export default function HeroAdvanced() {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect mapping
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentRole = roles[currentRoleIndex];
    if (!isDeleting && displayText.length < currentRole.length) {
      timer = setTimeout(() => {
        setDisplayText(currentRole.substring(0, displayText.length + 1));
      }, 100); // typing speed
    } else if (!isDeleting && displayText.length === currentRole.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2000); // pause before deleting
    } else if (isDeleting && displayText.length > 0) {
      timer = setTimeout(() => {
        setDisplayText(currentRole.substring(0, displayText.length - 1));
      }, 50); // deleting speed
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentRoleIndex]);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 dark:bg-[#0B0F19]">
       {/* Background interactive blobs via Framer Motion */}
       <motion.div 
         animate={{ x: [0, 40, -20, 0], y: [0, -40, 20, 0] }} 
         transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
         className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-purple-600/20 blur-[140px] rounded-full pointer-events-none" 
       />
       <motion.div 
         animate={{ x: [0, -50, 30, 0], y: [0, 50, -40, 0] }} 
         transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
         className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" 
       />

       <div className="relative z-10 max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-card bg-background/50 backdrop-blur-xl shadow-lg mb-8"
          >
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
             </span>
             <span className="text-xs font-bold tracking-widest text-text uppercase">EduAI Platform v2.0 Live</span>
          </motion.div>

          <motion.h1 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="text-5xl sm:text-7xl lg:text-8xl font-black text-text tracking-tighter leading-[1.1] max-w-5xl"
          >
            Become a top-tier
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500 min-h-[1.2em] inline-block mt-2">
               {displayText}
               <span className="animate-pulse text-text font-light -ml-2">|</span>
            </span>
          </motion.h1>

          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             className="text-lg sm:text-xl text-subtext mt-8 max-w-2xl leading-relaxed font-medium"
          >
            Leave traditional learning behind. Build production-grade agents, deploy scalable LLMs, and gain the skills FAANG companies are hiring for today.
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.6 }}
             className="flex flex-col sm:flex-row items-center gap-5 mt-10 w-full justify-center"
          >
            <Link href="/courses" className="w-full sm:w-auto overflow-hidden relative group rounded-full px-8 py-4 bg-text text-background font-black text-lg transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:translate-y-0">
               <span className="relative flex items-center justify-center gap-2 z-10">Start Building <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
               <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-background/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full border border-card bg-background/50 backdrop-blur-md text-text font-bold text-lg hover:bg-card transition-all flex items-center justify-center gap-2 group">
               Watch Demo <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform text-primary" />
            </button>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 1 }}
             className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-card/60 pt-10 px-4"
          >
             <div className="flex flex-col items-center">
               <h4 className="text-4xl font-black text-text">10k+</h4>
               <span className="text-xs font-bold text-subtext uppercase tracking-widest mt-1">Enrolled</span>
             </div>
             <div className="flex flex-col items-center">
               <h4 className="text-4xl font-black text-purple-500">98%</h4>
               <span className="text-xs font-bold text-subtext uppercase tracking-widest mt-1">Placement RatE</span>
             </div>
             <div className="flex flex-col items-center">
               <h4 className="text-4xl font-black text-text">45+</h4>
               <span className="text-xs font-bold text-subtext uppercase tracking-widest mt-1">Masterclasses</span>
             </div>
             <div className="flex flex-col items-center">
               <h4 className="text-4xl font-black text-sky-500">$2M</h4>
               <span className="text-xs font-bold text-subtext uppercase tracking-widest mt-1">Learner GDP Added</span>
             </div>
          </motion.div>
       </div>
    </section>
  )
}
