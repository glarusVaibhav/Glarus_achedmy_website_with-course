"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Star, Clock, Brain } from "lucide-react";
import Link from "next/link";

const COURSES = [
  { id: "1", title: "Advanced LLM Architecture", category: "AI Engineering", difficulty: "Advanced", duration: "18h VOD", gradient: "from-purple-600/20 to-blue-600/20" },
  { id: "2", title: "Next.js 14 App Router Mastery", category: "Web Development", difficulty: "Intermediate", duration: "24h VOD", gradient: "from-sky-500/20 to-indigo-500/20" },
  { id: "3", title: "RAG & Vector Databases", category: "Data Science", difficulty: "Advanced", duration: "12h VOD", gradient: "from-emerald-500/20 to-teal-500/20" },
  { id: "4", title: "Machine Learning Math Foundations", category: "AI", difficulty: "Beginner", duration: "32h VOD", gradient: "from-orange-500/20 to-rose-500/20" },
  { id: "5", title: "Smart Contract Security Testing", category: "Web3", difficulty: "Expert", duration: "15h VOD", gradient: "from-violet-500/20 to-fuchsia-500/20" }
];

export default function InteractiveCourses() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("All");

  const TABS = ["All", "AI Engineering", "Web Development", "Data Science", "Web3"];

  const filtered = activeTab === "All" ? COURSES : COURSES.filter(c => c.category === activeTab);

  return (
    <section className="w-full py-24 md:py-32 relative bg-background overflow-hidden relative z-10" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6 mb-12">
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="flex flex-col md:flex-row md:items-end justify-between gap-8"
         >
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black text-text tracking-tight mb-4">Masterclass <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Curriculums</span></h2>
              <p className="text-xl text-subtext font-medium leading-relaxed">Swipe through our most intensive paths. Guaranteed to elevate your engineering status.</p>
            </div>
            
            <Link href="/courses" className="flex items-center gap-2 text-primary font-bold hover:text-primary/70 transition-colors w-fit border border-primary/20 px-6 py-3 rounded-full hover:bg-primary/5">
               View Full Directory <ArrowRight className="w-5 h-5" />
            </Link>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="mt-12 flex flex-wrap gap-3"
         >
            {TABS.map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                   activeTab === tab 
                     ? "bg-text text-background shadow-lg shadow-text/20 scale-105" 
                     : "bg-card border border-card/40 text-subtext hover:text-text hover:bg-card/80"
                 }`}
               >
                 {tab}
               </button>
            ))}
         </motion.div>
      </div>

      {/* Horizontal Drag Area */}
      <div className="pl-6 md:pl-[max(1.5rem,calc((100vw-80rem)/2))] pb-12 overflow-hidden">
        <motion.div 
          drag="x" 
          dragConstraints={{ right: 0, left: -((filtered.length * 400) - 800) }}
          whileTap={{ cursor: "grabbing" }}
          className="flex gap-6 cursor-grab active:cursor-grabbing pb-8 w-max"
        >
          {filtered.map((course, idx) => (
             <motion.div 
               key={course.id}
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 0.6, delay: idx * 0.1 }}
               whileHover={{ y: -10 }}
               className="w-[300px] md:w-[400px] bg-card rounded-3xl border border-card/60 overflow-hidden shadow-xl flex flex-col group relative"
             >
                {/* Course Thumbnail placeholder */}
                <div className={`h-48 md:h-56 w-full bg-gradient-to-br ${course.gradient} relative overflow-hidden flex items-center justify-center p-6 border-b border-card/60`}>
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                   <Brain className="w-16 h-16 text-text/20 group-hover:scale-110 group-hover:text-text/50 transition-all duration-500" />
                   
                   <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-background/50 backdrop-blur-md rounded-full text-[10px] font-black text-text uppercase tracking-widest border border-white/5">
                        {course.difficulty}
                      </span>
                   </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-1 relative bg-gradient-to-b from-card to-background">
                   <div className="flex items-center justify-between mb-4">
                     <span className="text-xs font-bold text-primary uppercase tracking-widest">{course.category}</span>
                     <div className="flex items-center gap-1 text-xs font-bold text-subtext">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> 4.9
                     </div>
                   </div>
                   
                   <h3 className="text-xl md:text-2xl font-black text-text mb-4 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                   
                   <div className="flex items-center gap-4 text-sm font-semibold text-subtext mt-auto mb-6">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {course.duration}</span>
                   </div>

                   <div className="pt-6 border-t border-card/60 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-background border border-card/60" />
                       <span className="text-xs font-bold text-text">FAANG Expert</span>
                     </div>
                     <button className="w-10 h-10 rounded-full bg-background border border-card flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors group-hover:border-primary">
                        <ArrowRight className="w-4 h-4" />
                     </button>
                   </div>
                </div>
             </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center text-subtext text-sm font-bold hidden md:block opacity-50 flex items-center justify-center gap-2">
        &larr; Drag to explore &rarr;
      </div>
    </section>
  )
}
