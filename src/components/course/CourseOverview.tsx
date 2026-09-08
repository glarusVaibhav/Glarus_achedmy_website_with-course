"use client";

import React from "react";
import { 
  Play, 
  BookOpen, 
  Layers, 
  Code2, 
  ArrowRight, 
  Compass,
  Sparkles,
  Terminal,
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  Cpu
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
  learningJourney?: Array<string | { step?: string; title: string; desc?: string }>;
}

const DEFAULT_SELF_PACED_STEPS = [
  {
    step: "01",
    title: "Learn Fundamentals",
    desc: "Master core architectures, tokens, and embedding spaces with theory & interactive modules.",
    icon: Sparkles,
    glow: "from-purple-500/20 to-indigo-500/5",
    border: "group-hover:border-purple-500/50",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/25"
  },
  {
    step: "02",
    title: "Interactive Notebooks",
    desc: "Write runnable Python pipelines, prompt schemas, and stateful graph orchestrations in browser.",
    icon: Terminal,
    glow: "from-cyan-500/20 to-blue-500/5",
    border: "group-hover:border-cyan-500/50",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
  },
  {
    step: "03",
    title: "Build Real Projects",
    desc: "Develop 4 full-stack autonomous AI applications with CI/CD, vector search, and Docker.",
    icon: Code2,
    glow: "from-indigo-500/20 to-violet-500/5",
    border: "group-hover:border-indigo-500/50",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
  },
  {
    step: "04",
    title: "Submit & Review",
    desc: "Test against automated test suites and receive instant 24/7 AI Tutor diagnostic feedback.",
    icon: ShieldCheck,
    glow: "from-amber-500/20 to-orange-500/5",
    border: "group-hover:border-amber-500/50",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/25"
  },
  {
    step: "05",
    title: "Earn Certificate",
    desc: "Unlock an official verifiable cryptographic Glarus Academy smart certificate for LinkedIn.",
    icon: Award,
    glow: "from-emerald-500/20 to-teal-500/5",
    border: "group-hover:border-emerald-500/50",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
  }
];

const DEFAULT_LIVE_STEPS = [
  {
    step: "01",
    title: "Live Masterclasses",
    desc: "Attend interactive live masterclasses with lead AI researchers and engineering directors.",
    icon: Cpu,
    glow: "from-purple-500/20 to-indigo-500/5",
    border: "group-hover:border-purple-500/50",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/25"
  },
  {
    step: "02",
    title: "PyTorch & Vector Labs",
    desc: "Implement attention math, custom kernels, and hybrid search in mentored live sandboxes.",
    icon: Terminal,
    glow: "from-cyan-500/20 to-blue-500/5",
    border: "group-hover:border-cyan-500/50",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
  },
  {
    step: "03",
    title: "Build Capstone Swarms",
    desc: "Engineer production-scale multi-agent systems with LangGraph, Redis, and streaming.",
    icon: Code2,
    glow: "from-indigo-500/20 to-violet-500/5",
    border: "group-hover:border-indigo-500/50",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
  },
  {
    step: "04",
    title: "1-on-1 Code Defenses",
    desc: "Defend your architectural decisions in rigorous live code reviews with senior mentors.",
    icon: ShieldCheck,
    glow: "from-amber-500/20 to-orange-500/5",
    border: "group-hover:border-amber-500/50",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/25"
  },
  {
    step: "05",
    title: "Verified Credential",
    desc: "Receive an accredited smart certificate and priority onboarding to partner tech startups.",
    icon: Award,
    glow: "from-emerald-500/20 to-teal-500/5",
    border: "group-hover:border-emerald-500/50",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
  }
];

const STEP_ICONS = [Sparkles, Terminal, Code2, ShieldCheck, Award];

export function CourseOverview({
  stats,
  overviewText = "Build job-ready engineering skills through a structured learning experience designed around real-world production projects and verifiable mastery.",
  isLiveCohort = false,
  learningJourney
}: CourseOverviewProps) {
  
  // Resolve roadmap steps dynamically if custom array is provided
  const baseSteps = isLiveCohort ? DEFAULT_LIVE_STEPS : DEFAULT_SELF_PACED_STEPS;
  
  const journeySteps = React.useMemo(() => {
    if (Array.isArray(learningJourney) && learningJourney.length > 0) {
      return learningJourney.slice(0, 5).map((item, idx) => {
        const stepNum = String(idx + 1).padStart(2, "0");
        const defaultTemplate = baseSteps[idx] || baseSteps[0];
        
        if (typeof item === "string") {
          return {
            step: stepNum,
            title: item,
            desc: defaultTemplate.desc,
            icon: STEP_ICONS[idx % STEP_ICONS.length],
            glow: defaultTemplate.glow,
            border: defaultTemplate.border,
            badgeBg: defaultTemplate.badgeBg
          };
        }
        
        return {
          step: item.step || stepNum,
          title: item.title || defaultTemplate.title,
          desc: item.desc || defaultTemplate.desc,
          icon: STEP_ICONS[idx % STEP_ICONS.length],
          glow: defaultTemplate.glow,
          border: defaultTemplate.border,
          badgeBg: defaultTemplate.badgeBg
        };
      });
    }
    return baseSteps;
  }, [learningJourney, baseSteps]);

  const statItems = [
    { 
      label: "VOD Content", 
      value: stats.duration || "36 Hours VOD", 
      sublabel: "On-Demand Access",
      icon: Play, 
      accentColor: "from-purple-500 via-indigo-500 to-purple-600",
      textColor: "text-purple-400",
      iconBg: "bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]",
      cardGlow: "group-hover:border-purple-500/40 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
    },
    { 
      label: "Curriculum Lessons", 
      value: `${stats.lessonsCount || 9} Lessons`, 
      sublabel: "Modular Deep Dives",
      icon: BookOpen, 
      accentColor: "from-cyan-400 via-sky-500 to-blue-600",
      textColor: "text-cyan-400",
      iconBg: "bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]",
      cardGlow: "group-hover:border-cyan-500/40 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
    },
    { 
      label: "Core Modules", 
      value: `${stats.modulesCount || 3} Modules`, 
      sublabel: "Curated Sequence",
      icon: Layers, 
      accentColor: "from-indigo-400 via-purple-500 to-pink-500",
      textColor: "text-indigo-400",
      iconBg: "bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)]",
      cardGlow: "group-hover:border-indigo-500/40 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.15)]"
    },
    { 
      label: "Portfolio Projects", 
      value: `${stats.projectsCount || 4} Projects`, 
      sublabel: "Production Capstones",
      icon: Code2, 
      accentColor: "from-emerald-400 via-teal-500 to-emerald-600",
      textColor: "text-emerald-400",
      iconBg: "bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]",
      cardGlow: "group-hover:border-emerald-500/40 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
    },
  ];

  return (
    <div className="space-y-6 pt-2 select-none">
      
      {/* ── 1. Compact Section Header with Gradient Pill ── */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 font-mono">
            Curriculum Architecture & Roadmap
          </span>
        </div>
        {overviewText && (
          <p className="text-xs sm:text-sm text-subtext leading-relaxed max-w-3xl font-normal">
            {overviewText}
          </p>
        )}
      </div>

      {/* ── 2. Four Futuristic Glowing Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {statItems.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={idx} 
              className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#11162B]/90 via-[#0B0F1C]/95 to-[#080B14] border border-white/[0.08] ${item.cardGlow} transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between shadow-lg shadow-black/40`}
            >
              {/* Subtle Ambient Radial Backlight */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

              {/* Top Row: Label & Icon */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs font-semibold text-subtext group-hover:text-text transition-colors">
                  {item.label}
                </span>
                <div className={`p-2 rounded-xl border backdrop-blur-md transition-transform duration-300 group-hover:scale-110 ${item.iconBg}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              {/* Bottom Row: Big Stat Number + Subtitle */}
              <div className="space-y-1 relative z-10">
                <div className="text-lg sm:text-xl font-black text-text font-mono tracking-tight group-hover:text-white transition-colors">
                  {item.value}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-subtext/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-purple-400 transition-colors" />
                  <span>{item.sublabel}</span>
                </div>
              </div>

              {/* Bottom Accent Gradient Line */}
              <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-purple-500/60 transition-all duration-500" />
            </div>
          );
        })}
      </div>

      {/* ── 3. High-Impact Interconnected Learning Pathway ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0D1224]/95 via-[#0A0E1A]/95 to-[#060810] border border-white/[0.1] shadow-2xl p-5 sm:p-6 space-y-5">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-28 bg-purple-600/15 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-text uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Learning Journey Pathway</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Interactive
                </span>
              </h4>
              <p className="text-[11px] text-subtext mt-0.5">
                Sequential mastery from foundational architecture to verified industry capstone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-[11px] font-bold text-subtext">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Structured 5-Stage Roadmap</span>
            </div>
          </div>
        </div>

        {/* Desktop Step Flow / Mobile Interactive Track */}
        <div className="relative pt-1 z-10">
          
          {/* Subtle connecting track line behind cards on desktop */}
          <div className="hidden lg:block absolute top-[28px] inset-x-8 h-[2px] bg-gradient-to-r from-purple-500/20 via-sky-500/20 to-emerald-500/20 -z-0 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative z-10">
            {journeySteps.map((step, idx) => {
              const StepIcon = step.icon || Sparkles;
              return (
                <div 
                  key={idx} 
                  className={`group relative p-4 rounded-2xl bg-gradient-to-b from-[#141A33]/80 via-[#0E1326]/90 to-[#0A0D1A] border border-white/[0.08] ${step.border} hover:shadow-[0_0_25px_rgba(168,85,247,0.12)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5`}
                >
                  {/* Step Top Header: Step Number Badge + Icon + Connector */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-400 shadow-inner">
                        {step.step}
                      </span>
                      <div className={`p-1.5 rounded-lg border text-xs ${step.badgeBg}`}>
                        <StepIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Arrow between milestones */}
                    {idx < journeySteps.length - 1 && (
                      <ArrowRight className="hidden lg:block w-3.5 h-3.5 text-subtext/40 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="space-y-1.5">
                    <h5 className="text-xs sm:text-[13px] font-black text-text group-hover:text-white transition-colors leading-snug">
                      {step.title}
                    </h5>
                    <p className="text-[11px] text-subtext leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>

                  {/* Hover indicator bottom bar */}
                  <div className="w-full h-1 rounded-full bg-white/[0.05] group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-cyan-400 transition-all duration-500 mt-3" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Footer Note */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-subtext/80 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Automated milestone validation upon submitting interactive project labs</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
            <Zap className="w-3 h-3" />
            <span>AI Tutor & Code Grading Included</span>
          </div>
        </div>

      </div>

    </div>
  );
}

