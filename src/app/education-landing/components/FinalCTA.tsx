"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Star,
  Users
} from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-white via-blue-50/40 to-[#fafaf9] border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Begin Your Learning Journey</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Start Learning Something New Today.
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
          Whether you&apos;re strengthening your Class 5 school foundation or architecting cutting-edge AI software, GlarusAcademy is here for you.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-base font-bold rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all"
          >
            <GraduationCap className="w-5 h-5" />
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>

          <Link
            href="#explore-courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200/90 shadow-2xs transition-all text-base"
          >
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Browse All Courses</span>
          </Link>
        </div>

        {/* Reassurance text */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 pt-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Free Starter Lessons Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Cancel or Switch Courses Anytime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verified Completion Certificates</span>
          </div>
        </div>

      </div>
    </section>
  );
}
