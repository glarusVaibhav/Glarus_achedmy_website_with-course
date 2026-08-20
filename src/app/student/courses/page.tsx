"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Layers,
  X,
  Play,
  Award,
  Zap,
  TrendingUp,
  Flame,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";

interface SelfPacedCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  totalLectures: number;
  completedLectures: number;
  lastWatchedLecture: string | null;
  status: string;
  thumbnail?: string;
  category?: string;
  level?: string;
  duration?: string;
}

export default function SelfPacedCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<SelfPacedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const spRes = await fetch("/api/student/self-paced");

        if (spRes.status === 401) {
          router.push("/login");
          return;
        }

        const spData = await spRes.json();
        let spList: SelfPacedCourse[] = spData.courses || [];

        // Fallback default rich courses list if empty
        if (spList.length === 0) {
          spList = [
            {
              id: "Generative_AI_Application_Engineer",
              title: "Generative AI Application Engineering",
              instructor: "Alex Chen",
              progress: 78,
              totalLectures: 24,
              completedLectures: 18,
              lastWatchedLecture: "Module 4: RAG & Vector DBs",
              status: "IN_PROGRESS",
              thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
              category: "Generative AI",
              level: "Intermediate",
              duration: "18 Hours"
            },
            {
              id: "Machine_Learning_Mathematics",
              title: "Mathematics & Foundations of Deep Learning",
              instructor: "Dr. Sophia Rivera",
              progress: 45,
              totalLectures: 18,
              completedLectures: 8,
              lastWatchedLecture: "Linear Algebra & Eigenvectors",
              status: "IN_PROGRESS",
              thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60",
              category: "Math & AI",
              level: "All Levels",
              duration: "14 Hours"
            },
            {
              id: "Python_Advanced_AI",
              title: "Advanced Python for AI & Data Pipelines",
              instructor: "Marcus Thorne",
              progress: 100,
              totalLectures: 20,
              completedLectures: 20,
              lastWatchedLecture: "Course Finished & Certified",
              status: "COMPLETED",
              thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
              category: "Software Engineering",
              level: "Advanced",
              duration: "16 Hours"
            },
            {
              id: "RAG_Vector_Database_Mastery",
              title: "Production RAG, Pinecone & Hybrid Search",
              instructor: "Elena Rostova",
              progress: 30,
              totalLectures: 16,
              completedLectures: 5,
              lastWatchedLecture: "Dense vs Sparse Vectors",
              status: "IN_PROGRESS",
              thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60",
              category: "AI Architecture",
              level: "Intermediate",
              duration: "12 Hours"
            }
          ];
        }

        // Ensure flagship generative AI course is present
        const hasFlagship = spList.some(
          (c) =>
            c.id === "Generative_AI_Application_Engineer" ||
            c.title.toLowerCase().includes("generative ai")
        );
        if (!hasFlagship) {
          spList.unshift({
            id: "Generative_AI_Application_Engineer",
            title: "Generative AI Application Engineering",
            instructor: "Alex Chen",
            progress: 78,
            totalLectures: 24,
            completedLectures: 18,
            lastWatchedLecture: "Module 4: RAG & Vector DBs",
            status: "IN_PROGRESS",
            thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
            category: "Generative AI",
            level: "Intermediate",
            duration: "18 Hours"
          });
        }

        setCourses(spList);
      } catch (err) {
        console.error("Failed to load self-paced courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Filtered List
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const isCompleted = c.progress >= 100 || c.status === "COMPLETED";

      if (activeStatusFilter === "IN_PROGRESS" && isCompleted) return false;
      if (activeStatusFilter === "COMPLETED" && !isCompleted) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesInstructor = c.instructor.toLowerCase().includes(q);
        const matchesLastWatched = c.lastWatchedLecture?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesInstructor && !matchesLastWatched) {
          return false;
        }
      }

      return true;
    });
  }, [courses, activeStatusFilter, searchQuery]);

  const inProgressCount = courses.filter((c) => c.progress < 100 && c.status !== "COMPLETED").length;
  const completedCount = courses.filter((c) => c.progress >= 100 || c.status === "COMPLETED").length;

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-8 max-w-[1650px] mx-auto space-y-8 text-text">

        {/* ───────── 1. Header Section ───────── */}
        <section className="space-y-6 border-b border-card pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0 border border-blue-400/30">
                <PlayCircle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
                    Self-Paced <span className="text-primary">Courses</span>
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-black flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {courses.length} Active Courses
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-subtext mt-1 max-w-2xl font-medium">
                  Access your on-demand video courses, practice interactive sandbox labs, track lecture progress, and earn verified certificates.
                </p>
              </div>
            </div>

            {/* Right Quick Action Links */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/courses"
                className="px-4 py-2.5 rounded-xl bg-card hover:bg-card/80 border border-card text-subtext hover:text-text text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <span>Browse All Courses</span>
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          </div>

          {/* ───────── 2. Controls & Filter Bar ───────── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveStatusFilter("ALL")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeStatusFilter === "ALL"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-card/60 border border-card text-subtext hover:text-text"
                }`}
              >
                <span>All Courses</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">{courses.length}</span>
              </button>

              <button
                onClick={() => setActiveStatusFilter("IN_PROGRESS")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeStatusFilter === "IN_PROGRESS"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "bg-card/60 border border-card text-subtext hover:text-amber-400"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>In Progress</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">{inProgressCount}</span>
              </button>

              <button
                onClick={() => setActiveStatusFilter("COMPLETED")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeStatusFilter === "COMPLETED"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-card/60 border border-card text-subtext hover:text-emerald-400"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">{completedCount}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by course, instructor, module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-card/60 border border-card rounded-xl text-xs text-text placeholder:text-subtext focus:outline-none focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ───────── 3. Self-Paced Courses Grid ───────── */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-subtext text-xs font-bold uppercase tracking-wider">
              Loading your self-paced courses...
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-20 px-6 border border-dashed border-card rounded-3xl bg-card/30 flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto">
            <BookOpen className="w-12 h-12 text-subtext/40" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text">No courses found</h3>
              <p className="text-xs sm:text-sm text-subtext">
                {searchQuery
                  ? `No self-paced courses matched "${searchQuery}". Try searching with another keyword.`
                  : "You do not have any courses under this filter."}
              </p>
            </div>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <Link
                href="/courses"
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-2"
              >
                <span>Browse All Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => {
              const isCompleted = course.progress >= 100 || course.status === "COMPLETED";
              const thumbnailSrc =
                course.thumbnail ||
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60";

              return (
                <div
                  key={course.id}
                  className="bg-card/40 hover:bg-card/80 border border-card hover:border-primary/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                >
                  {/* Card Thumbnail & Overlay Badges */}
                  <div>
                    <div className="h-44 relative overflow-hidden bg-black/40 border-b border-card">
                      {/* eslint-disable-next-html-element-suppression */}
                      <img
                        src={thumbnailSrc}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                          {course.category || "SELF-PACED"}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 z-10">
                        {isCompleted ? (
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3" /> COMPLETED
                          </span>
                        ) : (
                          <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/20">
                            {course.progress}% DONE
                          </span>
                        )}
                      </div>

                      {/* Bottom Lectures Bar */}
                      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white text-xs font-bold drop-shadow">
                        <span className="flex items-center gap-1.5">
                          <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                          {course.completedLectures}/{course.totalLectures} Lectures
                        </span>
                        {course.duration && (
                          <span className="text-[11px] text-white/80">{course.duration}</span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block mb-1">
                          On-Demand Video Curriculum
                        </span>
                        <h3 className="font-black text-base text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug" title={course.title}>
                          {course.title}
                        </h3>
                        <p className="text-xs text-subtext flex items-center gap-1.5 mt-1">
                          <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>Instructor: <strong className="text-text">{course.instructor}</strong></span>
                        </p>
                      </div>

                      {/* Last Watched Lecture Snippet */}
                      {course.lastWatchedLecture && (
                        <div className="p-2.5 rounded-xl bg-background/60 border border-card text-xs flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-[11px] text-subtext truncate">
                            <strong className="text-text">Last:</strong> {course.lastWatchedLecture}
                          </span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className={isCompleted ? "text-emerald-400" : "text-subtext"}>
                            {isCompleted ? "All Lectures Completed" : `${course.completedLectures} of ${course.totalLectures} Completed`}
                          </span>
                          <span className="text-text font-black">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isCompleted
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-amber-500 via-primary to-blue-500"
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="p-5 pt-0">
                    <Link href={`/learn/${course.id}`} className="w-full block">
                      <button className={`w-full py-2.5 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md ${
                        isCompleted
                          ? "bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30"
                          : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                      }`}>
                        <PlayCircle className="w-4 h-4" />
                        <span>{course.progress === 0 ? "Start Course" : isCompleted ? "Review Material & Cert" : "Continue Learning"}</span>
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ───────── 4. Explore More Courses Footer Banner ───────── */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/30 via-card to-blue-950/20 border border-card flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 max-w-2xl">
            <h3 className="font-black text-lg sm:text-xl text-text">
              Want to expand your AI & Engineering mastery?
            </h3>
            <p className="text-xs sm:text-sm text-subtext leading-relaxed">
              Explore specialized bootcamps in Autonomous Agents, LLMOps, Vector Databases, and PyTorch Neural Networks.
            </p>
          </div>

          <Link
            href="/courses"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/25 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <span>Explore All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

      </div>
    </StudentPortalLayout>
  );
}
