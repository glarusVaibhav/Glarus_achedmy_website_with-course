"use client";

import HeroAdvanced from "@/components/landing/HeroAdvanced";
import InteractiveCourses from "@/components/landing/InteractiveCourses";
import WorkflowTimeline from "@/components/landing/WorkflowTimeline";
import InstructorRecruitment from "@/components/landing/InstructorRecruitment";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-background text-text overflow-hidden relative selection:bg-purple-500/30">
       <HeroAdvanced />
       <InteractiveCourses />
       <WorkflowTimeline />
       
        {/* ── Seamless Unified Discovery & Instructor Experience ── */}
        <section className="w-full relative bg-background text-text">
           {/* Unified Continuous Ambient Lighting Layer */}
           <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-purple-600/[0.09] blur-[160px] rounded-full pointer-events-none z-0" />
           <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] bg-purple-600/[0.08] blur-[180px] rounded-full pointer-events-none z-0" />
           <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-indigo-600/[0.05] blur-[160px] rounded-full pointer-events-none z-0" />

           {/* Course Discovery Call to Action */}
           <div className="w-full pt-6 pb-12 md:pt-8 md:pb-16 lg:pb-20 flex items-center justify-center relative z-10">
              <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
                 <motion.span
                   initial={{ opacity: 0, y: 15 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5 }}
                   className="px-4 py-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-widest inline-block mb-6"
                 >
                    🚀 ELEVATE YOUR AI ENGINEERING STATUS
                 </motion.span>

                 <motion.h2 
                   initial={{ scale: 0.94, opacity: 0 }}
                   whileInView={{ scale: 1, opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6 }}
                   className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.1]"
                 >
                   Ready to Master Production <br/> 
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 dark:from-purple-400 dark:via-violet-300 dark:to-indigo-400 inline-block mt-1">
                     AI Engineering?
                   </span>
                 </motion.h2>

                 <motion.p 
                   initial={{ opacity: 0, y: 15 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: 0.1 }}
                   className="text-lg md:text-xl text-slate-700 dark:text-slate-300 font-medium mb-10 max-w-2xl mx-auto leading-relaxed"
                 >
                   Explore our complete catalog of live classes and self-paced curriculums designed by FAANG AI architects to help you build hirable portfolio projects.
                 </motion.p>

                 {/* Action Buttons Redirecting to Course Catalog */}
                 <motion.div 
                   initial={{ opacity: 0, y: 15 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: 0.2 }}
                   className="flex flex-wrap items-center justify-center gap-4 mb-10"
                 >
                    <Link 
                      href="/courses" 
                      className="px-10 py-5 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-500 hover:via-violet-500 hover:to-purple-600 text-white rounded-full font-black text-lg md:text-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 shadow-[0_0_36px_rgba(124,58,237,0.35)] hover:shadow-[0_0_48px_rgba(124,58,237,0.55)] group"
                    >
                       Explore All Courses <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-white" />
                    </Link>

                    <Link 
                      href="/courses?type=live" 
                      className="px-8 py-5 bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1022]/85 dark:hover:bg-purple-950/40 text-slate-900 dark:text-white border border-slate-300 dark:border-purple-500/30 rounded-full font-bold text-lg hover:border-purple-400/60 transition-all backdrop-blur-xl flex items-center gap-2.5 shadow-sm"
                    >
                       View Live Batches 📅
                    </Link>
                 </motion.div>

                 {/* Trust Chips */}
                 <motion.div 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: 0.3 }}
                   className="flex flex-wrap items-center justify-center gap-6 text-xs font-extrabold text-slate-600 dark:text-slate-400"
                 >
                    <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" /> 100% Industry-Aligned Projects
                    </span>
                    <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <span className="w-2 h-2 rounded-full bg-violet-400" /> Guaranteed Internship Eligibility*
                    </span>
                    <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <span className="w-2 h-2 rounded-full bg-fuchsia-400" /> 1-on-1 Code &amp; Portfolio Reviews
                    </span>
                 </motion.div>
              </div>
           </div>

           {/* Instructor Recruitment */}
           <InstructorRecruitment />
        </section>
    </div>
  );
}
