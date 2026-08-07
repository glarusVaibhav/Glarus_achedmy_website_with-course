"use client";

import HeroAdvanced from "@/components/landing/HeroAdvanced";
import InteractiveCourses from "@/components/landing/InteractiveCourses";
import AIFeaturesDeepDive from "@/components/landing/AIFeaturesDeepDive";
import WorkflowTimeline from "@/components/landing/WorkflowTimeline";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-background text-text overflow-hidden relative selection:bg-purple-500/30">
       <HeroAdvanced />
       <InteractiveCourses />
       <AIFeaturesDeepDive />
       <WorkflowTimeline />
       
       {/* Testimonials integrated cleanly here before footer */}
       <section className="w-full py-6 md:py-8 bg-background text-text relative z-10">
          <div className="max-w-[1650px] mx-auto px-6 sm:px-10 text-center">
             <h2 className="text-3xl md:text-5xl font-black text-text mb-8">Thousands of engineers<br/>already upgraded their stack.</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[1,2,3].map((i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1, duration: 0.5 }}
                     className="bg-card p-8 rounded-3xl border border-border shadow-lg flex flex-col text-left group hover:border-primary/50 transition-all"
                  >
                     <div className="flex text-amber-500 mb-6">
                       {[...Array(5)].map((_,j) => <Star key={j} className="w-5 h-5 fill-current"/>)}
                     </div>
                     <p className="font-medium text-subtext mb-8 flex-1 leading-relaxed text-lg">&quot;The AI tutor fundamentally changed how I grasp complex embedding algorithms. It&apos;s like having a Staff Engineer on call 24/7. My PRs get merged exactly twice as fast now.&quot;</p>
                     <div className="flex items-center gap-4 border-t border-border/40 pt-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 opacity-80" />
                        <div>
                           <p className="text-sm font-black text-text">Reviewer {i}</p>
                           <p className="text-xs font-bold text-subtext uppercase tracking-widest mt-0.5">Senior SWE</p>
                        </div>
                     </div>
                  </motion.div>
               ))}
             </div>
          </div>
       </section>

       {/* Course Discovery Call to Action Section */}
       <section className="w-full py-20 md:py-28 bg-background text-text relative overflow-hidden flex items-center justify-center">
          {/* Ambient Lighting Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-purple-600/15 blur-[160px] rounded-full pointer-events-none z-0" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none z-0" />

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
             <motion.span
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-widest inline-block mb-6"
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
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 dark:from-purple-400 dark:via-indigo-300 dark:to-cyan-400 inline-block mt-1">
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
               Explore our complete catalog of live cohorts and self-paced curriculums designed by FAANG AI architects to help you build hirable portfolio projects.
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
                  className="px-10 py-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-black text-lg md:text-xl hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_40px_rgba(147,51,234,0.4)] group"
                >
                   Explore All Courses <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-white" />
                </Link>

                <Link 
                  href="/courses?type=live" 
                  className="px-8 py-5 bg-slate-100 hover:bg-slate-200 dark:bg-[#0c0922]/90 dark:hover:bg-purple-900/30 text-slate-900 dark:text-white border border-slate-300 dark:border-purple-500/40 rounded-full font-bold text-lg hover:border-purple-400/70 transition-all backdrop-blur-xl flex items-center gap-2.5 shadow-sm"
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
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" /> 100% Industry-Aligned Projects
                </span>
                <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" /> Guaranteed Internship Eligibility*
                </span>
                <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400" /> 1-on-1 Code &amp; Portfolio Reviews
                </span>
             </motion.div>
          </div>
       </section>
    </div>
  );
}
