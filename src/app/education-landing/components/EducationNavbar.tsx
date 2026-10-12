"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Search, 
  ChevronDown, 
  BookOpen, 
  Code2, 
  Sparkles, 
  Radio, 
  Compass, 
  Menu, 
  X, 
  ArrowRight,
  User,
  Calculator,
  Atom,
  Briefcase
} from "lucide-react";

export function EducationNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3"
            : "bg-[#fafaf9] border-b border-slate-200/60 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/education-landing" className="flex items-center gap-3 group select-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                  Glarus<span className="text-blue-600">Academy</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
                  Universal Learning Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Explore Courses Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setCoursesDropdownOpen(true)}
                onMouseLeave={() => setCoursesDropdownOpen(false)}
              >
                <button 
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/70 rounded-lg transition-colors"
                  onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Explore Courses</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${coursesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {coursesDropdownOpen && (
                  <div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                      Popular Categories
                    </div>
                    <div className="space-y-1">
                      <Link 
                        href="#explore-courses" 
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                        onClick={() => setCoursesDropdownOpen(false)}
                      >
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                          <Calculator className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">School Mathematics</div>
                          <div className="text-xs text-slate-500">Class 5 to 12 Foundations & Boards</div>
                        </div>
                      </Link>

                      <Link 
                        href="#explore-courses" 
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                        onClick={() => setCoursesDropdownOpen(false)}
                      >
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                          <Atom className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">General & Senior Science</div>
                          <div className="text-xs text-slate-500">Physics, Chemistry, Biology Concepts</div>
                        </div>
                      </Link>

                      <Link 
                        href="#explore-courses" 
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                        onClick={() => setCoursesDropdownOpen(false)}
                      >
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Code2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">Coding & Web Development</div>
                          <div className="text-xs text-slate-500">Scratch, Python, React & Node.js</div>
                        </div>
                      </Link>

                      <Link 
                        href="#explore-courses" 
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                        onClick={() => setCoursesDropdownOpen(false)}
                      >
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">AI & Data Science</div>
                          <div className="text-xs text-slate-500">Machine Learning, LLMs & Agents</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* School Learning (Class 5–12) Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setSchoolDropdownOpen(true)}
                onMouseLeave={() => setSchoolDropdownOpen(false)}
              >
                <button 
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/70 rounded-lg transition-colors"
                  onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
                >
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  <span>School Learning</span>
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                    Class 5-12
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${schoolDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {schoolDropdownOpen && (
                  <div className="absolute top-full left-0 w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Class Grade</span>
                      <span className="text-[11px] text-blue-600 font-semibold">CBSE & ICSE Aligned</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Junior (5–8)</div>
                        {[5, 6, 7, 8].map((cls) => (
                          <Link
                            key={cls}
                            href="#school-showcase"
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                            onClick={() => setSchoolDropdownOpen(false)}
                          >
                            <span>Class {cls}</span>
                            <span className="text-[10px] text-slate-400">Math · Sci · Eng</span>
                          </Link>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Senior (9–12)</div>
                        {[9, 10, 11, 12].map((cls) => (
                          <Link
                            key={cls}
                            href="#school-showcase"
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                            onClick={() => setSchoolDropdownOpen(false)}
                          >
                            <span>Class {cls}</span>
                            <span className="text-[10px] text-slate-400">{cls === 10 ? 'Boards' : cls === 12 ? 'Pre-Univ' : 'STEM'}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Classes */}
              <Link 
                href="#live-classes" 
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Live Classes</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </Link>

              {/* Learning Paths */}
              <Link 
                href="#learning-paths" 
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>Learning Paths</span>
              </Link>

              {/* For Professionals */}
              <Link 
                href="#learning-stages" 
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                <Briefcase className="w-4 h-4 text-slate-500" />
                <span>For Career</span>
              </Link>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 rounded-xl transition-all"
              title="Search courses, school subjects, or career paths (Press /)"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline text-xs font-medium text-slate-600">Search anything...</span>
              <kbd className="hidden md:inline-block text-[10px] font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 shadow-2xs">
                /
              </kbd>
            </button>

            {/* Login Link */}
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Log in</span>
            </Link>

            {/* Primary Get Started CTA */}
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md shadow-blue-600/25 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="space-y-1">
              <Link
                href="#explore-courses"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-50"
              >
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Explore All Courses</span>
              </Link>
              <Link
                href="#school-showcase"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-amber-500" />
                  <span>School Learning (Class 5–12)</span>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">8 Grades</span>
              </Link>
              <Link
                href="#live-classes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Radio className="w-5 h-5 text-rose-500" />
                <span>Live Interactive Classes</span>
              </Link>
              <Link
                href="#learning-paths"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Compass className="w-5 h-5 text-indigo-500" />
                <span>Learning Paths</span>
              </Link>
              <Link
                href="#learning-stages"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Briefcase className="w-5 h-5 text-slate-600" />
                <span>For Career & Professionals</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 font-bold text-slate-700 bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-600/20"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search Class 5–12 math, python coding, science, generative AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-900 text-sm placeholder-slate-400 font-medium"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-mono bg-slate-100 px-2"
              >
                ESC
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Recommendations
              </div>
              <Link
                href="#explore-courses"
                onClick={() => setSearchModalOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Mathematics Mastery — Class 5 & 6</div>
                    <div className="text-xs text-slate-400">Foundation numbers, fractions & mental math</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600">View Class</span>
              </Link>

              <Link
                href="#explore-courses"
                onClick={() => setSearchModalOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Python Programming: From Scratch to Projects</div>
                    <div className="text-xs text-slate-400">For students, beginners & automation</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600">View Course</span>
              </Link>

              <Link
                href="#school-showcase"
                onClick={() => setSearchModalOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Class 10 Board Exam Mastery Hub</div>
                    <div className="text-xs text-slate-400">Math, Physics, Chemistry & 10-Yr PYQs</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600">Explore Hub</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
