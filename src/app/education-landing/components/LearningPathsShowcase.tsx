"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LEARNING_PATHS_DATA, LearningPathItem } from "../data/learningPathsData";
import { 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Calculator,
  Code2,
  Atom,
  GraduationCap,
  Layout,
  Database,
  Rocket,
  BarChart3,
  Brain,
  Cpu,
  Users,
  Smartphone,
  Palette,
  Award
} from "lucide-react";

export function LearningPathsShowcase() {
  const [activePathId, setActivePathId] = useState<string>("school-foundations-path");

  const activePath = LEARNING_PATHS_DATA.find((p) => p.id === activePathId) || LEARNING_PATHS_DATA[0];

  return (
    <section id="learning-paths" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Structured Roadmaps</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Next Step Starts Here
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Eliminate confusion with guided step-by-step pathways designed by expert educators and industry specialists.
          </p>
        </div>

        {/* Path Category Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-4xl mx-auto">
          {LEARNING_PATHS_DATA.map((path) => {
            const isActive = path.id === activePathId;
            return (
              <button
                key={path.id}
                onClick={() => setActivePathId(path.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/15"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100/80 border-slate-200/80"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  {path.category}
                </div>
                <div className="text-xs font-bold truncate mt-0.5">
                  {path.title.split('(')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Roadmap Visualizer Container */}
        <div className="bg-gradient-to-b from-[#fafaf9] to-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-10">
          
          {/* Path Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${activePath.color.badge}`}>
                  {activePath.category} Pathway
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activePath.estimatedTime}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {activePath.title}
              </h3>
              <p className="text-sm text-slate-600">
                {activePath.tagline}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/signup"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
              >
                <span>Enroll in This Path</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Connected Step Roadmap Visualization */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Step-by-Step Milestones
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {activePath.steps.map((step, idx) => (
                <div
                  key={step.stepNumber}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between hover:border-blue-300 transition-all group"
                >
                  <div className="space-y-2.5">
                    {/* Step Number & Duration */}
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-extrabold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        0{step.stepNumber}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                        {step.duration}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </h4>

                    {/* Skills Gained */}
                    <div className="space-y-1 pt-1">
                      {step.skillsGained.map((skill, sIdx) => (
                        <div key={sIdx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestone Capstone Output */}
                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700 block">Deliverable:</span>
                    <span className="text-slate-600">{step.deliverable}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Path Outcomes & Ideal Student Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-2xl bg-white border border-slate-200/80">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Key Pathway Outcomes & Credentials
              </div>
              <div className="space-y-2">
                {activePath.outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Recommended Learner Profile
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {activePath.recommendedFor}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-blue-700 font-bold">
                <span>Total Courses Included: {activePath.totalCourses}</span>
                <span>Capstone Labs: {activePath.totalProjects}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
