"use client";

import HeroAdvanced from "@/components/landing/HeroAdvanced";
import TrustLogos from "@/components/landing/TrustLogos";
import InteractiveCourses from "@/components/landing/InteractiveCourses";
import AIFeaturesDeepDive from "@/components/landing/AIFeaturesDeepDive";
import WorkflowTimeline from "@/components/landing/WorkflowTimeline";
import PricingToggle from "@/components/landing/PricingToggle";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-background overflow-hidden relative selection:bg-primary/30">
       <HeroAdvanced />
       <TrustLogos />
       <InteractiveCourses />
       <AIFeaturesDeepDive />
       <WorkflowTimeline />
       
       {/* Testimonials integrated cleanly here before pricing */}
       <section className="w-full py-24 md:py-32 bg-background relative z-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
             <h2 className="text-3xl md:text-5xl font-black text-text mb-16">Thousands of engineers<br/>already upgraded their stack.</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[1,2,3].map((i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1, duration: 0.5 }}
                     className="bg-card p-8 rounded-3xl border border-card shadow-lg flex flex-col text-left group hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                  >
                     <div className="flex text-amber-500 mb-6">
                       {[...Array(5)].map((_,j) => <Star key={j} className="w-5 h-5 fill-current"/>)}
                     </div>
                     <p className="font-medium text-text mb-8 flex-1 leading-relaxed text-lg">"The AI tutor fundamentally changed how I grasp complex embedding algorithms. It's like having a Staff Engineer on call 24/7. My PRs get merged exactly twice as fast now."</p>
                     <div className="flex items-center gap-4 border-t border-card/60 pt-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent opacity-80" />
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

       <PricingToggle />

       {/* Ultimate CTA Footer */}
       <section className="w-full py-32 md:py-48 bg-background relative overflow-hidden flex items-center justify-center border-t border-card">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0" />
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
             <motion.h2 
               initial={{ scale: 0.9, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className="text-6xl md:text-8xl font-black text-text tracking-tighter mb-8 leading-[1.1]"
             >
               Ready to build the <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-emerald-500 inline-block mt-2">Future?</span>
             </motion.h2>
             <p className="text-xl md:text-2xl text-subtext font-medium mb-12 max-w-2xl mx-auto">Join 10,000+ elite engineers mastering generative AI side-by-side with industry architects.</p>
             <Link href="/signup" className="px-12 py-5 bg-text text-background rounded-full font-black text-xl md:text-2xl hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)] group">
                Create Free Account <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform text-background" />
             </Link>
             <p className="text-sm font-bold text-subtext mt-8 px-4 py-2 bg-card border border-card rounded-full inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> No credit card required. 14-day free trial.
             </p>
          </div>
       </section>
    </div>
  );
}
