"use client";

import React from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  BookOpen, 
  Code2, 
  Sparkles, 
  Radio, 
  Compass, 
  Heart,
  Mail,
  ShieldCheck
} from "lucide-react";

export function EducationFooter() {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-100">
          
          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/education-landing" className="flex items-center gap-3 select-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                  Glarus<span className="text-blue-600">Academy</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
                  Universal Education Platform
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Empowering learners of every age — from foundational school academics (Class 5–12) to high-growth coding, AI engineering, and digital career skills.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified Pedagogical Excellence</span>
            </div>
          </div>

          {/* Col 2: School Learning (Class 5 to 12) */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              School Academics
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link href="#school-showcase" className="hover:text-blue-600 transition-colors">Class 5 & 6 Foundations</Link></li>
              <li><Link href="#school-showcase" className="hover:text-blue-600 transition-colors">Class 7 & 8 Middle School</Link></li>
              <li><Link href="#school-showcase" className="hover:text-blue-600 transition-colors">Class 9 & 10 Board Mastery</Link></li>
              <li><Link href="#school-showcase" className="hover:text-blue-600 transition-colors">Class 11 & 12 Pre-University</Link></li>
              <li><Link href="#school-showcase" className="hover:text-blue-600 transition-colors">Math & Science Olympiad Prep</Link></li>
            </ul>
          </div>

          {/* Col 3: Skills & Technology */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Skills & Technology
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link href="#explore-courses" className="hover:text-blue-600 transition-colors">Young Coders: Scratch & Python</Link></li>
              <li><Link href="#explore-courses" className="hover:text-blue-600 transition-colors">Fullstack Web Development</Link></li>
              <li><Link href="#explore-courses" className="hover:text-blue-600 transition-colors">UI/UX Design Systems</Link></li>
              <li><Link href="#explore-courses" className="hover:text-blue-600 transition-colors">Generative AI & Agent Architectures</Link></li>
              <li><Link href="#explore-courses" className="hover:text-blue-600 transition-colors">Data Science & Analytics</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform & Support */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Platform & Company
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link href="#live-classes" className="hover:text-blue-600 transition-colors">Live Interactive Schedule</Link></li>
              <li><Link href="#learning-paths" className="hover:text-blue-600 transition-colors">Structured Learning Paths</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Student Dashboard</Link></li>
              <li><Link href="/instructor" className="hover:text-blue-600 transition-colors">Become an Instructor</Link></li>
              <li><Link href="/login" className="hover:text-blue-600 transition-colors">Account Login</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} GlarusAcademy Platform. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-600 transition-colors">Cookie Preferences</Link>
            <Link href="#" className="hover:text-slate-600 transition-colors">Security</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
