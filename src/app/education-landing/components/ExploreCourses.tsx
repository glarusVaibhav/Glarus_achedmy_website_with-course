"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  COURSES_DATA, 
  COURSE_CATEGORIES, 
  CourseItem 
} from "../data/coursesData";
import { 
  Search, 
  Star, 
  Clock, 
  BookOpen, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  X,
  PlayCircle
} from "lucide-react";

export function ExploreCourses() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewCourse, setPreviewCourse] = useState<CourseItem | null>(null);

  // Filter logic
  const filteredCourses = useMemo(() => {
    return COURSES_DATA.filter((course) => {
      // Category filter
      let matchesCategory = true;
      if (selectedCategory === "School: Class 5-8") {
        matchesCategory = course.gradeGroup === "school-junior";
      } else if (selectedCategory === "School: Class 9-12") {
        matchesCategory = course.gradeGroup === "school-senior";
      } else if (selectedCategory === "Coding & Web Dev") {
        matchesCategory = course.category === "Computer Science" || course.category === "Web Development";
      } else if (selectedCategory === "AI & Data Science") {
        matchesCategory = course.category === "Artificial Intelligence" || course.category === "Data Science";
      } else if (selectedCategory === "Design & Creative") {
        matchesCategory = course.category === "Design";
      } else if (selectedCategory !== "All Categories") {
        matchesCategory = course.category === selectedCategory;
      }

      // Search filter
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="explore-courses" className="py-20 bg-slate-50/60 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Universal Course Catalog</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Find Something Worth Learning
            </h2>
            <p className="text-base text-slate-600">
              Browse world-class curricula spanning School Academics (Class 5–12), Practical Coding, AI Engineering, and Creative Skills.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search math, python, physics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 shrink-0 hidden sm:flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          {COURSE_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-slate-200/90"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Card Top Section */}
                <div className="p-6">
                  {/* Category & Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {course.category}
                    </span>
                    {course.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${course.badgeColor}`}>
                        {course.badge}
                      </span>
                    )}
                  </div>

                  {/* Course Title */}
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {course.title}
                  </h3>

                  {/* Subtitle / Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {course.subtitle}
                  </p>

                  {/* Metadata Chips: Level, Duration, Format */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-[11px] text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{course.level}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{course.duration.split('·')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{course.studentsCount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Topics Covered Preview Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {course.topics.slice(0, 3).map((topic, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60 px-2 py-0.5 rounded-md"
                      >
                        {topic}
                      </span>
                    ))}
                    {course.topics.length > 3 && (
                      <span className="text-[10px] font-medium text-slate-400 self-center">
                        +{course.topics.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Instructor Bio Bar */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{course.instructor.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{course.instructor.role}</div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Rating, Price & CTA */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">{course.rating}</span>
                    <span className="text-[10px] text-slate-400">({course.reviewsCount})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewCourse(course)}
                      className="text-xs font-bold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                    >
                      Curriculum
                    </button>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                    >
                      <span>Enroll</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No matching courses found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Try searching with another keyword or reset the category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All Categories");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* Course Detail Modal */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-extrabold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-md">
                    {previewCourse.category}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Grade / Level: {previewCourse.level}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">{previewCourse.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{previewCourse.subtitle}</p>
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full border border-slate-200 shadow-2xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Syllabus & Details */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Course Overview & Pedagogy
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {previewCourse.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Key Modules Covered in this Curriculum
                </h4>
                <div className="space-y-2">
                  {previewCourse.topics.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-semibold text-slate-800">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                        {idx + 1}
                      </div>
                      <span>{t}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor Bio */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-center gap-3.5">
                <img
                  src={previewCourse.instructor.avatar}
                  alt={previewCourse.instructor.name}
                  className="w-12 h-12 rounded-full object-cover border border-amber-300"
                />
                <div>
                  <div className="text-xs font-bold text-amber-900 uppercase">Taught by Expert Mentor</div>
                  <div className="text-sm font-extrabold text-slate-900">{previewCourse.instructor.name}</div>
                  <div className="text-xs text-slate-600">{previewCourse.instructor.role}</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Tuition Access Fee</div>
                <div className="text-lg font-extrabold text-slate-900">
                  {previewCourse.price}{" "}
                  {previewCourse.originalPrice && (
                    <span className="text-xs font-normal text-slate-400 line-through">
                      {previewCourse.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewCourse(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
                <Link
                  href="/signup"
                  onClick={() => setPreviewCourse(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2"
                >
                  <span>Start Learning Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
