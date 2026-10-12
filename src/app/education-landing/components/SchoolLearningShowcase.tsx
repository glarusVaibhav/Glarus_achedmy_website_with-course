"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SCHOOL_CLASSES_DATA, SchoolClassItem } from "../data/schoolClassesData";
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  Award, 
  Calculator, 
  Atom, 
  Sigma, 
  Compass, 
  Code2, 
  Star,
  Users
} from "lucide-react";

export function SchoolLearningShowcase() {
  const [selectedClass, setSelectedClass] = useState<number>(5);

  const currentClassData = SCHOOL_CLASSES_DATA.find((c) => c.classNumber === selectedClass) || SCHOOL_CLASSES_DATA[0];

  return (
    <section id="school-showcase" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
            <span>K-12 School Academics Hub</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Make Learning Exciting from Class 5 to 12
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Build strong foundations with engaging illustrated lessons, interactive practice worksheets, and personalized mentorship designed to nurture curious young minds.
          </p>
        </div>

        {/* Grade Level Selector Buttons (Class 5 to Class 12) */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-10 max-w-4xl mx-auto">
          {SCHOOL_CLASSES_DATA.map((cls) => {
            const isSelected = cls.classNumber === selectedClass;
            return (
              <button
                key={cls.classNumber}
                onClick={() => setSelectedClass(cls.classNumber)}
                className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20 scale-105"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100/90 border-slate-200/80"
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">Grade</span>
                <span className="text-lg font-extrabold">{cls.classNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Class Dynamic Spotlight Container */}
        <div className="bg-gradient-to-b from-[#fafaf9] to-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Class Info, Tagline & Subjects */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Header Badge & Age Group */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${currentClassData.colorTheme.badgeBg} ${currentClassData.colorTheme.badgeText}`}>
                  {currentClassData.label} · {currentClassData.highlightBadge}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {currentClassData.ageGroup}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  CBSE / ICSE / State Board Aligned
                </span>
              </div>

              {/* Tagline & Description */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentClassData.tagline}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-2">
                  {currentClassData.description}
                </p>
              </div>

              {/* 4 Core Subjects Pill Grid */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Available Subjects in {currentClassData.label} Curriculum
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentClassData.subjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3 hover:border-blue-300 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{sub.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {sub.chaptersCount} Chapters · {sub.popularTopic}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Milestones Checklist */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Key Academic Outcomes
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentClassData.keyMilestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Group */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
                >
                  <span>Enroll in {currentClassData.label} Program</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="#explore-courses"
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/90 transition-all"
                >
                  Browse {currentClassData.label} Books & Labs
                </Link>
              </div>

            </div>

            {/* Right: Parent & Student Trust Metrics Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {currentClassData.label} Learning Metrics
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Glarus Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-center">
                    <div className="text-2xl font-extrabold text-amber-900">{currentClassData.totalPracticeQuestions}</div>
                    <div className="text-xs text-amber-700 font-semibold mt-0.5">Practice Questions</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-center">
                    <div className="text-2xl font-extrabold text-emerald-900">{currentClassData.interactiveQuizzes}+</div>
                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">Interactive Quizzes</div>
                  </div>
                </div>

                {/* Parent Review Testimonial */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">Verified Parent</span>
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    &ldquo;My child in {currentClassData.label} finally understands math without crying over homework. The visual diagrams and practice quizzes made all the difference.&rdquo;
                  </p>
                  <div className="text-[11px] font-bold text-slate-800">
                    — Meenakshi R. (Parent of {currentClassData.label} Student)
                  </div>
                </div>

                {/* Study Routine Promise */}
                <div className="flex items-center gap-3 p-3 bg-blue-50/60 rounded-2xl border border-blue-200/60 text-xs text-blue-900">
                  <Award className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>30 Mins Daily Routine: Master concepts with zero stress</span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
