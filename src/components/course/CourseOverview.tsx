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
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
  },
  {
    step: "02",
    title: "Interactive Notebooks",
    desc: "Write runnable Python pipelines, prompt schemas, and stateful graph orchestrations in browser.",
    icon: Terminal,
    badgeBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
  },
  {
    step: "03",
    title: "Build Real Projects",
    desc: "Develop 4 full-stack autonomous AI applications with CI/CD, vector search, and Docker.",
    icon: Code2,
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
  },
  {
    step: "04",
    title: "Submit & Review",
    desc: "Test against automated test suites and receive instant 24/7 AI Tutor diagnostic feedback.",
    icon: ShieldCheck,
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
  },
  {
    step: "05",
    title: "Earn Certificate",
    desc: "Unlock an official verifiable cryptographic Glarus Academy smart certificate for LinkedIn.",
    icon: Award,
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  }
];

const DEFAULT_LIVE_STEPS = [
  {
    step: "01",
    title: "Live Masterclasses",
    desc: "Attend interactive live masterclasses with lead AI researchers and engineering directors.",
    icon: Cpu,
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
  },
  {
    step: "02",
    title: "PyTorch & Vector Labs",
    desc: "Implement attention math, custom kernels, and hybrid search in mentored live sandboxes.",
    icon: Terminal,
    badgeBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
  },
  {
    step: "03",
    title: "Build Capstone Swarms",
    desc: "Engineer production-scale multi-agent systems with LangGraph, Redis, and streaming.",
    icon: Code2,
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
  },
  {
    step: "04",
    title: "1-on-1 Code Defenses",
    desc: "Defend your architectural decisions in rigorous live code reviews with senior mentors.",
    icon: ShieldCheck,
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
  },
  {
    step: "05",
    title: "Verified Credential",
    desc: "Receive an accredited smart certificate and priority onboarding to partner tech startups.",
    icon: Award,
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
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
            badgeBg: defaultTemplate.badgeBg
          };
        }
        
        return {
          step: item.step || stepNum,
          title: item.title || defaultTemplate.title,
          desc: item.desc || defaultTemplate.desc,
          icon: STEP_ICONS[idx % STEP_ICONS.length],
          badgeBg: defaultTemplate.badgeBg
        };
      });
    }
    return baseSteps;
  }, [learningJourney, baseSteps]);

  const statItems = [
    { 
      label: "Course Duration", 
      value: stats.duration || "36 Hours", 
      sublabel: "Self-Paced Access",
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

      {/* ── 3. High-Impact Interconnected Learning Pathway (Clean & Simplistic) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-card/60 dark:bg-[#0c101d]/80 border border-border/80 dark:border-white/[0.08] backdrop-blur-xl p-5 sm:p-6 space-y-6 shadow-xl">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-20 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-border/50 dark:border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>Learning Journey Pathway</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  Interactive
                </span>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sequential 5-stage roadmap from foundations to verified capstone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>5 Stages Roadmap</span>
          </div>
        </div>

        {/* Simplistic Connected 5-Stage Stepper Flow */}
        <div className="relative z-10">
          
          {/* Connecting Track Line on Desktop */}
          <div className="hidden lg:block absolute top-5 inset-x-12 h-0.5 bg-gradient-to-r from-purple-500/30 via-sky-500/30 to-emerald-500/30 -z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {journeySteps.map((step, idx) => {
              const StepIcon = step.icon || Sparkles;
              return (
                <div 
                  key={idx} 
                  className="group relative p-4 rounded-xl bg-card/40 dark:bg-white/[0.02] hover:bg-card dark:hover:bg-white/[0.05] border border-border/60 dark:border-white/[0.06] hover:border-primary/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Step Top: Step Number Badge & Icon */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-8 h-8 rounded-full bg-background dark:bg-[#12182b] border border-border/80 dark:border-white/[0.12] text-foreground text-xs font-black flex items-center justify-center shadow-xs group-hover:border-primary/60 group-hover:text-primary transition-colors">
                      {step.step}
                    </div>

                    <div className={`p-1.5 rounded-lg border text-xs ${step.badgeBg}`}>
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="space-y-1.5 flex-1">
                    <h5 className="text-xs sm:text-[13px] font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {step.title}
                    </h5>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Micro Accent Indicator */}
                  <div className="w-full h-0.5 rounded-full bg-border/40 dark:bg-white/[0.05] group-hover:bg-primary/60 transition-colors mt-3" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Clean Minimal Footer */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-t border-border/50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Automated milestone validation upon submitting interactive project labs</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>AI Tutor & Automated Grading Included</span>
          </div>
        </div>

      </div>

    </div>
  );
}

