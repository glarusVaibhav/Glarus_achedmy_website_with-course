"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { 
  Zap, 
  Radio, 
  Code2, 
  Briefcase, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Target, 
  Rocket, 
  FileText, 
  Mic, 
  Database, 
  ShoppingCart, 
  Bot, 
  Terminal, 
  Cpu,
  MessageSquare,
  Sparkles,
  Video,
  X
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   5 FLOATING FEATURE CARDS - Scaled for compact right illustration
   ═══════════════════════════════════════════════════════════════ */
const FLOATING_CARDS = [
  {
    icon: Radio,
    title: "Live Training",
    desc: "Interactive Sessions",
    position: "top-[4%] left-[-4%] sm:left-[0%]",
    iconBg: "bg-purple-600/30 text-purple-400 border-purple-500/40",
    cardBorder: "border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]",
    floatDelay: 0
  },
  {
    icon: Code2,
    title: "Real Projects",
    desc: "Build • Deploy • Showcase",
    position: "top-[-6%] right-[2%] sm:right-[6%]",
    iconBg: "bg-blue-600/30 text-cyan-400 border-blue-500/40",
    cardBorder: "border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.25)]",
    floatDelay: 1.2
  },
  {
    icon: Briefcase,
    title: "Internship",
    desc: "Gain Industry Experience",
    position: "top-[38%] right-[-6%] sm:right-[-4%]",
    iconBg: "bg-emerald-600/30 text-emerald-400 border-emerald-500/40",
    cardBorder: "border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.25)]",
    floatDelay: 2.4
  },
  {
    icon: Users,
    title: "Expert Mentors",
    desc: "1:1 Guidance",
    position: "bottom-[24%] left-[-4%] sm:left-[-2%]",
    iconBg: "bg-blue-600/30 text-blue-400 border-blue-500/40",
    cardBorder: "border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.25)]",
    floatDelay: 3.6
  },
  {
    icon: TrendingUp,
    title: "Career Support",
    desc: "Resume, Interview & Placement",
    position: "bottom-[-2%] right-[2%] sm:right-[6%]",
    iconBg: "bg-indigo-600/30 text-indigo-400 border-indigo-500/40",
    cardBorder: "border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.25)]",
    floatDelay: 1.8
  }
];

/* ═══════════════════════════════════════════════════════════════
   5 Bottom Feature Bar Pillars
   ═══════════════════════════════════════════════════════════════ */
const HERO_PILLARS = [
  { icon: Target, title: "Job-Oriented", desc: "Industry-aligned curriculum designed to get you hired", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { icon: Radio, title: "Live Learning", desc: "Interactive live classes with experts", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { icon: Code2, title: "Real-World Projects", desc: "Build production-grade projects for your portfolio", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { icon: Briefcase, title: "Internships", desc: "Work on real projects and gain industry experience", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { icon: Users, title: "100% Career Support", desc: "End-to-end support till you land your dream role", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" }
];

/* ═══════════════════════════════════════════════════════════════
   6 Roadmap Step Cards
   ═══════════════════════════════════════════════════════════════ */
const ROADMAP_STEPS = [
  { step: "01", icon: Target, title: "Enroll", desc: "Choose your AI learning path & unlock course material.", badge: "Step 1", color: "from-purple-500 to-indigo-500" },
  { step: "02", icon: Radio, title: "Live Training", desc: "Learn directly from FAANG & top AI industry experts.", badge: "Step 2", color: "from-indigo-500 to-blue-500" },
  { step: "03", icon: Code2, title: "Build Projects", desc: "Develop production-ready AI applications for your portfolio.", badge: "Step 3", color: "from-blue-500 to-cyan-500" },
  { step: "04", icon: Briefcase, title: "Internship", desc: "Gain real-world industry experience working on live client projects.", badge: "Step 4", color: "from-cyan-500 to-emerald-500" },
  { step: "05", icon: Terminal, title: "Career Support", desc: "Resume optimization, portfolio review & 1-on-1 mock interviews.", badge: "Step 5", color: "from-emerald-500 to-teal-500" },
  { step: "06", icon: Rocket, title: "Get Hired", desc: "Placement assistance & direct introductions to hiring partners.", badge: "Step 6", color: "from-teal-500 to-purple-500" }
];

const WHY_CHOOSE_CHIPS = [
  "Live Interactive Classes", "Weekly Code Reviews", "Capstone Projects", "Internship Opportunities",
  "Industry Mentorship", "Resume & Interview Preparation", "Placement Assistance", "Lifetime Community Access"
];

const PROJECTS_SHOWCASE = [
  { 
    icon: Bot, 
    name: "Autonomous AI Sales & Outreach Swarm", 
    tech: "LangGraph • Claude 3.5 Sonnet • Tavily Search", 
    tags: ["LangGraph", "Claude 3.5", "Agent Swarm"],
    level: "Expert", 
    badge: "🔥 HIGH DEMAND",
    badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    color: "text-purple-400", 
    border: "border-purple-500/40 hover:border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.25)]",
    category: "agents"
  },
  { 
    icon: Database, 
    name: "Enterprise RAG Knowledge Graph & Vector Engine", 
    tech: "DeepSeek R1 • LlamaIndex • Pinecone Hybrid", 
    tags: ["DeepSeek R1", "LlamaIndex", "Vector DB"],
    level: "Advanced", 
    badge: "🔥 HIGH DEMAND",
    badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    color: "text-amber-400", 
    border: "border-amber-500/40 hover:border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.25)]",
    category: "rag"
  },
  { 
    icon: Mic, 
    name: "Voice AI Call Agent & Real-Time Assistant", 
    tech: "LiveKit WebRTC • ElevenLabs • Whisper API", 
    tags: ["ElevenLabs", "LiveKit", "Whisper"],
    level: "Intermediate", 
    badge: "⚡ IN-DEMAND",
    badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    color: "text-cyan-400", 
    border: "border-cyan-500/40 hover:border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.25)]",
    category: "voice"
  },
  { 
    icon: Code2, 
    name: "Multi-Agent Coding & Bug Fixer Assistant", 
    tech: "AutoGen • LangChain • E2B Docker Sandbox", 
    tags: ["AutoGen", "E2B Sandbox", "Python"],
    level: "Expert", 
    badge: "🔥 HIGH DEMAND",
    badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-300",
    color: "text-indigo-400", 
    border: "border-indigo-500/40 hover:border-indigo-400/80 shadow-[0_0_30px_rgba(99,102,241,0.25)]",
    category: "agents"
  },
  { 
    icon: FileText, 
    name: "Multimodal Document & Vision Intelligence Engine", 
    tech: "GPT-4o Vision • Unstructured.io • FastAPI", 
    tags: ["GPT-4o", "Vision OCR", "FastAPI"],
    level: "Intermediate", 
    badge: "⚡ POPULAR",
    badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    color: "text-emerald-400", 
    border: "border-emerald-500/40 hover:border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.25)]",
    category: "voice"
  },
  { 
    icon: ShoppingCart, 
    name: "Autonomous E-Commerce AI Shopping Agent", 
    tech: "Playwright AI • Browser-Use • Function Calling", 
    tags: ["Browser-Use", "Function Call", "Agent"],
    level: "Advanced", 
    badge: "⚡ TOP FAVORITE",
    badgeBg: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    color: "text-blue-400", 
    border: "border-blue-500/40 hover:border-blue-400/80 shadow-[0_0_30px_rgba(59,130,246,0.25)]",
    category: "agents"
  },
  { 
    icon: Cpu, 
    name: "Financial Market Sentiment & Trading Agent", 
    tech: "DeepSeek V3 • Financial APIs • Streamlit", 
    tags: ["DeepSeek V3", "Financial AI", "Python"],
    level: "Advanced", 
    badge: "⚡ TRENDING",
    badgeBg: "bg-violet-500/10 border-violet-500/30 text-violet-300",
    color: "text-violet-400", 
    border: "border-violet-500/40 hover:border-violet-400/80 shadow-[0_0_30px_rgba(139,92,246,0.25)]",
    category: "agents"
  },
  { 
    icon: Database, 
    name: "Local Privacy-First Offline RAG App", 
    tech: "Ollama • DeepSeek R1 • Qdrant • Electron", 
    tags: ["Ollama", "DeepSeek R1", "Electron"],
    level: "Expert", 
    badge: "⚡ ENTERPRISE",
    badgeBg: "bg-sky-500/10 border-sky-500/30 text-sky-300",
    color: "text-sky-400", 
    border: "border-sky-500/40 hover:border-sky-400/80 shadow-[0_0_30px_rgba(14,165,233,0.25)]",
    category: "rag"
  }
];

/* ═══════════════════════════════════════════════════════════════
   HERO COMPONENT - 60/40 Asymmetric Ratio (Big Content / Compact Laptop)
   ═══════════════════════════════════════════════════════════════ */
export default function HeroAdvanced() {
  const [showCriteria, setShowCriteria] = useState(false);
  const [projectCategory, setProjectCategory] = useState("all");

  return (
    <section
      className="relative w-full overflow-hidden text-text selection:bg-purple-500/30 bg-background"
      style={{
        background: `
          radial-gradient(circle at 75% 30%, rgba(139, 92, 246, 0.18) 0%, transparent 60%),
          radial-gradient(circle at 25% 70%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
          var(--background)
        `
      }}
    >
      {/* Bottom Seamless Fade to match next section */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[5]"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, var(--background) 100%)"
        }}
      />
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.6px,transparent_0.6px)] [background-size:32px_32px] opacity-[0.025] pointer-events-none z-0" />

      {/* Cyberpunk Grid/Circuit Lines Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(147,51,234,0.4) 1px, transparent 1px),
            linear-gradient(0deg, rgba(147,51,234,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px"
        }}
      />

      {/* ═══════════════════════════════════════════════════
          MAIN HERO CONTAINER (Centered, Max Width 1560px)
          ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-[1560px] w-full mx-auto px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 pb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-8 min-h-[580px] lg:min-h-[640px]">

          {/* ──────────── LEFT COLUMN (60% Width - BIG CONTENT) ──────────── */}
          <div className="w-full lg:w-[58%] xl:w-[60%] shrink-0 flex flex-col items-start text-left z-20">

            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/40 bg-purple-500/10 dark:bg-[#0d0922]/80 backdrop-blur-xl shadow-[0_0_20px_rgba(147,51,234,0.2)] mb-6"
            >
              <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400 animate-pulse" />
              <span className="text-[11px] sm:text-[12px] font-black tracking-wider text-purple-950 dark:text-white uppercase">
                ⚡ JOB-ORIENTED AI PROGRAMS • LIVE CLASSES • INTERNSHIPS • PROJECTS
              </span>
            </motion.div>

            {/* Eyebrow Label */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-600 dark:from-purple-400 dark:via-cyan-400 dark:to-blue-400 mb-4"
            >
              LEARN. PRACTICE. BUILD. GET HIRED.
            </motion.p>

            {/* Main Headline - PROMINENT & BIG */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-[52px] sm:text-[74px] lg:text-[84px] xl:text-[96px] 2xl:text-[104px] font-[900] text-slate-900 dark:text-white tracking-tight leading-[0.94] mb-6 max-w-[820px]"
            >
              Job-Oriented<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-300 dark:to-blue-400">
                AI Programs
              </span>
              <br />
              with{" "}
              <span className="relative inline-flex items-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300">
                Internships
                <span 
                  onClick={() => setShowCriteria(!showCriteria)}
                  onMouseEnter={() => setShowCriteria(true)}
                  className="text-amber-500 dark:text-amber-400 font-black ml-1 text-4xl sm:text-5xl cursor-pointer hover:scale-125 transition-transform inline-block select-none animate-pulse"
                  title="Click to view Internship Eligibility Criteria"
                >
                  *
                </span>

                {/* Popover Card for Internship Criteria */}
                <AnimatePresence>
                  {showCriteria && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      onMouseLeave={() => setShowCriteria(false)}
                      className="absolute top-full left-0 mt-3 w-[330px] sm:w-[380px] p-5 rounded-2xl bg-white/95 dark:bg-[#0d0926]/95 border border-amber-400/40 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 text-left normal-case tracking-normal"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm uppercase tracking-wider">
                          <Sparkles className="w-4 h-4" />
                          <span>Internship Eligibility Criteria *</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCriteria(false);
                          }}
                          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <ol className="space-y-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                        <li className="flex items-start gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                          <span><strong>Selected Courses Only:</strong> Available exclusively on designated flagship programs &amp; live bootcamps.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                          <span><strong>Complete Course:</strong> Finish 100% of curriculum, practical labs &amp; capstone projects.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                          <span><strong>Pass Internal Interview:</strong> Clear the technical assessment &amp; mock evaluation interview.</span>
                        </li>
                      </ol>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-200 dark:border-white/10 italic">
                        * Guaranteed internship &amp; placement assistance upon meeting all conditions for eligible selected courses.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </span>
            </motion.h1>

            {/* Description Subtext - SPACIOUS */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-[17px] sm:text-[20px] text-slate-700 dark:text-slate-300/90 font-medium leading-relaxed max-w-[620px] mb-8 space-y-2.5"
            >
              <p>
                Master in-demand AI skills with live training, real-world projects
                and guaranteed internship opportunities*.
              </p>
              <p className="text-slate-900 dark:text-white font-semibold">
                Build your portfolio. Gain experience.{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Land your dream job.
                </span>
              </p>
            </motion.div>

            {/* Action Buttons - PROMINENT */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/courses"
                className="h-[60px] px-9 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-black text-[16px] hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_0_35px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2.5 group"
              >
                Explore Programs
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/courses?type=live"
                className="h-[60px] px-9 rounded-full border border-purple-500/40 bg-white/80 dark:bg-[#0e0a26]/60 backdrop-blur-xl text-slate-900 dark:text-white font-bold text-[16px] hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-400/60 transition-all flex items-center justify-center gap-2.5 shadow-md dark:shadow-none"
              >
                View Live Classes
                <Calendar className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
              </Link>
            </motion.div>
          </div>

          {/* ──────────── RIGHT COLUMN (52% Width - LARGE LAPTOP ILLUSTRATION) ──────────── */}
          <div className="relative w-full lg:w-[50%] xl:w-[52%] flex items-center justify-center z-10 py-8 lg:py-0 min-h-[520px] lg:min-h-[600px]">

            {/* Laptop Center Canvas Wrapper */}
            <div className="relative w-full max-w-[760px] flex items-center justify-center mx-auto">

              {/* Ambient Radial Glow behind Laptop */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-purple-600/30 rounded-full blur-[140px] pointer-events-none z-0" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/22 rounded-full blur-[110px] pointer-events-none z-0" />

              {/* Glowing Dashed Circuit Connecting Lines SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block overflow-visible" viewBox="0 0 680 500" fill="none">
                <path d="M 120 60 L 230 60 L 260 140" stroke="rgba(168,85,247,0.65)" strokeWidth="1.5" strokeDasharray="5 5" />
                <path d="M 520 20 L 420 20 L 380 110" stroke="rgba(59,130,246,0.65)" strokeWidth="1.5" strokeDasharray="5 5" />
                <path d="M 560 210 L 470 210 L 430 240" stroke="rgba(16,185,129,0.65)" strokeWidth="1.5" strokeDasharray="5 5" />
                <path d="M 100 360 L 210 360 L 250 310" stroke="rgba(59,130,246,0.65)" strokeWidth="1.5" strokeDasharray="5 5" />
                <path d="M 520 440 L 420 440 L 380 390" stroke="rgba(99,102,241,0.65)" strokeWidth="1.5" strokeDasharray="5 5" />
              </svg>

              {/* LARGE LAPTOP IMAGE - MOVED ONLY LAPTOP LEFT */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-full max-w-[680px] aspect-[16/11] flex items-center justify-center z-10 mx-auto lg:-translate-x-32"
              >
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <Image
                    src="/images/hero_laptop_nobg.png"
                    alt="GlarusAcademy AI Workstation"
                    fill
                    priority
                    className="object-contain object-center scale-[1.45]"
                    style={{
                      filter: "drop-shadow(0 30px 60px rgba(124, 58, 237, 0.55)) drop-shadow(0 0 100px rgba(59, 130, 246, 0.35))"
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* ── 5 Floating Feature Cards (Clean Orbit around Compact Laptop) ── */}
              {FLOATING_CARDS.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + card.floatDelay * 0.2 }}
                  className={`absolute ${card.position} z-20`}
                >
                  <motion.div
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: card.floatDelay }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`p-2.5 sm:p-3 rounded-2xl bg-white/90 dark:bg-[#0b081e]/95 backdrop-blur-2xl border ${card.cardBorder} flex items-center gap-2.5 transition-all cursor-pointer shadow-xl`}
                  >
                    <div className={`p-2 rounded-xl border ${card.iconBg} shrink-0`}>
                      <card.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 pr-1">
                      <h5 className="text-[11.5px] font-black text-slate-900 dark:text-white leading-tight truncate">{card.title}</h5>
                      <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-0.5 truncate">{card.desc}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}

            </div>

          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          BOTTOM FEATURE BAR - Translucent Floating Glass Panel
          ═══════════════════════════════════════════════════ */}
      <div className="relative z-20 max-w-[1560px] w-full mx-auto px-6 sm:px-10 lg:px-14 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 p-7 sm:p-8 rounded-[28px] border border-purple-500/30 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] bg-white/90 dark:bg-[#0b081e]/85 backdrop-blur-2xl"
        >
          {HERO_PILLARS.map((p, i) => (
            <div key={i} className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-slate-100/60 dark:hover:bg-white/[0.05] transition-colors">
              <div className={`p-3 rounded-2xl ${p.bg} border ${p.color} shrink-0 mt-0.5`}>
                <p.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[15px] sm:text-[16px] font-black text-slate-900 dark:text-white leading-tight">{p.title}</h4>
                <p className="text-[12.5px] sm:text-[13px] font-medium text-slate-600 dark:text-slate-300/80 mt-1.5 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTIONS BELOW THE HERO FOLD (Roadmap, Why Choose, Projects)
          ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-[1560px] w-full mx-auto px-6 sm:px-10 lg:px-14">

        {/* ═══════════════════════════════════════════════════
            ATTRACTIVE MARKETING FEATURE SECTION (Bento Grid Style)
            ═══════════════════════════════════════════════════ */}
        <div className="mb-24 pt-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }} 
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-widest inline-block mb-3">
              🚀 ENGINEERED FOR JOB READINESS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              Don&apos;t Just Learn AI. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 dark:from-purple-400 dark:via-indigo-300 dark:to-cyan-400">
                Become a Hirable AI Engineer.
              </span>
            </h2>
            <p className="text-lg text-slate-700 dark:text-slate-300/90 font-medium max-w-2xl mx-auto leading-relaxed">
              We replaced boring theoretical lectures with real engineering workflows, production code reviews, and direct corporate hiring networks.
            </p>
          </motion.div>

          {/* High-Impact Bento Marketing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Feature 1: Large Featured Card (Spans 2 Cols) -> Links to Live Classes */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5 }} 
              whileHover={{ y: -6 }}
              className="md:col-span-2 p-8 rounded-3xl bg-white dark:bg-[#0c0922]/85 border border-purple-200 dark:border-purple-500/30 hover:border-purple-500/60 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden group transition-all flex flex-col justify-between cursor-pointer"
            >
              <Link href="/courses?type=live" className="absolute inset-0 z-20" aria-label="Explore Live Classes" />
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-600/25 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
                    <Radio className="w-7 h-7" />
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    ⚡ 100% Live &amp; Interactive
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                  Learn Directly From FAANG &amp; Top AI Industry Architects
                </h3>
                <p className="text-base text-slate-700 dark:text-slate-300/80 font-medium leading-relaxed max-w-xl">
                  Stop watching outdated pre-recorded videos. Work alongside senior AI leaders in live, interactive code-along classes where you debug production code, optimize prompts, and solve real architectural challenges together.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 relative z-10">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Live Q&amp;A Every Session
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Real-time Code Reviews
                  </span>
                </div>
                <Link href="/courses?type=live" className="flex items-center gap-1 text-purple-700 dark:text-purple-400 font-extrabold group-hover:translate-x-1 transition-transform relative z-30">
                  Explore Classes <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Feature 2: Compact Card (Informational) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: 0.1 }} 
              className="p-8 rounded-3xl bg-white dark:bg-[#0c0922]/85 border border-cyan-200 dark:border-cyan-500/30 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                    <Code2 className="w-7 h-7" />
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-black text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">
                    🛠️ Production Code
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  Ship Production AI Systems to GitHub
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300/80 font-medium leading-relaxed">
                  Build 6+ capstone applications including Autonomous Multi-Agent Swarms, RAG Vector Search Engines, and Custom LLM Pipelines.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 relative z-10">
                <span className="text-cyan-700 dark:text-cyan-400 font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Verified GitHub Portfolio
                </span>
                <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  Included
                </span>
              </div>
            </motion.div>

            {/* Feature 3: Compact Card (Informational) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: 0.2 }} 
              className="p-8 rounded-3xl bg-white dark:bg-[#0c0922]/85 border border-emerald-200 dark:border-emerald-500/30 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    💼 Real Experience
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  Guaranteed Internship Experience*
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300/80 font-medium leading-relaxed">
                  Work on actual client projects during your program. Graduate with verified industry experience on your resume instead of empty certificates.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 relative z-10">
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Real-world Project Work
                </span>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Included
                </span>
              </div>
            </motion.div>

            {/* Feature 4: Self-Paced Learning Card (Spans 2 Cols) -> Links to Self-Paced */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: 0.3 }} 
              whileHover={{ y: -6 }}
              className="md:col-span-2 p-8 rounded-3xl bg-white dark:bg-[#0c0922]/85 border border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-500/60 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden group transition-all flex flex-col justify-between cursor-pointer"
            >
              <Link href="/courses?type=self-paced" className="absolute inset-0 z-20" aria-label="Explore Self-Paced Courses" />
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-600/25 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                    <Video className="w-7 h-7" />
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                    ⚡ FLEXIBLE SELF-PACED LEARNING
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  Learn At Your Own Pace With Lifetime Access &amp; 24/7 AI Assistance
                </h3>
                <p className="text-base text-slate-700 dark:text-slate-300/80 font-medium leading-relaxed max-w-xl">
                  Master advanced AI engineering on your schedule. Access high-definition VOD modules, interactive browser code sandboxes, lifetime updates, and our 24/7 AI Tutor to guide you through every line of code.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 relative z-10">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> 24/7 AI Tutor Guidance
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Lifetime Updates &amp; Code Sandboxes
                  </span>
                </div>
                <Link href="/courses?type=self-paced" className="flex items-center gap-1 text-indigo-700 dark:text-indigo-400 font-extrabold group-hover:translate-x-1 transition-transform relative z-30">
                  Explore Self-Paced Courses <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Why Choose GlarusAcademy */}
        <div className="mb-24 p-8 sm:p-10 rounded-3xl border border-purple-200 dark:border-purple-500/25 bg-white dark:bg-card backdrop-blur-xl shadow-lg">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">Why Choose GlarusAcademy?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Built specifically to replace outdated courses with real engineering experience.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {WHY_CHOOSE_CHIPS.map((chip, i) => (
              <div key={i} className="px-5 py-3 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 hover:bg-purple-600/10 hover:border-purple-500/40 transition-all cursor-default shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>{chip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
