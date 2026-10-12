"use client";

import React from "react";
import Link from "next/link";
import { 
  Play, 
  Clock, 
  TrendingUp, 
  Award, 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  BarChart2, 
  ArrowRight,
  Flame,
  Star,
  Layers,
  GraduationCap
} from "lucide-react";

export function StudentDashboardPreview() {
  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Modern Student Experience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Focus, Momentum & Mastery
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Experience a clean, distraction-free student learning hub that tracks your growth, organizes your notes, and keeps you inspired every day.
          </p>
        </div>

        {/* Dashboard Visual Frame Container */}
        <div className="bg-[#fafaf9] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          
          {/* Top Bar of the Mock Dashboard */}
          <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-slate-200/80 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                AK
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">Welcome back, Akash Kumar! 👋</div>
                <div className="text-xs text-slate-500">Class 10 Scholar & Python Coding Track</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Daily Streak */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>14 Day Streak</span>
              </div>

              {/* XP */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-xs font-bold text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>4,850 XP</span>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Active In-Progress Courses */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Continue Learning Feature Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    Resume Active Course
                  </span>
                  <span className="text-xs text-slate-400">Last accessed 2 hours ago</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Mathematics Class 10: Quadratic Equations & Applications
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Module 04 · Lesson 02: Word Problems on Speed, Time & Work
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Course Progress</span>
                    <span className="text-blue-600">68% Completed (34/50 Lessons)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[68%] h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>24 Mins remaining in this session</span>
                  </div>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Continue Lecture</span>
                  </Link>
                </div>
              </div>

              {/* Secondary Course Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                      Practical Coding
                    </span>
                    <span className="text-xs font-bold text-slate-900">92% Done</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                    Python Programming: From Scratch to Projects
                  </h5>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-amber-500 rounded-full" />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Lab: CLI Task Manager</span>
                    <span className="text-blue-600 font-bold">Review</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">
                      Science Lab
                    </span>
                    <span className="text-xs font-bold text-slate-900">45% Done</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                    Physics Concept Engine: Mechanics & Optics
                  </h5>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[45%] h-full bg-purple-600 rounded-full" />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Lesson: Ray Optics Diagrams</span>
                    <span className="text-blue-600 font-bold">Start</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Upcoming Live Class & Performance Metrics */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Upcoming Live Cohort Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Next Live Class</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Today 5:30 PM
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800">
                  Speed Math & Olympiad Problem Solving
                </div>
                <div className="text-[11px] text-slate-500">
                  Mentor: Dr. Sunita Deshmukh · Zoom Integrated
                </div>

                <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors">
                  Join Classroom
                </button>
              </div>

              {/* Weekly Performance Badge */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-slate-900">Weekly Learning Summary</div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <div className="text-lg font-extrabold text-emerald-900">94.8%</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">Quiz Accuracy</div>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <div className="text-lg font-extrabold text-blue-900">12h 40m</div>
                    <div className="text-[10px] text-blue-700 font-semibold">Time Studied</div>
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
