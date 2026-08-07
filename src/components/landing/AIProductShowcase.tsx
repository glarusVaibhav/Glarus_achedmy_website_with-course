"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Database, Mic, Code2, Sparkles, ArrowRight, Play, ExternalLink,
  ShieldCheck, Cpu, Terminal, Layers, Activity, CheckCircle2, Zap, Server,
  Globe, ChevronRight, Lock, Eye, Download, Code
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════════
   PRODUCT SHOWCASE TYPES & DATA
   ═══════════════════════════════════════════════ */

export interface ShowcaseProduct {
  id: string;
  title: string;
  subtitle: string;
  category: "all" | "agents" | "rag" | "voice" | "automation";
  status: string;
  statusColor: string;
  difficulty: "Intermediate" | "Advanced" | "Expert";
  buildTime: string;
  url: string;
  screenshot: string;
  stack: string[];
  metrics: { label: string; value: string; color: string }[];
  description: string;
  architectureHighlights: string[];
  marketingHeadline: string;
  badge: string;
  accentGlow: string;
  borderColor: string;
}

const PRODUCTS: ShowcaseProduct[] = [
  {
    id: "sales-swarm",
    title: "Autonomous AI Sales & Lead Swarm",
    subtitle: "Multi-agent autonomous system for B2B lead enrichment, personalized cold outreach, and meeting booking.",
    category: "agents",
    status: "● Active Agent Loop",
    statusColor: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30",
    difficulty: "Expert",
    buildTime: "12 Hours",
    url: "sales-swarm.glarus.ai",
    screenshot: "/images/sales_swarm_hero_ui.png",
    stack: ["LangGraph", "Claude 3.5 Sonnet", "Tavily Search", "Docker", "MCP Protocol"],
    metrics: [
      { label: "Enrichment Speed", value: "10k Leads/Day", color: "text-purple-600 dark:text-purple-400" },
      { label: "Swarm Size", value: "5 Agents", color: "text-indigo-600 dark:text-indigo-400" },
      { label: "Conversion Lift", value: "3.8x Industry Avg", color: "text-emerald-600 dark:text-emerald-400" }
    ],
    description: "Production autonomous agent system that runs continuous loop swarms to identify prospective enterprise leads, verify contact metadata, write hyper-personalized proposals, and schedule calls autonomously.",
    architectureHighlights: [
      "LangGraph cyclic graph state management with human-in-the-loop fallback",
      "Model Context Protocol (MCP) tool integration for real-time CRM updates",
      "Docker containerized execution with zero memory leakage"
    ],
    marketingHeadline: "Replaces traditional $150k sales ops teams with self-healing AI agent swarms.",
    badge: "🔥 HIGH DEMAND AGENT SWARM",
    accentGlow: "rgba(168, 85, 247, 0.3)",
    borderColor: "border-purple-500/40 hover:border-purple-400"
  },
  {
    id: "enterprise-rag",
    title: "Enterprise RAG Knowledge Graph Engine",
    subtitle: "Hybrid search vector retrieval system with DeepSeek R1 reasoning and LlamaIndex Knowledge Graph indexing.",
    category: "rag",
    status: "● 99.4% Precision Hit",
    statusColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
    difficulty: "Advanced",
    buildTime: "18 Hours",
    url: "enterprise-rag.glarus.ai",
    screenshot: "/images/enterprise_rag_hero_ui.png",
    stack: ["DeepSeek R1", "LlamaIndex", "Pinecone Hybrid", "FastAPI", "Qdrant", "Docker"],
    metrics: [
      { label: "Context Hit Precision", value: "99.4% Precision", color: "text-amber-600 dark:text-amber-400" },
      { label: "Query Latency", value: "<120ms Hybrid", color: "text-cyan-600 dark:text-cyan-400" },
      { label: "Index Scale", value: "100k+ PDF Corpus", color: "text-indigo-600 dark:text-indigo-400" }
    ],
    description: "Production-grade RAG pipeline combining dense vector embeddings, BM25 sparse keyword search, and Knowledge Graph relation extraction to eliminate hallucinations across complex enterprise documents.",
    architectureHighlights: [
      "DeepSeek R1 reasoning model chain with step-by-step verification",
      "Hybrid dense-sparse reranking pipeline using Cohere Rerank v3",
      "Sub-second vector retrieval with Qdrant and Pinecone cluster fallback"
    ],
    marketingHeadline: "The exact RAG architecture Fortune 500 companies pay $60k+ to deploy.",
    badge: "⭐ FEATURED HERO SHOWCASE",
    accentGlow: "rgba(245, 158, 11, 0.35)",
    borderColor: "border-amber-500/60 hover:border-amber-400"
  },
  {
    id: "voice-ai",
    title: "Voice AI Call Agent & Real-Time Assistant",
    subtitle: "Low-latency WebRTC voice agent capable of natural human phone conversations, booking appointments, and customer support.",
    category: "voice",
    status: "● Sub-45ms WebRTC",
    statusColor: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    difficulty: "Intermediate",
    buildTime: "10 Hours",
    url: "voice-assistant.glarus.ai",
    screenshot: "/images/voice_ai_hero_ui.png",
    stack: ["ElevenLabs", "LiveKit WebRTC", "Whisper API", "Twilio", "FastAPI"],
    metrics: [
      { label: "Audio Latency", value: "<45ms TTFT", color: "text-cyan-600 dark:text-cyan-400" },
      { label: "Concurrency", value: "500 Live Calls", color: "text-emerald-600 dark:text-emerald-400" },
      { label: "Turn-Taking", value: "Full-Duplex", color: "text-purple-600 dark:text-purple-400" }
    ],
    description: "Full-duplex real-time voice streaming system using WebRTC for sub-second audio turn-taking, noise cancellation, and automated database sync during live calls.",
    architectureHighlights: [
      "LiveKit WebRTC transport layer with low-buffer audio chunking",
      "ElevenLabs Turbo v2.5 voice synthesis with natural emotional inflection",
      "Interruptible barge-in detection with zero speech overlap"
    ],
    marketingHeadline: "Sub-45ms ultra-low latency voice agents for enterprise call centers.",
    badge: "⚡ REAL-TIME VOICE TECH",
    accentGlow: "rgba(6, 182, 212, 0.3)",
    borderColor: "border-cyan-500/40 hover:border-cyan-400"
  }
];

const CATEGORIES = [
  { id: "all", label: "🔥 All Production Products" },
  { id: "agents", label: "🤖 AI Swarms & Agents" },
  { id: "rag", label: "🔍 Enterprise RAG" },
  { id: "voice", label: "🎙️ Voice AI & WebRTC" },
  { id: "automation", label: "⚡ Enterprise Automation" }
];

const TECH_ECOSYSTEM = [
  { name: "OpenAI", desc: "GPT-4o & Realtime API", icon: "⚡", glow: "hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]" },
  { name: "Anthropic", desc: "Claude 3.5 Sonnet & Haiku", icon: "🧠", glow: "hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]" },
  { name: "DeepSeek", desc: "DeepSeek R1 Reasoning", icon: "🌀", glow: "hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]" },
  { name: "LangGraph", desc: "Multi-Agent State Graphs", icon: "🔗", glow: "hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]" },
  { name: "LlamaIndex", desc: "Knowledge Graph Indexing", icon: "🗂️", glow: "hover:border-indigo-500/60 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]" },
  { name: "Pinecone", desc: "Hybrid Sparse-Dense DB", icon: "🌲", glow: "hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]" },
  { name: "Docker", desc: "Container Execution", icon: "🐳", glow: "hover:border-blue-500/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]" },
  { name: "FastAPI", desc: "Async Python Backends", icon: "🚀", glow: "hover:border-teal-500/60 hover:shadow-[0_0_20px_rgba(20,184,166,0.25)]" },
  { name: "LiveKit", desc: "WebRTC Audio Transports", icon: "🎙️", glow: "hover:border-rose-500/60 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]" },
  { name: "ElevenLabs", desc: "Sub-50ms Voice Synthesis", icon: "🔊", glow: "hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]" },
  { name: "Supabase", desc: "Postgres Vector & Auth", icon: "⚡", glow: "hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]" },
  { name: "Qdrant", desc: "High-Throughput Vector DB", icon: "🔴", glow: "hover:border-red-500/60 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]" }
];

const METRICS = [
  { value: "30+", label: "Production AI Projects", sub: "Built step-by-step from scratch", icon: Layers },
  { value: "50+", label: "Enterprise Tech Tools", sub: "LangGraph, DeepSeek, Docker, Vector DBs", icon: Cpu },
  { value: "20+", label: "Deployment Blueprint Repos", sub: "Production AWS & Vercel codebases", icon: Terminal },
  { value: "500+", label: "Hired AI Engineers", sub: "Alumni working in top AI startups", icon: ShieldCheck },
  { value: "95%", label: "Deployment Success Rate", sub: "Verified production code execution", icon: Zap }
];

/* ═══════════════════════════════════════════════
   MAIN HIGH-END AI PRODUCT SHOWCASE
   ═══════════════════════════════════════════════ */

export default function AIProductShowcase() {
  const [activeProjectModal, setActiveProjectModal] = useState<ShowcaseProduct | null>(null);

  return (
    <div className="relative py-12 px-2 sm:px-4 lg:px-6 overflow-hidden bg-transparent text-text">
      
      {/* ─── LUXURY BACKGROUND AURORA & LIGHT BEAMS ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-gradient-to-tr from-purple-900/15 via-indigo-600/10 to-cyan-500/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ═══════════════════════════════════════
           1. HERO TITLE & CATEGORY PILLS
           ═══════════════════════════════════════ */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold uppercase tracking-[0.25em] shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span>30+ PRODUCTION-READY AI STARTUP PROJECTS</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05]"
          >
            Build AI Products <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 dark:from-purple-400 dark:via-indigo-200 dark:to-cyan-400">
              That Companies Actually Pay For.
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-slate-700 dark:text-slate-300/90 font-semibold max-w-3xl mx-auto leading-relaxed"
          >
            Stop wasting time on toy tutorials. Deploy production-ready Autonomous AI Agents, Enterprise RAG Systems, Voice Assistants, and Multi-Agent Swarms used in modern tech companies.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/courses"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white font-black text-sm tracking-wide shadow-lg transition-all flex items-center gap-2 group"
            >
              <span>Explore Products &amp; Specs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setActiveProjectModal(PRODUCTS[1])}
              className="px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-slate-200 font-extrabold text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Watch Architecture Demo</span>
            </button>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════
           2. 3D PERSPECTIVE SHOWCASE STAGE
           ═══════════════════════════════════════ */}
        <div className="my-16 perspective-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-center">

            {/* ─── WINDOW 1: LEFT (Autonomous AI Sales Swarm) ─── */}
            <motion.div
              initial={{ opacity: 0, x: -40, rotateY: 14 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 10 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              whileHover={{ rotateY: 0, scale: 1.02, zIndex: 30 }}
              className="rounded-3xl bg-white dark:bg-[#0d0926]/95 border border-purple-200 dark:border-purple-500/35 hover:border-purple-400 shadow-xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl p-6 relative group transition-all duration-700 overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Mac Chrome Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200 dark:border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-[11px] text-slate-700 dark:text-purple-300/80 font-bold truncate">sales-swarm.glarus.ai</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${PRODUCTS[0].statusColor}`}>
                  {PRODUCTS[0].status}
                </span>
              </div>

              {/* 16:9 Widescreen Image Viewport */}
              <div className="relative rounded-2xl overflow-hidden border border-purple-200 dark:border-purple-500/30 bg-slate-950 mb-5 aspect-[16/9] shadow-md">
                <img
                  src={PRODUCTS[0].screenshot}
                  alt={PRODUCTS[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-purple-300">LangGraph Swarm</span>
                  <span className="text-emerald-400 font-bold">10k Leads/Day</span>
                </div>
              </div>

              {/* Info Body */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    {PRODUCTS[0].badge}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Build Time: <strong className="text-slate-900 dark:text-white">{PRODUCTS[0].buildTime}</strong></span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                  {PRODUCTS[0].title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300/80 leading-relaxed font-medium line-clamp-2">
                  {PRODUCTS[0].subtitle}
                </p>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRODUCTS[0].stack.map((st, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      {st}
                    </span>
                  ))}
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-700 dark:text-purple-400 font-bold text-xs">{PRODUCTS[0].marketingHeadline}</span>
                  <button
                    onClick={() => setActiveProjectModal(PRODUCTS[0])}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-black text-xs transition-all flex items-center gap-1 shrink-0"
                  >
                    Specs <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ─── WINDOW 2: CENTER HERO (Enterprise RAG Engine) ─── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              whileHover={{ scale: 1.03, zIndex: 30 }}
              className="rounded-3xl bg-white dark:bg-[#100a30]/95 border-2 border-amber-500/60 hover:border-amber-400 shadow-2xl dark:shadow-[0_0_80px_rgba(245,158,11,0.3)] backdrop-blur-3xl p-7 relative group transition-all duration-700 overflow-hidden lg:scale-105 z-20 flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Mac Chrome Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/15 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-xs text-amber-700 dark:text-amber-300 font-black truncate">enterprise-rag.glarus.ai</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${PRODUCTS[1].statusColor}`}>
                  {PRODUCTS[1].status}
                </span>
              </div>

              {/* 16:9 Widescreen Image Viewport */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 mb-5 aspect-[16/9] shadow-lg">
                <img
                  src={PRODUCTS[1].screenshot}
                  alt={PRODUCTS[1].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                
                <div className="absolute top-3 left-3 bg-amber-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  ⭐ HERO PRODUCT SHOWCASE
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono font-bold text-white bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-500/40">
                  <span className="text-amber-300 font-extrabold">DeepSeek R1 + LlamaIndex</span>
                  <span className="text-emerald-400 font-black">&lt;120ms Latency</span>
                </div>
              </div>

              {/* Info Body */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-xs font-mono font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    {PRODUCTS[1].badge}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Build Time: <strong className="text-amber-600 dark:text-amber-300 font-black">{PRODUCTS[1].buildTime}</strong></span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  {PRODUCTS[1].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200/90 leading-relaxed font-medium">
                  {PRODUCTS[1].subtitle}
                </p>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRODUCTS[1].stack.map((st, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-800 dark:text-amber-200">
                      {st}
                    </span>
                  ))}
                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/15 flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-700 dark:text-amber-300 font-bold text-xs">{PRODUCTS[1].marketingHeadline}</span>
                  <button
                    onClick={() => setActiveProjectModal(PRODUCTS[1])}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-purple-600 hover:brightness-110 text-white dark:text-black font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs shrink-0"
                  >
                    Inspect Specs <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ─── WINDOW 3: RIGHT (Voice AI Assistant) ─── */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: -14 }}
              whileInView={{ opacity: 1, x: 0, rotateY: -10 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              whileHover={{ rotateY: 0, scale: 1.02, zIndex: 30 }}
              className="rounded-3xl bg-white dark:bg-[#090e2a]/90 border border-cyan-200 dark:border-cyan-500/35 hover:border-cyan-400 shadow-xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl p-6 relative group transition-all duration-700 overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Mac Chrome Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200 dark:border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-[11px] text-slate-700 dark:text-cyan-300/80 font-bold truncate">voice-assistant.glarus.ai</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${PRODUCTS[2].statusColor}`}>
                  {PRODUCTS[2].status}
                </span>
              </div>

              {/* 16:9 Widescreen Image Viewport */}
              <div className="relative rounded-2xl overflow-hidden border border-cyan-200 dark:border-cyan-500/30 bg-slate-950 mb-5 aspect-[16/9] shadow-md">
                <img
                  src={PRODUCTS[2].screenshot}
                  alt={PRODUCTS[2].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-cyan-300">ElevenLabs + LiveKit</span>
                  <span className="text-emerald-400 font-bold">&lt;45ms TTFT</span>
                </div>
              </div>

              {/* Info Body */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">
                    {PRODUCTS[2].badge}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Build Time: <strong className="text-slate-900 dark:text-white">{PRODUCTS[2].buildTime}</strong></span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                  {PRODUCTS[2].title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300/80 leading-relaxed font-medium line-clamp-2">
                  {PRODUCTS[2].subtitle}
                </p>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRODUCTS[2].stack.map((st, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      {st}
                    </span>
                  ))}
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-cyan-700 dark:text-cyan-400 font-bold text-xs">{PRODUCTS[2].marketingHeadline}</span>
                  <button
                    onClick={() => setActiveProjectModal(PRODUCTS[2])}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-black text-xs transition-all flex items-center gap-1 shrink-0"
                  >
                    Specs <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ═══════════════════════════════════════
           3. ANIMATED METRICS SHOWCASE
           ═══════════════════════════════════════ */}
        <div className="my-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {METRICS.map((m, idx) => {
            const IconComponent = m.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-white/10 hover:border-purple-500/40 backdrop-blur-xl shadow-lg transition-all hover:-translate-y-1 text-center group relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 dark:from-purple-400 dark:via-indigo-200 dark:to-cyan-400 mb-1">
                  {m.value}
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white mb-1 uppercase tracking-wider">{m.label}</div>
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-snug">{m.sub}</div>
              </motion.div>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════
           4. ENTERPRISE AI TECH ECOSYSTEM
           ═══════════════════════════════════════ */}
        <div className="p-8 sm:p-12 rounded-3xl border border-purple-200 dark:border-purple-500/25 bg-white dark:bg-[#0d0926]/90 backdrop-blur-2xl relative overflow-hidden shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest inline-block mb-3">
              ⚡ ENTERPRISE AI ECOSYSTEM
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Technologies You Will Master &amp; Deploy
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/80 font-semibold mt-2">
              No toy frameworks. Construct production software using the exact tech stack powering Silicon Valley startups.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {TECH_ECOSYSTEM.map((tech, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 font-bold text-xs flex flex-col items-center text-center gap-1 transition-all cursor-default shadow-sm group ${tech.glow}`}
              >
                <span className="text-xl mb-0.5 group-hover:scale-125 transition-transform">{tech.icon}</span>
                <span className="font-black text-slate-900 dark:text-white text-xs">{tech.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{tech.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════
         PRODUCT SPECIFICATIONS MODAL
         ═══════════════════════════════════════ */}
      <AnimatePresence>
        {activeProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setActiveProjectModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0b0825] border-2 border-purple-500/50 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden text-slate-900 dark:text-white"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setActiveProjectModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-xl">✕</button>

              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-xs font-mono font-black text-purple-700 dark:text-purple-300">
                  {activeProjectModal.badge}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{activeProjectModal.status}</span>
              </div>

              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{activeProjectModal.title}</h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                {activeProjectModal.description}
              </p>

              {/* Architecture Highlights */}
              <div className="mb-6 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">Production Architecture Highlights:</span>
                {activeProjectModal.architectureHighlights.map((hl, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center">
                {activeProjectModal.metrics.map((sp, idx) => (
                  <div key={idx}>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">{sp.label}</span>
                    <strong className={`text-sm font-black ${sp.color}`}>{sp.value}</strong>
                  </div>
                ))}
              </div>

              {/* Tech Stack */}
              <div className="mb-6">
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Production Tech Stack:</span>
                <div className="flex flex-wrap gap-2">
                  {activeProjectModal.stack.map((st, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-mono font-bold text-purple-800 dark:text-purple-200">
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Estimated Build Time: <strong className="text-slate-900 dark:text-white">{activeProjectModal.buildTime}</strong></span>
                <Link
                  href="/courses"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition-all"
                >
                  Start Building Product →
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
