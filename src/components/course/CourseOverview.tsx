"use client";

import React from "react";
import { 
  Play, 
  BookOpen, 
  Layers, 
  Code2, 
  ArrowRight, 
  Compass
} from "lucide-react";

export interface CourseOverviewProps {
  stats: {
    duration: string;
    lessonsCount: number;
    modulesCount: number;
    projectsCount: number;
  };
  overviewText?: string;
  isLiveCohort?: boolean;
}

export function CourseOverview({
  stats,
  overviewText = "Build job-ready engineering skills through a structured learning experience designed around real-world production projects and verifiable mastery.",
  isLiveCohort = false
}: CourseOverviewProps) {
  const journeySteps = isLiveCohort
    ? [
        { step: "01", title: "Live Cohort Classes", desc: "Attend interactive live masterclasses with lead AI scientists." },
        { step: "02", title: "Hands-on PyTorch Labs", desc: "Implement attention math & custom kernels in Google Colab." },
        { step: "03", title: "Build Capstone Projects", desc: "Engineer 4 production systems with LangGraph & vector databases." },
        { step: "04", title: "Live Code Defenses", desc: "Present deliverables and receive 1-on-1 mentor code reviews." },
        { step: "05", title: "Verified Credential", desc: "Earn your cryptographically verified Glarus Academy certificate." }
      ]
    : [
        { step: "01", title: "Learn Fundamentals", desc: "Master core architectures, tokens, and embedding spaces." },
        { step: "02", title: "Interactive Notebooks", desc: "Write runnable Python pipelines and prompt schemas." },
        { step: "03", title: "Build Real Projects", desc: "Develop 4 full-stack autonomous AI applications." },
        { step: "04", title: "Submit & Review", desc: "Test against test suites with 24/7 AI Tutor support." },
        { step: "05", title: "Earn Certificate", desc: "Unlock a verifiable certificate ready for LinkedIn." }
      ];

  const statItems = [
    { label: "VOD Content", value: stats.duration || "24 Hours", icon: Play, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Curriculum Lessons", value: `${stats.lessonsCount || 36} Lessons`, icon: BookOpen, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { label: "Core Modules", value: `${stats.modulesCount || 4} Modules`, icon: Layers, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { label: "Portfolio Projects", value: `${stats.projectsCount || 4} Projects`, icon: Code2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 pt-2">
      
      {/* ── 1. Compact Section Header & Context ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 font-mono">
            Course Overview & Architecture
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-normal">
          {overviewText}
        </p>
      </div>

      {/* ── 2. Four Compact Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={idx} 
              className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.06] hover:border-purple-500/30 dark:hover:border-white/[0.12] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                  {item.label}
                </span>
                <div className={`p-1.5 rounded-lg ${item.bg} ${item.border} border ${item.color}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Step-by-Step Learning Journey ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.06] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Learning Journey Pathway
            </h4>
          </div>
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.03] px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.06]">
            Structured 5-Stage Roadmap
          </span>
        </div>

        {/* Desktop Step Flow / Mobile Vertical Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 sm:gap-2 pt-1">
          {journeySteps.map((step, idx) => (
            <div 
              key={idx} 
              className="relative p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.04] hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600 dark:from-purple-400 dark:to-sky-400">
                  {step.step}
                </span>
                {idx < 4 && (
                  <ArrowRight className="hidden sm:block w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                )}
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors leading-snug">
                  {step.title}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5 hidden sm:block">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
