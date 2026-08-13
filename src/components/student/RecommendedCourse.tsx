"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Clock,
  RotateCw,
  Video,
  BookOpen,
  ChevronRight,
  Star,
  Brain,
  ShoppingBag,
  Eye,
  Zap
} from "lucide-react";
import {
  getRecommendedCourseList,
  RecommendedCourseItem,
  StudentLearningState
} from "@/lib/recommendationEngine";
import { useCartStore } from "@/store/cartStore";
import { Course } from "@/components/CourseCard";

interface RecommendedCourseProps {
  enrolledCourses?: Array<{ id: string; title: string; progress?: number; status?: string }>;
  liveCourses?: Array<{ id: string; title: string; batchName?: string }>;
}

export function RecommendedCourse({
  enrolledCourses = [],
  liveCourses = []
}: RecommendedCourseProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [rotationOffset, setRotationOffset] = useState(0);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "LIVE" | "SELF_PACED">("ALL");

  // Get 4 distinct recommended courses based on student state and filter
  const recommendedCourses: RecommendedCourseItem[] = useMemo(() => {
    const studentState: StudentLearningState = {
      enrolledCourses,
      liveCourses
    };
    return getRecommendedCourseList(studentState, 4, rotationOffset, activeFilter);
  }, [enrolledCourses, liveCourses, rotationOffset, activeFilter]);

  const handleShuffle = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setRotationOffset((prev) => prev + 1);
  };

  const handleViewDetails = (e: React.MouseEvent, course: RecommendedCourseItem) => {
    e.preventDefault();
    e.stopPropagation();
    const targetUrl =
      course.id === "ai-1"
        ? "/course/Generative_AI_Application_Engineer"
        : course.curriculumLink || course.exploreLink || `/course/${course.id}`;
    router.push(targetUrl);
  };

  const handleBuyNow = (e: React.MouseEvent, course: RecommendedCourseItem) => {
    e.preventDefault();
    e.stopPropagation();
    const cartCourse: Course = {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: course.price || (course.type === "LIVE" ? 19999 : 15999),
      level: course.level,
      rating: 4.9,
      duration: course.duration,
      image: course.image || "/images/courses/generative-ai.png"
    };
    addItem(cartCourse);
    router.push("/checkout");
  };

  return (
    <section className="relative w-full my-10 font-sans text-slate-200">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SECTION HEADER                                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-white/[0.06]">
        <div>
          {/* Eyebrow Label with subtle glowing indicator */}
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-purple-400">
              CURATED LEARNING
            </span>
            <span className="text-white/20 text-xs">•</span>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              4 personalized pathways selected for you
            </span>
          </div>

          {/* Heading & Supporting Text */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recommended for You
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-normal mt-1 max-w-xl leading-relaxed">
            Take the next step with courses selected to match your engineering goals and interests.
          </p>
        </div>

        {/* Filter Pills, Shuffle & Explore Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter Tabs */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.08] p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === "ALL"
                  ? "bg-purple-600 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All (4)
            </button>
            <button
              onClick={() => setActiveFilter("LIVE")}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "LIVE"
                  ? "bg-purple-600 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Live Classes</span>
            </button>
            <button
              onClick={() => setActiveFilter("SELF_PACED")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === "SELF_PACED"
                  ? "bg-purple-600 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Self-Paced
            </button>
          </div>

          {/* Shuffle Button */}
          <button
            onClick={handleShuffle}
            title="Shuffle recommendations"
            className="text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 group cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          {/* Explore All */}
          <Link
            href="/courses"
            className="text-xs font-semibold text-slate-300 hover:text-purple-300 transition-colors flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 px-3.5 py-2 rounded-xl cursor-pointer"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. 4-COURSE RESPONSIVE GRID (IMAGE ON TOP + DETAILS BELOW)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {recommendedCourses.map((course, index) => {
            const isLive = course.type === "LIVE";
            const currentPrice = course.price || (isLive ? 19999 : 15999);
            const originalPrice = course.originalPrice || Math.round(currentPrice * 1.45);

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={(e) => handleViewDetails(e, course)}
                className="group relative rounded-3xl bg-[#0d121f] border border-white/[0.08] hover:border-purple-500/40 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-950/40 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 cursor-pointer select-none"
              >
                {/* Top Image Banner */}
                <div className="h-44 sm:h-48 w-full relative overflow-hidden flex items-center justify-center border-b border-white/[0.08] bg-[#070a14]">
                  {course.image ? (
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900 flex items-center justify-center p-6">
                      <Brain className="w-14 h-14 text-purple-400/30 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}

                  {/* Dark gradient overlay at bottom of image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-black/30 to-transparent pointer-events-none" />

                  {/* Top Level / Difficulty Badge */}
                  <div className="absolute top-3.5 left-3.5 z-10 flex gap-2">
                    <span className="px-3 py-1 bg-black/75 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/15 shadow-lg">
                      {course.level || "INTERMEDIATE"}
                    </span>
                  </div>

                  {/* Top Right Live / Self-Paced Badge */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/90 text-white shadow-md backdrop-blur-md border border-rose-400/40">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                        LIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-indigo-300 border border-white/10 backdrop-blur-md">
                        <Video className="w-2.5 h-2.5 text-indigo-400" />
                        VOD
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Details Body */}
                <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-[#0d121f] to-[#080b14]">
                  {/* Category & Rating */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black text-purple-400 uppercase tracking-widest">
                      {course.category || "AI ENGINEERING"}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-slate-200">4.9</span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-base sm:text-[17px] font-black text-white leading-snug mb-2 group-hover:text-purple-300 transition-colors line-clamp-2 min-h-[44px]">
                    {course.title}
                  </h3>

                  {/* What This Course Is (Description) */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[34px] mb-4">
                    {course.description}
                  </p>

                  {/* Duration / Format Info */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mt-auto mb-3.5">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      {course.duration} {isLive ? "Live" : "VOD"}
                    </span>
                    {isLive && course.scheduleInfo ? (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        {course.scheduleInfo.seatsLeft} Seats Left
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        {course.modulesCount} Modules
                      </span>
                    )}
                  </div>

                  {/* Price & Access Row */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between mb-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {isLive ? "Live Batch" : "Full Access"}
                    </span>

                    <div className="flex items-baseline gap-1.5 shrink-0">
                      {originalPrice && (
                        <span className="text-[11px] text-slate-500 line-through">
                          ₹{originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-sm font-black text-emerald-400">
                        ₹{currentPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: View Details & Buy Now */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleViewDetails(e, course)}
                      className="py-2.5 px-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.1] hover:border-purple-500/40 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.97]"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      <span>View Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleBuyNow(e, course)}
                      className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.97]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

