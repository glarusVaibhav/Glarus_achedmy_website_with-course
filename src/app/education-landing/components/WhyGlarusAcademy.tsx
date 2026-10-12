"use client";

import React from "react";
import { 
  CheckCircle, 
  Sparkles, 
  Clock, 
  Code2, 
  Video, 
  Award, 
  TrendingUp, 
  Layers,
  ShieldCheck,
  Zap,
  BookOpen
} from "lucide-react";

export function WhyGlarusAcademy() {
  const benefits = [
    {
      icon: Clock,
      title: "Learn At Your Own Pace",
      description: "Structured bite-sized lessons with timestamped notes and lifetime revision access, letting students and professionals learn on their schedule.",
      badge: "Flexible Access",
      accent: "bg-blue-50 text-blue-600 border-blue-200"
    },
    {
      icon: Zap,
      title: "Interactive Practice & Instant Feedback",
      description: "No passive watching. Execute live code, solve interactive math worksheets, and test knowledge with instant explanation feedback.",
      badge: "Hands-on First",
      accent: "bg-amber-50 text-amber-600 border-amber-200"
    },
    {
      icon: Video,
      title: "Live Cohorts & Expert Mentors",
      description: "Interact directly with verified school teachers, Olympiad trainers, and senior software architects in scheduled live classes.",
      badge: "Live Guidance",
      accent: "bg-rose-50 text-rose-600 border-rose-200"
    },
    {
      icon: Award,
      title: "Real-World Projects & Portfolios",
      description: "From elementary science fair simulations to production-grade AI applications, build demonstrable work that proves your skills.",
      badge: "Verified Proof",
      accent: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      icon: TrendingUp,
      title: "Gamified Study Streaks & Analytics",
      description: "Stay motivated with daily study streaks, XP rewards, milestone completion certificates, and comprehensive parent progress reports.",
      badge: "Proven Motivation",
      accent: "bg-emerald-50 text-emerald-600 border-emerald-200"
    },
    {
      icon: Layers,
      title: "A Lifelong Learning Ecosystem",
      description: "One unified platform that grows with you: from Class 5 arithmetic to university board exams and high-growth professional tech careers.",
      badge: "All-in-One Hub",
      accent: "bg-indigo-50 text-indigo-600 border-indigo-200"
    }
  ];

  return (
    <section className="py-20 bg-slate-50/60 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>The Glarus Advantage</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            More Than Courses. A Better Way to Learn.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            We combine rigorous pedagogical design, hands-on digital tools, and empathetic mentorship to deliver transformational learning experiences.
          </p>
        </div>

        {/* 6 Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl ${b.accent} flex items-center justify-center font-bold border`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                      {b.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {b.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
