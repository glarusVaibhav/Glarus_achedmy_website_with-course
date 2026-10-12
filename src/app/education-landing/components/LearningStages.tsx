"use client";

import React from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Code2, 
  Sparkles, 
  Briefcase, 
  ArrowRight, 
  Check, 
  BookOpen, 
  Palette, 
  Layers, 
  Award,
  Users
} from "lucide-react";

export function LearningStages() {
  const stages = [
    {
      id: "school",
      title: "School Education (Class 5–12)",
      eyebrow: "FOUNDATION TO BOARDS",
      badge: "Grades 5 – 12",
      description: "Concept clarity, visual science experiments, step-by-step math proofs, and CBSE/ICSE board preparation for young scholars.",
      icon: GraduationCap,
      color: {
        bg: "bg-amber-50/50",
        hoverBg: "hover:bg-amber-50/90",
        border: "border-amber-200/80",
        accent: "#d97706",
        badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
        iconBg: "bg-amber-100 text-amber-700",
        btnHover: "hover:bg-amber-600"
      },
      highlights: [
        "Mathematics, Science, English & Social Studies",
        "Chapter-wise interactive quizzes & step solutions",
        "Class 10 & 12 Board Exam 10-Yr Solved PYQs",
        "Olympiad & NTSE competitive foundation"
      ],
      linkText: "Explore School Classes (5–12)",
      targetHref: "#school-showcase"
    },
    {
      id: "skills",
      title: "Skill Development & Coding",
      eyebrow: "PRACTICAL SKILLS",
      badge: "Hands-on Projects",
      description: "Learn high-demand digital skills by actually building things: Python, Fullstack Web, Figma UI/UX, and creative problem solving.",
      icon: Code2,
      color: {
        bg: "bg-blue-50/50",
        hoverBg: "hover:bg-blue-50/90",
        border: "border-blue-200/80",
        accent: "#2563eb",
        badgeBg: "bg-blue-100 text-blue-900 border-blue-300",
        iconBg: "bg-blue-100 text-blue-700",
        btnHover: "hover:bg-blue-700"
      },
      highlights: [
        "Python 3 & Scratch Logic from Zero",
        "React, Next.js & Modern Web Development",
        "UI/UX Design Systems & Figma Prototyping",
        "Real-world portfolio projects for your resume"
      ],
      linkText: "Explore Skill Programs",
      targetHref: "#explore-courses"
    },
    {
      id: "ai-tech",
      title: "AI, Machine Learning & Data",
      eyebrow: "FUTURE TECHNOLOGY",
      badge: "Cutting-Edge Lab",
      description: "Master real-world Artificial Intelligence without empty hype: LangGraph Multi-Agent Workflows, RAG systems, PyTorch, and Data Analytics.",
      icon: Sparkles,
      color: {
        bg: "bg-purple-50/50",
        hoverBg: "hover:bg-purple-50/90",
        border: "border-purple-200/80",
        accent: "#7c3aed",
        badgeBg: "bg-purple-100 text-purple-900 border-purple-300",
        iconBg: "bg-purple-100 text-purple-700",
        btnHover: "hover:bg-purple-700"
      },
      highlights: [
        "Autonomous Multi-Agent Architecture & LangGraph",
        "Vector Databases & Hybrid RAG Pipelines",
        "Practical Data Wrangling with Pandas & NumPy",
        "Safety, Guardrails & Production LLM Deployment"
      ],
      linkText: "Explore AI & Data Labs",
      targetHref: "#explore-courses"
    },
    {
      id: "professional",
      title: "Professional Growth & Careers",
      eyebrow: "CAREER ACCELERATION",
      badge: "Industry Mentorship",
      description: "Accelerate your career trajectory through structured roadmaps, live 1-on-1 code reviews, verified credentials, and capstone labs.",
      icon: Briefcase,
      color: {
        bg: "bg-emerald-50/50",
        hoverBg: "hover:bg-emerald-50/90",
        border: "border-emerald-200/80",
        accent: "#059669",
        badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
        iconBg: "bg-emerald-100 text-emerald-700",
        btnHover: "hover:bg-emerald-700"
      },
      highlights: [
        "Guided End-to-End Capstone Projects",
        "Live Mock Interviews & Portfolio Reviews",
        "Verified Professional Blockchain-Backed Certificates",
        "Alumni Network & Career Mentorship Support"
      ],
      linkText: "Explore Career Tracks",
      targetHref: "#learning-paths"
    }
  ];

  return (
    <section id="learning-stages" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Inclusive Learning Ecosystem</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Learning for Every Stage of Your Journey
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            From your first school lesson to advanced professional skills, discover learning experiences thoughtfully designed around your personal goals.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                className={`flex flex-col justify-between rounded-3xl p-6 ${stage.color.bg} ${stage.color.hoverBg} border ${stage.color.border} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}
              >
                <div>
                  {/* Top Row: Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl ${stage.color.iconBg} flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${stage.color.badgeBg}`}>
                      {stage.badge}
                    </span>
                  </div>

                  {/* Eyebrow & Title */}
                  <div className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 mb-1">
                    {stage.eyebrow}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                    {stage.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                    {stage.description}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="space-y-2.5 mb-6 pt-4 border-t border-slate-200/60">
                    {stage.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-2.5 h-2.5 text-slate-900 stroke-[3]" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Explore Button */}
                <Link
                  href={stage.targetHref}
                  className="w-full inline-flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-900 text-slate-800 hover:text-white rounded-xl font-bold text-xs border border-slate-200/80 shadow-2xs group/btn transition-all duration-200"
                >
                  <span>{stage.linkText}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
