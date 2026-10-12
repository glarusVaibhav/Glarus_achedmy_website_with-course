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
  Play, 
  Compass, 
  Code2, 
  Calculator, 
  Atom, 
  Award,
  TrendingUp
} from "lucide-react";

export function EducationHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fafaf9] via-white to-slate-50/50 pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-slate-100">
      {/* Soft Ambient Light Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Editorial Hero Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 lg:pr-4">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>LEARNING FOR EVERY STAGE OF LIFE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              From <span className="text-amber-500 underline decoration-amber-300 decoration-wavy decoration-2">Class 5</span> to Your{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Dream Career.
              </span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
              Explore engaging school subjects, practical coding skills, and career-ready programs. Whether you&apos;re building your first science foundation or engineering autonomous AI systems, GlarusAcademy guides every step of your journey.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="#explore-courses"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all"
              >
                <BookOpen className="w-5 h-5" />
                <span>Explore All Courses</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>

              <Link
                href="#learning-paths"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200/90 active:scale-98 rounded-2xl shadow-xs transition-all"
              >
                <Compass className="w-5 h-5 text-indigo-500" />
                <span>View Learning Paths</span>
              </Link>
            </div>

            {/* Trust Badges & Social Proof */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-slate-600">
              {/* Rating & Review */}
              <div className="flex items-center gap-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  <span className="font-extrabold text-slate-900">4.94 / 5</span> from 12,000+ Students & Parents
                </div>
              </div>

              {/* Verified School & Professional Guarantee */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>CBSE / ICSE Aligned & Industry Ready</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Bright Editorial Learning Scene Composition */}
          <div className="lg:col-span-5 relative">
            
            {/* Background Decorative Card Surface */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Tablet Learning Surface */}
              <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-slate-200/90 space-y-5">
                
                {/* Header of the Learning Card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Today&apos;s Learning Space</div>
                      <div className="text-[11px] text-slate-400">Class 5 to Professional Tracks</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Learning
                  </span>
                </div>

                {/* Interactive Multi-Grade Discovery Pills */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Card 1: School Math (Class 5–8) */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 hover:bg-amber-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/50 px-2 py-0.5 rounded-md">Grade 5–8</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">Visual Mathematics</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Fractions, Geometry & Logic</div>
                  </div>

                  {/* Card 2: Coding & Python */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-200/50 px-2 py-0.5 rounded-md">Practical</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">Python & Scratch</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Games, Logic & Web Apps</div>
                  </div>

                  {/* Card 3: Board Exam Science */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                        <Atom className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/50 px-2 py-0.5 rounded-md">Class 10 & 12</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">Science & Physics</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Theorems, PYQs & Proofs</div>
                  </div>

                  {/* Card 4: AI & Future Tech */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/60 hover:bg-purple-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-200/50 px-2 py-0.5 rounded-md">Career Lab</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">Generative AI & Data</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Autonomous Agents & RAG</div>
                  </div>

                </div>

                {/* Bottom Progress Bar Preview */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      Student Study Streak: 14 Days
                    </span>
                    <span className="text-blue-600 font-extrabold">+20% Bonus XP</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[78%] h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Active Topic: Quadratic Equations</span>
                    <span className="font-semibold text-slate-700">78% Mastery</span>
                  </div>
                </div>

              </div>

              {/* Floating Verified Badge 1 */}
              <div className="absolute -top-4 -left-6 bg-white py-2.5 px-4 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-3 animate-bounce duration-1000 hidden sm:flex">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">All Ages Welcome</div>
                  <div className="text-[10px] text-slate-400">Class 5 → Working Professionals</div>
                </div>
              </div>

              {/* Floating Live Mentor Pill 2 */}
              <div className="absolute -bottom-4 -right-4 bg-white py-2.5 px-4 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-3 hidden sm:flex">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-blue-600 text-blue-600 ml-0.5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Live Doubt Clearing</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">1-on-1 Mentor Guidance</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
