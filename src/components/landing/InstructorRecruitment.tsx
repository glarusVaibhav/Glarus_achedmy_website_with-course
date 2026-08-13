"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Play,
  Users,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Award,
  Coins,
  TrendingUp,
  Sparkles,
} from "lucide-react";

/* ─────────────── SVG Decorative Underline ─────────────── */
function DecorativeUnderline() {
  return (
    <svg
      viewBox="0 0 280 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute -bottom-3 left-0 w-full h-auto pointer-events-none"
      aria-hidden="true"
    >
      <motion.path
        d="M2 12C30 4 70 2 100 6C130 10 160 14 200 10C230 7 260 4 278 8"
        stroke="url(#underline-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
      <defs>
        <linearGradient id="underline-grad" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9333EA" />
          <stop offset="0.5" stopColor="#C084FC" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─────────────── Orbital Decorative Lines (SVG) ─────────────── */
function OrbitalLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.25]"
      viewBox="0 0 800 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <ellipse cx="400" cy="380" rx="320" ry="200" stroke="url(#orbital-g1)" strokeWidth="0.8" opacity="0.6" />
      <ellipse cx="420" cy="360" rx="250" ry="160" stroke="url(#orbital-g2)" strokeWidth="0.6" opacity="0.4" />
      <ellipse cx="380" cy="400" rx="380" ry="240" stroke="url(#orbital-g1)" strokeWidth="0.5" opacity="0.3" />

      <circle cx="150" cy="250" r="3" fill="#A855F7" opacity="0.8" />
      <circle cx="650" cy="180" r="2.5" fill="#7C3AED" opacity="0.7" />
      <circle cx="500" cy="550" r="2" fill="#C084FC" opacity="0.6" />
      <circle cx="250" cy="480" r="2.5" fill="#6D28D9" opacity="0.5" />

      <line x1="150" y1="250" x2="400" y2="350" stroke="#A855F7" strokeWidth="0.3" opacity="0.3" />
      <line x1="650" y1="180" x2="400" y2="350" stroke="#7C3AED" strokeWidth="0.3" opacity="0.25" />

      <defs>
        <linearGradient id="orbital-g1" x1="80" y1="200" x2="720" y2="500" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" stopOpacity="0.6" />
          <stop offset="1" stopColor="#A855F7" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="orbital-g2" x1="200" y1="180" x2="640" y2="480" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D28D9" stopOpacity="0.4" />
          <stop offset="1" stopColor="#A855F7" stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─────────────── Interactive Code Panel with Smooth Tabs ─────────────── */
function CodePanel() {
  const [activeTab, setActiveTab] = useState("Python");

  const snippets: Record<string, { lines: { num: number; code: React.ReactNode }[] }> = {
    Python: {
      lines: [
        { num: 1, code: <><span className="text-purple-300">def</span> <span className="text-yellow-300">build_agent</span>():</> },
        { num: 2, code: <><span className="text-purple-300">    return</span> <span className="text-cyan-300">LangGraph</span>(</> },
        { num: 3, code: <>        <span className="text-orange-300">tools</span>=<span className="text-cyan-300">tools</span>,</> },
        { num: 4, code: <>        <span className="text-orange-300">memory</span>=<span className="text-cyan-300">memory</span></> },
        { num: 5, code: <>    )</> },
      ],
    },
    AI: {
      lines: [
        { num: 1, code: <><span className="text-purple-300">model</span> = <span className="text-cyan-300">ChatGroq</span>(</> },
        { num: 2, code: <>    <span className="text-orange-300">model</span>=<span className="text-emerald-300">&quot;llama-3.3-70b&quot;</span>,</> },
        { num: 3, code: <>    <span className="text-orange-300">temperature</span>=<span className="text-amber-300">0.2</span>,</> },
        { num: 4, code: <>    <span className="text-orange-300">streaming</span>=<span className="text-purple-300">True</span></> },
        { num: 5, code: <>)</> },
      ],
    },
    LangGraph: {
      lines: [
        { num: 1, code: <><span className="text-purple-300">builder</span> = <span className="text-cyan-300">StateGraph</span>(State)</> },
        { num: 2, code: <>builder.<span className="text-yellow-300">add_node</span>(<span className="text-emerald-300">&quot;agent&quot;</span>, run)</> },
        { num: 3, code: <>builder.<span className="text-yellow-300">add_edge</span>(START, <span className="text-emerald-300">&quot;agent&quot;</span>)</> },
        { num: 4, code: <>graph = builder.<span className="text-yellow-300">compile</span>()</> },
        { num: 5, code: <><span className="text-purple-300">return</span> graph</> },
      ],
    },
    RAG: {
      lines: [
        { num: 1, code: <><span className="text-purple-300">retriever</span> = db.<span className="text-yellow-300">as_retriever</span>(</> },
        { num: 2, code: <>    <span className="text-orange-300">search_kwargs</span>=&#123;<span className="text-emerald-300">&quot;k&quot;</span>: <span className="text-amber-300">5</span>&#125;</> },
        { num: 3, code: <>)</> },
        { num: 4, code: <><span className="text-purple-300">chain</span> = prompt | llm | parser</> },
        { num: 5, code: <>result = chain.<span className="text-yellow-300">invoke</span>(q)</> },
      ],
    },
  };

  const tabs = ["Python", "AI", "LangGraph", "RAG"];

  return (
    <div className="animate-float-1 w-[270px] sm:w-[290px] select-none">
      <div
        className="
          bg-[#0d1022]/90 backdrop-blur-xl
          border border-purple-500/25 rounded-2xl
          shadow-[0_12px_40px_rgba(124,58,237,0.18)]
          overflow-hidden
          transition-all duration-300 hover:border-purple-400/50 hover:shadow-[0_16px_48px_rgba(124,58,237,0.28)]
        "
      >
        {/* Code Tabs */}
        <div className="flex border-b border-purple-500/20 bg-purple-950/25">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  relative px-3 py-2 text-[11px] font-semibold tracking-wide transition-colors duration-200
                  ${isActive ? "text-white" : "text-slate-400 hover:text-slate-200"}
                `}
              >
                {tab}
                {isActive && (
                  <motion.div
                    layoutId="activeCodeTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Code Snippet */}
        <div className="p-3.5 font-mono text-[11.5px] leading-[1.7] min-h-[125px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              {snippets[activeTab]?.lines.map((line) => (
                <div key={line.num} className="flex">
                  <span className="text-slate-600 mr-3.5 w-3 text-right select-none text-[10.5px]">
                    {line.num}
                  </span>
                  <span className="text-slate-200 font-mono tracking-tight">
                    {line.code}
                  </span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT WITH GPU-ACCELERATED SILKY ANIMATIONS
   ═══════════════════════════════════════════════════════ */
export default function InstructorRecruitment() {
  const benefits = [
    {
      icon: Users,
      title: "Teach Ambitious Learners",
      desc: "Reach students eager\nto learn real skills",
    },
    {
      icon: Award,
      title: "Build Your Reputation",
      desc: "Grow your professional\ninstructor profile",
    },
    {
      icon: Coins,
      title: "Earn From Your Expertise",
      desc: "Get compensated for\neligible teaching opportunities",
    },
  ];

  return (
    <section
      id="instructor-recruitment"
      className="w-full relative py-6 md:py-10"
      aria-label="Become an instructor at Glarus Academy"
    >
      {/* ── Main Container Wrapped in Spotlight Card ── */}
      <div className="max-w-[1650px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="relative rounded-[36px] sm:rounded-[44px] bg-gradient-to-b from-[#160e2e]/90 via-[#100a22]/95 to-[#090615] border border-purple-500/30 shadow-[0_24px_90px_rgba(124,58,237,0.22)] p-6 sm:p-10 md:p-12 lg:p-14 overflow-hidden backdrop-blur-2xl">
          
          {/* Radiant Top Light Streak */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-90" />
          
          {/* Deep Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-8 relative z-10">

            {/* ════════════ LEFT COLUMN ════════════ */}
            <div className="w-full lg:w-[46%] flex flex-col items-start text-left">

              {/* Eyebrow Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/[0.08] dark:bg-purple-500/[0.08] mb-8 select-none transition-all duration-300 hover:border-purple-400/50 hover:bg-purple-500/15"
              >
                <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-purple-700 dark:text-purple-300">
                  Join the Instructor Network
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl md:text-[56px] lg:text-[58px] font-black text-slate-900 dark:text-white leading-[1.08] tracking-tight mb-5"
              >
                Your expertise{" "}
                <br className="hidden sm:block" />
                deserves an{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-400 dark:via-violet-400 dark:to-purple-400">
                    audience.
                  </span>
                  <DecorativeUnderline />
                </span>
              </motion.h2>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white/90 mb-5 tracking-tight flex items-center gap-2"
              >
                Create. Teach. Inspire. Earn.
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 inline opacity-90" />
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="text-[16px] sm:text-[17px] text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-md font-normal"
              >
                Share your real-world knowledge with ambitious learners.
                Build your instructor presence and get compensated for
                the expertise you bring.
              </motion.p>

              {/* CTA Row */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-5 mb-10"
              >
                <Link
                  href="/signup?role=instructor"
                  id="cta-become-instructor"
                  className="group relative inline-flex items-center gap-2.5 px-7 py-4 rounded-full
                    bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700
                    hover:from-purple-500 hover:via-violet-500 hover:to-purple-600
                    text-white font-bold text-[15px]
                    shadow-[0_0_36px_rgba(124,58,237,0.35)]
                    hover:shadow-[0_0_48px_rgba(124,58,237,0.55)]
                    hover:-translate-y-0.5 active:translate-y-0
                    transition-all duration-300 ease-out overflow-hidden"
                >
                  Become an Instructor
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 ease-out" />
                </Link>

                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Already an instructor?{" "}
                  <Link
                    href="/login"
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold inline-flex items-center gap-1 transition-colors duration-200 group/link"
                  >
                    Sign in{" "}
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </motion.div>

              {/* Benefits Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full"
              >
                {benefits.map((b) => (
                  <div
                    key={b.title}
                    className="flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] dark:bg-purple-950/25 border border-purple-500/15 hover:border-purple-400/40 hover:bg-purple-950/40 group cursor-default transition-all duration-300 hover:-translate-y-1 shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 dark:bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-300">
                      <b.icon className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-200">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                      {b.desc}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ════════════ RIGHT COLUMN ════════════ */}
            <div className="w-full lg:w-[54%] relative min-h-[480px] sm:min-h-[580px] lg:min-h-[640px] flex items-end justify-center">

              {/* Orbital decorative lines */}
              <OrbitalLines />

              {/* Atmospheric purple glow behind teacher */}
              <div
                className="animate-pulse-glow absolute top-1/2 left-1/2 w-[440px] h-[440px] bg-purple-500/15 dark:bg-purple-600 blur-[100px] dark:blur-[120px] rounded-full pointer-events-none"
              />

              {/* ── Code Panel (upper-right) ── */}
              <div className="absolute top-0 right-0 sm:right-2 lg:right-0 z-20 hidden sm:block">
                <CodePanel />
              </div>

              {/* ── Floating Card: Live Classes (upper-left of teacher) ── */}
              <div className="absolute top-8 sm:top-12 left-2 sm:left-6 lg:left-0 z-20 hidden sm:block">
                <div className="animate-float-1">
                  <div
                    className="
                      bg-white/95 dark:bg-[#0d1022]/90 backdrop-blur-xl
                      border border-purple-500/20 dark:border-purple-500/25 rounded-2xl
                      shadow-[0_10px_32px_rgba(124,58,237,0.12)] dark:shadow-[0_8px_32px_rgba(124,58,237,0.22)]
                      px-4 py-3
                      transition-all duration-300 hover:border-purple-400/50 hover:shadow-[0_14px_40px_rgba(124,58,237,0.25)]
                      cursor-default select-none
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/15 dark:bg-purple-500/20 flex items-center justify-center relative">
                        <Play className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <p className="text-[10px] uppercase tracking-wider text-purple-700 dark:text-purple-300 font-bold">
                            Live Classes
                          </p>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Create & Teach</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Floating Card: Students Learning (center-left) ── */}
              <div className="absolute top-[35%] sm:top-[38%] left-0 sm:left-4 lg:left-[-10px] z-20 hidden sm:block">
                <div className="animate-float-2">
                  <div
                    className="
                      bg-white/95 dark:bg-[#0d1022]/90 backdrop-blur-xl
                      border border-purple-500/20 dark:border-purple-500/25 rounded-2xl
                      shadow-[0_10px_32px_rgba(124,58,237,0.12)] dark:shadow-[0_8px_32px_rgba(124,58,237,0.22)]
                      px-4 py-3
                      transition-all duration-300 hover:border-purple-400/50 hover:shadow-[0_14px_40px_rgba(124,58,237,0.25)]
                      cursor-default select-none
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/15 dark:bg-purple-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-purple-700 dark:text-purple-300 font-bold">
                          Students Learning
                        </p>
                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600 dark:from-white dark:via-purple-100 dark:to-purple-300 leading-none mt-0.5">
                          128+
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Floating Card: Your Courses (right of teacher) ── */}
              <div className="absolute top-[30%] sm:top-[32%] right-0 sm:right-2 lg:right-[-5px] z-20 hidden sm:block">
                <div className="animate-float-3">
                  <div
                    className="
                      bg-white/95 dark:bg-[#0d1022]/90 backdrop-blur-xl
                      border border-purple-500/20 dark:border-purple-500/25 rounded-2xl
                      shadow-[0_10px_32px_rgba(124,58,237,0.12)] dark:shadow-[0_8px_32px_rgba(124,58,237,0.22)]
                      px-4 py-3
                      transition-all duration-300 hover:border-purple-400/50 hover:shadow-[0_14px_40px_rgba(124,58,237,0.25)]
                      cursor-default select-none
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/15 dark:bg-purple-500/20 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-purple-700 dark:text-purple-300 font-bold">
                          Your Courses
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Reach Thousands</p>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center ml-1">
                        <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Floating Card: Instructor Perks (lower-right) ── */}
              <div className="absolute bottom-8 sm:bottom-16 right-0 sm:right-2 lg:right-0 z-20 hidden sm:block">
                <div className="animate-float-2">
                  <div
                    className="
                      bg-white/95 dark:bg-[#0d1022]/90 backdrop-blur-xl
                      border border-purple-500/20 dark:border-purple-500/25 rounded-2xl
                      shadow-[0_10px_32px_rgba(124,58,237,0.12)] dark:shadow-[0_8px_32px_rgba(124,58,237,0.22)]
                      px-4 py-3
                      transition-all duration-300 hover:border-purple-400/50 hover:shadow-[0_14px_40px_rgba(124,58,237,0.25)]
                      cursor-default select-none
                    "
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/15 dark:bg-purple-500/20 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                        Instructor Perks
                      </p>
                    </div>
                    <div className="space-y-1.5 text-[12px] text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span> Grow your income
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span> Teach online
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span> Earn from knowledge
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Teacher Image ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-[15] w-[90%] sm:w-[88%] lg:w-[95%]"
              >
                <Image
                  src="/images/instructor_nobg.png?v=2"
                  alt="Instructor at Glarus Academy working on a laptop — join our teaching network"
                  width={1000}
                  height={1100}
                  className="w-full h-auto object-contain drop-shadow-[0_0_60px_rgba(124,58,237,0.22)] dark:drop-shadow-[0_0_80px_rgba(124,58,237,0.32)]"
                  priority
                  unoptimized
                />
              </motion.div>

              {/* Mobile: simplified floating indicators */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between sm:hidden z-20">
                <div className="animate-float-1 bg-white/95 dark:bg-[#0d1022]/90 backdrop-blur-xl border border-purple-500/20 dark:border-purple-500/25 rounded-xl py-2 px-3 text-[10px] text-slate-900 dark:text-white shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <Play className="w-3 h-3 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
                    <span className="font-bold">Live Classes</span>
                  </div>
                </div>
                <div className="animate-float-2 bg-white/95 dark:bg-[#0d1022]/90 backdrop-blur-xl border border-purple-500/20 dark:border-purple-500/25 rounded-xl py-2 px-3 text-[10px] text-slate-900 dark:text-white shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span className="font-bold">128+ Students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
