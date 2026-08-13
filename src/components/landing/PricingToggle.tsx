"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Flame, Zap } from "lucide-react";
import Link from "next/link";

export default function PricingToggle() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="w-full py-6 md:py-8 bg-card/30 relative">
      <div className="max-w-[1650px] mx-auto px-6 sm:px-10 relative z-10 text-center">
         <h2 className="text-4xl md:text-5xl font-black text-text tracking-tight mb-6">Invest in your trajectory</h2>
         <p className="text-lg text-subtext mb-8 max-w-2xl mx-auto">Get unrestricted access to our entire catalog, interactive sandboxes, and personalized AI mentor sessions.</p>

         <div className="flex items-center justify-center mb-8">
            <div className="p-1 bg-background border border-card rounded-full flex relative">
               <div 
                 className={`absolute inset-y-1 w-1/2 bg-card border border-card/60 shadow-md rounded-full transition-all duration-300 ${isAnnual ? 'left-1' : 'left-[calc(50%-4px)]'}`}
               />
               <button 
                 onClick={() => setIsAnnual(true)}
                 className={`relative z-10 px-8 py-3 text-sm font-bold rounded-full transition-colors ${isAnnual ? 'text-text' : 'text-subtext'}`}
               >
                 Annually <span className="text-emerald-500 ml-1">-20%</span>
               </button>
               <button 
                 onClick={() => setIsAnnual(false)}
                 className={`relative z-10 px-8 py-3 text-sm font-bold rounded-full transition-colors ${!isAnnual ? 'text-text' : 'text-subtext'}`}
               >
                 Monthly
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
            {/* Core Plan */}
            <motion.div 
               whileHover={{ y: -5 }}
               className="bg-background border border-card/60 rounded-[2rem] p-8 md:p-12 shadow-xl flex flex-col"
            >
               <h3 className="text-2xl font-black text-text mb-2">Standard Access</h3>
               <p className="text-subtext text-sm font-medium mb-8 border-b border-card/60 pb-8">For individuals looking to upskill.</p>
               
               <div className="mb-8">
                  <span className="text-5xl font-black text-text">₹{isAnnual ? '2,400' : '2,999'}</span>
                  <span className="text-subtext font-bold">/mo</span>
               </div>

               <ul className="space-y-4 mb-10 flex-1">
                  {['Access to all VOD lectures', 'Basic AI Tutor queries (100/mo)', 'Community Forum Access', 'Digital Certificates'].map((f, i) => (
                     <li key={i} className="flex gap-3 text-sm font-semibold text-text items-center">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0" /> {f}
                     </li>
                  ))}
               </ul>

               <Link href="/signup" className="w-full py-4 rounded-xl border-2 border-primary/20 text-primary font-black text-center hover:bg-primary/10 transition-colors block">
                  Get Started
               </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
               whileHover={{ y: -5 }}
               className="bg-gradient-to-b from-primary/10 to-transparent border border-primary/30 rounded-[2rem] p-8 md:p-12 shadow-[0_0_50px_rgba(168,85,247,0.1)] flex flex-col relative overflow-hidden"
            >
               <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
               <div className="absolute top-6 right-6 px-3 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] uppercase tracking-widest font-black rounded-full flex items-center gap-1 shadow-lg shadow-orange-500/30">
                  <Flame className="w-3 h-3" /> Most Popular
               </div>

               <h3 className="text-2xl font-black text-primary mb-2 flex items-center gap-2"><Zap className="w-6 h-6 fill-current"/> Pro Engineering</h3>
               <p className="text-subtext text-sm font-medium mb-8 border-b border-primary/20 pb-8">Everything you need to land FAANG roles.</p>
               
               <div className="mb-8">
                  <span className="text-5xl font-black text-text">₹{isAnnual ? '4,500' : '5,999'}</span>
                  <span className="text-subtext font-bold">/mo</span>
               </div>

               <ul className="space-y-4 mb-10 flex-1">
                  {['Everything in Standard', 'Unlimited Advanced AI Tutor', 'Dedicated Docker Sandboxes', 'Live Class Access', 'Resume & Interview Prep'].map((f, i) => (
                     <li key={i} className="flex gap-3 text-sm font-semibold text-text items-center">
                        <Check className="w-5 h-5 text-primary shrink-0" /> {f}
                     </li>
                  ))}
               </ul>

               <Link href="/signup" className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-black text-center hover:opacity-90 shadow-lg shadow-primary/20 transition-all block">
                  Upgrade to Pro
               </Link>
            </motion.div>
         </div>
      </div>
    </section>
  )
}
