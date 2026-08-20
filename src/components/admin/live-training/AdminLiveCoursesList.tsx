"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Radio,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Video,
  Eye,
  Edit3,
  Layers,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  MoreVertical,
  UserCheck,
  Archive,
  RefreshCw,
  Trash2,
  ExternalLink,
  BookOpen
} from "lucide-react";

export interface LiveCourseCardItem {
  id: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  description: string;
  thumbnailGradient?: string;
  category: string;
  level: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  timezone: string;
  totalSessions: number;
  maxStudents: number;
  enrolledCount: number;
  status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  leadInstructor?: { id: string; name: string; email: string } | null;
  meetingPlatform: string;
  meetingUrl?: string;
  nextSession?: {
    id: string;
    sessionNumber: number;
    title: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    status: string;
  } | null;
  isLiveNow?: boolean;
  createdAt: string;
}

export interface LiveTrainingStats {
  totalLiveCourses: number;
  draftCourses: number;
  publishedCourses: number;
  activeCourses: number;
  totalSessions: number;
  completedSessions: number;
  liveNowSessions: number;
  upcomingSessions: number;
  totalInstructors: number;
}

export default function AdminLiveCoursesList() {
  const [courses, setCourses] = useState<LiveCourseCardItem[]>([]);
  const [stats, setStats] = useState<LiveTrainingStats>({
    totalLiveCourses: 0,
    draftCourses: 0,
    publishedCourses: 0,
    activeCourses: 0,
    totalSessions: 0,
    completedSessions: 0,
    liveNowSessions: 0,
    upcomingSessions: 0,
    totalInstructors: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Load live courses and statistics
  const fetchLiveCourses = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, statsRes] = await Promise.all([
        fetch("/api/admin/live-training/courses"),
        fetch("/api/admin/live-training/stats")
      ]);

      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData.courses || []);
      }
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats || {});
      }
    } catch (err) {
      console.error("Failed to load live courses", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCourses();
  }, []);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesTab =
        activeTab === "ALL" ||
        (activeTab === "DRAFT" && c.status === "DRAFT") ||
        (activeTab === "PUBLISHED" && c.status === "PUBLISHED") ||
        (activeTab === "ACTIVE" && (c.status === "ACTIVE" || c.status === "PUBLISHED")) ||
        (activeTab === "COMPLETED" && c.status === "COMPLETED") ||
        (activeTab === "ARCHIVED" && c.status === "ARCHIVED");

      const matchesCat = selectedCategory === "ALL" || c.category === selectedCategory;

      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.leadInstructor?.name && c.leadInstructor.name.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q));

      return matchesTab && matchesCat && matchesSearch;
    });
  }, [courses, activeTab, selectedCategory, searchTerm]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [courses]);

  // Archive course handler
  const handleArchiveCourse = async (courseId: string) => {
    try {
      const res = await fetch(`/api/admin/live-training/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" })
      });
      if (res.ok) {
        fetchLiveCourses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Training Portal
            </span>
            <span className="text-xs text-subtext">•</span>
            <span className="text-xs text-subtext">{courses.length} Cohort Tracks</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight mt-1">
            Live Courses & Cohort Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/live-training/calendar"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>Master Calendar</span>
          </Link>
          <Link
            href="/admin/live-training/instructor-assignments"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Instructor Assignments</span>
          </Link>
          <Link
            href="/admin/live-training/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Live Course</span>
          </Link>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-subtext">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Live Courses</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-text">{stats.totalLiveCourses}</p>
          <p className="text-[10px] text-subtext/70">{stats.publishedCourses} Published, {stats.draftCourses} Drafts</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-subtext">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Sessions</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-300">{stats.upcomingSessions}</p>
          <p className="text-[10px] text-sky-400/80 font-semibold">Scheduled live workshops</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-subtext">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Now</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{stats.liveNowSessions}</p>
          <p className="text-[10px] text-emerald-400/80 font-semibold">In session right now</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-subtext">
            <span className="text-[11px] font-bold uppercase tracking-wider">Draft Courses</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">{stats.draftCourses}</p>
          <p className="text-[10px] text-amber-400/80 font-semibold">Curriculums in progress</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-subtext">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-text">{stats.completedSessions}</p>
          <p className="text-[10px] text-subtext/70">Replays & recordings archived</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-background/60 border border-white/5">
            {[
              { id: "ALL", label: "All Courses" },
              { id: "PUBLISHED", label: "Published" },
              { id: "ACTIVE", label: "Active Cohorts" },
              { id: "DRAFT", label: "Drafts" },
              { id: "COMPLETED", label: "Completed" },
              { id: "ARCHIVED", label: "Archived" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-600/25 text-purple-300 border border-purple-500/30 shadow-sm"
                    : "text-subtext hover:text-text hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-subtext" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search course or instructor..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 rounded-xl bg-background border border-white/10 text-subtext hover:text-text text-xs focus:outline-none focus:border-purple-500/50"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid / List */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-card border border-white/10 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
          <p className="text-xs text-subtext font-semibold">Loading live courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-16 rounded-2xl bg-card border border-dashed border-white/15 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">No live courses found</h3>
            <p className="text-xs text-subtext mt-1">
              Try modifying your search filter or create a new live course cohort.
            </p>
          </div>
          <Link
            href="/admin/live-training/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Live Course</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const isDraft = course.status === "DRAFT";
            const isPublished = course.status === "PUBLISHED" || course.status === "ACTIVE";

            return (
              <div
                key={course.id}
                className="group relative rounded-2xl bg-card border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-950/20"
              >
                {/* Banner Gradient */}
                <div
                  className={`h-28 w-full bg-gradient-to-br ${
                    course.thumbnailGradient || "from-purple-900 via-indigo-950 to-slate-950"
                  } p-4 flex flex-col justify-between relative border-b border-white/10`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/15">
                      {course.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isDraft
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-purple-300" />
                      {course.duration || `${course.totalSessions} Sessions`}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-text group-hover:text-purple-300 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-subtext line-clamp-2 mt-1">
                      {course.shortDescription || course.description}
                    </p>
                  </div>

                  {/* Cohort Metrics */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-background/50 border border-white/5 text-[11px]">
                    <div>
                      <p className="text-subtext/70 text-[10px] font-bold uppercase">Lead Instructor</p>
                      <p className="font-bold text-text truncate mt-0.5">
                        {course.leadInstructor?.name || "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-subtext/70 text-[10px] font-bold uppercase">Enrolled Capacity</p>
                      <p className="font-bold text-text mt-0.5">
                        {course.enrolledCount} / {course.maxStudents}
                      </p>
                    </div>
                  </div>

                  {/* Next Session Preview */}
                  {course.nextSession ? (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-purple-300 uppercase tracking-wide">
                          Next: Session {course.nextSession.sessionNumber}
                        </span>
                        <span className="text-subtext">
                          {course.nextSession.date ? new Date(course.nextSession.date).toLocaleDateString([], { month: "short", day: "numeric" }) : "TBA"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-text truncate">{course.nextSession.title}</p>
                      <p className="text-[10px] text-subtext">{course.nextSession.startTime} – {course.nextSession.endTime}</p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-background/40 border border-white/5 text-center">
                      <p className="text-[11px] text-subtext font-semibold">All sessions completed or draft</p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-3 border-t border-white/10 bg-background/30 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/live-training/courses/${course.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold text-center transition-all"
                  >
                    Manage Course & Sessions
                  </Link>

                  <Link
                    href={`/admin/live-training/courses/${course.id}`}
                    className="p-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text transition-colors"
                    title="View Course"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleArchiveCourse(course.id)}
                    className="p-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-red-400 transition-colors"
                    title="Archive Course"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
