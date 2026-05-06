"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LogIn, BookOpen, Terminal, Briefcase } from "lucide-react";

export default function WorkflowTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = [
    { title: "Select a Masterclass", icon: <BookOpen className="w-6 h-6" />, desc: "Enroll in ultra-specific, deep-dive courses ranging from GenAI Architecture to Applied Math." },
    { title: "Train alongside AI", icon: <LogIn className="w-6 h-6" />, desc: "Consume content actively. The built-in AI tutor monitors your progression and adapts difficulty." },
    { title: "Deploy Real Projects", icon: <Terminal className="w-6 h-6" />, desc: "Execute code in our sandboxes. Build vectors, train micro-models, and deploy your own agents." },
    { title: "Elevate your Career", icon: <Briefcase className="w-6 h-6" />, desc: "Generate a verified portfolio representing FAANG-grade knowledge. Fast-track your hiring." }
  ];

  return (
    <section className="w-full py-24 md:py-40 bg-background relative" ref={ref}>
      <div className="max-w-4xl mx-auto px-6">
         <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-text tracking-tight mb-4">How it works</h2>
            <p className="text-lg text-subtext">Four steps to engineering mastery.</p>
         </div>

         <div className="relative">
            {/* The vertical line base */}
            <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1 bg-card rounded-full -translate-x-1/2" />
            
            {/* The animated progressive line */}
            <motion.div 
               className="absolute left-[39px] md:left-1/2 top-0 w-1 bg-gradient-to-b from-primary via-accent to-emerald-500 rounded-full -translate-x-1/2" 
               style={{ height: lineHeight }} 
            />

            <div className="space-y-12 md:space-y-24 relative z-10 pl-24 md:pl-0">
               {steps.map((step, i) => {
                  const isEven = i % 2 === 0;
                  return (
                     <div key={i} className={`flex flex-col md:flex-row items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                        {/* Hidden spacer for desktop balancing */}
                        <div className="hidden md:block w-1/2" />
                        
                        <div className="absolute left-0 md:left-1/2 w-20 h-20 bg-background border-4 border-card rounded-2xl flex items-center justify-center -translate-x-1/2 shadow-xl shrink-0 z-10 transition-colors">
                           <div className="w-14 h-14 bg-card/50 text-subtext rounded-xl flex items-center justify-center">
                             {step.icon}
                           </div>
                        </div>

                        <motion.div 
                           initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                           whileInView={{ opacity: 1, x: 0 }}
                           viewport={{ once: true, margin: "-100px" }}
                           transition={{ duration: 0.6, type: "spring" }}
                           className={`w-full md:w-1/2 md:px-16 pb-4 md:pb-0 ${isEven ? 'text-left' : 'md:text-right text-left'}`}
                        >
                           <h3 className="text-2xl font-black text-text mb-3">{step.title}</h3>
                           <p className="text-subtext leading-relaxed font-medium">{step.desc}</p>
                        </motion.div>
                     </div>
                  )
               })}
            </div>
         </div>
      </div>
    </section>
  )
}
