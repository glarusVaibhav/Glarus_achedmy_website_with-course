"use client";

import { motion } from "framer-motion";

const TRADEMARKS = ["OPENAI", "DEEPMIND", "GOOGLE", "META", "ANTHROPIC", "STRIPE", "VERCEL", "LINEAR", "NETFLIX", "AWS"];

export default function TrustLogos() {
  return (
    <section className="w-full py-6 md:py-8 bg-background overflow-hidden relative select-none">
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div className="flex w-[200%]">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }} 
          transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
          className="flex whitespace-nowrap items-center gap-16 md:gap-32 px-8"
        >
          {TRADEMARKS.map((logo, i) => (
             <div key={i} className="text-2xl md:text-4xl font-black text-text/20 dark:text-subtext/20 tracking-tighter hover:text-text/60 transition-colors duration-500 cursor-default">
               {logo}
             </div>
          ))}
          {/* Duplicated for seamless infinite loop */}
          {TRADEMARKS.map((logo, i) => (
             <div key={i + 'dup'} className="text-2xl md:text-4xl font-black text-text/20 dark:text-subtext/20 tracking-tighter hover:text-text/60 transition-colors duration-500 cursor-default">
               {logo}
             </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
